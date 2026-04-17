import { useState, useEffect, useCallback, useRef } from "react";
import { supabase, isSupabaseConfigured } from "../supabaseClient";

// Transforms a Supabase post row + its comments array into the
// shape PostItFeed already expects so the component needs zero changes.
function shapePosts(rows, commentsMap, votesMap) {
  return rows.map(r => ({
    id:       r.id,
    author:   r.author,
    title:    r.title,
    body:     r.body || "",
    flair:    r.flair || "General",
    created_at: r.created_at,
    votes:    votesMap[r.id] ?? r.votes,
    comments: (commentsMap[r.id] || []).map(c => ({
      id:     c.id,
      author: c.author,
      text:   c.text,
      time:   formatAge(c.created_at),
    })),
    time: formatAge(r.created_at),
  }));
}

function formatAge(iso) {
  if (!iso) return "just now";
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (diff < 60)   return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function usePostIt(user) {
  const [posts,    setPosts]   = useState([]);
  const [loading,  setLoading] = useState(true);
  const [error,    setError]   = useState(null);
  /** Current user's vote per post: 1 = up, -1 = down (omitted = none). Kept in ref for correct rapid-click handling. */
  const [myVotes,  setMyVotes] = useState({});
  const myVotesRef = useRef({});

  // Local cache of vote state so optimistic UI works
  const votesRef = useRef({});  // { postId: currentVoteTotal }

  // Track pending vote operations to prevent double-counting
  // between optimistic updates and realtime subscription events
  const pendingVoteIds = useRef({});  // { postId: pendingCount }

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!isSupabaseConfigured) {
      setPosts([]);
      setMyVotes({});
      myVotesRef.current = {};
      setError(
        "Post-It needs Supabase (set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)."
      );
      setLoading(false);
      return;
    }

    // Fetch posts
    const { data: postRows, error: pErr } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (pErr) { setError(pErr.message); setLoading(false); return; }

    // Fetch comments for those posts
    const postIds = postRows.map(p => p.id);
    const { data: commentRows } = await supabase
      .from("comments")
      .select("*")
      .in("post_id", postIds)
      .order("created_at", { ascending: true });

    // Fetch vote totals (per-post sum from post_votes)
    const { data: voteRows } = await supabase
      .from("post_votes")
      .select("post_id, dir")
      .in("post_id", postIds);

    // Build maps
    const commentsMap = {};
    (commentRows || []).forEach(c => {
      if (!c.post_id) return; // guard: skip rows with missing post_id
      if (!commentsMap[c.post_id]) commentsMap[c.post_id] = [];
      commentsMap[c.post_id].push(c);
    });

    // Use summed post_votes when any votes exist for a post.
    // Only fall back to the seed (posts.votes) when zero rows were found in post_votes.
    const votesMap = {};
    const postsWithVoteRows = new Set();
    (voteRows || []).forEach(v => {
      postsWithVoteRows.add(v.post_id);
      votesMap[v.post_id] = (votesMap[v.post_id] || 0) + v.dir;
    });
    postRows.forEach(p => {
      if (!postsWithVoteRows.has(p.id) && (p.votes || 0) !== 0) {
        votesMap[p.id] = p.votes;
      }
    });
    votesRef.current = votesMap;

    let myVoteMap = {};
    if (user?.id) {
      const { data: mine } = await supabase
        .from("post_votes")
        .select("post_id, dir")
        .eq("user_id", user.id);
      (mine || []).forEach((v) => {
        myVoteMap[v.post_id] = v.dir;
      });
    }
    myVotesRef.current = myVoteMap;
    setMyVotes(myVoteMap);

    setPosts(shapePosts(postRows, commentsMap, votesMap));
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const channel = supabase
      .channel("postit_realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "posts" },
        payload => {
          if (!payload.new?.id) return;
          const newPost = shapePosts([payload.new], {}, { [payload.new.id]: payload.new.votes ?? 0 })[0];
          if (newPost) setPosts(prev => [newPost, ...prev]);
        })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "posts" },
        payload => {
          if (!payload.old?.id) return;
          setPosts(prev => prev.filter(p => p.id !== payload.old.id));
        })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "comments" },
        payload => {
          const c = payload.new;
          if (!c?.id || !c?.post_id) return;
          const shaped = { id: c.id, author: c.author || "Anon", text: c.text || "", time: "just now" };
          setPosts(prev => prev.map(p =>
            p.id === c.post_id
              ? { ...p, comments: [...(p.comments || []), shaped] }
              : p
          ));
        })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "post_votes" },
        payload => {
          if (!payload.new?.post_id) return;
          const { post_id, dir } = payload.new;
          if ((pendingVoteIds.current[post_id] ?? 0) > 0) {
            pendingVoteIds.current[post_id] = Math.max(0, pendingVoteIds.current[post_id] - 1);
            return;
          }
          setPosts(prev => prev.map(p =>
            p.id === post_id ? { ...p, votes: (p.votes || 0) + (dir || 0) } : p
          ));
        })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "post_votes" },
        payload => {
          if (!payload.new?.post_id || payload.new.dir == null || payload.old?.dir == null) return;
          const diff = payload.new.dir - payload.old.dir;
          if ((pendingVoteIds.current[payload.new.post_id] ?? 0) > 0) {
            pendingVoteIds.current[payload.new.post_id] = Math.max(0, pendingVoteIds.current[payload.new.post_id] - 1);
            return;
          }
          setPosts(prev => prev.map(p =>
            p.id === payload.new.post_id ? { ...p, votes: (p.votes || 0) + diff } : p
          ));
        })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const addPost = useCallback(async ({ title, body, flair }) => {
    if (!isSupabaseConfigured || !user?.id) return;
    const author = user.name
      ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
      : "??";

    const { error } = await supabase.from("posts").insert({
      user_id: user.id,
      author,
      title: title.trim(),
      body:  body.trim(),
      flair,
      votes: 1,
    });
    if (error) console.error("addPost:", error.message);
    // Realtime INSERT event will update state
  }, [user]);

  const addComment = useCallback(async (postId, text) => {
    if (!isSupabaseConfigured || !user?.id || !text.trim()) return;
    const author = user.name
      ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
      : "??";

    const { error } = await supabase.from("comments").insert({
      post_id: postId,
      user_id: user.id,
      author,
      text: text.trim(),
    });
    if (error) console.error("addComment:", error.message);
    // Realtime INSERT event will update state
  }, [user]);

  // Upserts into post_votes. Realtime handles the UI update.
  // We do an optimistic update here as well so it feels instant.
  const vote = useCallback(async (postId, dir) => {
    if (!isSupabaseConfigured || !user?.id) return;

    const prev = myVotesRef.current[postId] ?? 0;
    // One vote per direction per user (like Reddit): same click again does nothing
    if (prev === dir) return;

    const delta = dir - prev;

    // Mark as pending so realtime handler skips the echo
    pendingVoteIds.current[postId] = (pendingVoteIds.current[postId] || 0) + 1;

    const nextMy = { ...myVotesRef.current, [postId]: dir };
    myVotesRef.current = nextMy;
    setMyVotes(nextMy);

    setPosts(prev => prev.map(p =>
      p.id === postId ? { ...p, votes: p.votes + delta } : p
    ));

    const { error } = await supabase.from("post_votes").upsert(
      { user_id: user.id, post_id: postId, dir },
      { onConflict: "user_id,post_id" }
    );
    if (error) {
      pendingVoteIds.current[postId] = Math.max(0, (pendingVoteIds.current[postId] || 0) - 1);
      const rolled = { ...myVotesRef.current };
      if (prev === 0) delete rolled[postId];
      else rolled[postId] = prev;
      myVotesRef.current = rolled;
      setMyVotes(rolled);
      setPosts(prev => prev.map(p =>
        p.id === postId ? { ...p, votes: p.votes - delta } : p
      ));
      console.error("vote:", error.message);
    }
  }, [user]);

  return { posts, setPosts, addPost, addComment, vote, myVotes, loading, error, reload: load };
}

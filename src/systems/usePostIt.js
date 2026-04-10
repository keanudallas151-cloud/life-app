import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../supabaseClient";

// ── Shape helpers ─────────────────────────────────────────
// Transforms a Supabase post row + its comments array into the
// shape PostItFeed already expects so the component needs zero changes.
function shapePosts(rows, commentsMap, votesMap) {
  return rows.map(r => ({
    id:       r.id,
    author:   r.author,
    title:    r.title,
    body:     r.body || "",
    flair:    r.flair || "General",
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

// ── Main hook ─────────────────────────────────────────────
export function usePostIt(user) {
  const [posts,    setPosts]   = useState([]);
  const [loading,  setLoading] = useState(true);
  const [error,    setError]   = useState(null);

  // Local cache of vote state so optimistic UI works
  const votesRef = useRef({});  // { postId: currentVoteTotal }

  // Track pending vote operations to prevent double-counting
  // between optimistic updates and realtime subscription events
  const pendingVoteIds = useRef({});  // { postId: pendingCount }

  // ── INITIAL LOAD ────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

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
      if (!commentsMap[c.post_id]) commentsMap[c.post_id] = [];
      commentsMap[c.post_id].push(c);
    });

    const votesMap = {};
    (voteRows || []).forEach(v => {
      votesMap[v.post_id] = (votesMap[v.post_id] || 0) + v.dir;
    });
    // Add base votes from the post row itself
    postRows.forEach(p => {
      votesMap[p.id] = (votesMap[p.id] || 0) + (p.votes || 0);
    });
    votesRef.current = votesMap;

    setPosts(shapePosts(postRows, commentsMap, votesMap));
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── REALTIME SUBSCRIPTION ───────────────────────────────
  useEffect(() => {
    const channel = supabase
      .channel("postit_realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "posts" },
        payload => {
          const newPost = shapePosts([payload.new], {}, { [payload.new.id]: payload.new.votes })[0];
          setPosts(prev => [newPost, ...prev]);
        })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "posts" },
        payload => {
          setPosts(prev => prev.filter(p => p.id !== payload.old.id));
        })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "comments" },
        payload => {
          const c = payload.new;
          const shaped = { id: c.id, author: c.author, text: c.text, time: "just now" };
          setPosts(prev => prev.map(p =>
            p.id === c.post_id
              ? { ...p, comments: [...p.comments, shaped] }
              : p
          ));
        })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "post_votes" },
        payload => {
          const { post_id, dir } = payload.new;
          // Skip if already applied by our own optimistic update
          if (pendingVoteIds.current[post_id] > 0) {
            pendingVoteIds.current[post_id]--;
            return;
          }
          setPosts(prev => prev.map(p =>
            p.id === post_id ? { ...p, votes: p.votes + dir } : p
          ));
        })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "post_votes" },
        payload => {
          // User changed their vote (e.g. ▲ then ▼): diff = new - old
          const diff = payload.new.dir - payload.old.dir;
          // Skip if already applied by our own optimistic update
          if (pendingVoteIds.current[payload.new.post_id] > 0) {
            pendingVoteIds.current[payload.new.post_id]--;
            return;
          }
          setPosts(prev => prev.map(p =>
            p.id === payload.new.post_id ? { ...p, votes: p.votes + diff } : p
          ));
        })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // ── ADD POST ────────────────────────────────────────────
  const addPost = useCallback(async ({ title, body, flair }) => {
    if (!user?.id) return;
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

  // ── ADD COMMENT ─────────────────────────────────────────
  const addComment = useCallback(async (postId, text) => {
    if (!user?.id || !text.trim()) return;
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

  // ── VOTE ────────────────────────────────────────────────
  // Upserts into post_votes. Realtime handles the UI update.
  // We do an optimistic update here as well so it feels instant.
  const vote = useCallback(async (postId, dir) => {
    if (!user?.id) return;

    // Mark as pending so realtime handler skips the echo
    pendingVoteIds.current[postId] = (pendingVoteIds.current[postId] || 0) + 1;

    // Optimistic update
    setPosts(prev => prev.map(p =>
      p.id === postId ? { ...p, votes: p.votes + dir } : p
    ));

    const { error } = await supabase.from("post_votes").upsert(
      { user_id: user.id, post_id: postId, dir },
      { onConflict: "user_id,post_id" }
    );
    if (error) {
      // Rollback on error and clear pending flag
      pendingVoteIds.current[postId] = Math.max(0, (pendingVoteIds.current[postId] || 0) - 1);
      setPosts(prev => prev.map(p =>
        p.id === postId ? { ...p, votes: p.votes - dir } : p
      ));
      console.error("vote:", error.message);
    }
  }, [user]);

  return { posts, setPosts, addPost, addComment, vote, loading, error, reload: load };
}

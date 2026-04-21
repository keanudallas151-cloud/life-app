import { useState, useEffect, useCallback, useRef } from "react";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebaseClient";

// Transforms a Supabase post row + its comments array into the
// shape PostItFeed already expects so the component needs zero changes.
function shapePosts(rows, commentsMap, votesMap) {
  return rows.map(r => ({
    id:       r.id,
    author:   r.author,
    authorAvatarUrl: r.author_avatar_url || "",
    title:    r.title,
    body:     r.body || "",
    flair:    r.flair || "General",
    created_at: r.created_at,
    votes:    votesMap[r.id] ?? r.votes,
    comments: (commentsMap[r.id] || []).map(c => ({
      id:     c.id,
      author: c.author,
      authorAvatarUrl: c.author_avatar_url || "",
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

    try {
      const postSnapshot = await getDocs(
        query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(100)),
      );
      const postRows = postSnapshot.docs.map((row) => ({
        id: row.id,
        ...row.data(),
        created_at:
          typeof row.data().createdAt?.toDate === "function"
            ? row.data().createdAt.toDate().toISOString()
            : null,
      }));

      const postIds = postRows.map((p) => p.id);
      if (postIds.length === 0) {
        votesRef.current = {};
        myVotesRef.current = {};
        setMyVotes({});
        setPosts([]);
        setLoading(false);
        return;
      }

      const commentSnapshot = await getDocs(
        query(collection(db, "comments"), where("postId", "in", postIds)),
      );
      const commentRows = commentSnapshot.docs.map((row) => {
        const data = row.data();
        return {
          id: row.id,
          post_id: data.postId,
          author: data.author,
          author_avatar_url: data.authorAvatarUrl || "",
          text: data.text,
          created_at:
            typeof data.createdAt?.toDate === "function"
              ? data.createdAt.toDate().toISOString()
              : null,
        };
      });

      // Build maps
      const commentsMap = {};
      (commentRows || []).forEach(c => {
        if (!c.post_id) return;
        if (!commentsMap[c.post_id]) commentsMap[c.post_id] = [];
        commentsMap[c.post_id].push(c);
      });

      const votesMap = {};
      postRows.forEach((p) => {
        votesMap[p.id] = Number(p.voteCount ?? p.votes ?? 0);
      });
      votesRef.current = votesMap;

      let myVoteMap = {};
      if (user?.id) {
        const myVoteSnapshot = await getDocs(
          query(collection(db, "postVotes"), where("userId", "==", user.id)),
        );
        myVoteSnapshot.forEach((voteDoc) => {
          const data = voteDoc.data();
          if (data.postId) myVoteMap[data.postId] = data.dir;
        });
      }

      myVotesRef.current = myVoteMap;
      setMyVotes(myVoteMap);
      setPosts(shapePosts(postRows, commentsMap, votesMap));
      setError(null);
    } catch (loadError) {
      setError(loadError.message || "Could not load Post-It right now.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(100)),
      () => {
        void load();
      },
      (snapshotError) => {
        setError(snapshotError.message || "Could not sync Post-It right now.");
      },
    );

    return () => unsubscribe();
  }, [load]);

  const addPost = useCallback(async ({ title, body, flair }) => {
    if (!user?.id) return;
    const author = user.name
      ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
      : "??";

    try {
      const postRef = await addDoc(collection(db, "posts"), {
        userId: user.id,
        author,
        authorAvatarUrl: user.avatarUrl || "",
        title: title.trim(),
        body: body.trim(),
        flair,
        voteCount: 1,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      await setDoc(doc(db, "postVotes", `${postRef.id}_${user.id}`), {
        postId: postRef.id,
        userId: user.id,
        dir: 1,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("addPost:", error.message);
      setError(error.message || "Could not create post.");
    }
  }, [user]);

  const addComment = useCallback(async (postId, text) => {
    if (!user?.id || !text.trim()) return;
    const author = user.name
      ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
      : "??";

    try {
      const batch = writeBatch(db);
      batch.set(doc(collection(db, "comments")), {
        postId,
        userId: user.id,
        author,
        authorAvatarUrl: user.avatarUrl || "",
        text: text.trim(),
        createdAt: serverTimestamp(),
      });
      batch.update(doc(db, "posts", postId), {
        updatedAt: serverTimestamp(),
      });
      await batch.commit();
    } catch (error) {
      console.error("addComment:", error.message);
      setError(error.message || "Could not add comment.");
    }
  }, [user]);

  // Upserts into post_votes. Realtime handles the UI update.
  // We do an optimistic update here as well so it feels instant.
  const vote = useCallback(async (postId, dir) => {
    if (!user?.id) return;

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

    try {
      await runTransaction(db, async (transaction) => {
        const postRef = doc(db, "posts", postId);
        const voteRef = doc(db, "postVotes", `${postId}_${user.id}`);
        transaction.update(postRef, {
          voteCount: increment(delta),
          updatedAt: serverTimestamp(),
        });
        transaction.set(
          voteRef,
          {
            postId,
            userId: user.id,
            dir,
            updatedAt: serverTimestamp(),
          },
          { merge: true },
        );
      });
    } catch (error) {
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
      setError(error.message || "Could not record vote.");
    }
  }, [user]);

  return { posts, setPosts, addPost, addComment, vote, myVotes, loading, error, reload: load };
}

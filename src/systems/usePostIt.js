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

function shapePosts(rows, commentsMap, votesMap) {
  return rows.map((row) => ({
    id: row.id,
    author: row.author,
    title: row.title,
    body: row.body || "",
    flair: row.flair || "General",
    created_at: row.created_at,
    votes: votesMap[row.id] ?? row.votes,
    comments: (commentsMap[row.id] || []).map((comment) => ({
      id: comment.id,
      author: comment.author,
      text: comment.text,
      time: formatAge(comment.created_at),
    })),
    time: formatAge(row.created_at),
  }));
}

function formatAge(iso) {
  if (!iso) return "just now";
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function usePostIt(user) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [myVotes, setMyVotes] = useState({});
  const myVotesRef = useRef({});
  const votesRef = useRef({});
  const pendingVoteIds = useRef({});

  const load = useCallback(async () => {
    if (!db) {
      setPosts([]);
      setMyVotes({});
      myVotesRef.current = {};
      setLoading(false);
      setError("Community is unavailable until Firebase is configured.");
      return;
    }

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

      const postIds = postRows.map((post) => post.id);
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
          text: data.text,
          created_at:
            typeof data.createdAt?.toDate === "function"
              ? data.createdAt.toDate().toISOString()
              : null,
        };
      });

      const commentsMap = {};
      (commentRows || []).forEach((comment) => {
        if (!comment.post_id) return;
        if (!commentsMap[comment.post_id]) commentsMap[comment.post_id] = [];
        commentsMap[comment.post_id].push(comment);
      });

      const votesMap = {};
      postRows.forEach((post) => {
        votesMap[post.id] = Number(post.voteCount ?? post.votes ?? 0);
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

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!db) return undefined;

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

  const addPost = useCallback(
    async ({ title, body, flair }) => {
      if (!db || !user?.id) return;
      const author = user.name
        ? user.name
            .split(" ")
            .map((name) => name[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
        : "??";

      try {
        const postRef = await addDoc(collection(db, "posts"), {
          userId: user.id,
          author,
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
      } catch (postError) {
        console.error("addPost:", postError.message);
        setError(postError.message || "Could not create post.");
      }
    },
    [user],
  );

  const addComment = useCallback(
    async (postId, text) => {
      if (!db || !user?.id || !text.trim()) return;
      const author = user.name
        ? user.name
            .split(" ")
            .map((name) => name[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
        : "??";

      try {
        const batch = writeBatch(db);
        batch.set(doc(collection(db, "comments")), {
          postId,
          userId: user.id,
          author,
          text: text.trim(),
          createdAt: serverTimestamp(),
        });
        batch.update(doc(db, "posts", postId), {
          updatedAt: serverTimestamp(),
        });
        await batch.commit();
      } catch (commentError) {
        console.error("addComment:", commentError.message);
        setError(commentError.message || "Could not add comment.");
      }
    },
    [user],
  );

  const vote = useCallback(
    async (postId, dir) => {
      if (!db || !user?.id) return;

      const prev = myVotesRef.current[postId] ?? 0;
      if (prev === dir) return;

      const delta = dir - prev;
      pendingVoteIds.current[postId] = (pendingVoteIds.current[postId] || 0) + 1;

      const nextMy = { ...myVotesRef.current, [postId]: dir };
      myVotesRef.current = nextMy;
      setMyVotes(nextMy);

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId ? { ...post, votes: post.votes + delta } : post,
        ),
      );

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
      } catch (voteError) {
        pendingVoteIds.current[postId] = Math.max(
          0,
          (pendingVoteIds.current[postId] || 0) - 1,
        );
        const rolled = { ...myVotesRef.current };
        if (prev === 0) delete rolled[postId];
        else rolled[postId] = prev;
        myVotesRef.current = rolled;
        setMyVotes(rolled);
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId ? { ...post, votes: post.votes - delta } : post,
          ),
        );
        console.error("vote:", voteError.message);
        setError(voteError.message || "Could not record vote.");
      }
    },
    [user],
  );

  return {
    posts,
    setPosts,
    addPost,
    addComment,
    vote,
    myVotes,
    loading,
    error,
    reload: load,
  };
}

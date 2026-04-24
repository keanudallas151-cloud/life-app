import { useState, useEffect, useMemo, useRef } from "react";
import { C, S } from "../systems/theme";
import { Ic } from "../icons/Ic";
import { usePostIt } from "../systems/usePostIt";

const DRAFT_KEY = "life_postit_draft";

const FLAIRS = ["Finance", "Psychology", "Philosophy", "Money", "General"];

const FLAIR_COLORS = {
  Finance: { bg: "rgba(80,200,120,0.13)", color: "#50c878" },
  Psychology: { bg: "rgba(147,112,219,0.13)", color: "#9370db" },
  Philosophy: { bg: "rgba(96,165,250,0.13)", color: "#60a5fa" },
  Money: { bg: "rgba(245,166,35,0.13)", color: "#f5a623" },
  General: { bg: "rgba(161,161,161,0.13)", color: "#a1a1a1" },
};

function timeAgo(iso) {
  if (!iso) return "";
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d`;
  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "short",
  }).format(new Date(iso));
}

function PostAvatar({ avatarUrl, initials, size = 28, fontSize = 10 }) {
  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt={initials}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          objectFit: "cover",
          flexShrink: 0,
          border: `1px solid ${C.border}`,
        }}
      />
    );
  }
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: `linear-gradient(135deg, ${C.green} 0%, #3a9e60 100%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <span style={{ color: "#fff", fontSize, fontWeight: 700 }}>
        {initials}
      </span>
    </div>
  );
}

function FlairBadge({ flair }) {
  const fc = FLAIR_COLORS[flair] || FLAIR_COLORS.General;
  return (
    <span
      style={{
        background: fc.bg,
        color: fc.color,
        fontSize: 10,
        fontWeight: 800,
        padding: "3px 9px",
        borderRadius: 20,
        letterSpacing: 0.4,
        flexShrink: 0,
        whiteSpace: "nowrap",
      }}
    >
      {flair}
    </span>
  );
}

function SkeletonCard() {
  return (
    <div
      style={{
        background: C.white,
        border: `1px solid ${C.border}`,
        borderRadius: 14,
        marginBottom: 10,
        display: "flex",
        overflow: "hidden",
        opacity: 0.7,
      }}
    >
      <div
        style={{
          width: 50,
          background: C.skin,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "16px 0",
          gap: 8,
        }}
      >
        <div
          style={{
            width: 24,
            height: 20,
            borderRadius: 6,
            background: C.border,
          }}
        />
        <div
          style={{
            width: 18,
            height: 14,
            borderRadius: 4,
            background: C.border,
          }}
        />
        <div
          style={{
            width: 24,
            height: 20,
            borderRadius: 6,
            background: C.border,
          }}
        />
      </div>
      <div
        style={{
          flex: 1,
          padding: "14px 14px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: "50%",
              background: C.border,
            }}
          />
          <div
            style={{
              width: 80,
              height: 10,
              borderRadius: 5,
              background: C.border,
            }}
          />
          <div
            style={{
              width: 40,
              height: 10,
              borderRadius: 5,
              background: C.border,
            }}
          />
        </div>
        <div
          style={{
            width: "75%",
            height: 16,
            borderRadius: 6,
            background: C.border,
          }}
        />
        <div
          style={{
            width: "90%",
            height: 11,
            borderRadius: 5,
            background: C.border,
          }}
        />
        <div
          style={{
            width: "60%",
            height: 11,
            borderRadius: 5,
            background: C.border,
          }}
        />
        <div style={{ display: "flex", gap: 8, marginTop: 2 }}>
          <div
            style={{
              width: 80,
              height: 24,
              borderRadius: 8,
              background: C.border,
            }}
          />
          <div
            style={{
              width: 55,
              height: 24,
              borderRadius: 8,
              background: C.border,
            }}
          />
        </div>
      </div>
    </div>
  );
}

export function PostItFeed({ play, user, onMomentumEvent }) {
  // #postit_feed
  const { posts, addPost, addComment, vote, myVotes, loading, error, reload } =
    usePostIt(user);

  const [sort, setSort] = useState("recent");
  const [viewing, setViewing] = useState(null);
  const [showCompose, setShowCompose] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [newFlair, setNewFlair] = useState("Finance");
  const [commentText, setCommentText] = useState("");
  const [savedPosts, setSavedPosts] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem("life_saved_posts") || "[]");
    } catch {
      return [];
    }
  });
  const [shareCopied, setShareCopied] = useState(null); // post id that just copied
  const [replyingTo, setReplyingTo] = useState(null); // comment id in thread view
  const commentInputRef = useRef(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const d = JSON.parse(raw);
      sessionStorage.removeItem(DRAFT_KEY);
      if (typeof d?.title === "string") setNewTitle(d.title);
      if (typeof d?.body === "string") setNewBody(d.body);
      setShowCompose(true);
    } catch {
      sessionStorage.removeItem(DRAFT_KEY);
    }
  }, []);

  const sorted = useMemo(
    () =>
      [...posts].sort((a, b) =>
        sort === "votes"
          ? b.votes - a.votes
          : sort === "trending"
            ? b.votes +
              b.comments.length * 3 -
              (a.votes + a.comments.length * 3)
            : new Date(b.created_at || 0) - new Date(a.created_at || 0),
      ),
    [posts, sort],
  );

  const handleVote = (id, dir) => {
    if (!user?.id) {
      play("err");
      return;
    }
    const cur = myVotes[id] ?? 0;
    if (cur === dir) {
      play("err");
      return;
    }
    play("star");
    vote(id, dir);
    onMomentumEvent?.({
      type: "community",
      points: 4,
      source: "postit",
      meta: { action: "vote", postId: id, direction: dir },
    });
  };

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    play("ok");
    addComment(viewing, commentText);
    setCommentText("");
    setReplyingTo(null);
    onMomentumEvent?.({
      type: "community",
      points: 5,
      source: "postit",
      meta: { action: "comment", postId: viewing },
    });
  };

  const handleSubmitPost = () => {
    if (!newTitle.trim()) return;
    play("ok");
    addPost({ title: newTitle, body: newBody, flair: newFlair });
    setNewTitle("");
    setNewBody("");
    setShowCompose(false);
    onMomentumEvent?.({
      type: "community",
      points: 8,
      source: "postit",
      meta: { action: "post", flair: newFlair },
    });
  };

  const handleSave = (postId) => {
    play("star");
    setSavedPosts((prev) => {
      const next = prev.includes(postId)
        ? prev.filter((id) => id !== postId)
        : [...prev, postId];
      try {
        sessionStorage.setItem("life_saved_posts", JSON.stringify(next));
      } catch {
        // Ignore sessionStorage write failures and keep the in-memory state.
      }
      return next;
    });
  };

  const handleShare = (post) => {
    const text = `${post.title} — via Life. app`;
    if (navigator.share) {
      navigator.share({ title: post.title, text }).catch(() => {
        // User cancelled share or the platform rejected it.
      });
    } else {
      try {
        navigator.clipboard.writeText(text);
      } catch {
        // Clipboard access can be blocked; the copied-state UI still handles feedback.
      }
      setShareCopied(post.id);
      setTimeout(() => setShareCopied(null), 2000);
    }
    play("ok");
  };

  // ── Thread / detail view ──────────────────────────────────────────────────
  const vp = posts.find((p) => p.id === viewing);
  if (vp) {
    const upvoted = myVotes[vp.id] === 1;
    const downvoted = myVotes[vp.id] === -1;
    return (
      <div
        className="life-postit-page"
        style={{
          padding: "0 0 max(32px, env(safe-area-inset-bottom, 0px))",
          maxWidth: 640,
          margin: "0 auto",
          boxSizing: "border-box",
        }}
      >
        {/* Back bar */}
        <div
          style={{
            padding: "14px 16px 0",
            position: "sticky",
            top: 0,
            background: C.skin,
            zIndex: 10,
          }}
        >
          <button
            onClick={() => {
              setViewing(null);
              setReplyingTo(null);
              setCommentText("");
            }}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: C.muted,
              fontSize: 13,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 0",
              minHeight: 44,
            }}
          >
            ← Back
          </button>
        </div>

        {/* Post card — reddit layout */}
        <div
          style={{
            margin: "10px 12px 0",
            background: C.white,
            border: `1px solid ${C.border}`,
            borderRadius: 14,
            overflow: "hidden",
            boxShadow: S.sm,
          }}
        >
          <div style={{ display: "flex" }}>
            {/* Vote column */}
            <div
              style={{
                width: 50,
                background: C.skin,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                paddingTop: 14,
                paddingBottom: 14,
                gap: 4,
                flexShrink: 0,
              }}
            >
              <button
                type="button"
                aria-pressed={upvoted}
                onClick={() => handleVote(vp.id, 1)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 18,
                  color: upvoted ? C.green : C.muted,
                  padding: "4px 8px",
                  minHeight: 44,
                  transition: "color 140ms",
                }}
              >
                ▲
              </button>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 800,
                  color: upvoted ? C.green : downvoted ? C.red : C.ink,
                  lineHeight: 1,
                }}
              >
                {vp.votes}
              </span>
              <button
                type="button"
                aria-pressed={downvoted}
                onClick={() => handleVote(vp.id, -1)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 18,
                  color: downvoted ? C.red : C.muted,
                  padding: "4px 8px",
                  minHeight: 44,
                  transition: "color 140ms",
                }}
              >
                ▼
              </button>
            </div>
            {/* Content */}
            <div style={{ flex: 1, padding: "14px 14px 16px", minWidth: 0 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 10,
                  flexWrap: "wrap",
                }}
              >
                <PostAvatar
                  avatarUrl={vp.authorAvatarUrl}
                  initials={vp.author?.slice(0, 2)}
                  size={22}
                  fontSize={8}
                />
                <span style={{ fontSize: 12, fontWeight: 700, color: C.ink }}>
                  {vp.author || "Anonymous"}
                </span>
                <span style={{ fontSize: 11, color: C.muted }}>
                  {timeAgo(vp.created_at) || vp.time}
                </span>
                <FlairBadge flair={vp.flair} />
              </div>
              <h2
                style={{
                  fontSize: 17,
                  fontWeight: 700,
                  color: C.ink,
                  margin: "0 0 10px",
                  lineHeight: 1.4,
                }}
              >
                {vp.title}
              </h2>
              {vp.body ? (
                <p
                  style={{
                    margin: "0 0 14px",
                    fontSize: 14,
                    color: C.mid,
                    lineHeight: 1.8,
                    fontFamily: "-apple-system,'SF Pro Display','SF Pro Text','Helvetica Neue',Arial,sans-serif",
                  }}
                >
                  {vp.body}
                </p>
              ) : null}
              {/* Action row */}
              <div
                style={{
                  display: "flex",
                  gap: 4,
                  borderTop: `1px solid ${C.border}`,
                  paddingTop: 10,
                  marginTop: 4,
                  flexWrap: "wrap",
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    commentInputRef.current?.focus();
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 12,
                    color: C.muted,
                    padding: "6px 10px",
                    borderRadius: 8,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    minHeight: 36,
                    transition: "background 120ms",
                  }}
                >
                  {Ic.chat("none", C.muted, 13)} {vp.comments.length} Comments
                </button>
                <button
                  type="button"
                  onClick={() => handleShare(vp)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 12,
                    color: shareCopied === vp.id ? C.green : C.muted,
                    padding: "6px 10px",
                    borderRadius: 8,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    minHeight: 36,
                    transition: "color 140ms",
                  }}
                >
                  {shareCopied === vp.id ? "✓ Copied" : "Share"}
                </button>
                <button
                  type="button"
                  onClick={() => handleSave(vp.id)}
                  style={{
                    background: savedPosts.includes(vp.id)
                      ? "rgba(80,200,120,0.12)"
                      : "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 12,
                    color: savedPosts.includes(vp.id) ? C.green : C.muted,
                    padding: "6px 10px",
                    borderRadius: 8,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    minHeight: 36,
                    transition: "background 120ms, color 120ms",
                  }}
                >
                  {savedPosts.includes(vp.id) ? "★ Saved" : "☆ Save"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Comments */}
        <div style={{ padding: "20px 12px 0" }}>
          <p
            style={{
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: C.muted,
              margin: "0 0 14px",
            }}
          >
            {vp.comments.length}{" "}
            {vp.comments.length === 1 ? "Comment" : "Comments"}
          </p>

          {vp.comments.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "32px 20px",
                color: C.muted,
                fontSize: 13,
                fontFamily: "-apple-system,'SF Pro Display','SF Pro Text','Helvetica Neue',Arial,sans-serif",
                fontStyle: "italic",
              }}
            >
              No comments yet — be the first to reply.
            </div>
          )}

          {vp.comments.map((c) => (
            <div
              key={c.id}
              style={{ display: "flex", gap: 10, marginBottom: 12 }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  flexShrink: 0,
                }}
              >
                <PostAvatar
                  avatarUrl={c.authorAvatarUrl}
                  initials={c.author?.slice(0, 2)}
                  size={28}
                  fontSize={10}
                />
                {/* Thread line */}
                <div
                  style={{
                    flex: 1,
                    width: 2,
                    background: C.border,
                    borderRadius: 1,
                    margin: "6px 0 0",
                    minHeight: 12,
                  }}
                />
              </div>
              <div style={{ flex: 1, minWidth: 0, paddingBottom: 6 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 5,
                    flexWrap: "wrap",
                  }}
                >
                  <span style={{ fontSize: 12, fontWeight: 700, color: C.ink }}>
                    {c.author || "Anonymous"}
                  </span>
                  <span style={{ fontSize: 11, color: C.muted }}>
                    {timeAgo(c.created_at) || c.time}
                  </span>
                </div>
                <p
                  style={{
                    margin: "0 0 6px",
                    fontSize: 14,
                    color: C.mid,
                    lineHeight: 1.65,
                    fontFamily: "-apple-system,'SF Pro Display','SF Pro Text','Helvetica Neue',Arial,sans-serif",
                  }}
                >
                  {c.text}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setReplyingTo(c.id);
                    setCommentText(`@${c.author || "user"} `);
                    commentInputRef.current?.focus();
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 11,
                    color: C.muted,
                    padding: "4px 0",
                    fontWeight: 600,
                    letterSpacing: 0.3,
                  }}
                >
                  Reply
                </button>
              </div>
            </div>
          ))}

          {/* Comment composer */}
          <div
            style={{
              marginTop: 16,
              background: C.white,
              border: `1px solid ${C.border}`,
              borderRadius: 12,
              padding: "12px 14px",
              boxSizing: "border-box",
            }}
          >
            {replyingTo && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <span
                  style={{ fontSize: 11, color: C.muted, fontStyle: "italic" }}
                >
                  Replying to a comment
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setReplyingTo(null);
                    setCommentText("");
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 11,
                    color: C.muted,
                  }}
                >
                  ✕ Cancel
                </button>
              </div>
            )}
            <textarea
              ref={commentInputRef}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment…"
              rows={3}
              style={{
                width: "100%",
                background: "none",
                border: "none",
                outline: "none",
                fontSize: 16,
                color: C.ink,
                fontFamily: "-apple-system,'SF Pro Display','SF Pro Text','Helvetica Neue',Arial,sans-serif",
                resize: "none",
                lineHeight: 1.6,
                boxSizing: "border-box",
              }}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: 8,
                gap: 8,
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setCommentText("");
                  setReplyingTo(null);
                }}
                style={{
                  background: "none",
                  border: `1px solid ${C.border}`,
                  borderRadius: 8,
                  padding: "8px 14px",
                  cursor: "pointer",
                  fontSize: 13,
                  color: C.muted,
                }}
              >
                Clear
              </button>
              <button
                type="button"
                onClick={handleAddComment}
                style={{
                  background: commentText.trim() ? C.green : C.border,
                  border: "none",
                  borderRadius: 8,
                  padding: "8px 18px",
                  cursor: commentText.trim() ? "pointer" : "default",
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#fff",
                  transition: "background 150ms",
                }}
              >
                Comment
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Feed view ─────────────────────────────────────────────────────────────
  const SORT_TABS = [
    { key: "trending", label: "🔥 Hot" },
    { key: "recent", label: "✨ New" },
    { key: "votes", label: "📈 Top" },
  ];

  return (
    <div
      className="life-postit-page"
      style={{
        padding: "0 0 max(32px, env(safe-area-inset-bottom, 0px))",
        maxWidth: 640,
        margin: "0 auto",
        boxSizing: "border-box",
      }}
    >
      {/* Community header */}
      <div
        style={{
          background: `linear-gradient(135deg, rgba(80,200,120,0.12) 0%, rgba(80,200,120,0.04) 100%)`,
          borderBottom: `1px solid ${C.border}`,
          padding: "16px 16px 14px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${C.green} 0%, #3a9e60 100%)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: 20 }}>💡</span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 15,
                fontWeight: 800,
                color: C.ink,
                letterSpacing: -0.2,
              }}
            >
              r/life
            </div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 1 }}>
              12.4k members · Your daily growth community
            </div>
          </div>
          <button
            type="button"
            aria-label="New post"
            onClick={() => setShowCompose((v) => !v)}
            style={{
              background: C.green,
              border: "none",
              borderRadius: 20,
              padding: "9px 18px",
              color: "#fff",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              flexShrink: 0,
              minHeight: 44,
              transition: "opacity 150ms",
            }}
          >
            + Post
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div
          style={{
            background: "rgba(229,72,77,0.08)",
            border: `1px solid ${C.red}`,
            borderRadius: 12,
            padding: "12px 16px",
            margin: "12px 12px 0",
            fontSize: 13,
            color: C.ink,
          }}
        >
          <strong style={{ display: "block", marginBottom: 3 }}>
            Could not load the feed
          </strong>
          <span style={{ color: C.mid, fontSize: 12 }}>{error}</span>
          <button
            type="button"
            onClick={() => reload()}
            style={{
              display: "block",
              marginTop: 10,
              background: C.white,
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              padding: "8px 14px",
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            Try again
          </button>
        </div>
      )}

      {/* Compose panel */}
      {showCompose && (
        <div
          style={{
            background: C.white,
            border: `1px solid ${C.border}`,
            borderRadius: 14,
            margin: "12px 12px 0",
            padding: "18px 16px",
            boxSizing: "border-box",
            boxShadow: S.sm,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 14,
            }}
          >
            <span
              style={{
                fontSize: 13,
                fontWeight: 800,
                color: C.ink,
                letterSpacing: -0.1,
              }}
            >
              Create a post
            </span>
            <button
              type="button"
              onClick={() => setShowCompose(false)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 18,
                color: C.muted,
                lineHeight: 1,
                minHeight: 44,
                minWidth: 44,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ✕
            </button>
          </div>

          {/* Flair pills */}
          <div
            style={{
              display: "flex",
              gap: 6,
              marginBottom: 14,
              flexWrap: "wrap",
            }}
          >
            {FLAIRS.map((f) => {
              const fc = FLAIR_COLORS[f];
              const active = newFlair === f;
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => setNewFlair(f)}
                  style={{
                    background: active ? fc.bg : "none",
                    border: `1.5px solid ${active ? fc.color : C.border}`,
                    borderRadius: 20,
                    padding: "5px 13px",
                    fontSize: 12,
                    fontWeight: active ? 800 : 500,
                    color: active ? fc.color : C.muted,
                    cursor: "pointer",
                    transition: "all 150ms",
                  }}
                >
                  {f}
                </button>
              );
            })}
          </div>

          {/* Title */}
          <div style={{ position: "relative", marginBottom: 10 }}>
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value.slice(0, 150))}
              placeholder="Title *"
              maxLength={150}
              style={{
                width: "100%",
                background: C.skin,
                border: `1px solid ${newTitle.length > 130 ? C.red : C.border}`,
                borderRadius: 10,
                padding: "13px 14px",
                fontSize: 16,
                fontWeight: 600,
                color: C.ink,
                outline: "none",
                fontFamily: "-apple-system,'SF Pro Display','SF Pro Text','Helvetica Neue',Arial,sans-serif",
                boxSizing: "border-box",
              }}
            />
            <span
              style={{
                position: "absolute",
                bottom: 8,
                right: 10,
                fontSize: 10,
                color: newTitle.length > 130 ? C.red : C.muted,
              }}
            >
              {newTitle.length}/150
            </span>
          </div>

          {/* Body */}
          <div style={{ position: "relative", marginBottom: 14 }}>
            <textarea
              value={newBody}
              onChange={(e) => setNewBody(e.target.value)}
              placeholder="Share your thoughts… (optional)"
              rows={4}
              style={{
                width: "100%",
                background: C.skin,
                border: `1px solid ${C.border}`,
                borderRadius: 10,
                padding: "12px 14px",
                fontSize: 16,
                color: C.mid,
                outline: "none",
                fontFamily: "-apple-system,'SF Pro Display','SF Pro Text','Helvetica Neue',Arial,sans-serif",
                resize: "vertical",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              onClick={handleSubmitPost}
              style={{
                flex: "1 1 auto",
                background: newTitle.trim() ? C.green : C.border,
                border: "none",
                borderRadius: 10,
                padding: "13px",
                color: "#fff",
                fontSize: 14,
                fontWeight: 700,
                cursor: newTitle.trim() ? "pointer" : "default",
                transition: "background 150ms",
              }}
            >
              Post
            </button>
            <button
              type="button"
              onClick={() => setShowCompose(false)}
              style={{
                background: "none",
                border: `1px solid ${C.border}`,
                borderRadius: 10,
                padding: "13px 18px",
                color: C.muted,
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Sort tabs */}
      <div style={{ display: "flex", padding: "12px 12px 0", gap: 4 }}>
        {SORT_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setSort(tab.key)}
            style={{
              background: sort === tab.key ? C.green : C.white,
              border: `1.5px solid ${sort === tab.key ? C.green : C.border}`,
              borderRadius: 20,
              padding: "7px 15px",
              fontSize: 12,
              fontWeight: sort === tab.key ? 800 : 500,
              color: sort === tab.key ? "#fff" : C.muted,
              cursor: "pointer",
              transition: "all 160ms",
              flexShrink: 0,
            }}
          >
            {tab.label}
          </button>
        ))}
        {loading && (
          <span
            style={{
              fontSize: 11,
              color: C.muted,
              fontStyle: "italic",
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
            }}
          >
            Syncing…
          </span>
        )}
      </div>

      {/* Skeleton loading */}
      {loading && posts.length === 0 && (
        <div style={{ padding: "12px 12px 0" }}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {/* Empty state */}
      {!loading && posts.length === 0 && !error && (
        <div style={{ textAlign: "center", padding: "60px 24px" }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>💬</div>
          <p
            style={{
              fontSize: 17,
              fontWeight: 700,
              color: C.ink,
              margin: "0 0 8px",
            }}
          >
            Nothing here yet
          </p>
          <p
            style={{
              fontSize: 13,
              color: C.muted,
              margin: "0 0 24px",
              fontFamily: "-apple-system,'SF Pro Display','SF Pro Text','Helvetica Neue',Arial,sans-serif",
              lineHeight: 1.6,
            }}
          >
            Be the first to start a conversation in this community.
          </p>
          <button
            type="button"
            onClick={() => setShowCompose(true)}
            style={{
              background: C.green,
              border: "none",
              borderRadius: 20,
              padding: "12px 28px",
              color: "#fff",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Create the first post
          </button>
        </div>
      )}

      {/* Post cards — Reddit layout */}
      <div style={{ padding: "12px 12px 0" }}>
        {sorted.map((post) => {
          const up = myVotes[post.id] === 1;
          const down = myVotes[post.id] === -1;
          const saved = savedPosts.includes(post.id);
          return (
            <div
              key={post.id}
              className="life-card-hover"
              style={{
                background: C.white,
                border: `1px solid ${C.border}`,
                borderRadius: 14,
                marginBottom: 10,
                display: "flex",
                overflow: "hidden",
                boxShadow: S.sm,
                transition: "box-shadow 220ms ease, border-color 200ms ease",
              }}
            >
              {/* Vote column */}
              <div
                style={{
                  width: 50,
                  background: C.skin,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  paddingTop: 12,
                  paddingBottom: 12,
                  gap: 2,
                  flexShrink: 0,
                }}
              >
                <button
                  type="button"
                  aria-pressed={up}
                  onClick={() => handleVote(post.id, 1)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 16,
                    color: up ? C.green : C.muted,
                    padding: "6px 4px",
                    minHeight: 36,
                    transition: "color 140ms, transform 120ms",
                    transform: up ? "scale(1.2)" : "scale(1)",
                  }}
                >
                  ▲
                </button>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    color: up ? C.green : down ? C.red : C.ink,
                    lineHeight: 1,
                  }}
                >
                  {post.votes}
                </span>
                <button
                  type="button"
                  aria-pressed={down}
                  onClick={() => handleVote(post.id, -1)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 16,
                    color: down ? C.red : C.muted,
                    padding: "6px 4px",
                    minHeight: 36,
                    transition: "color 140ms, transform 120ms",
                    transform: down ? "scale(1.2)" : "scale(1)",
                  }}
                >
                  ▼
                </button>
              </div>

              {/* Content column */}
              <div style={{ flex: 1, padding: "12px 12px 10px", minWidth: 0 }}>
                {/* Meta row */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    marginBottom: 7,
                    flexWrap: "wrap",
                  }}
                >
                  <PostAvatar
                    avatarUrl={post.authorAvatarUrl}
                    initials={post.author?.slice(0, 2)}
                    size={20}
                    fontSize={7}
                  />
                  <span style={{ fontSize: 11, fontWeight: 700, color: C.ink }}>
                    {post.author || "Anonymous"}
                  </span>
                  <span style={{ fontSize: 10, color: C.muted }}>
                    {timeAgo(post.created_at) || post.time}
                  </span>
                  <FlairBadge flair={post.flair} />
                </div>

                {/* Title */}
                <h3
                  style={{
                    margin: "0 0 6px",
                    fontSize: 14,
                    fontWeight: 700,
                    color: C.ink,
                    lineHeight: 1.4,
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    play("open");
                    setViewing(post.id);
                  }}
                >
                  {post.title}
                </h3>

                {/* Body preview */}
                {post.body ? (
                  <p
                    style={{
                      margin: "0 0 10px",
                      fontSize: 12,
                      color: C.mid,
                      lineHeight: 1.6,
                      fontFamily: "-apple-system,'SF Pro Display','SF Pro Text','Helvetica Neue',Arial,sans-serif",
                    }}
                  >
                    {post.body.length > 140
                      ? post.body.slice(0, 140) + "…"
                      : post.body}
                  </p>
                ) : null}

                {/* Action row */}
                <div
                  style={{
                    display: "flex",
                    gap: 2,
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      play("open");
                      setViewing(post.id);
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: 11,
                      color: C.muted,
                      padding: "5px 8px",
                      borderRadius: 8,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      minHeight: 32,
                      transition: "background 120ms",
                    }}
                  >
                    {Ic.chat("none", C.muted, 12)} {post.comments.length}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleShare(post)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: 11,
                      color: shareCopied === post.id ? C.green : C.muted,
                      padding: "5px 8px",
                      borderRadius: 8,
                      minHeight: 32,
                      transition: "color 140ms",
                    }}
                  >
                    {shareCopied === post.id ? "✓ Copied" : "Share"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSave(post.id)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: 11,
                      color: saved ? C.green : C.muted,
                      padding: "5px 8px",
                      borderRadius: 8,
                      minHeight: 32,
                      transition: "color 140ms",
                    }}
                  >
                    {saved ? "★ Saved" : "☆ Save"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

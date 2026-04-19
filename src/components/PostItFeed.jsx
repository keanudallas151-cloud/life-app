import { useState, useEffect, useMemo } from "react";
import { C, S } from "../systems/theme";
import { Ic } from "../icons/Ic";
import { usePostIt } from "../systems/usePostIt";

const DRAFT_KEY = "life_postit_draft";

/** Renders a circular avatar — photo if available, initials fallback */
function PostAvatar({ avatarUrl, initials, size = 28, fontSize = 10 }) {
  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt={initials}
        style={{
          width: size, height: size,
          borderRadius: "50%",
          objectFit: "cover",
          flexShrink: 0,
          border: `1px solid ${C.border}`,
        }}
      />
    );
  }
  return (
    <div style={{
      width: size, height: size,
      borderRadius: "50%",
      background: C.ink,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0,
    }}>
      <span style={{ color: C.white, fontSize, fontWeight: 700 }}>{initials}</span>
    </div>
  );
}

export function PostItFeed({ play, user, onMomentumEvent }) {
  const { posts, addPost, addComment, vote, myVotes, loading, error, reload } = usePostIt(user);

  const [sort,        setSort]        = useState("recent");
  const [viewing,     setViewing]     = useState(null);
  const [showCompose, setShowCompose] = useState(false);
  const [newTitle,    setNewTitle]    = useState("");
  const [newBody,     setNewBody]     = useState("");
  const [newFlair,    setNewFlair]    = useState("Finance");
  const [commentText, setCommentText] = useState("");

  const flairs = ["Finance","Psychology","Philosophy","Money","General"];

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

  const sorted = useMemo(() => [...posts].sort((a,b) =>
    sort==="votes"    ? b.votes - a.votes
    : sort==="trending" ? (b.votes + b.comments.length*3) - (a.votes + a.comments.length*3)
    : new Date(b.created_at || 0) - new Date(a.created_at || 0)
  ), [posts, sort]);

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

  const voteBtn = (active, color, activeBg) => ({
    background: active ? activeBg : "none",
    border: `1.5px solid ${active ? color : C.border}`,
    borderRadius: 8,
    padding: "6px 12px",
    cursor: "pointer",
    fontSize: 13,
    color,
    fontWeight: active ? 700 : 500,
    opacity: active ? 1 : 0.88,
  });

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    play("ok");
    addComment(viewing, commentText);
    setCommentText("");
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
    setNewTitle(""); setNewBody(""); setShowCompose(false);
    onMomentumEvent?.({
      type: "community",
      points: 8,
      source: "postit",
      meta: { action: "post", flair: newFlair },
    });
  };

  const vp = posts.find(p => p.id === viewing);
  if (vp) return (
    <div className="life-postit-page" style={{ padding:"20px max(16px, env(safe-area-inset-left, 0px)) 28px max(16px, env(safe-area-inset-right, 0px))", maxWidth:620, margin:"0 auto", boxSizing:"border-box" }}>
      <button onClick={() => setViewing(null)}
        style={{ background:"none", border:"none", cursor:"pointer", color:C.muted, fontSize:13, padding:"0 0 16px", fontFamily:"Georgia,serif" }}>
        ← Back to Feed
      </button>
      <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:14, padding:20, boxSizing:"border-box" }}>
        <div className="life-postit-detail-meta" style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14, flexWrap:"wrap" }}>
          <PostAvatar avatarUrl={vp.authorAvatarUrl} initials={vp.author?.slice(0,2)} size={32} fontSize={11} />
          <span style={{ fontSize:13, fontWeight:600, color:C.ink, minWidth:0, wordBreak:"break-word" }}>{vp.author}</span>
          <span style={{ fontSize:11, color:C.muted }}>{vp.time}</span>
          <span style={{ marginLeft:"auto", background:C.greenLt, color:C.green, fontSize:10, fontWeight:700, padding:"3px 10px", borderRadius:20, flexShrink:0 }}>{vp.flair}</span>
        </div>
        <h2 style={{ fontSize:19, fontWeight:700, color:C.ink, margin:"0 0 12px", lineHeight:1.35 }}>{vp.title}</h2>
        <p style={{ fontSize:15, color:C.mid, lineHeight:1.8, margin:"0 0 20px", fontFamily:"Georgia,serif" }}>{vp.body}</p>
        <div style={{ display:"flex", gap:10, borderTop:`1px solid ${C.light}`, paddingTop:14, flexWrap:"wrap" }}>
          <button
            type="button"
            aria-pressed={myVotes[vp.id] === 1}
            onClick={() => handleVote(vp.id, 1)}
            style={voteBtn(myVotes[vp.id] === 1, C.green, C.greenLt)}>
            ▲ {vp.votes}
          </button>
          <button
            type="button"
            aria-pressed={myVotes[vp.id] === -1}
            onClick={() => handleVote(vp.id, -1)}
            style={voteBtn(myVotes[vp.id] === -1, C.red, "#fdf2f2")}>
            ▼
          </button>
        </div>
      </div>

      <div style={{ marginTop:24 }}>
        <p style={{ fontSize:11, fontWeight:700, letterSpacing:2, textTransform:"uppercase", color:C.muted, margin:"0 0 16px" }}>
          Comments ({vp.comments.length})
        </p>
        {vp.comments.map(c => (
          <div key={c.id} style={{ display:"flex", gap:12, marginBottom:14 }}>
            <PostAvatar avatarUrl={c.authorAvatarUrl} initials={c.author?.slice(0,2)} size={28} fontSize={10} />
            <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:10, padding:"10px 14px", flex:1 }}>
              <span style={{ fontSize:12, fontWeight:600, color:C.ink }}>{c.author}</span>
              <span style={{ fontSize:11, color:C.muted, marginLeft:8 }}>{c.time}</span>
              <p style={{ margin:"5px 0 0", fontSize:14, color:C.mid, fontFamily:"Georgia,serif", lineHeight:1.6 }}>{c.text}</p>
            </div>
          </div>
        ))}
        <div className="life-postit-comment-row" style={{ display:"flex", gap:10, marginTop:8, alignItems:"stretch" }}>
          <input value={commentText} onChange={e => setCommentText(e.target.value)}
            placeholder="Write a comment..."
            onKeyDown={e => { if (e.key==="Enter") handleAddComment(); }}
            style={{ flex:1, background:C.white, border:`1px solid ${C.border}`, borderRadius:10, padding:"12px 14px", fontSize:14, outline:"none", fontFamily:"Georgia,serif", color:C.ink }}/>
          <button onClick={handleAddComment}
            style={{ background:C.green, border:"none", borderRadius:10, padding:"12px 18px", color:C.white, fontSize:14, fontWeight:700, cursor:"pointer" }}>
            Post
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="life-postit-page" style={{ padding:"20px max(16px, env(safe-area-inset-left, 0px)) max(28px, env(safe-area-inset-bottom, 0px)) max(16px, env(safe-area-inset-right, 0px))", maxWidth:620, margin:"0 auto", boxSizing:"border-box" }}>
      {error && (
        <div style={{ background:"#fdf2f2", border:`1px solid ${C.red}`, borderRadius:12, padding:"14px 16px", marginBottom:16, fontSize:13, color:C.ink, lineHeight:1.6 }}>
          <strong style={{ display:"block", marginBottom:4 }}>Could not load the feed</strong>
          <span style={{ color:C.mid }}>{error}</span>
          <button type="button" onClick={() => reload()} style={{ display:"block", marginTop:10, background:C.white, border:`1px solid ${C.border}`, borderRadius:8, padding:"8px 14px", cursor:"pointer", fontFamily:"Georgia,serif", fontSize:13 }}>
            Try again
          </button>
        </div>
      )}
      <div className="life-postit-header" style={{ display:"flex", alignItems:"center", marginBottom:20, gap:12, flexWrap:"wrap" }}>
        <h2 style={{ margin:0, fontSize:"clamp(1.15rem, 4vw, 1.375rem)", fontWeight:700, color:C.ink, flex:"1 1 auto", minWidth:0 }}>Post-It</h2>
        {loading && <span style={{ fontSize:11, color:C.muted, fontStyle:"italic" }}>Syncing…</span>}
        <button type="button" aria-label="New post" onClick={() => setShowCompose(true)}
          style={{ background:C.green, border:"none", borderRadius:10, padding:"10px 18px", color:C.white, fontSize:22, fontWeight:300, cursor:"pointer", lineHeight:1, flexShrink:0 }}>
          +
        </button>
      </div>

      {showCompose && (
        <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:14, padding:"20px 18px", marginBottom:20, boxSizing:"border-box" }}>
          <div style={{ display:"flex", gap:8, marginBottom:14, flexWrap:"wrap" }}>
            {flairs.map(f => (
              <button key={f} onClick={() => setNewFlair(f)}
                style={{ background:newFlair===f?C.green:C.light, border:"none", borderRadius:20, padding:"5px 14px",
                  fontSize:12, fontWeight:newFlair===f?700:400, color:newFlair===f?C.white:C.muted, cursor:"pointer" }}>
                {f}
              </button>
            ))}
          </div>
          <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Title"
            style={{ width:"100%", background:C.skin, border:`1px solid ${C.border}`, borderRadius:10, padding:"14px",
              fontSize:15, fontWeight:600, color:C.ink, outline:"none", fontFamily:"Georgia,serif", boxSizing:"border-box", marginBottom:10 }}/>
          <textarea value={newBody} onChange={e => setNewBody(e.target.value)}
            placeholder="Share your thoughts..." rows={4}
            style={{ width:"100%", background:C.skin, border:`1px solid ${C.border}`, borderRadius:10, padding:"14px",
              fontSize:14, color:C.mid, outline:"none", fontFamily:"Georgia,serif", resize:"vertical", boxSizing:"border-box", marginBottom:14 }}/>
          <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
            <button onClick={handleSubmitPost}
              style={{ flex:"1 1 120px", minWidth:0, background:C.green, border:"none", borderRadius:10, padding:"13px", color:C.white, fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"Georgia,serif" }}>
              Post
            </button>
            <button type="button" onClick={() => setShowCompose(false)}
              style={{ flex:"0 1 auto", background:"none", border:`1px solid ${C.border}`, borderRadius:10, padding:"13px 20px", color:C.muted, fontSize:14, cursor:"pointer" }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="life-postit-sort" style={{ display:"flex", gap:8, marginBottom:20, flexWrap:"wrap" }}>
        {["recent","trending","votes"].map(s => (
          <button key={s} onClick={() => { setSort(s); }}
            style={{ background:sort===s?C.ink:C.white, border:`1px solid ${C.border}`, borderRadius:20,
              padding:"7px 16px", fontSize:12, fontWeight:sort===s?700:400,
              color:sort===s?C.white:C.muted, cursor:"pointer", textTransform:"capitalize" }}>
            {s==="votes" ? "Top" : s.charAt(0).toUpperCase()+s.slice(1)}
          </button>
        ))}
      </div>

      {sorted.map(post => (
        <div key={post.id} className="life-card-hover" style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:14, padding:"18px 16px", marginBottom:12, boxShadow:S.sm, transition:"box-shadow 0.25s ease, border-color 0.2s ease", boxSizing:"border-box" }}>
          <div className="life-postit-card-meta" style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10, flexWrap:"wrap" }}>
            <PostAvatar avatarUrl={post.authorAvatarUrl} initials={post.author?.slice(0,2)} size={28} fontSize={10} />
            <span style={{ fontSize:12, color:C.muted, flex:"1 1 auto", minWidth:0 }}>{post.time}</span>
            <span style={{ marginLeft:"auto", background:C.greenLt, color:C.green, fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:20, flexShrink:0 }}>{post.flair}</span>
          </div>
          <h3 style={{ margin:"0 0 8px", fontSize:15, fontWeight:700, color:C.ink, lineHeight:1.35, cursor:"pointer" }}
            onClick={() => { play("open"); setViewing(post.id); }}>
            {post.title}
          </h3>
          <p style={{ margin:"0 0 14px", fontSize:13, color:C.mid, lineHeight:1.6, fontFamily:"Georgia,serif" }}>
            {post.body.length>160 ? post.body.slice(0,160)+"…" : post.body}
          </p>
          <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
            <button
              type="button"
              aria-pressed={myVotes[post.id] === 1}
              onClick={() => handleVote(post.id, 1)}
              style={{ ...voteBtn(myVotes[post.id] === 1, C.green, C.greenLt), padding:"5px 10px", fontSize:12 }}>
              ▲ {post.votes}
            </button>
            <button
              type="button"
              aria-pressed={myVotes[post.id] === -1}
              onClick={() => handleVote(post.id, -1)}
              style={{ ...voteBtn(myVotes[post.id] === -1, C.red, "#fdf2f2"), padding:"5px 10px", fontSize:12 }}>
              ▼
            </button>
            <button onClick={() => { play("open"); setViewing(post.id); }}
              style={{ background:"none", border:"none", cursor:"pointer", fontSize:12, color:C.muted, fontFamily:"Georgia,serif" }}>
              <span style={{ display:"inline-flex", alignItems:"center", gap:5 }}>
                {Ic.chat("none",C.muted,14)} {post.comments.length}
              </span>
            </button>
          </div>
        </div>
      ))}

      {!loading && posts.length === 0 && (
        <div style={{ textAlign:"center", padding:"60px 20px", color:C.muted, fontFamily:"Georgia,serif", fontStyle:"italic" }}>
          No posts yet. Be the first to share something.
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from "react";
import { C, S } from "../systems/theme";
import { Ic } from "../icons/Ic";
import { usePostIt } from "../systems/usePostIt";

const DRAFT_KEY = "life_postit_draft";

export function PostItFeed({ play, user }) {
  const { posts, addPost, addComment, vote, loading, error, reload } = usePostIt(user);

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

  const sorted = [...posts].sort((a,b) =>
    sort==="votes"    ? b.votes - a.votes
    : sort==="trending" ? (b.votes + b.comments.length*3) - (a.votes + a.comments.length*3)
    : new Date(b.created_at||0) - new Date(a.created_at||0)
  );

  const handleVote = (id, dir) => { play("tap"); vote(id, dir); };

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    play("ok");
    addComment(viewing, commentText);
    setCommentText("");
  };

  const handleSubmitPost = () => {
    if (!newTitle.trim()) return;
    play("ok");
    addPost({ title: newTitle, body: newBody, flair: newFlair });
    setNewTitle(""); setNewBody(""); setShowCompose(false);
  };

  // ── DETAIL VIEW ──────────────────────────────────────────
  const vp = posts.find(p => p.id === viewing);
  if (vp) return (
    <div style={{ padding:"20px 24px", maxWidth:620, margin:"0 auto" }}>
      <button onClick={() => setViewing(null)}
        style={{ background:"none", border:"none", cursor:"pointer", color:C.muted, fontSize:13, padding:"0 0 16px", fontFamily:"Georgia,serif" }}>
        ← Back to Feed
      </button>
      <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:14, padding:24 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
          <div style={{ width:32, height:32, borderRadius:"50%", background:C.ink, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <span style={{ color:C.white, fontSize:11, fontWeight:700 }}>{vp.author?.slice(0,2)}</span>
          </div>
          <span style={{ fontSize:13, fontWeight:600, color:C.ink }}>{vp.author}</span>
          <span style={{ fontSize:11, color:C.muted, marginLeft:4 }}>{vp.time}</span>
          <span style={{ marginLeft:"auto", background:C.greenLt, color:C.green, fontSize:10, fontWeight:700, padding:"3px 10px", borderRadius:20 }}>{vp.flair}</span>
        </div>
        <h2 style={{ fontSize:19, fontWeight:700, color:C.ink, margin:"0 0 12px", lineHeight:1.35 }}>{vp.title}</h2>
        <p style={{ fontSize:15, color:C.mid, lineHeight:1.8, margin:"0 0 20px", fontFamily:"Georgia,serif" }}>{vp.body}</p>
        <div style={{ display:"flex", gap:10, borderTop:`1px solid ${C.light}`, paddingTop:14 }}>
          <button onClick={() => handleVote(vp.id, 1)}
            style={{ background:"none", border:`1px solid ${C.border}`, borderRadius:8, padding:"6px 12px", cursor:"pointer", fontSize:13, color:C.green }}>
            ▲ {vp.votes}
          </button>
          <button onClick={() => handleVote(vp.id, -1)}
            style={{ background:"none", border:`1px solid ${C.border}`, borderRadius:8, padding:"6px 12px", cursor:"pointer", fontSize:13, color:C.red }}>
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
            <div style={{ width:28, height:28, borderRadius:"50%", background:C.light, border:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <span style={{ fontSize:10, fontWeight:700, color:C.mid }}>{c.author?.slice(0,2)}</span>
            </div>
            <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:10, padding:"10px 14px", flex:1 }}>
              <span style={{ fontSize:12, fontWeight:600, color:C.ink }}>{c.author}</span>
              <span style={{ fontSize:11, color:C.muted, marginLeft:8 }}>{c.time}</span>
              <p style={{ margin:"5px 0 0", fontSize:14, color:C.mid, fontFamily:"Georgia,serif", lineHeight:1.6 }}>{c.text}</p>
            </div>
          </div>
        ))}
        <div style={{ display:"flex", gap:10, marginTop:8 }}>
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

  // ── FEED VIEW ────────────────────────────────────────────
  return (
    <div style={{ padding:"20px 24px", maxWidth:620, margin:"0 auto" }}>
      {error && (
        <div style={{ background:"#fdf2f2", border:`1px solid ${C.red}`, borderRadius:12, padding:"14px 16px", marginBottom:16, fontSize:13, color:C.ink, lineHeight:1.6 }}>
          <strong style={{ display:"block", marginBottom:4 }}>Could not load the feed</strong>
          <span style={{ color:C.mid }}>{error}</span>
          <button type="button" onClick={() => reload()} style={{ display:"block", marginTop:10, background:C.white, border:`1px solid ${C.border}`, borderRadius:8, padding:"8px 14px", cursor:"pointer", fontFamily:"Georgia,serif", fontSize:13 }}>
            Try again
          </button>
        </div>
      )}
      <div style={{ display:"flex", alignItems:"center", marginBottom:20 }}>
        <h2 style={{ margin:0, fontSize:22, fontWeight:700, color:C.ink, flex:1 }}>Post-It</h2>
        {loading && <span style={{ fontSize:11, color:C.muted, fontStyle:"italic", marginRight:12 }}>Syncing…</span>}
        <button onClick={() => setShowCompose(true)}
          style={{ background:C.green, border:"none", borderRadius:10, padding:"10px 18px", color:C.white, fontSize:22, fontWeight:300, cursor:"pointer", lineHeight:1 }}>
          +
        </button>
      </div>

      {showCompose && (
        <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:14, padding:24, marginBottom:20 }}>
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
          <div style={{ display:"flex", gap:10 }}>
            <button onClick={handleSubmitPost}
              style={{ flex:1, background:C.green, border:"none", borderRadius:10, padding:"13px", color:C.white, fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"Georgia,serif" }}>
              Post
            </button>
            <button onClick={() => setShowCompose(false)}
              style={{ background:"none", border:`1px solid ${C.border}`, borderRadius:10, padding:"13px 20px", color:C.muted, fontSize:14, cursor:"pointer" }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <div style={{ display:"flex", gap:8, marginBottom:20 }}>
        {["recent","trending","votes"].map(s => (
          <button key={s} onClick={() => { play("tap"); setSort(s); }}
            style={{ background:sort===s?C.ink:C.white, border:`1px solid ${C.border}`, borderRadius:20,
              padding:"7px 16px", fontSize:12, fontWeight:sort===s?700:400,
              color:sort===s?C.white:C.muted, cursor:"pointer", textTransform:"capitalize" }}>
            {s==="votes" ? "Top" : s.charAt(0).toUpperCase()+s.slice(1)}
          </button>
        ))}
      </div>

      {sorted.map(post => (
        <div key={post.id} className="life-card-hover" style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:14, padding:20, marginBottom:12, boxShadow:S.sm, transition:"box-shadow 0.25s ease, border-color 0.2s ease" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
            <div style={{ width:28, height:28, borderRadius:"50%", background:C.ink, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <span style={{ color:C.white, fontSize:10, fontWeight:700 }}>{post.author?.slice(0,2)}</span>
            </div>
            <span style={{ fontSize:12, color:C.muted }}>{post.time}</span>
            <span style={{ marginLeft:"auto", background:C.greenLt, color:C.green, fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:20 }}>{post.flair}</span>
          </div>
          <h3 style={{ margin:"0 0 8px", fontSize:15, fontWeight:700, color:C.ink, lineHeight:1.35, cursor:"pointer" }}
            onClick={() => { play("tap"); setViewing(post.id); }}>
            {post.title}
          </h3>
          <p style={{ margin:"0 0 14px", fontSize:13, color:C.mid, lineHeight:1.6, fontFamily:"Georgia,serif" }}>
            {post.body.length>160 ? post.body.slice(0,160)+"…" : post.body}
          </p>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            <button onClick={() => handleVote(post.id, 1)}
              style={{ background:"none", border:`1px solid ${C.border}`, borderRadius:8, padding:"5px 10px", cursor:"pointer", fontSize:12, color:C.green }}>
              ▲ {post.votes}
            </button>
            <button onClick={() => handleVote(post.id, -1)}
              style={{ background:"none", border:`1px solid ${C.border}`, borderRadius:8, padding:"5px 10px", cursor:"pointer", fontSize:12, color:C.red }}>
              ▼
            </button>
            <button onClick={() => { play("tap"); setViewing(post.id); }}
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
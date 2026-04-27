"use client";
import { useState } from "react";
import { mergeFirebaseProfile } from "../../services/firebaseProfile";

const SF = "-apple-system,'SF Pro Display','SF Pro Text','Helvetica Neue',Arial,sans-serif";

export function PreferredNamePage({ C, play, userId, onContinue }) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  const handleContinue = async () => {
    if (saving) return;
    play?.("ok");
    setSaving(true);
    try {
      if (userId && name.trim()) {
        await mergeFirebaseProfile(userId, { preferred_name: name.trim() });
      }
    } catch { /* non-blocking */ }
    finally { setSaving(false); }
    onContinue();
  };

  return (
    <div
      data-page-tag="#preferred_name_page"
      style={{
        minHeight:"100dvh", background: C.skin,
        display:"flex", flexDirection:"column",
        alignItems:"center", justifyContent:"center",
        padding:"max(48px,calc(32px + var(--safe-top,0px))) 24px max(40px,calc(24px + var(--safe-bottom,0px)))",
        boxSizing:"border-box", fontFamily:SF,
      }}
    >
      <div style={{ width:"100%", maxWidth:360, display:"flex", flexDirection:"column", gap:28 }}>
        {/* Heading */}
        <div style={{ textAlign:"center" }}>
          <div style={{ fontSize:48, marginBottom:16 }}>👋</div>
          <h1 style={{ margin:"0 0 10px", fontSize:28, fontWeight:700, color:C.ink, letterSpacing:"-0.03em", lineHeight:1.15, fontFamily:SF }}>
            What should we call you?
          </h1>
          <p style={{ margin:0, fontSize:15, color:C.muted, lineHeight:1.6, fontFamily:SF }}>
            We'll use this to personalise your experience
          </p>
        </div>

        {/* Input */}
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Keanu or Keanu Reeves"
          autoFocus
          enterKeyHint="done"
          onKeyDown={(e) => { if (e.key === "Enter" && name.trim()) handleContinue(); }}
          style={{
            background:C.white, border:`1.5px solid ${name.trim() ? C.green : C.border}`,
            borderRadius:14, padding:"16px 18px",
            fontSize:18, color:C.ink, outline:"none",
            fontFamily:SF, boxSizing:"border-box", width:"100%",
            transition:"border-color 0.2s ease",
          }}
        />

        {/* Continue button */}
        <button
          type="button"
          onClick={handleContinue}
          disabled={!name.trim() || saving}
          style={{
            width:"100%", height:54, borderRadius:14,
            background: name.trim() ? C.green : C.light,
            color: name.trim() ? "#000" : C.muted,
            border:"none", fontSize:17, fontWeight:700,
            cursor: name.trim() && !saving ? "pointer" : "default",
            fontFamily:SF, letterSpacing:"-0.01em",
            transition:"all 0.25s cubic-bezier(0.34,1.56,0.64,1)",
            WebkitTapHighlightColor:"transparent",
          }}
          onTouchStart={(e) => { if (name.trim()) e.currentTarget.style.transform = "scale(0.97)"; }}
          onTouchEnd={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
          onMouseDown={(e) => { if (name.trim()) e.currentTarget.style.transform = "scale(0.97)"; }}
          onMouseUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
        >
          {saving ? "Saving…" : "Continue"}
        </button>

        {/* Skip */}
        <button
          type="button"
          onClick={() => { play?.("tap"); onContinue(); }}
          style={{
            background:"none", border:"none", color:C.muted,
            fontSize:14, cursor:"pointer", fontFamily:SF,
            textAlign:"center", padding:"4px 0",
            WebkitTapHighlightColor:"transparent",
          }}
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}

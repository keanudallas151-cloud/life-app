import { useEffect, useRef } from "react";
import { FONT } from "./constants.js";

export function ScoreScreen({ score, total, color, customMsg, onReplay, onClose, t, play }) {
  const pct = Math.round((score / total) * 100);
  const iconPath = pct === 100
    ? <><path d="M6 9a6 6 0 0012 0V4H6v5z"/><path d="M6 4H3v3a3 3 0 003 3"/><path d="M18 4h3v3a3 3 0 01-3 3"/><path d="M9 21h6"/><path d="M12 15v6"/></>
    : pct >= 70
      ? <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26 12,2"/>
      : pct >= 50
        ? <><circle cx="12" cy="12" r="10"/><polyline points="16,10 11,15 8,12"/></>
        : <><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></>;
  const played = useRef(false);
  useEffect(() => {
    if (played.current) return;
    played.current = true;
    if (pct === 100) { play?.("level_up"); setTimeout(() => play?.("streak_5"), 350); }
    else if (pct >= 60) play?.("word_correct");
    else play?.("word_wrong");
  }, [pct, play]);
  const confettiColors = ["#FF6B6B","#FFD93D","#6BCB77","#4D96FF","#FF6FF2","#FF9E4F","#A0F0A0","#B388FF","#FFB347","#4FC3F7","#FF80AB","#69F0AE"];
  return (
    <div style={{ padding: "32px 24px", textAlign: "center", fontFamily: FONT }}>
      {pct === 100 && (
        <div style={{ position: "relative", height: 0, overflow: "visible" }}>
          {confettiColors.map((c, i) => (
            <div key={i} style={{
              position: "absolute",
              left: `${8 + (i * 7.5)}%`,
              top: 0,
              width: 10,
              height: 10,
              borderRadius: i % 2 === 0 ? "50%" : 2,
              background: c,
              animation: `confettiFall ${1.2 + (i % 4) * 0.2}s ease-in ${(i % 5) * 0.12}s both`,
              pointerEvents: "none",
            }} />
          ))}
        </div>
      )}
      <div style={{ position: "relative", width: 120, height: 120, margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `3px solid ${color}`, animation: "scoreRing 2s ease-in-out infinite" }} />
        <div style={{ width: 100, height: 100, borderRadius: "50%", background: t?.white || "#111111", border: `3px solid ${color}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{iconPath}</svg>
        </div>
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color: t?.ink || "#ededed", letterSpacing: "-0.04em", marginBottom: 6 }}>
        {score}/{total}
      </div>
      <div style={{ fontSize: 14, color, fontWeight: 600, marginBottom: 8 }}>{customMsg || "Score"}</div>
      <div style={{ display: "inline-flex", padding: "6px 16px", borderRadius: 999, background: pct >= 70 ? `${color}18` : t?.light || "rgba(255,255,255,0.07)", border: `1px solid ${pct >= 70 ? color + "40" : t?.border || "rgba(255,255,255,0.1)"}`, fontSize: 13, color: pct >= 70 ? color : t?.muted || "#a1a1a1", fontWeight: 600, marginBottom: 28 }}>
        {pct >= 90 ? "Outstanding!" : pct >= 70 ? "Great work!" : pct >= 50 ? "Keep going!" : "Practice makes perfect"}
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        <button type="button" onClick={onReplay} style={{ flex: 1, padding: "13px", background: t?.light || `${color}18`, color: t?.ink || color, border: `1px solid ${t?.border || color + "40"}`, borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: FONT }}>↺ Again</button>
        <button type="button" onClick={onClose} style={{ flex: 1, padding: "13px", background: t?.light || "rgba(255,255,255,0.07)", color: t?.ink || "#ededed", border: `1px solid ${t?.border || "rgba(255,255,255,0.12)"}`, borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: FONT }}>Done</button>
      </div>
    </div>
  );
}

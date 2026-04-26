import { useEffect, useRef } from "react";
import { FONT } from "./constants.js";

export function GameModal({ children, onClose, color, title, t, play }) {
  const contentRef = useRef(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    play?.("game_start");
    if (contentRef.current) contentRef.current.scrollTop = 0;
    return () => { document.body.style.overflow = ""; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: 1000,
      background: `radial-gradient(ellipse at 70% 20%, ${color}0a 0%, transparent 60%), ${t?.skin || "#0a0a0a"}`,
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      animation: "gmSlideUp 0.42s cubic-bezier(0.34,1.1,0.64,1) both",
      transformOrigin: "bottom center",
    }}>
      <style>{`
        @keyframes gmSlideUp {
          from { transform: translateY(100%); opacity: 0.4; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes gmBgSweep {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes questionIn {
          from { opacity: 0; transform: translateX(36px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes timerPulse {
          0%,100% { transform: scale(1); }
          50%     { transform: scale(1.15); }
        }
        @keyframes cardGlowPulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(229,72,77,0.0); }
          50%     { box-shadow: 0 0 0 3px rgba(229,72,77,0.35); }
        }
        @keyframes streakPulseAnim {
          0%,100% { transform: scale(1); }
          50%     { transform: scale(1.08); }
        }
        @keyframes streakFlash {
          0%   { opacity: 0; }
          25%  { opacity: 0.6; }
          100% { opacity: 0; }
        }
        @keyframes confettiBurst {
          0%   { transform: translate(0,0) scale(0.4) rotate(0deg); opacity: 1; }
          70%  { opacity: 1; }
          100% { transform: translate(var(--cb-x), var(--cb-y)) scale(1) rotate(var(--cb-rot,720deg)); opacity: 0; }
        }
        @keyframes iconBounce {
          0%   { transform: scale(0.4); opacity: 0; }
          55%  { transform: scale(1.18); opacity: 1; }
          80%  { transform: scale(0.96); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes ripple {
          0%   { transform: scale(0); opacity: 0.45; }
          100% { transform: scale(2.6); opacity: 0; }
        }
        @keyframes letterDrop {
          0%   { opacity: 0; transform: translateY(-6px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes vocabFlip360 {
          0%   { transform: rotateY(0deg); }
          100% { transform: rotateY(360deg); }
        }
        @keyframes vocabHorizShake {
          0%,100% { transform: translateX(0); }
          20%,60% { transform: translateX(-6px); }
          40%,80% { transform: translateX(6px); }
        }
        @keyframes fillGapShake {
          0%,100% { transform: translateX(0); }
          20%,60% { transform: translateX(-7px); }
          40%,80% { transform: translateX(7px); }
        }
        @keyframes correctBurst {
          0%   { opacity: 0; transform: translateY(-20px) scale(0.6); }
          40%  { opacity: 1; transform: translateY(4px) scale(1.08); }
          70%  { transform: translateY(0) scale(1); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes tipSlideUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes tileFlip {
          0%   { transform: scaleY(1); }
          50%  { transform: scaleY(0); }
          100% { transform: scaleY(1); }
        }
        @keyframes streakPop {
          from { opacity: 0; transform: scale(0.6); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes timerRingAnim {
          from { stroke-dashoffset: 0; }
          to   { stroke-dashoffset: 188; }
        }
        @keyframes popIn {
          0%   { transform: scale(0.85); opacity: 0; }
          60%  { transform: scale(1.08); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes rowShake {
          0%,100% { transform: translateX(0); }
          15%,45%,75% { transform: translateX(-8px); }
          30%,60%,90% { transform: translateX(8px); }
        }
        @keyframes bounceTile {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-12px); }
        }
        @keyframes roundComplete {
          0%   { opacity: 0; transform: scale(0.7) translateY(-20px); }
          60%  { opacity: 1; transform: scale(1.05) translateY(4px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes scoreRing {
          0%,100% { transform: scale(1); opacity: 0.6; }
          50%     { transform: scale(1.12); opacity: 0; }
        }
        @keyframes confettiFall {
          0%   { transform: translateY(-40px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(220px) rotate(720deg); opacity: 0; }
        }
      `}</style>
      {/* Header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 20px",
        borderBottom: `1px solid ${color}30`,
        background: t?.white || "#111111",
      }}>
        <button
          type="button"
          onClick={() => { play?.("back_game"); onClose(); }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "none",
            border: "none",
            cursor: "pointer",
            color: color || t?.green,
            fontSize: 16,
            fontWeight: 600,
            fontFamily: FONT,
            padding: 0,
            WebkitTapHighlightColor: "transparent",
          }}
        >
          <svg width="10" height="18" viewBox="0 0 10 18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 1 1 9 9 17" />
          </svg>
          Back
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, justifyContent: "center", marginLeft: "-50px" }}>
          <div style={{ width: 3, height: 20, borderRadius: 999, background: color, flexShrink: 0 }} />
          <span style={{ fontSize: 17, fontWeight: 700, color: t?.ink || "#ededed", fontFamily: FONT, letterSpacing: "-0.02em" }}>{title}</span>
        </div>
        <div style={{ width: 50 }} />
      </div>
      {/* Content */}
      <div ref={contentRef} style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
        {children}
      </div>
    </div>
  );
}

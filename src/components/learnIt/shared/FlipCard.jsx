import { useState, useEffect } from "react";
import { FONT } from "./constants.js";

export function FlipCard({ game, color, lightColor, borderColor, index, onPlay }) {
  const [flipped, setFlipped] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), index * 65);
    return () => clearTimeout(t);
  }, [index]);

  return (
    <div
      style={{
        perspective: "1000px",
        opacity: mounted ? 1 : 0,
        transform: mounted ? "translateY(0) scale(1)" : "translateY(16px) scale(0.94)",
        transition: `opacity 0.35s ease ${index * 65}ms, transform 0.4s cubic-bezier(0.34,1.56,0.64,1) ${index * 65}ms`,
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "1 / 1.05",
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          transition: "transform 0.5s cubic-bezier(0.34,1.56,0.64,1)",
          cursor: "pointer",
        }}
        onClick={() => setFlipped(!flipped)}
      >
        {/* FRONT */}
        <div style={{
          position: "absolute",
          inset: 0,
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
          background: "rgba(255,255,255,0.045)",
          border: `1px solid ${borderColor}`,
          borderRadius: 22,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "18px 14px 34px",
          gap: 10,
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          boxShadow: `0 4px 20px rgba(0,0,0,0.15)`,
        }}>
          {/* Type badge */}
          <div style={{
            position: "absolute",
            top: 12,
            right: 12,
            padding: "3px 8px",
            borderRadius: 999,
            background: lightColor,
            border: `1px solid ${borderColor}`,
            fontSize: 9,
            fontWeight: 700,
            color: color,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            fontFamily: FONT,
          }}>
            {game.type}
          </div>

          <div style={{ fontSize: 32, lineHeight: 1 }}>{game.icon}</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#ededed", textAlign: "center", fontFamily: FONT, letterSpacing: "-0.02em" }}>
            {game.title}
          </div>
          <div style={{
            fontSize: 12,
            color: "rgba(161,161,161,0.7)",
            textAlign: "center",
            lineHeight: 1.5,
            fontFamily: FONT,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            padding: "0 4px",
          }}>
            {game.desc}
          </div>

          {/* Tap hint — subtle pulsing dot, Apple-style */}
          <div
            aria-hidden="true"
            className="life-flipcard-hint"
            style={{
              position: "absolute",
              bottom: 10,
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              alignItems: "center",
              gap: 5,
              pointerEvents: "none",
            }}
          >
            <span
              style={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: color,
                boxShadow: `0 0 0 0 ${color}`,
                animation: "life-flipcard-hint-pulse 1.8s ease-in-out infinite",
              }}
            />
            <span style={{
              fontSize: 9.5,
              color: color,
              fontFamily: FONT,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              opacity: 0.55,
            }}>flip</span>
          </div>
        </div>

        {/* BACK */}
        <div style={{
          position: "absolute",
          inset: 0,
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
          transform: "rotateY(180deg)",
          background: `linear-gradient(160deg, ${lightColor.replace("0.12","0.18")} 0%, rgba(255,255,255,0.04) 100%)`,
          border: `1.5px solid ${color}60`,
          borderRadius: 22,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "14px 12px",
          gap: 8,
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          boxShadow: `0 4px 28px ${color}25`,
        }}>
          <div style={{ fontSize: 26, lineHeight: 1 }}>{game.icon}</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#ededed", textAlign: "center", fontFamily: FONT }}>
            Ready to play?
          </div>
          <div style={{ fontSize: 11, color: "rgba(161,161,161,0.7)", textAlign: "center", lineHeight: 1.4, fontFamily: FONT, padding: "0 4px" }}>
            {game.desc}
          </div>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onPlay(game.id); }}
            style={{
              marginTop: 2,
              padding: "8px 20px",
              background: color,
              color: "#000",
              border: "none",
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: FONT,
              letterSpacing: "-0.01em",
              boxShadow: `0 4px 16px ${color}40`,
              transition: "transform 0.15s cubic-bezier(0.34,1.56,0.64,1)",
              WebkitTapHighlightColor: "transparent",
            }}
            onMouseDown={(e) => { e.currentTarget.style.transform = "scale(0.94)"; }}
            onMouseUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
            onTouchStart={(e) => { e.currentTarget.style.transform = "scale(0.94)"; }}
            onTouchEnd={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
          >
            ▶ Play
          </button>
        </div>
      </div>
    </div>
  );
}

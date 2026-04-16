import { useMemo } from "react";
import { S } from "../systems/theme";
import { getResumeTopic } from "../systems/resumeReading";
import { MAP } from "../data/content";

export function HomePage({ t, onResume }) {
  const resumeTopic = useMemo(() => {
    const saved = getResumeTopic();
    if (!saved?.key || !MAP[saved.key]) return null;
    return { key: saved.key, label: MAP[saved.key].node?.label || saved.key };
  }, []);

  return (
    <div
      style={{
        paddingBottom: "calc(60px + env(safe-area-inset-bottom, 0px))",
      }}
    >
      <div
        className="life-grain life-home-hero"
        style={{
          minHeight: "calc(100svh - 132px - env(safe-area-inset-top, 0px))",
          padding: "72px 24px 64px",
          textAlign: "center",
          background: `linear-gradient(180deg, ${t.skin} 0%, #ebe4d6 100%)`,
          position: "relative",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -60,
            right: -60,
            width: 200,
            height: 200,
            borderRadius: "50%",
            border: "1.5px solid rgba(74,140,92,0.1)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -80,
            left: -40,
            width: 160,
            height: 160,
            borderRadius: "50%",
            border: "1.5px solid rgba(74,140,92,0.08)",
            pointerEvents: "none",
          }}
        />
        <div style={{ maxWidth: 580, width: "100%", position: "relative" }}>
          <p
            style={{
              margin: "0 0 14px",
              fontSize: "clamp(0.72rem, 2.8vw, 0.9rem)",
              fontWeight: 700,
              letterSpacing: "0.32em",
              textTransform: "uppercase",
              color: t.green,
              lineHeight: 1.2,
            }}
          >
            Welcome to
          </p>
          <h1
            style={{
              margin: "0 0 18px",
              fontSize: "clamp(3.6rem, 16vw, 6.4rem)",
              fontWeight: 800,
              color: t.ink,
              fontFamily: "Nunito, sans-serif",
              letterSpacing: "-0.04em",
              lineHeight: 0.92,
              WebkitTextSizeAdjust: "100%",
            }}
          >
            Life.
          </h1>
          <p
            style={{
              color: t.mid,
              fontSize: "clamp(1rem, 3.8vw, 1.18rem)",
              lineHeight: 1.7,
              margin: "0 auto 28px",
              maxWidth: 460,
              fontFamily: "Georgia,serif",
              fontStyle: "italic",
            }}
          >
            The first million is the hardest, the second is imminent
          </p>

          {/* Resume Reading Card */}
          {resumeTopic && (
            <button
              onClick={() => onResume(resumeTopic.key)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                width: "100%",
                maxWidth: 460,
                margin: "0 auto 24px",
                padding: "16px 20px",
                background: t.white,
                border: `1.5px solid ${t.green}44`,
                borderRadius: 16,
                cursor: "pointer",
                textAlign: "left",
                transition: "box-shadow 0.2s",
                boxShadow: S.sm,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: `${t.green}18`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={t.green} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
                </svg>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: t.green }}>
                  Continue Reading
                </p>
                <p style={{ margin: "4px 0 0", fontSize: 15, fontWeight: 600, color: t.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {resumeTopic.label}
                </p>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={t.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          )}

          <div
            style={{
              maxWidth: 560,
              margin: "0 auto",
              background: `linear-gradient(135deg, ${t.white} 0%, ${t.greenLt} 100%)`,
              border: `1px solid rgba(74,140,92,0.22)`,
              borderRadius: 22,
              padding: "28px 24px",
              boxShadow: S.md,
            }}
          >
            <p
              style={{
                margin: "0 0 10px",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: 2.5,
                textTransform: "uppercase",
                color: t.green,
              }}
            >
              From the author
            </p>
            <p
              style={{
                margin: 0,
                color: t.mid,
                fontSize: 15,
                lineHeight: 1.9,
                fontFamily: "Georgia,serif",
              }}
            >
              I built Life. to make money, growth, and opportunity
              feel less hidden and less confusing. This should be a
              place where you can learn clearly, move with purpose,
              and build toward something real. Let&apos;s get rich.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

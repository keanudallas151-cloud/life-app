import { useMemo, useState } from "react";
import { S } from "../systems/theme";
import { getResumeTopic, clearResumeTopic } from "../systems/resumeReading";
import { MAP } from "../data/content";

export function HomePage({
  t,
  onResume,
  onOpenQuiz,
  onOpenDailyGrowth,
  onOpenMomentumHub,
  onGetStarted,
}) {
  const [dismissed, setDismissed] = useState(false);
  const resumeTopic = useMemo(() => {
    const saved = getResumeTopic();
    if (!saved?.key || !MAP[saved.key]) return null;
    return { key: saved.key, label: MAP[saved.key].node?.label || saved.key };
  }, []);

  const handleDismissResume = (e) => {
    e.stopPropagation();
    e.preventDefault();
    clearResumeTopic();
    setDismissed(true);
  };

  return (
    <div style={{ paddingBottom: "calc(60px + env(safe-area-inset-bottom, 0px))" }}>
      {/* HERO SECTION */}
      <div
        className="life-grain life-home-hero"
        style={{
          padding: "64px 22px 56px",
          textAlign: "center",
          background: `linear-gradient(180deg, ${t.skin} 0%, ${t.light} 100%)`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative circles */}
        <div aria-hidden style={{
          position: "absolute", top: -70, right: -60, width: 220, height: 220,
          borderRadius: "50%", border: `1.5px solid ${t.green}1a`, pointerEvents: "none",
        }} />
        <div aria-hidden style={{
          position: "absolute", bottom: -90, left: -50, width: 180, height: 180,
          borderRadius: "50%", border: `1.5px solid ${t.green}14`, pointerEvents: "none",
        }} />

        <div style={{ maxWidth: 580, width: "100%", position: "relative", margin: "0 auto" }}>
          <p style={{
            margin: "0 0 14px",
            fontSize: "clamp(0.72rem, 2.8vw, 0.9rem)",
            fontWeight: 700,
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            color: t.green,
            lineHeight: 1.2,
          }}>
            Welcome to
          </p>
          <h1 style={{
            margin: "0 0 22px",
            fontSize: "clamp(3.6rem, 16vw, 6.4rem)",
            fontWeight: 800,
            color: t.ink,
            fontFamily: "Nunito, sans-serif",
            letterSpacing: "-0.04em",
            lineHeight: 0.92,
            WebkitTextSizeAdjust: "100%",
          }}>
            Life.
          </h1>

          {/* Tagline — now with quote marks */}
          <blockquote style={{
            color: t.mid,
            fontSize: "clamp(1rem, 3.8vw, 1.18rem)",
            lineHeight: 1.6,
            margin: "0 auto 32px",
            maxWidth: 480,
            fontFamily: "Georgia,serif",
            fontStyle: "italic",
            position: "relative",
            padding: "0 22px",
          }}>
            <span aria-hidden style={{
              position: "absolute", left: 0, top: -8, fontSize: 32,
              color: t.green, opacity: 0.45, lineHeight: 1, fontFamily: "Georgia,serif",
            }}>&ldquo;</span>
            The first million is the hardest, the second is imminent.
            <span aria-hidden style={{
              display: "inline-block", marginLeft: 3, fontSize: 22,
              color: t.green, opacity: 0.45, verticalAlign: "sub", lineHeight: 0.5,
              fontFamily: "Georgia,serif",
            }}>&rdquo;</span>
          </blockquote>

          {/* PRIMARY CTA — Let's Get Started */}
          <button
            type="button"
            onClick={onGetStarted}
            className="life-card-hover"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              margin: "0 auto 36px",
              padding: "16px 32px",
              background: `linear-gradient(135deg, ${t.green}, #3a7d4a)`,
              color: "#fff",
              border: "none",
              borderRadius: 999,
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: 0.3,
              fontFamily: "Georgia,serif",
              cursor: "pointer",
              boxShadow: "0 10px 28px rgba(74,140,92,0.35), 0 2px 6px rgba(74,140,92,0.2)",
              minHeight: 52,
              minWidth: 220,
            }}
          >
            Let&apos;s Get Started
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>
      </div>

      {/* CONTENT SECTION */}
      <div style={{ padding: "28px 20px 0", maxWidth: 620, margin: "0 auto" }}>

        {/* CONTINUE READING */}
        {resumeTopic && !dismissed && (
          <div style={{
            position: "relative",
            marginBottom: 24,
            background: t.white,
            border: `1.5px solid ${t.green}33`,
            borderRadius: 18,
            boxShadow: S.sm,
            overflow: "hidden",
          }}>
            <button
              type="button"
              onClick={() => onResume(resumeTopic.key)}
              aria-label={`Continue reading ${resumeTopic.label}`}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "16px 52px 16px 18px",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
                fontFamily: "inherit",
                color: "inherit",
              }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: `${t.green}18`,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={t.green} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
                </svg>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  margin: 0, fontSize: 11, fontWeight: 700,
                  letterSpacing: 1.5, textTransform: "uppercase", color: t.green,
                }}>
                  Continue Reading
                </p>
                <p style={{
                  margin: "4px 0 0", fontSize: 15, fontWeight: 600, color: t.ink,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {resumeTopic.label}
                </p>
              </div>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                   stroke={t.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                   style={{ flexShrink: 0 }}>
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>

            {/* Dismiss × — own click target on top */}
            <button
              type="button"
              onClick={handleDismissResume}
              aria-label="Dismiss continue reading"
              title="Dismiss"
              style={{
                position: "absolute",
                top: 10, right: 10,
                width: 32, height: 32,
                borderRadius: "50%",
                background: `${t.muted}14`,
                border: "none",
                cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: t.mid,
                padding: 0,
                zIndex: 2,
                transition: "background 0.15s ease, color 0.15s ease, transform 0.12s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = `${t.muted}28`;
                e.currentTarget.style.color = t.ink;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = `${t.muted}14`;
                e.currentTarget.style.color = t.mid;
              }}
              onMouseDown={(e) => { e.currentTarget.style.transform = "scale(0.9)"; }}
              onMouseUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        )}

        {/* FROM THE AUTHOR */}
        <div style={{
          position: "relative",
          background: `linear-gradient(135deg, ${t.white} 0%, ${t.greenLt} 100%)`,
          border: `1px solid ${t.green}2b`,
          borderRadius: 22,
          padding: "32px 26px 30px",
          boxShadow: S.md,
          overflow: "hidden",
          marginBottom: 24,
        }}>
          {/* Huge decorative quote mark */}
          <span aria-hidden style={{
            position: "absolute",
            top: 4,
            left: 14,
            fontSize: 110,
            lineHeight: 1,
            color: t.green,
            opacity: 0.12,
            fontFamily: "Georgia,serif",
            fontWeight: 700,
            pointerEvents: "none",
            userSelect: "none",
          }}>&ldquo;</span>

          <p style={{
            margin: "0 0 12px",
            fontSize: 10.5,
            fontWeight: 800,
            letterSpacing: 2.8,
            textTransform: "uppercase",
            color: t.green,
            position: "relative",
          }}>
            A Note From The Author
          </p>

          <p style={{
            margin: "0 0 14px",
            color: t.ink,
            fontSize: 17,
            lineHeight: 1.55,
            fontFamily: "Georgia,serif",
            fontWeight: 500,
            fontStyle: "italic",
            position: "relative",
          }}>
            Most people never learn how money, the mind, or the world
            actually works &mdash; because no one ever shows them.
          </p>
          <p style={{
            margin: 0,
            color: t.mid,
            fontSize: 14.5,
            lineHeight: 1.75,
            fontFamily: "Georgia,serif",
            position: "relative",
          }}>
            Life. is where that changes. Read clearly. Think sharply.
            Move with purpose. Build something real &mdash; one page,
            one habit, one win at a time.
          </p>

          <div style={{
            marginTop: 20,
            paddingTop: 14,
            borderTop: `1px solid ${t.green}22`,
            display: "flex",
            alignItems: "center",
            gap: 10,
            position: "relative",
          }}>
            <span style={{
              display: "inline-block",
              width: 28, height: 2,
              background: t.green,
            }} />
            <span style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 1.6,
              textTransform: "uppercase",
              color: t.green,
              fontFamily: "Georgia,serif",
            }}>
              Let&apos;s get rich.
            </span>
          </div>
        </div>

        {/* QUICK ACTIONS GRID */}
        <p style={{
          margin: "4px 2px 12px",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 2,
          textTransform: "uppercase",
          color: t.muted,
        }}>
          Jump back in
        </p>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: 10,
        }}>
          {[
            { label: "Practice Quiz", desc: "Jump straight into your next round.", onClick: onOpenQuiz },
            { label: "Daily Growth", desc: "Keep your momentum alive today.",     onClick: onOpenDailyGrowth },
            { label: "Momentum Hub", desc: "Review streaks, missions, and wins.", onClick: onOpenMomentumHub },
          ].map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={action.onClick}
              className="life-card-hover"
              style={{
                textAlign: "left",
                background: t.white,
                border: `1px solid ${t.border}`,
                borderRadius: 16,
                padding: "16px 18px",
                boxShadow: S.sm,
                cursor: "pointer",
                fontFamily: "Georgia,serif",
                minHeight: 82,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: 6,
              }}
            >
              <span style={{ fontSize: 13.5, fontWeight: 700, color: t.ink }}>
                {action.label}
              </span>
              <span style={{ fontSize: 12, lineHeight: 1.55, color: t.muted }}>
                {action.desc}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

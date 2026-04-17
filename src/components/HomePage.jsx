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
          background: `linear-gradient(180deg, ${t.skin} 0%, ${t.light} 100%)`,
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

          {/* Resume Reading Card — now with dismiss button */}
          {resumeTopic && !dismissed && (
            <div
              role="group"
              aria-label="Continue reading"
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                gap: 12,
                width: "100%",
                maxWidth: 460,
                margin: "0 auto 24px",
                padding: "16px 44px 16px 20px",
                background: t.white,
                border: `1.5px solid ${t.green}44`,
                borderRadius: 16,
                boxShadow: S.sm,
                boxSizing: "border-box",
              }}
            >
              {/* Main tap area — opens topic */}
              <button
                type="button"
                onClick={() => onResume(resumeTopic.key)}
                aria-label={`Continue reading ${resumeTopic.label}`}
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  margin: 0,
                  borderRadius: 16,
                }}
              />
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
                  pointerEvents: "none",
                  position: "relative",
                  zIndex: 1,
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={t.green} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
                </svg>
              </div>
              <div style={{ flex: 1, minWidth: 0, pointerEvents: "none", position: "relative", zIndex: 1 }}>
                <p style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: t.green }}>
                  Continue Reading
                </p>
                <p style={{ margin: "4px 0 0", fontSize: 15, fontWeight: 600, color: t.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {resumeTopic.label}
                </p>
              </div>
              {/* Dismiss button — lives ABOVE the main tap area */}
              <button
                type="button"
                onClick={handleDismissResume}
                aria-label="Dismiss continue reading"
                title="Dismiss"
                style={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: t.muted,
                  padding: 0,
                  zIndex: 2,
                  flexShrink: 0,
                  transition: "background 0.15s ease, color 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `${t.muted}22`;
                  e.currentTarget.style.color = t.ink;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = t.muted;
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
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
                fontStyle: "italic",
                position: "relative",
                paddingLeft: 24,
                paddingRight: 16,
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  position: "absolute",
                  left: 0,
                  top: -4,
                  fontSize: 42,
                  color: t.green,
                  lineHeight: 1,
                  fontFamily: "Georgia,serif",
                  opacity: 0.5,
                }}
              >&ldquo;</span>
              I built Life. to make money, growth, and opportunity
              feel less hidden and less confusing. This should be a
              place where you can learn clearly, move with purpose,
              and build toward something real. Let&apos;s get rich.
              <span
                aria-hidden="true"
                style={{
                  display: "inline-block",
                  marginLeft: 4,
                  fontSize: 22,
                  color: t.green,
                  lineHeight: 0.6,
                  verticalAlign: "middle",
                  opacity: 0.5,
                }}
              >&rdquo;</span>
            </p>
          </div>
          <div
            style={{
              margin: "18px auto 0",
              maxWidth: 560,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              gap: 10,
            }}
          >
            {[
              {
                label: "Practice Quiz",
                desc: "Jump straight into your next round.",
                onClick: onOpenQuiz,
              },
              {
                label: "Daily Growth",
                desc: "Keep your momentum alive today.",
                onClick: onOpenDailyGrowth,
              },
              {
                label: "Momentum Hub",
                desc: "Review streaks, missions, and wins.",
                onClick: onOpenMomentumHub,
              },
            ].map((action) => (
              <button
                key={action.label}
                type="button"
                onClick={action.onClick}
                style={{
                  textAlign: "left",
                  background: t.white,
                  border: `1px solid ${t.border}`,
                  borderRadius: 16,
                  padding: "16px 18px",
                  boxShadow: S.sm,
                  cursor: "pointer",
                  fontFamily: "Georgia,serif",
                }}
              >
                <span
                  style={{
                    display: "block",
                    marginBottom: 6,
                    fontSize: 13,
                    fontWeight: 700,
                    color: t.ink,
                  }}
                >
                  {action.label}
                </span>
                <span
                  style={{
                    display: "block",
                    fontSize: 12,
                    lineHeight: 1.55,
                    color: t.muted,
                  }}
                >
                  {action.desc}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

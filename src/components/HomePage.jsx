import { useEffect, useMemo, useState } from "react";
import { MAP } from "../data/content";
import { clearResumeTopic, getResumeTopic } from "../systems/resumeReading";
import { S } from "../systems/theme";

function greetingFor(hour) {
  if (hour >= 5 && hour < 12) return "Good Morning";
  if (hour >= 12 && hour < 17) return "Good Afternoon";
  if (hour >= 17 && hour < 22) return "Good Evening";
  return "Good Night";
}

export function HomePage({
  t,
  userName,
  onResume,
  onOpenQuiz,
  onOpenDailyGrowth,
  onOpenMomentumHub,
  onOpenGoalSetting,
  onGetStarted,
  onOpenIncomeIdeas,
}) {
  const [dismissed, setDismissed] = useState(false);
  const resumeTopic = useMemo(() => {
    const saved = getResumeTopic();
    if (!saved?.key || !MAP[saved.key]) return null;
    return { key: saved.key, label: MAP[saved.key].node?.label || saved.key };
  }, []);

  const [greetHour, setGreetHour] = useState(() => new Date().getHours());
  useEffect(() => {
    const id = setInterval(
      () => {
        const h = new Date().getHours();
        setGreetHour((prev) => (prev === h ? prev : h));
      },
      5 * 60 * 1000,
    );
    return () => clearInterval(id);
  }, []);
  const greeting = useMemo(() => greetingFor(greetHour), [greetHour]);
  const firstName = useMemo(() => {
    if (!userName) return "";
    return String(userName).trim().split(/\s+/)[0] || "";
  }, [userName]);

  const handleDismissResume = (e) => {
    e.stopPropagation();
    e.preventDefault();
    clearResumeTopic();
    setDismissed(true);
  };

  return (
    <div
      data-page-tag="#dashboard_home"
      style={{
        minHeight: "100%",
        background: t.skin,
        overflowX: "hidden",
        paddingBottom: "calc(var(--life-bottom-nav-height, 0px) + 16px)",
        boxSizing: "border-box",
      }}
    >
      <div
        className="life-grain life-home-hero"
        style={{
          padding: "40px 22px 44px",
          textAlign: "center",
          background: `linear-gradient(180deg, ${t.skin} 0%, ${t.light} 100%)`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: -70,
            right: -60,
            width: 220,
            height: 220,
            borderRadius: "50%",
            border: `1.5px solid ${t.green}1a`,
            pointerEvents: "none",
          }}
        />
        <div
          aria-hidden
          style={{
            position: "absolute",
            bottom: -90,
            left: -50,
            width: 180,
            height: 180,
            borderRadius: "50%",
            border: `1.5px solid ${t.green}14`,
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            maxWidth: 580,
            width: "100%",
            position: "relative",
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          <p
            style={{
              margin: "0 auto 14px",
              fontSize: "clamp(0.74rem, 2.8vw, 0.92rem)",
              fontWeight: 700,
              letterSpacing: "0.32em",
              textTransform: "uppercase",
              color: t.green,
              lineHeight: 1.2,
              textAlign: "center",
              display: "block",
              width: "100%",
            }}
          >
            {greeting}
            {firstName ? `, ${firstName}` : ""}
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
              WebkitTextSizeAdjust: "230%",
            }}
          >
            Life
            <span
              style={{
                display: "inline-block",
                width: "0.3em",
                height: "0.3em",
                background: t.ink,
                borderRadius: "50%",
                marginLeft: "0.5em",
                verticalAlign: "0.08em",
              }}
            />
          </h1>

          <blockquote
            style={{
              color: t.mid,
              fontSize: "clamp(1rem, 3.8vw, 1.18rem)",
              lineHeight: 1.6,
              margin: "0 auto 32px",
              maxWidth: 480,
              fontFamily: "-apple-system,'SF Pro Display','SF Pro Text','Helvetica Neue',Arial,sans-serif",
              fontStyle: "italic",
              position: "relative",
              padding: "0 22px",
            }}
          >
            <span
              aria-hidden
              style={{
                position: "absolute",
                left: 0,
                top: -8,
                fontSize: 32,
                color: t.green,
                opacity: 0.45,
                lineHeight: 1,
                fontFamily: "-apple-system,'SF Pro Display','SF Pro Text','Helvetica Neue',Arial,sans-serif",
              }}
            >
              &ldquo;
            </span>
            The lack of knowledge is what keeps people poor
            <span
              aria-hidden
              style={{
                display: "inline-block",
                marginLeft: 3,
                fontSize: 22,
                color: t.green,
                opacity: 0.45,
                verticalAlign: "sub",
                lineHeight: 0.5,
                fontFamily: "-apple-system,'SF Pro Display','SF Pro Text','Helvetica Neue',Arial,sans-serif",
              }}
            >
              &rdquo;
            </span>
          </blockquote>

          <div
            style={{
              margin: "0 auto 36px",
              width: "100%",
              maxWidth: 320,
              display: "grid",
              gap: 14,
              justifyItems: "center",
            }}
          >
            <button
              type="button"
              onClick={onGetStarted}
              className="life-card-hover"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                width: "100%",
                padding: "16px 32px",
                background: "transparent",
                color: t.ink,
                border: `1.5px solid ${t.green}`,
                borderRadius: 999,
                fontSize: 16,
                fontWeight: 700,
                letterSpacing: 0.3,
                fontFamily: "-apple-system,'SF Pro Display','SF Pro Text','Helvetica Neue',Arial,sans-serif",
                cursor: "pointer",
                boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
                minHeight: 52,
                minWidth: 220,
              }}
            >
              Let&apos;s Start!
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={t.ink} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>

            <button
              type="button"
              onClick={onOpenIncomeIdeas}
              className="life-card-hover"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                width: "100%",
                padding: "16px 32px",
                background: "transparent",
                color: t.ink,
                border: `1.5px solid ${t.green}`,
                borderRadius: 999,
                fontSize: 16,
                fontWeight: 700,
                letterSpacing: 0.3,
                fontFamily: "-apple-system,'SF Pro Display','SF Pro Text','Helvetica Neue',Arial,sans-serif",
                cursor: "pointer",
                boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
                minHeight: 52,
                minWidth: 220,
              }}
            >
              Let&apos;s Make Money
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={t.ink} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div style={{ padding: "28px 20px 0", maxWidth: 620, margin: "0 auto" }}>
        {resumeTopic && !dismissed && (
          <div
            style={{
              position: "relative",
              marginBottom: 24,
              background: t.white,
              border: `1.5px solid ${t.green}26`,
              borderRadius: 18,
              boxShadow: S.sm,
              overflow: "hidden",
            }}
          >
            <button
              type="button"
              onClick={() => onResume(resumeTopic.key)}
              aria-label={`Continue reading ${resumeTopic.label}`}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "16px 44px 16px 18px",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
                fontFamily: "inherit",
                color: "inherit",
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  background: `${t.green}14`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke={t.green} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
                </svg>
              </div>
              <div style={{ flex: 1, minWidth: 0, paddingRight: 6 }}>
                <p
                  style={{
                    margin: 0,
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: 1.5,
                    textTransform: "uppercase",
                    color: t.green,
                  }}
                >
                  Continue Reading
                </p>
                <p
                  style={{
                    margin: "4px 0 0",
                    fontSize: 15,
                    fontWeight: 600,
                    color: t.ink,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {resumeTopic.label}
                </p>
              </div>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={t.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginRight: 2 }}>
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>

            <button
              type="button"
              onClick={handleDismissResume}
              aria-label="Dismiss continue reading"
              title="Dismiss"
              style={{
                position: "absolute",
                top: 12,
                right: 12,
                width: 24,
                height: 24,
                borderRadius: 999,
                background: `${t.muted}10`,
                border: `1px solid ${t.border}`,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: t.mid,
                padding: 0,
                zIndex: 2,
                transition: "background 0.15s ease, color 0.15s ease, border-color 0.15s ease, transform 0.12s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = `${t.muted}18`;
                e.currentTarget.style.color = t.ink;
                e.currentTarget.style.borderColor = `${t.muted}2a`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = `${t.muted}10`;
                e.currentTarget.style.color = t.mid;
                e.currentTarget.style.borderColor = t.border;
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = "scale(0.92)";
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        )}

        <div
          style={{
            position: "relative",
            background: "linear-gradient(135deg, rgb(10, 10, 10) 0%, rgb(10, 31, 16) 100%)",
            border: "1px solid rgba(80, 200, 120, 0.17)",
            borderRadius: 22,
            padding: "32px 26px 30px",
            boxShadow: "rgba(20, 20, 20, 0.04) 0px 4px 6px, rgba(74, 140, 92, 0.08) 0px 12px 28px, rgba(20, 20, 20, 0.04) 0px 2px 4px",
            overflow: "hidden",
            marginBottom: 24,
          }}
        >
          <span
            aria-hidden="true"
            style={{
              position: "absolute",
              top: 2,
              left: 10,
              fontSize: 90,
              lineHeight: 1,
              color: "rgb(80, 200, 120)",
              opacity: 0.12,
              fontFamily: "-apple-system,'SF Pro Display','SF Pro Text','Helvetica Neue',Arial,sans-serif",
              fontWeight: 100,
              pointerEvents: "none",
              userSelect: "none",
            }}
          >
            “
          </span>
          <p
            style={{
              margin: "0 0 15px",
              fontSize: 10.5,
              fontWeight: 800,
              letterSpacing: 3,
              textTransform: "uppercase",
              color: "rgb(80, 200, 120)",
              position: "absolute",
              top: 23,
              left: 55,
            }}
          >
            The Creation Of Life -
          </p>
          <p
            style={{
              margin: "10px 0 14px",
              color: "rgb(250, 250, 250)",
              fontSize: 17,
              lineHeight: 1.55,
              fontFamily: "-apple-system,'SF Pro Display','SF Pro Text','Helvetica Neue',Arial,sans-serif",
              fontWeight: 500,
              fontStyle: "italic",
              position: "relative",
            }}
          >
            "Becoming Succesful Has Never Been This Easier" - K.C
          </p>
          <p
            style={{
              margin: 0,
              color: "rgb(212, 212, 212)",
              fontSize: 14.5,
              lineHeight: 1.75,
              fontFamily: "-apple-system,'SF Pro Display','SF Pro Text','Helvetica Neue',Arial,sans-serif",
              position: "relative",
            }}
          >
            I love writing, about a year ago I bought my first notebook and called it "Idea #1," a life guide sectioned into categories with sticky notes. A documented notebook of finance, philosophy and lessons learned. Growing up poor, moving to Australia at age 10 with just my mother, I had no one to tell me anything. I would have to figure out life for myself alone. This app is not just another course that wants to steal your money. It is an actual tool I made, a rough life guide with knowledge they don’t teach in school. You are born into a world with invisible handcuffs, modern slavery, but this app releases you. Discover the reality, and find what it takes to survive, network with like-minded individuals, and make decisions. Success has never been this easy, all in one app right at your fingertips.
          </p>
          <div
            style={{
              marginTop: 20,
              paddingTop: 14,
              borderTop: "1px solid rgba(80, 200, 120, 0.133)",
              display: "flex",
              alignItems: "center",
              gap: 10,
              position: "relative",
            }}
          >
            <span style={{ display: "inline-block", width: 28, height: 2, background: "rgb(80, 200, 120)" }} />
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 1.6,
                textTransform: "uppercase",
                color: "rgb(80, 200, 120)",
                fontFamily: "-apple-system,'SF Pro Display','SF Pro Text','Helvetica Neue',Arial,sans-serif",
              }}
            >
              K.C.
            </span>
          </div>
        </div>

        <p
          style={{
            margin: "4px 2px 12px",
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: t.muted,
            textAlign: "center",
            fontFamily: "-apple-system, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif",
            opacity: 0.7,
          }}
        >
          Jump back in
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 10,
          }}
        >
          {[
            { label: "Practice Quiz", desc: "Jump into your next round.", onClick: onOpenQuiz, emoji: "🎯", color: "#3B82F6" },
            { label: "Daily Growth", desc: "Keep momentum alive today.", onClick: onOpenDailyGrowth, emoji: "🌱", color: "#50c878" },
            { label: "Momentum Hub", desc: "Streaks, missions, wins.", onClick: onOpenMomentumHub, emoji: "🔥", color: "#f5a623" },
            { label: "My Goals", desc: "Set and track what matters.", onClick: onOpenGoalSetting, emoji: "🏆", color: "#A855F7" },
          ].map((action, i) => (
            <button
              key={action.label}
              type="button"
              onClick={action.onClick}
              className="life-card-hover"
              style={{
                textAlign: "left",
                background: "rgba(255,255,255,0.04)",
                border: `1px solid rgba(255,255,255,0.07)`,
                borderRadius: 20,
                padding: "16px 16px 14px",
                boxShadow: S.sm,
                cursor: "pointer",
                fontFamily: "-apple-system, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif",
                minHeight: 90,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: 10,
                WebkitTapHighlightColor: "transparent",
                animation: `ios-list-item-in 0.28s ${i * 55}ms cubic-bezier(0.25,1,0.5,1) both`,
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
              }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: 11,
                background: `${action.color}18`,
                border: `1px solid ${action.color}30`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18, lineHeight: 1,
              }}>
                {action.emoji}
              </div>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: t.ink, letterSpacing: "-0.01em", marginBottom: 2 }}>{action.label}</div>
                <div style={{ fontSize: 11.5, lineHeight: 1.45, color: t.muted }}>{action.desc}</div>
              </div>
            </button>
          ))}
        </div>

        <p
          style={{
            margin: "32px auto 8px",
            textAlign: "center",
            fontSize: 11,
            color: t.muted,
            fontFamily: "-apple-system,'SF Pro Display','SF Pro Text','Helvetica Neue',Arial,sans-serif",
            fontStyle: "italic",
            opacity: 0.8,
          }}
        >
          &copy; {new Date().getFullYear()} Life. All rights reserved.
        </p>
      </div>
    </div>
  );
}

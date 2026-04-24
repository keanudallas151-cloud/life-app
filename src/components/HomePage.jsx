import { useEffect, useMemo, useState } from "react";
import { MAP } from "../data/content";
import { clearResumeTopic, getResumeTopic } from "../systems/resumeReading";
import { S } from "../systems/theme";
import { Ic } from "../icons/Ic";
import { LS } from "../systems/storage";

const HABIT_KEY = "life_daily_habits";
const DEFAULT_HABITS = [
  { id: "h1", label: "Drink 2L of water", icon: "💧" },
  { id: "h2", label: "Read for 10 minutes", icon: "📖" },
  { id: "h3", label: "No social media before noon", icon: "🔕" },
  { id: "h4", label: "Write one goal down", icon: "✍️" },
  { id: "h5", label: "Move your body", icon: "🏃" },
];

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function useDailyHabits() {
  const [state, setState] = useState(() => {
    const saved = LS.get(HABIT_KEY, {});
    const today = todayKey();
    return saved.date === today ? saved.checked ?? [] : [];
  });

  const toggle = (id) => {
    setState((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      LS.set(HABIT_KEY, { date: todayKey(), checked: next });
      return next;
    });
  };

  return { checked: state, toggle };
}

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
  const { checked: habitChecked, toggle: toggleHabit } = useDailyHabits();
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
              fontSize: "clamp(6rem, 45vw, 11rem)",
              fontWeight: 800,
              color: t.ink,
              fontFamily: '"New York", Georgia, "Times New Roman", serif',
              letterSpacing: "-0.045em",
              lineHeight: 0.9,
              whiteSpace: "nowrap",
              display: "flex",
              alignItems: "baseline",
              justifyContent: "center",
              gap: "0.25em",
            }}
          >
            <span>Life</span>
            <span
              aria-hidden
              style={{
                display: "inline-block",
                width: "0.22em",
                height: "0.22em",
                background: t.ink,
                borderRadius: "50%",
                alignSelf: "flex-end",
                marginBottom: "0.15em",
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
              onPointerDown={(e) => { e.currentTarget.style.transform = "scale(0.97)"; }}
              onPointerUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
              onPointerCancel={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
              onPointerLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                width: "100%",
                padding: "0 24px",
                background: t.green,
                color: "#000",
                border: "none",
                borderRadius: 14,
                fontSize: 17,
                fontWeight: 600,
                letterSpacing: "-0.01em",
                fontFamily: "-apple-system,'SF Pro Text','Helvetica Neue',Arial,sans-serif",
                cursor: "pointer",
                boxShadow: `0 4px 16px ${t.green}45, 0 1px 0 rgba(255,255,255,0.15) inset`,
                minHeight: 54,
                WebkitTapHighlightColor: "transparent",
                transition: "transform 0.15s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s ease, background 0.15s ease",
              }}
            >
              Let&apos;s Start
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>

            <button
              type="button"
              onClick={onOpenIncomeIdeas}
              onPointerDown={(e) => { e.currentTarget.style.transform = "scale(0.97)"; }}
              onPointerUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
              onPointerCancel={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
              onPointerLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                width: "100%",
                padding: "0 24px",
                background: "rgba(120,120,128,0.16)",
                color: t.ink,
                border: "none",
                borderRadius: 14,
                fontSize: 17,
                fontWeight: 600,
                letterSpacing: "-0.01em",
                fontFamily: "-apple-system,'SF Pro Text','Helvetica Neue',Arial,sans-serif",
                cursor: "pointer",
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                minHeight: 54,
                WebkitTapHighlightColor: "transparent",
                transition: "transform 0.15s cubic-bezier(0.34,1.56,0.64,1), background 0.15s ease",
              }}
            >
              Let&apos;s Make Money
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={t.ink} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
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
            { label: "Practice Quiz",  desc: "Jump into your next round.",  onClick: onOpenQuiz,         icon: "target",   color: "#0A84FF" }, // SF Blue
            { label: "Daily Growth",   desc: "Keep momentum alive today.",  onClick: onOpenDailyGrowth,  icon: "leaf",     color: "#30D158" }, // SF Green
            { label: "Momentum Hub",   desc: "Streaks, missions, wins.",    onClick: onOpenMomentumHub,  icon: "flame",    color: "#FF9F0A" }, // SF Orange
            { label: "My Goals",       desc: "Set and track what matters.", onClick: onOpenGoalSetting,  icon: "trophy",   color: "#BF5AF2" }, // SF Purple
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
                padding: "12px 14px 11px",
                boxShadow: S.sm,
                cursor: "pointer",
                fontFamily: "-apple-system, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif",
                minHeight: 72,
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
                width: 30, height: 30, borderRadius: 9,
                background: `${action.color}1F`,
                border: `1px solid ${action.color}33`,
                display: "flex", alignItems: "center", justifyContent: "center",
                lineHeight: 1,
              }}>
                {Ic[action.icon]?.("none", action.color, 15)}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: t.ink, letterSpacing: "-0.01em", marginBottom: 2 }}>{action.label}</div>
                <div style={{ fontSize: 11, lineHeight: 1.4, color: t.muted }}>{action.desc}</div>
              </div>
            </button>
          ))}
        </div>

        {/* ── Daily Habit Tracker ─────────────────────────────── */}
        <div style={{ marginTop: 24 }}>
          <p
            style={{
              margin: "0 2px 10px",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: t.muted,
              textAlign: "center",
              fontFamily: "-apple-system,'SF Pro Text','Helvetica Neue',Arial,sans-serif",
            }}
          >
            Daily Habits — {habitChecked.length}/{DEFAULT_HABITS.length}
          </p>
          <div
            style={{
              background: t.white,
              border: `1px solid ${t.border}`,
              borderRadius: 20,
              overflow: "hidden",
              boxShadow: S.sm,
            }}
          >
            {/* Progress bar */}
            <div style={{ height: 3, background: t.skin }}>
              <div
                style={{
                  height: "100%",
                  width: `${(habitChecked.length / DEFAULT_HABITS.length) * 100}%`,
                  background: t.green,
                  transition: "width 0.4s cubic-bezier(0.34,1.56,0.64,1)",
                  borderRadius: 999,
                }}
              />
            </div>
            {DEFAULT_HABITS.map((h, i) => {
              const done = habitChecked.includes(h.id);
              return (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => toggleHabit(h.id)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 16px",
                    background: done ? `${t.green}0a` : "transparent",
                    border: "none",
                    borderBottom: i < DEFAULT_HABITS.length - 1 ? `1px solid ${t.border}` : "none",
                    cursor: "pointer",
                    textAlign: "left",
                    fontFamily: "-apple-system,'SF Pro Text','Helvetica Neue',Arial,sans-serif",
                    WebkitTapHighlightColor: "transparent",
                    transition: "background 0.2s ease",
                  }}
                >
                  {/* Check circle */}
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      background: done ? t.green : "transparent",
                      border: `2px solid ${done ? t.green : t.border}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      transition: "all 0.25s cubic-bezier(0.34,1.56,0.64,1)",
                    }}
                  >
                    {done && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                  <span style={{ fontSize: 14 }}>{h.icon}</span>
                  <span
                    style={{
                      flex: 1,
                      fontSize: 14,
                      fontWeight: 500,
                      color: done ? t.muted : t.ink,
                      textDecoration: done ? "line-through" : "none",
                      transition: "color 0.2s ease, text-decoration 0.2s ease",
                    }}
                  >
                    {h.label}
                  </span>
                </button>
              );
            })}
          </div>
          {habitChecked.length === DEFAULT_HABITS.length && (
            <p
              style={{
                margin: "10px 0 0",
                textAlign: "center",
                fontSize: 13,
                fontWeight: 600,
                color: t.green,
                fontFamily: "-apple-system,'SF Pro Text','Helvetica Neue',Arial,sans-serif",
              }}
            >
              ✦ All habits done today — great work!
            </p>
          )}
        </div>

        <p
          style={{
            margin: "24px auto 8px",
            textAlign: "center",
            fontSize: 11,
            color: t.muted,
            fontFamily: "-apple-system,'SF Pro Display','SF Pro Text','Helvetica Neue',Arial,sans-serif",
            opacity: 0.8,
          }}
        >
          &copy; {new Date().getFullYear()} Life. All rights reserved.
        </p>
      </div>
    </div>
  );
}

import { useState, useEffect, useMemo } from "react";
import { LS } from "../../systems/storage";

const FONT = "-apple-system,'SF Pro Display','SF Pro Text','Helvetica Neue',Arial,sans-serif";

function greetingFor(hour) {
  if (hour >= 5 && hour < 12) return "Good Morning";
  if (hour >= 12 && hour < 17) return "Good Afternoon";
  if (hour >= 17 && hour < 22) return "Good Evening";
  return "Good Night";
}

function buildDisplayName(preferredName, userName, gender, genderCustom) {
  const pref = preferredName?.trim();
  const base = pref || (userName ? String(userName).trim().split(/\s+/)[0] : "");
  if (!base) return "";
  const g = gender?.toLowerCase();
  if (g === "mr") return `Mr ${base}`;
  if (g === "mrs") return `Mrs ${base}`;
  if (g === "other" && genderCustom?.trim()) return `${genderCustom.trim()} ${base}`;
  return base;
}

function formatDate(date) {
  const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const d = date.getDate();
  const suffix = d === 1 || d === 21 || d === 31 ? "st" : d === 2 || d === 22 ? "nd" : d === 3 || d === 23 ? "rd" : "th";
  return `${days[date.getDay()]}, ${d}${suffix} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

function getDaysSinceLastVisit(userId) {
  const key = `life_last_visit_${userId}`;
  const today = new Date().toISOString().split("T")[0];
  const last = LS.get(key, null);
  LS.set(key, today);
  if (!last) return 0;
  const diff = (new Date(today) - new Date(last)) / (1000 * 60 * 60 * 24);
  return Math.max(0, Math.round(diff));
}

const CARD_STYLE = (t) => ({
  background: t.white,
  borderRadius: 20,
  border: `1px solid ${t.border}`,
  padding: "18px 18px",
  boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
  marginBottom: 20,
});

const CARD_TITLE_STYLE = (t) => ({
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: t.muted,
  marginBottom: 12,
  fontFamily: FONT,
  margin: "0 0 12px",
});

export function ReturningUserDashboard({
  t,
  play,
  userId,
  userName,
  preferredName,
  gender,
  genderCustom,
  notifications,
  readingStreak,
  progressPercent,
  onNavigate,
  onOpenReading,
  onOpenQuiz,
  onOpenOrganize,
  onOpenProgress,
  onOpenPostIt,
}) {
  const [briefingDismissed, setBriefingDismissed] = useState(false);
  const [setupOpen, setSetupOpen] = useState(false);
  const [showSetupPill, setShowSetupPill] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [greetHour, setGreetHour] = useState(() => new Date().getHours());

  useEffect(() => {
    setMounted(true);
    // Check if setup pill should show
    if (userId && !LS.get(`life_dashboard_setup_${userId}`)) {
      setShowSetupPill(true);
    }
    // Refresh hour every 5 minutes
    const id = setInterval(() => {
      setGreetHour((prev) => {
        const h = new Date().getHours();
        return prev === h ? prev : h;
      });
    }, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, [userId]);

  const greeting = useMemo(() => greetingFor(greetHour), [greetHour]);
  const displayName = useMemo(
    () => buildDisplayName(preferredName, userName, gender, genderCustom),
    [preferredName, userName, gender, genderCustom]
  );

  const daysSinceLastVisit = useMemo(() => {
    if (!userId) return 0;
    return getDaysSinceLastVisit(userId);
  }, [userId]);

  const unreadNotifs = useMemo(
    () => (notifications || []).filter((n) => !n.read).slice(0, 3),
    [notifications]
  );

  const subtitle = useMemo(() => {
    if (unreadNotifs.length > 0) return "You have things to catch up on.";
    if (daysSinceLastVisit >= 3) return "Welcome back. It has been a while.";
    return "Here is your briefing for today.";
  }, [unreadNotifs.length, daysSinceLastVisit]);

  const streakMsg =
    readingStreak === 0
      ? "Start your streak today"
      : readingStreak < 7
      ? "Keep the momentum going"
      : "You are on fire — do not stop now";

  const dismissSetup = () => {
    if (userId) LS.set(`life_dashboard_setup_${userId}`, true);
    setShowSetupPill(false);
    setSetupOpen(false);
  };

  const SETUP_TOOLS = [
    { icon: "✅", label: "To-Do List", action: () => onNavigate?.("organize") },
    { icon: "📚", label: "Learning Progress", action: () => onNavigate?.("progress_dashboard") },
    { icon: "⏱", label: "Focus Timer", action: () => onNavigate?.("focus_timer") },
    { icon: "💰", label: "Budget Snapshot", action: () => onNavigate?.("income_ideas") },
    { icon: "📓", label: "Daily Journal", action: () => onNavigate?.("organize") },
    { icon: "🎯", label: "Goal Tracker", action: () => onNavigate?.("goal_setting") },
  ];

  const QUICK_ACTIONS = [
    { icon: "📖", label: "Continue Reading", action: onOpenReading },
    { icon: "🧠", label: "Take a Quiz", action: onOpenQuiz },
    { icon: "📝", label: "Open Organize", action: onOpenOrganize },
    { icon: "📊", label: "View Progress", action: onOpenProgress },
    { icon: "💬", label: "Open Post-It", action: onOpenPostIt },
  ];

  return (
    <div style={{ padding: "16px 20px 0", maxWidth: 620, margin: "0 auto" }}>

      {/* ── Section 1: Butler Greeting ────────────────────── */}
      {!briefingDismissed && (
        <div
          style={{
            ...CARD_STYLE(t),
            background: `linear-gradient(135deg, ${t.white} 0%, ${t.light} 100%)`,
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0) scale(1)" : "translateY(12px) scale(0.97)",
            transition: "opacity 0.38s cubic-bezier(0.34,1.56,0.64,1), transform 0.38s cubic-bezier(0.34,1.56,0.64,1)",
          }}
        >
          <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 700, letterSpacing: "0.32em", textTransform: "uppercase", color: t.green, fontFamily: FONT }}>
            {greeting}{displayName ? `, ${displayName}` : ""}
          </p>
          <p style={{ margin: "0 0 6px", fontSize: 17, fontWeight: 600, color: t.ink, fontFamily: FONT, letterSpacing: "-0.01em" }}>
            {subtitle}
          </p>
          <p style={{ margin: "0 0 14px", fontSize: 13, color: t.muted, fontFamily: FONT }}>
            {formatDate(new Date())}
          </p>
          <button
            type="button"
            onClick={() => { play?.("back"); setBriefingDismissed(true); }}
            style={{
              background: "rgba(120,120,128,0.12)",
              border: "none",
              borderRadius: 10,
              padding: "7px 14px",
              fontSize: 13,
              fontWeight: 500,
              color: t.muted,
              fontFamily: FONT,
              cursor: "pointer",
              WebkitTapHighlightColor: "transparent",
              transition: "transform 0.15s cubic-bezier(0.34,1.56,0.64,1)",
            }}
            onTouchStart={(e) => { e.currentTarget.style.transform = "scale(0.96)"; }}
            onTouchEnd={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
            onMouseDown={(e) => { e.currentTarget.style.transform = "scale(0.96)"; }}
            onMouseUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
          >
            Dismiss Briefing
          </button>
        </div>
      )}

      {/* ── Section 2: Dashboard Setup Pill ──────────────── */}
      {showSetupPill && (
        <div
          style={{
            marginBottom: 20,
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(10px)",
            transition: "opacity 0.35s ease 65ms, transform 0.38s cubic-bezier(0.34,1.56,0.64,1) 65ms",
          }}
        >
          <button
            type="button"
            onClick={() => { play?.("tap"); setSetupOpen((o) => !o); }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: `${t.green}18`,
              border: `1px solid ${t.green}30`,
              borderRadius: 999,
              padding: "9px 18px",
              fontSize: 14,
              fontWeight: 600,
              color: t.green,
              fontFamily: FONT,
              cursor: "pointer",
              WebkitTapHighlightColor: "transparent",
              transition: "transform 0.15s cubic-bezier(0.34,1.56,0.64,1)",
              width: "100%",
              justifyContent: "center",
            }}
            onTouchStart={(e) => { e.currentTarget.style.transform = "scale(0.97)"; }}
            onTouchEnd={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
            onMouseDown={(e) => { e.currentTarget.style.transform = "scale(0.97)"; }}
            onMouseUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
          >
            ✨ Set up your dashboard
            <svg width="12" height="12" viewBox="0 0 12 12" style={{ transform: setupOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s ease" }}>
              <polyline points="2,4 6,8 10,4" fill="none" stroke={t.green} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {setupOpen && (
            <div style={{ ...CARD_STYLE(t), marginTop: 10, marginBottom: 0 }}>
              <p style={CARD_TITLE_STYLE(t)}>Choose your tools</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
                {SETUP_TOOLS.map((tool) => (
                  <button
                    key={tool.label}
                    type="button"
                    onClick={() => { play?.("tap"); tool.action(); dismissSetup(); }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "12px 14px",
                      background: t.light,
                      border: `1px solid ${t.border}`,
                      borderRadius: 14,
                      fontSize: 14,
                      fontWeight: 500,
                      color: t.ink,
                      fontFamily: FONT,
                      cursor: "pointer",
                      textAlign: "left",
                      minHeight: 44,
                      WebkitTapHighlightColor: "transparent",
                      transition: "transform 0.15s cubic-bezier(0.34,1.56,0.64,1)",
                    }}
                    onTouchStart={(e) => { e.currentTarget.style.transform = "scale(0.96)"; }}
                    onTouchEnd={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
                    onMouseDown={(e) => { e.currentTarget.style.transform = "scale(0.96)"; }}
                    onMouseUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
                  >
                    <span style={{ fontSize: 18 }}>{tool.icon}</span>
                    <span>{tool.label}</span>
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={dismissSetup}
                style={{
                  display: "block",
                  width: "100%",
                  marginTop: 12,
                  padding: "10px 18px",
                  background: t.green,
                  color: "#000",
                  border: "none",
                  borderRadius: 999,
                  fontSize: 14,
                  fontWeight: 600,
                  fontFamily: FONT,
                  cursor: "pointer",
                  WebkitTapHighlightColor: "transparent",
                  transition: "transform 0.15s cubic-bezier(0.34,1.56,0.64,1)",
                }}
                onTouchStart={(e) => { e.currentTarget.style.transform = "scale(0.97)"; }}
                onTouchEnd={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
                onMouseDown={(e) => { e.currentTarget.style.transform = "scale(0.97)"; }}
                onMouseUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
              >
                Add +
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Section 3: What You Missed ───────────────────── */}
      <div
        style={{
          ...CARD_STYLE(t),
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(10px)",
          transition: "opacity 0.35s ease 130ms, transform 0.38s cubic-bezier(0.34,1.56,0.64,1) 130ms",
        }}
      >
        <p style={CARD_TITLE_STYLE(t)}>What You Missed</p>
        {unreadNotifs.length === 0 ? (
          <p style={{ margin: 0, fontSize: 15, color: t.muted, fontFamily: FONT, lineHeight: 1.55 }}>
            You are all caught up. ✓
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {unreadNotifs.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => {
                  play?.("tap");
                  const target = n.targetPage || n.target;
                  if (target) onNavigate?.(target);
                }}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  padding: "12px 14px",
                  background: t.light,
                  border: `1px solid ${t.border}`,
                  borderRadius: 14,
                  textAlign: "left",
                  cursor: "pointer",
                  fontFamily: FONT,
                  WebkitTapHighlightColor: "transparent",
                  transition: "transform 0.15s cubic-bezier(0.34,1.56,0.64,1)",
                  minHeight: 44,
                }}
                onTouchStart={(e) => { e.currentTarget.style.transform = "scale(0.98)"; }}
                onTouchEnd={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
                onMouseDown={(e) => { e.currentTarget.style.transform = "scale(0.98)"; }}
                onMouseUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: t.green,
                    marginTop: 5,
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: 14, color: t.ink, lineHeight: 1.5, flex: 1 }}>
                  {n.text || n.message || "Notification"}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Section 4: Your Focus For Today ─────────────── */}
      <div
        style={{
          ...CARD_STYLE(t),
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(10px)",
          transition: "opacity 0.35s ease 195ms, transform 0.38s cubic-bezier(0.34,1.56,0.64,1) 195ms",
        }}
      >
        <p style={CARD_TITLE_STYLE(t)}>Your Focus For Today</p>
        <p style={{ margin: "0 0 12px", fontSize: 15, color: t.muted, fontFamily: FONT, lineHeight: 1.55 }}>
          Nothing scheduled — enjoy your day.
        </p>
        <button
          type="button"
          onClick={() => { play?.("tap"); onNavigate?.("organize"); }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: "none",
            border: "none",
            padding: 0,
            fontSize: 14,
            fontWeight: 600,
            color: t.green,
            fontFamily: FONT,
            cursor: "pointer",
            WebkitTapHighlightColor: "transparent",
            minHeight: 44,
          }}
        >
          Open Organize
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke={t.green} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="4,2 8,6 4,10" />
          </svg>
        </button>
      </div>

      {/* ── Section 5: Reading Streak ────────────────────── */}
      <div
        style={{
          ...CARD_STYLE(t),
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(10px)",
          transition: "opacity 0.35s ease 260ms, transform 0.38s cubic-bezier(0.34,1.56,0.64,1) 260ms",
        }}
      >
        <p style={CARD_TITLE_STYLE(t)}>Reading Streak</p>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: `${t.green}18`,
              border: `1px solid ${t.green}30`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              flexShrink: 0,
            }}
          >
            🔥
          </div>
          <div>
            <p style={{ margin: "0 0 3px", fontSize: 24, fontWeight: 700, color: t.ink, fontFamily: FONT, letterSpacing: "-0.02em" }}>
              {readingStreak} {readingStreak === 1 ? "day" : "days"}
            </p>
            <p style={{ margin: 0, fontSize: 13, color: t.muted, fontFamily: FONT }}>
              {streakMsg}
            </p>
          </div>
        </div>
      </div>

      {/* ── Section 6: Suggested For You ────────────────── */}
      <div
        style={{
          ...CARD_STYLE(t),
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(10px)",
          transition: "opacity 0.35s ease 325ms, transform 0.38s cubic-bezier(0.34,1.56,0.64,1) 325ms",
        }}
      >
        <p style={CARD_TITLE_STYLE(t)}>Suggested For You</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { icon: "📖", label: "Continue Learning", desc: "Pick up where you left off.", action: onOpenReading },
            { icon: "🧠", label: "Take a Quiz", desc: "Test what you know today.", action: onOpenQuiz },
          ].map((card) => (
            <button
              key={card.label}
              type="button"
              onClick={() => { play?.("tap"); card.action?.(); }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "14px 14px",
                background: t.light,
                border: `1px solid ${t.border}`,
                borderRadius: 16,
                textAlign: "left",
                cursor: "pointer",
                fontFamily: FONT,
                WebkitTapHighlightColor: "transparent",
                transition: "transform 0.15s cubic-bezier(0.34,1.56,0.64,1)",
                minHeight: 56,
              }}
              onTouchStart={(e) => { e.currentTarget.style.transform = "scale(0.98)"; }}
              onTouchEnd={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
              onMouseDown={(e) => { e.currentTarget.style.transform = "scale(0.98)"; }}
              onMouseUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
            >
              <span style={{ fontSize: 24, flexShrink: 0 }}>{card.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: "0 0 2px", fontSize: 15, fontWeight: 600, color: t.ink }}>{card.label}</p>
                <p style={{ margin: 0, fontSize: 12, color: t.muted }}>{card.desc}</p>
              </div>
              <svg width="8" height="14" viewBox="0 0 8 14" fill="none" stroke={t.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="1,1 7,7 1,13" />
              </svg>
            </button>
          ))}
        </div>
      </div>

      {/* ── Section 7: Quick Actions Row ─────────────────── */}
      <div
        style={{
          marginBottom: 20,
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(10px)",
          transition: "opacity 0.35s ease 390ms, transform 0.38s cubic-bezier(0.34,1.56,0.64,1) 390ms",
        }}
      >
        <p style={{ ...CARD_TITLE_STYLE(t), marginBottom: 12 }}>Quick Actions</p>
        <div
          style={{
            display: "flex",
            gap: 10,
            overflowX: "auto",
            paddingBottom: 4,
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {QUICK_ACTIONS.map((qa) => (
            <button
              key={qa.label}
              type="button"
              onClick={() => { play?.("tap"); qa.action?.(); }}
              style={{
                flexShrink: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                padding: "14px 16px",
                background: t.white,
                border: `1px solid ${t.border}`,
                borderRadius: 18,
                cursor: "pointer",
                fontFamily: FONT,
                WebkitTapHighlightColor: "transparent",
                transition: "transform 0.15s cubic-bezier(0.34,1.56,0.64,1)",
                minWidth: 80,
                minHeight: 80,
                boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
              }}
              onTouchStart={(e) => { e.currentTarget.style.transform = "scale(0.94)"; }}
              onTouchEnd={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
              onMouseDown={(e) => { e.currentTarget.style.transform = "scale(0.94)"; }}
              onMouseUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
            >
              <span style={{ fontSize: 22 }}>{qa.icon}</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: t.muted, textAlign: "center", lineHeight: 1.3 }}>{qa.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Section 8: Butler Milestone ──────────────────── */}
      {(readingStreak >= 7 || progressPercent >= 50) && (
        <div
          style={{
            background: `${t.green}12`,
            borderRadius: 16,
            border: `1px solid ${t.green}30`,
            padding: "16px 18px",
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 12,
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(10px)",
            transition: "opacity 0.35s ease 455ms, transform 0.38s cubic-bezier(0.34,1.56,0.64,1) 455ms",
          }}
        >
          <span style={{ fontSize: 26, flexShrink: 0 }}>🏆</span>
          <div>
            <p style={{ margin: "0 0 2px", fontSize: 14, fontWeight: 600, color: t.green, fontFamily: FONT }}>
              Milestone Unlocked
            </p>
            <p style={{ margin: 0, fontSize: 13, color: t.muted, fontFamily: FONT, lineHeight: 1.5 }}>
              {readingStreak >= 7
                ? "Your streak is on fire. Keep it going."
                : "Halfway through. Impressive."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

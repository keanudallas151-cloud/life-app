import { useState, useEffect, useRef, useCallback } from "react";

const SF = "-apple-system,'SF Pro Text','Helvetica Neue',Arial,sans-serif";
const SFD = "-apple-system,'SF Pro Display','Helvetica Neue',Arial,sans-serif";
const SFM = "'SF Mono',ui-monospace,Menlo,monospace";

/* ── Session presets ─────────────────────────────────────────────────────── */
const PRESETS = [
  { label: "Focus",       work: 25, break: 5,  long: 15, color: "#50c878", emoji: "🧠" },
  { label: "Deep Work",   work: 50, break: 10, long: 20, color: "#3B82F6", emoji: "⚡" },
  { label: "Quick Burst", work: 15, break: 3,  long: 10, color: "#F59E0B", emoji: "🔥" },
  { label: "Study",       work: 45, break: 10, long: 20, color: "#8B5CF6", emoji: "📚" },
];

const PHASES = {
  work:      { label: "Focus",       short: "Focus" },
  break:     { label: "Short Break", short: "Break" },
  longBreak: { label: "Long Break",  short: "Rest" },
};

/* ── Circular progress ring ─────────────────────────────────────────────── */
function ProgressRing({ pct, color, size = 220, stroke = 8 }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}>
      {/* Track */}
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={stroke}
      />
      {/* Progress */}
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1), stroke 0.3s ease" }}
      />
    </svg>
  );
}

/* ── Session history dot ─────────────────────────────────────────────────── */
function SessionDot({ phase, color }) {
  return (
    <div style={{
      width: phase === "work" ? 10 : 6,
      height: phase === "work" ? 10 : 6,
      borderRadius: "50%",
      background: phase === "work" ? color : "rgba(255,255,255,0.2)",
      flexShrink: 0,
      animation: "ios-badge-pop 0.35s cubic-bezier(0.34,1.56,0.64,1) both",
    }} />
  );
}

/* ── Tip carousel ────────────────────────────────────────────────────────── */
const TIPS = [
  "Put your phone face-down. Every notification breaks 23 minutes of focus.",
  "One task per session. What's the single most important thing right now?",
  "Work expands to fill the time you give it. 25 minutes is enough.",
  "Your brain consolidates learning during breaks. Step away fully.",
  "After 4 sessions, take a real break. Walk, stretch, hydrate.",
  "Close every tab you don't need right now. Reduce your cognitive load.",
  "If a thought distracts you, write it down and return to it after the session.",
  "The first 5 minutes of any session are the hardest. Push through them.",
];

/* ── Main component ─────────────────────────────────────────────────────── */
export function FocusTimerPage({ t, play }) {
  const [preset, setPreset] = useState(0);
  const [phase, setPhase] = useState("work"); // work | break | longBreak
  const [totalSeconds, setTotalSeconds] = useState(PRESETS[0].work * 60);
  const [remaining, setRemaining] = useState(PRESETS[0].work * 60);
  const [running, setRunning] = useState(false);
  const [session, setSession] = useState(1); // current session number
  const [history, setHistory] = useState([]); // completed sessions
  const [tipIdx] = useState(() => Math.floor(Math.random() * TIPS.length));
  const [taskName, setTaskName] = useState("");
  const [totalFocused, setTotalFocused] = useState(0); // minutes
  const intervalRef = useRef(null);
  const p = PRESETS[preset];

  // Format MM:SS
  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  // Progress fraction
  const pct = totalSeconds > 0 ? remaining / totalSeconds : 0;

  // Advance to next phase
  const nextPhase = useCallback(() => {
    play?.("ok");
    if (phase === "work") {
      setTotalFocused(f => f + p.work);
      setHistory(h => [...h, "work"]);
      const completed = history.filter(h => h === "work").length + 1;
      if (completed % 4 === 0) {
        // After 4 work sessions: long break
        const secs = p.long * 60;
        setPhase("longBreak");
        setTotalSeconds(secs);
        setRemaining(secs);
      } else {
        const secs = p.break * 60;
        setPhase("break");
        setTotalSeconds(secs);
        setRemaining(secs);
        setHistory(h => [...h, "break"]);
      }
    } else {
      // After break: new work session
      setSession(s => s + 1);
      const secs = p.work * 60;
      setPhase("work");
      setTotalSeconds(secs);
      setRemaining(secs);
    }
    setRunning(false);
  }, [phase, p, history, play]);

  // Tick
  useEffect(() => {
    if (!running) {
      clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setRemaining(r => {
        if (r <= 1) {
          clearInterval(intervalRef.current);
          nextPhase();
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [running, nextPhase]);

  // Reset on preset change
  const changePreset = (idx) => {
    setPreset(idx);
    setPhase("work");
    const secs = PRESETS[idx].work * 60;
    setTotalSeconds(secs);
    setRemaining(secs);
    setRunning(false);
    setSession(1);
    setHistory([]);
    play?.("tap");
  };

  // Reset current session
  const reset = () => {
    play?.("tap");
    const secs = phase === "longBreak" ? p.long * 60 : phase === "break" ? p.break * 60 : p.work * 60;
    setTotalSeconds(secs);
    setRemaining(secs);
    setRunning(false);
  };

  const skip = () => {
    play?.("tap");
    nextPhase();
  };

  const toggle = () => {
    play?.("tap");
    setRunning(r => !r);
  };

  const phaseInfo = PHASES[phase];
  const sessionLabel = `Session ${session} of ${session + history.filter(h => h === "work").length}`;

  return (
    <div
      data-page-tag="#focus_timer"
      style={{ padding: "28px 16px 96px", maxWidth: 480, margin: "0 auto", fontFamily: SF, minHeight: "100%" }}
    >
      {/* Header */}
      <p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: p.color, fontFamily: SF }}>
        Tools
      </p>
      <h1 style={{ margin: "0 0 4px", fontSize: 34, fontWeight: 700, color: "#ededed", letterSpacing: "-0.035em", lineHeight: 1.05, fontFamily: SFD }}>
        Focus Timer
      </h1>
      <p style={{ margin: "0 0 22px", fontSize: 14, color: "rgba(161,161,161,0.75)", fontFamily: SF }}>
        Structured focus sessions to protect your deep work.
      </p>

      {/* Task input */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        background: "rgba(118,118,128,0.14)", borderRadius: 12,
        padding: "0 14px", marginBottom: 20, height: 42,
      }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(161,161,161,0.6)" strokeWidth="2" strokeLinecap="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
        <input
          type="text"
          placeholder="What are you working on?"
          value={taskName}
          onChange={e => setTaskName(e.target.value)}
          style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 15, color: "#ededed", fontFamily: SF, height: 42, padding: 0 }}
        />
      </div>

      {/* Preset selector */}
      <div style={{ display: "flex", gap: 8, marginBottom: 28, overflowX: "auto", WebkitOverflowScrolling: "touch", paddingBottom: 2 }}>
        {PRESETS.map((pr, i) => (
          <button
            key={pr.label}
            type="button"
            onClick={() => changePreset(i)}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "8px 14px", borderRadius: 999, border: "none", flexShrink: 0,
              background: preset === i ? p.color : "rgba(118,118,128,0.14)",
              color: preset === i ? "#000" : "rgba(161,161,161,0.85)",
              fontSize: 13, fontWeight: 600, fontFamily: SF, cursor: "pointer",
              letterSpacing: "-0.01em",
              transition: "background 0.2s ease, color 0.2s ease, transform 0.14s cubic-bezier(0.34,1.56,0.64,1)",
              WebkitTapHighlightColor: "transparent",
            }}
            onPointerDown={e => { e.currentTarget.style.transform = "scale(0.94)"; }}
            onPointerUp={e => { e.currentTarget.style.transform = "scale(1)"; }}
          >
            <span style={{ fontSize: 14 }}>{pr.emoji}</span>
            {pr.label}
          </button>
        ))}
      </div>

      {/* Timer ring + display */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 32 }}>
        {/* Ring */}
        <div style={{ position: "relative", width: 220, height: 220, marginBottom: 28 }}>
          <ProgressRing pct={pct} color={p.color} size={220} stroke={9} />

          {/* Inner content */}
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 4,
          }}>
            {/* Phase label */}
            <span style={{
              fontSize: 11, fontWeight: 600, color: p.color,
              textTransform: "uppercase", letterSpacing: "0.07em", fontFamily: SF,
            }}>
              {phaseInfo.short}
            </span>

            {/* Time display */}
            <span style={{
              fontSize: 52, fontWeight: 700, color: "#ededed",
              fontFamily: SFM, letterSpacing: "-0.03em", lineHeight: 1,
              fontVariantNumeric: "tabular-nums",
            }}>
              {fmt(remaining)}
            </span>

            {/* Session counter */}
            <span style={{ fontSize: 12, color: "rgba(161,161,161,0.55)", fontFamily: SF, marginTop: 2 }}>
              {sessionLabel}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* Reset */}
          <button
            type="button"
            onClick={reset}
            style={{
              width: 46, height: 46, borderRadius: "50%",
              background: "rgba(255,255,255,0.07)",
              border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "rgba(161,161,161,0.7)",
              transition: "background 0.15s ease, transform 0.14s cubic-bezier(0.34,1.56,0.64,1)",
              WebkitTapHighlightColor: "transparent",
            }}
            onPointerDown={e => { e.currentTarget.style.transform = "scale(0.88)"; }}
            onPointerUp={e => { e.currentTarget.style.transform = "scale(1)"; }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 1 0 .49-6" />
            </svg>
          </button>

          {/* Play / Pause — main button */}
          <button
            type="button"
            onClick={toggle}
            style={{
              width: 72, height: 72, borderRadius: "50%",
              background: p.color,
              border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: `0 6px 24px ${p.color}55`,
              transition: "transform 0.18s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s ease",
              WebkitTapHighlightColor: "transparent",
            }}
            onPointerDown={e => { e.currentTarget.style.transform = "scale(0.93)"; }}
            onPointerUp={e => { e.currentTarget.style.transform = "scale(1)"; }}
          >
            {running ? (
              /* Pause icon */
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#000">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              /* Play icon */
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#000">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            )}
          </button>

          {/* Skip */}
          <button
            type="button"
            onClick={skip}
            style={{
              width: 46, height: 46, borderRadius: "50%",
              background: "rgba(255,255,255,0.07)",
              border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "rgba(161,161,161,0.7)",
              transition: "background 0.15s ease, transform 0.14s cubic-bezier(0.34,1.56,0.64,1)",
              WebkitTapHighlightColor: "transparent",
            }}
            onPointerDown={e => { e.currentTarget.style.transform = "scale(0.88)"; }}
            onPointerUp={e => { e.currentTarget.style.transform = "scale(1)"; }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 4 15 12 5 20 5 4" />
              <line x1="19" y1="5" x2="19" y2="19" />
            </svg>
          </button>
        </div>
      </div>

      {/* Session history dots */}
      {history.length > 0 && (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          gap: 6, marginBottom: 24, flexWrap: "wrap",
        }}>
          {history.filter(h => h === "work" || h === "break").map((h, i) => (
            <SessionDot key={i} phase={h} color={p.color} />
          ))}
          {/* Current (incomplete) */}
          <div style={{
            width: 10, height: 10, borderRadius: "50%",
            border: `2px solid ${p.color}`,
            background: "transparent",
          }} />
        </div>
      )}

      {/* Stats row */}
      <div style={{
        display: "flex", gap: 10, marginBottom: 20,
      }}>
        {[
          { label: "Sessions", val: session - 1 + (history.filter(h => h === "work").length > 0 ? 1 : 0), unit: "" },
          { label: "Focused", val: totalFocused, unit: "min" },
          { label: "Phase", val: phaseInfo.short, unit: "" },
        ].map(({ label, val, unit }) => (
          <div key={label} style={{
            flex: 1, padding: "14px 12px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 14, textAlign: "center",
          }}>
            <p style={{ margin: "0 0 3px", fontSize: 20, fontWeight: 700, color: "#ededed", fontFamily: SFD, letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums" }}>
              {val}{unit}
            </p>
            <p style={{ margin: 0, fontSize: 11, color: "rgba(161,161,161,0.6)", fontFamily: SF, fontWeight: 500, letterSpacing: "0.01em" }}>
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* Session timing breakdown */}
      <div style={{
        padding: "14px 16px",
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 16, marginBottom: 20,
      }}>
        <p style={{ margin: "0 0 10px", fontSize: 12, fontWeight: 600, color: "rgba(161,161,161,0.6)", textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: SF }}>
          {p.emoji} {p.label} — timing
        </p>
        <div style={{ display: "flex", gap: 16 }}>
          {[
            { label: "Focus", val: p.work + "m", color: p.color },
            { label: "Break", val: p.break + "m", color: "rgba(161,161,161,0.6)" },
            { label: "Long break", val: p.long + "m", color: "rgba(161,161,161,0.4)" },
          ].map(({ label, val, color }) => (
            <div key={label} style={{ flex: 1 }}>
              <p style={{ margin: "0 0 1px", fontSize: 17, fontWeight: 600, color, fontFamily: SFD, letterSpacing: "-0.02em" }}>{val}</p>
              <p style={{ margin: 0, fontSize: 11, color: "rgba(161,161,161,0.5)", fontFamily: SF }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Focus tip */}
      <div style={{
        padding: "14px 16px", borderRadius: 14,
        background: `${p.color}0d`,
        border: `1px solid ${p.color}22`,
      }}>
        <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 600, color: p.color, textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: SF }}>
          Focus Tip
        </p>
        <p style={{ margin: 0, fontSize: 13.5, color: "#ededed", lineHeight: 1.6, fontFamily: SF }}>
          {TIPS[tipIdx]}
        </p>
      </div>
    </div>
  );
}

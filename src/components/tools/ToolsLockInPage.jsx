import { useEffect, useRef, useState } from "react";

const BREAK_COUNT_OPTIONS = [1, 2, 3];
const BREAK_LENGTH_OPTIONS_MINUTES = [2, 3, 5];
const DEFAULT_SHORT_BREAK_MS = 3 * 60 * 1000;

/* ----------------------------------------------------------------------------
   Helpers
---------------------------------------------------------------------------- */

function clampInt(value, min, max) {
  const num = Number(value);
  if (!Number.isFinite(num)) return min;
  return Math.max(min, Math.min(max, Math.floor(num)));
}

function pad2(value) {
  return String(value || 0).padStart(2, "0").slice(-2);
}

function formatCountdown(totalMs) {
  const safeMs = Math.max(0, Math.floor(Number(totalMs) || 0));
  const hours = Math.floor(safeMs / 3600000);
  const minutes = Math.floor((safeMs % 3600000) / 60000);
  const seconds = Math.floor((safeMs % 60000) / 1000);
  return `${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}`;
}

function formatShortCountdown(totalMs) {
  const safeMs = Math.max(0, Math.floor(Number(totalMs) || 0));
  const totalSeconds = Math.ceil(safeMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${hours}h ${pad2(minutes)}m`;
  return `${minutes}:${pad2(seconds)}`;
}

function formatMinutesLabel(totalMs) {
  const totalMinutes = Math.round(totalMs / 60000);
  if (totalMinutes < 60) return `${totalMinutes} min`;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (!minutes) return `${hours} hr`;
  return `${hours} hr ${minutes} min`;
}

function buildPhases(totalFocusMs, breakCount, shortBreakMs) {
  const focusSegmentCount = breakCount + 1;
  const baseFocusMs = Math.floor(totalFocusMs / focusSegmentCount);
  let remainder = totalFocusMs - baseFocusMs * focusSegmentCount;
  const phases = [];

  for (let index = 0; index < focusSegmentCount; index += 1) {
    const extra = remainder > 0 ? 1 : 0;
    remainder = Math.max(0, remainder - extra);
    phases.push({
      type: "focus",
      label: focusSegmentCount > 1 ? `Focus block ${index + 1}` : "Focus block",
      durationMs: baseFocusMs + extra,
    });
    if (index < breakCount) {
      phases.push({
        type: "break",
        label: `Break ${index + 1}`,
        durationMs: shortBreakMs,
      });
    }
  }
  return phases;
}

function getActivePhase(session) {
  return session?.phases?.[session.currentPhaseIndex] || null;
}

function getPhaseRemainingMs(session, now = Date.now()) {
  if (!session || session.isComplete) return 0;
  if (!session.phaseStartedAt) {
    return Math.max(0, Number(session.currentPhaseRemainingMs || 0));
  }
  const elapsed = now - session.phaseStartedAt;
  return Math.max(0, Number(session.currentPhaseRemainingMs || 0) - elapsed);
}

function getTotalRemainingMs(session, now = Date.now()) {
  if (!session) return 0;
  const current = getPhaseRemainingMs(session, now);
  const upcoming = (session.phases || [])
    .slice((session.currentPhaseIndex || 0) + 1)
    .reduce((sum, phase) => sum + Number(phase.durationMs || 0), 0);
  return current + upcoming;
}

function getBreakIndicators(session, now) {
  if (!session) return [];
  const phases = session.phases || [];
  const currentIndex = session.currentPhaseIndex || 0;
  const currentRemaining = getPhaseRemainingMs(session, now);
  const indicators = [];

  phases.forEach((phase, idx) => {
    if (phase.type !== "break") return;
    if (idx < currentIndex) {
      indicators.push({ label: phase.label, status: "done", ms: 0, duration: phase.durationMs });
    } else if (idx === currentIndex) {
      indicators.push({ label: phase.label, status: "active", ms: currentRemaining, duration: phase.durationMs });
    } else {
      let until = currentRemaining;
      for (let j = currentIndex + 1; j < idx; j += 1) {
        until += phases[j].durationMs;
      }
      indicators.push({ label: phase.label, status: "upcoming", ms: until, duration: phase.durationMs });
    }
  });
  return indicators;
}

function createLockInSession({ tasks, hours, minutes, seconds, breakCount, shortBreakMs }) {
  const totalFocusMs = hours * 3600000 + minutes * 60000 + seconds * 1000;
  const phases = buildPhases(totalFocusMs, breakCount, shortBreakMs);
  const totalBreakMs = breakCount * shortBreakMs;

  return {
    id: `lockin_${Date.now()}`,
    tasks,
    config: { tasks, hours, minutes, seconds, breakCount, shortBreakMs },
    breakCount,
    totalFocusMs,
    totalPlannedMs: totalFocusMs + totalBreakMs,
    shortBreakMs,
    phases,
    currentPhaseIndex: 0,
    currentPhaseRemainingMs: phases[0]?.durationMs || 0,
    phaseStartedAt: Date.now(),
    isPaused: false,
    isComplete: false,
    completedTaskIndexes: [],
    createdAt: new Date().toISOString(),
  };
}

function advanceSessionPhase(session) {
  if (!session) return session;
  const nextIndex = (session.currentPhaseIndex || 0) + 1;
  if (nextIndex >= (session.phases || []).length) {
    return {
      ...session,
      currentPhaseIndex: Math.max(0, (session.phases || []).length - 1),
      currentPhaseRemainingMs: 0,
      phaseStartedAt: null,
      isPaused: true,
      isComplete: true,
      completedAt: new Date().toISOString(),
    };
  }
  return {
    ...session,
    currentPhaseIndex: nextIndex,
    currentPhaseRemainingMs: session.phases[nextIndex].durationMs,
    phaseStartedAt: Date.now(),
    isPaused: false,
  };
}

/* ----------------------------------------------------------------------------
   ScrollPicker (iOS-style tap + scroll wheel)
---------------------------------------------------------------------------- */

const PICKER_ROW = 44;
const PICKER_VISIBLE = 5; // odd so one row is center
const PICKER_HEIGHT = PICKER_ROW * PICKER_VISIBLE;
const PICKER_CENTER_OFFSET = Math.floor(PICKER_VISIBLE / 2);

function ScrollPicker({ value, max, label, t, onChange }) {
  const scrollRef = useRef(null);
  const timerRef = useRef(null);
  const suppressScrollRef = useRef(false);

  useEffect(() => {
    const node = scrollRef.current;
    if (!node) return;
    suppressScrollRef.current = true;
    node.scrollTop = value * PICKER_ROW;
    const frame = window.requestAnimationFrame(() => {
      suppressScrollRef.current = false;
    });
    return () => window.cancelAnimationFrame(frame);
  }, [value]);

  const handleScroll = () => {
    if (suppressScrollRef.current) return;
    const node = scrollRef.current;
    if (!node) return;
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      const next = Math.round(node.scrollTop / PICKER_ROW);
      const clamped = clampInt(next, 0, max);
      // snap
      const target = clamped * PICKER_ROW;
      if (Math.abs(node.scrollTop - target) > 1) {
        suppressScrollRef.current = true;
        node.scrollTo({ top: target, behavior: "smooth" });
        window.setTimeout(() => { suppressScrollRef.current = false; }, 200);
      }
      if (clamped !== value) onChange(clamped);
    }, 130);
  };

  const handleRowTap = (n) => {
    const node = scrollRef.current;
    if (!node) return;
    suppressScrollRef.current = true;
    node.scrollTo({ top: n * PICKER_ROW, behavior: "smooth" });
    window.setTimeout(() => { suppressScrollRef.current = false; }, 260);
    if (n !== value) onChange(n);
  };

  return (
    <div style={{ display: "grid", gap: 8, justifyItems: "center" }}>
      <style>{`
        .life-lockin-picker::-webkit-scrollbar { display: none; }
        .life-lockin-picker { scrollbar-width: none; -ms-overflow-style: none; }
      `}</style>
      <span
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: 2,
          textTransform: "uppercase",
          color: t.muted,
        }}
      >
        {label}
      </span>
      <div style={{ position: "relative", width: 78, height: PICKER_HEIGHT }}>
        <div
          ref={scrollRef}
          className="life-lockin-picker"
          onScroll={handleScroll}
          style={{
            height: PICKER_HEIGHT,
            overflowY: "auto",
            scrollSnapType: "y mandatory",
            WebkitOverflowScrolling: "touch",
            WebkitMaskImage:
              "linear-gradient(to bottom, transparent 0, black 30%, black 70%, transparent 100%)",
            maskImage:
              "linear-gradient(to bottom, transparent 0, black 30%, black 70%, transparent 100%)",
          }}
        >
          <div style={{ height: PICKER_ROW * PICKER_CENTER_OFFSET }} />
          {Array.from({ length: max + 1 }).map((_, n) => {
            const active = n === value;
            return (
              <div
                key={n}
                onClick={() => handleRowTap(n)}
                style={{
                  height: PICKER_ROW,
                  scrollSnapAlign: "center",
                  display: "grid",
                  placeItems: "center",
                  fontSize: active ? 26 : 20,
                  fontWeight: active ? 800 : 500,
                  fontFamily: "'SF Mono','JetBrains Mono',Menlo,monospace",
                  fontVariantNumeric: "tabular-nums",
                  color: active ? t.ink : t.muted,
                  opacity: active ? 1 : 0.55,
                  transition: "font-size 0.15s ease, color 0.15s ease, opacity 0.15s ease",
                  cursor: "pointer",
                  userSelect: "none",
                }}
              >
                {pad2(n)}
              </div>
            );
          })}
          <div style={{ height: PICKER_ROW * PICKER_CENTER_OFFSET }} />
        </div>
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: PICKER_ROW * PICKER_CENTER_OFFSET,
            left: -4,
            right: -4,
            height: PICKER_ROW,
            borderTop: `1px solid ${t.border}`,
            borderBottom: `1px solid ${t.border}`,
            background: `${t.green}0a`,
            pointerEvents: "none",
            borderRadius: 8,
          }}
        />
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------------
   ToolsLockInPage
---------------------------------------------------------------------------- */

export function ToolsLockInPage({ t, play, session, setSession }) {
  // Setup form state
  const [taskInputs, setTaskInputs] = useState([""]);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(30);
  const [seconds, setSeconds] = useState(0);
  const [breaksOpen, setBreaksOpen] = useState(false);
  const [breaksEnabled, setBreaksEnabled] = useState(false);
  const [breakCount, setBreakCount] = useState(1);
  const [shortBreakMinutes, setShortBreakMinutes] = useState(3);
  const [formError, setFormError] = useState("");
  const [tick, setTick] = useState(() => Date.now());

  // Restore form state when an existing session unwinds
  useEffect(() => {
    if (!session?.config) return;
    setTaskInputs(session.config.tasks?.length ? session.config.tasks : [""]);
    setHours(clampInt(session.config.hours, 0, 23));
    setMinutes(clampInt(session.config.minutes, 0, 59));
    setSeconds(clampInt(session.config.seconds, 0, 59));
    setBreaksEnabled((session.config.breakCount || 0) > 0);
    setBreaksOpen((session.config.breakCount || 0) > 0);
    setBreakCount(Math.max(1, Number(session.config.breakCount || 1)));
    const persistedBreakMs = Number(session.config.shortBreakMs || DEFAULT_SHORT_BREAK_MS);
    setShortBreakMinutes(clampInt(Math.round(persistedBreakMs / 60000), 1, 15));
  }, [session?.config]);

  // Timer tick
  useEffect(() => {
    if (!session || session.isPaused || session.isComplete) return;
    const interval = setInterval(() => {
      const now = Date.now();
      setTick(now);
      if (getPhaseRemainingMs(session, now) <= 0) {
        play("ok");
        setSession((current) => advanceSessionPhase(current));
      }
    }, 100);
    return () => clearInterval(interval);
  }, [play, session, setSession]);

  useEffect(() => {
    setTick(Date.now());
  }, [session]);

  const totalFocusMs = hours * 3600000 + minutes * 60000 + seconds * 1000;

  const activePhase = getActivePhase(session);
  const activePhaseRemainingMs = getPhaseRemainingMs(session, tick);
  const totalRemainingMs = getTotalRemainingMs(session, tick);
  const progressPercent = session?.totalPlannedMs
    ? Math.min(100, ((session.totalPlannedMs - totalRemainingMs) / session.totalPlannedMs) * 100)
    : 0;
  const hourglassTopFill = Math.max(0, 100 - progressPercent);
  const hourglassBottomFill = Math.max(0, progressPercent);
  const breakIndicators = session ? getBreakIndicators(session, tick) : [];
  const completedTaskSet = new Set(session?.completedTaskIndexes || []);

  /* ----- setup handlers ----- */

  const updateTask = (index, value) => {
    setTaskInputs((prev) => prev.map((task, i) => (i === index ? value : task)));
    if (formError) setFormError("");
  };
  const addTaskField = () => {
    play("tap");
    setTaskInputs((prev) => [...prev, ""]);
  };
  const removeTaskField = (index) => {
    play("tap");
    setTaskInputs((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== index)));
  };

  const handleLockIn = () => {
    const trimmed = taskInputs.map((t2) => t2.trim()).filter(Boolean);
    if (!trimmed.length) {
      setFormError("Add at least one task before you lock in.");
      play("err");
      return;
    }
    if (totalFocusMs <= 0) {
      setFormError("Set a duration before you lock in.");
      play("err");
      return;
    }
    const chosenBreakCount = breaksEnabled ? breakCount : 0;
    const chosenShortBreakMs = clampInt(shortBreakMinutes, 1, 15) * 60000;
    const shortestFocusBlock = totalFocusMs / (chosenBreakCount + 1);
    if (chosenBreakCount > 0 && shortestFocusBlock < 60000) {
      setFormError("Choose more time or fewer breaks so each focus block is at least a minute.");
      play("err");
      return;
    }
    setFormError("");
    play("ok");
    setSession(
      createLockInSession({
        tasks: trimmed,
        hours,
        minutes,
        seconds,
        breakCount: chosenBreakCount,
        shortBreakMs: chosenShortBreakMs,
      }),
    );
  };

  /* ----- running handlers ----- */

  const toggleTask = (index) => {
    play("tap");
    setSession((s) => {
      if (!s) return s;
      const done = new Set(s.completedTaskIndexes || []);
      if (done.has(index)) done.delete(index);
      else done.add(index);
      return { ...s, completedTaskIndexes: Array.from(done) };
    });
  };

  const handleExit = () => {
    play("tap");
    setSession(null);
    setTick(Date.now());
  };

  /* ----- render ----- */

  return (
    <div
      data-page-tag="#tools_lockin_page"
      style={{
        padding: "clamp(24px, 5vw, 48px) clamp(16px, 4vw, 28px)",
        maxWidth: 720,
        margin: "0 auto",
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
        Tools
      </p>
      <h2
        style={{
          margin: "0 0 10px",
          fontSize: 30,
          fontWeight: 700,
          color: t.ink,
          fontFamily: "-apple-system,'SF Pro Display','SF Pro Text','Helvetica Neue',Arial,sans-serif",
        }}
      >
        Lock In
      </h2>

      {!session && (
        <>
          <p
            style={{
              margin: "0 0 22px",
              color: t.mid,
              fontSize: 15,
              lineHeight: 1.85,
              fontFamily: "-apple-system,'SF Pro Display','SF Pro Text','Helvetica Neue',Arial,sans-serif",
            }}
          >
            A focus session for finishing real work. Pick your tasks, set a
            duration, lock in — and tick them off as you go.
          </p>

          <section
            style={{
              marginBottom: 22,
              padding: "18px 18px 16px",
              borderRadius: 22,
              border: `1px solid ${t.border}`,
              background: `linear-gradient(135deg, ${t.white} 0%, ${t.greenLt} 160%)`,
              boxShadow: `0 14px 30px ${t.green}10`,
            }}
          >
            <p style={{ margin: "0 0 8px", color: t.ink, fontSize: 15, fontWeight: 700 }}>
              One rule
            </p>
            <p style={{ margin: "0 0 8px", color: t.mid, fontSize: 13.5, lineHeight: 1.7 }}>
              Once you press <strong style={{ color: t.ink }}>Lock In</strong>, stay
              with the session until the hourglass finishes. Handle the bathroom,
              water, and anything urgent first.
            </p>
            <p style={{ margin: 0, color: t.muted, fontSize: 12.5, lineHeight: 1.7 }}>
              There is no pause. Tap a task to cross it off as you finish it.
            </p>
          </section>

          {/* Setup card */}
          <section
            style={{
              display: "grid",
              gap: 20,
              padding: "20px 18px",
              borderRadius: 22,
              border: `1px solid ${t.border}`,
              background: t.white,
              boxShadow: `0 14px 30px ${t.green}0c`,
            }}
          >
            {/* Tasks */}
            <div>
              <p style={{ margin: "0 0 4px", color: t.ink, fontSize: 15, fontWeight: 700 }}>
                Tasks
              </p>
              <p style={{ margin: "0 0 12px", color: t.mid, fontSize: 13, lineHeight: 1.7 }}>
                What do you want to finish in this session?
              </p>
              <div style={{ display: "grid", gap: 8 }}>
                {taskInputs.map((task, index) => (
                  <div key={`task_${index}`} style={{ display: "flex", gap: 8 }}>
                    <input
                      type="text"
                      value={task}
                      onChange={(event) => updateTask(index, event.target.value)}
                      placeholder={`Task ${index + 1}`}
                      style={{
                        flex: 1,
                        minWidth: 0,
                        minHeight: 46,
                        padding: "12px 14px",
                        border: `1px solid ${t.border}`,
                        borderRadius: 12,
                        fontSize: 16,
                        color: t.ink,
                        background: t.light,
                        fontFamily: "inherit",
                        outlineColor: t.green,
                      }}
                    />
                    {taskInputs.length > 1 && (
                      <button
                        type="button"
                        aria-label="Remove task"
                        onClick={() => removeTaskField(index)}
                        style={{
                          width: 46,
                          minHeight: 46,
                          borderRadius: 12,
                          border: `1px solid ${t.border}`,
                          background: t.white,
                          color: t.muted,
                          cursor: "pointer",
                          fontSize: 18,
                          fontWeight: 700,
                          lineHeight: 1,
                        }}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addTaskField}
                style={{
                  marginTop: 10,
                  minHeight: 44,
                  padding: "10px 14px",
                  borderRadius: 12,
                  border: `1px dashed ${t.green}`,
                  background: t.greenLt,
                  color: t.green,
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 700,
                  width: "100%",
                }}
              >
                + Add task
              </button>
            </div>

            {/* Duration */}
            <div>
              <p style={{ margin: "0 0 4px", color: t.ink, fontSize: 15, fontWeight: 700 }}>
                Duration
              </p>
              <p style={{ margin: "0 0 10px", color: t.mid, fontSize: 13, lineHeight: 1.7 }}>
                Scroll or tap to choose how long you want to lock in.
              </p>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 14,
                  padding: "8px 0",
                  background: t.light,
                  borderRadius: 16,
                  border: `1px solid ${t.border}`,
                }}
              >
                <ScrollPicker t={t} value={hours} max={23} label="Hours" onChange={setHours} />
                <ScrollPicker t={t} value={minutes} max={59} label="Minutes" onChange={setMinutes} />
                <ScrollPicker t={t} value={seconds} max={59} label="Seconds" onChange={setSeconds} />
              </div>
              <p
                style={{
                  margin: "10px 0 0",
                  textAlign: "center",
                  color: t.muted,
                  fontSize: 12.5,
                  fontWeight: 700,
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
                }}
              >
                Total · {formatMinutesLabel(totalFocusMs)}
              </p>
            </div>

            {/* Breaks — collapsible */}
            <div
              style={{
                borderRadius: 16,
                border: `1px solid ${t.border}`,
                background: t.light,
                overflow: "hidden",
              }}
            >
              <button
                type="button"
                onClick={() => {
                  play("tap");
                  setBreaksOpen((v) => !v);
                }}
                aria-expanded={breaksOpen}
                style={{
                  width: "100%",
                  minHeight: 48,
                  padding: "12px 16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  background: "transparent",
                  border: "none",
                  color: t.ink,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span>Breaks</span>
                  <span
                    style={{
                      fontSize: 11.5,
                      color: t.muted,
                      fontWeight: 600,
                    }}
                  >
                    {breaksEnabled
                      ? `${breakCount} × ${shortBreakMinutes} min`
                      : "Off"}
                  </span>
                </span>
                <span
                  aria-hidden
                  style={{
                    color: t.muted,
                    fontSize: 14,
                    transform: breaksOpen ? "rotate(90deg)" : "rotate(0deg)",
                    transition: "transform 0.2s ease",
                  }}
                >
                  ›
                </span>
              </button>

              {breaksOpen && (
                <div style={{ padding: "4px 16px 16px", display: "grid", gap: 12 }}>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {[
                      { label: "No breaks", value: false },
                      { label: "With breaks", value: true },
                    ].map((option) => {
                      const active = breaksEnabled === option.value;
                      return (
                        <button
                          key={option.label}
                          type="button"
                          onClick={() => {
                            play("tap");
                            setBreaksEnabled(option.value);
                          }}
                          style={{
                            flex: 1,
                            minHeight: 42,
                            padding: "10px 12px",
                            borderRadius: 10,
                            border: `1px solid ${active ? t.green : t.border}`,
                            background: active ? t.greenLt : t.white,
                            color: active ? t.green : t.ink,
                            fontSize: 13,
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>

                  {breaksEnabled && (
                    <>
                      <div>
                        <p
                          style={{
                            margin: "0 0 6px",
                            color: t.muted,
                            fontSize: 11,
                            fontWeight: 700,
                            letterSpacing: 1.5,
                            textTransform: "uppercase",
                          }}
                        >
                          How many
                        </p>
                        <div style={{ display: "flex", gap: 8 }}>
                          {BREAK_COUNT_OPTIONS.map((n) => {
                            const active = breakCount === n;
                            return (
                              <button
                                key={n}
                                type="button"
                                onClick={() => {
                                  play("tap");
                                  setBreakCount(n);
                                }}
                                style={{
                                  flex: 1,
                                  minHeight: 42,
                                  padding: "10px 12px",
                                  borderRadius: 10,
                                  border: `1px solid ${active ? t.green : t.border}`,
                                  background: active ? t.green : t.white,
                                  color: active ? t.skin : t.ink,
                                  fontSize: 14,
                                  fontWeight: 700,
                                  cursor: "pointer",
                                }}
                              >
                                {n}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      <div>
                        <p
                          style={{
                            margin: "0 0 6px",
                            color: t.muted,
                            fontSize: 11,
                            fontWeight: 700,
                            letterSpacing: 1.5,
                            textTransform: "uppercase",
                          }}
                        >
                          Break length
                        </p>
                        <div style={{ display: "flex", gap: 8 }}>
                          {BREAK_LENGTH_OPTIONS_MINUTES.map((mins) => {
                            const active = shortBreakMinutes === mins;
                            return (
                              <button
                                key={mins}
                                type="button"
                                onClick={() => {
                                  play("tap");
                                  setShortBreakMinutes(mins);
                                }}
                                style={{
                                  flex: 1,
                                  minHeight: 42,
                                  padding: "10px 12px",
                                  borderRadius: 10,
                                  border: `1px solid ${active ? t.green : t.border}`,
                                  background: active ? t.greenLt : t.white,
                                  color: active ? t.green : t.ink,
                                  fontSize: 13,
                                  fontWeight: 700,
                                  cursor: "pointer",
                                }}
                              >
                                {mins} min
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {formError ? (
              <p style={{ margin: 0, color: t.red, fontSize: 12.5, fontWeight: 700 }}>
                {formError}
              </p>
            ) : null}

            <button
              type="button"
              onClick={handleLockIn}
              style={{
                minHeight: 52,
                padding: "14px 18px",
                borderRadius: 14,
                border: "none",
                background: t.green,
                color: t.skin,
                fontSize: 16,
                fontWeight: 800,
                letterSpacing: 0.5,
                cursor: "pointer",
                boxShadow: `0 14px 30px ${t.green}26`,
              }}
            >
              Lock In
            </button>
          </section>
        </>
      )}

      {session && (
        <section style={{ display: "grid", gap: 20 }}>
          <style>{`
            @keyframes lockInGlow {
              0%, 100% { opacity: 0.45; transform: scale(1); }
              50%       { opacity: 0.85; transform: scale(1.08); }
            }
            @keyframes lockInGrain1 {
              0%   { transform: translateY(0px);   opacity: 0; }
              8%   { opacity: 1; }
              85%  { opacity: 0.9; }
              100% { transform: translateY(56px);  opacity: 0; }
            }
            @keyframes lockInGrain2 {
              0%   { transform: translateY(0px);   opacity: 0; }
              12%  { opacity: 0.8; }
              82%  { opacity: 0.7; }
              100% { transform: translateY(52px);  opacity: 0; }
            }
            @keyframes lockInGrain3 {
              0%   { transform: translateY(0px);   opacity: 0; }
              6%   { opacity: 0.9; }
              88%  { opacity: 0.6; }
              100% { transform: translateY(60px);  opacity: 0; }
            }
            @keyframes lockInShimmer {
              0%, 100% { opacity: 0.10; }
              50%       { opacity: 0.22; }
            }
            @keyframes lockInComplete {
              0%   { transform: rotate(0deg); }
              35%  { transform: rotate(185deg); }
              50%  { transform: rotate(176deg); }
              65%  { transform: rotate(182deg); }
              80%  { transform: rotate(178deg); }
              100% { transform: rotate(180deg); }
            }
            .life-lockin-hourglass {
              transition: transform 0.6s cubic-bezier(.2,.8,.2,1);
              filter: drop-shadow(0 4px 16px rgba(0,0,0,0.10));
            }
            .life-lockin-hourglass.is-complete {
              animation: lockInComplete 1.4s cubic-bezier(.4,0,.2,1) forwards;
            }
            @media (prefers-reduced-motion: reduce) {
              .life-lockin-hourglass,
              .life-lockin-hourglass * {
                animation: none !important;
                transition: none !important;
              }
            }
          `}</style>

          {/* Hourglass + timer */}
          <section
            style={{
              padding: "24px 20px 22px",
              borderRadius: 22,
              border: `1px solid ${t.border}`,
              background: `linear-gradient(160deg, ${t.white} 0%, ${t.greenLt} 170%)`,
              boxShadow: session.isComplete
                ? `0 20px 40px ${t.green}18`
                : `0 14px 32px ${t.green}10`,
            }}
          >
            <div style={{ textAlign: "center", marginBottom: 14 }}>
              <p
                style={{
                  margin: "0 0 6px",
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: 2.5,
                  textTransform: "uppercase",
                  color: session.isComplete
                    ? t.green
                    : activePhase?.type === "break"
                      ? t.muted
                      : t.green,
                }}
              >
                {session.isComplete
                  ? "Finished"
                  : activePhase?.type === "break"
                    ? activePhase.label
                    : "Locked in"}
              </p>
              <p
                style={{
                  margin: 0,
                  color: t.mid,
                  fontSize: 13,
                  lineHeight: 1.65,
                  maxWidth: 340,
                  marginLeft: "auto",
                  marginRight: "auto",
                }}
              >
                {session.isComplete
                  ? "The hourglass is finished. Nice work."
                  : activePhase?.type === "break"
                    ? "Short break. Stretch, breathe, come back."
                    : "Stay with your work until the hourglass empties."}
              </p>
            </div>

            <div style={{ display: "grid", gap: 20, justifyItems: "center", textAlign: "center" }}>
              <div
                style={{
                  position: "relative",
                  width: 200,
                  height: 260,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {/* Ambient glow behind hourglass */}
                <div
                  aria-hidden
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "50%",
                    background: `radial-gradient(ellipse 60% 55% at 50% 52%, ${t.green}28 0%, transparent 70%)`,
                    animation: !session.isComplete
                      ? "lockInGlow 3.6s ease-in-out infinite"
                      : "none",
                  }}
                />
                <svg
                  className={`life-lockin-hourglass${session.isComplete ? " is-complete" : ""}`}
                  width="200"
                  height="260"
                  viewBox="0 0 200 260"
                  fill="none"
                  style={{ position: "relative", zIndex: 1 }}
                  aria-hidden
                >
                  <defs>
                    {/* Top-bulb clip path (matches frame curve) */}
                    <clipPath id="lockInTopBulb">
                      <polygon points="38,34 162,34 111,122 89,122" />
                    </clipPath>
                    {/* Bottom-bulb clip path */}
                    <clipPath id="lockInBottomBulb">
                      <polygon points="89,132 111,132 162,218 38,218" />
                    </clipPath>

                    {/* Sand gradient — horizontal depth */}
                    <linearGradient id="lockInSandH" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%"   stopColor={t.green} stopOpacity="0.75" />
                      <stop offset="35%"  stopColor={t.green} stopOpacity="1" />
                      <stop offset="65%"  stopColor={t.green} stopOpacity="1" />
                      <stop offset="100%" stopColor={t.green} stopOpacity="0.70" />
                    </linearGradient>
                    {/* Sand gradient — vertical shading */}
                    <linearGradient id="lockInSandV" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor={t.green} stopOpacity="0.88" />
                      <stop offset="100%" stopColor={t.green} stopOpacity="1" />
                    </linearGradient>
                    {/* Bottom sand glow gradient */}
                    <radialGradient id="lockInSandGlow" cx="50%" cy="0%" r="60%">
                      <stop offset="0%"   stopColor={t.green} stopOpacity="0.55" />
                      <stop offset="100%" stopColor={t.green} stopOpacity="0" />
                    </radialGradient>

                    {/* Glass frame fill gradient */}
                    <linearGradient id="lockInGlass" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%"   stopColor={t.green} stopOpacity="0.06" />
                      <stop offset="50%"  stopColor={t.green} stopOpacity="0.02" />
                      <stop offset="100%" stopColor={t.green} stopOpacity="0.05" />
                    </linearGradient>

                    {/* Top cap gradient */}
                    <linearGradient id="lockInCapTop" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor={t.green} stopOpacity="1" />
                      <stop offset="100%" stopColor={t.green} stopOpacity="0.72" />
                    </linearGradient>
                    {/* Bottom cap gradient */}
                    <linearGradient id="lockInCapBot" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor={t.green} stopOpacity="0.72" />
                      <stop offset="100%" stopColor={t.green} stopOpacity="1" />
                    </linearGradient>

                    {/* Drop shadow filter for caps */}
                    <filter id="lockInCapShadow" x="-5%" y="-20%" width="110%" height="160%">
                      <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor={t.green} floodOpacity="0.30" />
                    </filter>
                    {/* Glow filter for active sand */}
                    <filter id="lockInSandFilter" x="-10%" y="-10%" width="120%" height="120%">
                      <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  {/* ── Glass body fill ─────────────────────────────────────── */}
                  <path
                    d="M44 34 C44 60 50 80 68 102 C80 116 89 122 89 128 C89 134 80 140 68 154 C50 176 44 196 44 222 H156 C156 196 150 176 132 154 C120 140 111 134 111 128 C111 122 120 116 132 102 C150 80 156 60 156 34 Z"
                    fill="url(#llGlass)"
                  />

                  {/* ── Top bulb sand ────────────────────────────────────────── */}
                  <g clipPath="url(#llTopBulb)">
                    <rect
                      x="28"
                      y={34 + (88 * (100 - hourglassTopFill)) / 100}
                      width="144"
                      height={Math.max(0, (88 * hourglassTopFill) / 100)}
                      fill="url(#llSandH)"
                      filter="url(#llSandFilter)"
                      style={{ transition: "y 0.25s linear, height 0.25s linear" }}
                    />
                    {/* Sand surface highlight (shimmer line at top of sand) */}
                    {hourglassTopFill > 3 && (
                      <ellipse
                        cx="100"
                        cy={34 + (88 * (100 - hourglassTopFill)) / 100 + 2}
                        rx={Math.max(5, 38 * (hourglassTopFill / 100))}
                        ry="3"
                        fill="white"
                        fillOpacity="0.28"
                        style={{
                          transition: "cx 0.25s linear, cy 0.25s linear, rx 0.25s linear",
                          animation: "lockInShimmer 2.4s ease-in-out infinite",
                        }}
                      />
                    )}
                  </g>

                  {/* ── Bottom bulb sand ─────────────────────────────────────── */}
                  <g clipPath="url(#llBottomBulb)">
                    {/* Glow under sand surface */}
                    {hourglassBottomFill > 3 && (
                      <ellipse
                        cx="100"
                        cy={218 - (88 * hourglassBottomFill) / 100 + 6}
                        rx={Math.max(5, 40 * (hourglassBottomFill / 100))}
                        ry="6"
                        fill="url(#llSandGlow)"
                        style={{ transition: "cy 0.25s linear, rx 0.25s linear" }}
                      />
                    )}
                    <rect
                      x="28"
                      y={218 - (88 * hourglassBottomFill) / 100}
                      width="144"
                      height={Math.max(0, (88 * hourglassBottomFill) / 100)}
                      fill="url(#llSandV)"
                      filter="url(#llSandFilter)"
                      style={{ transition: "y 0.25s linear, height 0.25s linear" }}
                    />
                    {/* Bottom sand surface shimmer */}
                    {hourglassBottomFill > 3 && (
                      <ellipse
                        cx="100"
                        cy={218 - (88 * hourglassBottomFill) / 100 + 3}
                        rx={Math.max(5, 36 * (hourglassBottomFill / 100))}
                        ry="2.5"
                        fill="white"
                        fillOpacity="0.20"
                        style={{
                          transition: "cy 0.25s linear, rx 0.25s linear",
                          animation: "lockInShimmer 3s ease-in-out infinite 0.6s",
                        }}
                      />
                    )}
                  </g>

                  {/* ── Falling sand particles through neck ─────────────────── */}
                  {!session.isComplete &&
                    hourglassTopFill > 1 &&
                    hourglassBottomFill < 99 && (
                      <g style={{ transformOrigin: "100px 127px" }}>
                        <circle
                          cx="100" cy="124" r="2.2"
                          fill={t.green} fillOpacity="0.95"
                          style={{ animation: "lockInGrain1 0.72s ease-in infinite" }}
                        />
                        <circle
                          cx="99.2" cy="124" r="1.6"
                          fill={t.green} fillOpacity="0.75"
                          style={{ animation: "lockInGrain2 0.72s ease-in 0.24s infinite" }}
                        />
                        <circle
                          cx="100.5" cy="124" r="1.9"
                          fill={t.green} fillOpacity="0.85"
                          style={{ animation: "lockInGrain3 0.72s ease-in 0.12s infinite" }}
                        />
                      </g>
                    )}

                  {/* ── Frame outline ─────────────────────────────────────────── */}
                  <path
                    d="M44 34 C44 60 50 80 68 102 C80 116 89 122 89 128 C89 134 80 140 68 154 C50 176 44 196 44 222 H156 C156 196 150 176 132 154 C120 140 111 134 111 128 C111 122 120 116 132 102 C150 80 156 60 156 34 Z"
                    stroke={t.green}
                    strokeWidth="3"
                    strokeLinejoin="round"
                    fill="none"
                  />

                  {/* ── Glass highlight — left-side reflection ───────────────── */}
                  <path
                    d="M56 42 C56 62 62 78 76 98 C84 110 88 118 88 128"
                    stroke="white"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeOpacity="0.22"
                    fill="none"
                    style={{ animation: "lockInShimmer 4s ease-in-out infinite 1s" }}
                  />

                  {/* ── Top cap ───────────────────────────────────────────────── */}
                  <rect
                    x="30" y="22" width="140" height="14" rx="7"
                    fill="url(#llCapTop)"
                    filter="url(#llCapShadow)"
                  />
                  {/* Cap highlight */}
                  <rect x="40" y="23" width="72" height="5" rx="2.5"
                    fill="white" fillOpacity="0.30" />

                  {/* ── Bottom cap ────────────────────────────────────────────── */}
                  <rect
                    x="30" y="220" width="140" height="14" rx="7"
                    fill="url(#llCapBot)"
                    filter="url(#llCapShadow)"
                  />
                  {/* Cap highlight */}
                  <rect x="40" y="221" width="72" height="5" rx="2.5"
                    fill="white" fillOpacity="0.18" />

                  {/* ── Neck ring accent ──────────────────────────────────────── */}
                  <ellipse cx="100" cy="128" rx="11" ry="3.5"
                    stroke={t.green} strokeWidth="2" strokeOpacity="0.50" fill="none" />
                </svg>
              </div>

              <div style={{ display: "grid", gap: 4 }}>
                <div
                  style={{
                    fontSize: "clamp(32px, 9vw, 44px)",
                    fontWeight: 800,
                    letterSpacing: 1.5,
                    fontFamily: "'SF Mono','JetBrains Mono',Menlo,monospace",
                    color: t.ink,
                    fontVariantNumeric: "tabular-nums",
                    lineHeight: 1.05,
                  }}
                >
                  {formatCountdown(activePhaseRemainingMs)}
                </div>
                <div
                  style={{
                    color: t.muted,
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: 2,
                    textTransform: "uppercase",
                  }}
                >
                  {session.isComplete ? "Done" : activePhase?.label || "Preparing"}
                </div>
              </div>

              <div style={{ width: "100%", display: "grid", gap: 8 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    color: t.mid,
                    fontSize: 12.5,
                    lineHeight: 1.6,
                  }}
                >
                  <span>
                    Total remaining{" "}
                    <strong style={{ color: t.ink, fontVariantNumeric: "tabular-nums" }}>
                      {formatCountdown(totalRemainingMs)}
                    </strong>
                  </span>
                  <span style={{ color: t.muted, fontWeight: 700 }}>
                    {Math.round(progressPercent)}%
                  </span>
                </div>
                <div
                  aria-hidden
                  style={{
                    height: 8,
                    borderRadius: 999,
                    background: t.light,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${progressPercent}%`,
                      height: "100%",
                      borderRadius: 999,
                      background: `linear-gradient(90deg, ${t.green} 0%, ${t.greenAlt || t.green} 100%)`,
                      transition: "width 0.25s ease",
                    }}
                  />
                </div>
              </div>

              {breakIndicators.length > 0 && (
                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 8,
                    justifyContent: "center",
                  }}
                >
                  {breakIndicators.map((ind, i) => {
                    const active = ind.status === "active";
                    const done = ind.status === "done";
                    return (
                      <span
                        key={`${ind.label}_${i}`}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "6px 10px",
                          borderRadius: 999,
                          border: `1px solid ${active ? t.green : t.border}`,
                          background: active ? t.greenLt : done ? t.light : t.white,
                          color: done ? t.muted : active ? t.green : t.mid,
                          fontSize: 11.5,
                          fontWeight: 700,
                          letterSpacing: 0.3,
                        }}
                      >
                        <strong>{ind.label}</strong>
                        <span style={{ fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>
                          {done
                            ? "done"
                            : active
                              ? `${formatShortCountdown(ind.ms)} left`
                              : `in ${formatShortCountdown(ind.ms)}`}
                        </span>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          {/* Tasks — tap to cross off */}
          <section
            style={{
              padding: "18px 18px 16px",
              borderRadius: 22,
              border: `1px solid ${t.border}`,
              background: t.white,
              boxShadow: `0 12px 28px ${t.green}08`,
            }}
          >
            <p
              style={{
                margin: "0 0 4px",
                color: t.muted,
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: 2,
                textTransform: "uppercase",
              }}
            >
              Tasks · tap to tick off
            </p>
            <p style={{ margin: "0 0 12px", color: t.mid, fontSize: 12.5 }}>
              {completedTaskSet.size} of {session.tasks.length} done
            </p>
            <div style={{ display: "grid", gap: 8 }}>
              {session.tasks.map((task, index) => {
                const isDone = completedTaskSet.has(index);
                return (
                  <button
                    key={`${task}_${index}`}
                    type="button"
                    onClick={() => toggleTask(index)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      width: "100%",
                      minHeight: 52,
                      padding: "12px 14px",
                      borderRadius: 14,
                      border: `1px solid ${isDone ? t.green : t.border}`,
                      background: isDone ? t.greenLt : t.light,
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "background 0.2s ease, border-color 0.2s ease",
                    }}
                  >
                    <span
                      aria-hidden
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        border: `1.5px solid ${isDone ? t.green : t.border}`,
                        background: isDone ? t.green : "transparent",
                        color: t.skin,
                        display: "grid",
                        placeItems: "center",
                        fontSize: 13,
                        fontWeight: 800,
                        flexShrink: 0,
                        transition: "background 0.2s ease",
                      }}
                    >
                      {isDone ? "✓" : ""}
                    </span>
                    <span
                      style={{
                        color: isDone ? t.muted : t.ink,
                        fontSize: 14.5,
                        lineHeight: 1.5,
                        textDecoration: isDone ? "line-through" : "none",
                        transition: "color 0.2s ease",
                      }}
                    >
                      {task}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <button
            type="button"
            onClick={handleExit}
            style={{
              minHeight: 46,
              padding: "12px 18px",
              borderRadius: 14,
              border: `1px solid ${t.border}`,
              background: t.white,
              color: t.mid,
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {session.isComplete ? "Finish" : "Exit session"}
          </button>
        </section>
      )}
    </div>
  );
}

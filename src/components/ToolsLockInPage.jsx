import { useEffect, useState } from "react";

const BREAK_OPTIONS = [1, 2, 3];
const BREAK_LENGTH_OPTIONS_MINUTES = [2, 3, 5];
const DEFAULT_SHORT_BREAK_MS = 3 * 60 * 1000;

function onlyDigits(value) {
  return String(value || "").replace(/\D/g, "").slice(0, 2);
}

function pad2(value) {
  return String(value || "").padStart(2, "0").slice(-2);
}

function clampInt(value, min, max) {
  const num = Number(value);
  if (!Number.isFinite(num)) return min;
  return Math.max(min, Math.min(max, Math.floor(num)));
}

function sanitizeTimePart(key, rawValue) {
  const digits = onlyDigits(rawValue);
  if (!digits) return "";

  const limits = {
    hours: 99,
    minutes: 59,
    seconds: 59,
    hundredths: 99,
  };

  const max = limits[key] ?? 99;
  return String(clampInt(digits, 0, max));
}

function buildFocusAndBreakPhases(totalFocusMs, breakCount, shortBreakMs) {
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

function formatCountdown(totalMs) {
  const safeMs = Math.max(0, Math.floor(Number(totalMs) || 0));
  const hours = Math.floor(safeMs / 3600000);
  const minutes = Math.floor((safeMs % 3600000) / 60000);
  const seconds = Math.floor((safeMs % 60000) / 1000);
  const hundredths = Math.floor((safeMs % 1000) / 10);

  return [hours, minutes, seconds, hundredths].map((part) => pad2(part)).join(":");
}

function formatMinutesLabel(totalMs) {
  const totalMinutes = Math.round(totalMs / 60000);
  if (totalMinutes < 60) return `${totalMinutes} min`;

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (!minutes) return `${hours} hr`;
  return `${hours} hr ${minutes} min`;
}

function getBreakOffsets(totalFocusMs, breakCount, shortBreakMs) {
  if (!breakCount || !totalFocusMs) return [];

  const phases = buildFocusAndBreakPhases(totalFocusMs, breakCount, shortBreakMs);
  let focusElapsedMs = 0;
  const offsets = [];

  phases.forEach((phase) => {
    if (phase.type === "focus") {
      focusElapsedMs += phase.durationMs;
      return;
    }

    offsets.push(focusElapsedMs);
  });

  return offsets;
}

function getActivePhase(session) {
  return session?.phases?.[session.currentPhaseIndex] || null;
}

function getPhaseRemainingMs(session, now = Date.now()) {
  if (!session) return 0;
  if (session.isComplete) return 0;
  if (session.isPaused || !session.phaseStartedAt) {
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

function createLockInSession({ tasks, timeParts, breakCount, shortBreakMs }) {
  const hours = Number(timeParts.hours || 0);
  const minutes = Number(timeParts.minutes || 0);
  const seconds = Number(timeParts.seconds || 0);
  const hundredths = Number(timeParts.hundredths || 0);
  const totalFocusMs =
    hours * 3600000 +
    minutes * 60000 +
    seconds * 1000 +
    hundredths * 10;

  const phases = buildFocusAndBreakPhases(totalFocusMs, breakCount, shortBreakMs);
  const totalBreakMs = breakCount * shortBreakMs;

  return {
    id: `lockin_${Date.now()}`,
    tasks,
    config: {
      tasks,
      breakCount,
      timeParts,
      shortBreakMs,
    },
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

export function ToolsLockInPage({
  t,
  play,
  session,
  setSession,
}) {
  const [taskInputs, setTaskInputs] = useState([""]);
  const [timeParts, setTimeParts] = useState({
    hours: "00",
    minutes: "30",
    seconds: "00",
    hundredths: "00",
  });
  const [breaksEnabled, setBreaksEnabled] = useState(false);
  const [breakCount, setBreakCount] = useState(1);
  const [shortBreakMinutes, setShortBreakMinutes] = useState(3);
  const [formError, setFormError] = useState("");
  const [tick, setTick] = useState(() => Date.now());

  useEffect(() => {
    if (!session?.config) return;

    setTaskInputs(session.config.tasks?.length ? session.config.tasks : [""]);
    setTimeParts({
      hours: pad2(session.config.timeParts?.hours || 0),
      minutes: pad2(session.config.timeParts?.minutes || 0),
      seconds: pad2(session.config.timeParts?.seconds || 0),
      hundredths: pad2(session.config.timeParts?.hundredths || 0),
    });
    setBreaksEnabled((session.config.breakCount || 0) > 0);
    setBreakCount(Math.max(1, Number(session.config.breakCount || 1)));
    const persistedBreakMs = Number(session.config.shortBreakMs || DEFAULT_SHORT_BREAK_MS);
    setShortBreakMinutes(clampInt(Math.round(persistedBreakMs / 60000), 1, 15));
  }, [session?.config]);

  useEffect(() => {
    if (!session || session.isPaused || session.isComplete) return;

    const interval = setInterval(() => {
      const now = Date.now();
      setTick(now);

      if (getPhaseRemainingMs(session, now) <= 0) {
        play("ok");
        setSession((currentSession) => advanceSessionPhase(currentSession));
      }
    }, 60);

    return () => clearInterval(interval);
  }, [play, session, setSession]);

  useEffect(() => {
    setTick(Date.now());
  }, [session]);

  const updateTask = (index, value) => {
    setTaskInputs((prev) => prev.map((task, taskIndex) => (taskIndex === index ? value : task)));
    if (formError) setFormError("");
  };

  const addTaskField = () => {
    play("tap");
    setTaskInputs((prev) => [...prev, ""]);
  };

  const removeTaskField = (index) => {
    play("tap");
    setTaskInputs((prev) => {
      if (prev.length === 1) return prev;
      return prev.filter((_, taskIndex) => taskIndex !== index);
    });
  };

  const updateTimePart = (key, value) => {
    setTimeParts((prev) => ({ ...prev, [key]: sanitizeTimePart(key, value) }));
    if (formError) setFormError("");
  };

  const totalFocusMs =
    Number(timeParts.hours || 0) * 3600000 +
    Number(timeParts.minutes || 0) * 60000 +
    Number(timeParts.seconds || 0) * 1000 +
    Number(timeParts.hundredths || 0) * 10;

  const activePhase = getActivePhase(session);
  const activePhaseRemainingMs = getPhaseRemainingMs(session, tick);
  const totalRemainingMs = getTotalRemainingMs(session, tick);
  const progressPercent = session?.totalPlannedMs
    ? Math.min(100, ((session.totalPlannedMs - totalRemainingMs) / session.totalPlannedMs) * 100)
    : 0;
  const hourglassTopFill = Math.max(0, 100 - progressPercent);
  const hourglassBottomFill = Math.max(0, progressPercent);

  const validateBeforeLockIn = () => {
    const trimmedTasks = taskInputs.map((task) => task.trim()).filter(Boolean);
    if (!trimmedTasks.length) {
      setFormError("Add at least one task before you lock in.");
      play("err");
      return null;
    }
    if (totalFocusMs <= 0) {
      setFormError("Choose a time before you lock in.");
      play("err");
      return null;
    }

    const chosenBreakCount = breaksEnabled ? breakCount : 0;
    const chosenShortBreakMs = clampInt(shortBreakMinutes, 1, 15) * 60000;
    const shortestFocusBlock = totalFocusMs / (chosenBreakCount + 1);
    if (chosenBreakCount > 0 && shortestFocusBlock < 60000) {
      setFormError("Choose more time or fewer breaks so each focus block lasts at least one minute.");
      play("err");
      return null;
    }

    setFormError("");
    return createLockInSession({
      tasks: trimmedTasks,
      timeParts: {
        hours: pad2(timeParts.hours),
        minutes: pad2(timeParts.minutes),
        seconds: pad2(timeParts.seconds),
        hundredths: pad2(timeParts.hundredths),
      },
      breakCount: chosenBreakCount,
      shortBreakMs: chosenShortBreakMs,
    });
  };

  const handleLockIn = () => {
    const nextSession = validateBeforeLockIn();
    if (!nextSession) return;
    play("ok");
    setSession(nextSession);
  };

  const handlePauseResume = () => {
    if (!session || session.isComplete) return;
    play("tap");

    if (session.isPaused) {
      setSession((currentSession) => ({
        ...currentSession,
        isPaused: false,
        phaseStartedAt: Date.now(),
      }));
      return;
    }

    const remaining = getPhaseRemainingMs(session, Date.now());
    setSession((currentSession) => ({
      ...currentSession,
      currentPhaseRemainingMs: remaining,
      phaseStartedAt: null,
      isPaused: true,
    }));
  };

  const handleReset = () => {
    play("tap");
    setSession(null);
    setTick(Date.now());
  };

  const shortBreakMs = clampInt(shortBreakMinutes, 1, 15) * 60000;
  const breakSummary = breaksEnabled
    ? `${breakCount} short ${breakCount === 1 ? "break" : "breaks"} of ${formatMinutesLabel(shortBreakMs)} each.`
    : "No breaks in this session.";
  const breakOffsets = breaksEnabled ? getBreakOffsets(totalFocusMs, breakCount, shortBreakMs) : [];

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
          margin: "0 0 12px",
          fontSize: 30,
          fontWeight: 700,
          color: t.ink,
          fontFamily: "Georgia,serif",
        }}
      >
        Lock In
      </h2>
      <p
        style={{
          margin: "0 0 18px",
          color: t.mid,
          fontSize: 15,
          lineHeight: 1.85,
          fontFamily: "Georgia,serif",
        }}
      >
        Want to complete some tasks? You came to the right tool.
      </p>

      <section
        className="life-card-hover"
        style={{
          marginBottom: 22,
          padding: "18px 18px 16px",
          borderRadius: 22,
          border: `1px solid ${t.border}`,
          background: `linear-gradient(135deg, ${t.white} 0%, ${t.greenLt} 150%)`,
          boxShadow: `0 18px 38px ${t.green}12`,
        }}
      >
        <p style={{ margin: "0 0 8px", color: t.ink, fontSize: 16, fontWeight: 700 }}>
          There is one rule here.
        </p>
        <p style={{ margin: "0 0 10px", color: t.mid, fontSize: 13.5, lineHeight: 1.75 }}>
          Once you press <strong style={{ color: t.ink }}>Lock In</strong>, stay with the session until the timer and hourglass are finished. That is when you can switch to other things.
        </p>
        <p style={{ margin: 0, color: t.mid, fontSize: 13.5, lineHeight: 1.75 }}>
          Go to the toilet, eat first, drink water, and handle anything urgent before you begin.
        </p>
      </section>

      {!session && (
        <section
          className="life-card-hover"
          style={{
            display: "grid",
            gap: 18,
            padding: "18px 18px 20px",
            borderRadius: 22,
            border: `1px solid ${t.border}`,
            background: t.white,
            boxShadow: `0 14px 30px ${t.green}10`,
          }}
        >
          <div>
            <p style={{ margin: "0 0 6px", color: t.ink, fontSize: 16, fontWeight: 700 }}>
              Task list
            </p>
            <p style={{ margin: 0, color: t.mid, fontSize: 13, lineHeight: 1.7 }}>
              Write the tasks you want to finish in this session.
            </p>
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            {taskInputs.map((task, index) => (
              <div key={`task_${index}`} style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <input
                  type="text"
                  value={task}
                  onChange={(event) => updateTask(index, event.target.value)}
                  placeholder={`Task ${index + 1}`}
                  style={{
                    flex: 1,
                    minWidth: 220,
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
                    onClick={() => removeTaskField(index)}
                    style={{
                      minHeight: 46,
                      padding: "12px 14px",
                      borderRadius: 12,
                      border: `1px solid ${t.border}`,
                      background: t.white,
                      color: t.ink,
                      cursor: "pointer",
                      fontSize: 13,
                      fontWeight: 700,
                    }}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>

          <div>
            <button
              type="button"
              onClick={addTaskField}
              style={{
                minHeight: 44,
                padding: "10px 14px",
                borderRadius: 12,
                border: `1px solid ${t.green}`,
                background: t.greenLt,
                color: t.green,
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              Add more
            </button>
          </div>

          <div>
            <p style={{ margin: "0 0 6px", color: t.ink, fontSize: 16, fontWeight: 700 }}>
              Session time
            </p>
            <p style={{ margin: "0 0 12px", color: t.mid, fontSize: 13, lineHeight: 1.7 }}>
              Use the format ##:##:##:## for hours : minutes : seconds : milliseconds.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              {[
                { key: "hours", label: "Hours" },
                { key: "minutes", label: "Minutes" },
                { key: "seconds", label: "Seconds" },
                { key: "hundredths", label: "Milliseconds" },
              ].map((part, index) => (
                <div key={part.key} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ display: "grid", gap: 6 }}>
                    <span style={{ color: t.muted, fontSize: 11.5, fontWeight: 700 }}>{part.label}</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={2}
                      value={timeParts[part.key]}
                      onChange={(event) => updateTimePart(part.key, event.target.value)}
                      style={{
                        width: 62,
                        minHeight: 50,
                        textAlign: "center",
                        padding: "10px 8px",
                        border: `1px solid ${t.border}`,
                        borderRadius: 12,
                        fontSize: 18,
                        fontWeight: 700,
                        color: t.ink,
                        background: t.light,
                        fontFamily: "monospace",
                        outlineColor: t.green,
                      }}
                    />
                  </div>
                  {index < 3 && (
                    <span style={{ marginTop: 22, color: t.muted, fontSize: 22, fontWeight: 700 }}>:</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <p style={{ margin: "0 0 6px", color: t.ink, fontSize: 16, fontWeight: 700 }}>
              Breaks
            </p>
            <p style={{ margin: "0 0 12px", color: t.mid, fontSize: 13, lineHeight: 1.7 }}>
              Choose whether you want short breaks during the session.
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
              {[{ label: "No", value: false }, { label: "Yes", value: true }].map((option) => {
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
                      minHeight: 44,
                      padding: "10px 16px",
                      borderRadius: 12,
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
              <div style={{ display: "grid", gap: 10 }}>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {BREAK_OPTIONS.map((option) => {
                    const active = breakCount === option;
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => {
                          play("tap");
                          setBreakCount(option);
                        }}
                        style={{
                          minHeight: 44,
                          minWidth: 52,
                          padding: "10px 16px",
                          borderRadius: 12,
                          border: `1px solid ${active ? t.green : t.border}`,
                          background: active ? t.green : t.white,
                          color: active ? t.skin : t.ink,
                          fontSize: 13,
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>

                <div>
                  <p style={{ margin: "2px 0 8px", color: t.mid, fontSize: 12.5, lineHeight: 1.6 }}>
                    Short break length
                  </p>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
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
                            minHeight: 44,
                            minWidth: 80,
                            padding: "10px 14px",
                            borderRadius: 12,
                            border: `1px solid ${active ? t.green : t.border}`,
                            background: active ? t.greenLt : t.white,
                            color: active ? t.green : t.ink,
                            fontSize: 12.5,
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
              </div>
            )}
            <p style={{ margin: "12px 0 0", color: t.muted, fontSize: 12.5, lineHeight: 1.7 }}>
              {breakSummary}
            </p>
            {breakOffsets.length > 0 && (
              <p style={{ margin: "8px 0 0", color: t.mid, fontSize: 12.5, lineHeight: 1.7 }}>
                Breaks are spaced evenly through your focus time. {breakOffsets.length === 1
                  ? `Your break starts after ${formatCountdown(breakOffsets[0])} of focus.`
                  : `Your breaks start after ${breakOffsets.map((offset) => formatCountdown(offset)).join(", ")} of focus.`} Each break lasts {formatCountdown(shortBreakMs)}.
              </p>
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
              minHeight: 48,
              padding: "12px 18px",
              borderRadius: 14,
              border: "none",
              background: t.green,
              color: t.skin,
              fontSize: 15,
              fontWeight: 800,
              cursor: "pointer",
              boxShadow: `0 14px 30px ${t.green}22`,
            }}
          >
            Lock In
          </button>
        </section>
      )}

      {session && (
        <section style={{ display: "grid", gap: 20 }}>
          <style>{`
            @keyframes lifeLockinSandFall {
              0%   { transform: translateY(-2px) scaleY(0.92); opacity: 0.85; }
              50%  { transform: translateY(6px)  scaleY(1.08); opacity: 1; }
              100% { transform: translateY(-2px) scaleY(0.92); opacity: 0.85; }
            }
            @keyframes lifeLockinGlow {
              0%, 100% { opacity: 0.55; transform: scale(1); }
              50%      { opacity: 0.9;  transform: scale(1.04); }
            }
            @keyframes lifeLockinGrain {
              0%   { transform: translateY(0);     opacity: 0; }
              10%  { opacity: 1; }
              100% { transform: translateY(42px);  opacity: 0; }
            }
            @keyframes lifeLockinComplete {
              0%   { transform: rotate(0deg); }
              40%  { transform: rotate(182deg); }
              100% { transform: rotate(180deg); }
            }
            .life-lockin-hourglass {
              transition: transform 0.6s cubic-bezier(.2,.8,.2,1);
            }
            .life-lockin-hourglass.is-complete {
              animation: lifeLockinComplete 1.1s cubic-bezier(.4,0,.2,1) forwards;
            }
            @media (prefers-reduced-motion: reduce) {
              .life-lockin-hourglass,
              .life-lockin-hourglass * {
                animation: none !important;
                transition: none !important;
              }
            }
          `}</style>

          <section
            className="life-card-hover"
            style={{
              padding: "22px 20px 20px",
              borderRadius: 22,
              border: `1px solid ${t.border}`,
              background: `linear-gradient(160deg, ${t.white} 0%, ${t.greenLt} 160%)`,
              boxShadow: session.isComplete
                ? `0 20px 40px ${t.green}18`
                : `0 14px 32px ${t.green}10`,
            }}
          >
            <div style={{ textAlign: "center", marginBottom: 18 }}>
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
                    ? "Break"
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
                  ? "The hourglass is finished. You can move on now."
                  : session.isPaused
                    ? "Session paused. Resume when you are ready."
                    : activePhase?.type === "break"
                      ? "Short break. Stretch, breathe, come back."
                      : "Stay with your work until the timer is finished."}
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gap: 22,
                justifyItems: "center",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  position: "relative",
                  width: 200,
                  height: 240,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  aria-hidden
                  style={{
                    position: "absolute",
                    inset: 12,
                    borderRadius: "50%",
                    background: `radial-gradient(circle, ${t.green}1f 0%, transparent 70%)`,
                    animation:
                      !session.isPaused && !session.isComplete
                        ? "lifeLockinGlow 3.2s ease-in-out infinite"
                        : "none",
                    opacity: session.isPaused ? 0.35 : 1,
                  }}
                />

                <svg
                  className={`life-lockin-hourglass${session.isComplete ? " is-complete" : ""}`}
                  width="200"
                  height="240"
                  viewBox="0 0 200 240"
                  fill="none"
                  style={{ position: "relative", zIndex: 1 }}
                  aria-hidden
                >
                  <defs>
                    <clipPath id="lifeLockinTopBulb">
                      <polygon points="40,30 160,30 108,116 92,116" />
                    </clipPath>
                    <clipPath id="lifeLockinBottomBulb">
                      <polygon points="92,124 108,124 160,210 40,210" />
                    </clipPath>
                    <linearGradient id="lifeLockinSand" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={t.green} stopOpacity="0.95" />
                      <stop offset="100%" stopColor={t.greenAlt || t.green} stopOpacity="1" />
                    </linearGradient>
                  </defs>

                  {/* Top bulb sand (depletes downward) */}
                  <g clipPath="url(#lifeLockinTopBulb)">
                    <rect
                      x="30"
                      y={30 + (86 * (100 - hourglassTopFill)) / 100}
                      width="140"
                      height={Math.max(0, (86 * hourglassTopFill) / 100)}
                      fill="url(#lifeLockinSand)"
                      style={{ transition: "y 0.2s linear, height 0.2s linear" }}
                    />
                  </g>

                  {/* Bottom bulb sand (fills upward) */}
                  <g clipPath="url(#lifeLockinBottomBulb)">
                    <rect
                      x="30"
                      y={210 - (86 * hourglassBottomFill) / 100}
                      width="140"
                      height={Math.max(0, (86 * hourglassBottomFill) / 100)}
                      fill="url(#lifeLockinSand)"
                      style={{ transition: "y 0.2s linear, height 0.2s linear" }}
                    />
                  </g>

                  {/* Falling grain stream */}
                  {!session.isPaused && !session.isComplete && hourglassTopFill > 1 && hourglassBottomFill < 99 && (
                    <line
                      x1="100"
                      y1="118"
                      x2="100"
                      y2="160"
                      stroke={t.green}
                      strokeWidth="2"
                      strokeLinecap="round"
                      style={{
                        transformOrigin: "100px 118px",
                        animation: "lifeLockinGrain 0.9s linear infinite",
                      }}
                    />
                  )}

                  {/* Frame */}
                  <path
                    d="M44 24 H156 C156 52 138 70 124 90 C116 102 114 110 114 120 C114 130 118 138 126 150 C140 168 156 184 156 216 H44 C44 184 60 168 74 150 C82 138 86 130 86 120 C86 110 84 102 76 90 C62 70 44 52 44 24 Z"
                    stroke={t.green}
                    strokeWidth="3.5"
                    strokeLinejoin="round"
                  />
                  <path d="M52 30 H148" stroke={t.green} strokeWidth="4" strokeLinecap="round" />
                  <path d="M52 210 H148" stroke={t.green} strokeWidth="4" strokeLinecap="round" />
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
                    opacity: session.isPaused ? 0.55 : 1,
                    transition: "opacity 0.25s ease",
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
                  {session.isComplete
                    ? "Done"
                    : session.isPaused
                      ? "Paused"
                      : activePhase?.label || "Preparing"}
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
            </div>
          </section>

          <section
            className="life-card-hover"
            style={{
              padding: "18px 18px 16px",
              borderRadius: 22,
              border: `1px solid ${t.border}`,
              background: t.white,
              boxShadow: `0 12px 28px ${t.green}08`,
            }}
          >
            <div style={{ display: "grid", gap: 14 }}>
              <div>
                <p style={{ margin: "0 0 6px", color: t.ink, fontSize: 16, fontWeight: 700 }}>
                  Session plan
                </p>
                <p style={{ margin: 0, color: t.mid, fontSize: 13, lineHeight: 1.7 }}>
                  Focus time: {formatCountdown(session.totalFocusMs)} · Breaks: {session.breakCount || 0}
                </p>
              </div>

              <div style={{ display: "grid", gap: 10 }}>
                {session.tasks.map((task, index) => (
                  <div
                    key={`${task}_${index}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "12px 14px",
                      borderRadius: 14,
                      border: `1px solid ${t.border}`,
                      background: t.light,
                    }}
                  >
                    <span
                      aria-hidden
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        background: `${t.green}18`,
                        color: t.green,
                        display: "grid",
                        placeItems: "center",
                        fontSize: 12,
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {index + 1}
                    </span>
                    <span style={{ color: t.ink, fontSize: 14, lineHeight: 1.6 }}>{task}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {!session.isComplete && (
                  <button
                    type="button"
                    onClick={handlePauseResume}
                    style={{
                      minHeight: 46,
                      padding: "12px 18px",
                      borderRadius: 14,
                      border: "none",
                      background: t.green,
                      color: t.skin,
                      fontSize: 14,
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    {session.isPaused ? "Resume" : "Pause"}
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleReset}
                  style={{
                    minHeight: 46,
                    padding: "12px 18px",
                    borderRadius: 14,
                    border: `1px solid ${t.border}`,
                    background: t.white,
                    color: t.ink,
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {session.isComplete ? "Start another session" : "Reset"}
                </button>
              </div>
            </div>
          </section>
        </section>
      )}
    </div>
  );
}

import { useState, useCallback, useEffect } from "react";

export function ToolsLockInPage({
  t,
  play,
  session,
  setSession,
}) {
  const [isRunning, setIsRunning] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customDuration, setCustomDuration] = useState("");
  const [tick, setTick] = useState(() => Date.now());

  const presets = [15, 25, 45, 60];

  const getRemainingSeconds = useCallback((activeSession) => {
    if (!activeSession) return 0;
    if (activeSession.isPaused || !activeSession.lastStartedAt) {
      return Math.max(0, Number(activeSession.remainingSeconds || 0));
    }

    const elapsed = Math.floor((Date.now() - activeSession.lastStartedAt) / 1000);
    return Math.max(0, Number(activeSession.remainingSeconds || 0) - elapsed);
  }, []);

  useEffect(() => {
    if (!session) {
      setIsRunning(false);
      return;
    }

    const remaining = getRemainingSeconds(session);
    if (remaining <= 0) {
      setIsRunning(false);
      setSession(null);
      return;
    }

    setIsRunning(!session.isPaused);
  }, [getRemainingSeconds, session, setSession]);

  useEffect(() => {
    if (!isRunning || !session) return;

    const interval = setInterval(() => {
      setTick(Date.now());
      const remaining = getRemainingSeconds(session);

      if (remaining === 0) {
        setIsRunning(false);
        play("ok");
        setSession(null);
      }
    }, 250);

    return () => clearInterval(interval);
  }, [getRemainingSeconds, isRunning, play, session, setSession]);

  useEffect(() => {
    if (!session) {
      setTick(Date.now());
    }
  }, [session]);

  const syncSession = useCallback(
    (updatedSession) => {
      setSession(updatedSession);
    },
    [setSession],
  );

  const startSession = (mins) => {
    if (isRunning) return;
    play("tap");
    const totalSeconds = mins * 60;
    const newSession = {
      id: `lockin_${Date.now()}`,
      totalSeconds,
      remainingSeconds: totalSeconds,
      startedAt: Date.now(),
      lastStartedAt: Date.now(),
      isPaused: false,
      createdAt: new Date().toISOString(),
    };
    syncSession(newSession);
    setIsRunning(true);
  };

  const togglePause = () => {
    if (!session) return;
    play("tap");
    if (isRunning) {
      syncSession({
        ...session,
        remainingSeconds: getRemainingSeconds(session),
        lastStartedAt: null,
        isPaused: true,
      });
      setIsRunning(false);
      return;
    }

    syncSession({
      ...session,
      remainingSeconds: getRemainingSeconds(session),
      lastStartedAt: Date.now(),
      isPaused: false,
    });
    setIsRunning(true);
  };

  const reset = () => {
    play("tap");
    setIsRunning(false);
    setSession(null);
  };

  const handleCustomDuration = () => {
    const mins = parseInt(customDuration, 10);
    if (!mins || mins < 1 || mins > 360) {
      play("err");
      return;
    }
    play("ok");
    setShowCustomInput(false);
    setCustomDuration("");
    startSession(mins);
  };

  const getTimeRemaining = () => {
    void tick;
    if (!session) return "00:00";
    const remaining = getRemainingSeconds(session);
    const mins = Math.floor(remaining / 60);
    const secs = remaining % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getProgressPercent = () => {
    void tick;
    if (!session) return 0;
    const remaining = getRemainingSeconds(session);
    return Math.min(100, ((session.totalSeconds - remaining) / session.totalSeconds) * 100);
  };

  const progressPercent = getProgressPercent();
  const hourglassFill = Math.max(0, Math.min(100, 100 - progressPercent));
  const pulseShadow = isRunning ? `0 0 0 8px ${t.green}10, 0 18px 40px ${t.green}16` : `0 14px 30px ${t.green}10`;

  return (
    <div
      data-page-tag="#tools_lockin_page"
      style={{
        padding: "clamp(24px, 5vw, 48px) clamp(16px, 4vw, 28px)",
        maxWidth: 620,
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
          margin: "0 0 14px",
          fontSize: 28,
          fontWeight: 700,
          color: t.ink,
          fontFamily: "Georgia,serif",
        }}
      >
        Lock-In
      </h2>
      <p
        style={{
          margin: "0 0 28px",
          color: t.mid,
          fontSize: 15,
          lineHeight: 1.85,
          fontFamily: "Georgia,serif",
        }}
      >
        Focus for a set duration. No distractions, just deep work.
      </p>

      <section
        className="life-card-hover"
        style={{
          marginBottom: 18,
          padding: "16px 16px 14px",
          borderRadius: 20,
          background: `linear-gradient(135deg, ${t.white} 0%, ${t.greenLt} 150%)`,
          border: `1px solid ${t.border}`,
          boxShadow: pulseShadow,
          transition: "box-shadow 0.25s ease, transform 0.2s ease",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <p style={{ margin: "0 0 4px", color: t.ink, fontSize: 15, fontWeight: 700 }}>
              Lock the session in.
            </p>
            <p style={{ margin: 0, color: t.mid, fontSize: 12.5, lineHeight: 1.65 }}>
              Pick a timer, protect attention, and keep a visible finish line in view.
            </p>
          </div>
          <div
            style={{
              alignSelf: "flex-start",
              minHeight: 34,
              padding: "8px 12px",
              borderRadius: 999,
              background: isRunning ? `${t.green}18` : t.light,
              color: isRunning ? t.green : t.muted,
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            {session ? `${Math.round(progressPercent)}% elapsed` : "Ready to start"}
          </div>
        </div>
      </section>

      {/* Timer Display */}
      <div
        style={{
          textAlign: "center",
          marginBottom: 32,
        }}
      >
        <div
          style={{
            position: "relative",
            width: 200,
            height: 200,
            margin: "0 auto 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 22,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${t.green}10 0%, transparent 68%)`,
              opacity: isRunning ? 1 : 0.6,
              transition: "opacity 0.2s ease",
            }}
          />
          {/* Background circle */}
          <svg
            style={{
              position: "absolute",
              inset: 0,
            }}
            viewBox="0 0 200 200"
          >
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke={t.border}
              strokeWidth="2"
            />
            {session && (
              <circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke={t.green}
                strokeWidth="3"
                strokeDasharray={`${(progressPercent / 100) * 565.48} 565.48`}
                strokeLinecap="round"
                style={{
                  transform: "rotate(-90deg)",
                  transformOrigin: "100px 100px",
                  transition: "stroke-dasharray 0.2s linear",
                }}
              />
            )}
          </svg>

          {/* Timer text */}
          <div style={{ textAlign: "center", zIndex: 1 }}>
            <div
              aria-hidden
              style={{
                width: 74,
                height: 92,
                margin: "0 auto 10px",
                position: "relative",
                borderRadius: 18,
                border: `2px solid ${t.green}`,
                background: `${t.white}cc`,
                overflow: "hidden",
                clipPath: "polygon(18% 0%, 82% 0%, 62% 44%, 62% 56%, 82% 100%, 18% 100%, 38% 56%, 38% 44%)",
                boxShadow: `inset 0 0 0 1px ${t.border}`,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 8,
                  left: 12,
                  right: 12,
                  height: `${Math.max(8, hourglassFill * 0.32)}%`,
                  background: `linear-gradient(180deg, ${t.green} 0%, ${t.greenAlt || t.green} 100%)`,
                  clipPath: "polygon(0 0, 100% 0, 62% 100%, 38% 100%)",
                  opacity: hourglassFill > 4 ? 1 : 0.2,
                  transition: "height 0.2s linear, opacity 0.2s linear",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: 8,
                  left: 12,
                  right: 12,
                  height: `${Math.max(8, progressPercent * 0.32)}%`,
                  background: `linear-gradient(180deg, ${t.green} 0%, ${t.greenAlt || t.green} 100%)`,
                  clipPath: "polygon(38% 0, 62% 0, 100% 100%, 0 100%)",
                  opacity: progressPercent > 4 ? 1 : 0.2,
                  transition: "height 0.2s linear, opacity 0.2s linear",
                }}
              />
              {isRunning && (
                <div
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "46%",
                    width: 3,
                    height: 14,
                    borderRadius: 999,
                    transform: "translateX(-50%)",
                    background: t.green,
                    opacity: 0.9,
                  }}
                />
              )}
            </div>
            <div
              style={{
                fontSize: 56,
                fontWeight: 700,
                fontFamily: "monospace",
                color: t.ink,
              }}
            >
              {getTimeRemaining()}
            </div>
            <div
              style={{
                fontSize: 12,
                color: t.muted,
                marginTop: 4,
                letterSpacing: 1,
              }}
            >
              {session ? (isRunning ? "RUNNING" : "PAUSED") : "READY"}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div
          style={{
            display: "flex",
            gap: 10,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {!session ? (
            <>
              {presets.map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => startSession(mins)}
                  style={{
                    padding: "10px 16px",
                    background: t.greenLt,
                    color: t.green,
                    border: `1px solid ${t.green}`,
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    minHeight: 44,
                  }}
                >
                  {mins}m
                </button>
              ))}
              <button
                type="button"
                onClick={() => setShowCustomInput(!showCustomInput)}
                style={{
                  padding: "10px 16px",
                  background: t.white,
                  color: t.green,
                  border: `1px solid ${t.green}`,
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  minHeight: 44,
                }}
              >
                Custom
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={togglePause}
                style={{
                  padding: "12px 20px",
                  background: t.green,
                  color: t.white,
                  border: "none",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  minHeight: 44,
                }}
              >
                {isRunning ? "Pause" : "Resume"}
              </button>
              <button
                type="button"
                onClick={reset}
                style={{
                  padding: "12px 20px",
                  background: t.white,
                  color: t.ink,
                  border: `1px solid ${t.border}`,
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  minHeight: 44,
                }}
              >
                Reset
              </button>
            </>
          )}
        </div>
      </div>

      {/* Custom Duration Input */}
      {showCustomInput && !session && (
        <div
          style={{
            padding: 16,
            background: t.greenLt,
            borderRadius: 12,
            marginTop: 24,
            display: "flex",
            gap: 10,
            alignItems: "flex-end",
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: 1 }}>
            <label
              style={{
                display: "block",
                fontSize: 12,
                fontWeight: 600,
                color: t.green,
                marginBottom: 6,
              }}
            >
              Minutes (1-360)
            </label>
            <input
              type="number"
              min="1"
              max="360"
              value={customDuration}
              onChange={(e) => setCustomDuration(e.target.value)}
              placeholder="e.g., 30"
              style={{
                width: "100%",
                padding: "10px 12px",
                border: `1px solid ${t.green}`,
                borderRadius: 8,
                fontSize: 16,
                color: t.ink,
                background: t.white,
                minHeight: 44,
              }}
            />
          </div>
          <button
            type="button"
            onClick={handleCustomDuration}
            style={{
              padding: "10px 16px",
              background: t.green,
              color: t.white,
              border: "none",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              minHeight: 44,
            }}
          >
            Start
          </button>
        </div>
      )}
    </div>
  );
}

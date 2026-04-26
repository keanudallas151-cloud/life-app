import { useState, useEffect, useRef } from "react";
import { FONT } from "../shared/constants.js";
import { Progress } from "../shared/Progress.jsx";
import { ScoreScreen } from "../shared/ScoreScreen.jsx";

export function MultiChoiceGame({ questions, color, onClose, t, play }) {
  const QUIZ_TIME = 12;
  const TIMEOUT_SENTINEL = "__timeout__";
  const [qi, setQi] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(QUIZ_TIME);
  const [milestoneFlash, setMilestoneFlash] = useState(0); // counter to retrigger
  const [ripples, setRipples] = useState({}); // { [optKey]: { x, y, id } }
  const prevMultiplierRef = useRef(1);
  const q = questions[qi];
  const multiplier = streak >= 5 ? 3 : streak >= 3 ? 2 : 1;
  const lowTime = timeLeft <= 5;

  useEffect(() => {
    setTimeLeft(QUIZ_TIME);
  }, [qi]);

  useEffect(() => {
    if (selected || done) return;
    if (timeLeft <= 0) {
      play?.("timer_out");
      setSelected(TIMEOUT_SENTINEL);
      setStreak(0);
      setTimeout(() => {
        if (qi + 1 >= questions.length) setDone(true);
        else { setQi(q2 => q2 + 1); setSelected(null); }
      }, 900);
      return;
    }
    if (timeLeft <= 3) play?.("timer_tick");
    const tickTimer = setTimeout(() => setTimeLeft(tl => tl - 1), 1000);
    return () => clearTimeout(tickTimer);
  }, [timeLeft, selected, done, qi, questions.length, play]);

  // Trigger milestone screen flash when crossing into a new multiplier tier
  useEffect(() => {
    if (multiplier > prevMultiplierRef.current && multiplier > 1) {
      setMilestoneFlash((c) => c + 1);
    }
    prevMultiplierRef.current = multiplier;
  }, [multiplier]);

  const spawnRipple = (optKey, e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ev = e.touches?.[0] || e;
    const x = (ev.clientX ?? rect.left + rect.width / 2) - rect.left;
    const y = (ev.clientY ?? rect.top + rect.height / 2) - rect.top;
    const id = Date.now() + Math.random();
    setRipples((r) => ({ ...r, [optKey]: { x, y, id } }));
    setTimeout(() => {
      setRipples((r) => {
        if (r[optKey]?.id !== id) return r;
        const next = { ...r }; delete next[optKey]; return next;
      });
    }, 380);
    e.currentTarget.style.transform = "scale(0.96)";
  };

  const pick = (opt) => {
    if (selected) return;
    play?.("game_tap");
    setSelected(opt);
    if (opt === q.ans) {
      setScore(s => s + multiplier);
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak >= 5)      { setTimeout(() => play?.("streak_5"), 80); }
      else if (newStreak >= 3) { setTimeout(() => play?.("streak_3"), 80); }
      else                     { setTimeout(() => play?.("correct"), 80); }
    } else {
      setStreak(0);
      setTimeout(() => play?.("wrong"), 80);
    }
    setTimeout(() => {
      if (qi + 1 >= questions.length) setDone(true);
      else { setQi(qi + 1); setSelected(null); }
    }, 900);
  };

  if (done) return <ScoreScreen score={score} total={questions.length} color={color} onReplay={() => { setQi(0); setScore(0); setSelected(null); setDone(false); setStreak(0); }} onClose={onClose} t={t} play={play} />;

  // Streak fire color — amber → orange → red as multiplier rises
  const streakColor = multiplier === 3 ? "#e5484d" : multiplier === 2 ? "#f97316" : "#f59e0b";

  return (
    <div style={{ padding: "20px 20px 40px", fontFamily: FONT, position: "relative" }}>
      {/* Milestone screen flash banner */}
      {milestoneFlash > 0 && (
        <div
          key={milestoneFlash}
          aria-hidden="true"
          style={{
            position: "absolute", left: 0, right: 0, top: -20, height: 80,
            background: `linear-gradient(180deg, ${streakColor}80 0%, transparent 100%)`,
            pointerEvents: "none",
            animation: "streakFlash 0.45s ease both",
            zIndex: 5,
          }}
        />
      )}

      <Progress current={qi} total={questions.length} color={color} t={t} />
      {multiplier > 1 && (
        <div style={{ textAlign: "right", marginBottom: 8 }}>
          <span style={{
            fontSize: multiplier === 3 ? 18 : 14,
            fontWeight: 700,
            color: streakColor,
            fontFamily: FONT,
            display: "inline-block",
            transformOrigin: "center",
            animation: "streakPulseAnim 1.05s ease-in-out infinite",
            transition: "color 0.4s ease, font-size 0.3s ease",
          }}>
            {"🔥".repeat(multiplier - 1)} ×{multiplier} Multiplier!
          </span>
        </div>
      )}
      {/* Question timer bar */}
      <div style={{ height: 4, borderRadius: 999, background: t?.border||"rgba(255,255,255,0.1)", marginBottom: 16, overflow: "hidden" }}>
        <div style={{
          height: "100%", borderRadius: 999,
          background: timeLeft <= 4 ? "#e5484d" : timeLeft <= 7 ? "#f59e0b" : color,
          width: `${(timeLeft / QUIZ_TIME) * 100}%`,
          transition: "width 0.9s linear, background 0.3s ease",
        }} />
      </div>
      {/* Numeric timer (visible when low for urgency pulse) */}
      {lowTime && (
        <div style={{
          textAlign: "center", marginBottom: 10, fontSize: 13, fontWeight: 800,
          color: "#e5484d", fontFamily: FONT,
          animation: "timerPulse 0.6s ease-in-out infinite",
        }}>{timeLeft}s</div>
      )}
      <div key={qi} style={{
        background: t?.light || "rgba(255,255,255,0.05)",
        borderRadius: 18,
        padding: "20px 18px",
        marginBottom: 20,
        border: `1px solid ${t?.border || "rgba(255,255,255,0.08)"}`,
        animation: lowTime
          ? "questionIn 0.34s cubic-bezier(0.34,1.56,0.64,1) both, cardGlowPulse 1.2s ease-in-out infinite 0.34s"
          : "questionIn 0.34s cubic-bezier(0.34,1.56,0.64,1) both",
      }}>
        <p style={{ fontSize: 16, color: t?.ink || "#ededed", lineHeight: 1.55, margin: 0, fontWeight: 500 }}>{q.q}</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {q.opts.map(opt => {
          const isCorrect = opt === q.ans;
          const isWrong = selected === opt && !isCorrect;
          const showBadge = selected && (isCorrect || isWrong);
          const ripple = ripples[opt];
          return (
            <button key={opt} type="button" onClick={() => pick(opt)}
              onTouchStart={(e) => spawnRipple(opt, e)}
              onTouchEnd={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
              onMouseDown={(e) => spawnRipple(opt, e)}
              onMouseUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
              style={{
              position: "relative",
              overflow: "hidden",
              padding: `14px ${showBadge ? "40px" : "16px"} 14px 16px`, borderRadius: 14, textAlign: "left",
              border: `1.5px solid ${selected ? isCorrect ? color : isWrong ? "#e5484d" : t?.border || "rgba(255,255,255,0.07)" : t?.border || "rgba(255,255,255,0.1)"}`,
              background: selected ? isCorrect ? `${color}18` : isWrong ? "rgba(229,72,77,0.12)" : t?.light || "rgba(255,255,255,0.03)" : t?.light || "rgba(255,255,255,0.05)",
              color: selected ? isCorrect ? color : isWrong ? "#e5484d" : "#666" : t?.ink || "#ededed",
              fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: FONT,
              transition: "all 0.15s cubic-bezier(0.34,1.56,0.64,1)", WebkitTapHighlightColor: "transparent",
            }}>
              {ripple && (
                <span aria-hidden="true" style={{
                  position: "absolute",
                  left: ripple.x - 8,
                  top: ripple.y - 8,
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  background: `${color}66`,
                  pointerEvents: "none",
                  animation: "ripple 0.38s cubic-bezier(0.4,0,0.2,1) both",
                  transformOrigin: "center",
                }} />
              )}
              {opt}
              {showBadge && (
                <span style={{
                  position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                  width: 22, height: 22, borderRadius: "50%",
                  background: isCorrect ? "#50c878" : "#e5484d",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 800, color: "#000",
                  animation: "popIn 0.25s cubic-bezier(0.34,1.56,0.64,1) both",
                  flexShrink: 0, pointerEvents: "none",
                }}>
                  {isCorrect ? "✓" : "✗"}
                </span>
              )}
            </button>
          );
        })}
      </div>
      {selected && q.tip && (
        <div style={{
          marginTop: 14, padding: "12px 16px", borderRadius: 14,
          background: `${color}10`, border: `1px solid ${color}30`,
          fontSize: 12.5, color: color, lineHeight: 1.55, fontFamily: FONT,
          animation: "tipSlideUp 0.32s cubic-bezier(0.34,1.56,0.64,1) both",
        }}>{q.tip}</div>
      )}
    </div>
  );
}

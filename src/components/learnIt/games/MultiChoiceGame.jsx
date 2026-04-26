import { useState, useEffect } from "react";
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
  const q = questions[qi];
  const multiplier = streak >= 5 ? 3 : streak >= 3 ? 2 : 1;

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
      else                     { setTimeout(() => play?.("coin"), 80); }
    } else {
      setStreak(0);
      setTimeout(() => play?.("word_wrong"), 80);
    }
    setTimeout(() => {
      if (qi + 1 >= questions.length) setDone(true);
      else { setQi(qi + 1); setSelected(null); }
    }, 900);
  };

  if (done) return <ScoreScreen score={score} total={questions.length} color={color} onReplay={() => { setQi(0); setScore(0); setSelected(null); setDone(false); setStreak(0); }} onClose={onClose} t={t} play={play} />;

  return (
    <div style={{ padding: "20px 20px 40px", fontFamily: FONT }}>
      <Progress current={qi} total={questions.length} color={color} t={t} />
      {multiplier > 1 && (
        <div style={{ textAlign: "right", marginBottom: 8 }}>
          <span style={{
            fontSize: multiplier === 3 ? 18 : 14, fontWeight: 700, color: "#f59e0b",
            fontFamily: FONT, animation: "streakPop 0.3s cubic-bezier(0.34,1.56,0.64,1) both",
            display: "inline-block",
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
      <div key={qi} style={{ background: t?.light || "rgba(255,255,255,0.05)", borderRadius: 18, padding: "20px 18px", marginBottom: 20, border: `1px solid ${t?.border || "rgba(255,255,255,0.08)"}`, animation: "questionIn 0.3s cubic-bezier(0.34,1.56,0.64,1) both" }}>
        <p style={{ fontSize: 16, color: t?.ink || "#ededed", lineHeight: 1.55, margin: 0, fontWeight: 500 }}>{q.q}</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {q.opts.map(opt => {
          const isCorrect = opt === q.ans;
          const isWrong = selected === opt && !isCorrect;
          return (
            <button key={opt} type="button" onClick={() => pick(opt)}
              onTouchStart={(e) => { e.currentTarget.style.transform = "scale(0.96)"; }}
              onTouchEnd={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
              style={{
              padding: "14px 16px", borderRadius: 14, textAlign: "left",
              border: `1.5px solid ${selected ? isCorrect ? color : isWrong ? "#e5484d" : t?.border || "rgba(255,255,255,0.07)" : t?.border || "rgba(255,255,255,0.1)"}`,
              background: selected ? isCorrect ? `${color}18` : isWrong ? "rgba(229,72,77,0.12)" : t?.light || "rgba(255,255,255,0.03)" : t?.light || "rgba(255,255,255,0.05)",
              color: selected ? isCorrect ? color : isWrong ? "#e5484d" : "#666" : t?.ink || "#ededed",
              fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: FONT,
              transition: "all 0.15s cubic-bezier(0.34,1.56,0.64,1)", WebkitTapHighlightColor: "transparent",
            }}>{opt}</button>
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

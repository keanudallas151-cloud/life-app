import { useState, useEffect, useRef } from "react";
import { FONT } from "../shared/constants.js";
import { Progress } from "../shared/Progress.jsx";
import { ScoreScreen } from "../shared/ScoreScreen.jsx";
import {
  SPEAK_QS,
  FILLER_TEXTS,
  CONF_QUIZ,
} from "../data/demeanorData.js";

export function SpeakItGame({ questions: questionsProp, color, onClose, t, play }) {
  const qs = questionsProp || SPEAK_QS;
  const [qi, setQi] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const q = qs[qi];

  const pick = (idx) => {
    if (selected !== null) return;
    setSelected(idx);
    if (idx === q.best) { setScore(s => s + 1); play?.("correct"); }
    else play?.("wrong");
    setTimeout(() => {
      if (qi + 1 >= qs.length) setDone(true);
      else { setQi(qi + 1); setSelected(null); }
    }, 1400);
  };

  if (done) return <ScoreScreen score={score} total={qs.length} color={color} onReplay={() => { setQi(0); setScore(0); setSelected(null); setDone(false); }} onClose={onClose} t={t} play={play} />;

  return (
    <div style={{ padding: "20px 20px 40px", fontFamily: FONT }}>
      <Progress current={qi} total={qs.length} color={color} t={t} />
      <div key={qi} style={{ background: t?.light || "rgba(255,255,255,0.05)", borderRadius: 18, padding: "20px", marginBottom: 20, border: `1px solid ${t?.border || "rgba(255,255,255,0.08)"}`, animation: "questionIn 0.3s cubic-bezier(0.34,1.56,0.64,1) both" }}>
        <p style={{ fontSize: 11, fontWeight: 600, color, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Situation</p>
        <p style={{ fontSize: 15, color: t?.ink || "#ededed", lineHeight: 1.6, margin: 0 }}>{q.scenario}</p>
      </div>
      <p style={{ fontSize: 13, color: t?.muted || "#a1a1a1", marginBottom: 12 }}>What do you say?</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {q.opts.map((opt, idx) => {
          const isBest = idx === q.best;
          const isPicked = selected === idx;
          const showBadge = selected !== null && (isBest || isPicked);
          return (
            <button key={idx} type="button" onClick={() => pick(idx)}
              onTouchStart={(e) => { e.currentTarget.style.transform = "scale(0.96)"; }}
              onTouchEnd={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
              style={{
              position: "relative",
              padding: `14px ${showBadge ? "40px" : "16px"} 14px 16px`, borderRadius: 14, textAlign: "left",
              border: `1.5px solid ${selected !== null ? isBest ? color : isPicked ? "#e5484d" : t?.border || "rgba(255,255,255,0.07)" : t?.border || "rgba(255,255,255,0.1)"}`,
              background: selected !== null ? isBest ? `${color}18` : isPicked ? "rgba(229,72,77,0.12)" : "transparent" : t?.light || "rgba(255,255,255,0.05)",
              color: selected !== null ? isBest ? color : isPicked ? "#e5484d" : "#555" : t?.ink || "#ededed",
              fontSize: 13.5, cursor: "pointer", fontFamily: FONT, fontWeight: 400,
              transition: "all 0.15s cubic-bezier(0.34,1.56,0.64,1)", fontStyle: "italic",
              WebkitTapHighlightColor: "transparent",
            }}>
              {opt}
              {showBadge && (
                <span style={{
                  position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                  width: 22, height: 22, borderRadius: "50%",
                  background: isBest ? "#50c878" : "#e5484d",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 800, color: "#000",
                  animation: "popIn 0.25s cubic-bezier(0.34,1.56,0.64,1) both",
                  flexShrink: 0, pointerEvents: "none",
                }}>
                  {isBest ? "✓" : "✗"}
                </span>
              )}
            </button>
          );
        })}
      </div>
      {selected !== null && <div style={{ marginTop: 14, padding: "12px 16px", borderRadius: 14, background: `${color}10`, border: `1px solid ${color}30`, fontSize: 12.5, color: color, lineHeight: 1.55 }}>{q.why}</div>}
    </div>
  );
}

export function FillerCatcherGame({ color, onClose, t, play }) {
  const [ti, setTi] = useState(0);
  const [tapped, setTapped] = useState(new Set());
  const [score, setScore] = useState(0);
  const [checked, setChecked] = useState(false);
  const [done, setDone] = useState(false);
  const filler = FILLER_TEXTS[ti];
  const words = filler.text.split(" ");

  const toggle = (word) => {
    if (checked) return;
    play?.("tap");
    setTapped(prev => {
      const next = new Set(prev);
      if (next.has(word)) next.delete(word);
      else next.add(word);
      return next;
    });
  };

  const checkAnswers = () => {
    setChecked(true);
    play?.("ok");
    const correct = filler.fillers.filter(f => tapped.has(f)).length;
    const wrong = [...tapped].filter(w => !filler.fillers.includes(w)).length;
    setScore(s => s + Math.max(0, correct - wrong));
    setTimeout(() => {
      if (ti + 1 >= FILLER_TEXTS.length) setDone(true);
      else { setTi(ti + 1); setTapped(new Set()); setChecked(false); }
    }, 1800);
  };

  if (done) return <ScoreScreen score={score} total={FILLER_TEXTS.reduce((a, f) => a + f.fillers.length, 0)} color={color} customMsg="Filler words found!" onReplay={() => { setTi(0); setTapped(new Set()); setScore(0); setChecked(false); setDone(false); }} onClose={onClose} t={t} play={play} />;

  return (
    <div style={{ padding: "20px 20px 40px", fontFamily: FONT }}>
      <Progress current={ti} total={FILLER_TEXTS.length} color={color} t={t} />
      <p style={{ fontSize: 13, color: t?.muted || "#a1a1a1", marginBottom: 16 }}>Tap every filler word (um, like, basically, etc.)</p>
      <div style={{ background: t?.light || "rgba(255,255,255,0.05)", borderRadius: 18, padding: "20px", marginBottom: 20, border: `1px solid ${t?.border || "rgba(255,255,255,0.08)"}`, lineHeight: 2.2, display: "flex", flexWrap: "wrap", gap: "0 4px" }}>
        {words.map((word, i) => {
          const clean = word.replace(/[^a-zA-Z]/g, "");
          const isTapped = tapped.has(clean) || tapped.has(word);
          const isFiller = checked && filler.fillers.includes(clean);
          const isWrong = checked && isTapped && !isFiller;
          return (
            <button key={i} type="button" onClick={() => toggle(clean || word)} style={{
              background: checked ? isFiller ? `${color}25` : isWrong ? "rgba(229,72,77,0.2)" : "transparent" : isTapped ? `${color}20` : "transparent",
              border: `1px solid ${isTapped || (checked && isFiller) ? checked ? isFiller ? color : "#e5484d" : color : "transparent"}`,
              borderRadius: 6, padding: "1px 4px", cursor: "pointer",
              color: checked ? isFiller ? color : isWrong ? "#e5484d" : t?.ink || "#ededed" : isTapped ? color : t?.ink || "#ededed",
              fontSize: 16, lineHeight: 1.8, fontFamily: FONT,
              transition: "all 0.15s ease", WebkitTapHighlightColor: "transparent",
            }}>{word}</button>
          );
        })}
      </div>
      {!checked && (
        <button type="button" onClick={checkAnswers} style={{ width: "100%", padding: "14px", background: color, color: "#000", border: "none", borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: FONT }}>Check My Answers</button>
      )}
    </div>
  );
}

export function ConfidenceQuiz({ color, t, play }) {
  const [qi, setQi] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [done, setDone] = useState(false);
  const q = CONF_QUIZ[qi];
  const maxScore = CONF_QUIZ.reduce((a, q) => a + Math.max(...q.scores), 0);

  const pick = (idx) => {
    if (selected !== null) return;
    play?.("ok");
    setSelected(idx);
    setScore(s => s + q.scores[idx]);
    setTimeout(() => {
      if (qi + 1 >= CONF_QUIZ.length) setDone(true);
      else { setQi(qi + 1); setSelected(null); }
    }, 700);
  };

  if (done) {
    const pct = Math.round((score / maxScore) * 100);
    const label = pct >= 80 ? "Highly Confident" : pct >= 55 ? "Growing Confident" : "Building Foundation";
    const iconPath = pct >= 80
      ? <><path d="M6 9a6 6 0 0012 0V4H6v5z"/><path d="M6 4H3v3a3 3 0 003 3"/><path d="M18 4h3v3a3 3 0 01-3 3"/><path d="M9 21h6"/><path d="M12 15v6"/></>
      : pct >= 55
        ? <><circle cx="12" cy="12" r="10"/><polyline points="16,10 11,15 8,12"/></>
        : <><path d="M11 20A7 7 0 014 13c0-5 4-9 9-11 0 5 2 9 2 11a4 4 0 01-4 7z"/><path d="M11 20c0-5.5 5-9 7-9"/></>;
    return (
      <div style={{ padding: "32px 24px", textAlign: "center", fontFamily: FONT }}>
        <div style={{ width: 100, height: 100, borderRadius: "50%", background: `${color}15`, border: `3px solid ${color}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">{iconPath}</svg>
        </div>
        <div style={{ fontSize: 26, fontWeight: 800, color: t?.ink || "#ededed", marginBottom: 8, letterSpacing: "-0.03em" }}>{label}</div>
        <div style={{ fontSize: 16, color, fontWeight: 700, marginBottom: 24 }}>Score: {pct}%</div>
        <div style={{ background: t?.light || "rgba(255,255,255,0.05)", borderRadius: 16, padding: "16px 20px", textAlign: "left", marginBottom: 24, border: `1px solid ${t?.border || "rgba(255,255,255,0.08)"}` }}>
          <p style={{ color: t?.ink || "#ededed", fontSize: 14, lineHeight: 1.65, margin: 0 }}>
            {pct >= 80 ? "You carry yourself with genuine confidence. Keep practising direct communication and expanding your comfort zone." : pct >= 55 ? "You're building strong confidence habits. Focus on posture, eye contact, and speaking up earlier in conversations." : "Confidence is a skill — and you're developing it. Start with small wins: introduce yourself first, speak up in small groups, maintain eye contact."}
          </p>
        </div>
        <button type="button" onClick={() => { setQi(0); setScore(0); setSelected(null); setDone(false); }} style={{ padding: "13px 28px", background: color, color: "#000", borderRadius: 999, border: "none", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: FONT }}>Retake Quiz</button>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px 20px 40px", fontFamily: FONT }}>
      <Progress current={qi} total={CONF_QUIZ.length} color={color} t={t} />
      <div style={{ background: t?.light || "rgba(255,255,255,0.05)", borderRadius: 18, padding: "20px", marginBottom: 20, border: `1px solid ${t?.border || "rgba(255,255,255,0.08)"}` }}>
        <p style={{ fontSize: 16, color: t?.ink || "#ededed", lineHeight: 1.55, margin: 0, fontWeight: 500 }}>{q.q}</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {q.opts.map((opt, idx) => (
          <button key={idx} type="button" onClick={() => pick(idx)}
            onTouchStart={(e) => { e.currentTarget.style.transform = "scale(0.96)"; }}
            onTouchEnd={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
            style={{
            padding: "14px 16px", borderRadius: 14, textAlign: "left",
            border: `1.5px solid ${selected === idx ? color : t?.border || "rgba(255,255,255,0.1)"}`,
            background: selected === idx ? `${color}15` : t?.light || "rgba(255,255,255,0.05)",
            color: selected === idx ? color : t?.ink || "#ededed",
            fontSize: 14, cursor: "pointer", fontFamily: FONT, fontWeight: 400,
            transition: "all 0.15s cubic-bezier(0.34,1.56,0.64,1)", WebkitTapHighlightColor: "transparent",
          }}>{opt}</button>
        ))}
      </div>
    </div>
  );
}

export function DailyDemChallenge({ color, onClose, t, play }) {
  const challenges = [
    { emoji: "🗣️", title: "The Cold Introduction", task: "Introduce yourself to one stranger or new colleague today. Use your name, what you do, and one interesting fact about yourself. Be first.", tip: "Being first to speak shows confidence and sets the social frame." },
    { emoji: "📱", title: "No Filler Day", task: "For the next conversation you have — no 'um', 'like', 'basically', or 'you know'. Pause instead. Silence is more powerful than filler.", tip: "Strategic pauses make you appear more composed and authoritative." },
    { emoji: "👁️", title: "Eye Contact Challenge", task: "In your next 3 conversations, maintain natural eye contact 70% of the time. Don't stare — just hold it longer than you normally would.", tip: "Consistent eye contact signals confidence, engagement, and honesty." },
    { emoji: "🧍", title: "Posture Reset", task: "Set 3 phone reminders today. Each time: roll shoulders back, chin up, feet shoulder-width. Notice how your mood shifts when your body changes.", tip: "Amy Cuddy's research shows posture changes your hormone levels, not just perception." },
    { emoji: "💬", title: "Lead The Conversation", task: "Start a conversation today — ask a genuine question about something the other person cares about. Then listen more than you speak.", tip: "The best conversationalists make others feel heard, not impressed." },
    { emoji: "🎯", title: "Direct Request", task: "Ask for something directly today — no hedging, no apologising. 'Can I have X by Y time?' Say it once, clearly, then wait.", tip: "Direct requests without qualifiers are taken more seriously and respected more." },
  ];
  const today = new Date().getDay();
  const challenge = challenges[today % challenges.length];
  const [accepted, setAccepted] = useState(false);

  if (accepted) {
    return (
      <div style={{ padding: "40px 24px", textAlign: "center", fontFamily: FONT }}>
        <div
          style={{
            width: 72, height: 72, borderRadius: 22,
            background: `${color}1F`,
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px",
          }}
          aria-hidden="true"
        >
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20,6 9,17 4,12"/>
          </svg>
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, color: t?.ink || "#ededed", marginBottom: 8, letterSpacing: "-0.03em" }}>Challenge Accepted!</div>
        <div style={{ fontSize: 15, color: t?.muted || "#a1a1a1", marginBottom: 28, lineHeight: 1.55 }}>Come back tomorrow for a new one.</div>
        <button type="button" onClick={onClose} style={{ padding: "13px 32px", background: color, color: "#000", border: "none", borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: FONT }}>Done</button>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px 20px 40px", fontFamily: FONT }}>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ fontSize: 52, marginBottom: 12 }}>{challenge.emoji}</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: t?.ink || "#ededed", letterSpacing: "-0.03em", marginBottom: 4 }}>{challenge.title}</div>
        <div style={{ fontSize: 12, color, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Today's Challenge</div>
      </div>
      <div style={{ background: t?.light || "rgba(255,255,255,0.05)", borderRadius: 18, padding: "20px", marginBottom: 16, border: `1px solid ${t?.border || "rgba(255,255,255,0.08)"}` }}>
        <p style={{ fontSize: 15, color: t?.ink || "#ededed", lineHeight: 1.65, margin: 0 }}>{challenge.task}</p>
      </div>
      <div style={{ background: `${color}10`, borderRadius: 16, padding: "16px 18px", border: `1px solid ${color}30` }}>
        <p style={{ fontSize: 12, fontWeight: 700, color, textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 6px" }}>Why This Works</p>
        <p style={{ fontSize: 13.5, color: t?.ink || "#ededed", lineHeight: 1.6, margin: 0 }}>{challenge.tip}</p>
      </div>
      <button type="button" onClick={() => { play?.("star"); setAccepted(true); }} style={{ width: "100%", marginTop: 24, padding: "14px", background: color, color: "#000", border: "none", borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: FONT }}>I Accept the Challenge ✓</button>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   Eye Contact Trainer — a face SVG appears for a randomised
   2-6 second window. Tap when you "feel comfortable" sustaining
   eye contact. Tracks streaks of windows you held to completion.
────────────────────────────────────────────────────────────── */
export function EyeContactTrainer({ color, onClose, t, play }) {
  const [phase, setPhase] = useState("ready"); // "ready" | "active" | "result"
  const [duration, setDuration] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [held, setHeld] = useState(null); // boolean: did user hold to end?
  const startedRef = useRef(0);

  const startRound = () => {
    const ms = 2000 + Math.random() * 4000; // 2–6s
    setDuration(ms);
    setElapsed(0);
    setHeld(null);
    setPhase("active");
    startedRef.current = Date.now();
    play?.("tap_firm");
  };

  // Active timer
  useEffect(() => {
    if (phase !== "active") return;
    let raf;
    const tick = () => {
      const e = Date.now() - startedRef.current;
      setElapsed(e);
      if (e >= duration) {
        setHeld(true);
        setPhase("result");
        setStreak((s) => {
          const next = s + 1;
          setBestStreak((b) => Math.max(b, next));
          return next;
        });
        play?.("success");
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase, duration, play]);

  const breakEarly = () => {
    if (phase !== "active") return;
    setHeld(false);
    setPhase("result");
    setStreak(0);
    play?.("wrong");
  };

  const remaining = Math.max(0, Math.ceil((duration - elapsed) / 1000));
  const ringPct = duration > 0 ? Math.min(1, elapsed / duration) : 0;
  const RING = 70;
  const CIRC = 2 * Math.PI * RING;

  return (
    <div style={{ padding: "28px 24px 40px", fontFamily: FONT, textAlign: "center" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <span style={{ fontSize: 11, color: t?.muted || "#a1a1a1", letterSpacing: "0.06em", textTransform: "uppercase" }}>Streak</span>
        <span style={{ fontSize: 18, fontWeight: 800, color, fontFamily: FONT }}>🔥 {streak}</span>
        <span style={{ fontSize: 11, color: t?.muted || "#a1a1a1", letterSpacing: "0.06em", textTransform: "uppercase" }}>Best {bestStreak}</span>
      </div>

      <div style={{
        position: "relative",
        margin: "0 auto",
        width: 220, height: 220,
      }}>
        {/* Progress ring */}
        <svg width="220" height="220" viewBox="0 0 220 220" style={{ position: "absolute", inset: 0 }}>
          <circle cx="110" cy="110" r={RING} fill="none" stroke={t?.border || "rgba(255,255,255,0.1)"} strokeWidth="6" />
          {phase === "active" && (
            <circle
              cx="110" cy="110" r={RING}
              fill="none"
              stroke={color}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={CIRC}
              strokeDashoffset={CIRC * (1 - ringPct)}
              transform="rotate(-90 110 110)"
              style={{ transition: "stroke-dashoffset 0.06s linear" }}
            />
          )}
        </svg>
        {/* Face */}
        <div style={{
          position: "absolute", inset: 18,
          borderRadius: "50%",
          background: `radial-gradient(circle at 50% 40%, ${color}1f 0%, rgba(255,255,255,0.04) 70%)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          border: `1px solid ${t?.border || "rgba(255,255,255,0.08)"}`,
        }}>
          <svg width="120" height="120" viewBox="0 0 120 120" aria-hidden="true">
            {/* Head */}
            <ellipse cx="60" cy="62" rx="42" ry="48" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
            {/* Eyes */}
            <circle cx="46" cy="56" r="5" fill={color} />
            <circle cx="74" cy="56" r="5" fill={color} />
            {/* Pupils — gentle micro-shift to feel alive */}
            <circle cx="47" cy="56" r="1.6" fill="#000" />
            <circle cx="75" cy="56" r="1.6" fill="#000" />
            {/* Mouth */}
            <path d="M 48 82 Q 60 90 72 82" stroke="rgba(255,255,255,0.55)" strokeWidth="2" fill="none" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      <div style={{ marginTop: 22, minHeight: 60 }}>
        {phase === "ready" && (
          <>
            <p style={{ fontSize: 14, color: t?.muted || "#a1a1a1", lineHeight: 1.55, margin: "0 0 14px" }}>
              Hold gentle eye contact with the face until the ring fills. You won&apos;t know how long it&apos;ll be.
            </p>
            <button type="button" onClick={startRound} style={{
              padding: "13px 32px", background: color, color: "#000", border: "none",
              borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: "pointer",
              fontFamily: FONT, WebkitTapHighlightColor: "transparent",
            }}>Start a round</button>
          </>
        )}
        {phase === "active" && (
          <>
            <p style={{ fontSize: 13, color: t?.muted || "#a1a1a1", margin: "0 0 12px" }}>
              {remaining}s left — stay with it
            </p>
            <button type="button" onClick={breakEarly} style={{
              padding: "10px 22px", background: "rgba(255,255,255,0.06)", color: t?.muted || "#a1a1a1",
              border: `1px solid ${t?.border || "rgba(255,255,255,0.12)"}`,
              borderRadius: 999, fontSize: 12.5, fontWeight: 600, cursor: "pointer",
              fontFamily: FONT, WebkitTapHighlightColor: "transparent",
            }}>I broke contact</button>
          </>
        )}
        {phase === "result" && (
          <>
            <p style={{ fontSize: 16, fontWeight: 700, color: held ? color : "#e5484d", margin: "0 0 12px", letterSpacing: "-0.01em" }}>
              {held ? "✓ Held the whole window" : "✗ Try again — just notice when you flinched"}
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              <button type="button" onClick={startRound} style={{
                padding: "11px 26px", background: color, color: "#000", border: "none",
                borderRadius: 14, fontSize: 14, fontWeight: 700, cursor: "pointer",
                fontFamily: FONT, WebkitTapHighlightColor: "transparent",
              }}>Next round</button>
              <button type="button" onClick={onClose} style={{
                padding: "11px 26px", background: "rgba(255,255,255,0.06)", color: t?.muted || "#a1a1a1",
                border: `1px solid ${t?.border || "rgba(255,255,255,0.12)"}`,
                borderRadius: 14, fontSize: 14, fontWeight: 600, cursor: "pointer",
                fontFamily: FONT, WebkitTapHighlightColor: "transparent",
              }}>Done</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

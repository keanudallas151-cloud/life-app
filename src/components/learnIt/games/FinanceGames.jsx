import { useState, useEffect, useRef } from "react";
import { FONT } from "../shared/constants.js";
import { Progress } from "../shared/Progress.jsx";
import { ScoreScreen } from "../shared/ScoreScreen.jsx";
import {
  INVEST_QS,
  MONEY_QS,
  COMPOUND_QS,
  NEEDS_WANTS,
} from "../data/financeData.js";
import { recordBestScore } from "../shared/constants.js";

export function FlashcardGame({ cards, color, t, play }) {
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [seen, setSeen] = useState(new Set());
  const card = cards[i];

  const next = () => {
    play?.("ok");
    setSeen(s => new Set([...s, i]));
    setFlipped(false);
    setTimeout(() => setI(n => (n + 1) % cards.length), 150);
  };

  return (
    <div style={{ padding: "20px 20px 40px", fontFamily: FONT, textAlign: "center" }}>
      <p style={{ fontSize: 13, color: t?.muted || "#a1a1a1", marginBottom: 20 }}>Tap to flip · {seen.size}/{cards.length} seen</p>
      <div style={{ perspective: "1200px", marginBottom: 20 }}>
        <div
          onClick={() => { play?.("tap"); setFlipped(!flipped); }}
          style={{
            height: 220, position: "relative",
            transformStyle: "preserve-3d",
            transition: "transform 0.5s cubic-bezier(0.34,1.56,0.64,1)",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
            cursor: "pointer",
          }}
        >
          {/* Front */}
          <div style={{
            position: "absolute", inset: 0,
            backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden",
            background: t?.light || "#1a1a1a",
            border: `1.5px solid ${t?.border || "rgba(255,255,255,0.12)"}`,
            borderRadius: 24, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "28px 24px",
          }}>
            <p style={{ fontSize: 11, fontWeight: 600, color, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 14 }}>Term</p>
            <p style={{ fontSize: 22, fontWeight: 700, color: t?.ink || "#ededed", margin: 0, letterSpacing: "-0.02em" }}>{card.term}</p>
            <p style={{ fontSize: 12, color: t?.muted || "rgba(161,161,161,0.5)", marginTop: 16 }}>Tap to reveal definition</p>
          </div>
          {/* Back */}
          <div style={{
            position: "absolute", inset: 0,
            backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            background: `${color}14`,
            border: `1.5px solid ${color}60`,
            borderRadius: 24, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "28px 24px",
            boxShadow: `0 8px 40px ${color}30`,
          }}>
            <p style={{ fontSize: 11, fontWeight: 600, color, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 14 }}>Definition</p>
            <p style={{ fontSize: 16, color: t?.ink || "#ededed", lineHeight: 1.65, margin: 0, fontWeight: 400 }}>{card.def}</p>
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <button type="button" onClick={() => { setI(n => (n - 1 + cards.length) % cards.length); setFlipped(false); }} style={{ flex: 1, padding: "13px", background: t?.light || "rgba(255,255,255,0.07)", color: t?.ink || "#ededed", border: `1px solid ${t?.border || "rgba(255,255,255,0.12)"}`, borderRadius: 14, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: FONT }}>← Prev</button>
        <button type="button" onClick={next} style={{ flex: 1, padding: "13px", background: color, color: "#000", border: "none", borderRadius: 14, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: FONT }}>Next →</button>
      </div>
    </div>
  );
}

export function BudgetGame({ color, t, play }) {
  const categories = ["Housing","Food","Transport","Entertainment","Savings","Healthcare"];
  const [budget] = useState(3000);
  const [alloc, setAlloc] = useState({ Housing: 900, Food: 450, Transport: 300, Entertainment: 150, Savings: 600, Healthcare: 150 });
  const total = Object.values(alloc).reduce((a, b) => a + b, 0);
  const remaining = budget - total;

  const ideal = { Housing: [25,35], Food: [10,15], Transport: [10,15], Entertainment: [5,10], Savings: [20,25], Healthcare: [5,10] };

  return (
    <div style={{ padding: "20px 20px 40px", fontFamily: FONT }}>
      <div style={{ background: t?.light || "rgba(255,255,255,0.05)", borderRadius: 18, padding: "18px", marginBottom: 20, border: `1px solid ${t?.border || "rgba(255,255,255,0.08)"}` }}>
        <p style={{ fontSize: 12, color: t?.muted || "#a1a1a1", margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>Monthly Budget</p>
        <p style={{ fontSize: 28, fontWeight: 800, color: t?.ink || "#ededed", margin: 0, letterSpacing: "-0.03em" }}>${budget.toLocaleString()}</p>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
          <span style={{ fontSize: 13, color: t?.muted || "#a1a1a1" }}>Allocated: <strong style={{ color: remaining < 0 ? "#e5484d" : t?.ink || "#ededed" }}>${total}</strong></span>
          <span style={{ fontSize: 13, color: remaining < 0 ? "#e5484d" : color, fontWeight: 600 }}>Remaining: ${remaining}</span>
        </div>
        <div style={{ marginTop: 10, height: 6, borderRadius: 999, background: t?.light || "rgba(255,255,255,0.1)", overflow: "hidden" }}>
          <div style={{ width: `${Math.min((total / budget) * 100, 100)}%`, height: "100%", background: remaining < 0 ? "#e5484d" : color, borderRadius: 999, transition: "width 0.3s ease" }} />
        </div>
      </div>
      {categories.map(cat => {
        const pct = Math.round((alloc[cat] / budget) * 100);
        const [min, max] = ideal[cat];
        const ok = pct >= min && pct <= max;
        return (
          <div key={cat} style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: t?.ink || "#ededed" }}>{cat}</span>
              <span style={{ fontSize: 13, color: ok ? color : "#f59e0b", fontWeight: 600 }}>${alloc[cat]} ({pct}%) {ok ? "✓" : "⚠"}</span>
            </div>
            <input type="range" min={0} max={budget} step={50} value={alloc[cat]}
              onChange={e => {
                const v = +e.target.value;
                setAlloc(a => {
                  const [mi, ma] = ideal[cat];
                  const pctNew = Math.round((v / budget) * 100);
                  const pctOld = Math.round((a[cat] / budget) * 100);
                  if (pctNew >= mi && pctNew <= ma && !(pctOld >= mi && pctOld <= ma)) play?.("star");
                  return { ...a, [cat]: v };
                });
              }}
              style={{ width: "100%", accentColor: ok ? color : "#f59e0b" }}
            />
            <p style={{ fontSize: 10, color: "rgba(161,161,161,0.5)", margin: "3px 0 0" }}>Ideal: {min}–{max}% of income</p>
          </div>
        );
      })}
    </div>
  );
}

export function InvestSaveGame({ questions: questionsProp, color, onClose, t, play }) {
  const qs = questionsProp || INVEST_QS;
  const [qi, setQi] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
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
        <p style={{ fontSize: 11, fontWeight: 600, color, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Scenario</p>
        <p style={{ fontSize: 15, color: t?.ink || "#ededed", lineHeight: 1.6, margin: 0 }}>{q.scenario}</p>
      </div>
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
              fontSize: 14, cursor: "pointer", fontFamily: FONT, fontWeight: 500,
              transition: "all 0.15s cubic-bezier(0.34,1.56,0.64,1)", WebkitTapHighlightColor: "transparent",
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
      {selected !== null && <div style={{ marginTop: 14, padding: "12px 16px", borderRadius: 14, background: `${color}10`, border: `1px solid ${color}30`, fontSize: 12.5, color: color, lineHeight: 1.55 }}>{q.reason}</div>}
    </div>
  );
}

export function MoneyMathGame({ color, onClose, t, play }) {
  const [qi, setQi] = useState(0);
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const q = MONEY_QS[qi];

  const check = () => {
    const correct = input.replace(/[^0-9]/g, "") === q.ans;
    setResult(correct ? "correct" : "wrong");
    if (correct) { setScore(s => s + 1); play?.("correct"); }
    else play?.("wrong");
    setTimeout(() => {
      if (qi + 1 >= MONEY_QS.length) setDone(true);
      else { setQi(qi + 1); setInput(""); setResult(null); }
    }, 1200);
  };

  if (done) return <ScoreScreen score={score} total={MONEY_QS.length} color={color} onReplay={() => { setQi(0); setScore(0); setInput(""); setResult(null); setDone(false); }} onClose={onClose} t={t} play={play} />;

  return (
    <div style={{ padding: "20px 20px 40px", fontFamily: FONT }}>
      <Progress current={qi} total={MONEY_QS.length} color={color} t={t} />
      <div style={{ background: t?.light || "rgba(255,255,255,0.05)", borderRadius: 18, padding: "20px", marginBottom: 20, border: `1px solid ${t?.border || "rgba(255,255,255,0.08)"}` }}>
        <p style={{ fontSize: 15, color: t?.ink || "#ededed", lineHeight: 1.6, margin: 0 }}>{q.q}</p>
      </div>
      {result && <div style={{ textAlign: "center", fontSize: 15, color: result === "correct" ? color : "#e5484d", fontWeight: 700, marginBottom: 12 }}>{result === "correct" ? "✓ Correct! " + q.display : `✗ Answer: ${q.display}`}</div>}
      <div style={{ display: "flex", gap: 10 }}>
        <input type="number" value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && check()}
          placeholder="Your answer ($)"
          style={{ flex: 1, padding: "13px 16px", borderRadius: 14, background: t?.light || "rgba(255,255,255,0.07)", border: `1.5px solid ${result === "correct" ? color : result === "wrong" ? "#e5484d" : t?.border || "rgba(255,255,255,0.15)"}`, color: t?.ink || "#ededed", fontSize: 16, outline: "none", fontFamily: FONT }} />
        <button type="button" onClick={check} style={{ padding: "13px 20px", background: color, color: "#000", border: "none", borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: FONT }}>Check</button>
      </div>
    </div>
  );
}

export function CompoundGrowthGame({ color, onClose, t, play }) {
  const [qi, setQi] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);

  const q = COMPOUND_QS[qi];

  useEffect(() => {
    if (selected !== null || done) return;
    if (timeLeft <= 0) {
      setSelected("__timeout__");
      play?.("wrong");
      setTimeout(() => {
        if (qi + 1 >= COMPOUND_QS.length) setDone(true);
        else { setQi(qi + 1); setSelected(null); setTimeLeft(15); }
      }, 1200);
      return;
    }
    const id = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearTimeout(id);
  }, [timeLeft, selected, done, qi, play]);

  const pick = (opt) => {
    if (selected !== null) return;
    setSelected(opt);
    const correct = opt === q.ans;
    if (correct) { setScore(s => s + 1); play?.("correct"); }
    else play?.("wrong");
    setTimeout(() => {
      if (qi + 1 >= COMPOUND_QS.length) setDone(true);
      else { setQi(qi + 1); setSelected(null); setTimeLeft(15); }
    }, 1200);
  };

  if (done) return <ScoreScreen score={score} total={COMPOUND_QS.length} color={color} onReplay={() => { setQi(0); setScore(0); setSelected(null); setDone(false); setTimeLeft(15); }} onClose={onClose} t={t} play={play} />;

  const urgentColor = timeLeft <= 5 ? "#e5484d" : timeLeft <= 8 ? "#f59e0b" : color;

  return (
    <div style={{ padding: "20px 20px 40px", fontFamily: FONT }}>
      <Progress current={qi} total={COMPOUND_QS.length} color={color} t={t} />
      {/* Timer */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <span style={{ fontSize: 12, color: t?.muted || "#a1a1a1", fontFamily: FONT }}>Compound Interest</span>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: urgentColor, boxShadow: `0 0 8px ${urgentColor}`, transition: "all 0.3s ease" }} />
          <span style={{ fontSize: 15, fontWeight: 700, color: urgentColor, fontFamily: FONT, transition: "color 0.3s ease", minWidth: 24, textAlign: "right" }}>{timeLeft}s</span>
        </div>
      </div>
      {/* Question card */}
      <div style={{ background: t?.light || "#1a1a1a", borderRadius: 20, padding: "22px 18px", marginBottom: 20, border: `1px solid ${t?.border || "rgba(255,255,255,0.08)"}` }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 14, textAlign: "center" }}>
          {[
            { label: "Principal", val: `$${q.principal.toLocaleString()}` },
            { label: "Rate / yr", val: `${q.rate}%` },
            { label: "Years", val: `${q.years}y` },
          ].map(({ label, val }) => (
            <div key={label} style={{ background: `${color}12`, borderRadius: 12, padding: "10px 6px", border: `1px solid ${color}30` }}>
              <div style={{ fontSize: 9, fontWeight: 700, color, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 17, fontWeight: 800, color: t?.ink || "#ededed", letterSpacing: "-0.02em" }}>{val}</div>
            </div>
          ))}
        </div>
        <p style={{ margin: 0, fontSize: 13, color: t?.muted || "#a1a1a1", textAlign: "center", fontFamily: FONT }}>What is the final value? (compound interest)</p>
      </div>
      {/* Options */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {q.opts.map(opt => {
          const isCorrect = opt === q.ans;
          const isWrong = selected === opt && !isCorrect;
          const showBadge = selected && (isCorrect || isWrong);
          return (
            <button key={opt} type="button" onClick={() => pick(opt)}
              onTouchStart={(e) => { e.currentTarget.style.transform = "scale(0.96)"; }}
              onTouchEnd={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
              style={{
                position: "relative",
                padding: "16px 10px", borderRadius: 16, fontFamily: FONT,
                border: `1.5px solid ${selected ? isCorrect ? color : isWrong ? "#e5484d" : t?.border || "rgba(255,255,255,0.07)" : t?.border || "rgba(255,255,255,0.1)"}`,
                background: selected ? isCorrect ? `${color}20` : isWrong ? "rgba(229,72,77,0.15)" : t?.light || "rgba(255,255,255,0.03)" : t?.light || "rgba(255,255,255,0.05)",
                color: selected ? isCorrect ? color : isWrong ? "#e5484d" : t?.muted || "#a1a1a1" : t?.ink || "#ededed",
                fontSize: 17, fontWeight: 700, cursor: "pointer", letterSpacing: "-0.01em",
                transition: "all 0.15s cubic-bezier(0.34,1.56,0.64,1)",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              {opt.startsWith("$") ? opt : `$${opt}`}
              {showBadge && (
                <span style={{
                  position: "absolute", right: 6, top: 6,
                  width: 20, height: 20, borderRadius: "50%",
                  background: isCorrect ? "#50c878" : "#e5484d",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 800, color: "#000",
                  animation: "popIn 0.25s cubic-bezier(0.34,1.56,0.64,1) both",
                  pointerEvents: "none",
                }}>
                  {isCorrect ? "✓" : "✗"}
                </span>
              )}
            </button>
          );
        })}
      </div>
      {selected && selected !== "__timeout__" && (
        <div style={{ marginTop: 14, padding: "12px 16px", borderRadius: 14, background: `${color}10`, border: `1px solid ${color}30`, fontSize: 12.5, color, lineHeight: 1.55, fontFamily: FONT }}>
          Formula: Principal × (1 + rate)^years = {q.display}
        </div>
      )}
      {selected === "__timeout__" && (
        <div style={{ marginTop: 14, padding: "12px 16px", borderRadius: 14, background: "rgba(229,72,77,0.12)", border: "1px solid #e5484d40", fontSize: 12.5, color: "#e5484d", lineHeight: 1.55, fontFamily: FONT }}>
          Time&apos;s up! Answer: {q.display}
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   Needs vs Wants — iOS-style swipe classifier.
   Swipe a card LEFT for "Want", RIGHT for "Need". Buttons are
   provided as an accessible fallback for keyboard / VoiceOver.
────────────────────────────────────────────────────────────── */
export function NeedsWantsGame({ color, onClose, t, play }) {
  const TOTAL = 12;
  const [pool] = useState(() => [...NEEDS_WANTS].sort(() => Math.random() - 0.5).slice(0, TOTAL));
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [drag, setDrag] = useState(0); // px offset
  const [committed, setCommitted] = useState(null); // "left" | "right" | null
  const [feedback, setFeedback] = useState(null); // { correct, tip } | null
  const startRef = useRef(0);
  const card = pool[idx];

  const commit = (direction) => {
    if (committed) return;
    setCommitted(direction);
    play?.("swipe");
    const guess = direction === "right" ? "need" : "want";
    const correct = guess === card.category;
    if (correct) { setScore((s) => s + 1); play?.("correct"); }
    else play?.("wrong");
    setFeedback({ correct, tip: card.tip });
    setTimeout(() => {
      setFeedback(null);
      setCommitted(null);
      setDrag(0);
      if (idx + 1 >= pool.length) setDone(true);
      else setIdx((i) => i + 1);
    }, 1100);
  };

  const onTouchStart = (e) => {
    if (committed) return;
    startRef.current = e.touches[0].clientX;
  };
  const onTouchMove = (e) => {
    if (committed) return;
    const dx = e.touches[0].clientX - startRef.current;
    setDrag(dx);
  };
  const onTouchEnd = () => {
    if (committed) return;
    if (drag > 110) commit("right");
    else if (drag < -110) commit("left");
    else setDrag(0);
  };

  if (done) {
    recordBestScore("needs_wants", score, pool.length);
    return (
      <ScoreScreen
        score={score}
        total={pool.length}
        color={color}
        onReplay={() => { setIdx(0); setScore(0); setDone(false); }}
        onClose={onClose}
        t={t}
        play={play}
      />
    );
  }

  if (!card) return null;
  const dragPct = Math.max(-1, Math.min(1, drag / 140));
  const tilt = dragPct * 12;
  const wantOpacity = Math.max(0, -dragPct);
  const needOpacity = Math.max(0, dragPct);

  return (
    <div style={{ padding: "20px 20px 40px", fontFamily: FONT, position: "relative" }}>
      <Progress current={idx} total={pool.length} color={color} t={t} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "8px 0 14px", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
        <span style={{ color: "#e5484d" }}>← Want</span>
        <span style={{ color: t?.muted || "#a1a1a1" }}>Swipe or tap</span>
        <span style={{ color: "#50c878" }}>Need →</span>
      </div>

      <div
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{
          position: "relative",
          background: t?.light || "rgba(255,255,255,0.05)",
          borderRadius: 22,
          padding: "30px 22px",
          minHeight: 220,
          border: `1.5px solid ${t?.border || "rgba(255,255,255,0.08)"}`,
          textAlign: "center",
          transform: committed === "left"
            ? "translateX(-130%) rotate(-18deg)"
            : committed === "right"
              ? "translateX(130%) rotate(18deg)"
              : `translateX(${drag}px) rotate(${tilt}deg)`,
          transition: committed
            ? "transform 0.45s cubic-bezier(0.34,1.1,0.64,1)"
            : drag === 0 ? "transform 0.25s cubic-bezier(0.34,1.56,0.64,1)" : "none",
          boxShadow: "0 12px 30px rgba(0,0,0,0.35)",
          touchAction: "pan-y",
          WebkitTapHighlightColor: "transparent",
        }}
      >
        <div style={{ fontSize: 56, lineHeight: 1, marginBottom: 12 }}>{card.emoji}</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: t?.ink || "#ededed", letterSpacing: "-0.02em" }}>{card.item}</div>
        <p style={{ fontSize: 12.5, color: t?.muted || "#a1a1a1", margin: "10px 0 0" }}>Is this a need or a want?</p>
        {/* Overlay stamps */}
        <div style={{
          position: "absolute", top: 18, left: 18,
          padding: "6px 12px", borderRadius: 10, border: "2.5px solid #e5484d",
          color: "#e5484d", fontWeight: 800, fontSize: 14, letterSpacing: "0.12em",
          opacity: wantOpacity, transform: `rotate(-12deg)`,
        }}>WANT</div>
        <div style={{
          position: "absolute", top: 18, right: 18,
          padding: "6px 12px", borderRadius: 10, border: "2.5px solid #50c878",
          color: "#50c878", fontWeight: 800, fontSize: 14, letterSpacing: "0.12em",
          opacity: needOpacity, transform: `rotate(12deg)`,
        }}>NEED</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 16 }}>
        <button
          type="button"
          onClick={() => commit("left")}
          style={{
            padding: "14px 0", borderRadius: 14,
            border: "1.5px solid rgba(229,72,77,0.4)",
            background: "rgba(229,72,77,0.1)",
            color: "#e5484d", fontSize: 14, fontWeight: 700, cursor: "pointer",
            fontFamily: FONT, WebkitTapHighlightColor: "transparent",
          }}
        >Want</button>
        <button
          type="button"
          onClick={() => commit("right")}
          style={{
            padding: "14px 0", borderRadius: 14,
            border: "1.5px solid rgba(80,200,120,0.4)",
            background: "rgba(80,200,120,0.1)",
            color: "#50c878", fontSize: 14, fontWeight: 700, cursor: "pointer",
            fontFamily: FONT, WebkitTapHighlightColor: "transparent",
          }}
        >Need</button>
      </div>

      {feedback && (
        <div style={{
          marginTop: 14, padding: "12px 16px", borderRadius: 14,
          background: feedback.correct ? `${color}18` : "rgba(229,72,77,0.12)",
          border: `1px solid ${feedback.correct ? color + "40" : "#e5484d40"}`,
          fontSize: 12.5, color: feedback.correct ? color : "#e5484d", lineHeight: 1.55, fontFamily: FONT,
          animation: "tipSlideUp 0.3s ease both",
        }}>
          {feedback.correct ? "✓ Right call — " : "✗ Other side — "}{feedback.tip}
        </div>
      )}
    </div>
  );
}

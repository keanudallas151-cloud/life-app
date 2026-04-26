import { useState, useEffect } from "react";
import { FONT } from "../shared/constants.js";
import { Progress } from "../shared/Progress.jsx";
import { ScoreScreen } from "../shared/ScoreScreen.jsx";
import {
  FILL_GAP_QS,
  WORD_LIST,
  VOCAB_PAIRS,
  SENTENCE_QS,
  WORD_LADDER_PUZZLES,
  SPELL_SPRINT_WORDS,
} from "../data/englishData.js";
import { recordBestScore } from "../shared/constants.js";

export function FillGapGame({ questions: questionsProp, color, onClose, t, play }) {
  const qs = questionsProp || FILL_GAP_QS;
  const [qi, setQi] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [streak, setStreak] = useState(0);
  const [hintUsed, setHintUsed] = useState(false);
  const [options, setOptions] = useState(qs[0]?.options || []);
  const [shake, setShake] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [showCorrect, setShowCorrect] = useState(false);
  const q = qs[qi];

  useEffect(() => {
    setOptions(qs[qi]?.options || []);
    setHintUsed(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qi]);

  useEffect(() => {
    setTimeLeft(15);
  }, [qi]);

  useEffect(() => {
    if (selected || done) return;
    if (timeLeft <= 0) {
      setStreak(0);
      const p = play;
      p?.("timer_out");
      setTimeout(() => {
        if (qi + 1 >= qs.length) setDone(true);
        else { setQi(q2 => q2 + 1); setSelected(null); setTimeLeft(15); }
      }, 400);
      return;
    }
    if (timeLeft <= 5) play?.("timer_tick");
    const timer = setTimeout(() => setTimeLeft(tl => tl - 1), 1000);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, selected, done, qi, play]);

  const pick = (opt) => {
    if (selected) return;
    setSelected(opt);
    if (opt === q.answer) {
      setScore(s => s + 1);
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak >= 5)      play?.("streak_5");
      else if (newStreak >= 3) play?.("streak_3");
      else if (newStreak >= 2) play?.("streak_2");
      else                     play?.("coin");
      setShowCorrect(true);
      setTimeout(() => setShowCorrect(false), 700);
    } else {
      setStreak(0);
      setShake(true);
      setTimeout(() => setShake(false), 400);
      play?.("word_wrong");
    }
    setTimeout(() => {
      if (qi + 1 >= qs.length) setDone(true);
      else { setQi(qi + 1); setSelected(null); }
    }, 900);
  };

  if (done) return <ScoreScreen score={score} total={qs.length} color={color} onReplay={() => { setQi(0); setScore(0); setSelected(null); setDone(false); setStreak(0); }} onClose={onClose} t={t} play={play} />;

  return (
    <div style={{ padding: "20px 20px 40px", fontFamily: FONT, position: "relative" }}>
      {showCorrect && (
        <div style={{
          position: "absolute", top: 80, left: "50%", transform: "translateX(-50%)",
          zIndex: 10, pointerEvents: "none",
          background: `${color}dd`, borderRadius: 999,
          padding: "8px 20px", fontSize: 16, fontWeight: 800, color: "#000",
          animation: "correctBurst 0.55s cubic-bezier(0.34,1.56,0.64,1) both",
          fontFamily: FONT,
        }}>✓ Correct!</div>
      )}
      {/* Timer ring */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
        <div style={{
          position: "relative", width: 64, height: 64,
          animation: timeLeft <= 5 ? "timerPulse 0.6s ease-in-out infinite" : "none",
        }}>
          <svg width="64" height="64" viewBox="0 0 64 64" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="32" cy="32" r="28" fill="none" stroke={t?.border||"rgba(255,255,255,0.1)"} strokeWidth="4" />
            <circle cx="32" cy="32" r="28" fill="none"
              stroke={timeLeft <= 5 ? "#e5484d" : timeLeft <= 8 ? "#f59e0b" : color}
              strokeWidth="4"
              strokeDasharray="176"
              strokeDashoffset={`${176 - (timeLeft / 15) * 176}`}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 0.9s linear, stroke 0.3s ease" }}
            />
          </svg>
          <div style={{
            position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, fontWeight: 800, color: timeLeft <= 5 ? "#e5484d" : timeLeft <= 8 ? "#f59e0b" : color,
            fontFamily: FONT, transition: "color 0.3s ease",
          }}>{timeLeft}</div>
        </div>
      </div>
      <Progress current={qi} total={qs.length} color={color} t={t} />
      {streak >= 3 && (
        <div style={{ textAlign: "right", marginTop: -14, marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#f59e0b", fontFamily: FONT, animation: "streakPulseAnim 1.05s ease-in-out infinite" }}>🔥 ×{streak} streak!</span>
        </div>
      )}
      <div key={qi} style={{
        background: t?.light || "rgba(255,255,255,0.05)",
        borderRadius: 18,
        padding: "22px 18px",
        marginBottom: 22,
        border: `1px solid ${t?.border || "rgba(255,255,255,0.08)"}`,
        animation: shake
          ? "fillGapShake 0.35s ease"
          : timeLeft <= 5
            ? "questionIn 0.3s cubic-bezier(0.34,1.56,0.64,1) both, cardGlowPulse 1.2s ease-in-out infinite 0.3s"
            : "questionIn 0.3s cubic-bezier(0.34,1.56,0.64,1) both",
      }}>
        <p style={{ fontSize: 16, color: t?.ink || "#ededed", lineHeight: 1.65, margin: 0, fontWeight: 500, letterSpacing: "-0.01em" }}>
          {q.sentence.replace("___", "______")}
        </p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {options.map(opt => {
          const isCorrect = opt === q.answer;
          const isWrong = selected === opt && !isCorrect;
          return (
            <button key={opt} type="button" onClick={() => pick(opt)}
              onTouchStart={(e) => { e.currentTarget.style.transform = "scale(0.96)"; }}
              onTouchEnd={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
              style={{
              padding: "14px 12px",
              borderRadius: 16,
              border: `1.5px solid ${selected ? isCorrect ? color : isWrong ? "#e5484d" : t?.border || "rgba(255,255,255,0.07)" : t?.border || "rgba(255,255,255,0.1)"}`,
              background: selected ? isCorrect ? `${color}18` : isWrong ? "rgba(229,72,77,0.12)" : t?.light || "rgba(255,255,255,0.03)" : t?.light || "rgba(255,255,255,0.05)",
              color: selected ? isCorrect ? color : isWrong ? "#e5484d" : t?.muted || "#a1a1a1" : t?.ink || "#ededed",
              fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: FONT,
              transition: "all 0.15s cubic-bezier(0.34,1.56,0.64,1)", WebkitTapHighlightColor: "transparent",
            }}>
              {opt}
            </button>
          );
        })}
      </div>
      {!selected && !hintUsed && (
        <button type="button" onClick={() => {
          play?.("hint_used");
          setHintUsed(true);
          const wrongs = q.options.filter(o => o !== q.answer);
          const keep = wrongs[Math.floor(Math.random() * wrongs.length)];
          setOptions([q.answer, keep].sort(() => Math.random() - 0.5));
        }} style={{
          display: "block", margin: "12px auto 0", padding: "8px 18px",
          background: "rgba(255,255,255,0.06)", color: t?.muted || "#a1a1a1",
          border: `1px solid ${t?.border || "rgba(255,255,255,0.12)"}`,
          borderRadius: 999, fontSize: 12.5, fontWeight: 600, cursor: "pointer",
          fontFamily: FONT, WebkitTapHighlightColor: "transparent",
        }}>💡 Hint (removes 2 options)</button>
      )}
    </div>
  );
}

const KB_ROWS = [
  ["Q","W","E","R","T","Y","U","I","O","P"],
  ["A","S","D","F","G","H","J","K","L"],
  ["ENTER","Z","X","C","V","B","N","M","⌫"],
];

export function WordGuessGame({ color, t, play }) {
  const [target] = useState(() => WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)]);
  const [guesses, setGuesses] = useState([]);
  const [current, setCurrent] = useState("");
  const [won, setWon] = useState(false);
  const [lost, setLost] = useState(false);
  const [shakeRow, setShakeRow] = useState(false);
  const maxGuesses = 6;

  const submit = () => {
    if (current.length !== 5) {
      setShakeRow(true);
      setTimeout(() => setShakeRow(false), 400);
      play?.("timer_out");
      return;
    }
    const g = current.toUpperCase();
    const next = [...guesses, g];
    setGuesses(next);
    setCurrent("");
    play?.("build_word");
    if (g === target) { setWon(true); play?.("level_up"); }
    else if (next.length >= maxGuesses) { setLost(true); play?.("game_over"); }
    else { play?.("word_wrong"); }
  };

  const getLetterState = (letter, pos, word) => {
    if (word[pos] === letter) return "correct";
    if (target.includes(letter)) return "present";
    return "absent";
  };

  const letterStates = (() => {
    const states = {};
    guesses.forEach(g => {
      g.split("").forEach((l, i) => {
        const cur = states[l];
        if (target[i] === l) { states[l] = "correct"; }
        else if (target.includes(l) && cur !== "correct") { states[l] = "present"; }
        else if (!target.includes(l) && cur !== "correct" && cur !== "present") { states[l] = "absent"; }
      });
    });
    return states;
  })();

  const tapKey = (key) => {
    if (won || lost) return;
    if (key === "⌫") { setCurrent(c => c.slice(0, -1)); play?.("game_tap"); }
    else if (key === "ENTER") { submit(); }
    else if (current.length < 5) { setCurrent(c => c + key); play?.("key_press"); }
  };

  const keyStyle = (k) => {
    const s = letterStates[k];
    const isWide = k === "ENTER" || k === "⌫";
    return {
      minWidth: isWide ? 52 : 34, height: 44, borderRadius: 8,
      background: s === "correct" ? color : s === "present" ? "#f59e0b" : s === "absent" ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.08)",
      color: s === "correct" || s === "present" ? "#000" : t?.ink || "#ededed",
      border: "none", fontSize: isWide ? 10 : 14, fontWeight: 700,
      cursor: "pointer", fontFamily: FONT, WebkitTapHighlightColor: "transparent",
      transition: "background 0.2s ease",
      flexShrink: 0,
    };
  };

  const reset = () => { setGuesses([]); setCurrent(""); setWon(false); setLost(false); setShakeRow(false); };

  if (won || lost) {
    const guessCount = guesses.length;
    return (
      <div style={{ padding: "32px 24px", textAlign: "center", fontFamily: FONT }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 24 }}>
          {target.split("").map((l, i) => (
            <div key={i} style={{
              width: 52, height: 52, borderRadius: 12,
              background: won ? `${color}25` : "rgba(255,255,255,0.08)",
              border: `2px solid ${won ? color : "rgba(255,255,255,0.2)"}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22, fontWeight: 800, color: won ? color : t?.ink||"#ededed",
              fontFamily: FONT,
              animation: won ? `bounceTile 0.5s cubic-bezier(0.34,1.56,0.64,1) ${i * 100}ms both` : "none",
            }}>{l}</div>
          ))}
        </div>
        <div style={{ fontSize: 26, fontWeight: 800, color: t?.ink||"#ededed", marginBottom: 8, letterSpacing: "-0.03em" }}>
          {won ? "🎉 You Got It!" : "Better luck next time"}
        </div>
        {won && <div style={{ fontSize: 14, color: t?.muted||"#a1a1a1", marginBottom: 8 }}>Solved in {guessCount} guess{guessCount !== 1 ? "es" : ""}!</div>}
        {!won && <div style={{ fontSize: 15, color: t?.muted||"#a1a1a1", marginBottom: 24 }}>The word was <strong style={{ color }}>{target}</strong></div>}
        {won && (
          <div style={{ display: "inline-flex", padding: "6px 18px", borderRadius: 999, background: `${color}18`, border: `1px solid ${color}40`, fontSize: 14, color, fontWeight: 700, marginBottom: 24 }}>
            {guessCount === 1 ? "Hole in one! 🌟" : guessCount <= 3 ? "Impressive! ⚡" : guessCount <= 5 ? "Well played! 👏" : "Just made it! 🎯"}
          </div>
        )}
        <button type="button" onClick={reset} style={{
          padding: "14px 36px", background: color, color: "#000", borderRadius: 14,
          border: "none", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: FONT,
          boxShadow: `0 4px 20px ${color}40`,
        }}>Play Again</button>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px 20px 40px", fontFamily: FONT }}>
      <p style={{ textAlign: "center", fontSize: 13, color: t?.muted || "#a1a1a1", marginBottom: 20 }}>Guess the 5-letter word in {maxGuesses} tries</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16, alignItems: "center" }}>
        {Array.from({ length: maxGuesses }).map((_, ri) => {
          const g = guesses[ri] || "";
          const isCompleted = ri < guesses.length;
          return (
            <div key={ri} style={{
              display: "flex", gap: 6,
              animation: ri === guesses.length && shakeRow ? "rowShake 0.4s ease both" : "none",
            }}>
              {Array.from({ length: 5 }).map((_, ci) => {
                const l = g[ci] || (ri === guesses.length ? current[ci] : "");
                const state = g[ci] ? getLetterState(g[ci], ci, g) : "empty";
                return (
                  <div key={ci} style={{
                    width: 52, height: 52, borderRadius: 12,
                    border: `2px solid ${state === "correct" ? color : state === "present" ? "#f59e0b" : state === "absent" ? "rgba(255,255,255,0.15)" : ri === guesses.length && l ? `${color}90` : ri === guesses.length ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.15)"}`,
                    background: state === "correct" ? `${color}25` : state === "present" ? "rgba(245,158,11,0.2)" : state === "absent" ? "rgba(255,255,255,0.06)" : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 20, fontWeight: 800, color: state === "correct" ? color : state === "present" ? "#f59e0b" : t?.ink || "#ededed",
                    fontFamily: FONT, transition: "all 0.2s ease",
                    animation: ri === guesses.length && l && !isCompleted ? "popIn 0.15s cubic-bezier(0.34,1.56,0.64,1) both" : isCompleted && g[ci] ? `tileFlip 0.4s ease ${ci * 0.08}s both` : "none",
                  }}>{l}</div>
                );
              })}
            </div>
          );
        })}
      </div>
      <input
        type="text" maxLength={5}
        value={current}
        onChange={(e) => setCurrent(e.target.value.toUpperCase().replace(/[^A-Z]/g, ""))}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        style={{ position: "absolute", opacity: 0, pointerEvents: "none", width: 1, height: 1 }}
        readOnly
      />
      <div style={{ marginTop: 8 }}>
        {KB_ROWS.map((row, ri) => (
          <div key={ri} style={{ display: "flex", justifyContent: "center", gap: 5, marginBottom: 6 }}>
            {row.map(k => (
              <button key={k} type="button" onClick={() => tapKey(k)} style={keyStyle(k)}>{k}</button>
            ))}
          </div>
        ))}
      </div>
      <p style={{ textAlign: "center", fontSize: 12, color: t?.muted || "#a1a1a1", marginTop: 8 }}>{guesses.length}/{maxGuesses} guesses</p>
    </div>
  );
}

export function VocabMatchGame({ color, onClose, t, play }) {
  const ROUND_SIZE = 6;
  const totalRounds = Math.ceil(VOCAB_PAIRS.length / ROUND_SIZE);
  const [round, setRound] = useState(0);
  const [selected, setSelected] = useState({ word: null, def: null });
  const [matched, setMatched] = useState([]);
  const [wrong, setWrong] = useState(false);
  const [lastMatch, setLastMatch] = useState({ word: null, def: null });
  const [done, setDone] = useState(false);
  const [moves, setMoves] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [roundComplete, setRoundComplete] = useState(false);

  const roundPairs = VOCAB_PAIRS.slice(round * ROUND_SIZE, (round + 1) * ROUND_SIZE);
  const [roundDefsMap] = useState(() => {
    const map = [];
    for (let r = 0; r < Math.ceil(VOCAB_PAIRS.length / ROUND_SIZE); r++) {
      const pairs = VOCAB_PAIRS.slice(r * ROUND_SIZE, (r + 1) * ROUND_SIZE);
      map.push([...pairs.map(p => p.def)].sort(() => Math.random() - 0.5));
    }
    return map;
  });
  const roundDefs = roundDefsMap[round] || [...roundPairs.map(p => p.def)].sort(() => Math.random() - 0.5);
  const roundWords = roundPairs.map(p => p.word);
  const roundMatched = matched.filter(w => roundWords.includes(w));

  useEffect(() => {
    if (done) return;
    if (roundMatched.length === roundPairs.length) return;
    if (timeLeft <= 0) {
      play?.("timer_out");
      if (round + 1 >= totalRounds) { setDone(true); return; }
      setTimeout(() => { setRound(r => r + 1); setTimeLeft(30); setSelected({ word: null, def: null }); }, 400);
      return;
    }
    if (timeLeft <= 5) play?.("timer_tick");
    const timer = setTimeout(() => setTimeLeft(tl => tl - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, done, round, roundMatched.length, roundPairs.length, totalRounds, play]);

  useEffect(() => {
    if (roundMatched.length === roundPairs.length && roundPairs.length > 0) {
      play?.("round_clear");
      setRoundComplete(true);
      setTimeout(() => {
        setRoundComplete(false);
        if (round + 1 >= totalRounds) { setDone(true); }
        else { setRound(r => r + 1); setTimeLeft(30); setSelected({ word: null, def: null }); }
      }, 1400);
    }
  }, [roundMatched.length, roundPairs.length, round, totalRounds, play]);

  const pick = (type, val) => {
    play?.("game_tap");
    const next = { ...selected, [type]: val };
    setSelected(next);
    if (next.word && next.def) {
      setMoves(m => m + 1);
      const pair = VOCAB_PAIRS.find(p => p.word === next.word);
      if (pair?.def === next.def) {
        play?.("match_found");
        const newMatched = [...matched, next.word];
        setMatched(newMatched);
        setLastMatch({ word: next.word, def: next.def });
        setTimeout(() => setLastMatch({ word: null, def: null }), 600);
        setSelected({ word: null, def: null });
      } else {
        play?.("word_wrong");
        setWrong(true);
        setTimeout(() => { setWrong(false); setSelected({ word: null, def: null }); }, 700);
      }
    }
  };

  if (done) return <ScoreScreen score={matched.length} total={VOCAB_PAIRS.length} color={color} customMsg={`Matched ${matched.length} in ${moves} moves!`} onReplay={() => { setRound(0); setSelected({ word: null, def: null }); setMatched([]); setWrong(false); setDone(false); setMoves(0); setTimeLeft(30); }} onClose={onClose} t={t} play={play} />;

  const btnStyle = (active, isMatched, isJustMatched, isWrongActive) => ({
    padding: "11px 12px", borderRadius: 12, border: `1.5px solid ${isMatched ? `${color}40` : active ? color : isWrongActive ? "#e5484d" : "rgba(255,255,255,0.1)"}`,
    background: isMatched ? `${color}10` : active ? `${color}18` : isWrongActive ? "rgba(229,72,77,0.15)" : "rgba(255,255,255,0.04)",
    color: isMatched ? `${color}80` : active ? color : t?.ink || "#ededed",
    fontSize: 12.5, fontWeight: 600, cursor: isMatched ? "default" : "pointer",
    fontFamily: FONT, textAlign: "left", lineHeight: 1.4,
    transition: "all 0.2s ease", WebkitTapHighlightColor: "transparent",
    opacity: isMatched ? 0.5 : 1,
    animation: isJustMatched
      ? "vocabFlip360 0.55s cubic-bezier(0.34,1.56,0.64,1) both"
      : isWrongActive
        ? "vocabHorizShake 0.4s ease both"
        : "none",
    transformStyle: "preserve-3d",
  });

  return (
    <div style={{ padding: "20px 20px 40px", fontFamily: FONT, position: "relative" }}>
      {roundComplete && (
        <div style={{
          position: "absolute", top: "30%", left: "50%", transform: "translateX(-50%)",
          zIndex: 20, pointerEvents: "none", textAlign: "center",
          animation: "roundComplete 0.45s cubic-bezier(0.34,1.56,0.64,1) both",
          background: `${color}ee`, borderRadius: 20, padding: "20px 32px",
          boxShadow: `0 8px 40px ${color}60`,
          minWidth: 200,
        }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🎯</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#000", fontFamily: FONT }}>Round Complete!</div>
          <div style={{ fontSize: 13, color: "rgba(0,0,0,0.7)", fontFamily: FONT, marginTop: 4 }}>
            {round + 1 < totalRounds ? `Round ${round + 2} starting…` : "Final round!"}
          </div>
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: t?.ink || "#ededed", fontFamily: FONT }}>Round {round + 1} of {totalRounds}</span>
        <div style={{ padding: "5px 12px", borderRadius: 999, background: timeLeft <= 8 ? "rgba(229,72,77,0.15)" : `${color}15`, border: `1px solid ${timeLeft <= 8 ? "#e5484d40" : color + "40"}` }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: timeLeft <= 8 ? "#e5484d" : color, fontFamily: FONT }}>{timeLeft}s</span>
        </div>
      </div>
      <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 12 }}>
        {Array.from({ length: totalRounds }).map((_, i) => (
          <div key={i} style={{
            width: i === round ? 20 : 8, height: 8, borderRadius: 999,
            background: i < round ? color : i === round ? color : t?.border||"rgba(255,255,255,0.15)",
            transition: "all 0.3s cubic-bezier(0.34,1.56,0.64,1)",
          }} />
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, perspective: "1000px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: color, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Words</p>
          {roundWords.map(w => (
            <button key={w} type="button" onClick={() => !matched.includes(w) && pick("word", w)} style={btnStyle(selected.word === w, matched.includes(w), lastMatch.word === w, wrong && selected.word === w)}>{w}</button>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: color, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Definitions</p>
          {roundDefs.map(d => {
            const matchedWord = VOCAB_PAIRS.find(p => p.def === d && matched.includes(p.word));
            return (
              <button key={d} type="button" onClick={() => !matchedWord && pick("def", d)} style={btnStyle(selected.def === d, !!matchedWord, lastMatch.def === d, wrong && selected.def === d)}>{d}</button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function SentenceBuilderGame({ color, onClose, t, play }) {
  const [qi, setQi] = useState(0);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [firstTry, setFirstTry] = useState(true);
  const q = SENTENCE_QS[qi];
  const [shuffled] = useState(() => SENTENCE_QS.map(sentenceQ => [...sentenceQ.words].sort(() => Math.random() - 0.5)));
  const [built, setBuilt] = useState([]);
  const [remaining, setRemaining] = useState(shuffled[0]);
  const [result, setResult] = useState(null);

  const addWord = (word, idx) => {
    if (result) return;
    play?.("key_press");
    setBuilt(b => [...b, word]);
    setRemaining(r => r.filter((_, i) => i !== idx));
  };

  const removeWord = (idx) => {
    if (result) return;
    play?.("game_tap");
    setFirstTry(false);
    const word = built[idx];
    setBuilt(b => b.filter((_, i) => i !== idx));
    setRemaining(r => [...r, word]);
  };

  const check = () => {
    const correct = JSON.stringify(built) === JSON.stringify(q.answer);
    setResult(correct ? "correct" : "wrong");
    if (correct) {
      setScore(s => s + (firstTry ? 2 : 1));
      play?.("sentence_ok");
      setTimeout(() => play?.("coin"), 180);
      if (firstTry) setTimeout(() => play?.("streak_2"), 400);
      setTimeout(() => {
        if (qi + 1 >= SENTENCE_QS.length) setDone(true);
        else { setQi(qi + 1); setBuilt([]); setRemaining(shuffled[qi + 1]); setResult(null); setFirstTry(true); }
      }, 1000);
    } else {
      play?.("word_wrong");
    }
  };

  if (done) return <ScoreScreen score={score} total={SENTENCE_QS.length * 2} color={color} onReplay={() => { setQi(0); setScore(0); setDone(false); setBuilt([]); setRemaining(shuffled[0]); setResult(null); setFirstTry(true); }} onClose={onClose} t={t} play={play} />;

  return (
    <div style={{ padding: "20px 20px 40px", fontFamily: FONT }}>
      <Progress current={qi} total={SENTENCE_QS.length} color={color} t={t} />
      <div style={{ textAlign: "center", marginBottom: 12 }}>
        <span style={{
          fontSize: 11, fontWeight: 700, color,
          textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: FONT,
          padding: "4px 12px", borderRadius: 999,
          background: `${color}15`, border: `1px solid ${color}30`,
        }}>📌 {q.hint}</span>
      </div>
      <p style={{ fontSize: 13, color: t?.muted || "#a1a1a1", marginBottom: 16 }}>Tap words to build the sentence in the correct order</p>
      {/* Built area */}
      <div style={{ minHeight: 64, background: "rgba(255,255,255,0.04)", borderRadius: 16, border: `2px dashed ${result === "correct" ? color : result === "wrong" ? "#e5484d" : "rgba(255,255,255,0.12)"}`, padding: "12px 14px", marginBottom: 16, display: "flex", flexWrap: "wrap", gap: 8, transition: "border-color 0.2s ease" }}>
        {built.map((w, i) => (
          <button key={i} type="button" onClick={() => removeWord(i)} style={{ padding: "7px 12px", borderRadius: 999, background: `${color}22`, border: `1px solid ${color}60`, color, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: FONT, WebkitTapHighlightColor: "transparent" }}>{w}</button>
        ))}
        {built.length === 0 && <span style={{ color: "rgba(161,161,161,0.35)", fontSize: 13 }}>Tap words below…</span>}
      </div>
      {/* Shuffle + Word bank */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
        <button type="button" onClick={() => { play?.("hint_used"); setRemaining(r => [...r].sort(() => Math.random() - 0.5)); }} style={{ padding: "7px 14px", borderRadius: 999, background: "rgba(255,255,255,0.06)", color: t?.muted || "#a1a1a1", border: `1px solid ${t?.border || "rgba(255,255,255,0.1)"}`, fontSize: 12, cursor: "pointer", fontFamily: FONT, WebkitTapHighlightColor: "transparent" }}>⇄ Shuffle</button>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
        {remaining.map((w, i) => (
          <button key={i} type="button" onClick={() => addWord(w, i)} style={{ padding: "9px 14px", borderRadius: 999, background: t?.light || "rgba(255,255,255,0.07)", border: `1px solid ${t?.border || "rgba(255,255,255,0.12)"}`, color: t?.ink || "#ededed", fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: FONT, WebkitTapHighlightColor: "transparent" }}>{w}</button>
        ))}
      </div>
      {firstTry && remaining.length === 0 && result === null && (
        <p style={{ textAlign: "center", fontSize: 11.5, color: color, fontWeight: 700, marginBottom: 6, fontFamily: FONT }}>✨ First try bonus active!</p>
      )}
      <button type="button" onClick={check} disabled={remaining.length > 0} style={{ width: "100%", padding: "14px", background: remaining.length > 0 ? "rgba(255,255,255,0.06)" : color, color: remaining.length > 0 ? "#a1a1a1" : "#000", borderRadius: 14, border: "none", fontSize: 15, fontWeight: 700, cursor: remaining.length > 0 ? "not-allowed" : "pointer", fontFamily: FONT, transition: "all 0.2s ease" }}>
        Check Sentence
      </button>
      {result === "wrong" && (
        <button type="button" onClick={() => {
          play?.("game_tap");
          setBuilt([]);
          setRemaining(shuffled[qi]);
          setResult(null);
          setFirstTry(false);
        }} style={{ width: "100%", marginTop: 10, padding: "13px", background: "rgba(255,255,255,0.06)", color: t?.ink || "#ededed", border: `1px solid ${t?.border || "rgba(255,255,255,0.12)"}`, borderRadius: 14, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: FONT }}>↺ Try Again</button>
      )}
      {result === "correct" && (
        <div style={{
          marginTop: 12, padding: "12px 16px", borderRadius: 14,
          background: `${color}15`, border: `1px solid ${color}40`,
          fontSize: 14, color, fontWeight: 600, fontFamily: FONT,
          textAlign: "center", animation: "tipSlideUp 0.3s ease both",
          lineHeight: 1.6,
        }}>✓ &ldquo;{q.answer.join(" ")}&rdquo;</div>
      )}
    </div>
  );
}

export function WordLadderGame({ color, t, play }) {
  const [pi, setPi] = useState(0);
  const [currentStep, setCurrentStep] = useState(1);
  const [input, setInput] = useState("");
  const [revealed, setRevealed] = useState([0]);
  const [shake, setShake] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [score, setScore] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [done, setDone] = useState(false);

  const p = WORD_LADDER_PUZZLES[pi];
  const stepWord = p.steps[currentStep];
  const prevWord = p.steps[currentStep - 1];

  const differsBy1 = (a, b) => {
    if (a.length !== b.length) return false;
    let diff = 0;
    for (let i = 0; i < a.length; i++) { if (a[i] !== b[i]) diff++; }
    return diff === 1;
  };

  const changedLetterIdx = (a, b) => {
    for (let i = 0; i < a.length; i++) { if (a[i] !== b[i]) return i; }
    return -1;
  };

  const submitStep = () => {
    const guess = input.toUpperCase().trim();
    if (guess.length !== stepWord.length) return;
    if (!differsBy1(guess, prevWord)) {
      setShake(true);
      play?.("word_wrong");
      setTimeout(() => setShake(false), 400);
      return;
    }
    if (guess === stepWord) {
      play?.("ladder_step");
      setCorrect(true);
      setScore(s => s + (hintUsed ? 0 : 1));
      setTotalSteps(s => s + 1);
      const newRevealed = [...revealed, currentStep];
      setRevealed(newRevealed);
      setTimeout(() => {
        setCorrect(false);
        if (currentStep + 1 >= p.steps.length) {
          play?.("round_clear");
          if (pi + 1 >= WORD_LADDER_PUZZLES.length) {
            setTimeout(() => { play?.("ladder_done"); setDone(true); }, 500);
          } else {
            setTimeout(() => {
              setPi(pi + 1); setCurrentStep(1); setRevealed([0]); setInput(""); setHintUsed(false);
            }, 600);
          }
        } else {
          setCurrentStep(currentStep + 1); setInput(""); setHintUsed(false);
        }
      }, 800);
    } else {
      setShake(true);
      play?.("word_wrong");
      setTimeout(() => setShake(false), 400);
    }
  };

  const useHint = () => {
    play?.("hint_used");
    setHintUsed(true);
    setInput(stepWord);
  };

  if (done) {
    const pct = totalSteps > 0 ? Math.round((score / totalSteps) * 100) : 100;
    return (
      <div style={{ padding: "32px 24px", textAlign: "center", fontFamily: FONT }}>
        <div style={{ fontSize: 52, marginBottom: 16 }}>🪜</div>
        <div style={{ fontSize: 26, fontWeight: 800, color: t?.ink || "#ededed", marginBottom: 8, letterSpacing: "-0.03em" }}>All Ladders Complete!</div>
        <div style={{ fontSize: 16, color, fontWeight: 700, marginBottom: 24 }}>{score}/{totalSteps} steps solved independently</div>
        <div style={{ fontSize: 13, color: t?.muted || "#a1a1a1", marginBottom: 24 }}>{pct >= 80 ? "Outstanding!" : pct >= 60 ? "Great work!" : "Keep practising!"}</div>
        <button type="button" onClick={() => { setPi(0); setCurrentStep(1); setRevealed([0]); setInput(""); setScore(0); setTotalSteps(0); setDone(false); setHintUsed(false); }} style={{ padding: "13px 28px", background: color, color: "#000", borderRadius: 999, border: "none", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: FONT }}>Play Again</button>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px 20px 40px", fontFamily: FONT }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color, textTransform: "uppercase", letterSpacing: "0.06em" }}>Puzzle {pi + 1} of {WORD_LADDER_PUZZLES.length}</p>
          <p style={{ margin: "3px 0 0", fontSize: 13, color: t?.muted || "#a1a1a1" }}>
            <strong style={{ color }}>{p.start}</strong> → <strong style={{ color }}>{p.end}</strong> ({p.steps.length - 1} step{p.steps.length > 2 ? "s" : ""})
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ margin: 0, fontSize: 11, color: t?.muted || "#a1a1a1" }}>Score</p>
          <p style={{ margin: "2px 0 0", fontSize: 18, fontWeight: 800, color, letterSpacing: "-0.02em" }}>{score}</p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "center", marginBottom: 20 }}>
        {revealed.map(idx => {
          const word = p.steps[idx];
          const prev = p.steps[idx - 1];
          const changedIdx = prev ? changedLetterIdx(prev, word) : -1;
          return (
            <div key={idx} style={{ display: "flex", gap: 5 }}>
              {word.split("").map((l, li) => (
                <div key={li} style={{
                  width: word.length > 4 ? 44 : 52, height: word.length > 4 ? 46 : 52,
                  borderRadius: 12, border: `2px solid ${li === changedIdx && idx > 0 ? color : t?.border || "rgba(255,255,255,0.15)"}`,
                  background: li === changedIdx && idx > 0 ? `${color}18` : t?.light || "rgba(255,255,255,0.05)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18, fontWeight: 800,
                  color: li === changedIdx && idx > 0 ? color : t?.ink || "#ededed",
                  fontFamily: FONT, transition: "all 0.3s ease",
                }}>{l}</div>
              ))}
            </div>
          );
        })}

        {currentStep < p.steps.length && (
          <div style={{ display: "flex", gap: 5, animation: shake ? "fillGapShake 0.35s ease" : "none" }}>
            {Array.from({ length: stepWord.length }).map((_, li) => {
              const showSolved = correct;
              const ch = input[li] || (showSolved ? stepWord[li] : "");
              return (
                <div key={li} style={{
                  width: stepWord.length > 4 ? 44 : 52, height: stepWord.length > 4 ? 46 : 52,
                  borderRadius: 12,
                  border: `2px solid ${correct ? color : input[li] ? `${color}60` : t?.border || "rgba(255,255,255,0.2)"}`,
                  background: correct ? `${color}20` : input[li] ? `${color}10` : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18, fontWeight: 800,
                  color: correct ? color : input[li] ? t?.ink || "#ededed" : "rgba(255,255,255,0.2)",
                  fontFamily: FONT, transition: "all 0.2s ease",
                }}>
                  <span style={showSolved ? {
                    display: "inline-block",
                    animation: `letterDrop 0.32s cubic-bezier(0.34,1.56,0.64,1) ${li * 60}ms both`,
                  } : undefined}>{ch}</span>
                </div>
              );
            })}
          </div>
        )}

        {Array.from({ length: p.steps.length - currentStep - 1 }).map((_, i) => (
          <div key={i} style={{ display: "flex", gap: 5, opacity: 0.2 }}>
            {p.steps[currentStep + 1 + i].split("").map((_, li) => (
              <div key={li} style={{
                width: p.steps[0].length > 4 ? 44 : 52, height: p.steps[0].length > 4 ? 46 : 52,
                borderRadius: 12, border: `2px solid ${t?.border || "rgba(255,255,255,0.12)"}`,
                background: "transparent",
              }} />
            ))}
          </div>
        ))}
      </div>

      {currentStep < p.steps.length && (
        <>
          <p style={{ textAlign: "center", fontSize: 12.5, color: t?.muted || "#a1a1a1", marginBottom: 10, fontFamily: FONT }}>
            Change 1 letter from <strong style={{ color }}>{prevWord}</strong> — type a {stepWord.length}-letter word
          </p>
          {/* Hidden input for desktop keyboard support */}
          <input
            type="text" maxLength={stepWord.length}
            value={input}
            onChange={e => setInput(e.target.value.toUpperCase().replace(/[^A-Z]/g, ""))}
            onKeyDown={e => e.key === "Enter" && submitStep()}
            style={{ position: "absolute", opacity: 0, pointerEvents: "none", width: 1, height: 1 }}
          />
          {/* On-screen keyboard */}
          <div style={{ marginBottom: 12 }}>
            {[["Q","W","E","R","T","Y","U","I","O","P"],["A","S","D","F","G","H","J","K","L"],["ENTER","Z","X","C","V","B","N","M","⌫"]].map((row, kri) => (
              <div key={kri} style={{ display: "flex", justifyContent: "center", gap: 4, marginBottom: 5 }}>
                {row.map(k => {
                  const isWide = k === "ENTER" || k === "⌫";
                  return (
                    <button key={k} type="button" onClick={() => {
                      if (k === "⌫") { setInput(v => v.slice(0, -1)); play?.("game_tap"); }
                      else if (k === "ENTER") { play?.("build_word"); submitStep(); }
                      else if (input.length < stepWord.length) { setInput(v => v + k); play?.("key_press"); }
                    }} style={{
                      minWidth: isWide ? 48 : 32, height: 42, borderRadius: 8,
                      background: t?.light||"rgba(255,255,255,0.08)",
                      color: t?.ink||"#ededed",
                      border: `1px solid ${t?.border||"rgba(255,255,255,0.12)"}`,
                      fontSize: isWide ? 9 : 13, fontWeight: 700,
                      cursor: "pointer", fontFamily: FONT, WebkitTapHighlightColor: "transparent",
                      flexShrink: 0,
                    }}>{k}</button>
                  );
                })}
              </div>
            ))}
          </div>
          {!hintUsed && (
            <button type="button" onClick={useHint} style={{
              display: "block", margin: "0 auto", padding: "8px 18px",
              background: "rgba(255,255,255,0.06)", color: t?.muted || "#a1a1a1",
              border: `1px solid ${t?.border || "rgba(255,255,255,0.12)"}`,
              borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: "pointer",
              fontFamily: FONT, WebkitTapHighlightColor: "transparent",
            }}>💡 Reveal this step (no points)</button>
          )}
        </>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   Spell Sprint — show a word for a moment, then hide it; player
   taps letters in the correct order under a per-word timer.
────────────────────────────────────────────────────────────── */
export function SpellSprintGame({ color, onClose, t, play }) {
  const TOTAL = 8;
  // Pick TOTAL distinct words; fall back to a clone if pool is small.
  const [pool] = useState(() => {
    const shuffled = [...SPELL_SPRINT_WORDS].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, TOTAL);
  });
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState("show"); // "show" | "type" | "result"
  const [typed, setTyped] = useState("");
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [showTime, setShowTime] = useState(2);
  const [letters, setLetters] = useState([]);
  const [shake, setShake] = useState(false);
  const target = pool[idx] || "";

  // Build a tray of letters: target letters + a couple of distractors.
  useEffect(() => {
    if (!target) return;
    const ALPH = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const extras = [];
    while (extras.length < Math.max(2, Math.floor(target.length / 3))) {
      const c = ALPH[Math.floor(Math.random() * ALPH.length)];
      if (!target.includes(c)) extras.push(c);
    }
    const tray = (target + extras.join("")).split("").sort(() => Math.random() - 0.5);
    setLetters(tray);
    setTyped("");
    setPhase("show");
    setShowTime(2);
  }, [target]);

  // Show countdown then switch to type mode.
  useEffect(() => {
    if (phase !== "show") return;
    if (showTime <= 0) {
      play?.("tap_firm");
      setPhase("type");
      return;
    }
    const t1 = setTimeout(() => setShowTime((s) => s - 1), 1000);
    return () => clearTimeout(t1);
  }, [phase, showTime, play]);

  const advance = (correct) => {
    setPhase("result");
    if (correct) { setScore((s) => s + 1); play?.("correct"); }
    else { setShake(true); play?.("wrong"); setTimeout(() => setShake(false), 350); }
    setTimeout(() => {
      if (idx + 1 >= pool.length) {
        setDone(true);
      } else {
        setIdx((i) => i + 1);
      }
    }, 900);
  };

  const tapLetter = (ch, i) => {
    if (phase !== "type") return;
    const next = typed + ch;
    play?.("tap_soft");
    if (target.startsWith(next)) {
      setTyped(next);
      // Remove this tile by index so duplicates don't auto-collapse.
      setLetters((arr) => arr.map((c, j) => (j === i ? "" : c)));
      if (next === target) advance(true);
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 320);
      play?.("wrong");
    }
  };

  const skip = () => advance(false);

  if (done) {
    recordBestScore("spell_sprint", score, pool.length);
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

  return (
    <div style={{ padding: "20px 20px 40px", fontFamily: FONT, position: "relative" }}>
      <Progress current={idx} total={pool.length} color={color} t={t} />
      <div
        key={`${idx}-${phase}`}
        style={{
          background: t?.light || "rgba(255,255,255,0.05)",
          borderRadius: 18,
          padding: "28px 18px",
          marginBottom: 22,
          border: `1px solid ${t?.border || "rgba(255,255,255,0.08)"}`,
          minHeight: 130,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          animation: shake
            ? "fillGapShake 0.32s ease"
            : "questionIn 0.3s cubic-bezier(0.34,1.56,0.64,1) both",
        }}
      >
        {phase === "show" && (
          <>
            <p style={{ fontSize: 11, fontWeight: 700, color, letterSpacing: "0.08em", textTransform: "uppercase", margin: 0 }}>
              Memorise — {showTime}s
            </p>
            <p style={{
              fontSize: 36, fontWeight: 800, color: t?.ink || "#ededed",
              letterSpacing: "0.18em", margin: "12px 0 0", fontFamily: FONT,
            }}>
              {target}
            </p>
          </>
        )}
        {phase !== "show" && (
          <>
            <p style={{ fontSize: 11, fontWeight: 700, color, letterSpacing: "0.08em", textTransform: "uppercase", margin: 0 }}>
              Spell it
            </p>
            <p style={{
              fontSize: 32, fontWeight: 800, color: t?.ink || "#ededed",
              letterSpacing: "0.22em", margin: "12px 0 0", fontFamily: FONT,
              minHeight: 44,
            }}>
              {typed.padEnd(target.length, "·").split("").map((c, i) => (
                <span
                  key={i}
                  style={{
                    color: i < typed.length ? color : "rgba(255,255,255,0.22)",
                    marginRight: 4,
                  }}
                >{c}</span>
              ))}
            </p>
          </>
        )}
      </div>
      {phase !== "show" && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8 }}>
            {letters.map((ch, i) => (
              <button
                key={i}
                type="button"
                onClick={() => tapLetter(ch, i)}
                disabled={!ch}
                style={{
                  padding: "12px 0",
                  borderRadius: 12,
                  border: `1.5px solid ${ch ? t?.border || "rgba(255,255,255,0.12)" : "transparent"}`,
                  background: ch ? t?.light || "rgba(255,255,255,0.05)" : "transparent",
                  color: ch ? t?.ink || "#ededed" : "transparent",
                  fontSize: 16,
                  fontWeight: 800,
                  cursor: ch ? "pointer" : "default",
                  fontFamily: FONT,
                  letterSpacing: "0.05em",
                  transition: "all 0.15s cubic-bezier(0.34,1.56,0.64,1)",
                  WebkitTapHighlightColor: "transparent",
                  visibility: ch ? "visible" : "hidden",
                }}
                onTouchStart={(e) => { if (ch) e.currentTarget.style.transform = "scale(0.94)"; }}
                onTouchEnd={(e) => { if (ch) e.currentTarget.style.transform = "scale(1)"; }}
              >{ch}</button>
            ))}
          </div>
          <button
            type="button"
            onClick={skip}
            style={{
              display: "block",
              margin: "16px auto 0",
              padding: "8px 18px",
              background: "rgba(255,255,255,0.06)",
              color: t?.muted || "#a1a1a1",
              border: `1px solid ${t?.border || "rgba(255,255,255,0.12)"}`,
              borderRadius: 999,
              fontSize: 12.5,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: FONT,
              WebkitTapHighlightColor: "transparent",
            }}
          >Skip word</button>
        </>
      )}
    </div>
  );
}

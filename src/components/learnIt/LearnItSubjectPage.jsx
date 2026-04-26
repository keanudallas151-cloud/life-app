import { useState } from "react";
import { FONT } from "./shared/constants.js";
import { FlipCard } from "./shared/FlipCard.jsx";
import { GameModal } from "./shared/GameModal.jsx";

// English games
import { FillGapGame, WordGuessGame, VocabMatchGame, SentenceBuilderGame, WordLadderGame } from "./games/EnglishGames.jsx";
// Finance games
import { FlashcardGame, BudgetGame, InvestSaveGame, MoneyMathGame, CompoundGrowthGame } from "./games/FinanceGames.jsx";
// Demeanor games
import { SpeakItGame, FillerCatcherGame, ConfidenceQuiz, DailyDemChallenge } from "./games/DemeanorGames.jsx";
// Shared game
import { MultiChoiceGame } from "./games/MultiChoiceGame.jsx";

// Data
import { FILL_GAP_QS, WORD_TRIVIA } from "./data/englishData.js";
import { FIN_TERMS, FIN_TRIVIA, INVEST_QS } from "./data/financeData.js";
import { SPEAK_QS, TONE_QS, BODY_QS } from "./data/demeanorData.js";

/* ──────────────────────────────────────────────────────────────
   SUBJECT CONFIG
────────────────────────────────────────────────────────────── */
const SUBJECT_META = {
  english:  { label: "English",  emoji: "📖", color: "#3B82F6", lightColor: "rgba(59,130,246,0.12)", borderColor: "rgba(59,130,246,0.25)" },
  finance:  { label: "Finance",  emoji: "💰", color: "#50c878", lightColor: "rgba(80,200,120,0.12)",  borderColor: "rgba(80,200,120,0.25)"  },
  demeanor: { label: "Demeanor", emoji: "🎯", color: "#A855F7", lightColor: "rgba(168,85,247,0.12)", borderColor: "rgba(168,85,247,0.25)" },
};

/* ──────────────────────────────────────────────────────────────
   GAME CATALOGUE
────────────────────────────────────────────────────────────── */
const GAMES = {
  english: [
    { id: "fill_gap",     icon: "✏️", title: "Fill the Gap",     desc: "Complete the sentence with the right word.",    type: "game" },
    { id: "word_guess",   icon: "🔤", title: "Word Guess",       desc: "Guess the hidden word one letter at a time.",   type: "game" },
    { id: "vocab_match",  icon: "🔗", title: "Vocab Match",      desc: "Match words to their definitions fast.",        type: "game" },
    { id: "sentence",     icon: "🔀", title: "Sentence Builder", desc: "Tap words in the correct order.",               type: "game" },
    { id: "word_trivia",  icon: "❓", title: "Word Trivia",      desc: "Test your knowledge of the English language.",  type: "game" },
    { id: "word_ladder",  icon: "🪜", title: "Word Ladder",      desc: "Change one letter at a time to reach the goal.",type: "game" },
  ],
  finance: [
    { id: "fin_terms",    icon: "📚", title: "Finance Terms",    desc: "Flip cards to learn key money vocabulary.",     type: "tool" },
    { id: "budget",       icon: "📊", title: "Budget Builder",   desc: "Allocate your monthly income wisely.",          type: "tool" },
    { id: "fin_trivia",   icon: "🧠", title: "Finance Trivia",   desc: "Quiz yourself on real money concepts.",         type: "game" },
    { id: "invest_save",  icon: "📈", title: "Invest or Save?",  desc: "Make smart decisions in live scenarios.",       type: "game" },
    { id: "money_math",   icon: "🔢", title: "Money Math",       desc: "Quick mental maths — beat the clock.",          type: "game" },
    { id: "compound",     icon: "📈", title: "Compound Growth",  desc: "Estimate compound interest — beat the clock.",   type: "game" },
  ],
  demeanor: [
    { id: "speak_it",     icon: "🗣️", title: "Speak It",        desc: "Pick the most confident response.",             type: "game" },
    { id: "filler_catch", icon: "🚫", title: "Filler Catcher",  desc: "Tap every filler word in the paragraph.",       type: "game" },
    { id: "tone_detect",  icon: "🎵", title: "Tone Detector",   desc: "Identify the tone of different messages.",      type: "game" },
    { id: "conf_quiz",    icon: "⭐", title: "Confidence Quiz", desc: "Find out where your confidence really stands.", type: "game" },
    { id: "daily_dem",    icon: "📅", title: "Daily Challenge", desc: "One challenge a day to sharpen your presence.", type: "tool" },
    { id: "body_lang",    icon: "🧍", title: "Body Language IQ",desc: "Read the room with body language mastery.",     type: "game" },
  ],
};

/* ──────────────────────────────────────────────────────────────
   DIFFICULTY SYSTEM
────────────────────────────────────────────────────────────── */
// Pre-mapped question arrays for games that transform before passing to MultiChoiceGame
const TONE_MAPPED = TONE_QS.map(q => ({ q: `Tone of: "${q.message}"`, opts: q.tones, ans: q.ans, tip: q.tip }));
const BODY_MAPPED = BODY_QS.map(q => ({ q: q.q, opts: q.opts, ans: q.ans, tip: q.tip }));

const DIFFICULTY_CONFIG = {
  fill_gap:    { qs: FILL_GAP_QS, easy: [0, 15], medium: [15, 30], hard: [30, 45] },
  word_trivia: { qs: WORD_TRIVIA,  easy: [0, 15], medium: [15, 30], hard: [30, 45] },
  fin_trivia:  { qs: FIN_TRIVIA,   easy: [0, 10], medium: [10, 20], hard: [20, 30] },
  invest_save: { qs: INVEST_QS,    easy: [0, 7],  medium: [7, 14],  hard: [14, 20] },
  speak_it:    { qs: SPEAK_QS,     easy: [0, 7],  medium: [7, 14],  hard: [14, 21] },
  tone_detect: { qs: TONE_MAPPED,  easy: [0, 7],  medium: [7, 14],  hard: [14, 21] },
  body_lang:   { qs: BODY_MAPPED,  easy: [0, 7],  medium: [7, 14],  hard: [14, 20] },
};

const DIFFICULTY_GAME_IDS = new Set(Object.keys(DIFFICULTY_CONFIG));

function getQuestionsForDifficulty(gameId, difficulty) {
  const cfg = DIFFICULTY_CONFIG[gameId];
  if (!cfg) return null;
  const [start, end] = cfg[difficulty];
  return cfg.qs.slice(start, end);
}

const DIFFICULTY_OPTIONS = [
  { key: "easy",   label: "🟢 Easy",   bg: "#50c878", textColor: "#000" },
  { key: "medium", label: "🟡 Medium", bg: "#f59e0b", textColor: "#000" },
  { key: "hard",   label: "🔴 Hard",   bg: "#e5484d", textColor: "#fff" },
];

/* ──────────────────────────────────────────────────────────────
   GAME ROUTER
────────────────────────────────────────────────────────────── */
function GameRouter({ gameId, questions, color, onClose, t, play }) {
  const games = {
    fill_gap:     () => <FillGapGame questions={questions} color={color} onClose={onClose} t={t} play={play} />,
    word_guess:   () => <WordGuessGame color={color} onClose={onClose} t={t} play={play} />,
    vocab_match:  () => <VocabMatchGame color={color} onClose={onClose} t={t} play={play} />,
    sentence:     () => <SentenceBuilderGame color={color} onClose={onClose} t={t} play={play} />,
    word_trivia:  () => <MultiChoiceGame questions={questions || WORD_TRIVIA} color={color} onClose={onClose} t={t} play={play} />,
    word_ladder:  () => <WordLadderGame color={color} onClose={onClose} t={t} play={play} />,
    fin_terms:    () => <FlashcardGame cards={FIN_TERMS} color={color} onClose={onClose} t={t} play={play} />,
    budget:       () => <BudgetGame color={color} onClose={onClose} t={t} play={play} />,
    fin_trivia:   () => <MultiChoiceGame questions={questions || FIN_TRIVIA} color={color} onClose={onClose} t={t} play={play} />,
    invest_save:  () => <InvestSaveGame questions={questions} color={color} onClose={onClose} t={t} play={play} />,
    money_math:   () => <MoneyMathGame color={color} onClose={onClose} t={t} play={play} />,
    compound:     () => <CompoundGrowthGame color={color} onClose={onClose} t={t} play={play} />,
    speak_it:     () => <SpeakItGame questions={questions} color={color} onClose={onClose} t={t} play={play} />,
    filler_catch: () => <FillerCatcherGame color={color} onClose={onClose} t={t} play={play} />,
    tone_detect:  () => <MultiChoiceGame questions={questions || TONE_MAPPED} color={color} onClose={onClose} t={t} play={play} />,
    conf_quiz:    () => <ConfidenceQuiz color={color} onClose={onClose} t={t} play={play} />,
    daily_dem:    () => <DailyDemChallenge color={color} onClose={onClose} t={t} play={play} />,
    body_lang:    () => <MultiChoiceGame questions={questions || BODY_MAPPED} color={color} onClose={onClose} t={t} play={play} />,
  };
  return games[gameId]?.() ?? <div style={{ padding: 24, color: t?.muted || "#a1a1a1", textAlign: "center", fontFamily: FONT }}>Coming soon…</div>;
}

/* ──────────────────────────────────────────────────────────────
   MAIN PAGE
────────────────────────────────────────────────────────────── */
export function LearnItSubjectPage({ t, play, subject, onBack }) {
  const [activeGame, setActiveGame] = useState(null);
  const [difficultyPending, setDifficultyPending] = useState(null);
  const [activeQuestions, setActiveQuestions] = useState(null);
  const meta = SUBJECT_META[subject] || SUBJECT_META.english;
  const games = GAMES[subject] || GAMES.english;
  const { color, lightColor, borderColor, label, emoji } = meta;

  const openGame = (id) => {
    play?.("tap");
    if (DIFFICULTY_GAME_IDS.has(id)) {
      setDifficultyPending(id);
    } else {
      setActiveQuestions(null);
      setActiveGame(id);
    }
  };

  const selectDifficulty = (difficulty) => {
    const qs = getQuestionsForDifficulty(difficultyPending, difficulty);
    setActiveQuestions(qs);
    setActiveGame(difficultyPending);
    setDifficultyPending(null);
    play?.("tap");
  };

  const closeGame = () => {
    play?.("back");
    setActiveGame(null);
    setActiveQuestions(null);
  };

  const activeGameMeta = games.find(g => g.id === activeGame);

  return (
    <div
      data-page-tag="#learn_it_subject"
      style={{
        padding: "0 0 96px",
        fontFamily: FONT,
        minHeight: "100%",
        position: "relative",
      }}
    >
      <style>{`
        @keyframes diffPickerIn {
          from { opacity: 0; transform: scale(0.82); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>

      {/* Header */}
      <div style={{
        padding: "28px 18px 22px",
        background: "rgba(255,255,255,0.02)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Glow bg */}
        <div aria-hidden style={{
          position: "absolute", top: -60, right: -60,
          width: 200, height: 200, borderRadius: "50%",
          background: `radial-gradient(circle, ${color}28 0%, transparent 70%)`,
          pointerEvents: "none",
        }} />

        {/* Back button */}
        <button
          type="button"
          onClick={() => { play?.("back"); onBack?.(); }}
          style={{
            display: "flex", alignItems: "center", gap: 5,
            background: "none", border: "none", cursor: "pointer",
            color, fontSize: 16, fontWeight: 400, fontFamily: FONT,
            padding: 0, marginBottom: 18, WebkitTapHighlightColor: "transparent",
          }}
        >
          <svg width="10" height="18" viewBox="0 0 10 18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 1 1 9 9 17" />
          </svg>
          Learn-It
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 14, position: "relative" }}>
          <div style={{
            width: 56, height: 56, borderRadius: 18,
            background: lightColor, border: `1.5px solid ${borderColor}`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28,
          }}>
            {emoji}
          </div>
          <div>
            <p style={{ margin: "0 0 2px", fontSize: 11, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color, fontFamily: FONT }}>Learn-It</p>
            <h2 style={{ margin: 0, fontSize: 30, fontWeight: 700, letterSpacing: "-0.04em", lineHeight: 1.05, color: (t && t.ink) || "#ededed", fontFamily: FONT }}>{label}</h2>
          </div>
        </div>

        <p style={{ margin: "14px 0 0", fontSize: 13.5, color: (t && t.muted) || "#a1a1a1", lineHeight: 1.55, fontFamily: FONT, position: "relative" }}>
          {games.length} interactive activities — tap a card to flip it, then press Play.
        </p>
      </div>

      {/* Card grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: 12,
        padding: "20px 16px",
      }}>
        {games.map((game, i) => (
          <FlipCard
            key={game.id}
            game={game}
            color={color}
            lightColor={lightColor}
            borderColor={borderColor}
            index={i}
            onPlay={openGame}
          />
        ))}
      </div>

      {/* Difficulty picker overlay */}
      {difficultyPending && (
        <div
          onClick={() => setDifficultyPending(null)}
          style={{
            position: "fixed", inset: 0, zIndex: 2000,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(0,0,0,0.65)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            flexDirection: "column",
            gap: 14,
            padding: "0 20px",
          }}
        >
          {/* Label */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: t?.muted || "#a1a1a1",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              fontFamily: FONT,
              animation: "diffPickerIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both",
              textShadow: "0 1px 8px rgba(0,0,0,0.6)",
            }}
          >
            Choose Difficulty
          </div>

          {/* Pill picker */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "rgba(18,18,18,0.97)",
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.14)",
              padding: 6,
              display: "flex",
              gap: 6,
              animation: "diffPickerIn 0.35s cubic-bezier(0.34,1.56,0.64,1) both",
              boxShadow: "0 12px 48px rgba(0,0,0,0.7)",
            }}
          >
            {DIFFICULTY_OPTIONS.map(({ key, label: dlabel, bg, textColor }) => (
              <button
                key={key}
                type="button"
                onClick={() => selectDifficulty(key)}
                onMouseDown={(e) => { e.currentTarget.style.transform = "scale(0.93)"; }}
                onMouseUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
                onTouchStart={(e) => { e.stopPropagation(); e.currentTarget.style.transform = "scale(0.93)"; }}
                onTouchEnd={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
                style={{
                  padding: "11px 22px",
                  borderRadius: 999,
                  background: bg,
                  color: textColor,
                  border: "none",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: FONT,
                  letterSpacing: "-0.01em",
                  WebkitTapHighlightColor: "transparent",
                  transition: "transform 0.15s cubic-bezier(0.34,1.56,0.64,1)",
                }}
              >
                {dlabel}
              </button>
            ))}
          </div>

          {/* Question count subtitle row — mirrors pill positions */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              display: "flex",
              gap: 6,
              padding: "0 6px",
              animation: "diffPickerIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both",
            }}
          >
            {DIFFICULTY_OPTIONS.map(({ key }) => {
              const slice = getQuestionsForDifficulty(difficultyPending, key);
              const count = slice ? slice.length : 0;
              return (
                <div
                  key={key}
                  style={{
                    flex: 1,
                    textAlign: "center",
                    fontSize: 11,
                    fontWeight: 500,
                    color: t?.muted || "rgba(255,255,255,0.55)",
                    fontFamily: FONT,
                    minWidth: 90,
                  }}
                >
                  {count} questions
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Game modal */}
      {activeGame && (
        <GameModal onClose={closeGame} color={color} title={activeGameMeta?.title || "Game"} t={t} play={play}>
          <GameRouter gameId={activeGame} questions={activeQuestions} color={color} onClose={closeGame} t={t} play={play} />
        </GameModal>
      )}
    </div>
  );
}

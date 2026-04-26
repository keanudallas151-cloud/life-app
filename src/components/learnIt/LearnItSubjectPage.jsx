import { useState, useEffect, useRef } from "react";
import { FONT } from "./shared/constants.js";
import { FlipCard } from "./shared/FlipCard.jsx";
import { GameModal } from "./shared/GameModal.jsx";
import { LearnItGameIdContext } from "./shared/ScoreScreen.jsx";
import "./learnit-ios.css";

// English games
import { FillGapGame, WordGuessGame, VocabMatchGame, SentenceBuilderGame, WordLadderGame, SpellSprintGame } from "./games/EnglishGames.jsx";
// Finance games
import { FlashcardGame, BudgetGame, InvestSaveGame, MoneyMathGame, CompoundGrowthGame, NeedsWantsGame } from "./games/FinanceGames.jsx";
// Demeanor games
import { SpeakItGame, FillerCatcherGame, ConfidenceQuiz, DailyDemChallenge, EyeContactTrainer } from "./games/DemeanorGames.jsx";
// Shared game
import { MultiChoiceGame } from "./games/MultiChoiceGame.jsx";

// Data
import { FILL_GAP_QS, WORD_TRIVIA, IDIOM_QS } from "./data/englishData.js";
import { FIN_TERMS, FIN_TRIVIA, INVEST_QS, APR_QS } from "./data/financeData.js";
import { SPEAK_QS, TONE_QS, BODY_QS, LISTEN_QS } from "./data/demeanorData.js";

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
    {
      id: "fill_gap", icon: "✏️", title: "Fill the Gap", type: "game",
      desc: "Complete the sentence with the right word.",
      longDesc: "Read each sentence with a missing word, then tap the choice that fits best. Builds vocabulary, grammar instincts, and reading fluency across three difficulty tiers.",
      howTo: "Read sentence → tap missing word → use a hint if stuck",
      learn: ["Vocabulary", "Grammar", "Fluency"],
    },
    {
      id: "word_guess", icon: "🔤", title: "Word Guess", type: "game",
      desc: "Guess the hidden word one letter at a time.",
      longDesc: "A clean Hangman-style round: pick letters to reveal a hidden word before your guesses run out. Sharpens spelling, pattern recognition, and vocabulary recall.",
      howTo: "Tap letters → narrow it down → don't miss six",
      learn: ["Spelling", "Vocabulary"],
    },
    {
      id: "vocab_match", icon: "🔗", title: "Vocab Match", type: "game",
      desc: "Match words to their definitions fast.",
      longDesc: "Pair each word with its correct meaning before the timer runs out. A fast-paced way to lock in new vocabulary and strengthen reading comprehension.",
      howTo: "Read word → pick its meaning → beat the clock",
      learn: ["Vocabulary", "Comprehension"],
    },
    {
      id: "sentence", icon: "🔀", title: "Sentence Builder", type: "game",
      desc: "Tap words in the correct order.",
      longDesc: "Words appear scrambled — tap them in the right order to rebuild the sentence. Trains grammar, sentence structure, and the rhythm of natural English.",
      howTo: "Tap words in order → rebuild → finish before time",
      learn: ["Grammar", "Structure"],
    },
    {
      id: "word_trivia", icon: "❓", title: "Word Trivia", type: "game",
      desc: "Test your knowledge of the English language.",
      longDesc: "Multiple-choice trivia covering meanings, synonyms, idioms, and quirks of English. Choose Easy, Medium, or Hard to match your level.",
      howTo: "Pick a difficulty → answer → read the explanation",
      learn: ["Vocabulary", "Knowledge"],
    },
    {
      id: "word_ladder", icon: "🪜", title: "Word Ladder", type: "game",
      desc: "Change one letter at a time to reach the goal.",
      longDesc: "Climb from a start word to a target word by changing exactly one letter per step, keeping every rung a real word. A classic puzzle for vocabulary and lateral thinking.",
      howTo: "Change one letter → keep it a real word → reach the target",
      learn: ["Vocabulary", "Logic"],
    },
    {
      id: "spell_sprint", icon: "⚡", title: "Spell Sprint", type: "game", tag: "new",
      desc: "A word flashes — spell it back from memory.",
      longDesc: "A word appears on screen for two seconds then vanishes. Tap the letters in order to reproduce it before time runs out. Builds spelling under pressure and visual word memory.",
      howTo: "Memorise the word → tap letters in order → resist the timer",
      learn: ["Spelling", "Memory", "Focus"],
    },
    {
      id: "idiom_decoder", icon: "🗝️", title: "Idiom Decoder", type: "game", tag: "new",
      desc: "Decode the meaning behind common idioms.",
      longDesc: "Each round shows an English idiom — pick the option that captures what it actually means, not what it literally says. Builds fluency and the kind of cultural ear that makes English feel native.",
      howTo: "Read the idiom → pick the meaning → check the tip",
      learn: ["Idioms", "Fluency", "Culture"],
    },
  ],
  finance: [
    {
      id: "fin_terms", icon: "📚", title: "Finance Terms", type: "tool",
      desc: "Flip cards to learn key money vocabulary.",
      longDesc: "A flashcard deck of essential money terms — assets, liabilities, APR, compound interest and more. Tap to flip; learn at your own pace, no timer.",
      howTo: "Tap card → flip → next term → no time pressure",
      learn: ["Vocabulary", "Foundations"],
    },
    {
      id: "budget", icon: "📊", title: "Budget Builder", type: "tool",
      desc: "Allocate your monthly income wisely.",
      longDesc: "Split a sample paycheck across needs, wants, and savings to see how a healthy budget feels. A hands-on tool for understanding the 50/30/20 rule and trade-offs.",
      howTo: "Slide allocations → see balance → match the target",
      learn: ["Budgeting", "Trade-offs"],
    },
    {
      id: "fin_trivia", icon: "🧠", title: "Finance Trivia", type: "game",
      desc: "Quiz yourself on real money concepts.",
      longDesc: "Multiple-choice questions on saving, investing, debt, and everyday money decisions. Three difficulties with explanations after each answer.",
      howTo: "Pick difficulty → answer → read the why",
      learn: ["Knowledge", "Saving", "Investing"],
    },
    {
      id: "invest_save", icon: "📈", title: "Invest or Save?", type: "game",
      desc: "Make smart decisions in live scenarios.",
      longDesc: "Real-life money scenarios: pick whether to invest, save, or spend, and see the long-term impact. Trains judgment for the choices that actually move the needle.",
      howTo: "Read scenario → pick action → review outcome",
      learn: ["Decisions", "Judgment"],
    },
    {
      id: "money_math", icon: "🔢", title: "Money Math", type: "game",
      desc: "Quick mental maths — beat the clock.",
      longDesc: "Tip splits, percentage discounts, simple interest — fast questions, short timer. Builds the mental math you actually use at the counter and in your bank app.",
      howTo: "Quick maths → tap answer → keep the streak alive",
      learn: ["Mental math", "Percentages"],
    },
    {
      id: "compound", icon: "📈", title: "Compound Growth", type: "game",
      desc: "Estimate compound interest — beat the clock.",
      longDesc: "Estimate what a balance grows to with compounding over time. Quick rounds that build intuition for why time-in-the-market beats timing the market.",
      howTo: "Estimate the future value → pick the closest → learn",
      learn: ["Compounding", "Investing"],
    },
    {
      id: "apr_apy", icon: "🏦", title: "APR vs APY", type: "game", tag: "new",
      desc: "Spot the better rate when compounding kicks in.",
      longDesc: "Two scenarios per round — pick the one that actually leaves you better off once compounding is factored in. Builds intuition for what the small print really means.",
      howTo: "Compare scenarios → pick the better one → see the maths",
      learn: ["Rates", "Compounding", "Fluency"],
    },
    {
      id: "needs_wants", icon: "🛒", title: "Needs vs Wants", type: "tool", tag: "new",
      desc: "Swipe to classify spending — fast.",
      longDesc: "An item appears — swipe right if it's a need, left if it's a want. Tunes the gut-check that keeps a budget honest, with a quick tip after every card.",
      howTo: "Swipe right → Need · Swipe left → Want · Read the tip",
      learn: ["Budgeting", "Self-awareness"],
    },
  ],
  demeanor: [
    {
      id: "speak_it", icon: "🗣️", title: "Speak It", type: "game",
      desc: "Pick the most confident response.",
      longDesc: "You're handed a tricky social moment — pick the reply that lands with confidence and respect. Trains tone, assertiveness, and the words that actually work in real conversations.",
      howTo: "Read the moment → pick the best reply → see why",
      learn: ["Confidence", "Assertiveness"],
    },
    {
      id: "filler_catch", icon: "🚫", title: "Filler Catcher", type: "game",
      desc: "Tap every filler word in the paragraph.",
      longDesc: "A short paragraph appears — tap every \"um,\" \"like,\" \"basically\" you can spot. Builds the ear for filler words so you can cut them from your own speech.",
      howTo: "Read carefully → tap every filler → don't miss any",
      learn: ["Speech", "Awareness"],
    },
    {
      id: "tone_detect", icon: "🎵", title: "Tone Detector", type: "game",
      desc: "Identify the tone of different messages.",
      longDesc: "Read short messages and classify the tone — passive, assertive, sarcastic, warm. Sharpens emotional intelligence and helps you read the room before you reply.",
      howTo: "Read the message → pick the tone → check the tip",
      learn: ["Tone", "EQ"],
    },
    {
      id: "conf_quiz", icon: "⭐", title: "Confidence Quiz", type: "game",
      desc: "Find out where your confidence really stands.",
      longDesc: "Honest self-assessment across body language, voice, and decision-making. Get a confidence score plus the specific habit to work on next.",
      howTo: "Answer honestly → get your score → see what to work on",
      learn: ["Self-awareness", "Habits"],
    },
    {
      id: "daily_dem", icon: "📅", title: "Daily Challenge", type: "tool",
      desc: "One challenge a day to sharpen your presence.",
      longDesc: "A new micro-challenge every day — make eye contact for a full sentence, slow your speech, hold a pause. Small reps that compound into real presence.",
      howTo: "Read today's challenge → accept → do it in the wild",
      learn: ["Presence", "Habits"],
    },
    {
      id: "body_lang", icon: "🧍", title: "Body Language IQ", type: "game",
      desc: "Read the room with body language mastery.",
      longDesc: "Identify what posture, gesture, and expression are really saying. Builds the silent half of communication — what you read off others and signal back.",
      howTo: "Read the cue → pick the meaning → review the tip",
      learn: ["Body language", "EQ"],
    },
    {
      id: "active_listen", icon: "👂", title: "Active Listening", type: "game", tag: "new",
      desc: "Pick the most empathetic acknowledgement.",
      longDesc: "A friend, partner, or colleague has just said something real. Pick the reply that proves you actually heard them — not the one that fixes, deflects, or compares. Trains the listening half of presence.",
      howTo: "Read what was said → pick the acknowledgement → see why",
      learn: ["Listening", "Empathy", "EQ"],
    },
    {
      id: "eye_contact", icon: "👁️", title: "Eye Contact Trainer", type: "tool", tag: "new",
      desc: "Hold gentle eye contact through the round.",
      longDesc: "A friendly face appears for a randomised 2 to 6 second window — keep gentle eye contact until the ring fills. Builds the comfort of holding contact a little longer than feels natural.",
      howTo: "Start round → hold contact → break = streak resets",
      learn: ["Presence", "Confidence"],
    },
  ],
};

/* ──────────────────────────────────────────────────────────────
   DIFFICULTY SYSTEM
────────────────────────────────────────────────────────────── */
// Pre-mapped question arrays for games that transform before passing to MultiChoiceGame
const TONE_MAPPED = TONE_QS.map(q => ({ q: `Tone of: "${q.message}"`, opts: q.tones, ans: q.ans, tip: q.tip }));
const BODY_MAPPED = BODY_QS.map(q => ({ q: q.q, opts: q.opts, ans: q.ans, tip: q.tip }));

const DIFFICULTY_CONFIG = {
  fill_gap:      { qs: FILL_GAP_QS, easy: [0, 15], medium: [15, 30], hard: [30, 45] },
  word_trivia:   { qs: WORD_TRIVIA,  easy: [0, 15], medium: [15, 30], hard: [30, 45] },
  fin_trivia:    { qs: FIN_TRIVIA,   easy: [0, 10], medium: [10, 20], hard: [20, 30] },
  invest_save:   { qs: INVEST_QS,    easy: [0, 7],  medium: [7, 14],  hard: [14, 20] },
  speak_it:      { qs: SPEAK_QS,     easy: [0, 7],  medium: [7, 14],  hard: [14, 21] },
  tone_detect:   { qs: TONE_MAPPED,  easy: [0, 7],  medium: [7, 14],  hard: [14, 21] },
  body_lang:     { qs: BODY_MAPPED,  easy: [0, 7],  medium: [7, 14],  hard: [14, 20] },
  idiom_decoder: { qs: IDIOM_QS,     easy: [0, 15], medium: [15, 30], hard: [30, 45] },
  apr_apy:       { qs: APR_QS,       easy: [0, 9],  medium: [9, 15],  hard: [15, 20] },
  active_listen: { qs: LISTEN_QS,    easy: [0, 7],  medium: [7, 12],  hard: [12, 16] },
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
    // Phase 2 — new games
    spell_sprint:  () => <SpellSprintGame color={color} onClose={onClose} t={t} play={play} />,
    idiom_decoder: () => <MultiChoiceGame questions={questions || IDIOM_QS} color={color} onClose={onClose} t={t} play={play} />,
    apr_apy:       () => <MultiChoiceGame questions={questions || APR_QS} color={color} onClose={onClose} t={t} play={play} />,
    needs_wants:   () => <NeedsWantsGame color={color} onClose={onClose} t={t} play={play} />,
    active_listen: () => <SpeakItGame questions={questions || LISTEN_QS} color={color} onClose={onClose} t={t} play={play} />,
    eye_contact:   () => <EyeContactTrainer color={color} onClose={onClose} t={t} play={play} />,
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

  // Reduced-motion preference
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  // One-time FLIP hint per subject, persisted in sessionStorage so the dot
  // stops pulsing once the user has flipped any card.
  const hintKey = `life-learnit-flipped-${subject}`;
  const [hasFlipped, setHasFlipped] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (window.sessionStorage?.getItem(hintKey) === "1") {
        setHasFlipped(true);
      } else {
        setHasFlipped(false);
      }
    } catch {
      // sessionStorage may be unavailable (private mode) — ignore
    }
  }, [hintKey]);

  const markFlipped = () => {
    if (hasFlipped) return;
    setHasFlipped(true);
    try {
      window.sessionStorage?.setItem(hintKey, "1");
    } catch {
      // ignore
    }
  };

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

  // ── Phase 2 — collapsing title (large-title → compact header)
  const titleSentinelRef = useRef(null);
  const [titleCollapsed, setTitleCollapsed] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const el = titleSentinelRef.current;
    if (!el || typeof window.IntersectionObserver === "undefined") return;
    const obs = new window.IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        setTitleCollapsed(!entry.isIntersecting);
      },
      { threshold: 0, rootMargin: "-1px 0px 0px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [subject]);

  const gridScrollRef = useRef(null);

  return (
    <div
      data-page-tag="#learn_it_subject"
      style={{
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
        @keyframes life-learnit-hero-sweep-anim {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.001ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.001ms !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>

      {/* Header */}
      <div
        className="life-learnit-header"
        style={{
          padding: "28px 18px 22px",
          background: "rgba(255,255,255,0.02)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Soft hero gradient — slow ambient sweep */}
        <div aria-hidden style={{
          position: "absolute", inset: 0,
          background: `radial-gradient(ellipse at 30% 20%, ${color}10 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, ${color}0c 0%, transparent 70%)`,
          backgroundSize: "200% 200%",
          animation: reducedMotion ? "none" : "life-learnit-hero-sweep-anim 60s ease-in-out infinite",
          pointerEvents: "none",
        }} />
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
            padding: 0, marginBottom: 18, minHeight: 44,
            WebkitTapHighlightColor: "transparent", position: "relative",
          }}
        >
          <svg width="10" height="18" viewBox="0 0 10 18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 1 1 9 9 17" />
          </svg>
          Learn-It
        </button>

        {/* Compact header bar — appears as the large title scrolls away */}
        <div
          aria-hidden={!titleCollapsed}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "calc(var(--safe-top, 0px) + 10px) 18px 10px",
            background: "rgba(10,10,10,0.78)",
            backdropFilter: "blur(18px) saturate(160%)",
            WebkitBackdropFilter: "blur(18px) saturate(160%)",
            borderBottom: `2px solid ${color}`,
            opacity: titleCollapsed ? 1 : 0,
            transform: titleCollapsed ? "translateY(0)" : "translateY(-100%)",
            transition: "opacity 0.25s ease, transform 0.25s cubic-bezier(0.34,1.56,0.64,1)",
            pointerEvents: titleCollapsed ? "auto" : "none",
            zIndex: 4,
          }}
        >
          <span style={{ fontSize: 16 }}>{emoji}</span>
          <span style={{ fontSize: 17, fontWeight: 700, color: t?.ink || "#ededed", letterSpacing: "-0.01em" }}>{label}</span>
        </div>

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
            <h2 className="life-learnit-title" style={{ margin: 0, fontWeight: 700, letterSpacing: "-0.04em", lineHeight: 1.05, color: (t && t.ink) || "#ededed", fontFamily: FONT }}>{label}</h2>
          </div>
        </div>
      </div>

      {/* Card grid */}
      <div
        ref={gridScrollRef}
        className="life-learnit-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
        }}
      >
        {games.map((game, i) => (
          <FlipCard
            key={game.id}
            game={game}
            color={color}
            lightColor={lightColor}
            borderColor={borderColor}
            index={i}
            onPlay={openGame}
            showHint={!hasFlipped}
            onFlip={markFlipped}
            reducedMotion={reducedMotion}
            play={play}
          />
        ))}
        {games.length === 0 && (
          <div style={{
            gridColumn: "1 / -1",
            padding: "24px 16px",
            textAlign: "center",
            color: t?.muted || "#a1a1a1",
            fontSize: 13.5,
          }}>
            No activities in this filter yet.
          </div>
        )}
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
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 6,
              width: "min(100%, 360px)",
              boxSizing: "border-box",
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

          {/* Question count subtitle row — mirrors pill positions via matching 3-col grid */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 6,
              padding: "0 6px",
              width: "min(100%, 360px)",
              boxSizing: "border-box",
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
                    textAlign: "center",
                    fontSize: 11,
                    fontWeight: 500,
                    color: t?.muted || "rgba(255,255,255,0.55)",
                    fontFamily: FONT,
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
          <LearnItGameIdContext.Provider value={activeGame}>
            <GameRouter gameId={activeGame} questions={activeQuestions} color={color} onClose={closeGame} t={t} play={play} />
          </LearnItGameIdContext.Provider>
        </GameModal>
      )}
    </div>
  );
}

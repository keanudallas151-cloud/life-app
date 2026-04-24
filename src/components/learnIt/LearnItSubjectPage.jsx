import { useState, useEffect, useRef } from "react";

const FONT = "-apple-system, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif";

/* ──────────────────────────────────────────────────────────────
   SUBJECT CONFIG
────────────────────────────────────────────────────────────── */
const SUBJECT_META = {
  english:  { label: "English",  emoji: "📖", color: "#3B82F6", lightColor: "rgba(59,130,246,0.12)", borderColor: "rgba(59,130,246,0.25)" },
  finance:  { label: "Finance",  emoji: "💰", color: "#50c878", lightColor: "rgba(80,200,120,0.12)",  borderColor: "rgba(80,200,120,0.25)"  },
  demeanor: { label: "Demeanor", emoji: "🎯", color: "#A855F7", lightColor: "rgba(168,85,247,0.12)", borderColor: "rgba(168,85,247,0.25)" },
};

/* ──────────────────────────────────────────────────────────────
   GAME DATA
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
   GAME CONTENT
────────────────────────────────────────────────────────────── */

// ── English: Fill the Gap ──────────────────────────────────────
const FILL_GAP_QS = [
  { sentence: "She spoke with great ___ during the presentation.", options: ["confidence","confusion","sadness","anger"], answer: "confidence" },
  { sentence: "The ___ of the river was crystal clear.", options: ["water","colour","surface","texture"], answer: "surface" },
  { sentence: "He ___ the book in just two days.", options: ["finished","broken","slept","drove"], answer: "finished" },
  { sentence: "The team worked hard to ___ their goal.", options: ["achieve","avoid","ignore","destroy"], answer: "achieve" },
  { sentence: "She had a ___ smile that lit up the room.", options: ["radiant","dull","tiny","cold"], answer: "radiant" },
  { sentence: "Reading daily helps ___ your vocabulary.", options: ["expand","shrink","break","limit"], answer: "expand" },
  { sentence: "The ___ athlete trained for years to reach the Olympics.", options: ["dedicated","lazy","average","tired"], answer: "dedicated" },
  { sentence: "He always arrives ___ to every meeting.", options: ["punctually","late","barely","randomly"], answer: "punctually" },
];

// ── English: Word Guess (Wordle-style) ─────────────────────────
const WORD_LIST = ["SPEAK","TRADE","MONEY","LEARN","SMART","BRAVE","FOCUS","THINK","SKILL","WORTH"];

// ── English: Vocab Match ───────────────────────────────────────
const VOCAB_PAIRS = [
  { word: "Eloquent",   def: "Well-spoken & expressive" },
  { word: "Diligent",   def: "Hardworking & careful" },
  { word: "Resilient",  def: "Bounces back from difficulty" },
  { word: "Concise",    def: "Clear and brief" },
  { word: "Ambiguous",  def: "Open to more than one meaning" },
  { word: "Verbose",    def: "Using more words than needed" },
];

// ── English: Sentence Builder ──────────────────────────────────
const SENTENCE_QS = [
  { words: ["always", "hard", "You", "should", "work"], answer: ["You", "should", "always", "work", "hard"] },
  { words: ["the", "Knowledge", "key", "is", "to", "success"], answer: ["Knowledge", "is", "the", "key", "to", "success"] },
  { words: ["your", "Build", "every", "skills", "day"], answer: ["Build", "your", "skills", "every", "day"] },
  { words: ["reading", "daily", "Start", "books"], answer: ["Start", "reading", "books", "daily"] },
];

// ── English: Word Trivia ───────────────────────────────────────
const WORD_TRIVIA = [
  { q: "How many letters are in the English alphabet?", opts: ["24","25","26","27"], ans: "26" },
  { q: "What is the most commonly used letter in English?", opts: ["A","T","E","S"], ans: "E" },
  { q: "What is a word that reads the same backwards?", opts: ["Homonym","Palindrome","Synonym","Acronym"], ans: "Palindrome" },
  { q: "Which is a noun?", opts: ["Run","Quickly","Beautiful","Success"], ans: "Success" },
  { q: "What does 'verbose' mean?", opts: ["Brief","Wordy","Clear","Silent"], ans: "Wordy" },
  { q: "How many vowels are in the English language?", opts: ["4","5","6","7"], ans: "5" },
];

// ── Finance: Flashcard Terms ───────────────────────────────────
const FIN_TERMS = [
  { term: "Compound Interest", def: "Earning interest on your interest — the most powerful force in investing." },
  { term: "Net Worth", def: "What you own (assets) minus what you owe (liabilities)." },
  { term: "ROI", def: "Return On Investment — how much profit you make relative to cost." },
  { term: "Dividend", def: "A portion of a company's profit paid to shareholders." },
  { term: "Inflation", def: "The rate at which prices rise, reducing purchasing power over time." },
  { term: "Equity", def: "Your ownership stake in an asset or company." },
  { term: "Liquidity", def: "How easily an asset can be converted to cash without losing value." },
  { term: "Portfolio", def: "A collection of investments held by an individual or organisation." },
];

// ── Finance: Trivia ────────────────────────────────────────────
const FIN_TRIVIA = [
  { q: "What does 'APR' stand for?", opts: ["Annual Payment Rate","Annual Percentage Rate","Asset Purchase Rate","Average Profit Return"], ans: "Annual Percentage Rate" },
  { q: "What is the stock market index that tracks the 500 largest US companies?", opts: ["NASDAQ","Dow Jones","S&P 500","Russell 2000"], ans: "S&P 500" },
  { q: "What is a 'bull market'?", opts: ["A falling market","A rising market","A stable market","A crash"], ans: "A rising market" },
  { q: "What percentage should you ideally save of your income?", opts: ["5%","10%","20%","50%"], ans: "20%" },
  { q: "What is 'diversification' in investing?", opts: ["All in one stock","Spreading investments","Avoiding risk","Only buying bonds"], ans: "Spreading investments" },
  { q: "What is the '50/30/20' rule?", opts: ["Debt/savings/spending","Needs/wants/savings","Income/tax/expenses","Investment/risk/reward"], ans: "Needs/wants/savings" },
];

// ── Finance: Invest or Save ────────────────────────────────────
const INVEST_QS = [
  { scenario: "You have $500 in an emergency fund and $200 spare. What do you do?", opts: ["Invest the $200","Save the $200","Spend the $200","Ignore it"], best: 1, reason: "Build your emergency fund to 3-6 months expenses before investing." },
  { scenario: "You have no debt, 6 months emergency fund, and $1000 spare.", opts: ["Put in savings","Invest long-term","Buy something nice","Lend it out"], best: 1, reason: "With a solid foundation, investing long-term is the smart move." },
  { scenario: "You have a credit card at 20% interest. You have $500 spare.", opts: ["Invest it","Pay off the card","Save it","Donate it"], best: 1, reason: "20% interest is higher than most investment returns — pay it off first." },
  { scenario: "You're 20 years old with $100 spare per month.", opts: ["Spend it","Save it in cash","Invest in index funds","Keep under mattress"], best: 2, reason: "Starting early with index funds gives compound interest decades to work." },
];

// ── Finance: Money Math ────────────────────────────────────────
const MONEY_QS = [
  { q: "You earn $3,200/month. 20% goes to savings. How much is saved?", ans: "640", display: "$640" },
  { q: "An item costs $80, on 25% off. What's the price?", ans: "60", display: "$60" },
  { q: "$1,000 invested at 10% annually. After 2 years (compound)?", ans: "1210", display: "$1,210" },
  { q: "You spend $45/week on coffee. Cost per year?", ans: "2340", display: "$2,340" },
  { q: "Salary is $60,000. Tax rate 30%. Take-home per month?", ans: "3500", display: "$3,500" },
];

// ── Demeanor: Speak It ─────────────────────────────────────────
const SPEAK_QS = [
  { scenario: "Your boss asks for your opinion in a meeting.", opts: ["'I'm not sure...'","'Well, maybe if...'","'My view is clear: here's what I recommend.'","'Others probably know better.'"], best: 2, why: "Confident, direct, and solution-focused." },
  { scenario: "Someone challenges your idea publicly.", opts: ["Go silent","Apologise immediately","'That's a fair point. Here's why I still believe...'","Agree with everything they say"], best: 2, why: "Acknowledging but holding your ground shows emotional intelligence." },
  { scenario: "You need to ask for a pay rise.", opts: ["Wait for them to offer","Drop hints","'Based on my contributions, I'd like to discuss my salary.'","Ask a colleague to ask for you"], best: 2, why: "Direct, evidence-based requests are respected." },
  { scenario: "You're introducing yourself to a new group.", opts: ["Say as little as possible","Ramble nervously","State your name, role, and one interesting fact clearly","Wait for someone to ask"], best: 2, why: "Clarity and confidence in introductions sets the tone immediately." },
];

// ── Demeanor: Filler Catcher ───────────────────────────────────
const FILLER_TEXTS = [
  {
    text: "So, basically, I was like going to the meeting and um, I kind of presented the, you know, report and it was like really good actually.",
    fillers: ["So", "basically", "like", "um", "kind of", "you know", "like", "actually"],
  },
  {
    text: "I think, sort of, the project is literally going well and we're basically, um, hitting our targets so yeah.",
    fillers: ["sort of", "literally", "basically", "um", "yeah"],
  },
  {
    text: "Right, so, I'm going to just explain how this works. It's like, very, um, straightforward, right.",
    fillers: ["Right", "so", "just", "like", "very", "um", "right"],
  },
];

// ── Demeanor: Tone Detector ────────────────────────────────────
const TONE_QS = [
  { message: "I need this done NOW. No excuses.", tones: ["Professional","Aggressive","Enthusiastic","Polite"], ans: "Aggressive", tip: "Caps and ultimatums signal aggression, not urgency." },
  { message: "Hey! Just wanted to check in and see how things are going 😊", tones: ["Aggressive","Formal","Friendly","Sarcastic"], ans: "Friendly", tip: "Warm, casual language with an emoji signals friendly intent." },
  { message: "Per my last email, I clearly outlined the requirements.", tones: ["Passive-aggressive","Enthusiastic","Empathetic","Direct"], ans: "Passive-aggressive", tip: "'Per my last email' is a classic passive-aggressive phrase." },
  { message: "Thank you for bringing this to my attention. I'll look into it promptly.", tones: ["Dismissive","Professional","Sarcastic","Casual"], ans: "Professional", tip: "Acknowledges, commits, and stays formal — textbook professional." },
  { message: "Oh great, another meeting that could've been an email.", tones: ["Sarcastic","Enthusiastic","Empathetic","Neutral"], ans: "Sarcastic", tip: "The 'oh great' and contrast signals obvious sarcasm." },
];

// ── Demeanor: Confidence Quiz ──────────────────────────────────
const CONF_QUIZ = [
  { q: "When someone disagrees with you publicly, you...", opts: ["Immediately back down","Get defensive","Listen, then calmly explain your view","Stay silent and stew"], scores: [0,1,3,1] },
  { q: "When you walk into a room of strangers, you...", opts: ["Hug the walls","Wait to be approached","Introduce yourself to someone","Check your phone"], scores: [0,1,3,1] },
  { q: "When you make a mistake, you...", opts: ["Catastrophise","Blame others","Acknowledge, learn, move on","Avoid the topic forever"], scores: [0,0,3,0] },
  { q: "When asked to speak impromptu, you...", opts: ["Panic","Deflect to someone else","Take a breath and speak clearly","Speak fast and nervous"], scores: [0,0,3,1] },
  { q: "Your posture right now is...", opts: ["Slumped","Closed/crossed arms","Open and upright","Neck craned down"], scores: [0,1,3,0] },
];

// ── Demeanor: Body Language IQ ─────────────────────────────────
const BODY_QS = [
  { q: "Crossed arms typically signal...", opts: ["Confidence","Openness","Defensiveness or discomfort","Excitement"], ans: "Defensiveness or discomfort", tip: "Crossed arms create a physical barrier between you and others." },
  { q: "Sustained eye contact (not staring) communicates...", opts: ["Aggression","Confidence and trustworthiness","Dishonesty","Boredom"], ans: "Confidence and trustworthiness", tip: "Eye contact shows you're engaged and have nothing to hide." },
  { q: "Mirroring someone's body language usually...", opts: ["Annoys them","Builds rapport unconsciously","Shows dominance","Signals boredom"], ans: "Builds rapport unconsciously", tip: "Mirroring is a natural signal of alignment and empathy." },
  { q: "A slow, steady nod while listening suggests...", opts: ["You're bored","Disagreement","Active listening and comprehension","Impatience"], ans: "Active listening and comprehension", tip: "Slow nods signal you're processing and engaged, not just waiting to talk." },
  { q: "Touching your face frequently during a conversation often signals...", opts: ["Confidence","Engagement","Anxiety or uncertainty","Happiness"], ans: "Anxiety or uncertainty", tip: "Self-touching is a self-soothing behaviour — notice it and reduce it." },
];

// ── English: Word Ladder Puzzles ──────────────────────────────
const WORD_LADDER_PUZZLES = [
  { start: "CAT", end: "DOG", steps: ["CAT","COT","COG","DOG"] },
  { start: "HOT", end: "COD", steps: ["HOT","HOG","COG","COD"] },
  { start: "MIND", end: "GROW", steps: ["MIND","BIND","BIRD","GIRD","GRID","GRAD","GRAB","CRAB","CROW","GROW"] },
  { start: "COLD", end: "WARM", steps: ["COLD", "CORD", "WORD", "WARD", "WARM"] },
  { start: "BAKE", end: "BITE", steps: ["BIKE", "BITE"] },
  { start: "BOOK", end: "COOL", steps: ["COOK", "COOL"] },
  { start: "FARM", end: "FIRM", steps: ["FORM", "FIRM"] },
  { start: "FIND", end: "BIND", steps: ["BIND"] },
  { start: "MINE", end: "WINE", steps: ["WINE"] },
  { start: "SALE", end: "MALE", steps: ["MALE"] },
];

/* ──────────────────────────────────────────────────────────────
   FLIP CARD COMPONENT
────────────────────────────────────────────────────────────── */
function FlipCard({ game, color, lightColor, borderColor, index, onPlay }) {
  const [flipped, setFlipped] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), index * 65);
    return () => clearTimeout(t);
  }, [index]);

  return (
    <div
      style={{
        perspective: "1000px",
        opacity: mounted ? 1 : 0,
        transform: mounted ? "translateY(0) scale(1)" : "translateY(16px) scale(0.94)",
        transition: `opacity 0.35s ease ${index * 65}ms, transform 0.4s cubic-bezier(0.34,1.56,0.64,1) ${index * 65}ms`,
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "1 / 1.05",
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          transition: "transform 0.5s cubic-bezier(0.34,1.56,0.64,1)",
          cursor: "pointer",
        }}
        onClick={() => setFlipped(!flipped)}
      >
        {/* FRONT */}
        <div style={{
          position: "absolute",
          inset: 0,
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
          background: "rgba(255,255,255,0.045)",
          border: `1px solid ${borderColor}`,
          borderRadius: 22,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "18px 14px",
          gap: 10,
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          boxShadow: `0 4px 20px rgba(0,0,0,0.15)`,
        }}>
          {/* Type badge */}
          <div style={{
            position: "absolute",
            top: 12,
            right: 12,
            padding: "3px 8px",
            borderRadius: 999,
            background: lightColor,
            border: `1px solid ${borderColor}`,
            fontSize: 9,
            fontWeight: 700,
            color: color,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            fontFamily: FONT,
          }}>
            {game.type}
          </div>

          <div style={{ fontSize: 32, lineHeight: 1 }}>{game.icon}</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#ededed", textAlign: "center", fontFamily: FONT, letterSpacing: "-0.02em" }}>
            {game.title}
          </div>
          <div style={{ fontSize: 12, color: "rgba(161,161,161,0.7)", textAlign: "center", lineHeight: 1.5, fontFamily: FONT }}>
            {game.desc}
          </div>

          {/* Tap hint */}
          <div style={{
            position: "absolute",
            bottom: 12,
            display: "flex",
            alignItems: "center",
            gap: 4,
            opacity: 0.4,
          }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
              <path d="M14 2a8 8 0 0 1 8 8a8 8 0 0 1-8 8h-2.5L3 25 3 14H1A8 8 0 0 1 1 0"/>
            </svg>
            <span style={{ fontSize: 10, color: color, fontFamily: FONT, fontWeight: 600 }}>tap to flip</span>
          </div>
        </div>

        {/* BACK */}
        <div style={{
          position: "absolute",
          inset: 0,
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
          transform: "rotateY(180deg)",
          background: `linear-gradient(160deg, ${lightColor.replace("0.12","0.18")} 0%, rgba(255,255,255,0.04) 100%)`,
          border: `1.5px solid ${color}60`,
          borderRadius: 22,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "18px 14px",
          gap: 12,
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          boxShadow: `0 4px 28px ${color}25`,
        }}>
          <div style={{ fontSize: 28 }}>{game.icon}</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#ededed", textAlign: "center", fontFamily: FONT }}>
            Ready to play?
          </div>
          <div style={{ fontSize: 11.5, color: "rgba(161,161,161,0.7)", textAlign: "center", lineHeight: 1.5, fontFamily: FONT }}>
            {game.desc}
          </div>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onPlay(game.id); }}
            style={{
              marginTop: 4,
              padding: "11px 24px",
              background: color,
              color: "#000",
              border: "none",
              borderRadius: 999,
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: FONT,
              letterSpacing: "-0.01em",
              boxShadow: `0 4px 16px ${color}40`,
              transition: "transform 0.15s cubic-bezier(0.34,1.56,0.64,1)",
              WebkitTapHighlightColor: "transparent",
            }}
            onMouseDown={(e) => { e.currentTarget.style.transform = "scale(0.94)"; }}
            onMouseUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
            onTouchStart={(e) => { e.currentTarget.style.transform = "scale(0.94)"; }}
            onTouchEnd={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
          >
            ▶ Play
          </button>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   GAME MODAL WRAPPER
────────────────────────────────────────────────────────────── */
function GameModal({ children, onClose, color, title, t, play }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <>
      <div
        onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.72)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", zIndex: 900 }}
      />
      <div style={{
        position: "fixed",
        left: 0, right: 0, bottom: 0,
        maxHeight: "92dvh",
        background: t?.white || "#111111",
        borderRadius: "22px 22px 0 0",
        borderTop: `1px solid ${color}40`,
        zIndex: 901,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        animation: "gameSheetUp 0.38s cubic-bezier(0.34,1.1,0.64,1) both",
      }}>
        <style>{`@keyframes gameSheetUp { from { transform: translateY(100%); opacity: 0.6; } to { transform: translateY(0); opacity: 1; } } @keyframes questionIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        {/* Pull handle */}
        <div style={{ width: 40, height: 5, background: t?.border || "rgba(255,255,255,0.18)", borderRadius: 999, margin: "12px auto 0" }} />
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px 12px", borderBottom: `1px solid ${t?.border || "rgba(255,255,255,0.07)"}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 3, height: 20, borderRadius: 999, background: color, marginRight: 2, flexShrink: 0 }} />
            <span style={{ fontSize: 17, fontWeight: 700, color: t?.ink || "#ededed", fontFamily: FONT, letterSpacing: "-0.02em" }}>{title}</span>
          </div>
          <button
            type="button"
            onClick={() => { play?.("back"); onClose(); }}
            style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.08)", border: "none", cursor: "pointer", color: t?.muted || "#a1a1a1", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontSize: 16, WebkitTapHighlightColor: "transparent" }}
          >✕</button>
        </div>
        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
          {children}
        </div>
      </div>
    </>
  );
}

/* ──────────────────────────────────────────────────────────────
   INDIVIDUAL GAMES
────────────────────────────────────────────────────────────── */

function FillGapGame({ color, onClose, t, play }) {
  const [qi, setQi] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const q = FILL_GAP_QS[qi];

  const pick = (opt) => {
    if (selected) return;
    setSelected(opt);
    if (opt === q.answer) { setScore(s => s + 1); play?.("correct"); }
    else play?.("wrong");
    setTimeout(() => {
      if (qi + 1 >= FILL_GAP_QS.length) setDone(true);
      else { setQi(qi + 1); setSelected(null); }
    }, 900);
  };

  if (done) return <ScoreScreen score={score} total={FILL_GAP_QS.length} color={color} onReplay={() => { setQi(0); setScore(0); setSelected(null); setDone(false); }} onClose={onClose} t={t} play={play} />;

  return (
    <div style={{ padding: "20px 20px 40px", fontFamily: FONT }}>
      <Progress current={qi} total={FILL_GAP_QS.length} color={color} t={t} />
      <div key={qi} style={{ background: t?.light || "rgba(255,255,255,0.05)", borderRadius: 18, padding: "22px 18px", marginBottom: 22, border: `1px solid ${t?.border || "rgba(255,255,255,0.08)"}`, animation: "questionIn 0.3s cubic-bezier(0.34,1.56,0.64,1) both" }}>
        <p style={{ fontSize: 16, color: t?.ink || "#ededed", lineHeight: 1.65, margin: 0, fontWeight: 500, letterSpacing: "-0.01em" }}>
          {q.sentence.replace("___", "______")}
        </p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {q.options.map(opt => {
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
    </div>
  );
}

function WordGuessGame({ color, t, play }) {
  const [target] = useState(() => WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)]);
  const [guesses, setGuesses] = useState([]);
  const [current, setCurrent] = useState("");
  const [won, setWon] = useState(false);
  const [lost, setLost] = useState(false);
  const maxGuesses = 6;

  const submit = () => {
    if (current.length !== 5) return;
    const g = current.toUpperCase();
    const next = [...guesses, g];
    setGuesses(next);
    setCurrent("");
    play?.("tap");
    if (g === target) { setWon(true); play?.("correct"); }
    else if (next.length >= maxGuesses) { setLost(true); play?.("wrong"); }
  };

  const getLetterState = (letter, pos, word) => {
    if (word[pos] === letter) return "correct";
    if (target.includes(letter)) return "present";
    return "absent";
  };

  const reset = () => { setGuesses([]); setCurrent(""); setWon(false); setLost(false); };

  if (won || lost) return (
    <div style={{ padding: 24, textAlign: "center", fontFamily: FONT }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>{won ? "🎉" : "😔"}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: t?.ink || "#ededed", marginBottom: 8 }}>{won ? "You got it!" : "Better luck next time"}</div>
      <div style={{ fontSize: 15, color: t?.muted || "#a1a1a1", marginBottom: 24 }}>The word was <strong style={{ color }}>{target}</strong></div>
      <button type="button" onClick={reset} style={{ padding: "13px 28px", background: color, color: "#000", borderRadius: 999, border: "none", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: FONT }}>Play Again</button>
    </div>
  );

  return (
    <div style={{ padding: "20px 20px 40px", fontFamily: FONT }}>
      <p style={{ textAlign: "center", fontSize: 13, color: t?.muted || "#a1a1a1", marginBottom: 20 }}>Guess the 5-letter word in {maxGuesses} tries</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 24, alignItems: "center" }}>
        {Array.from({ length: maxGuesses }).map((_, ri) => {
          const g = guesses[ri] || "";
          return (
            <div key={ri} style={{ display: "flex", gap: 6 }}>
              {Array.from({ length: 5 }).map((_, ci) => {
                const l = g[ci] || (ri === guesses.length ? current[ci] : "");
                const state = g[ci] ? getLetterState(g[ci], ci, g) : "empty";
                return (
                  <div key={ci} style={{
                    width: 52, height: 52, borderRadius: 12,
                    border: `2px solid ${state === "correct" ? color : state === "present" ? "#f59e0b" : state === "absent" ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.2)"}`,
                    background: state === "correct" ? `${color}25` : state === "present" ? "rgba(245,158,11,0.2)" : state === "absent" ? "rgba(255,255,255,0.06)" : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 20, fontWeight: 800, color: state === "correct" ? color : state === "present" ? "#f59e0b" : t?.ink || "#ededed",
                    fontFamily: FONT, transition: "all 0.2s ease",
                  }}>{l}</div>
                );
              })}
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 16 }}>
        <input
          type="text" maxLength={5}
          value={current}
          onChange={(e) => setCurrent(e.target.value.toUpperCase().replace(/[^A-Z]/g, ""))}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          style={{
            flex: 1, maxWidth: 180, padding: "13px 16px", borderRadius: 14,
            background: "rgba(255,255,255,0.07)", border: "1.5px solid rgba(255,255,255,0.15)",
            color: "#ededed", fontSize: 18, fontWeight: 800, textAlign: "center",
            outline: "none", fontFamily: FONT, letterSpacing: "0.2em",
          }}
          placeholder="GUESS"
        />
        <button type="button" onClick={submit} style={{
          padding: "13px 20px", background: color, color: "#000", borderRadius: 14,
          border: "none", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: FONT,
        }}>Enter</button>
      </div>
      <p style={{ textAlign: "center", fontSize: 12, color: t?.muted || "#a1a1a1" }}>{guesses.length}/{maxGuesses} guesses</p>
    </div>
  );
}

function VocabMatchGame({ color, onClose, t, play }) {
  const [selected, setSelected] = useState({ word: null, def: null });
  const [matched, setMatched] = useState([]);
  const [wrong, setWrong] = useState(false);
  const [done, setDone] = useState(false);
  const [moves, setMoves] = useState(0);
  const words = VOCAB_PAIRS.map(p => p.word);
  const defs = [...VOCAB_PAIRS.map(p => p.def)].sort(() => Math.random() - 0.5);

  const pick = (type, val) => {
    play?.("tap");
    const next = { ...selected, [type]: val };
    setSelected(next);
    if (next.word && next.def) {
      setMoves(m => m + 1);
      const pair = VOCAB_PAIRS.find(p => p.word === next.word);
      if (pair?.def === next.def) {
        play?.("correct");
        const newMatched = [...matched, next.word];
        setMatched(newMatched);
        setSelected({ word: null, def: null });
        if (newMatched.length === VOCAB_PAIRS.length) setTimeout(() => setDone(true), 400);
      } else {
        play?.("wrong");
        setWrong(true);
        setTimeout(() => { setWrong(false); setSelected({ word: null, def: null }); }, 700);
      }
    }
  };

  if (done) return <ScoreScreen score={VOCAB_PAIRS.length} total={VOCAB_PAIRS.length} color={color} customMsg={`Matched all in ${moves} moves!`} onReplay={() => { setSelected({ word: null, def: null }); setMatched([]); setWrong(false); setDone(false); setMoves(0); }} onClose={onClose} t={t} play={play} />;

  const btnStyle = (active, isMatched) => ({
    padding: "11px 12px", borderRadius: 12, border: `1.5px solid ${isMatched ? `${color}40` : active ? color : "rgba(255,255,255,0.1)"}`,
    background: isMatched ? `${color}10` : active ? `${color}18` : wrong && active ? "rgba(229,72,77,0.15)" : "rgba(255,255,255,0.04)",
    color: isMatched ? `${color}80` : active ? color : t?.ink || "#ededed",
    fontSize: 12.5, fontWeight: 600, cursor: isMatched ? "default" : "pointer",
    fontFamily: FONT, textAlign: "left", lineHeight: 1.4,
    transition: "all 0.2s ease", WebkitTapHighlightColor: "transparent",
    opacity: isMatched ? 0.5 : 1,
  });

  return (
    <div style={{ padding: "20px 20px 40px", fontFamily: FONT }}>
      <p style={{ textAlign: "center", fontSize: 13, color: t?.muted || "#a1a1a1", marginBottom: 20 }}>Match each word to its definition</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: color, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Words</p>
          {words.map(w => (
            <button key={w} type="button" onClick={() => !matched.includes(w) && pick("word", w)} style={btnStyle(selected.word === w, matched.includes(w))}>{w}</button>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: color, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Definitions</p>
          {defs.map(d => {
            const matchedWord = VOCAB_PAIRS.find(p => p.def === d && matched.includes(p.word));
            return (
              <button key={d} type="button" onClick={() => !matchedWord && pick("def", d)} style={btnStyle(selected.def === d, !!matchedWord)}>{d}</button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SentenceBuilderGame({ color, onClose, t, play }) {
  const [qi, setQi] = useState(0);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const q = SENTENCE_QS[qi];
  const [shuffled] = useState(() => SENTENCE_QS.map(q => [...q.words].sort(() => Math.random() - 0.5)));
  const [built, setBuilt] = useState([]);
  const [remaining, setRemaining] = useState(shuffled[0]);
  const [result, setResult] = useState(null);

  const addWord = (word, idx) => {
    if (result) return;
    play?.("tap");
    setBuilt(b => [...b, word]);
    setRemaining(r => r.filter((_, i) => i !== idx));
  };

  const removeWord = (idx) => {
    if (result) return;
    const word = built[idx];
    setBuilt(b => b.filter((_, i) => i !== idx));
    setRemaining(r => [...r, word]);
  };

  const check = () => {
    const correct = JSON.stringify(built) === JSON.stringify(q.answer);
    setResult(correct ? "correct" : "wrong");
    if (correct) { setScore(s => s + 1); play?.("correct"); }
    else play?.("wrong");
    setTimeout(() => {
      if (qi + 1 >= SENTENCE_QS.length) setDone(true);
      else {
        setQi(qi + 1);
        setBuilt([]);
        setRemaining(shuffled[qi + 1]);
        setResult(null);
      }
    }, 1000);
  };

  if (done) return <ScoreScreen score={score} total={SENTENCE_QS.length} color={color} onReplay={() => { setQi(0); setScore(0); setDone(false); setBuilt([]); setRemaining(shuffled[0]); setResult(null); }} onClose={onClose} t={t} play={play} />;

  return (
    <div style={{ padding: "20px 20px 40px", fontFamily: FONT }}>
      <Progress current={qi} total={SENTENCE_QS.length} color={color} t={t} />
      <p style={{ fontSize: 13, color: t?.muted || "#a1a1a1", marginBottom: 16 }}>Tap words to build the sentence in the correct order</p>
      {/* Built area */}
      <div style={{ minHeight: 64, background: "rgba(255,255,255,0.04)", borderRadius: 16, border: `2px dashed ${result === "correct" ? color : result === "wrong" ? "#e5484d" : "rgba(255,255,255,0.12)"}`, padding: "12px 14px", marginBottom: 16, display: "flex", flexWrap: "wrap", gap: 8, transition: "border-color 0.2s ease" }}>
        {built.map((w, i) => (
          <button key={i} type="button" onClick={() => removeWord(i)} style={{ padding: "7px 12px", borderRadius: 999, background: `${color}22`, border: `1px solid ${color}60`, color, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: FONT, WebkitTapHighlightColor: "transparent" }}>{w}</button>        ))}
        {built.length === 0 && <span style={{ color: "rgba(161,161,161,0.35)", fontSize: 13 }}>Tap words below…</span>}
      </div>
      {/* Word bank */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
        {remaining.map((w, i) => (
          <button key={i} type="button" onClick={() => addWord(w, i)} style={{ padding: "9px 14px", borderRadius: 999, background: t?.light || "rgba(255,255,255,0.07)", border: `1px solid ${t?.border || "rgba(255,255,255,0.12)"}`, color: t?.ink || "#ededed", fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: FONT, WebkitTapHighlightColor: "transparent" }}>{w}</button>
        ))}
      </div>
      <button type="button" onClick={check} disabled={remaining.length > 0} style={{ width: "100%", padding: "14px", background: remaining.length > 0 ? "rgba(255,255,255,0.06)" : color, color: remaining.length > 0 ? "#a1a1a1" : "#000", borderRadius: 14, border: "none", fontSize: 15, fontWeight: 700, cursor: remaining.length > 0 ? "not-allowed" : "pointer", fontFamily: FONT, transition: "all 0.2s ease" }}>
        Check Sentence
      </button>
    </div>
  );
}

function MultiChoiceGame({ questions, color, onClose, t, play }) {
  const [qi, setQi] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const q = questions[qi];

  const pick = (opt) => {
    if (selected) return;
    setSelected(opt);
    if (opt === q.ans) { setScore(s => s + 1); play?.("correct"); }
    else play?.("wrong");
    setTimeout(() => {
      if (qi + 1 >= questions.length) setDone(true);
      else { setQi(qi + 1); setSelected(null); }
    }, 900);
  };

  if (done) return <ScoreScreen score={score} total={questions.length} color={color} onReplay={() => { setQi(0); setScore(0); setSelected(null); setDone(false); }} onClose={onClose} t={t} play={play} />;

  return (
    <div style={{ padding: "20px 20px 40px", fontFamily: FONT }}>
      <Progress current={qi} total={questions.length} color={color} t={t} />
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
      {selected && q.tip && <div style={{ marginTop: 14, padding: "12px 16px", borderRadius: 14, background: `${color}10`, border: `1px solid ${color}30`, fontSize: 12.5, color: color, lineHeight: 1.55, fontFamily: FONT }}>{q.tip}</div>}
    </div>
  );
}

function FlashcardGame({ cards, color, t, play }) {
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

function BudgetGame({ color, t, play }) {
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

function InvestSaveGame({ color, onClose, t, play }) {
  const [qi, setQi] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [done, setDone] = useState(false);
  const q = INVEST_QS[qi];

  const pick = (idx) => {
    if (selected !== null) return;
    setSelected(idx);
    if (idx === q.best) { setScore(s => s + 1); play?.("correct"); }
    else play?.("wrong");
    setTimeout(() => {
      if (qi + 1 >= INVEST_QS.length) setDone(true);
      else { setQi(qi + 1); setSelected(null); }
    }, 1400);
  };

  if (done) return <ScoreScreen score={score} total={INVEST_QS.length} color={color} onReplay={() => { setQi(0); setScore(0); setSelected(null); setDone(false); }} onClose={onClose} t={t} play={play} />;

  return (
    <div style={{ padding: "20px 20px 40px", fontFamily: FONT }}>
      <Progress current={qi} total={INVEST_QS.length} color={color} t={t} />
      <div key={qi} style={{ background: t?.light || "rgba(255,255,255,0.05)", borderRadius: 18, padding: "20px", marginBottom: 20, border: `1px solid ${t?.border || "rgba(255,255,255,0.08)"}`, animation: "questionIn 0.3s cubic-bezier(0.34,1.56,0.64,1) both" }}>
        <p style={{ fontSize: 11, fontWeight: 600, color, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Scenario</p>
        <p style={{ fontSize: 15, color: t?.ink || "#ededed", lineHeight: 1.6, margin: 0 }}>{q.scenario}</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {q.opts.map((opt, idx) => {
          const isBest = idx === q.best;
          const isPicked = selected === idx;
          return (
            <button key={idx} type="button" onClick={() => pick(idx)}
              onTouchStart={(e) => { e.currentTarget.style.transform = "scale(0.96)"; }}
              onTouchEnd={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
              style={{
              padding: "14px 16px", borderRadius: 14, textAlign: "left",
              border: `1.5px solid ${selected !== null ? isBest ? color : isPicked ? "#e5484d" : t?.border || "rgba(255,255,255,0.07)" : t?.border || "rgba(255,255,255,0.1)"}`,
              background: selected !== null ? isBest ? `${color}18` : isPicked ? "rgba(229,72,77,0.12)" : "transparent" : t?.light || "rgba(255,255,255,0.05)",
              color: selected !== null ? isBest ? color : isPicked ? "#e5484d" : "#555" : t?.ink || "#ededed",
              fontSize: 14, cursor: "pointer", fontFamily: FONT, fontWeight: 500,
              transition: "all 0.15s cubic-bezier(0.34,1.56,0.64,1)", WebkitTapHighlightColor: "transparent",
            }}>{opt}</button>
          );
        })}
      </div>
      {selected !== null && <div style={{ marginTop: 14, padding: "12px 16px", borderRadius: 14, background: `${color}10`, border: `1px solid ${color}30`, fontSize: 12.5, color: color, lineHeight: 1.55 }}>{q.reason}</div>}
    </div>
  );
}

function MoneyMathGame({ color, onClose, t, play }) {
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

// ── Finance: Compound Growth ───────────────────────────────────
const COMPOUND_QS = [
  { principal: 1000, rate: 10, years: 2, ans: "$1,210", display: "$1,210", opts: ["$1,100", "$1,210", "$1,200", "$1,020"] },
  { principal: 5000, rate: 8,  years: 3, ans: "$6,298", display: "$6,298", opts: ["$6,200", "$6,298", "$5,800", "$6,500"] },
  { principal: 2000, rate: 6,  years: 5, ans: "$2,676", display: "$2,676", opts: ["$2,600", "$2,800", "$2,676", "$2,300"] },
  { principal: 10000, rate: 7, years: 4, ans: "$13,108", display: "$13,108", opts: ["$12,800", "$13,400", "$13,108", "$14,000"] },
  { principal: 500,  rate: 12, years: 3, ans: "$702",   display: "$702",   opts: ["$680", "$720", "$702", "$660"] },
];

function CompoundGrowthGame({ color, onClose, t, play }) {
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
          return (
            <button key={opt} type="button" onClick={() => pick(opt)}
              onTouchStart={(e) => { e.currentTarget.style.transform = "scale(0.96)"; }}
              onTouchEnd={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
              style={{
                padding: "16px 10px", borderRadius: 16, fontFamily: FONT,
                border: `1.5px solid ${selected ? isCorrect ? color : isWrong ? "#e5484d" : t?.border || "rgba(255,255,255,0.07)" : t?.border || "rgba(255,255,255,0.1)"}`,
                background: selected ? isCorrect ? `${color}20` : isWrong ? "rgba(229,72,77,0.15)" : t?.light || "rgba(255,255,255,0.03)" : t?.light || "rgba(255,255,255,0.05)",
                color: selected ? isCorrect ? color : isWrong ? "#e5484d" : t?.muted || "#a1a1a1" : t?.ink || "#ededed",
                fontSize: 17, fontWeight: 700, cursor: "pointer", letterSpacing: "-0.01em",
                transition: "all 0.15s cubic-bezier(0.34,1.56,0.64,1)",
                WebkitTapHighlightColor: "transparent",
              }}
            >{opt.startsWith("$") ? opt : `$${opt}`}</button>
          );
        })}
      </div>
      {selected && selected !== "__timeout__" && (
        <div style={{ marginTop: 14, padding: "12px 16px", borderRadius: 14, background: `${color}10`, border: `1px solid ${color}30`, fontSize: 12.5, color, lineHeight: 1.55, fontFamily: FONT }}>
          💡 Formula: Principal × (1 + rate)^years = {q.display}
        </div>
      )}
      {selected === "__timeout__" && (
        <div style={{ marginTop: 14, padding: "12px 16px", borderRadius: 14, background: "rgba(229,72,77,0.12)", border: "1px solid #e5484d40", fontSize: 12.5, color: "#e5484d", lineHeight: 1.55, fontFamily: FONT }}>
          ⏱ Time&apos;s up! Answer: {q.display}
        </div>
      )}
    </div>
  );
}

function SpeakItGame({ color, onClose, t, play }) {
  const [qi, setQi] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const q = SPEAK_QS[qi];

  const pick = (idx) => {
    if (selected !== null) return;
    setSelected(idx);
    if (idx === q.best) { setScore(s => s + 1); play?.("correct"); }
    else play?.("wrong");
    setTimeout(() => {
      if (qi + 1 >= SPEAK_QS.length) setDone(true);
      else { setQi(qi + 1); setSelected(null); }
    }, 1400);
  };

  if (done) return <ScoreScreen score={score} total={SPEAK_QS.length} color={color} onReplay={() => { setQi(0); setScore(0); setSelected(null); setDone(false); }} onClose={onClose} t={t} play={play} />;

  return (
    <div style={{ padding: "20px 20px 40px", fontFamily: FONT }}>
      <Progress current={qi} total={SPEAK_QS.length} color={color} t={t} />
      <div key={qi} style={{ background: t?.light || "rgba(255,255,255,0.05)", borderRadius: 18, padding: "20px", marginBottom: 20, border: `1px solid ${t?.border || "rgba(255,255,255,0.08)"}`, animation: "questionIn 0.3s cubic-bezier(0.34,1.56,0.64,1) both" }}>
        <p style={{ fontSize: 11, fontWeight: 600, color, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Situation</p>
        <p style={{ fontSize: 15, color: t?.ink || "#ededed", lineHeight: 1.6, margin: 0 }}>{q.scenario}</p>
      </div>
      <p style={{ fontSize: 13, color: t?.muted || "#a1a1a1", marginBottom: 12 }}>What do you say?</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {q.opts.map((opt, idx) => {
          const isBest = idx === q.best;
          const isPicked = selected === idx;
          return (
            <button key={idx} type="button" onClick={() => pick(idx)}
              onTouchStart={(e) => { e.currentTarget.style.transform = "scale(0.96)"; }}
              onTouchEnd={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
              style={{
              padding: "14px 16px", borderRadius: 14, textAlign: "left",
              border: `1.5px solid ${selected !== null ? isBest ? color : isPicked ? "#e5484d" : t?.border || "rgba(255,255,255,0.07)" : t?.border || "rgba(255,255,255,0.1)"}`,
              background: selected !== null ? isBest ? `${color}18` : isPicked ? "rgba(229,72,77,0.12)" : "transparent" : t?.light || "rgba(255,255,255,0.05)",
              color: selected !== null ? isBest ? color : isPicked ? "#e5484d" : "#555" : t?.ink || "#ededed",
              fontSize: 13.5, cursor: "pointer", fontFamily: FONT, fontWeight: 400,
              transition: "all 0.15s cubic-bezier(0.34,1.56,0.64,1)", fontStyle: "italic",
            }}>{opt}</button>
          );
        })}
      </div>
      {selected !== null && <div style={{ marginTop: 14, padding: "12px 16px", borderRadius: 14, background: `${color}10`, border: `1px solid ${color}30`, fontSize: 12.5, color: color, lineHeight: 1.55 }}>💡 {q.why}</div>}
    </div>
  );
}

function FillerCatcherGame({ color, onClose, t, play }) {
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

function ConfidenceQuiz({ color, t, play }) {
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
    const label = pct >= 80 ? "Highly Confident 🏆" : pct >= 55 ? "Growing Confident 💪" : "Building Foundation 🌱";
    return (
      <div style={{ padding: "32px 24px", textAlign: "center", fontFamily: FONT }}>
        <div style={{ width: 100, height: 100, borderRadius: "50%", background: `${color}15`, border: `3px solid ${color}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 36 }}>
          {pct >= 80 ? "🏆" : pct >= 55 ? "💪" : "🌱"}
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

function DailyDemChallenge({ color, onClose, t, play }) {
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
        <div style={{ fontSize: 52, marginBottom: 16 }}>✅</div>
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

function WordLadderGame({ color, t, play }) {
  const [pi, setPi] = useState(0);
  const [revealed, setRevealed] = useState(1);
  const p = WORD_LADDER_PUZZLES[pi];

  return (
    <div style={{ padding: "20px 20px 40px", fontFamily: FONT }}>
      <p style={{ fontSize: 13, color: t?.muted || "#a1a1a1", marginBottom: 20 }}>Change one letter at a time to get from <strong style={{ color }}>{p.start}</strong> → <strong style={{ color }}>{p.end}</strong></p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center", marginBottom: 24 }}>
        {p.steps.map((step, i) => (
          <div key={i} style={{
            display: "flex", gap: 6, alignItems: "center",
            opacity: i < revealed ? 1 : 0.25,
            transition: "opacity 0.3s ease",
          }}>
            {step.split("").map((l, li) => {
              const prev = p.steps[i - 1];
              const changed = prev && prev[li] !== l;
              return (
                <div key={li} style={{
                  width: 48, height: 52, borderRadius: 12,
                  border: `2px solid ${i < revealed ? changed && i > 0 ? color : t?.border || "rgba(255,255,255,0.15)" : t?.border || "rgba(255,255,255,0.08)"}`,
                  background: changed && i > 0 && i < revealed ? `${color}18` : t?.light || "rgba(255,255,255,0.04)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 20, fontWeight: 800, color: changed && i < revealed ? color : t?.ink || "#ededed",
                  fontFamily: FONT, transition: "all 0.3s ease",
                }}>{l}</div>
              );
            })}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        {revealed < p.steps.length && (
          <button type="button" onClick={() => {
            const next = revealed + 1;
            play?.("correct");
            setRevealed(next);
            if (next >= p.steps.length) setTimeout(() => play?.("correct"), 350);
          }} style={{ flex: 1, padding: "13px", background: `${color}18`, color, border: `1px solid ${color}40`, borderRadius: 14, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: FONT }}>Reveal Next Step</button>
        )}
        {pi + 1 < WORD_LADDER_PUZZLES.length && revealed >= p.steps.length && (
          <button type="button" onClick={() => { setPi(pi + 1); setRevealed(1); }} style={{ flex: 1, padding: "13px", background: color, color: "#000", border: "none", borderRadius: 14, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: FONT }}>Next Puzzle →</button>
        )}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   SHARED COMPONENTS
────────────────────────────────────────────────────────────── */
function Progress({ current, total, color, t }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: t?.muted || "#a1a1a1", fontFamily: FONT }}>Question {current + 1} of {total}</span>
        <span style={{ fontSize: 12, color, fontWeight: 600, fontFamily: FONT }}>{Math.round(((current) / total) * 100)}%</span>
      </div>
      <div style={{ height: 6, borderRadius: 999, background: t?.light || "#1a1a1a", overflow: "hidden" }}>
        <div style={{ width: `${(current / total) * 100}%`, height: "100%", background: color, borderRadius: 999, transition: "width 0.4s cubic-bezier(0.34,1.56,0.64,1)" }} />
      </div>
    </div>
  );
}

function ScoreScreen({ score, total, color, customMsg, onReplay, onClose, t, play }) {
  const pct = Math.round((score / total) * 100);
  const emoji = pct === 100 ? "🏆" : pct >= 70 ? "🌟" : pct >= 50 ? "💪" : "📖";
  // Play sound exactly once on mount. Use a ref guard so strict-mode double-invoke
  // doesn't fire it twice and so changing `play` identity doesn't re-trigger.
  const played = useRef(false);
  useEffect(() => {
    if (played.current) return;
    played.current = true;
    if (pct === 100) play?.("star");
    else if (pct >= 60) play?.("correct");
    else play?.("ok");
  }, [pct, play]);
  const confettiColors = ["#FF6B6B","#FFD93D","#6BCB77","#4D96FF","#FF6FF2","#FF9E4F","#A0F0A0","#B388FF","#FFB347","#4FC3F7","#FF80AB","#69F0AE"];
  return (
    <div style={{ padding: "32px 24px", textAlign: "center", fontFamily: FONT }}>
      <style>{`
        @keyframes scoreRing { 0%,100%{transform:scale(1);opacity:0.6} 50%{transform:scale(1.12);opacity:0} }
        @keyframes confettiFall { 0%{transform:translateY(-40px) rotate(0deg);opacity:1} 100%{transform:translateY(220px) rotate(720deg);opacity:0} }
      `}</style>
      {pct === 100 && (
        <div style={{ position: "relative", height: 0, overflow: "visible" }}>
          {confettiColors.map((c, i) => (
            <div key={i} style={{
              position: "absolute",
              left: `${8 + (i * 7.5)}%`,
              top: 0,
              width: 10,
              height: 10,
              borderRadius: i % 2 === 0 ? "50%" : 2,
              background: c,
              animation: `confettiFall ${1.2 + (i % 4) * 0.2}s ease-in ${(i % 5) * 0.12}s both`,
              pointerEvents: "none",
            }} />
          ))}
        </div>
      )}
      <div style={{ position: "relative", width: 120, height: 120, margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `3px solid ${color}`, animation: "scoreRing 2s ease-in-out infinite" }} />
        <div style={{ width: 100, height: 100, borderRadius: "50%", background: t?.white || "#111111", border: `3px solid ${color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48 }}>
          {emoji}
        </div>
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color: t?.ink || "#ededed", letterSpacing: "-0.04em", marginBottom: 6 }}>
        {score}/{total}
      </div>
      <div style={{ fontSize: 14, color, fontWeight: 600, marginBottom: 8 }}>{customMsg || "Score"}</div>
      <div style={{ display: "inline-flex", padding: "6px 16px", borderRadius: 999, background: pct >= 70 ? `${color}18` : t?.light || "rgba(255,255,255,0.07)", border: `1px solid ${pct >= 70 ? color + "40" : t?.border || "rgba(255,255,255,0.1)"}`, fontSize: 13, color: pct >= 70 ? color : t?.muted || "#a1a1a1", fontWeight: 600, marginBottom: 28 }}>
        {pct >= 90 ? "Outstanding!" : pct >= 70 ? "Great work!" : pct >= 50 ? "Keep going!" : "Practice makes perfect"}
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        <button type="button" onClick={onReplay} style={{ flex: 1, padding: "13px", background: t?.light || `${color}18`, color: t?.ink || color, border: `1px solid ${t?.border || color + "40"}`, borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: FONT }}>↺ Again</button>
        <button type="button" onClick={onClose} style={{ flex: 1, padding: "13px", background: t?.light || "rgba(255,255,255,0.07)", color: t?.ink || "#ededed", border: `1px solid ${t?.border || "rgba(255,255,255,0.12)"}`, borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: FONT }}>Done</button>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   GAME ROUTER
────────────────────────────────────────────────────────────── */
function GameRouter({ gameId, color, onClose, t, play }) {
  const games = {
    fill_gap:     () => <FillGapGame color={color} onClose={onClose} t={t} play={play} />,
    word_guess:   () => <WordGuessGame color={color} onClose={onClose} t={t} play={play} />,
    vocab_match:  () => <VocabMatchGame color={color} onClose={onClose} t={t} play={play} />,
    sentence:     () => <SentenceBuilderGame color={color} onClose={onClose} t={t} play={play} />,
    word_trivia:  () => <MultiChoiceGame questions={WORD_TRIVIA} color={color} onClose={onClose} t={t} play={play} />,
    word_ladder:  () => <WordLadderGame color={color} onClose={onClose} t={t} play={play} />,
    fin_terms:    () => <FlashcardGame cards={FIN_TERMS} color={color} onClose={onClose} t={t} play={play} />,
    budget:       () => <BudgetGame color={color} onClose={onClose} t={t} play={play} />,
    fin_trivia:   () => <MultiChoiceGame questions={FIN_TRIVIA} color={color} onClose={onClose} t={t} play={play} />,
    invest_save:  () => <InvestSaveGame color={color} onClose={onClose} t={t} play={play} />,
    money_math:   () => <MoneyMathGame color={color} onClose={onClose} t={t} play={play} />,
    compound:     () => <CompoundGrowthGame color={color} onClose={onClose} t={t} play={play} />,
    speak_it:     () => <SpeakItGame color={color} onClose={onClose} t={t} play={play} />,
    filler_catch: () => <FillerCatcherGame color={color} onClose={onClose} t={t} play={play} />,
    tone_detect:  () => <MultiChoiceGame questions={TONE_QS.map(q => ({ q: `Tone of: "${q.message}"`, opts: q.tones, ans: q.ans, tip: q.tip }))} color={color} onClose={onClose} t={t} play={play} />,
    conf_quiz:    () => <ConfidenceQuiz color={color} onClose={onClose} t={t} play={play} />,
    daily_dem:    () => <DailyDemChallenge color={color} onClose={onClose} t={t} play={play} />,
    body_lang:    () => <MultiChoiceGame questions={BODY_QS.map(q => ({ q: q.q, opts: q.opts, ans: q.ans, tip: q.tip }))} color={color} onClose={onClose} t={t} play={play} />,
  };
  return games[gameId]?.() ?? <div style={{ padding: 24, color: t?.muted || "#a1a1a1", textAlign: "center", fontFamily: FONT }}>Coming soon…</div>;
}

/* ──────────────────────────────────────────────────────────────
   MAIN PAGE
────────────────────────────────────────────────────────────── */
export function LearnItSubjectPage({ t, play, subject, onBack }) {
  const [activeGame, setActiveGame] = useState(null);
  const meta = SUBJECT_META[subject] || SUBJECT_META.english;
  const games = GAMES[subject] || GAMES.english;
  const { color, lightColor, borderColor, label, emoji } = meta;

  const openGame = (id) => {
    play?.("tap");
    setActiveGame(id);
  };

  const closeGame = () => {
    play?.("back");
    setActiveGame(null);
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

      {/* Game modal */}
      {activeGame && (
        <GameModal onClose={closeGame} color={color} title={activeGameMeta?.title || "Game"} t={t} play={play}>
          <GameRouter gameId={activeGame} subject={subject} color={color} onClose={closeGame} t={t} play={play} />
        </GameModal>
      )}
    </div>
  );
}

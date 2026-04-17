import { useState, useEffect, useRef, useCallback } from "react";
import { C } from "../systems/theme";
import { Ic } from "../icons/Ic";
import { QUIZ_QUESTIONS } from "../data/quiz";
import { LS } from "../systems/storage";
import { useQuizStats } from "../systems/useQuizStats";

const TOPIC_META = {
  finance:    { label:"Finance",       col:"#4a8c5c", bg:"#eaf3ec",  icon:"wallet"  },
  psychology: { label:"Psychology",    col:"#7B6FA8", bg:"#f0edf8",  icon:"brain"   },
  money:      { label:"Money",         col:"#b8975a", bg:"#f7f0e3",  icon:"lock"    },
  philosophy: { label:"Philosophy",    col:"#4a7ab8", bg:"#e8f0f8",  icon:"book"    },
  business:   { label:"Business",      col:"#c0604a", bg:"#faecea",  icon:"barChart"},
  communication: { label:"Communication", col:"#3a7a9e", bg:"#e5f1f8", icon:"users" },
  mindset:    { label:"Mindset",       col:"#2d8a6e", bg:"#e6f5ee",  icon:"bolt"    },
  discipline: { label:"Discipline",    col:"#6b4c9a", bg:"#efe8f6",  icon:"shield"  },
  health:     { label:"Health",        col:"#d4694a", bg:"#fdf0ec",  icon:"leaf"    },
  general:    { label:"General",       col:"#6c757d", bg:"#f8f9fa",  icon:"globe"   },
};
const DIFF_COLORS = { easy:C.green, medium:C.gold, hard:C.red };
const DIFF_META   = {
  easy:   { secs:20, label:"Easy",   icon:"🌱", desc:"Foundation questions" },
  medium: { secs:15, label:"Medium", icon:"🔥", desc:"Tested understanding" },
  hard:   { secs:10, label:"Hard",   icon:"⚡", desc:"Expert-level concepts" },
};
const FORMAT_META = {
  multiple:  { label:"Multiple Choice", icon:"🎯", desc:"4 options per question" },
  truefalse: { label:"True / False",    icon:"⚡", desc:"Quick-fire judgement" },
  blitz:     { label:"Blitz Mode",      icon:"🚀", desc:"8 seconds — no mercy" },
  daily:     { label:"Daily Challenge", icon:"📅", desc:"Same for everyone today" },
};
const GOAL_KEY = "life_personal_goals";
const COMMUNICATION_ACTIVITY_KEY = "life_comm_activity_log";
const COMMUNICATION_ACTIVITIES = {
  quiz: {
    label: "Quiz Drill",
    icon: "🎯",
    desc: "Classic communication questions with explanations.",
  },
  sentence: {
    label: "Sentence Completion",
    icon: "✍️",
    desc: "Fill in the missing idea and sharpen spoken vocabulary.",
  },
  warmup: {
    label: "Vocal Warmups",
    icon: "🎙️",
    desc: "Breathing, resonance, and articulation prompts before speaking.",
  },
  audio: {
    label: "Audio Practice",
    icon: "🎧",
    desc: "Conversation practice with an MP3-ready placeholder flow.",
  },
};

const ACHIEVEMENTS = [
  { id:"first_blood",  label:"First Blood",    icon:"🎯", desc:"Complete your first quiz",                    check:(s)=>s.totalPlayed>=1                        },
  { id:"perfect",      label:"Perfectionist",  icon:"💎", desc:"Score 100% on any quiz",                    check:(_s,r)=>r && r.pct===100                     },
  { id:"streak5",      label:"On Fire",        icon:"🔥", desc:"Get a 5-question streak",                    check:(_s,r)=>r && r.bestStreak>=5                 },
  { id:"veteran",      label:"Veteran",        icon:"🏆", desc:"Complete 10 quizzes",                        check:(s)=>s.totalPlayed>=10                       },
  { id:"blitz_win",    label:"Blitz Champion", icon:"⚡", desc:"Score 80%+ in Blitz mode",                  check:(_s,r)=>r && r.format==="blitz"&&r.pct>=80   },
  { id:"scholar",      label:"Scholar",        icon:"📚", desc:"Answer 100 questions total",                 check:(s)=>s.totalAnswered>=100                    },
  { id:"hard_carry",   label:"Hard Carry",     icon:"🧠", desc:"Score 80%+ on Hard difficulty",             check:(_s,r)=>r && r.diff==="hard"&&r.pct>=80      },
  { id:"multi_topic",  label:"Well Rounded",   icon:"🌍", desc:"Complete quizzes in 3 different topics",    check:(s)=>Object.keys(s.topicsPlayed||{}).length>=3},
];

const shuffle = arr => [...arr].sort(() => Math.random() - 0.5);

/** Seconds per question (used by timer — module scope keeps hook deps stable). */
const QUIZ_SECS = { easy: 20, medium: 15, hard: 10 };

function getDailySeed() {
  const d = new Date();
  return d.getFullYear()*10000 + (d.getMonth()+1)*100 + d.getDate();
}
function seededShuffle(arr, seed) {
  const a = [...arr]; let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const j = Math.abs(s) % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function StatCard({ label, value, col, t }) {
  return (
    <div style={{ background:t.white, border:`1px solid ${t.border}`, borderRadius:12, padding:"14px 16px", textAlign:"center" }}>
      <div style={{ fontSize:22, fontWeight:800, color:col||t.ink, fontFamily:"Georgia,serif" }}>{value}</div>
      <div style={{ fontSize:10, color:t.muted, marginTop:3, letterSpacing:1.5, textTransform:"uppercase" }}>{label}</div>
    </div>
  );
}
function AchievementBadge({ ach, unlocked, t }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px",
      background:unlocked?t.greenLt:t.white, border:`1px solid ${unlocked?t.green:t.border}`,
      borderRadius:10, opacity:unlocked?1:0.5 }}>
      <span style={{ fontSize:20 }}>{ach.icon}</span>
      <div>
        <div style={{ fontSize:13, fontWeight:700, color:unlocked?t.green:t.ink }}>{ach.label}</div>
        <div style={{ fontSize:11, color:t.muted }}>{ach.desc}</div>
      </div>
      {unlocked && <span style={{ marginLeft:"auto", fontSize:10, color:t.green, fontWeight:700 }}>✓</span>}
    </div>
  );
}
function TimerRing({ pct, value, color, t }) {
  const r = 35, circ = 2 * Math.PI * r;
  return (
    <div style={{ position:"relative", width:84, height:84 }}>
      <svg width="84" height="84" style={{ transform:"rotate(-90deg)" }}>
        <circle cx="42" cy="42" r={r} fill="none" stroke={t.light} strokeWidth="7"/>
        <circle cx="42" cy="42" r={r} fill="none" stroke={color} strokeWidth="7"
          strokeDasharray={circ} strokeDashoffset={circ*(1-pct)}
          strokeLinecap="round" style={{ transition:"stroke-dashoffset 1s linear,stroke 0.3s" }}/>
      </svg>
      <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
        <span style={{ fontSize:24, fontWeight:800, color, fontFamily:"Georgia,serif" }}>{value}</span>
      </div>
    </div>
  );
}

function getGoalSignals() {
  const goals = LS.get(GOAL_KEY, []);
  const joined = goals
    .map((goal) => `${goal?.title || ""} ${goal?.target || ""}`)
    .join(" ");
  return {
    count: goals.length,
    hasThousandGoal: /\b1,?000\b|\$1,?000\b/.test(joined),
    hasMillionGoal: /\b1,?000,?000\b|\$1,?000,?000\b/.test(joined),
    hasCompletedGoal: goals.some((goal) => goal?.done),
  };
}

function buildPrestigeBadges({ stats, readKeys, totalTopics }) {
  const goals = getGoalSignals();
  const communicationLog = LS.get(COMMUNICATION_ACTIVITY_KEY, []);
  const topicsPlayed = Object.keys(stats.topicsPlayed || {}).length;
  return [
    {
      id: "quiz-first-step",
      label: "First Step",
      icon: "🎯",
      desc: "Complete your first quiz.",
      unlocked: (stats.totalPlayed || 0) >= 1,
    },
    {
      id: "communication-builder",
      label: "Voice Builder",
      icon: "🎙️",
      desc: "Complete a Communication quiz or practice session.",
      unlocked:
        Number(stats.topicsPlayed?.communication || 0) >= 1 ||
        communicationLog.length >= 1,
    },
    {
      id: "well-rounded",
      label: "Well Rounded",
      icon: "🌍",
      desc: "Play across at least 3 different quiz subjects.",
      unlocked: topicsPlayed >= 3,
    },
    {
      id: "goal-architect",
      label: "Goal Architect",
      icon: "🏁",
      desc: "Create your first personal goal.",
      unlocked: goals.count >= 1,
    },
    {
      id: "four-figures",
      label: "First $1,000 Vision",
      icon: "💸",
      desc: "Set a concrete four-figure milestone in your goals.",
      unlocked: goals.hasThousandGoal,
    },
    {
      id: "seven-figures",
      label: "First $1,000,000 Vision",
      icon: "👑",
      desc: "Think bigger with a seven-figure milestone goal.",
      unlocked: goals.hasMillionGoal,
    },
    {
      id: "goal-finished",
      label: "Promise Kept",
      icon: "✅",
      desc: "Complete a personal goal you committed to.",
      unlocked: goals.hasCompletedGoal,
    },
    {
      id: "subject-mastery",
      label: "Complete Every Subject",
      icon: "🏆",
      desc: "Read every subject across the app library.",
      unlocked: totalTopics > 0 && readKeys >= totalTopics,
    },
    {
      id: "legend-run",
      label: "Prestige Run",
      icon: "💎",
      desc: "Finish 25 quizzes with consistent effort.",
      unlocked: (stats.totalPlayed || 0) >= 25,
    },
  ];
}

function PrestigeBadgeCard({ badge, t }) {
  return (
    <div
      style={{
        background: badge.unlocked ? t.white : t.light,
        border: `1px solid ${badge.unlocked ? `${t.green}55` : t.border}`,
        borderRadius: 18,
        padding: "18px 16px",
        minHeight: 150,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxShadow: badge.unlocked ? "0 12px 26px rgba(74,140,92,0.12)" : "none",
        opacity: badge.unlocked ? 1 : 0.74,
      }}
    >
      <div>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            background: badge.unlocked ? t.greenLt : t.white,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 24,
            marginBottom: 14,
          }}
        >
          {badge.icon}
        </div>
        <div style={{ fontSize: 15, fontWeight: 700, color: t.ink, marginBottom: 6 }}>
          {badge.label}
        </div>
        <div style={{ fontSize: 12, color: t.muted, lineHeight: 1.65 }}>
          {badge.desc}
        </div>
      </div>
      <div
        style={{
          marginTop: 14,
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: 2,
          textTransform: "uppercase",
          color: badge.unlocked ? t.green : t.muted,
        }}
      >
        {badge.unlocked ? "Unlocked" : "Locked"}
      </div>
    </div>
  );
}

function CommunicationPracticePage({ activity, t, play, onBack }) {
  const sentencePrompts = [
    { prompt: "Ben is an accountant so he deals with ____.", answer: "numbers and finances" },
    { prompt: "Active ____ means fully concentrating on what the speaker says.", answer: "listening" },
    { prompt: "Body ____ communicates even when we're silent.", answer: "language" },
  ];
  const warmups = [
    "Take 5 deep breaths, expanding the ribs instead of the shoulders.",
    "Hum for 20 seconds, then glide from low to high pitch.",
    "Repeat: red leather, yellow leather — slowly, then clearly at pace.",
    "Say one sentence with a full stop and deliberate pause after each clause.",
  ];

  return (
    <div
      style={{
        padding:
          "28px max(16px, env(safe-area-inset-left, 0px)) max(40px, env(safe-area-inset-bottom, 0px)) max(16px, env(safe-area-inset-right, 0px))",
        maxWidth: 560,
        margin: "0 auto",
        boxSizing: "border-box",
      }}
    >
      <button
        onClick={onBack}
        style={{
          background: "none",
          border: "none",
          color: t.muted,
          fontSize: 13,
          cursor: "pointer",
          fontFamily: "Georgia,serif",
          marginBottom: 18,
          padding: 0,
        }}
      >
        ← Back to setup
      </button>
      <div
        style={{
          background: t.white,
          border: `1px solid ${t.border}`,
          borderRadius: 22,
          padding: 24,
          boxShadow: "0 14px 34px rgba(20,20,20,0.08)",
        }}
      >
        <p
          style={{
            margin: "0 0 8px",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: 2.5,
            textTransform: "uppercase",
            color: t.muted,
          }}
        >
          Communication practice
        </p>
        <h2
          style={{
            margin: "0 0 10px",
            fontSize: 26,
            fontWeight: 800,
            color: t.ink,
            fontFamily: "Georgia,serif",
          }}
        >
          {COMMUNICATION_ACTIVITIES[activity]?.label || "Communication"}
        </h2>
        <p
          style={{
            margin: "0 0 20px",
            color: t.muted,
            fontSize: 14,
            lineHeight: 1.7,
            fontStyle: "italic",
          }}
        >
          {COMMUNICATION_ACTIVITIES[activity]?.desc}
        </p>

        {activity === "sentence" && (
          <div style={{ display: "grid", gap: 12 }}>
            {sentencePrompts.map((item) => (
              <div
                key={item.prompt}
                style={{
                  background: t.light,
                  border: `1px solid ${t.border}`,
                  borderRadius: 16,
                  padding: "16px 18px",
                }}
              >
                <p style={{ margin: "0 0 10px", color: t.ink, fontSize: 15, lineHeight: 1.7 }}>
                  {item.prompt}
                </p>
                <p style={{ margin: 0, color: t.green, fontSize: 13, fontWeight: 700 }}>
                  Answer: {item.answer}
                </p>
              </div>
            ))}
          </div>
        )}

        {activity === "warmup" && (
          <div style={{ display: "grid", gap: 12 }}>
            {warmups.map((item, index) => (
              <div
                key={item}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  background: index === 1 ? t.greenLt : t.light,
                  border: `1px solid ${index === 1 ? `${t.green}44` : t.border}`,
                  borderRadius: 16,
                  padding: "16px 18px",
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: t.white,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: t.green,
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {index + 1}
                </div>
                <p style={{ margin: 0, color: t.ink, fontSize: 14, lineHeight: 1.7 }}>{item}</p>
              </div>
            ))}
          </div>
        )}

        {activity === "audio" && (
          <div style={{ display: "grid", gap: 14 }}>
            <div
              style={{
                background: t.light,
                border: `1px solid ${t.border}`,
                borderRadius: 16,
                padding: "18px 18px 16px",
              }}
            >
              <p style={{ margin: "0 0 8px", fontSize: 15, color: t.ink, fontWeight: 700 }}>
                Prompt
              </p>
              <p style={{ margin: 0, color: t.mid, lineHeight: 1.75, fontSize: 14 }}>
                Explain a recent challenge, how you handled it, and what you would do even
                better next time.
              </p>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              {["Record audio (MP3 soon)", "Upload MP3 (placeholder)"].map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => play("tap")}
                  style={{
                    background: t.white,
                    border: `1.5px dashed ${t.border}`,
                    borderRadius: 16,
                    padding: "18px 16px",
                    color: t.mid,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "Georgia,serif",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
            <div
              style={{
                background: t.greenLt,
                border: `1px solid ${t.green}33`,
                borderRadius: 16,
                padding: "16px 18px",
              }}
            >
              <p style={{ margin: "0 0 6px", color: t.green, fontSize: 12, fontWeight: 700 }}>
                Placeholder structure ready
              </p>
              <p style={{ margin: 0, color: t.mid, fontSize: 13, lineHeight: 1.7 }}>
                This screen is ready for future MP3 recording/upload plumbing without changing
                the user-facing practice flow.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function QuizPage({
  play,
  userId,
  onQuizComplete,
  initialTopic,
  initialActivity,
  readKeys = [],
  totalTopics = 0,
  t: theme,
}) {
  const t = theme || C;
  const { stats, saveStats } = useQuizStats(userId);

  const [phase,     setPhase]    = useState("setup");
  const [topic,     setTopic]    = useState("finance");
  const [diff,      setDiff]     = useState("medium");
  const [fmt,       setFmt]      = useState("multiple");
  const [qs,        setQs]       = useState([]);
  const [idx,       setIdx]      = useState(0);
  const [score,     setScore]    = useState(0);
  const [chosen,    setChosen]   = useState(null);
  const [timeLeft,  setTimeLeft] = useState(0);
  const [streak,    setStreak]   = useState(0);
  const [bestStreak,setBest]     = useState(0);
  const [answers,   setAnswers]  = useState([]);
  const [newAchs,   setNewAchs]  = useState([]);
  const [showFact,  setShowFact] = useState(false);
  const [activeTab, setActiveTab]= useState("play");
  const [communicationActivity, setCommunicationActivity] = useState("quiz");

  const timerRef = useRef(null);
  const handleAnswerRef = useRef(null);
  const maxTime  = fmt==="blitz" ? 8 : QUIZ_SECS[diff];
  const timerPct   = maxTime > 0 ? timeLeft / maxTime : 0;
  const timerColor = timerPct>0.5 ? t.green : timerPct>0.25 ? t.gold : t.red;
  const prestigeBadges = buildPrestigeBadges({
    stats,
    readKeys: readKeys.length,
    totalTopics,
  });

  useEffect(() => {
    if (!initialTopic || !TOPIC_META[initialTopic]) return;
    setTopic(initialTopic);
    setActiveTab("play");
    if (initialTopic === "communication") {
      setCommunicationActivity(initialActivity || "quiz");
    }
  }, [initialActivity, initialTopic]);

  const startQuiz = useCallback(() => {
    play("ok");
    if (topic === "communication" && communicationActivity !== "quiz") {
      const current = LS.get(COMMUNICATION_ACTIVITY_KEY, []);
      LS.set(
        COMMUNICATION_ACTIVITY_KEY,
        [...current, { activity: communicationActivity, createdAt: Date.now() }].slice(-12),
      );
      setPhase("communication_practice");
      return;
    }
    let selected;
    if (fmt === "daily") {
      const seed    = getDailySeed();
      const allPool = Object.values(QUIZ_QUESTIONS[topic] || {}).flat();
      // Daily: 15 questions (was 10)
      selected      = seededShuffle(allPool, seed).slice(0, 15);
    } else {
      const pool  = QUIZ_QUESTIONS[topic]?.[diff] || [];
      // Blitz: 15 (was 10) · Multiple choice / True-false: 12 (was 8)
      const limit = fmt === "blitz" ? 15 : 12;
      selected    = shuffle(pool).slice(0, limit);
    }
    setQs(selected); setIdx(0); setScore(0); setChosen(null);
    setStreak(0); setBest(0); setAnswers([]); setShowFact(false);
    setTimeLeft(fmt==="blitz" ? 8 : QUIZ_SECS[diff]);
    setPhase("playing");
  }, [topic, diff, fmt, play, communicationActivity]);

  const handleAnswer = useCallback((picked) => {
    if (chosen !== null) return;
    clearInterval(timerRef.current);
    setChosen(picked);
    const q       = qs[idx];
    const correct = picked === q.a;
    if (correct) {
      play("correct");
      setScore(s => s + 1);
      setStreak(s => { const ns = s+1; setBest(b => Math.max(b,ns)); return ns; });
    } else {
      play("wrong");
      setStreak(0);
    }
    setAnswers(a => [...a, { correct, q, picked }]);
    setShowFact(true);
    setTimeout(() => {
      setShowFact(false);
      if (idx + 1 >= qs.length) {
        setPhase("result");
      } else {
        setIdx(i => i+1);
        setChosen(null);
        setTimeLeft(fmt==="blitz" ? 8 : QUIZ_SECS[diff]);
      }
    }, fmt==="blitz" ? 1400 : 2000);
  }, [chosen, qs, idx, fmt, diff, play]);

  // Keep ref in sync so the timer always calls the latest handleAnswer
  useEffect(() => {
    handleAnswerRef.current = handleAnswer;
  });

  // Timer
  useEffect(() => {
    if (phase !== "playing" || chosen !== null) return;
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); handleAnswerRef.current(null); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [idx, phase, chosen]);

  useEffect(() => {
    if (phase !== "result") return;
    const pct    = Math.round((score / qs.length) * 100);
    const result = { pct, diff, format:fmt, topic, bestStreak, score, total:qs.length };
    const today  = new Date().toLocaleDateString();

    const next = {
      ...stats,
      totalPlayed:   (stats.totalPlayed||0) + 1,
      totalAnswered: (stats.totalAnswered||0) + qs.length,
      totalCorrect:  (stats.totalCorrect||0) + score,
      bestStreak:    Math.max(stats.bestStreak||0, bestStreak),
      topicsPlayed:  { ...stats.topicsPlayed, [topic]: (stats.topicsPlayed?.[topic]||0)+1 },
      history:       [...(stats.history||[]).slice(-19), { ...result, date: today }],
      dailyDate:     fmt==="daily" ? today : stats.dailyDate,
    };

    // Check achievements
    const earned = [...(stats.achievements||[])];
    const newly  = [];
    ACHIEVEMENTS.forEach(ach => {
      if (!earned.includes(ach.id) && ach.check(next, result)) {
        earned.push(ach.id);
        newly.push(ach);
      }
    });
    next.achievements = earned;

    saveStats(next);
    if (newly.length) setNewAchs(newly);
    if (typeof onQuizComplete === "function") {
      onQuizComplete({ ...result, date: today });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional single persist when phase becomes result
  }, [phase]);

  const overallAcc = stats.totalAnswered > 0
    ? Math.round((stats.totalCorrect / stats.totalAnswered) * 100)
    : 0;

  if (phase === "setup") {
    const todayDone = stats.dailyDate === new Date().toLocaleDateString();
    return (
      <div className="life-quiz-page" style={{ paddingBottom:40 }}>
        {/* Header tabs */}
        <div className="life-quiz-tabs" style={{ display:"flex", borderBottom:`1px solid ${t.border}`, background:t.white, padding:"0 max(12px, env(safe-area-inset-left, 0px)) 0 max(12px, env(safe-area-inset-right, 0px))", position:"sticky", top:0, zIndex:10, overflowX:"auto", WebkitOverflowScrolling:"touch", gap:4 }}>
          {[["play","Quiz"],["stats","My Stats"],["achievements","Badges"]].map(([id,label]) => (
            <button key={id} onClick={() => { setActiveTab(id); }}
              style={{ padding:"14px 14px", flexShrink:0, background:"none", border:"none",
                borderBottom:activeTab===id?`2px solid ${t.green}`:"2px solid transparent",
                color:activeTab===id?t.green:t.muted, fontSize:13,
                fontWeight:activeTab===id?700:400, cursor:"pointer", fontFamily:"Georgia,serif" }}>
              {label}
            </button>
          ))}
        </div>

        {activeTab === "achievements" && (
          <div className="life-quiz-panel" style={{ padding:"28px max(16px, env(safe-area-inset-left, 0px)) 28px max(16px, env(safe-area-inset-right, 0px))", maxWidth:620, margin:"0 auto", boxSizing:"border-box" }}>
            <div style={{ background:`linear-gradient(135deg, ${t.white}, ${t.greenLt})`, border:`1px solid ${t.border}`, borderRadius:20, padding:"22px 22px 18px", marginBottom:18 }}>
              <p style={{ margin:"0 0 6px", fontSize:10, fontWeight:700, letterSpacing:2.5, textTransform:"uppercase", color:t.muted }}>
                Prestige badges
              </p>
              <h2 style={{ margin:"0 0 6px", fontSize:24, fontWeight:800, color:t.ink, fontFamily:"Georgia,serif" }}>
                Earned, not handed out
              </h2>
              <p style={{ margin:0, color:t.mid, fontSize:14, lineHeight:1.7 }}>
                A cleaner badge wall with longer-range milestones across learning, goals, and communication.
              </p>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(180px, 1fr))", gap:12, marginBottom:20 }}>
              {prestigeBadges.map((badge) => (
                <PrestigeBadgeCard key={badge.id} badge={badge} t={t} />
              ))}
            </div>
            <p style={{ margin:"0 0 12px", fontSize:10, fontWeight:700, letterSpacing:2.5, textTransform:"uppercase", color:t.muted }}>
              Quiz streak badges
            </p>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {ACHIEVEMENTS.map((a) => (
                <AchievementBadge t={t} key={a.id} ach={a} unlocked={stats.achievements?.includes(a.id)} />
              ))}
            </div>
          </div>
        )}

        {activeTab === "stats" && (
          <div className="life-quiz-panel" style={{ padding:"28px max(16px, env(safe-area-inset-left, 0px)) 28px max(16px, env(safe-area-inset-right, 0px))", maxWidth:520, margin:"0 auto", boxSizing:"border-box" }}>
            <div className="life-quiz-stat-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:24 }}>
              <StatCard t={t} label="Quizzes Played" value={stats.totalPlayed||0}   col={t.green}/>
              <StatCard t={t} label="Accuracy"        value={`${overallAcc}%`}       col={t.gold}/>
              <StatCard t={t} label="Best Streak"     value={stats.bestStreak||0}    col={t.red}/>
            </div>
            <div className="life-quiz-stat-grid-2" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:24 }}>
              <StatCard t={t} label="Total Answered" value={stats.totalAnswered||0}/>
              <StatCard t={t} label="Total Correct"  value={stats.totalCorrect||0}  col={t.green}/>
            </div>
            {stats.topicsPlayed && Object.keys(stats.topicsPlayed).length > 0 && (
              <>
                <p style={{ margin:"0 0 12px", fontSize:11, fontWeight:700, letterSpacing:2, textTransform:"uppercase", color:t.muted }}>Topics played</p>
                <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:24 }}>
                  {Object.entries(stats.topicsPlayed).sort((a,b)=>b[1]-a[1]).map(([topic,n]) => {
                    const meta = TOPIC_META[topic];
                    return (
                      <div key={topic} style={{ display:"flex", alignItems:"center", gap:12, background:t.white, border:`1px solid ${t.border}`, borderRadius:10, padding:"12px 14px" }}>
                        <div style={{ width:32, height:32, borderRadius:8, background:meta.bg, display:"flex", alignItems:"center", justifyContent:"center" }}>
                          {Ic[meta.icon]?.("none",meta.col,16)}
                        </div>
                        <span style={{ flex:1, fontSize:14, fontWeight:600, color:t.ink }}>{meta.label}</span>
                        <span style={{ fontSize:13, color:meta.col, fontWeight:700 }}>{n} quiz{n!==1?"zes":""}</span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
            {(stats.history||[]).length > 0 && (
              <>
                <p style={{ margin:"0 0 12px", fontSize:11, fontWeight:700, letterSpacing:2, textTransform:"uppercase", color:t.muted }}>Recent history</p>
                <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                  {[...(stats.history||[])].reverse().slice(0,8).map((h,i) => (
                    <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 0", borderBottom:`1px solid ${t.light}` }}>
                      <span style={{ fontSize:12, color:t.muted, minWidth:70 }}>{h.date}</span>
                      <span style={{ fontSize:12, color:TOPIC_META[h.topic]?.col||t.ink, fontWeight:600 }}>{TOPIC_META[h.topic]?.label}</span>
                      <span style={{ fontSize:11, color:t.muted, textTransform:"capitalize" }}>{h.diff}</span>
                      <span style={{ marginLeft:"auto", fontSize:13, fontWeight:700, color:h.pct>=70?t.green:h.pct>=50?t.gold:t.red }}>{h.pct}%</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === "play" && (
          <div className="life-quiz-panel" style={{ padding:"28px max(16px, env(safe-area-inset-left, 0px)) 0 max(16px, env(safe-area-inset-right, 0px))", maxWidth:520, margin:"0 auto", boxSizing:"border-box" }}>
            {/* Daily Challenge banner */}
            <div className="life-quiz-daily-banner" style={{ background:`linear-gradient(135deg,#4a8c5c,#2d6e42)`, borderRadius:14, padding:"16px 18px", marginBottom:24, display:"flex", alignItems:"center", gap:12, cursor:"pointer", flexWrap:"wrap" }}
              onClick={() => { setFmt("daily"); }}>
              <span style={{ fontSize:28 }}>📅</span>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14, fontWeight:700, color:"#fff" }}>Daily Challenge</div>
                <div style={{ fontSize:12, color:"rgba(255,255,255,0.78)", marginTop:2 }}>
                  {todayDone ? "Completed today ✓" : "New questions every day — same for everyone"}
                </div>
              </div>
              {fmt==="daily" && <span style={{ fontSize:16, color:"#fff" }}>✓</span>}
            </div>

            {/* Topic */}
            <p style={{ fontSize:10, fontWeight:700, letterSpacing:2.5, textTransform:"uppercase", color:t.muted, margin:"0 0 12px" }}>Topic</p>
            <div className="life-quiz-topic-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:24 }}>
              {Object.entries(TOPIC_META).map(([k, meta]) => {
                const sel = topic===k && fmt!=="daily";
                return (
                  <button key={k} onClick={() => { setTopic(k); if(fmt==="daily") setFmt("multiple"); }}
                    style={{ background:sel?meta.bg:t.white, border:`1.5px solid ${sel?meta.col:t.border}`,
                      borderRadius:12, padding:"13px 14px", cursor:"pointer", textAlign:"left",
                      display:"flex", alignItems:"center", gap:10, fontFamily:"Georgia,serif" }}>
                    <div style={{ width:32, height:32, borderRadius:8, background:sel?meta.col+"22":t.light, display:"flex", alignItems:"center", justifyContent:"center" }}>
                      {Ic[meta.icon]?.("none", sel?meta.col:"#8a8070", 16)}
                    </div>
                    <span style={{ fontSize:13, fontWeight:sel?700:400, color:sel?meta.col:t.mid }}>{meta.label}</span>
                    {sel && <span style={{ marginLeft:"auto", fontSize:10, color:meta.col }}>✓</span>}
                  </button>
                );
              })}
            </div>

            {/* Difficulty */}
            <p style={{ fontSize:10, fontWeight:700, letterSpacing:2.5, textTransform:"uppercase", color:t.muted, margin:"0 0 12px" }}>Difficulty</p>
            <div className="life-quiz-diff-row" style={{ display:"flex", gap:8, marginBottom:24, flexWrap:"wrap" }}>
              {["easy","medium","hard"].map(d => {
                const dm  = DIFF_META[d];
                const sel = diff===d && fmt!=="daily";
                return (
                  <button key={d} onClick={() => { setDiff(d); if(fmt==="daily") setFmt("multiple"); }}
                    style={{ flex:"1 1 100px", minWidth:0, background:sel?DIFF_COLORS[d]:t.white, border:`1.5px solid ${sel?DIFF_COLORS[d]:t.border}`,
                      borderRadius:12, padding:"12px 8px", cursor:"pointer", fontFamily:"Georgia,serif", textAlign:"center" }}>
                    <div style={{ fontSize:16, marginBottom:4 }}>{dm.icon}</div>
                    <div style={{ fontSize:13, fontWeight:sel?700:400, color:sel?t.white:t.mid, textTransform:"capitalize" }}>{dm.label}</div>
                    <div style={{ fontSize:10, color:sel?"rgba(255,255,255,0.75)":t.muted, marginTop:2 }}>{dm.secs}s/q</div>
                  </button>
                );
              })}
            </div>

            {/* Format */}
            <p style={{ fontSize:10, fontWeight:700, letterSpacing:2.5, textTransform:"uppercase", color:t.muted, margin:"0 0 12px" }}>Format</p>
             <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:28 }}>
               {["multiple","truefalse","blitz"].map(f => {
                const fm  = FORMAT_META[f];
                const sel = fmt===f;
                return (
                  <button key={f} onClick={() => { setFmt(f); }}
                    style={{ background:sel?t.greenLt:t.white, border:`1.5px solid ${sel?t.green:t.border}`,
                      borderRadius:12, padding:"14px 18px", cursor:"pointer", textAlign:"left",
                      display:"flex", alignItems:"center", gap:12, fontFamily:"Georgia,serif" }}>
                    <span style={{ fontSize:20 }}>{fm.icon}</span>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:14, fontWeight:sel?700:500, color:sel?t.green:t.ink }}>{fm.label}</div>
                      <div style={{ fontSize:11, color:t.muted, marginTop:2 }}>{fm.desc}</div>
                    </div>
                    {sel && <div style={{ width:20,height:20,borderRadius:"50%",background:t.green,display:"flex",alignItems:"center",justifyContent:"center" }}><span style={{ color:"#fff",fontSize:11 }}>✓</span></div>}
                  </button>
                );
               })}
             </div>

             {topic === "communication" && (
               <>
                 <p style={{ fontSize:10, fontWeight:700, letterSpacing:2.5, textTransform:"uppercase", color:t.muted, margin:"0 0 12px" }}>Communication Activity</p>
                 <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:28 }}>
                   {Object.entries(COMMUNICATION_ACTIVITIES).map(([id, meta]) => {
                     const selected = communicationActivity === id;
                     return (
                       <button
                         key={id}
                         onClick={() => setCommunicationActivity(id)}
                         style={{
                           background: selected ? t.greenLt : t.white,
                           border: `1.5px solid ${selected ? t.green : t.border}`,
                           borderRadius: 14,
                           padding: "15px 14px",
                           cursor: "pointer",
                           textAlign: "left",
                           fontFamily: "Georgia,serif",
                         }}
                       >
                         <div style={{ fontSize: 22, marginBottom: 8 }}>{meta.icon}</div>
                         <div style={{ fontSize: 14, fontWeight: 700, color: selected ? t.green : t.ink, marginBottom: 4 }}>
                           {meta.label}
                         </div>
                         <div style={{ fontSize: 11, color: t.muted, lineHeight: 1.55 }}>
                           {meta.desc}
                         </div>
                       </button>
                     );
                   })}
                 </div>
               </>
             )}

             <button onClick={startQuiz}
               style={{ width:"100%", background:t.green, border:"none", borderRadius:14, padding:"18px", color:"#fff",
                 fontSize:16, fontWeight:700, cursor:"pointer", fontFamily:"Georgia,serif",
                 boxShadow:"0 6px 20px rgba(74,140,92,0.30)" }}>
              {topic === "communication" && communicationActivity !== "quiz"
                ? `Start ${COMMUNICATION_ACTIVITIES[communicationActivity].label} →`
                : fmt==="daily" ? "Start Daily Challenge 📅" : "Start Quiz →"}
             </button>
           </div>
         )}
      </div>
    );
  }

  if (phase === "communication_practice") {
    return (
      <CommunicationPracticePage
        activity={communicationActivity}
        t={t}
        play={play}
        onBack={() => {
          play("tap");
          setPhase("setup");
          setActiveTab("play");
        }}
      />
    );
  }

  if (phase === "result") {
    const pct      = Math.round((score / qs.length) * 100);
    const grade    = pct===100?"Perfect! 🎉":pct>=90?"Excellent":pct>=70?"Good work":pct>=50?"Decent":"Keep reading";
    const topicMeta = TOPIC_META[topic];
    return (
      <div className="life-quiz-page life-quiz-result-wrap" style={{ padding:"32px max(16px, env(safe-area-inset-left, 0px)) max(60px, env(safe-area-inset-bottom, 0px)) max(16px, env(safe-area-inset-right, 0px))", maxWidth:500, margin:"0 auto", boxSizing:"border-box" }}>
        {newAchs.length > 0 && (
        <div style={{ background:t.ink, borderRadius:14, padding:"16px 20px", marginBottom:20, display:"flex", alignItems:"center", gap:12 }}>
            <span style={{ fontSize:24 }}>{newAchs[0].icon}</span>
            <div>
              <div style={{ fontSize:12, color:"rgba(255,255,255,0.72)", fontFamily:"Georgia,serif" }}>Achievement Unlocked</div>
              <div style={{ fontSize:15, fontWeight:700, color:"#fff", fontFamily:"Georgia,serif" }}>{newAchs[0].label}</div>
            </div>
          </div>
        )}
        <div style={{ background:t.white, border:`1px solid ${t.border}`, borderRadius:20, padding:28, marginBottom:20, textAlign:"center", boxShadow:"0 4px 20px rgba(0,0,0,0.06)" }}>
          <div style={{ width:64, height:64, borderRadius:20, background:topicMeta.bg, margin:"0 auto 16px", display:"flex", alignItems:"center", justifyContent:"center" }}>
            {Ic[topicMeta.icon]?.("none", topicMeta.col, 28)}
          </div>
          <h2 style={{ margin:"0 0 4px", fontSize:24, fontWeight:800, color:t.ink, fontFamily:"Georgia,serif" }}>{grade}</h2>
          <p style={{ margin:"0 0 20px", color:t.muted, fontSize:13, fontStyle:"italic" }}>
            {topicMeta.label} · {DIFF_META[diff]?.label} · {FORMAT_META[fmt]?.label}
          </p>
          <div className="life-quiz-result-score" style={{ fontSize:"clamp(2.5rem, 12vw, 3.75rem)", fontWeight:800, color:topicMeta.col, lineHeight:1, fontFamily:"Georgia,serif" }}>
            {score}<span style={{ fontSize:"clamp(1rem, 5vw, 1.5rem)", color:t.muted, fontWeight:400 }}>/{qs.length}</span>
          </div>
          <p style={{ margin:"6px 0 20px", color:t.muted, fontSize:14 }}>{pct}% correct</p>
          <div style={{ height:8, background:t.light, borderRadius:20, marginBottom:20, overflow:"hidden" }}>
            <div style={{ height:"100%", width:`${pct}%`, background:pct>=70?t.green:pct>=50?t.gold:t.red, borderRadius:20, transition:"width 0.6s ease" }}/>
          </div>
          <div style={{ display:"flex", justifyContent:"space-around" }}>
            <div><div style={{ fontSize:22, fontWeight:700, color:t.ink }}>{bestStreak}</div><div style={{ fontSize:10, color:t.muted, letterSpacing:1 }}>BEST STREAK</div></div>
            <div><div style={{ fontSize:22, fontWeight:700, color:t.ink }}>{qs.length-score}</div><div style={{ fontSize:10, color:t.muted, letterSpacing:1 }}>MISSED</div></div>
            <div><div style={{ fontSize:22, fontWeight:700, color:DIFF_COLORS[diff] }}>{DIFF_META[diff]?.icon}</div><div style={{ fontSize:10, color:t.muted, letterSpacing:1, textTransform:"uppercase" }}>{diff}</div></div>
          </div>
        </div>

        {/* Answer trail */}
        <div style={{ display:"flex", gap:5, flexWrap:"wrap", justifyContent:"center", marginBottom:20 }}>
          {answers.map((a,i) => (
            <div key={i} title={a.q?.q||""} style={{ width:30, height:30, borderRadius:8, background:a.correct?t.green:t.red, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <span style={{ color:"#fff", fontSize:13 }}>{a.correct?"✓":"✗"}</span>
            </div>
          ))}
        </div>

        {/* Review wrong answers */}
        {answers.filter(a=>!a.correct).length > 0 && (
          <div style={{ marginBottom:20 }}>
            <p style={{ fontSize:10, fontWeight:700, letterSpacing:2, textTransform:"uppercase", color:t.red, margin:"0 0 10px" }}>Review missed questions</p>
            {answers.filter(a=>!a.correct).map((a,i) => (
              <div key={i} style={{ background:t.ink === C.ink ? "#fff8f8" : t.light, border:`1px solid ${t.red}22`, borderRadius:12, padding:"14px 16px", marginBottom:8 }}>
                <p style={{ margin:"0 0 6px", fontSize:13, fontWeight:700, color:t.ink, fontFamily:"Georgia,serif" }}>{a.q?.q}</p>
                <p style={{ margin:"0 0 4px", fontSize:12, color:t.green }}>✓ {a.q?.opts?.[a.q?.a]}</p>
                {a.q?.explain && <p style={{ margin:0, fontSize:11, color:t.muted, fontStyle:"italic", lineHeight:1.6 }}>{a.q.explain}</p>}
              </div>
            ))}
          </div>
        )}

        <div className="life-quiz-result-actions" style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
          <button onClick={() => { play("tap"); setPhase("setup"); setActiveTab("play"); setNewAchs([]); }}
            style={{ flex:"1 1 140px", minWidth:0, background:t.white, border:`1.5px solid ${t.border}`, borderRadius:12, padding:"15px", color:t.mid, fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:"Georgia,serif" }}>
            Change Setup
          </button>
          <button onClick={() => { play("ok"); setNewAchs([]); startQuiz(); }}
            style={{ flex:"2 1 180px", minWidth:0, background:t.green, border:"none", borderRadius:12, padding:"15px", color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"Georgia,serif" }}>
            Play Again →
          </button>
        </div>
      </div>
    );
  }

  const q         = qs[idx];
  if (!q) return null;
  const opts       = fmt==="truefalse" ? ["True","False"] : q.opts;
  const correctIdx = fmt==="truefalse" ? 0 : q.a;
  const topicMeta  = TOPIC_META[topic];

  return (
    <div className="life-quiz-page" style={{ padding:"20px max(16px, env(safe-area-inset-left, 0px)) max(40px, env(safe-area-inset-bottom, 0px)) max(16px, env(safe-area-inset-right, 0px))", maxWidth:520, margin:"0 auto", boxSizing:"border-box" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14, gap:12, flexWrap:"wrap" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:26, height:26, borderRadius:7, background:topicMeta.bg, display:"flex", alignItems:"center", justifyContent:"center" }}>
            {Ic[topicMeta.icon]?.("none",topicMeta.col,13)}
          </div>
          <span style={{ fontSize:12, color:t.muted, fontFamily:"Georgia,serif", fontStyle:"italic" }}>{topicMeta.label} · {DIFF_META[diff]?.label}</span>
        </div>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          {streak >= 2 && (
              <span style={{ display:"inline-flex", alignItems:"center", gap:4, fontSize:12, color:t.gold, fontWeight:700, background:t.ink === C.ink ? "#fdf6e8" : t.light, padding:"3px 8px", borderRadius:20 }}>
              🔥 {streak}
            </span>
          )}
          <span style={{ fontSize:13, fontWeight:700, color:t.green, fontFamily:"Georgia,serif" }}>{score}/{idx}</span>
        </div>
      </div>

      <div className="life-quiz-progress-bars" style={{ display:"flex", gap:3, marginBottom:20, minWidth:0, width:"100%", overflow:"hidden" }}>
        {qs.map((_,i) => (
          <div key={i} style={{ flex:"1 1 4px", minWidth:3, height:4, borderRadius:4,
            background: answers[i]?.correct===true ? t.green
              : answers[i]?.correct===false ? t.red
              : i===idx ? t.gold : t.light }} />
        ))}
      </div>

      <div style={{ display:"flex", justifyContent:"center", marginBottom:18 }}>
        <TimerRing pct={timerPct} value={timeLeft} color={timerColor} t={t}/>
      </div>

      {q.tag && (
        <div style={{ display:"flex", justifyContent:"center", marginBottom:10 }}>
          <span style={{ fontSize:10, fontWeight:700, letterSpacing:1.5, textTransform:"uppercase", padding:"3px 10px", borderRadius:20, background:topicMeta.bg, color:topicMeta.col }}>
            {q.tag}
          </span>
        </div>
      )}

      <div style={{ background:t.white, border:`1px solid ${t.border}`, borderRadius:16, padding:"22px 20px", marginBottom:16, boxShadow:"0 2px 10px rgba(0,0,0,0.05)" }}>
        <p style={{ margin:"0 0 4px", fontSize:10, fontWeight:700, letterSpacing:2, textTransform:"uppercase", color:t.muted }}>
          Question {idx+1} of {qs.length}
        </p>
        <p style={{ margin:0, fontSize:17, fontWeight:700, color:t.ink, lineHeight:1.55, fontFamily:"Georgia,serif" }}>{q.q}</p>
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
        {opts.map((opt,i) => {
          let bg=t.white, border=`1.5px solid ${t.border}`, col=t.ink, fw=400;
          if (chosen !== null) {
            if (i===correctIdx)                       { bg=t.greenLt; border=`1.5px solid ${t.green}`; col=t.green; fw=700; }
            else if (i===chosen && chosen!==correctIdx){ bg="#fef2f2"; border=`1.5px solid ${t.red}`; col=t.red; fw=700; }
            else                                       { col=t.muted; }
          }
          return (
            <button key={i} onClick={() => handleAnswer(i)} disabled={chosen!==null}
              style={{ background:bg, border, borderRadius:12, padding:"14px 16px", textAlign:"left",
                cursor:chosen!==null?"default":"pointer", fontFamily:"Georgia,serif",
                color:col, fontSize:15, fontWeight:fw, display:"flex", alignItems:"center", gap:12, transition:"all 0.18s" }}>
              <span style={{ width:28, height:28, borderRadius:"50%", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:12, fontWeight:700, transition:"all 0.18s",
                background:chosen===null?t.light:i===correctIdx?t.green:i===chosen?t.red:t.light,
                color:chosen!==null&&(i===correctIdx||i===chosen)?"#fff":t.muted }}>
                {chosen!==null ? (i===correctIdx?"✓":i===chosen?"✗":String.fromCharCode(65+i)) : String.fromCharCode(65+i)}
              </span>
              {opt}
            </button>
          );
        })}
      </div>

      {showFact && chosen !== null && q.explain && (
        <div style={{ marginTop:14, padding:"14px 16px",
          background:chosen===correctIdx?t.greenLt:"#fff8f8",
          border:`1px solid ${chosen===correctIdx?t.green+"44":t.red+"44"}`, borderRadius:12 }}>
          <p style={{ margin:0, fontSize:13, color:chosen===correctIdx?t.green:t.red, fontFamily:"Georgia,serif", lineHeight:1.7 }}>
            <span style={{ fontWeight:700 }}>{chosen===correctIdx?"✓ Correct — ":"✗ Incorrect — "}</span>
            {q.explain}
          </p>
        </div>
      )}
    </div>
  );
}

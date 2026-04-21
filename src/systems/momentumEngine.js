import {
  MOMENTUM_EMPTY_SUGGESTION,
  MOMENTUM_MISSION_TEMPLATES,
  MOMENTUM_SUGGESTION_PRIORITY,
} from "../data/momentumCopy";

const MOMENTUM_VERSION = 1;
const MAX_EVENTS = 120;

function pad(n) {
  return String(n).padStart(2, "0");
}

export function getDateKey(date = new Date()) {
  const d = new Date(date);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function toIso(date = new Date()) {
  return new Date(date).toISOString();
}

function isMomentumType(value) {
  return ["read", "note", "quiz", "community", "streak", "profile"].includes(
    value,
  );
}

function scoreToLevel(score = 0) {
  return Math.max(1, Math.floor(Number(score || 0) / 100) + 1);
}

function coerceProgress(progressCount = 0, targetCount = 1) {
  const safeTarget = Math.max(1, Number(targetCount || 1));
  const safeProgress = Math.max(0, Number(progressCount || 0));
  return Math.min(safeProgress, safeTarget);
}

function createMission(template, dateKey) {
  return {
    id: `${template.id}_${dateKey}`,
    type: template.type,
    label: template.label,
    description: template.description,
    route: template.route,
    ctaLabel: template.ctaLabel,
    targetCount: Math.max(1, Number(template.targetCount || 1)),
    progressCount: 0,
    pointsReward: Math.max(0, Number(template.pointsReward || 0)),
    completed: false,
    expiresOn: dateKey,
  };
}

export function buildDailyMissions(dateKey = getDateKey()) {
  return [
    createMission(MOMENTUM_MISSION_TEMPLATES.read, dateKey),
    createMission(MOMENTUM_MISSION_TEMPLATES.note, dateKey),
    createMission(MOMENTUM_MISSION_TEMPLATES.quiz, dateKey),
    createMission(MOMENTUM_MISSION_TEMPLATES.community, dateKey),
    createMission(MOMENTUM_MISSION_TEMPLATES.profile, dateKey),
  ];
}

function sanitizeMission(mission, dateKey) {
  if (!mission || !isMomentumType(mission.type)) return null;
  const targetCount = Math.max(1, Number(mission.targetCount || 1));
  const progressCount = coerceProgress(mission.progressCount, targetCount);
  return {
    ...mission,
    targetCount,
    progressCount,
    completed: progressCount >= targetCount,
    pointsReward: Math.max(0, Number(mission.pointsReward || 0)),
    expiresOn: mission.expiresOn || dateKey,
  };
}

function sanitizeEvent(event) {
  if (!event || !event.id || !isMomentumType(event.type)) return null;
  return {
    id: String(event.id),
    type: event.type,
    source: event.source || "home",
    createdAt: event.createdAt || toIso(),
    points: Math.max(0, Math.floor(Number(event.points || 0))),
    contentKey: event.contentKey,
    topicKey: event.topicKey,
    meta: event.meta || undefined,
  };
}

function previousDateKey(dateKey) {
  const [y, m, d] = String(dateKey)
    .split("-")
    .map((part) => Number(part));
  const prev = new Date(y, (m || 1) - 1, (d || 1) - 1);
  return getDateKey(prev);
}

function withSuggestion(state) {
  return {
    ...state,
    nextSuggestion: getNextMomentumSuggestion({ missions: state?.missions || [] }),
  };
}

function createDefaultMomentumStateRaw(dateKey = getDateKey()) {
  return {
    version: MOMENTUM_VERSION,
    dateKey,
    score: 0,
    level: 1,
    streakDays: 0,
    lastActiveAt: null,
    missions: buildDailyMissions(dateKey),
    completedMissionIds: [],
    recentEvents: [],
    nextSuggestion: MOMENTUM_EMPTY_SUGGESTION,
  };
}

export function createDefaultMomentumState(dateKey = getDateKey()) {
  return withSuggestion(createDefaultMomentumStateRaw(dateKey));
}

function normalizeMomentumStateRaw(state, dateKey = getDateKey()) {
  if (!state || typeof state !== "object") {
    return createDefaultMomentumStateRaw(dateKey);
  }

  const missions = Array.isArray(state.missions)
    ? state.missions
        .map((mission) => sanitizeMission(mission, state.dateKey || dateKey))
        .filter(Boolean)
    : [];

  const base = {
    version: MOMENTUM_VERSION,
    dateKey: state.dateKey || dateKey,
    score: Math.max(0, Math.floor(Number(state.score || 0))),
    level: Math.max(1, Math.floor(Number(state.level || 1))),
    streakDays: Math.max(0, Math.floor(Number(state.streakDays || 0))),
    lastActiveAt: state.lastActiveAt || null,
    missions:
      missions.length > 0 ? missions : buildDailyMissions(state.dateKey || dateKey),
    completedMissionIds: Array.isArray(state.completedMissionIds)
      ? state.completedMissionIds.filter(Boolean)
      : [],
    recentEvents: Array.isArray(state.recentEvents)
      ? state.recentEvents.map(sanitizeEvent).filter(Boolean).slice(-MAX_EVENTS)
      : [],
    nextSuggestion: state.nextSuggestion || null,
  };

  base.level = scoreToLevel(base.score);
  return base;
}

export function normalizeMomentumState(state, dateKey = getDateKey()) {
  return withSuggestion(normalizeMomentumStateRaw(state, dateKey));
}

export function rolloverMomentumState(state, dateKey = getDateKey()) {
  const current = normalizeMomentumState(state, dateKey);
  if (current.dateKey === dateKey) return current;

  let streakDays = current.streakDays;
  if (current.lastActiveAt) {
    const lastKey = getDateKey(current.lastActiveAt);
    if (lastKey === previousDateKey(dateKey)) streakDays += 1;
    else if (lastKey !== dateKey) streakDays = 1;
  }

  const next = {
    ...current,
    dateKey,
    streakDays,
    missions: buildDailyMissions(dateKey),
    completedMissionIds: [],
  };

  return withSuggestion(next);
}

function updateMissionProgress(mission, step = 1) {
  const nextProgress = coerceProgress(
    Number(mission.progressCount || 0) + Math.max(1, step),
    mission.targetCount,
  );
  return {
    ...mission,
    progressCount: nextProgress,
    completed: nextProgress >= mission.targetCount,
  };
}

export function recordMomentumEvent(state, eventInput) {
  const event = sanitizeEvent(eventInput);
  const current = rolloverMomentumState(state, getDateKey());
  if (!event) return current;
  if (current.recentEvents.some((item) => item.id === event.id)) return current;

  let bonusPoints = 0;
  const completed = new Set(current.completedMissionIds || []);
  const missions = current.missions.map((mission) => {
    if (mission.type !== event.type || mission.completed) return mission;
    const updated = updateMissionProgress(mission, 1);
    if (updated.completed && !completed.has(updated.id)) {
      completed.add(updated.id);
      bonusPoints += Math.max(0, Number(updated.pointsReward || 0));
    }
    return updated;
  });

  const eventPoints = Math.max(0, Number(event.points || 0));
  const score = Math.max(0, current.score + eventPoints + bonusPoints);
  const recentEvents = [...current.recentEvents, event].slice(-MAX_EVENTS);
  const next = {
    ...current,
    score,
    level: scoreToLevel(score),
    lastActiveAt: event.createdAt || toIso(),
    missions,
    completedMissionIds: Array.from(completed),
    recentEvents,
  };

  return withSuggestion(next);
}

export function getNextMomentumSuggestion(snapshot) {
  const missions = Array.isArray(snapshot?.missions) ? snapshot.missions : [];
  const pending = missions
    .filter((mission) => !mission.completed)
    .map((mission) => ({
      actionType: mission.type,
      title: mission.label,
      body: mission.description,
      route: mission.route,
      priority: MOMENTUM_SUGGESTION_PRIORITY[mission.type] ?? 40,
      contentKey: mission.contentKey,
      topicKey: mission.topicKey,
    }))
    .sort((a, b) => b.priority - a.priority);

  return pending[0] || MOMENTUM_EMPTY_SUGGESTION;
}

export function deriveMomentumSnapshot({
  momentumState,
  readKeys = [],
  notes = {},
  quizStats = null,
  profile = null,
} = {}) {
  const state = normalizeMomentumStateRaw(momentumState);
  const missions = Array.isArray(state.missions) ? state.missions : [];
  const completedCount = missions.filter((mission) => mission.completed).length;
  const completionRate =
    missions.length > 0 ? Math.round((completedCount / missions.length) * 100) : 0;
  const notesCount = Object.keys(notes || {}).filter((key) => notes?.[key]).length;
  const quizzesPlayed = Number(quizStats?.totalPlayed || 0);
  const highlights = [
    { label: "Topics", value: readKeys.length, tone: "growth" },
    { label: "Notes", value: notesCount, tone: "focus" },
    { label: "Quizzes", value: quizzesPlayed, tone: "challenge" },
    {
      label: "Profile",
      value: profile ? "Tailored" : "Pending",
      tone: profile ? "growth" : "neutral",
    },
  ];

  const draft = {
    score: state.score,
    level: state.level,
    streakDays: state.streakDays,
    completionRate,
    missions,
    nextSuggestion: state.nextSuggestion,
    highlights,
  };

  return {
    ...draft,
    nextSuggestion: getNextMomentumSuggestion(draft),
  };
}

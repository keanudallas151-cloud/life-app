import { useEffect } from "react";

const TASKS_KEY = "tasks-v2";
const CATEGORIES_KEY = "categories-v2";
const PREMIUM_CATEGORY_ID = "premium-perks";
const PREMIUM_CATEGORY_NAME = "Premium Perks";
const PREMIUM_CATEGORY_COLOR = "oklch(0.62 0.16 145)";
const MEETING_TASK_ID = "premium-business-meeting";
const MEETING_TITLE = "Business Meeting — Premium Members";
const MEETING_NOTES =
  "Weekly Premium business meeting. As a Premium member you have a free invitation. Check email for the live link before each session.";

function readJSON(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw == null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeJSON(key, value) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

function nextFridayAt10am(now = new Date()) {
  const result = new Date(now);
  result.setHours(10, 0, 0, 0);
  const day = result.getDay();
  const diff = (5 - day + 7) % 7; // Friday = 5
  if (diff === 0 && result.getTime() <= now.getTime()) {
    result.setDate(result.getDate() + 7);
  } else {
    result.setDate(result.getDate() + diff);
  }
  return result.getTime();
}

function ensurePremiumCategory() {
  const categories = readJSON(CATEGORIES_KEY, []);
  if (!Array.isArray(categories)) {
    writeJSON(CATEGORIES_KEY, [
      {
        id: PREMIUM_CATEGORY_ID,
        name: PREMIUM_CATEGORY_NAME,
        color: PREMIUM_CATEGORY_COLOR,
      },
    ]);
    return;
  }
  if (categories.some((c) => c && c.id === PREMIUM_CATEGORY_ID)) return;
  writeJSON(CATEGORIES_KEY, [
    ...categories,
    {
      id: PREMIUM_CATEGORY_ID,
      name: PREMIUM_CATEGORY_NAME,
      color: PREMIUM_CATEGORY_COLOR,
    },
  ]);
}

function ensureMeetingTask() {
  const tasks = readJSON(TASKS_KEY, []);
  if (!Array.isArray(tasks)) {
    writeJSON(TASKS_KEY, [buildMeetingTask()]);
    return;
  }
  if (tasks.some((t) => t && t.id === MEETING_TASK_ID)) return;
  writeJSON(TASKS_KEY, [buildMeetingTask(), ...tasks]);
}

function buildMeetingTask() {
  return {
    id: MEETING_TASK_ID,
    title: MEETING_TITLE,
    completed: false,
    categoryId: PREMIUM_CATEGORY_ID,
    createdAt: Date.now(),
    priority: "medium",
    notes: MEETING_NOTES,
    dueDate: nextFridayAt10am(),
    recurring: "weekly",
    tags: ["premium", "business"],
    subtasks: [],
  };
}

function removeMeetingTask() {
  const tasks = readJSON(TASKS_KEY, []);
  if (!Array.isArray(tasks)) return;
  const filtered = tasks.filter((t) => t && t.id !== MEETING_TASK_ID);
  if (filtered.length !== tasks.length) {
    writeJSON(TASKS_KEY, filtered);
  }
}

/**
 * Syncs the Premium-only weekly business meeting into the Organized
 * tasks-v2 / categories-v2 stores based on the current subscription tier.
 *
 * - On `premium`: ensures the Premium Perks category and a weekly recurring
 *   "Business Meeting — Premium Members" task exist.
 * - On any other tier: removes the auto-inserted task (the user can still
 *   keep a custom-created copy if they renamed/re-IDed it).
 */
export function usePremiumOrganizedSync(tier) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (tier === "premium") {
      ensurePremiumCategory();
      ensureMeetingTask();
    } else {
      removeMeetingTask();
    }
  }, [tier]);
}

export default usePremiumOrganizedSync;

import { LS } from "./storage";

const KEY = "life_reading_streak_v1";

/** Call when the user opens a topic (counts as activity for today). */
export function recordReadingDay() {
  const today = new Date().toISOString().slice(0, 10);
  const s = LS.get(KEY, { lastDate: "", count: 0 });
  if (s.lastDate === today) return { ...s, count: s.count || 0 };

  const y = new Date();
  y.setDate(y.getDate() - 1);
  const yesterday = y.toISOString().slice(0, 10);

  let count = 1;
  if (s.lastDate === yesterday) count = (s.count || 0) + 1;

  const next = { lastDate: today, count };
  LS.set(KEY, next);
  return next;
}

export function getReadingStreak() {
  return LS.get(KEY, { lastDate: "", count: 0 });
}

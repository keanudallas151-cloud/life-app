import { LS } from "./storage";

const KEY = "life_reading_streak_v1";

/** Local-timezone date string (YYYY-MM-DD). Using local time avoids the bug
 *  where toISOString() converts to UTC and the date can shift near midnight. */
export function localDateStr(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Call when the user opens a topic (counts as activity for today). */
export function recordReadingDay() {
  const today = localDateStr();
  const s = LS.get(KEY, { lastDate: "", count: 0 });

  // Validate lastDate format to prevent corrupted date math
  if (s.lastDate && !/^\d{4}-\d{2}-\d{2}$/.test(s.lastDate)) {
    const next = { lastDate: today, count: 1 };
    LS.set(KEY, next);
    return next;
  }

  if (s.lastDate === today) return { ...s, count: s.count || 0 };

  const y = new Date();
  y.setDate(y.getDate() - 1);
  const yesterday = localDateStr(y);

  let count = 1;
  if (s.lastDate === yesterday) count = (s.count || 0) + 1;

  const next = { lastDate: today, count };
  LS.set(KEY, next);
  return next;
}

export function getReadingStreak() {
  return LS.get(KEY, { lastDate: "", count: 0 });
}

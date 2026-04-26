export const FONT = "-apple-system, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif";

/**
 * Subject-keyed token map. All Learn-It surfaces should read colour tokens
 * from here so the three subjects stay visually consistent apart from hue.
 *
 * Keys mirror the `subject` prop accepted by `LearnItSubjectPage`.
 */
export const SUBJECT_TOKENS = {
  english: {
    label: "English",
    emoji: "📖",
    color: "#3B82F6",
    lightColor: "rgba(59,130,246,0.12)",
    borderColor: "rgba(59,130,246,0.25)",
  },
  finance: {
    label: "Finance",
    emoji: "💰",
    color: "#50c878",
    lightColor: "rgba(80,200,120,0.12)",
    borderColor: "rgba(80,200,120,0.25)",
  },
  demeanor: {
    label: "Demeanor",
    emoji: "🎯",
    color: "#A855F7",
    lightColor: "rgba(168,85,247,0.12)",
    borderColor: "rgba(168,85,247,0.25)",
  },
};

/* ──────────────────────────────────────────────────────────────
   Best-score helpers (session-only)

   Persistence is intentionally scoped to `sessionStorage` so a card's
   "best" badge resets each browser session. Future Phase 3 work can
   move this to Firebase without changing call sites — every game
   funnels through `recordBestScore` and FlipCard reads via `getBestScore`.
────────────────────────────────────────────────────────────── */
const BEST_SCORE_PREFIX = "life-learnit-best-";

function safeSession() {
  try {
    if (typeof window === "undefined") return null;
    return window.sessionStorage || null;
  } catch {
    return null;
  }
}

export function recordBestScore(gameId, score, total) {
  if (!gameId || typeof score !== "number" || typeof total !== "number" || total <= 0) return null;
  const ss = safeSession();
  if (!ss) return null;
  const pct = Math.max(0, Math.min(100, Math.round((score / total) * 100)));
  const key = BEST_SCORE_PREFIX + gameId;
  try {
    const prevRaw = ss.getItem(key);
    const prev = prevRaw ? JSON.parse(prevRaw) : null;
    if (!prev || pct > prev.pct) {
      const next = { pct, score, total, ts: Date.now() };
      ss.setItem(key, JSON.stringify(next));
      return next;
    }
    return prev;
  } catch {
    return null;
  }
}

export function getBestScore(gameId) {
  if (!gameId) return null;
  const ss = safeSession();
  if (!ss) return null;
  try {
    const raw = ss.getItem(BEST_SCORE_PREFIX + gameId);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.pct !== "number") return null;
    return parsed;
  } catch {
    return null;
  }
}

/* ──────────────────────────────────────────────────────────────
   Accessibility helpers
────────────────────────────────────────────────────────────── */
export function getFlipCardAriaLabel(game, flipped) {
  if (!game) return "";
  const state = flipped
    ? "Showing details. Activate to flip back, or use the Play button."
    : "Activate to see details and the Play button.";
  return `${game.title}. ${state}`;
}

/* ──────────────────────────────────────────────────────────────
   Lightweight haptic helper.
   Wrapped so we can centrally honour reduced-motion / saved-data.
────────────────────────────────────────────────────────────── */
export function haptic(pattern) {
  if (typeof window === "undefined" || typeof navigator === "undefined") return;
  try {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    // Save-Data hint — respect users on metered/slow connections.
    if (navigator.connection?.saveData) return;
    navigator.vibrate?.(pattern);
  } catch {
    // ignore; vibrate is best-effort
  }
}

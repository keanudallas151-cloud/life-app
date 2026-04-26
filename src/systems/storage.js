// ── Batched-write queue ──────────────────────────────────────────────────────
// Instead of calling localStorage.setItem synchronously on every LS.set call,
// we queue writes and flush them together in the next microtask (Promise.resolve).
// This coalesces multiple back-to-back LS.set() calls that happen within the same
// synchronous frame (e.g. saving page + quiz preset on navigation) into a single
// flush pass, avoiding redundant serialisation + I/O work.
//
// NOTE: reads (LS.get) are still synchronous — they bypass the queue so they
// always reflect the latest intended value, not the flushed value.
const _writeQueue = new Map();
let _flushScheduled = false;

function _scheduleFlush() {
  if (_flushScheduled) return;
  _flushScheduled = true;
  Promise.resolve().then(() => {
    _flushScheduled = false;
    _writeQueue.forEach((v, k) => {
      try {
        localStorage.setItem(k, JSON.stringify(v));
      } catch {
        /* quota / private mode — silently drop */
      }
    });
    _writeQueue.clear();
  });
}

export const LS = {
  get: (k, d) => {
    // If there is a pending queued write for this key, return that value
    // directly so reads always see the latest intended data.
    if (_writeQueue.has(k)) return _writeQueue.get(k);
    try {
      const v = localStorage.getItem(k);
      return v ? JSON.parse(v) : d;
    } catch {
      return d;
    }
  },
  set: (k, v) => {
    _writeQueue.set(k, v);
    _scheduleFlush();
  },
  del: (k) => {
    _writeQueue.delete(k);
    try { localStorage.removeItem(k); } catch { /* ignore */ }
  },
};

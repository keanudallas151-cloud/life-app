import { useEffect, useState } from "react";

/**
 * Returns a debounced copy of `value` that only updates after `delay` ms of
 * inactivity. Use this for cases where you need to delay a side-effect or API
 * call by a fixed wall-clock interval (e.g. auto-save, network search).
 *
 * NOTE: For purely in-render computations (filtering/sorting a useMemo) prefer
 * React's built-in `useDeferredValue` hook instead — it cooperates with the
 * React scheduler and avoids timers. `useDebounce` is appropriate when you
 * need a guaranteed delay independent of scheduler scheduling (e.g. triggering
 * a Firestore query, posting analytics, etc.).
 *
 * @template T
 * @param {T} value  - The value to debounce.
 * @param {number} delay - Debounce delay in milliseconds (default 250).
 * @returns {T}
 */
export function useDebounce(value, delay = 250) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}

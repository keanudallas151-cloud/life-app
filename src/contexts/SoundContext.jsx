/**
 * SoundContext — provides the `play` function to all components in the tree,
 * including AuthContext mutations, without needing a ref-bridge.
 *
 * Usage:
 *   1. Wrap the app root with <SoundProvider settings={soundSettings} />
 *   2. Any component or context can call usePlaySound() to get `play`.
 *
 * This replaces the _setPlay ref-bridge pattern that was previously used
 * to wire the play function from App.jsx into AuthContext.
 */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
} from "react";

const SoundContext = createContext(null);

/**
 * Returns the `play(type)` function from the nearest SoundProvider.
 * Returns a no-op if called outside a SoundProvider (safe default).
 */
export function usePlaySound() {
  const ctx = useContext(SoundContext);
  // Stable no-op fallback so callers don't need null-checks.
  const noop = useCallback(() => {}, []);
  return ctx ?? noop;
}

/**
 * Internal ref-based registry: lets contexts that are created before the
 * SoundProvider mounts (e.g. AuthContext) still call play() once it is ready.
 *
 * The registry is a module-level ref so it is shared across all providers in
 * the same page. In practice there is exactly one SoundProvider per app.
 */
const _globalPlayRef = { current: () => {} };

/**
 * Call this from any context that needs sound before SoundProvider exists.
 * Equivalent to the old _setPlay ref-bridge but without the manual wiring.
 */
export function callGlobalPlay(type) {
  _globalPlayRef.current(type);
}

/**
 * SoundProvider — must wrap any part of the tree that calls usePlaySound()
 * or that contains contexts needing sound feedback.
 *
 * Props:
 *   play  — the `play` function from useSound() in the parent component.
 *           Pass this down from wherever useSound() is called.
 */
export function SoundProvider({ play, children }) {
  // Keep the global ref in sync with the current play function so that
  // contexts that called callGlobalPlay() before mount now work correctly.
  const stablePlay = useRef(play);
  stablePlay.current = play;

  const stableCallPlay = useCallback((type) => {
    stablePlay.current?.(type);
  }, []);

  // Update the module-level registry whenever the stable reference changes.
  _globalPlayRef.current = stableCallPlay;

  const value = useMemo(() => stableCallPlay, [stableCallPlay]);

  return (
    <SoundContext.Provider value={value}>{children}</SoundContext.Provider>
  );
}

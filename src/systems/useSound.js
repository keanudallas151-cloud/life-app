import { useRef, useCallback, useEffect } from "react";

// ═══════════════════════════════════════════════════════════════════════════
// SOUND SYSTEM
// ═══════════════════════════════════════════════════════════════════════════
// This module handles all app sounds. Two kinds of sounds exist:
//   1) MP3 clips (page-turns, home, topic selects) — preloaded on mount.
//   2) Procedural chimes (nav forward/back variations) — synthesised at
//      call-time from Web Audio oscillators. Cheap (zero-latency),
//      zero-network, zero-decode. Perfect for UI taps.
//
// PERFORMANCE: The old implementation fired `warmSounds()` on every play()
// call AND had a duplicate <Audio> element path that played on top of the
// decoded buffer — causing double-triggers and first-tap lag. Both are
// fixed here.
// ═══════════════════════════════════════════════════════════════════════════

const S = {
  deep: "/sounds/topic_select.mp3",
  mid: "/sounds/drop_down_category.mp3",
  high: "/sounds/category_selection.mp3",
  home: "/sounds/home_sound.mp3",
  next_page: "/sounds/next_page.mp3",
  previous_page: "/sounds/previous_page.mp3",
};

const VOL = 0.27;

const TYPE_COOLDOWN_MS = {
  tap: 60,
  ok: 80,
  open: 110,
  back: 110,
  nav_forward: 70,
  nav_back: 70,
  pageturn: 120,
  pageturn_next: 120,
  pageturn_prev: 120,
  star: 130,
  err: 170,
  wrong: 170,
  correct: 120,
  home: 180,
};

const SOUND_MODE_DENSITY = {
  focused: 0.16,
  balanced: 0.42,
  full: 0.76,
};

const SOUND_MODE_GLOBAL_GAP_MS = {
  focused: 180,
  balanced: 115,
  full: 80,
};

const SCOPE_BLOCKED = {
  focused: new Set(["tap", "ok"]),
  balanced: new Set(),
  full: new Set(),
};

// ─── PROCEDURAL NAV CHIMES ────────────────────────────────────────────────
// Six tasteful variants: 3 "forward/enter" + 3 "back/exit".
// Forward chimes ascend; back chimes descend. Each variant is deterministic
// — given the same inputs, it always produces the same chime. We rotate
// through the 3 variants per direction in round-robin order so the user
// hears variety but never surprise.
//
// The palette is a soft pentatonic (C–D–E–G–A) — warm, neutral, never feels
// out of place. Short envelopes (<140ms) keep them unobtrusive.

const NAV_FORWARD_VARIANTS = [
  // Variant 1: gentle two-note rise (C5 → E5)
  { notes: [523.25, 659.25], times: [0, 0.05], dur: 0.11, wave: "sine",     detune: 0,  peak: 0.065 },
  // Variant 2: single soft bloom (D5) with slight upward pitch slide
  { notes: [587.33],         times: [0],       dur: 0.12, wave: "triangle", detune: 30, peak: 0.062 },
  // Variant 3: quick three-step pluck (A4 → C5 → E5)
  { notes: [440, 523.25, 659.25], times: [0, 0.035, 0.07], dur: 0.1, wave: "sine", detune: 0, peak: 0.055 },
];

const NAV_BACK_VARIANTS = [
  // Variant 1: gentle two-note fall (E5 → C5)
  { notes: [659.25, 523.25], times: [0, 0.05], dur: 0.11, wave: "sine",     detune: 0,  peak: 0.06 },
  // Variant 2: soft single tone with downward slide
  { notes: [523.25],         times: [0],       dur: 0.14, wave: "triangle", detune: -25, peak: 0.058 },
  // Variant 3: descending three-step (E5 → C5 → A4)
  { notes: [659.25, 523.25, 440], times: [0, 0.035, 0.07], dur: 0.1, wave: "sine", detune: 0, peak: 0.052 },
];

// ─────────────────────────────────────────────────────────────────────────

export function useSound(settings = {}) {
  const ctx = useRef(null);
  const cache = useRef({});
  const lastTypeAt = useRef({});
  const lastSrc = useRef("");
  const warmed = useRef(false);
  // Round-robin counters per direction — ensures variation without randomness.
  const fwdIdx = useRef(0);
  const backIdx = useRef(0);

  const { enabled = true, volume = 100, mode = "balanced", scope = "balanced" } = settings;

  const normalizedMode = SOUND_MODE_DENSITY[mode] ? mode : "balanced";
  const normalizedScope = SCOPE_BLOCKED[scope] ? scope : "balanced";

  // ─── AUDIO CONTEXT ─────────────────────────────────────────────────────
  const getAC = () => {
    if (!ctx.current) {
      try {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        ctx.current = new Ctx({ latencyHint: "interactive" });
      } catch {
        return null;
      }
    }
    // Resume if suspended (iOS autoplay policy) — cheap if already running.
    if (ctx.current && ctx.current.state === "suspended" && typeof ctx.current.resume === "function") {
      ctx.current.resume().catch(() => {});
    }
    return ctx.current;
  };

  // ─── MP3 PLAYBACK (cache-first, no double-play) ────────────────────────
  const playMP3 = useCallback((src, volumeLevel = VOL, opts = {}) => {
    try {
      const ac = getAC();
      if (!ac) return false;
      const { detuneSpread = 0, rateSpread = 0 } = opts;

      const fire = (buf) => {
        const source = ac.createBufferSource();
        const gain = ac.createGain();
        if (detuneSpread) source.detune.value = (Math.random() * 2 - 1) * detuneSpread;
        if (rateSpread) source.playbackRate.value = 1 + (Math.random() * 2 - 1) * rateSpread;
        gain.gain.value = volumeLevel;
        source.buffer = buf;
        source.connect(gain);
        gain.connect(ac.destination);
        source.start();
      };

      lastSrc.current = src;

      // Cache hit — immediate playback, no network, no decode.
      if (cache.current[src]) {
        fire(cache.current[src]);
        return true;
      }

      // Cache miss — decode into cache, no fallback element (which was
      // causing double-triggers before).
      fetch(src)
        .then((r) => r.arrayBuffer())
        .then((buf) => ac.decodeAudioData(buf))
        .then((decoded) => {
          cache.current[src] = decoded;
          // Play once decoded so user still hears the first tap.
          fire(decoded);
        })
        .catch(() => {});

      return true;
    } catch {
      return false;
    }
  }, []);

  // ─── PROCEDURAL CHIME (zero-latency) ───────────────────────────────────
  const playChime = useCallback((variant, master = 1) => {
    try {
      const ac = getAC();
      if (!ac) return;
      const { notes, times, dur, wave, detune, peak } = variant;

      notes.forEach((freq, i) => {
        const startOffset = times[i] ?? 0;
        const start = ac.currentTime + startOffset;

        const osc = ac.createOscillator();
        const gain = ac.createGain();
        osc.type = wave;
        osc.frequency.setValueAtTime(freq, start);
        if (detune) osc.detune.linearRampToValueAtTime(detune, start + dur);

        // Snappy attack + smooth exponential release — plucked feel.
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(peak * master, start + 0.008);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);

        osc.connect(gain);
        gain.connect(ac.destination);
        osc.start(start);
        osc.stop(start + dur + 0.02);
      });
    } catch {
      /* fail silent */
    }
  }, []);

  // ─── PRELOAD (once, on mount) ──────────────────────────────────────────
  // Fetches+decodes all MP3s into the cache. After this, every MP3 play
  // is zero-latency. Only runs once per component mount.
  const preloadAll = useCallback(() => {
    if (warmed.current) return;
    warmed.current = true;

    const ac = getAC();
    if (!ac) return;

    Object.values(S).forEach((src) => {
      if (cache.current[src]) return;
      fetch(src)
        .then((r) => r.arrayBuffer())
        .then((buf) => ac.decodeAudioData(buf))
        .then((decoded) => {
          cache.current[src] = decoded;
        })
        .catch(() => {});
    });
  }, []);

  // Preload once per mount. On iOS the AudioContext stays suspended until
  // a user gesture — a one-time listener resumes it.
  useEffect(() => {
    preloadAll();

    const kick = () => {
      const ac = getAC();
      if (ac && ac.state === "suspended") ac.resume().catch(() => {});
    };
    window.addEventListener("pointerdown", kick, { once: true, passive: true });
    window.addEventListener("touchstart", kick, { once: true, passive: true });
    window.addEventListener("keydown", kick, { once: true, passive: true });
    return () => {
      window.removeEventListener("pointerdown", kick);
      window.removeEventListener("touchstart", kick);
      window.removeEventListener("keydown", kick);
    };
  }, [preloadAll]);

  // ─── PLAY (public API) ─────────────────────────────────────────────────
  const play = useCallback(
    (type) => {
      try {
        // ──── fast-path rate limit ────
        const now = typeof performance !== "undefined" && performance.now ? performance.now() : Date.now();
        const prevAt = lastTypeAt.current[type] || 0;
        const cooldown = TYPE_COOLDOWN_MS[type] || 90;
        if (now - prevAt < cooldown) return;

        const prevAny = lastTypeAt.current.__any || 0;
        const modeDensity = SOUND_MODE_DENSITY[normalizedMode];
        const globalGap = SOUND_MODE_GLOBAL_GAP_MS[normalizedMode];
        const isLightType = type === "tap" || type === "ok";
        if (isLightType && now - prevAny < globalGap) return;

        if (!enabled) return;
        const master = Math.max(0, Math.min(1, Number(volume) / 100));
        if (master <= 0) return;
        if (SCOPE_BLOCKED[normalizedScope].has(type)) return;

        const idleWindow = now - prevAny > 1400;

        if (type === "tap" && !idleWindow && Math.random() > modeDensity) return;
        if (type === "ok" && normalizedScope === "balanced" && !idleWindow && Math.random() > modeDensity * 0.75) return;

        lastTypeAt.current[type] = now;
        lastTypeAt.current.__any = now;

        // ──── MP3 effects (home / page-turns) ────

        if (type === "home") {
          playMP3(S.home, 0.82 * master, { detuneSpread: 8, rateSpread: 0.01 });
          return;
        }

        if (type === "pageturn_next") {
          playMP3(S.next_page, 0.32 * master, { detuneSpread: 6, rateSpread: 0.01 });
          return;
        }

        if (type === "pageturn_prev") {
          playMP3(S.previous_page, 0.28 * master, { detuneSpread: 6, rateSpread: 0.01 });
          return;
        }

        if (type === "pageturn") {
          playMP3(S.next_page, 0.28 * master, { detuneSpread: 8, rateSpread: 0.012 });
          return;
        }

        // ──── NAV CHIMES — 6 VARIATIONS (deterministic round-robin) ────
        // Forward chimes (ascending): entering a page, tapping into
        //   something, opening, signing in.
        // Back chimes (descending): leaving a page, dismissing, going back,
        //   signing out.
        //
        // Round-robin (not random) means the user hears variation that
        // feels curated rather than chaotic.

        if (type === "nav_forward" || type === "open" || type === "tap") {
          const variant = NAV_FORWARD_VARIANTS[fwdIdx.current % NAV_FORWARD_VARIANTS.length];
          fwdIdx.current++;
          playChime(variant, master);
          return;
        }

        if (type === "nav_back" || type === "back") {
          const variant = NAV_BACK_VARIANTS[backIdx.current % NAV_BACK_VARIANTS.length];
          backIdx.current++;
          playChime(variant, master);
          return;
        }

        if (type === "ok") {
          // "ok" = soft confirm — use forward palette but quieter.
          const variant = NAV_FORWARD_VARIANTS[fwdIdx.current % NAV_FORWARD_VARIANTS.length];
          fwdIdx.current++;
          playChime({ ...variant, peak: variant.peak * 0.7 }, master);
          return;
        }

        if (type === "star") {
          // "star" = bookmark / save — the bloom variant with upward bend.
          playChime(NAV_FORWARD_VARIANTS[1], master);
          return;
        }

        // ──── Quiz/feedback tones (err / correct / wrong) ────
        const ac = getAC();
        if (!ac) return;
        const v = VOL * master;

        if (type === "correct") {
          [0, 0.08].forEach((t, i) => {
            const o = ac.createOscillator();
            const g = ac.createGain();
            o.connect(g);
            g.connect(ac.destination);
            o.frequency.setValueAtTime([520, 660][i], ac.currentTime + t);
            g.gain.setValueAtTime(0.08 * v, ac.currentTime + t);
            g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + t + 0.18);
            o.start(ac.currentTime + t);
            o.stop(ac.currentTime + t + 0.2);
          });
          return;
        }

        if (type === "wrong") {
          const o = ac.createOscillator();
          const g = ac.createGain();
          o.connect(g);
          g.connect(ac.destination);
          o.type = "triangle";
          o.frequency.setValueAtTime(250, ac.currentTime);
          o.frequency.exponentialRampToValueAtTime(170, ac.currentTime + 0.22);
          g.gain.setValueAtTime(0.05 * v, ac.currentTime);
          g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.25);
          o.start();
          o.stop(ac.currentTime + 0.25);
          return;
        }

        if (type === "err") {
          [0, 0.11].forEach((t, i) => {
            const o = ac.createOscillator();
            const g = ac.createGain();
            o.connect(g);
            g.connect(ac.destination);
            o.type = "triangle";
            o.frequency.setValueAtTime(i === 0 ? 230 : 190, ac.currentTime + t);
            g.gain.setValueAtTime(0.04 * v, ac.currentTime + t);
            g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + t + 0.16);
            o.start(ac.currentTime + t);
            o.stop(ac.currentTime + t + 0.17);
          });
        }
      } catch {
        /* fail silent */
      }
    },
    [enabled, normalizedMode, normalizedScope, playMP3, playChime, volume]
  );

  return play;
}

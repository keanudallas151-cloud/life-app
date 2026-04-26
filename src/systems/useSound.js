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
  tap_soft: 60,
  tap_firm: 70,
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
  // ─── iOS-style palette (Phase: sound variety) ─────────────────────
  toggle_on: 90,
  toggle_off: 90,
  sheet_open: 140,
  sheet_close: 140,
  select: 70,
  deselect: 70,
  success: 240,
  warn: 240,
  destructive: 240,
  refresh: 160,
  swipe: 90,
  send: 200,
  receive: 220,
  long_press: 180,
  submit: 200,
  unlock: 200,
  lock: 200,
  notif: 280,
  primary: 110,
  secondary: 90,
  home_return: 220,
  lobby_enter: 240,
  tritone: 300,
  // ─── Arcade / game sounds ─────────────────────────────────────
  game_start:   500,
  coin:         100,
  powerup:      300,
  level_up:     500,
  game_over:    500,
  streak_2:     150,
  streak_3:     200,
  streak_5:     300,
  timer_tick:   850,
  timer_low:    800,
  timer_out:    400,
  key_press:     30,
  word_correct: 150,
  word_wrong:   150,
  match_found:  150,
  round_clear:  300,
  hint_used:    200,
  ladder_step:  150,
  ladder_done:  500,
  sentence_ok:  120,
  game_tap:      40,
  back_game:    200,
  build_word:    80,
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

// ─── iOS-STYLE EXTENDED PALETTE ──────────────────────────────────────────
// Each type is a small chime variant (same shape the existing `playChime`
// understands) or a short noise burst for toggle-clicks/whooshes. Keeping
// everything procedural means zero network, zero assets, zero licensing.
// Tunings lean on the soft pentatonic (C/D/E/G/A) and short envelopes
// (<160 ms) so taps never feel heavy or "game-y".

// Rows 1–3: toggle / select — tiny tinted clicks.
const V_TOGGLE_ON   = { notes: [880],            times: [0],           dur: 0.07, wave: "triangle", detune: 40,  peak: 0.05 };
const V_TOGGLE_OFF  = { notes: [660],            times: [0],           dur: 0.07, wave: "triangle", detune: -40, peak: 0.05 };
const V_SELECT      = { notes: [1046.5],         times: [0],           dur: 0.05, wave: "sine",     detune: 0,   peak: 0.045 };
const V_DESELECT    = { notes: [784],            times: [0],           dur: 0.05, wave: "sine",     detune: 0,   peak: 0.04  };

// Sheet / modal — quick glide up or down.
const V_SHEET_OPEN  = { notes: [523.25, 784],    times: [0, 0.04],     dur: 0.14, wave: "sine",     detune: 20,  peak: 0.06 };
const V_SHEET_CLOSE = { notes: [784, 523.25],    times: [0, 0.04],     dur: 0.14, wave: "sine",     detune: -20, peak: 0.055 };

// Feedback — success bloom, soft warn, destructive thud.
const V_SUCCESS     = { notes: [659.25, 880, 1046.5], times: [0, 0.06, 0.12], dur: 0.14, wave: "sine",     detune: 0,  peak: 0.07 };
const V_WARN        = { notes: [440, 392],       times: [0, 0.07],     dur: 0.14, wave: "triangle", detune: 0,   peak: 0.06 };
const V_DESTRUCTIVE = { notes: [196, 165],       times: [0, 0.08],     dur: 0.18, wave: "triangle", detune: -40, peak: 0.065 };

// Flow — refresh tick, swipe glide, submit punch.
const V_REFRESH     = { notes: [698.46, 880],    times: [0, 0.03],     dur: 0.09, wave: "sine",     detune: 0,   peak: 0.05 };
const V_SWIPE       = { notes: [523.25, 587.33], times: [0, 0.04],     dur: 0.09, wave: "sine",     detune: 0,   peak: 0.045 };
const V_SUBMIT      = { notes: [587.33, 880],    times: [0, 0.05],     dur: 0.12, wave: "sine",     detune: 10,  peak: 0.065 };
const V_PRIMARY     = { notes: [587.33, 740],    times: [0, 0.04],     dur: 0.1,  wave: "sine",     detune: 0,   peak: 0.06 };
const V_SECONDARY   = { notes: [523.25],         times: [0],           dur: 0.07, wave: "sine",     detune: 0,   peak: 0.05 };

// Messaging — send (rising puff), receive (gentle ping), tri-tone (3 notes).
const V_SEND        = { notes: [523.25, 880],    times: [0, 0.05],     dur: 0.13, wave: "triangle", detune: 30,  peak: 0.06 };
const V_RECEIVE     = { notes: [880, 1174.66],   times: [0, 0.05],     dur: 0.13, wave: "sine",     detune: 0,   peak: 0.058 };
const V_TRITONE     = { notes: [659.25, 830.61, 1046.5], times: [0, 0.08, 0.16], dur: 0.14, wave: "sine", detune: 0, peak: 0.065 };
const V_NOTIF       = { notes: [1046.5, 1318.51], times: [0, 0.09],    dur: 0.16, wave: "sine",     detune: 0,   peak: 0.06 };

// Lock/unlock/long-press — low-register thunks and chirps.
const V_LOCK        = { notes: [261.63, 196],    times: [0, 0.05],     dur: 0.14, wave: "triangle", detune: -20, peak: 0.06 };
const V_UNLOCK      = { notes: [196, 261.63, 329.63], times: [0, 0.04, 0.08], dur: 0.13, wave: "sine", detune: 0, peak: 0.06 };
const V_LONG_PRESS  = { notes: [349.23, 392],    times: [0, 0.06],     dur: 0.16, wave: "triangle", detune: 0,   peak: 0.055 };

// Home-return — a warm, grounding four-note descent. Distinct from the
// generic back-chime so "returning to the lobby" always feels unique.
const V_HOME_RETURN = { notes: [783.99, 659.25, 523.25, 392], times: [0, 0.045, 0.09, 0.14], dur: 0.12, wave: "sine", detune: 0, peak: 0.065 };

// Lobby-enter — bright pentatonic climb, used when arriving at the home
// surface from an auth/landing/onboarding flow. Distinct from nav-forward.
const V_LOBBY_ENTER = { notes: [440, 523.25, 659.25, 880], times: [0, 0.04, 0.08, 0.14], dur: 0.14, wave: "sine", detune: 0, peak: 0.07 };

// Light/firm tap variants — pair with the existing "tap" which maps to
// the nav-forward chime. These give rows/buttons genuinely distinct feel.
const V_TAP_SOFT    = { notes: [1046.5],         times: [0],           dur: 0.05, wave: "sine",     detune: 0,   peak: 0.04 };
const V_TAP_FIRM    = { notes: [659.25, 880],    times: [0, 0.03],     dur: 0.09, wave: "sine",     detune: 0,   peak: 0.06 };

// ─── ARCADE / 90s GAME PALETTE ────────────────────────────────────────────
// Square-wave ("square") gives that classic chiptune crunch.
// Short envelopes + higher frequencies = punchy retro feel.
// All peaks kept low so they blend with existing app sounds at similar volume.

// Enter a game — ascending 4-note fanfare (C5→E5→G5→C6)
const V_GAME_START   = { notes: [523.25, 659.25, 783.99, 1046.5], times: [0, 0.055, 0.11, 0.17], dur: 0.10, wave: "square", detune: 0,   peak: 0.055 };
// Classic coin pickup (E5→B5, short)
const V_COIN         = { notes: [659.25, 987.77], times: [0, 0.07], dur: 0.08, wave: "square", detune: 0,   peak: 0.055 };
// Power-up: rising arpeggio (C4→E4→G4→C5→E5)
const V_POWERUP      = { notes: [261.63, 329.63, 392, 523.25, 659.25], times: [0, 0.04, 0.08, 0.12, 0.16], dur: 0.07, wave: "square", detune: 0, peak: 0.05 };
// Level-up fanfare (C5→E5→G5→C5→E5→C6)
const V_LEVEL_UP     = { notes: [523.25, 659.25, 783.99, 523.25, 659.25, 1046.5], times: [0, 0.06, 0.12, 0.20, 0.26, 0.32], dur: 0.10, wave: "square", detune: 0, peak: 0.055 };
// Game over: descending sad (G4→E4→C4→G3)
const V_GAME_OVER    = { notes: [392, 329.63, 261.63, 196], times: [0, 0.09, 0.18, 0.28], dur: 0.13, wave: "triangle", detune: -20, peak: 0.055 };
// Streak 2 — double ping
const V_STREAK_2     = { notes: [880, 1046.5], times: [0, 0.07], dur: 0.07, wave: "square", detune: 0, peak: 0.05 };
// Streak 3 — triple ascending ping
const V_STREAK_3     = { notes: [880, 1046.5, 1318.51], times: [0, 0.055, 0.11], dur: 0.07, wave: "square", detune: 0, peak: 0.055 };
// Streak 5 — achievement fanfare
const V_STREAK_5     = { notes: [523.25, 659.25, 880, 1046.5, 1318.51], times: [0, 0.04, 0.08, 0.12, 0.16], dur: 0.09, wave: "square", detune: 0, peak: 0.055 };
// Timer tick — subtle metronome click (fires once/sec in danger zone)
const V_TIMER_TICK   = { notes: [440],     times: [0], dur: 0.03, wave: "square", detune: 0,   peak: 0.030 };
// Timer low — urgent warning beep
const V_TIMER_LOW    = { notes: [880],     times: [0], dur: 0.05, wave: "square", detune: 0,   peak: 0.040 };
// Timer out — error buzzer (descending square)
const V_TIMER_OUT    = { notes: [262, 196], times: [0, 0.09], dur: 0.14, wave: "square", detune: -30, peak: 0.055 };
// Key press — 8-bit keyboard click (very short, high)
const V_KEY_PRESS    = { notes: [1046.5], times: [0], dur: 0.04, wave: "square", detune: 0, peak: 0.032 };
// Word correct — 3-note ascending confirm
const V_WORD_CORRECT = { notes: [523.25, 659.25, 880], times: [0, 0.07, 0.14], dur: 0.09, wave: "square", detune: 0, peak: 0.055 };
// Word wrong — descending wah (triangle for softer feel)
const V_WORD_WRONG   = { notes: [349.23, 261.63], times: [0, 0.09], dur: 0.15, wave: "triangle", detune: -50, peak: 0.055 };
// Match found — quick 3-note sparkle
const V_MATCH_FOUND  = { notes: [659.25, 880, 1046.5], times: [0, 0.055, 0.11], dur: 0.08, wave: "square", detune: 0, peak: 0.05 };
// Round clear — 5-note ascending celebration
const V_ROUND_CLEAR  = { notes: [523.25, 659.25, 784, 880, 1046.5], times: [0, 0.04, 0.08, 0.12, 0.16], dur: 0.09, wave: "square", detune: 0, peak: 0.055 };
// Hint used — soft descending whoosh
const V_HINT_USED    = { notes: [880, 659.25, 523.25], times: [0, 0.045, 0.09], dur: 0.10, wave: "triangle", detune: -25, peak: 0.050 };
// Ladder step — 2-note step up
const V_LADDER_STEP  = { notes: [523.25, 659.25], times: [0, 0.065], dur: 0.08, wave: "square", detune: 0, peak: 0.05 };
// Ladder done — full 6-note ascending completion
const V_LADDER_DONE  = { notes: [523.25, 659.25, 880, 1046.5, 1318.51, 1568], times: [0, 0.05, 0.10, 0.15, 0.20, 0.25], dur: 0.10, wave: "square", detune: 0, peak: 0.055 };
// Sentence ok — placed word confirmation
const V_SENTENCE_OK  = { notes: [784, 1046.5], times: [0, 0.055], dur: 0.07, wave: "square", detune: 0, peak: 0.050 };
// Game tap — punchy 8-bit button press
const V_GAME_TAP     = { notes: [783.99], times: [0], dur: 0.04, wave: "square", detune: 0, peak: 0.038 };
// Back from game — short descending exit
const V_BACK_GAME    = { notes: [523.25, 392], times: [0, 0.065], dur: 0.09, wave: "sine", detune: -15, peak: 0.055 };
// Build word — submit/confirm chime
const V_BUILD_WORD   = { notes: [880, 1046.5], times: [0, 0.045], dur: 0.07, wave: "square", detune: 0, peak: 0.045 };

const EXTRA_VARIANTS = {
  toggle_on: V_TOGGLE_ON,
  toggle_off: V_TOGGLE_OFF,
  select: V_SELECT,
  deselect: V_DESELECT,
  sheet_open: V_SHEET_OPEN,
  sheet_close: V_SHEET_CLOSE,
  success: V_SUCCESS,
  warn: V_WARN,
  destructive: V_DESTRUCTIVE,
  refresh: V_REFRESH,
  swipe: V_SWIPE,
  submit: V_SUBMIT,
  primary: V_PRIMARY,
  secondary: V_SECONDARY,
  send: V_SEND,
  receive: V_RECEIVE,
  tritone: V_TRITONE,
  notif: V_NOTIF,
  lock: V_LOCK,
  unlock: V_UNLOCK,
  long_press: V_LONG_PRESS,
  tap_soft: V_TAP_SOFT,
  tap_firm: V_TAP_FIRM,
  home_return: V_HOME_RETURN,
  lobby_enter: V_LOBBY_ENTER,
  // ─── Arcade palette ─────────────────────────────────────────────────
  game_start:   V_GAME_START,
  coin:         V_COIN,
  powerup:      V_POWERUP,
  level_up:     V_LEVEL_UP,
  game_over:    V_GAME_OVER,
  streak_2:     V_STREAK_2,
  streak_3:     V_STREAK_3,
  streak_5:     V_STREAK_5,
  timer_tick:   V_TIMER_TICK,
  timer_low:    V_TIMER_LOW,
  timer_out:    V_TIMER_OUT,
  key_press:    V_KEY_PRESS,
  word_correct: V_WORD_CORRECT,
  word_wrong:   V_WORD_WRONG,
  match_found:  V_MATCH_FOUND,
  round_clear:  V_ROUND_CLEAR,
  hint_used:    V_HINT_USED,
  ladder_step:  V_LADDER_STEP,
  ladder_done:  V_LADDER_DONE,
  sentence_ok:  V_SENTENCE_OK,
  game_tap:     V_GAME_TAP,
  back_game:    V_BACK_GAME,
  build_word:   V_BUILD_WORD,
};

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
      // Close AudioContext to prevent memory leak
      if (ctx.current) {
        ctx.current.close().catch(() => {});
        ctx.current = null;
      }
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

        // ──── iOS-STYLE EXTENDED PALETTE ────
        // Direct 1:1 variant mapping — each type gets its own distinct
        // chime so a toggle feels different from a sheet open, a success
        // from a primary-button submit, etc. "Not overdoing it" is
        // preserved via per-type cooldowns + master volume.
        if (EXTRA_VARIANTS[type]) {
          playChime(EXTRA_VARIANTS[type], master);
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

// ═══════════════════════════════════════════════════════════════════════════
// GLOBAL [data-sound] DELEGATION
// ═══════════════════════════════════════════════════════════════════════════
// Mounts ONE document-level click listener that fires play(el.dataset.sound)
// for any ancestor of the tapped element that has data-sound set. This is
// the "cover every button cheaply" layer: contributors can add variety to a
// button by dropping `data-sound="toggle_on"` on it, without needing a
// handler or the play() reference in scope.
//
// Rules:
//   • Runs in the capture phase so it fires even if the inner handler
//     stops propagation.
//   • Silently no-ops if `disabled`, `aria-disabled="true"`, or
//     `data-sound="none"`.
//   • Uses closest("[data-sound]") so the attribute can sit on the
//     wrapping <button> even when the click target is a child <svg>.
// ═══════════════════════════════════════════════════════════════════════════

export function useSoundDelegation(play) {
  useEffect(() => {
    if (typeof document === "undefined" || typeof play !== "function") return;
    const onPointer = (e) => {
      try {
        const root = e.target;
        if (!root || typeof root.closest !== "function") return;
        const el = root.closest("[data-sound]");
        if (!el) return;
        if (el.disabled) return;
        if (el.getAttribute("aria-disabled") === "true") return;
        const name = el.getAttribute("data-sound");
        if (!name || name === "none") return;
        play(name);
      } catch {
        /* fail silent — UI sound must never crash the app */
      }
    };
    // `pointerdown` so the feedback fires on press, matching iOS feel.
    document.addEventListener("pointerdown", onPointer, { capture: true, passive: true });
    return () => document.removeEventListener("pointerdown", onPointer, { capture: true });
  }, [play]);
}

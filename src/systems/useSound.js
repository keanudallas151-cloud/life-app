import { useRef, useCallback, useEffect } from "react";

const S = {
  deep: "/sounds/topic_select.mp3",
  mid: "/sounds/drop_down_category.mp3",
  high: "/sounds/category_selection.mp3",
  home: "/sounds/home_sound.mp3",
};

const VOL = 0.27;

const TYPE_COOLDOWN_MS = {
  tap: 70,
  ok: 90,
  open: 120,
  back: 120,
  pageturn: 120,
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

export function useSound(settings = {}) {
  const ctx = useRef(null);
  const cache = useRef({});
  const lastTypeAt = useRef({});
  const lastSrc = useRef("");
  const warming = useRef(false);
  const { enabled = true, volume = 100, mode = "balanced", scope = "balanced" } = settings;

  const normalizedMode = SOUND_MODE_DENSITY[mode] ? mode : "balanced";
  const normalizedScope = SCOPE_BLOCKED[scope] ? scope : "balanced";

  const getAC = () => {
    if (!ctx.current) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      ctx.current = new Ctx({ latencyHint: "interactive" });
    }
    return ctx.current;
  };

  const chooseSrc = useCallback((pool) => {
    if (!Array.isArray(pool) || pool.length === 0) return null;
    if (pool.length === 1) return pool[0];
    let pick = pool[Math.floor(Math.random() * pool.length)];
    if (pick === lastSrc.current) {
      pick = pool.find((p) => p !== lastSrc.current) || pick;
    }
    return pick;
  }, []);

  const playMP3 = useCallback((src, volumeLevel = VOL, opts = {}) => {
    try {
      const ac = getAC();
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

      if (cache.current[src]) {
        fire(cache.current[src]);
        return true;
      }

      try {
        const immediate = new Audio(src);
        immediate.volume = Math.max(0, Math.min(1, volumeLevel));
        immediate.play().catch(() => {
          /* autoplay policy */
        });
      } catch {
        /* Audio element fallback */
      }

      fetch(src)
        .then((r) => r.arrayBuffer())
        .then((buf) => ac.decodeAudioData(buf))
        .then((decoded) => {
          cache.current[src] = decoded;
        })
        .catch(() => {
          /* decode/network */
        });

      return true;
    } catch {
      return false;
    }
  }, []);

  const warmSounds = useCallback(() => {
    if (warming.current) return;
    warming.current = true;

    try {
      const ac = getAC();
      if (ac.state === "suspended" && typeof ac.resume === "function") {
        ac.resume().catch(() => {
          /* resume may fail before gesture */
        });
      }

      Object.values(S).forEach((src) => {
        if (cache.current[src]) return;
        fetch(src)
          .then((r) => r.arrayBuffer())
          .then((buf) => ac.decodeAudioData(buf))
          .then((decoded) => {
            cache.current[src] = decoded;
          })
          .catch(() => {
            /* prewarm fail */
          });
      });
    } catch {
      /* AudioContext fail */
    }
  }, []);

  useEffect(() => {
    const kick = () => warmSounds();
    window.addEventListener("pointerdown", kick, { once: true, passive: true });
    window.addEventListener("touchstart", kick, { once: true, passive: true });
    window.addEventListener("keydown", kick, { once: true, passive: true });
    return () => {
      window.removeEventListener("pointerdown", kick);
      window.removeEventListener("touchstart", kick);
      window.removeEventListener("keydown", kick);
    };
  }, [warmSounds]);

  const play = useCallback(
    (type) => {
      try {
        warmSounds();

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

        if (type === "home") {
          playMP3(S.home, 0.82 * master, { detuneSpread: 8, rateSpread: 0.01 });
          return;
        }

        if (type === "open") {
          const src = chooseSrc([S.deep, S.mid]);
          if (src) playMP3(src, 0.28 * master, { detuneSpread: 12, rateSpread: 0.02 });
          return;
        }

        if (type === "star") {
          const src = chooseSrc([S.deep, S.mid]);
          if (src) playMP3(src, 0.27 * master, { detuneSpread: 14, rateSpread: 0.015 });
          return;
        }

        if (type === "pageturn" || type === "back") {
          const src = chooseSrc([S.mid, S.high]);
          if (src) playMP3(src, 0.24 * master, { detuneSpread: 10, rateSpread: 0.015 });
          return;
        }

        if (type === "tap") {
          const src = chooseSrc([S.high, S.mid]);
          if (src) playMP3(src, 0.13 * master, { detuneSpread: 16, rateSpread: 0.018 });
          return;
        }

        if (type === "ok") {
          const src = chooseSrc([S.mid, S.high]);
          if (src) playMP3(src, 0.19 * master, { detuneSpread: 14, rateSpread: 0.018 });
          return;
        }

        const ac = getAC();
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
    [chooseSrc, enabled, normalizedMode, normalizedScope, playMP3, volume, warmSounds]
  );

  return play;
}

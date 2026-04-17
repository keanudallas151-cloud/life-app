import { useState, useRef, useEffect, useCallback } from "react";
import { C } from "../systems/theme";

/**
 * AudioPlayer — theme-aware MP3 player with HTML5 Audio.
 *
 * Props:
 *   title     — display title (required)
 *   mp3Url    — URL of the MP3 file. When null the player shows a "Coming soon" placeholder.
 *   duration  — fallback duration in seconds used when mp3Url is null (default 180)
 *   playSound — parent's sound callback (tap/back/open) for UI feedback
 *   t         — theme object (falls back to C)
 */
export function AudioPlayer({ title, mp3Url = null, duration: fallbackDuration = 180, playSound, t: theme }) {
  const t = theme || C;

  // ── refs ──
  const audioRef   = useRef(null);
  const intervalRef = useRef(null);

  // ── state ──
  const [playing,  setPlaying]  = useState(false);
  const [elapsed,  setElapsed]  = useState(0);
  const [duration, setDuration] = useState(fallbackDuration);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);

  const hasAudio = !!mp3Url;

  // ── create / destroy audio element ──
  useEffect(() => {
    if (!hasAudio) return;
    const audio = new Audio(mp3Url);
    audio.preload = "metadata";
    audioRef.current = audio;

    const onLoaded = () => {
      if (audio.duration && isFinite(audio.duration)) setDuration(Math.ceil(audio.duration));
      setLoading(false);
    };
    const onError  = () => { setError("Unable to load audio"); setLoading(false); };
    const onEnded  = () => { setPlaying(false); setElapsed(0); };

    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("error", onError);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.pause();
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("error", onError);
      audio.removeEventListener("ended", onEnded);
      audioRef.current = null;
    };
  }, [mp3Url, hasAudio]);

  // ── sync elapsed via requestAnimationFrame tick ──
  useEffect(() => {
    if (!playing || !hasAudio) return;
    let raf;
    const tick = () => {
      const a = audioRef.current;
      if (a) setElapsed(a.currentTime);
      raf = window.requestAnimationFrame(tick);
    };
    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [playing, hasAudio]);

  // ── fallback timer for placeholder mode ──
  useEffect(() => {
    if (hasAudio) return;
    if (playing) {
      intervalRef.current = setInterval(() => {
        setElapsed(e => {
          if (e >= duration) { clearInterval(intervalRef.current); setPlaying(false); return 0; }
          return e + 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [playing, hasAudio, duration]);

  // ── toggle play / pause ──
  const toggle = useCallback(() => {
    if (playSound) playSound(playing ? "back" : "open");

    if (hasAudio) {
      const a = audioRef.current;
      if (!a) return;
      if (playing) {
        a.pause();
        setPlaying(false);
      } else {
        setLoading(true);
        a.play().then(() => { setLoading(false); setPlaying(true); }).catch(() => { setLoading(false); setError("Playback failed"); });
      }
    } else {
      setPlaying(p => !p);
    }
  }, [playing, hasAudio, playSound]);

  // ── reset ──
  const reset = useCallback(() => {
    if (hasAudio && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    clearInterval(intervalRef.current);
    setPlaying(false);
    setElapsed(0);
  }, [hasAudio]);

  // ── seek ──
  const seek = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const time = Math.floor(pct * duration);
    setElapsed(time);
    if (hasAudio && audioRef.current) {
      audioRef.current.currentTime = time;
    }
  }, [duration, hasAudio]);

  // ── skip ±15s ──
  const skip = useCallback((delta) => {
    const next = Math.max(0, Math.min(duration, elapsed + delta));
    setElapsed(next);
    if (hasAudio && audioRef.current) audioRef.current.currentTime = next;
  }, [elapsed, duration, hasAudio]);

  // ── format helper ──
  const fmt = s => {
    const sec = Math.floor(Math.max(0, s));
    return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;
  };

  const pct = duration > 0 ? (elapsed / duration) * 100 : 0;

  return (
    <div
      data-page-tag="#audio_player"
      style={{
        marginTop: 40,
        padding: 24,
        background: t.white,
        border: `1px solid ${t.border}`,
        borderRadius: 16,
        fontFamily: "Georgia, serif",
      }}
    >
      {/* Header */}
      <p style={{ margin: "0 0 4px", fontSize: 10, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: t.muted }}>
        {hasAudio ? "Audio Narration" : "Audio Narration — Coming Soon"}
      </p>
      <p style={{ margin: "0 0 18px", fontSize: 14, fontWeight: 600, color: t.ink }}>{title}</p>

      {/* Error banner */}
      {error && (
        <p style={{ margin: "0 0 12px", fontSize: 12, color: t.red, fontStyle: "italic" }}>{error}</p>
      )}

      {/* Progress bar */}
      <div
        role="progressbar"
        aria-valuenow={Math.round(elapsed)}
        aria-valuemin={0}
        aria-valuemax={duration}
        onClick={seek}
        style={{ height: 6, background: t.light, borderRadius: 4, marginBottom: 8, cursor: "pointer", position: "relative" }}
      >
        <div style={{ height: "100%", width: `${pct}%`, background: t.green, borderRadius: 4, transition: playing ? "none" : "width 0.2s ease" }} />
        {/* Thumb */}
        <div style={{
          position: "absolute",
          top: -5,
          left: `calc(${pct}% - 8px)`,
          width: 16,
          height: 16,
          borderRadius: "50%",
          background: t.green,
          border: `2px solid ${t.white}`,
          boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
          pointerEvents: "none",
          opacity: playing || elapsed > 0 ? 1 : 0,
          transition: "opacity 0.2s",
        }} />
      </div>

      {/* Time labels */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <span style={{ fontSize: 11, color: t.muted, fontVariantNumeric: "tabular-nums" }}>{fmt(elapsed)}</span>
        <span style={{ fontSize: 11, color: t.muted, fontVariantNumeric: "tabular-nums" }}>{fmt(duration)}</span>
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "center" }}>
        {/* ‹‹ -15s */}
        <button
          onClick={() => skip(-15)}
          aria-label="Rewind 15 seconds"
          style={{
            width: 40, height: 40, borderRadius: "50%",
            background: t.light, border: `1px solid ${t.border}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", fontSize: 11, fontWeight: 700, color: t.mid,
          }}
        >
          -15
        </button>

        {/* Play/Pause */}
        <button
          onClick={toggle}
          disabled={loading}
          aria-label={playing ? "Pause audio narration" : "Play audio narration"}
          style={{
            flex: "0 0 auto",
            width: 56, height: 56, borderRadius: "50%",
            background: t.green,
            border: "none",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: loading ? "wait" : "pointer",
            boxShadow: "0 4px 14px rgba(74,140,92,0.3)",
          }}
        >
          {loading ? (
            <span style={{ fontSize: 18, color: "#fff" }}>⏳</span>
          ) : playing ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><polygon points="6,3 20,12 6,21" /></svg>
          )}
        </button>

        {/* ›› +15s */}
        <button
          onClick={() => skip(15)}
          aria-label="Forward 15 seconds"
          style={{
            width: 40, height: 40, borderRadius: "50%",
            background: t.light, border: `1px solid ${t.border}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", fontSize: 11, fontWeight: 700, color: t.mid,
          }}
        >
          +15
        </button>

        {/* Reset */}
        <button
          onClick={reset}
          aria-label="Restart audio narration"
          style={{
            width: 40, height: 40, borderRadius: "50%",
            background: t.light, border: `1px solid ${t.border}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", fontSize: 14, color: t.mid,
          }}
        >
          ↺
        </button>
      </div>

      {/* Placeholder note when no URL */}
      {!hasAudio && (
        <p style={{ margin: "16px 0 0", fontSize: 11, color: t.muted, fontStyle: "italic", textAlign: "center" }}>
          Audio narration will be available here once an MP3 is uploaded.
        </p>
      )}
    </div>
  );
}

import { useState, useRef, useEffect, useCallback } from "react";
import { C } from "../../systems/theme";

const PILOT_AUDIO_BY_TITLE = {
  "Fractional Reserve Lending": {
    mp3Url:
      "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/4430feedd1db49b4b7be2139b8dddc4f.mp3",
    externalUrl: "https://www.aidocmaker.com/g0/audio?name=4430feedd1db49b4b7be2139b8dddc4f",
    helperText:
      "Pilot narration is live for this topic. On iPhone, tap play once to start the audio.",
  },
};

/**
 * AudioPlayer — theme-aware MP3 player with HTML5 Audio.
 *
 * Props:
 *   title        — display title (required)
 *   mp3Url       — direct URL of the MP3 file. When null the player shows a placeholder.
 *   externalUrl  — optional hosted full narration link for this topic.
 *   helperText   — optional helper note shown beneath the controls.
 *   duration     — fallback duration in seconds used when mp3Url is null (default 180)
 *   playSound    — parent's sound callback (tap/back/open) for UI feedback
 *   t            — theme object (falls back to C)
 */
export function AudioPlayer({
  title,
  mp3Url = null,
  externalUrl = null,
  helperText = null,
  duration: fallbackDuration = 180,
  playSound,
  t: theme,
}) {
  const t = theme || C;
  const pilotAudio = PILOT_AUDIO_BY_TITLE[title] || null;
  const resolvedMp3Url = mp3Url || pilotAudio?.mp3Url || null;
  const resolvedExternalUrl = externalUrl || pilotAudio?.externalUrl || null;
  const resolvedHelperText = helperText || pilotAudio?.helperText || null;

  // ── refs ──
  const audioRef = useRef(null);
  const intervalRef = useRef(null);

  // ── state ──
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(fallbackDuration);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const hasAudio = !!resolvedMp3Url;

  // ── create / destroy audio element ──
  useEffect(() => {
    if (!hasAudio) return;
    const audio = new Audio(resolvedMp3Url);
    audio.preload = "metadata";
    audioRef.current = audio;

    const onLoaded = () => {
      if (audio.duration && isFinite(audio.duration)) setDuration(Math.ceil(audio.duration));
      setLoading(false);
    };
    const onError = () => {
      setError("Unable to load audio");
      setLoading(false);
    };
    const onEnded = () => {
      setPlaying(false);
      setElapsed(0);
    };

    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("error", onError);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.pause();
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("error", onError);
      audio.removeEventListener("ended", onEnded);
      // iOS-specific: clear src + reload to fully release audio buffer.
      // Without this, Safari retains the audio element in memory and
      // eventually kills the tab with "Too many audio elements" error.
      try {
        audio.src = "";
        audio.load();
      } catch {
        /* ignore */
      }
      audioRef.current = null;
    };
  }, [resolvedMp3Url, hasAudio]);

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
        setElapsed((e) => {
          if (e >= duration) {
            clearInterval(intervalRef.current);
            setPlaying(false);
            return 0;
          }
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
        a.play()
          .then(() => {
            setLoading(false);
            setPlaying(true);
          })
          .catch(() => {
            setLoading(false);
            setError("Playback failed");
          });
      }
    } else {
      setPlaying((p) => !p);
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
  const seek = useCallback(
    (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const time = Math.floor(pct * duration);
      setElapsed(time);
      if (hasAudio && audioRef.current) {
        audioRef.current.currentTime = time;
      }
    },
    [duration, hasAudio],
  );

  // ── skip ±15s ──
  const skip = useCallback(
    (delta) => {
      const next = Math.max(0, Math.min(duration, elapsed + delta));
      setElapsed(next);
      if (hasAudio && audioRef.current) audioRef.current.currentTime = next;
    },
    [elapsed, duration, hasAudio],
  );

  // ── format helper ──
  const fmt = (s) => {
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
        fontFamily: "-apple-system,'SF Pro Display','SF Pro Text','Helvetica Neue',Arial,sans-serif",
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
            boxShadow: "0 4px 14px rgba(255,255,255,0.12)",
          }}
        >
          {loading ? (
            <span style={{ fontSize: 18, color: t.white }}>⏳</span>
          ) : playing ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill={t.white}><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill={t.white}><polygon points="6,3 20,12 6,21" /></svg>
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

      {resolvedHelperText && (
        <p style={{ margin: "16px 0 0", fontSize: 11.5, color: t.muted, fontStyle: "italic", textAlign: "center", lineHeight: 1.6 }}>
          {resolvedHelperText}
        </p>
      )}

      {resolvedExternalUrl && (
        <div style={{ display: "flex", justifyContent: "center", marginTop: 14 }}>
          <a
            href={resolvedExternalUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              minHeight: 42,
              padding: "0 16px",
              borderRadius: 999,
              textDecoration: "none",
              background: t.light,
              border: `1px solid ${t.border}`,
              color: t.mid,
              fontSize: 12.5,
              fontWeight: 700,
            }}
          >
            Open full narration
          </a>
        </div>
      )}

      {/* Placeholder note when no URL */}
      {!hasAudio && (
        <p style={{ margin: "16px 0 0", fontSize: 11, color: t.muted, fontStyle: "italic", textAlign: "center" }}>
          Audio narration will be available here once an MP3 is uploaded.
        </p>
      )}
    </div>
  );
}

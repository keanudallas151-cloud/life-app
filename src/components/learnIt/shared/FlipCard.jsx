import { useState, useEffect, useRef } from "react";
import {
  FONT,
  getBestScore,
  getFlipCardAriaLabel,
  haptic,
} from "./constants.js";

/**
 * FlipCard — Learn-It activity card with iOS-native press,
 * long-press peek, ripple, ribbon, and rich back-face content.
 *
 * iOS Safari notes (kept from Phase 1):
 *   On iOS, `backface-visibility: hidden` is silently disabled when the
 *   3D-transformed parent has a `filter:` rule, or when the children have
 *   `backdrop-filter:`. That causes both faces to render at once and the
 *   front face wins z-order, so the BACK (with the Play button) is
 *   unreachable. We therefore:
 *     - keep `transformStyle: preserve-3d` only on the rotating wrapper
 *     - put NO `filter` on the rotating wrapper
 *     - put NO `backdrop-filter` on the faces
 *     - set `WebkitBackfaceVisibility: hidden` explicitly on each face
 *     - gate `pointer-events` so the hidden face never eats taps
 */
export function FlipCard({
  game,
  color,
  lightColor,
  borderColor,
  index,
  onPlay,
  showHint = true,
  onFlip,
  reducedMotion = false,
  play,
}) {
  const [flipped, setFlipped] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [playReady, setPlayReady] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [peeking, setPeeking] = useState(false);
  const [ripple, setRipple] = useState(null);
  const longPressTimerRef = useRef(null);
  const longPressFiredRef = useRef(false);
  const lastSoundRef = useRef({ type: null, ts: 0 });

  const longDesc = game.longDesc || game.desc;
  const howTo = game.howTo;
  const learnTags = Array.isArray(game.learn) ? game.learn.slice(0, 3) : [];
  const isNew = game.tag === "new";
  const best = getBestScore(game.id);

  // Difficulty hint text for the back-face meta row
  const difficultyHint = game.difficulty || (game.type === "tool" ? "Practice" : "Easy → Hard");

  // Suppress duplicate sounds within 250 ms (long-press → flip etc.)
  const playOnce = (type) => {
    if (!play) return;
    const now = Date.now();
    if (lastSoundRef.current.type === type && now - lastSoundRef.current.ts < 250) return;
    lastSoundRef.current = { type, ts: now };
    play(type);
  };

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), index * 65);
    return () => clearTimeout(t);
  }, [index]);

  // Spring-pop the Play button shortly after the back face lands
  useEffect(() => {
    if (!flipped) {
      setPlayReady(false);
      return;
    }
    const delay = reducedMotion ? 0 : 250;
    const t = setTimeout(() => setPlayReady(true), delay);
    return () => clearTimeout(t);
  }, [flipped, reducedMotion]);

  const clearLongPress = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const flipTo = (next) => {
    setFlipped(next);
    if (next) {
      playOnce("flip");
      haptic(8);
      onFlip?.(game.id);
    } else {
      playOnce("tap_soft");
    }
  };

  const handleFlipToggle = () => flipTo(!flipped);

  const spawnRipple = (e) => {
    if (reducedMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const native = e.touches?.[0] || e;
    const x = (native.clientX ?? rect.left + rect.width / 2) - rect.left;
    const y = (native.clientY ?? rect.top + rect.height / 2) - rect.top;
    const id = Date.now() + Math.random();
    setRipple({ x, y, id });
    setTimeout(() => setRipple((r) => (r && r.id === id ? null : r)), 320);
  };

  const handlePointerDown = (e) => {
    setPressed(true);
    longPressFiredRef.current = false;
    spawnRipple(e);
    clearLongPress();
    if (!flipped && !reducedMotion) {
      longPressTimerRef.current = setTimeout(() => {
        longPressFiredRef.current = true;
        setPeeking(true);
        playOnce("long_press");
        haptic(10);
      }, 350);
    }
  };

  const handlePointerUp = () => {
    setPressed(false);
    clearLongPress();
    if (peeking) {
      // Long-press resolved → commit to a full flip (or back if already flipped).
      setPeeking(false);
      flipTo(!flipped);
    }
  };

  const handlePointerCancel = () => {
    setPressed(false);
    setPeeking(false);
    clearLongPress();
  };

  const handleClick = () => {
    // Suppress click when long-press already triggered a transition.
    if (longPressFiredRef.current) {
      longPressFiredRef.current = false;
      return;
    }
    handleFlipToggle();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleFlipToggle();
    }
  };

  const handlePlayClick = (e) => {
    e.stopPropagation();
    play?.("tap");
    haptic(4);
    onPlay(game.id);
  };

  // Rotation transition — disabled under reduced motion.
  // Peek = quarter-flip preview (~25%) anchored to back face.
  const rotationTransition = reducedMotion
    ? "none"
    : "transform 0.6s cubic-bezier(0.34,1.56,0.64,1)";
  const rotateAngle = flipped ? 180 : peeking ? 45 : 0;
  const pressScale = pressed && !flipped ? 0.97 : 1;

  const ariaLabel = getFlipCardAriaLabel(game, flipped);
  const longDescId = `flipcard-desc-${game.id}`;

  return (
    <div
      className="life-flipcard-shell"
      style={{
        perspective: "1000px",
        opacity: mounted ? 1 : 0,
        transform: mounted ? "translateY(0) scale(1)" : "translateY(20px) scale(0.94)",
        transition: reducedMotion
          ? "none"
          : `opacity 0.4s ease ${index * 65}ms, transform 0.5s cubic-bezier(0.34,1.56,0.64,1) ${index * 65}ms`,
        // Used by learnit-ios.css :focus-visible rule to colour the ring.
        ["--life-flipcard-color"]: color,
      }}
    >
      <div
        role="button"
        tabIndex={0}
        aria-pressed={flipped}
        aria-label={ariaLabel}
        aria-describedby={longDescId}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerCancel}
        onPointerCancel={handlePointerCancel}
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "1 / 1.05",
          transformStyle: "preserve-3d",
          WebkitTransformStyle: "preserve-3d",
          transform: `rotateY(${rotateAngle}deg) scale(${pressScale})`,
          WebkitTransform: `rotateY(${rotateAngle}deg) scale(${pressScale})`,
          transition: rotationTransition,
          WebkitTransition: rotationTransition,
          cursor: "pointer",
          isolation: "isolate",
          willChange: "transform",
          WebkitTapHighlightColor: "transparent",
          outline: "none",
        }}
      >
        {/* FRONT */}
        <div
          aria-hidden={flipped}
          style={{
            position: "absolute",
            inset: 0,
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            background: "rgba(255,255,255,0.045)",
            border: `1px solid ${borderColor}`,
            borderRadius: 22,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "18px 14px 34px",
            gap: 10,
            boxShadow: pressed && !flipped
              ? `0 2px 10px rgba(0,0,0,0.22), 0 0 0 1.5px ${color}40`
              : `0 6px 22px rgba(0,0,0,0.22)`,
            overflow: "hidden",
            pointerEvents: flipped ? "none" : "auto",
            transition: "box-shadow 0.18s ease",
          }}
        >
          {/* Shimmer sweep on mount */}
          {mounted && !reducedMotion && (
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                overflow: "hidden",
                borderRadius: 22,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  width: "55%",
                  left: 0,
                  background:
                    "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.18) 50%, transparent 100%)",
                  animation: `flipCardShimmer 1.4s ease ${index * 65 + 280}ms 1 both`,
                }}
              />
            </div>
          )}

          {/* NEW ribbon (top-right, diagonal) */}
          {isNew && (
            <div
              className="life-flipcard-ribbon"
              style={{ background: color }}
              aria-hidden="true"
            >
              NEW
            </div>
          )}

          {/* Type badge */}
          <div
            style={{
              position: "absolute",
              top: 12,
              left: 12,
              padding: "3px 8px",
              borderRadius: 999,
              background: lightColor,
              border: `1px solid ${borderColor}`,
              fontSize: 9,
              fontWeight: 700,
              color: color,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              fontFamily: FONT,
            }}
          >
            {game.type}
          </div>

          <div style={{ fontSize: 32, lineHeight: 1 }}>{game.icon}</div>
          <div
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "#ededed",
              textAlign: "center",
              fontFamily: FONT,
              letterSpacing: "-0.02em",
            }}
          >
            {game.title}
          </div>
          <div
            style={{
              fontSize: 12,
              color: "rgba(161,161,161,0.7)",
              textAlign: "center",
              lineHeight: 1.5,
              fontFamily: FONT,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              padding: "0 4px",
            }}
          >
            {game.desc}
          </div>

          {/* Tap ripple */}
          {ripple && !reducedMotion && (
            <span
              aria-hidden="true"
              style={{
                position: "absolute",
                left: ripple.x,
                top: ripple.y,
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: `${color}66`,
                transform: "translate(-50%, -50%) scale(0)",
                pointerEvents: "none",
                animation: "life-flipcard-ripple 0.32s ease-out forwards",
              }}
            />
          )}

          {/* Tap hint — pulsing dot, hidden once any card has been flipped */}
          {showHint && (
            <div
              aria-hidden="true"
              className="life-flipcard-hint"
              style={{
                position: "absolute",
                bottom: 10,
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                alignItems: "center",
                gap: 5,
                pointerEvents: "none",
              }}
            >
              <span
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: color,
                  boxShadow: `0 0 0 0 ${color}`,
                  animation: reducedMotion
                    ? "none"
                    : "life-flipcard-hint-pulse 1.8s ease-in-out infinite",
                }}
              />
              <span
                style={{
                  fontSize: 9.5,
                  color: color,
                  fontFamily: FONT,
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  opacity: 0.55,
                }}
              >
                flip
              </span>
            </div>
          )}
        </div>

        {/* BACK */}
        <div
          aria-hidden={!flipped}
          style={{
            position: "absolute",
            inset: 0,
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            WebkitTransform: "rotateY(180deg)",
            background: `linear-gradient(160deg, ${lightColor.replace("0.12", "0.18")} 0%, rgba(255,255,255,0.04) 100%)`,
            border: `1.5px solid ${color}60`,
            borderRadius: 22,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-start",
            padding: "12px 12px 44px",
            gap: 5,
            boxShadow: `0 4px 28px ${color}25`,
            pointerEvents: flipped ? "auto" : "none",
            overflow: "hidden",
          }}
        >
          {/* Best score badge */}
          {best && (
            <div
              aria-label={`Best score ${best.pct} percent`}
              style={{
                position: "absolute",
                top: 8,
                left: 8,
                padding: "2px 7px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.08)",
                border: `1px solid ${color}40`,
                fontSize: 8.5,
                fontWeight: 700,
                color: color,
                letterSpacing: "0.04em",
                fontFamily: FONT,
              }}
            >
              ★ {best.pct}%
            </div>
          )}

          <div style={{ fontSize: 22, lineHeight: 1, marginTop: 2 }}>{game.icon}</div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#ededed",
              textAlign: "center",
              fontFamily: FONT,
              letterSpacing: "-0.01em",
            }}
          >
            {game.title}
          </div>

          {/* Long description */}
          <div
            id={longDescId}
            style={{
              fontSize: 10.5,
              color: "rgba(220,220,220,0.78)",
              textAlign: "center",
              lineHeight: 1.42,
              fontFamily: FONT,
              padding: "0 2px",
              display: "-webkit-box",
              WebkitLineClamp: howTo ? 3 : 4,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {longDesc}
          </div>

          {/* How-To one-liner */}
          {howTo && (
            <div
              style={{
                fontSize: 9.5,
                color: "rgba(220,220,220,0.55)",
                textAlign: "center",
                lineHeight: 1.4,
                fontFamily: FONT,
                padding: "0 4px",
                fontStyle: "italic",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {howTo}
            </div>
          )}

          {/* Learn chips */}
          {learnTags.length > 0 && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 4,
                justifyContent: "center",
                marginTop: 1,
              }}
            >
              {learnTags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    padding: "1.5px 6px",
                    borderRadius: 999,
                    background: `${color}1A`,
                    border: `1px solid ${color}33`,
                    fontSize: 8,
                    fontWeight: 700,
                    color,
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    fontFamily: FONT,
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Meta chips: type + difficulty hint */}
          <div
            style={{
              display: "flex",
              gap: 5,
              flexWrap: "wrap",
              justifyContent: "center",
              marginTop: 2,
            }}
          >
            <span
              style={{
                padding: "2px 7px",
                borderRadius: 999,
                background: lightColor,
                border: `1px solid ${borderColor}`,
                fontSize: 8.5,
                fontWeight: 700,
                color: color,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                fontFamily: FONT,
              }}
            >
              {game.type}
            </span>
            <span
              style={{
                padding: "2px 7px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                fontSize: 8.5,
                fontWeight: 600,
                color: "rgba(220,220,220,0.85)",
                letterSpacing: "0.04em",
                fontFamily: FONT,
              }}
            >
              {difficultyHint}
            </span>
            {isNew && (
              <span
                style={{
                  padding: "2px 7px",
                  borderRadius: 999,
                  background: color,
                  fontSize: 8.5,
                  fontWeight: 800,
                  color: "#000",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  fontFamily: FONT,
                }}
              >
                New
              </span>
            )}
          </div>

          {/* Compact Play pill, anchored bottom-center */}
          <button
            type="button"
            className="life-flipcard-play"
            onClick={handlePlayClick}
            aria-label={`Play ${game.title}`}
            aria-describedby={longDescId}
            tabIndex={flipped ? 0 : -1}
            style={{
              position: "absolute",
              bottom: 10,
              left: "50%",
              transform: "translateX(-50%)",
              padding: "5px 14px",
              minHeight: 28,
              background: color,
              color: "#000",
              border: "none",
              borderRadius: 999,
              fontSize: 11.5,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: FONT,
              letterSpacing: "-0.01em",
              boxShadow: `0 4px 14px ${color}40`,
              transition: "transform 0.15s cubic-bezier(0.34,1.56,0.64,1)",
              WebkitTapHighlightColor: "transparent",
              opacity: playReady ? 1 : 0,
              animation:
                playReady && !reducedMotion
                  ? "flipCardPlayPop 0.4s cubic-bezier(0.34,1.56,0.64,1) both"
                  : "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              lineHeight: 1,
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = "translateX(-50%) scale(0.94)";
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = "translateX(-50%) scale(1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateX(-50%) scale(1)";
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
              e.currentTarget.style.transform = "translateX(-50%) scale(0.94)";
            }}
            onTouchEnd={(e) => {
              e.stopPropagation();
              e.currentTarget.style.transform = "translateX(-50%) scale(1)";
            }}
          >
            <span aria-hidden="true" style={{ fontSize: 9 }}>▶</span>
            Play
          </button>
        </div>
      </div>
    </div>
  );
}

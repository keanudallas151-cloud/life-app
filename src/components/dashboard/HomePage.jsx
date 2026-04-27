import { useEffect, useMemo, useRef, useState } from "react";
import { MAP } from "../../data/content";
import { clearResumeTopic, getResumeTopic } from "../../systems/resumeReading";
import { S } from "../../systems/theme";
import { Ic } from "../../icons/Ic";
import { LS } from "../../systems/storage";
import { ReturningUserDashboard } from "./ReturningUserDashboard";
import { VoiceAssistant } from "./VoiceAssistant";

const HABIT_KEY = "life_daily_habits";
const DEFAULT_HABITS = [
  { id: "h1", label: "Drink 2L of water", icon: "💧" },
  { id: "h2", label: "Read for 10 minutes", icon: "📖" },
  { id: "h3", label: "No social media before noon", icon: "🔕" },
  { id: "h4", label: "Write one goal down", icon: "✍️" },
  { id: "h5", label: "Move your body", icon: "🏃" },
];

function todayKey() {
  return new Date().toISOString().split("T")[0];
}

function useDailyHabits() {
  const [state, setState] = useState(() => {
    const saved = LS.get(HABIT_KEY, {});
    const today = todayKey();
    return saved.date === today ? saved.checked ?? [] : [];
  });

  const toggle = (id) => {
    setState((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      LS.set(HABIT_KEY, { date: todayKey(), checked: next });
      return next;
    });
  };

  return { checked: state, toggle };
}

function greetingFor(hour) {
  if (hour >= 5 && hour < 12) return "Good Morning";
  if (hour >= 12 && hour < 17) return "Good Afternoon";
  if (hour >= 17 && hour < 22) return "Good Evening";
  return "Good Night";
}

export function HomePage({
  t,
  userName,
  preferredName,
  gender,
  genderCustom,
  userId,
  notifications,
  readingStreak,
  progressPercent,
  readKeys,
  onNavigate,
  onResume,
  onOpenQuiz,
  onOpenDailyGrowth,
  onOpenMomentumHub,
  onOpenGoalSetting,
  onGetStarted,
  onOpenIncomeIdeas,
  onOpenFocusTimer,
  play,
}) {
  const [dismissed, setDismissed] = useState(false);
  const [isReturning, setIsReturning] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const { checked: habitChecked, toggle: toggleHabit } = useDailyHabits();

  useEffect(() => {
    if (userId && LS.get(`life_returning_${userId}`)) {
      setIsReturning(true);
    }
  }, [userId]);
  const resumeTopic = useMemo(() => {
    const saved = getResumeTopic();
    if (!saved?.key || !MAP[saved.key]) return null;
    return { key: saved.key, label: MAP[saved.key].node?.label || saved.key };
  }, []);

  // ── iOS swipe-to-dismiss state for Continue Reading card ──────────────
  // phase: "idle" | "dragging" | "preparing" | "dismissing" | "snapping"
  const [resumePhase, setResumePhase] = useState("idle");
  const [resumeDragX, setResumeDragX] = useState(0);
  const resumeCardRef = useRef(null);
  const resumeDragRef = useRef({
    active: false,
    startX: 0,
    startY: 0,
    locked: null,
    width: 0,
    pointerId: null,
  });
  const resumeCollapseHeightRef = useRef(null);
  const resumeSuppressClickRef = useRef(0);

  const beginDismissResume = () => {
    if (resumePhase === "preparing" || resumePhase === "dismissing") return;
    const node = resumeCardRef.current;
    if (!node) {
      clearResumeTopic();
      setDismissed(true);
      return;
    }
    const h = node.offsetHeight;
    const w = node.offsetWidth;
    resumeCollapseHeightRef.current = h;
    // Phase 1: lock current pixel max-height with no transition so the
    // collapse animation has a measured starting value (max-height: none
    // cannot animate to 0).
    setResumePhase("preparing");
    // Phase 2: next frame, swap to "dismissing" which applies the slide,
    // fade, scale, then delayed height/margin collapse.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setResumePhase("dismissing");
        setResumeDragX(-w * 1.2);
      });
    });
    // Total ≈ 320ms slide + 250ms collapse; unmount just after.
    setTimeout(() => {
      clearResumeTopic();
      setDismissed(true);
    }, 620);
  };

  const [greetHour, setGreetHour] = useState(() => new Date().getHours());
  useEffect(() => {
    const id = setInterval(
      () => {
        const h = new Date().getHours();
        setGreetHour((prev) => (prev === h ? prev : h));
      },
      5 * 60 * 1000,
    );
    return () => clearInterval(id);
  }, []);
  const greeting = useMemo(() => greetingFor(greetHour), [greetHour]);
  const displayName = useMemo(() => {
    const pref = preferredName?.trim();
    const base = pref || (userName ? String(userName).trim().split(/\s+/)[0] : "");
    if (!base) return "";
    const g = gender?.toLowerCase();
    if (g === "mr") return `Mr ${base}`;
    if (g === "mrs") return `Mrs ${base}`;
    if (g === "other" && genderCustom?.trim()) return `${genderCustom.trim()} ${base}`;
    return base;
  }, [preferredName, userName, gender, genderCustom]);

  const onResumePointerDown = (e) => {
    if (resumePhase !== "idle" && resumePhase !== "snapping") return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    resumeDragRef.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      locked: null,
      width: resumeCardRef.current?.offsetWidth || 0,
      pointerId: e.pointerId,
    };
  };

  const onResumePointerMove = (e) => {
    const d = resumeDragRef.current;
    if (!d.active) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    if (!d.locked) {
      if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
      if (Math.abs(dy) > Math.abs(dx)) {
        // Vertical intent — let the page scroll, abort this gesture.
        d.active = false;
        return;
      }
      d.locked = "x";
      setResumePhase("dragging");
      try {
        e.currentTarget.setPointerCapture(d.pointerId);
      } catch {
        /* ignore */
      }
    }
    // Rubber-band on rightward drag (card is dismiss-left only).
    const x = dx > 0 ? dx * 0.3 : dx;
    setResumeDragX(x);
  };

  const onResumePointerUp = () => {
    const d = resumeDragRef.current;
    if (!d.active && d.locked !== "x") return;
    const wasLocked = d.locked === "x";
    d.active = false;
    d.locked = null;
    if (!wasLocked) return;
    const threshold = -(d.width * 0.4);
    if (resumeDragX <= threshold) {
      // Past the dismiss threshold — slide out.
      resumeSuppressClickRef.current = Date.now();
      play?.("swipe");
      beginDismissResume();
    } else {
      // Snap back with iOS overshoot spring.
      resumeSuppressClickRef.current = Date.now();
      play?.("tap_soft");
      setResumePhase("snapping");
      setResumeDragX(0);
      setTimeout(() => {
        setResumePhase((p) => (p === "snapping" ? "idle" : p));
      }, 430);
    }
  };

  const onResumePointerCancel = () => {
    const d = resumeDragRef.current;
    if (d.locked === "x") {
      d.active = false;
      d.locked = null;
      setResumePhase("snapping");
      setResumeDragX(0);
      setTimeout(() => {
        setResumePhase((p) => (p === "snapping" ? "idle" : p));
      }, 430);
    } else {
      d.active = false;
    }
  };

  const onResumeClickCapture = (e) => {
    // Suppress the inner button's click immediately after a horizontal drag.
    if (Date.now() - resumeSuppressClickRef.current < 350) {
      e.stopPropagation();
      e.preventDefault();
    }
  };

  const onResumeKeyDown = (e) => {
    if (e.target !== e.currentTarget) return;
    if (e.key !== "Delete" && e.key !== "Backspace") return;
    e.stopPropagation();
    e.preventDefault();
    play?.("swipe");
    beginDismissResume();
  };

  return (
    <div
      data-page-tag="#dashboard_home"
      style={{
        minHeight: "100%",
        background: t.skin,
        overflowX: "hidden",
        paddingBottom: "calc(var(--life-bottom-nav-height, 0px) + 16px)",
        boxSizing: "border-box",
      }}
    >
      {isReturning ? (
        <ReturningUserDashboard
          t={t}
          play={play}
          userId={userId}
          userName={userName}
          preferredName={preferredName}
          gender={gender}
          genderCustom={genderCustom}
          notifications={notifications || []}
          readingStreak={readingStreak || 0}
          progressPercent={progressPercent || 0}
          readKeys={readKeys || []}
          onNavigate={onNavigate}
          onOpenReading={() => {}}
          onOpenQuiz={onOpenQuiz}
          onOpenOrganize={() => onNavigate?.("organize")}
          onOpenProgress={() => onNavigate?.("progress_dashboard")}
          onOpenPostIt={() => onNavigate?.("post_it")}
          onOpenFocusTimer={onOpenFocusTimer || (() => onNavigate?.("focus_timer"))}
        />
      ) : (
      <div
        className="life-grain life-home-hero"
        style={{
          padding: "40px 22px 44px",
          textAlign: "center",
          background: `linear-gradient(180deg, ${t.skin} 0%, ${t.light} 100%)`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: -70,
            right: -60,
            width: 220,
            height: 220,
            borderRadius: "50%",
            border: `1.5px solid ${t.green}1a`,
            pointerEvents: "none",
          }}
        />
        <div
          aria-hidden
          style={{
            position: "absolute",
            bottom: -90,
            left: -50,
            width: 180,
            height: 180,
            borderRadius: "50%",
            border: `1.5px solid ${t.green}14`,
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            maxWidth: 580,
            width: "100%",
            position: "relative",
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          <p
            style={{
              margin: "0 auto 14px",
              fontSize: "clamp(0.74rem, 2.8vw, 0.92rem)",
              fontWeight: 700,
              letterSpacing: "0.32em",
              textTransform: "uppercase",
              color: t.green,
              lineHeight: 1.2,
              textAlign: "center",
              display: "block",
              width: "100%",
            }}
          >
            {greeting}
            {displayName ? `, ${displayName}` : ""}
          </p>
          <h1
            style={{
              margin: "0 0 18px",
              fontSize: "clamp(6rem, 45vw, 11rem)",
              fontWeight: 800,
              color: t.ink,
              fontFamily: '"New York", Georgia, "Times New Roman", serif',
              letterSpacing: "-0.045em",
              lineHeight: 0.9,
              whiteSpace: "nowrap",
              display: "flex",
              alignItems: "baseline",
              justifyContent: "center",
              gap: "0.25em",
            }}
          >
            <span>Life</span>
            <span
              aria-hidden
              style={{
                display: "inline-block",
                width: "0.22em",
                height: "0.22em",
                background: t.ink,
                borderRadius: "50%",
                alignSelf: "flex-end",
                marginBottom: "0.15em",
              }}
            />
          </h1>

          <blockquote
            style={{
              color: t.mid,
              fontSize: "clamp(1rem, 3.8vw, 1.18rem)",
              lineHeight: 1.6,
              margin: "0 auto 32px",
              maxWidth: 480,
              fontFamily: "-apple-system,'SF Pro Display','SF Pro Text','Helvetica Neue',Arial,sans-serif",
              fontStyle: "italic",
              position: "relative",
              padding: "0 22px",
            }}
          >
            <span
              aria-hidden
              style={{
                position: "absolute",
                left: 25,
                top: 0,
                fontSize: 22,
                color: t.green,
                opacity: 0.45,
                lineHeight: 1,
                fontFamily: "-apple-system,'SF Pro Display','SF Pro Text','Helvetica Neue',Arial,sans-serif",
              }}
            >
              &ldquo;
            </span>
            The lack of knowledge is what keeps people poor
            <span
              aria-hidden
              style={{
                display: "inline-block",
                marginLeft: 3,
                fontSize: 22,
                color: t.green,
                opacity: 0.45,
                verticalAlign: "sub",
                lineHeight: 0.5,
                fontFamily: "-apple-system,'SF Pro Display','SF Pro Text','Helvetica Neue',Arial,sans-serif",
              }}
            >
              &rdquo;
            </span>
          </blockquote>

          <div
            style={{
              margin: "0 auto 36px",
              width: "100%",
              maxWidth: 320,
              display: "grid",
              gap: 14,
              justifyItems: "center",
            }}
          >
            <button
              type="button"
              onClick={onGetStarted}
              onPointerDown={(e) => { e.currentTarget.style.transform = "scale(0.97)"; }}
              onPointerUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
              onPointerCancel={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
              onPointerLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                width: "100%",
                padding: "0 24px",
                background: t.green,
                color: "#000",
                border: "none",
                borderRadius: 14,
                fontSize: 17,
                fontWeight: 600,
                letterSpacing: "-0.01em",
                fontFamily: "-apple-system,'SF Pro Text','Helvetica Neue',Arial,sans-serif",
                cursor: "pointer",
                boxShadow: `0 4px 16px ${t.green}45, 0 1px 0 rgba(255,255,255,0.15) inset`,
                minHeight: 54,
                WebkitTapHighlightColor: "transparent",
                transition: "transform 0.15s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s ease, background 0.15s ease",
              }}
            >
              Let&apos;s Start
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>

            <button
              type="button"
              onClick={onOpenIncomeIdeas}
              onPointerDown={(e) => { e.currentTarget.style.transform = "scale(0.97)"; }}
              onPointerUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
              onPointerCancel={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
              onPointerLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                width: "100%",
                padding: "0 24px",
                background: "rgba(120,120,128,0.16)",
                color: t.ink,
                border: "none",
                borderRadius: 14,
                fontSize: 17,
                fontWeight: 600,
                letterSpacing: "-0.01em",
                fontFamily: "-apple-system,'SF Pro Text','Helvetica Neue',Arial,sans-serif",
                cursor: "pointer",
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                minHeight: 54,
                WebkitTapHighlightColor: "transparent",
                transition: "transform 0.15s cubic-bezier(0.34,1.56,0.64,1), background 0.15s ease",
              }}
            >
              Let&apos;s Make Money
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={t.ink} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      )}

      <div style={{ padding: "28px 20px 0", maxWidth: 620, margin: "0 auto" }}>
        {resumeTopic && !dismissed && (() => {
          const isPreparing = resumePhase === "preparing";
          const isDismissing = resumePhase === "dismissing";
          const isDragging = resumePhase === "dragging";
          const isSnapping = resumePhase === "snapping";
          const collapsedH = resumeCollapseHeightRef.current;

          // Per-phase transition string. iOS decelerate curve for dismiss,
          // overshoot spring for snap-back, none while live-tracking the finger.
          let transition = "none";
          if (isDismissing) {
            transition =
              "transform 0.32s cubic-bezier(0.4,0,0.2,1)," +
              "opacity 0.32s cubic-bezier(0.4,0,0.2,1)," +
              "max-height 0.25s ease 0.32s," +
              "margin-bottom 0.25s ease 0.32s," +
              "border-width 0.25s ease 0.32s";
          } else if (isSnapping) {
            transition = "transform 0.42s cubic-bezier(0.34,1.56,0.64,1)";
          }

          // max-height drives the height-collapse step; only meaningful once
          // we've measured the card (preparing/dismissing). Otherwise unset.
          let maxHeight;
          if (isDismissing) maxHeight = 0;
          else if (isPreparing && collapsedH != null) maxHeight = `${collapsedH}px`;
          else maxHeight = undefined;

          const scale = isDismissing ? 0.92 : 1;
          const rotate = (isDragging || isSnapping) ? resumeDragX / 800 : 0;
          const transform = `translateX(${resumeDragX}px) rotate(${rotate}rad) scale(${scale})`;
          const opacity = isDismissing ? 0 : 1;
          // Subtly fade the green tint on the border as the user drags away.
          const dragProgress = Math.min(1, Math.abs(resumeDragX) / 200);
          const borderAlpha = isDragging || isSnapping
            ? Math.max(0x10, 0x26 - Math.round(0x16 * dragProgress))
            : 0x26;
          const borderHex = borderAlpha.toString(16).padStart(2, "0");

          return (
          <div
            ref={resumeCardRef}
            onPointerDown={onResumePointerDown}
            onPointerMove={onResumePointerMove}
            onPointerUp={onResumePointerUp}
            onPointerCancel={onResumePointerCancel}
            onClickCapture={onResumeClickCapture}
            onKeyDown={onResumeKeyDown}
            tabIndex={0}
            role="group"
            aria-label={`Continue reading ${resumeTopic.label} card`}
            aria-describedby="life-resume-swipe-dismiss-hint"
            style={{
              position: "relative",
              marginBottom: isDismissing ? 0 : 24,
              background: t.white,
              border: `1.5px solid ${t.green}${borderHex}`,
              borderRadius: 18,
              boxShadow: S.sm,
              overflow: "hidden",
              transform,
              opacity,
              maxHeight,
              transition,
              willChange: "transform, opacity, max-height",
              touchAction: "pan-y",
              WebkitTapHighlightColor: "transparent",
              userSelect: "none",
              WebkitUserSelect: "none",
            }}
          >
            <span
              id="life-resume-swipe-dismiss-hint"
              style={{
                position: "absolute",
                width: 1,
                height: 1,
                padding: 0,
                margin: -1,
                overflow: "hidden",
                clip: "rect(0 0 0 0)",
                whiteSpace: "nowrap",
                border: 0,
              }}
            >
              Swipe left to dismiss this card. Keyboard users can focus the card and press Delete or Backspace to dismiss.
            </span>
            <button
              type="button"
              onClick={() => onResume(resumeTopic.key)}
              aria-label={`Continue reading ${resumeTopic.label}`}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "16px 14px 16px 18px",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
                fontFamily: "inherit",
                color: "inherit",
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  background: `${t.green}14`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke={t.green} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
                </svg>
              </div>
              <div style={{ flex: 1, minWidth: 0, paddingRight: 6 }}>
                <p
                  style={{
                    margin: 0,
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: 1.5,
                    textTransform: "uppercase",
                    color: t.green,
                  }}
                >
                  Continue Reading
                </p>
                <p
                  style={{
                    margin: "4px 0 0",
                    fontSize: 15,
                    fontWeight: 600,
                    color: t.ink,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {resumeTopic.label}
                </p>
              </div>
              <div
                aria-hidden="true"
                className={isDragging ? "" : "life-resume-swipe-hint"}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  flexShrink: 0,
                  color: t.muted,
                  opacity: isDragging ? 0 : 0.74,
                  transition: "opacity 0.2s ease",
                  pointerEvents: "none",
                }}
              >
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: 1.1,
                    lineHeight: 1,
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                    color: t.muted,
                  }}
                >
                  Swipe left
                </span>
                <span
                  style={{
                    position: "relative",
                    width: 31,
                    height: 20,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                  }}
                >
                  <span
                    className="life-resume-swipe-trail"
                    style={{
                      position: "absolute",
                      inset: "5px 0 5px 6px",
                      borderRadius: 999,
                      background: `linear-gradient(90deg, ${t.green}00, ${t.green}18)`,
                      boxShadow: `0 0 16px ${t.green}22`,
                    }}
                  />
                  <svg
                    className="life-resume-swipe-arrows"
                    width="30"
                    height="20"
                    viewBox="0 0 30 20"
                    fill="none"
                    stroke={t.green}
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ position: "relative", flexShrink: 0 }}
                  >
                    <polyline points="16 4 10 10 16 16" />
                    <polyline points="24 4 18 10 24 16" />
                  </svg>
                </span>
              </div>
            </button>
          </div>
          );
        })()}

        <div
          style={{
            position: "relative",
            background: "linear-gradient(135deg, rgb(10, 10, 10) 0%, rgb(10, 31, 16) 100%)",
            border: "1px solid rgba(80, 200, 120, 0.17)",
            borderRadius: 22,
            padding: "32px 26px 30px",
            boxShadow: "rgba(20, 20, 20, 0.04) 0px 4px 6px, rgba(74, 140, 92, 0.08) 0px 12px 28px, rgba(20, 20, 20, 0.04) 0px 2px 4px",
            overflow: "hidden",
            marginBottom: 24,
          }}
        >
          <span
            aria-hidden="true"
            style={{
              position: "absolute",
              top: 2,
              left: 10,
              fontSize: 90,
              lineHeight: 1,
              color: "rgb(80, 200, 120)",
              opacity: 0.12,
              fontFamily: "-apple-system,'SF Pro Display','SF Pro Text','Helvetica Neue',Arial,sans-serif",
              fontWeight: 100,
              pointerEvents: "none",
              userSelect: "none",
            }}
          >
            “
          </span>
          <p
            style={{
              margin: "0 0 15px",
              fontSize: 10.5,
              fontWeight: 800,
              letterSpacing: 3,
              textTransform: "uppercase",
              color: "rgb(80, 200, 120)",
              position: "absolute",
              top: 23,
              left: 55,
            }}
          >
            The Creation Of Life -
          </p>
          <p
            style={{
              margin: "10px 0 14px",
              color: "rgb(250, 250, 250)",
              fontSize: 17,
              lineHeight: 1.55,
              fontFamily: "-apple-system,'SF Pro Display','SF Pro Text','Helvetica Neue',Arial,sans-serif",
              fontWeight: 500,
              fontStyle: "italic",
              position: "relative",
            }}
          >
            "Becoming Succesful Has Never Been This Easier" - K.C
          </p>
          <p
            style={{
              margin: 0,
              color: "rgb(212, 212, 212)",
              fontSize: 14.5,
              lineHeight: 1.75,
              fontFamily: "-apple-system,'SF Pro Display','SF Pro Text','Helvetica Neue',Arial,sans-serif",
              position: "relative",
            }}
          >
            I love writing, about a year ago I bought my first notebook and called it "Idea #1," a life guide sectioned into categories with sticky notes. A documented notebook of finance, philosophy and lessons learned. Growing up poor, moving to Australia at age 10 with just my mother, I had no one to tell me anything. I would have to figure out life for myself alone. This app is not just another course that wants to steal your money. It is an actual tool I made, a rough life guide with knowledge they don’t teach in school. You are born into a world with invisible handcuffs, modern slavery, but this app releases you. Discover the reality, and find what it takes to survive, network with like-minded individuals, and make decisions. Success has never been this easy, all in one app right at your fingertips.
          </p>
          <div
            style={{
              marginTop: 20,
              paddingTop: 14,
              borderTop: "1px solid rgba(80, 200, 120, 0.133)",
              display: "flex",
              alignItems: "center",
              gap: 10,
              position: "relative",
            }}
          >
            <span style={{ display: "inline-block", width: 28, height: 2, background: "rgb(80, 200, 120)" }} />
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 1.6,
                textTransform: "uppercase",
                color: "rgb(80, 200, 120)",
                fontFamily: "-apple-system,'SF Pro Display','SF Pro Text','Helvetica Neue',Arial,sans-serif",
              }}
            >
              K.C.
            </span>
          </div>
        </div>

        <p
          style={{
            margin: "4px 2px 12px",
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: t.muted,
            textAlign: "center",
            fontFamily: "-apple-system, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif",
            opacity: 0.7,
          }}
        >
          Jump back in
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 10,
          }}
        >
          {[
            { label: "Practice Quiz",  desc: "Jump into your next round.",  onClick: onOpenQuiz,         icon: "target",   color: "#0A84FF" }, // SF Blue
            { label: "Daily Growth",   desc: "Keep momentum alive today.",  onClick: onOpenDailyGrowth,  icon: "leaf",     color: "#30D158" }, // SF Green
            { label: "Momentum Hub",   desc: "Streaks, missions, wins.",    onClick: onOpenMomentumHub,  icon: "flame",    color: "#FF9F0A" }, // SF Orange
            { label: "My Goals",       desc: "Set and track what matters.", onClick: onOpenGoalSetting,  icon: "trophy",   color: "#BF5AF2" }, // SF Purple
          ].map((action, i) => (
            <button
              key={action.label}
              type="button"
              onClick={action.onClick}
              className="life-card-hover"
              style={{
                textAlign: "left",
                background: "rgba(255,255,255,0.04)",
                border: `1px solid rgba(255,255,255,0.08)`,
                borderRadius: 20,
                padding: "14px 16px 13px",
                boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
                cursor: "pointer",
                fontFamily: "-apple-system, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif",
                minHeight: 76,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: 10,
                WebkitTapHighlightColor: "transparent",
                animation: `ios-list-item-in 0.28s ${i * 55}ms cubic-bezier(0.25,1,0.5,1) both`,
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
              }}
            >
              <div style={{
                width: 32, height: 32, borderRadius: 10,
                background: `${action.color}1F`,
                border: `1px solid ${action.color}33`,
                display: "flex", alignItems: "center", justifyContent: "center",
                lineHeight: 1,
              }}>
                {Ic[action.icon]?.("none", action.color, 16)}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: t.ink, letterSpacing: "-0.01em", marginBottom: 3 }}>{action.label}</div>
                <div style={{ fontSize: 11.5, lineHeight: 1.4, color: t.muted }}>{action.desc}</div>
              </div>
            </button>
          ))}
        </div>

        {/* ── Daily Habit Tracker ─────────────────────────────── */}
        <div style={{ marginTop: 26 }}>
          <p
            style={{
              margin: "0 2px 12px",
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: t.muted,
              textAlign: "center",
              fontFamily: "-apple-system,'SF Pro Text','Helvetica Neue',Arial,sans-serif",
            }}
          >
            Daily Habits — {habitChecked.length}/{DEFAULT_HABITS.length}
          </p>
          <div
            style={{
              background: t.white,
              border: `1px solid ${t.border}`,
              borderRadius: 22,
              overflow: "hidden",
              boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
            }}
          >
            {/* Progress bar */}
            <div style={{ height: 3, background: t.skin }}>
              <div
                style={{
                  height: "100%",
                  width: `${(habitChecked.length / DEFAULT_HABITS.length) * 100}%`,
                  background: t.green,
                  transition: "width 0.4s cubic-bezier(0.34,1.56,0.64,1)",
                  borderRadius: 999,
                }}
              />
            </div>
            {DEFAULT_HABITS.map((h, i) => {
              const done = habitChecked.includes(h.id);
              return (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => toggleHabit(h.id)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 16px",
                    background: done ? `${t.green}0a` : "transparent",
                    border: "none",
                    borderBottom: i < DEFAULT_HABITS.length - 1 ? `1px solid ${t.border}` : "none",
                    cursor: "pointer",
                    textAlign: "left",
                    fontFamily: "-apple-system,'SF Pro Text','Helvetica Neue',Arial,sans-serif",
                    WebkitTapHighlightColor: "transparent",
                    transition: "background 0.2s ease",
                  }}
                >
                  {/* Check circle */}
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      background: done ? t.green : "transparent",
                      border: `2px solid ${done ? t.green : t.border}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      transition: "all 0.25s cubic-bezier(0.34,1.56,0.64,1)",
                    }}
                  >
                    {done && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                  <span style={{ fontSize: 14 }}>{h.icon}</span>
                  <span
                    style={{
                      flex: 1,
                      fontSize: 14,
                      fontWeight: 500,
                      color: done ? t.muted : t.ink,
                      textDecoration: done ? "line-through" : "none",
                      transition: "color 0.2s ease, text-decoration 0.2s ease",
                    }}
                  >
                    {h.label}
                  </span>
                </button>
              );
            })}
          </div>
          {habitChecked.length === DEFAULT_HABITS.length && (
            <p
              style={{
                margin: "10px 0 0",
                textAlign: "center",
                fontSize: 13,
                fontWeight: 600,
                color: t.green,
                fontFamily: "-apple-system,'SF Pro Text','Helvetica Neue',Arial,sans-serif",
              }}
            >
              ✦ All habits done today — great work!
            </p>
          )}
        </div>

        <p
          style={{
            margin: "24px auto 8px",
            textAlign: "center",
            fontSize: 11,
            color: t.muted,
            fontFamily: "-apple-system,'SF Pro Display','SF Pro Text','Helvetica Neue',Arial,sans-serif",
            opacity: 0.8,
          }}
        >
          &copy; {new Date().getFullYear()} Life. All rights reserved.
        </p>
      </div>

      {/* Voice Assistant FAB — only for returning users */}
      {isReturning && userId && (
        <button
          type="button"
          onClick={() => { play?.("tap"); setVoiceOpen(true); }}
          aria-label="Open voice assistant"
          style={{
            position: "fixed",
            bottom: `calc(var(--life-bottom-nav-height, 80px) + 16px + env(safe-area-inset-bottom, 0px))`,
            right: 20,
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: t.green,
            border: "none",
            boxShadow: `0 4px 20px ${t.green}60`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            zIndex: 200,
            WebkitTapHighlightColor: "transparent",
            transition: "transform 0.2s cubic-bezier(0.34,1.56,0.64,1)",
          }}
          onTouchStart={(e) => { e.currentTarget.style.transform = "scale(0.92)"; }}
          onTouchEnd={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
          onMouseDown={(e) => { e.currentTarget.style.transform = "scale(0.92)"; }}
          onMouseUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
            <line x1="12" y1="19" x2="12" y2="23"/>
            <line x1="8" y1="23" x2="16" y2="23"/>
          </svg>
        </button>
      )}

      {/* Voice Assistant Overlay */}
      {voiceOpen && (
        <VoiceAssistant
          t={t}
          play={play}
          isOpen={voiceOpen}
          onClose={() => setVoiceOpen(false)}
          displayName={preferredName || userName || ""}
          onNavigate={onNavigate}
          onAddTask={() => {}}
        />
      )}
    </div>
  );
}

// src/components/AppShell.jsx// 16.04.26
// Pure components and hooks extracted from App.jsx.
// These have NO dependency on LifeApp state — all values come
// through props. Safe to edit independently.
"use client";

import { lazy } from "react";
import { C } from "../../systems/theme";
import { Ic } from "../../icons/Ic";

export const EbookReader = lazy(() =>
  import("../content/Reader").then((m) => ({ default: m.EbookReader })),
);
export const QuizPage = lazy(() =>
  import("../growth/QuizPage").then((m) => ({ default: m.QuizPage })),
);
export const PostItFeed = lazy(() =>
  import("../social/PostItFeed").then((m) => ({ default: m.PostItFeed })),
);
export const TailorIntro = lazy(() =>
  import("../content/Tailor").then((m) => ({ default: m.TailorIntro })),
);
export const TailorQuestions = lazy(() =>
  import("../content/Tailor").then((m) => ({ default: m.TailorQuestions })),
);
export const TailorResult = lazy(() =>
  import("../content/Tailor").then((m) => ({ default: m.TailorResult })),
);
export const MomentumHubPage = lazy(() =>
  import("../social/MomentumHub").then((m) => ({ default: m.MomentumHub })),
);
export const IncomeIdeasPage = lazy(() =>
  import("../content/IncomeIdeasPage").then((m) => ({ default: m.IncomeIdeasPage })),
);

export function RouteFallback() {
  const base = "rgba(255,255,255,0.05)";
  const sheen = "rgba(255,255,255,0.12)";
  const skeletonBg = {
    background: `linear-gradient(90deg, ${base} 0%, ${sheen} 50%, ${base} 100%)`,
    backgroundSize: "200% 100%",
    animation: "life-skeleton-shimmer 1.3s ease-in-out infinite",
    borderRadius: 12,
  };
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      style={{
        padding: "32px 20px",
        maxWidth: 560,
        margin: "0 auto",
        fontFamily:
          "-apple-system,'SF Pro Display','SF Pro Text','Helvetica Neue',Arial,sans-serif",
      }}
    >
      <style>{`
        @keyframes life-skeleton-shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          [data-life-skeleton] { animation: none !important; }
        }
      `}</style>
      <div
        data-life-skeleton
        style={{ ...skeletonBg, height: 22, width: "55%", marginBottom: 14 }}
      />
      <div
        data-life-skeleton
        style={{ ...skeletonBg, height: 14, width: "82%", marginBottom: 24 }}
      />
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          data-life-skeleton
          style={{
            ...skeletonBg,
            height: 84,
            width: "100%",
            marginBottom: 12,
            borderRadius: 16,
          }}
        />
      ))}
      <span
        style={{
          position: "absolute",
          width: 1,
          height: 1,
          overflow: "hidden",
          clip: "rect(0 0 0 0)",
        }}
      >
        Loading…
      </span>
    </div>
  );
}

// Props: label, open, setOpen, children, tag, theme, playFn
export function SS({
  label,
  open,
  setOpen,
  children,
  tag,
  theme,
  playFn,
  onLabelClick,
}) {
  const th = theme || C;
  const iosfont = "-apple-system, SF Pro Display, Helvetica Neue, Arial, sans-serif";

  const handleChevronClick = (e) => {
    e.stopPropagation();
    playFn("tap");
    setOpen(!open);
  };

  const handleContainerClick = () => {
    playFn("tap");
    if (onLabelClick) {
      setOpen(true);
      onLabelClick();
    } else {
      setOpen(!open);
    }
  };

  return (
    <div data-page-tag={tag} style={{ margin: "2px 8px" }}>
      {/* Folder header row */}
      <button
        type="button"
        onClick={handleContainerClick}
        style={{
          display: "flex",
          alignItems: "center",
          width: "100%",
          padding: "10px 10px 10px 12px",
          gap: 10,
          background: open ? `${th.green}0d` : "transparent",
          border: "none",
          borderRadius: 12,
          cursor: "pointer",
          WebkitTapHighlightColor: "transparent",
          transition: "background 0.18s ease",
          minHeight: 46,
          userSelect: "none",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = `rgba(255,255,255,0.05)`; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = open ? `${th.green}0d` : "transparent"; }}
      >
        {/* Folder icon pill */}
        <span
          style={{
            width: 28, height: 28, borderRadius: 7,
            background: open ? `${th.green}22` : "rgba(255,255,255,0.07)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
            transition: "background 0.18s ease, transform 0.2s cubic-bezier(0.34,1.56,0.64,1)",
            transform: open ? "scale(1.08)" : "scale(1)",
          }}
          aria-hidden
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke={open ? th.green : th.muted} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 4.5C2 3.67 2.67 3 3.5 3H6.4l1.2 1.5H12.5C13.33 4.5 14 5.17 14 6v6c0 .83-.67 1.5-1.5 1.5h-9C2.67 13.5 2 12.83 2 12V4.5Z"/>
          </svg>
        </span>

        {/* Label */}
        <span
          style={{
            color: open ? th.green : th.muted,
            fontSize: 12,
            fontWeight: open ? 700 : 600,
            letterSpacing: "0.03em",
            flex: 1,
            textAlign: "left",
            fontFamily: iosfont,
            transition: "color 0.18s ease",
          }}
        >
          {label}
        </span>

        {/* Chevron - clickable independently */}
        <span
          onClick={handleChevronClick}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "4px",
            minWidth: 28,
            minHeight: 28,
            borderRadius: 6,
            cursor: "pointer",
            transition: "background 0.18s ease",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
        >
          <svg
            width="14" height="14" viewBox="0 0 16 16" fill="none"
            stroke={open ? th.green : th.muted}
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{
              transform: open ? "rotate(90deg)" : "rotate(0deg)",
              transition: "transform 0.22s cubic-bezier(0.25,1,0.5,1), stroke 0.18s ease",
              flexShrink: 0,
            }}
          >
            <polyline points="5,3 11,8 5,13"/>
          </svg>
        </span>
      </button>

      {/* Animated children */}
      <div
        className={`ios-folder-body${open ? " open" : ""}`}
        style={{ paddingLeft: 8 }}
      >
        <div>{open && children}</div>
      </div>
    </div>
  );
}


export function SL({ label, icon, onClick, active, theme }) {
  const th = theme || C;
  const Icon = icon && typeof Ic[icon] === "function" ? Ic[icon] : null;
  const iosfont = "-apple-system, SF Pro Text, Helvetica Neue, Arial, sans-serif";
  return (
    <button
      className="life-sidebar-link"
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        width: "100%",
        padding: "9px 12px 9px 12px",
        background: active ? `${th.green}16` : "transparent",
        border: "none",
        borderRadius: 10,
        cursor: "pointer",
        textAlign: "left",
        fontFamily: iosfont,
        transition: "background 0.15s ease, transform 0.12s cubic-bezier(0.34,1.56,0.64,1)",
        WebkitTapHighlightColor: "transparent",
        minHeight: 42,
        position: "relative",
      }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
      onMouseDown={(e) => { e.currentTarget.style.transform = "scale(0.97)"; }}
      onMouseUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
    >
      {/* Active indicator pill */}
      {active && (
        <span
          aria-hidden
          style={{
            position: "absolute",
            left: 0,
            top: "50%",
            transform: "translateY(-50%)",
            width: 3,
            height: 18,
            borderRadius: "0 2px 2px 0",
            background: th.green,
          }}
        />
      )}
      {Icon && (
        <span
          aria-hidden
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 24,
            height: 24,
            borderRadius: 7,
            background: active ? `${th.green}20` : "rgba(255,255,255,0.06)",
            color: active ? th.green : th.muted,
            flexShrink: 0,
            transition: "background 0.18s ease",
          }}
        >
          {Icon("none", active ? th.green : th.muted, 15)}
        </span>
      )}
      <span style={{
        fontSize: 13.5, color: active ? th.green : th.mid || "#c9c9c9",
        flex: 1, fontWeight: active ? 600 : 400,
        fontFamily: iosfont,
        letterSpacing: active ? "-0.01em" : "0",
        transition: "color 0.18s ease",
      }}>
        {label}
      </span>
      {active && (
        <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke={th.green} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="2,2 10,6 2,10"/>
        </svg>
      )}
    </button>
  );
}

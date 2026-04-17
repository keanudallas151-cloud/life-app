// src/components/AppShell.jsx// 16.04.26
// Pure components and hooks extracted from App.jsx.
// These have NO dependency on LifeApp state — all values come
// through props. Safe to edit independently.
"use client";

import { lazy, Suspense } from "react";
import { C } from "../systems/theme";
import { Ic } from "../icons/Ic";

export const EbookReader = lazy(() =>
  import("./Reader").then((m) => ({ default: m.EbookReader })),
);
export const QuizPage = lazy(() =>
  import("./QuizPage").then((m) => ({ default: m.QuizPage })),
);
export const PostItFeed = lazy(() =>
  import("./PostItFeed").then((m) => ({ default: m.PostItFeed })),
);
export const TailorIntro = lazy(() =>
  import("./Tailor").then((m) => ({ default: m.TailorIntro })),
);
export const TailorQuestions = lazy(() =>
  import("./Tailor").then((m) => ({ default: m.TailorQuestions })),
);
export const TailorResult = lazy(() =>
  import("./Tailor").then((m) => ({ default: m.TailorResult })),
);
export const MomentumHubPage = lazy(() =>
  import("./MomentumHub").then((m) => ({ default: m.MomentumHubPage })),
);

export function RouteFallback() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 200,
        color: C.muted,
        fontSize: 13,
        fontStyle: "italic",
        fontFamily: "Georgia,serif",
      }}
    >
      Loading…
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
  active = false,
}) {
  const th = theme || C;
  return (
    <div
      data-page-tag={tag}
      style={{
        borderTop: `1px solid ${th.border}22`,
      }}
    >
      <div
        className="life-sidebar-section-header"
        style={{
          display: "flex",
          alignItems: "center",
          width: "100%",
          padding: "8px 14px",
          gap: 8,
        }}
      >
        <button
          type="button"
          onClick={() => {
            playFn("tap");
            if (onLabelClick) {
              setOpen(true);
              onLabelClick();
              return;
            }
            setOpen(!open);
          }}
          style={{
            color: active ? th.green : th.muted,
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: 2,
            margin: 0,
            textTransform: "uppercase",
            flex: 1,
            textAlign: "left",
            fontFamily: "Georgia,serif",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            minHeight: 44,
            padding: 0,
          }}
        >
          {label}
        </button>
        <button
          type="button"
          onClick={() => {
            playFn("tap");
            setOpen(!open);
          }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 44,
            height: 44,
            minHeight: 44,
            padding: 0,
            border: "none",
            background: "transparent",
            cursor: "pointer",
            flexShrink: 0,
          }}
          aria-label={open ? `Collapse ${label}` : `Expand ${label}`}
        >
          <svg
            width="9"
            height="9"
            viewBox="0 0 10 10"
            style={{
              transform: open ? "rotate(90deg)" : "none",
              transition: "transform 0.18s ease",
              flexShrink: 0,
            }}
          >
            <polyline
              points="2,2 8,5 2,8"
              fill="none"
              stroke={th.muted}
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
      {open && children}
    </div>
  );
}

// Props: label, icon, onClick, active, theme
export function SL({ label, icon, onClick, active, theme }) {
  const th = theme || C;
  const Icon = icon && typeof Ic[icon] === "function" ? Ic[icon] : null;
  return (
    <button
      className="life-sidebar-link"
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        width: "100%",
        padding: "8px 14px 8px 18px",
        background: active ? `${th.green}14` : "transparent",
        border: "none",
        borderLeft: active ? `2.5px solid ${th.green}` : "2.5px solid transparent",
        cursor: "pointer",
        textAlign: "left",
        fontFamily: "Georgia,serif",
        transition: "background 0.15s",
      }}
    >
      {Icon && (
        <span
          aria-hidden
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 20,
            height: 20,
            color: active ? th.green : th.muted,
            flexShrink: 0,
          }}
        >
          {Icon("none", active ? th.green : th.muted, 17)}
        </span>
      )}
      <span style={{ fontSize: 13, color: active ? th.green : th.muted, flex: 1, fontWeight: active ? 700 : 500 }}>
        {label}
      </span>
    </button>
  );
}

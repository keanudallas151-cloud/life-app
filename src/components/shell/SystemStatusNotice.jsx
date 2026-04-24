"use client";

import { C } from "../../systems/theme";

const TONES = {
  info: {
    light: {
      background: C.light,
      border: C.border,
      title: C.ink,
      body: C.mid,
    },
    dark: {
      background: "rgba(255,255,255,0.06)",
      border: "rgba(255,255,255,0.12)",
      title: "#ffffff",
      body: "rgba(255,255,255,0.76)",
    },
  },
  warning: {
    light: {
      background: C.greenLt,
      border: C.gold,
      title: C.ink,
      body: C.mid,
    },
    dark: {
      background: "rgba(245,166,35,0.14)",
      border: "rgba(245,166,35,0.34)",
      title: "#ffffff",
      body: "rgba(255,255,255,0.82)",
    },
  },
  error: {
    light: {
      background: "rgba(229,72,77,0.12)",
      border: "rgba(229,72,77,0.4)",
      title: C.ink,
      body: C.mid,
    },
    dark: {
      background: "rgba(229,72,77,0.14)",
      border: "rgba(229,72,77,0.34)",
      title: "#ffffff",
      body: "rgba(255,255,255,0.82)",
    },
  },
};

export function SystemStatusNotice({ notice, dark = false, style }) {
  if (!notice?.title && !notice?.body) return null;

  const tone = TONES[notice.tone] ? notice.tone : "info";
  const palette = dark ? TONES[tone].dark : TONES[tone].light;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        width: "100%",
        maxWidth: 360,
        margin: "0 auto 18px",
        padding: "12px 14px",
        borderRadius: 14,
        border: `1px solid ${palette.border}`,
        background: palette.background,
        boxSizing: "border-box",
        ...style,
      }}
    >
      {notice.title && (
        <p
          style={{
            margin: 0,
            fontSize: 12,
            fontWeight: 700,
            color: palette.title,
            letterSpacing: 0.2,
          }}
        >
          {notice.title}
        </p>
      )}
      {notice.body && (
        <p
          style={{
            margin: notice.title ? "6px 0 0" : 0,
            fontSize: 12,
            color: palette.body,
            lineHeight: 1.6,
          }}
        >
          {notice.body}
        </p>
      )}
    </div>
  );
}

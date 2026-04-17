"use client";
import React, { useState } from "react";
import { C, S, DARK } from "../systems/theme";

const MODES = [
  {
    key: "light",
    icon: "☀️",
    label: "Light",
    desc: "Clean and bright, easy on the eyes during the day.",
    preview: C,
  },
  {
    key: "dark",
    icon: "🌙",
    label: "Dark",
    desc: "Softer on the eyes at night. Reduced blue light.",
    preview: DARK,
  },
  {
    key: "system",
    icon: "🔄",
    label: "System",
    desc: "Automatically matches your device settings.",
    preview: null,
  },
];

function PreviewBox({ colors }) {
  return (
    <div
      style={{
        width: 64,
        height: 48,
        borderRadius: 10,
        background: colors.skin,
        border: `1.5px solid ${colors.border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.3s ease",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          fontFamily: "Georgia,serif",
          fontSize: 18,
          fontWeight: 700,
          color: colors.ink,
          lineHeight: 1,
        }}
      >
        Aa
      </span>
    </div>
  );
}

function SystemPreviewBox() {
  return (
    <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
      <div
        style={{
          width: 30,
          height: 48,
          borderRadius: "10px 0 0 10px",
          background: C.skin,
          border: `1.5px solid ${C.border}`,
          borderRight: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          paddingRight: 1,
          overflow: "hidden",
        }}
      >
        <span
          style={{
            fontFamily: "Georgia,serif",
            fontSize: 16,
            fontWeight: 700,
            color: C.ink,
            lineHeight: 1,
          }}
        >
          A
        </span>
      </div>
      <div
        style={{
          width: 30,
          height: 48,
          borderRadius: "0 10px 10px 0",
          background: DARK.skin,
          border: `1.5px solid ${DARK.border}`,
          borderLeft: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          paddingLeft: 1,
          overflow: "hidden",
        }}
      >
        <span
          style={{
            fontFamily: "Georgia,serif",
            fontSize: 16,
            fontWeight: 700,
            color: DARK.ink,
            lineHeight: 1,
          }}
        >
          a
        </span>
      </div>
    </div>
  );
}

export function ThemePickerPage({
  C: _C,
  S: _S,
  play,
  themeMode,
  setThemeMode,
  dark,
  t,
  onContinue,
}) {
  const [hoveredCard, setHoveredCard] = useState(null);

  return (
    <div
      data-page-tag="#theme_picker_page"
      className="life-grain life-auth-shell"
      style={{
        minHeight: "100svh",
        background: `linear-gradient(165deg, ${_C.skin} 0%, ${dark ? "#1e1e1e" : "${_C.border}"} 50%, ${_C.skin} 100%)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Georgia,serif",
        padding: "40px 24px calc(40px + env(safe-area-inset-bottom))",
        position: "relative",
        overflowX: "hidden",
        transition: "background 0.4s ease",
      }}
    >
      {/* Decorative circles */}
      <div
        style={{
          position: "absolute",
          top: -40,
          right: -50,
          width: 170,
          height: 170,
          borderRadius: "50%",
          border: "1.5px solid rgba(61,90,76,0.09)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "18%",
          left: -18,
          width: 62,
          height: 62,
          borderRadius: "50%",
          background: "rgba(61,90,76,0.08)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "14%",
          right: "10%",
          width: 110,
          height: 110,
          borderRadius: "50%",
          border: "1.5px solid rgba(61,90,76,0.07)",
          pointerEvents: "none",
        }}
      />

      {/* Content */}
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
        }}
      >
        {/* App title */}
        <div
          style={{
            fontSize: 32,
            fontWeight: 700,
            color: _C.green,
            letterSpacing: "-0.5px",
            marginBottom: 4,
          }}
        >
          Life.
        </div>

        {/* Heading */}
        <h1
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: t.ink,
            margin: 0,
            textAlign: "center",
            transition: "color 0.3s ease",
          }}
        >
          Choose your look
        </h1>
        <p
          style={{
            fontSize: 15,
            color: t.muted,
            margin: "0 0 24px",
            textAlign: "center",
            lineHeight: 1.5,
            transition: "color 0.3s ease",
          }}
        >
          You can always change this later in Settings.
        </p>

        {/* Theme cards */}
        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: 14,
            marginBottom: 28,
          }}
        >
          {MODES.map((mode) => {
            const selected = themeMode === mode.key;
            const hovered = hoveredCard === mode.key;
            const previewColors =
              mode.key === "system"
                ? null
                : mode.key === "dark"
                  ? DARK
                  : C;

            return (
              <button
                key={mode.key}
                type="button"
                onClick={() => {
                  play("tap");
                  setThemeMode(mode.key);
                }}
                onMouseEnter={() => setHoveredCard(mode.key)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: "18px 20px",
                  borderRadius: 18,
                  border: selected
                    ? `2.5px solid ${_C.green}`
                    : `1.5px solid ${t.border}`,
                  background: selected ? t.greenLt : t.white,
                  boxShadow: selected
                    ? _S.glow
                    : hovered
                      ? _S.md
                      : _S.sm,
                  cursor: "pointer",
                  fontFamily: "Georgia,serif",
                  textAlign: "left",
                  outline: "none",
                  transition:
                    "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                  transform: hovered ? "translateY(-1px)" : "none",
                }}
              >
                {/* Icon */}
                <span
                  style={{
                    fontSize: 28,
                    lineHeight: 1,
                    flexShrink: 0,
                  }}
                >
                  {mode.icon}
                </span>

                {/* Text */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 17,
                      fontWeight: 700,
                      color: t.ink,
                      marginBottom: 3,
                      transition: "color 0.3s ease",
                    }}
                  >
                    {mode.label}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: t.muted,
                      lineHeight: 1.4,
                      transition: "color 0.3s ease",
                    }}
                  >
                    {mode.desc}
                  </div>
                </div>

                {/* Preview box */}
                {previewColors ? (
                  <PreviewBox colors={previewColors} />
                ) : (
                  <SystemPreviewBox />
                )}

                {/* Selected check */}
                {selected && (
                  <span
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      background: _C.green,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      fontSize: 14,
                      color: "#fff",
                      lineHeight: 1,
                    }}
                  >
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Continue button */}
        <button
          type="button"
          onClick={() => {
            play("ok");
            onContinue();
          }}
          style={{
            width: "100%",
            background: _C.green,
            color: "#fff",
            borderRadius: 16,
            padding: "18px 0",
            fontWeight: 700,
            fontSize: 17,
            fontFamily: "Georgia,serif",
            border: "none",
            cursor: "pointer",
            boxShadow: _S.md,
            transition: "opacity 0.2s ease, transform 0.2s ease",
            letterSpacing: "0.2px",
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = "scale(0.97)";
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = "scale(1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          Continue
        </button>
      </div>
    </div>
  );
}

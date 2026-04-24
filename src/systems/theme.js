import { useCallback, useEffect, useMemo, useState } from "react";
import { LS } from "./storage";

// ═══════════════════════════════════════════════════════════════════════════
// THEME PALETTE — Vercel / Geist Inspired
// ═══════════════════════════════════════════════════════════════════════════
// Modeled on Vercel's production design system: obsidian-black page bg,
// subtly elevated cards, hairline borders that read cleanly, soft-white
// body text. We keep green as the brand accent (vs Vercel's blue) so it
// still feels like Life.
//
// Palette reference (matches Vercel's dark-mode gray scale, mapped to our
// semantic tokens used everywhere via `t.*`):
//   #000000  → body baseline (under app)
//   #0a0a0a  → skin (page bg)
//   #111111  → white (card / button surface)
//   #1a1a1a  → light (elevated tint, input bg)
//   #2e2e2e  → border (hairline, clearly visible)
//   #ededed  → ink (primary text, soft not harsh)
//   #a1a1a1  → muted (captions, subtle text — 4.5:1 on skin)
// ═══════════════════════════════════════════════════════════════════════════

export const C = {
  skin:    "#0a0a0a",  // page bg: true Vercel obsidian
  white:   "#111111",  // card / button surface: subtle lift
  green:   "#50c878",  // vibrant accent green — high contrast vs black
  greenAlt: "#2f9e63",  // secondary green for existing gradients in Home, Reader, Tailor, and dashboard cards
  greenLt: "#0f2818",  // green tint bg
  ink:     "#ededed",  // primary text: soft white
  mid:     "#c9c9c9",  // body text: readable light gray
  muted:   "#a1a1a1",  // subtle text: Vercel's iconic mid-gray
  border:  "#2e2e2e",  // hairline border: visible separator
  light:   "#1a1a1a",  // elevated tint (progress tracks, input bg)
  gold:    "#f5a623",  // warning accent
  red:     "#e5484d",  // error — Vercel's red
  orange:   "#e58b2a",  // chart accent used by Charts.jsx and other warning-strength UI states
};

// Light mode — "just a touch lighter than dark mode" as requested.
// This is NOT white; it's a near-dark surface that sits just above the default
// dark (C) palette. Text colors remain light, so the same rgba() overlay
// patterns in game components continue to work without changes.
export const LIGHT = {
  skin:     "#141414",  // page bg: one step up from C.skin (#0a0a0a)
  white:    "#1e1e1e",  // card surface: one step up from C.white (#111111)
  green:    "#50c878",  // same brand accent — still pops on near-black
  greenAlt: "#2f9e63",  // secondary green
  greenLt:  "#0f2818",  // green tint (works on dark bg)
  ink:      "#eeeeee",  // primary text: matches dark mode readability
  mid:      "#c9c9c9",  // body text: same as C
  muted:    "#a1a1a1",  // subtle text: same as C
  border:   "#363636",  // hairline border: slightly lighter than C.border (#2e2e2e)
  light:    "#282828",  // elevated tint: slightly lighter than C.light (#1a1a1a)
  gold:     "#f5a623",  // warning accent (unchanged)
  red:      "#e5484d",  // error (unchanged)
  orange:   "#e58b2a",  // chart accent (unchanged)
};

// Deeper variant for users who pick "dark" explicitly in theme picker.
// Since default IS already dark, this goes even darker / more contrasty.
export const DARK = {
  skin:    "#000000",
  white:   "#0a0a0a",
  green:   "#50c878",
  greenAlt: "#37b36f",
  greenLt: "#0a1f10",
  ink:     "#fafafa",
  mid:     "#d4d4d4",
  muted:   "#a1a1a1",
  border:  "#262626",
  light:   "#141414",
  gold:    "#f5a623",
  red:     "#e5484d",
  orange:   "#f19a3d",
};

export const THEME_MODE_KEY = "life_theme_mode";
export const THEME_DARK_LEGACY_KEY = "life_dark_mode";
export const THEME_MODES = {
  system: "system",
  light: "light",
  dark: "dark",
};

/** Depth tokens — use for cards / sheets */
export const S = {
  sm: "0 1px 2px rgba(20,20,20,0.04), 0 2px 8px rgba(20,20,20,0.06)",
  md: "0 4px 6px rgba(20,20,20,0.04), 0 12px 28px rgba(74,140,92,0.08), 0 2px 4px rgba(20,20,20,0.04)",
  lg: "0 8px 16px rgba(20,20,20,0.06), 0 24px 48px rgba(74,140,92,0.12)",
  glow: "0 0 0 1px rgba(74,140,92,0.12), 0 16px 40px rgba(74,140,92,0.15)",
};

function canUseDOM() {
  return typeof window !== "undefined";
}

export function getSystemPrefersDark() {
  if (!canUseDOM() || !window.matchMedia) return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function normalizeThemeMode(value) {
  return Object.values(THEME_MODES).includes(value) ? value : THEME_MODES.system;
}

function getStoredThemeMode() {
  if (!canUseDOM()) return THEME_MODES.system;

  try {
    const rawMode = window.localStorage.getItem(THEME_MODE_KEY);
    if (rawMode) return normalizeThemeMode(JSON.parse(rawMode));

    const rawLegacy = window.localStorage.getItem(THEME_DARK_LEGACY_KEY);
    if (rawLegacy !== null) {
      return JSON.parse(rawLegacy) ? THEME_MODES.dark : THEME_MODES.light;
    }
  } catch {
    return THEME_MODES.system;
  }

  return THEME_MODES.system;
}

export function useTheme() {
  const [themeMode, setThemeModeState] = useState(getStoredThemeMode);
  const [systemDark, setSystemDark] = useState(getSystemPrefersDark);

  useEffect(() => {
    if (!canUseDOM() || !window.matchMedia) return undefined;
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const sync = (event) => setSystemDark(event.matches);
    setSystemDark(query.matches);
    if (typeof query.addEventListener === "function") {
      query.addEventListener("change", sync);
      return () => query.removeEventListener("change", sync);
    }
    query.addListener(sync);
    return () => query.removeListener(sync);
  }, []);

  const setThemeMode = useCallback((nextMode) => {
    setThemeModeState(normalizeThemeMode(nextMode));
  }, []);

  const dark = themeMode === THEME_MODES.dark || (
    themeMode === THEME_MODES.system && systemDark
  );

  useEffect(() => {
    LS.set(THEME_MODE_KEY, themeMode);
    LS.set(THEME_DARK_LEGACY_KEY, dark);
  }, [dark, themeMode]);

  const toggleTheme = useCallback(() => {
    setThemeModeState((currentMode) => {
      if (currentMode === THEME_MODES.dark) return THEME_MODES.light;
      if (currentMode === THEME_MODES.light) return THEME_MODES.dark;
      return dark ? THEME_MODES.light : THEME_MODES.dark;
    });
  }, [dark]);

  const t = useMemo(() => {
    if (dark) return DARK;
    if (themeMode === THEME_MODES.light) return LIGHT;
    return C;
  }, [dark, themeMode]);

  return { dark, t, themeMode, setThemeMode, toggleTheme, systemDark };
}

if (typeof document !== "undefined") {
  if (!document.getElementById("life-theme-global-style")) {
    const style = document.createElement("style");
    style.id = "life-theme-global-style";
    style.textContent = `button:active{filter:brightness(0.92)!important;transform:scale(0.985)!important;}button{transition:filter 0.18s cubic-bezier(0.4,0,0.2,1),transform 0.18s cubic-bezier(0.4,0,0.2,1),box-shadow 0.22s ease,background 0.18s ease,border-color 0.18s ease;}`;
    document.head.appendChild(style);
  }
}

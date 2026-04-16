import { useCallback, useEffect, useMemo, useState } from "react";
import { LS } from "./storage";

export const C = {
  skin: "#f5f0e8",
  white: "#ffffff",
  green: "#4a8c5c",
  greenLt: "#eaf3ec",
  ink: "#141414",
  mid: "#3a3a3a",
  muted: "#8a8070",
  border: "#ddd5c4",
  light: "#ede8de",
  gold: "#b8975a",
  red: "#c0392b",
};

export const DARK = {
  skin: "#181818",
  white: "#242424",
  green: "#5a9d6c",
  greenLt: "#223228",
  ink: "#f2f2f2",
  mid: "#d1d1d1",
  muted: "#a29d96",
  border: "#3b3b3b",
  light: "#2d2d2d",
  gold: "#d0ae6c",
  red: "#d25545",
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

  const t = useMemo(() => (dark ? DARK : C), [dark]);

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

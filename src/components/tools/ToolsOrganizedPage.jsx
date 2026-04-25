"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "../organized/mobile-native-fixes.css";

const ORGANIZED_RUNTIME_STYLE_ID = "organized-mobile-runtime-polish";

const ORGANIZED_RUNTIME_CSS = `
body.life-organized-active {
  background: var(--background) !important;
  overscroll-behavior-y: none !important;
}

body.life-organized-active .organized-mobile-native {
  background: var(--background) !important;
  color: var(--foreground) !important;
  overflow-x: hidden !important;
  overscroll-behavior: none !important;
}

body.life-organized-active .organized-mobile-native > .organized-back-btn {
  top: max(env(safe-area-inset-top), 10px) !important;
  left: 12px !important;
  min-width: 84px !important;
  min-height: 44px !important;
  padding: 0 14px !important;
  border-radius: 9999px !important;
  border: 1px solid color-mix(in oklch, var(--border) 76%, transparent) !important;
  background: color-mix(in oklch, var(--card) 86%, transparent) !important;
  color: var(--primary) !important;
  box-shadow: 0 8px 24px color-mix(in oklch, var(--background) 60%, transparent) !important;
  backdrop-filter: blur(18px) saturate(170%) !important;
  -webkit-backdrop-filter: blur(18px) saturate(170%) !important;
  font-size: 17px !important;
  font-weight: 600 !important;
  opacity: 1 !important;
  transition: opacity 280ms ease, transform 320ms cubic-bezier(0.34, 1.56, 0.64, 1) !important;
}

body.life-organized-active .organized-mobile-native.is-scrolling > .organized-back-btn {
  opacity: 0 !important;
  transform: translateY(-10px) scale(0.96) !important;
  pointer-events: none !important;
}

body.life-organized-active .organized-mobile-native .organized-feature > div > div {
  padding-top: calc(90px + env(safe-area-inset-top)) !important;
  padding-left: 16px !important;
  padding-right: 16px !important;
}

body.life-organized-active .organized-mobile-native .pl-\\[5\\.5rem\\] {
  padding-left: 0 !important;
}

body.life-organized-active .organized-mobile-native header {
  text-align: center !important;
}

body.life-organized-active .organized-mobile-native header h1 {
  font-size: clamp(2.45rem, 11vw, 3.75rem) !important;
  line-height: 1.02 !important;
  letter-spacing: -0.055em !important;
}

body.life-organized-active .organized-mobile-native header .mt-3.flex {
  display: flex !important;
  justify-content: center !important;
  gap: 8px !important;
  flex-wrap: wrap !important;
  overflow: visible !important;
  padding: 0 0 6px !important;
}

body.life-organized-active .organized-mobile-native header .organized-stat-chip {
  min-height: 40px !important;
  min-width: 84px !important;
  padding: 9px 14px !important;
  border-radius: 9999px !important;
  font-size: 15px !important;
  line-height: 1 !important;
  font-weight: 700 !important;
  background: color-mix(in oklch, var(--card) 88%, var(--muted)) !important;
  border: 1px solid color-mix(in oklch, var(--border) 86%, transparent) !important;
  box-shadow: none !important;
}

body.life-organized-active .organized-bottom-nav {
  border-top: 0 !important;
  background: color-mix(in oklch, var(--background) 92%, transparent) !important;
  box-shadow: 0 -18px 42px color-mix(in oklch, var(--background) 78%, transparent) !important;
  backdrop-filter: blur(22px) saturate(180%) !important;
  -webkit-backdrop-filter: blur(22px) saturate(180%) !important;
  padding-bottom: max(env(safe-area-inset-bottom), 10px) !important;
}

body.life-organized-active .organized-bottom-nav > div {
  max-width: 430px !important;
  padding: 10px 12px 8px !important;
  gap: 4px !important;
  background: transparent !important;
  border: 0 !important;
}

body.life-organized-active .organized-nav-pill,
body.life-organized-active .organized-fab-glow,
body.life-organized-active .organized-nav-item::before {
  display: none !important;
}

body.life-organized-active .organized-nav-item {
  position: relative !important;
  min-height: 56px !important;
  min-width: 56px !important;
  border-radius: 16px !important;
  background: transparent !important;
  box-shadow: none !important;
  color: var(--muted-foreground) !important;
}

body.life-organized-active .organized-nav-item.is-active {
  background: transparent !important;
  color: var(--primary) !important;
  box-shadow: none !important;
}

body.life-organized-active .organized-nav-item.is-active::after {
  content: "" !important;
  position: absolute !important;
  left: 50% !important;
  bottom: 3px !important;
  width: 20px !important;
  height: 3px !important;
  border-radius: 9999px !important;
  background: var(--primary) !important;
  transform: translateX(-50%) !important;
}

body.life-organized-active .organized-nav-item svg,
body.life-organized-active .organized-nav-item span {
  color: inherit !important;
  filter: none !important;
}

body.life-organized-active .organized-nav-item span {
  font-size: 12px !important;
  line-height: 1.05 !important;
  font-weight: 650 !important;
}

body.life-organized-active .organized-fab {
  width: 64px !important;
  height: 64px !important;
  border-radius: 9999px !important;
  border: 0 !important;
  outline: 0 !important;
  background: var(--primary) !important;
  box-shadow: 0 12px 34px color-mix(in oklch, var(--primary) 38%, transparent) !important;
}

body.life-organized-active .organized-mobile-native .grid.grid-cols-7 > button {
  aspect-ratio: 1 / 1 !important;
  border-radius: 9999px !important;
  overflow: hidden !important;
}

body.life-organized-active .organized-mobile-native .grid.grid-cols-7 > button > div,
body.life-organized-active .organized-mobile-native .grid.grid-cols-7 > button > div > div {
  border-radius: 9999px !important;
}

body.life-organized-active .organized-settings-stack {
  gap: 18px !important;
}

body.life-organized-active .organized-settings-stack > [data-slot="card"] {
  border: 0 !important;
  background: transparent !important;
  box-shadow: none !important;
  overflow: visible !important;
}

body.life-organized-active .organized-settings-row {
  min-height: 82px !important;
  padding: 18px 20px !important;
  border-radius: 28px !important;
  background: var(--card) !important;
  border: 1px solid color-mix(in oklch, var(--border) 82%, transparent) !important;
  box-shadow: 0 12px 28px color-mix(in oklch, var(--background) 64%, transparent) !important;
}

body.life-organized-active .organized-settings-row span {
  font-size: 20px !important;
  line-height: 1.1 !important;
  font-weight: 750 !important;
  letter-spacing: -0.035em !important;
}

body.life-organized-active .organized-settings-section-panel {
  margin-top: 12px !important;
  border-radius: 26px !important;
  background: var(--card) !important;
  border: 1px solid color-mix(in oklch, var(--border) 78%, transparent) !important;
  box-shadow: 0 8px 22px color-mix(in oklch, var(--background) 56%, transparent) !important;
}

body.life-organized-active .organized-choice-tile[aria-pressed="true"] {
  color: var(--primary-foreground) !important;
  background: var(--primary) !important;
  border-color: var(--primary) !important;
  box-shadow: 0 8px 22px color-mix(in oklch, var(--primary) 28%, transparent) !important;
}

body.life-organized-active [data-slot="switch"] {
  width: 51px !important;
  height: 31px !important;
  padding: 2px !important;
  border-radius: 9999px !important;
  background: color-mix(in oklch, var(--muted-foreground) 32%, transparent) !important;
  transition: background-color 260ms ease !important;
}

body.life-organized-active [data-slot="switch"][data-state="checked"] {
  background: var(--primary) !important;
}

body.life-organized-active [data-slot="switch"] > span {
  width: 27px !important;
  height: 27px !important;
  transition: transform 260ms cubic-bezier(0.34, 1.56, 0.64, 1) !important;
}

body.life-organized-active [data-slot="switch"][data-state="checked"] > span {
  transform: translateX(20px) !important;
}

body.life-organized-active [data-slot="dialog-content"]:has(#task-title) {
  background: var(--card) !important;
  color: var(--card-foreground) !important;
}

@media (max-width: 639px) {
  body.life-organized-active [data-slot="dialog-content"]:has(#task-title) {
    position: fixed !important;
    top: auto !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    width: 100% !important;
    max-width: 100% !important;
    max-height: 92dvh !important;
    transform: none !important;
    border-radius: 28px 28px 0 0 !important;
    padding: 22px 18px calc(18px + env(safe-area-inset-bottom)) !important;
    animation: organized-sheet-up 320ms cubic-bezier(0.22, 1, 0.36, 1) both !important;
  }
}
`;

const OrganizedPage = dynamic(
  () => import("../organized").then((m) => ({ default: m.OrganizedPage })),
  { ssr: false },
);

export function ToolsOrganizedPage({ uid, setPage, setScreen }) {
  const prefix = uid && uid !== "_" ? `organized_${uid}` : "organized";
  const [mounted, setMounted] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimerRef = useRef(null);

  useEffect(() => {
    const previousTitle = document.title;
    const runtimeStyle = document.createElement("style");
    runtimeStyle.id = ORGANIZED_RUNTIME_STYLE_ID;
    runtimeStyle.textContent = ORGANIZED_RUNTIME_CSS;
    document.getElementById(ORGANIZED_RUNTIME_STYLE_ID)?.remove();
    document.head.appendChild(runtimeStyle);

    setMounted(true);
    document.body.classList.add("life-organized-active");
    document.title = "To-Do";
    return () => {
      document.body.classList.remove("life-organized-active");
      document.title = previousTitle;
      runtimeStyle.remove();
      if (scrollTimerRef.current) window.clearTimeout(scrollTimerRef.current);
    };
  }, []);

  if (!mounted) {
    return <div data-page-tag="#tools_organized_page" />;
  }

  const exit = () => {
    if (typeof setPage === "function") setPage("sidebar_tools");
    else if (typeof setScreen === "function") setScreen("app");
  };

  const overlay = (
    <div
      data-page-tag="#tools_organized_page"
      className={`organized-feature organized-mobile-native${isScrolling ? " is-scrolling" : ""}`}
      onScroll={() => {
        setIsScrolling(true);
        if (scrollTimerRef.current) window.clearTimeout(scrollTimerRef.current);
        scrollTimerRef.current = window.setTimeout(() => setIsScrolling(false), 360);
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9000,
        background: "var(--background)",
        color: "var(--foreground)",
        overflow: "auto",
        overscrollBehavior: "none",
        WebkitOverflowScrolling: "touch",
      }}
    >
      <button
        type="button"
        onClick={exit}
        aria-label="Back to Life"
        className="organized-back-btn"
      >
        <span aria-hidden="true" className="organized-back-arrow">←</span>
        <span>Life</span>
      </button>
      <OrganizedPage storageKeyPrefix={prefix} />
    </div>
  );

  return createPortal(overlay, document.body);
}

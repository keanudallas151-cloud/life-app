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
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Arial, sans-serif !important;
}

body.life-organized-active .organized-mobile-native *,
body.life-organized-active [data-slot="dialog-content"],
body.life-organized-active [data-radix-popper-content-wrapper] * {
  -webkit-tap-highlight-color: transparent !important;
}

body.life-organized-active .organized-mobile-native .organized-feature,
body.life-organized-active .organized-mobile-native .organized-feature > div {
  min-height: 100dvh !important;
  background: var(--background) !important;
}

body.life-organized-active .organized-mobile-native .organized-feature > div > div {
  padding-top: calc(82px + env(safe-area-inset-top)) !important;
  padding-left: 16px !important;
  padding-right: 16px !important;
  padding-bottom: calc(116px + env(safe-area-inset-bottom)) !important;
}

body.life-organized-active .organized-mobile-native > .organized-back-btn {
  top: max(env(safe-area-inset-top), 8px) !important;
  left: 12px !important;
  min-width: 78px !important;
  min-height: 40px !important;
  padding: 0 13px !important;
  border-radius: 9999px !important;
  border: 1px solid color-mix(in oklch, var(--border) 74%, transparent) !important;
  background: color-mix(in oklch, var(--card) 92%, transparent) !important;
  color: var(--primary) !important;
  box-shadow: none !important;
  backdrop-filter: blur(8px) saturate(125%) !important;
  -webkit-backdrop-filter: blur(8px) saturate(125%) !important;
  font-size: 17px !important;
  font-weight: 600 !important;
  opacity: 1 !important;
  transition: opacity 160ms ease, transform 180ms cubic-bezier(0.34, 1.2, 0.64, 1) !important;
}

body.life-organized-active .organized-mobile-native.is-scrolling > .organized-back-btn {
  opacity: 0 !important;
  transform: translateY(-8px) scale(0.98) !important;
  pointer-events: none !important;
}

body.life-organized-active .organized-mobile-native .pl-\\[5\\.5rem\\] {
  padding-left: 0 !important;
}

body.life-organized-active .organized-mobile-native header {
  text-align: center !important;
  margin-bottom: 18px !important;
}

body.life-organized-active .organized-mobile-native header h1 {
  font-size: clamp(2.35rem, 10.4vw, 3.55rem) !important;
  line-height: 1.02 !important;
  letter-spacing: -0.055em !important;
}

body.life-organized-active .organized-mobile-native header .mt-3.flex {
  display: flex !important;
  justify-content: center !important;
  gap: 8px !important;
  flex-wrap: wrap !important;
  overflow: visible !important;
  padding: 0 0 4px !important;
}

body.life-organized-active .organized-mobile-native header .organized-stat-chip {
  min-height: 38px !important;
  min-width: 78px !important;
  padding: 8px 13px !important;
  border-radius: 9999px !important;
  font-size: 15px !important;
  line-height: 1 !important;
  font-weight: 700 !important;
  background: color-mix(in oklch, var(--card) 86%, var(--muted)) !important;
  border: 1px solid color-mix(in oklch, var(--border) 82%, transparent) !important;
  box-shadow: none !important;
}

body.life-organized-active .organized-bottom-nav {
  border-top: 0 !important;
  background: color-mix(in oklch, var(--background) 94%, transparent) !important;
  box-shadow: 0 -10px 24px color-mix(in oklch, var(--background) 68%, transparent) !important;
  backdrop-filter: blur(12px) saturate(145%) !important;
  -webkit-backdrop-filter: blur(12px) saturate(145%) !important;
  padding-bottom: max(env(safe-area-inset-bottom), 8px) !important;
}

body.life-organized-active .organized-bottom-nav > div {
  max-width: 430px !important;
  padding: 8px 12px 6px !important;
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
  min-height: 54px !important;
  min-width: 54px !important;
  border-radius: 15px !important;
  background: transparent !important;
  box-shadow: none !important;
  color: var(--muted-foreground) !important;
}

body.life-organized-active .organized-nav-item.is-active {
  background: transparent !important;
  color: var(--primary) !important;
}

body.life-organized-active .organized-nav-item.is-active::after {
  content: "" !important;
  position: absolute !important;
  left: 50% !important;
  bottom: 3px !important;
  width: 22px !important;
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
  width: 62px !important;
  height: 62px !important;
  border-radius: 9999px !important;
  border: 0 !important;
  outline: 0 !important;
  background: var(--primary) !important;
  box-shadow: 0 8px 22px color-mix(in oklch, var(--primary) 28%, transparent) !important;
}

body.life-organized-active [data-slot="dialog-overlay"] {
  backdrop-filter: blur(5px) !important;
  -webkit-backdrop-filter: blur(5px) !important;
}

body.life-organized-active [data-radix-popper-content-wrapper] {
  z-index: 10050 !important;
}

body.life-organized-active .organized-legal-overlay {
  padding: max(10px, env(safe-area-inset-top)) 10px max(10px, env(safe-area-inset-bottom)) !important;
}

body.life-organized-active .organized-feature [data-slot="card"],
body.life-organized-active .organized-feature .bg-card,
body.life-organized-active .organized-feature button {
  box-shadow: none !important;
  transition-property: border-color, background-color, color, transform, opacity !important;
  transition-duration: 110ms !important;
}

@media (hover: none), (pointer: coarse) {
  body.life-organized-active .organized-feature [data-slot="card"]:hover,
  body.life-organized-active .organized-feature .bg-card:hover,
  body.life-organized-active .organized-fab:hover,
  body.life-organized-active .organized-back-btn:hover {
    transform: none !important;
    box-shadow: none !important;
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
  const isScrollingRef = useRef(false);
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
        if (!isScrollingRef.current) {
          isScrollingRef.current = true;
          setIsScrolling(true);
        }
        if (scrollTimerRef.current) window.clearTimeout(scrollTimerRef.current);
        scrollTimerRef.current = window.setTimeout(() => {
          isScrollingRef.current = false;
          setIsScrolling(false);
        }, 220);
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

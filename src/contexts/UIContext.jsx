/**
 * UIContext — holds UI-only state that doesn't belong to auth or content data.
 *
 * Extracted from the God Component (src/App.jsx) so that sidebar accordion
 * toggles, the narrow-viewport flag, and similar "unrelated UI" changes no
 * longer force the entire LifeAppContent tree to re-render.
 *
 * Consumers: import { useUIContext } from "./UIContext";
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const UIContext = createContext(null);

export function UIProvider({ children }) {
  // ── Sidebar open/close ──────────────────────────────────────────────────
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ── Sidebar accordion sections ──────────────────────────────────────────
  const [lifeOpen, setLifeOpen] = useState(true);
  const [libOpen, setLibOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [socialsOpen, setSocialsOpen] = useState(false);
  const [guidedOpen, setGuidedOpen] = useState(false);
  const [savedOpen, setSavedOpen] = useState(false);
  const [experienceOpen, setExperienceOpen] = useState(false);
  const [experienceTopic, setExperienceTopic] = useState(null);

  // ── Responsive viewport detection ───────────────────────────────────────
  const [isNarrowViewport, setIsNarrowViewport] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return undefined;
    const media = window.matchMedia("(max-width: 767px)");
    const sync = () => setIsNarrowViewport(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  // ── Scroll-to-top button visibility ────────────────────────────────────
  const [showScrollTop, setShowScrollTop] = useState(false);

  // ── PWA Add-to-Home-Screen ──────────────────────────────────────────────
  const [shareToast, setShareToast] = useState(false);

  // ── Stable close-all helper ─────────────────────────────────────────────
  const closeAllAccordions = useCallback(() => {
    setLifeOpen(false);
    setLibOpen(false);
    setToolsOpen(false);
    setSocialsOpen(false);
    setGuidedOpen(false);
    setSavedOpen(false);
    setExperienceOpen(false);
  }, []);

  const value = useMemo(
    () => ({
      // sidebar open/close
      sidebarOpen,
      setSidebarOpen,
      // accordion sections
      lifeOpen, setLifeOpen,
      libOpen, setLibOpen,
      toolsOpen, setToolsOpen,
      socialsOpen, setSocialsOpen,
      guidedOpen, setGuidedOpen,
      savedOpen, setSavedOpen,
      experienceOpen, setExperienceOpen,
      experienceTopic, setExperienceTopic,
      // responsive
      isNarrowViewport,
      // misc UI
      showScrollTop, setShowScrollTop,
      shareToast, setShareToast,
      // helpers
      closeAllAccordions,
    }),
    [
      sidebarOpen,
      lifeOpen, libOpen, toolsOpen, socialsOpen,
      guidedOpen, savedOpen, experienceOpen, experienceTopic,
      isNarrowViewport,
      showScrollTop,
      shareToast,
      closeAllAccordions,
    ],
  );

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUIContext() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error("useUIContext must be used inside <UIProvider>");
  return ctx;
}

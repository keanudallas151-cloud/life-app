"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const OrganizedPage = dynamic(
  () => import("./organized").then((m) => ({ default: m.OrganizedPage })),
  { ssr: false },
);

export function ToolsOrganizedPage({ uid, setPage, setScreen }) {
  const prefix = uid && uid !== "_" ? `organized_${uid}` : "organized";
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.body.classList.add("life-organized-active");
    return () => {
      document.body.classList.remove("life-organized-active");
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
      className="organized-feature"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9000,
        background: "var(--background)",
        color: "var(--foreground)",
        overflow: "auto",
        WebkitOverflowScrolling: "touch",
      }}
    >
      <button
        type="button"
        onClick={exit}
        aria-label="Back to Life"
        style={{
          position: "fixed",
          top: "max(12px, env(safe-area-inset-top))",
          left: "max(12px, env(safe-area-inset-left))",
          zIndex: 60,
          height: 44,
          minWidth: 44,
          padding: "0 16px",
          borderRadius: 999,
          border: "1px solid var(--border)",
          background: "color-mix(in oklab, var(--card) 85%, transparent)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          color: "var(--foreground)",
          fontSize: 14,
          fontWeight: 600,
          cursor: "pointer",
          boxShadow:
            "0 6px 18px color-mix(in oklab, var(--foreground) 12%, transparent)",
        }}
      >
        ← Life
      </button>
      <OrganizedPage storageKeyPrefix={prefix} />
    </div>
  );

  return createPortal(overlay, document.body);
}

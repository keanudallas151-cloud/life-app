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
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9000,
        background: "var(--background, #fff)",
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
          zIndex: 10000,
          height: 40,
          minWidth: 40,
          padding: "0 14px",
          borderRadius: 999,
          border: "1px solid rgba(0,0,0,0.12)",
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          color: "#111",
          fontSize: 13,
          fontWeight: 600,
          cursor: "pointer",
          boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
        }}
      >
        ← Life
      </button>
      <OrganizedPage storageKeyPrefix={prefix} />
    </div>
  );

  return createPortal(overlay, document.body);
}

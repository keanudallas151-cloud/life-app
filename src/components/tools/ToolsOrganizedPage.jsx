"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const OrganizedPage = dynamic(
  () => import("../organized").then((m) => ({ default: m.OrganizedPage })),
  { ssr: false },
);

export function ToolsOrganizedPage({ uid, setPage, setScreen }) {
  const prefix = uid && uid !== "_" ? `organized_${uid}` : "organized";
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const previousTitle = document.title;
    setMounted(true);
    document.body.classList.add("life-organized-active");
    document.title = "To-Do";
    return () => {
      document.body.classList.remove("life-organized-active");
      document.title = previousTitle;
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

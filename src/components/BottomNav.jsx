"use client";

import { useEffect, useState } from "react";
import {
  countUnreadNotifications,
  loadNotificationsFor,
} from "../systems/notifications";

export function BottomNav({
  t,
  dark,
  page,
  play,
  setPage,
  onOpenQuiz,
  setSidebarOpen,
  showNotif,
  setShowNotif,
  unreadCount,
  initials,
  userEmail,
}) {
  const [syncedUnreadCount, setSyncedUnreadCount] = useState(unreadCount);

  useEffect(() => {
    let active = true;

    const syncNotificationMirror = () => {
      if (!active) return;

      const notifications = loadNotificationsFor(userEmail || "_");
      setSyncedUnreadCount(countUnreadNotifications(notifications));
    };

    syncNotificationMirror();

    const handleMirrorUpdate = () => {
      syncNotificationMirror();
    };

    window.addEventListener("storage", handleMirrorUpdate);
    window.addEventListener("life_notifications_updated", handleMirrorUpdate);

    return () => {
      active = false;
      window.removeEventListener("storage", handleMirrorUpdate);
      window.removeEventListener("life_notifications_updated", handleMirrorUpdate);
    };
  }, [page, showNotif, unreadCount, userEmail]);

  const badgeCount = Number.isFinite(syncedUnreadCount)
    ? syncedUnreadCount
    : unreadCount;

  const iosfont = "-apple-system, SF Pro Text, Helvetica Neue, Arial, sans-serif";

  // Helper: render an active dot indicator
  const ActiveDot = ({ active }) => active ? (
    <span aria-hidden style={{
      display: "block",
      width: 4, height: 4,
      borderRadius: "50%",
      background: t.green,
      margin: "0 auto",
      marginTop: 1,
      opacity: 1,
      transform: "scale(1)",
      transition: "transform 0.22s cubic-bezier(0.34,1.56,0.64,1), opacity 0.2s ease",
      boxShadow: `0 0 6px ${t.green}88`,
    }} />
  ) : (
    <span aria-hidden style={{ display: "block", width: 4, height: 4, borderRadius: "50%", margin: "0 auto", marginTop: 1, opacity: 0 }} />
  );

  return (
    <nav
      className={`life-bottom-nav${dark ? " life-bottom-nav-dark" : ""}`}
      role="navigation"
      aria-label="Main navigation"
      style={{ fontFamily: iosfont }}
    >
      {/* Home */}
      <button
        className={`life-bottom-nav-item${page === "home" ? " life-bottom-nav-item--active" : ""}`}
        onClick={() => {
          play("tap");
          setPage("home");
          setSidebarOpen(false);
        }}
        aria-label="Home"
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke={page === "home" ? t.green : t.muted}
          strokeWidth={page === "home" ? 2.5 : 1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
        <span className="life-bottom-nav-label" style={{ color: page === "home" ? t.green : t.muted, fontFamily: iosfont }}>
          Home
        </span>
        <ActiveDot active={page === "home"} />
      </button>

      {/* Library / Reading */}
      <button
        className={`life-bottom-nav-item${page === "reading" || page === "where_to_start" || page === "categories" || page === "category_hub" ? " life-bottom-nav-item--active" : ""}`}
        onClick={() => {
          play("tap");
          setPage("where_to_start");
          setSidebarOpen(false);
        }}
        aria-label="Library"
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke={
            page === "reading" || page === "where_to_start" || page === "categories" || page === "category_hub"
              ? t.green
              : t.muted
          }
          strokeWidth={
            page === "reading" || page === "where_to_start" || page === "categories" || page === "category_hub" ? 2.5 : 1.8
          }
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
        </svg>
        <span className="life-bottom-nav-label" style={{ color: page === "reading" || page === "where_to_start" || page === "categories" || page === "category_hub" ? t.green : t.muted, fontFamily: iosfont }}>
          Library
        </span>
        <ActiveDot active={page === "reading" || page === "where_to_start" || page === "categories" || page === "category_hub"} />
      </button>

      {/* Quiz */}
      <button
        className={`life-bottom-nav-item${page === "quiz" ? " life-bottom-nav-item--active" : ""}`}
        onClick={() => {
          play("tap");
          if (typeof onOpenQuiz === "function") onOpenQuiz();
          else setPage("quiz");
          setSidebarOpen(false);
        }}
        aria-label="Quiz"
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke={page === "quiz" ? t.green : t.muted}
          strokeWidth={page === "quiz" ? 2.5 : 1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        <span className="life-bottom-nav-label" style={{ color: page === "quiz" ? t.green : t.muted, fontFamily: iosfont }}>
          Quiz
        </span>
        <ActiveDot active={page === "quiz"} />
      </button>

      {/* Notifications */}
      <button
        className="life-bottom-nav-item"
        onClick={() => {
          play("tap");
          setShowNotif(!showNotif);
        }}
        aria-label="Notifications"
        style={{ position: "relative" }}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke={showNotif ? t.green : t.muted}
          strokeWidth={showNotif ? 2.5 : 1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 01-3.46 0" />
        </svg>
        {badgeCount > 0 && (
          <span className="life-bottom-nav-badge">
            {badgeCount > 9 ? "9+" : badgeCount}
          </span>
        )}
        <span className="life-bottom-nav-label" style={{ color: showNotif ? t.green : t.muted, fontFamily: iosfont }}>
          Alerts
        </span>
        <ActiveDot active={showNotif} />
      </button>

      {/* Profile / More */}
      <button
        className={`life-bottom-nav-item${page === "profile" || page === "setting_preferences" ? " life-bottom-nav-item--active" : ""}`}
        onClick={() => {
          play("tap");
          setPage("profile");
          setSidebarOpen(false);
        }}
        aria-label="Profile"
      >
        <div
          style={{
            width: 26,
            height: 26,
            borderRadius: "50%",
            background: page === "profile" || page === "setting_preferences"
              ? t.green
              : `rgba(255,255,255,0.08)`,
            border: `2px solid ${page === "profile" || page === "setting_preferences" ? t.green : "rgba(255,255,255,0.15)"}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "background 0.2s ease, border-color 0.2s ease, transform 0.22s cubic-bezier(0.34,1.56,0.64,1)",
            transform: page === "profile" || page === "setting_preferences" ? "scale(1.1)" : "scale(1)",
            boxShadow: page === "profile" || page === "setting_preferences" ? `0 2px 8px ${t.green}55` : "none",
          }}
        >
          <span
            style={{
              fontSize: 9,
              fontWeight: 700,
              color: page === "profile" || page === "setting_preferences" ? "#000" : t.muted,
              lineHeight: 1,
              fontFamily: iosfont,
            }}
          >
            {initials.slice(0, 2)}
          </span>
        </div>
        <span
          className="life-bottom-nav-label"
          style={{
            color: page === "profile" || page === "setting_preferences" ? t.green : t.muted,
            fontFamily: iosfont,
          }}
        >
          Profile
        </span>
        <ActiveDot active={page === "profile" || page === "setting_preferences"} />
      </button>
    </nav>
  );
}

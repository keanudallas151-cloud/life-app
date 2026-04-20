"use client";

import { useEffect, useState } from "react";
import { isSupabaseConfigured, supabase } from "../supabaseClient";

function countUnread(list) {
  if (!Array.isArray(list)) return 0;
  return list.filter((item) => item && item.read !== true).length;
}

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
}) {
  const [syncedUnreadCount, setSyncedUnreadCount] = useState(unreadCount);

  useEffect(() => {
    let active = true;

    const syncNotificationMirror = async () => {
      if (typeof window === "undefined") return;

      const guestKey = "notif__";
      let sourceKey = guestKey;

      if (isSupabaseConfigured) {
        try {
          const { data } = await supabase.auth.getUser();
          const email = data?.user?.email;
          if (email) {
            sourceKey = `notif_${email}`;
          }
        } catch (error) {
          console.error("Failed to read auth user for notifications", error);
        }
      }

      const raw = window.localStorage.getItem(sourceKey);
      if (raw !== null && sourceKey !== guestKey) {
        window.localStorage.setItem(guestKey, raw);
      }

      if (!active) return;

      try {
        const parsed = raw !== null ? JSON.parse(raw) : null;
        if (Array.isArray(parsed)) {
          setSyncedUnreadCount(countUnread(parsed));
          return;
        }
      } catch {
        // fall through to prop value
      }

      setSyncedUnreadCount(unreadCount);
    };

    syncNotificationMirror();
    return () => {
      active = false;
    };
  }, [page, showNotif, unreadCount]);

  const badgeCount = Number.isFinite(syncedUnreadCount)
    ? syncedUnreadCount
    : unreadCount;

  return (
    <nav
      className={`life-bottom-nav${dark ? " life-bottom-nav-dark" : ""}`}
      role="navigation"
      aria-label="Main navigation"
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
        <span
          className="life-bottom-nav-label"
          style={{ color: page === "home" ? t.green : t.muted }}
        >
          Home
        </span>
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
        <span
          className="life-bottom-nav-label"
          style={{
            color:
              page === "reading" || page === "where_to_start" || page === "categories" || page === "category_hub"
                ? t.green
                : t.muted,
          }}
        >
          Library
        </span>
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
        <span
          className="life-bottom-nav-label"
          style={{ color: page === "quiz" ? t.green : t.muted }}
        >
          Quiz
        </span>
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
        <span
          className="life-bottom-nav-label"
          style={{ color: showNotif ? t.green : t.muted }}
        >
          Alerts
        </span>
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
            width: 24,
            height: 24,
            borderRadius: "50%",
            background:
              page === "profile" || page === "setting_preferences"
                ? t.green
                : "transparent",
            border: `2px solid ${page === "profile" || page === "setting_preferences" ? t.green : t.muted}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontSize: 9,
              fontWeight: 700,
              color:
                page === "profile" || page === "setting_preferences"
                  ? "#fff"
                  : t.muted,
              lineHeight: 1,
            }}
          >
            {initials.slice(0, 2)}
          </span>
        </div>
        <span
          className="life-bottom-nav-label"
          style={{
            color:
              page === "profile" || page === "setting_preferences"
                ? t.green
                : t.muted,
          }}
        >
          Profile
        </span>
      </button>
    </nav>
  );
}

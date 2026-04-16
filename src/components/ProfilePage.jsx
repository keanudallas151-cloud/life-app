import React from "react";
import MomentumCard from "./MomentumCard";

export default function ProfilePage({
  t,
  user,
  play,
  setPage,
  readKeys,
  bookmarks,
  readingStreak,
  completedNotes,
  savedHighlightsCount,
  momentumSnapshot,
  openMomentumHub,
  initials,
  doSignOut,
}) {
  return (
              <div
                className="life-profile-page"
                data-page-tag="#profile"
                style={{
                  padding: "48px 28px",
                  maxWidth: 480,
                  margin: "0 auto",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 20,
                    marginBottom: 36,
                  }}
                >
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    <div
                      style={{
                        width: 74,
                        height: 74,
                        borderRadius: "50%",
                        background: `linear-gradient(135deg, ${t.green}, #2d6e42)`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: `0 0 0 3px ${t.white}, 0 0 0 5px ${t.green}44`,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 26,
                          fontWeight: 800,
                          color: "#fff",
                          letterSpacing: -0.5,
                        }}
                      >
                        {initials}
                      </span>
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <h2
                      style={{
                        margin: "0 0 4px",
                        fontSize: 22,
                        fontWeight: 700,
                        color: t.ink,
                      }}
                    >
                      {user?.name}
                    </h2>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 14,
                        color: t.muted,
                        fontStyle: "italic",
                      }}
                    >
                      {user?.email}
                    </p>
                  </div>
                  {/* P10: Gear icon → setting_preferences */}
                  <button
                    onClick={() => {
                      play("tap");
                      setPage("setting_preferences");
                    }}
                    title="Settings"
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      background: t.light,
                      border: `1px solid ${t.border}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      flexShrink: 0,
                    }}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={t.mid}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="3" />
                      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
                    </svg>
                  </button>
                </div>
                <div
                  className="life-profile-card"
                  style={{
                    background: t.white,
                    border: `1px solid ${t.border}`,
                    borderRadius: 14,
                    padding: 24,
                    marginBottom: 20,
                  }}
                >
                  <p
                    style={{
                      margin: "0 0 16px",
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: 2.5,
                      textTransform: "uppercase",
                      color: t.muted,
                    }}
                  >
                    Your Stats
                  </p>
                  {[
                    ["Topics Read", readKeys.length],
                    ["Bookmarks Saved", bookmarks.length],
                    ["Notes Written", completedNotes],
                    ["Quotes Saved", savedHighlightsCount],
                    [
                      "Reading streak",
                      readingStreak.count > 0
                        ? `${readingStreak.count} day${readingStreak.count === 1 ? "" : "s"}`
                        : "Open a topic to start",
                    ],
                  ].map(([label, val]) => (
                    <div
                      key={label}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "12px 0",
                        borderBottom: `1px solid ${t.light}`,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 15,
                          color: t.mid,
                          fontFamily: "Georgia,serif",
                        }}
                      >
                        {label}
                      </span>
                      <span
                        style={{
                          fontSize: 15,
                          fontWeight: 700,
                          color: t.green,
                        }}
                      >
                        {val}
                      </span>
                    </div>
                  ))}
                </div>
                <div style={{ marginBottom: 20 }}>
                  <MomentumCard
                    snapshot={momentumSnapshot}
                    onOpenHub={openMomentumHub}
                    title="Your momentum"
                  />
                </div>
                <div style={{ marginBottom: 8 }}>
                  <p
                    style={{
                      margin: "0 0 8px",
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: 2.2,
                      textTransform: "uppercase",
                      color: t.muted,
                    }}
                  >
                    Account
                  </p>
                </div>
                <button
                  onClick={doSignOut}
                  style={{
                    width: "100%",
                    background: "none",
                    border: `1.5px solid ${t.border}`,
                    borderRadius: 12,
                    padding: "15px",
                    color: t.red,
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "Georgia,serif",
                  }}
                >
                  Sign Out
                </button>
              </div>
  );
}

import { useState } from "react";
import { Ic } from "../icons/Ic";

const SECTIONS = {
  sidebar_life: {
    title: "Life",
    desc: "Life is the core section of the app. It is where users move from motivation into action through guided reading, quizzes, help, and deeper understanding of the system they are trying to win inside.",
    groups: [
      {
        title: "Start here",
        desc: "Open the foundations first when you want direction and structure.",
        items: [
          {
            label: "Where to Start",
            body: "A simple entry point when you want the app to guide your next move.",
            icon: "compass",
            action: "where_to_start",
          },
          {
            label: "Help",
            body: "A quick explanation of how the app works and how to use it well.",
            icon: "question",
            action: "help",
          },
        ],
      },
      {
        title: "Build momentum",
        desc: "The consistency tools that keep you moving and returning daily.",
        items: [
          {
            label: "Momentum Hub",
            body: "A progress-focused view of missions, streaks, and your next best step.",
            icon: "trending",
            action: "momentum_hub",
          },
          {
            label: "Daily Growth",
            body: "A focused daily page for keeping momentum visible without hunting through the app.",
            icon: "star",
            action: "daily_growth",
          },
          {
            label: "Goals",
            body: "Turn ideas into trackable goals with deadlines and steady follow-through.",
            icon: "pin",
            action: "goal_setting",
          },
        ],
      },
      {
        title: "Practice and refine",
        desc: "Use active repetition and quick checks to retain more of what you learn.",
        items: [
          {
            label: "Quiz",
            body: "Test understanding and turn reading into retained knowledge.",
            icon: "brain",
            action: "quiz",
          },
        ],
      },
    ],
  },
  sidebar_library: {
    title: "Library",
    desc: "The Library is the knowledge base of Life. It organizes the reading material into categories and branches so users can explore the app by topic instead of only following one fixed path.",
  },
  sidebar_tools: {
    title: "Tools",
    desc: "Tools are small utilities that help you put what you learn into action. Instead of one long page, each tool lives as its own item in the sidebar so you can jump straight to the one you need. Lock In is the first tool available — a focused work session with task planning, a timer, and optional short breaks. More tools will be added here over time.",
  },
  sidebar_socials: {
    title: "Socials",
    desc: "Socials is where learning connects with people. This section holds the community feed, networking, and competitive views so users can move from private learning into public conversation and connection.",
  },
  sidebar_guided: {
    title: "Guided",
    desc: "Guided is the curated path through Life. It gives users a simpler route when they do not want to explore the full library and would rather follow a recommended sequence.",
  },
  sidebar_saved: {
    title: "Saved",
    desc: "Saved is the user\u2019s personal shelf. It collects bookmarked topics so important ideas are easy to revisit without searching through the full app again.",
  },
  sidebar_experience: {
    title: "Experience",
    desc: "Experience focuses on how Life feels across devices: cleaner visualization, responsive mobile layout, thoughtful sounds, and smoother animations without overwhelming motion.",
    items: [
      [
        "Visualization",
        "Improve readability and information clarity with better visual hierarchy and layout balance.",
      ],
      [
        "Sounds",
        "Tune sound behavior with practical defaults and settings that work in both focused and full modes.",
      ],
      [
        "Animations",
        "Use subtle motion to communicate state changes and navigation without harming performance.",
      ],
      [
        "Mobile Integration",
        "Keep touch targets, safe-area spacing, and navigation reliable across modern phone sizes.",
      ],
      [
        "Sidebar Quality",
        "Keep the sidebar scannable with clear grouping, meaningful labels, and consistent interaction patterns.",
      ],
    ],
  },
};

export function SidebarSectionPage({
  sectionKey,
  t,
  onLifeNavigate,
}) {
  const section = SECTIONS[sectionKey];
  const [openGroups, setOpenGroups] = useState(() =>
    sectionKey === "sidebar_life" ? { "Start here": true } : {},
  );
  if (!section) return null;

  const toggleGroup = (title) =>
    setOpenGroups((prev) => ({ ...prev, [title]: !prev[title] }));

  return (
    <div
      data-page-tag={`#${sectionKey}_page`}
      style={{ padding: "clamp(24px, 5vw, 48px) clamp(16px, 4vw, 28px)", maxWidth: 620, margin: "0 auto" }}
    >
      <p style={{ margin: "0 0 10px", fontSize: 10, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: t.green }}>
        Sidebar category
      </p>
      <h2 style={{ margin: "0 0 14px", fontSize: 28, fontWeight: 700, color: t.ink, fontFamily: "Georgia,serif" }}>
        {section.title}
      </h2>
      <p style={{ margin: section.items ? "0 0 22px" : 0, color: t.mid, fontSize: 15, lineHeight: 1.85, fontFamily: "Georgia,serif" }}>
        {section.desc}
      </p>
      {section.groups && sectionKey === "sidebar_life" && (
        <div style={{ display: "grid", gap: 14 }}>
          {section.groups.map((group) => {
            const isOpen = !!openGroups[group.title];
            return (
              <section
                key={group.title}
                className="life-card-hover"
                style={{
                  background: t.white,
                  border: `1px solid ${t.border}`,
                  borderRadius: 18,
                  padding: "16px 16px 14px",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
                }}
              >
                <button
                  type="button"
                  onClick={() => toggleGroup(group.title)}
                  style={{
                    width: "100%",
                    background: "none",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    textAlign: "left",
                  }}
                >
                  <div>
                    <p style={{ margin: "0 0 4px", color: t.ink, fontSize: 16, fontWeight: 700 }}>
                      {group.title}
                    </p>
                    <p style={{ margin: 0, color: t.muted, fontSize: 13, lineHeight: 1.7 }}>
                      {group.desc}
                    </p>
                  </div>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    style={{
                      transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
                      transition: "transform 0.2s ease",
                      flexShrink: 0,
                    }}
                  >
                    <polyline
                      points="4,2 8,6 4,10"
                      fill="none"
                      stroke={t.muted}
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                <div
                  style={{
                    maxHeight: isOpen ? 1000 : 0,
                    opacity: isOpen ? 1 : 0,
                    overflow: "hidden",
                    transition: "max-height 0.28s ease, opacity 0.2s ease",
                    paddingTop: isOpen ? 14 : 0,
                  }}
                >
                  <div style={{ display: "grid", gap: 10 }}>
                    {group.items.map((item) => {
                      const Icon =
                        item.icon && typeof Ic[item.icon] === "function"
                          ? Ic[item.icon]
                          : null;
                      return (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => onLifeNavigate?.(item.action)}
                          style={{
                            width: "100%",
                            background: t.light,
                            border: `1px solid ${t.border}`,
                            borderRadius: 14,
                            padding: "14px 14px",
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 12,
                            cursor: "pointer",
                            textAlign: "left",
                          }}
                        >
                          <span
                            aria-hidden
                            style={{
                              width: 36,
                              height: 36,
                              minWidth: 36,
                              minHeight: 36,
                              borderRadius: "50%",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              background: t.white,
                              border: `1px solid ${t.border}`,
                              flexShrink: 0,
                            }}
                          >
                            {Icon ? Icon("none", t.green, 17) : null}
                          </span>
                          <span style={{ flex: 1, minWidth: 0 }}>
                            <span style={{ display: "block", margin: "0 0 4px", color: t.ink, fontSize: 14, fontWeight: 700 }}>
                              {item.label}
                            </span>
                            <span style={{ display: "block", color: t.muted, fontSize: 12.5, lineHeight: 1.7 }}>
                              {item.body}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      )}
      {section.items && !section.groups && (
        <div style={{ display: "grid", gap: 12 }}>
          {section.items.map(([label, body]) => (
            <div
              key={label}
              className="life-card-hover"
              style={{ background: t.white, border: `1px solid ${t.border}`, borderRadius: 16, padding: "18px 18px" }}
            >
              <p style={{ margin: "0 0 6px", color: t.ink, fontSize: 15, fontWeight: 700 }}>{label}</p>
              <p style={{ margin: 0, color: t.muted, fontSize: 13, lineHeight: 1.7 }}>{body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

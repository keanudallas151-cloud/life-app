const SECTIONS = {
  sidebar_life: {
    title: "Life",
    desc: "Life is the core section of the app. It is where users move from motivation into action through guided reading, quizzes, help, and deeper understanding of the system they are trying to win inside.",
    items: [
      ["Where to Start", "A simple entry point for new users who need direction."],
      ["Momentum Hub", "A progress-focused view of consistency, missions, and momentum."],
      ["Daily Growth", "A focused daily page for keeping momentum visible without hunting through the app."],
      ["Quiz", "A way to test understanding and turn reading into retained knowledge."],
      ["Help", "A quick explanation of how the app works and how to use it well."],
    ],
  },
  sidebar_library: {
    title: "Library",
    desc: "The Library is the knowledge base of Life. It organizes the reading material into categories and branches so users can explore the app by topic instead of only following one fixed path.",
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
};

export function SidebarSectionPage({ sectionKey, t }) {
  const section = SECTIONS[sectionKey];
  if (!section) return null;

  return (
    <div
      data-page-tag={`#${sectionKey}_page`}
      style={{ padding: "48px 28px", maxWidth: 620, margin: "0 auto" }}
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
      {section.items && (
        <div style={{ display: "grid", gap: 12 }}>
          {section.items.map(([label, body]) => (
            <div key={label} style={{ background: t.white, border: `1px solid ${t.border}`, borderRadius: 16, padding: "18px 18px" }}>
              <p style={{ margin: "0 0 6px", color: t.ink, fontSize: 15, fontWeight: 700 }}>{label}</p>
              <p style={{ margin: 0, color: t.muted, fontSize: 13, lineHeight: 1.7 }}>{body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function LeaderboardPage({ t, readKeys, bookmarks }) {
  const userScore = readKeys.length * 10 + bookmarks.length * 5;
  const entries = [
    { name: "You", score: userScore, isUser: true },
    { name: "Alex T.", score: 420 },
    { name: "Jordan M.", score: 380 },
    { name: "Sam K.", score: 310 },
    { name: "Riley P.", score: 275 },
    { name: "Casey L.", score: 220 },
    { name: "Morgan D.", score: 185 },
  ]
    .sort((a, b) => b.score - a.score)
    .map((e, i) => ({ ...e, rank: i + 1 }));

  return (
    <div
      data-page-tag="#leaderboard"
      style={{ padding: "48px 28px", maxWidth: 560, margin: "0 auto" }}
    >
      <h2
        style={{
          fontSize: 26,
          fontWeight: 700,
          color: t.ink,
          margin: "0 0 10px",
        }}
      >
        Leaderboard
      </h2>
      <p
        style={{
          color: t.muted,
          fontSize: 15,
          lineHeight: 1.8,
          margin: "0 0 28px",
          fontStyle: "italic",
        }}
      >
        See how you stack up against other Life. members.
      </p>
      {entries.map((entry, index) => (
        <div
          key={`${entry.name}-${index}`}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "14px 18px",
            background: entry.isUser
              ? `linear-gradient(90deg, ${t.greenLt}, transparent)`
              : "transparent",
            borderRadius: 12,
            border: entry.isUser
              ? `1px solid ${t.green}22`
              : `1px solid transparent`,
            marginBottom: 6,
            transition: "background 0.2s",
          }}
        >
          <span
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background:
                entry.rank <= 3
                  ? ["#FFD700", "#C0C0C0", "#CD7F32"][entry.rank - 1]
                  : t.light,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: 800,
              color: entry.rank <= 3 ? "#fff" : t.muted,
              flexShrink: 0,
            }}
          >
            {entry.rank}
          </span>
          <span
            style={{
              flex: 1,
              fontSize: 15,
              fontWeight: entry.isUser ? 700 : 500,
              color: entry.isUser ? t.green : t.ink,
            }}
          >
            {entry.name}
            {entry.isUser ? " (You)" : ""}
          </span>
          <span
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: entry.rank === 1 ? t.gold : t.muted,
            }}
          >
            {entry.score} pts
          </span>
        </div>
      ))}
    </div>
  );
}

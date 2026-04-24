export function MentorshipPage({ t, play, setPage }) {
  return (
    <div
      data-page-tag="#mentorship"
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
        Mentorship
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
        Book a 1-on-1 session with experienced mentors.
      </p>
      {[
        {
          name: "Finance Strategy Session",
          duration: "30 min",
          price: "Premium",
          desc: "Get personalised advice on budgeting, investing, and financial planning.",
        },
        {
          name: "Career Growth Call",
          duration: "45 min",
          price: "Premium",
          desc: "Discuss career moves, side hustles, and income diversification.",
        },
        {
          name: "Mindset Coaching",
          duration: "30 min",
          price: "Premium",
          desc: "Break through limiting beliefs and develop a wealth-building mindset.",
        },
      ].map((s) => (
        <div
          key={s.name}
          style={{
            background: t.white,
            border: `1px solid ${t.border}`,
            borderRadius: 16,
            padding: 22,
            marginBottom: 14,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: 16,
                fontWeight: 700,
                color: t.ink,
              }}
            >
              {s.name}
            </h3>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: 1,
                textTransform: "uppercase",
                color: t.gold,
                background: `${t.gold}18`,
                borderRadius: 6,
                padding: "3px 8px",
              }}
            >
              {s.price}
            </span>
          </div>
          <p
            style={{
              margin: "0 0 12px",
              fontSize: 13,
              color: t.muted,
              lineHeight: 1.6,
            }}
          >
            {s.desc}
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span style={{ fontSize: 12, color: t.muted }}>
              ⏱ {s.duration}
            </span>
            <button
              onClick={() => {
                play("tap");
                setPage("premium");
              }}
              style={{
                background: t.green,
                border: "none",
                borderRadius: 10,
                padding: "10px 20px",
                color: "#fff",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "-apple-system,'SF Pro Display','SF Pro Text','Helvetica Neue',Arial,sans-serif",
              }}
            >
              Book Now →
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export function PremiumPage({ t, play }) {
  return (
    <div
      data-page-tag="#premium"
      style={{
        padding: "48px 28px",
        maxWidth: 560,
        margin: "0 auto",
        textAlign: "center",
      }}
    >
      <h2
        style={{
          fontSize: 28,
          fontWeight: 800,
          color: t.ink,
          margin: "0 0 8px",
        }}
      >
        Go Premium
      </h2>
      <p
        style={{
          color: t.muted,
          fontSize: 15,
          lineHeight: 1.7,
          margin: "0 0 32px",
          fontStyle: "italic",
        }}
      >
        Unlock the full Life. experience.
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: 14,
          maxWidth: 420,
          margin: "0 auto",
        }}
      >
        {[
          {
            tier: "Basic",
            price: "Free",
            features: [
              "Core reading content",
              "Daily Growth tips",
              "Community access",
              "Basic quiz",
            ],
          },
          {
            tier: "Premium",
            price: "$9.99/mo",
            features: [
              "All Basic features",
              "Mentorship booking",
              "Leaderboard access",
              "Advanced challenges",
              "Certificate of Completion",
              "Priority support",
            ],
          },
        ].map((plan) => (
          <div
            key={plan.tier}
            style={{
              background:
                plan.tier === "Premium"
                  ? `linear-gradient(135deg, ${t.greenLt}, ${t.white})`
                  : t.white,
              border: `2px solid ${plan.tier === "Premium" ? t.green : t.border}`,
              borderRadius: 18,
              padding: "24px 16px",
              textAlign: "center",
            }}
          >
            <p
              style={{
                margin: "0 0 4px",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: 2,
                textTransform: "uppercase",
                color: plan.tier === "Premium" ? t.green : t.muted,
              }}
            >
              {plan.tier}
            </p>
            <p
              style={{
                margin: "0 0 16px",
                fontSize: 24,
                fontWeight: 800,
                color: t.ink,
              }}
            >
              {plan.price}
            </p>
            {plan.features.map((f) => (
              <p
                key={f}
                style={{
                  margin: "0 0 6px",
                  fontSize: 12,
                  color: t.mid,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <span style={{ color: t.green }}>✓</span> {f}
              </p>
            ))}
            <button
              onClick={() => play("tap")}
              style={{
                marginTop: 16,
                width: "100%",
                background: plan.tier === "Premium" ? t.green : t.light,
                border:
                  plan.tier === "Premium" ? "none" : `1px solid ${t.border}`,
                borderRadius: 10,
                padding: "12px",
                color: plan.tier === "Premium" ? "#fff" : t.mid,
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "-apple-system,'SF Pro Display','SF Pro Text','Helvetica Neue',Arial,sans-serif",
              }}
            >
              {plan.tier === "Premium" ? "Subscribe" : "Current Plan"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

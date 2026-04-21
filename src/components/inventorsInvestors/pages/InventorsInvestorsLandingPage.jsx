import { useState } from "react";
import {
  FeatureFrame,
  SecondaryButton,
  alpha,
} from "../InventorsInvestorsUI";

function RoleCard({ t, title, kicker, body, points, accent, fading, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="ii-role-card"
      style={{
        position: "relative",
        minHeight: 280,
        borderRadius: 28,
        border: `1px solid ${selected ? alpha(accent, 0.55) : alpha(t.green, 0.16)}`,
        background: `linear-gradient(180deg, ${alpha(accent, 0.12)} 0%, ${alpha(t.white, 0.98)} 46%, ${t.white} 100%)`,
        boxShadow: selected
          ? `0 24px 60px ${alpha(accent, 0.2)}`
          : `0 18px 42px ${alpha(t.ink, 0.1)}`,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "18px 16px 16px",
        textAlign: "left",
        cursor: "pointer",
        transition: "opacity 180ms ease, transform 180ms ease, box-shadow 220ms ease, border-color 220ms ease",
        opacity: fading ? 0.28 : 1,
        transform: fading ? "scale(0.98) translateY(6px)" : selected ? "scale(1.01) translateY(-2px)" : "scale(1)",
        overflow: "hidden",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: -44,
          right: -44,
          width: 128,
          height: 128,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${alpha(accent, 0.26)} 0%, ${alpha(accent, 0.08)} 45%, transparent 72%)`,
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          bottom: -26,
          left: -26,
          width: 88,
          height: 88,
          borderRadius: "50%",
          border: `1px solid ${alpha(accent, 0.18)}`,
          pointerEvents: "none",
        }}
      />

      <div style={{ position: "relative", zIndex: 1 }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 12px",
            borderRadius: 999,
            background: alpha(accent, 0.12),
            color: accent,
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: 1.4,
            textTransform: "uppercase",
          }}
        >
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: accent }} />
          {kicker}
        </div>

        <div className="ii-role-card-title" style={{ marginTop: 16, fontSize: "clamp(28px, 7vw, 32px)", lineHeight: 0.96, fontWeight: 800, color: t.ink, fontFamily: "Georgia, serif", letterSpacing: -0.8 }}>
          {title}
        </div>
        <div className="ii-role-card-body" style={{ marginTop: 12, fontSize: 13, lineHeight: 1.7, color: t.mid }}>
          {body}
        </div>
      </div>

      <div className="ii-role-card-points" style={{ position: "relative", zIndex: 1, display: "grid", gap: 8, marginTop: 16 }}>
        {points.map((point) => (
          <div
            key={point}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
              padding: "10px 12px",
              borderRadius: 16,
              background: alpha(t.skin, 0.9),
              border: `1px solid ${alpha(accent, 0.1)}`,
            }}
          >
            <span style={{ color: accent, fontSize: 13, fontWeight: 800, lineHeight: 1.2 }}>+</span>
            <span style={{ color: t.ink, fontSize: 12.5, lineHeight: 1.55 }}>{point}</span>
          </div>
        ))}
      </div>
    </button>
  );
}

export function InventorsInvestorsLandingPage({ t, onChooseRole, onGoMessages, hasMessages }) {
  const [leavingRole, setLeavingRole] = useState("");

  const handleChoose = (role) => {
    if (leavingRole) return;
    setLeavingRole(role);
    window.setTimeout(() => onChooseRole?.(role), 190);
  };

  return (
    <FeatureFrame
      t={t}
      eyebrow="Networking"
      title="Investors & Inventors"
      subtitle="Pick your side, then move into a cleaner deck that feels closer to a real mobile discovery app."
      actions={hasMessages ? <SecondaryButton t={t} onClick={onGoMessages}>Messages</SecondaryButton> : null}
    >
      <div style={{ display: "grid", gap: 16 }}>
        <div
          className="ii-role-intro"
          style={{
            position: "relative",
            overflow: "hidden",
            borderRadius: 24,
            border: `1px solid ${alpha(t.green, 0.16)}`,
            background: `linear-gradient(180deg, ${alpha(t.green, 0.08)} 0%, ${t.white} 100%)`,
            boxShadow: `0 20px 50px ${alpha(t.ink, 0.08)}`,
            padding: "18px 16px",
          }}
        >
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              top: -36,
              right: -34,
              width: 132,
              height: 132,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${alpha(t.green, 0.18)} 0%, transparent 68%)`,
            }}
          />
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", color: t.green }}>
              Pick your lane
            </div>
            <div style={{ marginTop: 8, fontSize: 14, lineHeight: 1.7, color: t.mid, maxWidth: 560 }}>
              Tinder feels clean because it shows one strong choice at a time. This screen now pushes toward that same mobile rhythm instead of cramming both roles too tightly.
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
              {[
                "Cleaner mobile sizing",
                "Less cramped text",
                "Tap to choose",
              ].map((item) => (
                <div
                  key={item}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 999,
                    background: alpha(t.green, 0.08),
                    border: `1px solid ${alpha(t.green, 0.14)}`,
                    color: t.ink,
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="ii-role-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 14 }}>
          <RoleCard
            t={t}
            title="Investor"
            kicker="Explorer"
            body="Set the profiles you want to see and move through them quickly in a sharper deck."
            points={[
              "Show budget and range clearly",
              "Filter by stage and category",
              "Move faster through strong profiles",
            ]}
            accent={t.green}
            selected={leavingRole === "investor"}
            fading={Boolean(leavingRole) && leavingRole !== "investor"}
            onClick={() => handleChoose("investor")}
          />
          <RoleCard
            t={t}
            title="Inventor"
            kicker="Builder"
            body="Show your photos, summary, ask, and traction in a layout that is faster to scan."
            points={[
              "Lead with product imagery",
              "Surface the key facts earlier",
              "Look more polished in discovery",
            ]}
            accent={t.ink}
            selected={leavingRole === "inventor"}
            fading={Boolean(leavingRole) && leavingRole !== "inventor"}
            onClick={() => handleChoose("inventor")}
          />
        </div>

        <div className="ii-role-footer-note" style={{ textAlign: "center", fontSize: 12.5, color: t.mid }}>
          Tap the card that matches your side. On mobile, you can also swipe the role cards horizontally to compare them more comfortably.
        </div>
      </div>
    </FeatureFrame>
  );
}

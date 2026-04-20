import { useState } from "react";
import {
  FeatureFrame,
  SecondaryButton,
  alpha,
} from "../InventorsInvestorsUI";

function RoleCard({ t, title, body, fading, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        minHeight: 240,
        borderRadius: 24,
        border: `1px solid ${alpha(t.green, 0.16)}`,
        background: `linear-gradient(180deg, ${alpha(t.green, 0.06)} 0%, ${t.white} 100%)`,
        boxShadow: `0 18px 42px ${alpha(t.ink, 0.1)}`,
        display: "grid",
        placeItems: "center",
        padding: "18px 14px",
        textAlign: "center",
        cursor: "pointer",
        transition: "opacity 160ms ease, transform 160ms ease",
        opacity: fading ? 0.35 : 1,
        transform: fading ? "scale(0.98)" : "scale(1)",
      }}
    >
      <div>
        <div style={{ fontSize: 28, lineHeight: 1, fontWeight: 800, color: t.ink, fontFamily: "Georgia, serif" }}>{title}</div>
        <div style={{ marginTop: 12, fontSize: 13, lineHeight: 1.7, color: t.mid }}>{body}</div>
      </div>
    </button>
  );
}

export function InventorsInvestorsLandingPage({ t, onChooseRole, onGoMessages, hasMessages }) {
  const [leavingRole, setLeavingRole] = useState("");

  const handleChoose = (role) => {
    if (leavingRole) return;
    setLeavingRole(role);
    window.setTimeout(() => onChooseRole?.(role), 170);
  };

  return (
    <FeatureFrame
      t={t}
      eyebrow="Networking"
      title="Inventors & Investors"
      subtitle="Choose your side first, then make your account, then move into discovery."
      actions={hasMessages ? <SecondaryButton t={t} onClick={onGoMessages}>Messages</SecondaryButton> : null}
    >
      <div style={{ display: "grid", gap: 14 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
          <RoleCard
            t={t}
            title="Investor"
            body="Set your budget, range, stage, and industries."
            fading={Boolean(leavingRole) && leavingRole !== "investor"}
            onClick={() => handleChoose("investor")}
          />
          <RoleCard
            t={t}
            title="Inventor"
            body="Show your idea, revenue, traction, and funding ask."
            fading={Boolean(leavingRole) && leavingRole !== "inventor"}
            onClick={() => handleChoose("inventor")}
          />
        </div>
        <div style={{ textAlign: "center", fontSize: 12, color: t.mid }}>
          Tap the left or right card to continue.
        </div>
      </div>
    </FeatureFrame>
  );
}

import { useMemo, useRef, useState } from "react";
import {
  EmptyState,
  FeatureFrame,
  PrimaryButton,
  SecondaryButton,
  alpha,
} from "../InventorsInvestorsUI";

const ROLE_SWIPE_TRIGGER = 84;

function RoleSwipeChooser({ t, onChooseRole }) {
  const [offsetX, setOffsetX] = useState(0);
  const [animatingOut, setAnimatingOut] = useState(false);
  const startRef = useRef({ x: 0, y: 0, dragging: false });

  const activeRole = useMemo(() => {
    if (offsetX <= -24) return "investor";
    if (offsetX >= 24) return "inventor";
    return "";
  }, [offsetX]);

  const beginDrag = (x, y) => {
    if (animatingOut) return;
    startRef.current = { x, y, dragging: true };
  };

  const moveDrag = (x, y) => {
    if (!startRef.current.dragging || animatingOut) return;
    const deltaX = x - startRef.current.x;
    const deltaY = y - startRef.current.y;
    if (Math.abs(deltaY) > Math.abs(deltaX)) return;
    setOffsetX(Math.max(-160, Math.min(160, deltaX)));
  };

  const finishDrag = () => {
    if (!startRef.current.dragging || animatingOut) return;
    startRef.current.dragging = false;

    if (Math.abs(offsetX) < ROLE_SWIPE_TRIGGER) {
      setOffsetX(0);
      return;
    }

    const nextRole = offsetX < 0 ? "investor" : "inventor";
    const direction = offsetX < 0 ? -1 : 1;
    setAnimatingOut(true);
    setOffsetX(direction * 260);

    window.setTimeout(() => {
      onChooseRole?.(nextRole);
    }, 180);
  };

  const swipeLabelStyle = (role) => ({
    flex: 1,
    minHeight: 54,
    borderRadius: 16,
    border: `1px solid ${activeRole === role ? alpha(t.green, 0.4) : t.border}`,
    background: activeRole === role ? alpha(t.green, 0.1) : t.skin,
    padding: "12px 12px",
    transition: "all 160ms ease",
  });

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div
        style={{
          position: "relative",
          minHeight: 420,
          maxWidth: 520,
          margin: "0 auto",
          width: "100%",
        }}
      >
        {[18, 10].map((top, index) => (
          <div
            key={top}
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: `${top}px ${16 + index * 8}px auto`,
              height: "100%",
              borderRadius: 26,
              border: `1px solid ${alpha(t.green, 0.14)}`,
              background: `linear-gradient(180deg, ${alpha(t.green, 0.05)} 0%, ${t.white} 100%)`,
              opacity: index === 0 ? 0.45 : 0.72,
              transform: `scale(${index === 0 ? 0.96 : 0.98})`,
            }}
          />
        ))}

        <div
          onTouchStart={(event) => {
            const touch = event.touches[0];
            beginDrag(touch.clientX, touch.clientY);
          }}
          onTouchMove={(event) => {
            const touch = event.touches[0];
            moveDrag(touch.clientX, touch.clientY);
          }}
          onTouchEnd={finishDrag}
          onMouseDown={(event) => beginDrag(event.clientX, event.clientY)}
          onMouseMove={(event) => moveDrag(event.clientX, event.clientY)}
          onMouseUp={finishDrag}
          onMouseLeave={finishDrag}
          style={{
            position: "relative",
            overflow: "hidden",
            minHeight: 400,
            touchAction: "pan-y",
            borderRadius: 24,
            border: `1px solid ${t.border}`,
            background: t.white,
            boxShadow: `0 22px 46px ${alpha(t.ink, 0.12)}`,
            transform: `translateX(${offsetX}px) rotate(${offsetX / 20}deg)`,
            opacity: animatingOut ? 0 : 1 - Math.min(Math.abs(offsetX) / 260, 0.22),
            transition: startRef.current.dragging
              ? "none"
              : "transform 180ms ease, opacity 180ms ease",
          }}
        >
          <div
            style={{
              padding: "18px 18px 20px",
              background: `linear-gradient(180deg, ${alpha(t.green, 0.08)} 0%, ${t.white} 100%)`,
              minHeight: 400,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
              <div
                style={{
                  padding: "8px 12px",
                  borderRadius: 999,
                  background: alpha(t.ink, 0.04),
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: 1.2,
                  textTransform: "uppercase",
                  color: t.mid,
                }}
              >
                Swipe left = Investor
              </div>
              <div
                style={{
                  padding: "8px 12px",
                  borderRadius: 999,
                  background: alpha(t.ink, 0.04),
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: 1.2,
                  textTransform: "uppercase",
                  color: t.mid,
                }}
              >
                Swipe right = Inventor
              </div>
            </div>

            <div style={{ marginTop: 18, textAlign: "center" }}>
              <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", color: t.green }}>
                Pick your side
              </div>
              <div
                style={{
                  marginTop: 10,
                  fontSize: 28,
                  lineHeight: 1.02,
                  fontWeight: 800,
                  color: t.ink,
                  fontFamily: "Georgia, serif",
                }}
              >
                Investor or Inventor
              </div>
              <div style={{ marginTop: 10, fontSize: 14, lineHeight: 1.7, color: t.mid, maxWidth: 420, marginInline: "auto" }}>
                Choose with one swipe. Then make your account. After that, you move straight into the discovery deck.
              </div>
            </div>

            <div
              style={{
                marginTop: 20,
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: 10,
              }}
            >
              <div style={swipeLabelStyle("investor")}>
                <div style={{ fontSize: 15, fontWeight: 800, color: t.ink }}>Investor</div>
                <div style={{ marginTop: 6, fontSize: 12, lineHeight: 1.6, color: t.mid }}>
                  Set your budget, stage, and industries. Swipe left to choose this path.
                </div>
              </div>
              <div style={swipeLabelStyle("inventor")}>
                <div style={{ fontSize: 15, fontWeight: 800, color: t.ink }}>Inventor</div>
                <div style={{ marginTop: 6, fontSize: 12, lineHeight: 1.6, color: t.mid }}>
                  Show your idea, traction, revenue, and images. Swipe right to choose this path.
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: 18,
                borderRadius: 20,
                border: `1px solid ${alpha(t.green, 0.16)}`,
                background: alpha(t.green, 0.07),
                padding: "14px 14px",
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.4, textTransform: "uppercase", color: t.green }}>
                Private by default
              </div>
              <div style={{ marginTop: 6, fontSize: 13, lineHeight: 1.65, color: t.ink }}>
                Email and phone stay hidden unless you explicitly make them public. In-app messaging stays the first contact path.
              </div>
            </div>

            <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <PrimaryButton t={t} onClick={() => onChooseRole?.("investor")}>
                Choose Investor
              </PrimaryButton>
              <SecondaryButton t={t} onClick={() => onChooseRole?.("inventor")}>
                Choose Inventor
              </SecondaryButton>
            </div>
          </div>
        </div>
      </div>

      <div style={{ textAlign: "center", fontSize: 12, color: t.mid }}>
        Drag the front card left or right. The deck fades out as you commit.
      </div>
    </div>
  );
}

export function InventorsInvestorsLandingPage({ t, onChooseRole, onGoMessages, hasMessages }) {
  return (
    <FeatureFrame
      t={t}
      eyebrow="Networking"
      title="Inventors & Investors"
      subtitle="A cleaner flow: choose your side with one swipe, make your account, then move into the investor and inventor discovery deck."
      actions={
        hasMessages ? (
          <SecondaryButton t={t} onClick={onGoMessages}>
            Messages
          </SecondaryButton>
        ) : null
      }
    >
      <RoleSwipeChooser t={t} onChooseRole={onChooseRole} />

      <div style={{ marginTop: 16 }}>
        <EmptyState
          t={t}
          title="Investor and inventor matching"
          body="After account setup, the next screen becomes the live swipe deck. It works like a Tinder-style discovery flow, but for investors and inventors instead of dating."
        />
      </div>
    </FeatureFrame>
  );
}

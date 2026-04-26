import { useEffect, useState } from "react";
import {
  openStripePortal,
  startStripeCheckout,
} from "../../services/stripeBilling";
import { useSubscription } from "../../systems/useSubscription";

const FONT =
  "-apple-system, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif";

const TIERS = [
  {
    id: "free",
    label: "Free",
    price: "A$0",
    cadence: "forever",
    blurb: "The essentials — read, learn, organize.",
    features: [
      "Core reading content",
      "Daily Growth tips",
      "Community access",
      "Basic quizzes",
    ],
  },
  {
    id: "basic",
    label: "Basic",
    price: "A$14.99",
    cadence: "per month",
    blurb: "Step up your tools and content library.",
    features: [
      "Everything in Free",
      "Expanded reading library",
      "Advanced quizzes & challenges",
      "Mentorship inbox priority",
      "Ad-free experience",
    ],
  },
  {
    id: "premium",
    label: "Premium",
    price: "A$49.99",
    cadence: "per month",
    blurb: "Maximum unlocks. Built for builders.",
    features: [
      "Everything in Basic",
      "Free invitation to weekly Business Meeting",
      "Auto-added to your Organized planner",
      "Inventors & Investors premium tools",
      "Priority human support",
      "Certificate of Completion",
    ],
    highlight: true,
  },
];

function formatRenewal(iso) {
  if (!iso) return null;
  try {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return null;
  }
}

export function PremiumPage({ t, play, user }) {
  const subscription = useSubscription(user?.id);
  const [pendingTier, setPendingTier] = useState(null);
  const [pendingPortal, setPendingPortal] = useState(false);
  const [error, setError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URL(window.location.href).searchParams;
    const status = params.get("subscription");
    if (status === "success") {
      setStatusMessage(
        "Subscription confirmed. It can take a few seconds to appear here.",
      );
    } else if (status === "cancelled") {
      setStatusMessage("Checkout cancelled. No charge was made.");
    }
  }, []);

  const handleSubscribe = async (tierId) => {
    if (tierId === "free") return;
    setError("");
    setStatusMessage("");
    if (!user?.id) {
      setError("Please sign in before subscribing.");
      return;
    }
    setPendingTier(tierId);
    play?.("primary");
    try {
      const url = await startStripeCheckout(tierId);
      window.location.assign(url);
    } catch (err) {
      setError(err?.message || "Could not start checkout.");
      setPendingTier(null);
    }
  };

  const handleManage = async () => {
    setError("");
    setStatusMessage("");
    setPendingPortal(true);
    play?.("tap");
    try {
      const url = await openStripePortal();
      window.location.assign(url);
    } catch (err) {
      setError(err?.message || "Could not open billing portal.");
      setPendingPortal(false);
    }
  };

  const currentTier = subscription.tier;
  const renewal = formatRenewal(subscription.currentPeriodEnd);

  return (
    <div
      data-page-tag="#premium"
      style={{
        padding: "32px 18px 48px",
        maxWidth: 560,
        margin: "0 auto",
        fontFamily: FONT,
        boxSizing: "border-box",
      }}
    >
      <h2
        style={{
          fontSize: 28,
          fontWeight: 700,
          color: t.ink,
          margin: "0 0 6px",
          letterSpacing: "-0.03em",
          textAlign: "center",
        }}
      >
        Choose your plan
      </h2>
      <p
        style={{
          color: t.muted,
          fontSize: 15,
          lineHeight: 1.55,
          margin: "0 0 24px",
          textAlign: "center",
          letterSpacing: "-0.01em",
        }}
      >
        Unlock more tools, content and community access. Cancel any time.
      </p>

      {statusMessage && (
        <div
          style={{
            background: `${t.green}14`,
            border: `1px solid ${t.green}40`,
            borderRadius: 12,
            padding: "10px 14px",
            color: t.ink,
            fontSize: 13,
            marginBottom: 14,
          }}
        >
          {statusMessage}
        </div>
      )}
      {error && (
        <div
          style={{
            background: `${t.red}18`,
            border: `1px solid ${t.red}40`,
            borderRadius: 12,
            padding: "10px 14px",
            color: t.red,
            fontSize: 13,
            marginBottom: 14,
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 14,
          marginBottom: 18,
        }}
      >
        {TIERS.map((tier) => {
          const isCurrent = currentTier === tier.id;
          const isHighlight = tier.highlight;
          const isPending = pendingTier === tier.id;
          const isFree = tier.id === "free";
          const buttonDisabled =
            isFree
            || isCurrent
            || isPending
            || pendingTier !== null
            || pendingPortal;

          let buttonLabel = "Subscribe";
          if (isFree) buttonLabel = "Included";
          else if (isCurrent) buttonLabel = "Current plan";
          else if (isPending) buttonLabel = "Opening checkout…";

          return (
            <div
              key={tier.id}
              style={{
                background: isHighlight
                  ? `linear-gradient(135deg, ${t.green}1a 0%, ${t.white} 70%)`
                  : t.white,
                border: `${isCurrent ? 2 : 1}px solid ${
                  isCurrent ? t.green : isHighlight ? `${t.green}60` : t.border
                }`,
                borderRadius: 20,
                padding: "20px 20px 22px",
                boxShadow: isHighlight
                  ? "0 6px 24px rgba(0,0,0,0.10)"
                  : "0 2px 12px rgba(0,0,0,0.06)",
                position: "relative",
              }}
            >
              {isHighlight && (
                <span
                  style={{
                    position: "absolute",
                    top: 14,
                    right: 14,
                    background: t.green,
                    color: "#000",
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    padding: "4px 8px",
                    borderRadius: 999,
                  }}
                >
                  Best value
                </span>
              )}
              {isCurrent && !isHighlight && (
                <span
                  style={{
                    position: "absolute",
                    top: 14,
                    right: 14,
                    background: `${t.green}22`,
                    color: t.green,
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    padding: "4px 8px",
                    borderRadius: 999,
                  }}
                >
                  Current
                </span>
              )}
              <p
                style={{
                  margin: "0 0 4px",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: isHighlight ? t.green : t.muted,
                }}
              >
                {tier.label}
              </p>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 6,
                  marginBottom: 4,
                }}
              >
                <span
                  style={{
                    fontSize: 30,
                    fontWeight: 700,
                    color: t.ink,
                    letterSpacing: "-0.03em",
                    lineHeight: 1.05,
                  }}
                >
                  {tier.price}
                </span>
                <span style={{ fontSize: 13, color: t.muted, fontWeight: 500 }}>
                  {tier.cadence}
                </span>
              </div>
              <p
                style={{
                  margin: "0 0 14px",
                  fontSize: 14,
                  color: t.mid,
                  lineHeight: 1.5,
                }}
              >
                {tier.blurb}
              </p>
              <ul
                style={{
                  listStyle: "none",
                  margin: "0 0 18px",
                  padding: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                {tier.features.map((feature) => (
                  <li
                    key={feature}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 8,
                      fontSize: 14,
                      color: t.ink,
                      lineHeight: 1.4,
                    }}
                  >
                    <span
                      aria-hidden
                      style={{
                        color: t.green,
                        fontWeight: 700,
                        flexShrink: 0,
                        marginTop: 1,
                      }}
                    >
                      ✓
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                disabled={buttonDisabled}
                onClick={() => handleSubscribe(tier.id)}
                onTouchStart={(e) => {
                  if (!buttonDisabled) e.currentTarget.style.transform = "scale(0.97)";
                }}
                onTouchEnd={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
                onMouseDown={(e) => {
                  if (!buttonDisabled) e.currentTarget.style.transform = "scale(0.97)";
                }}
                onMouseUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
                style={{
                  width: "100%",
                  height: 48,
                  borderRadius: 14,
                  background: isHighlight && !buttonDisabled
                    ? t.green
                    : isCurrent
                      ? `${t.green}1f`
                      : t.light,
                  color: isHighlight && !buttonDisabled
                    ? "#000"
                    : isCurrent
                      ? t.green
                      : t.ink,
                  border:
                    isHighlight && !buttonDisabled
                      ? "none"
                      : `1px solid ${isCurrent ? `${t.green}55` : t.border}`,
                  fontSize: 15,
                  fontWeight: 600,
                  fontFamily: FONT,
                  letterSpacing: "-0.01em",
                  cursor: buttonDisabled ? "default" : "pointer",
                  opacity: buttonDisabled && !isCurrent && !isFree ? 0.6 : 1,
                  transition:
                    "transform 0.15s cubic-bezier(0.34,1.56,0.64,1), opacity 0.2s ease",
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                {buttonLabel}
              </button>
            </div>
          );
        })}
      </div>

      {subscription.isPaid && (
        <div
          style={{
            background: t.white,
            border: `1px solid ${t.border}`,
            borderRadius: 16,
            padding: "16px 18px",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <div style={{ fontSize: 13, color: t.muted, fontWeight: 600 }}>
            Billing
          </div>
          <div style={{ fontSize: 15, color: t.ink }}>
            You&rsquo;re on the{" "}
            <strong style={{ color: t.green }}>
              {subscription.tier === "premium" ? "Premium" : "Basic"}
            </strong>{" "}
            plan.
            {renewal && (
              <>
                {" "}
                {subscription.cancelAtPeriodEnd ? "Ends" : "Renews"} on {renewal}.
              </>
            )}
          </div>
          <button
            type="button"
            onClick={handleManage}
            disabled={pendingPortal}
            style={{
              alignSelf: "flex-start",
              marginTop: 4,
              background: "transparent",
              border: `1px solid ${t.border}`,
              color: t.ink,
              borderRadius: 12,
              padding: "10px 14px",
              fontSize: 14,
              fontWeight: 600,
              fontFamily: FONT,
              cursor: pendingPortal ? "default" : "pointer",
              opacity: pendingPortal ? 0.6 : 1,
              WebkitTapHighlightColor: "transparent",
            }}
          >
            {pendingPortal ? "Opening…" : "Manage billing"}
          </button>
        </div>
      )}
    </div>
  );
}

export default PremiumPage;

import { useMemo, useRef, useState } from "react";
import {
  Avatar,
  EmptyState,
  FeatureFrame,
  PrimaryButton,
  SearchBar,
  SecondaryButton,
  SurfaceCard,
  alpha,
} from "../InventorsInvestorsUI";
import {
  formatCurrency,
  formatPercent,
  formatRelativeJoined,
} from "../../../utils/inventorsInvestors";

const DECK_SWIPE_TRIGGER = 88;

function MetricChip({ t, label, value }) {
  if (!value) return null;
  return (
    <div
      style={{
        minHeight: 52,
        borderRadius: 16,
        border: `1px solid ${t.border}`,
        background: t.skin,
        padding: "12px 12px",
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1.2, color: t.muted }}>
        {label}
      </div>
      <div style={{ marginTop: 6, fontSize: 13, fontWeight: 700, color: t.ink, lineHeight: 1.4 }}>
        {value}
      </div>
    </div>
  );
}

function DeckSwipeCard({ t, onSwipeLeft, onSwipeRight, children }) {
  const [offsetX, setOffsetX] = useState(0);
  const [animatingOut, setAnimatingOut] = useState(false);
  const startRef = useRef({ x: 0, y: 0, dragging: false });

  const swipeState = useMemo(() => {
    if (offsetX <= -28) return "left";
    if (offsetX >= 28) return "right";
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
    setOffsetX(Math.max(-180, Math.min(180, deltaX)));
  };

  const finishDrag = () => {
    if (!startRef.current.dragging || animatingOut) return;
    startRef.current.dragging = false;

    if (Math.abs(offsetX) < DECK_SWIPE_TRIGGER) {
      setOffsetX(0);
      return;
    }

    const direction = offsetX < 0 ? -1 : 1;
    setAnimatingOut(true);
    setOffsetX(direction * 280);

    window.setTimeout(() => {
      if (direction < 0) onSwipeLeft?.();
      if (direction > 0) onSwipeRight?.();
      setAnimatingOut(false);
      setOffsetX(0);
    }, 180);
  };

  return (
    <div
      style={{
        position: "relative",
        maxWidth: 520,
        margin: "0 auto",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: "10px 14px auto",
          height: "100%",
          borderRadius: 24,
          border: `1px solid ${alpha(t.green, 0.14)}`,
          background: `linear-gradient(180deg, ${alpha(t.green, 0.05)} 0%, ${t.white} 100%)`,
          opacity: 0.7,
          transform: "scale(0.98)",
        }}
      />
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
        className="ii-swipe-card"
        style={{
          position: "relative",
          overflow: "hidden",
          maxWidth: 520,
          margin: "0 auto",
          touchAction: "pan-y",
          borderRadius: 24,
          border: `1px solid ${t.border}`,
          background: t.white,
          boxShadow: `0 16px 40px ${alpha(t.ink, 0.06)}`,
          transform: `translateX(${offsetX}px) rotate(${offsetX / 24}deg)`,
          opacity: animatingOut ? 0 : 1 - Math.min(Math.abs(offsetX) / 300, 0.18),
          transition: startRef.current.dragging
            ? "none"
            : "transform 180ms ease, opacity 180ms ease",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 18,
            left: 18,
            padding: "8px 12px",
            borderRadius: 999,
            background: swipeState === "left" ? alpha(t.green, 0.14) : alpha(t.ink, 0.04),
            border: `1px solid ${swipeState === "left" ? alpha(t.green, 0.35) : "transparent"}`,
            color: swipeState === "left" ? t.green : t.mid,
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: 1.2,
            textTransform: "uppercase",
            zIndex: 2,
          }}
        >
          Swipe left = Interested
        </div>
        <div
          style={{
            position: "absolute",
            top: 18,
            right: 18,
            padding: "8px 12px",
            borderRadius: 999,
            background: swipeState === "right" ? alpha(t.red, 0.12) : alpha(t.ink, 0.04),
            border: `1px solid ${swipeState === "right" ? alpha(t.red, 0.3) : "transparent"}`,
            color: swipeState === "right" ? t.red : t.mid,
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: 1.2,
            textTransform: "uppercase",
            zIndex: 2,
          }}
        >
          Swipe right = Pass
        </div>
        {children}
      </div>
    </div>
  );
}

function DiscoverCard({
  t,
  profile,
  onInterested,
  onPass,
  onStartChat,
  onBlock,
  onReport,
}) {
  if (!profile) return null;

  return (
    <DeckSwipeCard t={t} onSwipeLeft={onInterested} onSwipeRight={onPass}>
      <div style={{ position: "relative", minHeight: 560 }}>
        {profile.hero_image_url || profile.avatar_url ? (
          <div style={{ width: "100%", aspectRatio: "1.1 / 1", overflow: "hidden", background: t.skin }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={profile.hero_image_url || profile.avatar_url}
              alt={profile.full_name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
        ) : (
          <div
            style={{
              width: "100%",
              aspectRatio: "1.1 / 1",
              background: `linear-gradient(180deg, ${alpha(t.green, 0.12)} 0%, ${t.skin} 100%)`,
              display: "grid",
              placeItems: "center",
            }}
          >
            <Avatar src="" name={profile.full_name} size={96} t={t} />
          </div>
        )}

        <div style={{ padding: "18px 18px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 23, fontWeight: 800, color: t.ink, lineHeight: 1.08 }}>{profile.full_name}</div>
              <div style={{ marginTop: 6, fontSize: 13, color: t.mid }}>
                {profile.role === "investor" ? "Investor" : "Inventor"} · {profile.location || "Location not set"}
              </div>
            </div>
            <div
              style={{
                padding: "8px 10px",
                borderRadius: 999,
                background: alpha(t.green, 0.08),
                color: t.green,
                fontSize: 11,
                fontWeight: 800,
                whiteSpace: "nowrap",
              }}
            >
              {formatRelativeJoined(profile.created_at)}
            </div>
          </div>

          <div style={{ marginTop: 14, fontSize: 14, lineHeight: 1.75, color: t.mid }}>
            {profile.short_pitch || profile.bio || profile.description || "No summary added yet."}
          </div>

          <div
            className="ii-metrics-grid"
            style={{
              marginTop: 16,
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 10,
            }}
          >
            <MetricChip
              t={t}
              label={profile.role === "investor" ? "Interests" : "Category"}
              value={profile.role === "investor" ? profile.looking_to_invest_in : profile.category}
            />
            <MetricChip
              t={t}
              label={profile.role === "investor" ? "Stage" : "Type"}
              value={profile.role === "investor" ? profile.stage_preference : profile.invention_type}
            />
            <MetricChip
              t={t}
              label={profile.role === "investor" ? "Budget" : "Revenue"}
              value={
                profile.role === "investor"
                  ? formatCurrency(profile.investment_budget)
                  : formatCurrency(profile.revenue)
              }
            />
            <MetricChip
              t={t}
              label={profile.role === "investor" ? "Range" : "Equity"}
              value={
                profile.role === "investor"
                  ? [formatCurrency(profile.investment_range_min), formatCurrency(profile.investment_range_max)]
                      .filter(Boolean)
                      .join(" - ")
                  : formatPercent(profile.equity_available)
              }
            />
          </div>

          {(profile.public_email || profile.public_phone) && (
            <div
              style={{
                marginTop: 16,
                borderRadius: 18,
                border: `1px solid ${t.border}`,
                background: t.skin,
                padding: "14px 14px",
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.2, textTransform: "uppercase", color: t.muted }}>
                Public contact details
              </div>
              <div style={{ marginTop: 8, display: "grid", gap: 6, fontSize: 13, color: t.ink }}>
                {profile.public_email ? <div>{profile.public_email}</div> : null}
                {profile.public_phone ? <div>{profile.public_phone}</div> : null}
              </div>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 18 }}>
            <PrimaryButton t={t} onClick={onInterested}>
              Interested
            </PrimaryButton>
            <SecondaryButton t={t} onClick={onPass}>
              Pass
            </SecondaryButton>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 10 }}>
            <SecondaryButton t={t} onClick={onStartChat}>Message</SecondaryButton>
            <SecondaryButton t={t} onClick={onBlock}>Block</SecondaryButton>
            <SecondaryButton t={t} onClick={onReport}>Report</SecondaryButton>
          </div>
        </div>
      </div>
    </DeckSwipeCard>
  );
}

export function InventorsInvestorsSwipePage({
  t,
  viewerRole,
  searchTerm,
  onSearch,
  onOpenMessages,
  pendingMessageCount,
  activeProfile,
  hasProfiles,
  isLoading,
  onInterested,
  onPass,
  onStartChat,
  onBlock,
  onReport,
  onResetSearch,
}) {
  return (
    <FeatureFrame
      t={t}
      eyebrow="Discover"
      title={viewerRole === "investor" ? "Discover inventors" : "Discover investors"}
      subtitle="Swipe left to show interest. Swipe right to pass. It is the same simple deck mechanic, just built for investors and inventors instead of dating."
    >
      <SearchBar
        t={t}
        value={searchTerm}
        onChange={onSearch}
        placeholder="Search by name, location, category, type, or investment interest"
        rightSlot={
          <button
            type="button"
            onClick={onOpenMessages}
            style={{
              width: 52,
              height: 52,
              borderRadius: 18,
              border: `1px solid ${t.border}`,
              background: t.white,
              cursor: "pointer",
              position: "relative",
            }}
            aria-label="Open messages"
          >
            <span style={{ fontSize: 20, color: t.ink }}>✉</span>
            {pendingMessageCount ? (
              <span
                style={{
                  position: "absolute",
                  top: 6,
                  right: 6,
                  minWidth: 18,
                  height: 18,
                  borderRadius: 999,
                  background: t.green,
                  color: "#ffffff",
                  fontSize: 10,
                  fontWeight: 800,
                  display: "grid",
                  placeItems: "center",
                }}
              >
                {pendingMessageCount}
              </span>
            ) : null}
          </button>
        }
      />

      {isLoading ? (
        <SurfaceCard t={t} style={{ textAlign: "center", padding: "32px 20px" }}>
          <div style={{ fontSize: 14, color: t.mid }}>Loading discovery profiles...</div>
        </SurfaceCard>
      ) : !hasProfiles ? (
        <EmptyState
          t={t}
          title={searchTerm ? "No search results" : "No profiles found"}
          body={
            searchTerm
              ? "No matching profiles showed up for that search. Try a broader term or clear the search."
              : "You have reached the end of the current discovery list. More profiles will appear when new members join or after you reset your visible search."
          }
          action={
            searchTerm ? (
              <SecondaryButton t={t} onClick={onResetSearch}>
                Clear search
              </SecondaryButton>
            ) : null
          }
        />
      ) : (
        <DiscoverCard
          t={t}
          profile={activeProfile}
          onInterested={onInterested}
          onPass={onPass}
          onStartChat={onStartChat}
          onBlock={onBlock}
          onReport={onReport}
        />
      )}
    </FeatureFrame>
  );
}

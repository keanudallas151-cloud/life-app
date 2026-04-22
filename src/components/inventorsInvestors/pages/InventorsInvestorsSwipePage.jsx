import { useEffect, useMemo, useRef, useState } from "react";
import {
  Avatar,
  EmptyState,
  SearchBar,
  SecondaryButton,
  SurfaceCard,
  alpha,
} from "../InventorsInvestorsUI";
<<<<<<< HEAD
import { formatCurrency } from "../../../utils/inventorsInvestors";
=======
import {
  formatCurrency,
} from "../../../utils/inventorsInvestors";
>>>>>>> a59b2e27355e6c4f2a2eed2930e03aad9e503c24

const DECK_SWIPE_TRIGGER = 88;

const STARTER_INVENTORY = {
  investor: [
    { user_id: "starter-inventor-1", full_name: "Avery Stone", role: "inventor", location: "Adelaide, SA", short_pitch: "Reusable packaging hardware for food brands scaling beyond local markets.", description: "Manufacturing-ready product with early wholesale traction and a clear funding plan for expansion.", category: "Packaging", invention_type: "Physical product", funding_sought: 180000, revenue: 42000, equity_available: 12, avatar_url: "", hero_image_url: "", isTrending: true, isNewToday: true },
    { user_id: "starter-inventor-2", full_name: "Sienna Hart", role: "inventor", location: "Melbourne, VIC", short_pitch: "Workflow AI for small law firms that cuts admin overhead fast.", description: "Pilot customers active, paid monthly, and now raising to accelerate sales and product depth.", category: "Legal tech", invention_type: "Software", funding_sought: 95000, revenue: 18000, equity_available: 8, avatar_url: "", hero_image_url: "", isTrending: false, isNewToday: true },
    { user_id: "starter-inventor-3", full_name: "Mason Cruz", role: "inventor", location: "Perth, WA", short_pitch: "Portable cold-chain sensor built for seafood exporters and logistics teams.", description: "Early commercial pilots underway with a strong margin profile and a straightforward enterprise sales path.", category: "Logistics", invention_type: "Hardware + SaaS", funding_sought: 240000, revenue: 61000, equity_available: 10, avatar_url: "", hero_image_url: "", isTrending: true, isNewToday: false },
    { user_id: "starter-inventor-4", full_name: "Chloe Mercer", role: "inventor", location: "Brisbane, QLD", short_pitch: "Direct-to-consumer beauty brand using refill-first packaging and loyalty-led retention.", description: "Strong repeat purchase signals and clean branding with room for wholesale expansion.", category: "Beauty", invention_type: "Consumer brand", funding_sought: 120000, revenue: 39000, equity_available: 9, avatar_url: "", hero_image_url: "", isTrending: false, isNewToday: true },
    { user_id: "starter-inventor-5", full_name: "Noah Bennett", role: "inventor", location: "Sydney, NSW", short_pitch: "Trade quoting platform helping electricians close jobs faster with cleaner proposals.", description: "Paying users, fast onboarding, and strong product clarity for a narrow but valuable market.", category: "Trades SaaS", invention_type: "Software", funding_sought: 160000, revenue: 27000, equity_available: 11, avatar_url: "", hero_image_url: "", isTrending: true, isNewToday: false },
  ],
  inventor: [
    { user_id: "starter-investor-1", full_name: "Jordan Vale", role: "investor", location: "Melbourne, VIC", bio: "Operator-investor focused on practical businesses with early traction and clear expansion paths.", looking_to_invest_in: "Consumer, software, and product-led service businesses", stage_preference: "startup", investment_budget: 250000, investment_range_min: 25000, investment_range_max: 120000, avatar_url: "", hero_image_url: "", isTrending: true, isNewToday: false },
    { user_id: "starter-investor-2", full_name: "Mila Reeves", role: "investor", location: "Sydney, NSW", bio: "Angel investor backing clear operators, especially in commerce and practical AI.", looking_to_invest_in: "Commerce tools, AI workflows, and service businesses", stage_preference: "growing business", investment_budget: 400000, investment_range_min: 40000, investment_range_max: 150000, avatar_url: "", hero_image_url: "", isTrending: false, isNewToday: true },
    { user_id: "starter-investor-3", full_name: "Theo Lawson", role: "investor", location: "Gold Coast, QLD", bio: "Small fund manager with a bias toward cash-generative operators and strong unit economics.", looking_to_invest_in: "Trades, logistics, and practical B2B software", stage_preference: "established business", investment_budget: 600000, investment_range_min: 50000, investment_range_max: 200000, avatar_url: "", hero_image_url: "", isTrending: true, isNewToday: false },
    { user_id: "starter-investor-4", full_name: "Ella Brooks", role: "investor", location: "Adelaide, SA", bio: "Founder-turned-investor looking for disciplined builders with real product proof and credible growth plans.", looking_to_invest_in: "Health, education, and consumer subscription brands", stage_preference: "startup", investment_budget: 180000, investment_range_min: 20000, investment_range_max: 80000, avatar_url: "", hero_image_url: "", isTrending: false, isNewToday: true },
    { user_id: "starter-investor-5", full_name: "Liam Foster", role: "investor", location: "Perth, WA", bio: "Private investor prioritising simple offers, strong margins, and businesses that can scale without chaos.", looking_to_invest_in: "Industrial tech, niche software, and resilient service models", stage_preference: "growing business", investment_budget: 320000, investment_range_min: 30000, investment_range_max: 110000, avatar_url: "", hero_image_url: "", isTrending: true, isNewToday: true },
  ],
};

function MetricChip({ t, label, value, compact = false }) {
  if (!value) return null;
  return (
    <div style={{ minHeight: compact ? 46 : 52, borderRadius: 16, border: `1px solid ${alpha(t.border, 0.9)}`, background: compact ? alpha(t.skin, 0.92) : t.skin, padding: compact ? "10px 11px" : "12px 12px" }}>
      <div style={{ fontSize: 10.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1.2, color: t.muted }}>{label}</div>
      <div style={{ marginTop: 5, fontSize: compact ? 12.5 : 13, fontWeight: 700, color: t.ink, lineHeight: 1.35 }}>{value}</div>
    </div>
  );
}

function DeckSwipeCard({ t, onSwipeLeft, onSwipeRight, onTap, children }) {
  const [offsetX, setOffsetX] = useState(0);
  const [animatingOut, setAnimatingOut] = useState(false);
  const startRef = useRef({ x: 0, y: 0, dragging: false, maxDist: 0 });
  const swipeState = useMemo(
    () => (offsetX <= -24 ? "left" : offsetX >= 24 ? "right" : ""),
    [offsetX],
  );
  const leftBadgeOpacity = Math.max(
    0,
    Math.min(1, Math.abs(Math.min(offsetX, 0)) / 90),
  );
  const rightBadgeOpacity = Math.max(0, Math.min(1, Math.max(offsetX, 0) / 90));

  const beginDrag = (x, y) => {
    if (animatingOut) return;
    startRef.current = { x, y, dragging: true, maxDist: 0 };
  };
  const moveDrag = (x, y) => {
    if (!startRef.current.dragging || animatingOut) return;
    const dx = x - startRef.current.x;
    const dy = y - startRef.current.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    startRef.current.maxDist = Math.max(startRef.current.maxDist, dist);
    if (Math.abs(dy) > Math.abs(dx) + 4) return;
    setOffsetX(Math.max(-200, Math.min(200, dx)));
  };
  const finishDrag = () => {
    if (!startRef.current.dragging || animatingOut) return;
    startRef.current.dragging = false;
    // Tap detection — minimal total movement
    if (startRef.current.maxDist < 10 && Math.abs(offsetX) < 8) {
      setOffsetX(0);
      onTap?.();
      return;
    }
    if (Math.abs(offsetX) < DECK_SWIPE_TRIGGER) {
      setOffsetX(0);
      return;
    }
    const direction = offsetX < 0 ? -1 : 1;
    setAnimatingOut(true);
    setOffsetX(direction * 380);
    window.setTimeout(() => {
      if (direction < 0) onSwipeLeft?.();
      if (direction > 0) onSwipeRight?.();
      setAnimatingOut(false);
      setOffsetX(0);
    }, 220);
  };;

  const isDragging = startRef.current.dragging;

  return (
    <div style={{ position: "relative", maxWidth: 440, margin: "0 auto" }}>
      {/* Ghost cards for depth */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: "16px 10px auto",
          height: "100%",
          borderRadius: 28,
          border: `1px solid ${alpha(t.green, 0.18)}`,
          background: `linear-gradient(180deg, ${alpha(t.green, 0.08)} 0%, ${t.skin} 100%)`,
          transform: "scale(0.96)",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: "30px 20px auto",
          height: "100%",
          borderRadius: 28,
          border: `1px solid ${alpha(t.green, 0.1)}`,
          background: `linear-gradient(180deg, ${alpha(t.green, 0.05)} 0%, ${t.skin} 100%)`,
          transform: "scale(0.92)",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />
      {/* Active card */}
      <div
        onTouchStart={(e) =>
          beginDrag(e.touches[0].clientX, e.touches[0].clientY)
        }
        onTouchMove={(e) =>
          moveDrag(e.touches[0].clientX, e.touches[0].clientY)
        }
        onTouchEnd={finishDrag}
        onMouseDown={(e) => beginDrag(e.clientX, e.clientY)}
        onMouseMove={(e) => moveDrag(e.clientX, e.clientY)}
        onMouseUp={finishDrag}
        onMouseLeave={finishDrag}
        style={{
          position: "relative",
          zIndex: 1,
          overflow: "hidden",
          touchAction: "pan-y",
          borderRadius: 28,
          border: `1px solid ${t.border}`,
          background: t.white,
          boxShadow: `0 20px 56px ${alpha(t.ink, 0.13)}, 0 4px 16px ${alpha(t.ink, 0.06)}`,
          transform: `translateX(${offsetX}px) rotate(${offsetX / 18}deg)`,
          opacity: animatingOut
            ? 0
            : 1 - Math.min(Math.abs(offsetX) / 300, 0.14),
          transition: isDragging
            ? "none"
            : "transform 280ms cubic-bezier(0.34,1.56,0.64,1), opacity 200ms ease",
          cursor: isDragging ? "grabbing" : "grab",
          userSelect: "none",
        }}
      >
        {/* Swipe badges */}
        <div
          style={{
            position: "absolute",
            top: 18,
            left: 18,
            padding: "9px 16px",
            borderRadius: 999,
            background: alpha(t.red, 0.18),
            border: `2px solid ${alpha(t.red, 0.5)}`,
            color: t.red,
            fontSize: 13,
            fontWeight: 900,
            letterSpacing: 2,
            textTransform: "uppercase",
            zIndex: 3,
            opacity: swipeState === "left" ? leftBadgeOpacity : 0,
            transform: `rotate(-16deg)`,
            transition: "opacity 60ms linear",
          }}
        >
          PASS
        </div>
        <div
          style={{
            position: "absolute",
            top: 18,
            right: 18,
            padding: "9px 16px",
            borderRadius: 999,
            background: alpha(t.green, 0.22),
            border: `2px solid ${alpha(t.green, 0.55)}`,
            color: t.green,
            fontSize: 13,
            fontWeight: 900,
            letterSpacing: 2,
            textTransform: "uppercase",
            zIndex: 3,
            opacity: swipeState === "right" ? rightBadgeOpacity : 0,
            transform: `rotate(16deg)`,
            transition: "opacity 60ms linear",
          }}
        >
          LIKE
        </div>
        {children}
      </div>
    </div>
  );
}

function DiscoverCard({
  t,
  profile,
  previewMode = false,
  onViewProfile,
  onInterested,
  onPass,
  onCompleteProfile,
}) {
  if (!profile) return null;
  const moneyLine =
    profile.role === "investor"
      ? formatCurrency(profile.investment_budget)
      : formatCurrency(profile.funding_sought);
  const secondLine =
    profile.role === "investor"
      ? profile.stage_preference
      : profile.invention_type || profile.category;

  return (
    <DeckSwipeCard
      t={t}
      onSwipeLeft={onPass}
      onSwipeRight={onInterested}
      onTap={onViewProfile}
    >
      <div style={{ position: "relative" }}>
        {/* Hero image */}
        {profile.hero_image_url || profile.avatar_url ? (
          <div
            style={{
              position: "relative",
              width: "100%",
              aspectRatio: "3/4",
              overflow: "hidden",
              background: "#111",
            }}
          >
            <img
              src={profile.hero_image_url || profile.avatar_url}
              alt={profile.full_name}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
                pointerEvents: "none",
              }}
            />
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(180deg, rgba(0,0,0,0.04) 0%, rgba(0,0,0,0.16) 35%, rgba(0,0,0,0.82) 100%)",
              }}
            />
          </div>
        ) : (
          <div
            style={{
              position: "relative",
              width: "100%",
              aspectRatio: "3/4",
              background:
                "linear-gradient(160deg, #0f0f0f 0%, #1c1c1e 60%, #111 100%)",
              display: "grid",
              placeItems: "center",
            }}
          >
            <div>
              <Avatar src="" name={profile.full_name} size={90} t={t} />
            </div>
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.7) 100%)",
              }}
            />
          </div>
        )}

        {/* Overlay info */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            padding: "0 18px 18px",
          }}
        >
          {/* Status badges */}
          <div
            style={{
              display: "flex",
              gap: 7,
              marginBottom: 12,
            }}
          >
            {profile.isTrending ? (
              <div
                style={{
                  padding: "6px 10px",
                  borderRadius: 999,
                  background: "rgba(255,148,66,0.18)",
                  color: "#ffb067",
                  fontSize: 11,
                  fontWeight: 800,
                }}
              >
                🔥 Trending
              </div>
            ) : null}
            {profile.isNewToday ? (
              <div
                style={{
                  padding: "6px 10px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.9)",
                  fontSize: 11,
                  fontWeight: 800,
                }}
              >
                New today
              </div>
            ) : null}
          </div>

          <div
            style={{
              borderRadius: 22,
              background: "rgba(6,6,8,0.76)",
              border: "1px solid rgba(255,255,255,0.07)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              padding: "16px 16px 14px",
            }}
          >
            {/* Name + role + location */}
            <div
              style={{
                fontSize: 26,
                fontWeight: 800,
                color: "#fff",
                lineHeight: 1,
                letterSpacing: -0.5,
              }}
            >
              {profile.full_name}
            </div>
            <div
              style={{
                marginTop: 6,
                fontSize: 13,
                color: "rgba(255,255,255,0.68)",
              }}
            >
              {profile.role === "investor" ? "Investor" : "Inventor"}
              {profile.location ? ` · ${profile.location}` : ""}
            </div>

            {/* One-liner pitch */}
            {profile.short_pitch || profile.bio ? (
              <div
                style={{
                  marginTop: 10,
                  fontSize: 13.5,
                  lineHeight: 1.7,
                  color: "rgba(255,255,255,0.82)",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {profile.short_pitch || profile.bio}
              </div>
            ) : null}

            {/* 2 key metrics */}
            <div
              style={{
                marginTop: 12,
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
              }}
            >
              <MetricChip
                t={{
                  ...t,
                  ink: "#fff",
                  muted: "rgba(255,255,255,0.5)",
                  skin: "rgba(255,255,255,0.07)",
                  border: "rgba(255,255,255,0.08)",
                }}
                label={profile.role === "investor" ? "Budget" : "Ask"}
                value={moneyLine}
                compact
              />
              <MetricChip
                t={{
                  ...t,
                  ink: "#fff",
                  muted: "rgba(255,255,255,0.5)",
                  skin: "rgba(255,255,255,0.07)",
                  border: "rgba(255,255,255,0.08)",
                }}
                label={profile.role === "investor" ? "Stage" : "Type"}
                value={secondLine}
                compact
              />
            </div>

            {/* Tap hint */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onViewProfile?.();
              }}
              style={{
                marginTop: 14,
                width: "100%",
                minHeight: 44,
                borderRadius: 14,
                border: "1px solid rgba(255,255,255,0.14)",
                background: "rgba(255,255,255,0.07)",
                color: "rgba(255,255,255,0.86)",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                letterSpacing: 0.2,
              }}
            >
              View full profile →
            </button>

            {/* Preview mode notice */}
            {previewMode ? (
              <div
                style={{
                  marginTop: 12,
                  borderRadius: 14,
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.05)",
                  padding: "10px 12px",
                  fontSize: 12,
                  color: "rgba(255,255,255,0.6)",
                  lineHeight: 1.6,
                }}
              >
                Starter deck — build your profile to unlock messages and saved
                actions.{" "}
                {onCompleteProfile ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onCompleteProfile?.();
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#7dde8b",
                      fontWeight: 800,
                      fontSize: 12,
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    Set up now →
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </DeckSwipeCard>
  );
}
export function InventorsInvestorsSwipePage({
  t,
  viewerRole,
  guestMode = false,
  profileCompleted = true,
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
  onCompleteProfile,
  onViewProfile,
}) {
  const roleKey = viewerRole === "investor" ? "investor" : "inventor";
  const starterDeck = STARTER_INVENTORY[roleKey];
  const [starterIndex, setStarterIndex] = useState(0);
  const [activeFilter, setActiveFilter] = useState(null); // null | "trending" | "new"

  useEffect(() => {
    setStarterIndex(0);
    setActiveFilter(null);
  }, [roleKey, guestMode, profileCompleted]);

  // Filter the starter deck by active chip
  const filteredStarterDeck = useMemo(() => {
    if (!activeFilter) return starterDeck;
    if (activeFilter === "trending")
      return starterDeck.filter((p) => p.isTrending);
    if (activeFilter === "new") return starterDeck.filter((p) => p.isNewToday);
    return starterDeck;
  }, [starterDeck, activeFilter]);

  const usingStarterInventory = !activeProfile || !hasProfiles;
  const currentStarterDeck = usingStarterInventory
    ? filteredStarterDeck
    : starterDeck;
  const currentProfile = usingStarterInventory
    ? currentStarterDeck[starterIndex % Math.max(1, currentStarterDeck.length)]
    : activeProfile;
  const handleStarterPass = () =>
    usingStarterInventory
      ? setStarterIndex((c) => (c + 1) % Math.max(1, currentStarterDeck.length))
      : onPass?.();
  const handleStarterInterested = () =>
    usingStarterInventory
      ? setStarterIndex((c) => (c + 1) % Math.max(1, currentStarterDeck.length))
      : onInterested?.();

  const isPreview = guestMode || !profileCompleted || usingStarterInventory;

  return (
    <div style={{ display: "grid", gap: 0 }}>
      {/* Header strip with title + persistent Messages button */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto",
          alignItems: "center",
          gap: 12,
          padding: "10px 4px 16px",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: 1.8,
              textTransform: "uppercase",
              color: t.green,
              marginBottom: 4,
            }}
          >
            {guestMode
              ? "Guest preview"
              : usingStarterInventory
                ? "Starter deck"
                : "Discover"}
          </div>
          <h2
            style={{
              margin: 0,
              fontSize: 22,
              fontWeight: 800,
              color: t.ink,
              letterSpacing: -0.3,
              lineHeight: 1.1,
            }}
          >
            {viewerRole === "investor"
              ? "Discover inventors"
              : "Discover investors"}
          </h2>
        </div>

        {/* Persistent inbox button */}
        <button
          type="button"
          onClick={onOpenMessages}
          aria-label="Open messages"
          style={{
            position: "relative",
            minWidth: 52,
            minHeight: 52,
            borderRadius: 18,
            border: `1px solid ${t.border}`,
            background: t.white,
            cursor: "pointer",
            display: "grid",
            placeItems: "center",
            boxShadow: `0 4px 14px ${alpha(t.ink, 0.06)}`,
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 22 }}>💬</span>
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
                color: "#fff",
                fontSize: 10,
                fontWeight: 800,
                display: "grid",
                placeItems: "center",
                padding: "0 3px",
              }}
            >
              {pendingMessageCount}
            </span>
          ) : null}
        </button>
      </div>

      {/* Filter chips — interactive */}
      <div
        style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}
      >
        <button
          type="button"
          onClick={() => {
            setActiveFilter(activeFilter === "trending" ? null : "trending");
            setStarterIndex(0);
          }}
          style={{
            padding: "7px 12px",
            borderRadius: 999,
            background:
              activeFilter === "trending" ? t.green : alpha(t.green, 0.08),
            border: `1px solid ${activeFilter === "trending" ? t.green : alpha(t.green, 0.14)}`,
            color: activeFilter === "trending" ? "#fff" : t.ink,
            fontSize: 11,
            fontWeight: 700,
            cursor: "pointer",
            transition: "background 160ms, color 160ms, border-color 160ms",
          }}
        >
          🔥 Trending
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveFilter(activeFilter === "new" ? null : "new");
            setStarterIndex(0);
          }}
          style={{
            padding: "7px 12px",
            borderRadius: 999,
            background:
              activeFilter === "new" ? alpha(t.ink, 0.85) : alpha(t.ink, 0.05),
            border: `1px solid ${activeFilter === "new" ? alpha(t.ink, 0.6) : alpha(t.ink, 0.08)}`,
            color:
              activeFilter === "new"
                ? t.skin === "#0a0a0a"
                  ? "#fff"
                  : t.skin
                : t.ink,
            fontSize: 11,
            fontWeight: 700,
            cursor: "pointer",
            transition: "background 160ms, color 160ms, border-color 160ms",
          }}
        >
          New today
        </button>
        {usingStarterInventory ? (
          <div
            style={{
              padding: "7px 12px",
              borderRadius: 999,
              background: alpha(t.red, 0.06),
              border: `1px solid ${alpha(t.red, 0.12)}`,
              color: t.mid,
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            {activeFilter
              ? `${filteredStarterDeck.length} shown`
              : `${starterIndex + 1}/${starterDeck.length}`}
          </div>
        ) : null}
      </div>

      {/* Search */}
      {!guestMode ? (
        <div style={{ marginBottom: 16 }}>
          <SearchBar
            t={t}
            value={searchTerm}
            onChange={onSearch}
            placeholder="Search by name, location, category, type, or focus"
          />
        </div>
      ) : null}

      {/* Card + action buttons */}
      {isLoading && !guestMode ? (
        <SurfaceCard
          t={t}
          style={{ textAlign: "center", padding: "40px 20px" }}
        >
          <div style={{ fontSize: 14, color: t.mid }}>
            Loading discovery profiles...
          </div>
        </SurfaceCard>
      ) : !currentProfile ? (
        <EmptyState
          t={t}
          title={searchTerm ? "No search results" : "No profiles found"}
          body={
            searchTerm
              ? "No matching profiles for that search. Try a broader term or clear the search."
              : "You have reached the end of the current discovery list."
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
        <>
          <DiscoverCard
            t={t}
            profile={currentProfile}
            previewMode={isPreview}
            onViewProfile={() => onViewProfile?.(currentProfile)}
            onInterested={handleStarterInterested}
            onPass={handleStarterPass}
            onStartChat={onStartChat}
            onCompleteProfile={onCompleteProfile}
          />

          {/* Big action buttons below the deck */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "auto 1fr 1fr auto",
              alignItems: "center",
              gap: 14,
              marginTop: 22,
              maxWidth: 440,
              marginLeft: "auto",
              marginRight: "auto",
              padding: "0 4px",
            }}
          >
            {/* Message — left utility */}
            <button
              type="button"
              onClick={onStartChat}
              aria-label="Message"
              style={{
                width: 48,
                height: 48,
                borderRadius: 999,
                border: `1px solid ${t.border}`,
                background: t.white,
                cursor: "pointer",
                fontSize: 20,
                display: "grid",
                placeItems: "center",
                boxShadow: `0 4px 14px ${alpha(t.ink, 0.08)}`,
              }}
            >
              💬
            </button>

            {/* Pass — big left */}
            <button
              type="button"
              onClick={handleStarterPass}
              aria-label="Pass"
              style={{
                minHeight: 56,
                borderRadius: 18,
                border: `2px solid ${alpha(t.red, 0.32)}`,
                background: alpha(t.red, 0.07),
                color: t.red,
                fontWeight: 800,
                fontSize: 16,
                cursor: "pointer",
                letterSpacing: 0.4,
              }}
            >
              ✗ Pass
            </button>

            {/* Interested — big right */}
            <button
              type="button"
              onClick={handleStarterInterested}
              aria-label="Interested"
              style={{
                minHeight: 56,
                borderRadius: 18,
                border: "none",
                background: t.green,
                color: "#fff",
                fontWeight: 800,
                fontSize: 16,
                cursor: "pointer",
                letterSpacing: 0.4,
                boxShadow: `0 8px 24px ${alpha(t.green, 0.3)}`,
              }}
            >
              ♥ Interested
            </button>

            {/* Report — right utility */}
            <button
              type="button"
              onClick={onReport}
              aria-label="Report"
              style={{
                width: 48,
                height: 48,
                borderRadius: 999,
                border: `1px solid ${t.border}`,
                background: t.white,
                cursor: "pointer",
                fontSize: 18,
                display: "grid",
                placeItems: "center",
                boxShadow: `0 4px 14px ${alpha(t.ink, 0.08)}`,
              }}
            >
              ⚑
            </button>
          </div>

          {/* Secondary: Hide */}
          <div
            style={{
              maxWidth: 440,
              marginLeft: "auto",
              marginRight: "auto",
              marginTop: 10,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <button
              type="button"
              onClick={onBlock}
              style={{
                background: "none",
                border: "none",
                color: t.muted,
                fontSize: 12,
                cursor: "pointer",
                padding: "8px 14px",
                fontWeight: 600,
              }}
            >
              Hide this profile
            </button>
          </div>
        </>
      )}
    </div>
  );
}

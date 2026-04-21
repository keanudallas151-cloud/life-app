import { useEffect, useMemo, useState } from "react";
import { useInventorsInvestorsData } from "../hooks/useInventorsInvestorsData";
import {
  clearDraft,
  investorProfileDefaults,
  inventorProfileDefaults,
  loadDraft,
  loadFeatureView,
  matchesSearch,
  saveDraft,
  saveFeatureView,
} from "../utils/inventorsInvestors";
import { EmptyState, FeatureFrame, PrimaryButton, SecondaryButton } from "./inventorsInvestors/InventorsInvestorsUI";
import { InventorsInvestorsLandingPage } from "./inventorsInvestors/pages/InventorsInvestorsLandingPage";
import { InventorsInvestorsMessagesPage } from "./inventorsInvestors/pages/InventorsInvestorsMessagesPage";
import { InventorsInvestorsSwipePage } from "./inventorsInvestors/pages/InventorsInvestorsSwipePage";
import { InventorProfileSetupPage } from "./inventorsInvestors/pages/InventorProfileSetupPage";
import { InvestorProfileSetupPage } from "./inventorsInvestors/pages/InvestorProfileSetupPage";

function mapInvestorForm(profile, investorProfile, userId) {
  const base = loadDraft(userId, "investor", investorProfileDefaults);
  return {
    ...base,
    fullName: profile?.full_name || base.fullName,
    avatarPreviewUrl: profile?.avatar_url || base.avatarPreviewUrl,
    location: profile?.location || base.location,
    contactEmail: profile?.email || base.contactEmail,
    phoneNumber: profile?.phone || base.phoneNumber,
    shortBio: profile?.bio || base.shortBio,
    investmentBudget: investorProfile?.investment_budget?.toString() || base.investmentBudget,
    investmentRangeMin: investorProfile?.investment_range_min?.toString() || base.investmentRangeMin,
    investmentRangeMax: investorProfile?.investment_range_max?.toString() || base.investmentRangeMax,
    lookingToInvestIn: investorProfile?.looking_to_invest_in || base.lookingToInvestIn,
    preferredIndustries: Array.isArray(investorProfile?.preferred_industries)
      ? investorProfile.preferred_industries.join(", ")
      : base.preferredIndustries,
    stagePreference: investorProfile?.stage_preference || base.stagePreference,
    emailPublic: profile?.email_public ?? base.emailPublic,
    phonePublic: profile?.phone_public ?? base.phonePublic,
  };
}

function mapInventorForm(profile, inventorProfile, userId) {
  const base = loadDraft(userId, "inventor", inventorProfileDefaults);
  return {
    ...base,
    fullName: profile?.full_name || base.fullName,
    avatarPreviewUrl: profile?.avatar_url || base.avatarPreviewUrl,
    location: profile?.location || base.location,
    contactEmail: profile?.email || base.contactEmail,
    phoneNumber: profile?.phone || base.phoneNumber,
    inventionName: inventorProfile?.invention_name || base.inventionName,
    inventionType: inventorProfile?.invention_type || base.inventionType,
    description: inventorProfile?.description || base.description,
    revenue: inventorProfile?.revenue?.toString() || base.revenue,
    equityAvailable: inventorProfile?.equity_available?.toString() || base.equityAvailable,
    fundingSought: inventorProfile?.funding_sought?.toString() || base.fundingSought,
    category: inventorProfile?.category || base.category,
    websiteUrl: inventorProfile?.website_url || base.websiteUrl,
    socialLinks: Array.isArray(inventorProfile?.social_links)
      ? inventorProfile.social_links.join(", ")
      : base.socialLinks,
    shortPitch: inventorProfile?.short_pitch || base.shortPitch,
    emailPublic: profile?.email_public ?? base.emailPublic,
    phonePublic: profile?.phone_public ?? base.phonePublic,
  };
}

function MatchOverlay({ t, matchState, onClose, onOpenMessages }) {
  if (!matchState) return null;
  const isMatch = matchState.type === "match";

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1500, background: "rgba(0,0,0,0.68)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "min(100%, 420px)", borderRadius: 28, background: "linear-gradient(180deg, rgba(7,7,7,0.98) 0%, rgba(18,18,18,0.98) 100%)", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 28px 70px rgba(0,0,0,0.45)", padding: "24px 22px 22px", color: "#ffffff", textAlign: "center" }}>
        <div style={{ fontSize: isMatch ? 38 : 30, lineHeight: 1, marginBottom: 10 }}>{isMatch ? "🔥" : "✓"}</div>
        <div style={{ fontSize: isMatch ? 30 : 22, fontWeight: 800, letterSpacing: -0.6, lineHeight: 1.05 }}>
          {isMatch ? "It’s a match" : `You liked ${matchState.name}`}
        </div>
        <div style={{ marginTop: 12, fontSize: 14, lineHeight: 1.7, color: "rgba(255,255,255,0.76)" }}>
          {isMatch
            ? `${matchState.name} looks aligned with your direction. Open messages and start the conversation while the interest is fresh.`
            : `${matchState.name} has been added to your interest trail. Keep swiping to build momentum.`}
        </div>
        <div style={{ display: "grid", gap: 10, marginTop: 18 }}>
          {isMatch ? <PrimaryButton t={t} onClick={onOpenMessages}>Open messages</PrimaryButton> : null}
          <SecondaryButton t={t} onClick={onClose}>{isMatch ? "Keep browsing" : "Continue swiping"}</SecondaryButton>
        </div>
      </div>
    </div>
  );
}

export function InventorsInvestors({ t, user, play }) {
  const {
    loading,
    saving,
    uploadProgress,
    discoveryLoading,
    messageSending,
    profile,
    investorProfile,
    inventorProfile,
    discoveryProfiles,
    conversations,
    activeConversationId,
    selectedRole,
    unreadMessageCount,
    setActiveConversationId,
    chooseRole,
    saveInvestorProfile,
    saveInventorProfile,
    createSwipe,
    ensureConversation,
    sendMessage,
    markConversationRead,
    blockUser,
    reportUser,
  } = useInventorsInvestorsData(user);

  const userId = user?.id || "guest";
  const [view, setView] = useState(() => loadFeatureView(userId));
  const [roleChoice, setRoleChoice] = useState(selectedRole || "");
  const [searchTerm, setSearchTerm] = useState("");
  const [investorForm, setInvestorForm] = useState(() => mapInvestorForm(null, null, userId));
  const [inventorForm, setInventorForm] = useState(() => mapInventorForm(null, null, userId));
  const [roleSubmitting, setRoleSubmitting] = useState(false);
  const [matchState, setMatchState] = useState(null);

  useEffect(() => {
    if (!userId || userId === "guest") return;
    if (selectedRole) setRoleChoice(selectedRole);
  }, [selectedRole, userId]);

  useEffect(() => {
    if (!userId || userId === "guest") return;
    setInvestorForm(mapInvestorForm(profile, investorProfile, userId));
    setInventorForm(mapInventorForm(profile, inventorProfile, userId));
  }, [profile, investorProfile, inventorProfile, userId]);

  useEffect(() => {
    if (!userId || userId === "guest") return;
    saveDraft(userId, "investor", investorForm);
  }, [investorForm, userId]);

  useEffect(() => {
    if (!userId || userId === "guest") return;
    saveDraft(userId, "inventor", inventorForm);
  }, [inventorForm, userId]);

  useEffect(() => {
    if (!userId || userId === "guest") return;
    saveFeatureView(userId, view);
  }, [userId, view]);

  useEffect(() => {
    if (loading) return;
    if (!user?.id) return;

    const effectiveRole = profile?.role || selectedRole || roleChoice;

    if (!effectiveRole) {
      if (!["landing", "messages", "role_selection"].includes(view)) {
        setView("landing");
      }
      return;
    }

    if (!profile?.profile_completed) {
      if (!["swipe", "investor_setup", "inventor_setup"].includes(view)) {
        setView("swipe");
      }
      return;
    }

    const storedView = loadFeatureView(user.id);
    if (!storedView || storedView === "landing" || view === "landing") {
      setView("swipe");
    }
  }, [loading, profile, roleChoice, selectedRole, user?.id, view]);

  const filteredProfiles = useMemo(
    () => discoveryProfiles.filter((item) => matchesSearch(item, searchTerm)),
    [discoveryProfiles, searchTerm],
  );

  const activeProfile = filteredProfiles[0] || null;
  const profileCompleted = Boolean(profile?.profile_completed);

  if (!user) {
    return (
      <FeatureFrame
        t={t}
        eyebrow="Networking"
        title="Inventors & Investors"
        subtitle="Sign in first so your role, messages, swipes, and privacy settings can be tied to your account."
      >
        <EmptyState
          t={t}
          title="Sign in required"
          body="This feature uses your authenticated Life. account for profiles, swipes, and private messaging."
          action={
            <PrimaryButton t={t} onClick={() => play?.("tap")}>
              Sign in from the main app
            </PrimaryButton>
          }
        />
      </FeatureFrame>
    );
  }

  const openMessages = async () => {
    play?.("tap");
    setView("messages");
    if (activeConversationId) {
      await markConversationRead(activeConversationId);
    }
  };

  const showSwipeFeedback = (targetProfile) => {
    if (!targetProfile) return;
    const shouldMatch = Math.random() < 0.35;
    setMatchState({
      type: shouldMatch ? "match" : "liked",
      name: targetProfile.full_name || "this profile",
      targetUserId: targetProfile.user_id,
    });
  };

  const handleRoleContinue = async (nextRole = roleChoice) => {
    if (!nextRole || roleSubmitting) return;
    play?.("tap");
    setRoleSubmitting(true);
    setRoleChoice(nextRole);
    setView("swipe");
    try {
      await chooseRole(nextRole);
    } catch (error) {
      console.error("Failed to choose role", error);
    } finally {
      setRoleSubmitting(false);
    }
  };

  const handleCompleteProfileSetup = () => {
    play?.("tap");
    const effectiveRole = profile?.role || selectedRole || roleChoice;
    if (!effectiveRole) return;
    setView(effectiveRole === "investor" ? "investor_setup" : "inventor_setup");
  };

  const handleInvestorSubmit = async () => {
    play?.("tap");
    const result = await saveInvestorProfile(investorForm);
    if (!result.ok) return;
    clearDraft(userId, "investor");
    setView("swipe");
  };

  const handleInventorSubmit = async () => {
    play?.("tap");
    const result = await saveInventorProfile(inventorForm);
    if (!result.ok) return;
    clearDraft(userId, "inventor");
    setView("swipe");
  };

  const handleStartChat = async (targetUserId) => {
    const conversationId = await ensureConversation(targetUserId);
    if (!conversationId) return;
    setActiveConversationId(conversationId);
    setView("messages");
  };

  const handleBlock = async (targetUserId) => {
    play?.("tap");
    await blockUser(targetUserId);
  };

  const handleReport = async (targetUserId) => {
    play?.("tap");
    const reason = window.prompt("Report reason", "Spam or misleading profile") || "User report";
    const details = window.prompt("Extra detail (optional)", "") || "";
    await reportUser(targetUserId, reason, details);
  };

  const setInvestorField = (field, value) => {
    setInvestorForm((current) => ({ ...current, [field]: value }));
  };

  const setInventorField = (field, value) => {
    setInventorForm((current) => ({ ...current, [field]: value }));
  };

  const handleAvatarChange = (setForm) => (files) => {
    const file = files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setForm((current) => ({ ...current, avatarFile: file, avatarPreviewUrl: previewUrl }));
  };

  const handleGalleryChange = (files) => {
    const nextFiles = Array.from(files || []);
    const previewUrls = nextFiles.map((file) => URL.createObjectURL(file));
    setInventorForm((current) => ({
      ...current,
      galleryFiles: nextFiles,
      galleryPreviewUrls: previewUrls,
    }));
  };

  switch (view) {
    case "investor_setup":
      return (
        <InvestorProfileSetupPage
          t={t}
          values={investorForm}
          onChange={setInvestorField}
          onAvatarChange={handleAvatarChange(setInvestorForm)}
          onSubmit={handleInvestorSubmit}
          onBack={() => setView("swipe")}
          submitting={saving}
          uploadProgress={uploadProgress}
        />
      );

    case "inventor_setup":
      return (
        <InventorProfileSetupPage
          t={t}
          values={inventorForm}
          onChange={setInventorField}
          onAvatarChange={handleAvatarChange(setInventorForm)}
          onGalleryChange={handleGalleryChange}
          onSubmit={handleInventorSubmit}
          onBack={() => setView("swipe")}
          submitting={saving}
          uploadProgress={uploadProgress}
        />
      );

    case "messages":
      return (
        <>
          <InventorsInvestorsMessagesPage
            t={t}
            conversations={conversations}
            activeConversationId={activeConversationId}
            onOpenConversation={async (conversationId) => {
              play?.("tap");
              setActiveConversationId(conversationId);
              await markConversationRead(conversationId);
            }}
            onBackToDiscovery={() => {
              play?.("tap");
              setView("swipe");
            }}
            onSendMessage={sendMessage}
            sending={messageSending}
          />
          <MatchOverlay t={t} matchState={matchState} onClose={() => setMatchState(null)} onOpenMessages={openMessages} />
        </>
      );

    case "swipe":
      return (
        <>
          <div>
            <div style={{ width: "100%", maxWidth: 720, margin: "0 auto", padding: "12px 18px 0" }}>
              <SecondaryButton t={t} onClick={() => { play?.("tap"); setView("landing"); }}>← Back</SecondaryButton>
            </div>
            <InventorsInvestorsSwipePage
              t={t}
              viewerRole={profile?.role || roleChoice}
              profileCompleted={profileCompleted}
              searchTerm={searchTerm}
              onSearch={setSearchTerm}
              onOpenMessages={openMessages}
              pendingMessageCount={unreadMessageCount}
              activeProfile={activeProfile}
              hasProfiles={Boolean(filteredProfiles.length)}
              isLoading={loading || discoveryLoading}
              onInterested={() => {
                if (!activeProfile) return;
                showSwipeFeedback(activeProfile);
                createSwipe(activeProfile.user_id, "interested");
              }}
              onPass={() => activeProfile && createSwipe(activeProfile.user_id, "pass")}
              onStartChat={() => activeProfile && handleStartChat(activeProfile.user_id)}
              onBlock={() => activeProfile && handleBlock(activeProfile.user_id)}
              onReport={() => activeProfile && handleReport(activeProfile.user_id)}
              onResetSearch={() => setSearchTerm("")}
              onCompleteProfile={handleCompleteProfileSetup}
            />
          </div>
          <MatchOverlay t={t} matchState={matchState} onClose={() => setMatchState(null)} onOpenMessages={openMessages} />
        </>
      );

    case "role_selection":
    case "landing":
    default:
      return (
        <>
          <InventorsInvestorsLandingPage
            t={t}
            hasMessages={Boolean(conversations.length)}
            onChooseRole={handleRoleContinue}
            onGoMessages={openMessages}
          />
          <MatchOverlay t={t} matchState={matchState} onClose={() => setMatchState(null)} onOpenMessages={openMessages} />
        </>
      );
  }
}

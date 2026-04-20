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
import { EmptyState, FeatureFrame, PrimaryButton } from "./inventorsInvestors/InventorsInvestorsUI";
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

    if (!profile?.role) {
      if (!["landing", "messages"].includes(view)) {
        setView("landing");
      }
      return;
    }

    if (!profile.profile_completed) {
      if (profile.role === "investor") setView("investor_setup");
      if (profile.role === "inventor") setView("inventor_setup");
      return;
    }

    if (!loadFeatureView(user.id) || loadFeatureView(user.id) === "landing") {
      setView("swipe");
    }
  }, [loading, profile, user?.id, view]);

  const filteredProfiles = useMemo(
    () => discoveryProfiles.filter((item) => matchesSearch(item, searchTerm)),
    [discoveryProfiles, searchTerm],
  );

  const activeProfile = filteredProfiles[0] || null;

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

  const handleRoleContinue = async (nextRole = roleChoice) => {
    if (!nextRole) return;
    play?.("tap");
    setRoleChoice(nextRole);
    await chooseRole(nextRole);
    setView(nextRole === "investor" ? "investor_setup" : "inventor_setup");
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
          onBack={() => setView("landing")}
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
          onBack={() => setView("landing")}
          submitting={saving}
          uploadProgress={uploadProgress}
        />
      );

    case "messages":
      return (
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
      );

    case "swipe":
      return (
        <InventorsInvestorsSwipePage
          t={t}
          viewerRole={profile?.role || roleChoice}
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
          onOpenMessages={openMessages}
          pendingMessageCount={unreadMessageCount}
          activeProfile={activeProfile}
          hasProfiles={Boolean(filteredProfiles.length)}
          isLoading={loading || discoveryLoading}
          onInterested={() => activeProfile && createSwipe(activeProfile.user_id, "interested")}
          onPass={() => activeProfile && createSwipe(activeProfile.user_id, "pass")}
          onStartChat={() => activeProfile && handleStartChat(activeProfile.user_id)}
          onBlock={() => activeProfile && handleBlock(activeProfile.user_id)}
          onReport={() => activeProfile && handleReport(activeProfile.user_id)}
          onResetSearch={() => setSearchTerm("")}
        />
      );

    case "role_selection":
    case "landing":
    default:
      return (
        <InventorsInvestorsLandingPage
          t={t}
          hasMessages={Boolean(conversations.length)}
          onChooseRole={handleRoleContinue}
          onGoMessages={openMessages}
        />
      );
  }
}

import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "../supabaseClient";
import {
  loadLocalNetworkingState,
  loadRoleChoice,
  normalizeListInput,
  saveLocalNetworkingState,
  saveRoleChoice,
} from "../utils/inventorsInvestors";

const STORAGE_BUCKET = "inventors-investors-media";

export function useInventorsInvestorsData(user) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [discoveryLoading, setDiscoveryLoading] = useState(false);
  const [messageSending, setMessageSending] = useState(false);
  const [profile, setProfile] = useState(null);
  const [investorProfile, setInvestorProfile] = useState(null);
  const [inventorProfile, setInventorProfile] = useState(null);
  const [discoveryProfiles, setDiscoveryProfiles] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState("");
  const [selectedRole, setSelectedRole] = useState("");

  const persistLocalState = useCallback(
    (nextState) => {
      if (!user?.id) return;
      const current = loadLocalNetworkingState(user.id) || {};
      saveLocalNetworkingState(user.id, {
        ...current,
        ...nextState,
        selectedRole:
          nextState?.selectedRole || current.selectedRole || selectedRole || "",
      });
    },
    [selectedRole, user?.id],
  );

  const loadDiscovery = useCallback(
    async (roleOverride) => {
      const role = roleOverride || profile?.role || selectedRole;
      if (!user?.id || !role) {
        setDiscoveryProfiles([]);
        return;
      }

      setDiscoveryLoading(true);
      try {
        const targetRole = role === "investor" ? "inventor" : "investor";

        const [viewResponse, swipesResponse, outgoingBlocksResponse, incomingBlocksResponse] =
          await Promise.all([
            supabase
              .from("inventors_investors_public_profiles")
              .select("*")
              .eq("role", targetRole)
              .order("updated_at", { ascending: false }),
            supabase.from("swipes").select("to_user_id").eq("from_user_id", user.id),
            supabase
              .from("blocked_users")
              .select("blocked_user_id")
              .eq("blocker_user_id", user.id),
            supabase
              .from("blocked_users")
              .select("blocker_user_id")
              .eq("blocked_user_id", user.id),
          ]);

        const rawProfiles = viewResponse.data || [];
        const swiped = new Set((swipesResponse.data || []).map((item) => item.to_user_id));
        const blocked = new Set([
          ...(outgoingBlocksResponse.data || []).map((item) => item.blocked_user_id),
          ...(incomingBlocksResponse.data || []).map((item) => item.blocker_user_id),
        ]);

        const inventorProfileIds = rawProfiles
          .filter((item) => item.role === "inventor" && item.inventor_profile_id)
          .map((item) => item.inventor_profile_id);

        let imageMap = new Map();
        if (inventorProfileIds.length) {
          const { data: imageRows } = await supabase
            .from("inventor_profile_images")
            .select("inventor_profile_id, image_url, sort_order")
            .in("inventor_profile_id", inventorProfileIds)
            .order("sort_order", { ascending: true });

          imageMap = new Map();
          (imageRows || []).forEach((row) => {
            if (!imageMap.has(row.inventor_profile_id)) {
              imageMap.set(row.inventor_profile_id, row.image_url);
            }
          });
        }

        const filtered = rawProfiles
          .filter((item) => item.user_id !== user.id)
          .filter((item) => !blocked.has(item.user_id))
          .filter((item) => !swiped.has(item.user_id))
          .map((item) => ({
            ...item,
            hero_image_url: imageMap.get(item.inventor_profile_id) || "",
          }));

        setDiscoveryProfiles(filtered);
      } catch (error) {
        console.error("Failed to load discovery profiles", error);
        setDiscoveryProfiles([]);
      } finally {
        setDiscoveryLoading(false);
      }
    },
    [profile?.role, selectedRole, user?.id],
  );

  const loadConversations = useCallback(async () => {
    if (!user?.id) {
      setConversations([]);
      setActiveConversationId("");
      return;
    }

    try {
      const { data: participantRows } = await supabase
        .from("conversation_participants")
        .select("conversation_id, last_read_at")
        .eq("user_id", user.id);

      const conversationIds = (participantRows || []).map((row) => row.conversation_id);
      if (!conversationIds.length) {
        setConversations([]);
        setActiveConversationId("");
        return;
      }

      const [{ data: conversationRows }, { data: peerRows }, { data: messageRows }] = await Promise.all([
        supabase
          .from("conversations")
          .select("id, created_at, updated_at")
          .in("id", conversationIds)
          .order("updated_at", { ascending: false }),
        supabase
          .from("conversation_participants")
          .select("conversation_id, user_id")
          .in("conversation_id", conversationIds)
          .neq("user_id", user.id),
        supabase
          .from("messages")
          .select("id, conversation_id, sender_user_id, message_text, created_at")
          .in("conversation_id", conversationIds)
          .order("created_at", { ascending: true }),
      ]);

      const peerIds = Array.from(new Set((peerRows || []).map((row) => row.user_id)));
      const { data: peerProfiles } = peerIds.length
        ? await supabase
            .from("inventors_investors_public_profiles")
            .select("user_id, full_name, avatar_url, role, location")
            .in("user_id", peerIds)
        : { data: [] };

      const participantMap = new Map((peerProfiles || []).map((row) => [row.user_id, row]));
      const peerMap = new Map((peerRows || []).map((row) => [row.conversation_id, row.user_id]));
      const readMap = new Map((participantRows || []).map((row) => [row.conversation_id, row.last_read_at]));

      const groupedMessages = new Map();
      (messageRows || []).forEach((row) => {
        const bucket = groupedMessages.get(row.conversation_id) || [];
        bucket.push({ ...row, isMine: row.sender_user_id === user.id });
        groupedMessages.set(row.conversation_id, bucket);
      });

      const nextConversations = (conversationRows || []).map((row) => {
        const messages = groupedMessages.get(row.id) || [];
        const lastMessage = messages[messages.length - 1] || null;
        const lastReadAt = readMap.get(row.id);
        const unreadCount = messages.filter((message) => {
          if (message.sender_user_id === user.id) return false;
          if (!lastReadAt) return true;
          return new Date(message.created_at).getTime() > new Date(lastReadAt).getTime();
        }).length;

        return {
          ...row,
          participant: participantMap.get(peerMap.get(row.id)) || null,
          messages,
          lastMessage,
          unreadCount,
        };
      });

      setConversations(nextConversations);
      setActiveConversationId((current) => current || nextConversations[0]?.id || "");
    } catch (error) {
      console.error("Failed to load conversations", error);
      setConversations([]);
      setActiveConversationId("");
    }
  }, [user?.id]);

  const loadInitial = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const localState = loadLocalNetworkingState(user.id) || null;

    try {
      const [{ data: profileRow }, { data: investorRow }, { data: inventorRow }] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("investor_profiles").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("inventor_profiles").select("*").eq("user_id", user.id).maybeSingle(),
      ]);

      const nextProfile = profileRow || localState?.profile || null;
      const nextInvestorProfile = investorRow || localState?.investorProfile || null;
      const nextInventorProfile = inventorRow || localState?.inventorProfile || null;
      const nextRole =
        profileRow?.role ||
        localState?.selectedRole ||
        loadRoleChoice(user.id);

      setProfile(nextProfile);
      setInvestorProfile(nextInvestorProfile);
      setInventorProfile(nextInventorProfile);
      setSelectedRole(nextRole || "");

      await Promise.all([
        nextRole ? loadDiscovery(nextRole) : Promise.resolve(setDiscoveryProfiles([])),
        loadConversations(),
      ]);
    } catch (error) {
      console.error("Failed to load Inventors & Investors state", error);
      const nextRole = localState?.selectedRole || loadRoleChoice(user.id);
      setProfile(localState?.profile || null);
      setInvestorProfile(localState?.investorProfile || null);
      setInventorProfile(localState?.inventorProfile || null);
      setSelectedRole(nextRole || "");
      await Promise.all([
        nextRole ? loadDiscovery(nextRole) : Promise.resolve(setDiscoveryProfiles([])),
        loadConversations(),
      ]);
    } finally {
      setLoading(false);
    }
  }, [loadConversations, loadDiscovery, user?.id]);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  useEffect(() => {
    if (!user?.id) return undefined;

    const channel = supabase
      .channel(`ii_messages_${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages" },
        async () => {
          await loadConversations();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadConversations, user?.id]);

  const chooseRole = useCallback(
    async (role) => {
      if (!user?.id) return;

      const optimisticProfile = {
        ...(profile || {}),
        user_id: user.id,
        full_name: profile?.full_name || user.name || user.email || "",
        email: profile?.email || user.email || "",
        role,
        profile_completed: profile?.profile_completed || false,
      };

      saveRoleChoice(user.id, role);
      setSelectedRole(role);
      setProfile(optimisticProfile);
      persistLocalState({ profile: optimisticProfile, selectedRole: role });

      try {
        const payload = {
          user_id: user.id,
          role,
          full_name: optimisticProfile.full_name,
          email: optimisticProfile.email,
          profile_completed: optimisticProfile.profile_completed,
        };

        const { data } = await supabase
          .from("profiles")
          .upsert(payload, { onConflict: "user_id" })
          .select()
          .single();

        const nextProfile = data || optimisticProfile;
        setProfile(nextProfile);
        persistLocalState({ profile: nextProfile, selectedRole: role });
      } catch (error) {
        console.error("Failed to choose role", error);
      }

      await loadDiscovery(role);
    },
    [loadDiscovery, persistLocalState, profile, user],
  );

  const uploadFile = useCallback(async (file, folder) => {
    const extension = (file.name.split(".").pop() || "jpg").toLowerCase();
    const safeFileName = `${folder}/${window.crypto.randomUUID()}.${extension}`;
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(safeFileName, file, { upsert: true, cacheControl: "3600" });

    if (error) throw error;
    const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(safeFileName);
    return data.publicUrl;
  }, []);

  const saveInvestorProfile = useCallback(
    async (values) => {
      if (!user?.id) return { ok: false };
      setSaving(true);
      setUploadProgress(15);

      let avatarUrl = !isBlobPreviewUrl(values.avatarPreviewUrl)
        ? values.avatarPreviewUrl || profile?.avatar_url || ""
        : profile?.avatar_url || values.avatarPreviewUrl || "";

      try {
        if (values.avatarFile) {
          avatarUrl = await uploadFile(values.avatarFile, `${user.id}/avatar`);
          setUploadProgress(40);
        }

        const optimisticProfile = {
          ...(profile || {}),
          user_id: user.id,
          full_name: values.fullName.trim(),
          role: "investor",
          avatar_url: avatarUrl,
          location: values.location.trim(),
          bio: values.shortBio.trim(),
          email: values.contactEmail.trim(),
          phone: values.phoneNumber.trim(),
          email_public: values.emailPublic,
          phone_public: values.phonePublic,
          profile_completed: true,
        };

        const optimisticInvestorProfile = {
          ...(investorProfile || {}),
          user_id: user.id,
          investment_budget: toNumberOrNull(values.investmentBudget),
          investment_range_min: toNumberOrNull(values.investmentRangeMin),
          investment_range_max: toNumberOrNull(values.investmentRangeMax),
          looking_to_invest_in: values.lookingToInvestIn.trim(),
          preferred_industries: normalizeListInput(values.preferredIndustries),
          stage_preference: values.stagePreference,
        };

        const { data: profileRow, error: profileError } = await supabase
          .from("profiles")
          .upsert(optimisticProfile, { onConflict: "user_id" })
          .select()
          .single();

        if (profileError) throw profileError;
        setUploadProgress(70);

        const { data: investorRow, error: investorError } = await supabase
          .from("investor_profiles")
          .upsert(optimisticInvestorProfile, { onConflict: "user_id" })
          .select()
          .single();

        if (investorError) throw investorError;

        setProfile(profileRow || optimisticProfile);
        setInvestorProfile(investorRow || optimisticInvestorProfile);
        setSelectedRole("investor");
        persistLocalState({
          profile: profileRow || optimisticProfile,
          investorProfile: investorRow || optimisticInvestorProfile,
          inventorProfile,
          selectedRole: "investor",
        });
        await Promise.all([loadDiscovery("investor"), loadConversations()]);
        setUploadProgress(100);
        return { ok: true };
      } catch (error) {
        console.error("Failed to save investor profile", error);

        const fallbackProfile = {
          ...(profile || {}),
          user_id: user.id,
          full_name: values.fullName.trim(),
          role: "investor",
          avatar_url: avatarUrl,
          location: values.location.trim(),
          bio: values.shortBio.trim(),
          email: values.contactEmail.trim(),
          phone: values.phoneNumber.trim(),
          email_public: values.emailPublic,
          phone_public: values.phonePublic,
          profile_completed: true,
        };

        const fallbackInvestorProfile = {
          ...(investorProfile || {}),
          user_id: user.id,
          investment_budget: toNumberOrNull(values.investmentBudget),
          investment_range_min: toNumberOrNull(values.investmentRangeMin),
          investment_range_max: toNumberOrNull(values.investmentRangeMax),
          looking_to_invest_in: values.lookingToInvestIn.trim(),
          preferred_industries: normalizeListInput(values.preferredIndustries),
          stage_preference: values.stagePreference,
        };

        setProfile(fallbackProfile);
        setInvestorProfile(fallbackInvestorProfile);
        setSelectedRole("investor");
        persistLocalState({
          profile: fallbackProfile,
          investorProfile: fallbackInvestorProfile,
          inventorProfile,
          selectedRole: "investor",
        });
        await loadDiscovery("investor");
        return { ok: true, degraded: true };
      } finally {
        setSaving(false);
        window.setTimeout(() => setUploadProgress(0), 300);
      }
    },
    [
      inventorProfile,
      investorProfile,
      loadConversations,
      loadDiscovery,
      persistLocalState,
      profile,
      uploadFile,
      user?.id,
    ],
  );

  const saveInventorProfile = useCallback(
    async (values) => {
      if (!user?.id) return { ok: false };
      setSaving(true);
      setUploadProgress(10);

      let avatarUrl = !isBlobPreviewUrl(values.avatarPreviewUrl)
        ? values.avatarPreviewUrl || profile?.avatar_url || ""
        : profile?.avatar_url || values.avatarPreviewUrl || "";

      try {
        if (values.avatarFile) {
          avatarUrl = await uploadFile(values.avatarFile, `${user.id}/avatar`);
          setUploadProgress(25);
        }

        const optimisticProfile = {
          ...(profile || {}),
          user_id: user.id,
          full_name: values.fullName.trim(),
          role: "inventor",
          avatar_url: avatarUrl,
          location: values.location.trim(),
          bio: values.shortPitch.trim(),
          email: values.contactEmail.trim(),
          phone: values.phoneNumber.trim(),
          email_public: values.emailPublic,
          phone_public: values.phonePublic,
          profile_completed: true,
        };

        const optimisticInventorProfile = {
          ...(inventorProfile || {}),
          user_id: user.id,
          invention_name: values.inventionName.trim(),
          invention_type: values.inventionType.trim(),
          description: values.description.trim(),
          revenue: toNumberOrNull(values.revenue),
          equity_available: toNumberOrNull(values.equityAvailable),
          funding_sought: toNumberOrNull(values.fundingSought),
          category: values.category.trim(),
          website_url: values.websiteUrl.trim() || null,
          social_links: normalizeListInput(values.socialLinks),
          short_pitch: values.shortPitch.trim(),
        };

        const { data: profileRow, error: profileError } = await supabase
          .from("profiles")
          .upsert(optimisticProfile, { onConflict: "user_id" })
          .select()
          .single();

        if (profileError) throw profileError;
        setUploadProgress(45);

        const { data: inventorRow, error: inventorError } = await supabase
          .from("inventor_profiles")
          .upsert(optimisticInventorProfile, { onConflict: "user_id" })
          .select()
          .single();

        if (inventorError) throw inventorError;
        setUploadProgress(60);

        if (values.galleryFiles.length) {
          const galleryRows = [];
          for (let index = 0; index < values.galleryFiles.length; index += 1) {
            const url = await uploadFile(values.galleryFiles[index], `${user.id}/gallery`);
            galleryRows.push({ inventor_profile_id: inventorRow.id, image_url: url, sort_order: index });
            setUploadProgress(60 + Math.round(((index + 1) / values.galleryFiles.length) * 25));
          }

          await supabase.from("inventor_profile_images").delete().eq("inventor_profile_id", inventorRow.id);
          const { error: imageError } = await supabase.from("inventor_profile_images").insert(galleryRows);
          if (imageError) throw imageError;
        }

        setProfile(profileRow || optimisticProfile);
        setInventorProfile(inventorRow || optimisticInventorProfile);
        setSelectedRole("inventor");
        persistLocalState({
          profile: profileRow || optimisticProfile,
          investorProfile,
          inventorProfile: inventorRow || optimisticInventorProfile,
          selectedRole: "inventor",
        });
        await Promise.all([loadDiscovery("inventor"), loadConversations()]);
        setUploadProgress(100);
        return { ok: true };
      } catch (error) {
        console.error("Failed to save inventor profile", error);

        const fallbackProfile = {
          ...(profile || {}),
          user_id: user.id,
          full_name: values.fullName.trim(),
          role: "inventor",
          avatar_url: avatarUrl,
          location: values.location.trim(),
          bio: values.shortPitch.trim(),
          email: values.contactEmail.trim(),
          phone: values.phoneNumber.trim(),
          email_public: values.emailPublic,
          phone_public: values.phonePublic,
          profile_completed: true,
        };

        const fallbackInventorProfile = {
          ...(inventorProfile || {}),
          user_id: user.id,
          invention_name: values.inventionName.trim(),
          invention_type: values.inventionType.trim(),
          description: values.description.trim(),
          revenue: toNumberOrNull(values.revenue),
          equity_available: toNumberOrNull(values.equityAvailable),
          funding_sought: toNumberOrNull(values.fundingSought),
          category: values.category.trim(),
          website_url: values.websiteUrl.trim() || null,
          social_links: normalizeListInput(values.socialLinks),
          short_pitch: values.shortPitch.trim(),
        };

        setProfile(fallbackProfile);
        setInventorProfile(fallbackInventorProfile);
        setSelectedRole("inventor");
        persistLocalState({
          profile: fallbackProfile,
          investorProfile,
          inventorProfile: fallbackInventorProfile,
          selectedRole: "inventor",
        });
        await loadDiscovery("inventor");
        return { ok: true, degraded: true };
      } finally {
        setSaving(false);
        window.setTimeout(() => setUploadProgress(0), 300);
      }
    },
    [
      inventorProfile,
      investorProfile,
      loadConversations,
      loadDiscovery,
      persistLocalState,
      profile,
      uploadFile,
      user?.id,
    ],
  );

  const createSwipe = useCallback(
    async (toUserId, action) => {
      if (!user?.id || !toUserId) return;
      await supabase.from("swipes").insert({ from_user_id: user.id, to_user_id: toUserId, action });
      await loadDiscovery();
    },
    [loadDiscovery, user?.id],
  );

  const ensureConversation = useCallback(
    async (otherUserId) => {
      if (!user?.id || !otherUserId) return "";
      const { data, error } = await supabase.rpc("ensure_inventors_investors_conversation", {
        other_user_id: otherUserId,
      });
      if (error) {
        console.error("Failed to ensure conversation", error);
        return "";
      }
      await loadConversations();
      setActiveConversationId(data || "");
      return data || "";
    },
    [loadConversations, user?.id],
  );

  const markConversationRead = useCallback(
    async (conversationId) => {
      if (!conversationId) return;
      await supabase.rpc("mark_inventors_investors_conversation_read", {
        target_conversation_id: conversationId,
      });
      await loadConversations();
    },
    [loadConversations],
  );

  const sendMessage = useCallback(
    async (conversationId, messageText) => {
      if (!user?.id || !conversationId || !messageText.trim()) return false;
      setMessageSending(true);
      const { error } = await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender_user_id: user.id,
        message_text: messageText.trim(),
      });
      setMessageSending(false);
      if (error) {
        console.error("Failed to send message", error);
        return false;
      }
      await Promise.all([loadConversations(), markConversationRead(conversationId)]);
      return true;
    },
    [loadConversations, markConversationRead, user?.id],
  );

  const blockUser = useCallback(
    async (targetUserId) => {
      if (!user?.id || !targetUserId) return;
      await supabase.from("blocked_users").upsert(
        {
          blocker_user_id: user.id,
          blocked_user_id: targetUserId,
        },
        { onConflict: "blocker_user_id,blocked_user_id" },
      );
      await Promise.all([loadDiscovery(), loadConversations()]);
    },
    [loadConversations, loadDiscovery, user?.id],
  );

  const reportUser = useCallback(
    async (targetUserId, reason, details = "") => {
      if (!user?.id || !targetUserId) return;
      await supabase.from("reported_profiles").insert({
        reporter_user_id: user.id,
        reported_user_id: targetUserId,
        reason,
        details,
      });
    },
    [user?.id],
  );

  const unreadMessageCount = useMemo(
    () => conversations.reduce((total, conversation) => total + (conversation.unreadCount || 0), 0),
    [conversations],
  );

  return {
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
    refresh: loadInitial,
  };
}

function toNumberOrNull(value) {
  if (value === null || value === undefined || value === "") return null;
  const numeric = Number(String(value).replace(/[^\d.-]/g, ""));
  return Number.isFinite(numeric) ? numeric : null;
}

function isBlobPreviewUrl(value) {
  return typeof value === "string" && value.startsWith("blob:");
}

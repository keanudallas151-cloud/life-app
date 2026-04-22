import {
  addDoc,
  collection,
  deleteField,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { useCallback, useEffect, useMemo, useState } from "react";
import { queueNewMessageEmailAlert } from "../services/emailDelivery";
import { db, isFirebaseConfigured } from "../firebaseClient";
import {
  mergeFirebaseProfile,
  saveFirebaseProfileAndAuth,
  uploadFirebaseMedia,
} from "../services/firebaseProfile";
import {
  loadLocalNetworkingState,
  loadRoleChoice,
  normalizeListInput,
  saveLocalNetworkingState,
  saveRoleChoice,
} from "../utils/inventorsInvestors";

const COLLECTIONS = {
  profiles: "profiles",
  investorProfiles: "investorProfiles",
  inventorProfiles: "inventorProfiles",
  swipes: "swipes",
  conversations: "conversations",
  messages: "messages",
  blockedUsers: "blockedUsers",
  reportedProfiles: "reportedProfiles",
};

function nowIso() {
  return new Date().toISOString();
}

function conversationIdFor(userId, otherUserId) {
  return [userId, otherUserId].filter(Boolean).sort().join("__");
}

function toDocData(snapshot) {
  if (!snapshot.exists()) return null;
  const data = snapshot.data() || {};
  return {
    ...data,
    id: data.id || snapshot.id,
  };
}

async function readDoc(collectionName, documentId) {
  if (!db || !documentId) return null;
  const snapshot = await getDoc(doc(db, collectionName, documentId));
  return toDocData(snapshot);
}

async function readMessages(conversationId, userId) {
  if (!db || !conversationId) return [];

  const snapshot = await getDocs(
    query(
      collection(
        db,
        COLLECTIONS.conversations,
        conversationId,
        COLLECTIONS.messages,
      ),
      orderBy("created_at", "asc"),
      limit(200),
    ),
  );

  return snapshot.docs.map((messageDoc) => {
    const data = messageDoc.data() || {};
    return {
      ...data,
      id: data.id || messageDoc.id,
      isMine: data.sender_user_id === userId,
    };
  });
}

function isBlobPreviewUrl(value) {
  return typeof value === "string" && value.startsWith("blob:");
}

function toNumberOrNull(value) {
  if (value === null || value === undefined || value === "") return null;
  const numeric = Number(String(value).replace(/[^\d.-]/g, ""));
  return Number.isFinite(numeric) ? numeric : null;
}

function buildPublicContactFields(values) {
  const emailPublic = Boolean(values?.emailPublic);
  const phonePublic = Boolean(values?.phonePublic);
  const publicEmail = String(values?.contactEmail || "").trim();
  const publicPhone = String(values?.phoneNumber || "").trim();

  return {
    public_email: emailPublic ? publicEmail : "",
    public_phone: phonePublic ? publicPhone : "",
    email_public: emailPublic,
    phone_public: phonePublic,
  };
}

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
      if (!user?.id || !role || !db || !isFirebaseConfigured) {
        setDiscoveryProfiles([]);
        return;
      }

      setDiscoveryLoading(true);
      try {
        const targetRole = role === "investor" ? "inventor" : "investor";

        const [
          profileSnapshots,
          swipeSnapshots,
          outgoingBlocks,
          incomingBlocks,
        ] = await Promise.all([
          getDocs(
            query(
              collection(db, COLLECTIONS.profiles),
              where("role", "==", targetRole),
              where("profile_completed", "==", true),
              orderBy("updated_at", "desc"),
              limit(80),
            ),
          ),
          getDocs(
            query(
              collection(db, COLLECTIONS.swipes),
              where("from_user_id", "==", user.id),
              limit(200),
            ),
          ),
          getDocs(
            query(
              collection(db, COLLECTIONS.blockedUsers),
              where("blocker_user_id", "==", user.id),
              limit(200),
            ),
          ),
          getDocs(
            query(
              collection(db, COLLECTIONS.blockedUsers),
              where("blocked_user_id", "==", user.id),
              limit(200),
            ),
          ),
        ]);

        const rawProfiles = profileSnapshots.docs.map((snapshot) => ({
          ...(snapshot.data() || {}),
          id: snapshot.id,
          user_id: snapshot.data()?.user_id || snapshot.id,
        }));

        const swiped = new Set(
          swipeSnapshots.docs
            .map((snapshot) => snapshot.data()?.to_user_id)
            .filter(Boolean),
        );
        const blocked = new Set(
          [
            ...outgoingBlocks.docs.map(
              (snapshot) => snapshot.data()?.blocked_user_id,
            ),
            ...incomingBlocks.docs.map(
              (snapshot) => snapshot.data()?.blocker_user_id,
            ),
          ].filter(Boolean),
        );

        const filteredProfiles = rawProfiles
          .filter((item) => item.user_id !== user.id)
          .filter((item) => !blocked.has(item.user_id))
          .filter((item) => !swiped.has(item.user_id));

        const enrichedProfiles = await Promise.all(
          filteredProfiles.map(async (item) => {
            if (item.role === "inventor") {
              const inventorDetails = await readDoc(
                COLLECTIONS.inventorProfiles,
                item.user_id,
              );
              return {
                ...item,
                ...(inventorDetails || {}),
                inventor_profile_id: inventorDetails?.id || item.user_id,
                hero_image_url:
                  inventorDetails?.gallery_urls?.[0] ||
                  item.hero_image_url ||
                  "",
              };
            }

            const investorDetails = await readDoc(
              COLLECTIONS.investorProfiles,
              item.user_id,
            );
            return {
              ...item,
              ...(investorDetails || {}),
              investor_profile_id: investorDetails?.id || item.user_id,
            };
          }),
        );

        const ranked = enrichedProfiles
          .map((item) => ({
            ...item,
            discovery_rank: computeDiscoveryRank(item),
          }))
          .sort((a, b) => b.discovery_rank - a.discovery_rank);

        setDiscoveryProfiles(ranked);
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
    if (!user?.id || !db || !isFirebaseConfigured) {
      setConversations([]);
      setActiveConversationId("");
      return;
    }

    try {
      const conversationSnapshots = await getDocs(
        query(
          collection(db, COLLECTIONS.conversations),
          where("participant_ids", "array-contains", user.id),
          limit(60),
        ),
      );

      const conversationRows = conversationSnapshots.docs.map((snapshot) => ({
        ...(snapshot.data() || {}),
        id: snapshot.id,
      }));

      if (!conversationRows.length) {
        setConversations([]);
        setActiveConversationId("");
        return;
      }

      const peerIds = Array.from(
        new Set(
          conversationRows
            .map((row) =>
              (row.participant_ids || []).find(
                (participantId) => participantId !== user.id,
              ),
            )
            .filter(Boolean),
        ),
      );

      const peerProfiles = await Promise.all(
        peerIds.map(async (peerId) => [
          peerId,
          await readDoc(COLLECTIONS.profiles, peerId),
        ]),
      );
      const participantMap = new Map(peerProfiles);

      const nextConversations = await Promise.all(
        conversationRows.map(async (row) => {
          const messages = await readMessages(row.id, user.id);
          const lastMessage = messages[messages.length - 1] || null;
          const peerId = (row.participant_ids || []).find(
            (participantId) => participantId !== user.id,
          );
          const lastReadAt = row.last_read_at_map?.[user.id] || "";
          const unreadCount = messages.filter((message) => {
            if (message.sender_user_id === user.id) return false;
            if (!lastReadAt) return true;
            return (
              new Date(message.created_at).getTime() >
              new Date(lastReadAt).getTime()
            );
          }).length;

          return {
            ...row,
            participant: participantMap.get(peerId) || null,
            messages,
            lastMessage,
            unreadCount,
          };
        }),
      );

      nextConversations.sort(
        (a, b) =>
          new Date(b.updated_at || b.created_at || 0).getTime() -
          new Date(a.updated_at || a.created_at || 0).getTime(),
      );

      setConversations(nextConversations);
      setActiveConversationId(
        (current) => current || nextConversations[0]?.id || "",
      );
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

    const localState = loadLocalNetworkingState(user.id) || null;

    if (!db || !isFirebaseConfigured) {
      const nextRole = localState?.selectedRole || loadRoleChoice(user.id);
      setProfile(localState?.profile || null);
      setInvestorProfile(localState?.investorProfile || null);
      setInventorProfile(localState?.inventorProfile || null);
      setSelectedRole(nextRole || "");
      setDiscoveryProfiles([]);
      setConversations([]);
      setActiveConversationId("");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [profileRow, investorRow, inventorRow] = await Promise.all([
        readDoc(COLLECTIONS.profiles, user.id),
        readDoc(COLLECTIONS.investorProfiles, user.id),
        readDoc(COLLECTIONS.inventorProfiles, user.id),
      ]);

      const nextProfile = profileRow || localState?.profile || null;
      const nextInvestorProfile =
        investorRow || localState?.investorProfile || null;
      const nextInventorProfile =
        inventorRow || localState?.inventorProfile || null;
      const nextRole =
        profileRow?.role || localState?.selectedRole || loadRoleChoice(user.id);

      setProfile(nextProfile);
      setInvestorProfile(nextInvestorProfile);
      setInventorProfile(nextInventorProfile);
      setSelectedRole(nextRole || "");
      persistLocalState({
        profile: nextProfile,
        investorProfile: nextInvestorProfile,
        inventorProfile: nextInventorProfile,
        selectedRole: nextRole || "",
      });

      await Promise.all([
        nextRole
          ? loadDiscovery(nextRole)
          : Promise.resolve(setDiscoveryProfiles([])),
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
        nextRole
          ? loadDiscovery(nextRole)
          : Promise.resolve(setDiscoveryProfiles([])),
        loadConversations(),
      ]);
    } finally {
      setLoading(false);
    }
  }, [loadConversations, loadDiscovery, persistLocalState, user?.id]);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  useEffect(() => {
    if (!user?.id || !db || !isFirebaseConfigured) return undefined;

    const conversationsQuery = query(
      collection(db, COLLECTIONS.conversations),
      where("participant_ids", "array-contains", user.id),
      limit(60),
    );

    const unsubscribe = onSnapshot(conversationsQuery, async () => {
      await loadConversations();
    });

    return () => {
      unsubscribe();
    };
  }, [loadConversations, user?.id]);

  useEffect(() => {
    if (!user?.id || !db || !isFirebaseConfigured || !activeConversationId) {
      return undefined;
    }

    const activeMessagesQuery = query(
      collection(
        db,
        COLLECTIONS.conversations,
        activeConversationId,
        COLLECTIONS.messages,
      ),
      orderBy("created_at", "asc"),
      limit(200),
    );

    const unsubscribe = onSnapshot(activeMessagesQuery, async () => {
      await loadConversations();
    });

    return () => {
      unsubscribe();
    };
  }, [activeConversationId, loadConversations, user?.id]);

  const chooseRole = useCallback(
    async (role) => {
      if (!user?.id) return;

      const optimisticProfile = {
        ...(profile || {}),
        user_id: user.id,
        full_name: profile?.full_name || user.name || user.email || "",
        role,
        profile_completed: profile?.profile_completed || false,
        updated_at: nowIso(),
      };

      saveRoleChoice(user.id, role);
      setSelectedRole(role);
      setProfile(optimisticProfile);
      persistLocalState({ profile: optimisticProfile, selectedRole: role });

      try {
        const nextProfile = await mergeFirebaseProfile(user.id, {
          full_name: optimisticProfile.full_name,
          email: deleteField(),
          phone: deleteField(),
          role,
          profile_completed: optimisticProfile.profile_completed,
        });

        setProfile(nextProfile || optimisticProfile);
        persistLocalState({
          profile: nextProfile || optimisticProfile,
          selectedRole: role,
        });
      } catch (error) {
        console.error("Failed to choose role", error);
      }

      await loadDiscovery(role);
    },
    [loadDiscovery, persistLocalState, profile, user],
  );

  const uploadFile = useCallback(
    async (file, folder) => {
      return uploadFirebaseMedia(user?.id, file, folder);
    },
    [user?.id],
  );

  const saveInvestorProfile = useCallback(
    async (values) => {
      if (!user?.id) return { ok: false };
      setSaving(true);
      setUploadProgress(15);

      let avatarUrl = !isBlobPreviewUrl(values.avatarPreviewUrl)
        ? values.avatarPreviewUrl || profile?.avatar_url || ""
        : profile?.avatar_url || "";

      try {
        if (values.avatarFile) {
          avatarUrl = await uploadFile(
            values.avatarFile,
            "inventors-investors-media",
          );
          setUploadProgress(40);
        }

        const publicContactFields = buildPublicContactFields(values);

        const optimisticProfile = {
          ...(profile || {}),
          user_id: user.id,
          full_name: values.fullName.trim(),
          role: "investor",
          avatar_url: avatarUrl,
          location: values.location.trim(),
          bio: values.shortBio.trim(),
          ...publicContactFields,
          profile_completed: true,
          updated_at: nowIso(),
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
          updated_at: nowIso(),
        };

        const syncResult = await saveFirebaseProfileAndAuth({
          userId: user.id,
          profilePatch: {
            ...optimisticProfile,
            email: deleteField(),
            phone: deleteField(),
          },
          authPatch: {
            displayName: optimisticProfile.full_name,
            photoURL: avatarUrl || undefined,
          },
        });
        if (!syncResult.ok && !syncResult.partial) {
          throw syncResult.errors[0] || new Error("Investor profile sync failed.");
        }
        const nextProfile = syncResult.profile || optimisticProfile;
        setUploadProgress(70);

        await setDoc(
          doc(db, COLLECTIONS.investorProfiles, user.id),
          {
            ...(investorProfile?.created_at ? {} : { created_at: nowIso() }),
            ...optimisticInvestorProfile,
          },
          { merge: true },
        );

        setProfile(nextProfile || optimisticProfile);
        setInvestorProfile(optimisticInvestorProfile);
        setSelectedRole("investor");
        persistLocalState({
          profile: nextProfile || optimisticProfile,
          investorProfile: optimisticInvestorProfile,
          inventorProfile,
          selectedRole: "investor",
        });
        await Promise.all([loadDiscovery("investor"), loadConversations()]);
        setUploadProgress(100);
        return syncResult.partial ? { ok: true, partial: true } : { ok: true };
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
          ...buildPublicContactFields(values),
          profile_completed: true,
          updated_at: nowIso(),
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
          updated_at: nowIso(),
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
        return { ok: false, degraded: true, error };
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
        : profile?.avatar_url || "";

      const existingGalleryUrls = Array.isArray(inventorProfile?.gallery_urls)
        ? inventorProfile.gallery_urls
        : Array.isArray(values.galleryPreviewUrls)
          ? values.galleryPreviewUrls.filter(
              (url) => url && !isBlobPreviewUrl(url),
            )
          : [];

      try {
        if (values.avatarFile) {
          avatarUrl = await uploadFile(
            values.avatarFile,
            "inventors-investors-media",
          );
          setUploadProgress(25);
        }

        let galleryUrls = existingGalleryUrls;
        if (values.galleryFiles.length) {
          const uploadedGallery = [];
          for (let index = 0; index < values.galleryFiles.length; index += 1) {
            const url = await uploadFile(
              values.galleryFiles[index],
              "inventors-investors-media",
            );
            uploadedGallery.push(url);
            setUploadProgress(
              30 + Math.round(((index + 1) / values.galleryFiles.length) * 30),
            );
          }
          galleryUrls = Array.from(new Set([...existingGalleryUrls, ...uploadedGallery]));
        }

        const publicContactFields = buildPublicContactFields(values);

        const optimisticProfile = {
          ...(profile || {}),
          user_id: user.id,
          full_name: values.fullName.trim(),
          role: "inventor",
          avatar_url: avatarUrl,
          location: values.location.trim(),
          bio: values.shortPitch.trim(),
          ...publicContactFields,
          profile_completed: true,
          updated_at: nowIso(),
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
          gallery_urls: galleryUrls,
          hero_image_url: galleryUrls[0] || "",
          updated_at: nowIso(),
        };

        const syncResult = await saveFirebaseProfileAndAuth({
          userId: user.id,
          profilePatch: {
            ...optimisticProfile,
            email: deleteField(),
            phone: deleteField(),
          },
          authPatch: {
            displayName: optimisticProfile.full_name,
            photoURL: avatarUrl || undefined,
          },
        });
        if (!syncResult.ok && !syncResult.partial) {
          throw syncResult.errors[0] || new Error("Inventor profile sync failed.");
        }
        const nextProfile = syncResult.profile || optimisticProfile;
        setUploadProgress(70);

        await setDoc(
          doc(db, COLLECTIONS.inventorProfiles, user.id),
          {
            ...(inventorProfile?.created_at ? {} : { created_at: nowIso() }),
            ...optimisticInventorProfile,
          },
          { merge: true },
        );

        setProfile(nextProfile || optimisticProfile);
        setInventorProfile(optimisticInventorProfile);
        setSelectedRole("inventor");
        persistLocalState({
          profile: nextProfile || optimisticProfile,
          investorProfile,
          inventorProfile: optimisticInventorProfile,
          selectedRole: "inventor",
        });
        await Promise.all([loadDiscovery("inventor"), loadConversations()]);
        setUploadProgress(100);
        return syncResult.partial ? { ok: true, partial: true } : { ok: true };
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
          ...buildPublicContactFields(values),
          profile_completed: true,
          updated_at: nowIso(),
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
          gallery_urls: existingGalleryUrls,
          hero_image_url: existingGalleryUrls[0] || "",
          updated_at: nowIso(),
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
        return { ok: false, degraded: true, error };
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
      if (!user?.id || !toUserId || !db || !isFirebaseConfigured) return;
      setDiscoveryProfiles((current) =>
        current.filter((item) => item.user_id !== toUserId),
      );
      try {
        const swipeId = `${user.id}__${toUserId}`;
        await setDoc(
          doc(db, COLLECTIONS.swipes, swipeId),
          {
            id: swipeId,
            from_user_id: user.id,
            to_user_id: toUserId,
            action,
            created_at: nowIso(),
            updated_at: nowIso(),
          },
          { merge: true },
        );
      } catch (error) {
        console.error("Failed to create swipe", error);
      } finally {
        await loadDiscovery();
      }
    },
    [loadDiscovery, user?.id],
  );

  const ensureConversation = useCallback(
    async (otherUserId) => {
      if (!user?.id || !otherUserId || !db || !isFirebaseConfigured) return "";

      const conversationId = conversationIdFor(user.id, otherUserId);
      const existingConversation = await readDoc(
        COLLECTIONS.conversations,
        conversationId,
      );
      const now = nowIso();

      try {
        await setDoc(
          doc(db, COLLECTIONS.conversations, conversationId),
          {
            id: conversationId,
            participant_ids: [user.id, otherUserId].sort(),
            created_at: existingConversation?.created_at || now,
            updated_at: existingConversation?.updated_at || now,
            last_read_at_map: {
              ...(existingConversation?.last_read_at_map || {}),
              [user.id]:
                existingConversation?.last_read_at_map?.[user.id] || now,
            },
          },
          { merge: true },
        );
        await loadConversations();
        setActiveConversationId(conversationId);
        return conversationId;
      } catch (error) {
        console.error("Failed to ensure conversation", error);
        return "";
      }
    },
    [loadConversations, user?.id],
  );

  const markConversationRead = useCallback(
    async (conversationId) => {
      if (!conversationId || !user?.id || !db || !isFirebaseConfigured) return;

      const currentConversation = await readDoc(
        COLLECTIONS.conversations,
        conversationId,
      );
      const now = nowIso();

      await setDoc(
        doc(db, COLLECTIONS.conversations, conversationId),
        {
          id: conversationId,
          participant_ids: currentConversation?.participant_ids || [user.id],
          created_at: currentConversation?.created_at || now,
          updated_at: now,
          last_read_at_map: {
            ...(currentConversation?.last_read_at_map || {}),
            [user.id]: now,
          },
        },
        { merge: true },
      );
      await loadConversations();
    },
    [loadConversations, user?.id],
  );

  const sendMessage = useCallback(
    async (conversationId, messageText) => {
      if (
        !user?.id ||
        !conversationId ||
        !messageText.trim() ||
        !db ||
        !isFirebaseConfigured
      )
        return false;
      setMessageSending(true);
      try {
        const now = nowIso();
        const conversationRef = doc(
          db,
          COLLECTIONS.conversations,
          conversationId,
        );
        const currentConversation = await readDoc(
          COLLECTIONS.conversations,
          conversationId,
        );

        await addDoc(
          collection(
            db,
            COLLECTIONS.conversations,
            conversationId,
            COLLECTIONS.messages,
          ),
          {
            conversation_id: conversationId,
            sender_user_id: user.id,
            message_text: messageText.trim(),
            created_at: now,
          },
        );

        await setDoc(
          conversationRef,
          {
            id: conversationId,
            participant_ids: currentConversation?.participant_ids || [user.id],
            created_at: currentConversation?.created_at || now,
            updated_at: now,
          },
          { merge: true },
        );

        const recipientUserId = currentConversation?.participant_ids?.find(
          (participantId) => participantId !== user.id,
        );
        if (recipientUserId) {
          try {
            const recipientProfile = await readDoc(
              COLLECTIONS.profiles,
              recipientUserId,
            );
            await queueNewMessageEmailAlert({
              senderUserId: user.id,
              senderName:
                profile?.full_name || user.name || user.email || "Someone on Life.",
              recipientUserId,
              recipientDisplayName:
                recipientProfile?.full_name || recipientProfile?.display_name || "there",
              messageText: messageText.trim(),
              conversationId,
            });
          } catch (emailError) {
            console.error("Failed to queue a new-message email alert", emailError);
          }
        }

        await Promise.all([
          loadConversations(),
          markConversationRead(conversationId),
        ]);
        return true;
      } catch (error) {
        console.error("Failed to send message", error);
        return false;
      } finally {
        setMessageSending(false);
      }
    },
    [
      loadConversations,
      markConversationRead,
      profile?.full_name,
      user?.email,
      user?.id,
      user?.name,
    ],
  );

  const blockUser = useCallback(
    async (targetUserId) => {
      if (!user?.id || !targetUserId || !db || !isFirebaseConfigured) return;
      try {
        const blockId = `${user.id}__${targetUserId}`;
        await setDoc(
          doc(db, COLLECTIONS.blockedUsers, blockId),
          {
            id: blockId,
            blocker_user_id: user.id,
            blocked_user_id: targetUserId,
            created_at: nowIso(),
            updated_at: nowIso(),
          },
          { merge: true },
        );
        await Promise.all([loadDiscovery(), loadConversations()]);
      } catch (error) {
        console.error("Failed to block user", error);
      }
    },
    [loadConversations, loadDiscovery, user?.id],
  );

  const reportUser = useCallback(
    async (targetUserId, reason, details = "") => {
      if (!user?.id || !targetUserId || !db || !isFirebaseConfigured) return;
      try {
        await addDoc(collection(db, COLLECTIONS.reportedProfiles), {
          reporter_user_id: user.id,
          reported_user_id: targetUserId,
          reason,
          details,
          created_at: nowIso(),
        });
      } catch (error) {
        console.error("Failed to report user", error);
      }
    },
    [user?.id],
  );

  const unreadMessageCount = useMemo(
    () =>
      conversations.reduce(
        (total, conversation) => total + (conversation.unreadCount || 0),
        0,
      ),
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

function computeDiscoveryRank(profile) {
  const now = Date.now();
  const updatedAt = new Date(
    profile.updated_at || profile.created_at || now,
  ).getTime();
  const ageHours = Math.max(1, (now - updatedAt) / (1000 * 60 * 60));
  const freshnessScore = Math.max(0, 60 - Math.min(60, ageHours * 1.2));

  const hasHeroImage = profile.hero_image_url ? 18 : 0;
  const hasAvatar = profile.avatar_url ? 12 : 0;
  const bioLength = String(
    profile.bio || profile.short_pitch || profile.description || "",
  ).trim().length;
  const bioScore = Math.min(18, Math.floor(bioLength / 18));

  const investorSignal =
    profile.role === "investor"
      ? Number(Boolean(profile.investment_budget)) * 12 +
        Number(
          Boolean(profile.investment_range_min && profile.investment_range_max),
        ) *
          8 +
        Number(Boolean(profile.stage_preference)) * 6
      : 0;

  const inventorSignal =
    profile.role === "inventor"
      ? Number(Boolean(profile.funding_sought)) * 12 +
        Number(Boolean(profile.revenue)) * 8 +
        Number(Boolean(profile.category || profile.invention_type)) * 6
      : 0;

  const completeness = Number(profile.profile_completed) ? 14 : 0;
  const hasPublicContact = Boolean(
    profile.public_email ||
    profile.public_phone ||
    profile.email_public ||
    profile.phone_public,
  );
  const publicContactSignal = Number(hasPublicContact) * 4;

  return (
    freshnessScore +
    hasHeroImage +
    hasAvatar +
    bioScore +
    investorSignal +
    inventorSignal +
    completeness +
    publicContactSignal
  );
}

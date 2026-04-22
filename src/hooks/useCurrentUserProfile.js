import { deleteField } from "firebase/firestore";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  auth,
  isFirebaseConfigured,
  isFirebaseStorageConfigured,
} from "../firebaseClient";
import {
  getFirebaseProfile,
  saveFirebaseProfileAndAuth,
  uploadFirebaseAvatar,
} from "../services/firebaseProfile";

const DEFAULT_MEMBER_SINCE = "2026";
const MAX_AVATAR_BYTES = 5 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function normalizeSocialLinks(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || "").trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function getMemberSince(profileDoc) {
  const createdAt =
    auth?.currentUser?.metadata?.creationTime || profileDoc?.created_at;
  if (!createdAt) return DEFAULT_MEMBER_SINCE;

  const year = new Date(createdAt).getFullYear();
  return Number.isFinite(year) && year > 0
    ? String(year)
    : DEFAULT_MEMBER_SINCE;
}

export function validateAvatarFile(file) {
  if (!file) return "Select an image first.";
  if (file.size > MAX_AVATAR_BYTES) return "Image must be under 5 MB.";
  if (!ALLOWED_AVATAR_TYPES.has(file.type)) {
    return "JPG, PNG, or WEBP only.";
  }
  return "";
}

export function useCurrentUserProfile(user) {
  const [profileDoc, setProfileDoc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [error, setError] = useState("");

  const refreshProfile = useCallback(async () => {
    if (!user?.id || !isFirebaseConfigured) {
      setProfileDoc(null);
      setError("");
      return null;
    }

    setLoading(true);
    try {
      const nextProfile = await getFirebaseProfile(user.id);
      setProfileDoc(nextProfile);
      setError("");
      return nextProfile;
    } catch (profileError) {
      console.error("Failed to load Firebase profile", profileError);
      setError("Could not load your profile right now.");
      return null;
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    void refreshProfile();
  }, [refreshProfile]);

  const profileView = useMemo(() => {
    const socialLinks = normalizeSocialLinks(profileDoc?.social_links);
    return {
      displayName:
        profileDoc?.full_name ||
        user?.name ||
        auth?.currentUser?.displayName ||
        user?.email ||
        "",
      username: profileDoc?.username || user?.username || "",
      bio: profileDoc?.bio || "",
      socialLinks,
      socialLinksText: socialLinks.join(", "),
      avatarUrl:
        profileDoc?.avatar_url ||
        user?.avatarUrl ||
        auth?.currentUser?.photoURL ||
        "",
      email: profileDoc?.email || user?.email || auth?.currentUser?.email || "",
      memberSince: getMemberSince(profileDoc),
    };
  }, [profileDoc, user?.avatarUrl, user?.email, user?.name, user?.username]);

  const saveProfile = useCallback(
    async (draft = {}) => {
      if (!user?.id || !isFirebaseConfigured) {
        const message = "Cloud profile editing is not configured.";
        setError(message);
        return { ok: false, message, error: new Error(message) };
      }

      setSaving(true);
      try {
        const cleanName = String(
          draft.displayName ?? profileView.displayName,
        ).trim();
        const cleanUsername = String(draft.username ?? profileView.username)
          .trim()
          .replace(/^@+/, "");
        const cleanBio = String(draft.bio ?? profileView.bio).trim();
        const cleanLinks = normalizeSocialLinks(
          draft.socialLinks ?? profileView.socialLinks,
        );
        const avatarUrl =
          draft.avatarUrl ?? profileView.avatarUrl ?? user?.avatarUrl ?? "";

        const profilePatch = {
          full_name: cleanName || user?.name || user?.email || "",
          username: cleanUsername,
          bio: cleanBio,
          social_links: cleanLinks,
          email: deleteField(),
          avatar_url: avatarUrl,
        };

        const result = await saveFirebaseProfileAndAuth({
          userId: user.id,
          authPatch: {
            displayName: profilePatch.full_name,
            photoURL: avatarUrl || undefined,
          },
          profilePatch,
        });

        if (!result.ok && !result.partial) {
          throw result.errors[0] || new Error("Profile sync failed.");
        }

        const nextProfile = {
          ...(profileDoc || {}),
          ...profilePatch,
          ...(result.profile || {}),
        };

        setProfileDoc(nextProfile);
        setError("");
        return {
          ok: true,
          partial: Boolean(result.partial),
          profile: nextProfile,
          avatarUrl,
        };
      } catch (saveError) {
        console.error("Failed to save Firebase profile", saveError);
        const message = "Could not save profile changes.";
        setError(message);
        return { ok: false, message, error: saveError };
      } finally {
        setSaving(false);
      }
    },
    [
      profileDoc,
      profileView,
      user?.avatarUrl,
      user?.email,
      user?.id,
      user?.name,
    ],
  );

  const uploadAvatar = useCallback(
    async (file, draft = {}) => {
      if (!user?.id || !isFirebaseConfigured) {
        const message = "Cloud profile editing is not configured.";
        setError(message);
        return { ok: false, message, error: new Error(message) };
      }

      if (!isFirebaseStorageConfigured) {
        const message =
          "Profile photo uploads need Firebase Storage configured first.";
        setError(message);
        return { ok: false, message, error: new Error(message) };
      }

      const validationMessage = validateAvatarFile(file);
      if (validationMessage) {
        setError(validationMessage);
        return {
          ok: false,
          message: validationMessage,
          error: new Error(validationMessage),
        };
      }

      setAvatarUploading(true);
      try {
        const avatarUrl = await uploadFirebaseAvatar(user.id, file);
        const result = await saveProfile({
          ...draft,
          avatarUrl,
        });

        if (!result.ok) return result;

        return {
          ...result,
          avatarUrl,
        };
      } catch (uploadError) {
        console.error("Failed to upload Firebase avatar", uploadError);
        const message = "Upload failed. Try again.";
        setError(message);
        return { ok: false, message, error: uploadError };
      } finally {
        setAvatarUploading(false);
      }
    },
    [saveProfile, user?.id],
  );

  return {
    profileDoc,
    profileView,
    loading,
    saving,
    avatarUploading,
    error,
    refreshProfile,
    saveProfile,
    uploadAvatar,
  };
}

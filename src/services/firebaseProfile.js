import { updateProfile } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import {
  auth,
  db,
  isFirebaseConfigured,
  isFirebaseStorageConfigured,
  storage,
} from "../firebaseClient";

const PROFILES_COLLECTION = "profiles";

function getFileExtension(file) {
  return (file?.name?.split(".").pop() || "jpg").toLowerCase();
}

function ensureFirebaseReady() {
  if (!isFirebaseConfigured || !db) {
    throw new Error(
      "Firebase is not configured. Set the NEXT_PUBLIC_FIREBASE_* values in your deployment settings.",
    );
  }
}

function ensureFirebaseStorageReady() {
  ensureFirebaseReady();
  if (!isFirebaseStorageConfigured || !storage) {
    throw new Error(
      "Firebase Storage is not configured. Add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET to enable file uploads.",
    );
  }
}

export async function getFirebaseProfile(userId) {
  ensureFirebaseReady();
  if (!userId) return null;

  const snapshot = await getDoc(doc(db, PROFILES_COLLECTION, userId));
  if (!snapshot.exists()) return null;

  const data = snapshot.data() || {};
  return {
    ...data,
    user_id: data.user_id || snapshot.id,
  };
}

export async function mergeFirebaseProfile(userId, patch) {
  ensureFirebaseReady();
  if (!userId) {
    throw new Error("A user id is required to save a Firebase profile.");
  }

  const existing = await getFirebaseProfile(userId);
  const now = new Date().toISOString();
  const payload = {
    user_id: userId,
    ...(existing?.created_at ? {} : { created_at: now }),
    updated_at: now,
    ...patch,
  };

  await setDoc(doc(db, PROFILES_COLLECTION, userId), payload, { merge: true });
  return {
    ...(existing || {}),
    ...payload,
  };
}

export async function syncFirebaseAuthProfile({ displayName, photoURL }) {
  if (!auth?.currentUser) return null;

  const patch = {};
  if (displayName !== undefined) patch.displayName = displayName;
  if (photoURL !== undefined) patch.photoURL = photoURL;
  if (!Object.keys(patch).length) return auth.currentUser;

  await updateProfile(auth.currentUser, patch);
  return auth.currentUser;
}

export async function saveFirebaseProfileAndAuth({
  userId,
  profilePatch,
  authPatch,
}) {
  const [profileResult, authResult] = await Promise.allSettled([
    profilePatch ? mergeFirebaseProfile(userId, profilePatch) : Promise.resolve(null),
    authPatch ? syncFirebaseAuthProfile(authPatch) : Promise.resolve(auth?.currentUser || null),
  ]);

  const profile =
    profileResult.status === "fulfilled" ? profileResult.value : null;
  const authUser = authResult.status === "fulfilled" ? authResult.value : null;
  const errors = [profileResult, authResult]
    .filter((result) => result.status === "rejected")
    .map((result) => result.reason);

  return {
    ok: errors.length === 0,
    partial:
      errors.length > 0 &&
      (profileResult.status === "fulfilled" || authResult.status === "fulfilled"),
    profile,
    authUser,
    errors,
  };
}

export async function uploadFirebaseAvatar(userId, file, folder = "profile-avatars") {
  ensureFirebaseStorageReady();
  if (!userId || !file) {
    throw new Error("A user id and file are required for avatar upload.");
  }

  const ext = getFileExtension(file);
  const objectRef = ref(storage, `${folder}/${userId}/avatar.${ext}`);
  await uploadBytes(objectRef, file, {
    contentType: file.type || "image/jpeg",
    cacheControl: "public,max-age=3600",
  });
  return getDownloadURL(objectRef);
}

export async function uploadFirebaseMedia(userId, file, folder = "inventors-investors-media") {
  ensureFirebaseStorageReady();
  if (!userId || !file) {
    throw new Error("A user id and file are required for media upload.");
  }

  const ext = getFileExtension(file);
  const fileName = `${Date.now()}-${globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2, 10)}.${ext}`;
  const objectRef = ref(storage, `${folder}/${userId}/${fileName}`);
  await uploadBytes(objectRef, file, {
    contentType: file.type || "application/octet-stream",
    cacheControl: "public,max-age=3600",
  });
  return getDownloadURL(objectRef);
}

import { signInWithPopup, signInWithRedirect } from "firebase/auth";
import { auth, googleProvider, isFirebaseConfigured } from "../firebaseClient";

const REDIRECT_FALLBACK_CODES = new Set([
  "auth/popup-blocked",
  "auth/popup-closed-by-user",
  "auth/cancelled-popup-request",
  "auth/operation-not-supported-in-this-environment",
]);

export async function signInWithGoogle() {
  if (!isFirebaseConfigured || !auth || !googleProvider) {
    throw new Error(
      "Firebase auth is not configured. Set the NEXT_PUBLIC_FIREBASE_* values.",
    );
  }

  try {
    return await signInWithPopup(auth, googleProvider);
  } catch (error) {
    if (REDIRECT_FALLBACK_CODES.has(error?.code)) {
      await signInWithRedirect(auth, googleProvider);
      return null;
    }

    throw error;
  }
}

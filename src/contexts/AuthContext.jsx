/**
 * AuthContext — authentication, session, and onboarding state.
 *
 * Extracted from src/App.jsx (Step 1/4 of the performance refactor).
 * Covers:
 *  - Firebase session restore (onAuthStateChanged)
 *  - User object, screen routing for auth/onboarding screens
 *  - All auth form state (sign-in, register, forgot-password, reset-password)
 *  - Auth mutations (sign-in, sign-out, register, delete account, etc.)
 *  - Guest screen guard and screen persistence
 *
 * App.jsx consumes this via <AuthProvider> + useAuth().
 * Sound feedback for auth mutations is routed through SoundContext
 * (callGlobalPlay) so there is no ref-bridge wiring needed from App.jsx.
 */

import {
  confirmPasswordReset,
  createUserWithEmailAndPassword,
  deleteUser,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  verifyPasswordResetCode,
} from "firebase/auth";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { auth, isFirebaseConfigured } from "../firebaseClient";
import { getFirebaseProfile } from "../services/firebaseProfile";
import { signInWithGoogle } from "../services/firebaseAuth";
import { LS } from "../systems/storage";
import { callGlobalPlay } from "./SoundContext";

/** Landing page providers: Google is live; Phone is a placeholder. */
export const AUTH_PROVIDERS = [
  { key: "google", label: "Google", live: true, color: "#4285F4" },
  { key: "phone", label: "Phone", live: false, color: "#3d5a4c" },
];

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // ─── Session state ───────────────────────────────────────────────────────
  const [screen, setScreen] = useState("loading"); // "loading" until Firebase resolves
  const [user, setUser] = useState(null); // { id, email, name, username, emailConfirmed, avatarUrl }
  const [authLoading, setAuthLoading] = useState(false);

  // ─── Sign-in form ─────────────────────────────────────────────────────────
  const [siSocialErr, setSiSocialErr] = useState("");
  const [siEmail, setSiEmail] = useState("");
  const [siPass, setSiPass] = useState("");
  const [siErr, setSiErr] = useState("");
  const [siShowPass, setSiShowPass] = useState(false);

  // ─── Forgot-password form (P9a) ──────────────────────────────────────────
  const [forgotMode, setForgotMode] = useState(false);
  const [fpEmail, setFpEmail] = useState("");
  const [fpMsg, setFpMsg] = useState("");
  const [fpErr, setFpErr] = useState("");

  // ─── Register form ────────────────────────────────────────────────────────
  const [rName, setRName] = useState("");
  const [rEmail, setREmail] = useState("");
  const [rDob, setRDob] = useState("");
  const [rPass, setRPass] = useState("");
  const [rPass2, setRPass2] = useState("");
  const [rShowPass, setRShowPass] = useState(false);
  const [rShowPass2, setRShowPass2] = useState(false);
  const [rErr, setRErr] = useState({});
  const [verifyEmailAddress, setVerifyEmailAddress] = useState("");

  // ─── Reset-password form ──────────────────────────────────────────────────
  const [rpPass, setRpPass] = useState("");
  const [rpPass2, setRpPass2] = useState("");
  const [rpShowPass, setRpShowPass] = useState(false);
  const [rpShowPass2, setRpShowPass2] = useState(false);
  const [rpErr, setRpErr] = useState("");

  // ─── Delete-account confirm sheet (iOS-style modal) ───────────────────────
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteInProgress, setDeleteInProgress] = useState(false);
  const deleteCancelRef = useRef(null);

  // ─── Internal refs ────────────────────────────────────────────────────────
  const postAuthScreenRef = useRef(null);
  const passwordRecoveryRef = useRef(false);
  const passwordResetOobCodeRef = useRef(null);
  // Snapshots the form values at the moment errors are set.
  // We only clear an error when that specific field's CURRENT value
  // differs from its snapshot (i.e. the user actually edited it),
  // AND the new value is valid. This fixes the "errors flash and
  // disappear" bug where server-side errors were instantly erased
  // because the submitted values were already "valid-looking".
  const rErrSnapshot = useRef({
    name: "",
    email: "",
    dob: "",
    pass: "",
    pass2: "",
  });

  // ─── Play sound bridge ────────────────────────────────────────────────────
  // Sound feedback for auth mutations is provided via SoundContext.callGlobalPlay().
  // No ref-bridge or manual wiring needed — SoundProvider in App.jsx keeps the
  // module-level registry up to date whenever the play function changes.

  // ─── rErr auto-clearing effect ────────────────────────────────────────────
  // Only clear a field error when that field changes from its snapshot value
  // AND the new value passes basic validity, to avoid premature clearing.
  useEffect(() => {
    if (!rErr || Object.keys(rErr).length === 0) return;
    setRErr((prev) => {
      let changed = false;
      const next = { ...prev };
      const snap = rErrSnapshot.current;

      // name: clear once user edits away from snapshot AND value is non-empty.
      if (next.name && rName !== snap.name && rName.trim()) {
        delete next.name;
        changed = true;
      }
      // email: clear only on actual edit + valid-looking address.
      if (
        next.email &&
        rEmail !== snap.email &&
        rEmail.includes("@") &&
        rEmail.includes(".")
      ) {
        delete next.email;
        changed = true;
      }
      // dob: clear on edit + non-empty.
      if (next.dob && rDob !== snap.dob && rDob.trim()) {
        delete next.dob;
        changed = true;
      }
      // pass: clear only when it now meets ALL complexity requirements.
      const passStrong =
        rPass.length >= 8 &&
        /[A-Z]/.test(rPass) &&
        /[a-z]/.test(rPass) &&
        /[0-9]/.test(rPass) &&
        /[^A-Za-z0-9]/.test(rPass);
      if (next.pass && rPass !== snap.pass && passStrong) {
        delete next.pass;
        changed = true;
      }
      // pass2: clear only when it matches pass.
      if (next.pass2 && rPass2 !== snap.pass2 && rPass2 && rPass === rPass2) {
        delete next.pass2;
        changed = true;
      }
      return changed ? next : prev;
    });
  }, [rDob, rEmail, rErr, rName, rPass, rPass2]);

  // ─── clearAuthFormState ───────────────────────────────────────────────────
  const clearAuthFormState = useCallback(() => {
    setSiSocialErr("");
    setSiEmail("");
    setSiPass("");
    setSiErr("");
    setSiShowPass(false);
    setForgotMode(false);
    setFpEmail("");
    setFpMsg("");
    setFpErr("");
    setRName("");
    setREmail("");
    setRDob("");
    setRPass("");
    setRPass2("");
    setRShowPass(false);
    setRShowPass2(false);
    setRErr({});
    setVerifyEmailAddress("");
    setRpPass("");
    setRpPass2("");
    setRpShowPass(false);
    setRpShowPass2(false);
    setRpErr("");
  }, []);

  // ─── shapeUser ────────────────────────────────────────────────────────────
  const shapeUser = useCallback((firebaseUser, profileDoc = null) => {
    return {
      id: firebaseUser.uid,
      email: profileDoc?.email || firebaseUser.email || "",
      name:
        profileDoc?.full_name || firebaseUser.displayName || firebaseUser.email || "",
      username: profileDoc?.username || "",
      emailConfirmed: Boolean(firebaseUser.emailVerified),
      avatarUrl: profileDoc?.avatar_url || firebaseUser.photoURL || "",
    };
  }, []);

  // ─── Firebase session restore + onAuthStateChanged ────────────────────────
  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setUser(null);
      setScreen("landing");
      return undefined;
    }

    // Detect Firebase password-reset link (mode=resetPassword&oobCode=…) on load.
    if (typeof window !== "undefined") {
      try {
        const search = window.location.search || "";
        const readParam = (name) => {
          const m = new RegExp(`[?&]${name}=([^&#]*)`).exec(search);
          return m ? decodeURIComponent(m[1]) : null;
        };
        const mode = readParam("mode");
        const oobCode = readParam("oobCode");
        if (mode === "resetPassword" && oobCode) {
          verifyPasswordResetCode(auth, oobCode)
            .then(() => {
              passwordResetOobCodeRef.current = oobCode;
              passwordRecoveryRef.current = true;
              setScreen("reset_password");
              // Clean the URL so a refresh doesn't re-trigger with a stale code.
              try {
                window.history.replaceState(
                  null,
                  "",
                  window.location.pathname,
                );
              } catch {
                /* ignore */
              }
            })
            .catch(() => {
              setRpErr(
                "This reset link is invalid or has expired. Request a new email from the sign-in screen.",
              );
              setScreen("signin");
            });
        }
      } catch {
        /* ignore URL parse errors */
      }
    }

    let active = true;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        const nextScreen = postAuthScreenRef.current || "landing";
        postAuthScreenRef.current = null;
        passwordRecoveryRef.current = false;
        if (!active) return;
        setUser(null);
        clearAuthFormState();
        setScreen(nextScreen);
        return;
      }

      const isGoogleUser = firebaseUser.providerData?.some(
        (provider) => provider.providerId === "google.com",
      );

      if (!firebaseUser.emailVerified && !isGoogleUser) {
        if (!active) return;
        setUser(null);
        setVerifyEmailAddress(firebaseUser.email || "");
        setScreen("verify_email");
        return;
      }

      let profileDoc = null;
      try {
        profileDoc = await getFirebaseProfile(firebaseUser.uid);
      } catch (error) {
        console.error("Failed to load Firebase profile during auth restore", error);
      }

      if (!active) return;

      const shapedUser = shapeUser(firebaseUser, profileDoc);
      setUser(shapedUser);

      const onboarded = LS.get(`onboarded_${shapedUser.id}`, false);
      if (!onboarded) {
        LS.set(`onboarded_${shapedUser.id}`, true);
      }

      const lastScreen = LS.get("life_last_screen", "app");
      const validScreens = [
        "app",
        "tailor_intro",
        "tailor_qs",
        "tailor_result",
      ];
      setScreen(
        !onboarded && !isGoogleUser
          ? "theme_picker"
          : validScreens.includes(lastScreen)
            ? lastScreen
            : "app",
      );
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [clearAuthFormState, shapeUser]);

  // ─── Guest screen guard ───────────────────────────────────────────────────
  // Redirect unauthenticated users away from protected screens.
  useEffect(() => {
    const guestScreens = [
      "loading",
      "landing",
      "signin",
      "register",
      "privacy_policy",
      "terms_conditions",
      "verify_email",
      "reset_password",
    ];
    if (!user && screen && !guestScreens.includes(screen)) {
      setScreen("landing");
    }
  }, [screen, user]);

  // ─── Screen persistence ───────────────────────────────────────────────────
  useEffect(() => {
    if (screen && screen !== "loading") {
      LS.set("life_last_screen", screen);
    }
  }, [screen]);

  // ─── Auth mutation: Google sign-in ────────────────────────────────────────
  const doGoogleSignIn = async () => {
    if (authLoading) return;
    callGlobalPlay("tap");
    setSiSocialErr("");
    if (!isFirebaseConfigured || !auth) {
      setSiSocialErr(
        "Firebase auth is not configured yet. Add the NEXT_PUBLIC_FIREBASE_* values to your deployment settings.",
      );
      callGlobalPlay("err");
      return;
    }
    setAuthLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      setSiSocialErr(
        String(error.message || "Could not start Google sign in."),
      );
      callGlobalPlay("err");
    } finally {
      setAuthLoading(false);
    }
  };

  const doProviderSignIn = (item) => {
    if (!item.live) {
      callGlobalPlay("tap");
      setSiSocialErr(`${item.label} login is coming soon.`);
      return;
    }
    if (item.key === "google") {
      doGoogleSignIn();
    }
  };

  // ─── Auth mutation: email/password sign-in ────────────────────────────────
  const doEmailSignIn = async () => {
    if (authLoading) return;
    setSiErr("");
    setSiSocialErr("");
    if (!isFirebaseConfigured || !auth) {
      setSiErr(
        "Firebase auth is not configured yet. Add the NEXT_PUBLIC_FIREBASE_* values to your deployment settings.",
      );
      callGlobalPlay("err");
      return;
    }
    if (!siEmail.trim()) {
      setSiErr("Please enter your email.");
      callGlobalPlay("err");
      return;
    }
    if (!siPass) {
      setSiErr("Please enter your password.");
      callGlobalPlay("err");
      return;
    }
    setAuthLoading(true);
    try {
      await signInWithEmailAndPassword(
        auth,
        siEmail.toLowerCase().trim(),
        siPass,
      );
    } catch (error) {
      const msg = String(error.message || "").toLowerCase();
      if (msg.includes("invalid") || error.code === "auth/invalid-credential") {
        setSiErr("no_account_or_wrong_password");
      } else if (msg.includes("rate") || msg.includes("too many")) {
        setSiErr("Too many attempts. Wait a moment.");
      } else {
        setSiErr("Could not sign in. Check your details.");
      }
      callGlobalPlay("err");
    } finally {
      setAuthLoading(false);
    }
  };

  // ─── Auth mutation: forgot password ───────────────────────────────────────
  const doForgotPassword = async () => {
    if (authLoading) return;
    setFpErr("");
    setFpMsg("");
    if (!isFirebaseConfigured || !auth) {
      setFpErr(
        "Firebase auth is not configured yet. Add the NEXT_PUBLIC_FIREBASE_* values to your deployment settings.",
      );
      callGlobalPlay("err");
      return;
    }
    if (!fpEmail.trim() || !fpEmail.includes("@")) {
      setFpErr("Please enter a valid email.");
      callGlobalPlay("err");
      return;
    }
    setAuthLoading(true);
    try {
      await sendPasswordResetEmail(auth, fpEmail.toLowerCase().trim());
      setFpMsg("Password reset email sent. Check your inbox.");
      callGlobalPlay("ok");
    } catch (error) {
      setFpErr(String(error.message || "Could not send reset email."));
      callGlobalPlay("err");
    } finally {
      setAuthLoading(false);
    }
  };

  // ─── Auth mutation: confirm password reset ────────────────────────────────
  const doResetPassword = async () => {
    if (authLoading) return;
    setRpErr("");

    if (rpPass.length < 8) {
      setRpErr("Password must be at least 8 characters.");
      callGlobalPlay("err");
      return;
    }
    if (
      !/[A-Z]/.test(rpPass) ||
      !/[a-z]/.test(rpPass) ||
      !/\d/.test(rpPass) ||
      !/[^A-Za-z0-9]/.test(rpPass)
    ) {
      setRpErr("Use upper/lowercase letters, a number, and a symbol.");
      callGlobalPlay("err");
      return;
    }
    if (rpPass !== rpPass2) {
      setRpErr("Passwords do not match.");
      callGlobalPlay("err");
      return;
    }

    const oobCode = passwordResetOobCodeRef.current;
    if (!auth || !oobCode) {
      setRpErr(
        "This reset link is invalid or has expired. Request a new email from the sign-in screen.",
      );
      callGlobalPlay("err");
      return;
    }

    setAuthLoading(true);
    try {
      await confirmPasswordReset(auth, oobCode, rpPass);
      passwordResetOobCodeRef.current = null;
      passwordRecoveryRef.current = false;
      setRpPass("");
      setRpPass2("");
      callGlobalPlay("ok");
      setScreen("signin");
    } catch (error) {
      const code = String(error?.code || "");
      if (code === "auth/expired-action-code" || code === "auth/invalid-action-code") {
        setRpErr(
          "This reset link is invalid or has expired. Request a new email from the sign-in screen.",
        );
      } else if (code === "auth/weak-password") {
        setRpErr("Password is too weak. Use upper/lowercase, a number, and a symbol.");
      } else {
        setRpErr(
          String(error?.message || "Could not update password. Please try again."),
        );
      }
      callGlobalPlay("err");
    } finally {
      setAuthLoading(false);
    }
  };

  // ─── Auth mutation: email/password registration ───────────────────────────
  const doRegister = async () => {
    if (authLoading) return;
    setRErr({});
    if (!isFirebaseConfigured || !auth) {
      setRErr({
        email:
          "Firebase auth is not configured yet. Add the NEXT_PUBLIC_FIREBASE_* values to your deployment settings.",
      });
      callGlobalPlay("err");
      return;
    }
    // Helper that snapshots current form values BEFORE updating errors,
    // so the clearing-effect knows what "old" values looked like.
    const setRErrSnap = (errs) => {
      rErrSnapshot.current = {
        name: rName,
        email: rEmail,
        dob: rDob,
        pass: rPass,
        pass2: rPass2,
      };
      setRErr(errs);
    };
    const err = {};
    if (!rName.trim()) err.name = "Full name is required.";
    if (!rEmail.trim() || !rEmail.includes("@"))
      err.email = "Enter a valid email.";
    if (!rDob) err.dob = "Date of birth is required.";
    else {
      const dobParts = rDob.split("/");
      const dd = Number(dobParts[0]);
      const mm = Number(dobParts[1]);
      const yyRaw = Number(dobParts[2] || 0);
      const yr =
        yyRaw < 100 ? (yyRaw <= 26 ? 2000 + yyRaw : 1900 + yyRaw) : yyRaw;
      const dob = new Date(yr, mm - 1, dd);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      if (
        today.getMonth() < mm - 1 ||
        (today.getMonth() === mm - 1 && today.getDate() < dd)
      )
        age--;
      if (isNaN(dob.getTime()) || dd < 1 || dd > 31 || mm < 1 || mm > 12)
        err.dob = "Enter a valid date (dd/mm/yyyy).";
      else if (age < 13) err.dob = "You must be 13 or older to use Life.";
    }
    if (rPass.length < 8) err.pass = "Password must be at least 8 characters.";
    else if (
      !/[A-Z]/.test(rPass) ||
      !/[a-z]/.test(rPass) ||
      !/[0-9]/.test(rPass) ||
      !/[^A-Za-z0-9]/.test(rPass)
    ) {
      err.pass = "Use upper/lowercase letters, a number, and a symbol.";
    }
    if (rPass !== rPass2) err.pass2 = "Passwords do not match.";
    if (Object.keys(err).length) {
      setRErrSnap(err);
      callGlobalPlay("err");
      return;
    }

    setAuthLoading(true);
    try {
      const credentials = await createUserWithEmailAndPassword(
        auth,
        rEmail.toLowerCase().trim(),
        rPass,
      );
      await updateProfile(credentials.user, {
        displayName: rName.trim(),
      });
      await sendEmailVerification(credentials.user);
      setVerifyEmailAddress(
        credentials.user.email || rEmail.toLowerCase().trim(),
      );
      LS.set(`onboarded_${credentials.user.uid}`, false);
      callGlobalPlay("ok");
      setScreen("verify_email");
    } catch (error) {
      const raw = String(error.message || "")
        .trim()
        .toLowerCase();
      if (raw.includes("already")) {
        setRErrSnap({ email: "already_registered" });
      } else if (
        raw.includes("password") ||
        raw.includes("character") ||
        raw.includes("weak")
      ) {
        setRErrSnap({
          pass: "Password too weak. Use upper/lowercase, number, and symbol.",
        });
      } else if (raw.includes("email")) {
        setRErrSnap({ email: "Please enter a valid email address." });
      } else {
        setRErrSnap({
          email: "Could not create account. Please check details.",
        });
      }
      callGlobalPlay("err");
    } finally {
      setAuthLoading(false);
    }
  };

  // ─── Auth mutation: sign out ──────────────────────────────────────────────
  const doSignOut = async () => {
    postAuthScreenRef.current = "landing";
    passwordRecoveryRef.current = false;
    if (auth) {
      await signOut(auth);
    }
    clearAuthFormState();
    setUser(null);
    setScreen("landing");
    setSiSocialErr("");
  };

  // ─── Auth mutation: initiate account deletion (opens confirm sheet) ────────
  const doDeleteAccount = () => {
    // Open the iOS-style confirm sheet; the actual deletion happens
    // in performDeleteAccount after the user confirms.
    setDeleteConfirmOpen(true);
  };

  // ─── Auth mutation: perform confirmed account deletion ────────────────────
  const performDeleteAccount = async () => {
    setDeleteInProgress(true);
    // Derive LS key prefix from current user — data keys use email (same as App.jsx uid),
    // but onboarded flag uses Firebase uid (same as everywhere it's set/read).
    const uid = user?.email || "_";
    const userId = user?.id || "_";
    try {
      const currentUser = auth?.currentUser;
      // Best-effort: wipe local-only keys for this user first so a partial failure
      // still clears client-side data.
      try {
        LS.del(`tsd_${uid}`);
        LS.del(`bk_${uid}`);
        LS.del(`nt_${uid}`);
        LS.del(`rd_${uid}`);
        LS.del(`tools_todos_${uid}`);
        LS.del(`tools_lockin_${uid}`);
        LS.del(`prefs_${uid}`);
        LS.del(`onboarded_${userId}`); // onboarded uses Firebase uid, not email
      } catch {
        /* ignore LS wipe errors */
      }
      if (currentUser) {
        await deleteUser(currentUser);
      }
      callGlobalPlay("ok");
      setDeleteConfirmOpen(false);
      await doSignOut();
    } catch (error) {
      const code = String(error?.code || "");
      if (code === "auth/requires-recent-login") {
        setDeleteConfirmOpen(false);
        if (typeof window !== "undefined") {
          window.alert(
            "For security, please sign in again and then retry deleting your account.",
          );
        }
        await doSignOut();
        return;
      }
      callGlobalPlay("err");
      if (typeof window !== "undefined") {
        window.alert(
          String(error?.message || "Could not delete your account. Please try again."),
        );
      }
    } finally {
      setDeleteInProgress(false);
    }
  };

  // ─── Context value ────────────────────────────────────────────────────────
  const value = {
    // Session
    screen,
    setScreen,
    user,
    setUser,
    authLoading,

    // Sign-in form
    siSocialErr,
    setSiSocialErr,
    siEmail,
    setSiEmail,
    siPass,
    setSiPass,
    siErr,
    setSiErr,
    siShowPass,
    setSiShowPass,

    // Forgot-password form
    forgotMode,
    setForgotMode,
    fpEmail,
    setFpEmail,
    fpMsg,
    setFpMsg,
    fpErr,
    setFpErr,

    // Register form
    rName,
    setRName,
    rEmail,
    setREmail,
    rDob,
    setRDob,
    rPass,
    setRPass,
    rPass2,
    setRPass2,
    rShowPass,
    setRShowPass,
    rShowPass2,
    setRShowPass2,
    rErr,
    setRErr,
    verifyEmailAddress,
    setVerifyEmailAddress,

    // Reset-password form
    rpPass,
    setRpPass,
    rpPass2,
    setRpPass2,
    rpShowPass,
    setRpShowPass,
    rpShowPass2,
    setRpShowPass2,
    rpErr,
    setRpErr,

    // Delete-account confirm sheet
    deleteConfirmOpen,
    setDeleteConfirmOpen,
    deleteInProgress,
    deleteCancelRef,

    // Refs exposed for render-side use
    passwordRecoveryRef,

    // Provider config
    AUTH_PROVIDERS,

    // Auth mutations
    clearAuthFormState,
    doProviderSignIn,
    doEmailSignIn,
    doForgotPassword,
    doResetPassword,
    doRegister,
    doSignOut,
    doDeleteAccount,
    performDeleteAccount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access auth state and mutations.
 * Must be used inside a component tree wrapped by <AuthProvider>.
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

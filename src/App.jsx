// v1.0.1 - auth fixes: DOB validation, 3s loading, Firebase migration follow-up
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { TreeNode } from "./components/Field";
import {
  allContent,
  CONTENT,
  GUIDED_ORDER,
  LIBRARY,
  MAP,
} from "./data/content";
import { auth, isFirebaseConfigured } from "./firebaseClient";
import { Ic } from "./icons/Ic";
import {
  queueWelcomeConfirmedEmailOnce,
  syncPrivateEmailIdentity,
} from "./services/emailDelivery";
import { getFirebaseProfile } from "./services/firebaseProfile";
import { SUPPORT_EMAIL } from "./systems/appConfig";
import {
  appendNotification,
  deleteNotificationById,
  loadNotificationsFor,
  markAllNotificationsRead,
  markNotificationRead,
} from "./systems/notifications";
import { getReadingStreak, recordReadingDay } from "./systems/readingStreak";
import { setResumeTopic } from "./systems/resumeReading";
import { LS } from "./systems/storage";
import { C, S, useTheme, THEME_MODES } from "./systems/theme";
import { useMomentum } from "./systems/useMomentum";
import { useQuizStats } from "./systems/useQuizStats";
import { useSound } from "./systems/useSound";
import { useUserData } from "./systems/useUserData";

import { AccountCustomizePage } from "./components/AccountCustomizePage";
import {
  EbookReader,
  IncomeIdeasPage,
  MomentumHubPage,
  PostItFeed,
  QuizPage,
  RouteFallback,
  SL,
  SS,
  TailorIntro,
  TailorQuestions,
  TailorResult,
} from "./components/AppShell";
import { BottomNav } from "./components/BottomNav";
import { CategoriesPage } from "./components/CategoriesPage";
import { CategoryHubPage } from "./components/CategoryHubPage";
import { DailyGrowthPage } from "./components/DailyGrowthPage";
import { GoalSettingPage } from "./components/GoalSettingPage";
import { HelpPage } from "./components/HelpPage";
import { HomePage } from "./components/HomePage";
import { InventorsInvestors } from "./components/InventorsInvestors";
import { alpha } from "./components/inventorsInvestors/InventorsInvestorsUI";
import { LandingPage } from "./components/LandingPage";
import { LeaderboardPage } from "./components/LeaderboardPage";
import { MentorshipPage } from "./components/MentorshipPage";
import { PremiumPage } from "./components/PremiumPage";
import ProfilePage from "./components/ProfilePage";
import { ProgressDashboardPage } from "./components/ProgressDashboardPage";
import { RegisterPage } from "./components/RegisterPage";
import { ResetPasswordPage } from "./components/ResetPasswordPage";
import { SecretSiennaPage } from "./components/SecretSiennaPage";
import SettingsPage from "./components/SettingsPage";
import { SidebarSectionPage } from "./components/SidebarSectionPage";
import { SignInPage } from "./components/SignInPage";
import { ThemePickerPage } from "./components/ThemePickerPage";
import { ToolsLockInPage } from "./components/ToolsLockInPage";
import { ToolsOrganizedPage } from "./components/ToolsOrganizedPage";
import { LearnItPage } from "./components/learnIt/LearnItPage";
import { LearnItSubjectPage } from "./components/learnIt/LearnItSubjectPage";
import { VerifyEmailPage } from "./components/VerifyEmailPage";
import { WhereToStartPage } from "./components/WhereToStartPage";
import { signInWithGoogle } from "./services/firebaseAuth";

const PREF_DEFAULTS = {
  soundEnabled: true,
  soundVolume: 58,
  soundMode: "focused",
  soundScope: "balanced",
  textScale: 100,
  readingDensity: "comfortable",
  highContrast: false,
  dataSaver: false,
  reduceMotion: false,
  pressIntensity: 58,
  instantButtons: true,
  sidebarSpeed: 62,
};

// Swipe left beyond 72px to delete; direction-locked to avoid vertical-scroll conflicts.
const SWIPE_HORIZONTAL_BIAS = 1.5;
const SECRET_SIENNA_SEARCH_CODE = "160705kc";

// Maps notification type/activity to an emoji icon
function notifIcon(n) {
  if (n.templateKey === "newMessage") return "💬";
  if (n.templateKey === "newMatch") return "🤝";
  if (n.templateKey === "profileUpdated") return "👤";
  if (n.templateKey === "streakCelebration") return "🔥";
  if (n.templateKey === "supportAcknowledged") return "🛟";
  if (n.templateKey === "welcomeConfirmed") return "👋";
  if (n.activity === "audio") return "🎙️";
  if (n.targetPage === "home") return "👋";
  if (n.targetPage === "where_to_start") return "📚";
  if (n.targetPage === "daily_growth") return "🌱";
  if (n.targetPage === "quiz") return "🧠";
  if (n.targetPage === "leaderboard") return "🏆";
  if (n.targetPage === "profile") return "👤";
  return "✨";
}

function SwipeableNotification({ n, theme, dark, onTap, onDelete }) {
  const [offset, setOffset] = useState(0);
  const [exiting, setExiting] = useState(false);
  const dragging = useRef(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const currentX = useRef(0);
  const didDrag = useRef(false);
  const directionLocked = useRef(null);

  const revealRatio = Math.min(1, Math.abs(offset) / 72);

  const onStart = (clientX, clientY) => {
    if (exiting) return;
    startX.current = clientX;
    startY.current = clientY;
    currentX.current = clientX;
    didDrag.current = false;
    directionLocked.current = null;
    dragging.current = true;
  };

  const onMove = (clientX, clientY) => {
    if (!dragging.current || exiting) return;
    const dx = clientX - startX.current;
    const dy = clientY - startY.current;
    if (
      directionLocked.current === null &&
      (Math.abs(dx) > 5 || Math.abs(dy) > 5)
    ) {
      directionLocked.current =
        Math.abs(dx) > Math.abs(dy) * SWIPE_HORIZONTAL_BIAS
          ? "horizontal"
          : "vertical";
    }
    if (directionLocked.current === "vertical") return;
    currentX.current = clientX;
    if (Math.abs(dx) > 5) didDrag.current = true;
    setOffset(Math.min(0, dx));
  };

  const onEnd = () => {
    if (!dragging.current) return;
    dragging.current = false; // release drag lock FIRST so transition is active
    const delta = currentX.current - startX.current;
    if (delta < -72) {
      // Transition is now active (dragging.current = false) — fly card out smoothly
      setExiting(true);
      setOffset(-440);
      setTimeout(() => onDelete?.(), 320);
    } else {
      // Spring snap back
      setOffset(0);
    }
  };

  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        borderBottom: `1px solid ${dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)"}`,
        maxHeight: exiting ? 0 : 120,
        opacity: exiting ? 0 : 1,
        transition: exiting
          ? "max-height 0.32s cubic-bezier(0.4,0,0.2,1), opacity 0.22s ease"
          : "none",
      }}
    >
      {/* Red delete reveal layer */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(90deg, #e85555 0%, #c0392b 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          paddingRight: 20,
          gap: 6,
          opacity: revealRatio,
          transition: dragging.current ? "none" : "opacity 0.2s ease",
        }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#fff"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14H6L5 6" />
          <path d="M10 11v6M14 11v6" />
          <path d="M9 6V4h6v2" />
        </svg>
        <span
          style={{
            color: "#fff",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 0.5,
          }}
        >
          Delete
        </span>
      </div>

      {/* Foreground card */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => {
          if (!didDrag.current) onTap?.();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onTap?.();
        }}
        onTouchStart={(e) =>
          onStart(e.touches[0].clientX, e.touches[0].clientY)
        }
        onTouchMove={(e) => onMove(e.touches[0].clientX, e.touches[0].clientY)}
        onTouchEnd={onEnd}
        onMouseDown={(e) => onStart(e.clientX, e.clientY)}
        onMouseMove={(e) => dragging.current && onMove(e.clientX, e.clientY)}
        onMouseUp={onEnd}
        onMouseLeave={onEnd}
        style={{
          position: "relative",
          padding: "13px 14px",
          background: n.read
            ? dark
              ? "#1e1e1e"
              : "#ffffff"
            : dark
              ? "rgba(61,90,76,0.10)"
              : "rgba(61,90,76,0.06)",
          cursor: "pointer",
          transform: `translateX(${offset}px)`,
          transition: dragging.current
            ? "transform 0.05s linear"
            : exiting
              ? "transform 0.32s cubic-bezier(0.4,0,0.8,0.4)"
              : "transform 0.38s cubic-bezier(0.22,1,0.36,1)",
          userSelect: "none",
          touchAction: "pan-y",
          WebkitTapHighlightColor: "transparent",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 11 }}>
          {/* Icon bubble */}
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: dark
                ? "rgba(255,255,255,0.06)"
                : "rgba(61,90,76,0.1)",
              display: "grid",
              placeItems: "center",
              fontSize: 16,
              flexShrink: 0,
            }}
          >
            {notifIcon(n)}
          </div>

          {/* Text */}
          <div style={{ flex: 1, minWidth: 0, paddingTop: 1 }}>
            {n.title ? (
              <p
                style={{
                  margin: "0 0 2px",
                  fontSize: 12,
                  color: dark ? "rgba(255,255,255,0.72)" : "rgba(0,0,0,0.58)",
                  lineHeight: 1.35,
                  fontWeight: 700,
                  letterSpacing: 0.15,
                }}
              >
                {n.title}
              </p>
            ) : null}
            <p
              style={{
                margin: 0,
                fontSize: 13,
                color: dark ? "#e8e8e8" : "#1a1a1a",
                lineHeight: 1.45,
                fontWeight: n.read ? 400 : 500,
              }}
            >
              {n.text}
            </p>
            <p
              style={{
                margin: "4px 0 0",
                fontSize: 10.5,
                color: dark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.38)",
                fontFamily:
                  "-apple-system,BlinkMacSystemFont,system-ui,sans-serif",
              }}
            >
              {n.time}
            </p>
          </div>

          {/* Unread dot */}
          {!n.read && (
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: theme.green,
                flexShrink: 0,
                marginTop: 5,
                boxShadow: `0 0 0 2px ${dark ? "#1e1e1e" : "#fff"}`,
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function LifeApp() {
  const { dark, toggleTheme, t, themeMode, setThemeMode, systemDark } =
    useTheme();

  useEffect(() => {
    document.body.classList.toggle("life-dark", dark);
    // life-light signals organized + other portaled content that the user
    // has explicitly chosen light mode (which is now just slightly lighter dark).
    document.body.classList.toggle("life-light", !dark && themeMode === THEME_MODES.light);
  }, [dark, themeMode]);

  const [screen, setScreen] = useState("loading"); // start loading until session resolved
  const [user, setUser] = useState(null); // { id, email, name, username }
  const [authLoading, setAuthLoading] = useState(false);
  const [siSocialErr, setSiSocialErr] = useState("");

  // Sign-in email/password fields
  const [siEmail, setSiEmail] = useState("");
  const [siPass, setSiPass] = useState("");
  const [siErr, setSiErr] = useState("");
  const [siShowPass, setSiShowPass] = useState(false);

  // Forgot password (P9a)
  const [forgotMode, setForgotMode] = useState(false);
  const [fpEmail, setFpEmail] = useState("");
  const [fpMsg, setFpMsg] = useState("");
  const [fpErr, setFpErr] = useState("");

  // Register form
  const [rName, setRName] = useState("");
  const [rEmail, setREmail] = useState("");
  const [rDob, setRDob] = useState("");
  const [rPass, setRPass] = useState("");
  const [rPass2, setRPass2] = useState("");
  const [rShowPass, setRShowPass] = useState(false);
  const [rShowPass2, setRShowPass2] = useState(false);
  const [rErr, setRErr] = useState({});
  const [verifyEmailAddress, setVerifyEmailAddress] = useState("");
  const [rpPass, setRpPass] = useState("");
  const [rpPass2, setRpPass2] = useState("");
  const [rpShowPass, setRpShowPass] = useState(false);
  const [rpShowPass2, setRpShowPass2] = useState(false);
  const [rpErr, setRpErr] = useState("");
  const postAuthScreenRef = useRef(null);
  const passwordRecoveryRef = useRef(false);
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

  // Landing page providers: Google is live; Phone is a placeholder.
  const AUTH_PROVIDERS = [
    {
      key: "google",
      label: "Google",
      live: true,
      color: "#4285F4",
    },
    {
      key: "phone",
      label: "Phone",
      live: false,
      color: "#3d5a4c",
    },
  ];

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

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setUser(null);
      setScreen("landing");
      return undefined;
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

  useEffect(() => {
    if (screen && screen !== "loading") {
      LS.set("life_last_screen", screen);
    }
  }, [screen]);

  const uid = user?.email || "_";
  const userIdForData = user?.id || null;
  const [uiPrefs, setUiPrefs] = useState(() => ({
    ...PREF_DEFAULTS,
    ...LS.get(`prefs_${uid}`, PREF_DEFAULTS),
  }));
  const play = useSound({
    enabled: uiPrefs.soundEnabled,
    volume: uiPrefs.soundVolume,
    mode: uiPrefs.soundMode,
    scope: uiPrefs.soundScope,
  });
  const cloud = useUserData(userIdForData);

  const emailDeliverySyncKeyRef = useRef("");
  const prevUidRef = useRef(uid);
  const migratedRef = useRef(false);

  const [localBookmarks, setLocalBookmarksRaw] = useState(() =>
    LS.get(`bk_${uid}`, []),
  );
  const [localNotes, setLocalNotesRaw] = useState(() =>
    LS.get(`nt_${uid}`, {}),
  );
  const [localReadKeys, setLocalReadKeysRaw] = useState(() =>
    LS.get(`rd_${uid}`, []),
  );
  const [localProfile, setLocalProfileRaw] = useState(() =>
    LS.get(`tsd_${uid}`, null),
  );
  const [localMomentumState, setLocalMomentumStateRaw] = useState(() =>
    LS.get(`mom_${uid}`, null),
  );
  const [, setLocalToolsTodosRaw] = useState(() =>
    LS.get(`tools_todos_${uid}`, []),
  );
  const [localToolsSession, setLocalToolsSessionRaw] = useState(() =>
    LS.get(`tools_lockin_${uid}`, null),
  );

  useEffect(() => {
    if (!user?.id || !user?.email) return;

    const syncKey = [
      user.id,
      user.email,
      user.name || "",
      user.emailConfirmed ? "verified" : "pending",
    ].join(":");

    if (emailDeliverySyncKeyRef.current === syncKey) return;
    emailDeliverySyncKeyRef.current = syncKey;

    let cancelled = false;

    const syncEmailDelivery = async () => {
      try {
        await syncPrivateEmailIdentity({
          userId: user.id,
          email: user.email,
          displayName: user.name,
        });

        if (user.emailConfirmed) {
          await queueWelcomeConfirmedEmailOnce({
            userId: user.id,
            email: user.email,
            displayName: user.name,
          });
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to sync app email delivery state", error);
        }
      }
    };

    void syncEmailDelivery();

    return () => {
      cancelled = true;
    };
  }, [user?.email, user?.emailConfirmed, user?.id, user?.name]);

  const bookmarks = userIdForData ? cloud.bookmarks : localBookmarks;
  const notes = userIdForData ? cloud.notes : localNotes;
  const readKeys = userIdForData ? cloud.readKeys : localReadKeys;
  const profile = userIdForData ? cloud.tsdProfile : localProfile;
  const momentumState = userIdForData
    ? cloud.momentumState
    : localMomentumState;
  const toolsSession = userIdForData ? cloud.toolsSession : localToolsSession;

  const setBookmarks = (v) => {
    const next = typeof v === "function" ? v(bookmarks) : v;
    if (userIdForData) cloud.setBookmarks(next);
    else {
      setLocalBookmarksRaw(next);
      LS.set(`bk_${uid}`, next);
    }
  };
  const setNotes = (v) => {
    const next = typeof v === "function" ? v(notes) : v;
    if (userIdForData) cloud.setNotes(next);
    else {
      setLocalNotesRaw(next);
      LS.set(`nt_${uid}`, next);
    }
  };
  const setReadKeys = (v) => {
    const next = typeof v === "function" ? v(readKeys) : v;
    if (userIdForData) cloud.setReadKeys(next);
    else {
      setLocalReadKeysRaw(next);
      LS.set(`rd_${uid}`, next);
    }
  };
  const setMomentumState = (v) => {
    const next = typeof v === "function" ? v(momentumState) : v;
    if (userIdForData) cloud.setMomentumState(next);
    else {
      setLocalMomentumStateRaw(next);
      LS.set(`mom_${uid}`, next);
    }
  };
  const setToolsSession = (v) => {
    const next = typeof v === "function" ? v(toolsSession) : v;
    if (userIdForData) cloud.setToolsSession(next);
    else {
      setLocalToolsSessionRaw(next);
      LS.set(`tools_lockin_${uid}`, next);
    }
  };

  const quizStatsState = useQuizStats(user?.id || null);
  const quizStats = quizStatsState.stats;
  const { snapshot: momentumSnapshot, recordEvent: momentumRecordEvent } =
    useMomentum({
      userId: userIdForData,
      persistedState: momentumState,
      readKeys,
      notes,
      quizStats,
      profile,
      isGuest: !userIdForData,
      persist: setMomentumState,
    });

  const [page, setPageRaw] = useState(() =>
    LS.get(`life_last_page_${uid}`, "home"),
  );
  const [quizPreset, setQuizPreset] = useState(() =>
    LS.get(`life_quiz_preset_${uid}`, { topic: "finance", activity: "quiz" }),
  );
  // iOS-style page history stack — useRef so history changes don't cause re-renders
  const pageHistoryRef = useRef([]);

  const setPage = useCallback(
    (p) => {
      setPageRaw(prev => {
        // Track history for back navigation (max 20 deep)
        pageHistoryRef.current = [...pageHistoryRef.current.slice(-19), prev];
        return p;
      });
      LS.set(`life_last_page_${uid}`, p);
    },
    [uid],
  );

  // Go back one page in history (like UINavigationController.popViewController).
  // Intentionally kept for upcoming swipe-back gesture and hardware back-button wiring.
  // eslint-disable-next-line no-unused-vars
  const goBack = useCallback(() => {
    const hist = pageHistoryRef.current;
    if (!hist.length) return;
    const prev = hist[hist.length - 1];
    pageHistoryRef.current = hist.slice(0, -1);
    setPageRaw(prev);
    LS.set(`life_last_page_${uid}`, prev);
  }, [uid]);
  const setQuizContext = useCallback(
    (next) => {
      const normalized = {
        topic: next?.topic || "finance",
        activity: next?.activity || "quiz",
      };
      setQuizPreset(normalized);
      LS.set(`life_quiz_preset_${uid}`, normalized);
    },
    [uid],
  );

  const openCommunicationQuiz = useCallback(
    (activity = "quiz") => {
      setQuizContext({ topic: "communication", activity });
      setPage("quiz");
    },
    [setPage, setQuizContext],
  );
  const openQuizHome = useCallback(() => {
    setQuizContext({ topic: "finance", activity: "quiz" });
    setPage("quiz");
  }, [setPage, setQuizContext]);

  const openMomentumHub = useCallback(() => {
    play("tap");
    setPage("momentum_hub");
  }, [play, setPage]);

  const openSidebarSectionPage = useCallback(
    (sectionPage, setSectionOpen) => {
      play("tap");
      setPage(sectionPage);
      setSidebarOpen(false);
      if (typeof setSectionOpen === "function") setSectionOpen(true);
    },
    [play, setPage],
  );

  const [categoryPageData, setCategoryPageData] = useState(null);

  useEffect(() => {
    if (page === "tools_todo") {
      setPage("tools_lockin");
    }
  }, [page, setPage]);

  const handleFolderSelect = useCallback(
    (key, node) => {
      setCategoryPageData({ key, node });
      setPage("category_hub");
    },
    [setPage],
  );

  const trackMomentumEvent = useCallback(
    (type, options = {}) => {
      if (!type) return;
      momentumRecordEvent({
        id: `${type}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        type,
        source: options.source || page || "home",
        points: Math.max(0, Number(options.points || 0)),
        createdAt: new Date().toISOString(),
        contentKey: options.contentKey,
        topicKey: options.topicKey,
        meta: options.meta,
      });
    },
    [momentumRecordEvent, page],
  );

  // Dynamic document title per page
  useEffect(() => {
    const titles = {
      home: "Life. — Knowledge, Growth, Community",
      quiz: "Quiz — Life.",
      postit: "Post-It — Life.",
      reading: "Reading — Life.",
      profile: "Profile — Life.",
      help: "Help — Life.",
      where_to_start: "Where To Start — Life.",
      networking: "Investors & Inventors — Life.",
      categories: "Categories — Life.",
      progress_dashboard: "Progress — Life.",
      leaderboard: "Leaderboard — Life.",
      daily_growth: "Daily Growth — Life.",
      income_ideas: "100+ Ways To Generate Income — Life.",
      mentorship: "Mentorship — Life.",
      setting_preferences: "Settings — Life.",
      momentum_hub: "Momentum Hub — Life.",
      sidebar_life: "Life — Life.",
      sidebar_library: "Library — Life.",
      sidebar_tools: "Tools — Life.",
      sidebar_socials: "Socials — Life.",
      sidebar_guided: "Guided — Life.",
      sidebar_saved: "Saved — Life.",
      sidebar_experience: "Experience — Life.",
      tools_lockin: "Lock In — Life.",
      tools_organized: "Organized — Life.",
      learn_it: "Learn-It — Life.",
      learn_it_subject: "Learn-It — Life.",
      premium: "Premium — Life.",
      discord_networking: "Networking Group — Life.",
      account_customize: "Account — Life.",
    };
    document.title = titles[page] || "Life. — Knowledge, Growth, Community";
  }, [page]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selKey, setSelKey] = useState(null);
  const [selContent, setSelContent] = useState(null);
  const [selNode, setSelNode] = useState(null);
  const [tab, setTab] = useState("content");
  const [noteInput, setNoteInput] = useState("");
  const [noteSaved, setNoteSaved] = useState(false);
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [readerModeActive, setReaderModeActive] = useState(false);
  const [secretSiennaUnlocked, setSecretSiennaUnlocked] = useState(false);
  const [isNarrowViewport, setIsNarrowViewport] = useState(false);
  const [sidebarQuery, setSidebarQuery] = useState("");

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return undefined;
    const media = window.matchMedia("(max-width: 767px)");
    const syncViewport = () => setIsNarrowViewport(media.matches);
    syncViewport();
    media.addEventListener("change", syncViewport);
    return () => media.removeEventListener("change", syncViewport);
  }, []);

  useEffect(() => {
    if (!showSearch || search.length <= 1) return;
    const onKey = (e) => {
      if (e.key === "Escape") {
        setShowSearch(false);
        setSearch("");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showSearch, search]);
  const [lifeOpen, setLifeOpen] = useState(true);
  const [libOpen, setLibOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [learnItSubject, setLearnItSubject] = useState(null); // "english" | "finance" | "demeanor"
  const [socialsOpen, setSocialsOpen] = useState(false);
  const [guidedOpen, setGuidedOpen] = useState(false);
  const [savedOpen, setSavedOpen] = useState(false);
  const [experienceOpen, setExperienceOpen] = useState(false);
  const [experienceTopic, setExperienceTopic] = useState(null);

  const sidebarSearchResults = useMemo(() => {
    const query = sidebarQuery.trim().toLowerCase();
    if (query.length < 2) return [];

    return allContent
      .filter(({ key, node, path }) => {
        const haystack = [
          key,
          node?.label || "",
          node?.content?.title || "",
          ...(path || []),
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(query);
      })
      .slice(0, 24);
  }, [sidebarQuery]);

  const libraryCategoryCards = useMemo(() => {
    return Object.entries(LIBRARY).map(([key, node]) => {
      const topicCount = allContent.filter(
        (entry) => entry.path?.[0] === node.label,
      ).length;
      return { key, node, topicCount };
    });
  }, []);
  const [shareToast, setShareToast] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const [a2hsPrompt, setA2hsPrompt] = useState(null); // Android/Chrome BeforeInstallPromptEvent
  const [showA2hs, setShowA2hs] = useState(false);
  const [a2hsDismissed, setA2hsDismissed] = useState(() =>
    LS.get("life_a2hs_dismissed", false),
  );

  // Detect if already running as installed PWA
  const isStandalone = useMemo(
    () =>
      typeof window !== "undefined" &&
      (window.navigator.standalone === true ||
        window.matchMedia("(display-mode: standalone)").matches),
    [],
  );

  // Android/Chrome BeforeInstallPrompt — capture it so we can trigger later
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setA2hsPrompt(e);
      if (!a2hsDismissed && !isStandalone) {
        setTimeout(() => setShowA2hs(true), 3000);
      }
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // iOS Safari — show our custom "tap Share → Add to Home Screen" banner
  useEffect(() => {
    if (a2hsDismissed || isStandalone) return;
    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    if (isIos && isSafari && screen === "app") {
      const timer = setTimeout(() => setShowA2hs(true), 4000);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen]);

  const dismissA2hs = () => {
    setShowA2hs(false);
    setA2hsDismissed(true);
    LS.set("life_a2hs_dismissed", true);
  };

  const triggerA2hs = async () => {
    if (a2hsPrompt) {
      a2hsPrompt.prompt();
      const { outcome } = await a2hsPrompt.userChoice;
      if (outcome === "accepted") {
        setA2hsPrompt(null);
        setShowA2hs(false);
      }
    } else {
      // iOS — can't trigger programmatically, show instruction toast
      dismissA2hs();
    }
  };

  const [notifications, setNotifications] = useState(() =>
    loadNotificationsFor(uid),
  );
  const [showNotif, setShowNotif] = useState(false);
  const closeTransientOverlays = useCallback(() => {
    setShowSearch(false);
    setShowNotif(false);
    setSidebarOpen(false);
  }, []);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const pushSystemNotification = useCallback(
    (input) => {
      const next = appendNotification(uid, input);
      setNotifications(next);
      return next;
    },
    [uid],
  );

  useEffect(() => {
    setNotifications(loadNotificationsFor(uid));
  }, [uid]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const syncNotifications = () => {
      setNotifications(loadNotificationsFor(uid));
    };

    window.addEventListener("life_notifications_updated", syncNotifications);
    window.addEventListener("storage", syncNotifications);

    return () => {
      window.removeEventListener("life_notifications_updated", syncNotifications);
      window.removeEventListener("storage", syncNotifications);
    };
  }, [uid]);

  const overlayHistoryPushedRef = useRef(false);
  const overlayHistoryConsumedRef = useRef(false);
  const overlayCloseRef = useRef(() => {});

  useEffect(() => {
    overlayCloseRef.current = () => {
      setSidebarOpen(false);
      setShowNotif(false);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const handlePop = () => {
      if (!overlayHistoryPushedRef.current) return;
      overlayHistoryConsumedRef.current = true;
      overlayHistoryPushedRef.current = false;
      overlayCloseRef.current();
    };

    window.addEventListener("popstate", handlePop);
    return () => {
      window.removeEventListener("popstate", handlePop);
    };
  }, []);

  // Keep a single browser history entry while the sidebar or notifications
  // are open so mobile back gestures close overlays cleanly.
  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const anyOverlay = sidebarOpen || showNotif;

    if (anyOverlay) {
      if (!overlayHistoryPushedRef.current) {
        window.history.pushState({ lifeOverlay: true }, "");
        overlayHistoryPushedRef.current = true;
        overlayHistoryConsumedRef.current = false;
      }
      return undefined;
    }

    if (overlayHistoryPushedRef.current && !overlayHistoryConsumedRef.current) {
      overlayHistoryConsumedRef.current = true;
      overlayHistoryPushedRef.current = false;
      window.history.back();
    }

    return undefined;
  }, [showNotif, sidebarOpen]);

  const markAllRead = () => {
    const next = markAllNotificationsRead(uid);
    setNotifications(next);
  };
  const deleteNotification = (id) => {
    const next = deleteNotificationById(uid, id);
    setNotifications(next);
  };
  const handleNotifTap = (n) => {
    // Mark the individual notification as read
    const next = markNotificationRead(uid, n.id);
    setNotifications(next);
    // Redirect to the target if provided, else go to Daily Growth as sensible default
    setShowNotif(false);
    play("tap");
    if (n.targetPage) {
      if (n.targetPage === "communication_quiz") {
        openCommunicationQuiz(n.activity || "quiz");
      } else {
        setPage(n.targetPage);
      }
    } else if (n.text && /tailor/i.test(n.text)) {
      setScreen("tailor_intro");
    } else {
      setPage("daily_growth");
    }
  };

  const [catStep, setCatStep] = useState(0);

  useEffect(() => {
    document.body.style.background = t.skin;
    document.documentElement.style.background = t.skin;
  }, [t.skin]);
  const [isOffline, setIsOffline] = useState(
    typeof navigator !== "undefined" ? !navigator.onLine : false,
  );

  const readerPagesKey = `rp_${uid}`;
  const [readerPages, setReaderPages] = useState(() =>
    LS.get(readerPagesKey, {}),
  );
  useEffect(() => {
    setReaderPages(LS.get(`rp_${uid}`, {}));
  }, [uid]);

  const saveReaderPage = useCallback(
    (contentKey, pageIdx) => {
      setReaderPages((prev) => {
        const next = { ...prev, [contentKey]: pageIdx };
        LS.set(`rp_${uid}`, next);
        return next;
      });
    },
    [uid],
  );

  const searchInputRef = useRef(null);
  const mainScrollRef = useRef(null);

  const openSecretSienna = useCallback(() => {
    setSecretSiennaUnlocked(true);
    setPage("secret_sienna");
    setSearch("");
    setShowSearch(false);
    setSidebarOpen(false);
    searchInputRef.current?.blur();
  }, [setPage]);

  useEffect(() => {
    closeTransientOverlays();

    const scroller = mainScrollRef.current;
    if (scroller && typeof scroller.scrollTo === "function") {
      scroller.scrollTo({ top: 0, behavior: "auto" });
      return;
    }

    window.scrollTo({ top: 0, behavior: "auto" });
  }, [closeTransientOverlays, page, screen]);

  useEffect(() => {
    if (page === "secret_sienna" || !secretSiennaUnlocked) return;
    setSecretSiennaUnlocked(false);
  }, [page, secretSiennaUnlocked]);

  useEffect(() => {
    if (page === "reading" || !readerModeActive) return;
    setReaderModeActive(false);
  }, [page, readerModeActive]);

  const updateUiPrefs = useCallback((patch) => {
    setUiPrefs((prev) => ({ ...prev, ...patch }));
  }, []);

  useEffect(() => {
    setUiPrefs({
      ...PREF_DEFAULTS,
      ...LS.get(`prefs_${uid}`, PREF_DEFAULTS),
    });
  }, [uid]);

  useEffect(() => {
    LS.set(`prefs_${uid}`, uiPrefs);
  }, [uid, uiPrefs]);

  useEffect(() => {
    const root = document.documentElement;
    const reduce = !!uiPrefs.reduceMotion;
    const intensity = Math.max(
      0,
      Math.min(100, Number(uiPrefs.pressIntensity) || 0),
    );
    const sidebarSpeed = Math.max(
      0,
      Math.min(100, Number(uiPrefs.sidebarSpeed) || 0),
    );
    const textScale = Math.max(
      88,
      Math.min(122, Number(uiPrefs.textScale) || 100),
    );
    const density =
      uiPrefs.readingDensity === "compact"
        ? "compact"
        : uiPrefs.readingDensity === "airy"
          ? "airy"
          : "comfortable";
    const pressScale = reduce ? 1 : 0.985 - intensity * 0.00035;
    const hoverLift = reduce ? 0 : 0.5 + intensity * 0.02;
    const sidebarDur = reduce ? 0 : Math.round(340 + sidebarSpeed * 3);
    const sidebarFade = reduce ? 0 : Math.max(220, sidebarDur - 90);
    root.classList.toggle("life-reduce-motion", reduce);
    root.classList.toggle("life-instant-buttons", !!uiPrefs.instantButtons);
    root.classList.toggle("life-high-contrast", !!uiPrefs.highContrast);
    root.classList.toggle("life-data-saver", !!uiPrefs.dataSaver);
    root.classList.toggle("life-density-compact", density === "compact");
    root.classList.toggle("life-density-airy", density === "airy");
    root.style.setProperty("--life-press-scale", String(pressScale));
    root.style.setProperty("--life-hover-lift", `${hoverLift.toFixed(2)}px`);
    root.style.setProperty("--life-sidebar-duration", `${sidebarDur}ms`);
    root.style.setProperty("--life-sidebar-fade-duration", `${sidebarFade}ms`);
    root.style.setProperty("--life-text-scale", String(textScale / 100));
  }, [
    uiPrefs.dataSaver,
    uiPrefs.highContrast,
    uiPrefs.instantButtons,
    uiPrefs.pressIntensity,
    uiPrefs.readingDensity,
    uiPrefs.reduceMotion,
    uiPrefs.sidebarSpeed,
    uiPrefs.textScale,
  ]);

  const setProfile = (v) => {
    const next = typeof v === "function" ? v(profile) : v;
    if (userIdForData) cloud.setTsdProfile(next);
    else {
      setLocalProfileRaw(next);
      LS.set(`tsd_${uid}`, next);
    }
  };

  useEffect(() => {
    migratedRef.current = false;
  }, [userIdForData]);

  /* One-time copy from localStorage into Firebase when the cloud row is empty.
     useUserData returns a new object each render; we depend on fields, not `cloud`. */
  useEffect(() => {
    if (!userIdForData || cloud.loading || migratedRef.current) return;
    const hasCloud =
      (cloud.bookmarks?.length ?? 0) > 0 ||
      Object.keys(cloud.notes || {}).some((k) => cloud.notes[k]) ||
      (cloud.readKeys?.length ?? 0) > 0 ||
      (cloud.highlights?.length ?? 0) > 0 ||
      cloud.tsdProfile != null ||
      cloud.momentumState != null ||
      (cloud.toolsTodos?.length ?? 0) > 0 ||
      cloud.toolsSession != null;
    if (hasCloud) {
      migratedRef.current = true;
      return;
    }
    const email = user?.email || "_";
    const lb = LS.get(`bk_${email}`, []);
    const ln = LS.get(`nt_${email}`, {});
    const lr = LS.get(`rd_${email}`, []);
    const lp = LS.get(`tsd_${email}`, null);
    const lt = LS.get(`tools_todos_${email}`, []);
    const ls = LS.get(`tools_lockin_${email}`, null);
    const hasLocal =
      lb.length > 0 ||
      Object.keys(ln).some((k) => ln[k]) ||
      lr.length > 0 ||
      lp != null ||
      lt.length > 0 ||
      ls != null;
    migratedRef.current = true;
    if (hasLocal) {
      cloud.replaceAllData({
        bookmarks: lb,
        notes: ln,
        read_keys: lr,
        highlights: cloud.highlights,
        tsd_profile: lp,
        momentum_state: cloud.momentumState,
        tools_todos: lt,
        tools_session: ls,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- see block comment above
  }, [
    userIdForData,
    cloud.loading,
    cloud.bookmarks,
    cloud.notes,
    cloud.readKeys,
    cloud.tsdProfile,
    user?.email,
    cloud.highlights,
    cloud.momentumState,
    cloud.toolsSession,
    cloud.toolsTodos,
    cloud.replaceAllData,
  ]);

  // localStorage-only: reload when switching accounts / guest key
  useEffect(() => {
    if (userIdForData) return;
    if (prevUidRef.current !== uid) {
      prevUidRef.current = uid;
      setLocalBookmarksRaw(LS.get(`bk_${uid}`, []));
      setLocalNotesRaw(LS.get(`nt_${uid}`, {}));
      setLocalReadKeysRaw(LS.get(`rd_${uid}`, []));
      setLocalProfileRaw(LS.get(`tsd_${uid}`, null));
      setLocalToolsTodosRaw(LS.get(`tools_todos_${uid}`, []));
      setLocalToolsSessionRaw(LS.get(`tools_lockin_${uid}`, null));
    }
  }, [uid, userIdForData]);

  const doGoogleSignIn = async () => {
    if (authLoading) return;
    play("tap");
    setSiSocialErr("");
    if (!isFirebaseConfigured || !auth) {
      setSiSocialErr(
        "Firebase auth is not configured yet. Add the NEXT_PUBLIC_FIREBASE_* values to your deployment settings.",
      );
      play("err");
      return;
    }
    setAuthLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      setSiSocialErr(
        String(error.message || "Could not start Google sign in."),
      );
      play("err");
    } finally {
      setAuthLoading(false);
    }
  };

  const doProviderSignIn = (item) => {
    if (!item.live) {
      play("tap");
      setSiSocialErr(`${item.label} login is coming soon.`);
      return;
    }
    if (item.key === "google") {
      doGoogleSignIn();
    }
  };

  const doEmailSignIn = async () => {
    if (authLoading) return;
    setSiErr("");
    setSiSocialErr("");
    if (!isFirebaseConfigured || !auth) {
      setSiErr(
        "Firebase auth is not configured yet. Add the NEXT_PUBLIC_FIREBASE_* values to your deployment settings.",
      );
      play("err");
      return;
    }
    if (!siEmail.trim()) {
      setSiErr("Please enter your email.");
      play("err");
      return;
    }
    if (!siPass) {
      setSiErr("Please enter your password.");
      play("err");
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
      play("err");
    } finally {
      setAuthLoading(false);
    }
  };

  const doForgotPassword = async () => {
    if (authLoading) return;
    setFpErr("");
    setFpMsg("");
    if (!isFirebaseConfigured || !auth) {
      setFpErr(
        "Firebase auth is not configured yet. Add the NEXT_PUBLIC_FIREBASE_* values to your deployment settings.",
      );
      play("err");
      return;
    }
    if (!fpEmail.trim() || !fpEmail.includes("@")) {
      setFpErr("Please enter a valid email.");
      play("err");
      return;
    }
    setAuthLoading(true);
    try {
      await sendPasswordResetEmail(auth, fpEmail.toLowerCase().trim());
      setFpMsg("Password reset email sent. Check your inbox.");
      play("ok");
    } catch (error) {
      setFpErr(String(error.message || "Could not send reset email."));
      play("err");
    } finally {
      setAuthLoading(false);
    }
  };

  const doResetPassword = async () => {
    setRpErr("");
    setRpErr("Use the reset link from your email to choose a new password.");
    play("err");
  };

  const doRegister = async () => {
    if (authLoading) return;
    setRErr({});
    if (!isFirebaseConfigured || !auth) {
      setRErr({
        email:
          "Firebase auth is not configured yet. Add the NEXT_PUBLIC_FIREBASE_* values to your deployment settings.",
      });
      play("err");
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
      play("err");
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
      play("ok");
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
      play("err");
    } finally {
      setAuthLoading(false);
    }
  };

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

  const handleSelect = (key, node) => {
    const alreadyRead = readKeys.includes(key);
    setSelKey(key);
    setSelContent(node.content);
    setSelNode(node);
    setTab("content");
    setNoteInput(notes[key] || "");
    setNoteSaved(false);
    setSidebarOpen(false);
    setPage("reading");
    setSearch("");
    setShowSearch(false);
    setResumeTopic(key);
    if (!alreadyRead) setReadKeys([...readKeys, key]);
    recordReadingDay();
    trackMomentumEvent("read", {
      source: "reader",
      points: alreadyRead ? 3 : 7,
      contentKey: key,
      topicKey: key,
      meta: {
        firstVisit: !alreadyRead,
        label: node?.label,
      },
    });
  };

  const handleSelectRef = useRef(handleSelect);
  handleSelectRef.current = handleSelect;

  useEffect(() => {
    if (screen !== "app" || !user) return;
    const m = /^#read=([^&]+)/.exec(window.location.hash);
    if (!m?.[1] || !MAP[m[1]]) return;
    const pack = MAP[m[1]];
    handleSelectRef.current(pack.key, pack.node);
    window.history.replaceState(
      null,
      "",
      window.location.pathname + window.location.search,
    );
  }, [screen, user]);

  useEffect(() => {
    if (screen !== "app") return;
    const onKey = (e) => {
      const el = e.target;
      if (
        el instanceof HTMLInputElement ||
        el instanceof HTMLTextAreaElement ||
        el instanceof HTMLSelectElement
      )
        return;
      if (el?.isContentEditable) return;
      if (
        e.key === "/" &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey &&
        !e.shiftKey
      ) {
        e.preventDefault();
        setShowSearch(true);
        searchInputRef.current?.focus();
      }
      if (e.key === "?" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setPage("help");
        setSidebarOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [screen, setPage]);

  const goHome = () => {
    play("home");
    setPage("home");
  };
  const toggleBk = () => {
    if (!selKey) return;
    play("star");
    setBookmarks(
      bookmarks.includes(selKey)
        ? bookmarks.filter((b) => b !== selKey)
        : [...bookmarks, selKey],
    );
  };
  const saveNote = () => {
    if (!selKey) return;
    const trimmed = noteInput.trim();
    play("ok");
    setNotes({ ...notes, [selKey]: noteInput });
    setNoteSaved(true);
    if (trimmed) {
      trackMomentumEvent("note", {
        source: "reader",
        points: 6,
        contentKey: selKey,
        topicKey: selKey,
        meta: { length: trimmed.length },
      });
    }
  };

  const shareNote = () => {
    if (!selKey || !noteInput.trim()) return;
    play("ok");
    try {
      sessionStorage.setItem(
        "life_postit_draft",
        JSON.stringify({
          title: selContent?.title
            ? `Notes on: ${selContent.title}`
            : "From reading",
          body: noteInput.trim(),
        }),
      );
    } catch {
      play("err");
    }
    trackMomentumEvent("community", {
      source: "reader",
      points: 6,
      contentKey: selKey,
      topicKey: selKey,
      meta: { action: "share_note" },
    });
    setPage("postit");
    setSidebarOpen(false);
    setShareToast(true);
    setTimeout(() => setShareToast(false), 3200);
  };

  useEffect(() => {
    if (screen !== "app") {
      setShowScrollTop(false);
      return;
    }

    const scroller = mainScrollRef.current;
    if (!scroller) return;

    const handleScroll = () => {
      setShowScrollTop(scroller.scrollTop > 300);
    };

    handleScroll();
    scroller.addEventListener("scroll", handleScroll, { passive: true });
    return () => scroller.removeEventListener("scroll", handleScroll);
  }, [screen]);

  useEffect(() => {
    const toOnline = () => setIsOffline(false);
    const toOffline = () => setIsOffline(true);
    window.addEventListener("online", toOnline);
    window.addEventListener("offline", toOffline);
    return () => {
      window.removeEventListener("online", toOnline);
      window.removeEventListener("offline", toOffline);
    };
  }, []);

  const scrollToTop = () => {
    const scroller = mainScrollRef.current;
    if (scroller && typeof scroller.scrollTo === "function") {
      scroller.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    play("tap");
  };

  const isBookmarked = bookmarks.includes(selKey);
  const related = (selNode?.related || []).map((k) => MAP[k]).filter(Boolean);
  const searchResults =
    search.length > 1
      ? allContent.filter(
          (i) =>
            i.node.label.toLowerCase().includes(search.toLowerCase()) ||
            i.node.content?.text?.toLowerCase().includes(search.toLowerCase()),
        )
      : [];
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "??";

  const readingStreak = getReadingStreak();
  const progressPercent =
    allContent.length > 0
      ? Math.round((readKeys.length / allContent.length) * 100)
      : 0;
  const completedNotes = Object.keys(notes).filter((key) => notes[key]).length;
  const verifyTargetEmail = verifyEmailAddress || rEmail || user?.email || "";

  // Loading splash — shown while Firebase restores the session
  if (screen === "loading")
    return (
      <div
        style={{
          height: "100%",
          background: `linear-gradient(135deg, ${C.skin} 0%, ${C.border} 50%, ${C.skin} 100%)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "-apple-system,'SF Pro Display','SF Pro Text','Helvetica Neue',Arial,sans-serif",
        }}
      >
        <style>{`
        @keyframes life-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.08); opacity: 0.9; }
        }
        @keyframes life-fade-in {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes life-shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes life-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
      `}</style>
        <div
          style={{
            textAlign: "center",
            animation: "life-fade-in 0.6s ease-out",
          }}
        >
          <div
            style={{
              width: 90,
              height: 90,
              borderRadius: "22%",
              background: `linear-gradient(145deg,${C.green},${C.greenAlt})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
              boxShadow: `0 8px 32px ${C.green}44`,
              animation:
                "life-pulse 2s ease-in-out infinite, life-bounce 3s ease-in-out infinite",
              position: "relative",
            }}
          >
            <span
              style={{
                color: "#fff",
                fontSize: 36,
                fontWeight: 800,
                letterSpacing: -1,
              }}
            >
              l.
            </span>
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "22%",
                background:
                  "linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.15) 50%, transparent 70%)",
                backgroundSize: "200% 100%",
                animation: "life-shimmer 2s linear infinite",
              }}
            />
          </div>
          <h1
            style={{
              margin: "0 0 8px",
              fontSize: 28,
              fontWeight: 700,
              color: C.ink,
              fontFamily: "-apple-system,'SF Pro Display','SF Pro Text','Helvetica Neue',Arial,sans-serif",
            }}
          >
            Life
            <span
              style={{
                display: "inline-block",
                width: "0.2em",
                height: "0.2em",
                background: C.ink,
                borderRadius: "50%",
                marginLeft: "0.02em",
                verticalAlign: "0.08em",
              }}
            />
          </h1>
          <p
            style={{
              color: C.muted,
              fontSize: 13,
              fontStyle: "italic",
              margin: 0,
            }}
          >
            Loading your journey…
          </p>
          <div
            style={{
              marginTop: 28,
              display: "flex",
              gap: 8,
              justifyContent: "center",
            }}
          >
            {[0, 0.15, 0.3].map((delay, i) => (
              <span
                key={i}
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: i === 1 ? C.green : `rgba(61,90,76,0.4)`,
                  animation: `life-bounce 1.4s ease-in-out ${delay}s infinite`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    );

  // Tailor screens
  const completeOnboarding = () => {
    if (user?.id) {
      LS.set(`onboarded_${user.id}`, true);
    }
    play("ok");
    setScreen("app");
  };

  // P1 Extra: Privacy Policy screen
  if (screen === "privacy_policy")
    return (
      <div
        data-page-tag="#privacy_policy_page"
        style={{
          height: "100%",
          background: "#0a0a0a",
          padding: "max(40px, env(safe-area-inset-top)) 20px 48px",
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <button
            onClick={() => {
              play("back");
              setScreen("landing");
            }}
            className="ios-back"
            style={{
              background: "none",
              border: "none",
              color: "#50c878",
              fontSize: 16,
              fontWeight: 400,
              cursor: "pointer",
              marginBottom: 20,
              display: "flex",
              alignItems: "center",
              gap: 4,
              padding: "8px 0",
              WebkitTapHighlightColor: "transparent",
              letterSpacing: "-0.01em",
            }}
          >
            <svg
              width="11" height="20"
              viewBox="0 0 12 22"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="10 2 2 11 10 20" />
            </svg>
            Back
          </button>
          <p style={{
            margin: "0 0 6px",
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            color: "#50c878",
          }}>Legal</p>
          <h1
            style={{
              fontSize: 34,
              fontWeight: 700,
              color: "#ededed",
              letterSpacing: "-0.035em",
              lineHeight: 1.05,
              margin: "0 0 24px",
            }}
          >
            Privacy Policy
          </h1>
          {[
            [
              "Information We Collect",
              "We collect information you provide when creating an account (name, email). We also collect usage data to improve your experience, including reading progress and preferences.",
            ],
            [
              "How We Use Your Data",
              "Your data is used to personalise your experience, track progress, and improve the platform. We never sell your personal information to third parties.",
            ],
            [
              "Data Storage",
              "Your data is stored securely using Firebase infrastructure. Reading progress and preferences are stored locally and synced to the cloud when you are signed in.",
            ],
            [
              "Cookies & Local Storage",
              "We use local storage to save your preferences, reading progress, and session state. This allows the app to remember your settings between visits.",
            ],
            [
              "Your Rights",
              "You can request deletion of your account and all associated data at any time by contacting us. You can also reset your progress and preferences from the Settings page.",
            ],
            [
              "Contact",
              `For privacy-related inquiries, reach out through the app's Help section or contact us at ${SUPPORT_EMAIL}.`,
            ],
          ].map(([title, body]) => (
            <div
              key={title}
              style={{
                background: C.white,
                border: `1px solid ${C.border}`,
                borderRadius: 14,
                padding: "20px 22px",
                marginBottom: 12,
              }}
            >
              <h3
                style={{
                  margin: "0 0 8px",
                  fontSize: 16,
                  fontWeight: 700,
                  color: C.ink,
                }}
              >
                {title}
              </h3>
              <p
                style={{
                  margin: 0,
                  fontSize: 14,
                  color: C.mid,
                  lineHeight: 1.7,
                }}
              >
                {body}
              </p>
            </div>
          ))}
          <p
            style={{
              color: C.muted,
              fontSize: 11,
              fontStyle: "italic",
              marginTop: 20,
              textAlign: "center",
            }}
          >
            Last updated: 2026
          </p>
        </div>
      </div>
    );

  // P1 Extra: Terms & Conditions screen
  if (screen === "terms_conditions")
    return (
      <div
        data-page-tag="#terms_condition_page"
        style={{
          height: "100%",
          background: "#0a0a0a",
          padding: "max(40px, env(safe-area-inset-top)) 20px 48px",
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <button
            onClick={() => {
              play("back");
              setScreen("landing");
            }}
            className="ios-back"
            style={{
              background: "none",
              border: "none",
              color: "#50c878",
              fontSize: 16,
              fontWeight: 400,
              cursor: "pointer",
              marginBottom: 20,
              display: "flex",
              alignItems: "center",
              gap: 4,
              padding: "8px 0",
              WebkitTapHighlightColor: "transparent",
              letterSpacing: "-0.01em",
            }}
          >
            <svg width="11" height="20" viewBox="0 0 12 22" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="10 2 2 11 10 20" />
            </svg>
            Back
          </button>
          <p style={{ margin: "0 0 6px", fontSize: 13, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "#50c878" }}>Legal</p>
          <h1
            style={{
              fontSize: 34,
              fontWeight: 700,
              color: "#ededed",
              letterSpacing: "-0.035em",
              lineHeight: 1.05,
              margin: "0 0 24px",
            }}
          >
            Terms & Conditions
          </h1>
          {[
            [
              "Acceptance of Terms",
              "By using Life., you agree to these terms. If you do not agree, please discontinue use of the platform immediately.",
            ],
            [
              "User Accounts",
              "You are responsible for maintaining the confidentiality of your account. You must provide accurate information during registration.",
            ],
            [
              "Content Usage",
              "All content within Life. is for educational purposes. You may not redistribute, copy, or commercially exploit any content without written permission.",
            ],
            [
              "Community Guidelines",
              "Users must be respectful in all interactions, including Post-It and Networking features. Harassment, spam, and hate speech will result in account suspension.",
            ],
            [
              "Premium Membership",
              "Premium features require an active subscription. Cancellation stops future charges but does not refund past payments.",
            ],
            [
              "Limitation of Liability",
              "Life. provides educational content as-is. We are not responsible for financial decisions made based on the content provided.",
            ],
            [
              "Changes to Terms",
              "We reserve the right to update these terms at any time. Continued use of the platform constitutes acceptance of updated terms.",
            ],
          ].map(([title, body]) => (
            <div
              key={title}
              style={{
                background: C.white,
                border: `1px solid ${C.border}`,
                borderRadius: 14,
                padding: "20px 22px",
                marginBottom: 12,
              }}
            >
              <h3
                style={{
                  margin: "0 0 8px",
                  fontSize: 16,
                  fontWeight: 700,
                  color: C.ink,
                }}
              >
                {title}
              </h3>
              <p
                style={{
                  margin: 0,
                  fontSize: 14,
                  color: C.mid,
                  lineHeight: 1.7,
                }}
              >
                {body}
              </p>
            </div>
          ))}
          <p
            style={{
              color: C.muted,
              fontSize: 11,
              fontStyle: "italic",
              marginTop: 20,
              textAlign: "center",
            }}
          >
            Last updated: 2026
          </p>
        </div>
      </div>
    );

  if (screen === "verify_email")
    return (
      <VerifyEmailPage
        C={C}
        play={play}
        setScreen={setScreen}
        verifyTargetEmail={verifyTargetEmail}
        onResend={() =>
          auth.currentUser
            ? sendEmailVerification(auth.currentUser)
            : Promise.reject(new Error("No signed-in user available."))
        }
        systemNotice={{
          tone: "info",
          title: "Verify then return to the app",
          body: "After opening the link from your inbox, come back here and sign in again if needed.",
        }}
      />
    );

  if (screen === "reset_password")
    return (
      <ResetPasswordPage
        C={t}
        S={S}
        play={play}
        setScreen={setScreen}
        rpPass={rpPass}
        setRpPass={setRpPass}
        rpPass2={rpPass2}
        setRpPass2={setRpPass2}
        rpShowPass={rpShowPass}
        setRpShowPass={setRpShowPass}
        rpShowPass2={rpShowPass2}
        setRpShowPass2={setRpShowPass2}
        rpErr={rpErr}
        setRpErr={setRpErr}
        authLoading={authLoading}
        doResetPassword={doResetPassword}
        passwordRecoveryRef={passwordRecoveryRef}
        systemNotice={
          !isFirebaseConfigured
            ? {
                tone: "warning",
                title: "Cloud auth is not configured yet",
                body: "Set the NEXT_PUBLIC_FIREBASE_* values to enable password recovery and account access.",
              }
            : null
        }
      />
    );

  if (screen === "theme_picker")
    return (
      <ThemePickerPage
        C={C}
        S={S}
        play={play}
        themeMode={themeMode}
        setThemeMode={setThemeMode}
        dark={dark}
        t={t}
        onContinue={() => setScreen("tailor_intro")}
      />
    );

  if (screen === "tailor_intro")
    return (
      <Suspense fallback={<RouteFallback />}>
        <TailorIntro
          t={t}
          userName={user?.name}
          onExplore={() => {
            play("tap");
            completeOnboarding();
          }}
          onTailor={() => {
            play("ok");
            setScreen("tailor_qs");
          }}
        />
      </Suspense>
    );
  if (screen === "tailor_qs")
    return (
      <Suspense fallback={<RouteFallback />}>
        <TailorQuestions
          t={t}
          onComplete={(prof) => {
            setProfile(prof);
            trackMomentumEvent("profile", {
              source: "profile",
              points: 10,
              meta: { action: "tailor_complete", profile: prof || null },
            });
            play("ok");
            setScreen("tailor_result");
          }}
          onBack={() => {
            play("back");
            setScreen("tailor_intro");
          }}
        />
      </Suspense>
    );
  if (screen === "tailor_result")
    return (
      <Suspense fallback={<RouteFallback />}>
        <TailorResult
          t={t}
          profile={profile}
          userName={user?.name}
          onContinue={() => {
            completeOnboarding();
          }}
        />
      </Suspense>
    );

  // Landing
  if (screen === "landing")
    return (
      <LandingPage
        Ic={Ic}
        play={play}
        setScreen={setScreen}
        AUTH_PROVIDERS={AUTH_PROVIDERS}
        doProviderSignIn={doProviderSignIn}
        siSocialErr={siSocialErr}
        systemNotice={
          !isFirebaseConfigured
            ? {
                tone: "warning",
                title: "Cloud auth and sync are offline",
                body: "This build is missing Firebase config, so sign-in, registration, and community features are disabled until the NEXT_PUBLIC_FIREBASE_* values are set.",
              }
            : null
        }
      />
    );

  // Sign In
  if (screen === "signin")
    return (
      <SignInPage
        C={C}
        play={play}
        setScreen={setScreen}
        siEmail={siEmail}
        setSiEmail={setSiEmail}
        siPass={siPass}
        setSiPass={setSiPass}
        siShowPass={siShowPass}
        setSiShowPass={setSiShowPass}
        siErr={siErr}
        setSiErr={setSiErr}
        authLoading={authLoading}
        doEmailSignIn={doEmailSignIn}
        forgotMode={forgotMode}
        setForgotMode={setForgotMode}
        fpEmail={fpEmail}
        setFpEmail={setFpEmail}
        fpErr={fpErr}
        setFpErr={setFpErr}
        fpMsg={fpMsg}
        setFpMsg={setFpMsg}
        doForgotPassword={doForgotPassword}
        setSiSocialErr={setSiSocialErr}
        systemNotice={
          !isFirebaseConfigured
            ? {
                tone: "warning",
                title: "Cloud auth is not configured yet",
                body: "Set the NEXT_PUBLIC_FIREBASE_* values to enable sign-in, password reset, and synced account data.",
              }
            : null
        }
      />
    );

  // Register
  if (screen === "register")
    return (
      <RegisterPage
        C={C}
        play={play}
        setScreen={setScreen}
        rName={rName}
        setRName={setRName}
        rEmail={rEmail}
        setREmail={setREmail}
        rDob={rDob}
        setRDob={setRDob}
        rPass={rPass}
        setRPass={setRPass}
        rPass2={rPass2}
        setRPass2={setRPass2}
        rShowPass={rShowPass}
        setRShowPass={setRShowPass}
        rShowPass2={rShowPass2}
        setRShowPass2={setRShowPass2}
        rErr={rErr}
        setRErr={setRErr}
        authLoading={authLoading}
        doRegister={doRegister}
        setSiEmail={setSiEmail}
        systemNotice={
          !isFirebaseConfigured
            ? {
                tone: "warning",
                title: "Account creation is unavailable",
                body: "Set the NEXT_PUBLIC_FIREBASE_* values to enable registration, email verification, and cloud sync.",
              }
            : null
        }
      />
    );

  // Keep the layout primitives straightforward because this will likely be ported into a native app shell later.
  return (
    <div
      data-page-tag="#dashboard_home"
      style={{
        height: "100%",
        background: t.skin,
        display: "flex",
        flexDirection: "column",
        fontFamily: "-apple-system,'SF Pro Display','SF Pro Text','Helvetica Neue',Arial,sans-serif",
        color: t.ink,
        overflow: "hidden",
      }}
    >
      {shareToast && (
        <div
          role="status"
          className="life-toast"
          style={{
            position: "fixed",
            top: "calc(70px + var(--safe-top, 0px))",
            left: "50%",
            transform: "translateX(-50%)",
            background: t.ink,
            color: t.skin,
            padding: "10px 22px",
            borderRadius: 20,
            fontSize: 13,
            zIndex: 90,
            boxShadow: "0 4px 14px rgba(0,0,0,0.2)",
            maxWidth: "min(92vw, 340px)",
            textAlign: "center",
            lineHeight: 1.45,
          }}
        >
          Opening Post-It — review and publish your draft.
        </div>
      )}

      {/* P9c: Notification dropdown */}
      {showNotif && (
        <>
          <button
            type="button"
            className="life-overlay-dismiss"
            aria-label="Close notifications"
            onPointerDown={() => setShowNotif(false)}
            onClick={() => setShowNotif(false)}
            style={{ position: "fixed", inset: 0, zIndex: 69 }}
          />
          <div
            className="life-notif-dropdown"
            style={{
              position: "fixed",
              top: `calc(56px + var(--safe-top, 0px))`,
              left: isNarrowViewport ? 10 : "auto",
              right: isNarrowViewport
                ? 10
                : "max(10px, var(--safe-right, 0px))",
              zIndex: 70,
              background: t.white,
              border: `1px solid ${alpha(t.border, dark ? 0.6 : 0.9)}`,
              borderRadius: isNarrowViewport ? 22 : 18,
              boxShadow: `0 12px 36px ${alpha(t.ink, dark ? 0.34 : 0.18)}`,
              width: isNarrowViewport ? "auto" : 340,
              maxHeight:
                "min(480px, calc(100dvh - (72px + var(--safe-top, 0px) + var(--safe-bottom, 0px))))",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              overscrollBehavior: "contain",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 16px 13px",
                borderBottom: `1px solid ${alpha(t.border, 0.75)}`,
                flexShrink: 0,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: t.ink,
                    letterSpacing: -0.2,
                  }}
                >
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <span
                    style={{
                      background: t.green,
                      color: t.skin,
                      fontSize: 10,
                      fontWeight: 700,
                      borderRadius: 20,
                      padding: "1px 6px",
                      lineHeight: "16px",
                      fontFamily:
                        "-apple-system,BlinkMacSystemFont,system-ui,sans-serif",
                    }}
                  >
                    {unreadCount}
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  style={{
                    background: "none",
                    border: "none",
                    color: t.green,
                    fontSize: 12,
                    fontWeight: 500,
                    cursor: "pointer",
                    padding: "4px 0",
                    fontFamily:
                      "-apple-system,BlinkMacSystemFont,system-ui,sans-serif",
                  }}
                >
                  Mark all read
                </button>
              )}
            </div>

            {/* Scrollable list */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                WebkitOverflowScrolling: "touch",
                overscrollBehavior: "contain",
              }}
            >
              {notifications.length === 0 ? (
                <div
                  style={{
                    padding: "40px 24px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <span style={{ fontSize: 32 }}>🔔</span>
                  <p
                    style={{
                      margin: 0,
                      color: alpha(t.ink, 0.48),
                      fontSize: 13,
                      textAlign: "center",
                    }}
                  >
                    You&apos;re all caught up!
                  </p>
                </div>
              ) : (
                notifications.map((n) => (
                  <SwipeableNotification
                    key={n.id}
                    n={n}
                    theme={t}
                    dark={dark}
                    onTap={() => handleNotifTap(n)}
                    onDelete={() => deleteNotification(n.id)}
                  />
                ))
              )}
            </div>

            {/* Footer hint */}
            {notifications.length > 0 && (
              <div
                style={{
                  padding:
                    "9px 16px calc(9px + max(var(--safe-bottom, 0px), 2px))",
                  borderTop: `1px solid ${alpha(t.border, 0.75)}`,
                  flexShrink: 0,
                  textAlign: "center",
                }}
              >
                <span
                  style={{
                    fontSize: 10.5,
                    color: alpha(t.ink, 0.4),
                    fontFamily:
                      "-apple-system,BlinkMacSystemFont,system-ui,sans-serif",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 5,
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      animation: "life-swipe-hint 1.6s ease-in-out infinite",
                    }}
                  >
                    ←
                  </span>
                  Swipe left to dismiss
                </span>
              </div>
            )}
          </div>
        </>
      )}

      {/* TOP BAR */}
      <div
        className="life-topbar"
        style={{
          background: dark ? "rgba(30,30,30,0.96)" : "rgba(255,255,255,0.92)",
          borderBottom: `1px solid ${t.border}`,
          display: "flex",
          alignItems: "center",
          gap: 10,
          position: "sticky",
          top: 0,
          zIndex: 50,
          paddingTop: "var(--safe-top, 0px)",
          backdropFilter: "saturate(1.4) blur(16px)",
          WebkitBackdropFilter: "saturate(1.4) blur(16px)",
          boxShadow: "0 1px 0 rgba(0,0,0,0.04), 0 8px 24px rgba(61,90,76,0.06)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems:
              "center" /* vertically centers hamburger with logo + search */,
            gap: 10,
            flexShrink: 0,
            height: "100%",
          }}
        >
          <button
            onClick={() => {
              play("tap");
              setSidebarOpen(!sidebarOpen);
            }}
            aria-label="Toggle sidebar"
            style={{
              background: "transparent",
              border: "none",
              outline: "none",
              boxShadow: "none",
              appearance: "none",
              WebkitTapHighlightColor: "transparent",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              justifyContent:
                "center" /* aligns hamburger dashes with siblings */,
              alignItems: "flex-start",
              gap: 6,
              /* Match height of logo/search so it's perfectly centered */
              width: 40,
              height: 40,
              padding: "4px 4px -0.5",
              boxSizing: "border-box",
              borderRadius: 0,
              transition: "opacity 0.2s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            {[22, 14, 22].map((w, i) => (
              <span
                key={i}
                style={{
                  display: "block",
                  width: w,
                  height: 2,
                  background: t.mid,
                  borderRadius: 2,
                  transition: "all 0.2s ease",
                }}
              />
            ))}
          </button>
          <button
            onClick={goHome}
            className="logo-btn"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              marginLeft: 0,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "transparent",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "transform 0.2s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "scale(1.08)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
            >
              <span
                style={{
                  color: "#fff",
                  fontSize: 16,
                  fontWeight: 800,
                  fontFamily: "-apple-system,'SF Pro Display','SF Pro Text','Helvetica Neue',Arial,sans-serif",
                  letterSpacing: "-0.5px",
                  lineHeight: 1,
                }}
              >
                l.
              </span>
            </div>
          </button>
        </div>
        <div style={{ flex: 1, margin: "0 10px", position: "relative" }}>
          <svg
            className="life-search-icon"
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            style={{
              position: "absolute",
              left: 10,
              top: "50%",
              transform: "translateY(-50%)",
              pointerEvents: "none",
              zIndex: 2,
            }}
          >
            <circle cx="6" cy="6" r="4.5" stroke={t.muted} strokeWidth="1.5" />
            <line
              x1="9.5"
              y1="9.5"
              x2="13"
              y2="13"
              stroke={t.muted}
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <input
            ref={searchInputRef}
            type="text"
            value={search}
            onChange={(e) => {
              const v = e.target.value;
              if (v === SECRET_SIENNA_SEARCH_CODE) {
                openSecretSienna();
                return;
              }
              setSearch(v);
              setShowSearch(true);
            }}
            onFocus={() => setShowSearch(true)}
            placeholder="Search topics…"
            style={{
              width: "100%",
              background: t.light,
              border: `1px solid ${t.border}`,
              borderRadius: 20,
              padding: "9px 34px 9px 34px",
              color: t.ink,
              fontSize: 13,
              outline: "none",
              fontFamily: "-apple-system,'SF Pro Display','SF Pro Text','Helvetica Neue',Arial,sans-serif",
              boxSizing: "border-box",
              transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
            onMouseEnter={(e) => {
              if (!search)
                e.currentTarget.style.background = dark ? "#333" : "#e8e4dc";
            }}
            onMouseLeave={(e) => {
              if (!search) e.currentTarget.style.background = t.light;
            }}
          />
          {search && (
            <button
              className="life-search-clear"
              onClick={() => {
                setSearch("");
                setShowSearch(false);
              }}
              style={{
                position: "absolute",
                right: 12,
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: t.muted,
                fontSize: 18,
                width: 36,
                height: 36,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "50%",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = t.light;
                e.currentTarget.style.color = t.ink;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = t.muted;
              }}
            >
              ×
            </button>
          )}
        </div>
        {/* P11: Dark Mode Toggle — hidden on mobile (in bottom nav More tab) */}
        <button
          className="life-topbar-dark"
          onClick={() => {
            play("tap");
            toggleTheme();
          }}
          title={dark ? "Switch to light mode" : "Switch to dark mode"}
          aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "none",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 16 }}>{dark ? "☀️" : "🌙"}</span>
        </button>
        {/* P9c: Notification Bell — hidden on mobile (shown in bottom nav) */}
        <button
          className="life-topbar-bell"
          onClick={() => {
            play("tap");
            setShowNotif(!showNotif);
          }}
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "none",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            position: "relative",
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke={t.mid}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 01-3.46 0" />
          </svg>
          {unreadCount > 0 && (
            <span
              style={{
                position: "absolute",
                top: 1,
                right: 1,
                minWidth: 16,
                height: 16,
                borderRadius: 8,
                background: "#d63031",
                color: "#fff",
                fontSize: 9,
                fontWeight: 800,
                display: "grid",
                placeItems: "center",
                lineHeight: 1,
                padding: "0 3px",
                fontFamily:
                  "-apple-system, BlinkMacSystemFont, system-ui, sans-serif",
                boxSizing: "border-box",
                border: `1.5px solid ${dark ? "#1a1a1a" : "#fff"}`,
                letterSpacing: 0,
              }}
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
        <button
          className="profile-btn"
          onClick={() => {
            play("tap");
            setPage("profile");
          }}
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: t.white,
            border: `1.5px solid ${t.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = t.green;
            e.currentTarget.style.boxShadow =
              "0 2px 8px rgba(255,255,255,0.12)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = t.border;
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <span style={{ color: t.ink, fontSize: 11, fontWeight: 700 }}>
            {initials.slice(0, 2)}
          </span>
        </button>
      </div>

      {showSearch && search.length > 1 && (
        <div
          className="life-search-dropdown"
          style={{
            position: "fixed",
            left: 0,
            right: 0,
            zIndex: 70,
            background: dark ? "rgba(30,30,30,0.98)" : "rgba(255,255,255,0.98)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            borderBottom: `1px solid ${t.border}`,
            maxHeight: 320,
            overflowY: "auto",
            boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
            animation: "life-fade-in 0.25s ease",
          }}
        >
          {searchResults.length === 0 ? (
            <p
              style={{
                color: t.muted,
                padding: "22px 28px",
                margin: 0,
                fontSize: 14,
                fontStyle: "italic",
              }}
            >
              No results.
            </p>
          ) : (
            searchResults.map((item) => (
              <button
                key={item.key}
                onClick={() => {
                  handleSelect(item.key, item.node);
                  setShowSearch(false);
                  setSearch("");
                }}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  background: "transparent",
                  border: "none",
                  borderBottom: `1px solid ${t.light}`,
                  padding: "14px 24px",
                  cursor: "pointer",
                  fontFamily: "-apple-system,'SF Pro Display','SF Pro Text','Helvetica Neue',Arial,sans-serif",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = t.light)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <div style={{ fontSize: 15, fontWeight: 600, color: t.ink }}>
                  {item.node.icon && (
                    <span style={{ marginRight: 8 }}>{item.node.icon}</span>
                  )}
                  {item.node.label}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: t.muted,
                    marginTop: 2,
                    fontStyle: "italic",
                  }}
                >
                  {item.path.join(" — ")}
                </div>
              </button>
            ))
          )}
        </div>
      )}

      <div
        className="life-app-body"
        style={{
          display: "flex",
          flex: 1,
          position: "relative",
          overflow: "hidden",
          minHeight: 0,
        }}
      >
        {sidebarOpen && (
          <button
            type="button"
            className="life-sidebar-backdrop"
            aria-label="Close sidebar"
            onPointerDown={() => {
              play("back");
              setSidebarOpen(false);
            }}
            onClick={() => {
              play("back");
              setSidebarOpen(false);
            }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(20,20,20,0.22)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
              zIndex: 30,
            }}
          />
        )}

        {/* SIDEBAR — 3-part flex layout: header / scrollable body / sign out */}
        <div
          className="life-sidebar"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            bottom: 0,
            background: t.white,
            borderRight: `1px solid ${t.border}`,
            boxShadow: sidebarOpen ? "4px 0 24px rgba(0,0,0,0.08)" : "none",
            zIndex: 40,
            transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
            transition:
              "transform 0.28s cubic-bezier(0.4,0,0.2,1), box-shadow 0.3s ease",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* HEADER — pinned to top, never scrolls */}
          <div
            className="life-sidebar-header"
            style={{
              padding: isNarrowViewport
                ? "calc(10px + var(--safe-top, 0px)) 12px 10px"
                : "12px 14px 10px",
              borderBottom: `1px solid ${t.light}`,
              display: "flex",
              flexDirection: "column",
              gap: 8,
              background: t.white,
              flexShrink: 0,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, ${t.green}, ${t.greenAlt})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  boxShadow: "0 2px 8px rgba(255,255,255,0.12)",
                }}
              >
                <span style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>
                  {initials.slice(0, 2)}
                </span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    margin: 0,
                    fontSize: 13,
                    fontWeight: 700,
                    color: t.ink,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    lineHeight: 1.2,
                  }}
                >
                  {user?.name || "User"}
                </p>
                <p
                  style={{
                    margin: "1px 0 0",
                    fontSize: 10.5,
                    color: t.muted,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    lineHeight: 1.25,
                  }}
                >
                  {user?.email || ""}
                </p>
              </div>
            </div>
            <button
              type="button"
              className="life-sidebar-progress-card"
              style={{
                background: t.light,
                border: `1px solid ${t.border}`,
                borderRadius: 10,
                padding: "8px 10px",
                cursor: "pointer",
                textAlign: "left",
              }}
              onClick={() => {
                play("tap");
                setPage("progress_dashboard");
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 5,
                }}
              >
                <span
                  style={{
                    fontSize: 8.5,
                    fontWeight: 700,
                    letterSpacing: 1.6,
                    textTransform: "uppercase",
                    color: t.muted,
                  }}
                >
                  Progress &middot; {readKeys.length}/{allContent.length}
                </span>
                <span
                  style={{ fontSize: 10.5, fontWeight: 700, color: t.green }}
                >
                  {progressPercent}%
                </span>
              </div>
              <div
                style={{
                  height: 4,
                  borderRadius: 999,
                  background: t.white,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${progressPercent}%`,
                    height: "100%",
                    borderRadius: 999,
                    background: `linear-gradient(90deg, ${t.green}, ${t.greenAlt})`,
                  }}
                />
              </div>
            </button>
            <div
              className="life-sidebar-search-wrap"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <input
                type="search"
                value={sidebarQuery}
                onChange={(e) => setSidebarQuery(e.target.value)}
                placeholder="Search topics"
                aria-label="Search sidebar topics"
                style={{
                  width: "100%",
                  minHeight: 36,
                  borderRadius: 10,
                  border: `1px solid ${t.border}`,
                  background: t.skin,
                  color: t.ink,
                  padding: "0 12px",
                  fontSize: 13,
                  fontFamily: "-apple-system,'SF Pro Display','SF Pro Text','Helvetica Neue',Arial,sans-serif",
                  boxSizing: "border-box",
                }}
              />
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                  gap: 8,
                }}
              >
                {[
                  ["Home", "home"],
                  ["Quiz", "quiz"],
                  ["Progress", "progress_dashboard"],
                ].map(([label, target]) => (
                  <button
                    key={target}
                    type="button"
                    onClick={() => {
                      play("tap");
                      setPage(target);
                    }}
                    style={{
                      minHeight: 32,
                      borderRadius: 9,
                      border: `1px solid ${page === target ? `${t.green}55` : t.border}`,
                      background: page === target ? t.greenLt : t.white,
                      color: page === target ? t.green : t.mid,
                      fontSize: 10.5,
                      fontWeight: 700,
                      letterSpacing: 0.3,
                      cursor: "pointer",
                      fontFamily: "-apple-system,'SF Pro Display','SF Pro Text','Helvetica Neue',Arial,sans-serif",
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* SCROLLABLE BODY — takes remaining flex space, scrolls internally */}
          <div
            className="life-sidebar-body"
            style={{
              flex: 1,
              minHeight: 0,
              overflowY: "auto",
              WebkitOverflowScrolling: "touch",
              overscrollBehavior: "contain",
            }}
          >
            {sidebarQuery.trim().length >= 2 && (
              <div
                style={{
                  padding: "12px 14px 8px",
                  borderBottom: `1px solid ${t.light}`,
                }}
              >
                <p
                  style={{
                    margin: "0 0 10px",
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: 2,
                    textTransform: "uppercase",
                    color: t.muted,
                  }}
                >
                  Search Results
                </p>
                {sidebarSearchResults.length === 0 ? (
                  <p
                    style={{
                      margin: 0,
                      fontSize: 12,
                      color: t.muted,
                      lineHeight: 1.6,
                    }}
                  >
                    No topics match that search yet.
                  </p>
                ) : (
                  <div style={{ display: "grid", gap: 8 }}>
                    {sidebarSearchResults.map((item) => (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => {
                          play("open");
                          handleSelect(item.key, item.node);
                        }}
                        style={{
                          width: "100%",
                          textAlign: "left",
                          border: `1px solid ${t.border}`,
                          background: t.white,
                          borderRadius: 12,
                          padding: "10px 12px",
                          cursor: "pointer",
                          fontFamily: "-apple-system,'SF Pro Display','SF Pro Text','Helvetica Neue',Arial,sans-serif",
                        }}
                      >
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: t.ink,
                          }}
                        >
                          {item.node.label}
                        </div>
                        <div
                          style={{
                            marginTop: 3,
                            fontSize: 11,
                            color: t.muted,
                            lineHeight: 1.5,
                          }}
                        >
                          {item.path.join(" / ")}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <SL
              theme={t}
              label="Home"
              icon="home"
              onClick={() => {
                play("tap");
                setPage("home");
              }}
              active={page === "home"}
            />
            <SS
              theme={t}
              playFn={play}
              label="Life"
              open={lifeOpen}
              setOpen={setLifeOpen}
              tag="#side_bar_life"
              onLabelClick={() =>
                openSidebarSectionPage("sidebar_life", setLifeOpen)
              }
              active={page === "sidebar_life"}
            >
              <SL
                theme={t}
                label="Browse Life"
                icon="compass"
                onClick={() => {
                  openSidebarSectionPage("sidebar_life", setLifeOpen);
                }}
                active={page === "sidebar_life"}
              />
            </SS>
            <SS
              theme={t}
              playFn={play}
              label="Library"
              open={libOpen}
              setOpen={setLibOpen}
              tag="#side_bar_library"
              onLabelClick={() =>
                openSidebarSectionPage("sidebar_library", setLibOpen)
              }
              active={page === "sidebar_library"}
            >
              {isNarrowViewport ? (
                <div
                  style={{
                    display: "grid",
                    gap: 8,
                    padding: "0 12px 10px",
                  }}
                >
                  {libraryCategoryCards.map(({ key, node, topicCount }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        play("tap");
                        handleFolderSelect(key, node);
                      }}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        border: `1px solid ${t.border}`,
                        background: t.white,
                        borderRadius: 14,
                        padding: "12px 12px",
                        cursor: "pointer",
                        fontFamily: "-apple-system,'SF Pro Display','SF Pro Text','Helvetica Neue',Arial,sans-serif",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 12,
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontSize: 14,
                              fontWeight: 700,
                              color: t.ink,
                            }}
                          >
                            {node.label}
                          </div>
                          <div
                            style={{
                              marginTop: 3,
                              fontSize: 11,
                              color: t.muted,
                            }}
                          >
                            {topicCount} topics
                          </div>
                        </div>
                        <div
                          style={{
                            padding: "5px 8px",
                            borderRadius: 999,
                            background: t.greenLt,
                            color: t.green,
                            fontSize: 10,
                            fontWeight: 700,
                            letterSpacing: 1,
                            textTransform: "uppercase",
                          }}
                        >
                          Browse
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                Object.entries(LIBRARY).map(([k, node]) => (
                  <TreeNode
                    key={k}
                    nodeKey={k}
                    node={node}
                    depth={0}
                    onSelect={handleSelect}
                    onFolderSelect={handleFolderSelect}
                    selectedKey={selKey}
                    defaultOpen={k === "life"}
                    play={play}
                    theme={t}
                  />
                ))
              )}
            </SS>
            <SS
              theme={t}
              playFn={play}
              label="Tools"
              open={toolsOpen}
              setOpen={setToolsOpen}
              tag="#tools"
              onLabelClick={() =>
                openSidebarSectionPage("sidebar_tools", setToolsOpen)
              }
              active={page === "sidebar_tools"}
            >
              <SL
                theme={t}
                label="Lock In"
                icon="candle"
                onClick={() => {
                  play("tap");
                  setPage("tools_lockin");
                }}
                active={page === "tools_lockin"}
              />
              <SL
                theme={t}
                label="Organized"
                icon="puzzle"
                onClick={() => {
                  play("tap");
                  setPage("tools_organized");
                }}
                active={page === "tools_organized"}
              />
              <SS
                theme={t}
                playFn={play}
                label="Learn-It"
                open={page === "learn_it" || page === "learn_it_subject"}
                setOpen={(v) => { if (v) { play("tap"); setPage("learn_it"); } }}
                tag="#learn_it"
                active={page === "learn_it" || page === "learn_it_subject"}
              >
                {["english","finance","demeanor"].map(sub => (
                  <SL
                    key={sub}
                    theme={t}
                    label={sub.charAt(0).toUpperCase() + sub.slice(1)}
                    onClick={() => {
                      play("tap");
                      setLearnItSubject(sub);
                      setPage("learn_it_subject");
                    }}
                    active={page === "learn_it_subject" && learnItSubject === sub}
                  />
                ))}
              </SS>
            </SS>
            <SS
              theme={t}
              playFn={play}
              label="Socials"
              open={socialsOpen}
              setOpen={setSocialsOpen}
              tag="#side_bar_socials"
              onLabelClick={() =>
                openSidebarSectionPage("sidebar_socials", setSocialsOpen)
              }
              active={page === "sidebar_socials"}
            >
              <SL
                theme={t}
                label="Post-It"
                icon="pin"
                onClick={() => {
                  play("tap");
                  setPage("postit");
                }}
                active={page === "postit"}
              />
              <SL
                theme={t}
                label="Networking Group"
                icon="users"
                onClick={() => {
                  play("tap");
                  setPage("discord_networking");
                }}
                active={page === "discord_networking"}
              />
              <SL
                theme={t}
                label="Investors & Inventors"
                icon="bolt"
                onClick={() => {
                  play("tap");
                  setPage("networking");
                }}
                active={page === "networking"}
              />
              <SL
                theme={t}
                label="Leaderboard"
                icon="trending"
                onClick={() => {
                  play("tap");
                  setPage("leaderboard");
                }}
                active={page === "leaderboard"}
              />
            </SS>
            <SS
              theme={t}
              playFn={play}
              label="Guided"
              open={guidedOpen}
              setOpen={setGuidedOpen}
              onLabelClick={() =>
                openSidebarSectionPage("sidebar_guided", setGuidedOpen)
              }
              active={page === "sidebar_guided"}
            >
              {GUIDED_ORDER.map((k) => {
                const node = CONTENT[k];
                if (!node) return null;
                return (
                  <SL
                    theme={t}
                    key={k}
                    label={node.label}
                    icon={node.icon}
                    onClick={() => handleSelect(k, node)}
                    active={selKey === k}
                  />
                );
              })}
            </SS>
            <SS
              theme={t}
              playFn={play}
              label="Saved"
              open={savedOpen}
              setOpen={setSavedOpen}
              tag="#side_bar_saved"
              onLabelClick={() =>
                openSidebarSectionPage("sidebar_saved", setSavedOpen)
              }
              active={page === "sidebar_saved"}
            >
              {bookmarks.length === 0 ? (
                <p
                  style={{
                    color: t.muted,
                    fontSize: 13,
                    padding: "4px 20px 12px",
                    fontStyle: "italic",
                    margin: 0,
                  }}
                >
                  Nothing saved yet.
                </p>
              ) : (
                allContent
                  .filter((c) => bookmarks.includes(c.key))
                  .map((item) => (
                    <SL
                      theme={t}
                      key={item.key}
                      label={item.node.label}
                      icon={item.node.icon}
                      onClick={() => {
                        handleSelect(item.key, item.node);
                      }}
                      active={false}
                    />
                  ))
              )}
            </SS>
            <SS
              theme={t}
              playFn={play}
              label="Experience"
              open={experienceOpen}
              setOpen={setExperienceOpen}
              tag="#side_bar_experience"
              onLabelClick={() =>
                openSidebarSectionPage("sidebar_experience", setExperienceOpen)
              }
              active={page === "sidebar_experience"}
            >
              <SL
                theme={t}
                label="Visualization"
                icon="eye"
                onClick={() => {
                  play("tap");
                  setExperienceTopic("visualization");
                  setPage("daily_growth");
                  setSidebarOpen(false);
                }}
                active={
                  page === "daily_growth" && experienceTopic === "visualization"
                }
              />
              <SL
                theme={t}
                label="Sounds"
                icon="chat"
                onClick={() => {
                  play("tap");
                  setExperienceTopic("sounds");
                  setPage("setting_preferences");
                  setSidebarOpen(false);
                }}
                active={
                  page === "setting_preferences" && experienceTopic === "sounds"
                }
              />
              <SL
                theme={t}
                label="Animations"
                icon="bolt"
                onClick={() => {
                  play("tap");
                  setExperienceTopic("animations");
                  setPage("setting_preferences");
                  setSidebarOpen(false);
                }}
                active={
                  page === "setting_preferences" &&
                  experienceTopic === "animations"
                }
              />
              <SL
                theme={t}
                label="Mobile Integration"
                icon="globe"
                onClick={() => {
                  play("tap");
                  setExperienceTopic("mobile_integration");
                  setPage("help");
                  setSidebarOpen(false);
                }}
                active={
                  page === "help" && experienceTopic === "mobile_integration"
                }
              />
            </SS>
          </div>
          {/* /life-sidebar-body */}
          <div
            data-page-tag="#side_bar_sign_out"
            className="life-sidebar-signout"
            style={{
              padding: "12px 14px calc(12px + var(--safe-bottom, 0px))",
              borderTop: `1px solid ${t.light}`,
              background: t.white,
              flexShrink: 0,
            }}
          >
            <button
              onClick={doSignOut}
              style={{
                width: "100%",
                background: t.white,
                border: `1.5px solid ${t.red}`,
                borderRadius: 10,
                padding: "10px",
                color: t.red,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "-apple-system,'SF Pro Display','SF Pro Text','Helvetica Neue',Arial,sans-serif",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = t.red;
                e.currentTarget.style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = t.white;
                e.currentTarget.style.color = t.red;
              }}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Sign Out
            </button>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div
          className="life-main-scroll"
          data-current-page={page}
          ref={mainScrollRef}
          style={{
            flex: 1,
            overflowY: "auto",
            minWidth: 0,
            minHeight: 0,
            WebkitOverflowScrolling: "touch",
          }}
        >
          <div
            key={page}
            className="life-surface-enter"
            data-current-page={page}
            style={{ minHeight: "100%" }}
          >
            {page === "home" && (
              <HomePage
                t={t}
                userName={user?.name || ""}
                onResume={(key) => {
                  const pack = MAP[key];
                  if (pack) handleSelect(pack.key, pack.node);
                }}
                onOpenQuiz={openQuizHome}
                onOpenDailyGrowth={() => {
                  play("tap");
                  setPage("daily_growth");
                }}
                onOpenMomentumHub={openMomentumHub}
                onOpenGoalSetting={() => {
                  play("tap");
                  setPage("goal_setting");
                }}
                onOpenIncomeIdeas={() => {
                  play("tap");
                  setPage("income_ideas");
                }}
                onGetStarted={() => {
                  play("tap");
                  setPage("where_to_start");
                }}
              />
            )}

            {page === "sidebar_life" && (
              <SidebarSectionPage
                sectionKey="sidebar_life"
                t={t}
                onLifeNavigate={(target) => {
                  if (target === "momentum_hub") {
                    openMomentumHub();
                    return;
                  }
                  if (target === "quiz") {
                    openQuizHome();
                    return;
                  }
                  play("tap");
                  setPage(target);
                }}
              />
            )}
            {page === "sidebar_library" && (
              <SidebarSectionPage sectionKey="sidebar_library" t={t} />
            )}
            {page === "sidebar_socials" && (
              <SidebarSectionPage sectionKey="sidebar_socials" t={t} />
            )}
            {page === "sidebar_guided" && (
              <SidebarSectionPage sectionKey="sidebar_guided" t={t} />
            )}
            {page === "sidebar_saved" && (
              <SidebarSectionPage sectionKey="sidebar_saved" t={t} />
            )}
            {page === "sidebar_experience" && (
              <SidebarSectionPage sectionKey="sidebar_experience" t={t} />
            )}

            {page === "category_hub" && categoryPageData && (
              <CategoryHubPage
                t={t}
                categoryKey={categoryPageData.key}
                categoryNode={categoryPageData.node}
                onSelect={handleSelect}
                play={play}
                readKeys={readKeys}
              />
            )}

            {page === "where_to_start" && (
              <WhereToStartPage
                t={t}
                play={play}
                setPage={setPage}
                onOpenQuiz={openQuizHome}
                onSelect={handleSelect}
              />
            )}

            {page === "income_ideas" && (
              <Suspense fallback={<RouteFallback />}>
                <IncomeIdeasPage t={t} />
              </Suspense>
            )}

            {page === "quiz" && (
              <Suspense fallback={<RouteFallback />}>
                <QuizPage
                  play={play}
                  t={t}
                  userId={user?.id || null}
                  initialTopic={quizPreset?.topic}
                  initialActivity={quizPreset?.activity}
                  readKeys={readKeys}
                  totalTopics={allContent.length}
                  onQuizComplete={(result) => {
                    trackMomentumEvent("quiz", {
                      source: "quiz",
                      points: Math.max(
                        8,
                        Math.round(Number(result?.pct || 0) / 10) + 6,
                      ),
                      topicKey: result?.topic,
                      meta: result,
                    });
                  }}
                />
              </Suspense>
            )}

            {page === "momentum_hub" && (
              <Suspense fallback={<RouteFallback />}>
                <MomentumHubPage
                  snapshot={momentumSnapshot}
                  onNavigate={(nextPage) => {
                    const target =
                      typeof nextPage === "string" ? nextPage : "home";
                    play("tap");
                    if (target === "reading") {
                      setPage(selContent ? "reading" : "where_to_start");
                    } else {
                      setPage(target);
                    }
                  }}
                  onQuickEvent={(event) => {
                    if (!event?.type) return;
                    trackMomentumEvent(event.type, event);
                  }}
                />
              </Suspense>
            )}

            {page === "help" && (
              <HelpPage
                t={t}
                supportEmail={SUPPORT_EMAIL}
                user={user}
                play={play}
                onSystemNotify={pushSystemNotification}
              />
            )}

            {page === "sidebar_tools" && (
              <SidebarSectionPage sectionKey="sidebar_tools" t={t} />
            )}

            {page === "tools_lockin" && (
              <ToolsLockInPage
                t={t}
                play={play}
                session={toolsSession}
                setSession={setToolsSession}
              />
            )}

            {page === "tools_organized" && (
              <ToolsOrganizedPage t={t} uid={uid} setPage={setPage} />
            )}

            {page === "learn_it" && (
              <LearnItPage
                t={t}
                play={play}
                onSelectSubject={(sub) => {
                  setLearnItSubject(sub);
                  setPage("learn_it_subject");
                }}
              />
            )}

            {page === "learn_it_subject" && (
              <LearnItSubjectPage
                t={t}
                play={play}
                subject={learnItSubject}
                onBack={() => setPage("learn_it")}
              />
            )}

            {page === "secret_sienna" && secretSiennaUnlocked && (
              <SecretSiennaPage />
            )}

            {page === "postit" && (
              <div data-page-tag="#post_it">
                <Suspense fallback={<RouteFallback />}>
                  <PostItFeed
                    play={play}
                    user={user}
                    onMomentumEvent={(event) => {
                      if (!event?.type) return;
                      trackMomentumEvent(event.type, event);
                    }}
                  />
                </Suspense>
              </div>
            )}

            {page === "discord_networking" && (
              <div
                style={{
                  padding: "36px 24px",
                  maxWidth: 480,
                  margin: "0 auto",
                }}
              >
                <p
                  style={{
                    margin: "0 0 4px",
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: 3,
                    textTransform: "uppercase",
                    color: t.green,
                  }}
                >
                  Community
                </p>
                <h2
                  style={{
                    margin: "0 0 12px",
                    fontSize: 26,
                    fontWeight: 800,
                    color: t.ink,
                    fontFamily: "-apple-system,'SF Pro Display','SF Pro Text','Helvetica Neue',Arial,sans-serif",
                  }}
                >
                  Networking Group
                </h2>
                <p
                  style={{
                    margin: "0 0 24px",
                    fontSize: 14,
                    color: t.mid,
                    lineHeight: 1.75,
                    fontFamily: "-apple-system,'SF Pro Display','SF Pro Text','Helvetica Neue',Arial,sans-serif",
                  }}
                >
                  Connect with other Life. members on Discord. Share wins, ask
                  questions, find accountability partners, and network with
                  people who are building, investing, and growing.
                </p>
                <a
                  href="https://discord.gg/d3uFqUxB"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    width: "100%",
                    padding: "16px 24px",
                    background: "#5865F2",
                    color: "#fff",
                    border: "none",
                    borderRadius: 14,
                    fontSize: 16,
                    fontWeight: 700,
                    fontFamily: "-apple-system,'SF Pro Display','SF Pro Text','Helvetica Neue',Arial,sans-serif",
                    textDecoration: "none",
                    cursor: "pointer",
                    boxShadow: "0 4px 16px rgba(88,101,242,0.35)",
                    transition: "all 0.2s ease",
                  }}
                >
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03z" />
                  </svg>
                  Join the Discord
                </a>
                <div
                  style={{
                    marginTop: 28,
                    background: t.white,
                    border: `1px solid ${t.border}`,
                    borderRadius: 16,
                    padding: "20px 18px",
                  }}
                >
                  <p
                    style={{
                      margin: "0 0 12px",
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: 2.5,
                      textTransform: "uppercase",
                      color: t.muted,
                    }}
                  >
                    What you'll find
                  </p>
                  {[
                    "Share wins and progress with the community",
                    "Find accountability partners",
                    "Ask questions and get real answers",
                    "Network with investors, builders, and creators",
                  ].map((item) => (
                    <div
                      key={item}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 10,
                        padding: "8px 0",
                        borderBottom: `1px solid ${t.light}`,
                      }}
                    >
                      <span
                        style={{
                          color: t.green,
                          fontSize: 14,
                          fontWeight: 700,
                          flexShrink: 0,
                          marginTop: 1,
                        }}
                      >
                        ✓
                      </span>
                      <span
                        style={{ fontSize: 13, color: t.mid, lineHeight: 1.6 }}
                      >
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {page === "networking" && (
              <InventorsInvestors
                t={t}
                user={user}
                play={play}
                onSystemNotify={pushSystemNotification}
              />
            )}

            {/* P7: Categories flow */}
            {page === "categories" && (
              <CategoriesPage
                t={t}
                play={play}
                catStep={catStep}
                setCatStep={setCatStep}
                setPage={setPage}
                userName={user?.name}
              />
            )}

            {/* P6: Progress Dashboard */}
            {page === "progress_dashboard" && (
              <ProgressDashboardPage
                t={t}
                momentumSnapshot={momentumSnapshot}
                openMomentumHub={openMomentumHub}
                readKeys={readKeys}
                bookmarks={bookmarks}
                completedNotes={completedNotes}
                readingStreak={readingStreak}
                profile={profile}
                totalTopics={allContent.length}
                progressPercent={progressPercent}
                play={play}
                setPage={setPage}
                setScreen={setScreen}
                openCommunicationQuiz={openCommunicationQuiz}
              />
            )}

            {/* P9d: Leaderboard */}
            {page === "leaderboard" && (
              <LeaderboardPage
                t={t}
                readKeys={readKeys}
                bookmarks={bookmarks}
              />
            )}

            {/* Daily Growth page */}
            {page === "daily_growth" && (
              <DailyGrowthPage
                t={t}
                play={play}
                setPage={setPage}
                onMomentumEvent={(event) => {
                  if (!event?.type) return;
                  trackMomentumEvent(event.type, event);
                }}
              />
            )}

            {page === "goal_setting" && <GoalSettingPage t={t} play={play} />}

            {/* Extra: Mentorship Booking */}
            {page === "mentorship" && (
              <MentorshipPage t={t} play={play} setPage={setPage} />
            )}

            {/* P10: Setting Preferences */}
            {page === "setting_preferences" && (
              <SettingsPage
                t={t}
                play={play}
                setPage={setPage}
                user={user}
                uiPrefs={uiPrefs}
                updateUiPrefs={updateUiPrefs}
                themeMode={themeMode}
                setThemeMode={setThemeMode}
                systemDark={systemDark}
                setReadKeys={setReadKeys}
                setProfile={setProfile}
                uid={uid}
                LS={LS}
                trackMomentumEvent={trackMomentumEvent}
              />
            )}

            {/* Extra: Premium / Payment */}
            {page === "premium" && <PremiumPage t={t} play={play} />}

            {page === "profile" && (
              <ProfilePage
                t={t}
                user={user}
                play={play}
                setPage={setPage}
                initials={initials}
                doSignOut={doSignOut}
                readKeys={readKeys}
                bookmarks={bookmarks}
                totalTopics={allContent.length}
                onAvatarChange={(url) =>
                  setUser((prev) => (prev ? { ...prev, avatarUrl: url } : prev))
                }
                onSystemNotify={pushSystemNotification}
              />
            )}

            {page === "account_customize" && (
              <AccountCustomizePage
                t={t}
                user={user}
                play={play}
                setPage={setPage}
                initials={initials}
                onProfileChange={(patch) =>
                  setUser((prev) => (prev ? { ...prev, ...patch } : prev))
                }
                onSystemNotify={pushSystemNotification}
              />
            )}

            {page === "reading" && selContent && (
              <Suspense fallback={<RouteFallback />}>
                <EbookReader
                  t={t}
                  selKey={selKey}
                  selContent={selContent}
                  tab={tab}
                  setTab={setTab}
                  isBookmarked={isBookmarked}
                  toggleBk={toggleBk}
                  play={play}
                  noteInput={noteInput}
                  setNoteInput={setNoteInput}
                  noteSaved={noteSaved}
                  setNoteSaved={setNoteSaved}
                  saveNote={saveNote}
                  shareNote={shareNote}
                  related={related}
                  handleSelect={handleSelect}
                  bookmarks={bookmarks}
                  allContent={allContent}
                  profile={profile}
                  savedReaderPage={readerPages[selKey] ?? 0}
                  onReaderPageSave={saveReaderPage}
                  onReadingModeChange={setReaderModeActive}
                />
              </Suspense>
            )}
          </div>
        </div>
      </div>

      {!isOffline && (cloud.error || quizStatsState.error) && (
        <div className="life-cloud-banner" role="status" aria-live="polite">
          {cloud.error || quizStatsState.error}
        </div>
      )}

      {isOffline && (
        <div className="life-offline-banner" role="status" aria-live="polite">
          Offline mode: cached content only until connection returns.
        </div>
      )}

      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className={`scroll-to-top ${showScrollTop ? "visible" : ""}`}
        aria-label="Scroll to top"
        title="Scroll to top"
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="18,15 12,9 6,15" />
        </svg>
      </button>

      {!(page === "reading" && readerModeActive) && (
        <BottomNav
          t={t}
          dark={dark}
          page={page}
          play={play}
          setPage={setPage}
          onOpenQuiz={openQuizHome}
          setSidebarOpen={setSidebarOpen}
          showNotif={showNotif}
          setShowNotif={setShowNotif}
          unreadCount={unreadCount}
          initials={initials}
          userEmail={user?.email || ""}
        />
      )}

      {showA2hs && !isStandalone && (
        <div
          className="life-a2hs-banner"
          role="complementary"
          aria-label="Install app"
        >
          <div className="life-a2hs-icon">
            <span
              style={{
                color: "#fff",
                fontSize: 18,
                fontWeight: 800,
                fontFamily: "-apple-system,'SF Pro Display','SF Pro Text','Helvetica Neue',Arial,sans-serif",
              }}
            >
              l.
            </span>
          </div>
          <div className="life-a2hs-text">
            <strong>Add Life. to your Home Screen</strong>
            <span>
              {a2hsPrompt
                ? "Tap below to install the app."
                : 'Tap Share → "Add to Home Screen" in Safari.'}
            </span>
          </div>
          {a2hsPrompt && (
            <button className="life-a2hs-add" onClick={triggerA2hs}>
              Add
            </button>
          )}
          <button
            className="life-a2hs-dismiss"
            onClick={dismissA2hs}
            aria-label="Dismiss install prompt"
            type="button"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

// v1.0.1 - auth fixes: DOB validation, 3s loading, Supabase hardcoded
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
import { Ic } from "./icons/Ic";
import { getReadingStreak, recordReadingDay } from "./systems/readingStreak";
import { setResumeTopic } from "./systems/resumeReading";
import { LS } from "./systems/storage";
import { C, S, THEME_MODES, useTheme } from "./systems/theme";
import { useMomentum } from "./systems/useMomentum";
import { useQuizStats } from "./systems/useQuizStats";
import { useSound } from "./systems/useSound";
import { MomentumCard } from "./components/MomentumCard";
import {
  getAuthRedirectUrl,
  isSupabaseConfigured,
  supabase,
} from "./supabaseClient";
import { useUserData } from "./systems/useUserData";

import {
  EbookReader,
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
import { HomePage } from "./components/HomePage";
import { SidebarSectionPage } from "./components/SidebarSectionPage";
import { ConnectPage } from "./components/ConnectPage";
import ProfilePage from "./components/ProfilePage";
import SettingsPage from "./components/SettingsPage";
import { WhereToStartPage } from "./components/WhereToStartPage";
import { HelpPage } from "./components/HelpPage";
import { ThemePickerPage } from "./components/ThemePickerPage";
import { CategoryHubPage } from "./components/CategoryHubPage";
import { CategoriesPage, CATEGORIES } from "./components/CategoriesPage";
import { ProgressDashboardPage } from "./components/ProgressDashboardPage";
import { LeaderboardPage } from "./components/LeaderboardPage";
import { DailyGrowthPage } from "./components/DailyGrowthPage";
import { GoalSettingPage } from "./components/GoalSettingPage";
import { MentorshipPage } from "./components/MentorshipPage";
import { PremiumPage } from "./components/PremiumPage";
import { LandingPage } from "./components/LandingPage";
import { VerifyEmailPage } from "./components/VerifyEmailPage";
import { ResetPasswordPage } from "./components/ResetPasswordPage";
import { BottomNav } from "./components/BottomNav";
import { SignInPage } from "./components/SignInPage";
import { RegisterPage } from "./components/RegisterPage";


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

// Swipe left beyond 80px to delete a notification; taps still navigate.
// Horizontal movement must exceed vertical by this factor to trigger swipe-to-delete
// (prevents accidental swipes while scrolling the notification list)
const SWIPE_HORIZONTAL_BIAS = 1.5;

function SwipeableNotification({ n, theme, onTap, onDelete }) {
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const currentX = useRef(0);
  const didDrag = useRef(false);
  const directionLocked = useRef(null); // "horizontal" | "vertical" | null

  const onStart = (clientX, clientY) => {
    startX.current = clientX;
    startY.current = clientY;
    currentX.current = clientX;
    didDrag.current = false;
    directionLocked.current = null;
    setDragging(true);
  };
  const onMove = (clientX, clientY) => {
    if (!dragging) return;
    const dx = clientX - startX.current;
    const dy = clientY - startY.current;

    // Lock direction on first significant movement
    if (directionLocked.current === null && (Math.abs(dx) > 6 || Math.abs(dy) > 6)) {
      directionLocked.current = Math.abs(dx) > Math.abs(dy) * SWIPE_HORIZONTAL_BIAS ? "horizontal" : "vertical";
    }

    // If vertical scroll wins, ignore horizontal swipe
    if (directionLocked.current === "vertical") return;

    currentX.current = clientX;
    if (Math.abs(dx) > 6) didDrag.current = true;
    // Only allow swipe LEFT
    setOffset(Math.min(0, dx));
  };
  const onEnd = () => {
    if (!dragging) return;
    setDragging(false);
    const delta = currentX.current - startX.current;
    if (delta < -80) {
      // Animate out fully then delete
      setOffset(-400);
      setTimeout(() => onDelete?.(), 180);
    } else {
      setOffset(0);
    }
  };

  return (
    <div style={{ position: "relative", overflow: "hidden", borderBottom: `1px solid ${theme.light}` }}>
      {/* Delete backdrop — shows through as user swipes */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: theme.red || "#d25545",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          paddingRight: 20,
          color: "#fff",
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: 1,
          textTransform: "uppercase",
        }}
      >
        Delete
      </div>
      {/* Foreground tappable content — slides with swipe */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => {
          if (!didDrag.current) onTap?.();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onTap?.();
        }}
        onTouchStart={(e) => onStart(e.touches[0].clientX, e.touches[0].clientY)}
        onTouchMove={(e) => onMove(e.touches[0].clientX, e.touches[0].clientY)}
        onTouchEnd={onEnd}
        onMouseDown={(e) => onStart(e.clientX, e.clientY)}
        onMouseMove={(e) => dragging && onMove(e.clientX, e.clientY)}
        onMouseUp={onEnd}
        onMouseLeave={onEnd}
        style={{
          position: "relative",
          padding: "12px 16px",
          background: n.read ? theme.white : theme.greenLt,
          cursor: "pointer",
          transform: `translateX(${offset}px)`,
          transition: dragging ? "none" : "transform 0.24s cubic-bezier(0.22,1,0.36,1)",
          userSelect: "none",
          touchAction: "pan-y",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
          {!n.read && (
            <span
              aria-hidden
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: theme.green,
                marginTop: 6,
                flexShrink: 0,
              }}
            />
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 13, color: theme.ink, lineHeight: 1.5 }}>
              {n.text}
            </p>
            <p style={{ margin: "4px 0 0", fontSize: 10, color: theme.muted }}>
              {n.time}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LifeApp() {
  const { dark, toggleTheme, t, themeMode, setThemeMode, systemDark } = useTheme();

  useEffect(() => {
    document.body.classList.toggle("life-dark", dark);
  }, [dark]);

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

  useEffect(() => {
    if (!rErr || Object.keys(rErr).length === 0) return;
    setRErr((prev) => {
      let changed = false;
      const next = { ...prev };
      if (next.name && rName.trim()) {
        delete next.name;
        changed = true;
      }
      if (next.email && rEmail.includes("@")) {
        delete next.email;
        changed = true;
      }
      if (next.dob && rDob.trim()) {
        delete next.dob;
        changed = true;
      }
      if (next.pass && rPass.length >= 8) {
        delete next.pass;
        changed = true;
      }
      if (next.pass2 && rPass2 && rPass === rPass2) {
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

  // Only 3 providers on landing page: Google, Phone, Facebook
  const AUTH_PROVIDERS = [
    {
      key: "google",
      label: "Google",
      file: "/google_login.png",
      live: true,
      color: "#4285F4",
    },
    {
      key: "phone",
      label: "Phone",
      file: "/phone_login.png",
      live: false,
      color: "#4a8c5c",
    },
    {
      key: "facebook",
      label: "Facebook",
      file: "/facebook_login.png",
      live: false,
      color: "#1877F2",
    },
  ];

  const shapeUser = useCallback((sbUser) => {
    const meta = sbUser.user_metadata || {};
    return {
      id: sbUser.id,
      email: sbUser.email,
      name: meta.name || meta.full_name || sbUser.email,
      username: meta.username || meta.user_name || "",
      emailConfirmed: Boolean(sbUser.email_confirmed_at),
    };
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setUser(null);
      setScreen("landing");
      return undefined;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        if (!session.user.email_confirmed_at) {
          setUser(null);
          setVerifyEmailAddress(session.user.email || "");
          setScreen("verify_email");
          return;
        }
        setUser(shapeUser(session.user));
        const lastScreen = LS.get("life_last_screen", "app");
        const validScreens = [
          "app",
          "tailor_intro",
          "tailor_qs",
          "tailor_result",
        ];
        setScreen(validScreens.includes(lastScreen) ? lastScreen : "app");
      } else {
        setScreen("landing");
      }
    });

    // Listen for auth changes (login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        passwordRecoveryRef.current = true;
        postAuthScreenRef.current = "signin";
        setUser(null);
        setForgotMode(false);
        setFpErr("");
        setFpMsg("");
        setRpErr("");
        setRpPass("");
        setRpPass2("");
        setScreen("reset_password");
        return;
      }

      if (event === "SIGNED_OUT") {
        const nextScreen = postAuthScreenRef.current || "landing";
        postAuthScreenRef.current = null;
        passwordRecoveryRef.current = false;
        setUser(null);
        clearAuthFormState();
        setScreen(nextScreen);
        return;
      }

      if (event === "TOKEN_REFRESHED" && session?.user) {
        if (!session.user.email_confirmed_at) {
          setUser(null);
          setVerifyEmailAddress(session.user.email || "");
          setScreen("verify_email");
          return;
        }
        setUser(shapeUser(session.user));
        return;
      }

      if (event === "USER_UPDATED" && passwordRecoveryRef.current) {
        return;
      }

      if (session?.user) {
        // Block access if email is not confirmed
        if (!session.user.email_confirmed_at) {
          setUser(null);
          setVerifyEmailAddress(session.user.email || "");
          setScreen("verify_email");
          return;
        }
        const shapedUser = shapeUser(session.user);
        setUser(shapedUser);
        // Check if first-time user (no onboarding completed) - redirect to tailoring
        const onboarded = LS.get(`onboarded_${shapedUser.id}`, false);
        const hasReadContent =
          LS.get(`rd_${shapedUser.email || shapedUser.id}`, []).length > 0;
        const hasBookmarks =
          LS.get(`bk_${shapedUser.email || shapedUser.id}`, []).length > 0;
        const isNewUser = !onboarded && !hasReadContent && !hasBookmarks;
        // First-time users (including OAuth) go to theme picker then tailoring
        if (
          (event === "SIGNED_IN" || event === "INITIAL_SESSION") &&
          isNewUser
        ) {
          setScreen("theme_picker");
        } else {
          setScreen("app");
        }
      } else {
        setUser(null);
        setScreen("landing");
      }
    });

    return () => subscription.unsubscribe();
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
  const userIdForData = isSupabaseConfigured && user?.id ? user.id : null;
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

  const bookmarks = userIdForData ? cloud.bookmarks : localBookmarks;
  const notes = userIdForData ? cloud.notes : localNotes;
  const readKeys = userIdForData ? cloud.readKeys : localReadKeys;
  const profile = userIdForData ? cloud.tsdProfile : localProfile;
  const momentumState = userIdForData
    ? cloud.momentumState
    : localMomentumState;

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

  const quizStatsState = useQuizStats(isSupabaseConfigured ? user?.id : null);
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
  const setPage = useCallback(
    (p) => {
      setPageRaw(p);
      LS.set(`life_last_page_${uid}`, p);
    },
    [uid],
  );
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
      setSidebarOpen(false);
    },
    [setPage, setQuizContext],
  );
  const openQuizHome = useCallback(() => {
    setQuizContext({ topic: "finance", activity: "quiz" });
    setPage("quiz");
    setSidebarOpen(false);
  }, [setPage, setQuizContext]);

  const openMomentumHub = useCallback(() => {
    play("tap");
    setPage("momentum_hub");
    setSidebarOpen(false);
  }, [play, setPage]);

  const openSidebarSectionPage = useCallback(
    (sectionPage, setSectionOpen) => {
      play("tap");
      setPage(sectionPage);
      if (typeof setSectionOpen === "function") setSectionOpen(true);
    },
    [play, setPage],
  );

  const [categoryPageData, setCategoryPageData] = useState(null);
  const handleFolderSelect = useCallback(
    (key, node) => {
      setCategoryPageData({ key, node });
      setPage("category_hub");
      setSidebarOpen(false);
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
      networking: "Networking Group — Life.",
      categories: "Categories — Life.",
      progress_dashboard: "Progress — Life.",
      leaderboard: "Leaderboard — Life.",
      daily_growth: "Daily Growth — Life.",
      mentorship: "Mentorship — Life.",
      setting_preferences: "Settings — Life.",
      momentum_hub: "Momentum Hub — Life.",
      sidebar_life: "Life — Life.",
      sidebar_library: "Library — Life.",
      sidebar_socials: "Socials — Life.",
      sidebar_guided: "Guided — Life.",
      sidebar_saved: "Saved — Life.",
      premium: "Premium — Life.",
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
  const [isNarrowViewport, setIsNarrowViewport] = useState(false);

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
  const [socialsOpen, setSocialsOpen] = useState(false);
  const [guidedOpen, setGuidedOpen] = useState(false);
  const [savedOpen, setSavedOpen] = useState(false);
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
    LS.get(`notif_${uid}`, [
      {
        id: 1,
        text: "Welcome to Life. — start your journey today!",
        time: "Just now",
        read: false,
        targetPage: "home",
      },
      {
        id: 2,
        text: "Complete the tailoring questionnaire to personalize your experience.",
        time: "5m ago",
        read: false,
      },
      {
        id: 3,
        text: "New content available: Advanced Finance strategies.",
        time: "1h ago",
        read: false,
        targetPage: "where_to_start",
      },
      {
        id: 4,
        text: "Improve Communication with a guided speaking practice.",
        time: "2h ago",
        read: false,
        targetPage: "communication_quiz",
        activity: "audio",
      },
    ]),
  );
  const [showNotif, setShowNotif] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;
  const markAllRead = () => {
    const next = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(next);
    LS.set(`notif_${uid}`, next);
  };
  const deleteNotification = (id) => {
    const next = notifications.filter((n) => n.id !== id);
    setNotifications(next);
    LS.set(`notif_${uid}`, next);
  };
  const handleNotifTap = (n) => {
    // Mark the individual notification as read
    const next = notifications.map((item) =>
      item.id === n.id ? { ...item, read: true } : item,
    );
    setNotifications(next);
    LS.set(`notif_${uid}`, next);
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

  useEffect(() => {
    setShowSearch(false);
    setShowNotif(false);

    const scroller = mainScrollRef.current;
    if (scroller && typeof scroller.scrollTo === "function") {
      scroller.scrollTo({ top: 0, behavior: "auto" });
      return;
    }

    window.scrollTo({ top: 0, behavior: "auto" });
  }, [page, screen]);

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

  /* One-time copy from localStorage into Supabase when the cloud row is empty.
     useUserData returns a new object each render; we depend on fields, not `cloud`. */
  useEffect(() => {
    if (!userIdForData || cloud.loading || migratedRef.current) return;
    const hasCloud =
      (cloud.bookmarks?.length ?? 0) > 0 ||
      Object.keys(cloud.notes || {}).some((k) => cloud.notes[k]) ||
      (cloud.readKeys?.length ?? 0) > 0 ||
      cloud.tsdProfile != null;
    if (hasCloud) {
      migratedRef.current = true;
      return;
    }
    const email = user?.email || "_";
    const lb = LS.get(`bk_${email}`, []);
    const ln = LS.get(`nt_${email}`, {});
    const lr = LS.get(`rd_${email}`, []);
    const lp = LS.get(`tsd_${email}`, null);
    const hasLocal =
      lb.length > 0 ||
      Object.keys(ln).some((k) => ln[k]) ||
      lr.length > 0 ||
      lp != null;
    migratedRef.current = true;
    if (hasLocal) {
      cloud.setBookmarks(lb);
      cloud.setNotes(ln);
      cloud.setReadKeys(lr);
      if (lp) cloud.setTsdProfile(lp);
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
    cloud.setBookmarks,
    cloud.setNotes,
    cloud.setReadKeys,
    cloud.setTsdProfile,
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
    }
  }, [uid, userIdForData]);

  const doGoogleSignIn = async () => {
    if (authLoading) return;
    play("tap");
    setSiSocialErr("");
    setAuthLoading(true);
    await new Promise((r) => setTimeout(r, 3000));
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: getAuthRedirectUrl(),
          queryParams: { prompt: "select_account" },
        },
      });
      if (error) {
        setSiSocialErr(
          String(error.message || "Could not start Google sign in."),
        );
        play("err");
      }
    } catch {
      setSiSocialErr("Something went wrong. Please try again.");
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
    const _siStart = Date.now();
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: siEmail.toLowerCase().trim(),
        password: siPass,
      });
      await new Promise((r) =>
        setTimeout(r, Math.max(0, 3000 - (Date.now() - _siStart))),
      );
      if (error) {
        const msg = String(error.message || "").toLowerCase();
        if (msg.includes("invalid")) setSiErr("no_account_or_wrong_password");
        else if (msg.includes("rate") || msg.includes("too many"))
          setSiErr("Too many attempts. Wait a moment.");
        else setSiErr("Could not sign in. Check your details.");
        play("err");
      }
      // success → onAuthStateChange fires → screen = "app"
    } catch {
      setSiErr("Something went wrong. Please try again.");
      play("err");
    } finally {
      setAuthLoading(false);
    }
  };

  const doForgotPassword = async () => {
    if (authLoading) return;
    setFpErr("");
    setFpMsg("");
    if (!fpEmail.trim() || !fpEmail.includes("@")) {
      setFpErr("Please enter a valid email.");
      play("err");
      return;
    }
    setAuthLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        fpEmail.toLowerCase().trim(),
        {
          redirectTo: getAuthRedirectUrl(),
        },
      );
      if (error) {
        setFpErr(String(error.message || "Could not send reset email."));
        play("err");
      } else {
        setFpMsg("Password reset email sent. Check your inbox.");
        play("ok");
      }
    } catch {
      setFpErr("Something went wrong. Please try again.");
      play("err");
    } finally {
      setAuthLoading(false);
    }
  };

  const doResetPassword = async () => {
    if (authLoading) return;
    setRpErr("");

    if (rpPass.length < 8) {
      setRpErr("Password must be at least 8 characters.");
      play("err");
      return;
    }

    if (
      !/[A-Z]/.test(rpPass) ||
      !/[a-z]/.test(rpPass) ||
      !/[0-9]/.test(rpPass) ||
      !/[^A-Za-z0-9]/.test(rpPass)
    ) {
      setRpErr("Use upper/lowercase letters, a number, and a symbol.");
      play("err");
      return;
    }

    if (rpPass !== rpPass2) {
      setRpErr("Passwords do not match.");
      play("err");
      return;
    }

    setAuthLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: rpPass });
      if (error) {
        setRpErr(String(error.message || "Could not update password."));
        play("err");
        return;
      }

      postAuthScreenRef.current = "signin";
      passwordRecoveryRef.current = false;
      clearAuthFormState();
      play("ok");
      await supabase.auth.signOut();
      setUser(null);
      setScreen("signin");
    } catch {
      setRpErr("Something went wrong. Please try again.");
      play("err");
    } finally {
      setAuthLoading(false);
    }
  };

  const doRegister = async () => {
    if (authLoading) return;
    setRErr({});
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
      setRErr(err);
      play("err");
      return;
    }

    setAuthLoading(true);
    const _regStart = Date.now();
    try {
      const { data, error } = await supabase.auth.signUp({
        email: rEmail.toLowerCase().trim(),
        password: rPass,
        options: {
          emailRedirectTo: getAuthRedirectUrl(),
          data: {
            name: rName.trim(),
            full_name: rName.trim(),
            dob: rDob.trim(),
          },
        },
      });
      await new Promise((r) =>
        setTimeout(r, Math.max(0, 3000 - (Date.now() - _regStart))),
      );

      if (error) {
        const raw = String(error.message || "").trim();
        const msg = raw.toLowerCase();
        if (msg.includes("already")) {
          setRErr({ email: "already_registered" });
        } else if (
          msg.includes("password") ||
          msg.includes("character") ||
          msg.includes("weak")
        ) {
          setRErr({
            pass: "Password too weak. Use upper/lowercase, number, and symbol.",
          });
        } else if (msg.includes("email")) {
          setRErr({ email: "Please enter a valid email address." });
        } else {
          setRErr({ email: "Could not create account. Please check details." });
        }
        play("err");
        return;
      }

      if (data?.user && !data.user.email_confirmed_at) {
        // Email confirmation required — show verify screen
        setVerifyEmailAddress(data.user.email || rEmail.toLowerCase().trim());
        play("ok");
        setScreen("verify_email");
        return;
      }
      if (data?.user) {
        setUser(shapeUser(data.user));
      }
      play("ok");
      setScreen("theme_picker");
    } catch {
      setRErr({ email: "Something went wrong. Please try again." });
      play("err");
    } finally {
      setAuthLoading(false);
    }
  };

  const doSignOut = async () => {
    postAuthScreenRef.current = "landing";
    passwordRecoveryRef.current = false;
    await supabase.auth.signOut();
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



  // Loading splash — shown while Supabase resolves session
  if (screen === "loading")
    return (
      <div
        style={{
          minHeight: "100vh",
          background: `linear-gradient(135deg, ${C.skin} 0%, #ebe4d6 50%, ${C.skin} 100%)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Georgia,serif",
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
              background: `linear-gradient(145deg,${C.green},#2d6e42)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
              boxShadow: "0 8px 32px rgba(74,140,92,0.35)",
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
              fontFamily: "Georgia,serif",
            }}
          >
            Life.
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
                  background: i === 1 ? C.green : `rgba(74,140,92,0.4)`,
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
          minHeight: "100svh",
          background: C.skin,
          fontFamily: "Georgia,serif",
          padding: "48px 24px",
        }}
      >
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <button
            onClick={() => {
              play("back");
              setScreen("landing");
            }}
            style={{
              background: "none",
              border: "none",
              color: C.muted,
              fontSize: 13,
              cursor: "pointer",
              fontFamily: "Georgia,serif",
              marginBottom: 20,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>{" "}
            Back
          </button>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: C.ink,
              margin: "0 0 20px",
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
              "Your data is stored securely using Supabase infrastructure. Reading progress and preferences are stored locally and synced to the cloud when you are signed in.",
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
              "For privacy-related inquiries, reach out through the app's Help section or contact us at the email provided in the app.",
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
          minHeight: "100svh",
          background: C.skin,
          fontFamily: "Georgia,serif",
          padding: "48px 24px",
        }}
      >
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <button
            onClick={() => {
              play("back");
              setScreen("landing");
            }}
            style={{
              background: "none",
              border: "none",
              color: C.muted,
              fontSize: 13,
              cursor: "pointer",
              fontFamily: "Georgia,serif",
              marginBottom: 20,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>{" "}
            Back
          </button>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: C.ink,
              margin: "0 0 20px",
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
        supabase={supabase}
      />
    );

  if (screen === "reset_password")
    return (
      <ResetPasswordPage
        C={C}
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
        C={C}
        S={S}
        Ic={Ic}
        play={play}
        setScreen={setScreen}
        AUTH_PROVIDERS={AUTH_PROVIDERS}
        doProviderSignIn={doProviderSignIn}
        siSocialErr={siSocialErr}
      />
    );

  // Sign In
  if (screen === "signin")
    return (
      <SignInPage
        C={C} S={S} play={play} setScreen={setScreen}
        siEmail={siEmail} setSiEmail={setSiEmail}
        siPass={siPass} setSiPass={setSiPass}
        siShowPass={siShowPass} setSiShowPass={setSiShowPass}
        siErr={siErr} setSiErr={setSiErr}
        authLoading={authLoading} doEmailSignIn={doEmailSignIn}
        forgotMode={forgotMode} setForgotMode={setForgotMode}
        fpEmail={fpEmail} setFpEmail={setFpEmail}
        fpErr={fpErr} setFpErr={setFpErr}
        fpMsg={fpMsg} setFpMsg={setFpMsg}
        doForgotPassword={doForgotPassword}
        setSiSocialErr={setSiSocialErr}
      />
    );

  // Register
  if (screen === "register")
    return (
      <RegisterPage
        C={C} S={S} play={play} setScreen={setScreen}
        rName={rName} setRName={setRName} rEmail={rEmail} setREmail={setREmail}
        rDob={rDob} setRDob={setRDob} rPass={rPass} setRPass={setRPass}
        rPass2={rPass2} setRPass2={setRPass2}
        rShowPass={rShowPass} setRShowPass={setRShowPass}
        rShowPass2={rShowPass2} setRShowPass2={setRShowPass2}
        rErr={rErr} setRErr={setRErr}
        authLoading={authLoading} doRegister={doRegister}
        setSiEmail={setSiEmail}
      />
    );

  // Keep the layout primitives straightforward because this will likely be ported into a native app shell later.
  return (
    <div
      data-page-tag="#dashboard_home"
      style={{
        height: "100svh",
        minHeight: "100svh",
        background: t.skin,
        display: "flex",
        flexDirection: "column",
        fontFamily: "Georgia,serif",
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
            top: "calc(70px + env(safe-area-inset-top, 0px))",
            left: "50%",
            transform: "translateX(-50%)",
            background: t.ink,
            color: t.skin,
            padding: "10px 22px",
            borderRadius: 20,
            fontSize: 13,
            zIndex: 999,
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
          <div
            onClick={() => setShowNotif(false)}
            style={{ position: "fixed", inset: 0, zIndex: 199 }}
          />
          <div
            className="life-notif-dropdown"
            style={{
              position: "fixed",
              top: `calc(56px + env(safe-area-inset-top, 0px))`,
              left: isNarrowViewport ? 12 : "auto",
              right: isNarrowViewport
                ? 12
                : "max(12px, env(safe-area-inset-right, 0px))",
              zIndex: 200,
              background: t.white,
              border: `1px solid ${t.border}`,
              borderRadius: 14,
              boxShadow: S.lg,
              width: isNarrowViewport ? "auto" : 320,
              maxHeight: "min(460px, calc(100dvh - 80px))",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",  /* children handle their own scroll */
            }}
          >
            {/* Sticky header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 16px",
                borderBottom: `1px solid ${t.light}`,
                flexShrink: 0,
                background: t.white,
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 700, color: t.ink }}>
                Notifications
              </span>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  style={{
                    background: "none",
                    border: "none",
                    color: t.green,
                    fontSize: 11,
                    cursor: "pointer",
                    fontFamily: "Georgia,serif",
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
                <p
                  style={{
                    padding: 24,
                    color: t.muted,
                    fontSize: 13,
                    textAlign: "center",
                  }}
                >
                  No notifications yet.
                </p>
              ) : (
                notifications.map((n) => (
                  <SwipeableNotification
                    key={n.id}
                    n={n}
                    theme={t}
                    onTap={() => handleNotifTap(n)}
                    onDelete={() => deleteNotification(n.id)}
                  />
                ))
              )}
            </div>
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
          paddingTop: "env(safe-area-inset-top, 0px)",
          backdropFilter: "saturate(1.4) blur(16px)",
          WebkitBackdropFilter: "saturate(1.4) blur(16px)",
          boxShadow:
            "0 1px 0 rgba(0,0,0,0.04), 0 8px 24px rgba(74,140,92,0.06)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",  /* vertically centers hamburger with logo + search */
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
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",  /* aligns hamburger dashes with siblings */
              alignItems: "flex-start",
              gap: 5,
              /* Match height of logo/search so it's perfectly centered */
              width: 40,
              height: 40,
              padding: "4px 4px 0",
              boxSizing: "border-box",
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
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: "22%",
                background: `linear-gradient(145deg,${t.green},#2d6e42)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 8px rgba(74,140,92,0.25)",
                transition: "transform 0.2s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "scale(1.05)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
            >
              <span
                style={{
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 800,
                  fontFamily: "Georgia,serif",
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
              setSearch(e.target.value);
              setShowSearch(true);
            }}
            onFocus={() => setShowSearch(true)}
            placeholder="Search topics…"
            style={{
              width: "100%",
              background: t.light,
              border: `1px solid ${t.border}`,
              borderRadius: 20,
              padding: "9px 32px 9px 34px",
              color: t.ink,
              fontSize: 13,
              outline: "none",
              fontFamily: "Georgia,serif",
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
                width: 24,
                height: 24,
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
                top: 2,
                right: 2,
                width: 16,
                height: 16,
                borderRadius: "50%",
                background: t.red,
                color: "#fff",
                fontSize: 9,
                fontWeight: 700,
                display: "grid",
                placeItems: "center",
                lineHeight: "16px",
                padding: 0,
                fontFamily: "-apple-system, BlinkMacSystemFont, system-ui, sans-serif",
                textAlign: "center",
                boxSizing: "border-box",
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
            setSidebarOpen(false);
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
            e.currentTarget.style.boxShadow = "0 2px 8px rgba(74,140,92,0.2)";
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
            zIndex: 200,
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
                  fontFamily: "Georgia,serif",
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
          <div
            className="life-sidebar-backdrop"
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

        {/* SIDEBAR — CSS handles mobile overrides via .life-sidebar class */}
        <div
          className="life-sidebar"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            bottom: 0,
            background: t.white,
            borderRight: `1px solid ${t.border}`,
            overflowY: "auto",
            WebkitOverflowScrolling: "touch",
            zIndex: 40,
            transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
            transition: "transform 0.28s cubic-bezier(0.4,0,0.2,1)",
          }}
        >
          {/* User card */}
          <div
            style={{
              padding: "16px 18px 14px",
              borderBottom: `1px solid ${t.light}`,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, ${t.green}, #3a7d4a)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  boxShadow: "0 2px 8px rgba(74,140,92,0.2)",
                }}
              >
                <span style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>
                  {initials.slice(0, 2)}
                </span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    margin: 0,
                    fontSize: 14,
                    fontWeight: 700,
                    color: t.ink,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {user?.name || "User"}
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: 11,
                    color: t.muted,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {user?.email || ""}
                </p>
              </div>
            </div>
            <div
              style={{
                background: t.light,
                border: `1px solid ${t.border}`,
                borderRadius: 12,
                padding: "10px 12px",
                cursor: "pointer",
              }}
              onClick={() => {
                play("tap");
                setPage("progress_dashboard");
                setSidebarOpen(false);
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: 2,
                    textTransform: "uppercase",
                    color: t.muted,
                  }}
                >
                  Your Progress
                </span>
                <span style={{ fontSize: 11, fontWeight: 700, color: t.green }}>
                  {progressPercent}%
                </span>
              </div>
              <div
                style={{
                  height: 6,
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
                    background: `linear-gradient(90deg, ${t.green}, #6FBE77)`,
                  }}
                />
              </div>
              <p
                style={{
                  margin: "8px 0 0",
                  fontSize: 11,
                  color: t.muted,
                  lineHeight: 1.4,
                }}
              >
                {readKeys.length}/{allContent.length} topics explored
              </p>
            </div>
          </div>
          {/* P2: Home independent from Life */}
          <SL
            theme={t}
            label="Home"
            icon="home"
            onClick={() => {
              play("tap");
              setPage("home");
              setSidebarOpen(false);
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
            onLabelClick={() => openSidebarSectionPage("sidebar_life", setLifeOpen)}
            active={page === "sidebar_life"}
          >
            <SL
              theme={t}
              label="Where To Start?"
              icon="compass"
              onClick={() => {
                play("tap");
                setPage("where_to_start");
                setSidebarOpen(false);
              }}
              active={page === "where_to_start"}
            />
            <SL
              theme={t}
              label="Momentum Hub"
              icon="trending"
              onClick={openMomentumHub}
              active={page === "momentum_hub"}
            />
            <SL
              theme={t}
              label="Daily Growth"
              icon="star"
              onClick={() => {
                play("tap");
                setPage("daily_growth");
                setSidebarOpen(false);
              }}
              active={page === "daily_growth"}
            />
            <SL
              theme={t}
              label="Quiz"
              icon="brain"
              onClick={() => {
                play("tap");
                openQuizHome();
              }}
              active={page === "quiz"}
            />
            <SL
              theme={t}
              label="Goals"
              onClick={() => {
                play("tap");
                setPage("goal_setting");
                setSidebarOpen(false);
              }}
              active={page === "goal_setting"}
            />
            <SL
              theme={t}
              label="Help"
              icon="question"
              onClick={() => {
                play("tap");
                setPage("help");
                setSidebarOpen(false);
              }}
              active={page === "help"}
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
            {Object.entries(LIBRARY).map(([k, node]) => (
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
            ))}
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
                setSidebarOpen(false);
              }}
              active={page === "postit"}
            />
            <SL
              theme={t}
              label="Networking Group"
              icon="users"
              onClick={() => {
                play("tap");
                setPage("networking");
                setSidebarOpen(false);
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
                setSidebarOpen(false);
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
                      setSidebarOpen(false);
                    }}
                    active={false}
                  />
                ))
            )}
          </SS>
          <div
            data-page-tag="#side_bar_sign_out"
            className="life-sidebar-signout"
            style={{
              padding: "20px 18px 8px",
              borderTop: `1px solid ${t.light}`,
              marginTop: "auto",
            }}
          >
            <button
              onClick={doSignOut}
              style={{
                width: "100%",
                background: t.white,
                border: `1.5px solid ${t.red}`,
                borderRadius: 10,
                padding: "12px",
                color: t.red,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "Georgia,serif",
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
            style={{ minHeight: "100%" }}
          >
            {page === "home" && (
              <HomePage
                t={t}
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
              />
            )}

            {page === "sidebar_life" && <SidebarSectionPage sectionKey="sidebar_life" t={t} />}
            {page === "sidebar_library" && <SidebarSectionPage sectionKey="sidebar_library" t={t} />}
            {page === "sidebar_socials" && <SidebarSectionPage sectionKey="sidebar_socials" t={t} />}
            {page === "sidebar_guided" && <SidebarSectionPage sectionKey="sidebar_guided" t={t} />}
            {page === "sidebar_saved" && <SidebarSectionPage sectionKey="sidebar_saved" t={t} />}

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

            {page === "quiz" && (
              <Suspense fallback={<RouteFallback />}>
                <QuizPage
                  play={play}
                  t={t}
                  userId={isSupabaseConfigured ? user?.id : null}
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
                    setSidebarOpen(false);
                  }}
                  onQuickEvent={(event) => {
                    if (!event?.type) return;
                    trackMomentumEvent(event.type, event);
                  }}
                />
              </Suspense>
            )}

            {page === "help" && <HelpPage t={t} />}

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

            {page === "networking" && (
              <ConnectPage t={t} user={user} play={play} />
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
              <LeaderboardPage t={t} readKeys={readKeys} bookmarks={bookmarks} />
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
                readKeys={readKeys}
                bookmarks={bookmarks}
                readingStreak={readingStreak}
                completedNotes={completedNotes}
                momentumSnapshot={momentumSnapshot}
                openMomentumHub={openMomentumHub}
                initials={initials}
                doSignOut={doSignOut}
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
                />
              </Suspense>
            )}
          </div>
        </div>
      </div>

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
      />

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
                fontFamily: "Georgia,serif",
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
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}

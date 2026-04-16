// v1.0.1 - auth fixes: DOB validation, 3s loading, Supabase hardcoded
import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Image from "next/image";
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
import {
  clearResumeTopic,
  getResumeTopic,
  setResumeTopic,
} from "./systems/resumeReading";
import { LS } from "./systems/storage";
import { C, S } from "./systems/theme";
import { useSound } from "./systems/useSound";
import { useMomentum } from "./systems/useMomentum";
import { useQuizStats } from "./systems/useQuizStats";
// P4: Constellation removed
import { isSupabaseConfigured, supabase } from "./supabaseClient";
import { useUserData } from "./systems/useUserData";
import { MomentumCard } from "./components/MomentumCard";

/* ── Dark Mode palette (P11) ──────────────────────────────────── */
const DARK = {
  skin: "#181818",
  white: "#242424",
  green: "#5a9d6c",
  greenLt: "#223228",
  ink: "#f2f2f2",
  mid: "#d1d1d1",
  muted: "#a29d96",
  border: "#3b3b3b",
  light: "#2d2d2d",
  gold: "#d0ae6c",
  red: "#d25545",
};

function useTheme() {
  const [dark, setDark] = useState(() => LS.get("life_dark_mode", true)); // dark mode default
  const toggle = () => {
    const next = !dark;
    setDark(next);
    LS.set("life_dark_mode", next);
  };
  const t = dark ? DARK : C;
  return { dark, toggle, t };
}

/* ── Categories data (P7) ─────────────────────────────────────── */
const CATEGORIES = [
  {
    key: "money",
    label: "Money",
    icon: "wallet",
    desc: "Understand what money actually is and how the system works.",
  },
  {
    key: "mindset",
    label: "Mindset",
    icon: "brain",
    desc: "Your beliefs shape your financial reality. Master your mind.",
  },
  {
    key: "effort",
    label: "Effort",
    icon: "bolt",
    desc: "Nothing happens without consistent, deliberate action.",
  },
  {
    key: "result",
    label: "Result",
    icon: "trending",
    desc: "Track your progress and see the compound effect of discipline.",
  },
  {
    key: "repeat",
    label: "Repeat",
    icon: "leaf",
    desc: "Success is a cycle. Master the loop and keep building.",
  },
  {
    key: "100ways",
    label: "100 Ways to Make Money",
    icon: "lightbulb",
    desc: "Concrete strategies for generating income in 2025 and beyond.",
  },
];

/* ── Sidebar components (extracted for react-hooks/static-components) ── */
function SS({ label, open, setOpen, children, tag, theme, playFn }) {
  const th = theme || C;
  return (
    <div
      data-page-tag={tag}
      style={{
        borderTop: `1px solid ${th.border}22`,
      }}
    >
      <button
        onClick={() => {
          playFn("tap");
          setOpen(!open);
        }}
        style={{
          display: "flex",
          alignItems: "center",
          width: "100%",
          padding: "10px 18px 10px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          minHeight: 44,
        }}
      >
        <p
          style={{
            color: th.muted,
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: 2,
            margin: 0,
            textTransform: "uppercase",
            flex: 1,
            textAlign: "left",
            fontFamily: "Georgia,serif",
          }}
        >
          {label}
        </p>
        <svg
          width="9"
          height="9"
          viewBox="0 0 10 10"
          style={{
            transform: open ? "rotate(90deg)" : "none",
            transition: "transform 0.18s ease",
            flexShrink: 0,
          }}
        >
          <polyline
            points="2,2 8,5 2,8"
            fill="none"
            stroke={th.muted}
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {open && children}
    </div>
  );
}

function SL({ label, icon, onClick, active, theme }) {
  const th = theme || C;
  const ic = icon && Ic[icon];
  const stroke = active ? th.green : "#8a8070";
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 9,
        width: "100%",
        padding: "8px 18px",
        background: active ? th.greenLt : "transparent",
        border: "none",
        borderLeft: active ? `3px solid ${th.green}` : "3px solid transparent",
        cursor: "pointer",
        color: active ? th.green : th.mid,
        fontSize: 13,
        textAlign: "left",
        fontFamily: "Georgia,serif",
        fontWeight: active ? 600 : 400,
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.background = th.light;
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.background = "transparent";
      }}
    >
      {ic && (
        <span style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
          {ic("none", stroke, 18)}
        </span>
      )}
      <span style={{ flex: 1 }}>{label}</span>
    </button>
  );
}

const EbookReader = lazy(() =>
  import("./components/Reader").then((m) => ({ default: m.EbookReader })),
);
const QuizPage = lazy(() =>
  import("./components/QuizPage").then((m) => ({ default: m.QuizPage })),
);
const PostItFeed = lazy(() =>
  import("./components/PostItFeed").then((m) => ({ default: m.PostItFeed })),
);
const TailorIntro = lazy(() =>
  import("./components/Tailor").then((m) => ({ default: m.TailorIntro })),
);
const TailorQuestions = lazy(() =>
  import("./components/Tailor").then((m) => ({ default: m.TailorQuestions })),
);
const TailorResult = lazy(() =>
  import("./components/Tailor").then((m) => ({ default: m.TailorResult })),
);
const MomentumHubPage = lazy(() =>
  import("./components/MomentumHub").then((m) => ({ default: m.MomentumHub })),
);

function RouteFallback() {
  return (
    <div
      className="life-page-suspense-fallback"
      role="status"
      aria-busy="true"
      aria-label="Loading"
    >
      <div className="life-page-suspense-dots" aria-hidden>
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}

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

export default function LifeApp() {
  // ── DARK MODE (P11) ───────────────────────────────────────────
  const { dark, toggle: toggleDark, t } = useTheme();

  // ── iOS dark-mode body class (for CSS :root overrides) ───────
  useEffect(() => {
    document.body.classList.toggle("life-dark", dark);
  }, [dark]);

  // ── AUTH STATE ──────────────────────────────────────────────
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

  // ── AUTH PROVIDERS ────────────────────────────────────────────
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

  // ── SHAPE USER ────────────────────────────────────────────────
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

  // ── SESSION RESTORE ON REFRESH ──────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        if (!session.user.email_confirmed_at) {
          setUser(null);
          setVerifyEmailAddress(session.user.email || "");
          setScreen("verify_email");
          return;
        }
        setUser(shapeUser(session.user));
        // P5: restore last screen
        const lastScreen = LS.get("life_last_screen", "app");
        const validScreens = ["app", "tailor_intro", "tailor_qs", "tailor_result"];
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
        // First-time users (including OAuth) go to tailoring area
        if ((event === "SIGNED_IN" || event === "INITIAL_SESSION") && isNewUser) {
          setScreen("tailor_intro");
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

  // P5: persist screen to localStorage
  useEffect(() => {
    if (screen && screen !== "loading") {
      LS.set("life_last_screen", screen);
    }
  }, [screen]);

  // ── USER-SCOPED STATE: Supabase user_data when configured, else localStorage ─
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
  const momentumState = userIdForData ? cloud.momentumState : localMomentumState;

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

  // ── APP PAGE STATE ────────────────────────────────────────────
  // P5: restore last page from localStorage
  const [page, setPageRaw] = useState(() =>
    LS.get(`life_last_page_${uid}`, "home"),
  );
  const setPage = useCallback(
    (p) => {
      setPageRaw(p);
      LS.set(`life_last_page_${uid}`, p);
    },
    [uid],
  );

  const openMomentumHub = useCallback(() => {
    play("tap");
    setPage("momentum_hub");
    setSidebarOpen(false);
  }, [play, setPage]);

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
  const [resumeTipDismissed, setResumeTipDismissed] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // ── Add-To-Home-Screen (A2HS) — iOS Safari install prompt ────
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

  // ── Notifications (P9c) ───────────────────────────────────────
  const [notifications, setNotifications] = useState(() =>
    LS.get(`notif_${uid}`, [
      {
        id: 1,
        text: "Welcome to Life. — start your journey today!",
        time: "Just now",
        read: false,
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

  // ── Categories flow (P7) ──────────────────────────────────────
  const [catStep, setCatStep] = useState(0);

  // ── Dark mode body effect (P11) ───────────────────────────────
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

  const applySettingProfile = useCallback((profile) => {
    if (profile === "focus") {
      setUiPrefs((prev) => ({
        ...prev,
        soundEnabled: true,
        soundMode: "focused",
        soundScope: "focused",
        textScale: 100,
        readingDensity: "comfortable",
        highContrast: false,
        dataSaver: false,
        reduceMotion: false,
        instantButtons: true,
        pressIntensity: 44,
        sidebarSpeed: 58,
      }));
      return;
    }
    if (profile === "immersive") {
      setUiPrefs((prev) => ({
        ...prev,
        soundEnabled: true,
        soundMode: "full",
        soundScope: "full",
        textScale: 102,
        readingDensity: "airy",
        highContrast: false,
        dataSaver: false,
        reduceMotion: false,
        instantButtons: false,
        pressIntensity: 72,
        sidebarSpeed: 74,
      }));
      return;
    }
    if (profile === "calm") {
      setUiPrefs((prev) => ({
        ...prev,
        soundEnabled: true,
        soundMode: "focused",
        soundScope: "focused",
        textScale: 104,
        readingDensity: "comfortable",
        highContrast: false,
        dataSaver: true,
        reduceMotion: true,
        instantButtons: true,
        pressIntensity: 24,
        sidebarSpeed: 46,
      }));
    }
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

  // ── GOOGLE SIGN IN (live) ─────────────────────────────────────
  const doGoogleSignIn = async () => {
    if (authLoading) return;
    play("tap");
    setSiSocialErr("");
    setAuthLoading(true);
    await new Promise(r => setTimeout(r, 3000));
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
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

  // ── PROVIDER BUTTON HANDLER ────────────────────────────────────
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

  // ── EMAIL / PASSWORD SIGN IN ──────────────────────────────────
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
      await new Promise(r => setTimeout(r, Math.max(0, 3000 - (Date.now() - _siStart))));
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

  // ── FORGOT PASSWORD (P9a) ──────────────────────────────────────
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
          redirectTo: window.location.origin,
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

  // ── SUPABASE REGISTER ─────────────────────────────────────────
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
      const yr = yyRaw < 100 ? (yyRaw <= 26 ? 2000 + yyRaw : 1900 + yyRaw) : yyRaw;
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
          emailRedirectTo: window.location.origin,  
          data: {  
            name: rName.trim(),  
            full_name: rName.trim(),  
            dob: rDob.trim(),  
          },  
        },  
      });
      await new Promise(r => setTimeout(r, Math.max(0, 3000 - (Date.now() - _regStart))));

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
      setScreen("tailor_intro");
    } catch {
      setRErr({ email: "Something went wrong. Please try again." });
      play("err");
    } finally {
      setAuthLoading(false);
    }
  };

  // ── SUPABASE SIGN OUT ─────────────────────────────────────────
  const doSignOut = async () => {
    postAuthScreenRef.current = "landing";
    passwordRecoveryRef.current = false;
    await supabase.auth.signOut();
    clearAuthFormState();
    setUser(null);
    setScreen("landing");
    setSiSocialErr("");
  };

  // ── APP HELPERS ───────────────────────────────────────────────
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
    setResumeTipDismissed(false);
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

  const exportSettingSnapshot = () => {
    try {
      const file = new Blob([JSON.stringify(uiPrefs, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(file);
      const a = document.createElement("a");
      a.href = url;
      a.download = "life-settings.json";
      a.click();
      URL.revokeObjectURL(url);
      play("ok");
    } catch {
      play("err");
    }
  };

  const resetReadingProgress = () => {
    try {
      setReadKeys([]);
      setReaderPages({});
      LS.set(`rp_${uid}`, {});
      clearResumeTopic();
      play("ok");
    } catch {
      play("err");
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

  // ── SCROLL TO TOP ─────────────────────────────────────────────
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

  const resumeSnap = getResumeTopic();
  const resumePack = resumeSnap?.key ? MAP[resumeSnap.key] : null;
  const resumeEntry = resumePack
    ? { key: resumePack.key, node: resumePack.node }
    : null;
  const readingStreak = getReadingStreak();
  const progressPercent =
    allContent.length > 0
      ? Math.round((readKeys.length / allContent.length) * 100)
      : 0;
  const completedNotes = Object.keys(notes).filter((key) => notes[key]).length;
  const homeStats = [
    { label: "Topics Read", value: readKeys.length, color: C.green },
    { label: "Bookmarks", value: bookmarks.length, color: "#b8975a" },
    { label: "Notes", value: completedNotes, color: "#7B6FA8" },
  ];
  const passwordHasMinLength = rPass.length >= 8;
  const passwordHasUpper = /[A-Z]/.test(rPass);
  const passwordHasNumber = /\d/.test(rPass);
  const passwordHasSpecial = /[^A-Za-z0-9]/.test(rPass);
  const passwordStrength = [
    passwordHasMinLength,
    passwordHasUpper,
    passwordHasNumber,
    passwordHasSpecial,
  ].filter(Boolean).length;
  const passwordStrengthLabels = [
    "Very Weak",
    "Weak",
    "Fair",
    "Good",
    "Strong",
  ];
  const passwordStrengthColors = [C.red, C.red, "#e6a23c", C.gold, C.green];
  const passwordHint =
    rPass.length > 0 && !passwordHasSpecial
      ? "Tip: add a special character for a stronger password."
      : "";
  const confirmMismatch = rPass2.length > 0 && rPass !== rPass2;
  const resetPasswordHasMinLength = rpPass.length >= 8;
  const resetPasswordHasUpper = /[A-Z]/.test(rpPass);
  const resetPasswordHasNumber = /\d/.test(rpPass);
  const resetPasswordHasSpecial = /[^A-Za-z0-9]/.test(rpPass);
  const resetPasswordStrength = [
    resetPasswordHasMinLength,
    resetPasswordHasUpper,
    resetPasswordHasNumber,
    resetPasswordHasSpecial,
  ].filter(Boolean).length;
  const resetPasswordHint =
    rpPass.length > 0 && !resetPasswordHasSpecial
      ? "Tip: add a special character for a stronger password."
      : "";
  const resetConfirmMismatch = rpPass2.length > 0 && rpPass !== rpPass2;
  const verifyTargetEmail = verifyEmailAddress || rEmail || user?.email || "";

  // ── SIDEBAR HELPERS (extracted outside component — see SS/SL above) ──

  // ── SCREENS ───────────────────────────────────────────────────

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

  // ── VERIFY EMAIL SCREEN ──────────────────────────────────────  
  if (screen === "verify_email")  
    return (  
      <div  
        data-page-tag="#verify_email_page"  
        className="life-grain life-auth-shell"  
        style={{  
          minHeight: "100svh",  
          background: `linear-gradient(165deg, ${C.skin} 0%, #ebe4d6 50%, ${C.skin} 100%)`,  
          display: "flex",  
          flexDirection: "column",  
          alignItems: "center",  
          justifyContent: "center",  
          fontFamily: "Georgia,serif",  
          padding: "40px 24px calc(40px + env(safe-area-inset-bottom))",  
          position: "relative",  
          overflowX: "hidden",  
        }}  
      >  
        <div  
          style={{  
            position: "absolute",  
            top: -40,  
            right: -50,  
            width: 170,  
            height: 170,  
            borderRadius: "50%",  
            border: "1.5px solid rgba(74,140,92,0.09)",  
            pointerEvents: "none",  
          }}  
        />  
        <div  
          style={{  
            width: 70,  
            height: 70,  
            borderRadius: "20%",  
            background: `linear-gradient(145deg,${C.green},#2d6e42)`,  
            display: "flex",  
            alignItems: "center",  
            justifyContent: "center",  
            marginBottom: 24,  
            boxShadow: "0 8px 32px rgba(74,140,92,0.35)",  
          }}  
        >  
          <span style={{ color: "#fff", fontSize: 28, fontWeight: 800 }}>  
            l.  
          </span>  
        </div>  
  
        {/* Email icon */}  
        <div  
          style={{  
            width: 64,  
            height: 64,  
            borderRadius: "50%",  
            background: C.greenLt,  
            display: "flex",  
            alignItems: "center",  
            justifyContent: "center",  
            marginBottom: 20,  
          }}  
        >  
          <svg  
            width="28"  
            height="28"  
            viewBox="0 0 24 24"  
            fill="none"  
            stroke={C.green}  
            strokeWidth="2"  
            strokeLinecap="round"  
            strokeLinejoin="round"  
          >  
            <rect x="2" y="4" width="20" height="16" rx="2" />  
            <path d="M22 7l-10 7L2 7" />  
          </svg>  
        </div>  
  
        <h2  
          style={{  
            fontSize: 26,  
            fontWeight: 700,  
            margin: "0 0 8px",  
            color: C.ink,  
            fontFamily: "Georgia,serif",  
            textAlign: "center",  
          }}  
        >  
          Check your email
        </h2>  
        <p  
          style={{  
            margin: "0 0 32px",  
            fontSize: 15,  
            color: C.mid,  
            textAlign: "center",  
            maxWidth: 320,  
            lineHeight: 1.6,  
            wordBreak: "break-word",  
          }}  
        >  
          We sent a confirmation link to {verifyTargetEmail || "your email"}. Click it to verify your account.  
        </p>  
  
        <div  
          style={{  
            display: "flex",  
            flexDirection: "column",  
            gap: 12,  
            width: "100%",  
            maxWidth: 320,  
          }}  
        >  
          {/* Resend email button */}  
          <button  
            onClick={async () => {  
              if (!verifyTargetEmail) return;  
              try {  
                await supabase.auth.resend({  
                  type: "signup",  
                  email: verifyTargetEmail.toLowerCase().trim(),  
                });  
                play("ok");  
              } catch {  
                play("err");  
              }  
            }}  
            style={{  
              background: C.white,  
              border: `1.5px solid ${C.border}`,  
              borderRadius: 12,  
              padding: "14px",  
              color: C.green,  
              fontSize: 14,  
              fontWeight: 600,  
              cursor: "pointer",  
              fontFamily: "Georgia,serif",  
              transition: "all 0.2s ease",  
            }}  
            onMouseEnter={(e) => {  
              e.currentTarget.style.borderColor = C.green;  
            }}  
            onMouseLeave={(e) => {  
              e.currentTarget.style.borderColor = C.border;  
            }}  
          >  
            Resend Email
          </button>  
  
          {/* Back to sign in */}  
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
              padding: "10px",  
              display: "flex",  
              alignItems: "center",  
              justifyContent: "center",  
              gap: 6,  
              transition: "color 0.2s ease",  
            }}  
            onMouseEnter={(e) => {  
              e.currentTarget.style.color = C.ink;  
            }}  
            onMouseLeave={(e) => {  
              e.currentTarget.style.color = C.muted;  
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
            </svg>  
            Back to Sign In  
          </button>  
        </div>  
  
        <p  
          className="life-footer"  
          style={{  
            margin: "32px 0 0",  
            color: C.muted,  
            fontSize: 10,  
            fontStyle: "italic",  
            textAlign: "center",  
          }}  
        >  
          &copy; 2026 Life. All rights reserved.  
        </p>  
      </div>  
    );

  if (screen === "reset_password")
    return (
      <div
        data-page-tag="#reset_password_page"
        className="life-grain life-auth-shell"
        style={{
          minHeight: "100svh",
          background: `linear-gradient(165deg, ${C.skin} 0%, #ebe4d6 50%, ${C.skin} 100%)`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Georgia,serif",
          padding: "40px 24px calc(40px + env(safe-area-inset-bottom))",
          position: "relative",
          overflowX: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -40,
            right: -50,
            width: 170,
            height: 170,
            borderRadius: "50%",
            border: "1.5px solid rgba(74,140,92,0.09)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            width: 70,
            height: 70,
            borderRadius: "20%",
            background: `linear-gradient(145deg,${C.green},#2d6e42)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 20,
            boxShadow: S.md,
          }}
        >
          <span style={{ color: "#fff", fontSize: 28, fontWeight: 800 }}>l.</span>
        </div>

        <h2
          style={{
            fontSize: 26,
            fontWeight: 700,
            margin: "0 0 4px",
            color: C.ink,
            fontFamily: "Georgia,serif",
            textAlign: "center",
          }}
        >
          Set New Password
        </h2>
        <p
          style={{
            margin: "0 0 28px",
            fontSize: 14,
            color: C.muted,
            fontStyle: "italic",
            textAlign: "center",
            maxWidth: 320,
            lineHeight: 1.6,
          }}
        >
          Choose a strong password to finish recovering your account.
        </p>

        <div
          className="life-auth-card"
          style={{
            width: "100%",
            maxWidth: 320,
            display: "flex",
            flexDirection: "column",
            gap: 14,
            background: C.white,
            borderRadius: 20,
            padding: "28px 22px",
            boxShadow:
              "0 8px 32px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)",
            border: `1px solid ${C.border}`,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: 2,
                textTransform: "uppercase",
                color: C.muted,
              }}
            >
              New Password
            </label>
            <div className="life-password-field">
              <input
                type={rpShowPass ? "text" : "password"}
                value={rpPass}
                onChange={(e) => {
                  setRpPass(e.target.value);
                  setRpErr("");
                }}
                onKeyDown={(e) => e.key === "Enter" && doResetPassword()}
                placeholder="Use 8+ characters"
                autoComplete="new-password"
                style={{
                  background: C.skin,
                  border: `1.5px solid ${rpErr ? C.red : C.border}`,
                  borderRadius: 12,
                  padding: "14px 64px 14px 16px",
                  fontSize: 15,
                  color: C.ink,
                  outline: "none",
                  fontFamily: "Georgia,serif",
                  boxSizing: "border-box",
                  width: "100%",
                  transition: "border-color 0.2s ease",
                }}
                onFocus={(e) => {
                  if (!rpErr) e.currentTarget.style.borderColor = C.green;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = rpErr ? C.red : C.border;
                }}
              />
              <button
                className="life-password-toggle"
                type="button"
                data-password-toggle="true"
                aria-label={rpShowPass ? "Hide password" : "Show password"}
                onClick={() => setRpShowPass((v) => !v)}
              >
                <span className="life-password-toggle-label">
                  {rpShowPass ? "Hide" : "Show"}
                </span>
              </button>
            </div>
            {rpPass.length > 0 && (
              <div style={{ marginTop: 2 }}>
                <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        height: 3,
                        borderRadius: 2,
                        background:
                          i < resetPasswordStrength
                            ? passwordStrengthColors[resetPasswordStrength]
                            : C.light,
                        transition: "background 0.2s",
                      }}
                    />
                  ))}
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: 11,
                    color: passwordStrengthColors[resetPasswordStrength],
                    fontStyle: "italic",
                  }}
                >
                  {passwordStrengthLabels[resetPasswordStrength]}
                </p>
                {resetPasswordHint && (
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontSize: 11,
                      color: C.muted,
                      fontStyle: "italic",
                    }}
                  >
                    {resetPasswordHint}
                  </p>
                )}
              </div>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: 2,
                textTransform: "uppercase",
                color: C.muted,
              }}
            >
              Confirm Password
            </label>
            <div className="life-password-field">
              <input
                type={rpShowPass2 ? "text" : "password"}
                value={rpPass2}
                onChange={(e) => {
                  setRpPass2(e.target.value);
                  setRpErr("");
                }}
                onKeyDown={(e) => e.key === "Enter" && doResetPassword()}
                placeholder="Repeat password"
                autoComplete="new-password"
                style={{
                  background: C.skin,
                  border: `1.5px solid ${rpErr || resetConfirmMismatch ? C.red : C.border}`,
                  borderRadius: 12,
                  padding: "14px 64px 14px 16px",
                  fontSize: 15,
                  color: C.ink,
                  outline: "none",
                  fontFamily: "Georgia,serif",
                  boxSizing: "border-box",
                  width: "100%",
                  transition: "border-color 0.2s ease",
                }}
                onFocus={(e) => {
                  if (!rpErr && !resetConfirmMismatch)
                    e.currentTarget.style.borderColor = C.green;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor =
                    rpErr || resetConfirmMismatch ? C.red : C.border;
                }}
              />
              <button
                className="life-password-toggle"
                type="button"
                data-password-toggle="true"
                aria-label={rpShowPass2 ? "Hide password" : "Show password"}
                onClick={() => setRpShowPass2((v) => !v)}
              >
                <span className="life-password-toggle-label">
                  {rpShowPass2 ? "Hide" : "Show"}
                </span>
              </button>
            </div>
            {!rpErr && resetConfirmMismatch && (
              <p
                style={{
                  margin: 0,
                  fontSize: 12,
                  color: C.red,
                  fontStyle: "italic",
                }}
              >
                Not Matching Yet
              </p>
            )}
          </div>

          {rpErr && (
            <p
              style={{
                margin: "-4px 0 0",
                fontSize: 12,
                color: C.red,
                fontStyle: "italic",
                lineHeight: 1.5,
              }}
            >
              {rpErr}
            </p>
          )}

          <button
            onClick={doResetPassword}
            disabled={authLoading}
            style={{
              background: `linear-gradient(135deg, ${C.green}, #3a7d4a)`,
              border: "none",
              borderRadius: 12,
              padding: "16px",
              color: "#fff",
              fontSize: 16,
              fontWeight: 700,
              cursor: authLoading ? "default" : "pointer",
              fontFamily: "Georgia,serif",
              opacity: authLoading ? 0.7 : 1,
              marginTop: 2,
              boxShadow: "0 4px 16px rgba(74,140,92,0.35)",
              transition: "all 0.2s ease",
            }}
          >
            {authLoading ? "Updating password…" : "Set New Password"}
          </button>

          <button
            onClick={() => {
              play("back");
              passwordRecoveryRef.current = false;
              setRpErr("");
              setScreen("signin");
            }}
            style={{
              background: "none",
              border: "none",
              color: C.muted,
              fontSize: 13,
              cursor: "pointer",
              fontFamily: "Georgia,serif",
              fontStyle: "italic",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              transition: "color 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = C.ink;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = C.muted;
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
            </svg>
            Back to Sign In
          </button>
        </div>

        <p
          className="life-footer"
          style={{
            margin: "28px 0 0",
            color: C.muted,
            fontSize: 10,
            fontStyle: "italic",
            textAlign: "center",
          }}
        >
          © 2026 Life. All rights reserved.
        </p>
      </div>
    );

  if (screen === "tailor_intro")
    return (
      <Suspense fallback={<RouteFallback />}>
        <TailorIntro
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
      <div
        data-page-tag="#landing_page"
        className={`life-grain${dark ? " life-dark-bg" : ""}`}
        style={{
          minHeight: "100svh",
          background: dark
            ? `linear-gradient(180deg, #141414 0%, #0d0d0d 100%)`
            : `linear-gradient(180deg, ${C.skin} 0%, #e8e0d0 100%)`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Georgia,serif",
          padding: `calc(env(safe-area-inset-top, 0px) + 40px) 28px calc(env(safe-area-inset-bottom, 0px) + 40px)`,
          position: "relative",
          overflowX: "hidden",
          gap: 0,
        }}
      >
        <style>{`
          @keyframes life-fade-up { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
          @keyframes life-logo-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }
        `}</style>

        {/* ── CENTERED HERO ─────────────────────────────── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            width: "100%",
            maxWidth: 340,
          }}
        >
          {/* Welcome To */}
          <p
            style={{
              margin: "0 0 4px",
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "0.32em",
              textTransform: "uppercase",
              color: dark ? "#a29d96" : C.muted,
              fontStyle: "italic",
              animation: "life-fade-up 0.5s ease both",
            }}
          >
            Welcome To
          </p>

          {/* Life. */}
          <h1
            style={{
              margin: "0 0 32px",
              fontSize: "clamp(5rem, 22vw, 8rem)",
              fontWeight: 800,
              color: dark ? "#f2f2f2" : C.ink,
              fontFamily: "Georgia,serif",
              letterSpacing: "-0.04em",
              lineHeight: 1,
              animation: "life-logo-float 4s ease-in-out infinite, life-fade-up 0.5s ease 0.05s both",
            }}
          >
            Life.
          </h1>

          {/* Buttons */}
          <div
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: 12,
              animation: "life-fade-up 0.5s ease 0.15s both",
            }}
          >
            <button
              onClick={() => { play("tap"); setScreen("signin"); }}
              style={{
                background: dark ? "#242424" : C.white,
                border: `1.5px solid ${dark ? "#3b3b3b" : C.border}`,
                borderRadius: 14,
                padding: "16px 20px",
                color: dark ? "#f2f2f2" : C.ink,
                fontSize: 16,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "Georgia,serif",
                boxShadow: S.sm,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
              }}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={dark ? "#f2f2f2" : C.ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" />
              </svg>
              Sign In
            </button>
            <button
              onClick={() => { play("tap"); setScreen("register"); }}
              style={{
                background: `linear-gradient(135deg, ${C.green}, #3a7d4a)`,
                border: "none",
                borderRadius: 14,
                padding: "16px 20px",
                color: "#fff",
                fontSize: 16,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "Georgia,serif",
                boxShadow: S.glow,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
              }}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" />
              </svg>
              Create Account
            </button>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "2px 0" }}>
              <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, transparent, ${C.border})` }} />
              <span style={{ color: C.muted, fontSize: 11, fontStyle: "italic", whiteSpace: "nowrap" }}>or continue with</span>
              <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${C.border}, transparent)` }} />
            </div>

            {/* Social buttons */}
            <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
              {AUTH_PROVIDERS.map((item) => (
                <button
                  key={item.key}
                  onClick={() => doProviderSignIn(item)}
                  aria-label={`Continue with ${item.label}`}
                  className="social-btn"
                  style={{
                    width: 56, height: 56,
                    background: C.white,
                    border: `1.5px solid ${item.live ? item.color : C.border}`,
                    borderRadius: 14,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: item.live ? "pointer" : "not-allowed",
                    padding: 12,
                    opacity: item.live ? 1 : 0.5,
                    transition: "all 0.2s ease",
                    boxShadow: item.live ? `0 2px 10px ${item.color}20` : S.sm,
                    position: "relative",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.08)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
                >
                  <Image src={item.file} alt={item.label} width={26} height={26} style={{ width: 26, height: 26, objectFit: "contain", display: "block" }} />
                  {!item.live && (
                    <span style={{ position: "absolute", bottom: 3, fontSize: 7, fontWeight: 700, color: C.muted, letterSpacing: 0.5, textTransform: "uppercase" }}>Soon</span>
                  )}
                </button>
              ))}
            </div>
            {siSocialErr && (
              <p style={{ margin: 0, fontSize: 12, color: C.red, textAlign: "center", fontStyle: "italic" }}>{siSocialErr}</p>
            )}
          </div>

          {/* Footer links */}
          <div style={{ display: "flex", gap: 20, marginTop: 28 }}>
            <button onClick={() => { play("tap"); setScreen("privacy_policy"); }} style={{ background: "none", border: "none", color: C.muted, fontSize: 10, cursor: "pointer", fontFamily: "Georgia,serif", textDecoration: "underline" }}>Privacy</button>
            <button onClick={() => { play("tap"); setScreen("terms_conditions"); }} style={{ background: "none", border: "none", color: C.muted, fontSize: 10, cursor: "pointer", fontFamily: "Georgia,serif", textDecoration: "underline" }}>Terms</button>
          </div>
        </div>
      </div>
    );


  // Sign In
  if (screen === "signin")
    return (
      <div
        data-page-tag="#sign_in_page"
        className="life-grain life-auth-shell"
        style={{
          minHeight: "100svh",
          background: `linear-gradient(165deg, ${C.skin} 0%, #ebe4d6 50%, ${C.skin} 100%)`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Georgia,serif",
          padding: "40px 24px calc(40px + env(safe-area-inset-bottom))",
          position: "relative",
          overflowX: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -40,
            right: -50,
            width: 170,
            height: 170,
            borderRadius: "50%",
            border: "1.5px solid rgba(74,140,92,0.09)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "18%",
            left: -18,
            width: 62,
            height: 62,
            borderRadius: "50%",
            background: "rgba(74,140,92,0.08)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "14%",
            right: "10%",
            width: 110,
            height: 110,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255,255,255,0.55) 0%, rgba(74,140,92,0.07) 68%, rgba(74,140,92,0) 100%)",
            pointerEvents: "none",
          }}
        />
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <p style={{ margin: "0 0 2px", fontSize: 11, fontWeight: 700, letterSpacing: "0.32em", textTransform: "uppercase", color: C.muted, fontStyle: "italic" }}>
            Welcome To
          </p>
          <h1 style={{ margin: "0 0 16px", fontSize: "clamp(3.8rem, 17vw, 6rem)", fontWeight: 800, color: C.ink, fontFamily: "Georgia,serif", letterSpacing: "-0.04em", lineHeight: 0.95 }}>
            Life.
          </h1>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: C.muted, fontFamily: "Georgia,serif", fontStyle: "italic" }}>
            Sign in to continue
          </p>

        <div
          className="life-auth-card"
          style={{
            width: "100%",
            maxWidth: 320,
            display: "flex",
            flexDirection: "column",
            gap: 14,
            background: C.white,
            borderRadius: 20,
            padding: "28px 22px",
            boxShadow:
              "0 8px 32px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)",
            border: `1px solid ${C.border}`,
          }}
        >
          {/* ── Email field ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: 2,
                textTransform: "uppercase",
                color: C.muted,
              }}
            >
              Email
            </label>
            <input
              type="email"
              value={siEmail}
              onChange={(e) => {
                setSiEmail(e.target.value);
                setSiErr("");
              }}
              onKeyDown={(e) => e.key === "Enter" && doEmailSignIn()}
              placeholder="you@example.com"
              autoComplete="email"
              style={{
                background: C.skin,
                border: `1.5px solid ${siErr && !siPass ? C.red : C.border}`,
                borderRadius: 12,
                padding: "14px 16px",
                fontSize: 15,
                color: C.ink,
                outline: "none",
                fontFamily: "Georgia,serif",
                boxSizing: "border-box",
                width: "100%",
                transition: "border-color 0.2s ease",
              }}
              onFocus={(e) => {
                if (!siErr) e.currentTarget.style.borderColor = C.green;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = C.border;
              }}
            />
          </div>

          {/* ── Password field ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: 2,
                textTransform: "uppercase",
                color: C.muted,
              }}
            >
              Password
            </label>
            <div className="life-password-field">
              <input
                type={siShowPass ? "text" : "password"}
                value={siPass}
                onChange={(e) => {
                  setSiPass(e.target.value);
                  setSiErr("");
                }}
                onKeyDown={(e) => e.key === "Enter" && doEmailSignIn()}
                placeholder="Your password"
                autoComplete="current-password"
                style={{
                  background: C.skin,
                  border: `1.5px solid ${C.border}`,
                  borderRadius: 12,
                  padding: "14px 64px 14px 16px",
                  fontSize: 15,
                  color: C.ink,
                  outline: "none",
                  fontFamily: "Georgia,serif",
                  boxSizing: "border-box",
                  width: "100%",
                  transition: "border-color 0.2s ease",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = C.green;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = C.border;
                }}
              />
              <button
                className="life-password-toggle"
                type="button"
                data-password-toggle="true"
                aria-label={siShowPass ? "Hide password" : "Show password"}
                onClick={() => setSiShowPass((v) => !v)}
              >
                <span className="life-password-toggle-label">
                  {siShowPass ? "Hide" : "Show"}
                </span>
              </button>
            </div>
          </div>

          {siErr && (
            <p
              style={{
                margin: "-4px 0 0",
                fontSize: 12,
                color: C.red,
                fontStyle: "italic",
                lineHeight: 1.5,
              }}
            >
              {siErr === "no_account_or_wrong_password" ? (
                <>
                  No account found or incorrect password.{" "}
                  <span
                    onClick={() => {
                      setSiErr("");
                      setScreen("register");
                    }}
                    style={{
                      color: C.green,
                      cursor: "pointer",
                      textDecoration: "underline",
                    }}
                  >
                    Register instead?
                  </span>
                </>
              ) : (
                siErr
              )}
            </p>
          )}

          {/* ── Sign In button ── */}
          <button
            onClick={doEmailSignIn}
            disabled={authLoading}
            style={{
              background: `linear-gradient(135deg, ${C.green}, #3a7d4a)`,
              border: "none",
              borderRadius: 12,
              padding: "16px",
              color: "#fff",
              fontSize: 16,
              fontWeight: 700,
              cursor: authLoading ? "default" : "pointer",
              fontFamily: "Georgia,serif",
              opacity: authLoading ? 0.7 : 1,
              marginTop: 2,
              boxShadow: "0 4px 16px rgba(74,140,92,0.35)",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              if (!authLoading) {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow =
                  "0 6px 20px rgba(74,140,92,0.4)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 4px 16px rgba(74,140,92,0.35)";
            }}
          >
            {authLoading ? "Signing in…" : "Sign In"}
          </button>

          {/* P9a: Forgot Password */}
          <button
            onClick={() => {
              play("tap");
              setForgotMode(true);
              setFpEmail(siEmail);
              setFpErr("");
              setFpMsg("");
            }}
            style={{
              background: "none",
              border: "none",
              color: C.gold,
              fontSize: 12,
              cursor: "pointer",
              fontFamily: "Georgia,serif",
              fontStyle: "italic",
              marginTop: -2,
              textAlign: "center",
            }}
          >
            Forgot your password?
          </button>

          {forgotMode && (
            <div
              style={{
                background: C.white,
                border: `1px solid ${C.border}`,
                borderRadius: 14,
                padding: 20,
                marginTop: 4,
              }}
            >
              <p
                style={{
                  margin: "0 0 8px",
                  fontSize: 14,
                  fontWeight: 700,
                  color: C.ink,
                }}
              >
                Reset Password
              </p>
              <p style={{ margin: "0 0 12px", fontSize: 12, color: C.muted }}>
                Enter your email and we'll send a reset link.
              </p>
              <input
                type="email"
                value={fpEmail}
                onChange={(e) => {
                  setFpEmail(e.target.value);
                  setFpErr("");
                }}
                placeholder="you@example.com"
                onKeyDown={(e) => e.key === "Enter" && doForgotPassword()}
                style={{
                  width: "100%",
                  background: C.skin,
                  border: `1.5px solid ${fpErr ? C.red : C.border}`,
                  borderRadius: 10,
                  padding: "12px 14px",
                  fontSize: 14,
                  color: C.ink,
                  outline: "none",
                  fontFamily: "Georgia,serif",
                  boxSizing: "border-box",
                  marginBottom: 8,
                }}
              />
              {fpErr && (
                <p style={{ margin: "0 0 8px", fontSize: 12, color: C.red }}>
                  {fpErr}
                </p>
              )}
              {fpMsg && (
                <p style={{ margin: "0 0 8px", fontSize: 12, color: C.green }}>
                  {fpMsg}
                </p>
              )}
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={doForgotPassword}
                  disabled={authLoading}
                  style={{
                    flex: 1,
                    background: C.green,
                    border: "none",
                    borderRadius: 10,
                    padding: "10px",
                    color: "#fff",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "Georgia,serif",
                  }}
                >
                  {authLoading ? "Sending…" : "Send Reset Email"}
                </button>
                <button
                  onClick={() => setForgotMode(false)}
                  style={{
                    background: C.light,
                    border: `1px solid ${C.border}`,
                    borderRadius: 10,
                    padding: "10px 14px",
                    color: C.mid,
                    fontSize: 13,
                    cursor: "pointer",
                    fontFamily: "Georgia,serif",
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <button
            onClick={() => {
              play("tap");
              setScreen("landing");
              setSiSocialErr("");
              setSiErr("");
              setSiEmail("");
              setSiPass("");
            }}
            style={{
              background: "none",
              border: "none",
              color: C.muted,
              fontSize: 13,
              cursor: "pointer",
              fontFamily: "Georgia,serif",
              fontStyle: "italic",
              marginTop: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              transition: "color 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = C.ink;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = C.muted;
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
            </svg>
            Back to Home
          </button>

          <p
            style={{
              textAlign: "center",
              color: C.muted,
              fontSize: 13,
              margin: 0,
            }}
          >
            No account?{" "}
            <button
              onClick={() => {
                play("tap");
                setScreen("register");
                setSiSocialErr("");
                setSiErr("");
              }}
              style={{
                background: "none",
                border: "none",
                color: C.green,
                fontSize: 13,
                cursor: "pointer",
                fontFamily: "Georgia,serif",
                fontWeight: 700,
                transition: "opacity 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = "0.7";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = "1";
              }}
            >
              Register
            </button>
          </p>
        </div>
        <p
          className="life-footer"
          style={{
            margin: "28px 0 0",
            color: C.muted,
            fontSize: 10,
            fontStyle: "italic",
            textAlign: "center",
          }}
        >
          © 2026 Life. All rights reserved.
        </p>
      </div>
    );

  // Register
  if (screen === "register")
    return (
      <div
        data-page-tag="#register_page"
        className="life-grain life-auth-shell"
        style={{
          minHeight: "100svh",
          background: `linear-gradient(165deg, ${C.skin} 0%, #ebe4d6 50%, ${C.skin} 100%)`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Georgia,serif",
          padding: "48px 24px calc(40px + env(safe-area-inset-bottom))",
          position: "relative",
          overflowX: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -54,
            right: -44,
            width: 176,
            height: 176,
            borderRadius: "50%",
            border: "1.5px solid rgba(74,140,92,0.09)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "17%",
            left: "7%",
            width: 46,
            height: 46,
            borderRadius: "50%",
            border: "1.5px solid rgba(74,140,92,0.16)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "14%",
            left: -34,
            width: 112,
            height: 112,
            borderRadius: "50%",
            background: "rgba(74,140,92,0.07)",
            pointerEvents: "none",
          }}
        />
        <div style={{ textAlign: "center", marginBottom: 8 }}>
          <p style={{ margin: "0 0 2px", fontSize: 11, fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: C.muted, fontStyle: "italic" }}>
            Welcome To
          </p>
          <h1 style={{ margin: 0, fontSize: "clamp(3.5rem, 16vw, 5.5rem)", fontWeight: 800, color: C.ink, fontFamily: "Georgia,serif", letterSpacing: "-0.04em", lineHeight: 0.95 }}>
            Life.
          </h1>
          <p style={{ margin: "6px 0 20px", fontSize: 13, color: C.muted, fontStyle: "italic" }}>
            Create your account
          </p>
        </div>

        <div
          className="life-auth-card"
          style={{
            width: "100%",
            maxWidth: 320,
            display: "flex",
            flexDirection: "column",
            gap: 16,
            background: C.white,
            borderRadius: 20,
            padding: "28px 22px",
            boxShadow:
              "0 8px 32px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)",
            border: `1px solid ${C.border}`,
          }}
        >
          {/* Full Name */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: 2,
                textTransform: "uppercase",
                color: C.muted,
              }}
            >
              Full Name
            </label>
            <input
              value={rName}
              onChange={(e) => {
                setRName(e.target.value);
                setRErr((p) => ({ ...p, name: null }));
              }}
              placeholder="Your full name"
              autoComplete="name"
              style={{
                background: C.skin,
                border: `1.5px solid ${rErr.name ? C.red : C.border}`,
                borderRadius: 12,
                padding: "14px 16px",
                fontSize: 15,
                color: C.ink,
                outline: "none",
                fontFamily: "Georgia,serif",
                boxSizing: "border-box",
                width: "100%",
                transition: "border-color 0.2s ease",
              }}
              onFocus={(e) => {
                if (!rErr.name) e.currentTarget.style.borderColor = C.green;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = C.border;
              }}
            />
            {rErr.name && (
              <p
                style={{
                  margin: 0,
                  fontSize: 12,
                  color: C.red,
                  fontStyle: "italic",
                }}
              >
                {rErr.name}
              </p>
            )}
          </div>

          {/* Email */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: 2,
                textTransform: "uppercase",
                color: C.muted,
              }}
            >
              Email
            </label>
            <input
              type="email"
              value={rEmail}
              onChange={(e) => {
                setREmail(e.target.value);
                setRErr((p) => ({ ...p, email: null }));
              }}
              placeholder="you@example.com"
              autoComplete="email"
              style={{
                background: C.skin,
                border: `1.5px solid ${rErr.email ? C.red : C.border}`,
                borderRadius: 12,
                padding: "14px 16px",
                fontSize: 15,
                color: C.ink,
                outline: "none",
                fontFamily: "Georgia,serif",
                boxSizing: "border-box",
                width: "100%",
                transition: "border-color 0.2s ease",
              }}
              onFocus={(e) => {
                if (!rErr.email) e.currentTarget.style.borderColor = C.green;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = C.border;
              }}
            />
            {rErr.email && (
              <p
                style={{
                  margin: 0,
                  fontSize: 12,
                  color: rErr.email === "already_registered" ? C.ink : C.red,
                  fontStyle: "italic",
                  lineHeight: 1.6,
                  background: rErr.email === "already_registered" ? "#fff8e1" : "transparent",
                  border: rErr.email === "already_registered" ? "1px solid #f0c040" : "none",
                  borderRadius: rErr.email === "already_registered" ? 8 : 0,
                  padding: rErr.email === "already_registered" ? "8px 12px" : 0,
                }}
              >
                {rErr.email === "already_registered" ? (
                  <>
                    ⚠️ This email is already registered.{" "}
                    <span
                      onClick={() => {
                        play("tap");
                        setRErr({});
                        setScreen("signin");
                        setSiEmail(rEmail);
                      }}
                      style={{ color: C.green, cursor: "pointer", textDecoration: "underline", fontWeight: 700 }}
                    >
                      Sign in instead?
                    </span>
                  </>
                ) : rErr.email}
              </p>
            )}
          </div>

          {/* Date of Birth */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: 2,
                textTransform: "uppercase",
                color: C.muted,
              }}
            >
              Date of Birth
            </label>
            <input
              value={rDob}
              onChange={(e) => {
                let d = e.target.value.replace(/\D/g, "").slice(0, 8);
                let f = d.slice(0, 2);
                if (d.length >= 3) f += "/" + d.slice(2, 4);
                if (d.length >= 5) f += "/" + d.slice(4, 8);
                setRDob(f);
                setRErr((p) => ({ ...p, dob: null }));
              }}
              placeholder="dd/mm/yyyy"
              style={{
                background: C.skin,
                border: `1.5px solid ${rErr.dob ? C.red : C.border}`,
                borderRadius: 12,
                padding: "14px 16px",
                fontSize: 15,
                color: C.ink,
                outline: "none",
                fontFamily: "Georgia,serif",
                boxSizing: "border-box",
                width: "100%",
                transition: "border-color 0.2s ease",
              }}
              onFocus={(e) => {
                if (!rErr.dob) e.currentTarget.style.borderColor = C.green;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = C.border;
              }}
            />
            {rErr.dob && (
              <p
                style={{
                  margin: 0,
                  fontSize: 12,
                  color: C.red,
                  fontStyle: "italic",
                }}
              >
                {rErr.dob}
              </p>
            )}
          </div>

          {/* Password */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: 2,
                textTransform: "uppercase",
                color: C.muted,
              }}
            >
              Password
            </label>
            <div className="life-password-field">
              <input
                type={rShowPass ? "text" : "password"}
                value={rPass}
                onChange={(e) => {
                  setRPass(e.target.value);
                  setRErr((p) => ({ ...p, pass: null, pass2: null }));
                }}
                placeholder="Use 8+ characters"
                autoComplete="new-password"
                style={{
                  background: C.skin,
                  border: `1.5px solid ${rErr.pass ? C.red : C.border}`,
                  borderRadius: 12,
                  padding: "14px 64px 14px 16px",
                  fontSize: 15,
                  color: C.ink,
                  outline: "none",
                  fontFamily: "Georgia,serif",
                  boxSizing: "border-box",
                  width: "100%",
                  transition: "border-color 0.2s ease",
                }}
                onFocus={(e) => {
                  if (!rErr.pass) e.currentTarget.style.borderColor = C.green;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = C.border;
                }}
              />
              <button
                className="life-password-toggle"
                type="button"
                data-password-toggle="true"
                aria-label={rShowPass ? "Hide password" : "Show password"}
                onClick={() => setRShowPass((v) => !v)}
              >
                <span className="life-password-toggle-label">
                  {rShowPass ? "Hide" : "Show"}
                </span>
              </button>
            </div>
            {rPass.length > 0 && (
              <div style={{ marginTop: 2 }}>
                <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        height: 3,
                        borderRadius: 2,
                        background:
                          i < passwordStrength
                            ? passwordStrengthColors[passwordStrength]
                            : C.light,
                        transition: "background 0.2s",
                      }}
                    />
                  ))}
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: 11,
                    color: passwordStrengthColors[passwordStrength],
                    fontStyle: "italic",
                  }}
                >
                  {passwordStrengthLabels[passwordStrength]}
                </p>
                {passwordHint && (
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontSize: 11,
                      color: C.muted,
                      fontStyle: "italic",
                    }}
                  >
                    {passwordHint}
                  </p>
                )}
              </div>
            )}
            {rErr.pass && (
              <p
                style={{
                  margin: 0,
                  fontSize: 12,
                  color: C.red,
                  fontStyle: "italic",
                }}
              >
                {rErr.pass}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: 2,
                textTransform: "uppercase",
                color: C.muted,
              }}
            >
              Confirm Password
            </label>
            <div className="life-password-field">
              <input
                type={rShowPass2 ? "text" : "password"}
                value={rPass2}
                onChange={(e) => {
                  setRPass2(e.target.value);
                  setRErr((p) => ({ ...p, pass2: null }));
                }}
                placeholder="Repeat password"
                autoComplete="new-password"
                style={{
                  background: C.skin,
                  border: `1.5px solid ${rErr.pass2 || confirmMismatch ? C.red : C.border}`,
                  borderRadius: 12,
                  padding: "14px 64px 14px 16px",
                  fontSize: 15,
                  color: C.ink,
                  outline: "none",
                  fontFamily: "Georgia,serif",
                  boxSizing: "border-box",
                  width: "100%",
                  transition: "border-color 0.2s ease",
                }}
                onFocus={(e) => {
                  if (!rErr.pass2 && !confirmMismatch)
                    e.currentTarget.style.borderColor = C.green;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor =
                    rErr.pass2 || confirmMismatch ? C.red : C.border;
                }}
              />
              <button
                className="life-password-toggle"
                type="button"
                data-password-toggle="true"
                aria-label={rShowPass2 ? "Hide password" : "Show password"}
                onClick={() => setRShowPass2((v) => !v)}
              >
                <span className="life-password-toggle-label">
                  {rShowPass2 ? "Hide" : "Show"}
                </span>
              </button>
            </div>
            {!rErr.pass2 && confirmMismatch && (
              <p
                style={{
                  margin: 0,
                  fontSize: 12,
                  color: C.red,
                  fontStyle: "italic",
                }}
              >
                Not Matching Yet
              </p>
            )}
            {rErr.pass2 && (
              <p
                style={{
                  margin: 0,
                  fontSize: 12,
                  color: C.red,
                  fontStyle: "italic",
                }}
              >
                {rErr.pass2}
              </p>
            )}
          </div>

          <button
            onClick={doRegister}
            disabled={authLoading}
            style={{
              background: `linear-gradient(135deg, ${C.green}, #3a7d4a)`,
              border: "none",
              borderRadius: 12,
              padding: "17px",
              color: "#fff",
              fontSize: 16,
              fontWeight: 700,
              cursor: authLoading ? "default" : "pointer",
              fontFamily: "Georgia,serif",
              marginTop: 4,
              opacity: authLoading ? 0.7 : 1,
              boxShadow: "0 4px 16px rgba(74,140,92,0.35)",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              if (!authLoading) {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow =
                  "0 6px 20px rgba(74,140,92,0.4)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 4px 16px rgba(74,140,92,0.35)";
            }}
          >
            {authLoading ? "Creating account…" : "Create Account"}
          </button>

          <button
            onClick={() => {
              play("tap");
              setScreen("landing");
              setRErr({});
            }}
            style={{
              background: "none",
              border: "none",
              color: C.muted,
              fontSize: 13,
              cursor: "pointer",
              fontFamily: "Georgia,serif",
              fontStyle: "italic",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              transition: "color 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = C.ink;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = C.muted;
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
            </svg>
            Back to Home
          </button>

          <p
            style={{
              textAlign: "center",
              color: C.muted,
              fontSize: 11,
              fontStyle: "italic",
              lineHeight: 1.7,
              margin: 0,
            }}
          >
            By registering you agree to Life.'s terms of use. You must be 13+ to
            join.
          </p>
        </div>
        <p
          className="life-footer"
          style={{
            margin: "28px 0 0",
            color: C.muted,
            fontSize: 10,
            fontStyle: "italic",
            textAlign: "center",
          }}
        >
          © 2026 Life. All rights reserved.
        </p>
      </div>
    );

  // ── MAIN APP ──────────────────────────────────────────────────
  // Keep the layout primitives straightforward because this will likely be ported into a native app shell later.
  return (
    <div
      data-page-tag="#dashboard_home"
      style={{
        minHeight: "100svh",
        background: t.skin,
        display: "flex",
        flexDirection: "column",
        fontFamily: "Georgia,serif",
        color: t.ink,
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
            color: dark ? "#222" : "#fff",
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
            top: 56,
            right: 60,
            zIndex: 200,
            background: t.white,
            border: `1px solid ${t.border}`,
            borderRadius: 14,
            boxShadow: S.lg,
            width: 300,
            maxHeight: 360,
            overflowY: "auto",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 16px",
              borderBottom: `1px solid ${t.light}`,
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
          {notifications.length === 0 ? (
            <p
              style={{
                padding: 16,
                color: t.muted,
                fontSize: 13,
                textAlign: "center",
              }}
            >
              No notifications yet.
            </p>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                style={{
                  padding: "12px 16px",
                  borderBottom: `1px solid ${t.light}`,
                  background: n.read ? "transparent" : t.greenLt,
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: 13,
                    color: t.ink,
                    lineHeight: 1.5,
                  }}
                >
                  {n.text}
                </p>
                <p style={{ margin: "4px 0 0", fontSize: 10, color: t.muted }}>
                  {n.time}
                </p>
              </div>
            ))
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
            alignItems: "center",
            gap: 10,
            flexShrink: 0,
          }}
        >
          <button
            onClick={() => {
              play("tap");
              setSidebarOpen(!sidebarOpen);
            }}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              gap: 5,
              padding: "6px 4px",
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
            toggleDark();
          }}
          title={dark ? "Light mode" : "Dark mode"}
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
                width: 14,
                height: 14,
                borderRadius: "50%",
                background: t.red,
                color: "#fff",
                fontSize: 8,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {unreadCount}
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

        {/* SIDEBAR */}
        <div
          className="life-sidebar"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            bottom: 0,
            width: 288,
            maxWidth: "min(288px, 100vw)",
            background: t.white,
            borderRight: `1px solid ${t.border}`,
            overflowY: "auto",
            WebkitOverflowScrolling: "touch",
            zIndex: 40,
            transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
            transition: "transform 0.28s cubic-bezier(0.4,0,0.2,1)",
            paddingTop: "env(safe-area-inset-top, 0px)",
            paddingBottom: "calc(60px + env(safe-area-inset-bottom, 0px))",
          }}
        >
          {/* User card */}
          <div
            style={{
              padding: "12px 16px 10px",
              borderBottom: `1px solid ${t.border}22`,
              display: "flex",
              flexDirection: "column",
              gap: 8,
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
          <SS
            theme={t}
            playFn={play}
            label="Life"
            open={lifeOpen}
            setOpen={setLifeOpen}
            tag="#side_bar_life"
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
              label="Quiz"
              icon="brain"
              onClick={() => {
                play("tap");
                setPage("quiz");
                setSidebarOpen(false);
              }}
              active={page === "quiz"}
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
          >
            {Object.entries(LIBRARY).map(([k, node]) => (
              <TreeNode
                key={k}
                nodeKey={k}
                node={node}
                depth={0}
                onSelect={handleSelect}
                selectedKey={selKey}
                defaultOpen={k === "life"}
                play={play}
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
            style={{
              padding: "20px 18px 8px",
              borderTop: `1px solid ${t.light}`,
              marginTop: 16,
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
              <div
                style={{
                  paddingBottom:
                    "calc(60px + env(safe-area-inset-bottom, 0px))",
                }}
              >
                {/* PROGRESS BAR — P6: clickable → progress_dashboard */}
                <button
                  type="button"
                  onClick={() => {
                    play("tap");
                    setPage("progress_dashboard");
                  }}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "14px 20px 12px",
                    background: t.white,
                    border: "none",
                    borderBottom: `1px solid ${t.border}`,
                    cursor: "pointer",
                    textAlign: "left",
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
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: 2,
                        textTransform: "uppercase",
                        color: t.muted,
                      }}
                    >
                      Your Progress
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        color: t.green,
                        fontWeight: 700,
                        letterSpacing: 0.5,
                      }}
                    >
                      {progressPercent}%
                    </span>
                  </div>
                  <div
                    className="life-home-progress-row"
                    style={{ display: "flex", alignItems: "center", gap: 14 }}
                  >
                    <div
                      style={{
                        flex: 1,
                        minWidth: 0,
                        height: 6,
                        background: t.light,
                        borderRadius: 10,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${progressPercent}%`,
                          background: `linear-gradient(90deg,${t.green},#6FBE77)`,
                          borderRadius: 10,
                          transition: "width 0.6s cubic-bezier(0.4,0,0.2,1)",
                        }}
                      />
                    </div>
                    <span
                      style={{
                        fontSize: 11,
                        color: t.green,
                        fontWeight: 700,
                        letterSpacing: 0.5,
                        flexShrink: 0,
                      }}
                    >
                      {readKeys.length}
                      <span style={{ color: t.muted, fontWeight: 400 }}>
                        /{allContent.length}
                      </span>
                    </span>
                    {readingStreak.count > 0 && (
                      <span
                        title="Consecutive days you've opened a topic"
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          letterSpacing: 1,
                          textTransform: "uppercase",
                          color: t.green,
                          background: t.greenLt,
                          border: `1px solid rgba(74,140,92,0.35)`,
                          borderRadius: 20,
                          padding: "6px 12px",
                          flexShrink: 0,
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        🔥 {readingStreak.count} day streak
                      </span>
                    )}
                  </div>
                </button>

                <div
                  style={{
                    padding: "10px 20px 0",
                    maxWidth: 560,
                    margin: "0 auto",
                  }}
                >
                  <button
                    onClick={openMomentumHub}
                    style={{
                      width: "100%",
                      background: "none",
                      border: `1px solid ${t.border}`,
                      borderRadius: 12,
                      padding: "10px 16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      cursor: "pointer",
                      fontFamily: "Georgia,serif",
                    }}
                  >
                    <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: t.muted }}>
                      ⚡ Life Momentum
                    </span>
                    <span style={{ fontSize: 11, color: t.green, fontWeight: 600 }}>View →</span>
                  </button>
                </div>

                {resumeEntry && !resumeTipDismissed && (
                  <div
                    style={{
                      padding: "14px 20px 0",
                      maxWidth: 520,
                      margin: "0 auto",
                    }}
                  >
                    <div
                      className="life-card-hover life-resume-card"
                      style={{
                        background: `linear-gradient(135deg, ${t.white} 0%, ${t.greenLt} 100%)`,
                        border: `1px solid rgba(74,140,92,0.35)`,
                        borderRadius: 16,
                        padding: "16px 18px",
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        boxShadow: S.md,
                      }}
                    >
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 12,
                          background: t.green,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          boxShadow: "0 4px 12px rgba(74,140,92,0.35)",
                        }}
                      >
                        <span style={{ color: "#fff", fontSize: 18 }}>↻</span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p
                          style={{
                            margin: "0 0 4px",
                            fontSize: 9,
                            fontWeight: 700,
                            letterSpacing: 2.2,
                            textTransform: "uppercase",
                            color: t.green,
                          }}
                        >
                          Continue
                        </p>
                        <p
                          style={{
                            margin: 0,
                            fontSize: 15,
                            fontWeight: 700,
                            color: t.ink,
                            lineHeight: 1.35,
                          }}
                        >
                          {resumeEntry.node.label}
                        </p>
                        <p
                          style={{
                            margin: "4px 0 0",
                            fontSize: 12,
                            color: t.muted,
                            fontStyle: "italic",
                          }}
                        >
                          {resumeEntry.node.content?.readTime
                            ? `${resumeEntry.node.content.readTime} read · `
                            : ""}
                          Pick up where you left off
                        </p>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 6,
                          flexShrink: 0,
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            play("tap");
                            handleSelect(resumeEntry.key, resumeEntry.node);
                          }}
                          style={{
                            background: t.green,
                            border: "none",
                            borderRadius: 10,
                            padding: "10px 16px",
                            color: "#fff",
                            fontSize: 13,
                            fontWeight: 700,
                            cursor: "pointer",
                            fontFamily: "Georgia,serif",
                            whiteSpace: "nowrap",
                            boxShadow: "0 4px 14px rgba(74,140,92,0.28)",
                          }}
                        >
                          Open
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            play("tap");
                            setResumeTipDismissed(true);
                            clearResumeTopic();
                          }}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: t.muted,
                            fontSize: 11,
                            cursor: "pointer",
                            fontFamily: "Georgia,serif",
                            textDecoration: "underline",
                          }}
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* HERO */}
                <div
                  className="life-home-hero"
                  style={{
                    padding: "36px 24px 32px",
                    textAlign: "center",
                    borderBottom: `1px solid ${t.border}`,
                    background: dark
                      ? `linear-gradient(180deg, ${t.skin} 0%, #111 100%)`
                      : `linear-gradient(180deg, ${t.skin} 0%, #e8e0d0 100%)`,
                  }}
                >
                  <p
                    style={{
                      margin: "0 0 10px",
                      fontSize: "clamp(0.72rem, 2.8vw, 0.92rem)",
                      fontWeight: 700,
                      letterSpacing: "0.38em",
                      textTransform: "uppercase",
                      color: t.muted,
                      textAlign: "center",
                      lineHeight: 1.2,
                    }}
                  >
                    {(() => { const h = new Date().getHours(); return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening"; })()}{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
                  </p>
                  <h1
                    style={{
                      margin: "0 0 6px",
                      fontSize: "clamp(3.2rem, 15vw, 6.2rem)",
                      fontWeight: 800,
                      color: t.ink,
                      fontFamily: "Georgia,serif",
                      letterSpacing: "-0.04em",
                      lineHeight: 0.92,
                      textAlign: "center",
                      WebkitTextSizeAdjust: "100%",
                    }}
                  >
                    Life.
                  </h1>
                  <div
                    style={{
                      width: 40,
                      height: 2.5,
                      background: t.green,
                      borderRadius: 2,
                      margin: "18px auto 22px",
                    }}
                  />
                  <p
                    style={{
                      color: t.mid,
                      fontSize: 13,
                      lineHeight: 1.7,
                      margin: "0 auto 6px",
                      maxWidth: 340,
                      fontFamily: "Georgia,serif",
                    }}
                  >
                    All-In-One Access To Tailored Networking, Insights, And
                    Comprehensive Guides
                  </p>
                  <p
                    style={{
                      color: t.muted,
                      fontSize: 10,
                      lineHeight: 1.5,
                      margin: "0 auto 32px",
                      maxWidth: 300,
                      fontStyle: "italic",
                    }}
                  >
                    "The 1st Million Is Hard, But The 2nd Is Imminent" - Without
                    Knowledge, You Can’t Identify The Right Opportunities
                  </p>
                  <div
                    style={{
                      display: "flex",
                      gap: 10,
                      justifyContent: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    <button
                      onClick={() => {
                        play("open");
                        setSidebarOpen(true);
                      }}
                      style={{
                        background: t.green,
                        border: "none",
                        borderRadius: 14,
                        padding: "15px 32px",
                        color: "#fff",
                        fontSize: 15,
                        fontWeight: 700,
                        cursor: "pointer",
                        fontFamily: "Georgia,serif",
                        boxShadow: S.glow,
                        letterSpacing: 0.3,
                      }}
                    >
                      Start Reading →
                    </button>
                    <button
                      onClick={() => {
                        play("tap");
                        setPage("where_to_start");
                      }}
                      style={{
                        background: t.white,
                        border: `1.5px solid ${t.border}`,
                        borderRadius: 14,
                        padding: "15px 24px",
                        color: t.ink,
                        fontSize: 15,
                        fontWeight: 600,
                        cursor: "pointer",
                        fontFamily: "Georgia,serif",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        boxShadow: S.sm,
                      }}
                    >
                      {Ic.leaf("none", t.green, 17)} Daily Growth
                    </button>
                    {/* P7: Let's Get Rich → Categories */}
                    <button
                      onClick={() => {
                        play("ok");
                        setPage("categories");
                        setCatStep(0);
                      }}
                      style={{
                        background: `linear-gradient(135deg, ${t.gold}, #9a7a3e)`,
                        border: "none",
                        borderRadius: 14,
                        padding: "15px 24px",
                        color: "#fff",
                        fontSize: 15,
                        fontWeight: 700,
                        cursor: "pointer",
                        fontFamily: "Georgia,serif",
                        boxShadow: "0 4px 16px rgba(184,151,90,0.35)",
                        letterSpacing: 0.3,
                      }}
                    >
                      Let&apos;s Get Rich 💰
                    </button>
                  </div>
                </div>

                <div style={{ padding: "18px 20px 0" }}>
                  <div
                    className="life-home-stats"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                      gap: 10,
                      maxWidth: 560,
                      margin: "0 auto",
                    }}
                  >
                    {homeStats.map((stat) => (
                      <div
                        key={stat.label}
                        style={{
                          background: t.white,
                          border: `1px solid ${t.border}`,
                          borderRadius: 14,
                          padding: "14px 12px",
                          textAlign: "center",
                          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                        }}
                      >
                        <span
                          style={{
                            fontSize: 20,
                            fontWeight: 800,
                            color: stat.color,
                            display: "block",
                            lineHeight: 1,
                          }}
                        >
                          {stat.value}
                        </span>
                        <span
                          style={{
                            fontSize: 9,
                            fontWeight: 600,
                            letterSpacing: 1,
                            textTransform: "uppercase",
                            color: t.muted,
                            display: "block",
                            marginTop: 6,
                          }}
                        >
                          {stat.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* P3: Author Message (replaces "What's Inside") */}
                <div style={{ padding: "32px 20px 0" }}>
                  <div
                    style={{
                      maxWidth: 500,
                      margin: "0 auto",
                      background: `linear-gradient(135deg, ${t.white} 0%, ${t.greenLt} 100%)`,
                      border: `1px solid rgba(74,140,92,0.25)`,
                      borderRadius: 18,
                      padding: "28px 24px",
                      boxShadow: S.md,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        marginBottom: 16,
                      }}
                    >
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: "50%",
                          background: `linear-gradient(135deg, ${t.green}, #3a7d4a)`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <span
                          style={{
                            color: "#fff",
                            fontSize: 16,
                            fontWeight: 800,
                          }}
                        >
                          l.
                        </span>
                      </div>
                      <div>
                        <p
                          style={{
                            margin: 0,
                            fontSize: 10,
                            fontWeight: 700,
                            letterSpacing: 2.5,
                            textTransform: "uppercase",
                            color: t.green,
                          }}
                        >
                          From the Author
                        </p>
                        <p
                          style={{
                            margin: "2px 0 0",
                            fontSize: 14,
                            fontWeight: 700,
                            color: t.ink,
                          }}
                        >
                          A Message For You
                        </p>
                      </div>
                    </div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 14,
                        color: t.mid,
                        lineHeight: 1.8,
                        fontFamily: "Georgia,serif",
                        fontStyle: "italic",
                      }}
                    >
                      &ldquo;I built Life. because I wished someone had given me
                      this when I was starting out. No fluff, no gatekeeping —
                      just the real knowledge about money, mindset, and growth
                      that actually moves the needle. This isn&apos;t another
                      course or motivational speech. It&apos;s the structured
                      friend I never had. Welcome — let&apos;s build something
                      real together.&rdquo;
                    </p>
                  </div>
                </div>

                {/* GUIDED — START HERE */}
                <div
                  style={{
                    padding: "36px 20px 0",
                    maxWidth: 500,
                    margin: "0 auto",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      marginBottom: 18,
                    }}
                  >
                    <div style={{ flex: 1, height: 1, background: t.border }} />
                    <p
                      style={{
                        margin: 0,
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: 3,
                        textTransform: "uppercase",
                        color: t.muted,
                        whiteSpace: "nowrap",
                      }}
                    >
                      Start here
                    </p>
                    <div style={{ flex: 1, height: 1, background: t.border }} />
                  </div>
                  {GUIDED_ORDER.slice(0, 4).map((k, i) => {
                    const node = CONTENT[k];
                    if (!node) return null;
                    return (
                      <button
                        key={k}
                        onClick={() => {
                          play("open");
                          handleSelect(k, node);
                        }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 14,
                          width: "100%",
                          background: t.white,
                          border: `1px solid ${t.border}`,
                          borderRadius: 14,
                          padding: "16px 18px",
                          cursor: "pointer",
                          marginBottom: 10,
                          textAlign: "left",
                          fontFamily: "Georgia,serif",
                          boxSizing: "border-box",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                          transition: "all 0.18s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = "#c8ddc8";
                          e.currentTarget.style.boxShadow =
                            "0 4px 14px rgba(74,140,92,0.11)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = t.border;
                          e.currentTarget.style.boxShadow =
                            "0 1px 3px rgba(0,0,0,0.04)";
                        }}
                      >
                        <div
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: 10,
                            background: t.green,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <span
                            style={{
                              color: "#fff",
                              fontSize: 13,
                              fontWeight: 800,
                              fontFamily: "Georgia,serif",
                            }}
                          >
                            {i + 1}
                          </span>
                        </div>
                        <div style={{ flex: 1 }}>
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
                              fontSize: 11,
                              color: t.muted,
                              marginTop: 2,
                              fontStyle: "italic",
                            }}
                          >
                            {node.content?.level}
                          </div>
                        </div>
                        <svg width="8" height="8" viewBox="0 0 10 10">
                          <polyline
                            points="2,2 8,5 2,8"
                            fill="none"
                            stroke={t.muted}
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {page === "where_to_start" && (
              <div
                data-page-tag="#where_to_start"
                style={{
                  padding: "48px 28px",
                  maxWidth: 560,
                  margin: "0 auto",
                }}
              >
                <h2
                  style={{
                    fontSize: 26,
                    fontWeight: 700,
                    color: t.ink,
                    margin: "0 0 10px",
                    fontFamily: "Georgia,serif",
                  }}
                >
                  Where To Start?
                </h2>
                <p
                  style={{
                    color: t.muted,
                    fontSize: 15,
                    lineHeight: 1.8,
                    margin: "0 0 32px",
                    fontStyle: "italic",
                  }}
                >
                  New to Life.? This is the recommended reading order.
                </p>
                {[
                  {
                    step: 1,
                    label: "Start with Money",
                    desc: "Understand what money actually is before anything else.",
                    key: "money",
                  },
                  {
                    step: 2,
                    label: "Finance Basics for your country",
                    desc: "Australia or America — learn the system you live inside.",
                    key: "basics_au2",
                  },
                  {
                    step: 3,
                    label: "The Psychological Game of Money",
                    desc: "Your beliefs about money matter more than your strategy.",
                    key: "psych_money",
                  },
                  {
                    step: 4,
                    label: "Secrets About Money",
                    desc: "The mechanisms nobody explains in school.",
                    key: "secrets",
                  },
                  {
                    step: 5,
                    label: "Generating Income",
                    desc: "The honest framework for building financial independence.",
                    key: "gen_income",
                  },
                ].map((item) => (
                  <button
                    key={item.step}
                    onClick={() => handleSelect(item.key, CONTENT[item.key])}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 16,
                      width: "100%",
                      background: t.white,
                      border: `1px solid ${t.border}`,
                      borderRadius: 12,
                      padding: "20px",
                      cursor: "pointer",
                      marginBottom: 12,
                      textAlign: "left",
                      fontFamily: "Georgia,serif",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = t.light)
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = t.white)
                    }
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background: t.green,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <span
                        style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}
                      >
                        {item.step}
                      </span>
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: 15,
                          fontWeight: 700,
                          color: t.ink,
                          marginBottom: 4,
                        }}
                      >
                        {item.label}
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          color: t.muted,
                          fontStyle: "italic",
                        }}
                      >
                        {item.desc}
                      </div>
                    </div>
                  </button>
                ))}
                <div
                  style={{
                    marginTop: 28,
                    padding: 22,
                    background: t.greenLt,
                    border: `1px solid ${t.green}`,
                    borderRadius: 14,
                  }}
                >
                  <p
                    style={{
                      margin: "0 0 6px",
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: 2.5,
                      textTransform: "uppercase",
                      color: t.green,
                    }}
                  >
                    Test yourself
                  </p>
                  <p
                    style={{
                      margin: "0 0 14px",
                      fontSize: 15,
                      color: t.ink,
                      fontFamily: "Georgia,serif",
                    }}
                  >
                    Once you have read a few topics, test your knowledge with a
                    timed quiz.
                  </p>
                  <button
                    onClick={() => {
                      play("open");
                      setPage("quiz");
                    }}
                    style={{
                      background: t.green,
                      border: "none",
                      borderRadius: 10,
                      padding: "12px 22px",
                      color: "#fff",
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: "pointer",
                      fontFamily: "Georgia,serif",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      {Ic.brain("none", "#fff", 17)} Go to Quiz
                    </span>
                  </button>
                </div>
              </div>
            )}

            {page === "quiz" && (
              <Suspense fallback={<RouteFallback />}>
                <QuizPage
                  play={play}
                  userId={isSupabaseConfigured ? user?.id : null}
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
                    const target = typeof nextPage === "string" ? nextPage : "home";
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

            {page === "help" && (
              <div
                data-page-tag="#help"
                style={{
                  padding: "48px 28px",
                  maxWidth: 560,
                  margin: "0 auto",
                }}
              >
                <h2
                  style={{
                    fontSize: 28,
                    fontWeight: 700,
                    color: t.ink,
                    margin: "0 0 12px",
                  }}
                >
                  Help
                </h2>
                <p
                  style={{
                    color: t.muted,
                    fontSize: 15,
                    lineHeight: 1.8,
                    margin: "0 0 32px",
                    fontStyle: "italic",
                  }}
                >
                  Everything you need to know about using Life.
                </p>
                {[
                  [
                    "How do I navigate the app?",
                    "Tap the menu icon top left to open the sidebar. Browse Library folders or jump into Guided for a curated path.",
                  ],
                  [
                    "How do I save topics?",
                    "Tap the ☆ star on any reading page. All saved topics appear in the Saved section in the sidebar.",
                  ],
                  [
                    "How do I take notes?",
                    "Open any topic and tap the Notes tab. Write your thoughts and tap Save.",
                  ],
                  [
                    "What is Post-It?",
                    "The Life. community feed. Share insights, ask questions, and discuss topics with other readers.",
                  ],
                  [
                    "What is the Quiz?",
                    "Test your knowledge on Finance, Psychology, and Money. Pick easy, medium, or hard. Three formats: Multiple Choice, True/False, and Blitz.",
                  ],
                  [
                    "What is Guided?",
                    "A curated sequence designed to take you from zero understanding of money to a solid foundation.",
                  ],
                  [
                    "Keyboard shortcuts",
                    "Press / to focus search (when not typing in a field). Press ? to open this Help page. Reading progress per topic is saved automatically when you turn pages.",
                  ],
                  [
                    "Share a topic",
                    "While reading, use Copy link to get a URL with #read=topicKey. Anyone with the link can jump straight into that article after signing in.",
                  ],
                  [
                    "Legal pages",
                    "Open Privacy Policy, Terms, and Cookie Notice from Profile → Setting → Tools & Legal.",
                  ],
                ].map(([q, a]) => (
                  <div
                    key={q}
                    style={{
                      background: t.white,
                      border: `1px solid ${t.border}`,
                      borderRadius: 12,
                      padding: "20px 22px",
                      marginBottom: 12,
                    }}
                  >
                    <p
                      style={{
                        margin: "0 0 8px",
                        fontSize: 15,
                        fontWeight: 700,
                        color: t.ink,
                      }}
                    >
                      {q}
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 14,
                        color: t.mid,
                        lineHeight: 1.7,
                        fontFamily: "Georgia,serif",
                      }}
                    >
                      {a}
                    </p>
                  </div>
                ))}
              </div>
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

            {page === "networking" && (
              <div
                data-page-tag="#networking"
                style={{
                  padding: "40px 28px",
                  maxWidth: 520,
                  margin: "0 auto",
                }}
              >
                <h2
                  style={{
                    fontSize: 24,
                    fontWeight: 700,
                    color: t.ink,
                    margin: "0 0 10px",
                  }}
                >
                  Networking Group
                </h2>
                <p
                  style={{
                    color: t.muted,
                    fontSize: 15,
                    lineHeight: 1.8,
                    margin: "0 0 32px",
                    fontStyle: "italic",
                  }}
                >
                  Connect with others building real knowledge and financial
                  independence.
                </p>
                {/* P9b: Discord Integration */}
                <div
                  style={{
                    background: t.greenLt,
                    border: `1px solid ${t.green}`,
                    borderRadius: 16,
                    padding: 28,
                    textAlign: "center",
                  }}
                >
                  <p
                    style={{
                      margin: "0 0 8px",
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: 2.5,
                      textTransform: "uppercase",
                      color: t.green,
                    }}
                  >
                    Life. Community
                  </p>
                  <p
                    style={{
                      margin: "0 0 20px",
                      fontSize: 16,
                      fontWeight: 700,
                      color: t.ink,
                    }}
                  >
                    Join the Discord Server
                  </p>
                  <div
                    style={{
                      background: t.white,
                      border: `1px solid ${t.border}`,
                      borderRadius: 10,
                      padding: "14px 20px",
                      display: "inline-block",
                      marginBottom: 20,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 22,
                        fontWeight: 800,
                        letterSpacing: 3,
                        color: t.ink,
                        fontFamily: "Georgia,serif",
                      }}
                    >
                      #12345
                    </span>
                  </div>
                  <p
                    style={{
                      margin: "0 0 20px",
                      fontSize: 13,
                      color: t.muted,
                      fontStyle: "italic",
                    }}
                  >
                    Use invite code #12345 at discord.gg/life
                  </p>
                  <button
                    onClick={() => window.open("https://discord.gg", "_blank")}
                    style={{
                      background: "#5865F2",
                      border: "none",
                      borderRadius: 12,
                      padding: "14px 32px",
                      color: "#fff",
                      fontSize: 15,
                      fontWeight: 700,
                      cursor: "pointer",
                      fontFamily: "Georgia,serif",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 71 55" fill="#fff">
                      <path d="M60.1 4.9A58.5 58.5 0 0045.4.2a.2.2 0 00-.2.1 40.8 40.8 0 00-1.8 3.7 54 54 0 00-16.2 0A37.6 37.6 0 0025.4.3a.2.2 0 00-.2-.1A58.4 58.4 0 0010.5 4.9a.2.2 0 00-.1.1C1.5 18.7-.9 32.2.3 45.5v.1a58.7 58.7 0 0017.7 9 .2.2 0 00.3-.1 42 42 0 003.6-5.9.2.2 0 00-.1-.3 38.7 38.7 0 01-5.5-2.6.2.2 0 01 0-.4l1.1-.9a.2.2 0 01.2 0 41.9 41.9 0 0035.6 0 .2.2 0 01.2 0l1.1.9a.2.2 0 010 .4 36.3 36.3 0 01-5.5 2.6.2.2 0 00-.1.3 47.2 47.2 0 003.6 5.9.2.2 0 00.3.1 58.5 58.5 0 0017.7-9v-.1c1.4-15.2-2.4-28.4-10-40.1a.2.2 0 00-.1-.1zM23.7 37.3c-3.5 0-6.3-3.2-6.3-7.1s2.8-7.1 6.3-7.1 6.4 3.2 6.3 7.1c0 3.9-2.8 7.1-6.3 7.1zm23.2 0c-3.5 0-6.3-3.2-6.3-7.1s2.8-7.1 6.3-7.1 6.4 3.2 6.3 7.1c0 3.9-2.8 7.1-6.3 7.1z" />
                    </svg>
                    Open Discord
                  </button>
                </div>
                {/* Discord embed placeholder */}
                <div
                  style={{
                    marginTop: 20,
                    background: t.white,
                    border: `1px solid ${t.border}`,
                    borderRadius: 14,
                    padding: 20,
                    textAlign: "center",
                  }}
                >
                  <p
                    style={{
                      margin: "0 0 8px",
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: 2,
                      textTransform: "uppercase",
                      color: t.muted,
                    }}
                  >
                    Live Community
                  </p>
                  <iframe
                    title="Discord Widget"
                    src="https://discord.com/widget?id=000000000000000000&theme=light"
                    width="100%"
                    height="300"
                    frameBorder="0"
                    sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
                    style={{
                      borderRadius: 10,
                      border: `1px solid ${t.border}`,
                    }}
                  />
                </div>
              </div>
            )}

            {/* P7: Categories flow */}
            {page === "categories" && (
              <div
                data-page-tag="#categories"
                style={{
                  padding: "48px 28px",
                  maxWidth: 560,
                  margin: "0 auto",
                }}
              >
                {catStep < CATEGORIES.length ? (
                  (() => {
                    const cat = CATEGORIES[catStep];
                    const displayNum = catStep < 4 ? catStep + 1 : catStep + 2; // skip #5
                    return (
                      <div style={{ textAlign: "center" }}>
                        <p
                          style={{
                            margin: "0 0 12px",
                            fontSize: 10,
                            fontWeight: 700,
                            letterSpacing: 3,
                            textTransform: "uppercase",
                            color: t.muted,
                          }}
                        >
                          Category {displayNum} of {CATEGORIES.length + 1}
                        </p>
                        <div
                          style={{
                            width: 70,
                            height: 70,
                            borderRadius: 20,
                            background: t.greenLt,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 20px",
                          }}
                        >
                          {Ic[cat.icon]?.("none", t.green, 32)}
                        </div>
                        <h2
                          style={{
                            fontSize: 28,
                            fontWeight: 700,
                            color: t.ink,
                            margin: "0 0 12px",
                          }}
                        >
                          {cat.label}
                        </h2>
                        <p
                          style={{
                            color: t.mid,
                            fontSize: 15,
                            lineHeight: 1.7,
                            margin: "0 0 32px",
                            maxWidth: 400,
                            marginLeft: "auto",
                            marginRight: "auto",
                          }}
                        >
                          {cat.desc}
                        </p>
                        <div
                          style={{
                            display: "flex",
                            gap: 12,
                            justifyContent: "center",
                          }}
                        >
                          {catStep > 0 && (
                            <button
                              onClick={() => {
                                play("back");
                                setCatStep(catStep - 1);
                              }}
                              style={{
                                background: t.white,
                                border: `1.5px solid ${t.border}`,
                                borderRadius: 12,
                                padding: "14px 24px",
                                color: t.mid,
                                fontSize: 15,
                                fontWeight: 600,
                                cursor: "pointer",
                                fontFamily: "Georgia,serif",
                              }}
                            >
                              ← Back
                            </button>
                          )}
                          <button
                            onClick={() => {
                              play("ok");
                              setCatStep(catStep + 1);
                            }}
                            style={{
                              background: t.green,
                              border: "none",
                              borderRadius: 12,
                              padding: "14px 32px",
                              color: "#fff",
                              fontSize: 15,
                              fontWeight: 700,
                              cursor: "pointer",
                              fontFamily: "Georgia,serif",
                              boxShadow: S.glow,
                            }}
                          >
                            {catStep === CATEGORIES.length - 1
                              ? "Complete →"
                              : "Next →"}
                          </button>
                        </div>
                        {/* progress dots */}
                        <div
                          style={{
                            display: "flex",
                            gap: 6,
                            justifyContent: "center",
                            marginTop: 24,
                          }}
                        >
                          {CATEGORIES.map((_, i) => (
                            <div
                              key={i}
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                background: i <= catStep ? t.green : t.border,
                                transition: "background 0.2s",
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  /* Congratulations / Certified page */
                  <div
                    data-page-tag="#certified_page"
                    style={{ textAlign: "center", padding: "40px 0" }}
                  >
                    <div
                      style={{
                        width: 90,
                        height: 90,
                        borderRadius: "50%",
                        background: `linear-gradient(135deg, ${t.green}, #6FBE77)`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 24px",
                        boxShadow: "0 8px 32px rgba(74,140,92,0.35)",
                      }}
                    >
                      <span style={{ fontSize: 40 }}>🏆</span>
                    </div>
                    <h1
                      style={{
                        fontSize: 32,
                        fontWeight: 800,
                        color: t.ink,
                        margin: "0 0 12px",
                      }}
                    >
                      Congratulations!
                    </h1>
                    <p
                      style={{
                        color: t.green,
                        fontSize: 12,
                        fontWeight: 700,
                        letterSpacing: 3,
                        textTransform: "uppercase",
                        margin: "0 0 20px",
                      }}
                    >
                      Certified Life. Graduate
                    </p>
                    <p
                      style={{
                        color: t.mid,
                        fontSize: 15,
                        lineHeight: 1.7,
                        margin: "0 auto 32px",
                        maxWidth: 400,
                      }}
                    >
                      You&apos;ve completed all the core categories. You now
                      have the foundation to build real wealth and knowledge.
                      Keep going — the journey never ends.
                    </p>
                    <div
                      style={{
                        background: t.white,
                        border: `2px solid ${t.green}`,
                        borderRadius: 18,
                        padding: "28px 24px",
                        maxWidth: 380,
                        margin: "0 auto 28px",
                        boxShadow: S.lg,
                      }}
                    >
                      <p
                        style={{
                          margin: "0 0 6px",
                          fontSize: 10,
                          fontWeight: 700,
                          letterSpacing: 2.5,
                          textTransform: "uppercase",
                          color: t.green,
                        }}
                      >
                        Certificate of Completion
                      </p>
                      <p
                        style={{
                          margin: "0 0 4px",
                          fontSize: 18,
                          fontWeight: 700,
                          color: t.ink,
                        }}
                      >
                        {user?.name || "User"}
                      </p>
                      <p
                        style={{
                          margin: 0,
                          fontSize: 12,
                          color: t.muted,
                          fontStyle: "italic",
                        }}
                      >
                        Has completed all Life. categories
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        play("ok");
                        setPage("home");
                      }}
                      style={{
                        background: t.green,
                        border: "none",
                        borderRadius: 12,
                        padding: "14px 32px",
                        color: "#fff",
                        fontSize: 15,
                        fontWeight: 700,
                        cursor: "pointer",
                        fontFamily: "Georgia,serif",
                      }}
                    >
                      Back to Home
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* P6: Progress Dashboard */}
            {page === "progress_dashboard" && (
              <div
                data-page-tag="#progress_dashboard"
                style={{
                  padding: "48px 28px",
                  maxWidth: 560,
                  margin: "0 auto",
                }}
              >
                <h2
                  style={{
                    fontSize: 26,
                    fontWeight: 700,
                    color: t.ink,
                    margin: "0 0 10px",
                  }}
                >
                  Progress Dashboard
                </h2>
                <p
                  style={{
                    color: t.muted,
                    fontSize: 15,
                    lineHeight: 1.8,
                    margin: "0 0 28px",
                    fontStyle: "italic",
                  }}
                >
                  Track your journey and see how far you&apos;ve come.
                </p>
                <div style={{ marginBottom: 20 }}>
                  <MomentumCard
                    snapshot={momentumSnapshot}
                    onOpenHub={openMomentumHub}
                    title="Momentum summary"
                  />
                </div>
                <div
                  style={{
                    background: t.white,
                    border: `1px solid ${t.border}`,
                    borderRadius: 16,
                    padding: 24,
                    marginBottom: 20,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 12,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: 2,
                        textTransform: "uppercase",
                        color: t.muted,
                      }}
                    >
                      Overall Progress
                    </span>
                    <span
                      style={{ fontSize: 22, fontWeight: 800, color: t.green }}
                    >
                      {progressPercent}%
                    </span>
                  </div>
                  <div
                    style={{
                      height: 10,
                      borderRadius: 10,
                      background: t.light,
                      overflow: "hidden",
                      marginBottom: 12,
                    }}
                  >
                    <div
                      style={{
                        width: `${progressPercent}%`,
                        height: "100%",
                        borderRadius: 10,
                        background: `linear-gradient(90deg, ${t.green}, #6FBE77)`,
                        transition: "width 0.6s",
                      }}
                    />
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: t.muted }}>
                    {readKeys.length} of {allContent.length} topics completed
                  </p>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 12,
                    marginBottom: 20,
                  }}
                >
                  {[
                    {
                      label: "Topics Read",
                      value: readKeys.length,
                      color: t.green,
                    },
                    {
                      label: "Bookmarks",
                      value: bookmarks.length,
                      color: t.gold,
                    },
                    { label: "Notes", value: completedNotes, color: t.green },
                    {
                      label: "Streak",
                      value:
                        readingStreak.count > 0
                          ? `${readingStreak.count}d`
                          : "0d",
                      color: t.red,
                    },
                  ].map((s) => (
                    <div
                      key={s.label}
                      style={{
                        background: t.white,
                        border: `1px solid ${t.border}`,
                        borderRadius: 14,
                        padding: "18px 14px",
                        textAlign: "center",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 24,
                          fontWeight: 800,
                          color: s.color,
                          display: "block",
                        }}
                      >
                        {s.value}
                      </span>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          letterSpacing: 1,
                          textTransform: "uppercase",
                          color: t.muted,
                          marginTop: 4,
                          display: "block",
                        }}
                      >
                        {s.label}
                      </span>
                    </div>
                  ))}
                </div>
                <div
                  style={{
                    background: t.white,
                    border: `1px solid ${t.border}`,
                    borderRadius: 16,
                    padding: 24,
                  }}
                >
                  <p
                    style={{
                      margin: "0 0 16px",
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: 2.5,
                      textTransform: "uppercase",
                      color: t.muted,
                    }}
                  >
                    Challenges
                  </p>
                  {[
                    {
                      text: "Record yourself talking on a random topic — no ums or ahs",
                      done: false,
                    },
                    {
                      text: "Read 5 topics in a single day",
                      done: readKeys.length >= 5,
                    },
                    { text: "Save 3 bookmarks", done: bookmarks.length >= 3 },
                    {
                      text: "Write your first note on any topic",
                      done: completedNotes > 0,
                    },
                    {
                      text: "Complete the tailoring questionnaire",
                      done: !!profile,
                    },
                    {
                      text: "Maintain a 3-day reading streak",
                      done: readingStreak.count >= 3,
                    },
                  ].map((ch) => (
                    <div
                      key={ch.text}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "12px 0",
                        borderBottom: `1px solid ${t.light}`,
                      }}
                    >
                      <div
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: "50%",
                          background: ch.done ? t.green : t.light,
                          border: `2px solid ${ch.done ? t.green : t.border}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        {ch.done && (
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#fff"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>
                      <span
                        style={{
                          fontSize: 14,
                          color: ch.done ? t.green : t.mid,
                          fontFamily: "Georgia,serif",
                          textDecoration: ch.done ? "line-through" : "none",
                        }}
                      >
                        {ch.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* P9d: Leaderboard */}
            {page === "leaderboard" && (
              <div
                data-page-tag="#leaderboard"
                style={{
                  padding: "48px 28px",
                  maxWidth: 560,
                  margin: "0 auto",
                }}
              >
                <h2
                  style={{
                    fontSize: 26,
                    fontWeight: 700,
                    color: t.ink,
                    margin: "0 0 10px",
                  }}
                >
                  Leaderboard
                </h2>
                <p
                  style={{
                    color: t.muted,
                    fontSize: 15,
                    lineHeight: 1.8,
                    margin: "0 0 28px",
                    fontStyle: "italic",
                  }}
                >
                  See how you stack up against other Life. members.
                </p>
                {(() => {
                  const userScore = readKeys.length * 10 + bookmarks.length * 5;
                  const entries = [
                    { name: "You", score: userScore, isUser: true },
                    { name: "Alex T.", score: 420 },
                    { name: "Jordan M.", score: 380 },
                    { name: "Sam K.", score: 310 },
                    { name: "Riley P.", score: 275 },
                    { name: "Casey L.", score: 220 },
                    { name: "Morgan D.", score: 185 },
                  ].sort((a, b) => b.score - a.score).map((e, i) => ({ ...e, rank: i + 1 }));

                  return entries.map((entry) => (
                    <div
                      key={entry.name}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        padding: "14px 18px",
                        background: entry.isUser
                          ? `linear-gradient(90deg, ${t.greenLt}, transparent)`
                          : "transparent",
                        borderRadius: 12,
                        border: entry.isUser ? `1px solid ${t.green}22` : `1px solid transparent`,
                        marginBottom: 6,
                        transition: "background 0.2s",
                      }}
                    >
                      <span
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          background: entry.rank <= 3
                            ? ["#FFD700","#C0C0C0","#CD7F32"][entry.rank - 1]
                            : t.light,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 12,
                          fontWeight: 800,
                          color: entry.rank <= 3 ? "#fff" : t.muted,
                          flexShrink: 0,
                        }}
                      >
                        {entry.rank}
                      </span>
                      <span
                        style={{
                          flex: 1,
                          fontSize: 15,
                          fontWeight: entry.isUser ? 700 : 500,
                          color: entry.isUser ? t.green : t.ink,
                        }}
                      >
                        {entry.name}{entry.isUser ? " (You)" : ""}
                      </span>
                      <span
                        style={{
                          fontSize: 15,
                          fontWeight: 700,
                          color: entry.rank === 1 ? t.gold : t.muted,
                        }}
                      >
                        {entry.score} pts
                      </span>
                    </div>
                  ));
                })()}
              </div>
            )}

                        {/* Daily Growth page */}
            {page === "daily_growth" && (
              <div
                data-page-tag="#daily_growth"
                style={{
                  padding: "48px 28px",
                  maxWidth: 560,
                  margin: "0 auto",
                }}
              >
                <h2
                  style={{
                    fontSize: 26,
                    fontWeight: 700,
                    color: t.ink,
                    margin: "0 0 10px",
                  }}
                >
                  Daily Growth
                </h2>
                <p
                  style={{
                    color: t.muted,
                    fontSize: 15,
                    lineHeight: 1.8,
                    margin: "0 0 28px",
                    fontStyle: "italic",
                  }}
                >
                  Small daily actions that compound into life-changing results.
                </p>
                {[
                  {
                    title: "Morning Reflection",
                    desc: "Spend 5 minutes journaling about your goals before the day begins.",
                    icon: "star",
                  },
                  {
                    title: "Learn One Thing",
                    desc: "Read at least one topic in Life. today. Knowledge compounds.",
                    icon: "lightbulb",
                  },
                  {
                    title: "Network",
                    desc: "Send one message to someone you admire or want to connect with.",
                    icon: "users",
                  },
                  {
                    title: "Practice Speaking",
                    desc: "Record yourself for 2 minutes on any topic. No fillers.",
                    icon: "brain",
                  },
                  {
                    title: "Review Finances",
                    desc: "Check your accounts. Know your numbers. Awareness creates control.",
                    icon: "wallet",
                  },
                  {
                    title: "Evening Audit",
                    desc: "Before bed, write down 3 things you accomplished and 1 thing to improve.",
                    icon: "leaf",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    style={{
                      background: t.white,
                      border: `1px solid ${t.border}`,
                      borderRadius: 14,
                      padding: "18px 20px",
                      marginBottom: 12,
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 14,
                    }}
                  >
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 10,
                        background: t.greenLt,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {Ic[item.icon]?.("none", t.green, 18)}
                    </div>
                    <div>
                      <p
                        style={{
                          margin: "0 0 4px",
                          fontSize: 15,
                          fontWeight: 700,
                          color: t.ink,
                        }}
                      >
                        {item.title}
                      </p>
                      <p
                        style={{
                          margin: 0,
                          fontSize: 13,
                          color: t.muted,
                          lineHeight: 1.6,
                        }}
                      >
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Extra: Mentorship Booking */}
            {page === "mentorship" && (
              <div
                data-page-tag="#mentorship"
                style={{
                  padding: "48px 28px",
                  maxWidth: 560,
                  margin: "0 auto",
                }}
              >
                <h2
                  style={{
                    fontSize: 26,
                    fontWeight: 700,
                    color: t.ink,
                    margin: "0 0 10px",
                  }}
                >
                  Mentorship
                </h2>
                <p
                  style={{
                    color: t.muted,
                    fontSize: 15,
                    lineHeight: 1.8,
                    margin: "0 0 28px",
                    fontStyle: "italic",
                  }}
                >
                  Book a 1-on-1 session with experienced mentors.
                </p>
                {[
                  {
                    name: "Finance Strategy Session",
                    duration: "30 min",
                    price: "Premium",
                    desc: "Get personalised advice on budgeting, investing, and financial planning.",
                  },
                  {
                    name: "Career Growth Call",
                    duration: "45 min",
                    price: "Premium",
                    desc: "Discuss career moves, side hustles, and income diversification.",
                  },
                  {
                    name: "Mindset Coaching",
                    duration: "30 min",
                    price: "Premium",
                    desc: "Break through limiting beliefs and develop a wealth-building mindset.",
                  },
                ].map((s) => (
                  <div
                    key={s.name}
                    style={{
                      background: t.white,
                      border: `1px solid ${t.border}`,
                      borderRadius: 16,
                      padding: 22,
                      marginBottom: 14,
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
                      <h3
                        style={{
                          margin: 0,
                          fontSize: 16,
                          fontWeight: 700,
                          color: t.ink,
                        }}
                      >
                        {s.name}
                      </h3>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          letterSpacing: 1,
                          textTransform: "uppercase",
                          color: t.gold,
                          background: `${t.gold}18`,
                          borderRadius: 6,
                          padding: "3px 8px",
                        }}
                      >
                        {s.price}
                      </span>
                    </div>
                    <p
                      style={{
                        margin: "0 0 12px",
                        fontSize: 13,
                        color: t.muted,
                        lineHeight: 1.6,
                      }}
                    >
                      {s.desc}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <span style={{ fontSize: 12, color: t.muted }}>
                        ⏱ {s.duration}
                      </span>
                      <button
                        onClick={() => { play("tap"); setPage("premium"); }}
                        style={{
                          background: t.green,
                          border: "none",
                          borderRadius: 10,
                          padding: "10px 20px",
                          color: "#fff",
                          fontSize: 13,
                          fontWeight: 700,
                          cursor: "pointer",
                          fontFamily: "Georgia,serif",
                        }}
                      >
                        Book Now →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* P10: Setting Preferences */}
            {page === "setting_preferences" && (
              <div
                className="life-settings-page"
                data-page-tag="#setting_preferences"
                style={{
                  padding: "48px 28px",
                  maxWidth: 720,
                  margin: "0 auto",
                }}
              >
                <button
                  onClick={() => {
                    play("back");
                    setPage("profile");
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: t.muted,
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
                  Back to Profile
                </button>
                <h2
                  style={{
                    fontSize: 26,
                    fontWeight: 700,
                    color: t.ink,
                    margin: "0 0 8px",
                  }}
                >
                  Settings
                </h2>
                <p
                  className="life-settings-subtitle"
                  style={{
                    margin: "0 0 24px",
                    color: t.muted,
                    fontSize: 14,
                    lineHeight: 1.7,
                    fontStyle: "italic",
                  }}
                >
                  Cleanly organised controls for appearance, accessibility,
                  motion, sound, privacy, and account tools.
                </p>
                {[
                  {
                    tag: "#setting_appearance",
                    title: "Appearance",
                    desc: "Theme, contrast, and reading comfort",
                    items: [
                      {
                        label: "Dark Mode",
                        desc: "Switch between light and dark themes",
                        value: dark,
                        onChange: toggleDark,
                      },
                      {
                        label: "High Contrast",
                        desc: "Sharpen separation and text readability",
                        value: uiPrefs.highContrast,
                        onChange: (v) => updateUiPrefs({ highContrast: v }),
                      },
                    ],
                  },
                  {
                    tag: "#setting_motion",
                    title: "Motion & Performance",
                    desc: "Make the app feel smoother, lighter, and easier to scan",
                    items: [
                      {
                        label: "Reduce Motion",
                        desc: "Calmer animations and less movement",
                        value: uiPrefs.reduceMotion,
                        onChange: (v) => updateUiPrefs({ reduceMotion: v }),
                      },
                      {
                        label: "Data Saver",
                        desc: "Lower visual effect cost and heavy rendering",
                        value: uiPrefs.dataSaver,
                        onChange: (v) => updateUiPrefs({ dataSaver: v }),
                      },
                      {
                        label: "Instant Button Response",
                        desc: "Reduce perceived tap delay on fast interactions",
                        value: uiPrefs.instantButtons,
                        onChange: (v) => updateUiPrefs({ instantButtons: v }),
                      },
                    ],
                  },
                  {
                    tag: "#setting_sound",
                    title: "Sound",
                    desc: "Feedback sounds and listening comfort",
                    items: [
                      {
                        label: "Sound Effects",
                        desc: "Toggle all sound effects",
                        value: uiPrefs.soundEnabled,
                        onChange: (v) => updateUiPrefs({ soundEnabled: v }),
                      },
                    ],
                  },
                  {
                    tag: "#setting_account",
                    title: "Account & Progress",
                    desc: "Reset tools and account actions live below",
                    items: [],
                  },
                  {
                    tag: "#setting_privacy",
                    title: "Privacy & Legal",
                    desc: "Policy links and export tools live below",
                    items: [],
                  },
                ].map((section) => (
                  <div
                    className="life-settings-card"
                    key={section.title}
                    data-page-tag={section.tag}
                    style={{
                      background: t.white,
                      border: `1px solid ${t.border}`,
                      borderRadius: 16,
                      padding: 22,
                      marginBottom: 16,
                    }}
                  >
                    <p
                      style={{
                        margin: "0 0 14px",
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: 2.5,
                        textTransform: "uppercase",
                        color: t.muted,
                      }}
                    >
                      {section.title}
                    </p>
                    {section.desc && (
                      <p
                        style={{
                          margin: "-6px 0 14px",
                          fontSize: 13,
                          color: t.muted,
                          lineHeight: 1.55,
                          fontStyle: "italic",
                        }}
                      >
                        {section.desc}
                      </p>
                    )}
                    {section.items.length === 0 && (
                      <p
                        style={{
                          margin: 0,
                          fontSize: 13,
                          color: t.muted,
                          fontStyle: "italic",
                        }}
                      >
                        Organised tools for this section are available below.
                      </p>
                    )}
                    {section.items.map((item) => (
                      <label
                        className="life-settings-row"
                        key={item.label}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 12,
                          padding: "10px 0",
                          borderBottom: `1px solid ${t.light}`,
                        }}
                      >
                        <div>
                          <p
                            style={{
                              margin: 0,
                              fontSize: 14,
                              fontWeight: 700,
                              color: t.ink,
                            }}
                          >
                            {item.label}
                          </p>
                          <p
                            style={{
                              margin: "2px 0 0",
                              fontSize: 12,
                              color: t.muted,
                            }}
                          >
                            {item.desc}
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={!!item.value}
                          onChange={(e) =>
                            item.onChange(
                              typeof item.value === "boolean"
                                ? e.target.checked
                                : e.target.checked,
                            )
                          }
                          style={{
                            width: 20,
                            height: 20,
                            accentColor: t.green,
                          }}
                        />
                      </label>
                    ))}
                  </div>
                ))}
                <div
                  className="life-settings-action-grid"
                  style={{ display: "flex", flexWrap: "wrap", gap: 8 }}
                >
                  <button
                    onClick={() => {
                      updateUiPrefs(PREF_DEFAULTS);
                      play("ok");
                    }}
                    style={{
                      background: t.light,
                      border: `1px solid ${t.border}`,
                      borderRadius: 10,
                      padding: "10px 16px",
                      color: t.mid,
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                      fontFamily: "Georgia,serif",
                    }}
                  >
                    Restore Defaults
                  </button>
                  <button
                    onClick={() => {
                      setReadKeys([]);
                      play("ok");
                    }}
                    style={{
                      background: t.light,
                      border: `1px solid ${t.border}`,
                      borderRadius: 10,
                      padding: "10px 16px",
                      color: t.mid,
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                      fontFamily: "Georgia,serif",
                    }}
                  >
                    Reset Progress
                  </button>
                  <button
                    onClick={() => {
                      setProfile(null);
                      LS.del(`tsd_${uid}`);
                      trackMomentumEvent("profile", {
                        source: "settings",
                        points: 2,
                        meta: { action: "tailor_reset" },
                      });
                      play("ok");
                    }}
                    style={{
                      background: t.light,
                      border: `1px solid ${t.border}`,
                      borderRadius: 10,
                      padding: "10px 16px",
                      color: t.mid,
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                      fontFamily: "Georgia,serif",
                    }}
                  >
                    Reset Tailoring
                  </button>
                </div>
              </div>
            )}

            {/* Extra: Premium / Payment */}
            {page === "premium" && (
              <div
                data-page-tag="#premium"
                style={{
                  padding: "48px 28px",
                  maxWidth: 560,
                  margin: "0 auto",
                  textAlign: "center",
                }}
              >
                <h2
                  style={{
                    fontSize: 28,
                    fontWeight: 800,
                    color: t.ink,
                    margin: "0 0 8px",
                  }}
                >
                  Go Premium
                </h2>
                <p
                  style={{
                    color: t.muted,
                    fontSize: 15,
                    lineHeight: 1.7,
                    margin: "0 0 32px",
                    fontStyle: "italic",
                  }}
                >
                  Unlock the full Life. experience.
                </p>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                    gap: 14,
                    maxWidth: 420,
                    margin: "0 auto",
                  }}
                >
                  {[
                    {
                      tier: "Basic",
                      price: "Free",
                      features: [
                        "Core reading content",
                        "Daily Growth tips",
                        "Community access",
                        "Basic quiz",
                      ],
                    },
                    {
                      tier: "Premium",
                      price: "$9.99/mo",
                      features: [
                        "All Basic features",
                        "Mentorship booking",
                        "Leaderboard access",
                        "Advanced challenges",
                        "Certificate of Completion",
                        "Priority support",
                      ],
                    },
                  ].map((plan) => (
                    <div
                      key={plan.tier}
                      style={{
                        background:
                          plan.tier === "Premium"
                            ? `linear-gradient(135deg, ${t.greenLt}, ${t.white})`
                            : t.white,
                        border: `2px solid ${plan.tier === "Premium" ? t.green : t.border}`,
                        borderRadius: 18,
                        padding: "24px 16px",
                        textAlign: "center",
                      }}
                    >
                      <p
                        style={{
                          margin: "0 0 4px",
                          fontSize: 10,
                          fontWeight: 700,
                          letterSpacing: 2,
                          textTransform: "uppercase",
                          color: plan.tier === "Premium" ? t.green : t.muted,
                        }}
                      >
                        {plan.tier}
                      </p>
                      <p
                        style={{
                          margin: "0 0 16px",
                          fontSize: 24,
                          fontWeight: 800,
                          color: t.ink,
                        }}
                      >
                        {plan.price}
                      </p>
                      {plan.features.map((f) => (
                        <p
                          key={f}
                          style={{
                            margin: "0 0 6px",
                            fontSize: 12,
                            color: t.mid,
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <span style={{ color: t.green }}>✓</span> {f}
                        </p>
                      ))}
                      <button
                        onClick={() => play("tap")}
                        style={{
                          marginTop: 16,
                          width: "100%",
                          background:
                            plan.tier === "Premium" ? t.green : t.light,
                          border:
                            plan.tier === "Premium"
                              ? "none"
                              : `1px solid ${t.border}`,
                          borderRadius: 10,
                          padding: "12px",
                          color: plan.tier === "Premium" ? "#fff" : t.mid,
                          fontSize: 13,
                          fontWeight: 700,
                          cursor: "pointer",
                          fontFamily: "Georgia,serif",
                        }}
                      >
                        {plan.tier === "Premium" ? "Subscribe" : "Current Plan"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {page === "profile" && (
              <div
                className="life-profile-page"
                data-page-tag="#profile"
                style={{
                  padding: "48px 28px",
                  maxWidth: 480,
                  margin: "0 auto",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 20,
                    marginBottom: 36,
                  }}
                >
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    <div
                      style={{
                        width: 74,
                        height: 74,
                        borderRadius: "50%",
                        background: `linear-gradient(135deg, ${t.green}, #2d6e42)`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: `0 0 0 3px ${t.white}, 0 0 0 5px ${t.green}44`,
                      }}
                    >
                      <span
                        style={{ fontSize: 26, fontWeight: 800, color: "#fff", letterSpacing: -0.5 }}
                      >
                        {initials}
                      </span>
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <h2
                      style={{
                        margin: "0 0 4px",
                        fontSize: 22,
                        fontWeight: 700,
                        color: t.ink,
                      }}
                    >
                      {user?.name}
                    </h2>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 14,
                        color: t.muted,
                        fontStyle: "italic",
                      }}
                    >
                      {user?.email}
                    </p>
                  </div>
                  {/* P10: Gear icon → setting_preferences */}
                  <button
                    onClick={() => {
                      play("tap");
                      setPage("setting_preferences");
                    }}
                    title="Settings"
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      background: t.light,
                      border: `1px solid ${t.border}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      flexShrink: 0,
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
                      <circle cx="12" cy="12" r="3" />
                      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
                    </svg>
                  </button>
                </div>
                <div
                  className="life-profile-card"
                  style={{
                    background: t.white,
                    border: `1px solid ${t.border}`,
                    borderRadius: 14,
                    padding: 24,
                    marginBottom: 20,
                  }}
                >
                  <p
                    style={{
                      margin: "0 0 16px",
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: 2.5,
                      textTransform: "uppercase",
                      color: t.muted,
                    }}
                  >
                    Your Stats
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {[
                      { label: "Topics Read", value: readKeys.length, icon: "📖", color: t.green },
                      { label: "Bookmarks", value: bookmarks.length, icon: "🔖", color: t.gold },
                      { label: "Notes", value: completedNotes, icon: "✏️", color: t.mid },
                      { label: readingStreak.count > 0 ? `${readingStreak.count} day streak` : "Streak", value: readingStreak.count > 0 ? "🔥" : "—", icon: "", color: t.green },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        style={{
                          background: t.skin,
                          border: `1px solid ${t.border}`,
                          borderRadius: 12,
                          padding: "14px 12px",
                          textAlign: "center",
                        }}
                      >
                        <div style={{ fontSize: 22, marginBottom: 4 }}>{stat.icon}</div>
                        <div style={{ fontSize: 22, fontWeight: 800, color: stat.color, fontFamily: "Georgia,serif", lineHeight: 1 }}>
                          {stat.value}
                        </div>
                        <div style={{ fontSize: 10, color: t.muted, marginTop: 4, fontWeight: 600, letterSpacing: 0.5 }}>
                          {stat.label}
                        </div>
                      </div>
                    ))}
                  </div>                </div>
                <div style={{ marginBottom: 20 }}>
                  <MomentumCard
                    snapshot={momentumSnapshot}
                    onOpenHub={openMomentumHub}
                    title="Your momentum"
                  />
                </div>
                <div
                  className="life-profile-card"
                  style={{
                    background: t.white,
                    border: `1px solid ${t.border}`,
                    borderRadius: 14,
                    padding: 22,
                    marginBottom: 20,
                  }}
                >
                  <p
                    style={{
                      margin: "0 0 16px",
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: 2.5,
                      textTransform: "uppercase",
                      color: t.muted,
                    }}
                  >
                    Settings Hub
                  </p>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 6,
                      marginBottom: 12,
                    }}
                  >
                    {[
                      "Experience",
                      "Sound",
                      "Display",
                      "Motion",
                      "Tools",
                      "Account",
                    ].map((item) => (
                      <span
                        key={item}
                        style={{
                          fontSize: 10,
                          color: t.muted,
                          border: `1px solid ${t.border}`,
                          borderRadius: 999,
                          padding: "4px 8px",
                          background: t.white,
                          letterSpacing: 0.6,
                          textTransform: "uppercase",
                        }}
                      >
                        {item}
                      </span>
                    ))}
                  </div>

                  <div style={{ display: "grid", gap: 14 }}>
                    <div style={{ marginTop: 2 }}>
                      <p
                        style={{
                          margin: "0 0 8px",
                          fontSize: 10,
                          fontWeight: 700,
                          letterSpacing: 2.2,
                          textTransform: "uppercase",
                          color: t.muted,
                        }}
                      >
                        Quick Presets
                      </p>
                    </div>
                    <div style={{ display: "grid", gap: 8 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 10,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 14,
                            fontWeight: 700,
                            color: t.ink,
                          }}
                        >
                          Experience Profile
                        </span>
                        <span style={{ fontSize: 12, color: t.muted }}>
                          Quick apply
                        </span>
                      </div>
                      <div
                        style={{ display: "flex", flexWrap: "wrap", gap: 8 }}
                      >
                        <button
                          type="button"
                          onClick={() => applySettingProfile("focus")}
                          style={{
                            background: t.white,
                            border: `1px solid ${t.border}`,
                            borderRadius: 10,
                            padding: "8px 12px",
                            color: t.mid,
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: "pointer",
                            fontFamily: "Georgia,serif",
                          }}
                        >
                          Focus
                        </button>
                        <button
                          type="button"
                          onClick={() => applySettingProfile("immersive")}
                          style={{
                            background: t.greenLt,
                            border: `1px solid ${t.green}`,
                            borderRadius: 10,
                            padding: "8px 12px",
                            color: t.green,
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: "pointer",
                            fontFamily: "Georgia,serif",
                          }}
                        >
                          Immersive
                        </button>
                        <button
                          type="button"
                          onClick={() => applySettingProfile("calm")}
                          style={{
                            background: t.light,
                            border: `1px solid ${t.border}`,
                            borderRadius: 10,
                            padding: "8px 12px",
                            color: t.mid,
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: "pointer",
                            fontFamily: "Georgia,serif",
                          }}
                        >
                          Calm
                        </button>
                      </div>
                    </div>

                    <div
                      style={{
                        marginTop: 4,
                        paddingTop: 10,
                        borderTop: `1px solid ${t.light}`,
                      }}
                    >
                      <p
                        style={{
                          margin: "0 0 8px",
                          fontSize: 10,
                          fontWeight: 700,
                          letterSpacing: 2.2,
                          textTransform: "uppercase",
                          color: t.muted,
                        }}
                      >
                        Sound
                      </p>
                    </div>
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 10,
                      }}
                    >
                      <div>
                        <p
                          style={{
                            margin: 0,
                            fontSize: 14,
                            fontWeight: 700,
                            color: t.ink,
                          }}
                        >
                          Sound Effects
                        </p>
                        <p
                          style={{
                            margin: "3px 0 0",
                            fontSize: 12,
                            color: t.muted,
                            fontStyle: "italic",
                          }}
                        >
                          Button and feedback sounds
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={!!uiPrefs.soundEnabled}
                        onChange={(e) => {
                          const next = e.target.checked;
                          if (next) play("ok");
                          updateUiPrefs({ soundEnabled: next });
                        }}
                        style={{ width: 20, height: 20, accentColor: t.green }}
                      />
                    </label>

                    <label style={{ display: "grid", gap: 8 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 10,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 14,
                            fontWeight: 700,
                            color: t.ink,
                          }}
                        >
                          Sound Volume
                        </span>
                        <span style={{ fontSize: 12, color: t.muted }}>
                          {uiPrefs.soundVolume}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        step={1}
                        value={uiPrefs.soundVolume}
                        disabled={!uiPrefs.soundEnabled}
                        onChange={(e) =>
                          updateUiPrefs({ soundVolume: Number(e.target.value) })
                        }
                        style={{ accentColor: t.green }}
                      />
                    </label>

                    <label style={{ display: "grid", gap: 8 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 10,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 14,
                            fontWeight: 700,
                            color: t.ink,
                          }}
                        >
                          Sound Style
                        </span>
                        <span
                          style={{
                            fontSize: 12,
                            color: t.muted,
                            textTransform: "capitalize",
                          }}
                        >
                          {uiPrefs.soundMode || "focused"}
                        </span>
                      </div>
                      <select
                        value={uiPrefs.soundMode || "focused"}
                        disabled={!uiPrefs.soundEnabled}
                        onChange={(e) =>
                          updateUiPrefs({ soundMode: e.target.value })
                        }
                        style={{
                          background: t.white,
                          border: `1px solid ${t.border}`,
                          borderRadius: 10,
                          padding: "10px 12px",
                          color: t.ink,
                          fontSize: 13,
                          fontFamily: "Georgia,serif",
                        }}
                      >
                        <option value="focused">Focused (very minimal)</option>
                        <option value="balanced">Balanced</option>
                        <option value="full">Full feedback</option>
                      </select>
                    </label>

                    <label style={{ display: "grid", gap: 8 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 10,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 14,
                            fontWeight: 700,
                            color: t.ink,
                          }}
                        >
                          Sound Scope
                        </span>
                        <span
                          style={{
                            fontSize: 12,
                            color: t.muted,
                            textTransform: "capitalize",
                          }}
                        >
                          {uiPrefs.soundScope || "balanced"}
                        </span>
                      </div>
                      <select
                        value={uiPrefs.soundScope || "balanced"}
                        disabled={!uiPrefs.soundEnabled}
                        onChange={(e) =>
                          updateUiPrefs({ soundScope: e.target.value })
                        }
                        style={{
                          background: t.white,
                          border: `1px solid ${t.border}`,
                          borderRadius: 10,
                          padding: "10px 12px",
                          color: t.ink,
                          fontSize: 13,
                          fontFamily: "Georgia,serif",
                        }}
                      >
                        <option value="focused">
                          Focused (important only)
                        </option>
                        <option value="balanced">Balanced</option>
                        <option value="full">Full (all interactions)</option>
                      </select>
                    </label>

                    <div
                      style={{
                        marginTop: 4,
                        paddingTop: 10,
                        borderTop: `1px solid ${t.light}`,
                      }}
                    >
                      <p
                        style={{
                          margin: "0 0 8px",
                          fontSize: 10,
                          fontWeight: 700,
                          letterSpacing: 2.2,
                          textTransform: "uppercase",
                          color: t.muted,
                        }}
                      >
                        Display
                      </p>
                    </div>
                    <label style={{ display: "grid", gap: 8 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 10,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 14,
                            fontWeight: 700,
                            color: t.ink,
                          }}
                        >
                          Text Size
                        </span>
                        <span style={{ fontSize: 12, color: t.muted }}>
                          {uiPrefs.textScale || 100}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min={88}
                        max={122}
                        step={1}
                        value={uiPrefs.textScale ?? 100}
                        onChange={(e) =>
                          updateUiPrefs({ textScale: Number(e.target.value) })
                        }
                        style={{ accentColor: t.green }}
                      />
                    </label>

                    <label style={{ display: "grid", gap: 8 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 10,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 14,
                            fontWeight: 700,
                            color: t.ink,
                          }}
                        >
                          Reading Density
                        </span>
                        <span
                          style={{
                            fontSize: 12,
                            color: t.muted,
                            textTransform: "capitalize",
                          }}
                        >
                          {uiPrefs.readingDensity || "comfortable"}
                        </span>
                      </div>
                      <select
                        value={uiPrefs.readingDensity || "comfortable"}
                        onChange={(e) =>
                          updateUiPrefs({ readingDensity: e.target.value })
                        }
                        style={{
                          background: t.white,
                          border: `1px solid ${t.border}`,
                          borderRadius: 10,
                          padding: "10px 12px",
                          color: t.ink,
                          fontSize: 13,
                          fontFamily: "Georgia,serif",
                        }}
                      >
                        <option value="compact">Compact</option>
                        <option value="comfortable">Comfortable</option>
                        <option value="airy">Airy</option>
                      </select>
                    </label>

                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 10,
                      }}
                    >
                      <div>
                        <p
                          style={{
                            margin: 0,
                            fontSize: 14,
                            fontWeight: 700,
                            color: t.ink,
                          }}
                        >
                          High Contrast
                        </p>
                        <p
                          style={{
                            margin: "3px 0 0",
                            fontSize: 12,
                            color: t.muted,
                            fontStyle: "italic",
                          }}
                        >
                          Sharper text and stronger separation
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={!!uiPrefs.highContrast}
                        onChange={(e) =>
                          updateUiPrefs({ highContrast: e.target.checked })
                        }
                        style={{ width: 20, height: 20, accentColor: t.green }}
                      />
                    </label>

                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 10,
                      }}
                    >
                      <div>
                        <p
                          style={{
                            margin: 0,
                            fontSize: 14,
                            fontWeight: 700,
                            color: t.ink,
                          }}
                        >
                          Data Saver
                        </p>
                        <p
                          style={{
                            margin: "3px 0 0",
                            fontSize: 12,
                            color: t.muted,
                            fontStyle: "italic",
                          }}
                        >
                          Reduces heavy visual effects and motion cost
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={!!uiPrefs.dataSaver}
                        onChange={(e) =>
                          updateUiPrefs({ dataSaver: e.target.checked })
                        }
                        style={{ width: 20, height: 20, accentColor: t.green }}
                      />
                    </label>

                    <div
                      style={{
                        marginTop: 4,
                        paddingTop: 10,
                        borderTop: `1px solid ${t.light}`,
                      }}
                    >
                      <p
                        style={{
                          margin: "0 0 8px",
                          fontSize: 10,
                          fontWeight: 700,
                          letterSpacing: 2.2,
                          textTransform: "uppercase",
                          color: t.muted,
                        }}
                      >
                        Motion & Speed
                      </p>
                    </div>
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 10,
                      }}
                    >
                      <div>
                        <p
                          style={{
                            margin: 0,
                            fontSize: 14,
                            fontWeight: 700,
                            color: t.ink,
                          }}
                        >
                          Reduce Motion
                        </p>
                        <p
                          style={{
                            margin: "3px 0 0",
                            fontSize: 12,
                            color: t.muted,
                            fontStyle: "italic",
                          }}
                        >
                          Calmer animations for iPhone comfort
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={!!uiPrefs.reduceMotion}
                        onChange={(e) =>
                          updateUiPrefs({ reduceMotion: e.target.checked })
                        }
                        style={{ width: 20, height: 20, accentColor: t.green }}
                      />
                    </label>

                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 10,
                      }}
                    >
                      <div>
                        <p
                          style={{
                            margin: 0,
                            fontSize: 14,
                            fontWeight: 700,
                            color: t.ink,
                          }}
                        >
                          Instant Button Response
                        </p>
                        <p
                          style={{
                            margin: "3px 0 0",
                            fontSize: 12,
                            color: t.muted,
                            fontStyle: "italic",
                          }}
                        >
                          Cuts animation lag on quick taps
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={!!uiPrefs.instantButtons}
                        onChange={(e) =>
                          updateUiPrefs({ instantButtons: e.target.checked })
                        }
                        style={{ width: 20, height: 20, accentColor: t.green }}
                      />
                    </label>

                    <label style={{ display: "grid", gap: 8 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 10,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 14,
                            fontWeight: 700,
                            color: t.ink,
                          }}
                        >
                          Button Press Strength
                        </span>
                        <span style={{ fontSize: 12, color: t.muted }}>
                          {uiPrefs.pressIntensity}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        step={1}
                        value={uiPrefs.pressIntensity}
                        disabled={!!uiPrefs.reduceMotion}
                        onChange={(e) =>
                          updateUiPrefs({
                            pressIntensity: Number(e.target.value),
                          })
                        }
                        style={{ accentColor: t.green }}
                      />
                    </label>

                    <label style={{ display: "grid", gap: 8 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 10,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 14,
                            fontWeight: 700,
                            color: t.ink,
                          }}
                        >
                          Sidebar Open Speed
                        </span>
                        <span style={{ fontSize: 12, color: t.muted }}>
                          {uiPrefs.sidebarSpeed}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        step={1}
                        value={uiPrefs.sidebarSpeed ?? 62}
                        disabled={!!uiPrefs.reduceMotion}
                        onChange={(e) =>
                          updateUiPrefs({
                            sidebarSpeed: Number(e.target.value),
                          })
                        }
                        style={{ accentColor: t.green }}
                      />
                    </label>

                    <div
                      style={{
                        marginTop: 4,
                        paddingTop: 10,
                        borderTop: `1px solid ${t.light}`,
                      }}
                    >
                      <p
                        style={{
                          margin: "0 0 8px",
                          fontSize: 10,
                          fontWeight: 700,
                          letterSpacing: 2.2,
                          textTransform: "uppercase",
                          color: t.muted,
                        }}
                      >
                        Tools & Legal
                      </p>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 8,
                        paddingTop: 2,
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => play("star")}
                        disabled={!uiPrefs.soundEnabled}
                        style={{
                          background: t.white,
                          border: `1px solid ${t.border}`,
                          borderRadius: 10,
                          padding: "10px 14px",
                          color: uiPrefs.soundEnabled ? t.mid : t.border,
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: uiPrefs.soundEnabled ? "pointer" : "default",
                          fontFamily: "Georgia,serif",
                        }}
                      >
                        Test Sound
                      </button>
                      <button
                        type="button"
                        onClick={() => updateUiPrefs(PREF_DEFAULTS)}
                        style={{
                          background: t.light,
                          border: `1px solid ${t.border}`,
                          borderRadius: 10,
                          padding: "10px 14px",
                          color: t.mid,
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: "pointer",
                          fontFamily: "Georgia,serif",
                        }}
                      >
                        Reset Settings
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setUiPrefs((prev) => ({
                            ...prev,
                            instantButtons: true,
                            reduceMotion: false,
                            sidebarSpeed: 58,
                            pressIntensity: 48,
                            textScale: 102,
                            readingDensity: "comfortable",
                            soundMode: "focused",
                            soundScope: "focused",
                            dataSaver: true,
                          }))
                        }
                        style={{
                          background: t.white,
                          border: `1px solid ${t.border}`,
                          borderRadius: 10,
                          padding: "10px 14px",
                          color: t.mid,
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: "pointer",
                          fontFamily: "Georgia,serif",
                        }}
                      >
                        Optimize Mobile
                      </button>
                      <button
                        type="button"
                        onClick={resetReadingProgress}
                        style={{
                          background: t.white,
                          border: `1px solid ${t.border}`,
                          borderRadius: 10,
                          padding: "10px 14px",
                          color: t.mid,
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: "pointer",
                          fontFamily: "Georgia,serif",
                        }}
                      >
                        Reset Progress
                      </button>
                      <button
                        type="button"
                        onClick={exportSettingSnapshot}
                        style={{
                          background: t.white,
                          border: `1px solid ${t.border}`,
                          borderRadius: 10,
                          padding: "10px 14px",
                          color: t.mid,
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: "pointer",
                          fontFamily: "Georgia,serif",
                        }}
                      >
                        Export Settings
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          window.open(
                            "/privacy.html",
                            "_blank",
                            "noopener,noreferrer",
                          )
                        }
                        style={{
                          background: t.light,
                          border: `1px solid ${t.border}`,
                          borderRadius: 10,
                          padding: "10px 14px",
                          color: t.mid,
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: "pointer",
                          fontFamily: "Georgia,serif",
                        }}
                      >
                        Privacy & Policy
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          window.open(
                            "/terms.html",
                            "_blank",
                            "noopener,noreferrer",
                          )
                        }
                        style={{
                          background: t.light,
                          border: `1px solid ${t.border}`,
                          borderRadius: 10,
                          padding: "10px 14px",
                          color: t.mid,
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: "pointer",
                          fontFamily: "Georgia,serif",
                        }}
                      >
                        Terms
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          window.open(
                            "/cookies.html",
                            "_blank",
                            "noopener,noreferrer",
                          )
                        }
                        style={{
                          background: t.light,
                          border: `1px solid ${t.border}`,
                          borderRadius: 10,
                          padding: "10px 14px",
                          color: t.mid,
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: "pointer",
                          fontFamily: "Georgia,serif",
                        }}
                      >
                        Cookie Notice
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          window.open(
                            "/community-guidelines.html",
                            "_blank",
                            "noopener,noreferrer",
                          )
                        }
                        style={{
                          background: t.light,
                          border: `1px solid ${t.border}`,
                          borderRadius: 10,
                          padding: "10px 14px",
                          color: t.mid,
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: "pointer",
                          fontFamily: "Georgia,serif",
                        }}
                      >
                        Community Rules
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          window.open(
                            "/disclaimer.html",
                            "_blank",
                            "noopener,noreferrer",
                          )
                        }
                        style={{
                          background: t.light,
                          border: `1px solid ${t.border}`,
                          borderRadius: 10,
                          padding: "10px 14px",
                          color: t.mid,
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: "pointer",
                          fontFamily: "Georgia,serif",
                        }}
                      >
                        Disclaimer
                      </button>
                    </div>
                  </div>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <p
                    style={{
                      margin: "0 0 8px",
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: 2.2,
                      textTransform: "uppercase",
                      color: t.muted,
                    }}
                  >
                    Account
                  </p>
                </div>
                <button
                  onClick={doSignOut}
                  style={{
                    width: "100%",
                    background: "none",
                    border: `1.5px solid ${t.border}`,
                    borderRadius: 12,
                    padding: "15px",
                    color: t.red,
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "Georgia,serif",
                  }}
                >
                  Sign Out
                </button>
              </div>
            )}

            {page === "reading" && selContent && (
              <Suspense fallback={<RouteFallback />}>
                <EbookReader
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

      {/* ── BOTTOM NAVIGATION BAR (mobile only) ─────────────── */}
      <nav
        className={`life-bottom-nav${dark ? " life-bottom-nav-dark" : ""}`}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Home */}
        <button
          className={`life-bottom-nav-item${page === "home" ? " life-bottom-nav-item--active" : ""}`}
          onClick={() => {
            play("tap");
            setPage("home");
            setSidebarOpen(false);
          }}
          aria-label="Home"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke={page === "home" ? t.green : t.muted}
            strokeWidth={page === "home" ? 2.5 : 1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span
            className="life-bottom-nav-label"
            style={{ color: page === "home" ? t.green : t.muted }}
          >
            Home
          </span>
        </button>

        {/* Library / Reading */}
        <button
          className={`life-bottom-nav-item${page === "reading" || page === "where_to_start" ? " life-bottom-nav-item--active" : ""}`}
          onClick={() => {
            play("tap");
            setSidebarOpen(true);
          }}
          aria-label="Library"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke={
              page === "reading" || page === "where_to_start"
                ? t.green
                : t.muted
            }
            strokeWidth={
              page === "reading" || page === "where_to_start" ? 2.5 : 1.8
            }
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
          </svg>
          <span
            className="life-bottom-nav-label"
            style={{
              color:
                page === "reading" || page === "where_to_start"
                  ? t.green
                  : t.muted,
            }}
          >
            Library
          </span>
        </button>

        {/* Quiz */}
        <button
          className={`life-bottom-nav-item${page === "quiz" ? " life-bottom-nav-item--active" : ""}`}
          onClick={() => {
            play("tap");
            setPage("quiz");
            setSidebarOpen(false);
          }}
          aria-label="Quiz"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke={page === "quiz" ? t.green : t.muted}
            strokeWidth={page === "quiz" ? 2.5 : 1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <span
            className="life-bottom-nav-label"
            style={{ color: page === "quiz" ? t.green : t.muted }}
          >
            Quiz
          </span>
        </button>

        {/* Notifications */}
        <button
          className="life-bottom-nav-item"
          onClick={() => {
            play("tap");
            setShowNotif(!showNotif);
          }}
          aria-label="Notifications"
          style={{ position: "relative" }}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke={showNotif ? t.green : t.muted}
            strokeWidth={showNotif ? 2.5 : 1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 01-3.46 0" />
          </svg>
          {unreadCount > 0 && (
            <span className="life-bottom-nav-badge">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
          <span
            className="life-bottom-nav-label"
            style={{ color: showNotif ? t.green : t.muted }}
          >
            Alerts
          </span>
        </button>

        {/* Profile / More */}
        <button
          className={`life-bottom-nav-item${page === "profile" || page === "setting_preferences" ? " life-bottom-nav-item--active" : ""}`}
          onClick={() => {
            play("tap");
            setPage("profile");
            setSidebarOpen(false);
          }}
          aria-label="Profile"
        >
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: "50%",
              background:
                page === "profile" || page === "setting_preferences"
                  ? t.green
                  : "transparent",
              border: `2px solid ${page === "profile" || page === "setting_preferences" ? t.green : t.muted}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                fontSize: 9,
                fontWeight: 700,
                color:
                  page === "profile" || page === "setting_preferences"
                    ? "#fff"
                    : t.muted,
                lineHeight: 1,
              }}
            >
              {initials.slice(0, 2)}
            </span>
          </div>
          <span
            className="life-bottom-nav-label"
            style={{
              color:
                page === "profile" || page === "setting_preferences"
                  ? t.green
                  : t.muted,
            }}
          >
            Profile
          </span>
        </button>
      </nav>

      {/* ── ADD TO HOME SCREEN BANNER ────────────────────────── */}
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

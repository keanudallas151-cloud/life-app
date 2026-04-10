import { useState, useEffect, useRef } from "react";
import { C } from "./systems/theme";
import { LS } from "./systems/storage";
import { useSound } from "./systems/useSound";
import { Ic } from "./icons/Ic";
import { CONTENT, LIBRARY, GUIDED_ORDER, allContent, MAP } from "./data/content";
import { Field, TreeNode } from "./components/Field";
import { EbookReader } from "./components/Reader";
import { QuizPage } from "./components/QuizPage";
import { PostItFeed } from "./components/PostItFeed";
import { TailorIntro, TailorQuestions, TailorResult } from "./components/Tailor";
import { supabase } from "./supabaseClient";

export default function LifeApp() {
  const play = useSound();

  // ── AUTH STATE ──────────────────────────────────────────────
  const [screen, setScreen] = useState("loading"); // start loading until session resolved
  const [user, setUser] = useState(null);           // { id, email, name, username }
  const [authLoading, setAuthLoading] = useState(false);
  const [siSocialErr, setSiSocialErr] = useState("");

  // Sign-in email/password fields
  const [siEmail, setSiEmail] = useState("");
  const [siPass, setSiPass] = useState("");
  const [siErr, setSiErr] = useState("");
  const [siShowPass, setSiShowPass] = useState(false);

  // Register form
  const [rName, setRName] = useState("");
  const [rEmail, setREmail] = useState("");
  const [rDob, setRDob] = useState("");
  const [rPass, setRPass] = useState("");
  const [rPass2, setRPass2] = useState("");
  const [rShowPass, setRShowPass] = useState(false);
  const [rShowPass2, setRShowPass2] = useState(false);
  const [rErr, setRErr] = useState({});

  // ── AUTH PROVIDERS ────────────────────────────────────────────
  // Google = real. Apple, Twitter, Phone = UI placeholders for now.
  const AUTH_PROVIDERS = [
    { key: "google",   label: "Google",  file: "/google_login.png",  live: true  },
    { key: "apple",    label: "Apple",   file: "/apple_login.png",   live: false },
    { key: "twitter",  label: "Twitter", file: "/twitter_login.png", live: false },
    { key: "phone",    label: "Phone",   file: "/phone_login.png",   live: false },
  ];

  // ── SHAPE USER ────────────────────────────────────────────────
  const shapeUser = (sbUser) => {
    const meta = sbUser.user_metadata || {};
    return {
      id:       sbUser.id,
      email:    sbUser.email,
      name:     meta.name || meta.full_name || sbUser.email,
      username: meta.username || meta.user_name || "",
    };
  };

  // ── SESSION RESTORE ON REFRESH ──────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(shapeUser(session.user));
        setScreen("app");
      } else {
        setScreen("landing");
      }
    });

    // Listen for auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(shapeUser(session.user));
        setScreen("app");
      } else {
        setUser(null);
        setScreen("landing");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // ── USER-SCOPED LOCAL STATE (bookmarks, notes, read tracking) ─
  // These stay in localStorage — they're non-sensitive app state
  const uid = user?.email || "_";
  const prevUidRef = useRef(uid);
  const [bookmarks, setBookmarksRaw] = useState(() => LS.get(`bk_${uid}`, []));
  const [notes, setNotesRaw] = useState(() => LS.get(`nt_${uid}`, {}));
  const [readKeys, setReadKeysRaw] = useState(() => LS.get(`rd_${uid}`, []));
  const setBookmarks = v => { setBookmarksRaw(v); LS.set(`bk_${uid}`, v); };
  const setNotes = v => { setNotesRaw(v); LS.set(`nt_${uid}`, v); };
  const setReadKeys = v => { setReadKeysRaw(v); LS.set(`rd_${uid}`, v); };

  // ── APP PAGE STATE ────────────────────────────────────────────
  const [page, setPage] = useState("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selKey, setSelKey] = useState(null);
  const [selContent, setSelContent] = useState(null);
  const [selNode, setSelNode] = useState(null);
  const [tab, setTab] = useState("content");
  const [noteInput, setNoteInput] = useState("");
  const [noteSaved, setNoteSaved] = useState(false);
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [lifeOpen, setLifeOpen] = useState(true);
  const [libOpen, setLibOpen] = useState(true);
  const [guidedOpen, setGuidedOpen] = useState(true);
  const [savedOpen, setSavedOpen] = useState(false);
  const [socialsOpen, setSocialsOpen] = useState(false);
  const [shareToast, setShareToast] = useState(false);
  const [profile, setProfileRaw] = useState(() => LS.get(`tsd_${uid}`, null));
  const setProfile = v => { setProfileRaw(v); LS.set(`tsd_${user?.email || "_"}`, v); };

  // Reload user-scoped data when uid changes (e.g. after login/logout)
  useEffect(() => {
    if (prevUidRef.current !== uid) {
      prevUidRef.current = uid;
      setBookmarksRaw(LS.get(`bk_${uid}`, []));
      setNotesRaw(LS.get(`nt_${uid}`, {}));
      setReadKeysRaw(LS.get(`rd_${uid}`, []));
      setProfileRaw(LS.get(`tsd_${uid}`, null));
    }
  }, [uid]);

  // ── GOOGLE SIGN IN (live) ─────────────────────────────────────
  const doGoogleSignIn = async () => {
    play("tap");
    setSiSocialErr("");
    setAuthLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
        queryParams: { prompt: "select_account" },
      },
    });
    setAuthLoading(false);
    if (error) {
      setSiSocialErr(error.message || "Could not start Google sign in.");
      play("err");
    }
  };

  // ── PROVIDER BUTTON HANDLER ────────────────────────────────────
  const doProviderSignIn = (item) => {
    if (!item.live) {
      play("tap");
      setSiSocialErr(`${item.label} login is coming soon.`);
      return;
    }
    if (item.key === "google") { doGoogleSignIn(); }
  };

  // ── EMAIL / PASSWORD SIGN IN ──────────────────────────────────
  const doEmailSignIn = async () => {
    setSiErr("");
    setSiSocialErr("");
    if (!siEmail.trim()) { setSiErr("Please enter your email."); play("err"); return; }
    if (!siPass) { setSiErr("Please enter your password."); play("err"); return; }
    setAuthLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: siEmail.toLowerCase().trim(),
      password: siPass,
    });
    setAuthLoading(false);
    if (error) {
      setSiErr(error.message?.includes("Invalid") ? "Incorrect email or password." : (error.message || "Sign in failed."));
      play("err");
    }
    // success → onAuthStateChange fires → screen = "app"
  };

  // ── SUPABASE REGISTER ─────────────────────────────────────────
  const doRegister = async () => {
    const err = {};
    if (!rName.trim()) err.name = "Full name is required.";
    if (!rEmail.trim() || !rEmail.includes("@")) err.email = "Enter a valid email.";
    if (!rDob) err.dob = "Date of birth is required.";
    else {
      const [dd, mm, yy] = rDob.split("/").map(Number);
      const yr = yy < 100 ? (yy <= 26 ? 2000 + yy : 1900 + yy) : yy;
      const dob = new Date(yr, mm - 1, dd);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      if (today.getMonth() < mm - 1 || (today.getMonth() === mm - 1 && today.getDate() < dd)) age--;
      if (isNaN(dob.getTime()) || dd < 1 || dd > 31 || mm < 1 || mm > 12) err.dob = "Enter a valid date (dd/mm/yy).";
      else if (age < 13) err.dob = "You must be 13 or older to use Life.";
    }
    if (rPass.length < 8) err.pass = "Password must be at least 8 characters.";
    if (rPass !== rPass2) err.pass2 = "Passwords do not match.";
    if (Object.keys(err).length) { setRErr(err); play("err"); return; }

    setAuthLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: rEmail.toLowerCase().trim(),
      password: rPass,
      options: {
        data: {
          name: rName.trim(),
          full_name: rName.trim(),
          dob: rDob.trim(),
        },
      },
    });
    setAuthLoading(false);

    if (error) {
      if (error.message.toLowerCase().includes("already")) {
        setRErr({ email: "An account with this email already exists." });
      } else {
        setRErr({ email: error.message });
      }
      play("err");
      return;
    }

    if (data?.user) {
      setUser(shapeUser(data.user));
    }
    play("ok");
    setScreen("tailor_intro");
  };

  // ── SUPABASE SIGN OUT ─────────────────────────────────────────
  const doSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setScreen("landing");
    setSiSocialErr("");
  };

  // ── APP HELPERS ───────────────────────────────────────────────
  const handleSelect = (key, node) => {
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
    if (!readKeys.includes(key)) setReadKeys([...readKeys, key]);
  };
  const goHome = () => { play("home"); setPage("home"); };
  const toggleBk = () => {
    if (!selKey) return;
    play("star");
    setBookmarks(bookmarks.includes(selKey) ? bookmarks.filter(b => b !== selKey) : [...bookmarks, selKey]);
  };
  const saveNote = () => {
    if (!selKey) return;
    play("ok");
    setNotes({ ...notes, [selKey]: noteInput });
    setNoteSaved(true);
  };
  const shareNote = () => {
    if (!selKey || !noteInput.trim()) return;
    play("ok");
    setShareToast(true);
    setTimeout(() => setShareToast(false), 2500);
  };

  const isBookmarked = bookmarks.includes(selKey);
  const related = (selNode?.related || []).map(k => MAP[k]).filter(Boolean);
  const searchResults = search.length > 1 ? allContent.filter(i => i.node.label.toLowerCase().includes(search.toLowerCase()) || i.node.content?.text?.toLowerCase().includes(search.toLowerCase())) : [];
  const initials = user?.name ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "??";

  // ── SIDEBAR HELPERS ───────────────────────────────────────────
  const SS = ({ label, open, setOpen, children }) => (
    <div style={{ marginTop: 20, borderTop: `1px solid ${C.light}`, paddingTop: 16 }}>
      <button onClick={() => { play("tap"); setOpen(!open); }} style={{ display: "flex", alignItems: "center", width: "100%", padding: "0 20px 12px", background: "transparent", border: "none", cursor: "pointer" }}>
        <p style={{ color: C.muted, fontSize: 10, fontWeight: 700, letterSpacing: 2.5, margin: 0, textTransform: "uppercase", flex: 1, textAlign: "left", fontFamily: "Georgia,serif" }}>{label}</p>
        <svg width="10" height="10" viewBox="0 0 10 10" style={{ transform: open ? "rotate(90deg)" : "none", transition: "transform 0.2s" }}><polyline points="2,2 8,5 2,8" fill="none" stroke={C.muted} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      {open && children}
    </div>
  );
  const SL = ({ label, icon, onClick, active }) => {
    const ic = icon && Ic[icon];
    const stroke = active ? C.green : "#8a8070";
    return (
      <button onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 9, width: "100%", padding: "12px 20px", background: active ? C.greenLt : "transparent", border: "none", borderLeft: active ? `3px solid ${C.green}` : "3px solid transparent", cursor: "pointer", color: active ? C.green : C.mid, fontSize: 14, textAlign: "left", fontFamily: "Georgia,serif", fontWeight: active ? 600 : 400 }}
        onMouseEnter={e => { if (!active) e.currentTarget.style.background = C.light; }}
        onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}>
        {ic && <span style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>{ic("none", stroke, 18)}</span>}
        <span style={{ flex: 1 }}>{label}</span>
      </button>
    );
  };

  // ── SCREENS ───────────────────────────────────────────────────

  // Loading splash — shown while Supabase resolves session
  if (screen === "loading") return (
    <div style={{ minHeight: "100vh", background: C.skin, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia,serif" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 70, height: 70, borderRadius: "20%", background: `linear-gradient(145deg,${C.green},#2d6e42)`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", boxShadow: "0 4px 16px rgba(74,140,92,0.3)" }}>
          <span style={{ color: "#fff", fontSize: 28, fontWeight: 800 }}>l.</span>
        </div>
        <p style={{ color: C.muted, fontSize: 13, fontStyle: "italic" }}>Loading…</p>
      </div>
    </div>
  );

  // Tailor screens
  if (screen === "tailor_intro") return (
    <TailorIntro
      userName={user?.name}
      onExplore={() => { play("tap"); setScreen("app"); }}
      onTailor={() => { play("ok"); setScreen("tailor_qs"); }}
    />
  );
  if (screen === "tailor_qs") return (
    <TailorQuestions
      onComplete={(prof) => { setProfile(prof); play("ok"); setScreen("tailor_result"); }}
      onBack={() => { play("back"); setScreen("tailor_intro"); }}
    />
  );
  if (screen === "tailor_result") return (
    <TailorResult
      profile={profile}
      userName={user?.name}
      onContinue={() => { play("ok"); setScreen("app"); }}
    />
  );

  // Landing
  if (screen === "landing") return (
    <div style={{ minHeight: "100vh", background: C.skin, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "Georgia,serif", padding: "40px 28px", position: "relative" }}>
      <div style={{ marginBottom: 28, textAlign: "center" }}>
        <div style={{ width: 120, height: 120, borderRadius: "22%", background: `linear-gradient(145deg,${C.green},#2d6e42)`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px", boxShadow: "0 8px 32px rgba(74,140,92,0.35)" }}>
          <span style={{ color: "#fff", fontSize: 52, fontWeight: 800, fontFamily: "Georgia,serif", letterSpacing: -2 }}>l.</span>
        </div>
        <h1 style={{ margin: 0, fontSize: 42, fontWeight: 800, color: C.ink, fontFamily: "Georgia,serif", letterSpacing: -1 }}>Life.</h1>
        <p style={{ margin: "8px 0 0", fontSize: 15, color: C.muted, fontStyle: "italic" }}>Knowledge. Finance. Life.</p>
      </div>
      <div style={{ width: "100%", maxWidth: 340, display: "flex", flexDirection: "column", gap: 14 }}>
        <button onClick={() => { play("tap"); setScreen("signin"); }} style={{ background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 14, padding: "18px 20px", color: C.ink, fontSize: 17, fontWeight: 600, cursor: "pointer", fontFamily: "Georgia,serif" }}>Sign In</button>
        <button onClick={() => { play("tap"); setScreen("register"); }} style={{ background: C.green, border: "none", borderRadius: 14, padding: "18px 20px", color: "#fff", fontSize: 17, fontWeight: 700, cursor: "pointer", fontFamily: "Georgia,serif", boxShadow: "0 3px 14px rgba(74,140,92,0.32)" }}>Register</button>
        <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "4px 16px" }}>
          <div style={{ flex: 1, height: 1, background: C.border }} /><span style={{ color: C.muted, fontSize: 12, fontStyle: "italic", whiteSpace: "nowrap" }}>or continue with</span><div style={{ flex: 1, height: 1, background: C.border }} />
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
          {AUTH_PROVIDERS.map(item => (
            <button
              key={item.key}
              onClick={() => doProviderSignIn(item)}
              title={item.label}
              aria-label={`Continue with ${item.label}`}
              style={{ width: 64, height: 64, background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 10, boxSizing: "border-box", opacity: item.live ? 1 : 0.5 }}
            >
              <img src={item.file} alt={item.label} style={{ width: 30, height: 30, objectFit: "contain", display: "block" }} />
            </button>
          ))}
        </div>
      </div>
      <p style={{ position: "absolute", bottom: 20, color: C.muted, fontSize: 10, fontStyle: "italic", textAlign: "center" }}>© 2026 Life. All rights reserved.</p>
    </div>
  );

  // Sign In
  if (screen === "signin") return (
    <div style={{ minHeight: "100vh", background: C.skin, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "Georgia,serif", padding: "40px 28px" }}>
      <div style={{ width: 70, height: 70, borderRadius: "20%", background: `linear-gradient(145deg,${C.green},#2d6e42)`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20, boxShadow: "0 4px 16px rgba(74,140,92,0.3)" }}>
        <span style={{ color: C.white, fontSize: 28, fontWeight: 800 }}>l.</span>
      </div>

      <h2 style={{ fontSize: 26, fontWeight: 700, margin: "0 0 4px", color: C.ink, fontFamily: "Georgia,serif" }}>
        Sign in to Life.
      </h2>
      <p style={{ margin: "0 0 28px", fontSize: 14, color: C.muted, fontStyle: "italic" }}>
        Welcome back.
      </p>

      <div style={{ width: "100%", maxWidth: 320, display: "flex", flexDirection: "column", gap: 14 }}>

        {/* ── Email field ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: C.muted }}>Email</label>
          <input
            type="email"
            value={siEmail}
            onChange={e => { setSiEmail(e.target.value); setSiErr(""); }}
            onKeyDown={e => e.key === "Enter" && doEmailSignIn()}
            placeholder="you@example.com"
            autoComplete="email"
            style={{ background: C.white, border: `1.5px solid ${siErr && !siPass ? C.red : C.border}`, borderRadius: 12, padding: "14px 16px", fontSize: 15, color: C.ink, outline: "none", fontFamily: "Georgia,serif", boxSizing: "border-box", width: "100%" }}
          />
        </div>

        {/* ── Password field ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: C.muted }}>Password</label>
          <div style={{ position: "relative" }}>
            <input
              type={siShowPass ? "text" : "password"}
              value={siPass}
              onChange={e => { setSiPass(e.target.value); setSiErr(""); }}
              onKeyDown={e => e.key === "Enter" && doEmailSignIn()}
              placeholder="Your password"
              autoComplete="current-password"
              style={{ background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 12, padding: "14px 48px 14px 16px", fontSize: 15, color: C.ink, outline: "none", fontFamily: "Georgia,serif", boxSizing: "border-box", width: "100%" }}
            />
            <button
              onClick={() => setSiShowPass(v => !v)}
              style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: C.muted, fontSize: 12, fontFamily: "Georgia,serif" }}>
              {siShowPass ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        {siErr && (
          <p style={{ margin: "-4px 0 0", fontSize: 12, color: C.red, fontStyle: "italic", lineHeight: 1.5 }}>{siErr}</p>
        )}

        {/* ── Sign In button ── */}
        <button
          onClick={doEmailSignIn}
          disabled={authLoading}
          style={{ background: C.green, border: "none", borderRadius: 12, padding: "16px", color: "#fff", fontSize: 16, fontWeight: 700, cursor: authLoading ? "default" : "pointer", fontFamily: "Georgia,serif", opacity: authLoading ? 0.7 : 1, marginTop: 2, boxShadow: "0 3px 14px rgba(74,140,92,0.32)" }}>
          {authLoading ? "Signing in…" : "Sign In"}
        </button>

        {/* ── Divider ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "2px 0" }}>
          <div style={{ flex: 1, height: 1, background: C.border }} />
          <span style={{ color: C.muted, fontSize: 11, fontStyle: "italic", whiteSpace: "nowrap" }}>or continue with</span>
          <div style={{ flex: 1, height: 1, background: C.border }} />
        </div>

        {/* ── Google ── */}
        <button
          onClick={doGoogleSignIn}
          disabled={authLoading}
          style={{ display: "flex", alignItems: "center", gap: 14, width: "100%", background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 12, padding: "14px 18px", cursor: authLoading ? "default" : "pointer", fontFamily: "Georgia,serif", boxSizing: "border-box", opacity: authLoading ? 0.7 : 1, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <img src="/google_login.png" alt="Google" style={{ width: 22, height: 22, objectFit: "contain", flexShrink: 0 }} />
          <span style={{ fontSize: 14, fontWeight: 600, color: C.ink }}>Continue with Google</span>
        </button>

        {/* ── Apple / Twitter / Phone — coming soon ── */}
        {[
          { label: "Apple",   file: "/apple_login.png"   },
          { label: "Twitter", file: "/twitter_login.png" },
          { label: "Phone",   file: "/phone_login.png"   },
        ].map(item => (
          <button key={item.label}
            onClick={() => { play("tap"); setSiSocialErr(`${item.label} login is coming soon.`); }}
            style={{ display: "flex", alignItems: "center", gap: 14, width: "100%", background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 12, padding: "14px 18px", cursor: "pointer", fontFamily: "Georgia,serif", boxSizing: "border-box", opacity: 0.45 }}>
            <img src={item.file} alt={item.label} style={{ width: 22, height: 22, objectFit: "contain", flexShrink: 0 }} />
            <span style={{ fontSize: 14, fontWeight: 600, color: C.ink }}>Continue with {item.label}</span>
          </button>
        ))}

        {siSocialErr && (
          <p style={{ margin: "0", fontSize: 12, color: C.red, textAlign: "center", fontStyle: "italic", lineHeight: 1.6 }}>
            {siSocialErr}
          </p>
        )}

        <button
          onClick={() => { play("tap"); setScreen("landing"); setSiSocialErr(""); setSiErr(""); setSiEmail(""); setSiPass(""); }}
          style={{ background: "none", border: "none", color: C.muted, fontSize: 13, cursor: "pointer", fontFamily: "Georgia,serif", fontStyle: "italic", marginTop: 2 }}>
          ← Back
        </button>

        <p style={{ textAlign: "center", color: C.muted, fontSize: 13, margin: 0 }}>
          No account?{" "}
          <button
            onClick={() => { play("tap"); setScreen("register"); setSiSocialErr(""); setSiErr(""); }}
            style={{ background: "none", border: "none", color: C.green, fontSize: 13, cursor: "pointer", fontFamily: "Georgia,serif", fontWeight: 700 }}>
            Register
          </button>
        </p>
      </div>
    </div>
  );

  // Register
  if (screen === "register") return (
    <div style={{ minHeight: "100vh", background: C.skin, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "Georgia,serif", padding: "48px 28px" }}>
      <div style={{ width: 70, height: 70, borderRadius: "20%", background: `linear-gradient(145deg,${C.green},#2d6e42)`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20, boxShadow: "0 4px 16px rgba(74,140,92,0.3)" }}>
        <span style={{ color: "#fff", fontSize: 28, fontWeight: 800 }}>l.</span>
      </div>
      <h2 style={{ fontSize: 26, fontWeight: 700, margin: "0 0 4px", color: C.ink, fontFamily: "Georgia,serif" }}>Create Account</h2>
      <p style={{ margin: "0 0 28px", fontSize: 14, color: C.muted, fontStyle: "italic" }}>Join Life. — it only takes a minute.</p>

      <div style={{ width: "100%", maxWidth: 320, display: "flex", flexDirection: "column", gap: 18 }}>

        {/* Full Name */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: C.muted }}>Full Name</label>
          <input
            value={rName}
            onChange={e => { setRName(e.target.value); setRErr(p => ({ ...p, name: null })); }}
            placeholder="Your full name"
            autoComplete="name"
            style={{ background: C.white, border: `1.5px solid ${rErr.name ? C.red : C.border}`, borderRadius: 12, padding: "14px 16px", fontSize: 15, color: C.ink, outline: "none", fontFamily: "Georgia,serif", boxSizing: "border-box", width: "100%" }}
          />
          {rErr.name && <p style={{ margin: 0, fontSize: 12, color: C.red, fontStyle: "italic" }}>{rErr.name}</p>}
        </div>

        {/* Email */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: C.muted }}>Email</label>
          <input
            type="email"
            value={rEmail}
            onChange={e => { setREmail(e.target.value); setRErr(p => ({ ...p, email: null })); }}
            placeholder="you@example.com"
            autoComplete="email"
            style={{ background: C.white, border: `1.5px solid ${rErr.email ? C.red : C.border}`, borderRadius: 12, padding: "14px 16px", fontSize: 15, color: C.ink, outline: "none", fontFamily: "Georgia,serif", boxSizing: "border-box", width: "100%" }}
          />
          {rErr.email && <p style={{ margin: 0, fontSize: 12, color: C.red, fontStyle: "italic" }}>{rErr.email}</p>}
        </div>

        {/* Date of Birth */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: C.muted }}>Date of Birth</label>
          <input
            value={rDob}
            onChange={e => {
              let d = e.target.value.replace(/\D/g, "").slice(0, 6);
              let f = d.slice(0, 2);
              if (d.length >= 3) f += "/" + d.slice(2, 4);
              if (d.length >= 5) f += "/" + d.slice(4, 6);
              setRDob(f);
              setRErr(p => ({ ...p, dob: null }));
            }}
            placeholder="dd/mm/yy"
            style={{ background: C.white, border: `1.5px solid ${rErr.dob ? C.red : C.border}`, borderRadius: 12, padding: "14px 16px", fontSize: 15, color: C.ink, outline: "none", fontFamily: "Georgia,serif", boxSizing: "border-box", width: "100%" }}
          />
          {rErr.dob && <p style={{ margin: 0, fontSize: 12, color: C.red, fontStyle: "italic" }}>{rErr.dob}</p>}
        </div>

        {/* Password */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: C.muted }}>Password</label>
          <div style={{ position: "relative" }}>
            <input
              type={rShowPass ? "text" : "password"}
              value={rPass}
              onChange={e => { setRPass(e.target.value); setRErr(p => ({ ...p, pass: null })); }}
              placeholder="Min 8 characters"
              autoComplete="new-password"
              style={{ background: C.white, border: `1.5px solid ${rErr.pass ? C.red : C.border}`, borderRadius: 12, padding: "14px 48px 14px 16px", fontSize: 15, color: C.ink, outline: "none", fontFamily: "Georgia,serif", boxSizing: "border-box", width: "100%" }}
            />
            <button onClick={() => setRShowPass(v => !v)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: C.muted, fontSize: 12, fontFamily: "Georgia,serif" }}>
              {rShowPass ? "Hide" : "Show"}
            </button>
          </div>
          {rErr.pass && <p style={{ margin: 0, fontSize: 12, color: C.red, fontStyle: "italic" }}>{rErr.pass}</p>}
        </div>

        {/* Confirm Password */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: C.muted }}>Confirm Password</label>
          <div style={{ position: "relative" }}>
            <input
              type={rShowPass2 ? "text" : "password"}
              value={rPass2}
              onChange={e => { setRPass2(e.target.value); setRErr(p => ({ ...p, pass2: null })); }}
              placeholder="Repeat password"
              autoComplete="new-password"
              style={{ background: C.white, border: `1.5px solid ${rErr.pass2 ? C.red : C.border}`, borderRadius: 12, padding: "14px 48px 14px 16px", fontSize: 15, color: C.ink, outline: "none", fontFamily: "Georgia,serif", boxSizing: "border-box", width: "100%" }}
            />
            <button onClick={() => setRShowPass2(v => !v)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: C.muted, fontSize: 12, fontFamily: "Georgia,serif" }}>
              {rShowPass2 ? "Hide" : "Show"}
            </button>
          </div>
          {rErr.pass2 && <p style={{ margin: 0, fontSize: 12, color: C.red, fontStyle: "italic" }}>{rErr.pass2}</p>}
        </div>

        <button onClick={doRegister} disabled={authLoading}
          style={{ background: C.green, border: "none", borderRadius: 12, padding: "17px", color: "#fff", fontSize: 16, fontWeight: 700, cursor: authLoading ? "default" : "pointer", fontFamily: "Georgia,serif", marginTop: 4, opacity: authLoading ? 0.7 : 1, boxShadow: "0 3px 14px rgba(74,140,92,0.32)" }}>
          {authLoading ? "Creating account…" : "Create Account"}
        </button>

        <button onClick={() => { play("tap"); setScreen("signin"); setRErr({}); }} style={{ background: "none", border: "none", color: C.muted, fontSize: 13, cursor: "pointer", fontFamily: "Georgia,serif", fontStyle: "italic" }}>← Back to Sign In</button>

        <p style={{ textAlign: "center", color: C.muted, fontSize: 11, fontStyle: "italic", lineHeight: 1.7, margin: 0 }}>
          By registering you agree to Life.'s terms of use. You must be 13+ to join.
        </p>
      </div>
    </div>
  );

  // ── MAIN APP ──────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: C.skin, display: "flex", flexDirection: "column", fontFamily: "Georgia,serif", color: C.ink }}>
      {shareToast && <div style={{ position: "fixed", top: 70, left: "50%", transform: "translateX(-50%)", background: C.ink, color: "#fff", padding: "10px 22px", borderRadius: 20, fontSize: 13, zIndex: 999, boxShadow: "0 4px 14px rgba(0,0,0,0.2)" }}>Shared to Post-It ✓</div>}

      {/* TOP BAR */}
      <div style={{ height: 62, background: C.white, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", padding: "0 16px", gap: 10, position: "sticky", top: 0, zIndex: 50, boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <button onClick={() => { play("tap"); setSidebarOpen(!sidebarOpen); }} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", gap: 5, padding: "6px 4px" }}>
            {[22, 14, 22].map((w, i) => <span key={i} style={{ display: "block", width: w, height: 2, background: C.mid, borderRadius: 2 }} />)}
          </button>
          <button onClick={goHome} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
            <div style={{ width: 34, height: 34, borderRadius: "22%", background: `linear-gradient(145deg,${C.green},#2d6e42)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#fff", fontSize: 14, fontWeight: 800, fontFamily: "Georgia,serif" }}>l.</span>
            </div>
          </button>
        </div>
        <div style={{ flex: 1, margin: "0 10px", position: "relative" }}>
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
            <circle cx="6" cy="6" r="4.5" stroke={C.muted} strokeWidth="1.5" /><line x1="9.5" y1="9.5" x2="13" y2="13" stroke={C.muted} strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input value={search} onChange={e => { setSearch(e.target.value); setShowSearch(true); }} onFocus={() => setShowSearch(true)} placeholder="Search topics…"
            style={{ width: "100%", background: C.light, border: `1px solid ${C.border}`, borderRadius: 20, padding: "9px 32px 9px 30px", color: C.ink, fontSize: 13, outline: "none", fontFamily: "Georgia,serif", boxSizing: "border-box" }} />
          {search && <button onClick={() => { setSearch(""); setShowSearch(false); }} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: C.muted, fontSize: 16 }}>×</button>}
        </div>
        <button onClick={() => { play("tap"); setPage("profile"); setSidebarOpen(false); }} style={{ width: 36, height: 36, borderRadius: "50%", background: C.white, border: `1.5px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, cursor: "pointer" }}>
          <span style={{ color: C.ink, fontSize: 11, fontWeight: 700 }}>{initials}</span>
        </button>
      </div>

      {showSearch && search.length > 1 && (
        <div style={{ position: "fixed", top: 62, left: 0, right: 0, zIndex: 200, background: C.white, borderBottom: `1px solid ${C.border}`, maxHeight: 320, overflowY: "auto", boxShadow: "0 8px 24px rgba(0,0,0,0.09)" }}>
          {searchResults.length === 0
            ? <p style={{ color: C.muted, padding: "22px 28px", margin: 0, fontSize: 14, fontStyle: "italic" }}>No results.</p>
            : searchResults.map(item => (
              <button key={item.key} onClick={() => { handleSelect(item.key, item.node); setShowSearch(false); setSearch(""); }}
                style={{ display: "block", width: "100%", textAlign: "left", background: "transparent", border: "none", borderBottom: `1px solid ${C.light}`, padding: "14px 24px", cursor: "pointer", fontFamily: "Georgia,serif" }}
                onMouseEnter={e => e.currentTarget.style.background = C.light}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <div style={{ fontSize: 15, fontWeight: 600, color: C.ink }}>{item.node.icon && <span style={{ marginRight: 8 }}>{item.node.icon}</span>}{item.node.label}</div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 2, fontStyle: "italic" }}>{item.path.join(" — ")}</div>
              </button>
            ))}
        </div>
      )}

      <div style={{ display: "flex", flex: 1, position: "relative", overflow: "hidden" }}>
        {sidebarOpen && <div onClick={() => { play("back"); setSidebarOpen(false); }} style={{ position: "fixed", inset: 0, top: 62, background: "rgba(0,0,0,0.18)", zIndex: 30 }} />}

        {/* SIDEBAR */}
        <div style={{ position: "fixed", top: 62, left: 0, bottom: 0, width: 288, background: C.white, borderRight: `1px solid ${C.border}`, overflowY: "auto", zIndex: 40, transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)", transition: "transform 0.28s cubic-bezier(0.4,0,0.2,1)", paddingTop: 16, paddingBottom: 60 }}>
          <SS label="Life." open={lifeOpen} setOpen={setLifeOpen}>
            <SL label="Where To Start?" icon="compass" onClick={() => { play("tap"); setPage("where_to_start"); setSidebarOpen(false); }} active={page === "where_to_start"} />
            <SL label="Quiz" icon="brain" onClick={() => { play("tap"); setPage("quiz"); setSidebarOpen(false); }} active={page === "quiz"} />
            <SL label="Help" icon="question" onClick={() => { play("tap"); setPage("help"); setSidebarOpen(false); }} active={page === "help"} />
          </SS>
          <SS label="Library" open={libOpen} setOpen={setLibOpen}>
            {Object.entries(LIBRARY).map(([k, node]) => <TreeNode key={k} nodeKey={k} node={node} depth={0} onSelect={handleSelect} selectedKey={selKey} defaultOpen={k === "life"} play={play} />)}
          </SS>
          <SS label="Guided" open={guidedOpen} setOpen={setGuidedOpen}>
            {GUIDED_ORDER.map(k => { const node = CONTENT[k]; if (!node) return null; return <SL key={k} label={node.label} icon={node.icon} onClick={() => handleSelect(k, node)} active={selKey === k} />; })}
          </SS>
          <SS label="Saved" open={savedOpen} setOpen={setSavedOpen}>
            {bookmarks.length === 0
              ? <p style={{ color: C.muted, fontSize: 13, padding: "4px 20px 12px", fontStyle: "italic", margin: 0 }}>Nothing saved yet.</p>
              : allContent.filter(c => bookmarks.includes(c.key)).map(item => <SL key={item.key} label={item.node.label} icon={item.node.icon} onClick={() => { handleSelect(item.key, item.node); setSidebarOpen(false); }} active={false} />)}
          </SS>
          <SS label="Socials" open={socialsOpen} setOpen={setSocialsOpen}>
            <SL label="Post-It" icon="pin" onClick={() => { play("tap"); setPage("postit"); setSidebarOpen(false); }} active={page === "postit"} />
            <SL label="Networking" icon="users" onClick={() => { play("tap"); setPage("networking"); setSidebarOpen(false); }} active={page === "networking"} />
          </SS>
          <div style={{ padding: "24px 20px 8px", borderTop: `1px solid ${C.light}`, marginTop: 24 }}>
            <button onClick={doSignOut} style={{ width: "100%", background: C.white, border: `1.5px solid ${C.red}`, borderRadius: 10, padding: "13px", color: C.red, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "Georgia,serif" }}>Sign Out</button>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div style={{ flex: 1, overflowY: "auto" }}>

          {page === "home" && (
            <div style={{ paddingBottom: 60 }}>

              {/* PROGRESS BAR */}
              <div style={{ padding: "12px 20px", background: C.white, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ flex: 1, height: 5, background: C.light, borderRadius: 10, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${allContent.length > 0 ? Math.round((readKeys.length / allContent.length) * 100) : 0}%`, background: `linear-gradient(90deg,${C.green},#6FBE77)`, borderRadius: 10, transition: "width 0.6s cubic-bezier(0.4,0,0.2,1)" }} />
                </div>
                <span style={{ fontSize: 11, color: C.green, fontWeight: 700, letterSpacing: 0.5, flexShrink: 0 }}>
                  {readKeys.length}<span style={{ color: C.muted, fontWeight: 400 }}>/{allContent.length}</span>
                </span>
              </div>

              {/* HERO */}
              <div style={{ padding: "44px 24px 40px", textAlign: "center", borderBottom: `1px solid ${C.border}`, background: C.skin, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, borderRadius: "50%", border: "1.5px solid rgba(74,140,92,0.10)", pointerEvents: "none" }} />
                <div style={{ position: "absolute", bottom: -80, left: -40, width: 160, height: 160, borderRadius: "50%", border: "1.5px solid rgba(74,140,92,0.08)", pointerEvents: "none" }} />
                <p style={{ margin: "0 0 18px", fontSize: 10, fontWeight: 700, letterSpacing: 5, textTransform: "uppercase", color: C.muted }}>Welcome to</p>
                <h1 style={{ margin: "0 0 6px", fontSize: 110, fontWeight: 800, color: C.ink, fontFamily: "Georgia,serif", letterSpacing: -5, lineHeight: 0.85 }}>Life.</h1>
                <div style={{ width: 40, height: 2.5, background: C.green, borderRadius: 2, margin: "18px auto 22px" }} />
                <p style={{ color: C.mid, fontSize: 15, lineHeight: 1.9, margin: "0 auto 6px", maxWidth: 340, fontFamily: "Georgia,serif" }}>
                  Years of research compiled into one app — finance, psychology, philosophy, and income.
                </p>
                <p style={{ color: C.muted, fontSize: 13, lineHeight: 1.7, margin: "0 auto 32px", maxWidth: 300, fontStyle: "italic" }}>
                  No course. No guru. Pure knowledge.
                </p>
                <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                  <button onClick={() => { play("open"); setSidebarOpen(true); }}
                    style={{ background: C.green, border: "none", borderRadius: 14, padding: "15px 32px", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "Georgia,serif", boxShadow: "0 6px 20px rgba(74,140,92,0.30)", letterSpacing: 0.3 }}>
                    Start Reading →
                  </button>
                  <button onClick={() => { play("tap"); setPage("quiz"); }}
                    style={{ background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 14, padding: "15px 24px", color: C.ink, fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "Georgia,serif", display: "flex", alignItems: "center", gap: 8 }}>
                    {Ic.brain("none", C.green, 17)} Quiz
                  </button>
                </div>
              </div>

              {/* WHAT'S INSIDE — 2×2 grid */}
              <div style={{ padding: "32px 20px 0" }}>
                <p style={{ margin: "0 0 18px", fontSize: 10, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: C.muted, textAlign: "center" }}>What's inside</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, maxWidth: 500, margin: "0 auto" }}>
                  {[
                    { icon: "leaf", label: "Life", sub: "Finance, psychology & philosophy", onClick: () => { play("open"); setSidebarOpen(true); } },
                    { icon: "lightbulb", label: "100 Ways", sub: "Online & AI income strategies", onClick: () => { play("open"); setSidebarOpen(true); } },
                    { icon: "brain", label: "Quiz", sub: "Timed knowledge challenges", onClick: () => { play("tap"); setPage("quiz"); } },
                    { icon: "pin", label: "Post-It", sub: "Community discussion", onClick: () => { play("tap"); setPage("postit"); } },
                  ].map(item => (
                    <button key={item.label} onClick={item.onClick}
                      style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 16, padding: "20px 16px", cursor: "pointer", textAlign: "left", fontFamily: "Georgia,serif", display: "flex", flexDirection: "column", gap: 10, boxShadow: "0 1px 3px rgba(0,0,0,0.04)", transition: "box-shadow 0.2s" }}
                      onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(74,140,92,0.13)"; e.currentTarget.style.borderColor = "#c8ddc8"; }}
                      onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)"; e.currentTarget.style.borderColor = C.border; }}>
                      <div style={{ width: 40, height: 40, borderRadius: 12, background: C.greenLt, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {Ic[item.icon]?.("none", "#4a8c5c", 20)}
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: C.ink, marginBottom: 3 }}>{item.label}</div>
                        <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.5 }}>{item.sub}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* GUIDED — START HERE */}
              <div style={{ padding: "36px 20px 0", maxWidth: 500, margin: "0 auto" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                  <div style={{ flex: 1, height: 1, background: C.border }} />
                  <p style={{ margin: 0, fontSize: 10, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: C.muted, whiteSpace: "nowrap" }}>Start here</p>
                  <div style={{ flex: 1, height: 1, background: C.border }} />
                </div>
                {GUIDED_ORDER.slice(0, 4).map((k, i) => {
                  const node = CONTENT[k]; if (!node) return null;
                  return (
                    <button key={k} onClick={() => { play("tap"); handleSelect(k, node); }}
                      style={{ display: "flex", alignItems: "center", gap: 14, width: "100%", background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px 18px", cursor: "pointer", marginBottom: 10, textAlign: "left", fontFamily: "Georgia,serif", boxSizing: "border-box", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", transition: "all 0.18s" }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = "#c8ddc8"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(74,140,92,0.11)"; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)"; }}>
                      <div style={{ width: 34, height: 34, borderRadius: 10, background: C.green, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <span style={{ color: "#fff", fontSize: 13, fontWeight: 800, fontFamily: "Georgia,serif" }}>{i + 1}</span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: C.ink }}>{node.label}</div>
                        <div style={{ fontSize: 11, color: C.muted, marginTop: 2, fontStyle: "italic" }}>{node.content?.level}</div>
                      </div>
                      <svg width="8" height="8" viewBox="0 0 10 10"><polyline points="2,2 8,5 2,8" fill="none" stroke={C.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </button>
                  );
                })}
              </div>

            </div>
          )}

          {page === "where_to_start" && (
            <div style={{ padding: "48px 28px", maxWidth: 560, margin: "0 auto" }}>
              <h2 style={{ fontSize: 26, fontWeight: 700, color: C.ink, margin: "0 0 10px", fontFamily: "Georgia,serif" }}>Where To Start?</h2>
              <p style={{ color: C.muted, fontSize: 15, lineHeight: 1.8, margin: "0 0 32px", fontStyle: "italic" }}>New to Life.? This is the recommended reading order.</p>
              {[
                { step: 1, label: "Start with Money", desc: "Understand what money actually is before anything else.", key: "money" },
                { step: 2, label: "Finance Basics for your country", desc: "Australia or America — learn the system you live inside.", key: "basics_au2" },
                { step: 3, label: "The Psychological Game of Money", desc: "Your beliefs about money matter more than your strategy.", key: "psych_money" },
                { step: 4, label: "Secrets About Money", desc: "The mechanisms nobody explains in school.", key: "secrets" },
                { step: 5, label: "Generating Income", desc: "The honest framework for building financial independence.", key: "gen_income" },
              ].map(item => (
                <button key={item.step} onClick={() => handleSelect(item.key, CONTENT[item.key])}
                  style={{ display: "flex", alignItems: "flex-start", gap: 16, width: "100%", background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: "20px", cursor: "pointer", marginBottom: 12, textAlign: "left", fontFamily: "Georgia,serif" }}
                  onMouseEnter={e => e.currentTarget.style.background = C.light}
                  onMouseLeave={e => e.currentTarget.style.background = C.white}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: C.green, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>{item.step}</span>
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: C.ink, marginBottom: 4 }}>{item.label}</div>
                    <div style={{ fontSize: 13, color: C.muted, fontStyle: "italic" }}>{item.desc}</div>
                  </div>
                </button>
              ))}
              <div style={{ marginTop: 28, padding: 22, background: C.greenLt, border: `1px solid ${C.green}`, borderRadius: 14 }}>
                <p style={{ margin: "0 0 6px", fontSize: 10, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: C.green }}>Test yourself</p>
                <p style={{ margin: "0 0 14px", fontSize: 15, color: C.ink, fontFamily: "Georgia,serif" }}>Once you have read a few topics, test your knowledge with a timed quiz.</p>
                <button onClick={() => { play("tap"); setPage("quiz"); }} style={{ background: C.green, border: "none", borderRadius: 10, padding: "12px 22px", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "Georgia,serif" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>{Ic.brain("none", "#fff", 17)} Go to Quiz</span>
                </button>
              </div>
            </div>
          )}

          {page === "quiz" && <QuizPage play={play} userId={user?.id} />}

          {page === "help" && (
            <div style={{ padding: "48px 28px", maxWidth: 560, margin: "0 auto" }}>
              <h2 style={{ fontSize: 28, fontWeight: 700, color: C.ink, margin: "0 0 12px" }}>Help</h2>
              <p style={{ color: C.muted, fontSize: 15, lineHeight: 1.8, margin: "0 0 32px", fontStyle: "italic" }}>Everything you need to know about using Life.</p>
              {[
                ["How do I navigate the app?", "Tap the menu icon top left to open the sidebar. Browse Library folders or jump into Guided for a curated path."],
                ["How do I save topics?", "Tap the ☆ star on any reading page. All saved topics appear in the Saved section in the sidebar."],
                ["How do I take notes?", "Open any topic and tap the Notes tab. Write your thoughts and tap Save."],
                ["What is Post-It?", "The Life. community feed. Share insights, ask questions, and discuss topics with other readers."],
                ["What is the Quiz?", "Test your knowledge on Finance, Psychology, and Money. Pick easy, medium, or hard. Three formats: Multiple Choice, True/False, and Blitz."],
                ["What is Guided?", "A curated sequence designed to take you from zero understanding of money to a solid foundation."],
              ].map(([q, a]) => (
                <div key={q} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: "20px 22px", marginBottom: 12 }}>
                  <p style={{ margin: "0 0 8px", fontSize: 15, fontWeight: 700, color: C.ink }}>{q}</p>
                  <p style={{ margin: 0, fontSize: 14, color: C.mid, lineHeight: 1.7, fontFamily: "Georgia,serif" }}>{a}</p>
                </div>
              ))}
            </div>
          )}

          {page === "postit" && <PostItFeed play={play} user={user} />}

          {page === "networking" && (
            <div style={{ padding: "40px 28px", maxWidth: 520, margin: "0 auto" }}>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: C.ink, margin: "0 0 10px" }}>Networking</h2>
              <p style={{ color: C.muted, fontSize: 15, lineHeight: 1.8, margin: "0 0 32px", fontStyle: "italic" }}>Connect with others building real knowledge and financial independence.</p>
              <div style={{ background: C.greenLt, border: `1px solid ${C.green}`, borderRadius: 16, padding: 28, textAlign: "center" }}>
                <p style={{ margin: "0 0 8px", fontSize: 10, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: C.green }}>Life. Community</p>
                <p style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 700, color: C.ink }}>Join the Discord Server</p>
                <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 20px", display: "inline-block", marginBottom: 20 }}>
                  <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: 3, color: C.ink, fontFamily: "Georgia,serif" }}>#12345</span>
                </div>
                <p style={{ margin: "0 0 20px", fontSize: 13, color: C.muted, fontStyle: "italic" }}>Use invite code #12345 at discord.gg/life</p>
                <button onClick={() => window.open("https://discord.gg", "_blank")} style={{ background: C.green, border: "none", borderRadius: 12, padding: "14px 32px", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "Georgia,serif" }}>Open Discord</button>
              </div>
            </div>
          )}

          {page === "profile" && (
            <div style={{ padding: "48px 28px", maxWidth: 480, margin: "0 auto" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 36 }}>
                <div style={{ width: 70, height: 70, borderRadius: "50%", background: C.white, border: `2px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 24, fontWeight: 700, color: C.ink }}>{initials}</span>
                </div>
                <div>
                  <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 700, color: C.ink }}>{user?.name}</h2>
                  <p style={{ margin: 0, fontSize: 14, color: C.muted, fontStyle: "italic" }}>{user?.email}</p>
                </div>
              </div>
              <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: 24, marginBottom: 20 }}>
                <p style={{ margin: "0 0 16px", fontSize: 10, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: C.muted }}>Your Stats</p>
                {[
                  ["Topics Read", readKeys.length],
                  ["Bookmarks Saved", bookmarks.length],
                  ["Notes Written", Object.keys(notes).filter(k => notes[k]).length],
                ].map(([label, val]) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: `1px solid ${C.light}` }}>
                    <span style={{ fontSize: 15, color: C.mid, fontFamily: "Georgia,serif" }}>{label}</span>
                    <span style={{ fontSize: 15, fontWeight: 700, color: C.green }}>{val}</span>
                  </div>
                ))}
              </div>
              <button onClick={doSignOut} style={{ width: "100%", background: "none", border: `1.5px solid ${C.border}`, borderRadius: 12, padding: "15px", color: C.red, fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "Georgia,serif" }}>Sign Out</button>
            </div>
          )}

          {page === "reading" && selContent && (
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
            />
          )}
        </div>
      </div>
    </div>
  );
}

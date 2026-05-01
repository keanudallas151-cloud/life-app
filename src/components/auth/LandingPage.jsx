"use client";

import { useState, useRef } from "react";
import { SystemStatusNotice } from "../shell/SystemStatusNotice";

const SF = "-apple-system,'SF Pro Display','SF Pro Text','Helvetica Neue',Arial,sans-serif";

const PROVIDER_ICONS = {
  google: (
    <svg width="22" height="22" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  ),
  phone: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="1" width="14" height="22" rx="3" stroke="#a0a0a0" strokeWidth="1.8"/>
      <circle cx="12" cy="18.5" r="1" fill="#a0a0a0"/>
      <line x1="9" y1="4.5" x2="15" y2="4.5" stroke="#a0a0a0" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
};

const VALUE_PROPS = [
  {
    icon: "users",
    emoji: "🌐",
    label: "Networking",
    sub: "Connect with driven people",
    title: "Networking",
    summary:
      "At Life. it is not just about knowledge. You can connect with driven people, ambitious builders, and future collaborators who want to grow, make money, and move forward together.",
    bullets: [
      "Meet people who care about growth and execution",
      "Build relationships around shared ambition",
      "Turn conversations into opportunities and partnerships",
    ],
  },
  {
    icon: "lock",
    emoji: "🔒",
    label: "Secret Knowledge",
    sub: "What they don't teach you",
    title: "Secret Knowledge",
    summary:
      "Life. highlights the practical truths most people never get shown early enough: how money works, how systems are designed, and where real leverage tends to come from.",
    bullets: [
      "Learn what is usually skipped in school",
      "Understand the hidden rules behind money and status",
      "Spot leverage, incentives, and real-world advantage faster",
    ],
  },
  {
    icon: "star",
    emoji: "⭐",
    label: "Tailored Growth",
    sub: "Personalised to your goals",
    title: "Tailored Growth",
    summary:
      "Your path should match your goals. Life. helps shape the experience around what you want to improve, so growth feels relevant instead of random.",
    bullets: [
      "Focus on what matters to your stage of life",
      "Spend less time guessing what to learn next",
      "Build momentum around your actual priorities",
    ],
  },
  {
    icon: "compass",
    emoji: "🧭",
    label: "Structured Path",
    sub: "Your friend to success",
    title: "Structured Path",
    summary:
      "Life. gives you direction, not noise. The platform is designed to help you move from confusion to clarity with a path that is easier to follow and easier to stick to.",
    bullets: [
      "Get a clearer route instead of scattered advice",
      "Move step by step with purpose",
      "Stay consistent with structure that supports progress",
    ],
  },
];

export function LandingPage({
  play,
  setScreen,
  AUTH_PROVIDERS,
  doProviderSignIn,
  siSocialErr,
  systemNotice,
}) {
  const [activeValueProp, setActiveValueProp] = useState(null);
  const activeValuePropData = VALUE_PROPS.find((item) => item.label === activeValueProp) || null;
  const [panelDragY, setPanelDragY] = useState(0);
  const [panelFullScreen, setPanelFullScreen] = useState(false);
  const [panelPhase, setPanelPhase] = useState("idle"); // "idle"|"dragging"|"snapping"
  const panelDragRef = useRef({ active:false, startY:0, pointerId:null });
  const prefersReducedMotion = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  // Resets all drag/phase/fullscreen state (used both when opening and closing the panel).
  const resetDragState = () => {
    setPanelDragY(0);
    setPanelPhase("idle");
    setPanelFullScreen(false);
  };

  // Closes the panel and resets all state.
  const resetPanel = () => {
    setActiveValueProp(null);
    resetDragState();
  };

  return (
    <div
      data-page-tag="#landing_page"
      className="life-grain life-landing-shell"
      style={{
        background: "linear-gradient(180deg, #050505 0%, #0a0a0a 60%, #050505 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        fontFamily: SF,
        padding: "max(36px, calc(22px + var(--safe-top, 0px))) 20px max(38px, calc(24px + var(--safe-bottom, 0px)))",
        position: "relative",
        minHeight: "100dvh",
        boxSizing: "border-box",
      }}
    >
      <style>{`
        @keyframes landing-icon-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes landing-fade-up { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes landing-sheet-up { from{transform:translateY(100%)} to{transform:translateY(0)} }
        .landing-row-btn { -webkit-tap-highlight-color:transparent; }
        .landing-row-btn:active { opacity:0.6; }
        .landing-cta-primary:active { transform:scale(0.97)!important; opacity:0.92; }
        .landing-cta-secondary:active { transform:scale(0.97)!important; opacity:0.8; }
        .landing-social-btn:active { transform:scale(0.93)!important; }
        @media (min-width: 640px) {
          .landing-vp-grid { display: grid !important; grid-template-columns: repeat(2, 1fr) !important; }
          .landing-vp-grid button:nth-child(1), .landing-vp-grid button:nth-child(2) { border-bottom: 0.5px solid rgba(255,255,255,0.1) !important; }
          .landing-vp-grid button:nth-child(3), .landing-vp-grid button:nth-child(4) { border-bottom: none !important; }
          .landing-vp-grid button:nth-child(odd) { border-right: 0.5px solid rgba(255,255,255,0.1) !important; }
          .landing-vp-grid button:nth-child(even) { border-right: none !important; }
        }
      `}</style>

      {/* ── HERO ─────────────────────────────────────────── */}
      <div
        style={{
          width: "100%",
          maxWidth: 390,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 0,
        }}
      >
        {/* App icon — iOS squircle */}
        <div
          style={{
            width: 96,
            height: 96,
            borderRadius: "22%",
            background: "linear-gradient(145deg, #1c1c1e, #2c2c2e)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 18,
            boxShadow: "0 12px 40px rgba(0,0,0,0.55), 0 0 0 0.5px rgba(255,255,255,0.1)",
            animation: "landing-icon-float 4s ease-in-out infinite",
          }}
        >
          {/* SF Pro logotype letter */}
          <span style={{ color: "#fff", fontSize: 44, fontWeight: 700, fontFamily: "-apple-system,'SF Pro Display','SF Pro Text','Helvetica Neue',Arial,sans-serif", letterSpacing: "-0.02em", lineHeight: 1 }}>L</span>
        </div>

        {/* App name — SF Pro Rounded Black per Life. design system v1.0 */}
        <h1
          style={{
            margin: "0 0 8px",
            fontSize: 38,
            fontWeight: 900,
            color: "#ffffff",
            fontFamily: "var(--life-font-rounded)",
            letterSpacing: "-0.025em",
            lineHeight: 1.05,
            textAlign: "center",
            display: "inline-flex",
            alignItems: "baseline",
            justifyContent: "center",
            gap: "0.04em",
            animation: "landing-fade-up 0.5s ease-out 0.1s both",
          }}
        >
          <span>Life</span>
          <span
            aria-hidden="true"
            style={{
              display: "inline-block",
              width: "0.16em",
              height: "0.16em",
              background: "var(--life-green)",
              borderRadius: "50%",
              marginBottom: "0.06em",
            }}
          />
        </h1>
        <p
          style={{
            margin: "0 0 28px",
            fontSize: 15,
            color: "rgba(255,255,255,0.5)",
            fontFamily: SF,
            fontWeight: 400,
            letterSpacing: "0.01em",
            textAlign: "center",
            animation: "landing-fade-up 0.5s ease-out 0.18s both",
          }}
        >
          Knowledge · Growth · Community
        </p>

        <SystemStatusNotice notice={systemNotice} dark />

        {/* ── VALUE PROPS — iOS inset-grouped list ──────── */}
        <div
          className="landing-vp-grid"
          style={{
            width: "100%",
            maxWidth: 390,
            background: "rgba(255,255,255,0.06)",
            borderRadius: 18,
            border: "0.5px solid rgba(255,255,255,0.12)",
            overflow: "hidden",
            marginBottom: 28,
            animation: "landing-fade-up 0.5s ease-out 0.25s both",
          }}
        >
          {VALUE_PROPS.map((v, i) => (
            <button
              key={v.label}
              type="button"
              className="landing-row-btn"
              onClick={() => { play("tap"); setActiveValueProp(v.label); resetDragState(); }}
              data-page-tag={`#landing_value_prop_${v.label.toLowerCase().replace(/\s+/g, "_")}`}
              aria-label={`Open ${v.label} overview`}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "13px 16px",
                background: "transparent",
                border: "none",
                borderBottom: i < VALUE_PROPS.length - 1 ? "0.5px solid rgba(255,255,255,0.1)" : "none",
                borderLeft: "none",
                borderRight: "none",
                borderTop: "none",
                cursor: "pointer",
                textAlign: "left",
                WebkitTapHighlightColor: "transparent",
                transition: "background 0.12s ease",
              }}
            >
              {/* Emoji icon pill */}
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: "rgba(255,255,255,0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  flexShrink: 0,
                }}
              >
                {v.emoji}
              </div>
              {/* Labels */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "#ffffff", fontFamily: SF, letterSpacing: "-0.01em", lineHeight: 1.2 }}>
                  {v.label}
                </p>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: "rgba(255,255,255,0.45)", fontFamily: SF, fontWeight: 400, lineHeight: 1.3 }}>
                  {v.sub}
                </p>
              </div>
              {/* Chevron */}
              <svg width="8" height="14" viewBox="0 0 8 14" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="1 1 7 7 1 13" />
              </svg>
            </button>
          ))}
        </div>

        {/* ── CTA BUTTONS ──────────────────────────────── */}
        <div
          style={{
            width: "100%",
            maxWidth: 390,
            display: "flex",
            flexDirection: "column",
            gap: 10,
            animation: "landing-fade-up 0.5s ease-out 0.32s both",
          }}
        >
          {/* Primary — Get Started / Register */}
          <button
            type="button"
            className="landing-cta-primary"
            onClick={() => { play("tap"); setScreen("register"); }}
            style={{
              width: "100%",
              height: 52,
              background: "#50c878",
              border: "none",
              borderRadius: 14,
              color: "#000000",
              fontSize: 17,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: SF,
              letterSpacing: "-0.01em",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              transition: "transform 0.18s cubic-bezier(0.34,1.56,0.64,1), opacity 0.15s ease",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            Get Started
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          {/* Secondary — Sign In */}
          <button
            type="button"
            className="landing-cta-secondary"
            onClick={() => { play("tap"); setScreen("signin"); }}
            style={{
              width: "100%",
              height: 52,
              background: "rgba(255,255,255,0.09)",
              border: "0.5px solid rgba(255,255,255,0.18)",
              borderRadius: 14,
              color: "#ffffff",
              fontSize: 17,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: SF,
              letterSpacing: "-0.01em",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              transition: "transform 0.18s cubic-bezier(0.34,1.56,0.64,1), opacity 0.15s ease",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/>
              <polyline points="10 17 15 12 10 7"/>
              <line x1="15" y1="12" x2="3" y2="12"/>
            </svg>
            Sign In
          </button>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "2px 4px" }}>
            <div style={{ flex: 1, height: "0.5px", background: "rgba(255,255,255,0.14)" }} />
            <span style={{ color: "rgba(255,255,255,0.38)", fontSize: 13, fontFamily: SF, fontWeight: 400, whiteSpace: "nowrap" }}>or continue with</span>
            <div style={{ flex: 1, height: "0.5px", background: "rgba(255,255,255,0.14)" }} />
          </div>

          {/* Social sign-in */}
          <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
            {AUTH_PROVIDERS.map((item) => (
              <button
                key={item.key}
                type="button"
                className="landing-social-btn"
                onClick={() => doProviderSignIn(item)}
                title={item.live ? `Continue with ${item.label}` : `${item.label} coming soon`}
                aria-label={`Continue with ${item.label}`}
                style={{
                  width: 58,
                  height: 58,
                  background: "rgba(255,255,255,0.08)",
                  border: "0.5px solid rgba(255,255,255,0.14)",
                  borderRadius: 16,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: item.live ? "pointer" : "not-allowed",
                  padding: 14,
                  boxSizing: "border-box",
                  opacity: item.live ? 1 : 0.4,
                  transition: "transform 0.16s cubic-bezier(0.34,1.56,0.64,1)",
                  WebkitTapHighlightColor: "transparent",
                  position: "relative",
                }}
              >
                {PROVIDER_ICONS[item.key] ?? <span style={{ color: "#fff", fontSize: 13, fontWeight: 700, fontFamily: SF }}>{item.label[0]}</span>}
                {!item.live && (
                  <span style={{ position: "absolute", bottom: 4, fontSize: 7, fontWeight: 600, color: "rgba(255,255,255,0.35)", letterSpacing: 0.5, textTransform: "uppercase", fontFamily: SF }}>
                    Soon
                  </span>
                )}
              </button>
            ))}
          </div>
          {siSocialErr && (
            <p style={{ margin: "0", fontSize: 12, color: "#e5484d", textAlign: "center", fontFamily: SF, lineHeight: 1.5 }}>
              {siSocialErr}
            </p>
          )}
        </div>
      </div>

      {/* ── FOOTER LINKS ──────────────────────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, paddingTop: 12 }}>
        <div style={{ display: "flex", gap: 24 }}>
          <button
            type="button"
            onClick={() => { play("tap"); setScreen("privacy_policy"); }}
            style={{
              background: "none",
              border: "none",
              color: "rgba(255,255,255,0.32)",
              fontSize: 12,
              cursor: "pointer",
              fontFamily: SF,
              padding: "8px 4px",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            Privacy Policy
          </button>
          <button
            type="button"
            onClick={() => { play("tap"); setScreen("terms_conditions"); }}
            style={{
              background: "none",
              border: "none",
              color: "rgba(255,255,255,0.32)",
              fontSize: 12,
              cursor: "pointer",
              fontFamily: SF,
              padding: "8px 4px",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            Terms &amp; Conditions
          </button>
        </div>
        <p style={{ margin: 0, color: "rgba(255,255,255,0.2)", fontSize: 11, fontFamily: SF, textAlign: "center" }}>
          © 2026 Life. All rights reserved.
        </p>
      </div>

      {/* ── VALUE PROP BOTTOM SHEET ───────────────────────── */}
      {activeValuePropData && (() => {
        const sheetMaxH = panelFullScreen ? "100dvh" : "82dvh";
        const sheetBorderRadius = panelFullScreen ? "0" : "22px 22px 0 0";
        const backdropOpacity = panelDragY > 0
          ? Math.max(0, 0.55 - (panelDragY / 300) * 0.55)
          : 0.55;

        const handlePanelPointerDown = (e) => {
          if (e.pointerType === "mouse" && e.button !== 0) return;
          panelDragRef.current = { active:true, startY:e.clientY, pointerId:e.pointerId };
          try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* ignore */ }
          setPanelPhase("dragging");
        };
        const handlePanelPointerMove = (e) => {
          if (!panelDragRef.current.active) return;
          const dy = e.clientY - panelDragRef.current.startY;
          setPanelDragY(dy);
        };
        const handlePanelPointerUp = (e) => {
          if (!panelDragRef.current.active) return;
          panelDragRef.current.active = false;
          const dy = panelDragY;
          const panelH = e.currentTarget.offsetHeight;
          if (dy > panelH * 0.3) {
            setPanelPhase("snapping");
            setPanelDragY(window.innerHeight);
            setTimeout(() => { resetPanel(); }, 350);
          } else if (!panelFullScreen && dy < -(panelH * 0.2)) {
            setPanelFullScreen(true);
            setPanelDragY(0);
            setPanelPhase("snapping");
            setTimeout(() => setPanelPhase("idle"), 400);
          } else if (panelFullScreen && dy > 80) {
            setPanelFullScreen(false);
            setPanelDragY(0);
            setPanelPhase("snapping");
            setTimeout(() => setPanelPhase("idle"), 400);
          } else {
            setPanelPhase("snapping");
            setPanelDragY(0);
            setTimeout(() => setPanelPhase("idle"), 400);
          }
        };

        const transform = panelDragY !== 0 ? `translateY(${panelDragY}px)` : undefined;
        const transition = panelPhase === "dragging" ? "none"
          : prefersReducedMotion ? "opacity 0.2s ease"
          : "transform 0.38s cubic-bezier(0.34,1.56,0.64,1), border-radius 0.35s ease, height 0.35s ease";

        return (
          <>
            <button
              type="button"
              aria-label="Close"
              onClick={() => resetPanel()}
              style={{
                position:"fixed", inset:0,
                background:`rgba(0,0,0,${backdropOpacity})`,
                backdropFilter:"blur(6px)", WebkitBackdropFilter:"blur(6px)",
                border:"none", cursor:"pointer", zIndex:80,
                transition:"background 0.1s ease",
              }}
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="vp-sheet-title"
              onPointerDown={handlePanelPointerDown}
              onPointerMove={handlePanelPointerMove}
              onPointerUp={handlePanelPointerUp}
              onPointerCancel={handlePanelPointerUp}
              style={{
                position:"fixed", left:0, right:0, bottom:0, zIndex:81,
                background:"rgba(28,28,30,0.96)",
                backdropFilter:"blur(24px) saturate(180%)",
                WebkitBackdropFilter:"blur(24px) saturate(180%)",
                borderRadius:sheetBorderRadius,
                maxHeight:sheetMaxH,
                height: panelFullScreen ? "100dvh" : "auto",
                overflowY:"auto",
                WebkitOverflowScrolling:"touch",
                transform,
                transition: prefersReducedMotion ? "opacity 0.2s ease" : transition,
                boxShadow:"0 -4px 40px rgba(0,0,0,0.4)",
                touchAction:"none",
              }}
            >
              {/* Drag handle */}
              <div style={{ width:36, height:4, borderRadius:999, background:"rgba(255,255,255,0.2)", margin:"12px auto 0" }} />

              <div style={{ padding:"8px 22px calc(max(28px, env(safe-area-inset-bottom)) + 10px)" }}>
                {/* Header */}
                <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12, marginBottom:18 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                    <div style={{ width:48, height:48, borderRadius:14, background:"rgba(255,255,255,0.08)", border:"0.5px solid rgba(255,255,255,0.12)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, flexShrink:0 }}>
                      {activeValuePropData.emoji}
                    </div>
                    <h2 id="vp-sheet-title" style={{ margin:0, fontSize:22, fontWeight:700, color:"#ffffff", fontFamily:SF, letterSpacing:"-0.025em", lineHeight:1.1 }}>
                      {activeValuePropData.title}
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => resetPanel()}
                    aria-label="Close"
                    style={{ width:30, height:30, borderRadius:"50%", border:"none", background:"rgba(255,255,255,0.12)", color:"#ffffff", fontSize:18, lineHeight:1, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, WebkitTapHighlightColor:"transparent" }}
                  >
                    ×
                  </button>
                </div>
                {/* Summary */}
                <p style={{ margin:"0 0 20px", color:"rgba(255,255,255,0.72)", fontSize:15, lineHeight:1.75, fontFamily:SF }}>
                  {activeValuePropData.summary}
                </p>
                {/* Bullets */}
                <div style={{ background:"rgba(255,255,255,0.05)", borderRadius:14, border:"0.5px solid rgba(255,255,255,0.1)", overflow:"hidden" }}>
                  {activeValuePropData.bullets.map((item, bi) => (
                    <div key={item} style={{ display:"flex", alignItems:"flex-start", gap:12, padding:"13px 16px", borderBottom: bi < activeValuePropData.bullets.length - 1 ? "0.5px solid rgba(255,255,255,0.08)" : "none" }}>
                      <div style={{ width:22, height:22, borderRadius:"50%", background:"rgba(80,200,120,0.18)", color:"#50c878", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontSize:12, fontWeight:700, marginTop:1 }}>✓</div>
                      <span style={{ color:"rgba(255,255,255,0.82)", fontSize:14, lineHeight:1.65, fontFamily:SF }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        );
      })()}
    </div>
  );
}


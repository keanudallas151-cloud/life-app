"use client";

import { useState } from "react";
import { SystemStatusNotice } from "./SystemStatusNotice";

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
  Ic,
  play,
  setScreen,
  AUTH_PROVIDERS,
  doProviderSignIn,
  siSocialErr,
  systemNotice,
}) {
  const [activeValueProp, setActiveValueProp] = useState(null);
  const activeValuePropData = VALUE_PROPS.find((item) => item.label === activeValueProp) || null;

  return (
    <div
      data-page-tag="#landing_page"
      className="life-grain life-landing-shell"
      style={{
        background: "linear-gradient(165deg, #000000 0%, #0a0a0a 45%, #000000 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        fontFamily: "Georgia,serif",
        padding: "max(36px, calc(22px + var(--safe-top, 0px))) 20px max(38px, calc(24px + var(--safe-bottom, 0px)))",
        position: "relative",
        minHeight: "100dvh",
        boxSizing: "border-box",
      }}
    >
      <style>{`
        @keyframes life-logo-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes life-glow-pulse { 0%,100%{box-shadow:0 8px 32px rgba(255,255,255,0.08)} 50%{box-shadow:0 12px 48px rgba(255,255,255,0.14)} }
        @keyframes life-tag-fade { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes life-shine { 0%{background-position:200% center} 100%{background-position:-200% center} }
      `}</style>
      <div style={{ position: "absolute", top: -80, right: -80, width: 240, height: 240, borderRadius: "50%", border: "1.5px solid rgba(255,255,255,0.06)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: "14%", right: "9%", width: 72, height: 72, borderRadius: "50%", background: "rgba(255,255,255,0.04)", filter: "blur(1px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: -60, left: -60, width: 180, height: 180, borderRadius: "50%", border: "1.5px solid rgba(255,255,255,0.04)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: "30%", left: -40, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.02)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "18%", right: "12%", width: 132, height: 132, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 70%, transparent 100%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: "56%", left: "8%", width: 44, height: 44, borderRadius: "50%", border: "1.5px solid rgba(255,255,255,0.06)", pointerEvents: "none" }} />

      <div
        style={{
          width: "100%",
          maxWidth: 360,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div style={{ marginBottom: 18, textAlign: "center" }}>
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: "22%",
              background: "linear-gradient(145deg, #2d2d2d, #3a3a3a)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 14px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.08)",
              animation: "life-logo-float 4s ease-in-out infinite, life-glow-pulse 3s ease-in-out infinite",
            }}
          >
            <span style={{ color: "#fff", fontSize: 42, fontWeight: 800, fontFamily: "Georgia,serif", letterSpacing: -2 }}>l.</span>
          </div>
          <h1
            style={{
              margin: 0,
              fontSize: "clamp(2.6rem, 9vw, 3.6rem)",
              fontWeight: 800,
              color: "#ffffff",
              fontFamily: "Georgia,serif",
              letterSpacing: -1,
            }}
          >
            Life.
          </h1>
          <p style={{ margin: "8px 0 0", fontSize: 14, color: "rgba(255,255,255,0.5)", fontStyle: "italic" }}>
            Knowledge, Growth, Community
          </p>
        </div>

        <SystemStatusNotice notice={systemNotice} dark />

        <div style={{ width: "100%", maxWidth: 360, marginBottom: 22 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {VALUE_PROPS.map((v, i) => (
              <button
                key={v.label}
                type="button"
                onClick={() => {
                  play("tap");
                  setActiveValueProp(v.label);
                }}
                data-page-tag={`#landing_value_prop_${v.label.toLowerCase().replace(/\s+/g, "_")}`}
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 12,
                  padding: "12px 10px",
                  textAlign: "center",
                  cursor: "pointer",
                  animation: `life-tag-fade 0.5s ease-out ${0.2 + i * 0.1}s both`,
                  backdropFilter: "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)",
                  minHeight: 92,
                }}
                aria-label={`Open ${v.label} overview`}
              >
                <div style={{ marginBottom: 6 }}>{Ic[v.icon]?.("none", "#a0a0a0", 20)}</div>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "#ffffff" }}>{v.label}</p>
                <p style={{ margin: "2px 0 0", fontSize: 10, color: "rgba(255,255,255,0.45)", fontStyle: "italic" }}>{v.sub}</p>
              </button>
            ))}
          </div>
        </div>

        {activeValuePropData && (
          <div data-page-tag="#landing_value_prop_overlay" style={{ position: "fixed", inset: 0, zIndex: 90, display: "flex", alignItems: "stretch", justifyContent: "center", background: "rgba(0,0,0,0.58)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)" }}>
            <button type="button" aria-label="Close overview" onClick={() => setActiveValueProp(null)} style={{ position: "absolute", inset: 0, border: "none", background: "transparent", cursor: "pointer" }} />
            <div role="dialog" aria-modal="true" aria-labelledby="landing-value-prop-title" style={{ position: "relative", zIndex: 1, width: "min(100vw, 520px)", minHeight: "100dvh", padding: "max(26px, calc(18px + var(--safe-top, 0px))) 22px max(26px, calc(22px + var(--safe-bottom, 0px)))", background: "linear-gradient(180deg, rgba(8,8,8,0.98) 0%, rgba(14,14,14,0.98) 100%)", color: "#ffffff", boxSizing: "border-box", overflowY: "auto" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 22 }}>
                <div>
                  <h2 id="landing-value-prop-title" style={{ margin: 0, fontSize: "clamp(2rem, 8vw, 2.8rem)", fontWeight: 800, color: "#ffffff", fontFamily: "Georgia,serif", letterSpacing: -0.8 }}>
                    {activeValuePropData.title}
                  </h2>
                </div>
                <button type="button" onClick={() => setActiveValueProp(null)} aria-label={`Close ${activeValuePropData.title} overview`} style={{ width: 44, height: 44, minWidth: 44, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.14)", background: "rgba(255,255,255,0.05)", color: "#ffffff", cursor: "pointer", fontSize: 22, lineHeight: 1 }}>
                  ×
                </button>
              </div>
              <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 64, height: 64, borderRadius: 18, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", marginBottom: 18 }}>
                {Ic[activeValuePropData.icon]?.("none", "#d5d5d5", 28)}
              </div>
              <p style={{ margin: "0 0 22px", color: "rgba(255,255,255,0.76)", fontSize: 16, lineHeight: 1.8, fontFamily: "Georgia,serif" }}>{activeValuePropData.summary}</p>
              <div style={{ display: "grid", gap: 12 }}>
                {activeValuePropData.bullets.map((item) => (
                  <div key={item} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 14px", borderRadius: 16, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <span aria-hidden style={{ width: 24, height: 24, borderRadius: "50%", background: "rgba(90,125,106,0.24)", color: "#b9d7c7", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 13, fontWeight: 700 }}>+
                    </span>
                    <span style={{ color: "rgba(255,255,255,0.82)", fontSize: 14, lineHeight: 1.7 }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div style={{ width: "100%", maxWidth: 340, display: "flex", flexDirection: "column", gap: 12 }}>
          <button
            className="life-card-hover life-signin-btn"
            onClick={() => {
              play("tap");
              setScreen("signin");
            }}
            style={{
              background: "rgba(255,255,255,0.08)",
              backdropFilter: "blur(14px) saturate(1.4)",
              WebkitBackdropFilter: "blur(14px) saturate(1.4)",
              border: "1.5px solid rgba(255,255,255,0.35)",
              borderRadius: 14,
              padding: "17px 18px",
              color: "#ffffff",
              fontSize: 17,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "Georgia,serif",
              boxShadow: "0 4px 16px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
            Sign In
          </button>
          <button
            className="life-card-hover"
            onClick={() => {
              play("tap");
              setScreen("register");
            }}
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1.5px solid rgba(255,255,255,0.28)",
              borderRadius: 14,
              padding: "17px 18px",
              color: "#fff",
              fontSize: 17,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "Georgia,serif",
              boxShadow: "0 4px 16px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
              <circle cx="8.5" cy="7" r="4" />
              <line x1="20" y1="8" x2="20" y2="14" />
              <line x1="23" y1="11" x2="17" y2="11" />
            </svg>
            Register
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "2px 16px" }}>
            <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.15))" }} />
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, fontStyle: "italic", whiteSpace: "nowrap" }}>
              or continue with
            </span>
            <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, rgba(255,255,255,0.15), transparent)" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
            {AUTH_PROVIDERS.map((item) => (
              <button
                key={item.key}
                onClick={() => doProviderSignIn(item)}
                title={item.live ? `Continue with ${item.label}` : `${item.label} coming soon`}
                aria-label={`Continue with ${item.label}`}
                className="social-btn"
                style={{
                  width: 58,
                  height: 58,
                  background: "rgba(255,255,255,0.08)",
                  border: "1.5px solid rgba(255,255,255,0.12)",
                  borderRadius: 16,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: item.live ? "pointer" : "not-allowed",
                  padding: 14,
                  boxSizing: "border-box",
                  opacity: item.live ? 1 : 0.4,
                  transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.2)",
                  transform: "scale(1)",
                  position: "relative",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.08)";
                  e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.3)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.2)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
                }}
              >
                {PROVIDER_ICONS[item.key] ?? <span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>{item.label[0]}</span>}
                {!item.live && <span style={{ position: "absolute", bottom: 4, fontSize: 7, fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: 0.5, textTransform: "uppercase" }}>Soon</span>}
              </button>
            ))}
          </div>
          {siSocialErr && <p style={{ margin: "-4px 0 0", fontSize: 12, color: "#d25545", textAlign: "center", fontStyle: "italic", lineHeight: 1.5 }}>{siSocialErr}</p>}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
        <div style={{ display: "flex", gap: 16, marginTop: 14 }}>
          <button
            onClick={() => {
              play("tap");
              setScreen("privacy_policy");
            }}
            style={{ background: "none", border: "none", outline: "none", boxShadow: "none", color: "rgba(255,255,255,0.35)", fontSize: 10, cursor: "pointer", fontFamily: "Georgia,serif", textDecoration: "none", padding: 0 }}
          >
            Privacy Policy
          </button>
          <button
            onClick={() => {
              play("tap");
              setScreen("terms_conditions");
            }}
            style={{ background: "none", border: "none", outline: "none", boxShadow: "none", color: "rgba(255,255,255,0.35)", fontSize: 10, cursor: "pointer", fontFamily: "Georgia,serif", textDecoration: "none", padding: 0 }}
          >
            Terms & Conditions
          </button>
        </div>
        <p className="life-footer" style={{ margin: "16px 0 0", color: "rgba(255,255,255,0.3)", fontSize: 10, fontStyle: "italic", textAlign: "center" }}>
          © 2026 Life. All rights reserved.
        </p>
      </div>
    </div>
  );
}

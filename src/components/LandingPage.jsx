"use client";
import Image from "next/image";

export function LandingPage({ Ic, play, setScreen, AUTH_PROVIDERS, doProviderSignIn, siSocialErr }) {
  return (
    <div
      data-page-tag="#landing_page"
      className="life-grain life-landing-shell"
      style={{
        minHeight: "100svh",
        background: "linear-gradient(165deg, #000000 0%, #0a0a0a 45%, #000000 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Georgia,serif",
        padding: "40px 24px calc(44px + env(safe-area-inset-bottom))",
        position: "relative",
        overflowX: "hidden",
      }}
    >
      <style>{`
        @keyframes life-logo-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes life-glow-pulse { 0%,100%{box-shadow:0 8px 32px rgba(255,255,255,0.08)} 50%{box-shadow:0 12px 48px rgba(255,255,255,0.14)} }
        @keyframes life-tag-fade { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes life-shine { 0%{background-position:200% center} 100%{background-position:-200% center} }
      `}</style>
      {/* Decorative circles */}
      <div
        style={{
          position: "absolute",
          top: -80,
          right: -80,
          width: 240,
          height: 240,
          borderRadius: "50%",
          border: "1.5px solid rgba(255,255,255,0.06)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "14%",
          right: "9%",
          width: 72,
          height: 72,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.04)",
          filter: "blur(1px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -60,
          left: -60,
          width: 180,
          height: 180,
          borderRadius: "50%",
          border: "1.5px solid rgba(255,255,255,0.04)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "30%",
          left: -40,
          width: 100,
          height: 100,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.02)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "18%",
          right: "12%",
          width: 132,
          height: 132,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 70%, transparent 100%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "56%",
          left: "8%",
          width: 44,
          height: 44,
          borderRadius: "50%",
          border: "1.5px solid rgba(255,255,255,0.06)",
          pointerEvents: "none",
        }}
      />

      <div style={{ marginBottom: 24, textAlign: "center" }}>
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: "22%",
            background: "linear-gradient(145deg, #2d2d2d, #3a3a3a)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 18px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.08)",
            animation:
              "life-logo-float 4s ease-in-out infinite, life-glow-pulse 3s ease-in-out infinite",
          }}
        >
          <span
            style={{
              color: "#fff",
              fontSize: 52,
              fontWeight: 800,
              fontFamily: "Georgia,serif",
              letterSpacing: -2,
            }}
          >
            l.
          </span>
        </div>
        <h1
          style={{
            margin: 0,
            fontSize: "clamp(2.8rem, 10vw, 4rem)",
            fontWeight: 800,
            color: "#ffffff",
            fontFamily: "Georgia,serif",
            letterSpacing: -1,
          }}
        >
          Life.
        </h1>
        <p
          style={{
            margin: "8px 0 0",
            fontSize: 15,
            color: "rgba(255,255,255,0.5)",
            fontStyle: "italic",
          }}
        >
          Knowledge, Growth, Community
        </p>
      </div>

      {/* Value Proposition */}
      <div style={{ width: "100%", maxWidth: 360, marginBottom: 28 }}>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}
        >
          {[
            {
              icon: "users",
              label: "Networking",
              sub: "Connect with driven people",
            },
            {
              icon: "lock",
              label: "Secret Knowledge",
              sub: "What they don't teach you",
            },
            {
              icon: "star",
              label: "Tailored Growth",
              sub: "Personalised to your goals",
            },
            {
              icon: "compass",
              label: "Structured Path",
              sub: "Your friend to success",
            },
          ].map((v, i) => (
            <div
              key={v.label}
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 12,
                padding: "12px 10px",
                textAlign: "center",
                animation: `life-tag-fade 0.5s ease-out ${0.2 + i * 0.1}s both`,
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
              }}
            >
              <div style={{ marginBottom: 6 }}>
                {Ic[v.icon]?.("none", "#a0a0a0", 20)}
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#ffffff",
                }}
              >
                {v.label}
              </p>
              <p
                style={{
                  margin: "2px 0 0",
                  fontSize: 10,
                  color: "rgba(255,255,255,0.45)",
                  fontStyle: "italic",
                }}
              >
                {v.sub}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          width: "100%",
          maxWidth: 340,
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
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
            padding: "18px 20px",
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
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#ffffff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
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
            background: "linear-gradient(135deg, #3d5a4c 0%, #5a7d6a 100%)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 14,
            padding: "18px 20px",
            color: "#fff",
            fontSize: 17,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "Georgia,serif",
            boxShadow: "0 8px 24px rgba(61,90,76,0.4), 0 2px 8px rgba(61,90,76,0.25), inset 0 1px 0 rgba(255,255,255,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
            <circle cx="8.5" cy="7" r="4" />
            <line x1="20" y1="8" x2="20" y2="14" />
            <line x1="23" y1="11" x2="17" y2="11" />
          </svg>
          Register
        </button>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            margin: "4px 16px",
          }}
        >
          <div
            style={{
              flex: 1,
              height: 1,
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.15))",
            }}
          />
          <span
            style={{
              color: "rgba(255,255,255,0.4)",
              fontSize: 12,
              fontStyle: "italic",
              whiteSpace: "nowrap",
            }}
          >
            or continue with
          </span>
          <div
            style={{
              flex: 1,
              height: 1,
              background: "linear-gradient(90deg, rgba(255,255,255,0.15), transparent)",
            }}
          />
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
          {AUTH_PROVIDERS.map((item) => (
            <button
              key={item.key}
              onClick={() => doProviderSignIn(item)}
              title={
                item.live
                  ? `Continue with ${item.label}`
                  : `${item.label} coming soon`
              }
              aria-label={`Continue with ${item.label}`}
              className="social-btn"
              style={{
                width: 60,
                height: 60,
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
                e.currentTarget.style.transform = "scale(1.1)";
                e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.3)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.2)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
              }}
            >
              <Image
                src={item.file}
                alt={item.label}
                width={28}
                height={28}
                style={{
                  width: 28,
                  height: 28,
                  objectFit: "contain",
                  display: "block",
                }}
              />
              {!item.live && (
                <span
                  style={{
                    position: "absolute",
                    bottom: 4,
                    fontSize: 7,
                    fontWeight: 700,
                    color: "rgba(255,255,255,0.35)",
                    letterSpacing: 0.5,
                    textTransform: "uppercase",
                  }}
                >
                  Soon
                </span>
              )}
            </button>
          ))}
        </div>
        {siSocialErr && (
          <p
            style={{
              margin: "-8px 0 0",
              fontSize: 12,
              color: "#d25545",
              textAlign: "center",
              fontStyle: "italic",
              lineHeight: 1.5,
            }}
          >
            {siSocialErr}
          </p>
        )}
      </div>

      <div style={{ display: "flex", gap: 16, marginTop: 16 }}>
        <button
          onClick={() => {
            play("tap");
            setScreen("privacy_policy");
          }}
          style={{
            background: "none",
            border: "none",
            color: "rgba(255,255,255,0.35)",
            fontSize: 10,
            cursor: "pointer",
            fontFamily: "Georgia,serif",
            textDecoration: "underline",
          }}
        >
          Privacy Policy
        </button>
        <button
          onClick={() => {
            play("tap");
            setScreen("terms_conditions");
          }}
          style={{
            background: "none",
            border: "none",
            color: "rgba(255,255,255,0.35)",
            fontSize: 10,
            cursor: "pointer",
            fontFamily: "Georgia,serif",
            textDecoration: "underline",
          }}
        >
          Terms & Conditions
        </button>
      </div>
      <p
        className="life-footer"
        style={{
          margin: "28px 0 0",
          color: "rgba(255,255,255,0.3)",
          fontSize: 10,
          fontStyle: "italic",
          textAlign: "center",
        }}
      >
        © 2026 Life. All rights reserved.
      </p>
    </div>
  );
}

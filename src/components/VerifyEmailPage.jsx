"use client";
export function VerifyEmailPage({ C, play, setScreen, verifyTargetEmail, supabase }) {
  return (
    <div
      data-page-tag="#verify_email_page"
      className="life-grain life-auth-shell"
      style={{
        minHeight: "100svh",
        background: `linear-gradient(165deg, ${C.skin} 0%, ${C.border} 50%, ${C.skin} 100%)`,
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
          border: "1.5px solid rgba(61,90,76,0.09)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          width: 70,
          height: 70,
          borderRadius: "20%",
          background: `linear-gradient(145deg,${C.green},${C.greenAlt})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 24,
          boxShadow: "0 8px 32px rgba(61,90,76,0.35)",
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
        We sent a confirmation link to {verifyTargetEmail || "your email"}.
        Click it to verify your account.
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
            setScreen("signin");
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
}

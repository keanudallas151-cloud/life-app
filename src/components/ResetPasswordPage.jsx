"use client";
export function ResetPasswordPage({
  C,
  S,
  play,
  setScreen,
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
  authLoading,
  doResetPassword,
  passwordRecoveryRef,
}) {
  const passwordStrengthLabels = [
    "Too weak",
    "Weak",
    "Fair",
    "Strong",
    "Very strong",
  ];
  const passwordStrengthColors = [C.red, C.red, "#e6a23c", C.gold, C.green];
  // Clamp to valid array index (0..4) since strength counts 5 booleans (0..5)
  const clampedStrength = Math.min(resetPasswordStrength, passwordStrengthLabels.length - 1);

  const resetPasswordHasMinLength = rpPass.length >= 8;
  const resetPasswordHasUpper = /[A-Z]/.test(rpPass);
  const resetPasswordHasLower = /[a-z]/.test(rpPass);
  const resetPasswordHasNumber = /\d/.test(rpPass);
  const resetPasswordHasSpecial = /[^A-Za-z0-9]/.test(rpPass);
  const resetPasswordStrength = [
    resetPasswordHasMinLength,
    resetPasswordHasUpper,
    resetPasswordHasLower,
    resetPasswordHasNumber,
    resetPasswordHasSpecial,
  ].filter(Boolean).length;
  const resetPasswordHint =
    rpPass.length > 0 && !resetPasswordHasLower
      ? "Add a lowercase letter to match the password rules"
      : rpPass.length > 0 && !resetPasswordHasSpecial
        ? "Add a symbol like !@#$ for extra security"
      : "";
  const resetConfirmMismatch = rpPass2.length > 0 && rpPass !== rpPass2;

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
        <span style={{ color: "#fff", fontSize: 28, fontWeight: 800 }}>
          l.
        </span>
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
                        i < clampedStrength
                          ? passwordStrengthColors[clampedStrength]
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
                  color: passwordStrengthColors[clampedStrength],
                  fontStyle: "italic",
                }}
              >
                {passwordStrengthLabels[clampedStrength]}
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
}

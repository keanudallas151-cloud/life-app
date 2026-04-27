"use client";
import { useState, useEffect } from "react";
import { SystemStatusNotice } from "../shell/SystemStatusNotice";
import { LS } from "../../systems/storage";

export function SignInPage({
  C,
  play,
  setScreen,
  siEmail,
  setSiEmail,
  siPass,
  setSiPass,
  siShowPass,
  setSiShowPass,
  siErr,
  setSiErr,
  authLoading,
  doEmailSignIn,
  forgotMode,
  setForgotMode,
  fpEmail,
  setFpEmail,
  fpErr,
  setFpErr,
  fpMsg,
  setFpMsg,
  doForgotPassword,
  setSiSocialErr,
  systemNotice,
}) {
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const savedEmail = LS.get('life_remembered_email', null);
    if (savedEmail && !siEmail) {
      setSiEmail(savedEmail);
      setRememberMe(true);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRememberToggle = () => {
    const next = !rememberMe;
    setRememberMe(next);
    if (next) {
      if (siEmail) LS.set('life_remembered_email', siEmail);
    } else {
      LS.del('life_remembered_email');
    }
  };

  return (
    <div
      data-page-tag="#sign_in_page"
      className="life-grain life-auth-shell"
      style={{
        background: `linear-gradient(165deg, ${C.skin} 0%, #111111 50%, ${C.skin} 100%)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        fontFamily: "-apple-system,'SF Pro Display','SF Pro Text','Helvetica Neue',Arial,sans-serif",
        padding: "max(26px, calc(16px + var(--safe-top, 0px))) 20px max(40px, calc(16px + var(--safe-bottom, 0px)))",
        position: "relative",
        boxSizing: "border-box",
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

      <div
        style={{
          width: 58,
          height: 58,
          borderRadius: 18,
          background: "linear-gradient(145deg, #2d2d2d, #3a3a3a)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 12,
          boxShadow: "0 4px 16px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.06)",
          animation: "life-logo-float 4s ease-in-out infinite",
          flexShrink: 0,
        }}
      >
        <span style={{ color: "#fff", fontSize: 24, fontWeight: 800 }}>l.</span>
      </div>

      <h2
        style={{
          fontSize: 32,
          fontWeight: 700,
          margin: "12px 0 4px",
          color: C.ink,
          fontFamily: "-apple-system, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif",
          letterSpacing: "-0.035em",
          lineHeight: 1.1,
          textAlign: "center",
        }}
      >
        Welcome Back
      </h2>
      <p
        style={{
          margin: "0 0 24px",
          fontSize: 15,
          color: C.muted,
          fontFamily: "-apple-system, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif",
          letterSpacing: "-0.01em",
          textAlign: "center",
        }}
      >
        Sign in to continue
      </p>

      <SystemStatusNotice notice={systemNotice} style={{ maxWidth: 360, marginBottom: 14 }} />

      <form
        className="life-auth-card"
        onSubmit={(e) => {
          e.preventDefault();
          if (rememberMe && siEmail) LS.set('life_remembered_email', siEmail);
          if (!authLoading) doEmailSignIn();
        }}
        style={{
          width: "100%",
          maxWidth: 360,
          display: "flex",
          flexDirection: "column",
          gap: 10,
          background: C.white,
          borderRadius: 18,
          padding: "20px 16px",
          boxShadow:
            "0 8px 32px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)",
          border: `1px solid ${C.border}`,
          boxSizing: "border-box",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label
            htmlFor="signin-email"
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
            id="signin-email"
            name="email"
            value={siEmail}
            onChange={(e) => {
              setSiEmail(e.target.value);
              setSiErr("");
            }}
            onKeyDown={(e) => e.key === "Enter" && doEmailSignIn()}
            placeholder="you@example.com"
            autoComplete="email"
            inputMode="email"
            enterKeyHint="next"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            style={{
              background: C.skin,
              border: `1.5px solid ${siErr ? C.red : C.border}`,
              borderRadius: 12,
              padding: "13px 14px",
              fontSize: 16,
              color: C.ink,
              outline: "none",
              fontFamily: "-apple-system,'SF Pro Display','SF Pro Text','Helvetica Neue',Arial,sans-serif",
              boxSizing: "border-box",
              width: "100%",
              transition: "border-color 0.2s ease",
            }}
            onFocus={(e) => {
              if (!siErr) e.currentTarget.style.borderColor = C.green;
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = siErr ? C.red : C.border;
            }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label
            htmlFor="signin-password"
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
              id="signin-password"
              name="password"
              value={siPass}
              onChange={(e) => {
                setSiPass(e.target.value);
                setSiErr("");
              }}
              onKeyDown={(e) => e.key === "Enter" && doEmailSignIn()}
              placeholder="Your password"
              autoComplete="current-password"
              enterKeyHint="done"
              style={{
                background: C.skin,
                border: `1.5px solid ${C.border}`,
                borderRadius: 12,
                padding: "13px 64px 13px 16px",
                fontSize: 16,
                color: C.ink,
                outline: "none",
                fontFamily: "-apple-system,'SF Pro Display','SF Pro Text','Helvetica Neue',Arial,sans-serif",
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
              <span className="life-password-toggle-label">{siShowPass ? "Hide" : "Show"}</span>
            </button>
          </div>
        </div>

        {/* Remember Me toggle */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", minHeight:44, padding:"4px 2px" }}>
          <span style={{ fontSize:14, color:C.muted, fontFamily:"-apple-system,'SF Pro Text','Helvetica Neue',Arial,sans-serif" }}>
            Remember me
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={rememberMe}
            onClick={handleRememberToggle}
            style={{
              appearance:"none", border:"none", padding:0, margin:0,
              width:51, height:31, borderRadius:999,
              background: rememberMe ? C.green : "rgba(120,120,128,0.32)",
              position:"relative", cursor:"pointer",
              transition:"background-color 0.2s ease",
              flexShrink:0,
              WebkitTapHighlightColor:"transparent",
            }}
          >
            <span style={{
              position:"absolute",
              top:2, left: rememberMe ? 22 : 2,
              width:27, height:27, borderRadius:"50%",
              background:"#fff",
              boxShadow:"0 2px 6px rgba(0,0,0,0.25)",
              transition:"left 0.2s cubic-bezier(0.34,1.56,0.64,1)",
            }} />
          </button>
        </div>

        {siErr && (
          <p
            style={{
              margin: "2px 0 0",
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

        <button
          type="submit"
          disabled={authLoading}
          style={{
            background: `linear-gradient(135deg, ${C.green}, #3a7d4a)`,
            border: "none",
            borderRadius: 12,
            padding: "15px",
            color: "#fff",
            fontSize: 16,
            fontWeight: 700,
            cursor: authLoading ? "default" : "pointer",
            fontFamily: "-apple-system,'SF Pro Display','SF Pro Text','Helvetica Neue',Arial,sans-serif",
            opacity: authLoading ? 0.7 : 1,
            marginTop: 2,
            boxShadow: "0 4px 16px rgba(255,255,255,0.15)",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            if (!authLoading) {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = "0 6px 20px rgba(255,255,255,0.18)";
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 16px rgba(255,255,255,0.15)";
          }}
        >
          {authLoading ? "Signing in…" : "Sign In"}
        </button>

        <button
          type="button"
          className="life-text-btn"
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
            outline: "none",
            color: C.gold,
            fontSize: 12,
            cursor: "pointer",
            fontFamily: "-apple-system,'SF Pro Display','SF Pro Text','Helvetica Neue',Arial,sans-serif",
            fontStyle: "italic",
            marginTop: 0,
            textAlign: "center",
            padding: 0,
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
              padding: 14,
              marginTop: 2,
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
            <p style={{ margin: "0 0 10px", fontSize: 12, color: C.muted }}>
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
                fontSize: 16,
                color: C.ink,
                outline: "none",
                fontFamily: "-apple-system,'SF Pro Display','SF Pro Text','Helvetica Neue',Arial,sans-serif",
                boxSizing: "border-box",
                marginBottom: 8,
              }}
            />
            {fpErr && <p style={{ margin: "0 0 8px", fontSize: 12, color: C.red }}>{fpErr}</p>}
            {fpMsg && <p style={{ margin: "0 0 8px", fontSize: 12, color: C.green }}>{fpMsg}</p>}
            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
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
                  fontFamily: "-apple-system,'SF Pro Display','SF Pro Text','Helvetica Neue',Arial,sans-serif",
                }}
              >
                {authLoading ? "Sending…" : "Send Reset Email"}
              </button>
              <button
                type="button"
                onClick={() => setForgotMode(false)}
                style={{
                  flex: 1,
                  background: C.light,
                  border: `1px solid ${C.border}`,
                  borderRadius: 10,
                  padding: "10px",
                  color: C.mid,
                  fontSize: 13,
                  cursor: "pointer",
                  fontFamily: "-apple-system,'SF Pro Display','SF Pro Text','Helvetica Neue',Arial,sans-serif",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div style={{ display: "grid", gap: 8, justifyItems: "center", marginTop: 2 }}>
          <button
            type="button"
            className="life-text-btn"
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
              outline: "none",
              color: C.muted,
              fontSize: 13,
              cursor: "pointer",
              fontFamily: "-apple-system,'SF Pro Display','SF Pro Text','Helvetica Neue',Arial,sans-serif",
              fontStyle: "italic",
              width: "100%",
              padding: "4px 0",
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
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
              type="button"
              className="life-text-btn"
              onClick={() => {
                play("tap");
                setScreen("register");
                setSiSocialErr("");
                setSiErr("");
              }}
              style={{
                background: "none",
                border: "none",
                outline: "none",
                color: C.green,
                fontSize: 13,
                cursor: "pointer",
                fontFamily: "-apple-system,'SF Pro Display','SF Pro Text','Helvetica Neue',Arial,sans-serif",
                fontWeight: 700,
                transition: "opacity 0.2s ease",
                padding: 0,
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
      </form>

      <p
        className="life-footer"
        style={{
          margin: "16px 0 0",
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

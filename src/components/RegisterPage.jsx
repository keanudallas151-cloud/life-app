"use client";
import { SystemStatusNotice } from "./SystemStatusNotice";

export function RegisterPage({
  C,
  play,
  setScreen,
  rName,
  setRName,
  rEmail,
  setREmail,
  rDob,
  setRDob,
  rPass,
  setRPass,
  rPass2,
  setRPass2,
  rShowPass,
  setRShowPass,
  rShowPass2,
  setRShowPass2,
  rErr,
  setRErr,
  authLoading,
  doRegister,
  setSiEmail,
  systemNotice,
}) {
  const passwordHasMinLength = rPass.length >= 8;
  const passwordHasUpper = /[A-Z]/.test(rPass);
  const passwordHasLower = /[a-z]/.test(rPass);
  const passwordHasNumber = /\d/.test(rPass);
  const passwordHasSpecial = /[^A-Za-z0-9]/.test(rPass);
  const passwordStrength = [
    passwordHasMinLength,
    passwordHasUpper,
    passwordHasLower,
    passwordHasNumber,
    passwordHasSpecial,
  ].filter(Boolean).length;
  const passwordStrengthLabels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
  const passwordStrengthColors = [C.red, C.red, "#e6a23c", C.gold, C.green];
  const clampedStrength = Math.min(passwordStrength, passwordStrengthLabels.length - 1);
  const confirmMismatch = rPass2.length > 0 && rPass !== rPass2;

  const dobUnderAge = (() => {
    const digits = rDob.replace(/\D/g, "");
    if (digits.length < 8) return false;
    const day = parseInt(digits.slice(0, 2), 10);
    const month = parseInt(digits.slice(2, 4), 10);
    const year = parseInt(digits.slice(4, 8), 10);
    if (!year || !month || !day || month < 1 || month > 12 || day < 1 || day > 31) return false;
    const today = new Date();
    const dob = new Date(year, month - 1, day);
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) age--;
    return age < 13;
  })();

  return (
    <div
      data-page-tag="#register_page"
      className="life-grain life-auth-shell"
      style={{
        background: `linear-gradient(165deg, ${C.skin} 0%, #111111 50%, ${C.skin} 100%)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        fontFamily: "Georgia,serif",
        padding: "max(24px, calc(16px + var(--safe-top, 0px))) 20px max(40px, calc(16px + var(--safe-bottom, 0px)))",
        position: "relative",
        boxSizing: "border-box",
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
        Create Account
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
        Join Life. in under a minute
      </p>

      <SystemStatusNotice notice={systemNotice} style={{ maxWidth: 360, marginBottom: 14 }} />

      <div
        className="life-auth-card"
        style={{
          width: "100%",
          maxWidth: 360,
          display: "flex",
          flexDirection: "column",
          gap: 12,
          background: C.white,
          borderRadius: 18,
          padding: "20px 16px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)",
          border: `1px solid ${C.border}`,
          boxSizing: "border-box",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label htmlFor="register-name" style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: C.muted }}>
            Full Name
          </label>
          <input
            value={rName}
            onChange={(e) => {
              setRName(e.target.value);
              setRErr((p) => ({ ...p, name: null }));
            }}
            placeholder="Your full name"
            id="register-name"
            name="name"
            autoComplete="name"
            inputMode="text"
            enterKeyHint="next"
            autoCapitalize="words"
            style={{
              background: C.skin,
              border: `1.5px solid ${rErr.name ? C.red : C.border}`,
              borderRadius: 12,
              padding: "13px 14px",
              fontSize: 16,
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
          {rErr.name && <p style={{ margin: 0, fontSize: 12, color: C.red, fontStyle: "italic" }}>{rErr.name}</p>}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label htmlFor="register-email" style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: C.muted }}>
            Email
          </label>
          <input
            type="email"
            id="register-email"
            name="email"
            value={rEmail}
            onChange={(e) => {
              setREmail(e.target.value);
              setRErr((p) => ({ ...p, email: null }));
            }}
            placeholder="you@example.com"
            autoComplete="email"
            inputMode="email"
            enterKeyHint="next"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            style={{
              background: C.skin,
              border: `1.5px solid ${rErr.email ? C.red : C.border}`,
              borderRadius: 12,
              padding: "13px 14px",
              fontSize: 16,
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
                background: rErr.email === "already_registered" ? "rgba(215,180,120,0.12)" : "transparent",
                border: rErr.email === "already_registered" ? "1px solid rgba(215,180,120,0.45)" : "none",
                borderRadius: rErr.email === "already_registered" ? 8 : 0,
                padding: rErr.email === "already_registered" ? "8px 12px" : 0,
              }}
            >
              {rErr.email === "already_registered" ? (
                <>
                  Email already in use.{" "}
                  <span
                    onClick={() => {
                      play("tap");
                      setRErr({});
                      setScreen("signin");
                      setSiEmail(rEmail);
                    }}
                    style={{ color: C.green, cursor: "pointer", textDecoration: "underline", fontWeight: 700 }}
                  >
                    Please sign in.
                  </span>
                </>
              ) : (
                rErr.email
              )}
            </p>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: C.muted }}>
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
              padding: "13px 14px",
              fontSize: 16,
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
          {rErr.dob && <p style={{ margin: 0, fontSize: 12, color: C.red, fontStyle: "italic" }}>{rErr.dob}</p>}
          {dobUnderAge && !rErr.dob && <p style={{ margin: 0, fontSize: 12, color: C.red, fontWeight: 600, fontStyle: "italic" }}>You must be 13 or older to use Life.</p>}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: C.muted }}>
            Password
          </label>
          <div className="life-password-field">
            <input
              type={rShowPass ? "text" : "password"}
              id="register-password"
              name="password"
              value={rPass}
              onChange={(e) => {
                setRPass(e.target.value);
                setRErr((p) => ({ ...p, pass: null, pass2: null }));
              }}
              placeholder="Use 8+ characters"
              autoComplete="new-password"
              enterKeyHint="next"
              style={{
                background: C.skin,
                border: `1.5px solid ${rErr.pass ? C.red : C.border}`,
                borderRadius: 12,
                padding: "13px 64px 13px 16px",
                fontSize: 16,
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
            <button className="life-password-toggle" type="button" data-password-toggle="true" aria-label={rShowPass ? "Hide password" : "Show password"} onClick={() => setRShowPass((v) => !v)}>
              <span className="life-password-toggle-label">{rShowPass ? "Hide" : "Show"}</span>
            </button>
          </div>
          {rPass.length > 0 && (
            <div style={{ marginTop: 2 }}>
              <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i < passwordStrength ? passwordStrengthColors[clampedStrength] : C.light, transition: "background 0.2s" }} />
                ))}
              </div>
              <p style={{ margin: 0, fontSize: 11, color: passwordStrengthColors[clampedStrength], fontStyle: "italic" }}>{passwordStrengthLabels[clampedStrength]}</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "2px 10px", marginTop: 6 }}>
                {[
                  { met: passwordHasMinLength, label: "8+ characters" },
                  { met: passwordHasUpper, label: "Uppercase (A–Z)" },
                  { met: passwordHasLower, label: "Lowercase (a–z)" },
                  { met: passwordHasNumber, label: "Number (0–9)" },
                  { met: passwordHasSpecial, label: "Symbol (!@#$…)" },
                ].map((req) => (
                  <div key={req.label} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: req.met ? C.green : C.muted, fontStyle: req.met ? "normal" : "italic", transition: "color 0.18s ease" }}>
                    <span aria-hidden style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 13, height: 13, borderRadius: "50%", background: req.met ? C.green : "transparent", border: req.met ? "none" : `1px solid ${C.muted}66`, color: "#fff", fontSize: 9, fontWeight: 800, flexShrink: 0 }}>
                      {req.met ? "✓" : ""}
                    </span>
                    {req.label}
                  </div>
                ))}
              </div>
            </div>
          )}
          {rErr.pass && <p style={{ margin: 0, fontSize: 12, color: C.red, fontStyle: "italic" }}>{rErr.pass}</p>}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: C.muted }}>
            Confirm Password
          </label>
          <div className="life-password-field">
            <input
              type={rShowPass2 ? "text" : "password"}
              id="register-password-confirm"
              name="password-confirm"
              value={rPass2}
              onChange={(e) => {
                setRPass2(e.target.value);
                setRErr((p) => ({ ...p, pass2: null }));
              }}
              placeholder="Repeat password"
              autoComplete="new-password"
              enterKeyHint="done"
              style={{
                background: C.skin,
                border: `1.5px solid ${rErr.pass2 || confirmMismatch ? C.red : C.border}`,
                borderRadius: 12,
                padding: "13px 64px 13px 16px",
                fontSize: 16,
                color: C.ink,
                outline: "none",
                fontFamily: "Georgia,serif",
                boxSizing: "border-box",
                width: "100%",
                transition: "border-color 0.2s ease",
              }}
              onFocus={(e) => {
                if (!rErr.pass2 && !confirmMismatch) e.currentTarget.style.borderColor = C.green;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = rErr.pass2 || confirmMismatch ? C.red : C.border;
              }}
            />
            <button className="life-password-toggle" type="button" data-password-toggle="true" aria-label={rShowPass2 ? "Hide password" : "Show password"} onClick={() => setRShowPass2((v) => !v)}>
              <span className="life-password-toggle-label">{rShowPass2 ? "Hide" : "Show"}</span>
            </button>
          </div>
          {!rErr.pass2 && confirmMismatch && <p style={{ margin: 0, fontSize: 12, color: C.red, fontStyle: "italic" }}>Not Matching Yet</p>}
          {rErr.pass2 && <p style={{ margin: 0, fontSize: 12, color: C.red, fontStyle: "italic" }}>{rErr.pass2}</p>}
        </div>

        <button
          onClick={doRegister}
          disabled={authLoading || dobUnderAge}
          style={{
            background: dobUnderAge ? C.light : `linear-gradient(135deg, ${C.green}, #3a7d4a)`,
            border: "none",
            borderRadius: 12,
            padding: "15px",
            color: dobUnderAge ? C.muted : "#fff",
            fontSize: 16,
            fontWeight: 700,
            cursor: authLoading || dobUnderAge ? "default" : "pointer",
            fontFamily: "Georgia,serif",
            marginTop: 2,
            opacity: authLoading ? 0.7 : 1,
            boxShadow: dobUnderAge ? "none" : "0 4px 16px rgba(255,255,255,0.15)",
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

        <p style={{ textAlign: "center", color: C.muted, fontSize: 11, fontStyle: "italic", lineHeight: 1.7, margin: 0 }}>
          By registering you agree to Life.'s terms of use. You must be 13+ to join.
        </p>
      </div>

      <p className="life-footer" style={{ margin: "16px 0 0", color: C.muted, fontSize: 10, fontStyle: "italic", textAlign: "center" }}>
        © 2026 Life. All rights reserved.
      </p>
    </div>
  );
}

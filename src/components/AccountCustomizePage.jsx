import { useEffect, useMemo, useRef, useState } from "react";
import { useCurrentUserProfile } from "../hooks/useCurrentUserProfile";

export function AccountCustomizePage({ t, user, play, setPage, initials, onProfileChange }) {
  const [copied, setCopied] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [saveErr, setSaveErr] = useState("");
  const [displayName, setDisplayName] = useState(user?.name || "");
  const [username, setUsername] = useState(user?.username || "");
  const [bio, setBio] = useState("");
  const [socialLinks, setSocialLinks] = useState("");
  const [avatarPreview, setAvatarPreview] = useState(user?.avatarUrl || "");
  const [avatarErr, setAvatarErr] = useState("");
  const fileInputRef = useRef(null);
  const {
    loading,
    saving,
    avatarUploading,
    profileView,
    saveProfile,
    uploadAvatar,
  } = useCurrentUserProfile(user);

  useEffect(() => {
    setDisplayName(profileView.displayName || user?.name || "");
    setUsername(profileView.username || user?.username || "");
    setBio(profileView.bio || "");
    setSocialLinks(profileView.socialLinksText || "");
    setAvatarPreview(profileView.avatarUrl || user?.avatarUrl || "");
  }, [
    profileView.avatarUrl,
    profileView.bio,
    profileView.displayName,
    profileView.socialLinksText,
    profileView.username,
    user?.avatarUrl,
    user?.name,
    user?.username,
  ]);

  const emailFontSize = useMemo(() => {
    const len = (user?.email || "").length;
    if (len > 34) return 10;
    if (len > 28) return 11;
    if (len > 24) return 12;
    return 14;
  }, [user?.email]);

  const handleCopyEmail = () => {
    if (!user?.email) return;
    navigator.clipboard?.writeText(user.email).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }).catch(() => {});
  };

  const handleAvatarClick = () => {
    play?.("tap");
    fileInputRef.current?.click();
  };

  const handleAvatarFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;
    setAvatarErr("");
    setSaveErr("");
    try {
      const result = await uploadAvatar(file, {
        displayName,
        username,
        bio,
        socialLinks,
      });
      if (!result.ok) {
        throw result.error || new Error(result.message || "Avatar sync failed.");
      }

      const nextAvatarUrl =
        result.avatarUrl || result.profile?.avatar_url || profileView.avatarUrl || "";

      setAvatarPreview(nextAvatarUrl);
      onProfileChange?.({
        name: result.profile?.full_name || displayName.trim() || user?.name || "",
        username:
          result.profile?.username || username.trim().replace(/^@+/, ""),
        avatarUrl: nextAvatarUrl,
      });
      setSaveMsg(result.partial ? "Photo saved, but account sync needs a refresh." : "Photo updated.");
    } catch (err) {
      console.error("Avatar upload failed", err);
      setAvatarErr(err?.message || "Upload failed. Try again.");
      setAvatarPreview(profileView.avatarUrl || user?.avatarUrl || "");
    } finally {
      e.target.value = "";
    }
  };

  const handleSave = async () => {
    setSaveErr("");
    setSaveMsg("");
    try {
      const result = await saveProfile({
        displayName,
        username,
        bio,
        socialLinks,
        avatarUrl: avatarPreview || profileView.avatarUrl || user?.avatarUrl || "",
      });
      if (!result.ok) {
        throw result.error || new Error(result.message || "Profile sync failed.");
      }

      const nextProfile = result.profile || {};
      onProfileChange?.({
        name: nextProfile.full_name || displayName.trim() || user?.name || "",
        username:
          nextProfile.username || username.trim().replace(/^@+/, ""),
        avatarUrl:
          nextProfile.avatar_url || avatarPreview || user?.avatarUrl || "",
      });
      setSaveMsg(result.partial ? "Profile saved, but account sync needs a refresh." : "Profile updated.");
    } catch (err) {
      console.error("Profile update failed", err);
      setSaveErr(err?.message || "Could not save profile changes.");
    }
  };

  const rows = [
    { label: "Display Name", value: displayName || "Not set" },
    { label: "Email", value: user?.email || "Not set" },
    { label: "Member Since", value: profileView.memberSince },
  ];

  return (
    <div
      data-page-tag="#account_customize"
      style={{
        padding: "24px 18px 36px",
        maxWidth: 480,
        margin: "0 auto",
        boxSizing: "border-box",
        fontFamily: "Georgia,serif",
      }}
    >
      <button
        onClick={() => { play("back"); setPage("profile"); }}
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
          padding: 0,
          WebkitTapHighlightColor: "transparent",
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back to Profile
      </button>

      <h2 style={{ fontSize: 24, fontWeight: 800, color: t.ink, margin: "0 0 20px", letterSpacing: -0.3 }}>
        Account
      </h2>

      <div style={{ background: t.white, border: `1px solid ${t.border}`, borderRadius: 18, padding: "20px 18px", marginBottom: 12, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
        <p style={{ margin: "0 0 14px", fontSize: 10, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: t.muted }}>
          Profile Picture
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button
            type="button"
            onClick={handleAvatarClick}
            aria-label="Change profile picture"
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: avatarPreview ? "transparent" : `linear-gradient(135deg, ${t.green}, ${t.greenAlt})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              boxShadow: `0 0 0 3px ${t.white}, 0 0 0 5px ${t.green}30`,
              border: "none",
              cursor: "pointer",
              padding: 0,
              overflow: "hidden",
              WebkitTapHighlightColor: "transparent",
              opacity: avatarUploading ? 0.65 : 1,
            }}
          >
            {avatarPreview ? (
              <img src={avatarPreview} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
            ) : (
              <span style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>{initials}</span>
            )}
          </button>
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleAvatarFile} style={{ display: "none" }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: "0 0 6px", fontSize: 14, fontWeight: 700, color: t.ink }}>
              {displayName || user?.name || "User"}
            </p>
            <p style={{ margin: 0, fontSize: 12, color: t.muted, lineHeight: 1.5 }}>
              Tap your avatar to upload a custom profile photo.
            </p>
            {avatarErr && <p style={{ margin: "6px 0 0", fontSize: 11, color: t.red, fontWeight: 600 }}>{avatarErr}</p>}
          </div>
        </div>
      </div>

      <div style={{ background: t.white, border: `1px solid ${t.border}`, borderRadius: 18, overflow: "hidden", marginBottom: 12, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
        <p style={{ margin: 0, padding: "14px 18px 10px", fontSize: 10, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: t.muted, borderBottom: `1px solid ${t.border}` }}>
          Profile Information
        </p>
        {rows.map((row, i) => (
          <div key={row.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "14px 18px", borderBottom: i < rows.length - 1 ? `1px solid ${t.border}` : "none" }}>
            <span style={{ fontSize: 14, color: t.mid, flexShrink: 0 }}>{row.label}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
              <span style={{ fontSize: row.label === "Email" ? emailFontSize : 14, fontWeight: 600, color: t.ink, whiteSpace: "nowrap", textAlign: "right", lineHeight: 1.1 }}>
                {row.value}
              </span>
              {row.label === "Email" && user?.email && (
                <button onClick={handleCopyEmail} title="Copy email" style={{ background: "none", border: "none", cursor: "pointer", color: copied ? t.green : t.muted, padding: 2, display: "flex", alignItems: "center", WebkitTapHighlightColor: "transparent", transition: "color 0.2s", flexShrink: 0 }}>
                  {copied ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>
                  )}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: t.white, border: `1px solid ${t.border}`, borderRadius: 18, padding: "18px 18px", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
        <p style={{ margin: "0 0 14px", fontSize: 10, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: t.green }}>
          Edit Profile
        </p>

        <div style={{ display: "grid", gap: 12 }}>
          <div style={{ display: "grid", gap: 6 }}>
            <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: t.muted }}>Display Name</label>
            <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Display name" style={{ background: t.skin, border: `1px solid ${t.border}`, borderRadius: 12, padding: "12px 14px", fontSize: 15, color: t.ink, outline: "none", fontFamily: "Georgia,serif", boxSizing: "border-box", width: "100%" }} />
          </div>

          <div style={{ display: "grid", gap: 6 }}>
            <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: t.muted }}>Username / Handle</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="username" style={{ background: t.skin, border: `1px solid ${t.border}`, borderRadius: 12, padding: "12px 14px", fontSize: 15, color: t.ink, outline: "none", fontFamily: "Georgia,serif", boxSizing: "border-box", width: "100%" }} />
          </div>

          <div style={{ display: "grid", gap: 6 }}>
            <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: t.muted }}>Bio</label>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Write a short bio" rows={4} style={{ background: t.skin, border: `1px solid ${t.border}`, borderRadius: 12, padding: "12px 14px", fontSize: 15, color: t.ink, outline: "none", fontFamily: "Georgia,serif", boxSizing: "border-box", width: "100%", resize: "vertical" }} />
          </div>

          <div style={{ display: "grid", gap: 6 }}>
            <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: t.muted }}>Social Links</label>
            <textarea value={socialLinks} onChange={(e) => setSocialLinks(e.target.value)} placeholder="Add links separated by commas" rows={3} style={{ background: t.skin, border: `1px solid ${t.border}`, borderRadius: 12, padding: "12px 14px", fontSize: 15, color: t.ink, outline: "none", fontFamily: "Georgia,serif", boxSizing: "border-box", width: "100%", resize: "vertical" }} />
          </div>
        </div>

        {(saveMsg || saveErr || loading) && <p style={{ margin: "12px 0 0", fontSize: 12, color: saveErr ? t.red : t.green, lineHeight: 1.5 }}>{loading ? "Loading profile…" : saveErr || saveMsg}</p>}

        <button type="button" onClick={handleSave} disabled={saving} style={{ width: "100%", marginTop: 14, background: t.green, border: "none", borderRadius: 12, padding: "14px 16px", color: "#fff", fontSize: 15, fontWeight: 700, cursor: saving ? "default" : "pointer", fontFamily: "Georgia,serif", opacity: saving ? 0.7 : 1 }}>
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

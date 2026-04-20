import { useEffect, useMemo, useRef, useState } from "react";
import { supabase, isSupabaseConfigured } from "../supabaseClient";

const AVATAR_BUCKET = "profile-avatars";

async function uploadAvatar(userId, file) {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${userId}/avatar.${ext}`;
  const { error: upErr } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(path, file, { upsert: true, cacheControl: "3600" });
  if (upErr) throw upErr;
  const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export function AccountCustomizePage({ t, user, play, setPage, initials }) {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [saveErr, setSaveErr] = useState("");
  const [memberSince, setMemberSince] = useState("2026");
  const [displayName, setDisplayName] = useState(user?.name || "");
  const [username, setUsername] = useState(user?.username || "");
  const [bio, setBio] = useState("");
  const [socialLinks, setSocialLinks] = useState("");
  const [avatarPreview, setAvatarPreview] = useState(user?.avatarUrl || "");
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarErr, setAvatarErr] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!isSupabaseConfigured) return;
      setLoading(true);
      try {
        const { data } = await supabase.auth.getUser();
        const authUser = data?.user;
        if (!authUser || !active) return;
        const meta = authUser.user_metadata || {};
        setDisplayName(meta.full_name || meta.name || user?.name || "");
        setUsername(meta.username || meta.user_name || user?.username || "");
        setBio(meta.bio || "");
        setSocialLinks(Array.isArray(meta.social_links) ? meta.social_links.join(", ") : meta.social_links || "");
        setAvatarPreview(meta.avatar_url || user?.avatarUrl || "");
        if (authUser.created_at) setMemberSince(String(new Date(authUser.created_at).getFullYear()));
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [user?.avatarUrl, user?.name, user?.username]);

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
    if (!file || !user?.id || !isSupabaseConfigured) return;
    const maxBytes = 5 * 1024 * 1024;
    if (file.size > maxBytes) {
      setAvatarErr("Image must be under 5 MB.");
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setAvatarErr("JPG, PNG, or WEBP only.");
      return;
    }
    setAvatarErr("");
    setSaveErr("");
    setAvatarUploading(true);
    try {
      const publicUrl = await uploadAvatar(user.id, file);
      await supabase.auth.updateUser({ data: { avatar_url: publicUrl } });
      setAvatarPreview(publicUrl);
      setSaveMsg("Photo updated.");
    } catch (err) {
      console.error("Avatar upload failed", err);
      setAvatarErr("Upload failed. Try again.");
      setAvatarPreview(user?.avatarUrl || "");
    } finally {
      setAvatarUploading(false);
      e.target.value = "";
    }
  };

  const handleSave = async () => {
    if (!isSupabaseConfigured) {
      setSaveErr("Cloud profile editing is not configured.");
      return;
    }
    setSaveErr("");
    setSaveMsg("");
    setSaving(true);
    try {
      const cleanName = displayName.trim();
      const cleanUsername = username.trim().replace(/^@+/, "");
      const cleanBio = bio.trim();
      const cleanLinks = socialLinks.split(",").map((item) => item.trim()).filter(Boolean);
      await supabase.auth.updateUser({
        data: {
          name: cleanName,
          full_name: cleanName,
          username: cleanUsername,
          bio: cleanBio,
          social_links: cleanLinks,
        },
      });
      setSaveMsg("Profile updated.");
    } catch (err) {
      console.error("Profile update failed", err);
      setSaveErr("Could not save profile changes.");
    } finally {
      setSaving(false);
    }
  };

  const rows = [
    { label: "Display Name", value: displayName || "Not set" },
    { label: "Email", value: user?.email || "Not set" },
    { label: "Member Since", value: memberSince },
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

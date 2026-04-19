import { useMemo, useRef, useState } from "react";
import { LS } from "../systems/storage";
import { getReadingStreak } from "../systems/readingStreak";
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

export default function ProfilePage({
  t,
  user,
  play,
  setPage,
  initials,
  doSignOut,
  readKeys = [],
  bookmarks = [],
  totalTopics = 0,
  onAvatarChange,
}) {
  const fileInputRef = useRef(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatarUrl || "");
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState("");

  const handleAvatarClick = () => {
    play?.("tap");
    fileInputRef.current?.click();
  };

  const handleAvatarFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id || !isSupabaseConfigured) return;
    const maxBytes = 5 * 1024 * 1024;
    if (file.size > maxBytes) { setAvatarError("Image must be under 5 MB."); return; }
    if (!["image/jpeg","image/png","image/webp"].includes(file.type)) {
      setAvatarError("JPG, PNG, or WEBP only."); return;
    }
    setAvatarError("");
    setAvatarPreview(URL.createObjectURL(file));
    setAvatarUploading(true);
    try {
      const publicUrl = await uploadAvatar(user.id, file);
      await supabase.auth.updateUser({ data: { avatar_url: publicUrl } });
      onAvatarChange?.(publicUrl);
    } catch (err) {
      console.error("Avatar upload failed", err);
      setAvatarError("Upload failed. Try again.");
      setAvatarPreview(user?.avatarUrl || "");
    } finally {
      setAvatarUploading(false);
      e.target.value = "";
    }
  };

  const goals = useMemo(() => LS.get("life_personal_goals", []), []);
  const completedGoals = goals.filter((g) => g.done).length;
  const streak = getReadingStreak();
  const progressPercent =
    totalTopics > 0 ? Math.round((readKeys.length / totalTopics) * 100) : 0;

  const stats = [
    {
      label: "Topics Read",
      value: readKeys.length,
      suffix: `/${totalTopics}`,
      icon: "📖",
      accent: t.green,
    },
    {
      label: "Day Streak",
      value: streak.count || 0,
      suffix: "",
      icon: "🔥",
      accent: "#e67e22",
    },
    {
      label: "Saved",
      value: bookmarks.length,
      suffix: "",
      icon: "🔖",
      accent: "#8e44ad",
    },
    {
      label: "Goals Done",
      value: completedGoals,
      suffix: goals.length > 0 ? `/${goals.length}` : "",
      icon: "🎯",
      accent: "#2980b9",
    },
  ];

  const quickLinks = [
    {
      key: "progress_dashboard",
      label: "Progress",
      sub: `${progressPercent}% complete`,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={t.green} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      ),
    },
    {
      key: "goal_setting",
      label: "Goals",
      sub: goals.length > 0 ? `${completedGoals}/${goals.length} complete` : "No goals yet",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={t.green} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
        </svg>
      ),
    },
    {
      key: "account_customize",
      label: "Account",
      sub: user?.email ? user.email.split("@")[0] : "Edit profile",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={t.green} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
    {
      key: "setting_preferences",
      label: "Settings",
      sub: "Theme, sound & more",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={t.green} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
        </svg>
      ),
    },
  ];

  return (
    <div
      className="life-profile-page"
      data-page-tag="#profile"
      style={{
        padding: "24px 18px 36px",
        maxWidth: 480,
        margin: "0 auto",
        boxSizing: "border-box",
      }}
    >
      {/* Avatar + name card */}
      <div
        style={{
          background: t.white,
          border: `1px solid ${t.border}`,
          borderRadius: 20,
          padding: "24px 20px 20px",
          marginBottom: 14,
          boxShadow: "0 2px 16px rgba(0,0,0,0.04)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
          {/* Tappable avatar — shows photo if uploaded, otherwise initials */}
          <button
            type="button"
            onClick={handleAvatarClick}
            aria-label="Change profile picture"
            title="Tap to change photo"
            style={{
              position: "relative",
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: avatarPreview
                ? "transparent"
                : `linear-gradient(135deg, ${t.green}, ${t.greenAlt})`,
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
              opacity: avatarUploading ? 0.6 : 1,
              transition: "opacity 0.2s ease",
            }}
          >
            {avatarPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarPreview}
                alt="Profile"
                style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }}
              />
            ) : (
              <span style={{ fontSize: 26, fontWeight: 800, color: "#fff", letterSpacing: -0.5, lineHeight: 1 }}>
                {initials}
              </span>
            )}
            {/* Camera overlay hint */}
            <span
              aria-hidden
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: "38%",
                background: "rgba(0,0,0,0.45)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "0 0 36px 36px",
              }}
            >
              {avatarUploading ? (
                <span style={{ fontSize: 9, color: "#fff", fontWeight: 700 }}>…</span>
              ) : (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
              )}
            </span>
          </button>
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleAvatarFile}
            style={{ display: "none" }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ margin: "0 0 3px", fontSize: 20, fontWeight: 800, color: t.ink, wordBreak: "break-word", lineHeight: 1.2 }}>
              {user?.name || "User"}
            </h2>
            <p style={{ margin: 0, fontSize: 13, color: t.muted, fontStyle: "italic", wordBreak: "break-word" }}>
              {user?.email}
            </p>
            {avatarError && (
              <p style={{ margin: "6px 0 0", fontSize: 11, color: t.red, fontWeight: 600 }}>
                {avatarError}
              </p>
            )}
          </div>
        </div>
        {/* Stats grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
          {stats.map((s) => (
            <div
              key={s.label}
              style={{
                background: t.skin,
                borderRadius: 12,
                padding: "10px 6px",
                textAlign: "center",
                border: `1px solid ${t.border}`,
              }}
            >
              <div style={{ fontSize: 18, lineHeight: 1, marginBottom: 4 }}>{s.icon}</div>
              <div style={{
                fontSize: 16, fontWeight: 800, color: s.accent,
                fontVariantNumeric: "tabular-nums", lineHeight: 1,
              }}>
                {s.value}
                {s.suffix && (
                  <span style={{ fontSize: 10, color: t.muted, fontWeight: 600 }}>{s.suffix}</span>
                )}
              </div>
              <div style={{
                fontSize: 9, fontWeight: 700, letterSpacing: 0.5,
                textTransform: "uppercase", color: t.muted, marginTop: 3, lineHeight: 1.2,
              }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick links */}
      <div
        style={{
          background: t.white,
          border: `1px solid ${t.border}`,
          borderRadius: 20,
          overflow: "hidden",
          marginBottom: 14,
          boxShadow: "0 2px 16px rgba(0,0,0,0.04)",
        }}
      >
        {quickLinks.map((link, i) => (
          <button
            key={link.key}
            type="button"
            onClick={() => { play("tap"); setPage(link.key); }}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "14px 18px",
              background: "transparent",
              border: "none",
              borderBottom: i < quickLinks.length - 1 ? `1px solid ${t.border}` : "none",
              cursor: "pointer",
              textAlign: "left",
              fontFamily: "Georgia,serif",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            <span style={{
              width: 36, height: 36, borderRadius: 10,
              background: `${t.green}14`,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              {link.icon}
            </span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: "block", fontSize: 14, fontWeight: 700, color: t.ink, lineHeight: 1.2 }}>
                {link.label}
              </span>
              <span style={{ display: "block", fontSize: 12, color: t.muted, marginTop: 1 }}>
                {link.sub}
              </span>
            </span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={t.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        ))}
      </div>

      {/* Sign out */}
      <button
        type="button"
        onClick={doSignOut}
        style={{
          width: "100%",
          background: "transparent",
          border: `1.5px solid ${t.red}`,
          borderRadius: 14,
          padding: "14px 16px",
          color: t.red,
          fontSize: 15,
          fontWeight: 700,
          cursor: "pointer",
          fontFamily: "Georgia,serif",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          transition: "background 0.18s ease, color 0.18s ease",
          WebkitTapHighlightColor: "transparent",
        }}
        onTouchStart={(e) => { e.currentTarget.style.background = t.red; e.currentTarget.style.color = "#fff"; }}
        onTouchEnd={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = t.red; }}
        onMouseEnter={(e) => { e.currentTarget.style.background = t.red; e.currentTarget.style.color = "#fff"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = t.red; }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        Sign Out
      </button>
    </div>
  );
}

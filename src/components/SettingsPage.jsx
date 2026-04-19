import { useState } from "react";
import { Ic } from "../icons/Ic";
import { THEME_MODES } from "../systems/theme";

const PREF_DEFAULTS = {
  soundEnabled: true,
  soundVolume: 58,
  soundMode: "focused",
  soundScope: "balanced",
  textScale: 100,
  readingDensity: "comfortable",
  highContrast: false,
  dataSaver: false,
  reduceMotion: false,
  pressIntensity: 58,
  instantButtons: true,
  sidebarSpeed: 62,
};

export { PREF_DEFAULTS };

export default function SettingsPage({
  t,
  play,
  setPage,
  user,
  uiPrefs,
  updateUiPrefs,
  themeMode,
  setThemeMode,
  systemDark,
  setReadKeys,
  setProfile,
  uid,
  LS,
  trackMomentumEvent,
  onDeleteAccount,
}) {
  const [openSections, setOpenSections] = useState({});
  const [openAccountGroups, setOpenAccountGroups] = useState({
    "Profile & Access": true,
  });
  const toggleSection = (title) =>
    setOpenSections((s) => ({ ...s, [title]: !s[title] }));
  const toggleAccountGroup = (title) =>
    setOpenAccountGroups((s) => ({ ...s, [title]: !s[title] }));

  return (
    <div
      className="life-settings-page"
      data-page-tag="#setting_preferences"
      style={{
        padding: "28px 16px 36px",
        maxWidth: 520,
        margin: "0 auto",
        boxSizing: "border-box",
        width: "100%",
        overflowX: "hidden",
      }}
    >
      <button
        onClick={() => {
          play("back");
          setPage("profile");
        }}
        style={{
          background: "none",
          border: "none",
          color: t.muted,
          fontSize: 13,
          cursor: "pointer",
          fontFamily: "Georgia,serif",
          marginBottom: 16,
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: 0,
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
        </svg>{" "}
        Back to Profile
      </button>
      <h2
        style={{
          fontSize: 22,
          fontWeight: 700,
          color: t.ink,
          margin: "0 0 20px",
        }}
      >
        Settings
      </h2>
      {[
        {
          tag: "#setting_appearance",
          title: "Appearance",
          icon: "moon",
          items: [
            {
              type: "choice",
              label: "Theme",
              desc: themeMode === THEME_MODES.system
                ? `Following device (${systemDark ? "dark" : "light"})`
                : null,
              value: themeMode,
              options: [
                { label: "System", value: THEME_MODES.system },
                { label: "Light", value: THEME_MODES.light },
                { label: "Dark", value: THEME_MODES.dark },
              ],
              onChange: setThemeMode,
            },
            {
              label: "High Contrast",
              desc: "Sharper text & separation",
              value: uiPrefs.highContrast,
              onChange: (v) => updateUiPrefs({ highContrast: v }),
            },
          ],
        },
        {
          tag: "#setting_motion",
          title: "Motion & Performance",
          icon: "bolt",
          items: [
            {
              label: "Reduce Motion",
              desc: "Calmer animations",
              value: uiPrefs.reduceMotion,
              onChange: (v) => updateUiPrefs({ reduceMotion: v }),
            },
            {
              label: "Data Saver",
              desc: "Lower visual cost",
              value: uiPrefs.dataSaver,
              onChange: (v) => updateUiPrefs({ dataSaver: v }),
            },
            {
              label: "Instant Buttons",
              desc: "Reduce tap delay",
              value: uiPrefs.instantButtons,
              onChange: (v) => updateUiPrefs({ instantButtons: v }),
            },
          ],
        },
        {
          tag: "#setting_sound",
          title: "Sound",
          icon: "chat",
          items: [
            {
              label: "Sound Effects",
              desc: "Toggle all feedback sounds",
              value: uiPrefs.soundEnabled,
              onChange: (v) => updateUiPrefs({ soundEnabled: v }),
            },
          ],
        },
        {
          tag: "#setting_account",
          title: "Account & Data",
          icon: "shield",
          items: [],
          accountGroups: [
            {
              title: "Profile & Access",
              actions: [
                {
                  label: user?.name || "Display name not set",
                  desc: "Current display name",
                  disabled: true,
                },
                {
                  label: user?.email || "Email not set",
                  desc: "Current account email",
                  disabled: true,
                },
                {
                  label: "Open Account Page",
                  desc: "Review your profile details and account surface",
                  onClick: () => {
                    play("tap");
                    setPage("account_customize");
                  },
                },
              ],
            },
            {
              title: "Privacy & Legal",
              actions: [
                {
                  label: "Privacy Policy",
                  desc: "Read how your data and app usage are handled",
                  onClick: () => {
                    play("tap");
                    setPage("privacy_policy");
                  },
                },
                {
                  label: "Terms & Conditions",
                  desc: "Review the current platform terms",
                  onClick: () => {
                    play("tap");
                    setPage("terms_conditions");
                  },
                },
              ],
            },
            {
              title: "Progress & Reset",
              actions: [
                {
                  label: "Restore Defaults",
                  desc: "Reset app preferences back to the default settings",
                  onClick: () => {
                    updateUiPrefs(PREF_DEFAULTS);
                    play("ok");
                  },
                },
                {
                  label: "Reset Progress",
                  desc: "Clear reading progress and start your tracking from zero",
                  onClick: () => {
                    setReadKeys([]);
                    play("ok");
                  },
                },
                {
                  label: "Reset Tailoring",
                  desc: "Clear your tailoring profile and rebuild your recommendations",
                  onClick: () => {
                    setProfile(null);
                    if (uid) LS.del(`tsd_${uid}`);
                    trackMomentumEvent("profile", {
                      source: "settings",
                      points: 2,
                      meta: { action: "tailor_reset" },
                    });
                    play("ok");
                  },
                },
                onDeleteAccount && {
                  label: "Delete Account",
                  desc: "Remove your account and associated data",
                  danger: true,
                  onClick: () => onDeleteAccount(),
                },
              ],
            },
          ],
        },
      ].map((section) => {
        const isOpen = !!openSections[section.title];
        const SectionIcon =
          section.icon && typeof Ic[section.icon] === "function"
            ? Ic[section.icon]
            : null;

        return (
          <div
          className="life-settings-card"
          key={section.title}
          data-page-tag={section.tag}
          style={{
            background: t.white,
            border: `1px solid ${t.border}`,
            borderRadius: 14,
            padding: "16px 18px",
            marginBottom: 12,
            boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
          }}
        >
          <button
            type="button"
            onClick={() => toggleSection(section.title)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              width: "100%",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              margin: 0,
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 12,
                minWidth: 0,
              }}
            >
              <span
                aria-hidden
                style={{
                  width: 32,
                  height: 32,
                  minWidth: 32,
                  minHeight: 32,
                  borderRadius: "50%",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: t.light,
                  border: `1px solid ${t.border}`,
                  flexShrink: 0,
                }}
              >
                {SectionIcon ? SectionIcon("none", t.mid, 16) : null}
              </span>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: 2.5,
                  textTransform: "uppercase",
                  color: t.muted,
                  textAlign: "left",
                }}
              >
                {section.title}
              </span>
            </span>
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              style={{
                transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
                transition: "transform 0.2s ease",
                flexShrink: 0,
              }}
            >
              <polyline
                points="4,2 8,6 4,10"
                fill="none"
                stroke={t.muted}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <div
            style={{
              maxHeight: isOpen ? 1000 : 0,
              opacity: isOpen ? 1 : 0,
              overflow: "hidden",
              transition: "max-height 0.3s ease, opacity 0.2s ease",
              paddingTop: isOpen ? 12 : 0,
            }}
          >
          {section.items.filter(Boolean).map((item) => (
            <div
              className="life-settings-row"
              key={item.label}
              style={{
                display: "flex",
                alignItems: item.type === "choice" ? "stretch" : "center",
                flexDirection: item.type === "choice" ? "column" : "row",
                justifyContent: "space-between",
                gap: 8,
                padding: "8px 0",
                borderBottom: `1px solid ${t.light}`,
              }}
            >
              <div style={{ flex: 1 }}>
                <p
                  style={{
                    margin: 0,
                    fontSize: 14,
                    fontWeight: 700,
                    color: t.ink,
                  }}
                >
                  {item.label}
                </p>
                {item.desc && (
                  <p
                    style={{
                      margin: "2px 0 0",
                      fontSize: 11,
                      color: t.muted,
                    }}
                  >
                    {item.desc}
                  </p>
                )}
              </div>
              {item.type === "choice" ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    padding: 3,
                    borderRadius: 999,
                    background: t.light,
                    border: `1px solid ${t.border}`,
                    marginTop: 6,
                    width: "100%",
                  }}
                >
                  {item.options.map((option) => {
                    const selected = item.value === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => item.onChange(option.value)}
                        style={{
                          flex: 1,
                          border: "none",
                          borderRadius: 999,
                          padding: "7px 12px",
                          background: selected ? t.green : "transparent",
                          color: selected ? "#fff" : t.ink,
                          fontSize: 12,
                          fontWeight: 700,
                          fontFamily: "Georgia,serif",
                          cursor: "pointer",
                          textAlign: "center",
                          transition: "all 0.2s ease",
                        }}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <input
                  type="checkbox"
                  checked={!!item.value}
                  onChange={(e) => item.onChange(e.target.checked)}
                  style={{
                    width: 20,
                    height: 20,
                    accentColor: t.green,
                    flexShrink: 0,
                  }}
                />
              )}
            </div>
          ))}
          {section.accountGroups && (
            <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
              {section.accountGroups.filter(Boolean).map((group) => {
                const isGroupOpen = !!openAccountGroups[group.title];
                return (
                  <div
                    key={group.title}
                    style={{
                      background: t.light,
                      border: `1px solid ${t.border}`,
                      borderRadius: 12,
                      padding: "12px 12px",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => toggleAccountGroup(group.title)}
                      style={{
                        width: "100%",
                        background: "none",
                        border: "none",
                        padding: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 10,
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: t.ink,
                          fontFamily: "Georgia,serif",
                        }}
                      >
                        {group.title}
                      </span>
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        style={{
                          transform: isGroupOpen ? "rotate(90deg)" : "rotate(0deg)",
                          transition: "transform 0.2s ease",
                          flexShrink: 0,
                        }}
                      >
                        <polyline
                          points="4,2 8,6 4,10"
                          fill="none"
                          stroke={t.muted}
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                    <div
                      style={{
                        maxHeight: isGroupOpen ? 1000 : 0,
                        opacity: isGroupOpen ? 1 : 0,
                        overflow: "hidden",
                        transition: "max-height 0.28s ease, opacity 0.2s ease",
                        paddingTop: isGroupOpen ? 10 : 0,
                      }}
                    >
                      <div style={{ display: "grid", gap: 8 }}>
                        {group.actions.filter(Boolean).map((action) => {
                          const isDisabled = !!action.disabled;
                          return (
                            <button
                              key={action.label}
                              type="button"
                              onClick={action.onClick}
                              disabled={isDisabled}
                              style={{
                                width: "100%",
                                background: action.danger
                                  ? "rgba(192,57,43,0.08)"
                                  : t.white,
                                border: `1px solid ${
                                  action.danger
                                    ? "rgba(192,57,43,0.25)"
                                    : t.border
                                }`,
                                borderRadius: 10,
                                padding: "12px 12px",
                                color: action.danger ? t.red : t.ink,
                                fontSize: 12,
                                fontWeight: 700,
                                cursor: isDisabled ? "default" : "pointer",
                                fontFamily: "Georgia,serif",
                                textAlign: "left",
                                opacity: isDisabled ? 0.82 : 1,
                              }}
                            >
                              <span style={{ display: "block", marginBottom: action.desc ? 3 : 0 }}>
                                {action.label}
                              </span>
                              {action.desc && (
                                <span
                                  style={{
                                    display: "block",
                                    fontSize: 11,
                                    fontWeight: 400,
                                    lineHeight: 1.6,
                                    color: action.danger ? t.red : t.muted,
                                  }}
                                >
                                  {action.desc}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          </div>
        </div>
      );
      })}
    </div>
  );
}

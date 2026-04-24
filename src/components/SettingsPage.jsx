import { useState } from "react";
import { Ic } from "../icons/Ic";
import { THEME_MODES } from "../systems/theme";

const PREF_DEFAULTS = {
  soundEnabled: true,
  soundVolume: 50,
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

// iOS "system" palette used throughout this screen so the UX matches the
// stock Settings app. Kept local to this file; not a cross-app token.
const IOS_BLUE = "#0A84FF";
const IOS_GREEN = "#34C759";
const IOS_RED = "#FF453A";

/**
 * iOS-style toggle switch. Visually matches the native UISwitch:
 * pill track, circular thumb with subtle shadow, green track when on.
 * Uses a <button role="switch"> for accessibility.
 */
function IOSSwitch({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={!!checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      style={{
        appearance: "none",
        border: "none",
        padding: 0,
        margin: 0,
        width: 51,
        height: 31,
        borderRadius: 999,
        background: checked ? IOS_GREEN : "rgba(120,120,128,0.32)",
        position: "relative",
        cursor: "pointer",
        transition: "background-color 0.2s ease",
        flexShrink: 0,
        WebkitTapHighlightColor: "transparent",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 2,
          left: checked ? 22 : 2,
          width: 27,
          height: 27,
          borderRadius: "50%",
          background: "#ffffff",
          boxShadow: "0 3px 8px rgba(0,0,0,0.15), 0 1px 1px rgba(0,0,0,0.06)",
          transition: "left 0.2s cubic-bezier(0.4,0,0.2,1)",
        }}
      />
    </button>
  );
}

const IOS_FONT =
  "-apple-system,'SF Pro Display','SF Pro Text','Helvetica Neue',Arial,sans-serif";

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
        padding: "20px 16px 36px",
        maxWidth: 520,
        margin: "0 auto",
        boxSizing: "border-box",
        width: "100%",
        overflowX: "hidden",
        fontFamily: IOS_FONT,
      }}
    >
      {/* Back row — iOS convention: SF Blue chevron + previous screen name */}
      <button
        onClick={() => {
          play("sheet_close");
          setPage("profile");
        }}
        style={{
          background: "none",
          border: "none",
          color: IOS_BLUE,
          fontSize: 17,
          cursor: "pointer",
          fontFamily: IOS_FONT,
          marginBottom: 10,
          display: "flex",
          alignItems: "center",
          gap: 2,
          padding: "6px 0",
          WebkitTapHighlightColor: "transparent",
        }}
      >
        <svg
          width="12"
          height="20"
          viewBox="0 0 12 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="10 2 2 10 10 18" />
        </svg>
        <span style={{ marginLeft: 4 }}>Profile</span>
      </button>

      {/* iOS "Large Title" */}
      <h2
        style={{
          fontSize: 34,
          fontWeight: 700,
          color: t.ink,
          margin: "4px 0 22px",
          letterSpacing: "-0.02em",
          fontFamily: IOS_FONT,
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
                    play("sheet_open");
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
                    play("sheet_open");
                    setPage("privacy_policy");
                  },
                },
                {
                  label: "Terms & Conditions",
                  desc: "Review the current platform terms",
                  onClick: () => {
                    play("sheet_open");
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
                    play("success");
                  },
                },
                {
                  label: "Reset Progress",
                  desc: "Clear reading progress and start your tracking from zero",
                  onClick: () => {
                    setReadKeys([]);
                    play("success");
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
                    play("success");
                  },
                },
                onDeleteAccount && {
                  label: "Delete Account",
                  desc: "Remove your account and associated data",
                  danger: true,
                  onClick: () => onDeleteAccount(),
                  sound: "destructive",
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
        const visibleItems = section.items.filter(Boolean);
        const lastItemIdx = visibleItems.length - 1;

        return (
          <div
            className="life-settings-card"
            key={section.title}
            data-page-tag={section.tag}
            style={{
              background: t.white,
              border: `1px solid ${t.border}`,
              borderRadius: 18,
              padding: "6px 18px",
              marginBottom: 22,
              boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
            }}
          >
            {/* Section header row (always visible) — styled like an iOS
                inset-grouped list caption, clickable to expand content. */}
            <button
              type="button"
              onClick={() => toggleSection(section.title)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                width: "100%",
                minHeight: 44,
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "8px 0",
                margin: 0,
                fontFamily: IOS_FONT,
                WebkitTapHighlightColor: "transparent",
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
                    borderRadius: 10,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: t.light,
                    flexShrink: 0,
                  }}
                >
                  {SectionIcon ? SectionIcon("none", t.mid, 16) : null}
                </span>
                <span
                  style={{
                    fontSize: 17,
                    fontWeight: 600,
                    color: t.ink,
                    textAlign: "left",
                    fontFamily: IOS_FONT,
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
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <div
              style={{
                maxHeight: isOpen ? 2000 : 0,
                opacity: isOpen ? 1 : 0,
                overflow: "hidden",
                transition: "max-height 0.3s ease, opacity 0.2s ease",
                paddingTop: isOpen ? 4 : 0,
              }}
            >
              {visibleItems.map((item, i) => (
                <div
                  className="life-settings-row"
                  key={item.label}
                  style={{
                    display: "flex",
                    alignItems:
                      item.type === "choice" ? "stretch" : "center",
                    flexDirection: item.type === "choice" ? "column" : "row",
                    justifyContent: "space-between",
                    gap: 10,
                    minHeight: 44,
                    padding: "10px 0",
                    // iOS list hairlines: only between rows, not after the last.
                    borderBottom:
                      i < lastItemIdx
                        ? `1px solid ${t.light}`
                        : "1px solid transparent",
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 17,
                        fontWeight: 400,
                        color: t.ink,
                        fontFamily: IOS_FONT,
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {item.label}
                    </p>
                    {item.desc && (
                      <p
                        style={{
                          margin: "2px 0 0",
                          fontSize: 13,
                          color: t.muted,
                          fontFamily: IOS_FONT,
                          lineHeight: 1.35,
                        }}
                      >
                        {item.desc}
                      </p>
                    )}
                  </div>
                  {item.type === "choice" ? (
                    <div
                      // iOS segmented control
                      role="tablist"
                      aria-label={item.label}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        padding: 2,
                        borderRadius: 9,
                        background: "rgba(120,120,128,0.12)",
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
                            role="tab"
                            aria-selected={selected}
                            onClick={() => item.onChange(option.value)}
                            style={{
                              flex: 1,
                              border: "none",
                              borderRadius: 7,
                              padding: "6px 12px",
                              background: selected ? t.white : "transparent",
                              color: t.ink,
                              fontSize: 13,
                              fontWeight: selected ? 600 : 500,
                              fontFamily: IOS_FONT,
                              cursor: "pointer",
                              textAlign: "center",
                              boxShadow: selected
                                ? "0 3px 8px rgba(0,0,0,0.12), 0 1px 1px rgba(0,0,0,0.04)"
                                : "none",
                              transition:
                                "background-color 0.2s ease, box-shadow 0.2s ease",
                              WebkitTapHighlightColor: "transparent",
                            }}
                          >
                            {option.label}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <IOSSwitch
                      checked={!!item.value}
                      onChange={(v) => item.onChange(v)}
                      label={item.label}
                    />
                  )}
                </div>
              ))}
              {section.accountGroups && (
                <div style={{ display: "grid", gap: 14, margin: "8px 0 14px" }}>
                  {section.accountGroups.filter(Boolean).map((group) => {
                    const isGroupOpen = !!openAccountGroups[group.title];
                    const actions = group.actions.filter(Boolean);
                    return (
                      <div key={group.title}>
                        {/* iOS grouped-list uppercase caption — outside the
                            card, above it */}
                        <button
                          type="button"
                          onClick={() => toggleAccountGroup(group.title)}
                          style={{
                            width: "100%",
                            background: "none",
                            border: "none",
                            padding: "0 4px 6px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 10,
                            cursor: "pointer",
                            textAlign: "left",
                            fontFamily: IOS_FONT,
                            WebkitTapHighlightColor: "transparent",
                          }}
                        >
                          <span
                            style={{
                              fontSize: 13,
                              fontWeight: 400,
                              color: t.muted,
                              letterSpacing: 0.1,
                              textTransform: "uppercase",
                              fontFamily: IOS_FONT,
                            }}
                          >
                            {group.title}
                          </span>
                          <svg
                            width="11"
                            height="11"
                            viewBox="0 0 12 12"
                            style={{
                              transform: isGroupOpen
                                ? "rotate(90deg)"
                                : "rotate(0deg)",
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
                            maxHeight: isGroupOpen ? 2000 : 0,
                            opacity: isGroupOpen ? 1 : 0,
                            overflow: "hidden",
                            transition:
                              "max-height 0.28s ease, opacity 0.2s ease",
                          }}
                        >
                          {/* iOS grouped-list card containing the rows */}
                          <div
                            style={{
                              background: t.light,
                              border: `1px solid ${t.border}`,
                              borderRadius: 10,
                              padding: "0 14px",
                            }}
                          >
                            {actions.map((action, ai) => {
                              const isDisabled = !!action.disabled;
                              const isLast = ai === actions.length - 1;
                              const labelColor = action.danger
                                ? IOS_RED
                                : isDisabled
                                  ? t.muted
                                  : t.ink;
                              const clickable = !isDisabled && action.onClick;
                              return (
                                <button
                                  key={action.label}
                                  type="button"
                                  onClick={action.onClick}
                                  disabled={isDisabled}
                                  style={{
                                    display: "flex",
                                    width: "100%",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    gap: 12,
                                    minHeight: 44,
                                    padding: "10px 0",
                                    background: "transparent",
                                    border: "none",
                                    borderBottom: isLast
                                      ? "1px solid transparent"
                                      : `1px solid ${t.border}`,
                                    cursor: clickable ? "pointer" : "default",
                                    textAlign: "left",
                                    fontFamily: IOS_FONT,
                                    WebkitTapHighlightColor: "transparent",
                                  }}
                                >
                                  <span
                                    style={{
                                      display: "flex",
                                      flexDirection: "column",
                                      alignItems: "flex-start",
                                      gap: 2,
                                      minWidth: 0,
                                      flex: 1,
                                    }}
                                  >
                                    <span
                                      style={{
                                        fontSize: 17,
                                        fontWeight: 400,
                                        color: labelColor,
                                        fontFamily: IOS_FONT,
                                        letterSpacing: "-0.01em",
                                      }}
                                    >
                                      {action.label}
                                    </span>
                                    {action.desc && (
                                      <span
                                        style={{
                                          fontSize: 13,
                                          fontWeight: 400,
                                          color: t.muted,
                                          lineHeight: 1.35,
                                          fontFamily: IOS_FONT,
                                        }}
                                      >
                                        {action.desc}
                                      </span>
                                    )}
                                  </span>
                                  {clickable && !action.danger && (
                                    <svg
                                      width="8"
                                      height="14"
                                      viewBox="0 0 8 14"
                                      style={{ flexShrink: 0 }}
                                      aria-hidden="true"
                                    >
                                      <polyline
                                        points="1,1 7,7 1,13"
                                        fill="none"
                                        stroke={t.muted}
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      />
                                    </svg>
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

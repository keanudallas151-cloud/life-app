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
  return (
    <div
      className="life-settings-page"
      data-page-tag="#setting_preferences"
      style={{
        padding: "32px 20px",
        maxWidth: 520,
        margin: "0 auto",
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
          items: [],
          actions: [
            {
              label: "Restore Defaults",
              onClick: () => { updateUiPrefs(PREF_DEFAULTS); play("ok"); },
            },
            {
              label: "Reset Progress",
              onClick: () => { setReadKeys([]); play("ok"); },
            },
            {
              label: "Reset Tailoring",
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
            {
              label: "Delete Account",
              danger: true,
              onClick: () => {
                if (onDeleteAccount) onDeleteAccount();
                else play("tap");
              },
            },
          ],
        },
      ].map((section) => (
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
          }}
        >
          <p
            style={{
              margin: "0 0 10px",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: 2.5,
              textTransform: "uppercase",
              color: t.muted,
            }}
          >
            {section.title}
          </p>
          {section.items.map((item) => (
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
          {section.actions && (
            <div className="life-settings-action-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 10 }}>
              {section.actions.map((action) => (
                <button
                  key={action.label}
                  onClick={action.onClick}
                  style={{
                    background: action.danger ? "rgba(192,57,43,0.08)" : t.light,
                    border: `1px solid ${action.danger ? "rgba(192,57,43,0.25)" : t.border}`,
                    borderRadius: 10,
                    padding: "12px 14px",
                    color: action.danger ? t.red : t.mid,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "Georgia,serif",
                    minHeight: 48,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    transition: "all 0.2s ease",
                  }}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

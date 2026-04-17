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
}) {
  return (
    <div
      className="life-settings-page"
      data-page-tag="#setting_preferences"
      style={{
        padding: "48px 28px",
        maxWidth: 720,
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
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          gap: 6,
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
          fontSize: 26,
          fontWeight: 700,
          color: t.ink,
          margin: "0 0 8px",
        }}
      >
        Settings
      </h2>
      <p
        className="life-settings-subtitle"
        style={{
          margin: "0 0 24px",
          color: t.muted,
          fontSize: 14,
          lineHeight: 1.7,
          fontStyle: "italic",
        }}
      >
        Cleanly organised controls for appearance, accessibility, motion, sound,
        privacy, and account tools.
      </p>
      {[
        {
          tag: "#setting_appearance",
          title: "Appearance",
          desc: "Theme, contrast, and reading comfort",
          items: [
            {
              type: "choice",
              label: "Theme",
              desc: "Choose how Life should look on this device",
              value: themeMode,
              helper:
                themeMode === THEME_MODES.system
                  ? `Currently following your device in ${systemDark ? "dark" : "light"} mode.`
                  : null,
              options: [
                { label: "System", value: THEME_MODES.system },
                { label: "Light", value: THEME_MODES.light },
                { label: "Dark", value: THEME_MODES.dark },
              ],
              onChange: setThemeMode,
            },
            {
              label: "High Contrast",
              desc: "Sharpen separation and text readability",
              value: uiPrefs.highContrast,
              onChange: (v) => updateUiPrefs({ highContrast: v }),
            },
          ],
        },
        {
          tag: "#setting_motion",
          title: "Motion & Performance",
          desc: "Make the app feel smoother, lighter, and easier to scan",
          items: [
            {
              label: "Reduce Motion",
              desc: "Calmer animations and less movement",
              value: uiPrefs.reduceMotion,
              onChange: (v) => updateUiPrefs({ reduceMotion: v }),
            },
            {
              label: "Data Saver",
              desc: "Lower visual effect cost and heavy rendering",
              value: uiPrefs.dataSaver,
              onChange: (v) => updateUiPrefs({ dataSaver: v }),
            },
            {
              label: "Instant Button Response",
              desc: "Reduce perceived tap delay on fast interactions",
              value: uiPrefs.instantButtons,
              onChange: (v) => updateUiPrefs({ instantButtons: v }),
            },
          ],
        },
        {
          tag: "#setting_sound",
          title: "Sound",
          desc: "Feedback sounds and listening comfort",
          items: [
            {
              label: "Sound Effects",
              desc: "Toggle all sound effects",
              value: uiPrefs.soundEnabled,
              onChange: (v) => updateUiPrefs({ soundEnabled: v }),
            },
          ],
        },
        {
          tag: "#setting_account",
          title: "Account & Progress",
          desc: "Reset tools and account actions live below",
          items: [],
        },
        {
          tag: "#setting_privacy",
          title: "Privacy & Legal",
          desc: "Policy links and export tools live below",
          items: [],
        },
      ].map((section) => (
        <div
          className="life-settings-card"
          key={section.title}
          data-page-tag={section.tag}
          style={{
            background: t.white,
            border: `1px solid ${t.border}`,
            borderRadius: 16,
            padding: 22,
            marginBottom: 16,
          }}
        >
          <p
            style={{
              margin: "0 0 14px",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: 2.5,
              textTransform: "uppercase",
              color: t.muted,
            }}
          >
            {section.title}
          </p>
          {section.desc && (
            <p
              style={{
                margin: "-6px 0 14px",
                fontSize: 13,
                color: t.muted,
                lineHeight: 1.55,
                fontStyle: "italic",
              }}
            >
              {section.desc}
            </p>
          )}
          {section.items.length === 0 && (
            <p
              style={{
                margin: 0,
                fontSize: 13,
                color: t.muted,
                fontStyle: "italic",
              }}
            >
              Organised tools for this section are available below.
            </p>
          )}
          {section.items.map((item) => (
            <div
              className="life-settings-row"
              key={item.label}
              style={{
                display: "flex",
                alignItems: item.type === "choice" ? "stretch" : "center",
                flexDirection: item.type === "choice" ? "column" : "row",
                justifyContent: "space-between",
                gap: 12,
                padding: "10px 0",
                borderBottom: `1px solid ${t.light}`,
              }}
            >
              <div>
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
                <p
                  style={{
                    margin: "2px 0 0",
                    fontSize: 12,
                    color: t.muted,
                  }}
                >
                  {item.desc}
                </p>
                {item.helper && (
                  <p
                    style={{
                      margin: "6px 0 0",
                      fontSize: 11,
                      color: t.green,
                    }}
                  >
                    {item.helper}
                  </p>
                )}
              </div>
              {item.type === "choice" ? (
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: 4,
                    borderRadius: 999,
                    background: t.light,
                    border: `1px solid ${t.border}`,
                    flexWrap: "wrap",
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
                          border: "none",
                          borderRadius: 999,
                          padding: "9px 14px",
                          background: selected ? t.green : "transparent",
                          color: selected ? "#fff" : t.ink,
                          fontSize: 12,
                          fontWeight: 700,
                          fontFamily: "Georgia,serif",
                          cursor: "pointer",
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
                  onChange={(e) =>
                    item.onChange(
                      typeof item.value === "boolean"
                        ? e.target.checked
                        : e.target.checked,
                    )
                  }
                  style={{
                    width: 20,
                    height: 20,
                    accentColor: t.green,
                  }}
                />
              )}
            </div>
          ))}
        </div>
      ))}
      <div
        className="life-settings-action-grid"
        style={{ display: "flex", flexWrap: "wrap", gap: 8 }}
      >
        <button
          onClick={() => {
            updateUiPrefs(PREF_DEFAULTS);
            play("ok");
          }}
          style={{
            background: t.light,
            border: `1px solid ${t.border}`,
            borderRadius: 10,
            padding: "10px 16px",
            color: t.mid,
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "Georgia,serif",
          }}
        >
          Restore Defaults
        </button>
        <button
          onClick={() => {
            setReadKeys([]);
            play("ok");
          }}
          style={{
            background: t.light,
            border: `1px solid ${t.border}`,
            borderRadius: 10,
            padding: "10px 16px",
            color: t.mid,
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "Georgia,serif",
          }}
        >
          Reset Progress
        </button>
        <button
          onClick={() => {
            setProfile(null);
            LS.del(`tsd_${uid}`);
            trackMomentumEvent("profile", {
              source: "settings",
              points: 2,
              meta: { action: "tailor_reset" },
            });
            play("ok");
          }}
          style={{
            background: t.light,
            border: `1px solid ${t.border}`,
            borderRadius: 10,
            padding: "10px 16px",
            color: t.mid,
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "Georgia,serif",
          }}
        >
          Reset Tailoring
        </button>
      </div>
    </div>
  );
}

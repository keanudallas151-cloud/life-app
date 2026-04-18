export default function ProfilePage({
  t,
  user,
  play,
  setPage,
  initials,
  doSignOut,
}) {
  return (
    <div
      className="life-profile-page"
      data-page-tag="#profile"
      style={{
        padding: "28px 20px 36px",
        maxWidth: 480,
        margin: "0 auto",
        boxSizing: "border-box",
        overflowX: "hidden",
      }}
    >
      <div
        style={{
          background: t.white,
          border: `1px solid ${t.border}`,
          borderRadius: 18,
          padding: "22px 18px 18px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 18,
            minWidth: 0,
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${t.green}, ${t.greenAlt})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              boxShadow: `0 0 0 3px ${t.white}, 0 0 0 5px ${t.green}22`,
            }}
          >
            <span
              style={{
                fontSize: 26,
                fontWeight: 800,
                color: "#fff",
                letterSpacing: -0.5,
                lineHeight: 1,
              }}
            >
              {initials}
            </span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2
              style={{
                margin: "0 0 4px",
                fontSize: 22,
                fontWeight: 700,
                color: t.ink,
                wordBreak: "break-word",
              }}
            >
              {user?.name}
            </h2>
            <p
              style={{
                margin: 0,
                fontSize: 14,
                color: t.muted,
                fontStyle: "italic",
                wordBreak: "break-word",
              }}
            >
              {user?.email}
            </p>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 10,
            marginBottom: 14,
          }}
        >
          {[
            {
              key: "account_customize",
              label: "Account",
              icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={t.mid} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              ),
            },
            {
              key: "setting_preferences",
              label: "Settings",
              icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={t.mid} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
                </svg>
              ),
            },
          ].map((action) => (
            <button
              key={action.key}
              type="button"
              onClick={() => {
                play("tap");
                setPage(action.key);
              }}
              aria-label={action.label}
              title={action.label}
              style={{
                width: "100%",
                minWidth: 0,
                borderRadius: 14,
                border: `1px solid ${t.border}`,
                background: t.light,
                padding: "10px 12px",
                display: "flex",
                alignItems: "center",
                gap: 10,
                cursor: "pointer",
                boxSizing: "border-box",
                overflow: "hidden",
              }}
            >
              <span
                aria-hidden
                style={{
                  width: 36,
                  height: 36,
                  minWidth: 36,
                  minHeight: 36,
                  borderRadius: "50%",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: t.white,
                  border: `1px solid ${t.border}`,
                  flexShrink: 0,
                  boxSizing: "border-box",
                }}
              >
                {action.icon}
              </span>
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: t.ink,
                  fontFamily: "Georgia,serif",
                  minWidth: 0,
                }}
              >
                {action.label}
              </span>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={doSignOut}
          style={{
            width: "100%",
            background: t.white,
            border: `1.5px solid ${t.border}`,
            borderRadius: 14,
            padding: "14px 16px",
            color: t.red,
            fontSize: 15,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "Georgia,serif",
          }}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}

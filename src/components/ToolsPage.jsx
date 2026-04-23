import { Ic } from "../icons/Ic";

export function ToolsPage({ t, play, setPage }) {
  const tools = [
    {
      id: "todo",
      title: "To-Do",
      desc: "Organize tasks, track progress, and stay on top of your goals.",
      icon: "puzzle",
      action: "tools_todo",
      eyebrow: "Capture tasks",
      meta: "Add, complete, delete",
    },
    {
      id: "lockin",
      title: "Lock-In",
      desc: "Start a focused work session with a timer to maintain deep focus.",
      icon: "candle",
      action: "tools_lockin",
      eyebrow: "Protect focus",
      meta: "Presets + custom duration",
    },
  ];

  return (
    <div
      data-page-tag="#tools_page"
      style={{
        padding: "clamp(24px, 5vw, 48px) clamp(16px, 4vw, 28px)",
        maxWidth: 620,
        margin: "0 auto",
      }}
    >
      <p
        style={{
          margin: "0 0 10px",
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: 2.5,
          textTransform: "uppercase",
          color: t.green,
        }}
      >
        Tools
      </p>
      <h2
        style={{
          margin: "0 0 14px",
          fontSize: 28,
          fontWeight: 700,
          color: t.ink,
          fontFamily: "Georgia,serif",
        }}
      >
        Tools
      </h2>
      <p
        style={{
          margin: "0 0 28px",
          color: t.mid,
          fontSize: 15,
          lineHeight: 1.85,
          fontFamily: "Georgia,serif",
        }}
      >
        Boost your productivity with focused utilities designed to help you stay organized and maintain deep focus.
      </p>

      <section
        className="life-card-hover"
        style={{
          position: "relative",
          overflow: "hidden",
          marginBottom: 18,
          padding: "18px 18px 16px",
          borderRadius: 22,
          border: `1px solid ${t.border}`,
          background: `linear-gradient(135deg, ${t.white} 0%, ${t.greenLt} 140%)`,
          boxShadow: `0 18px 40px ${t.green}12`,
        }}
      >
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: -60,
            right: -40,
            width: 180,
            height: 180,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${t.green}18 0%, transparent 72%)`,
            pointerEvents: "none",
          }}
        />
        <div style={{ position: "relative", display: "grid", gap: 14 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                minHeight: 34,
                padding: "8px 12px",
                borderRadius: 999,
                border: `1px solid ${t.border}`,
                background: `${t.white}cc`,
                color: t.ink,
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {Ic.box("none", t.green, 15)}
              Ready-to-use tools
            </span>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                minHeight: 34,
                padding: "8px 12px",
                borderRadius: 999,
                background: `${t.green}16`,
                color: t.green,
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              Local + cloud aware
            </span>
          </div>
          <div>
            <p style={{ margin: "0 0 6px", color: t.ink, fontSize: 17, fontWeight: 700 }}>
              Build momentum without leaving the app.
            </p>
            <p style={{ margin: 0, color: t.mid, fontSize: 13.5, lineHeight: 1.75 }}>
              Use quick action tools for capture and focus, then jump back into reading, goals, and momentum with less friction.
            </p>
          </div>
        </div>
      </section>

      <div style={{ display: "grid", gap: 16 }}>
        {tools.map((tool) => (
          <button
            key={tool.id}
            type="button"
            onClick={() => {
              play("tap");
              setPage(tool.action);
            }}
            className="life-card-hover"
            style={{
              width: "100%",
              background: t.white,
              border: `1px solid ${t.border}`,
              borderRadius: 18,
              padding: 20,
              cursor: "pointer",
              display: "flex",
              alignItems: "flex-start",
              gap: 16,
              textAlign: "left",
              boxShadow: `0 12px 28px ${t.green}10`,
              transition: "transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = `0 18px 36px ${t.green}18`;
              e.currentTarget.style.borderColor = `${t.green}55`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0px)";
              e.currentTarget.style.boxShadow = `0 12px 28px ${t.green}10`;
              e.currentTarget.style.borderColor = t.border;
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: t.greenLt,
                display: "grid",
                placeItems: "center",
                fontSize: 24,
                flexShrink: 0,
              }}
            >
              {Ic[tool.icon]?.("none", t.green, 24) || Ic.box("none", t.green, 24)}
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  marginBottom: 6,
                  color: t.green,
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: 1.8,
                  textTransform: "uppercase",
                }}
              >
                {tool.eyebrow}
              </div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: t.ink,
                  marginBottom: 4,
                }}
              >
                {tool.title}
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: t.mid,
                  lineHeight: 1.5,
                }}
              >
                {tool.desc}
              </div>
              <div
                style={{
                  marginTop: 10,
                  display: "inline-flex",
                  alignItems: "center",
                  minHeight: 30,
                  padding: "6px 10px",
                  borderRadius: 999,
                  background: t.greenLt,
                  color: t.green,
                  fontSize: 11.5,
                  fontWeight: 700,
                }}
              >
                {tool.meta}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

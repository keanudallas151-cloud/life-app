import { Ic } from "../../icons/Ic";
import { S } from "../../systems/theme";

const CATEGORIES = [
  {
    key: "money",
    label: "Money",
    icon: "wallet",
    desc: "Understand what money actually is and how the system works.",
  },
  {
    key: "mindset",
    label: "Mindset",
    icon: "brain",
    desc: "Your beliefs shape your financial reality. Master your mind.",
  },
  {
    key: "effort",
    label: "Effort",
    icon: "bolt",
    desc: "Nothing happens without consistent, deliberate action.",
  },
  {
    key: "result",
    label: "Result",
    icon: "trending",
    desc: "Track your progress and see the compound effect of discipline.",
  },
  {
    key: "repeat",
    label: "Repeat",
    icon: "leaf",
    desc: "Success is a cycle. Master the loop and keep building.",
  },
  {
    key: "100ways",
    label: "100 Ways to Make Money",
    icon: "lightbulb",
    desc: "Concrete strategies for generating income in 2025 and beyond.",
  },
];

export function CategoriesPage({ t, play, catStep, setCatStep, setPage, userName }) {
  return (
    <div
      data-page-tag="#categories"
      style={{ padding: "48px 28px", maxWidth: 560, margin: "0 auto" }}
    >
      {catStep < CATEGORIES.length ? (
        (() => {
          const cat = CATEGORIES[catStep];
          const displayNum = catStep < 4 ? catStep + 1 : catStep + 2;
          return (
            <div style={{ textAlign: "center" }}>
              <p
                style={{
                  margin: "0 0 12px",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: 3,
                  textTransform: "uppercase",
                  color: t.muted,
                }}
              >
                Category {displayNum} of {CATEGORIES.length + 1}
              </p>
              <div
                style={{
                  width: 70,
                  height: 70,
                  borderRadius: 20,
                  background: t.greenLt,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px",
                }}
              >
                {Ic[cat.icon]?.("none", t.green, 32)}
              </div>
              <h2
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: t.ink,
                  margin: "0 0 12px",
                }}
              >
                {cat.label}
              </h2>
              <p
                style={{
                  color: t.mid,
                  fontSize: 15,
                  lineHeight: 1.7,
                  margin: "0 0 32px",
                  maxWidth: 400,
                  marginLeft: "auto",
                  marginRight: "auto",
                }}
              >
                {cat.desc}
              </p>
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  justifyContent: "center",
                }}
              >
                {catStep > 0 && (
                  <button
                    onClick={() => {
                      play("back");
                      setCatStep(catStep - 1);
                    }}
                    data-ghost="true"
                    style={{
                      background: "none",
                      border: "none",
                      borderRadius: 0,
                      padding: 0,
                      color: t.mid,
                      fontSize: 15,
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: "-apple-system,'SF Pro Display','SF Pro Text','Helvetica Neue',Arial,sans-serif",
                      boxShadow: "none",
                      outline: "none",
                    }}
                  >
                    ← Back
                  </button>
                )}
                <button
                  onClick={() => {
                    play("ok");
                    setCatStep(catStep + 1);
                  }}
                  style={{
                    background: t.green,
                    border: "none",
                    borderRadius: 12,
                    padding: "14px 32px",
                    color: "#fff",
                    fontSize: 15,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "-apple-system,'SF Pro Display','SF Pro Text','Helvetica Neue',Arial,sans-serif",
                    boxShadow: S.glow,
                  }}
                >
                  {catStep === CATEGORIES.length - 1 ? "Complete →" : "Next →"}
                </button>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 6,
                  justifyContent: "center",
                  marginTop: 24,
                }}
                role="progressbar"
                aria-valuenow={catStep + 1}
                aria-valuemin={1}
                aria-valuemax={CATEGORIES.length}
                aria-label={`Step ${catStep + 1} of ${CATEGORIES.length}`}
              >
                {CATEGORIES.map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: i <= catStep ? t.green : t.border,
                      transition: "background 0.2s",
                    }}
                  />
                ))}
              </div>
            </div>
          );
        })()
      ) : (
        <div
          data-page-tag="#certified_page"
          style={{ textAlign: "center", padding: "40px 0" }}
        >
          <div
            style={{
              width: 90,
              height: 90,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${t.green}, ${t.greenAlt})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
              boxShadow: "0 8px 32px rgba(255,255,255,0.15)",
            }}
          >
            <span style={{ fontSize: 40 }}>🏆</span>
          </div>
          <h1
            style={{
              fontSize: 32,
              fontWeight: 800,
              color: t.ink,
              margin: "0 0 12px",
            }}
          >
            Congratulations!
          </h1>
          <p
            style={{
              color: t.green,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 3,
              textTransform: "uppercase",
              margin: "0 0 20px",
            }}
          >
            Certified Life. Graduate
          </p>
          <p
            style={{
              color: t.mid,
              fontSize: 15,
              lineHeight: 1.7,
              margin: "0 auto 32px",
              maxWidth: 400,
            }}
          >
            You&apos;ve completed all the core categories. You now have the
            foundation to build real wealth and knowledge. Keep going — the
            journey never ends.
          </p>
          <div
            style={{
              background: t.white,
              border: `2px solid ${t.green}`,
              borderRadius: 18,
              padding: "28px 24px",
              maxWidth: 380,
              margin: "0 auto 28px",
              boxShadow: S.lg,
            }}
          >
            <p
              style={{
                margin: "0 0 6px",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: 2.5,
                textTransform: "uppercase",
                color: t.green,
              }}
            >
              Certificate of Completion
            </p>
            <p
              style={{
                margin: "0 0 4px",
                fontSize: 18,
                fontWeight: 700,
                color: t.ink,
              }}
            >
              {userName || "User"}
            </p>
            <p
              style={{
                margin: 0,
                fontSize: 12,
                color: t.muted,
                fontStyle: "italic",
              }}
            >
              Has completed all Life. categories
            </p>
          </div>
          <button
            onClick={() => {
              play("ok");
              setPage("home");
            }}
            style={{
              background: t.green,
              border: "none",
              borderRadius: 12,
              padding: "14px 32px",
              color: "#fff",
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "-apple-system,'SF Pro Display','SF Pro Text','Helvetica Neue',Arial,sans-serif",
            }}
          >
            Back to Home
          </button>
        </div>
      )}
    </div>
  );
}

export { CATEGORIES };

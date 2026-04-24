import { CONTENT } from "../data/content";
import { Ic } from "../icons/Ic";

const STEPS = [
  {
    step: 1,
    label: "Start with Money",
    desc: "Understand what money actually is before anything else.",
    key: "money",
  },
  {
    step: 2,
    label: "Finance Basics for your country",
    desc: "Australia or America — learn the system you live inside.",
    key: "basics_au2",
  },
  {
    step: 3,
    label: "The Psychological Game of Money",
    desc: "Your beliefs about money matter more than your strategy.",
    key: "psych_money",
  },
  {
    step: 4,
    label: "Secrets About Money",
    desc: "The mechanisms nobody explains in school.",
    key: "secrets",
  },
  {
    step: 5,
    label: "Generating Income",
    desc: "The honest framework for building financial independence.",
    key: "gen_income",
  },
];

export function WhereToStartPage({ t, play, setPage, onSelect, onOpenQuiz }) {
  return (
    <div
      data-page-tag="#where_to_start"
      style={{ padding: "48px 28px", maxWidth: 560, margin: "0 auto" }}
    >
      <h2
        style={{
          fontSize: 26,
          fontWeight: 700,
          color: t.ink,
          margin: "0 0 10px",
          fontFamily: "-apple-system,'SF Pro Display','SF Pro Text','Helvetica Neue',Arial,sans-serif",
        }}
      >
        Where To Start?
      </h2>
      <p
        style={{
          color: t.muted,
          fontSize: 15,
          lineHeight: 1.8,
          margin: "0 0 32px",
          fontStyle: "italic",
        }}
      >
        New to Life.? This is the recommended reading order.
      </p>
      {STEPS.map((item) => (
        <button
          key={item.step}
          onClick={() => {
            const node = CONTENT[item.key];
            if (!node) return;
            onSelect(item.key, node);
          }}
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 16,
            width: "100%",
            background: t.white,
            border: `1px solid ${t.border}`,
            borderRadius: 12,
            padding: "20px",
            cursor: "pointer",
            marginBottom: 12,
            textAlign: "left",
            fontFamily: "-apple-system,'SF Pro Display','SF Pro Text','Helvetica Neue',Arial,sans-serif",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = t.light)}
          onMouseLeave={(e) => (e.currentTarget.style.background = t.white)}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: t.green,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <span style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>
              {item.step}
            </span>
          </div>
          <div>
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: t.ink,
                marginBottom: 4,
              }}
            >
              {item.label}
            </div>
            <div
              style={{ fontSize: 13, color: t.muted, fontStyle: "italic" }}
            >
              {item.desc}
            </div>
          </div>
        </button>
      ))}
      <div
        style={{
          marginTop: 28,
          padding: 22,
          background: t.greenLt,
          border: `1px solid ${t.green}`,
          borderRadius: 14,
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
          Test yourself
        </p>
        <p
          style={{
            margin: "0 0 14px",
            fontSize: 15,
            color: t.ink,
            fontFamily: "-apple-system,'SF Pro Display','SF Pro Text','Helvetica Neue',Arial,sans-serif",
          }}
        >
          Once you have read a few topics, test your knowledge with a timed
          quiz.
        </p>
        <button
          onClick={() => {
            play("open");
            if (typeof onOpenQuiz === "function") onOpenQuiz();
            else setPage("quiz");
          }}
          style={{
            background: t.green,
            border: "none",
            borderRadius: 10,
            padding: "12px 22px",
            color: "#fff",
            fontSize: 14,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "-apple-system,'SF Pro Display','SF Pro Text','Helvetica Neue',Arial,sans-serif",
          }}
        >
          <span
            style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
          >
            {Ic.brain("none", "#fff", 17)} Go to Quiz
          </span>
        </button>
      </div>
    </div>
  );
}

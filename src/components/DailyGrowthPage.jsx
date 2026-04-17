import React, { useState, useEffect } from "react";
import { Ic } from "../icons/Ic";
import { LS } from "../systems/storage";

const GROWTH_ITEMS = [
  {
    key: "reflection",
    title: "Morning Reflection",
    desc: "Spend 5 minutes journaling about your goals before the day begins.",
    icon: "star",
    tool: "journal",
    prompt:
      "What are the 3 most important things you want to accomplish today, and why do they matter?",
  },
  {
    key: "learn",
    title: "Learn One Thing",
    desc: "Read at least one topic in Life. today. Knowledge compounds.",
    icon: "lightbulb",
    tool: "redirect",
    redirect: "home",
  },
  {
    key: "network",
    title: "Network",
    desc: "Send one message to someone you admire or want to connect with.",
    icon: "users",
    tool: "journal",
    prompt:
      "Write a short, specific message (2–3 sentences) to someone you want to connect with. Be genuine.",
  },
  {
    key: "speak",
    title: "Practice Speaking",
    desc: "Record yourself for 2 minutes on any topic. No fillers.",
    icon: "brain",
    tool: "timer",
    duration: 120,
  },
  {
    key: "finance",
    title: "Review Finances",
    desc: "Check your accounts. Know your numbers. Awareness creates control.",
    icon: "wallet",
    tool: "checklist",
    items: [
      "Check your main checking balance",
      "Review spending from the last 7 days",
      "Note one recurring subscription you could cut",
      "Write down one savings goal for this month",
    ],
  },
  {
    key: "audit",
    title: "Evening Audit",
    desc: "Before bed, write down 3 things you accomplished and 1 thing to improve.",
    icon: "leaf",
    tool: "journal",
    prompt:
      "Three things you accomplished today, and one thing you'll do differently tomorrow.",
  },
];

export function DailyGrowthPage({ t, play, setPage }) {
  const [activeItem, setActiveItem] = useState(null);
  const today = new Date().toISOString().slice(0, 10);
  const [completed, setCompleted] = useState(() =>
    LS.get(`daily_growth_${today}`, []),
  );

  const markDone = (key) => {
    if (completed.includes(key)) return;
    const next = [...completed, key];
    setCompleted(next);
    LS.set(`daily_growth_${today}`, next);
    play?.("correct");
  };

  const openItem = (item) => {
    play?.("tap");
    if (item.tool === "redirect" && setPage) {
      setPage(item.redirect);
      return;
    }
    setActiveItem(item);
  };

  return (
    <div
      data-page-tag="#daily_growth"
      style={{ padding: "48px 28px", maxWidth: 560, margin: "0 auto" }}
    >
      <h2
        style={{
          fontSize: 26,
          fontWeight: 700,
          color: t.ink,
          margin: "0 0 10px",
        }}
      >
        Daily Growth
      </h2>
      <p
        style={{
          color: t.muted,
          fontSize: 15,
          lineHeight: 1.8,
          margin: "0 0 20px",
          fontStyle: "italic",
        }}
      >
        Small daily actions that compound into life-changing results.
      </p>

      {/* Progress strip */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 22,
          padding: "10px 14px",
          background: t.greenLt,
          border: `1px solid rgba(74,140,92,0.3)`,
          borderRadius: 12,
        }}
      >
        <div
          style={{
            flex: 1,
            height: 6,
            background: t.white,
            borderRadius: 99,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${(completed.length / GROWTH_ITEMS.length) * 100}%`,
              height: "100%",
              background: `linear-gradient(90deg, ${t.green}, #6FBE77)`,
              transition: "width 0.4s ease",
            }}
          />
        </div>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: t.green,
            letterSpacing: 0.5,
          }}
        >
          {completed.length}/{GROWTH_ITEMS.length} TODAY
        </span>
      </div>

      {GROWTH_ITEMS.map((item) => {
        const isDone = completed.includes(item.key);
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => openItem(item)}
            style={{
              width: "100%",
              textAlign: "left",
              background: isDone ? t.greenLt : t.white,
              border: `1px solid ${isDone ? t.green + "66" : t.border}`,
              borderRadius: 14,
              padding: "18px 20px",
              marginBottom: 12,
              display: "flex",
              alignItems: "flex-start",
              gap: 14,
              cursor: "pointer",
              fontFamily: "Georgia,serif",
              transition: "transform 0.12s ease, box-shadow 0.2s ease",
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: isDone ? t.green : t.greenLt,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                transition: "background 0.2s ease",
              }}
            >
              {isDone ? (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                Ic[item.icon]?.("none", t.green, 18)
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  margin: "0 0 4px",
                  fontSize: 15,
                  fontWeight: 700,
                  color: t.ink,
                }}
              >
                {item.title}
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: 13,
                  color: t.muted,
                  lineHeight: 1.6,
                }}
              >
                {item.desc}
              </p>
            </div>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke={t.muted}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ marginTop: 14, flexShrink: 0 }}
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        );
      })}

      {activeItem && (
        <DailyGrowthModal
          item={activeItem}
          t={t}
          play={play}
          onClose={() => setActiveItem(null)}
          onComplete={() => {
            markDone(activeItem.key);
            setActiveItem(null);
          }}
        />
      )}
    </div>
  );
}

function DailyGrowthModal({ item, t, play, onClose, onComplete }) {
  // Android back button: push a history entry when modal opens,
  // listen for popstate to close instead of navigating away.
  const closedByUI = React.useRef(false);
  const historyPushed = React.useRef(false);

  useEffect(() => {
    window.history.pushState({ dailyGrowthModal: true }, "");
    historyPushed.current = true;
    const handlePop = () => {
      // Back button was pressed — the history entry is already consumed
      historyPushed.current = false;
      if (!closedByUI.current) {
        onClose();
      }
    };
    window.addEventListener("popstate", handlePop);
    return () => {
      window.removeEventListener("popstate", handlePop);
      // Only pop the history entry we pushed if it hasn't been consumed already
      if (closedByUI.current && historyPushed.current) {
        window.history.back();
      }
    };
  }, [onClose]);

  const handleUIClose = () => {
    closedByUI.current = true;
    onClose();
  };

  return (
    <>
      <div
        onClick={handleUIClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.45)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
          zIndex: 200,
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        style={{
          position: "fixed",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: "min(92vw, 460px)",
          maxHeight: "85dvh",
          background: t.white,
          border: `1px solid ${t.border}`,
          borderRadius: 20,
          padding: "24px 24px 20px",
          zIndex: 201,
          boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
          fontFamily: "Georgia,serif",
          overflowY: "auto",
          color: t.ink,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 14,
          }}
        >
          <h3
            style={{ margin: 0, fontSize: 20, fontWeight: 700, color: t.ink }}
          >
            {item.title}
          </h3>
          <button
            onClick={handleUIClose}
            aria-label="Close"
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: t.light,
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: t.muted,
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {item.tool === "journal" && (
          <JournalTool item={item} t={t} play={play} onComplete={onComplete} />
        )}
        {item.tool === "timer" && (
          <TimerTool item={item} t={t} play={play} onComplete={onComplete} />
        )}
        {item.tool === "checklist" && (
          <ChecklistTool
            item={item}
            t={t}
            play={play}
            onComplete={onComplete}
          />
        )}
      </div>
    </>
  );
}

function JournalTool({ item, t, play, onComplete }) {
  const today = new Date().toISOString().slice(0, 10);
  const [text, setText] = useState(() =>
    LS.get(`dg_journal_${item.key}_${today}`, ""),
  );
  useEffect(() => {
    LS.set(`dg_journal_${item.key}_${today}`, text);
  }, [text, item.key, today]);

  const canSubmit = text.trim().length >= 5;

  return (
    <>
      <p
        style={{
          margin: "0 0 14px",
          fontSize: 14,
          color: t.mid,
          lineHeight: 1.7,
          fontStyle: "italic",
          paddingLeft: 12,
          borderLeft: `3px solid ${t.green}`,
        }}
      >
        {item.prompt}
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Start writing..."
        style={{
          width: "100%",
          minHeight: 160,
          maxHeight: "40vh",
          background: t.skin,
          border: `1.5px solid ${t.border}`,
          borderRadius: 12,
          padding: "14px 16px",
          fontSize: 15,
          lineHeight: 1.7,
          color: t.ink,
          outline: "none",
          resize: "vertical",
          fontFamily: "Georgia,serif",
          boxSizing: "border-box",
          marginBottom: 14,
        }}
      />
      <button
        onClick={() => {
          play?.("ok");
          onComplete();
        }}
        disabled={!canSubmit}
        style={{
          width: "100%",
          padding: "13px",
          background: canSubmit ? t.green : t.light,
          color: canSubmit ? "#fff" : t.muted,
          border: "none",
          borderRadius: 12,
          fontSize: 14,
          fontWeight: 700,
          cursor: canSubmit ? "pointer" : "not-allowed",
          fontFamily: "Georgia,serif",
        }}
      >
        Mark as done
      </button>
    </>
  );
}

function TimerTool({ item, t, play, onComplete }) {
  const [remaining, setRemaining] = useState(item.duration || 120);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running || remaining <= 0) return;
    const id = setInterval(() => setRemaining((r) => r - 1), 1000);
    return () => clearInterval(id);
  }, [running, remaining]);

  useEffect(() => {
    if (remaining === 0 && running) {
      setRunning(false);
      play?.("correct");
    }
  }, [remaining, running, play]);

  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");

  return (
    <>
      <p
        style={{
          margin: "0 0 20px",
          fontSize: 14,
          color: t.mid,
          lineHeight: 1.7,
        }}
      >
        Tap Start, then record yourself speaking for the full 2 minutes. No
        filler words (&ldquo;um&rdquo;, &ldquo;like&rdquo;, &ldquo;you
        know&rdquo;).
      </p>
      <div
        style={{
          textAlign: "center",
          fontSize: 64,
          fontWeight: 800,
          color: remaining === 0 ? t.green : t.ink,
          fontFamily: "Georgia,serif",
          letterSpacing: -1,
          padding: "20px 0",
        }}
      >
        {mm}:{ss}
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
        <button
          onClick={() => {
            play?.("tap");
            setRunning((r) => !r);
          }}
          disabled={remaining === 0}
          style={{
            flex: 1,
            padding: "13px",
            background:
              remaining === 0 ? t.light : running ? t.gold : t.green,
            color: remaining === 0 ? t.muted : "#fff",
            border: "none",
            borderRadius: 12,
            fontSize: 14,
            fontWeight: 700,
            cursor: remaining === 0 ? "not-allowed" : "pointer",
            fontFamily: "Georgia,serif",
          }}
        >
          {running ? "Pause" : remaining === 0 ? "Complete!" : "Start"}
        </button>
        <button
          onClick={() => {
            play?.("ok");
            onComplete();
          }}
          style={{
            flex: 1,
            padding: "13px",
            background: t.white,
            color: t.ink,
            border: `1.5px solid ${t.border}`,
            borderRadius: 12,
            fontSize: 14,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "Georgia,serif",
          }}
        >
          Mark done
        </button>
      </div>
    </>
  );
}

function ChecklistTool({ item, t, play, onComplete }) {
  const today = new Date().toISOString().slice(0, 10);
  const [checked, setChecked] = useState(() =>
    LS.get(`dg_check_${item.key}_${today}`, []),
  );

  const toggle = (idx) => {
    play?.("tap");
    const next = checked.includes(idx)
      ? checked.filter((i) => i !== idx)
      : [...checked, idx];
    setChecked(next);
    LS.set(`dg_check_${item.key}_${today}`, next);
  };

  const allDone = checked.length === item.items.length;

  return (
    <>
      <p
        style={{
          margin: "0 0 14px",
          fontSize: 14,
          color: t.mid,
          lineHeight: 1.7,
        }}
      >
        Work through each item. Tap to check off as you go.
      </p>
      {item.items.map((txt, idx) => {
        const isChecked = checked.includes(idx);
        return (
          <button
            key={idx}
            onClick={() => toggle(idx)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              width: "100%",
              padding: "12px 14px",
              marginBottom: 8,
              background: isChecked ? t.greenLt : t.white,
              border: `1.5px solid ${isChecked ? t.green : t.border}`,
              borderRadius: 12,
              cursor: "pointer",
              textAlign: "left",
              fontFamily: "Georgia,serif",
            }}
          >
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: 6,
                background: isChecked ? t.green : "transparent",
                border: `2px solid ${isChecked ? t.green : t.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {isChecked && (
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>
            <span
              style={{
                fontSize: 14,
                color: t.ink,
                textDecoration: isChecked ? "line-through" : "none",
                opacity: isChecked ? 0.65 : 1,
              }}
            >
              {txt}
            </span>
          </button>
        );
      })}
      <button
        onClick={() => {
          play?.("ok");
          onComplete();
        }}
        disabled={!allDone}
        style={{
          width: "100%",
          padding: "13px",
          marginTop: 10,
          background: allDone ? t.green : t.light,
          color: allDone ? "#fff" : t.muted,
          border: "none",
          borderRadius: 12,
          fontSize: 14,
          fontWeight: 700,
          cursor: allDone ? "pointer" : "not-allowed",
          fontFamily: "Georgia,serif",
        }}
      >
        {allDone
          ? "Mark as done"
          : `Finish all items (${checked.length}/${item.items.length})`}
      </button>
    </>
  );
}

import { useState, useEffect } from "react";
import { LS } from "../systems/storage";
import { localDateStr } from "../systems/readingStreak";

const GOAL_KEY = "life_personal_goals";

function formatDeadlineDate(dateString) {
  if (!dateString) return "";
  const [year, month, day] = dateString.split("-");
  if (!year || !month || !day) return dateString;
  return `${month}/${day}/${year}`;
}

export function GoalSettingPage({ t, play }) {
  const [goals, setGoals] = useState(() => LS.get(GOAL_KEY, []));
  const [title, setTitle] = useState("");
  const [target, setTarget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [deadlineError, setDeadlineError] = useState("");
  const today = localDateStr();

  useEffect(() => {
    LS.set(GOAL_KEY, goals);
  }, [goals]);

  const addGoal = () => {
    if (!title.trim()) return;
    if (deadline && deadline < today) {
      setDeadlineError("Choose today or a future date.");
      play?.("back");
      return;
    }
    const newGoal = {
      id: Date.now(),
      title: title.trim(),
      target: target.trim(),
      deadline,
      createdAt: Date.now(),
      progress: 0,
      done: false,
    };
    setGoals([newGoal, ...goals]);
    setTitle("");
    setTarget("");
    setDeadline("");
    play?.("ok");
  };

  const toggleDone = (id) => {
    play?.("tap");
    setGoals(
      goals.map((g) =>
        g.id === id
          ? { ...g, done: !g.done, progress: !g.done ? 100 : g.progress }
          : g,
      ),
    );
  };

  const updateProgress = (id, pct) => {
    setGoals(
      goals.map((g) =>
        g.id === id ? { ...g, progress: pct, done: pct >= 100 } : g,
      ),
    );
  };

  const remove = (id) => {
    play?.("back");
    setGoals(goals.filter((g) => g.id !== id));
  };

  const FONT = "-apple-system, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif";

  return (
    <div
      data-page-tag="#goal_setting"
      style={{
        padding: "28px 18px calc(96px + var(--safe-bottom, 0px)) 18px",
        maxWidth: 560,
        margin: "0 auto",
        fontFamily: FONT,
        boxSizing: "border-box",
      }}
    >
      <p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: t.green, fontFamily: FONT }}>
        Personal
      </p>
      <h2 className="ios-large-title" style={{ margin: "0 0 6px", color: t.ink }}>
        Goals
      </h2>
      <p style={{ color: t.muted, fontSize: 14, lineHeight: 1.6, margin: "0 0 24px", fontFamily: FONT }}>
        Define what you want, set a target, and track your progress.
      </p>

      {/* New goal form */}
      <div
        style={{
          background: t.white,
          border: `1px solid ${t.border}`,
          borderRadius: 16,
          padding: 20,
          marginBottom: 28,
        }}
      >
        <p
          style={{
            margin: "0 0 12px",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: t.muted,
          }}
        >
          New Goal
        </p>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What do you want to achieve?"
          style={{
            width: "100%",
            padding: "12px 14px",
            background: t.skin,
            border: `1.5px solid ${t.border}`,
            borderRadius: 10,
            fontSize: 15,
            color: t.ink,
            outline: "none",
            fontFamily: FONT,
            boxSizing: "border-box",
            marginBottom: 10,
            transition: "border-color 0.18s ease, box-shadow 0.18s ease",
          }}
        />
        <input
          type="text"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          placeholder="Concrete target (e.g. 'Read 30 pages/week', 'Save $5,000')"
          style={{
            width: "100%",
            padding: "12px 14px",
            background: t.skin,
            border: `1.5px solid ${t.border}`,
            borderRadius: 10,
            fontSize: 14,
            color: t.ink,
            outline: "none",
            fontFamily: FONT,
            boxSizing: "border-box",
            marginBottom: 10,
          }}
        />
        <input
          type="date"
          value={deadline}
          min={today}
          aria-invalid={deadlineError ? "true" : "false"}
          onChange={(e) => {
            setDeadline(e.target.value);
            if (deadlineError) {
              setDeadlineError(
                e.target.value && e.target.value < today
                  ? "Choose today or a future date."
                  : "",
              );
            }
          }}
          style={{
            width: "100%",
            padding: "12px 14px",
            background: t.skin,
            border: `1.5px solid ${deadlineError ? t.red : t.border}`,
            borderRadius: 10,
            fontSize: 14,
            color: t.ink,
            outline: "none",
            fontFamily: "-apple-system,'SF Pro Display','SF Pro Text','Helvetica Neue',Arial,sans-serif",
            boxSizing: "border-box",
            marginBottom: 14,
          }}
        />
        {deadlineError && (
          <p
            style={{
              margin: "0 0 14px",
              fontSize: 12,
              color: t.red,
              lineHeight: 1.5,
            }}
          >
            {deadlineError}
          </p>
        )}
        <button
          onClick={addGoal}
          disabled={!title.trim() || Boolean(deadlineError)}
          style={{
            width: "100%",
            padding: "13px",
            background: title.trim() && !deadlineError ? t.green : t.light,
            color: title.trim() && !deadlineError ? "#fff" : t.muted,
            border: "none",
            borderRadius: 12,
            fontSize: 14,
            fontWeight: 700,
            cursor: title.trim() && !deadlineError ? "pointer" : "not-allowed",
            fontFamily: "-apple-system,'SF Pro Display','SF Pro Text','Helvetica Neue',Arial,sans-serif",
          }}
        >
          + Add Goal
        </button>
      </div>

      {/* Goal list */}
      {goals.length === 0 ? (
        <p
          style={{
            color: t.muted,
            fontSize: 14,
            textAlign: "center",
            padding: 20,
            fontStyle: "italic",
          }}
        >
          No goals yet. Add your first one above.
        </p>
      ) : (
        goals.map((g) => (
          <div
            key={g.id}
            style={{
              background: t.white,
              border: `1px solid ${g.done ? t.green + "66" : t.border}`,
              borderRadius: 14,
              padding: 18,
              marginBottom: 12,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                marginBottom: 10,
              }}
            >
              <button
                onClick={() => toggleDone(g.id)}
                aria-label={g.done ? "Mark incomplete" : "Mark complete"}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  background: g.done ? t.green : "transparent",
                  border: `2px solid ${g.done ? t.green : t.border}`,
                  cursor: "pointer",
                  flexShrink: 0,
                  marginTop: 2,
                  padding: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {g.done && (
                  <svg
                    width="12"
                    height="12"
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
              </button>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    margin: 0,
                    fontSize: 15,
                    fontWeight: 700,
                    color: t.ink,
                    textDecoration: g.done ? "line-through" : "none",
                  }}
                >
                  {g.title}
                </p>
                {g.target && (
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontSize: 13,
                      color: t.muted,
                      lineHeight: 1.5,
                    }}
                  >
                    {g.target}
                  </p>
                )}
                {g.deadline && (
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontSize: 11,
                      color: t.green,
                      fontWeight: 600,
                    }}
                  >
                     Deadline: {formatDeadlineDate(g.deadline)}
                  </p>
                )}
              </div>
              <button
                onClick={() => remove(g.id)}
                aria-label="Delete goal"
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: t.muted,
                  padding: 4,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-2 14a2 2 0 01-2 2H9a2 2 0 01-2-2L5 6" />
                </svg>
              </button>
            </div>

            {/* Progress slider */}
            {!g.done && (
              <>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 6,
                  }}
                >
                  <span style={{ fontSize: 11, color: t.muted, fontWeight: 600 }}>
                    Progress
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      color: t.green,
                      fontWeight: 700,
                    }}
                  >
                    {g.progress}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={g.progress}
                  onChange={(e) => updateProgress(g.id, Number(e.target.value))}
                  style={{
                    width: "100%",
                    accentColor: t.green,
                  }}
                />
              </>
            )}
          </div>
        ))
      )}
    </div>
  );
}

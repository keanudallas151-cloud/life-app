import { useState, useCallback } from "react";

export function ToolsTodoPage({
  t,
  play,
  todos = [],
  setTodos,
}) {
  const [newTask, setNewTask] = useState("");
  const [inputError, setInputError] = useState("");

  const syncTodos = useCallback(
    (updatedTodos) => {
      setTodos(updatedTodos);
    },
    [setTodos],
  );

  const addTodo = () => {
    const trimmed = newTask.trim();
    if (!trimmed) {
      setInputError("Task cannot be empty");
      play("err");
      return;
    }
    setInputError("");
    const task = {
      id: `todo_${Date.now()}`,
      text: trimmed,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    const updatedTodos = [...todos, task];
    syncTodos(updatedTodos);
    setNewTask("");
    play("ok");
  };

  const toggleTodo = (id) => {
    play("tap");
    const updatedTodos = todos.map((t) =>
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    syncTodos(updatedTodos);
  };

  const deleteTodo = (id) => {
    play("tap");
    const updatedTodos = todos.filter((t) => t.id !== id);
    syncTodos(updatedTodos);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      addTodo();
    }
  };

  const completedCount = todos.filter((t) => t.completed).length;
  const completionPct = todos.length
    ? Math.round((completedCount / todos.length) * 100)
    : 0;

  return (
    <div
      data-page-tag="#tools_todo_page"
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
          margin: "0 0 6px",
          fontSize: 28,
          fontWeight: 700,
          color: t.ink,
          fontFamily: "Georgia,serif",
        }}
      >
        To-Do
      </h2>
      <p
        style={{
          margin: "0 0 24px",
          color: t.mid,
          fontSize: 13,
        }}
      >
        {completedCount} of {todos.length} completed
      </p>

      <section
        className="life-card-hover"
        style={{
          marginBottom: 18,
          padding: "16px 16px 14px",
          borderRadius: 20,
          background: `linear-gradient(135deg, ${t.white} 0%, ${t.greenLt} 150%)`,
          border: `1px solid ${t.border}`,
          boxShadow: `0 14px 32px ${t.green}10`,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <p style={{ margin: "0 0 4px", color: t.ink, fontSize: 15, fontWeight: 700 }}>
              Daily capture board
            </p>
            <p style={{ margin: 0, color: t.mid, fontSize: 12.5, lineHeight: 1.6 }}>
              Add quick tasks, clear them fast, and keep momentum visible.
            </p>
          </div>
          <div
            style={{
              alignSelf: "flex-start",
              minHeight: 34,
              padding: "8px 12px",
              borderRadius: 999,
              background: `${t.green}16`,
              color: t.green,
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            {completionPct}% done
          </div>
        </div>
        <div
          aria-hidden
          style={{
            marginTop: 12,
            height: 8,
            borderRadius: 999,
            background: t.light,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${completionPct}%`,
              height: "100%",
              borderRadius: 999,
              background: `linear-gradient(90deg, ${t.green} 0%, ${t.greenAlt || t.green} 100%)`,
              transition: "width 0.25s ease",
            }}
          />
        </div>
      </section>

      {/* Add Task Input */}
      <div
        style={{
          display: "flex",
          gap: 10,
          marginBottom: 24,
          flexWrap: "wrap",
        }}
      >
        <input
          type="text"
          placeholder="Add a new task..."
          value={newTask}
          onChange={(e) => {
            setNewTask(e.target.value);
            if (inputError) setInputError("");
          }}
          onKeyDown={handleKeyDown}
          style={{
            flex: 1,
            padding: "12px 14px",
            border: `1px solid ${t.border}`,
            borderRadius: 10,
            fontSize: 16,
            color: t.ink,
            background: t.white,
            fontFamily: "inherit",
            outlineColor: t.green,
            minHeight: 44,
          }}
        />
        <button
          type="button"
          onClick={addTodo}
          style={{
            padding: "12px 16px",
            background: t.green,
            color: t.white,
            border: "none",
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 44,
          }}
        >
          Add
        </button>
      </div>

      {inputError && (
        <p
          style={{
            margin: "0 0 16px",
            fontSize: 12,
            color: t.red,
          }}
        >
          {inputError}
        </p>
      )}

      {/* Todo List */}
      {todos.length === 0 ? (
        <div
          style={{
            padding: 40,
            textAlign: "center",
            color: t.muted,
            fontSize: 14,
            borderRadius: 18,
            border: `1px dashed ${t.border}`,
            background: `${t.greenLt}66`,
          }}
        >
          <div
            aria-hidden
            style={{
              width: 56,
              height: 56,
              margin: "0 auto 12px",
              borderRadius: 16,
              display: "grid",
              placeItems: "center",
              background: `${t.green}18`,
            }}
          >
            <span style={{ transform: "translateY(-1px)" }}>{"✦"}</span>
          </div>
          <p style={{ margin: 0 }}>No tasks yet. Add one to get started!</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 8 }}>
          {todos.map((todo) => (
            <div
              key={todo.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 14px",
                background: todo.completed ? `${t.greenLt}40` : t.white,
                border: `1px solid ${t.border}`,
                borderRadius: 10,
                transition: "transform 0.18s ease, border-color 0.18s ease, background 0.18s ease",
              }}
            >
              <button
                type="button"
                onClick={() => toggleTodo(todo.id)}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 5,
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <span
                  aria-hidden
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 5,
                    border: `2px solid ${todo.completed ? t.green : t.border}`,
                    background: todo.completed ? t.green : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {todo.completed && (
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      stroke={t.white}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="1 6 4.5 10 11 1" />
                    </svg>
                  )}
                </span>
              </button>
              <div
                style={{
                  flex: 1,
                  fontSize: 14,
                  color: todo.completed ? t.muted : t.ink,
                  textDecoration: todo.completed ? "line-through" : "none",
                  wordBreak: "break-word",
                }}
              >
                {todo.text}
              </div>
              <button
                type="button"
                onClick={() => deleteTodo(todo.id)}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: t.muted,
                  flexShrink: 0,
                  transition: "color 0.2s",
                  minWidth: 44,
                  minHeight: 44,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = t.red;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = t.muted;
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14H6L5 6" />
                  <path d="M10 11v6M14 11v6" />
                  <path d="M9 6V4h6v2" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

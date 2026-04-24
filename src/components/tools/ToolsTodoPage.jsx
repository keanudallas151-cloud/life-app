import { useCallback, useEffect, useRef, useState } from "react";

/* ─── Micro-ripple on tap ─────────────────────────────────────────────── */
function Ripple({ x, y, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 500);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <span
      aria-hidden
      style={{
        position: "absolute",
        left: x - 12,
        top: y - 12,
        width: 24,
        height: 24,
        borderRadius: "50%",
        background: "rgba(80,200,120,0.35)",
        pointerEvents: "none",
        animation: "ios-ripple 0.45s ease-out both",
        zIndex: 1,
      }}
    />
  );
}

/* ─── iOS Checkbox ────────────────────────────────────────────────────── */
function IosCheckbox({ checked, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={checked ? "Mark incomplete" : "Mark complete"}
      style={{
        width: 44,
        height: 44,
        background: "none",
        border: "none",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        WebkitTapHighlightColor: "transparent",
      }}
    >
      <span
        style={{
          width: 24,
          height: 24,
          borderRadius: "50%",
          border: `2px solid ${checked ? "#50c878" : "rgba(255,255,255,0.22)"}`,
          background: checked ? "#50c878" : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition:
            "background 0.22s cubic-bezier(0.34,1.56,0.64,1), border-color 0.22s ease, transform 0.18s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s ease",
          boxShadow: checked ? "0 0 0 3px rgba(80,200,120,0.22)" : "none",
          transform: checked ? "scale(1.05)" : "scale(1)",
          flexShrink: 0,
        }}
      >
        {checked && (
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
            <polyline
              points="2,7 5.5,11 12,3"
              stroke="#000"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="20"
              style={{
                strokeDashoffset: 0,
                animation: "ios-tick-draw 0.25s ease 0.06s both",
              }}
            />
          </svg>
        )}
      </span>
    </button>
  );
}

/* ─── Single todo row ─────────────────────────────────────────────────── */
function TodoRow({ todo, onToggle, onDelete }) {
  const [ripples, setRipples] = useState([]);
  const [completing, setCompleting] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const rowRef = useRef(null);
  const rippleId = useRef(0);

  const handleToggle = (e) => {
    const rect = rowRef.current?.getBoundingClientRect();
    if (rect) {
      const id = ++rippleId.current;
      const x = (e.clientX || rect.left + rect.width / 2) - rect.left;
      const y = (e.clientY || rect.top + rect.height / 2) - rect.top;
      setRipples((r) => [...r, { id, x, y }]);
    }
    if (!todo.completed) {
      setCompleting(true);
      setTimeout(() => setCompleting(false), 450);
    }
    onToggle(todo.id);
  };

  const handleDelete = () => {
    setLeaving(true);
    setTimeout(() => onDelete(todo.id), 280);
  };

  return (
    <div
      ref={rowRef}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 0,
        padding: "3px 8px 3px 4px",
        background: todo.completed
          ? "rgba(80,200,120,0.07)"
          : completing
          ? "rgba(80,200,120,0.1)"
          : "rgba(255,255,255,0.04)",
        border: `1px solid ${
          todo.completed
            ? "rgba(80,200,120,0.18)"
            : "rgba(255,255,255,0.07)"
        }`,
        borderRadius: 16,
        minHeight: 56,
        position: "relative",
        overflow: "hidden",
        transition:
          "background 0.22s ease, border-color 0.22s ease, opacity 0.22s ease, transform 0.18s cubic-bezier(0.25,1,0.5,1)",
        opacity: leaving ? 0 : 1,
        transform: leaving ? "scale(0.93) translateX(16px)" : "scale(1)",
        animation: "ios-task-enter 0.3s cubic-bezier(0.25,1,0.5,1) both",
      }}
    >
      {ripples.map((r) => (
        <Ripple
          key={r.id}
          x={r.x}
          y={r.y}
          onDone={() => setRipples((prev) => prev.filter((p) => p.id !== r.id))}
        />
      ))}

      <IosCheckbox checked={todo.completed} onToggle={handleToggle} />

      <div
        style={{
          flex: 1,
          fontFamily:
            "-apple-system, SF Pro Text, Helvetica Neue, Arial, sans-serif",
          fontSize: 15,
          fontWeight: 400,
          lineHeight: 1.4,
          color: todo.completed ? "rgba(161,161,161,0.55)" : "#ededed",
          textDecoration: todo.completed ? "line-through" : "none",
          textDecorationColor: "rgba(161,161,161,0.35)",
          transition: "color 0.22s ease",
          wordBreak: "break-word",
          padding: "10px 0",
        }}
      >
        {todo.text}
      </div>

      <button
        type="button"
        onClick={handleDelete}
        aria-label="Delete task"
        style={{
          width: 32,
          height: 32,
          borderRadius: 9,
          border: "none",
          background: "rgba(229,72,77,0.1)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "rgba(229,72,77,0.65)",
          flexShrink: 0,
          marginLeft: 6,
          transition:
            "background 0.15s ease, color 0.15s ease, transform 0.14s cubic-bezier(0.34,1.56,0.64,1)",
          WebkitTapHighlightColor: "transparent",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(229,72,77,0.22)";
          e.currentTarget.style.color = "#e5484d";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(229,72,77,0.1)";
          e.currentTarget.style.color = "rgba(229,72,77,0.65)";
        }}
        onMouseDown={(e) => {
          e.currentTarget.style.transform = "scale(0.85)";
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.transform = "scale(1)";
        }}
        onTouchStart={(e) => {
          e.currentTarget.style.transform = "scale(0.85)";
        }}
        onTouchEnd={(e) => {
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
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
  );
}

/* ─── Main Page ───────────────────────────────────────────────────────── */
export function ToolsTodoPage({ t, play, todos = [], setTodos }) {
  const [newTask, setNewTask] = useState("");
  const [inputError, setInputError] = useState("");
  const [filter, setFilter] = useState("all");
  const [inputFocused, setInputFocused] = useState(false);
  const inputRef = useRef(null);

  const syncTodos = useCallback(
    (updatedTodos) => setTodos(updatedTodos),
    [setTodos],
  );

  const addTodo = () => {
    const trimmed = newTask.trim();
    if (!trimmed) {
      setInputError("Please enter a task");
      play("err");
      inputRef.current?.focus();
      setTimeout(() => setInputError(""), 2200);
      return;
    }
    setInputError("");
    const task = {
      id: `todo_${Date.now()}`,
      text: trimmed,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    syncTodos([...todos, task]);
    setNewTask("");
    play("ok");
  };

  const toggleTodo = (id) => {
    play("tap");
    syncTodos(todos.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item)));
  };

  const deleteTodo = (id) => {
    play("tap");
    setTimeout(() => syncTodos(todos.filter((item) => item.id !== id)), 290);
  };

  const clearCompleted = () => {
    play("tap");
    syncTodos(todos.filter((item) => !item.completed));
  };

  const completedCount = todos.filter((item) => item.completed).length;
  const totalCount = todos.length;
  const completionPct = totalCount ? Math.round((completedCount / totalCount) * 100) : 0;

  const filteredTodos = todos.filter((item) => {
    if (filter === "active") return !item.completed;
    if (filter === "done") return item.completed;
    return true;
  });

  const green = (t && t.green) || "#50c878";
  const ink = (t && t.ink) || "#ededed";
  const muted = (t && t.muted) || "#a1a1a1";
  const iosfont = "-apple-system, SF Pro Display, Helvetica Neue, Arial, sans-serif";

  return (
    <div
      data-page-tag="#tools_todo_page"
      style={{
        padding: "28px 16px 48px",
        maxWidth: 600,
        margin: "0 auto",
        fontFamily: iosfont,
      }}
    >
      {/* Header */}
      <p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: green, fontFamily: iosfont }}>
        Tools
      </p>
      <h2 style={{ margin: "0 0 4px", fontSize: 32, fontWeight: 700, color: ink, fontFamily: iosfont, letterSpacing: "-0.03em", lineHeight: 1.1 }}>
        To-Do
      </h2>
      <p style={{ margin: "0 0 22px", color: muted, fontSize: 14, fontFamily: iosfont }}>
        {completedCount} of {totalCount} completed
      </p>

      {/* Progress card */}
      <div style={{ marginBottom: 20, padding: "18px 18px 16px", borderRadius: 20, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14, gap: 12 }}>
          <div>
            <p style={{ margin: "0 0 3px", color: ink, fontSize: 15, fontWeight: 600, fontFamily: iosfont }}>
              Daily capture board
            </p>
            <p style={{ margin: 0, color: muted, fontSize: 12.5, lineHeight: 1.5, fontFamily: iosfont }}>
              Add tasks, tick them off, keep momentum visible.
            </p>
          </div>
          <span style={{
            display: "inline-flex", alignItems: "center", padding: "6px 12px",
            borderRadius: 999, background: completionPct === 100 ? "rgba(80,200,120,0.22)" : "rgba(80,200,120,0.1)",
            color: green, fontSize: 12, fontWeight: 700, whiteSpace: "nowrap", fontFamily: iosfont,
            transition: "background 0.3s ease",
          }}>
            {completionPct === 100 ? "✓ Done" : `${completionPct}%`}
          </span>
        </div>
        <div className="ios-progress-track">
          <div className="ios-progress-fill" style={{ width: `${completionPct}%` }} />
        </div>
        {totalCount > 0 && (
          <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
            {[{ label: "Total", val: totalCount }, { label: "Done", val: completedCount }, { label: "Left", val: totalCount - completedCount }].map(({ label, val }) => (
              <div key={label} style={{ flex: 1, textAlign: "center" }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: ink, fontFamily: iosfont, letterSpacing: "-0.02em" }}>{val}</div>
                <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: muted, marginTop: 1, fontFamily: iosfont }}>{label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Input row */}
      <div style={{ display: "flex", gap: 10, marginBottom: inputError ? 8 : 20 }}>
        <input
          ref={inputRef}
          type="text"
          placeholder="New task…"
          value={newTask}
          onChange={(e) => { setNewTask(e.target.value); if (inputError) setInputError(""); }}
          onKeyDown={(e) => e.key === "Enter" && addTodo()}
          onFocus={() => setInputFocused(true)}
          onBlur={() => setInputFocused(false)}
          style={{
            flex: 1,
            fontFamily: iosfont,
            background: inputFocused ? "rgba(80,200,120,0.05)" : "rgba(255,255,255,0.06)",
            border: `1.5px solid ${inputFocused ? green : "rgba(255,255,255,0.1)"}`,
            borderRadius: 14,
            color: ink,
            fontSize: 16,
            padding: "0 16px",
            minHeight: 52,
            outline: "none",
            transition: "border-color 0.18s ease, background 0.18s ease, box-shadow 0.18s ease",
            boxShadow: inputFocused ? `0 0 0 3px rgba(80,200,120,0.12)` : "none",
            WebkitAppearance: "none",
          }}
        />
        <button
          type="button"
          onClick={addTodo}
          style={{
            padding: "0 20px",
            background: green,
            color: "#000",
            border: "none",
            borderRadius: 14,
            fontSize: 15,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            minHeight: 52,
            minWidth: 76,
            fontFamily: iosfont,
            letterSpacing: "-0.01em",
            flexShrink: 0,
            transition: "transform 0.14s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.15s ease",
            boxShadow: "0 2px 12px rgba(80,200,120,0.3)",
            WebkitTapHighlightColor: "transparent",
          }}
          onMouseDown={(e) => { e.currentTarget.style.transform = "scale(0.95)"; }}
          onMouseUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
          onTouchStart={(e) => { e.currentTarget.style.transform = "scale(0.95)"; }}
          onTouchEnd={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add
        </button>
      </div>

      {inputError && (
        <p style={{ margin: "0 0 14px", fontSize: 12.5, color: "#e5484d", fontFamily: iosfont, paddingLeft: 4, animation: "ios-bounce-in 0.28s cubic-bezier(0.34,1.56,0.64,1) both" }}>
          {inputError}
        </p>
      )}

      {/* Filter + clear row */}
      {totalCount > 0 && (
        <div style={{ display: "flex", gap: 8, marginBottom: 16, alignItems: "center" }}>
          <div className="ios-segment-control" style={{ flex: 1 }}>
            {[
              { key: "all", label: `All (${totalCount})` },
              { key: "active", label: `Active (${totalCount - completedCount})` },
              { key: "done", label: `Done (${completedCount})` },
            ].map(({ key, label }) => (
              <button
                key={key}
                type="button"
                className={`ios-segment-btn${filter === key ? " active" : ""}`}
                onClick={() => { play("tap"); setFilter(key); }}
                style={{ fontFamily: iosfont }}
              >
                {label}
              </button>
            ))}
          </div>
          {completedCount > 0 && (
            <button
              type="button"
              onClick={clearCompleted}
              style={{
                padding: "7px 12px",
                background: "rgba(229,72,77,0.1)",
                color: "#e5484d",
                border: "1px solid rgba(229,72,77,0.2)",
                borderRadius: 10,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: iosfont,
                whiteSpace: "nowrap",
                flexShrink: 0,
                transition: "transform 0.13s cubic-bezier(0.34,1.56,0.64,1), background 0.15s ease",
                WebkitTapHighlightColor: "transparent",
              }}
              onMouseDown={(e) => { e.currentTarget.style.transform = "scale(0.93)"; }}
              onMouseUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
            >
              Clear done
            </button>
          )}
        </div>
      )}

      {/* List */}
      {filteredTodos.length === 0 ? (
        <div
          key={filter}
          style={{
            padding: "44px 24px",
            textAlign: "center",
            color: muted,
            borderRadius: 20,
            border: "1px dashed rgba(255,255,255,0.1)",
            background: "rgba(255,255,255,0.02)",
            animation: "ios-fade-scale-in 0.28s ease both",
            fontFamily: iosfont,
          }}
        >
          <div style={{ width: 52, height: 52, margin: "0 auto 14px", borderRadius: 14, display: "grid", placeItems: "center", background: "rgba(80,200,120,0.12)", fontSize: 22 }}>
            {filter === "done" ? "✓" : "✦"}
          </div>
          <p style={{ margin: "0 0 4px", fontWeight: 600, color: ink, fontSize: 15, fontFamily: iosfont }}>
            {filter === "done" ? "No completed tasks" : filter === "active" ? "No active tasks" : "No tasks yet"}
          </p>
          <p style={{ margin: 0, fontSize: 13, fontFamily: iosfont }}>
            {filter === "all" ? "Add one above to get started." : filter === "active" ? "All done! 🎉" : "Complete some tasks first."}
          </p>
        </div>
      ) : (
        <div className="ios-stagger" style={{ display: "grid", gap: 8 }}>
          {filteredTodos.map((todo) => (
            <TodoRow key={todo.id} todo={todo} onToggle={toggleTodo} onDelete={deleteTodo} />
          ))}
        </div>
      )}

      {totalCount > 0 && (
        <p style={{ marginTop: 20, textAlign: "center", fontSize: 11, color: "rgba(161,161,161,0.35)", fontFamily: iosfont }}>
          Tap circle to complete · trash icon to delete
        </p>
      )}
    </div>
  );
}

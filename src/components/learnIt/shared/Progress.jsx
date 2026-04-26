import { FONT } from "./constants.js";

export function Progress({ current, total, color, t }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: t?.muted || "#a1a1a1", fontFamily: FONT }}>Question {current + 1} of {total}</span>
        <span style={{ fontSize: 12, color, fontWeight: 600, fontFamily: FONT }}>{Math.round(((current) / total) * 100)}%</span>
      </div>
      <div style={{ height: 6, borderRadius: 999, background: t?.light || "#1a1a1a", overflow: "hidden" }}>
        <div style={{ width: `${(current / total) * 100}%`, height: "100%", background: color, borderRadius: 999, transition: "width 0.4s cubic-bezier(0.34,1.56,0.64,1)" }} />
      </div>
    </div>
  );
}

import { FONT } from "./constants.js";

export function Progress({ current, total, color, t }) {
  const pct = (current / total) * 100;
  // Color shifts toward completion: subject color → amber → green
  const fillColor =
    pct >= 85 ? "#50c878" :
    pct >= 60 ? "#f59e0b" :
    color;
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: t?.muted || "#a1a1a1", fontFamily: FONT }}>Question {current + 1} of {total}</span>
        <span style={{ fontSize: 12, color: fillColor, fontWeight: 600, fontFamily: FONT, transition: "color 0.4s ease" }}>{Math.round(pct)}%</span>
      </div>
      <div style={{ height: 6, borderRadius: 999, background: t?.light || "#1a1a1a", overflow: "hidden" }}>
        <div style={{
          width: `${pct}%`,
          height: "100%",
          background: fillColor,
          borderRadius: 999,
          transition: "width 0.4s cubic-bezier(0.34,1.56,0.64,1), background 0.4s ease",
        }} />
      </div>
    </div>
  );
}

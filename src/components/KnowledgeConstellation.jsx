import { useMemo, useCallback, useRef, useEffect, useState } from "react";
import { C } from "../systems/theme";

const VB_W = 1200;
const VB_H = 900;

function buildEdges(allContent) {
  const keySet = new Set(allContent.map((c) => c.key));
  const seen = new Set();
  const edges = [];
  for (const { key, node } of allContent) {
    for (const r of node.related || []) {
      if (!keySet.has(r)) continue;
      const a = key < r ? key : r;
      const b = key < r ? r : key;
      const id = `${a}|${b}`;
      if (seen.has(id)) continue;
      seen.add(id);
      edges.push({ from: a, to: b });
    }
  }
  return edges;
}

function spiralLayout(keys) {
  const pos = {};
  const golden = Math.PI * (3 - Math.sqrt(5));
  const cx = VB_W / 2;
  const cy = VB_H / 2;
  keys.forEach((key, i) => {
    const r = 36 + Math.sqrt(i + 1) * 26;
    const theta = i * golden;
    pos[key] = { x: cx + r * Math.cos(theta), y: cy + r * Math.sin(theta) };
  });
  return pos;
}

/**
 * Full-screen map of every topic as stars; lines show idea connections.
 * Read topics pulse; tap opens the reader.
 */
export function KnowledgeConstellation({ allContent, readKeys, onPick, onClose, play }) {
  const readSet = useMemo(() => new Set(readKeys), [readKeys]);
  const keys = useMemo(() => allContent.map((c) => c.key), [allContent]);
  const keyToItem = useMemo(() => {
    const m = new Map();
    allContent.forEach((c) => m.set(c.key, c));
    return m;
  }, [allContent]);

  const edges = useMemo(() => buildEdges(allContent), [allContent]);
  const positions = useMemo(() => spiralLayout(keys), [keys]);

  const wrapRef = useRef(null);
  const [hint, setHint] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHint(true), 2200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        play?.("back");
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, play]);

  const handleNodeClick = useCallback(
    (key) => {
      const item = keyToItem.get(key);
      if (!item) return;
      play?.("open");
      onPick(item.key, item.node);
      onClose();
    },
    [keyToItem, onPick, onClose, play]
  );

  const readCount = readSet.size;
  const total = keys.length;

  return (
    <div
      className="life-constellation-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="life-constellation-title"
    >
      <button
        type="button"
        className="life-constellation-backdrop"
        aria-label="Close map"
        onClick={() => {
          play?.("back");
          onClose();
        }}
      />
      <div className="life-constellation-panel" ref={wrapRef}>
        <header className="life-constellation-header">
          <div>
            <h2 id="life-constellation-title" className="life-constellation-title">
              Your knowledge constellation
            </h2>
            <p className="life-constellation-sub">
              Each point is a topic. Lines connect ideas that relate.{" "}
              <span className="life-constellation-glow-label">Bright stars</span> are ones you have opened — keep
              lighting the map.
            </p>
          </div>
          <div className="life-constellation-stats">
            <span className="life-constellation-pill">
              {readCount} / {total} explored
            </span>
            <button
              type="button"
              className="life-constellation-close"
              onClick={() => {
                play?.("back");
                onClose();
              }}
            >
              Close
            </button>
          </div>
        </header>

        <div className="life-constellation-canvas-wrap">
          <div className="life-constellation-stars-bg" aria-hidden />
          <svg
            className="life-constellation-svg"
            viewBox={`0 0 ${VB_W} ${VB_H}`}
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <filter id="life-node-glow" x="-80%" y="-80%" width="260%" height="260%">
                <feGaussianBlur stdDeviation="3" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <linearGradient id="life-edge-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={C.green} stopOpacity="0.15" />
                <stop offset="50%" stopColor={C.green} stopOpacity="0.35" />
                <stop offset="100%" stopColor="#6FBE77" stopOpacity="0.12" />
              </linearGradient>
            </defs>

            <g className="life-constellation-edges">
              {edges.map(({ from, to }) => {
                const p1 = positions[from];
                const p2 = positions[to];
                if (!p1 || !p2) return null;
                const lit = readSet.has(from) && readSet.has(to);
                return (
                  <line
                    key={`${from}-${to}`}
                    x1={p1.x}
                    y1={p1.y}
                    x2={p2.x}
                    y2={p2.y}
                    stroke={lit ? `url(#life-edge-grad)` : "rgba(74,140,92,0.12)"}
                    strokeWidth={lit ? 1.4 : 0.7}
                    className={lit ? "life-constellation-line-lit" : ""}
                  />
                );
              })}
            </g>

            <g className="life-constellation-nodes">
              {keys.map((key) => {
                const p = positions[key];
                if (!p) return null;
                const item = keyToItem.get(key);
                const read = readSet.has(key);
                const emoji = item?.node?.content?.emoji || "·";
                const label = item?.node?.label || key;
                const r = read ? 14 : 9;
                return (
                  <g
                    key={key}
                    transform={`translate(${p.x},${p.y})`}
                    className={`life-constellation-node ${read ? "life-constellation-node--read" : ""}`}
                    style={{ cursor: "pointer" }}
                    onClick={() => handleNodeClick(key)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleNodeClick(key);
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`Open ${label}`}
                  >
                    {read && (
                      <circle r={r + 10} fill="rgba(111,190,119,0.2)" className="life-constellation-pulse-ring" />
                    )}
                    <circle
                      r={r}
                      fill={read ? C.green : "rgba(138,128,112,0.35)"}
                      stroke={read ? "#2d6e42" : C.border}
                      strokeWidth={read ? 2 : 1}
                      filter={read ? "url(#life-node-glow)" : undefined}
                    />
                    <text
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize={read ? 13 : 10}
                      style={{ pointerEvents: "none", userSelect: "none" }}
                    >
                      {emoji}
                    </text>
                    <title>{label}</title>
                  </g>
                );
              })}
            </g>
          </svg>
        </div>

        {hint && (
          <p className="life-constellation-hint" role="status">
            Tap any star to start reading — zoom and pan with pinch and drag on your phone.
          </p>
        )}
      </div>
    </div>
  );
}

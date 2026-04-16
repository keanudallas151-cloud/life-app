import React, { useState, useMemo } from "react";

const CATEGORY_META = {
  finance:     { emoji: "💰", desc: "Master the systems that control money — from banking and markets to personal finance." },
  psychology:  { emoji: "🧠", desc: "Understand how your mind works, and how others use it against you." },
  ideas:       { emoji: "💡", desc: "Practical paths to generating income — online, with AI, and beyond." },
  online:      { emoji: "🌐", desc: "Digital business models you can start from your laptop." },
  ai_cat:      { emoji: "🤖", desc: "Leverage artificial intelligence to build services and income." },
};

/** Recursively collect all leaf nodes (nodes with `content`). */
export function flattenTopics(node, parentSub = "") {
  const results = [];
  if (node.content) return [{ key: null, node, subcategory: parentSub }];
  if (node.children) {
    for (const [k, child] of Object.entries(node.children)) {
      if (child.content) {
        results.push({ key: k, node: child, subcategory: parentSub });
      } else if (child.children) {
        for (const [leafKey, leaf] of Object.entries(child.children)) {
          const nested = flattenTopics(leaf, child.label || k);
          nested.forEach((item) => {
            results.push({ ...item, key: item.key ?? leafKey, subcategory: item.subcategory || child.label || k });
          });
        }
      }
    }
  }
  return results;
}

/**
 * Group leaf topics by the direct children (subcategories) of the category node.
 * Returns [{ label, topics: [{ key, node }] }]
 */
export function groupBySubcategory(categoryNode) {
  if (!categoryNode || !categoryNode.children) return [];
  const groups = [];

  for (const [subKey, subNode] of Object.entries(categoryNode.children)) {
    // If the direct child is itself a leaf, wrap it as its own group
    if (subNode.content) {
      groups.push({ label: subNode.content.title || subNode.label || subKey, topics: [{ key: subKey, node: subNode }] });
      continue;
    }
    if (!subNode.children) continue;

    const topics = [];
    const collectLeaves = (obj, prefix) => {
      for (const [k, child] of Object.entries(obj)) {
        if (child.content) {
          topics.push({ key: prefix ? `${prefix}.${k}` : k, node: child });
        } else if (child.children) {
          collectLeaves(child.children, prefix ? `${prefix}.${k}` : k);
        }
      }
    };
    collectLeaves(subNode.children, "");
    if (topics.length) {
      groups.push({ label: subNode.label || subKey, topics });
    }
  }
  return groups;
}

function TopicCard({ topic, t, isRead, onSelect, play }) {
  const [hovered, setHovered] = useState(false);
  const { node, key } = topic;
  const c = node.content || {};

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => { play("open"); onSelect(key, node); }}
      onKeyDown={(e) => { if (e.key === "Enter") { play("open"); onSelect(key, node); } }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? t.light || "#f8f8f5" : t.white,
        border: `1px solid ${t.border}`,
        borderRadius: 16,
        padding: 18,
        cursor: "pointer",
        fontFamily: "Georgia,serif",
        position: "relative",
        transition: "background .15s",
      }}
    >
      {isRead && (
        <span
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            width: 20,
            height: 20,
            borderRadius: "50%",
            background: t.green,
            color: "#fff",
            fontSize: 12,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ✓
        </span>
      )}

      <div style={{ fontSize: 26, marginBottom: 6 }}>{c.emoji || "📄"}</div>
      <div style={{ fontSize: 15, fontWeight: 700, color: t.ink, marginBottom: 4, lineHeight: 1.3 }}>
        {c.title || node.label || key}
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", fontSize: 11, color: t.muted }}>
        {c.readTime && <span>⏱ {c.readTime}</span>}
        {c.level && <span>📊 {c.level}</span>}
      </div>
    </div>
  );
}

export function CategoryHubPage({ t, categoryKey, categoryNode, onSelect, play, readKeys = [] }) {
  const meta = CATEGORY_META[categoryKey] || { emoji: "📂", desc: "" };
  const groups = useMemo(() => groupBySubcategory(categoryNode), [categoryNode]);
  const readSet = useMemo(() => new Set(readKeys), [readKeys]);

  return (
    <div style={{ padding: "48px 28px", maxWidth: 620, margin: "0 auto", fontFamily: "Georgia,serif" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>{meta.emoji}</div>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: t.ink, margin: "0 0 8px", fontFamily: "Georgia,serif" }}>
          {categoryNode?.label || categoryKey}
        </h1>
        {meta.desc && (
          <p style={{ fontSize: 14, color: t.muted, margin: 0, lineHeight: 1.5, maxWidth: 440, marginLeft: "auto", marginRight: "auto" }}>
            {meta.desc}
          </p>
        )}
      </div>

      {/* Subcategory groups */}
      {groups.map((group, gi) => (
        <div key={gi} style={{ marginBottom: 32 }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: 2.5,
              textTransform: "uppercase",
              color: t.green,
              marginBottom: 12,
            }}
          >
            {group.label}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: 14,
            }}
          >
            {group.topics.map((topic) => (
              <TopicCard
                key={topic.key}
                topic={topic}
                t={t}
                isRead={readSet.has(topic.key)}
                onSelect={onSelect}
                play={play}
              />
            ))}
          </div>
        </div>
      ))}

      {groups.length === 0 && (
        <div style={{ textAlign: "center", color: t.muted, fontSize: 14, marginTop: 40 }}>
          No topics found in this category.
        </div>
      )}
    </div>
  );
}

import { useState, useEffect, useCallback } from "react";
import { supabase, isSupabaseConfigured } from "../supabaseClient";
import { S } from "../systems/theme";

const ROLES = ["Investor", "Inventor", "Both"];

const INDUSTRIES = [
  "Tech / Software",
  "Finance / Fintech",
  "Real Estate",
  "E-Commerce",
  "Health / Wellness",
  "Education",
  "Sustainability",
  "Creative / Media",
  "Other",
];

function PitchCard({ pitch, t, onConnect, isOwn }) {
  return (
    <div
      style={{
        background: t.white,
        border: `1px solid ${t.border}`,
        borderRadius: 18,
        padding: "22px 20px",
        boxShadow: S.sm,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${t.green}, #2d6e42)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <span style={{ color: "#fff", fontSize: 14, fontWeight: 800 }}>
            {(pitch.author_name || "?")[0].toUpperCase()}
          </span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: t.ink }}>
            {pitch.author_name || "Anonymous"}
          </p>
          <p style={{ margin: 0, fontSize: 11, color: t.muted }}>
            {pitch.role} · {pitch.industry}
          </p>
        </div>
        {!isOwn && (
          <button
            onClick={() => onConnect(pitch)}
            style={{
              background: t.green,
              color: "#fff",
              border: "none",
              borderRadius: 10,
              padding: "8px 16px",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Connect
          </button>
        )}
      </div>
      <h3 style={{ margin: "0 0 8px", fontSize: 17, fontWeight: 700, color: t.ink }}>
        {pitch.title}
      </h3>
      <p style={{ margin: 0, fontSize: 14, lineHeight: 1.75, color: t.mid }}>
        {pitch.description}
      </p>
      {pitch.looking_for && (
        <p style={{ margin: "12px 0 0", fontSize: 12, color: t.green, fontWeight: 600 }}>
          Looking for: {pitch.looking_for}
        </p>
      )}
    </div>
  );
}

export function ConnectPage({ t, user, play }) {
  const [pitches, setPitches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [filter, setFilter] = useState("All");
  const [connected, setConnected] = useState(new Set());

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [role, setRole] = useState("Inventor");
  const [industry, setIndustry] = useState("Tech / Software");
  const [lookingFor, setLookingFor] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchPitches = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from("pitches")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    if (!error && data) setPitches(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPitches();
  }, [fetchPitches]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !user?.id) return;
    setSubmitting(true);
    const { error } = await supabase.from("pitches").insert({
      user_id: user.id,
      author_name: user.name || user.email?.split("@")[0] || "Anonymous",
      title: title.trim(),
      description: description.trim(),
      role,
      industry,
      looking_for: lookingFor.trim() || null,
    });
    if (!error) {
      play?.("tap");
      setTitle("");
      setDescription("");
      setLookingFor("");
      setShowCreate(false);
      fetchPitches();
    }
    setSubmitting(false);
  };

  const handleConnect = (pitch) => {
    play?.("tap");
    setConnected((prev) => new Set([...prev, pitch.id]));
  };

  const filtered = filter === "All" ? pitches : pitches.filter((p) => p.role === filter || (filter === "Both" && p.role === "Both"));

  const inputStyle = {
    width: "100%",
    padding: "14px 16px",
    background: t.light,
    border: `1px solid ${t.border}`,
    borderRadius: 12,
    color: t.ink,
    fontSize: 14,
    fontFamily: "Georgia,serif",
    boxSizing: "border-box",
    outline: "none",
  };

  return (
    <div
      data-page-tag="#connect"
      style={{ padding: "40px 20px", maxWidth: 560, margin: "0 auto" }}
    >
      <div style={{ marginBottom: 28 }}>
        <p style={{ margin: "0 0 6px", fontSize: 10, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: t.green }}>
          Connect
        </p>
        <h2 style={{ margin: "0 0 8px", fontSize: 26, fontWeight: 700, color: t.ink }}>
          Investors & Inventors
        </h2>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7, color: t.mid, fontStyle: "italic" }}>
          Share your idea or find opportunities. Connect with people who are building something real.
        </p>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {["All", "Investor", "Inventor"].map((f) => (
          <button
            key={f}
            onClick={() => { play?.("tap"); setFilter(f); }}
            style={{
              padding: "8px 18px",
              borderRadius: 20,
              border: filter === f ? `2px solid ${t.green}` : `1px solid ${t.border}`,
              background: filter === f ? `${t.green}18` : t.white,
              color: filter === f ? t.green : t.mid,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Post Pitch Button */}
      {user && !showCreate && (
        <button
          onClick={() => { play?.("tap"); setShowCreate(true); }}
          style={{
            width: "100%",
            padding: "16px",
            background: `linear-gradient(135deg, ${t.green}, #2d6e42)`,
            border: "none",
            borderRadius: 14,
            color: "#fff",
            fontSize: 15,
            fontWeight: 700,
            cursor: "pointer",
            marginBottom: 24,
            fontFamily: "Georgia,serif",
          }}
        >
          + Post Your Pitch
        </button>
      )}

      {/* Create Pitch Form */}
      {showCreate && (
        <form onSubmit={handleSubmit} style={{
          background: t.white,
          border: `1px solid ${t.border}`,
          borderRadius: 18,
          padding: 22,
          marginBottom: 24,
          boxShadow: S.sm,
        }}>
          <p style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: t.ink }}>
            Create Pitch
          </p>
          <div style={{ display: "grid", gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: t.muted, display: "block", marginBottom: 6 }}>
                I am a...
              </label>
              <div style={{ display: "flex", gap: 8 }}>
                {ROLES.map((r) => (
                  <button
                    type="button"
                    key={r}
                    onClick={() => setRole(r)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: 10,
                      border: role === r ? `2px solid ${t.green}` : `1px solid ${t.border}`,
                      background: role === r ? `${t.green}18` : t.light,
                      color: role === r ? t.green : t.mid,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: t.muted, display: "block", marginBottom: 6 }}>
                Industry
              </label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                style={{ ...inputStyle, cursor: "pointer" }}
              >
                {INDUSTRIES.map((i) => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
            </div>
            <input
              placeholder="Pitch title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              style={inputStyle}
            />
            <textarea
              placeholder="Describe your idea, project, or what you're looking for..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              maxLength={500}
              style={{ ...inputStyle, resize: "vertical" }}
            />
            <input
              placeholder="Looking for... (e.g. funding, technical co-founder)"
              value={lookingFor}
              onChange={(e) => setLookingFor(e.target.value)}
              maxLength={100}
              style={inputStyle}
            />
            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="submit"
                disabled={submitting || !title.trim() || !description.trim()}
                style={{
                  flex: 1,
                  padding: "14px",
                  background: t.green,
                  border: "none",
                  borderRadius: 12,
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: submitting ? "not-allowed" : "pointer",
                  opacity: submitting ? 0.6 : 1,
                }}
              >
                {submitting ? "Posting..." : "Post Pitch"}
              </button>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                style={{
                  padding: "14px 20px",
                  background: t.light,
                  border: `1px solid ${t.border}`,
                  borderRadius: 12,
                  color: t.mid,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Pitches Feed */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 40, color: t.muted }}>Loading pitches...</div>
      ) : filtered.length === 0 ? (
        <div style={{
          textAlign: "center",
          padding: "48px 20px",
          background: t.light,
          borderRadius: 18,
          border: `1px solid ${t.border}`,
        }}>
          <p style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 700, color: t.ink }}>
            No pitches yet
          </p>
          <p style={{ margin: 0, fontSize: 14, color: t.muted, lineHeight: 1.7 }}>
            Be the first to share your idea or investment interest.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 16 }}>
          {filtered.map((pitch) => (
            <PitchCard
              key={pitch.id}
              pitch={pitch}
              t={t}
              isOwn={pitch.user_id === user?.id}
              onConnect={(p) => {
                if (connected.has(p.id)) return;
                handleConnect(p);
              }}
            />
          ))}
        </div>
      )}

      {/* Connected notification */}
      {connected.size > 0 && (
        <div style={{
          position: "fixed",
          bottom: 80,
          left: "50%",
          transform: "translateX(-50%)",
          background: t.green,
          color: "#fff",
          padding: "12px 24px",
          borderRadius: 12,
          fontSize: 14,
          fontWeight: 600,
          boxShadow: S.lg,
          zIndex: 200,
        }}>
          Connection interest sent! 🤝
        </div>
      )}
    </div>
  );
}

import { useState, useRef, useEffect } from "react";
import { C } from "../systems/theme";
import { Ic } from "../icons/Ic";
import { FinanceChart } from "./Charts";
import { AudioPlayer } from "./AudioPlayer";
import { FINANCE_KEYS, MAP } from "../data/content";
import { computeEssentialScore } from "../data/tailoring";

export function FinanceDisclaimer({ t: theme } = {}) {
  const t = theme || C;
  return (
    <div
      style={{
        margin: "32px 0 0",
        padding: "18px 20px",
        background: t.white,
        border: `1px solid ${t.border}`,
        borderRadius: 10,
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: 12,
          color: t.muted,
          lineHeight: 1.8,
          fontFamily: "Georgia,serif",
          fontStyle: "italic",
        }}
      >
        The content presented here is intended solely for general informational
        and educational purposes. It does not constitute financial advice,
        investment advice, or any form of professional financial guidance. All
        financial activity involves risk. Life. strongly encourages all readers
        to seek independent, qualified financial advice before acting on any
        information contained in this app.
      </p>
    </div>
  );
}

export function NotesTab({
  noteInput,
  setNoteInput,
  noteSaved,
  setNoteSaved,
  saveNote,
  shareNote,
  play,
  selContent,
  t: theme,
}) {
  const t = theme || C;
  const [showShare, setShowShare] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyNotes = () => {
    if (!noteInput.trim()) return;
    navigator.clipboard
      ?.writeText(noteInput)
      .then(() => {
        setCopied(true);
        play("ok");
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        const ta = document.createElement("textarea");
        ta.value = noteInput;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
        setCopied(true);
        play("ok");
        setTimeout(() => setCopied(false), 2000);
      });
  };

  const shareVia = (method) => {
    play("ok");
    const text = `${selContent?.title ? `"${selContent.title}"\n\n` : ""}${noteInput}`;
    if (method === "postit") {
      shareNote();
      setShowShare(false);
    } else if (method === "native") {
      if (navigator.share) {
        navigator.share({ title: selContent?.title || "My Notes", text }).catch(() => {
          // Ignore aborted share sheets so the note composer stays quiet.
        });
      } else {
        navigator.clipboard?.writeText(text);
        alert("Copied to clipboard — paste anywhere to share.");
      }
      setShowShare(false);
    } else if (method === "whatsapp") {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
      setShowShare(false);
    } else if (method === "twitter") {
      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(text.slice(0, 240))}`,
        "_blank",
      );
      setShowShare(false);
    } else if (method === "copy") {
      navigator.clipboard?.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      setShowShare(false);
    }
  };

  const ShareIcon = () => (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
      <polyline points="16,6 12,2 8,6" />
      <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
  );

  return (
    <div
      style={{
        padding:
          "24px max(16px, env(safe-area-inset-left, 0px)) 32px max(16px, env(safe-area-inset-right, 0px))",
        maxWidth: 660,
        margin: "0 auto",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 6,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <h2
          style={{
            margin: 1,
            fontSize: "clamp(1.35rem, 5vw, 2rem)",
            fontWeight: 800,
            color: t.ink,
            fontFamily: "Georgia,serif",
            lineHeight: 1.15,
          }}
        >
          Your Notes:
        </h2>
        <button
          onClick={copyNotes}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: copied ? t.greenLt : t.white,
            border: `1.5px solid ${copied ? t.green : t.border}`,
            borderRadius: 15,
            padding: "10px 16px",
            color: copied ? t.green : t.mid,
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "Georgia,serif",
            flexShrink: 0,
            marginTop: 8,
            transition: "all 0.2s",
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
          </svg>
          {copied ? "Copied!" : "Copy Notes"}
        </button>
      </div>
      <p
        style={{
          margin: "0 0 15px",
          fontSize: 13,
          color: t.muted,
          fontStyle: "italic",
          fontFamily: "Georgia,serif",
          lineHeight: 1.55,
          paddingLeft: 12,
          borderLeft: `3px solid ${t.border}`,
        }}
      >
        "You never fail, until you stop trying."
      </p>
      <textarea
        value={noteInput}
        onChange={(e) => {
          setNoteInput(e.target.value);
          setNoteSaved(false);
        }}
        placeholder="Start writing..."
        style={{
          width: "100%",
          minHeight: 200,
          maxHeight: "min(55vh, 480px)",
          background: t.white,
          border: `1.5px solid ${t.border}`,
          borderRadius: 12,
          padding: "16px 18px",
          color: t.ink,
          fontSize: 16,
          lineHeight: 1.9,
          outline: "none",
          resize: "vertical",
          fontFamily: "Georgia,serif",
          boxSizing: "border-box",
        }}
      />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: 14,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <button
            onClick={saveNote}
            style={{
              background: "#6FBE77",
              border: "none",
              borderRadius: 10,
              padding: "12px 26px",
              color: t.white,
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "Georgia,serif",
            }}
          >
            Save Note
          </button>
          {noteSaved && (
            <span style={{ color: t.muted, fontSize: 13, fontStyle: "italic" }}>
              Saved.
            </span>
          )}
        </div>
        <button
          onClick={() => setShowShare(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            background: t.white,
            border: `1.5px solid ${t.border}`,
            borderRadius: 10,
            padding: "12px 18px",
            color: t.mid,
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "Georgia,serif",
          }}
        >
          <ShareIcon /> Share My Notes
        </button>
      </div>
      {showShare && (
        <>
          <div
            onClick={() => setShowShare(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.4)",
              zIndex: 200,
              backdropFilter: "blur(2px)",
            }}
          />
          <div
            style={{
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 201,
              background: t.white,
              borderRadius: "20px 20px 0 0",
              padding: "8px 0 32px",
              boxShadow: "0 -8px 40px rgba(0,0,0,0.18)",
            }}
          >
            <div
              style={{
                width: 36,
                height: 4,
                borderRadius: 2,
                background: t.border,
                margin: "10px auto 20px",
              }}
            />
            <p
              style={{
                margin: "0 0 18px",
                textAlign: "center",
                fontSize: 13,
                color: t.muted,
                fontFamily: "Georgia,serif",
                fontStyle: "italic",
                paddingBottom: 14,
                borderBottom: `1px solid ${t.light}`,
              }}
            >
              Share your notes
            </p>
            <div
              className="life-share-sheet-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4,1fr)",
                gap: 8,
                padding: "0 20px calc(20px + env(safe-area-inset-bottom, 0px))",
              }}
            >
              {[
                {
                  id: "native",
                  label: "Share",
                  icon: (
                    <svg
                      width="26"
                      height="26"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={t.green}
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
                      <polyline points="16,6 12,2 8,6" />
                      <line x1="12" y1="2" x2="12" y2="15" />
                    </svg>
                  ),
                  bg: "#eaf3ec",
                },
                {
                  id: "postit",
                  label: "Post-It",
                  icon: (
                    <svg
                      width="26"
                      height="26"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#4a8c5c"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  ),
                  bg: "#eaf3ec",
                },
                {
                  id: "whatsapp",
                  label: "WhatsApp",
                  icon: (
                    <svg
                      width="26"
                      height="26"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#25D366"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
                    </svg>
                  ),
                  bg: "#f0fdf4",
                },
                {
                  id: "twitter",
                  label: "Twitter / X",
                  icon: (
                    <svg
                      width="26"
                      height="26"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#1DA1F2"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                    </svg>
                  ),
                  bg: "#e8f5fe",
                },
                {
                  id: "copy",
                  label: "Copy Text",
                  icon: (
                    <svg
                      width="26"
                      height="26"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={t.muted}
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="9" y="9" width="13" height="13" rx="2" />
                      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                    </svg>
                  ),
                  bg: t.light,
                },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => shareVia(opt.id)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 8,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "10px 4px",
                  }}
                >
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 14,
                      background: opt.bg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                    }}
                  >
                    {opt.icon}
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      color: t.mid,
                      fontFamily: "Georgia,serif",
                      textAlign: "center",
                      lineHeight: 1.3,
                    }}
                  >
                    {opt.label}
                  </span>
                </button>
              ))}
            </div>
            <div style={{ padding: "0 20px" }}>
              <button
                onClick={() => setShowShare(false)}
                style={{
                  width: "100%",
                  background: t.light,
                  border: "none",
                  borderRadius: 12,
                  padding: "15px",
                  color: t.mid,
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "Georgia,serif",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function getParchmentBackground(t) {
  const base =
    t.ink === C.ink
      ? "linear-gradient(180deg, #fbf5ea 0%, #f3ead8 100%)"
      : "linear-gradient(180deg, #3b3128 0%, #2a221c 100%)";
  const glow =
    t.ink === C.ink
      ? "radial-gradient(circle at 18% 14%, rgba(255,255,255,0.35) 0, rgba(255,255,255,0) 40%)"
      : "radial-gradient(circle at 18% 14%, rgba(255,231,205,0.08) 0, rgba(255,231,205,0) 40%)";
  const fibers =
    t.ink === C.ink
      ? "repeating-linear-gradient(125deg, rgba(120,89,56,0.035) 0 2px, rgba(255,255,255,0) 2px 10px)"
      : "repeating-linear-gradient(125deg, rgba(246,214,187,0.03) 0 2px, rgba(0,0,0,0) 2px 10px)";
  return `${glow}, ${fibers}, ${base}`;
}

function ReaderInlineVisual({ selKey, title, t }) {
  if (FINANCE_KEYS.includes(selKey)) {
    return <FinanceChart topicKey={selKey} t={t} />;
  }

  const cards = {
    communication: {
      title: "Conversation flow",
      body: "Open with presence, listen longer than you speak, then answer with clarity.",
      points: ["Presence", "Listening", "Response"],
    },
    psychology: {
      title: "Thought loop",
      body: "Belief shapes attention, attention shapes behaviour, and behaviour reinforces belief.",
      points: ["Belief", "Attention", "Behaviour"],
    },
    philosophy: {
      title: "Idea ladder",
      body: "Observation becomes reflection, reflection becomes principle, principle becomes action.",
      points: ["Observe", "Reflect", "Act"],
    },
    business: {
      title: "Business system",
      body: "A durable business compounds when value, trust, and distribution reinforce each other.",
      points: ["Value", "Trust", "Distribution"],
    },
  };

  const parentLabel = String(MAP[selKey]?.path?.[0] || "").toLowerCase();
  const family =
    ["communication", "psychology", "philosophy", "business"].find((candidate) =>
      parentLabel.includes(candidate),
    ) || "psychology";
  const card = cards[family];

  return (
    <div
      style={{
        margin: "30px 0",
        padding: "20px 18px",
        borderRadius: 18,
        background: t.white,
        border: `1px solid ${t.border}`,
        boxShadow: "0 10px 24px rgba(20,20,20,0.08)",
      }}
    >
      <p
        style={{
          margin: "0 0 10px",
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: 2.2,
          textTransform: "uppercase",
          color: t.green,
          fontFamily: "Georgia,serif",
        }}
      >
        Inline visual
      </p>
      <h3
        style={{
          margin: "0 0 8px",
          fontSize: 18,
          color: t.ink,
          fontFamily: "Georgia,serif",
        }}
      >
        {card.title}
      </h3>
      <p
        style={{
          margin: "0 0 18px",
          color: t.mid,
          fontSize: 14,
          lineHeight: 1.75,
          fontFamily: "Georgia,serif",
        }}
      >
        {card.body}
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
        {card.points.map((point, idx) => (
          <div
            key={point}
            style={{
              minHeight: 82,
              borderRadius: 14,
              background: idx === 1 ? t.greenLt : t.light,
              border: `1px solid ${idx === 1 ? `${t.green}44` : t.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "10px 8px",
              textAlign: "center",
              color: idx === 1 ? t.green : t.mid,
              fontSize: 13,
              fontWeight: 700,
              lineHeight: 1.4,
              fontFamily: "Georgia,serif",
            }}
          >
            {point}
          </div>
        ))}
      </div>
      <p
        style={{
          margin: "14px 0 0",
          color: t.muted,
          fontSize: 11,
          fontStyle: "italic",
          lineHeight: 1.6,
          textAlign: "center",
          fontFamily: "Georgia,serif",
        }}
      >
        {title}
      </p>
    </div>
  );
}

export function EbookReader({
  selKey,
  selContent,
  tab,
  setTab,
  isBookmarked,
  toggleBk,
  play,
  noteInput,
  setNoteInput,
  noteSaved,
  setNoteSaved,
  saveNote,
  shareNote,
  related,
  handleSelect,
  bookmarks,
  allContent,
  profile,
  savedReaderPage = 0,
  onReaderPageSave,
  t: theme,
}) {
  const t = theme || C;
  const PARAS = 4;
  const paragraphs = (selContent?.text || "").split("\n\n").filter((p) => p.trim());
  const chapterInfo = MAP[selKey] || null;
  const chapterParent =
    chapterInfo?.path?.[chapterInfo.path.length - 1] || "Life.";
  const showTitlePage = Boolean(chapterInfo?.path?.length);
  const contentPages = Math.max(1, Math.ceil(paragraphs.length / PARAS));
  const totalPages = contentPages + (showTitlePage ? 1 : 0);
  const [pageNum, setPageNum] = useState(0);
  const [anim, setAnim] = useState(null);
  const pageRef = useRef(null);
  const sx = useRef(null);

  useEffect(() => {
    const contentPage = Math.max(0, Math.min(savedReaderPage ?? 0, contentPages - 1));
    setPageNum(showTitlePage ? contentPage + 1 : contentPage);
    setAnim(null);
  }, [contentPages, savedReaderPage, selKey, showTitlePage]);

  const commitPage = (n) => {
    const clamped = Math.max(0, Math.min(n, totalPages - 1));
    setPageNum(clamped);
    if (selKey && onReaderPageSave) {
      onReaderPageSave(selKey, Math.max(0, clamped - (showTitlePage ? 1 : 0)));
    }
  };

  const scrollToTopOfPage = () => {
    if (pageRef.current) pageRef.current.scrollTop = 0;
    const mainScroll = document.querySelector(".life-main-scroll");
    if (mainScroll && typeof mainScroll.scrollTo === "function") {
      mainScroll.scrollTo({ top: 0, behavior: "auto" });
    } else if (mainScroll) {
      mainScroll.scrollTop = 0;
    }
    if (typeof window !== "undefined" && window.scrollTo) {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  };

  const turn = (dir) => {
    const next = pageNum + dir;
    if (next < 0 || next >= totalPages) return;
    play(dir > 0 ? "pageturn_next" : "pageturn_prev");
    setAnim(dir > 0 ? "l" : "r");
    setTimeout(() => {
      commitPage(next);
      setAnim(null);
      scrollToTopOfPage();
    }, 160);
  };

  const onTS = (e) => {
    sx.current = e.touches[0].clientX;
  };

  const onTE = (e) => {
    if (sx.current === null) return;
    const dx = e.changedTouches[0].clientX - sx.current;
    if (Math.abs(dx) > 50) turn(dx < 0 ? 1 : -1);
    sx.current = null;
  };

  const contentPageNum = showTitlePage ? Math.max(0, pageNum - 1) : pageNum;
  const globalStart = contentPageNum * PARAS;
  const cur =
    showTitlePage && pageNum === 0
      ? []
      : paragraphs.slice(globalStart, (contentPageNum + 1) * PARAS);
  const isFirst = pageNum === 0;
  const isLast = pageNum === totalPages - 1;
  const animStyle = anim
    ? {
        opacity: 0,
        transform: anim === "l" ? "translateX(-18px)" : "translateX(18px)",
        transition: "opacity 0.15s,transform 0.15s",
      }
    : {
        opacity: 1,
        transform: "translateX(0)",
        transition: "opacity 0.18s,transform 0.18s",
      };
  if (!selContent) return null;
  const throughPct = Math.round(((pageNum + 1) / totalPages) * 100);

  return (
    <div style={{ display: "flex", flexDirection: "column", position: "relative" }}>
      <div
        className="life-reader-toolbar"
        style={{
          display: "flex",
          borderBottom: `1px solid ${t.border}`,
          background: t.white,
          padding: "0 12px",
          overflowX: "auto",
          flexShrink: 0,
          alignItems: "center",
          gap: 4,
        }}
      >
        {[
          { id: "content", label: "Read" },
          { id: "notes", label: "Notes" },
          { id: "suggestions", label: "Related" },
          { id: "saved", label: "Saved" },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setTab(item.id);
            }}
            style={{
              padding: "17px 14px",
              background: "none",
              border: "none",
              borderBottom:
                tab === item.id ? `2px solid ${t.green}` : "2px solid transparent",
              color: tab === item.id ? t.green : t.muted,
              fontSize: 13,
              fontWeight: tab === item.id ? 700 : 400,
              cursor: "pointer",
              fontFamily: "Georgia,serif",
              whiteSpace: "nowrap",
            }}
          >
            {item.label}
          </button>
        ))}
        <div
          className="life-reader-toolbar-actions"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            marginLeft: "auto",
            flexShrink: 0,
          }}
        >
          <button
            className="life-reader-star-btn"
            type="button"
            onClick={toggleBk}
            aria-label={isBookmarked ? "Remove bookmark" : "Save bookmark"}
            title={isBookmarked ? "Remove bookmark" : "Save bookmark"}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: isBookmarked ? t.gold : t.border,
              fontSize: 28,
              padding: 0,
              width: 44,
              height: 44,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              lineHeight: 1,
              flexShrink: 0,
            }}
          >
            {isBookmarked ? Ic.starFilled() : Ic.star()}
          </button>
        </div>
      </div>

      {tab === "content" && (
        <>
          <div
            style={{
              maxWidth: 640,
              margin: "0 auto",
              width: "100%",
              padding: "14px 20px 0",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                marginBottom: 6,
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: t.green,
                  fontFamily: "Georgia,serif",
                  letterSpacing: 0.5,
                  lineHeight: 1,
                }}
              >
                {throughPct}%
              </span>
            </div>
            <div
              style={{
                height: 4,
                background: t.light,
                borderRadius: 99,
                overflow: "hidden",
                boxShadow: "inset 0 1px 2px rgba(0,0,0,0.06)",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${((pageNum + 1) / totalPages) * 100}%`,
                  background: `linear-gradient(90deg,${t.green},#6FBE77)`,
                  borderRadius: 99,
                  transition: "width 0.45s cubic-bezier(0.22,1,0.36,1)",
                  boxShadow: "0 0 12px rgba(74,140,92,0.35)",
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                marginTop: 6,
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: t.muted,
                  fontFamily: "Georgia,serif",
                  letterSpacing: 0.5,
                  lineHeight: 1,
                }}
              >
                {showTitlePage && isFirst ? "Title page" : `${pageNum + 1}/${totalPages}`}
              </span>
            </div>
          </div>

          <div style={{ position: "relative", maxWidth: 640, margin: "0 auto", width: "100%" }}>
            <div
              ref={pageRef}
              onTouchStart={onTS}
              onTouchEnd={onTE}
              className="life-reader-parchment"
              style={{
                overflowY: "auto",
                padding:
                  "40px max(16px, env(safe-area-inset-right, 0px)) max(28px, env(safe-area-inset-bottom, 0px)) max(16px, env(safe-area-inset-left, 0px))",
                boxSizing: "border-box",
                background: getParchmentBackground(t),
                border: `1px solid ${t.border}`,
                borderRadius: 24,
                boxShadow: "0 14px 32px rgba(20,20,20,0.12)",
              }}
            >
              {showTitlePage && isFirst ? (
                <div
                  data-page-tag={`${selKey}_title_page`}
                  style={{
                    minHeight: "62vh",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    padding: "20px 8px",
                    gap: 14,
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontSize: 11,
                      letterSpacing: "0.34em",
                      textTransform: "uppercase",
                      color: t.muted,
                      fontWeight: 700,
                      fontFamily: "Georgia,serif",
                    }}
                  >
                    {selContent.title}
                  </p>
                  <h1
                    style={{
                      margin: 0,
                      fontSize: "clamp(2rem, 7vw, 3.4rem)",
                      lineHeight: 1.08,
                      color: t.ink,
                      fontWeight: 700,
                      fontFamily: "Georgia,serif",
                      textWrap: "balance",
                    }}
                  >
                    {chapterParent}
                  </h1>
                </div>
              ) : (
                <>
                  {!showTitlePage && isFirst && (
                    <div style={{ marginBottom: 40 }}>
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 8,
                          marginBottom: 18,
                          alignItems: "center",
                        }}
                      >
                        {selContent?.emoji && (
                          <span style={{ fontSize: 28, lineHeight: 1 }} aria-hidden>
                            {selContent.emoji}
                          </span>
                        )}
                        {selContent?.readTime && (
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              letterSpacing: 1.2,
                              textTransform: "uppercase",
                              color: t.muted,
                              background: t.light,
                              padding: "5px 10px",
                              borderRadius: 20,
                              border: `1px solid ${t.border}`,
                            }}
                          >
                            {selContent.readTime}
                          </span>
                        )}
                        {selContent?.level && (
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              letterSpacing: 1.2,
                              textTransform: "uppercase",
                              color: t.green,
                              background: t.greenLt,
                              padding: "5px 10px",
                              borderRadius: 20,
                              border: `1px solid rgba(74,140,92,0.35)`,
                            }}
                          >
                            {selContent.level}
                          </span>
                        )}
                      </div>
                      {profile &&
                        (() => {
                          const score = computeEssentialScore(selKey, profile);
                          if (score === null) return null;
                          const pct = Math.round(score * 100);
                          const col = pct >= 70 ? "#6FBE77" : pct >= 40 ? t.gold : t.muted;
                          return (
                            <div
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 7,
                                background: `${col}18`,
                                border: `1px solid ${col}`,
                                borderRadius: 20,
                                padding: "4px 12px 4px 8px",
                                marginBottom: 16,
                              }}
                            >
                              <svg
                                width="13"
                                height="13"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke={col}
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
                              </svg>
                              <span
                                style={{
                                  fontSize: 11,
                                  fontWeight: 700,
                                  color: col,
                                  fontFamily: "Georgia,serif",
                                  letterSpacing: 0.4,
                                }}
                              >
                                Essential For Growth — {pct}%
                              </span>
                            </div>
                          );
                        })()}
                      <h1
                        style={{
                          fontSize: 28,
                          fontWeight: 800,
                          margin: 0,
                          letterSpacing: -0.6,
                          color: t.ink,
                          lineHeight: 1.25,
                          fontFamily: "Georgia,serif",
                          borderBottom: `2px solid ${t.border}`,
                          paddingBottom: 24,
                          textWrap: "balance",
                        }}
                      >
                        {selContent.title}
                      </h1>
                    </div>
                  )}

                  {!isFirst && (
                    <p
                      style={{
                        margin: "0 0 32px",
                        fontSize: 11,
                        color: t.muted,
                        fontWeight: 700,
                        letterSpacing: 2.5,
                        textTransform: "uppercase",
                        fontFamily: "Georgia,serif",
                      }}
                    >
                      {selContent.title}
                    </p>
                  )}

                  <div style={animStyle}>
                    {cur.map((para, i) => {
                      const globalIndex = globalStart + i;
                      const shouldShowInlineVisual =
                        i === Math.max(1, Math.floor(cur.length / 2)) &&
                        globalIndex >= Math.max(1, Math.floor(paragraphs.length / 3)) &&
                        globalIndex < Math.max(2, paragraphs.length - 2);

                      return (
                        <div key={i} className="life-reader-quote-row" style={{ marginBottom: 24 }}>
                          <p
                            style={{
                              margin: "0 0 10px",
                              color: t.mid,
                              fontSize: 17,
                              lineHeight: 2,
                              fontFamily: "Georgia,serif",
                            }}
                            dangerouslySetInnerHTML={{
                              __html: para.replaceAll(
                                /\*\*(.*?)\*\*/g,
                                `<strong style="color:${t.ink};font-weight:700">$1</strong>`,
                              ),
                            }}
                          />
                          {shouldShowInlineVisual && (
                            <ReaderInlineVisual selKey={selKey} title={selContent.title} t={t} />
                          )}
                        </div>
                      );
                    })}

                    {isLast && (
                      <>
                        <AudioPlayer title={selContent.title} playSound={play} />
                        {FINANCE_KEYS.includes(selKey) && <FinanceDisclaimer t={t} />}
                      </>
                    )}
                  </div>
                </>
              )}

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginTop: 48,
                  paddingTop: 24,
                  borderTop: `1px solid ${t.light}`,
                }}
              >
                <button
                  onClick={() => turn(-1)}
                  disabled={pageNum === 0}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    background: "none",
                    border: `1px solid ${pageNum === 0 ? t.light : "#6FBE77"}`,
                    borderRadius: 10,
                    padding: "12px 20px",
                    cursor: pageNum === 0 ? "default" : "pointer",
                    color: pageNum === 0 ? t.light : "#4a8c5c",
                    fontSize: 13,
                    fontFamily: "Georgia,serif",
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12">
                    <polyline
                      points="9,2 3,6 9,10"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Previous
                </button>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        if (i !== pageNum) {
                          play(i > pageNum ? "pageturn_next" : "pageturn_prev");
                          commitPage(i);
                          scrollToTopOfPage();
                        }
                      }}
                      style={{
                        width: i === pageNum ? 22 : 7,
                        height: 7,
                        borderRadius: 4,
                        background: i === pageNum ? t.green : t.border,
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                        transition: "all 0.2s",
                      }}
                    />
                  ))}
                </div>
                <button
                  onClick={() => turn(1)}
                  disabled={isLast}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    background: isLast ? "none" : "#6FBE77",
                    border: `1px solid ${isLast ? t.light : "#6FBE77"}`,
                    borderRadius: 10,
                    padding: "12px 20px",
                    cursor: isLast ? "default" : "pointer",
                    color: isLast ? t.light : t.white,
                    fontSize: 13,
                    fontFamily: "Georgia,serif",
                    fontWeight: isLast ? 400 : 700,
                  }}
                >
                  Next
                  <svg width="12" height="12" viewBox="0 0 12 12">
                    <polyline
                      points="3,2 9,6 3,10"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
              <p
                style={{
                  textAlign: "center",
                  margin: "16px 0 0",
                  fontSize: 11,
                  color: t.muted,
                  fontStyle: "italic",
                  fontFamily: "Georgia,serif",
                }}
              >
                {showTitlePage && isFirst
                  ? "Title page"
                  : `Page ${pageNum + 1} of ${totalPages}`}
              </p>
            </div>
          </div>
        </>
      )}

      {tab === "notes" && (
        <NotesTab
          t={t}
          noteInput={noteInput}
          setNoteInput={setNoteInput}
          noteSaved={noteSaved}
          setNoteSaved={setNoteSaved}
          saveNote={saveNote}
          shareNote={shareNote}
          play={play}
          selContent={selContent}
        />
      )}

      {tab === "suggestions" && (
        <div
          style={{
            padding: "40px 28px",
            maxWidth: 660,
            margin: "0 auto",
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          <h3 style={{ margin: "0 0 10px", fontSize: 22, fontWeight: 700, color: t.ink }}>
            Related Topics
          </h3>
          {related.length === 0 ? (
            <p style={{ color: t.border, fontSize: 15, fontStyle: "italic" }}>
              No related topics.
            </p>
          ) : (
            related.map((item) => (
              <button
                key={item.key}
                onClick={() => handleSelect(item.key, item.node)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  width: "100%",
                  background: t.white,
                  border: `1px solid ${t.border}`,
                  borderRadius: 12,
                  padding: "16px 18px",
                  cursor: "pointer",
                  marginBottom: 12,
                  textAlign: "left",
                  fontFamily: "Georgia,serif",
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 10,
                    background: t.greenLt,
                    border: `1px solid ${t.border}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {Ic[item.node.icon]
                    ? Ic[item.node.icon]("none", "#4a8c5c", 20)
                    : Ic.book("none", "#4a8c5c", 20)}
                </div>
                <div style={{ flex: 1, fontSize: 15, fontWeight: 600, color: t.ink }}>
                  {item.node.label}
                </div>
              </button>
            ))
          )}
        </div>
      )}

      {tab === "saved" && (
        <div
          style={{
            padding: "40px 28px",
            maxWidth: 660,
            margin: "0 auto",
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          <h3 style={{ margin: "0 0 10px", fontSize: 22, fontWeight: 700, color: t.ink }}>
            Saved Library
          </h3>
          <p
            style={{
              margin: "0 0 18px",
              fontSize: 14,
              color: t.muted,
              fontFamily: "Georgia,serif",
              lineHeight: 1.7,
            }}
          >
            Return to topics you've bookmarked. Tap the ☆ while reading to save a topic here.
          </p>
          <div style={{ display: "grid", gap: 24 }}>
            <section>
              <h4 style={{ margin: "0 0 12px", fontSize: 17, fontWeight: 700, color: t.ink }}>
                Saved topics
              </h4>
              {bookmarks.length === 0 ? (
                <p style={{ color: t.border, fontSize: 15, fontStyle: "italic" }}>
                  Tap ☆ while reading to save a topic.
                </p>
              ) : (
                allContent
                  .filter((item) => bookmarks.includes(item.key))
                  .map((item) => (
                    <button
                      key={item.key}
                      onClick={() => handleSelect(item.key, item.node)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        width: "100%",
                        background: t.white,
                        border: `1px solid ${t.border}`,
                        borderRadius: 12,
                        padding: "16px 18px",
                        cursor: "pointer",
                        marginBottom: 10,
                        textAlign: "left",
                        fontFamily: "Georgia,serif",
                      }}
                    >
                      <div
                        style={{
                          width: 42,
                          height: 42,
                          borderRadius: 10,
                          background: t.greenLt,
                          border: `1px solid ${t.border}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        {Ic[item.node.icon]
                          ? Ic[item.node.icon]("none", "#4a8c5c", 20)
                          : Ic.book("none", "#4a8c5c", 20)}
                      </div>
                      <div style={{ flex: 1, fontSize: 15, fontWeight: 600, color: t.ink }}>
                        {item.node.label}
                      </div>
                    </button>
                  ))
              )}
            </section>
          </div>
        </div>
      )}
    </div>
  );
}

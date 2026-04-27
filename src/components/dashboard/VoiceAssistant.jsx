import { useState, useEffect, useRef } from "react";

const FONT = "-apple-system,'SF Pro Display','SF Pro Text','Helvetica Neue',Arial,sans-serif";

function parseCommand(text) {
  const lower = text.toLowerCase();
  if (lower.includes("organize") || lower.includes("todo") || lower.includes("task")) return "organize";
  if (lower.includes("quiz")) return "quiz";
  if (lower.includes("progress") || lower.includes("reading")) return "progress_dashboard";
  if (lower.includes("timer") || lower.includes("focus")) return "focus_timer";
  if (lower.includes("home")) return "home";
  if (lower.includes("post") || lower.includes("note")) return "post_it";
  return null;
}

const DEST_LABELS = {
  organize: "Organize",
  quiz: "Quiz",
  progress_dashboard: "Reading Progress",
  focus_timer: "Focus Timer",
  home: "Home",
  post_it: "Post-It Notes",
};

export function VoiceAssistant({ t, play, isOpen, onClose, displayName, onNavigate }) {
  const [status, setStatus] = useState("idle"); // idle | listening | processing | confirming | error | unsupported
  const [transcript, setTranscript] = useState("");
  const [pendingPage, setPendingPage] = useState(null);
  const [mounted, setMounted] = useState(false);
  const recognitionRef = useRef(null);
  const statusRef = useRef(status);
  useEffect(() => { statusRef.current = status; }, [status]);

  useEffect(() => {
    if (!isOpen) return;
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setMounted(false);
      setTranscript("");
      setStatus("idle");
      setPendingPage(null);
      stopRecognition();
      return;
    }

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setStatus("unsupported");
      return;
    }

    // Abort any existing instance before creating a new one
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch { /* ignore */ }
      recognitionRef.current = null;
    }

    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognitionRef.current = recognition;

    recognition.onstart = () => setStatus("listening");

    recognition.onresult = (e) => {
      const result = Array.from(e.results)
        .map((r) => r[0].transcript)
        .join(" ");
      setTranscript(result);

      const isFinal = e.results[e.results.length - 1].isFinal;
      if (isFinal) {
        setStatus("processing");
        const page = parseCommand(result);
        if (page) {
          setPendingPage(page);
          setStatus("confirming");
          play?.("ok");
        } else {
          setStatus("error");
          setTimeout(() => setStatus("idle"), 2000);
        }
      }
    };

    recognition.onerror = (e) => {
      if (e.error === "not-allowed" || e.error === "permission-denied") {
        setStatus("error");
        setTranscript("Microphone access was denied. Please allow microphone permission.");
      } else if (e.error === "no-speech") {
        setStatus("idle");
      } else {
        setStatus("error");
        setTimeout(() => setStatus("idle"), 2000);
      }
    };

    recognition.onend = () => {
      if (statusRef.current === "listening") setStatus("idle");
    };

    return () => {
      stopRecognition();
    };
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  function stopRecognition() {
    try {
      recognitionRef.current?.stop();
      recognitionRef.current?.abort();
    } catch {
      // ignore
    }
    recognitionRef.current = null;
  }

  function startListening() {
    if (!recognitionRef.current) return;
    setTranscript("");
    setPendingPage(null);
    try {
      recognitionRef.current.start();
      play?.("tap");
    } catch {
      // already started
    }
  }

  function handleConfirm() {
    if (pendingPage) {
      play?.("ok");
      onNavigate?.(pendingPage);
      onClose();
    }
  }

  function handleDeny() {
    play?.("back");
    setPendingPage(null);
    setTranscript("");
    setStatus("idle");
  }

  const statusMessages = {
    idle: displayName?.trim() ? `Hi ${displayName.trim().split(" ")[0]}. Tap the mic and speak.` : "Tap the mic and speak.",
    listening: "Listening...",
    processing: "Got it — working on that...",
    confirming: pendingPage ? `I'll take you to ${DEST_LABELS[pendingPage] || pendingPage}. Shall I proceed?` : "",
    error: transcript || "Sorry, I didn't catch that. Try again.",
    unsupported: "Voice input isn't supported in this browser.",
  };

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        @keyframes mic-pulse {
          0%, 100% { box-shadow: 0 0 0 0 ${t.green}60; }
          50% { box-shadow: 0 0 0 16px ${t.green}00; }
        }
        .voice-mic-active { animation: mic-pulse 1.5s ease-in-out infinite; }
        @keyframes voice-slide-up {
          from { transform: translateY(100%); opacity: 0.6; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>

      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          zIndex: 900,
          opacity: mounted ? 1 : 0,
          transition: "opacity 0.28s ease",
        }}
      />

      {/* Sheet */}
      <div
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          maxHeight: "70dvh",
          background: t.white,
          borderRadius: "22px 22px 0 0",
          borderTop: `1px solid ${t.border}`,
          zIndex: 901,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          animation: mounted ? "voice-slide-up 0.38s cubic-bezier(0.34,1.1,0.64,1) both" : "none",
          paddingBottom: "calc(20px + env(safe-area-inset-bottom, 0px))",
        }}
      >
        {/* Drag handle */}
        <div style={{ width: 40, height: 5, borderRadius: 999, background: t.border, margin: "12px auto 0" }} />

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px 0" }}>
          <p style={{ margin: 0, fontSize: 17, fontWeight: 600, color: t.ink, fontFamily: FONT, letterSpacing: "-0.01em" }}>
            Voice Assistant
          </p>
          <button
            type="button"
            onClick={() => { play?.("back"); onClose(); }}
            style={{
              background: "rgba(120,120,128,0.16)",
              border: "none",
              borderRadius: "50%",
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              WebkitTapHighlightColor: "transparent",
              flexShrink: 0,
            }}
            aria-label="Close voice assistant"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke={t.muted} strokeWidth="2" strokeLinecap="round">
              <line x1="1" y1="1" x2="11" y2="11" />
              <line x1="11" y1="1" x2="1" y2="11" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 24px", gap: 20, textAlign: "center" }}>

          {/* Mic button */}
          {status !== "unsupported" && (
            <button
              type="button"
              onClick={startListening}
              disabled={status === "listening" || status === "confirming"}
              className={status === "listening" ? "voice-mic-active" : ""}
              aria-label="Start voice recognition"
              style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: status === "listening" ? t.green : `${t.green}20`,
                border: `2px solid ${status === "listening" ? t.green : `${t.green}40`}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: status === "listening" || status === "confirming" ? "default" : "pointer",
                WebkitTapHighlightColor: "transparent",
                transition: "background 0.2s ease, border-color 0.2s ease, transform 0.15s cubic-bezier(0.34,1.56,0.64,1)",
                flexShrink: 0,
              }}
              onTouchStart={(e) => {
                if (status !== "listening" && status !== "confirming") e.currentTarget.style.transform = "scale(0.93)";
              }}
              onTouchEnd={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
              onMouseDown={(e) => {
                if (status !== "listening" && status !== "confirming") e.currentTarget.style.transform = "scale(0.93)";
              }}
              onMouseUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                stroke={status === "listening" ? "#000" : t.green}
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="2" width="6" height="12" rx="3" />
                <path d="M19 10v2a7 7 0 01-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="22" />
              </svg>
            </button>
          )}

          {/* Transcript */}
          {transcript !== "" && (
            <div style={{
              background: t.light,
              border: `1px solid ${t.border}`,
              borderRadius: 14,
              padding: "12px 16px",
              width: "100%",
              maxWidth: 320,
            }}>
              <p style={{ margin: 0, fontSize: 15, color: t.ink, fontFamily: FONT, lineHeight: 1.5 }}>
                &ldquo;{transcript}&rdquo;
              </p>
            </div>
          )}

          {/* Status */}
          <p style={{ margin: 0, fontSize: 15, color: status === "error" ? t.muted : t.ink, fontFamily: FONT, lineHeight: 1.55, maxWidth: 280 }}>
            {statusMessages[status]}
          </p>

          {/* Confirm / Deny buttons */}
          {status === "confirming" && (
            <div style={{ display: "flex", gap: 12, width: "100%", maxWidth: 280 }}>
              <button
                type="button"
                onClick={handleDeny}
                style={{
                  flex: 1,
                  height: 48,
                  borderRadius: 14,
                  background: t.light,
                  border: `1px solid ${t.border}`,
                  color: t.ink,
                  fontSize: 16,
                  fontWeight: 500,
                  fontFamily: FONT,
                  cursor: "pointer",
                  WebkitTapHighlightColor: "transparent",
                  transition: "transform 0.15s cubic-bezier(0.34,1.56,0.64,1)",
                }}
                onTouchStart={(e) => { e.currentTarget.style.transform = "scale(0.96)"; }}
                onTouchEnd={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
                onMouseDown={(e) => { e.currentTarget.style.transform = "scale(0.96)"; }}
                onMouseUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
              >
                No
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                style={{
                  flex: 1,
                  height: 48,
                  borderRadius: 14,
                  background: t.green,
                  border: "none",
                  color: "#000",
                  fontSize: 16,
                  fontWeight: 600,
                  fontFamily: FONT,
                  cursor: "pointer",
                  WebkitTapHighlightColor: "transparent",
                  boxShadow: `0 4px 12px ${t.green}40`,
                  transition: "transform 0.15s cubic-bezier(0.34,1.56,0.64,1)",
                }}
                onTouchStart={(e) => { e.currentTarget.style.transform = "scale(0.96)"; }}
                onTouchEnd={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
                onMouseDown={(e) => { e.currentTarget.style.transform = "scale(0.96)"; }}
                onMouseUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
              >
                Yes, go
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

import { useState } from "react";
import { submitSupportRequest } from "../services/emailDelivery";

function buildFaq(supportEmail) {
  return [
    [
      "How do I navigate the app?",
      "Tap the menu icon top left to open the sidebar. Browse Library folders or jump into Guided for a curated path.",
    ],
    [
      "How do I save topics?",
      "Tap the ☆ star on any reading page. All saved topics appear in the Saved section in the sidebar.",
    ],
    [
      "How do I take notes?",
      "Open any topic and tap the Notes tab. Write your thoughts and tap Save.",
    ],
    [
      "What is Post-It?",
      "The Life. community feed. Share insights, ask questions, and discuss topics with other readers.",
    ],
    [
      "What is the Quiz?",
      "Test your knowledge on Finance, Psychology, and Money. Pick easy, medium, or hard. Three formats: Multiple Choice, True/False, and Blitz.",
    ],
    [
      "What is Guided?",
      "A curated sequence designed to take you from zero understanding of money to a solid foundation.",
    ],
    [
      "Keyboard shortcuts",
      "Press / to focus search (when not typing in a field). Press ? to open this Help page. Reading progress per topic is saved automatically when you turn pages.",
    ],
    [
      "Share a topic",
      "While reading, use Copy link to get a URL with #read=topicKey. Anyone with the link can jump straight into that article after signing in.",
    ],
    [
      "Legal pages",
      "Open Privacy Policy, Terms, and Cookie Notice from Profile → Setting → Tools & Legal.",
    ],
    [
      "How do I contact support?",
      `For account or privacy help, email ${supportEmail}.`,
    ],
  ];
}

const SUPPORT_TOPICS = [
  { value: "account_access", label: "Account access" },
  { value: "privacy", label: "Privacy or data" },
  { value: "billing", label: "Premium or billing" },
  { value: "bug", label: "Bug report" },
  { value: "networking", label: "Investors & Inventors" },
  { value: "general", label: "General support" },
];

export function HelpPage({ t, supportEmail, user, play, onSystemNotify }) {
  const faq = buildFaq(supportEmail);
  const [supportForm, setSupportForm] = useState({
    category: SUPPORT_TOPICS[0].value,
    subject: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  const updateSupportField = (field, value) => {
    setSupportForm((current) => ({ ...current, [field]: value }));
  };

  const handleSupportSubmit = async (event) => {
    event.preventDefault();
    setSubmitError("");
    setSubmitSuccess("");

    const trimmedSubject = supportForm.subject.trim();
    const trimmedMessage = supportForm.message.trim();

    if (!user?.id || !user?.email) {
      setSubmitError(
        "Please sign in again before sending a support request from inside the app.",
      );
      play?.("err");
      return;
    }
    if (!trimmedSubject) {
      setSubmitError("Please add a short subject so support can triage your request.");
      play?.("err");
      return;
    }
    if (trimmedMessage.length < 12) {
      setSubmitError("Please share a little more detail so support can help properly.");
      play?.("err");
      return;
    }

    setSubmitting(true);
    try {
      const result = await submitSupportRequest({
        userId: user.id,
        email: user.email,
        displayName: user.name,
        category: supportForm.category,
        subject: trimmedSubject,
        messageText: trimmedMessage,
      });

      setSupportForm((current) => ({
        ...current,
        subject: "",
        message: "",
      }));
      setSubmitSuccess(
        `Support request received. Reference ${result.ticketId}. We also queued an acknowledgement email to ${user.email}.`,
      );
      onSystemNotify?.({
        templateKey: "supportAcknowledged",
        text: `Support request received. Reference ${result.ticketId}.`,
        targetPage: "help",
      });
      play?.("ok");
    } catch (error) {
      setSubmitError(
        String(
          error?.message ||
            "We could not submit your support request right now. Please try again shortly.",
        ),
      );
      play?.("err");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      data-page-tag="#help"
      style={{ padding: "48px 28px", maxWidth: 560, margin: "0 auto" }}
    >
      <h2
        style={{
          fontSize: 28,
          fontWeight: 700,
          color: t.ink,
          margin: "0 0 12px",
        }}
      >
        Help
      </h2>
      <p
        style={{
          color: t.muted,
          fontSize: 15,
          lineHeight: 1.8,
          margin: "0 0 32px",
          fontStyle: "italic",
        }}
      >
        Everything you need to know about using Life.
      </p>
      {faq.map(([q, a]) => (
        <div
          key={q}
          style={{
            background: t.white,
            border: `1px solid ${t.border}`,
            borderRadius: 12,
            padding: "20px 22px",
            marginBottom: 12,
          }}
        >
          <p
            style={{
              margin: "0 0 8px",
              fontSize: 15,
              fontWeight: 700,
              color: t.ink,
            }}
          >
            {q}
          </p>
          <p
            style={{
              margin: 0,
              fontSize: 14,
              color: t.mid,
              lineHeight: 1.7,
              fontFamily: "Georgia,serif",
            }}
          >
            {a}
          </p>
        </div>
      ))}
      <div
        style={{
          background: t.white,
          border: `1px solid ${t.border}`,
          borderRadius: 12,
          padding: "18px 20px",
          marginTop: 18,
        }}
      >
        <p
          style={{
            margin: "0 0 6px",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: t.green,
          }}
        >
          Support contact
        </p>
        <p
          style={{
            margin: 0,
            fontSize: 14,
            color: t.mid,
            lineHeight: 1.7,
            fontFamily: "Georgia,serif",
          }}
        >
          Need help with access, privacy, or account issues? Reach out at {" "}
          <a
            href={`mailto:${supportEmail}`}
            style={{ color: t.green, fontWeight: 700 }}
          >
            {supportEmail}
          </a>
          .
        </p>
      </div>
      <div
        style={{
          background: t.white,
          border: `1px solid ${t.border}`,
          borderRadius: 12,
          padding: "20px 20px 18px",
          marginTop: 18,
        }}
      >
        <p
          style={{
            margin: "0 0 6px",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: t.green,
          }}
        >
          In-app support request
        </p>
        <p
          style={{
            margin: "0 0 16px",
            fontSize: 14,
            color: t.mid,
            lineHeight: 1.7,
            fontFamily: "Georgia,serif",
          }}
        >
          Send your issue from inside Life. and we&apos;ll store the request, then send an acknowledgement email to {" "}
          <strong style={{ color: t.ink }}>{user?.email || supportEmail}</strong>.
        </p>

        <form onSubmit={handleSupportSubmit} style={{ display: "grid", gap: 12 }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span
              style={{ fontSize: 12, fontWeight: 700, color: t.ink }}
            >
              Topic
            </span>
            <select
              value={supportForm.category}
              onChange={(event) =>
                updateSupportField("category", event.target.value)
              }
              style={{
                minHeight: 46,
                borderRadius: 12,
                border: `1px solid ${t.border}`,
                background: t.skin,
                color: t.ink,
                padding: "0 14px",
                fontSize: 16,
                fontFamily: "Georgia,serif",
              }}
            >
              {SUPPORT_TOPICS.map((topic) => (
                <option key={topic.value} value={topic.value}>
                  {topic.label}
                </option>
              ))}
            </select>
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: t.ink }}>
              Subject
            </span>
            <input
              type="text"
              value={supportForm.subject}
              onChange={(event) =>
                updateSupportField("subject", event.target.value)
              }
              placeholder="Short summary of the issue"
              maxLength={120}
              style={{
                minHeight: 46,
                borderRadius: 12,
                border: `1px solid ${t.border}`,
                background: t.skin,
                color: t.ink,
                padding: "0 14px",
                fontSize: 16,
                fontFamily: "Georgia,serif",
                boxSizing: "border-box",
              }}
            />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: t.ink }}>
              Message
            </span>
            <textarea
              value={supportForm.message}
              onChange={(event) =>
                updateSupportField("message", event.target.value)
              }
              placeholder="Tell us what happened, what you expected, and anything you already tried."
              rows={6}
              style={{
                width: "100%",
                borderRadius: 14,
                border: `1px solid ${t.border}`,
                background: t.skin,
                color: t.ink,
                padding: "12px 14px",
                fontSize: 16,
                lineHeight: 1.6,
                fontFamily: "Georgia,serif",
                resize: "vertical",
                boxSizing: "border-box",
              }}
            />
          </label>

          {submitError ? (
            <div
              style={{
                borderRadius: 12,
                background: `${t.red}12`,
                color: t.red,
                border: `1px solid ${t.red}33`,
                padding: "12px 14px",
                fontSize: 13,
                lineHeight: 1.6,
              }}
            >
              {submitError}
            </div>
          ) : null}

          {submitSuccess ? (
            <div
              style={{
                borderRadius: 12,
                background: `${t.green}12`,
                color: t.green,
                border: `1px solid ${t.green}33`,
                padding: "12px 14px",
                fontSize: 13,
                lineHeight: 1.6,
              }}
            >
              {submitSuccess}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            style={{
              minHeight: 48,
              borderRadius: 999,
              border: "none",
              background: t.green,
              color: "#fff",
              fontSize: 15,
              fontWeight: 700,
              fontFamily: "Georgia,serif",
              cursor: submitting ? "progress" : "pointer",
              opacity: submitting ? 0.75 : 1,
            }}
          >
            {submitting ? "Sending support request..." : "Send support request"}
          </button>
        </form>
      </div>
    </div>
  );
}

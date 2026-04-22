import { useEffect, useMemo, useRef, useState } from "react";
import {
  Avatar,
  ConversationBadge,
  EmptyState,
  FeatureFrame,
  PrimaryButton,
  SecondaryButton,
  SurfaceCard,
  alpha,
} from "../InventorsInvestorsUI";

function formatTime(value) {
  if (!value) return "";
  try {
    return new Intl.DateTimeFormat("en-AU", {
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function ConversationList({ t, conversations, activeId, onOpenConversation }) {
  return (
    <SurfaceCard t={t} style={{ padding: 0, overflow: "hidden" }}>
      {conversations.map((conversation) => {
        const active = conversation.id === activeId;
        return (
          <button
            key={conversation.id}
            type="button"
            onClick={() => onOpenConversation(conversation.id)}
            style={{
              width: "100%",
              textAlign: "left",
              border: "none",
              background: active ? alpha(t.green, 0.08) : "transparent",
              padding: "14px 14px",
              borderBottom: `1px solid ${t.border}`,
              cursor: "pointer",
            }}
          >
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <Avatar
                src={conversation.participant?.avatar_url}
                name={conversation.participant?.full_name}
                size={46}
                t={t}
              />
              <div style={{ minWidth: 0, flex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 800,
                      color: t.ink,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {conversation.participant?.full_name || "Conversation"}
                  </div>
                  <ConversationBadge count={conversation.unreadCount} t={t} />
                </div>
                <div
                  style={{
                    marginTop: 4,
                    fontSize: 12,
                    color: t.mid,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {conversation.lastMessage?.message_text || "No messages yet"}
                </div>
                <div style={{ marginTop: 5, fontSize: 11, color: t.muted }}>
                  {conversation.participant?.role === "investor"
                    ? "Investor"
                    : "Inventor"}
                  {conversation.participant?.location
                    ? ` · ${conversation.participant.location}`
                    : ""}
                  {conversation.lastMessage?.created_at
                    ? ` · ${formatTime(conversation.lastMessage.created_at)}`
                    : ""}
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </SurfaceCard>
  );
}

function ThreadView({
  t,
  conversation,
  draftMessage,
  onChangeDraft,
  onSendMessage,
  sending,
  onBack,
}) {
  const messages = conversation?.messages || [];
  const scrollRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  return (
    <SurfaceCard t={t} style={{ padding: 0, overflow: "hidden" }}>
      <div
        style={{
          padding: "16px 16px",
          borderBottom: `1px solid ${t.border}`,
          display: "flex",
          gap: 12,
          alignItems: "center",
        }}
      >
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            aria-label="Back to conversations"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 20,
              color: t.ink,
              padding: "4px 8px 4px 0",
              minWidth: 36,
              minHeight: 44,
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
            }}
          >
            ←
          </button>
        ) : null}
        <Avatar
          src={conversation?.participant?.avatar_url}
          name={conversation?.participant?.full_name}
          size={44}
          t={t}
        />
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, color: t.ink }}>
            {conversation?.participant?.full_name || "Select a conversation"}
          </div>
          <div style={{ marginTop: 4, fontSize: 12, color: t.mid }}>
            {conversation?.participant?.role === "investor"
              ? "Investor"
              : "Inventor"}
            {conversation?.participant?.location
              ? ` · ${conversation.participant.location}`
              : ""}
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        style={{
          minHeight: 320,
          maxHeight: 420,
          overflowY: "auto",
          padding: "16px 16px",
          display: "grid",
          gap: 12,
          alignContent: "start",
        }}
      >
        {messages.length ? (
          messages.map((message) => {
            const mine = message.isMine;
            return (
              <div
                key={message.id}
                style={{
                  justifySelf: mine ? "end" : "start",
                  maxWidth: "86%",
                  borderRadius: 18,
                  background: mine ? t.green : t.skin,
                  color: mine ? "#ffffff" : t.ink,
                  border: mine ? "none" : `1px solid ${t.border}`,
                  padding: "12px 14px",
                }}
              >
                <div
                  style={{
                    fontSize: 14,
                    lineHeight: 1.7,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {message.message_text}
                </div>
                <div style={{ marginTop: 6, fontSize: 11, opacity: 0.78 }}>
                  {formatTime(message.created_at)}
                </div>
              </div>
            );
          })
        ) : (
          <div style={{ fontSize: 13, color: t.mid, lineHeight: 1.7 }}>
            No messages yet. Start the conversation in-app. Private phone
            numbers and emails stay hidden unless made public on the profile.
          </div>
        )}
      </div>

      <div style={{ borderTop: `1px solid ${t.border}`, padding: "14px 14px" }}>
        <textarea
          value={draftMessage}
          onChange={(event) => onChangeDraft(event.target.value)}
          placeholder="Write a message"
          style={{
            width: "100%",
            minHeight: 92,
            borderRadius: 16,
            border: `1px solid ${t.border}`,
            background: t.skin,
            color: t.ink,
            padding: "12px 14px",
            resize: "vertical",
            boxSizing: "border-box",
            outline: "none",
            fontSize: 16,
          }}
        />
        <div
          style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}
        >
          <PrimaryButton
            t={t}
            onClick={onSendMessage}
            disabled={sending || !draftMessage.trim()}
          >
            {sending ? "Sending..." : "Send"}
          </PrimaryButton>
        </div>
      </div>
    </SurfaceCard>
  );
}

export function InventorsInvestorsMessagesPage({
  t,
  conversations,
  activeConversationId,
  onOpenConversation,
  onBackToDiscovery,
  onSendMessage,
  sending,
}) {
  const activeConversation = useMemo(
    () =>
      conversations.find(
        (conversation) => conversation.id === activeConversationId,
      ) || null,
    [activeConversationId, conversations],
  );
  const [draftMessage, setDraftMessage] = useState("");

  // Reset draft when switching conversations
  useEffect(() => {
    setDraftMessage("");
  }, [activeConversationId]);

  // Mobile responsive: detect narrow screen
  const [isMobile, setIsMobile] = useState(false);
  const [mobileView, setMobileView] = useState("list"); // "list" | "thread"

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Desktop: auto-select first conversation when none selected
  useEffect(() => {
    if (!isMobile && !activeConversationId && conversations.length > 0) {
      onOpenConversation(conversations[0].id);
    }
  }, [isMobile, activeConversationId, conversations, onOpenConversation]);

  const handleOpenConversation = (id) => {
    onOpenConversation(id);
    if (isMobile) setMobileView("thread");
  };

  const handleSend = async () => {
    if (!activeConversationId) return;
    const trimmed = draftMessage.trim();
    if (!trimmed) return;
    await onSendMessage(activeConversationId, trimmed);
    setDraftMessage("");
  };

  return (
    <FeatureFrame
      t={t}
      eyebrow="Messages"
      title="Private in-app messaging"
      subtitle="Conversations stay inside Life. until either person explicitly chooses to share public contact details."
      actions={
        <SecondaryButton t={t} onClick={onBackToDiscovery}>
          Back to discovery
        </SecondaryButton>
      }
    >
      {!conversations.length ? (
        <EmptyState
          t={t}
          title="No messages yet"
          body="Start a chat from a profile card. If a conversation already exists, it will open instead of creating a duplicate."
          action={
            <SecondaryButton t={t} onClick={onBackToDiscovery}>
              Go to discovery
            </SecondaryButton>
          }
        />
      ) : isMobile ? (
        /* Mobile: single-panel view */
        mobileView === "list" ? (
          <ConversationList
            t={t}
            conversations={conversations}
            activeId={activeConversationId}
            onOpenConversation={handleOpenConversation}
          />
        ) : (
          <ThreadView
            t={t}
            conversation={activeConversation}
            draftMessage={draftMessage}
            onChangeDraft={setDraftMessage}
            onSendMessage={handleSend}
            sending={sending}
            onBack={() => setMobileView("list")}
          />
        )
      ) : (
        /* Desktop: two-column grid */
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 280px) minmax(0, 1fr)",
            gap: 14,
          }}
        >
          <ConversationList
            t={t}
            conversations={conversations}
            activeId={activeConversationId}
            onOpenConversation={handleOpenConversation}
          />
          <ThreadView
            t={t}
            conversation={activeConversation}
            draftMessage={draftMessage}
            onChangeDraft={setDraftMessage}
            onSendMessage={handleSend}
            sending={sending}
          />
        </div>
      )}
    </FeatureFrame>
  );
}

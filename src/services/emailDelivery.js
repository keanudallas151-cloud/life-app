import {
  collection,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  writeBatch,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "../firebaseClient";
import { SUPPORT_EMAIL } from "../systems/appConfig";

const MAIL_COLLECTION = "mail";
const PRIVATE_USERS_COLLECTION = "userPrivate";
const SUPPORT_REQUESTS_COLLECTION = "supportRequests";

const DEFAULT_EMAIL_PREFERENCES = {
  welcomeConfirmed: true,
  supportAcknowledgement: true,
  newMessage: true,
};

const WELCOME_CONFIRMED_TEMPLATE = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Welcome to Life.</title>
  </head>
  <body style="margin:0;padding:0;background:#f5f1e8;font-family:Georgia,'Times New Roman',serif;color:#203126;">
    <div style="max-width:640px;margin:0 auto;padding:32px 18px;">
      <div style="background:#ffffff;border:1px solid #dfd7c8;border-radius:22px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,0.06);">
        <div style="padding:28px 28px 20px;background:linear-gradient(135deg,#3d5a4c 0%,#7a8f65 100%);color:#ffffff;">
          <div style="font-size:32px;font-weight:700;line-height:1;">Life<span style="opacity:0.9;">.</span></div>
          <p style="margin:14px 0 0;font-size:15px;line-height:1.6;color:rgba(255,255,255,0.92);">Your account is confirmed. Now the fun part begins.</p>
        </div>
        <div style="padding:28px;">
          <p style="margin:0 0 16px;font-size:16px;line-height:1.7;">Hi {{displayName}},</p>
          <p style="margin:0 0 18px;font-size:16px;line-height:1.7;">Welcome to Life. Your account is fully confirmed, so you can start building momentum with reading, quizzes, community, and networking.</p>
          <ul style="margin:0 0 22px;padding-left:20px;color:#3a4c41;font-size:15px;line-height:1.8;">
            <li>Continue your reading journey</li>
            <li>Customize your account and avatar</li>
            <li>Explore Investors &amp; Inventors</li>
            <li>Track your daily growth</li>
          </ul>
          <p style="margin:0 0 24px;">
            <a href="{{actionUrl}}" style="display:inline-block;background:#3d5a4c;color:#ffffff;text-decoration:none;padding:14px 22px;border-radius:999px;font-size:15px;font-weight:700;">Open Life.</a>
          </p>
          <p style="margin:0;font-size:13px;line-height:1.7;color:#6c746d;">Need help? Reply to or contact <a href="mailto:{{supportEmail}}" style="color:#3d5a4c;">{{supportEmail}}</a>.</p>
        </div>
      </div>
    </div>
  </body>
</html>`;

const SUPPORT_ACKNOWLEDGEMENT_TEMPLATE = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>We received your Life. support request</title>
  </head>
  <body style="margin:0;padding:0;background:#f5f1e8;font-family:Georgia,'Times New Roman',serif;color:#203126;">
    <div style="max-width:640px;margin:0 auto;padding:32px 18px;">
      <div style="background:#ffffff;border:1px solid #dfd7c8;border-radius:22px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,0.06);">
        <div style="padding:28px 28px 20px;background:linear-gradient(135deg,#5a4336 0%,#7c5a48 100%);color:#ffffff;">
          <div style="font-size:32px;font-weight:700;line-height:1;">Life<span style="opacity:0.9;">.</span></div>
          <p style="margin:14px 0 0;font-size:15px;line-height:1.6;color:rgba(255,255,255,0.92);">We received your message and our team will get back to you.</p>
        </div>
        <div style="padding:28px;">
          <p style="margin:0 0 16px;font-size:16px;line-height:1.7;">Hi {{displayName}},</p>
          <p style="margin:0 0 18px;font-size:16px;line-height:1.7;">Thanks for contacting Life. support. Your request has been received under reference <strong>{{ticketId}}</strong>.</p>
          <div style="margin:0 0 22px;padding:16px 18px;background:#f8f5ee;border:1px solid #e4dbc8;border-radius:16px;font-size:15px;line-height:1.7;color:#5a4336;">{{issueSummary}}</div>
          <p style="margin:0 0 12px;font-size:15px;line-height:1.7;">We’ll reply from <a href="mailto:{{supportEmail}}" style="color:#5a4336;">{{supportEmail}}</a>.</p>
          <p style="margin:0;font-size:13px;line-height:1.7;color:#6c746d;">If your issue becomes urgent, include your ticket reference in the subject line.</p>
        </div>
      </div>
    </div>
  </body>
</html>`;

const NEW_MESSAGE_TEMPLATE = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>You have a new message on Life.</title>
  </head>
  <body style="margin:0;padding:0;background:#f5f1e8;font-family:Georgia,'Times New Roman',serif;color:#203126;">
    <div style="max-width:640px;margin:0 auto;padding:32px 18px;">
      <div style="background:#ffffff;border:1px solid #dfd7c8;border-radius:22px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,0.06);">
        <div style="padding:28px 28px 20px;background:linear-gradient(135deg,#243548 0%,#35506b 100%);color:#ffffff;">
          <div style="font-size:32px;font-weight:700;line-height:1;">Life<span style="opacity:0.9;">.</span></div>
          <p style="margin:14px 0 0;font-size:15px;line-height:1.6;color:rgba(255,255,255,0.92);">A new message is waiting in Investors &amp; Inventors.</p>
        </div>
        <div style="padding:28px;">
          <p style="margin:0 0 16px;font-size:16px;line-height:1.7;">Hi {{displayName}},</p>
          <p style="margin:0 0 18px;font-size:16px;line-height:1.7;"><strong>{{senderName}}</strong> sent you a new message.</p>
          <div style="margin:0 0 22px;padding:16px 18px;background:#f8f5ee;border:1px solid #e4dbc8;border-radius:16px;font-size:15px;line-height:1.7;color:#35506b;">“{{messagePreview}}”</div>
          <p style="margin:0 0 24px;">
            <a href="{{actionUrl}}" style="display:inline-block;background:#35506b;color:#ffffff;text-decoration:none;padding:14px 22px;border-radius:999px;font-size:15px;font-weight:700;">Open messages</a>
          </p>
          <p style="margin:0;font-size:13px;line-height:1.7;color:#6c746d;">Questions or issues? Contact <a href="mailto:{{supportEmail}}" style="color:#35506b;">{{supportEmail}}</a>.</p>
        </div>
      </div>
    </div>
  </body>
</html>`;

function ensureEmailDeliveryReady() {
  if (!isFirebaseConfigured || !db) {
    throw new Error(
      "Firebase email delivery is unavailable until the NEXT_PUBLIC_FIREBASE_* values are configured.",
    );
  }
}

function safeString(value) {
  return String(value || "").trim();
}

function normalizeEmail(value) {
  return safeString(value).toLowerCase();
}

function truncateText(value, limit = 180) {
  const normalized = safeString(value).replace(/\s+/g, " ");
  if (normalized.length <= limit) return normalized;
  return `${normalized.slice(0, Math.max(0, limit - 1)).trimEnd()}…`;
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function toMultilineHtml(value) {
  return escapeHtml(value).replace(/\n/g, "<br />");
}

function renderTemplate(template, replacements) {
  return Object.entries(replacements || {}).reduce(
    (output, [key, value]) => output.split(`{{${key}}}`).join(String(value ?? "")),
    template,
  );
}

function getSiteUrl() {
  const configured = safeString(process.env.NEXT_PUBLIC_SITE_URL);
  if (configured) {
    return configured.replace(/\/+$/, "");
  }
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }
  return "http://localhost:3000";
}

function buildAppUrl(targetPage = "home") {
  const siteUrl = getSiteUrl();
  if (!targetPage || targetPage === "home") return siteUrl;
  return `${siteUrl}#page=${encodeURIComponent(targetPage)}`;
}

function getEmailPreferences(data) {
  return {
    ...DEFAULT_EMAIL_PREFERENCES,
    ...(data?.email_preferences || {}),
  };
}

function getPrivateIdentityRef(userId) {
  return doc(db, PRIVATE_USERS_COLLECTION, userId);
}

function buildWelcomeConfirmedMessage({ displayName }) {
  const resolvedName = safeString(displayName) || "there";
  const actionUrl = buildAppUrl("home");
  return {
    subject: "Welcome to Life. Your account is confirmed",
    text: [
      `Hi ${resolvedName},`,
      "",
      "Welcome to Life. Your account is fully confirmed, so you can start building momentum with reading, quizzes, community, and networking.",
      "",
      "Open Life.:",
      actionUrl,
      "",
      `Need help? Contact ${SUPPORT_EMAIL}.`,
    ].join("\n"),
    html: renderTemplate(WELCOME_CONFIRMED_TEMPLATE, {
      displayName: escapeHtml(resolvedName),
      actionUrl: escapeHtml(actionUrl),
      supportEmail: escapeHtml(SUPPORT_EMAIL),
    }),
  };
}

function buildSupportSummary(subject, messageText) {
  const subjectLine = safeString(subject);
  const detail = safeString(messageText);
  return truncateText([subjectLine, detail].filter(Boolean).join("\n\n"), 500);
}

function buildSupportAcknowledgementMessage({
  displayName,
  ticketId,
  issueSummary,
}) {
  const resolvedName = safeString(displayName) || "there";
  const resolvedTicketId = safeString(ticketId);
  const summary = safeString(issueSummary);
  return {
    subject: `We received your Life. support request (${resolvedTicketId})`,
    text: [
      `Hi ${resolvedName},`,
      "",
      `Thanks for contacting Life. support. Your request has been received under reference ${resolvedTicketId}.`,
      "",
      summary,
      "",
      `We’ll reply from ${SUPPORT_EMAIL}.`,
    ].join("\n"),
    html: renderTemplate(SUPPORT_ACKNOWLEDGEMENT_TEMPLATE, {
      displayName: escapeHtml(resolvedName),
      ticketId: escapeHtml(resolvedTicketId),
      issueSummary: toMultilineHtml(summary),
      supportEmail: escapeHtml(SUPPORT_EMAIL),
    }),
  };
}

function buildNewMessageAlertMessage({
  displayName,
  senderName,
  messagePreview,
}) {
  const resolvedName = safeString(displayName) || "there";
  const resolvedSender = safeString(senderName) || "Someone on Life.";
  const preview = truncateText(messagePreview, 180);
  const actionUrl = buildAppUrl("networking");
  return {
    subject: `${resolvedSender} sent you a message on Life.`,
    text: [
      `Hi ${resolvedName},`,
      "",
      `${resolvedSender} sent you a new message in Investors & Inventors.`,
      "",
      `Message preview: “${preview}”`,
      "",
      "Open Life.:",
      actionUrl,
      "",
      `Questions or issues? Contact ${SUPPORT_EMAIL}.`,
    ].join("\n"),
    html: renderTemplate(NEW_MESSAGE_TEMPLATE, {
      displayName: escapeHtml(resolvedName),
      senderName: escapeHtml(resolvedSender),
      messagePreview: escapeHtml(preview),
      actionUrl: escapeHtml(actionUrl),
      supportEmail: escapeHtml(SUPPORT_EMAIL),
    }),
  };
}

export async function syncPrivateEmailIdentity({ userId, email, displayName }) {
  ensureEmailDeliveryReady();
  if (!userId) return null;

  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return null;

  const privateIdentityRef = getPrivateIdentityRef(userId);
  const snapshot = await getDoc(privateIdentityRef);
  const current = snapshot.exists() ? snapshot.data() || {} : {};
  const nextPreferences = getEmailPreferences(current);

  await setDoc(
    privateIdentityRef,
    {
      user_id: userId,
      email: normalizedEmail,
      display_name:
        safeString(displayName) ||
        safeString(current.display_name) ||
        normalizedEmail,
      email_preferences: nextPreferences,
      updated_at: serverTimestamp(),
      ...(snapshot.exists() ? {} : { created_at: serverTimestamp() }),
    },
    { merge: true },
  );

  return {
    user_id: userId,
    email: normalizedEmail,
    display_name:
      safeString(displayName) || safeString(current.display_name) || normalizedEmail,
    email_preferences: nextPreferences,
  };
}

export async function queueWelcomeConfirmedEmailOnce({
  userId,
  email,
  displayName,
}) {
  ensureEmailDeliveryReady();
  if (!userId) return { queued: false, reason: "missing-user" };

  const privateIdentityRef = getPrivateIdentityRef(userId);
  const snapshot = await getDoc(privateIdentityRef);
  const current = snapshot.exists() ? snapshot.data() || {} : {};
  const normalizedEmail = normalizeEmail(email || current.email);
  if (!normalizedEmail) return { queued: false, reason: "missing-email" };

  const emailPreferences = getEmailPreferences(current);
  if (emailPreferences.welcomeConfirmed === false) {
    return { queued: false, reason: "disabled" };
  }
  if (current.welcome_confirmed_sent_at) {
    return { queued: false, reason: "already-sent" };
  }

  const batch = writeBatch(db);
  const mailRef = doc(collection(db, MAIL_COLLECTION));
  batch.set(
    privateIdentityRef,
    {
      user_id: userId,
      email: normalizedEmail,
      display_name:
        safeString(displayName) ||
        safeString(current.display_name) ||
        normalizedEmail,
      email_preferences: emailPreferences,
      welcome_confirmed_sent_at: serverTimestamp(),
      updated_at: serverTimestamp(),
      ...(snapshot.exists() ? {} : { created_at: serverTimestamp() }),
    },
    { merge: true },
  );
  batch.set(mailRef, {
    created_by_user_id: userId,
    source_user_id: userId,
    template_key: "welcomeConfirmed",
    toUids: [userId],
    replyTo: SUPPORT_EMAIL,
    created_at: serverTimestamp(),
    message: buildWelcomeConfirmedMessage({ displayName }),
  });
  await batch.commit();

  return { queued: true, mailId: mailRef.id };
}

export async function submitSupportRequest({
  userId,
  email,
  displayName,
  category,
  subject,
  messageText,
}) {
  ensureEmailDeliveryReady();
  if (!userId) {
    throw new Error("You need to be signed in to contact support from the app.");
  }

  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) {
    throw new Error("Your account email is unavailable. Please sign in again and retry.");
  }

  const trimmedSubject = safeString(subject);
  const trimmedMessage = safeString(messageText);
  if (!trimmedSubject || !trimmedMessage) {
    throw new Error("Please include both a subject and message for support.");
  }

  const privateIdentityRef = getPrivateIdentityRef(userId);
  const privateSnapshot = await getDoc(privateIdentityRef);
  const privateData = privateSnapshot.exists() ? privateSnapshot.data() || {} : {};
  const emailPreferences = getEmailPreferences(privateData);

  const supportRequestRef = doc(collection(db, SUPPORT_REQUESTS_COLLECTION));
  const supportSummary = buildSupportSummary(trimmedSubject, trimmedMessage);
  const batch = writeBatch(db);

  batch.set(
    privateIdentityRef,
    {
      user_id: userId,
      email: normalizedEmail,
      display_name:
        safeString(displayName) ||
        safeString(privateData.display_name) ||
        normalizedEmail,
      email_preferences: emailPreferences,
      updated_at: serverTimestamp(),
      ...(privateSnapshot.exists() ? {} : { created_at: serverTimestamp() }),
    },
    { merge: true },
  );

  batch.set(supportRequestRef, {
    id: supportRequestRef.id,
    user_id: userId,
    email: normalizedEmail,
    display_name:
      safeString(displayName) ||
      safeString(privateData.display_name) ||
      normalizedEmail,
    category: safeString(category) || "general",
    subject: trimmedSubject,
    message_text: trimmedMessage,
    status: "open",
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  });

  if (emailPreferences.supportAcknowledgement !== false) {
    const mailRef = doc(collection(db, MAIL_COLLECTION));
    batch.set(mailRef, {
      created_by_user_id: userId,
      source_user_id: userId,
      source_request_id: supportRequestRef.id,
      template_key: "supportAcknowledgement",
      toUids: [userId],
      replyTo: SUPPORT_EMAIL,
      created_at: serverTimestamp(),
      message: buildSupportAcknowledgementMessage({
        displayName,
        ticketId: supportRequestRef.id,
        issueSummary: supportSummary,
      }),
    });
  }

  await batch.commit();

  return {
    ok: true,
    ticketId: supportRequestRef.id,
  };
}

export async function queueNewMessageEmailAlert({
  senderUserId,
  senderName,
  recipientUserId,
  recipientDisplayName,
  messageText,
  conversationId,
}) {
  ensureEmailDeliveryReady();
  if (!senderUserId || !recipientUserId || senderUserId === recipientUserId) {
    return { queued: false, reason: "invalid-recipient" };
  }

  const recipientIdentityRef = getPrivateIdentityRef(recipientUserId);
  const snapshot = await getDoc(recipientIdentityRef);
  if (!snapshot.exists()) {
    return { queued: false, reason: "missing-identity" };
  }

  const recipientIdentity = snapshot.data() || {};
  if (!normalizeEmail(recipientIdentity.email)) {
    return { queued: false, reason: "missing-email" };
  }

  const emailPreferences = getEmailPreferences(recipientIdentity);
  if (emailPreferences.newMessage === false) {
    return { queued: false, reason: "disabled" };
  }

  const mailRef = doc(collection(db, MAIL_COLLECTION));
  await setDoc(mailRef, {
    created_by_user_id: senderUserId,
    source_user_id: senderUserId,
    recipient_user_id: recipientUserId,
    conversation_id: safeString(conversationId),
    template_key: "newMessage",
    toUids: [recipientUserId],
    replyTo: SUPPORT_EMAIL,
    created_at: serverTimestamp(),
    message: buildNewMessageAlertMessage({
      displayName:
        recipientDisplayName || recipientIdentity.display_name || recipientIdentity.email,
      senderName,
      messagePreview: messageText,
    }),
  });

  return { queued: true, mailId: mailRef.id };
}

export const EMAIL_DELIVERY_COLLECTIONS = {
  mail: MAIL_COLLECTION,
  users: PRIVATE_USERS_COLLECTION,
  supportRequests: SUPPORT_REQUESTS_COLLECTION,
};

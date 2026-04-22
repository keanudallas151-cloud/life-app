import { getNotificationTemplate } from "../data/notificationTemplates";
import { LS } from "./storage";

const MAX_NOTIFICATIONS = 40;
const GUEST_NOTIFICATION_KEY = "_";

function getNowMs() {
  return Date.now();
}

function toMs(value) {
  if (!value) return 0;
  const date = new Date(value);
  const ms = date.getTime();
  return Number.isFinite(ms) ? ms : 0;
}

function formatRelativeTime(createdAt) {
  const createdMs = toMs(createdAt);
  if (!createdMs) return "Just now";

  const diffMs = Math.max(0, getNowMs() - createdMs);
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes <= 0) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  return new Date(createdMs).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function dispatchNotificationsUpdated() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("life_notifications_updated"));
}

export function getNotificationStorageKey(uid) {
  return `notif_${uid || GUEST_NOTIFICATION_KEY}`;
}

export function countUnreadNotifications(list) {
  if (!Array.isArray(list)) return 0;
  return list.filter((item) => item && item.read !== true).length;
}

export function createNotification(input = {}) {
  const template = getNotificationTemplate(input.templateKey) || {};
  const createdAt =
    input.createdAt || input.created_at || new Date().toISOString();
  const id =
    input.id ||
    `${createdAt}_${Math.random().toString(36).slice(2, 10)}`;

  return {
    id,
    templateKey: input.templateKey || "",
    title: input.title ?? template.title ?? "",
    text: input.text ?? template.text ?? "",
    targetPage: input.targetPage ?? template.targetPage,
    activity: input.activity ?? template.activity,
    read: Boolean(input.read),
    createdAt,
    time: formatRelativeTime(createdAt),
  };
}

export function getDefaultNotifications() {
  return [
    createNotification({ templateKey: "welcomeConfirmed" }),
    createNotification({
      templateKey: "tailorReminder",
      createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    }),
    createNotification({
      templateKey: "streakCelebration",
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    }),
  ];
}

function normalizeNotifications(list, fallback = getDefaultNotifications()) {
  const source = Array.isArray(list) ? list : fallback;
  return source
    .filter(Boolean)
    .map((item) =>
      createNotification({
        ...item,
        createdAt: item?.createdAt || item?.created_at,
      }),
    )
    .slice(0, MAX_NOTIFICATIONS);
}

export function loadNotificationsFor(uid) {
  return normalizeNotifications(
    LS.get(getNotificationStorageKey(uid), getDefaultNotifications()),
  );
}

export function saveNotificationsFor(uid, list) {
  const next = normalizeNotifications(list, []);
  LS.set(getNotificationStorageKey(uid), next);
  dispatchNotificationsUpdated();
  return next;
}

export function appendNotification(uid, input) {
  const current = loadNotificationsFor(uid);
  return saveNotificationsFor(uid, [createNotification(input), ...current]);
}

export function markAllNotificationsRead(uid) {
  const current = loadNotificationsFor(uid);
  return saveNotificationsFor(
    uid,
    current.map((item) => ({ ...item, read: true })),
  );
}

export function markNotificationRead(uid, notificationId) {
  const current = loadNotificationsFor(uid);
  return saveNotificationsFor(
    uid,
    current.map((item) =>
      item.id === notificationId ? { ...item, read: true } : item,
    ),
  );
}

export function deleteNotificationById(uid, notificationId) {
  const current = loadNotificationsFor(uid);
  return saveNotificationsFor(
    uid,
    current.filter((item) => item.id !== notificationId),
  );
}

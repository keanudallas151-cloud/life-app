import { SUPPORT_EMAIL } from "../systems/appConfig";

export const NOTIFICATION_TEMPLATES = {
  welcomeConfirmed: {
    title: "Welcome to Life.",
    text: "Your account is confirmed — your journey starts now.",
    targetPage: "home",
  },
  tailorReminder: {
    title: "Personalize your path",
    text: "Complete the tailoring questionnaire to unlock a more personal Life. experience.",
    targetPage: "where_to_start",
  },
  newMessage: {
    title: "New message",
    text: "Someone reached out in Investors & Inventors.",
    targetPage: "networking",
  },
  newMatch: {
    title: "New connection opportunity",
    text: "A fresh profile is waiting in Investors & Inventors.",
    targetPage: "networking",
  },
  profileUpdated: {
    title: "Profile updated",
    text: "Your account details were saved successfully.",
    targetPage: "profile",
  },
  passwordResetRequested: {
    title: "Password reset requested",
    text: "If this was you, follow the email we sent. If not, contact support.",
    targetPage: "signin",
  },
  streakCelebration: {
    title: "Momentum unlocked",
    text: "You kept your reading streak alive — keep going.",
    targetPage: "daily_growth",
  },
  supportAcknowledged: {
    title: "Support request received",
    text: `We received your message and will reply from ${SUPPORT_EMAIL}.`,
    targetPage: "help",
  },
};

export function getNotificationTemplate(templateKey) {
  if (!templateKey) return null;
  return NOTIFICATION_TEMPLATES[templateKey] || null;
}

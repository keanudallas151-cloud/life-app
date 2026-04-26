import { cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

let cachedApp = null;

function loadServiceAccount() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function isFirebaseAdminConfigured() {
  return Boolean(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)
    || Boolean(
      process.env.FIREBASE_PROJECT_ID
        && process.env.FIREBASE_CLIENT_EMAIL
        && process.env.FIREBASE_PRIVATE_KEY,
    );
}

export function getAdminApp() {
  if (cachedApp) return cachedApp;
  if (getApps().length) {
    cachedApp = getApp();
    return cachedApp;
  }
  const serviceAccount = loadServiceAccount() || (process.env.FIREBASE_PROJECT_ID
    ? {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
    }
    : null);

  if (!serviceAccount) {
    throw new Error(
      "Firebase Admin SDK is not configured. Set FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_PROJECT_ID/FIREBASE_CLIENT_EMAIL/FIREBASE_PRIVATE_KEY.",
    );
  }

  cachedApp = initializeApp({ credential: cert(serviceAccount) });
  return cachedApp;
}

export function getAdminDb() {
  return getFirestore(getAdminApp());
}

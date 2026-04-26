import { NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import {
  getAdminApp,
  getAdminDb,
  isFirebaseAdminConfigured,
} from "../../../../src/lib/firebaseAdmin";
import { getStripeClient, isStripeConfigured } from "../../../../src/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function getUserFromRequest(request) {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!token) return null;
  try {
    return await getAuth(getAdminApp()).verifyIdToken(token);
  } catch {
    return null;
  }
}

export async function POST(request) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Stripe is not configured" }, { status: 503 });
  }
  if (!isFirebaseAdminConfigured()) {
    return NextResponse.json(
      { error: "Firebase Admin is not configured" },
      { status: 503 },
    );
  }

  const user = await getUserFromRequest(request);
  if (!user?.uid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = getAdminDb();
    const profileRef = db.collection("profiles").doc(user.uid);
    const snapshot = await profileRef.get();
    const customerId = snapshot.exists
      ? snapshot.data()?.subscription?.stripeCustomerId
      : null;

    if (!customerId) {
      return NextResponse.json(
        { error: "No active billing customer found" },
        { status: 404 },
      );
    }

    const origin = request.headers.get("origin")
      || process.env.NEXT_PUBLIC_SITE_URL
      || "http://localhost:3000";

    const stripe = getStripeClient();
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/?page=premium`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe portal error", error);
    return NextResponse.json(
      { error: "Failed to create portal session" },
      { status: 500 },
    );
  }
}

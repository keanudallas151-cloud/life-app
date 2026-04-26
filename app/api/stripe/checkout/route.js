import { NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { getAdminApp, isFirebaseAdminConfigured } from "../../../../src/lib/firebaseAdmin";
import {
  getStripeClient,
  isStripeConfigured,
  priceIdForTier,
} from "../../../../src/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function getUserFromRequest(request) {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!token) return null;
  try {
    const decoded = await getAuth(getAdminApp()).verifyIdToken(token);
    return decoded;
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

  let body = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const tier = body?.tier;
  const priceId = priceIdForTier(tier);
  if (!priceId) {
    return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
  }

  const origin = request.headers.get("origin")
    || process.env.NEXT_PUBLIC_SITE_URL
    || "http://localhost:3000";

  try {
    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      currency: "aud",
      client_reference_id: user.uid,
      customer_email: user.email || undefined,
      allow_promotion_codes: true,
      success_url: `${origin}/?subscription=success&tier=${tier}`,
      cancel_url: `${origin}/?subscription=cancelled`,
      subscription_data: {
        metadata: {
          firebaseUid: user.uid,
          tier,
        },
      },
      metadata: {
        firebaseUid: user.uid,
        tier,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 },
    );
  }
}

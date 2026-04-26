import { NextResponse } from "next/server";
import {
  getAdminDb,
  isFirebaseAdminConfigured,
} from "../../../../src/lib/firebaseAdmin";
import {
  getStripeClient,
  isStripeConfigured,
  tierForPriceId,
} from "../../../../src/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function uidFromObject(obj) {
  return (
    obj?.metadata?.firebaseUid
    || obj?.client_reference_id
    || null
  );
}

async function resolveUidFromSubscription(stripe, subscription) {
  const direct = uidFromObject(subscription);
  if (direct) return direct;
  if (subscription?.customer) {
    try {
      const customer = await stripe.customers.retrieve(subscription.customer);
      if (customer && !customer.deleted) {
        return customer.metadata?.firebaseUid || null;
      }
    } catch {
      return null;
    }
  }
  return null;
}

function tierFromSubscription(subscription) {
  const priceId = subscription?.items?.data?.[0]?.price?.id;
  return tierForPriceId(priceId);
}

async function writeSubscription(uid, payload) {
  const db = getAdminDb();
  const profileRef = db.collection("profiles").doc(uid);
  await profileRef.set(
    {
      user_id: uid,
      subscription: {
        ...payload,
        updatedAt: new Date().toISOString(),
      },
    },
    { merge: true },
  );
}

async function clearSubscription(uid, subscriptionId) {
  const db = getAdminDb();
  const profileRef = db.collection("profiles").doc(uid);
  await profileRef.set(
    {
      user_id: uid,
      subscription: {
        tier: "free",
        status: "canceled",
        stripeSubscriptionId: subscriptionId || null,
        canceledAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    },
    { merge: true },
  );
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

  const stripe = getStripeClient();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json(
      { error: "STRIPE_WEBHOOK_SECRET is not set" },
      { status: 503 },
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event;
  try {
    const rawBody = await request.text();
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    console.error("Stripe webhook signature verification failed", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const uid = uidFromObject(session);
        if (!uid || !session.subscription) break;
        const subscription = await stripe.subscriptions.retrieve(session.subscription);
        const tier = tierFromSubscription(subscription) || "free";
        await writeSubscription(uid, {
          tier,
          status: subscription.status,
          stripeCustomerId: session.customer || subscription.customer || null,
          stripeSubscriptionId: subscription.id,
          currentPeriodEnd: subscription.current_period_end
            ? new Date(subscription.current_period_end * 1000).toISOString()
            : null,
          priceId: subscription.items?.data?.[0]?.price?.id || null,
          currency: subscription.items?.data?.[0]?.price?.currency || "aud",
        });
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "invoice.paid": {
        const obj = event.data.object;
        const subscription = obj.object === "subscription"
          ? obj
          : obj.subscription
            ? await stripe.subscriptions.retrieve(obj.subscription)
            : null;
        if (!subscription) break;
        const uid = await resolveUidFromSubscription(stripe, subscription);
        if (!uid) break;
        const tier = tierFromSubscription(subscription) || "free";
        const isActive = ["active", "trialing"].includes(subscription.status);
        await writeSubscription(uid, {
          tier: isActive ? tier : "free",
          status: subscription.status,
          stripeCustomerId: subscription.customer || null,
          stripeSubscriptionId: subscription.id,
          currentPeriodEnd: subscription.current_period_end
            ? new Date(subscription.current_period_end * 1000).toISOString()
            : null,
          priceId: subscription.items?.data?.[0]?.price?.id || null,
          currency: subscription.items?.data?.[0]?.price?.currency || "aud",
          cancelAtPeriodEnd: Boolean(subscription.cancel_at_period_end),
        });
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const uid = await resolveUidFromSubscription(stripe, subscription);
        if (!uid) break;
        await clearSubscription(uid, subscription.id);
        break;
      }
      default:
        break;
    }
  } catch (error) {
    console.error("Stripe webhook handler error", event?.type, error);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

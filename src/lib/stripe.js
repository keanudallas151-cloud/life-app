import Stripe from "stripe";

let cachedClient = null;

export function getStripeClient() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  if (!cachedClient) {
    cachedClient = new Stripe(key, {
      apiVersion: "2024-12-18.acacia",
    });
  }
  return cachedClient;
}

export const STRIPE_TIER_PRICES = {
  basic: process.env.STRIPE_BASIC_PRICE_ID || "",
  premium: process.env.STRIPE_PREMIUM_PRICE_ID || "",
};

export function priceIdForTier(tier) {
  return STRIPE_TIER_PRICES[tier] || "";
}

export function tierForPriceId(priceId) {
  if (!priceId) return null;
  if (priceId === STRIPE_TIER_PRICES.basic) return "basic";
  if (priceId === STRIPE_TIER_PRICES.premium) return "premium";
  return null;
}

export function isStripeConfigured() {
  return Boolean(
    process.env.STRIPE_SECRET_KEY
      && STRIPE_TIER_PRICES.basic
      && STRIPE_TIER_PRICES.premium,
  );
}

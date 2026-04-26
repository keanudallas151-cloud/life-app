import { auth } from "../firebaseClient";

async function getIdToken() {
  const current = auth?.currentUser;
  if (!current) throw new Error("You must be signed in to manage billing.");
  return current.getIdToken();
}

async function postJson(url, body) {
  const token = await getIdToken();
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body || {}),
  });
  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }
  if (!response.ok) {
    const message = (data && data.error) || `Request failed (${response.status})`;
    throw new Error(message);
  }
  return data;
}

export async function startStripeCheckout(tier) {
  if (tier !== "basic" && tier !== "premium") {
    throw new Error("Invalid subscription tier.");
  }
  const data = await postJson("/api/stripe/checkout", { tier });
  if (!data?.url) throw new Error("Checkout URL was not returned.");
  return data.url;
}

export async function openStripePortal() {
  const data = await postJson("/api/stripe/portal", {});
  if (!data?.url) throw new Error("Portal URL was not returned.");
  return data.url;
}

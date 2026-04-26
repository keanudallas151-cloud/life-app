import { useEffect, useMemo, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db, isFirebaseConfigured } from "../firebaseClient";

const PROFILES_COLLECTION = "profiles";

const FREE_STATE = Object.freeze({
  tier: "free",
  status: "free",
  currentPeriodEnd: null,
  cancelAtPeriodEnd: false,
  stripeCustomerId: null,
  stripeSubscriptionId: null,
  priceId: null,
  currency: "aud",
});

function normalizeSubscription(data) {
  const sub = data?.subscription || null;
  if (!sub) return FREE_STATE;
  const tier = sub.tier === "premium" || sub.tier === "basic" ? sub.tier : "free";
  const isActive = ["active", "trialing"].includes(sub.status);
  return {
    tier: isActive ? tier : "free",
    status: sub.status || "free",
    currentPeriodEnd: sub.currentPeriodEnd || null,
    cancelAtPeriodEnd: Boolean(sub.cancelAtPeriodEnd),
    stripeCustomerId: sub.stripeCustomerId || null,
    stripeSubscriptionId: sub.stripeSubscriptionId || null,
    priceId: sub.priceId || null,
    currency: sub.currency || "aud",
  };
}

/**
 * Live subscription state for the given Firebase user id.
 * Returns:
 *   { tier, status, isBasic, isPremium, isPaid, currentPeriodEnd, cancelAtPeriodEnd, ... , loading }
 */
export function useSubscription(userId) {
  const [state, setState] = useState(() => ({ ...FREE_STATE, loading: Boolean(userId) }));

  useEffect(() => {
    if (!userId || !isFirebaseConfigured || !db) {
      setState({ ...FREE_STATE, loading: false });
      return undefined;
    }

    setState((prev) => ({ ...prev, loading: true }));

    const ref = doc(db, PROFILES_COLLECTION, userId);
    const unsubscribe = onSnapshot(
      ref,
      (snapshot) => {
        const next = snapshot.exists()
          ? normalizeSubscription(snapshot.data())
          : FREE_STATE;
        setState({ ...next, loading: false });
      },
      () => {
        setState({ ...FREE_STATE, loading: false });
      },
    );

    return () => unsubscribe();
  }, [userId]);

  return useMemo(
    () => ({
      ...state,
      isFree: state.tier === "free",
      isBasic: state.tier === "basic",
      isPremium: state.tier === "premium",
      isPaid: state.tier === "basic" || state.tier === "premium",
    }),
    [state],
  );
}

export default useSubscription;

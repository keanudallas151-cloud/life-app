import { useEffect, useMemo, useState, useCallback } from "react";
import { LS } from "./storage";
import {
  createDefaultMomentumState,
  deriveMomentumSnapshot,
  getDateKey,
  normalizeMomentumState,
  recordMomentumEvent,
  rolloverMomentumState,
} from "./momentumEngine";

function getBaseLocalKey({ userId, isGuest }) {
  return isGuest || !userId ? "life_momentum_guest" : `life_momentum_${userId}`;
}

export function useMomentum({
  userId,
  persistedState,
  readKeys,
  notes,
  quizStats,
  profile,
  isGuest,
  persist,
} = {}) {
  const localKey = getBaseLocalKey({ userId, isGuest });

  const [momentumState, setMomentumState] = useState(() => {
    const cloud = persistedState
      ? normalizeMomentumState(persistedState, getDateKey())
      : null;
    const local = normalizeMomentumState(
      LS.get(localKey, createDefaultMomentumState(getDateKey())),
      getDateKey(),
    );
    return cloud || local;
  });

  useEffect(() => {
    const next = persistedState
      ? normalizeMomentumState(persistedState, getDateKey())
      : normalizeMomentumState(
          LS.get(localKey, createDefaultMomentumState(getDateKey())),
          getDateKey(),
        );
    setMomentumState(rolloverMomentumState(next, getDateKey()));
  }, [localKey, persistedState]);

  useEffect(() => {
    const today = getDateKey();
    setMomentumState((prev) => rolloverMomentumState(prev, today));
  }, []);

  useEffect(() => {
    LS.set(localKey, momentumState);
  }, [localKey, momentumState]);

  useEffect(() => {
    if (typeof persist === "function" && !isGuest) {
      persist(momentumState);
    }
  }, [persist, momentumState, isGuest]);

  const snapshot = useMemo(
    () =>
      deriveMomentumSnapshot({
        momentumState,
        readKeys,
        notes,
        quizStats,
        profile,
      }),
    [momentumState, readKeys, notes, quizStats, profile],
  );

  const recordEvent = useCallback((event) => {
    setMomentumState((prev) => recordMomentumEvent(prev, event));
  }, []);

  const resetMomentum = useCallback(() => {
    const next = createDefaultMomentumState(getDateKey());
    setMomentumState(next);
    LS.set(localKey, next);
  }, [localKey]);

  return {
    momentumState,
    snapshot,
    recordEvent,
    resetMomentum,
    setMomentumState,
  };
}

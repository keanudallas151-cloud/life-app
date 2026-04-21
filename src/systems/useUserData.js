import { useState, useEffect, useRef, useCallback } from "react";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../firebaseClient";

export function useUserData(userId) {
  const [bookmarks, setBookmarksState] = useState([]);
  const [notes, setNotesState] = useState({});
  const [readKeys, setReadKeysState] = useState([]);
  const [tsdProfile, setTsdProfileState] = useState(null);
  const [momentumState, setMomentumStateRaw] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isGuest = !db || !userId || userId === "_";
  const persistTimerRef = useRef(null);
  const pendingPatchRef = useRef(null);
  const persistInFlightRef = useRef(false);

  const clearPersistTimer = useCallback(() => {
    if (!persistTimerRef.current) return;
    clearTimeout(persistTimerRef.current);
    persistTimerRef.current = null;
  }, []);

  const applyFetchedData = useCallback((data = {}) => {
    setBookmarksState(data.bookmarks ?? []);
    setNotesState(data.notes ?? {});
    setReadKeysState(data.read_keys ?? []);
    setTsdProfileState(data.tsd_profile ?? null);
    setMomentumStateRaw(data.momentum_state ?? null);
  }, []);

  const flushPersistQueue = useCallback(async () => {
    if (isGuest || persistInFlightRef.current || !pendingPatchRef.current) return;

    persistInFlightRef.current = true;
    clearPersistTimer();

    try {
      while (pendingPatchRef.current) {
        const patch = pendingPatchRef.current;
        pendingPatchRef.current = null;

        const payload = {
          userId,
          ...patch,
          updatedAt: serverTimestamp(),
        };

        try {
          await setDoc(doc(db, "userData", userId), payload, { merge: true });
          setError("");
        } catch (persistError) {
          console.error("useUserData persist:", persistError.message);
          setError(
            "Profile sync is temporarily unavailable. Your latest changes may stay local until the connection recovers.",
          );
        }
      }
    } finally {
      persistInFlightRef.current = false;
      if (pendingPatchRef.current) void flushPersistQueue();
    }
  }, [clearPersistTimer, isGuest, userId]);

  const schedulePersist = useCallback(
    (patch, delay = 250) => {
      if (isGuest) return;
      pendingPatchRef.current = {
        ...(pendingPatchRef.current || {}),
        ...patch,
      };
      clearPersistTimer();
      persistTimerRef.current = setTimeout(() => {
        persistTimerRef.current = null;
        void flushPersistQueue();
      }, delay);
    },
    [clearPersistTimer, flushPersistQueue, isGuest],
  );

  useEffect(() => {
    if (isGuest) {
      setBookmarksState([]);
      setNotesState({});
      setReadKeysState([]);
      setTsdProfileState(null);
      setMomentumStateRaw(null);
      setError("");
      return undefined;
    }

    let cancelled = false;
    setLoading(true);
    setError("");

    getDoc(doc(db, "userData", userId))
      .then((snapshot) => {
        if (cancelled) return;
        if (!snapshot.exists()) {
          applyFetchedData();
          setLoading(false);
          return;
        }

        applyFetchedData(snapshot.data());
        setLoading(false);
      })
      .catch((fetchError) => {
        if (cancelled) return;
        console.error("useUserData fetch:", fetchError.message);
        setError(
          "Profile sync is temporarily unavailable. Local progress still works, but cloud data may not refresh until the connection recovers.",
        );
        setLoading(false);
      });

    return () => {
      cancelled = true;
      clearPersistTimer();
    };
  }, [applyFetchedData, clearPersistTimer, isGuest, userId]);

  const setBookmarks = useCallback(
    (value) => {
      setBookmarksState(value);
      schedulePersist({ bookmarks: value }, 0);
    },
    [schedulePersist],
  );

  const setNotes = useCallback(
    (value) => {
      setNotesState(value);
      schedulePersist({ notes: value }, 600);
    },
    [schedulePersist],
  );

  const setReadKeys = useCallback(
    (value) => {
      setReadKeysState(value);
      schedulePersist({ read_keys: value }, 0);
    },
    [schedulePersist],
  );

  const setTsdProfile = useCallback(
    (value) => {
      setTsdProfileState(value);
      schedulePersist({ tsd_profile: value }, 0);
    },
    [schedulePersist],
  );

  const setMomentumState = useCallback(
    (value) => {
      setMomentumStateRaw(value);
      schedulePersist({ momentum_state: value }, 0);
    },
    [schedulePersist],
  );

  return {
    bookmarks,
    setBookmarks,
    notes,
    setNotes,
    readKeys,
    setReadKeys,
    tsdProfile,
    setTsdProfile,
    momentumState,
    setMomentumState,
    loading,
    error,
  };
}

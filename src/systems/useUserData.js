import { useState, useEffect, useRef, useCallback } from "react";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../firebaseClient";

export function useUserData(userId) {
  const [bookmarks,   setBookmarksState]  = useState([]);
  const [notes,       setNotesState]      = useState({});
  const [readKeys,    setReadKeysState]   = useState([]);
  const [highlights,  setHighlightsState] = useState([]);
  const [tsdProfile,  setTsdProfileState] = useState(null);
  const [momentumState, setMomentumStateRaw] = useState(null);
  const [loading,     setLoading]         = useState(false);
  const [error,       setError]           = useState("");

  const isGuest = !userId || userId === "_";
  const persistTimerRef = useRef(null);
  const pendingPatchRef = useRef(null);
  const persistInFlightRef = useRef(false);

  const clearPersistTimer = useCallback(() => {
    if (!persistTimerRef.current) return;
    clearTimeout(persistTimerRef.current);
    persistTimerRef.current = null;
  }, []);

  const applyFetchedData = useCallback((data = {}) => {
    setBookmarksState(data.bookmarks  ?? []);
    setNotesState(data.notes          ?? {});
    setReadKeysState(data.read_keys   ?? []);
    setHighlightsState(data.highlights ?? []);
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
          continue;
        } catch (error) {
          console.error("useUserData persist:", error.message);
          setError("Profile sync is temporarily unavailable. Your latest changes may stay local until the connection recovers.");
        }
      }
    } finally {
      persistInFlightRef.current = false;
      if (pendingPatchRef.current) void flushPersistQueue();
    }
  }, [clearPersistTimer, isGuest, userId]);

  const schedulePersist = useCallback((patch, delay = 250) => {
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
  }, [clearPersistTimer, flushPersistQueue, isGuest]);

  useEffect(() => {
    clearPersistTimer();
    pendingPatchRef.current = null;
    persistInFlightRef.current = false;

    if (isGuest) {
      setBookmarksState([]);
      setNotesState({});
      setReadKeysState([]);
      setHighlightsState([]);
      setTsdProfileState(null);
      setMomentumStateRaw(null);
      setError("");
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError("");
    getDoc(doc(db, "userData", userId))
      .then((snapshot) => {
        if (cancelled) return;
        if (snapshot.exists()) {
          const data = snapshot.data();
          applyFetchedData({
            bookmarks: data.bookmarks,
            notes: data.notes,
            read_keys: data.readKeys,
            highlights: data.highlights,
            tsd_profile: data.tsdProfile,
            momentum_state: data.momentumState,
          });
          setLoading(false);
          return;
        }
        setLoading(false);
      })
      .catch((error) => {
        if (cancelled) return;
        console.error("useUserData fetch:", error.message);
        setError("Profile sync is unavailable right now. Cached data will still work until the cloud connection recovers.");
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [applyFetchedData, clearPersistTimer, userId, isGuest]);

  useEffect(() => () => clearPersistTimer(), [clearPersistTimer]);

  const setBookmarks = useCallback((v) => {
    setBookmarksState(v);
    schedulePersist({ bookmarks: v }, 180);
  }, [schedulePersist]);

  const setNotes = useCallback((v) => {
    setNotesState(v);
    schedulePersist({ notes: v }, 700);
  }, [schedulePersist]);

  const setReadKeys = useCallback((v) => {
    setReadKeysState(v);
    schedulePersist({ read_keys: v }, 180);
  }, [schedulePersist]);

  const setHighlights = useCallback((v) => {
    setHighlightsState(v);
    schedulePersist({ highlights: v }, 220);
  }, [schedulePersist]);

  const setTsdProfile = useCallback((v) => {
    setTsdProfileState(v);
    schedulePersist({ tsd_profile: v }, 220);
  }, [schedulePersist]);

  const setMomentumState = useCallback((v) => {
    setMomentumStateRaw(v);
    schedulePersist({ momentum_state: v }, 260);
  }, [schedulePersist]);

  const replaceAllData = useCallback((next) => {
    const merged = {
      bookmarks: next?.bookmarks ?? [],
      notes: next?.notes ?? {},
      read_keys: next?.read_keys ?? [],
      highlights: next?.highlights ?? [],
      tsd_profile: next?.tsd_profile ?? null,
      momentum_state: next?.momentum_state ?? null,
    };
    applyFetchedData(merged);
    schedulePersist(merged, 120);
  }, [applyFetchedData, schedulePersist]);

  return {
    bookmarks,  setBookmarks,
    notes,      setNotes,
    readKeys,   setReadKeys,
    highlights, setHighlights,
    tsdProfile, setTsdProfile,
    momentumState, setMomentumState,
    replaceAllData,
    loading,
    error,
  };
}

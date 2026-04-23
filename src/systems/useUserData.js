import { useState, useEffect, useRef, useCallback } from "react";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../firebaseClient";
import { LS } from "./storage";

const EMPTY_USER_DATA = {
  bookmarks: [],
  notes: {},
  read_keys: [],
  highlights: [],
  tsd_profile: null,
  momentum_state: null,
  tools_todos: [],
  tools_session: null,
};

function getUserDataCacheKey(userId) {
  return `udc_${userId}`;
}

function pickFirstDefined(...values) {
  for (const value of values) {
    if (value !== undefined) return value;
  }
  return undefined;
}

function isPlainObject(value) {
  if (!value || typeof value !== "object") return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function sanitizeForPersistence(value) {
  if (value === undefined) return undefined;
  if (Array.isArray(value)) {
    return value
      .map((item) => sanitizeForPersistence(item))
      .filter((item) => item !== undefined);
  }
  if (!isPlainObject(value)) return value;

  return Object.entries(value).reduce((acc, [key, entry]) => {
    const next = sanitizeForPersistence(entry);
    if (next !== undefined) {
      acc[key] = next;
    }
    return acc;
  }, {});
}

function normalizeCloudUserData(data = {}) {
  return {
    bookmarks: pickFirstDefined(data.bookmarks, []),
    notes: pickFirstDefined(data.notes, {}),
    read_keys: pickFirstDefined(data.read_keys, data.readKeys, []),
    highlights: pickFirstDefined(data.highlights, []),
    tsd_profile: pickFirstDefined(data.tsd_profile, data.tsdProfile, null),
    momentum_state: pickFirstDefined(
      data.momentum_state,
      data.momentumState,
      null,
    ),
    tools_todos: pickFirstDefined(data.tools_todos, data.toolsTodos, []),
    tools_session: pickFirstDefined(data.tools_session, data.toolsSession, null),
  };
}

function hasAnyUserData(data = {}) {
  return Boolean(
    (data.bookmarks?.length ?? 0) > 0
      || Object.keys(data.notes || {}).length > 0
      || (data.read_keys?.length ?? 0) > 0
      || (data.highlights?.length ?? 0) > 0
      || data.tsd_profile != null
      || data.momentum_state != null
      || (data.tools_todos?.length ?? 0) > 0
      || data.tools_session != null
  );
}

function loadCachedUserData(userId) {
  if (!userId) return { ...EMPTY_USER_DATA };
  return normalizeCloudUserData(LS.get(getUserDataCacheKey(userId), EMPTY_USER_DATA));
}

function saveCachedUserData(userId, data) {
  if (!userId) return;
  LS.set(getUserDataCacheKey(userId), normalizeCloudUserData(data));
}

export function useUserData(userId) {
  const [bookmarks,   setBookmarksState]  = useState([]);
  const [notes,       setNotesState]      = useState({});
  const [readKeys,    setReadKeysState]   = useState([]);
  const [highlights,  setHighlightsState] = useState([]);
  const [tsdProfile,  setTsdProfileState] = useState(null);
  const [momentumState, setMomentumStateRaw] = useState(null);
  const [toolsTodos, setToolsTodosState] = useState([]);
  const [toolsSession, setToolsSessionState] = useState(null);
  const [loading,     setLoading]         = useState(false);
  const [error,       setError]           = useState("");

  const isGuest = !db || !userId || userId === "_";
  const persistTimerRef = useRef(null);
  const pendingPatchRef = useRef(null);
  const persistInFlightRef = useRef(false);
  const retryCountRef = useRef(0);

  const clearPersistTimer = useCallback(() => {
    if (!persistTimerRef.current) return;
    clearTimeout(persistTimerRef.current);
    persistTimerRef.current = null;
  }, []);

  const applyFetchedData = useCallback((data = {}) => {
    const normalized = normalizeCloudUserData(data);
    setBookmarksState(normalized.bookmarks ?? []);
    setNotesState(normalized.notes ?? {});
    setReadKeysState(normalized.read_keys ?? []);
    setHighlightsState(normalized.highlights ?? []);
    setTsdProfileState(normalized.tsd_profile ?? null);
    setMomentumStateRaw(normalized.momentum_state ?? null);
    setToolsTodosState(normalized.tools_todos ?? []);
    setToolsSessionState(normalized.tools_session ?? null);
    saveCachedUserData(userId, normalized);
  }, [userId]);

  const flushPersistQueue = useCallback(async () => {
    if (isGuest || persistInFlightRef.current || !pendingPatchRef.current) return;

    persistInFlightRef.current = true;
    clearPersistTimer();

    try {
      while (pendingPatchRef.current) {
        const patch = pendingPatchRef.current;
        pendingPatchRef.current = null;
        const sanitizedPatch = sanitizeForPersistence(patch) || {};

        const payload = {
          userId,
          ...sanitizedPatch,
          updatedAt: serverTimestamp(),
        };

        try {
          await setDoc(doc(db, "userData", userId), payload, { merge: true });
          saveCachedUserData(userId, {
            ...loadCachedUserData(userId),
            ...sanitizedPatch,
          });
          retryCountRef.current = 0;
          setError("");
          continue;
        } catch (error) {
          console.error("useUserData persist:", error.message);
          retryCountRef.current += 1;
          pendingPatchRef.current = {
            ...patch,
            ...(pendingPatchRef.current || {}),
          };
          if (retryCountRef.current >= 2) {
            setError(
              "Profile sync is retrying in the background. Your latest changes are saved on this device and will upload once the connection settles.",
            );
          }

          const retryDelay = Math.min(
            4000,
            750 * 2 ** Math.min(retryCountRef.current, 3),
          );
          clearPersistTimer();
          persistTimerRef.current = setTimeout(() => {
            persistTimerRef.current = null;
            void flushPersistQueue();
          }, retryDelay);
        }
      }
    } finally {
      persistInFlightRef.current = false;
      if (pendingPatchRef.current && !persistTimerRef.current) {
        void flushPersistQueue();
      }
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
    retryCountRef.current = 0;

    if (isGuest) {
      setBookmarksState([]);
      setNotesState({});
      setReadKeysState([]);
      setHighlightsState([]);
      setTsdProfileState(null);
      setMomentumStateRaw(null);
      setToolsTodosState([]);
      setToolsSessionState(null);
      setError("");
      return;
    }

    let cancelled = false;
    const cachedData = loadCachedUserData(userId);
    const hasCachedData = hasAnyUserData(cachedData);

    applyFetchedData(hasCachedData ? cachedData : EMPTY_USER_DATA);
    setLoading(true);
    setError("");
    getDoc(doc(db, "userData", userId))
      .then((snapshot) => {
        if (cancelled) return;
        if (snapshot.exists()) {
          applyFetchedData(normalizeCloudUserData(snapshot.data() || {}));
          setLoading(false);
          return;
        }
        if (!hasCachedData) {
          applyFetchedData(EMPTY_USER_DATA);
        }
        setLoading(false);
      })
      .catch((error) => {
        if (cancelled) return;
        console.error("useUserData fetch:", error.message);
        setError(
          hasCachedData
            ? "Profile sync is using cached data right now. We’ll retry automatically when the connection recovers."
            : "Profile sync is unavailable right now. New changes will stay on this device until the cloud connection recovers.",
        );
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [applyFetchedData, clearPersistTimer, userId, isGuest]);

  useEffect(() => () => clearPersistTimer(), [clearPersistTimer]);

  useEffect(() => {
    if (isGuest || typeof window === "undefined") return undefined;

    const handleOnline = () => {
      if (pendingPatchRef.current) {
        void flushPersistQueue();
      }
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [flushPersistQueue, isGuest]);

  const setBookmarks = useCallback((v) => {
    const next = typeof v === "function" ? v(bookmarks) : v;
    setBookmarksState(next);
    saveCachedUserData(userId, {
      bookmarks: next,
      notes,
      read_keys: readKeys,
      highlights,
      tsd_profile: tsdProfile,
      momentum_state: momentumState,
      tools_todos: toolsTodos,
      tools_session: toolsSession,
    });
    schedulePersist({ bookmarks: next }, 180);
  }, [bookmarks, highlights, momentumState, notes, readKeys, schedulePersist, toolsSession, toolsTodos, tsdProfile, userId]);

  const setNotes = useCallback((v) => {
    const next = typeof v === "function" ? v(notes) : v;
    setNotesState(next);
    saveCachedUserData(userId, {
      bookmarks,
      notes: next,
      read_keys: readKeys,
      highlights,
      tsd_profile: tsdProfile,
      momentum_state: momentumState,
      tools_todos: toolsTodos,
      tools_session: toolsSession,
    });
    schedulePersist({ notes: next }, 700);
  }, [bookmarks, highlights, momentumState, notes, readKeys, schedulePersist, toolsSession, toolsTodos, tsdProfile, userId]);

  const setReadKeys = useCallback((v) => {
    const next = typeof v === "function" ? v(readKeys) : v;
    setReadKeysState(next);
    saveCachedUserData(userId, {
      bookmarks,
      notes,
      read_keys: next,
      highlights,
      tsd_profile: tsdProfile,
      momentum_state: momentumState,
      tools_todos: toolsTodos,
      tools_session: toolsSession,
    });
    schedulePersist({ read_keys: next }, 180);
  }, [bookmarks, highlights, momentumState, notes, readKeys, schedulePersist, toolsSession, toolsTodos, tsdProfile, userId]);

  const setHighlights = useCallback((v) => {
    const next = typeof v === "function" ? v(highlights) : v;
    setHighlightsState(next);
    saveCachedUserData(userId, {
      bookmarks,
      notes,
      read_keys: readKeys,
      highlights: next,
      tsd_profile: tsdProfile,
      momentum_state: momentumState,
      tools_todos: toolsTodos,
      tools_session: toolsSession,
    });
    schedulePersist({ highlights: next }, 220);
  }, [bookmarks, highlights, momentumState, notes, readKeys, schedulePersist, toolsSession, toolsTodos, tsdProfile, userId]);

  const setTsdProfile = useCallback((v) => {
    const next = typeof v === "function" ? v(tsdProfile) : v;
    setTsdProfileState(next);
    saveCachedUserData(userId, {
      bookmarks,
      notes,
      read_keys: readKeys,
      highlights,
      tsd_profile: next,
      momentum_state: momentumState,
      tools_todos: toolsTodos,
      tools_session: toolsSession,
    });
    schedulePersist({ tsd_profile: next }, 220);
  }, [bookmarks, highlights, momentumState, notes, readKeys, schedulePersist, toolsSession, toolsTodos, tsdProfile, userId]);

  const setMomentumState = useCallback((v) => {
    const next = typeof v === "function" ? v(momentumState) : v;
    setMomentumStateRaw(next);
    saveCachedUserData(userId, {
      bookmarks,
      notes,
      read_keys: readKeys,
      highlights,
      tsd_profile: tsdProfile,
      momentum_state: next,
      tools_todos: toolsTodos,
      tools_session: toolsSession,
    });
    schedulePersist({ momentum_state: next }, 260);
  }, [bookmarks, highlights, momentumState, notes, readKeys, schedulePersist, tsdProfile, toolsSession, toolsTodos, userId]);

  const setToolsTodos = useCallback((v) => {
    const next = typeof v === "function" ? v(toolsTodos) : v;
    setToolsTodosState(next);
    saveCachedUserData(userId, {
      bookmarks,
      notes,
      read_keys: readKeys,
      highlights,
      tsd_profile: tsdProfile,
      momentum_state: momentumState,
      tools_todos: next,
      tools_session: toolsSession,
    });
    schedulePersist({ tools_todos: next }, 220);
  }, [bookmarks, highlights, momentumState, notes, readKeys, schedulePersist, toolsSession, toolsTodos, tsdProfile, userId]);

  const setToolsSession = useCallback((v) => {
    const next = typeof v === "function" ? v(toolsSession) : v;
    setToolsSessionState(next);
    saveCachedUserData(userId, {
      bookmarks,
      notes,
      read_keys: readKeys,
      highlights,
      tsd_profile: tsdProfile,
      momentum_state: momentumState,
      tools_todos: toolsTodos,
      tools_session: next,
    });
    schedulePersist({ tools_session: next }, 180);
  }, [bookmarks, highlights, momentumState, notes, readKeys, schedulePersist, toolsSession, toolsTodos, tsdProfile, userId]);

  const replaceAllData = useCallback((next) => {
    const merged = {
      bookmarks: next?.bookmarks ?? [],
      notes: next?.notes ?? {},
      read_keys: next?.read_keys ?? [],
      highlights: next?.highlights ?? [],
      tsd_profile: next?.tsd_profile ?? null,
      momentum_state: next?.momentum_state ?? null,
      tools_todos: next?.tools_todos ?? [],
      tools_session: next?.tools_session ?? null,
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
    toolsTodos, setToolsTodos,
    toolsSession, setToolsSession,
    replaceAllData,
    loading,
    error,
  };
}

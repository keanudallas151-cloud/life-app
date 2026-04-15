import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "../supabaseClient";

// Debounce helper — waits ms after last call before firing fn
function useDebouncedCallback(fn, ms) {
  const timer = useRef(null);
  return useCallback((...args) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => fn(...args), ms);
  }, [fn, ms]);
}

export function useUserData(userId) {
  const [bookmarks,   setBookmarksState]  = useState([]);
  const [notes,       setNotesState]      = useState({});
  const [readKeys,    setReadKeysState]   = useState([]);
  const [tsdProfile,  setTsdProfileState] = useState(null);
  const [momentumState, setMomentumStateRaw] = useState(null);
  const [loading,     setLoading]         = useState(false);

  const isGuest = !userId || userId === "_";

  // ── FETCH on userId change ─────────────────────────────────
  useEffect(() => {
    if (isGuest) {
      setBookmarksState([]);
      setNotesState({});
      setReadKeysState([]);
      setTsdProfileState(null);
      setMomentumStateRaw(null);
      return;
    }
    setLoading(true);
    supabase
      .from("user_data")
      .select("bookmarks, notes, read_keys, tsd_profile, momentum_state")
      .eq("user_id", userId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) { console.error("useUserData fetch:", error.message); setLoading(false); return; }
        if (data) {
          setBookmarksState(data.bookmarks  ?? []);
          setNotesState(data.notes          ?? {});
          setReadKeysState(data.read_keys   ?? []);
          setTsdProfileState(data.tsd_profile ?? null);
          setMomentumStateRaw(data.momentum_state ?? null);
        }
        setLoading(false);
      });
  }, [userId, isGuest]);

  // ── PERSIST to Supabase ────────────────────────────────────
  const persist = useCallback(async (patch) => {
    if (isGuest) return;
    const { error } = await supabase
      .from("user_data")
      .upsert({ user_id: userId, ...patch, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
    if (error) console.error("useUserData persist:", error.message);
  }, [userId, isGuest]);

  // Debounced persist — notes can change rapidly while typing
  const debouncedPersist = useDebouncedCallback(persist, 800);

  // ── SETTERS (update state + persist) ─────────────────────
  const setBookmarks = useCallback((v) => {
    setBookmarksState(v);
    persist({ bookmarks: v });
  }, [persist]);

  const setNotes = useCallback((v) => {
    setNotesState(v);
    debouncedPersist({ notes: v });
  }, [debouncedPersist]);

  const setReadKeys = useCallback((v) => {
    setReadKeysState(v);
    persist({ read_keys: v });
  }, [persist]);

  const setTsdProfile = useCallback((v) => {
    setTsdProfileState(v);
    persist({ tsd_profile: v });
  }, [persist]);

  const setMomentumState = useCallback((v) => {
    setMomentumStateRaw(v);
    persist({ momentum_state: v });
  }, [persist]);

  return {
    bookmarks,  setBookmarks,
    notes,      setNotes,
    readKeys,   setReadKeys,
    tsdProfile, setTsdProfile,
    momentumState, setMomentumState,
    loading,
  };
}
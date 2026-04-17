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
  const [highlights,  setHighlightsState] = useState([]);
  const [tsdProfile,  setTsdProfileState] = useState(null);
  const [momentumState, setMomentumStateRaw] = useState(null);
  const [loading,     setLoading]         = useState(false);

  const isGuest = !userId || userId === "_";

  const applyFetchedData = useCallback((data = {}) => {
    setBookmarksState(data.bookmarks  ?? []);
    setNotesState(data.notes          ?? {});
    setReadKeysState(data.read_keys   ?? []);
    setHighlightsState(data.highlights ?? []);
    setTsdProfileState(data.tsd_profile ?? null);
    setMomentumStateRaw(data.momentum_state ?? null);
  }, []);

  useEffect(() => {
    if (isGuest) {
      setBookmarksState([]);
      setNotesState({});
      setReadKeysState([]);
      setHighlightsState([]);
      setTsdProfileState(null);
      setMomentumStateRaw(null);
      return;
    }
    setLoading(true);
    supabase
      .from("user_data")
      .select("bookmarks, notes, read_keys, highlights, tsd_profile, momentum_state")
      .eq("user_id", userId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!error) {
          if (data) applyFetchedData(data);
          setLoading(false);
          return;
        }

        if (!String(error.message || "").toLowerCase().includes("highlights")) {
          console.error("useUserData fetch:", error.message);
          setLoading(false);
          return;
        }

        console.error("useUserData fetch: highlights column missing, using fallback query.");
        supabase
          .from("user_data")
          .select("bookmarks, notes, read_keys, tsd_profile, momentum_state")
          .eq("user_id", userId)
          .maybeSingle()
          .then(({ data: fallbackData, error: fallbackError }) => {
            if (fallbackError) {
              console.error("useUserData fallback fetch:", fallbackError.message);
              setLoading(false);
              return;
            }
            if (fallbackData) applyFetchedData({ ...fallbackData, highlights: [] });
            setLoading(false);
          });
      });
  }, [applyFetchedData, userId, isGuest]);

  const persist = useCallback(async (patch) => {
    if (isGuest) return;
    const { error } = await supabase
      .from("user_data")
      .upsert({ user_id: userId, ...patch, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
    if (error) {
      if (
        Object.prototype.hasOwnProperty.call(patch, "highlights") &&
        String(error.message || "").toLowerCase().includes("highlights")
      ) {
        console.error("useUserData persist: legacy highlights column missing; skipping that field.");
        return;
      }
      console.error("useUserData persist:", error.message);
    }
  }, [userId, isGuest]);

  // Debounced persist — notes can change rapidly while typing
  const debouncedPersist = useDebouncedCallback(persist, 800);

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

  const setHighlights = useCallback((v) => {
    setHighlightsState(v);
    persist({ highlights: v });
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
    highlights, setHighlights,
    tsdProfile, setTsdProfile,
    momentumState, setMomentumState,
    loading,
  };
}

import { useState, useEffect, useCallback } from "react";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../firebaseClient";

const DEFAULT_STATS = {
  totalPlayed:   0,
  totalAnswered: 0,
  totalCorrect:  0,
  bestStreak:    0,
  topicsPlayed:  {},
  achievements:  [],
  history:       [],
  dailyDate:     "",
};

// Maps DB snake_case → component camelCase and back
function fromDB(row) {
  if (!row) return { ...DEFAULT_STATS };
  return {
    totalPlayed: row.totalPlayed ?? 0,
    totalAnswered: row.totalAnswered ?? 0,
    totalCorrect: row.totalCorrect ?? 0,
    bestStreak: row.bestStreak ?? 0,
    topicsPlayed: row.topicsPlayed ?? {},
    achievements: row.achievements ?? [],
    history: row.history ?? [],
    dailyDate: row.dailyDate ?? "",
  };
}

function toDB(stats, userId) {
  return {
    userId,
    totalPlayed: stats.totalPlayed,
    totalAnswered: stats.totalAnswered,
    totalCorrect: stats.totalCorrect,
    bestStreak: stats.bestStreak,
    topicsPlayed: stats.topicsPlayed,
    achievements: stats.achievements,
    history: stats.history,
    dailyDate: stats.dailyDate,
    updatedAt: serverTimestamp(),
  };
}

export function useQuizStats(userId) {
  const [stats,   setStatsState] = useState({ ...DEFAULT_STATS });
  const [loading, setLoading]    = useState(false);
  const [error,   setError]      = useState("");

  const isGuest = !userId || userId === "_";

  useEffect(() => {
    if (isGuest) {
      setStatsState({ ...DEFAULT_STATS });
      setError("");
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError("");
    getDoc(doc(db, "quizStats", userId))
      .then((snapshot) => {
        if (cancelled) return;
        if (!snapshot.exists()) {
          setStatsState({ ...DEFAULT_STATS });
          setLoading(false);
          return;
        }
        try {
          setStatsState(fromDB(snapshot.data()));
          setError("");
        } catch (error) {
          console.error("useQuizStats fetch:", error.message);
          setError("Quiz stats are unavailable right now. You can still play, but cloud stats may not update until the connection recovers.");
        }
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [userId, isGuest]);

  const saveStats = useCallback(async (next) => {
    setStatsState(next);
    if (isGuest) return;
    try {
      await setDoc(doc(db, "quizStats", userId), toDB(next, userId), {
        merge: true,
      });
      setError("");
    } catch (error) {
      console.error("useQuizStats save:", error.message);
      setError("Quiz stats are unavailable right now. You can still play, but cloud stats may not update until the connection recovers.");
    }
  }, [userId, isGuest]);

  return { stats, saveStats, loading, error };
}

import { useState, useEffect, useCallback } from "react";
import { supabase, isSupabaseConfigured } from "../supabaseClient";

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
    totalPlayed:   row.total_played   ?? 0,
    totalAnswered: row.total_answered ?? 0,
    totalCorrect:  row.total_correct  ?? 0,
    bestStreak:    row.best_streak    ?? 0,
    topicsPlayed:  row.topics_played  ?? {},
    achievements:  row.achievements   ?? [],
    history:       row.history        ?? [],
    dailyDate:     row.daily_date     ?? "",
  };
}

function toDB(stats, userId) {
  return {
    user_id:        userId,
    total_played:   stats.totalPlayed,
    total_answered: stats.totalAnswered,
    total_correct:  stats.totalCorrect,
    best_streak:    stats.bestStreak,
    topics_played:  stats.topicsPlayed,
    achievements:   stats.achievements,
    history:        stats.history,
    daily_date:     stats.dailyDate,
    updated_at:     new Date().toISOString(),
  };
}

export function useQuizStats(userId) {
  const [stats,   setStatsState] = useState({ ...DEFAULT_STATS });
  const [loading, setLoading]    = useState(false);

  const isGuest = !userId || userId === "_" || !isSupabaseConfigured;

  useEffect(() => {
    if (isGuest) { setStatsState({ ...DEFAULT_STATS }); return; }
    setLoading(true);
    supabase
      .from("quiz_stats")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) console.error("useQuizStats fetch:", error.message);
        setStatsState(fromDB(data));
        setLoading(false);
      });
  }, [userId, isGuest]);

  const saveStats = useCallback(async (next) => {
    setStatsState(next);
    if (isGuest) return;
    const { error } = await supabase
      .from("quiz_stats")
      .upsert(toDB(next, userId), { onConflict: "user_id" });
    if (error) console.error("useQuizStats save:", error.message);
  }, [userId, isGuest]);

  return { stats, saveStats, loading };
}
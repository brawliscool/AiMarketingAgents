import { createClient } from "../utils/supabase/client";

const storageKey = "hiveai.trendHunter.savedTrends";
const tableName = "saved_trends";

export async function loadSavedTrends() {
  const supabase = getSupabaseClient();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select("id, trend_id, payload, created_at")
        .order("created_at", { ascending: false });

      if (!error && Array.isArray(data)) {
        return data.map((row) => row.payload || row).filter(Boolean);
      }
    } catch {
      // Fall through to local storage when Supabase is not configured or the table is unavailable.
    }
  }

  return readLocalTrends();
}

export async function saveTrend(trend) {
  const savedTrend = {
    ...trend,
    savedAt: new Date().toISOString(),
  };
  const supabase = getSupabaseClient();

  if (supabase) {
    try {
      const { error } = await supabase.from(tableName).upsert(
        {
          trend_id: trend.id,
          payload: savedTrend,
        },
        { onConflict: "trend_id" },
      );

      if (!error) {
        return { trend: savedTrend, storage: "supabase" };
      }
    } catch {
      // Fall through to local storage when Supabase is not ready.
    }
  }

  const next = [savedTrend, ...readLocalTrends().filter((item) => item.id !== trend.id)].slice(0, 50);
  writeLocalTrends(next);
  return { trend: savedTrend, storage: "localStorage" };
}

function getSupabaseClient() {
  try {
    return createClient();
  } catch {
    return null;
  }
}

function readLocalTrends() {
  if (typeof window === "undefined") return [];

  try {
    const stored = window.localStorage.getItem(storageKey);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function writeLocalTrends(trends) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(storageKey, JSON.stringify(trends));
}

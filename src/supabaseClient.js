import { createClient } from "@supabase/supabase-js";

const runtimeEnv = globalThis?.process?.env || {};

const SUPABASE_URL =
  runtimeEnv.NEXT_PUBLIC_SUPABASE_URL ||
  runtimeEnv.VITE_SUPABASE_URL ||
  "";

const SUPABASE_KEY =
  runtimeEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  runtimeEnv.VITE_SUPABASE_ANON_KEY ||
  "";

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error(
    "[Life.] Missing Supabase env vars.\n" +
    "Set NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY (or the legacy VITE_* equivalents).\n" +
    "The app will render but all network features (auth, Post-It, quiz stats) will be unavailable."
  );
}

/** @type {import("@supabase/supabase-js").SupabaseClient} */
export const supabase = createClient(
  SUPABASE_URL || "https://placeholder.supabase.co",
  SUPABASE_KEY || "placeholder-key",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

/** True when env vars are present and the client should work. */
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY);

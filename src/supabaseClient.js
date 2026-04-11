import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error(
    "[Life.] Missing Supabase env vars.\n" +
    "Copy .env.example to .env and fill in VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY.\n" +
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

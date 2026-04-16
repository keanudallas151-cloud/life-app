import { createClient } from "@supabase/supabase-js";

// The anon/publishable key is intentionally public — safe to hardcode.
// These values are also set as NEXT_PUBLIC_ env vars in Vercel as a backup.
const SUPABASE_URL = "https://bjptrcyfdflowioxwasf.supabase.co";
const SUPABASE_KEY = "sb_publishable_TaKQ7VgdMjuKdwjymwpd7Q_sVSi6u0G";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export const isSupabaseConfigured = true;

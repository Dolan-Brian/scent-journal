import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Fallback values for the published deployment, where .env.local is not
// available. These are publishable (public) credentials — row-level security
// on the Supabase side is what protects the data.
const FALLBACK_URL = "https://ixcaaittvvvoqbiglpuk.supabase.co";
const FALLBACK_KEY = "sb_publishable_n4xw1vMviX6ewm2WBoOTRQ_0bzNauxs";

const url =
  (import.meta.env["VITE_SUPABASE_URL"] as string | undefined) ??
  (import.meta.env["SUPABASE_URL"] as string | undefined) ??
  FALLBACK_URL;

const key =
  (import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] as string | undefined) ??
  (import.meta.env["VITE_SUPABASE_ANON_KEY"] as string | undefined) ??
  (import.meta.env["SUPABASE_PUBLISHABLE_KEY"] as string | undefined) ??
  FALLBACK_KEY;

export const isSupabaseConfigured = Boolean(url && key);

/**
 * Browser Supabase client pointed at the user's own Supabase project.
 * Values come from VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY.
 */
export const supabase: SupabaseClient = createClient(
  url ?? "https://placeholder.supabase.co",
  key ?? "placeholder-key",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
);

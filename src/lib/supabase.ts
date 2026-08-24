import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url =
  (import.meta.env["VITE_SUPABASE_URL"] as string | undefined) ??
  (import.meta.env["SUPABASE_URL"] as string | undefined);

const key =
  (import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] as string | undefined) ??
  (import.meta.env["VITE_SUPABASE_ANON_KEY"] as string | undefined) ??
  (import.meta.env["SUPABASE_PUBLISHABLE_KEY"] as string | undefined);

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

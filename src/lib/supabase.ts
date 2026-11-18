import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase-koppeling. De URL en de publishable key zijn openbaar (bedoeld voor de browser);
 * alle rechten worden in de database bewaakt met row level security.
 * Geheime sleutels (service role, Mollie) horen hier nooit.
 */
// ANET-tabellen staan (met voorvoegsel anet_) in het Supabase-project "trainingcoach".
const DEFAULT_URL = "https://yelbybdesdjsynzdfrit.supabase.co";
const DEFAULT_PUBLISHABLE_KEY = "sb_publishable_t8LtctvQxhf2X24nyq80qQ_Ah7uzZgB";

const SUPABASE_URL = (import.meta.env["VITE_SUPABASE_URL"] as string | undefined) || DEFAULT_URL;
const SUPABASE_PUBLISHABLE_KEY =
  (import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] as string | undefined) ||
  DEFAULT_PUBLISHABLE_KEY;

export const supabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);

let client: SupabaseClient | null = null;

/** Geeft de client terug, of null als de database nog niet is gekoppeld. */
export function getSupabase(): SupabaseClient | null {
  if (!supabaseConfigured) return null;
  if (!client) {
    client = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: {
        persistSession: typeof window !== "undefined",
        autoRefreshToken: typeof window !== "undefined",
        detectSessionInUrl: typeof window !== "undefined",
        storageKey: "anet-beheer-auth",
      },
    });
  }
  return client;
}

export const PRODUCT_IMAGES_BUCKET = "product-images";

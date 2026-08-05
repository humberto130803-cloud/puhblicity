import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Memoized per warm lambda so we don't reconstruct the client on every request.
let _client: SupabaseClient | null = null;

/** Server-side Supabase client (service role — writes allowed). Server only. */
export function serviceDb(): SupabaseClient | null {
  if (_client) return _client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  _client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _client;
}

/** Like serviceDb() but throws — for routes that cannot run without it. */
export function mustDb(): SupabaseClient {
  const db = serviceDb();
  if (!db) throw new Error("Supabase service credentials missing");
  return db;
}

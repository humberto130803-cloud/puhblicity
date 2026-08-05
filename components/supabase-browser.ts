"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Browser Supabase client — anon key, used ONLY for signed-URL uploads to
 * storage. Every table read/write goes through our API routes; RLS denies
 * the anon role everything.
 */
let _client: SupabaseClient | null = null;
export function browserSupabase(): SupabaseClient {
  if (!_client) {
    _client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } }
    );
  }
  return _client;
}

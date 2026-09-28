"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";
import { assertSupabaseEnv } from "@/lib/env";

export function createClient() {
  const { url, key } = assertSupabaseEnv();
  return createBrowserClient<Database>(url, key);
}

import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";

/** Returns the verified user id (from the JWT claims) or null. Cached per request. */
export const getUserId = cache(async (): Promise<string | null> => {
  if (!isSupabaseConfigured) return null;
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  return data?.claims?.sub ?? null;
});

/** Use in Server Components / Actions that need a signed-in user. */
export async function requireUserId(next?: string): Promise<string> {
  const id = await getUserId();
  if (!id) redirect(next ? `/auth?mode=login&next=${encodeURIComponent(next)}` : "/auth?mode=login");
  return id;
}

export const getOwnProfile = cache(async () => {
  const userId = await getUserId();
  if (!userId) return null;
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
  return data;
});

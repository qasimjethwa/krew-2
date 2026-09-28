/**
 * Public runtime configuration.
 *
 * NEXT_PUBLIC_* variables must be referenced literally so Next.js can inline
 * them into the browser bundle. Nothing secret belongs here: the Supabase
 * publishable key is designed to be public and is protected by RLS.
 */
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey);

/** Optional: show "Continue with Apple" (requires the Apple provider in Supabase). */
export const appleSignInEnabled = process.env.NEXT_PUBLIC_ENABLE_APPLE_SIGNIN === "true";

export function assertSupabaseEnv(): { url: string; key: string } {
  if (!isSupabaseConfigured) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (see .env.example).",
    );
  }
  return { url: supabaseUrl, key: supabasePublishableKey };
}

import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/site-url";
import { logServerError } from "@/lib/errors";

/**
 * Handles every auth redirect from Supabase:
 *  - OAuth (Google/Apple) and email links using PKCE  → ?code=
 *  - Email OTP links (confirm signup, recovery)        → ?token_hash=&type=
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = safeNextPath(searchParams.get("next"), "/discover");

  if (searchParams.get("error")) {
    return NextResponse.redirect(`${origin}/auth/error?reason=${encodeURIComponent(searchParams.get("error_code") ?? "denied")}`);
  }

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
    logServerError("auth.callback.code", error);
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) return NextResponse.redirect(`${origin}${type === "recovery" ? "/auth/reset-password" : next}`);
    logServerError("auth.callback.otp", error);
  }

  return NextResponse.redirect(`${origin}/auth/error?reason=link`);
}

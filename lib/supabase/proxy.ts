import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/types/database";
import { isSupabaseConfigured, supabasePublishableKey, supabaseUrl } from "@/lib/env";

/** Routes that require a signed-in user. */
const PROTECTED_PREFIXES = ["/onboarding", "/discover", "/people", "/requests", "/connections", "/match", "/account"];
/** Routes a signed-in user doesn't need (they're sent into the app instead). */
const GUEST_ONLY = ["/auth", "/auth/forgot-password"];

function isProtected(pathname: string) {
  return PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/**
 * Refreshes the Supabase session cookie on every matched request and applies
 * coarse route protection. Fine-grained checks (onboarding state, ownership)
 * happen in layouts, server actions and RLS.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  if (!isSupabaseConfigured) {
    // Without credentials the public pages still render; protected pages explain the setup step.
    return response;
  }

  const supabase = createServerClient<Database>(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(headers ?? {}).forEach(([k, v]) => response.headers.set(k, v));
      },
    },
  });

  // IMPORTANT: getClaims() validates the JWT; don't run code between client creation and this call.
  const { data } = await supabase.auth.getClaims();
  const isSignedIn = Boolean(data?.claims?.sub);
  const { pathname, search } = request.nextUrl;

  const redirectTo = (path: string) => {
    const url = request.nextUrl.clone();
    const [p, q] = path.split("?");
    url.pathname = p;
    url.search = q ? `?${q}` : "";
    const redirect = NextResponse.redirect(url);
    response.cookies.getAll().forEach((c) => redirect.cookies.set(c));
    return redirect;
  };

  if (!isSignedIn && isProtected(pathname)) {
    return redirectTo(`/auth?mode=login&next=${encodeURIComponent(pathname + search)}`);
  }
  if (isSignedIn && GUEST_ONLY.includes(pathname)) {
    return redirectTo("/discover");
  }

  return response;
}

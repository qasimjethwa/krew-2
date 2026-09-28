/**
 * Resolves the absolute URL of the running site without hardcoding a domain.
 *
 * Order of precedence:
 *  1. Vercel preview deployments  → the deployment's own URL (VERCEL_URL)
 *  2. NEXT_PUBLIC_SITE_URL         → production / custom domain / localhost
 *  3. VERCEL_PROJECT_PRODUCTION_URL → stable production *.vercel.app domain (set by Vercel)
 *  4. VERCEL_URL                   → any other Vercel deployment
 *  5. http://localhost:3000        → local fallback
 *
 * Moving from the *.vercel.app URL to a custom domain only requires changing
 * NEXT_PUBLIC_SITE_URL in Vercel and the redirect allow-list in Supabase.
 */
export function getSiteUrl(): string {
  const vercelEnv = process.env.VERCEL_ENV;
  const vercelUrl = process.env.VERCEL_URL;

  let url: string;
  if (vercelEnv === "preview" && vercelUrl) {
    url = `https://${vercelUrl}`;
  } else if (process.env.NEXT_PUBLIC_SITE_URL) {
    url = process.env.NEXT_PUBLIC_SITE_URL;
  } else if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    url = `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  } else if (vercelUrl) {
    url = `https://${vercelUrl}`;
  } else {
    url = "http://localhost:3000";
  }

  if (!/^https?:\/\//.test(url)) url = `https://${url}`;
  return url.replace(/\/+$/, "");
}

/** Only allow same-site relative redirects (prevents open redirects). */
export function safeNextPath(next: string | null | undefined, fallback = "/discover"): string {
  if (!next) return fallback;
  if (!next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback;
  return next;
}

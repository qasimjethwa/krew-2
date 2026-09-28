import type { NextConfig } from "next";

/**
 * Allow next/image to optimise profile pictures from:
 *  - this project's Supabase Storage (host derived from NEXT_PUBLIC_SUPABASE_URL, falling back to any *.supabase.co)
 *  - Google account avatars (Google sign-in)
 * No domain is hardcoded for the app itself.
 */
function supabaseImagePattern() {
  try {
    const url = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "");
    return {
      protocol: url.protocol.replace(":", "") as "http" | "https",
      hostname: url.hostname,
      ...(url.port ? { port: url.port } : {}),
      pathname: "/storage/v1/object/public/**",
    };
  } catch {
    return { protocol: "https" as const, hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" };
  }
}

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [
      supabaseImagePattern(),
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;

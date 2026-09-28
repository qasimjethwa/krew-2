import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { LogInForm, SignUpForm } from "@/components/auth/auth-forms";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { Alert } from "@/components/ui/alert";
import { isSupabaseConfigured } from "@/lib/env";
import { safeNextPath } from "@/lib/site-url";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Sign up or log in",
  description: "Create your KREW account or log in to find people nearby who move like you.",
  alternates: { canonical: "/auth" },
};

export default async function AuthPage({ searchParams }: PageProps<"/auth">) {
  const sp = await searchParams;
  const mode = sp.mode === "login" ? "login" : "signup";
  const next = typeof sp.next === "string" ? safeNextPath(sp.next, "") : "";
  const nextQs = next ? `&next=${encodeURIComponent(next)}` : "";

  return (
    <AuthShell>
      <h1 className="text-lg text-mute">Welcome to</h1>
      <p className="font-display mt-1 text-7xl" aria-hidden="true">KREW</p>

      <div role="tablist" aria-label="Account" className="mt-8 grid grid-cols-2 border-b border-line">
        {(["signup", "login"] as const).map((m) => (
          <Link
            key={m}
            role="tab"
            aria-selected={mode === m}
            href={`/auth?mode=${m}${nextQs}`}
            replace
            scroll={false}
            className={cn(
              "-mb-px border-b-2 pb-3 text-center text-[15px] font-semibold transition-colors",
              mode === m ? "border-ink text-ink" : "border-transparent text-mute hover:text-ink",
            )}
          >
            {m === "signup" ? "Sign up" : "Log in"}
          </Link>
        ))}
      </div>

      <div className="mt-7" role="tabpanel">
        {!isSupabaseConfigured ? (
          <Alert tone="info" className="mb-5">
            Accounts aren&apos;t available yet: this deployment is missing its Supabase settings. See the README&apos;s
            &ldquo;Environment variables&rdquo; section.
          </Alert>
        ) : null}
        {mode === "signup" ? <SignUpForm /> : <LogInForm next={next} />}

        <div className="my-6 flex items-center gap-3 text-sm text-mute">
          <span className="h-px flex-1 bg-line" /> or continue with <span className="h-px flex-1 bg-line" />
        </div>
        <OAuthButtons next={next} />

        <p className="mt-8 text-center text-sm text-mute">
          {mode === "signup" ? (
            <>Already have an account? <Link href={`/auth?mode=login${nextQs}`} className="font-semibold text-ink underline-offset-4 hover:underline">Log in</Link></>
          ) : (
            <>New to KREW? <Link href={`/auth?mode=signup${nextQs}`} className="font-semibold text-ink underline-offset-4 hover:underline">Create an account</Link></>
          )}
        </p>
      </div>
    </AuthShell>
  );
}

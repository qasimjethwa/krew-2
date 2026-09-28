import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = { title: "Sign-in problem", robots: { index: false } };

const COPY: Record<string, { title: string; body: string }> = {
  link: {
    title: "This link has expired",
    body: "Sign-in and confirmation links work once and expire after a while. Request a new one and open it on this device.",
  },
  provider: {
    title: "That sign-in option isn't set up yet",
    body: "Use your email and password for now, or try again later.",
  },
  denied: {
    title: "Sign-in was cancelled",
    body: "No changes were made. You can try again whenever you're ready.",
  },
};

export default async function AuthErrorPage({ searchParams }: PageProps<"/auth/error">) {
  const { reason } = await searchParams;
  const copy = COPY[typeof reason === "string" ? reason : ""] ?? COPY.denied;
  return (
    <AuthShell>
      <h1 className="font-condensed text-4xl">{copy.title}</h1>
      <p className="mt-3 leading-relaxed text-mute">{copy.body}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <ButtonLink href="/auth?mode=login">Back to log in</ButtonLink>
        <ButtonLink href="/" variant="outline">Go to homepage</ButtonLink>
      </div>
    </AuthShell>
  );
}

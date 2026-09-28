import type { Metadata } from "next";
import { Wordmark } from "@/components/brand/logo";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <main id="main" className="flex min-h-dvh flex-col bg-ink px-5 py-6 text-paper sm:px-10">
      <Wordmark tone="light" />
      <div className="flex flex-1 flex-col items-start justify-center py-16">
        <p className="text-sm font-semibold text-lime">404</p>
        <h1 className="mt-3 font-display text-[clamp(3.5rem,12vw,8rem)]">
          Lost your
          <br />
          <span className="text-krew">KREW?</span>
        </h1>
        <p className="mt-5 max-w-md text-paper/70">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/" variant="accent" size="lg">
            Go home
          </ButtonLink>
          <ButtonLink href="/discover" variant="inverse" size="lg">
            Discover people
          </ButtonLink>
        </div>
      </div>
    </main>
  );
}

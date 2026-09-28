import { Wordmark } from "@/components/brand/logo";
import { SiteFooter } from "@/components/marketing/site-footer";
import { ButtonLink } from "@/components/ui/button";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="bg-ink">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Wordmark tone="light" />
          <ButtonLink href="/auth?mode=signup" variant="accent" size="sm">
            Find my KREW
          </ButtonLink>
        </div>
      </header>
      <main id="main" className="mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}

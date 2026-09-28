import Link from "next/link";
import { Wordmark } from "@/components/brand/logo";
import { ButtonLink } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="absolute inset-x-0 top-0 z-20">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
        <Wordmark tone="light" />
        <nav aria-label="Main" className="flex items-center gap-1 sm:gap-2">
          <Link href="/#how-it-works" className="hidden rounded-lg px-3 py-2 text-sm text-paper/80 hover:text-paper md:block">
            How it works
          </Link>
          <Link href="/#activities" className="hidden rounded-lg px-3 py-2 text-sm text-paper/80 hover:text-paper md:block">
            Activities
          </Link>
          <Link href="/#contact" className="hidden rounded-lg px-3 py-2 text-sm text-paper/80 hover:text-paper md:block">
            Contact
          </Link>
          <ButtonLink href="/auth?mode=login" variant="inverse" size="sm" className="ml-2">
            Log in
          </ButtonLink>
        </nav>
      </div>
    </header>
  );
}

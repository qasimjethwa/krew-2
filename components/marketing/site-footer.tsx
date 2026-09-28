import Link from "next/link";
import { Wordmark } from "@/components/brand/logo";
import { CONTACT_EMAIL, TAGLINE } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer id="contact" className="border-t border-paper/10 bg-ink text-paper">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Wordmark tone="light" />
          <p className="mt-4 max-w-xs text-sm text-paper/60">{TAGLINE}</p>
        </div>
        <div>
          <h2 className="text-sm font-semibold">Contact</h2>
          <a href={`mailto:${CONTACT_EMAIL}`} className="mt-3 block text-sm text-paper/70 underline-offset-4 hover:text-paper hover:underline">
            {CONTACT_EMAIL}
          </a>
        </div>
        <nav aria-label="Legal">
          <h2 className="text-sm font-semibold">Legal</h2>
          <ul className="mt-3 space-y-2 text-sm text-paper/70">
            <li><Link href="/terms" className="hover:text-paper">Terms of Service</Link></li>
            <li><Link href="/privacy" className="hover:text-paper">Privacy Policy</Link></li>
          </ul>
        </nav>
      </div>
      <div className="mx-auto max-w-7xl px-5 pb-10 text-xs text-paper/40 sm:px-8">© {new Date().getFullYear()} KREW</div>
    </footer>
  );
}

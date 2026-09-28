import type { ReactNode } from "react";
import { Alert } from "@/components/ui/alert";

/** Shared typography for legal pages. */
export function LegalDoc({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <article className="text-[15px] leading-relaxed text-ink/85 [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:font-condensed [&_h2]:text-2xl [&_h2]:text-ink [&_li]:ml-5 [&_li]:list-disc [&_li]:pl-1 [&_p]:mb-4 [&_ul]:mb-4 [&_ul]:space-y-1.5">
      <h1 className="font-display text-[clamp(2.75rem,8vw,4.5rem)] text-ink">{title}</h1>
      <p className="mt-4 text-sm text-mute">Last updated: {updated}</p>
      <Alert tone="info" className="my-8">
        Draft for review. This document is a starting template written from KREW&apos;s current functionality and must be reviewed and
        approved by the client&apos;s legal counsel before launch.
      </Alert>
      {children}
    </article>
  );
}

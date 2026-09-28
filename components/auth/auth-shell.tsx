import type { ReactNode } from "react";
import { LogoMark, Wordmark } from "@/components/brand/logo";
import { PanelPhoto, hasPanelPhoto } from "@/components/brand/panel-photo";
import { TAGLINE } from "@/lib/site";

/** Split layout for auth screens: brand panel on desktop, focused form everywhere. */
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1fr_minmax(480px,560px)]">
      <aside className="relative hidden overflow-hidden bg-ink p-12 text-paper lg:flex lg:flex-col lg:justify-between">
        <PanelPhoto photoKey="auth" sizes="(min-width: 1024px) 60vw, 0px" />
        <Wordmark tone="light" className="relative" />
        {!hasPanelPhoto("auth") ? (
          <LogoMark size={560} className="pointer-events-none absolute -bottom-24 -left-24 opacity-25" />
        ) : null}
        <p className="font-display relative max-w-md text-7xl xl:text-8xl">{TAGLINE}</p>
      </aside>
      <main id="main" className="flex flex-col px-5 py-6 sm:px-10">
        <div className="lg:hidden">
          <Wordmark />
        </div>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">{children}</div>
      </main>
    </div>
  );
}

import Link from "next/link";
import type { ReactNode } from "react";
import { Check, X } from "lucide-react";
import { LogoMark, Wordmark } from "@/components/brand/logo";
import { PanelPhoto, hasPanelPhoto } from "@/components/brand/panel-photo";
import { ONBOARDING_STEPS, stepIndex, type OnboardingStep } from "@/lib/onboarding";
import { cn } from "@/lib/utils";

/**
 * Single-purpose onboarding screen: segmented progress on top (as in the
 * reference), plus a step list in a brand panel on wide screens.
 */
export function StepShell({
  step,
  edit,
  done,
  title,
  subtitle,
  children,
}: {
  step: OnboardingStep;
  edit?: boolean;
  done?: Partial<Record<OnboardingStep, boolean>>;
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  const current = stepIndex(step);
  const total = ONBOARDING_STEPS.length;

  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(320px,400px)_1fr]">
      <aside className="relative hidden overflow-hidden bg-ink p-10 text-paper lg:flex lg:flex-col">
        <PanelPhoto photoKey="onboarding" sizes="(min-width: 1024px) 400px, 0px" />
        <Wordmark tone="light" href={edit ? "/account" : "/"} className="relative" />
        {!hasPanelPhoto("onboarding") ? (
          <LogoMark size={420} className="pointer-events-none absolute -bottom-28 -right-32 opacity-20" />
        ) : null}
        {edit ? (
          <p className="relative mt-16 max-w-xs text-paper/70">Changes are saved to your profile and used for matching straight away.</p>
        ) : (
          <ol className="relative mt-16 space-y-1" aria-label="Setup steps">
            {ONBOARDING_STEPS.map((s, i) => {
              const state = i < current || (done?.[s.slug] && i !== current) ? "done" : i === current ? "current" : "todo";
              return (
                <li key={s.slug} aria-current={state === "current" ? "step" : undefined} className="flex items-center gap-3 py-2">
                  <span
                    className={cn(
                      "grid size-7 place-items-center rounded-full text-xs font-semibold",
                      state === "done" && "bg-lime text-ink",
                      state === "current" && "bg-paper text-ink",
                      state === "todo" && "border border-paper/25 text-paper/50",
                    )}
                  >
                    {state === "done" ? <Check className="size-3.5" strokeWidth={3} aria-hidden="true" /> : i + 1}
                  </span>
                  <span className={cn("text-[15px]", state === "current" ? "font-semibold" : "text-paper/60")}>{s.title}</span>
                </li>
              );
            })}
          </ol>
        )}
      </aside>

      <div className="flex min-h-dvh flex-col">
        <header className="flex items-center justify-between px-5 pt-5 sm:px-10 lg:pt-8">
          <div className="lg:invisible">
            <Wordmark href={null} withMark={false} />
          </div>
          <Link
            href={edit ? "/account" : "/"}
            className="grid size-10 place-items-center rounded-full text-ink hover:bg-mist"
            aria-label={edit ? "Cancel editing" : "Save and exit"}
          >
            <X className="size-5" aria-hidden="true" />
          </Link>
        </header>

        {!edit ? (
          <div className="px-5 pt-5 sm:px-10">
            <div className="mx-auto flex max-w-xl gap-1.5" role="progressbar" aria-label="Setup progress" aria-valuemin={1} aria-valuemax={total} aria-valuenow={current + 1} aria-valuetext={`Step ${current + 1} of ${total}`}>
              {ONBOARDING_STEPS.map((s, i) => (
                <span key={s.slug} className={cn("h-1 flex-1 rounded-full transition-colors", i <= current ? "bg-ink" : "bg-line")} />
              ))}
            </div>
          </div>
        ) : null}

        <main id="main" className="flex flex-1 flex-col px-5 pb-6 pt-8 sm:px-10">
          <div className="mx-auto flex w-full max-w-xl flex-1 flex-col">
            {!edit ? <p className="text-sm font-medium text-mute">Step {current + 1} of {total}</p> : null}
            <h1 className="font-condensed mt-1 text-[2rem] leading-tight sm:text-4xl">{title}</h1>
            {subtitle ? <p className="mt-2 text-mute">{subtitle}</p> : null}
            <div className="mt-7 flex flex-1 flex-col">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}

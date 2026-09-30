import type { Metadata } from "next";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { LogoMark } from "@/components/brand/logo";
import { ButtonLink } from "@/components/ui/button";
import { ActivityArtwork } from "@/components/profile/activity-tile";
import { FALLBACK_ACTIVITIES } from "@/lib/constants";
import { TAGLINE } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: "KREW — Find your people. Move together." },
  alternates: { canonical: "/" },
};

/** Display order for the landing-page activity grid (all ten launch activities). */
const ORDER = ["running", "gym", "cycling", "badminton", "tennis", "pickleball", "football", "yoga", "swimming", "dance"];
const HERO_ACTIVITIES = ORDER.map((slug) => FALLBACK_ACTIVITIES.find((a) => a.slug === slug)!).filter(Boolean);

const STEPS = [
  {
    title: "Tell us how you move",
    body: "Pick your activities — or type your own — plus up to two goals, your level and when you're usually free.",
  },
  {
    title: "See who's nearby",
    body: "Browse people within the distance you're happy to travel, with travel time, shared activities and a match score on every card.",
  },
  {
    title: "Connect on your terms",
    body: "Send a request. Contact details are shared only once you've both said yes — or straight away, if that's what you prefer.",
  },
];

export default function LandingPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="bg-ink text-paper">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <LogoMark
            size={900}
            priority
            className="pointer-events-none absolute -right-72 top-10 hidden opacity-[0.16] lg:block"
          />
          <div className="relative mx-auto grid max-w-7xl gap-12 px-5 pb-16 pt-32 sm:px-8 lg:items-end lg:pb-24 lg:pt-40">
            <div style={{ animation: "krew-rise 700ms cubic-bezier(.2,.7,.2,1) both" }}>
              <h1 className="font-display text-[length:var(--text-display)]">
                Find your
                <br />
                <span className="text-[#FF2DB2]">KREW.</span>
              </h1>
              <p className="mt-7 max-w-md text-lg leading-relaxed text-paper/75">
                Meet people nearby who share your sports, goals and schedule.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <ButtonLink href="/auth?mode=signup" variant="accent" size="lg">
                  Find my KREW <ArrowRight className="size-4" aria-hidden="true" />
                </ButtonLink>
                <ButtonLink href="/auth?mode=login" variant="ghost" size="lg" className="text-paper hover:bg-paper/10">
                  I already have an account
                </ButtonLink>
              </div>
            </div>

          </div>
        </section>

        {/* Activities */}
        <section id="activities" aria-labelledby="activities-title" className="scroll-mt-10 border-t border-paper/10">
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <h2 id="activities-title" className="font-condensed max-w-lg text-4xl sm:text-5xl">
                Whatever gets you moving
              </h2>
              <p className="max-w-sm text-paper/65">
                Ten activities to start with, and room to add your own — bouldering, kabaddi, anything.
              </p>
            </div>
            <ul className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {HERO_ACTIVITIES.map((a) => (
                <li key={a.slug} className="group">
                  <ActivityArtwork
                    slug={a.slug}
                    label={a.label}
                    className="aspect-[4/5] rounded-2xl [&>span]:bottom-3.5 [&>span]:left-4 [&>span]:text-base"
                    sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
                  />
                </li>
              ))}
            </ul>
            <p className="font-condensed mt-14 max-w-2xl text-3xl leading-tight text-paper/90 sm:text-4xl">
              A stronger, healthier, more active you — together.
            </p>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" aria-labelledby="how-title" className="scroll-mt-10 bg-paper text-ink">
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-24">
            <h2 id="how-title" className="font-condensed text-4xl sm:text-5xl">How KREW works</h2>
            <ol className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
              {STEPS.map((s, i) => (
                <li key={s.title} className="border-t-2 border-ink pt-5">
                  <span className="font-display text-6xl text-ink/15" aria-hidden="true">{i + 1}</span>
                  <h3 className="mt-2 text-xl font-semibold">{s.title}</h3>
                  <p className="mt-2 max-w-sm leading-relaxed text-mute">{s.body}</p>
                </li>
              ))}
            </ol>

            <div className="mt-16 flex flex-col gap-4 rounded-3xl bg-mist p-6 sm:flex-row sm:items-center sm:gap-6 sm:p-8">
              <ShieldCheck className="size-8 shrink-0" aria-hidden="true" />
              <p className="max-w-3xl leading-relaxed">
                People see your area and roughly how far away you are — never your exact location. You choose whether to
                match with anyone or only people of your gender, and your contact details stay private until you&apos;re connected.
              </p>
            </div>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="relative overflow-hidden">
          <div className="mx-auto flex max-w-7xl flex-col items-start gap-8 px-5 py-20 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:py-28">
            <div className="flex items-center gap-5">
              <LogoMark size={88} />
              <p className="font-condensed text-3xl sm:text-5xl">{TAGLINE}</p>
            </div>
            <ButtonLink href="/auth?mode=signup" variant="accent" size="lg">
              Create your profile <ArrowRight className="size-4" aria-hidden="true" />
            </ButtonLink>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

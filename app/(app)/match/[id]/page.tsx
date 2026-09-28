import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarClock, Check, MapPin, Target } from "lucide-react";
import { ContactReveal } from "@/components/match/contact-reveal";
import { ActivityIcon } from "@/components/profile/activity-icon";
import { Avatar } from "@/components/profile/avatar";
import { AVAILABILITY } from "@/lib/constants";
import { logServerError } from "@/lib/errors";
import { createClient } from "@/lib/supabase/server";
import { formatDistance } from "@/lib/travel";
import { firstName, joinNatural } from "@/lib/utils";

export const metadata: Metadata = { title: "You found your KREW!" };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Decorative confetti dashes, as in the approved "Match & Connect" screen. */
const CONFETTI = [
  { l: "6%", t: "14%", r: -30, c: "var(--color-k-cyan)" },
  { l: "14%", t: "38%", r: 20, c: "var(--color-lime)" },
  { l: "9%", t: "62%", r: -12, c: "var(--color-k-orange)" },
  { l: "88%", t: "12%", r: 35, c: "var(--color-k-magenta)" },
  { l: "93%", t: "36%", r: -25, c: "var(--color-lime)" },
  { l: "84%", t: "58%", r: 15, c: "var(--color-k-violet)" },
  { l: "30%", t: "6%", r: 60, c: "var(--color-k-orange)" },
  { l: "70%", t: "5%", r: -55, c: "var(--color-k-cyan)" },
];

function togetherLine(name: string, activity: string | null, slots: string[]) {
  const when = AVAILABILITY.filter((a) => slots.includes(a.value)).map((a) => a.phrase);
  const what = activity ? `are both into ${activity.toLowerCase()}` : "both want to move together";
  return `You and ${name} ${what}${when.length ? ` and are usually free ${joinNatural(when)}` : ""}.`;
}

export default async function MatchPage({ params }: PageProps<"/match/[id]">) {
  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_match", { p_connection: id });
  if (error) logServerError("get_match", error);
  const m = data?.[0];
  if (!m) notFound();

  const name = firstName(m.other_name);
  const activity = m.activity_label ?? m.shared_activities?.[0] ?? null;
  const when = AVAILABILITY.filter((a) => m.shared_availability?.includes(a.value)).map((a) => a.label);

  return (
    <div className="px-0 py-0 sm:px-8 sm:py-10">
      <section
        aria-labelledby="match-title"
        className="relative mx-auto max-w-xl overflow-hidden bg-ink px-6 pt-12 pb-8 text-paper sm:rounded-[2rem] sm:px-10"
      >
        <div aria-hidden="true">
          {CONFETTI.map((c, i) => (
            <span
              key={i}
              className="absolute h-1 w-5 rounded-full animate-[krew-fade_.6s_ease-out]"
              style={{ left: c.l, top: c.t, transform: `rotate(${c.r}deg)`, background: c.c }}
            />
          ))}
        </div>

        <h1 id="match-title" className="relative text-center font-display text-[clamp(2.6rem,9vw,3.75rem)]">
          You found your
          <br />
          <span className="text-krew">KREW!</span>
        </h1>

        <div className="relative mx-auto mt-8 flex max-w-sm items-center justify-center">
          <Avatar
            name={m.my_name}
            path={m.my_avatar_path}
            external={m.my_external_avatar_url}
            size={132}
            className="border-4 border-ink ring-2 ring-paper/15"
            priority
          />
          <span className="z-10 -mx-5 grid size-14 place-items-center rounded-full bg-lime text-ink ring-4 ring-ink animate-[krew-pop_.5s_ease-out]">
            <Check className="size-7 stroke-[3]" aria-hidden="true" />
          </span>
          <Avatar
            name={m.other_name}
            path={m.other_avatar_path}
            external={m.other_external_avatar_url}
            size={132}
            className="border-4 border-ink ring-2 ring-paper/15"
            priority
          />
        </div>

        <p className="relative mt-6 text-center text-[17px] leading-snug text-paper/90">
          {togetherLine(name, activity, m.shared_availability ?? [])}
        </p>

        <ul className="relative mt-7 space-y-3 rounded-2xl bg-ink-2 p-5 text-[15px]">
          {m.shared_activities?.length ? (
            <li className="flex items-center gap-3">
              <ActivityIcon activityKey={m.shared_activities[0].toLowerCase()} className="size-5 shrink-0 text-lime" />
              {m.shared_activities.join(", ")}
            </li>
          ) : null}
          {m.area_name || m.distance_km != null ? (
            <li className="flex items-center gap-3">
              <MapPin className="size-5 shrink-0 text-lime" aria-hidden="true" />
              {[m.area_name, m.distance_km != null ? `(${formatDistance(m.distance_km)})` : null].filter(Boolean).join(" ")}
            </li>
          ) : null}
          {when.length ? (
            <li className="flex items-center gap-3">
              <CalendarClock className="size-5 shrink-0 text-lime" aria-hidden="true" />
              {when.join(", ")}
            </li>
          ) : null}
          {m.shared_goals?.length ? (
            <li className="flex items-center gap-3">
              <Target className="size-5 shrink-0 text-lime" aria-hidden="true" />
              {m.shared_goals.join(", ")}
            </li>
          ) : null}
        </ul>

        <div className="relative mt-7">
          <ContactReveal name={name} contacts={{ phone: m.contact_phone, instagram: m.contact_instagram, email: m.contact_email }} />
        </div>

        <div className="relative mt-5 flex flex-col items-center gap-2 text-sm">
          <Link href={`/people/${m.other_id}`} className="rounded-md px-2 py-1 text-paper/85 hover:text-paper">
            View {name}&apos;s profile
          </Link>
          <Link href="/discover" className="rounded-md px-2 py-1 font-semibold underline underline-offset-4 hover:text-lime">
            Continue discovering
          </Link>
        </div>
      </section>
    </div>
  );
}

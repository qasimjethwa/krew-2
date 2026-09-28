import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Ban, CalendarClock, Gauge, Target } from "lucide-react";
import { cancelRequest, respondToRequest } from "@/app/(app)/actions";
import { ConnectButton } from "@/components/people/connect-button";
import { ActivityIcon } from "@/components/profile/activity-icon";
import { ProfilePhoto } from "@/components/profile/avatar";
import { ProximityLine, scheduleLabels } from "@/components/profile/facts";
import { MatchBadge } from "@/components/profile/match-badge";
import { Alert } from "@/components/ui/alert";
import { Button, ButtonLink } from "@/components/ui/button";
import { Tag } from "@/components/ui/tag";
import { FITNESS_LEVELS, labelFor } from "@/lib/constants";
import { logServerError } from "@/lib/errors";
import { createClient } from "@/lib/supabase/server";
import { firstName, toTags } from "@/lib/utils";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function loadProfile(id: string) {
  if (!UUID_RE.test(id)) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_profile", { p_user: id });
  if (error) logServerError("get_profile", error);
  return data?.[0] ?? null;
}

export async function generateMetadata({ params }: PageProps<"/people/[id]">): Promise<Metadata> {
  const p = await loadProfile((await params).id);
  return { title: p?.full_name ? firstName(p.full_name) : "Profile" };
}

export default async function PersonPage({ params }: PageProps<"/people/[id]">) {
  const { id } = await params;
  const p = await loadProfile(id);
  if (!p) notFound();

  const name = firstName(p.full_name);
  const activities = toTags(p.activities);
  const goals = toTags(p.goals);
  const shared = new Set(p.shared_activities ?? []);
  const sharedLabel = p.shared_activities?.[0] ?? null;
  const schedule = scheduleLabels(p.availability);
  const title = [p.full_name, p.age].filter((v) => v != null && v !== "").join(", ");

  return (
    <div className="mx-auto max-w-5xl pb-28 md:px-8 md:py-10 md:pb-10">
      <div className="md:grid md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:gap-10">
        {/* Photo */}
        <div className="relative md:sticky md:top-24 md:self-start">
          <ProfilePhoto
            name={p.full_name}
            path={p.avatar_path}
            external={p.external_avatar_url}
            sizes="(min-width: 768px) 420px, 100vw"
            priority
            className="aspect-[4/5] w-full md:rounded-3xl"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/85 via-transparent to-ink/30 md:rounded-3xl" aria-hidden="true" />
          <Link
            href="/discover"
            className="absolute top-4 left-4 grid size-10 place-items-center rounded-full bg-paper/90 text-ink backdrop-blur hover:bg-paper"
            aria-label="Back to Discover"
          >
            <ArrowLeft className="size-5" aria-hidden="true" />
          </Link>
          <div className="absolute inset-x-0 bottom-0 p-5 text-paper">
            <h1 className="font-condensed text-4xl leading-none">{title}</h1>
            <ProximityLine km={p.distance_km} area={p.area_name ?? p.city} className="mt-2 text-sm text-paper/90" />
          </div>
        </div>

        {/* Details */}
        <div className="space-y-7 px-5 pt-6 md:px-0 md:pt-2">
          <div className="flex flex-wrap items-center gap-3">
            <MatchBadge percent={p.match_percent} />
          </div>

          {p.bio ? (
            <section>
              <h2 className="mb-2 text-sm font-bold tracking-wide uppercase">About</h2>
              <p className="text-[15px] leading-relaxed text-ink/85">{p.bio}</p>
            </section>
          ) : null}

          <section>
            <h2 className="mb-3 text-sm font-bold tracking-wide uppercase">Interests</h2>
            <ul className="flex flex-wrap gap-2">
              {activities.map((a) => (
                <li key={a.key}>
                  <Tag highlight={shared.has(a.label)} icon={<ActivityIcon activityKey={a.key} className="size-4" />}>
                    {a.label}
                  </Tag>
                </li>
              ))}
            </ul>
            {shared.size ? <p className="mt-2 text-sm text-mute">Highlighted: activities you both enjoy.</p> : null}
          </section>

          {goals.length ? (
            <section>
              <h2 className="mb-3 text-sm font-bold tracking-wide uppercase">Goals</h2>
              <ul className="flex flex-wrap gap-2">
                {goals.map((g) => (
                  <li key={g.key}>
                    <Tag icon={<Target className="size-4" aria-hidden="true" />}>{g.label}</Tag>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <dl className="grid grid-cols-2 gap-4 rounded-2xl bg-mist p-5">
            <div>
              <dt className="flex items-center gap-1.5 text-sm font-bold">
                <Gauge className="size-4" aria-hidden="true" /> Fitness level
              </dt>
              <dd className="mt-1 text-[15px] text-ink/80">{labelFor(FITNESS_LEVELS, p.fitness_level) || "—"}</dd>
            </div>
            <div>
              <dt className="flex items-center gap-1.5 text-sm font-bold">
                <CalendarClock className="size-4" aria-hidden="true" /> Schedule
              </dt>
              <dd className="mt-1 text-[15px] text-ink/80">{schedule.length ? schedule.join(", ") : "—"}</dd>
            </div>
          </dl>

          {/* Action bar: fixed on mobile, inline on desktop */}
          <div className="fixed inset-x-0 bottom-[calc(4.25rem+env(safe-area-inset-bottom))] z-20 border-t border-line bg-paper/95 p-4 backdrop-blur md:static md:border-0 md:bg-transparent md:p-0">
            <ConnectionAction
              id={id}
              name={name}
              sharedLabel={sharedLabel}
              status={p.connection_status}
              direction={p.connection_direction}
              connectionId={p.connection_id}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ConnectionAction({
  id,
  name,
  sharedLabel,
  status,
  direction,
  connectionId,
}: {
  id: string;
  name: string;
  sharedLabel: string | null;
  status: "none" | "pending" | "accepted" | "unavailable";
  direction: "sent" | "received" | null;
  connectionId: string | null;
}) {
  if (status === "accepted" && connectionId) {
    return (
      <ButtonLink href={`/match/${connectionId}`} variant="accent" size="lg" className="w-full">
        You&apos;re connected — view contact details
      </ButtonLink>
    );
  }
  if (status === "pending" && direction === "received" && connectionId) {
    return (
      <form action={respondToRequest} className="grid gap-2">
        <p className="text-center text-sm text-mute md:text-left">{name} wants to connect with you.</p>
        <input type="hidden" name="connectionId" value={connectionId} />
        <div className="grid grid-cols-2 gap-2">
          <Button type="submit" name="decision" value="decline" variant="outline" size="lg">
            Decline
          </Button>
          <Button type="submit" name="decision" value="accept" size="lg">
            Accept
          </Button>
        </div>
      </form>
    );
  }
  if (status === "pending" && connectionId) {
    return (
      <form action={cancelRequest} className="grid gap-2">
        <input type="hidden" name="connectionId" value={connectionId} />
        <input type="hidden" name="from" value={`/people/${id}`} />
        <Button type="button" size="lg" disabled className="w-full">
          Request sent — waiting for {name}
        </Button>
        <Button type="submit" variant="ghost" size="sm" className="mx-auto">
          Withdraw request
        </Button>
      </form>
    );
  }
  if (status === "unavailable") {
    return (
      <Alert tone="info">
        <span className="inline-flex items-center gap-1.5">
          <Ban className="size-4" aria-hidden="true" />
          Connecting with {name} isn&apos;t available.
        </span>
      </Alert>
    );
  }
  return <ConnectButton targetId={id} name={name} activity={sharedLabel} />;
}

import type { Metadata } from "next";
import { DiscoverFeed } from "@/components/discover/discover-feed";
import { DiscoverFilters, type DiscoverFilterValues } from "@/components/discover/filters";
import type { DiscoverCard } from "@/components/discover/types";
import { Alert } from "@/components/ui/alert";
import { AVAILABILITY, FITNESS_LEVELS, TRAVEL_RADII } from "@/lib/constants";
import { logServerError } from "@/lib/errors";
import { getLookups } from "@/lib/onboarding";
import { createClient } from "@/lib/supabase/server";
import { toTags } from "@/lib/utils";
import type { AvailabilitySlot, FitnessLevel } from "@/types/app";

export const metadata: Metadata = { title: "Discover" };

const PAGE_SIZE = 24;

function one(v: string | string[] | undefined) {
  return (Array.isArray(v) ? v[0] : v) ?? "";
}

export default async function DiscoverPage({ searchParams }: PageProps<"/discover">) {
  const sp = await searchParams;
  const { activities } = await getLookups();

  // Only accept known values from the URL.
  const values: DiscoverFilterValues = {
    activity: activities.some((a) => a.slug === one(sp.activity)) ? one(sp.activity) : "",
    level: FITNESS_LEVELS.some((l) => l.value === one(sp.level)) ? one(sp.level) : "",
    time: AVAILABILITY.some((a) => a.value === one(sp.time)) ? one(sp.time) : "",
    km: TRAVEL_RADII.some((r) => String(r.maxKm) === one(sp.km)) ? one(sp.km) : "",
  };
  const activeCount = Object.values(values).filter(Boolean).length;

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("discover_profiles", {
    p_activity: values.activity || null,
    p_fitness_level: (values.level || null) as FitnessLevel | null,
    p_availability: (values.time || null) as AvailabilitySlot | null,
    p_max_km: values.km ? Number(values.km) : null,
    p_limit: PAGE_SIZE,
    p_offset: 0,
  });
  if (error) logServerError("discover", error);

  const cards: DiscoverCard[] = (data ?? []).map((r) => ({
    id: r.user_id,
    name: r.full_name,
    age: r.age,
    avatarPath: r.avatar_path,
    externalAvatar: r.external_avatar_url,
    area: r.area_name ?? r.city,
    distanceKm: Number(r.distance_km),
    level: r.fitness_level,
    slots: r.availability ?? [],
    activities: toTags(r.activities),
    goals: toTags(r.goals),
    sharedActivities: r.shared_activities ?? [],
    matchPercent: r.match_percent,
  }));

  const welcome = one(sp.welcome) === "1";

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[clamp(2.75rem,7vw,4.75rem)]">
            Discover
            <br />
            your <span className="text-krew">KREW</span>
          </h1>
          <p className="mt-3 text-[15px] text-mute">People nearby who match your vibe — activities, goals, level and schedule.</p>
        </div>
        <DiscoverFilters values={values} activities={activities} activeCount={activeCount} />
      </div>

      {welcome ? (
        <Alert tone="success" className="mb-6">
          You&apos;re all set! Here are people near you. Tap a card for the full profile, then Connect or Skip.
        </Alert>
      ) : null}
      {error ? (
        <Alert tone="error" className="mb-6">
          We couldn&apos;t load people right now. Please refresh in a moment.
        </Alert>
      ) : (
        <DiscoverFeed key={JSON.stringify(values)} cards={cards} filtered={activeCount > 0} />
      )}
    </div>
  );
}

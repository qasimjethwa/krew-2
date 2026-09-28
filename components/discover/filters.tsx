import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";
import { AVAILABILITY, FITNESS_LEVELS, TRAVEL_RADII } from "@/lib/constants";
import { buttonClasses } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type DiscoverFilterValues = {
  activity: string;
  level: string;
  time: string;
  km: string;
};

const selectClass =
  "h-11 w-full rounded-xl border border-line bg-paper px-3 text-[15px] text-ink hover:border-mute/60 focus:border-ink focus:outline-none focus:ring-2 focus:ring-ink/10";

/**
 * Discovery filters. A plain GET form, so it works without JavaScript and
 * filters live in the URL (shareable, back-button friendly).
 */
export function DiscoverFilters({
  values,
  activities,
  activeCount,
}: {
  values: DiscoverFilterValues;
  activities: { slug: string; label: string }[];
  activeCount: number;
}) {
  return (
    <details className="group relative">
      <summary
        className={cn(
          buttonClasses(activeCount ? "primary" : "outline", "md"),
          "cursor-pointer list-none [&::-webkit-details-marker]:hidden",
        )}
      >
        <SlidersHorizontal className="size-4" aria-hidden="true" />
        Filters
        {activeCount ? (
          <span className="grid size-5 place-items-center rounded-full bg-lime text-[11px] font-bold text-ink">{activeCount}</span>
        ) : null}
      </summary>

      <form
        method="get"
        action="/discover"
        className="absolute right-0 z-20 mt-2 w-[min(22rem,calc(100vw-2.5rem))] space-y-4 rounded-2xl border border-line bg-paper p-5 shadow-lift"
      >
        <p className="font-condensed text-xl">Filter people</p>
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold">Activity</span>
          <select name="activity" defaultValue={values.activity} className={selectClass}>
            <option value="">Any activity</option>
            {activities.map((a) => (
              <option key={a.slug} value={a.slug}>
                {a.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold">Fitness level</span>
          <select name="level" defaultValue={values.level} className={selectClass}>
            <option value="">Any level</option>
            {FITNESS_LEVELS.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold">Free to work out</span>
          <select name="time" defaultValue={values.time} className={selectClass}>
            <option value="">Any time</option>
            {AVAILABILITY.map((a) => (
              <option key={a.value} value={a.value}>
                {a.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold">Distance</span>
          <select name="km" defaultValue={values.km} className={selectClass}>
            <option value="">Up to my travel preference</option>
            {TRAVEL_RADII.map((r) => (
              <option key={r.value} value={String(r.maxKm)}>
                Within {r.maxKm} km
              </option>
            ))}
          </select>
        </label>
        <div className="flex gap-2 pt-1">
          <Link href="/discover" className={buttonClasses("ghost", "md", "flex-1")}>
            Reset
          </Link>
          <button type="submit" className={buttonClasses("primary", "md", "flex-1")}>
            Show people
          </button>
        </div>
      </form>
    </details>
  );
}

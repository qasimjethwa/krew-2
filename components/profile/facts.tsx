import { CalendarClock, MapPin, Target } from "lucide-react";
import { AVAILABILITY, FITNESS_LEVELS, labelFor } from "@/lib/constants";
import { formatDistance, formatTravel } from "@/lib/travel";
import { joinNatural } from "@/lib/utils";
import type { AvailabilitySlot, FitnessLevel, Tag } from "@/types/app";
import { ActivityIcon } from "./activity-icon";

export function scheduleSummary(slots: AvailabilitySlot[] | null | undefined) {
  if (!slots?.length) return "";
  const phrases = AVAILABILITY.filter((a) => slots.includes(a.value)).map((a) => a.phrase);
  return `Usually free ${joinNatural(phrases)}`;
}

export function scheduleLabels(slots: AvailabilitySlot[] | null | undefined) {
  return AVAILABILITY.filter((a) => slots?.includes(a.value)).map((a) => a.label);
}

export function ProximityLine({ km, area, className }: { km: number | null | undefined; area?: string | null; className?: string }) {
  if (km == null && !area) return null;
  return (
    <p className={className}>
      <MapPin className="mr-1 inline size-3.5 -translate-y-px" aria-hidden="true" />
      {km != null ? (
        <>
          {formatDistance(km)} <span className="opacity-70">· {formatTravel(km)}</span>
        </>
      ) : null}
      {area ? <span>{km != null ? " · " : ""}{area}</span> : null}
    </p>
  );
}

export function CardFacts({
  activities,
  goals,
  level,
  slots,
}: {
  activities: Tag[];
  goals: Tag[];
  level: FitnessLevel | null;
  slots: AvailabilitySlot[];
}) {
  return (
    <ul className="space-y-1.5 text-sm">
      {activities.length ? (
        <li className="flex items-center gap-2">
          <ActivityIcon activityKey={activities[0].key} className="size-4 shrink-0" />
          <span className="truncate">{activities.slice(0, 3).map((a) => a.label).join(", ")}</span>
        </li>
      ) : null}
      {goals.length || level ? (
        <li className="flex items-center gap-2">
          <Target className="size-4 shrink-0" aria-hidden="true" />
          <span className="truncate">{[goals[0]?.label, labelFor(FITNESS_LEVELS, level)].filter(Boolean).join(", ")}</span>
        </li>
      ) : null}
      {slots.length ? (
        <li className="flex items-center gap-2">
          <CalendarClock className="size-4 shrink-0" aria-hidden="true" />
          <span className="truncate">{scheduleSummary(slots)}</span>
        </li>
      ) : null}
    </ul>
  );
}


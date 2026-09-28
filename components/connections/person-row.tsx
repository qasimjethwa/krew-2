import Link from "next/link";
import type { ReactNode } from "react";
import { Target } from "lucide-react";
import { ActivityIcon } from "@/components/profile/activity-icon";
import { ProfilePhoto } from "@/components/profile/avatar";
import { ProximityLine, scheduleLabels } from "@/components/profile/facts";
import { toTags } from "@/lib/utils";
import type { Database } from "@/types/database";

export type ConnectionRow = Database["public"]["Functions"]["list_connections"]["Returns"][number];

/** Request / connection card, as in the "Incoming Request" reference screen. */
export function PersonRow({ row, href, children, note }: { row: ConnectionRow; href: string; children?: ReactNode; note?: ReactNode }) {
  const activities = toTags(row.activities);
  const goals = toTags(row.goals);
  const title = [row.other_name, row.other_age].filter((v) => v != null && v !== "").join(", ");

  return (
    <article className="flex gap-4 rounded-2xl border border-line bg-paper p-4 transition-colors hover:border-mute/50 sm:gap-5">
      <Link href={href} className="shrink-0 rounded-xl" aria-label={`Open ${row.other_name ?? "profile"}`}>
        <ProfilePhoto
          name={row.other_name}
          path={row.other_avatar_path}
          external={row.other_external_avatar_url}
          sizes="112px"
          className="size-24 rounded-xl sm:size-28 [&_span]:text-4xl"
        />
      </Link>
      <div className="min-w-0 flex-1">
        <h3 className="font-condensed text-xl leading-tight">
          <Link href={href} className="hover:underline">
            {title || "KREW member"}
          </Link>
        </h3>
        <ProximityLine km={row.distance_km} area={row.area_name} className="mt-0.5 text-sm text-mute" />
        <ul className="mt-2 space-y-1 text-sm text-ink/80">
          {activities.length ? (
            <li className="flex items-center gap-1.5 truncate">
              <ActivityIcon activityKey={activities[0].key} className="size-4 shrink-0" />
              {activities.slice(0, 3).map((a) => a.label).join(" · ")}
            </li>
          ) : null}
          {goals.length || row.availability?.length ? (
            <li className="flex items-center gap-1.5 truncate">
              <Target className="size-4 shrink-0" aria-hidden="true" />
              {[goals[0]?.label, scheduleLabels(row.availability).join(", ")].filter(Boolean).join(" · ")}
            </li>
          ) : null}
        </ul>
        {note ? <div className="mt-2 text-sm text-mute">{note}</div> : null}
        {children ? <div className="mt-3 flex flex-wrap gap-2">{children}</div> : null}
      </div>
    </article>
  );
}

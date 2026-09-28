import Link from "next/link";
import { Heart, X } from "lucide-react";
import { ProfilePhoto } from "@/components/profile/avatar";
import { CardFacts, ProximityLine } from "@/components/profile/facts";
import { MatchBadge } from "@/components/profile/match-badge";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import type { DiscoverCard } from "./types";

export function ProfileCard({
  card,
  busy,
  onSkip,
  onConnect,
  priority,
}: {
  card: DiscoverCard;
  busy: "skip" | "connect" | null;
  onSkip: () => void;
  onConnect: () => void;
  priority?: boolean;
}) {
  const title = [card.name, card.age].filter((v) => v != null && v !== "").join(", ");
  const shared = new Set(card.sharedActivities);
  const activities = [...card.activities].sort((a, b) => Number(shared.has(b.label)) - Number(shared.has(a.label)));

  return (
    <article
      aria-label={title}
      className="group relative flex flex-col overflow-hidden rounded-3xl bg-ink text-paper shadow-lift animate-[krew-rise_.3s_ease-out]"
    >
      <Link href={`/people/${card.id}`} className="relative block focus-visible:outline-offset-[-4px]">
        <ProfilePhoto
          name={card.name}
          path={card.avatarPath}
          external={card.externalAvatar}
          sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
          priority={priority}
          className="aspect-[4/5] w-full transition-transform duration-500 group-hover:scale-[1.02]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-transparent" aria-hidden="true" />
        <div className="absolute inset-x-0 bottom-0 p-5">
          <div className="flex items-end justify-between gap-3">
            <h3 className="font-condensed text-[28px] leading-none">{title || "KREW member"}</h3>
            <MatchBadge percent={card.matchPercent} className="shrink-0" />
          </div>
          <ProximityLine km={card.distanceKm} area={card.area} className="mt-2 text-sm text-paper/85" />
          <div className="mt-3 text-paper/90">
            <CardFacts activities={activities} goals={card.goals} level={card.level} slots={card.slots} />
          </div>
          <span className="sr-only">Open full profile</span>
        </div>
      </Link>

      <div className="flex items-center justify-center gap-8 bg-ink px-5 pt-1 pb-5">
        <ActionButton label="Skip" ariaLabel={`Skip ${card.name ?? "this person"}`} onClick={onSkip} disabled={busy !== null} pending={busy === "skip"} tone="skip">
          <X className="size-6" aria-hidden="true" />
        </ActionButton>
        <ActionButton label="Connect" ariaLabel={`Connect with ${card.name ?? "this person"}`} onClick={onConnect} disabled={busy !== null} pending={busy === "connect"} tone="connect">
          <Heart className="size-6 fill-current" aria-hidden="true" />
        </ActionButton>
      </div>
    </article>
  );
}

function ActionButton({
  label,
  onClick,
  disabled,
  pending,
  tone,
  ariaLabel,
  children,
}: {
  label: string;
  ariaLabel: string;
  onClick: () => void;
  disabled: boolean;
  pending: boolean;
  tone: "skip" | "connect";
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label={ariaLabel}
        className={cn(
          "grid size-14 place-items-center rounded-full transition-[transform,background-color] duration-150 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100",
          tone === "skip" ? "bg-paper text-ink hover:bg-mist" : "bg-lime text-ink hover:bg-lime-deep",
        )}
      >
        {pending ? <Spinner className="size-5" /> : children}
      </button>
      <span className="text-xs font-semibold text-paper/80" aria-hidden="true">
        {label}
      </span>
    </div>
  );
}

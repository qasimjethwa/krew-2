import { cn } from "@/lib/utils";

/** Match percentage — one of the few places the logo gradient appears in-product. */
export function MatchBadge({ percent, className }: { percent: number | null | undefined; className?: string }) {
  if (percent == null) return null;
  return (
    <span className={cn("inline-flex items-center rounded-full bg-krew p-px", className)}>
      <span className="rounded-full bg-ink px-2.5 py-0.5 text-xs font-semibold text-paper">{percent}% match</span>
    </span>
  );
}

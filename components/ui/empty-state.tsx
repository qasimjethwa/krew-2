import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon,
  title,
  children,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto flex max-w-md flex-col items-center px-6 py-16 text-center", className)}>
      {icon ? <div className="mb-5 grid size-14 place-items-center rounded-2xl bg-mist text-ink">{icon}</div> : null}
      <h2 className="font-condensed text-2xl">{title}</h2>
      {children ? <div className="mt-2 text-[15px] leading-relaxed text-mute">{children}</div> : null}
      {action ? <div className="mt-6 flex flex-wrap justify-center gap-3">{action}</div> : null}
    </div>
  );
}

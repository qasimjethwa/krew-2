import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Tag({ children, highlight, icon, className }: { children: ReactNode; highlight?: boolean; icon?: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm",
        highlight ? "border-ink bg-ink text-paper" : "border-line bg-paper text-ink",
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}

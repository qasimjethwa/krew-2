"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Inbox, UsersRound } from "lucide-react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/discover", label: "Discover", icon: Compass, match: ["/discover", "/people"] },
  { href: "/requests", label: "Requests", icon: Inbox, match: ["/requests"] },
  { href: "/connections", label: "Connections", icon: UsersRound, match: ["/connections", "/match"] },
] as const;

function isActive(pathname: string, match: readonly string[]) {
  return match.some((m) => pathname === m || pathname.startsWith(`${m}/`));
}

function Badge({ count, className }: { count: number; className?: string }) {
  if (!count) return null;
  return (
    <span
      className={cn(
        "grid min-w-5 place-items-center rounded-full bg-lime px-1.5 text-[11px] leading-5 font-bold text-ink",
        className,
      )}
    >
      {count > 9 ? "9+" : count}
      <span className="sr-only"> pending {count === 1 ? "request" : "requests"}</span>
    </span>
  );
}

/** Desktop header links. */
export function DesktopNavLinks({ pending }: { pending: number }) {
  const pathname = usePathname();
  return (
    <ul className="hidden items-center gap-1 md:flex">
      {LINKS.map(({ href, label, icon: Icon, match }) => {
        const active = isActive(pathname, match);
        return (
          <li key={href}>
            <Link
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors",
                active ? "bg-ink text-paper" : "text-ink hover:bg-mist",
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
              {label}
              {href === "/requests" ? <Badge count={pending} /> : null}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/** Mobile bottom tab bar — mirrors the icon row in the approved reference. */
export function MobileTabBar({ pending, profileSlot }: { pending: number; profileSlot: React.ReactNode }) {
  const pathname = usePathname();
  const accountActive = pathname.startsWith("/account");
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      <ul className="mx-auto grid max-w-md grid-cols-4">
        {LINKS.map(({ href, label, icon: Icon, match }) => {
          const active = isActive(pathname, match);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn("flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold", active ? "text-ink" : "text-mute")}
              >
                <span className="relative">
                  <Icon className={cn("size-5.5", active && "stroke-[2.4]")} aria-hidden="true" />
                  {href === "/requests" ? <Badge count={pending} className="absolute -top-1.5 -right-3" /> : null}
                </span>
                {label}
              </Link>
            </li>
          );
        })}
        <li>
          <Link
            href="/account"
            aria-current={accountActive ? "page" : undefined}
            className={cn("flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold", accountActive ? "text-ink" : "text-mute")}
          >
            <span className={cn("rounded-full ring-2", accountActive ? "ring-ink" : "ring-transparent")}>{profileSlot}</span>
            Profile
          </Link>
        </li>
      </ul>
    </nav>
  );
}

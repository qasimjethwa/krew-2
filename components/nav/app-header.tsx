import Link from "next/link";
import { Wordmark } from "@/components/brand/logo";
import { Avatar } from "@/components/profile/avatar";
import { DesktopNavLinks, MobileTabBar } from "./nav-links";

type Me = { name: string | null; avatarPath: string | null; externalAvatar: string | null };

export function AppHeader({ me, pending }: { me: Me; pending: number }) {
  return (
    <>
      <header className="sticky top-0 z-30 border-b border-line bg-paper/90 backdrop-blur">
        <nav aria-label="Main" className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
          <Wordmark href="/discover" />
          <DesktopNavLinks pending={pending} />
          <Link
            href="/account"
            className="hidden items-center gap-2 rounded-full py-1 pr-3 pl-1 text-sm font-semibold hover:bg-mist md:flex"
          >
            <Avatar name={me.name} path={me.avatarPath} external={me.externalAvatar} size={32} />
            Profile
          </Link>
        </nav>
      </header>
      <MobileTabBar
        pending={pending}
        profileSlot={<Avatar name={me.name} path={me.avatarPath} external={me.externalAvatar} size={22} className="text-[9px]" />}
      />
    </>
  );
}

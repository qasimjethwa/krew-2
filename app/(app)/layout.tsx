import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AppHeader } from "@/components/nav/app-header";
import { requireUserId } from "@/lib/auth";
import { getOnboardingSnapshot } from "@/lib/onboarding";
import { createClient } from "@/lib/supabase/server";

/** Personalised, session-dependent pages: never prerender. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await requireUserId();
  const snap = await getOnboardingSnapshot();
  if (!snap) redirect("/auth?mode=login");
  if (!snap.completed) redirect(snap.firstIncomplete ? `/onboarding/${snap.firstIncomplete}` : "/onboarding/profile");

  const supabase = await createClient();
  const { data: pending } = await supabase.rpc("pending_request_count");

  return (
    <div className="min-h-dvh bg-paper pb-20 md:pb-0">
      <AppHeader
        pending={pending ?? 0}
        me={{
          name: snap.profile?.full_name ?? null,
          avatarPath: snap.profile?.avatar_path ?? null,
          externalAvatar: snap.profile?.external_avatar_url ?? null,
        }}
      />
      <main id="main">{children}</main>
    </div>
  );
}

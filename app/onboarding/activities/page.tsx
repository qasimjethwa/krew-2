import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { StepShell } from "@/components/onboarding/step-shell";
import { requireUserId } from "@/lib/auth";
import { FALLBACK_ACTIVITIES } from "@/lib/constants";
import { getLookups, getOnboardingSnapshot } from "@/lib/onboarding";
import { ActivitiesForm } from "./activities-form";

export const metadata: Metadata = { title: "Your activities" };

export default async function ActivitiesStep({ searchParams }: PageProps<"/onboarding/activities">) {
  await requireUserId("/onboarding/activities");
  const edit = (await searchParams).edit === "1";
  const [snap, lookups] = await Promise.all([getOnboardingSnapshot(), getLookups()]);
  if (!snap) redirect("/auth");

  return (
    <StepShell step="activities" edit={edit} done={snap.done} title="What do you like doing?" subtitle="Select all that apply.">
      <ActivitiesForm
        edit={edit}
        backHref={edit ? "/account" : "/onboarding/location"}
        options={lookups.activities.length ? lookups.activities : FALLBACK_ACTIVITIES}
        defaults={{ selected: snap.activitySlugs, custom: snap.profile?.custom_activity ?? "" }}
      />
    </StepShell>
  );
}

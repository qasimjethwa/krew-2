import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { StepShell } from "@/components/onboarding/step-shell";
import { requireUserId } from "@/lib/auth";
import { FALLBACK_GOALS } from "@/lib/constants";
import { getLookups, getOnboardingSnapshot } from "@/lib/onboarding";
import { GoalsForm } from "./goals-form";

export const metadata: Metadata = { title: "Goals, level & schedule" };

export default async function GoalsStep({ searchParams }: PageProps<"/onboarding/goals">) {
  await requireUserId("/onboarding/goals");
  const edit = (await searchParams).edit === "1";
  const [snap, lookups] = await Promise.all([getOnboardingSnapshot(), getLookups()]);
  if (!snap) redirect("/auth");
  const p = snap.profile;

  return (
    <StepShell step="goals" edit={edit} done={snap.done} title="Goals, level and schedule">
      <GoalsForm
        edit={edit}
        backHref={edit ? "/account" : "/onboarding/activities"}
        options={lookups.goals.length ? lookups.goals : FALLBACK_GOALS}
        defaults={{
          goals: snap.goalSlugs,
          custom: p?.custom_goal ?? "",
          level: p?.fitness_level ?? null,
          availability: p?.availability ?? [],
        }}
      />
    </StepShell>
  );
}

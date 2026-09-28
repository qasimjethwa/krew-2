import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { StepShell } from "@/components/onboarding/step-shell";
import { requireUserId } from "@/lib/auth";
import { getOnboardingSnapshot } from "@/lib/onboarding";
import { PreferencesForm } from "./preferences-form";

export const metadata: Metadata = { title: "Matching preferences" };

export default async function PreferencesStep({ searchParams }: PageProps<"/onboarding/preferences">) {
  await requireUserId("/onboarding/preferences");
  const edit = (await searchParams).edit === "1";
  const snap = await getOnboardingSnapshot();
  if (!snap) redirect("/auth");

  return (
    <StepShell step="preferences" edit={edit} done={snap.done} title="Matching preferences">
      <PreferencesForm
        edit={edit}
        backHref={edit ? "/account" : "/onboarding/goals"}
        defaults={{
          genderPreference: snap.profile?.gender_preference ?? null,
          requireApproval: snap.profile?.require_contact_approval ?? null,
        }}
      />
    </StepShell>
  );
}

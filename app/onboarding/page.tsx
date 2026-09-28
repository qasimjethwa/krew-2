import { redirect } from "next/navigation";
import { requireUserId } from "@/lib/auth";
import { getOnboardingSnapshot } from "@/lib/onboarding";

/** Resumes onboarding at the first incomplete step. */
export default async function OnboardingIndex() {
  await requireUserId("/onboarding");
  const snap = await getOnboardingSnapshot();
  if (!snap) redirect("/auth?mode=login");
  if (snap.completed) redirect("/discover");
  redirect(`/onboarding/${snap.firstIncomplete ?? "profile"}`);
}

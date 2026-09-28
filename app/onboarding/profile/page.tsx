import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { StepShell } from "@/components/onboarding/step-shell";
import { requireUserId } from "@/lib/auth";
import { getOnboardingSnapshot } from "@/lib/onboarding";
import { ProfileForm } from "./profile-form";

export const metadata: Metadata = { title: "Create your profile" };

export default async function ProfileStep({ searchParams }: PageProps<"/onboarding/profile">) {
  await requireUserId("/onboarding/profile");
  const edit = (await searchParams).edit === "1";
  const snap = await getOnboardingSnapshot();
  if (!snap) redirect("/auth");
  const p = snap.profile;

  return (
    <StepShell
      step="profile"
      edit={edit}
      done={snap.done}
      title={edit ? "Edit your profile" : "Create your profile"}
      subtitle={edit ? undefined : "Add a few final details to complete your profile."}
    >
      <ProfileForm
        userId={snap.userId}
        edit={edit}
        completing={!snap.completed}
        backHref={edit ? "/account" : "/onboarding/preferences"}
        defaults={{
          fullName: p?.full_name ?? "",
          dateOfBirth: p?.date_of_birth ?? "",
          gender: p?.gender ?? null,
          bio: p?.bio ?? "",
          avatarPath: p?.avatar_path ?? null,
          externalAvatar: p?.external_avatar_url ?? null,
          phone: snap.contacts?.phone ?? "",
          instagram: snap.contacts?.instagram ?? "",
          shareEmail: snap.contacts?.share_email ?? false,
        }}
      />
    </StepShell>
  );
}

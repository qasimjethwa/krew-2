import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { StepShell } from "@/components/onboarding/step-shell";
import { requireUserId } from "@/lib/auth";
import { getOnboardingSnapshot } from "@/lib/onboarding";
import { LocationForm } from "./location-form";

export const metadata: Metadata = { title: "Location" };

export default async function LocationStep({ searchParams }: PageProps<"/onboarding/location">) {
  await requireUserId("/onboarding/location");
  const edit = (await searchParams).edit === "1";
  const snap = await getOnboardingSnapshot();
  if (!snap) redirect("/auth");
  const loc = snap.location;

  return (
    <StepShell step="location" edit={edit} done={snap.done} title="Where are you based?" subtitle="This helps us find people near you.">
      <LocationForm
        edit={edit}
        backHref={edit ? "/account" : null}
        defaults={{
          pincode: loc?.pincode ?? "",
          geo: loc ? { latitude: loc.latitude, longitude: loc.longitude, areaName: loc.area_name, city: loc.city } : null,
          radius: loc?.travel_radius ?? null,
        }}
      />
    </StepShell>
  );
}

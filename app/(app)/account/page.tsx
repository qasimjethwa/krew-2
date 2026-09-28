import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { LogOut, Pencil } from "lucide-react";
import { signOut } from "@/app/auth/actions";
import { ProfilePhoto } from "@/components/profile/avatar";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Tag } from "@/components/ui/tag";
import { AVAILABILITY, FITNESS_LEVELS, GENDER_PREFERENCES, GENDERS, TRAVEL_RADII, labelFor } from "@/lib/constants";
import { getLookups, getOnboardingSnapshot } from "@/lib/onboarding";
import { createClient } from "@/lib/supabase/server";
import { radiusTravelHint } from "@/lib/travel";

export const metadata: Metadata = { title: "Your profile" };

function ageFrom(dob: string | null | undefined) {
  if (!dob) return null;
  const d = new Date(`${dob}T00:00:00`);
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  if (now.getMonth() < d.getMonth() || (now.getMonth() === d.getMonth() && now.getDate() < d.getDate())) age--;
  return age;
}

function Section({ title, editHref, children }: { title: string; editHref: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-line p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-condensed text-xl">{title}</h2>
        <Link
          href={editHref}
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-semibold hover:bg-mist"
          aria-label={`Edit ${title.toLowerCase()}`}
        >
          <Pencil className="size-3.5" aria-hidden="true" /> Edit
        </Link>
      </div>
      {children}
    </section>
  );
}

function Row({ label, value, optional }: { label: string; value: ReactNode; optional?: boolean }) {
  const empty = value == null || value === "" || (Array.isArray(value) && value.length === 0);
  return (
    <div className="grid gap-1 py-2.5 sm:grid-cols-[11rem_1fr] sm:gap-4">
      <dt className="text-sm text-mute">
        {label}
        {optional ? <span className="ml-1.5 text-xs">(optional)</span> : null}
      </dt>
      <dd className="text-[15px]">{empty ? <span className="text-mute">Not added</span> : value}</dd>
    </div>
  );
}

export default async function AccountPage({ searchParams }: PageProps<"/account">) {
  const sp = await searchParams;
  const [snap, lookups] = await Promise.all([getOnboardingSnapshot(), getLookups()]);
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const email = typeof claims?.claims?.email === "string" ? claims.claims.email : null;

  const p = snap?.profile;
  const loc = snap?.location;
  const contacts = snap?.contacts;
  const age = ageFrom(p?.date_of_birth);

  const activityLabels = [
    ...lookups.activities.filter((a) => snap?.activitySlugs.includes(a.slug)).map((a) => a.label),
    ...(p?.custom_activity ? [p.custom_activity] : []),
  ];
  const goalLabels = [
    ...lookups.goals.filter((g) => snap?.goalSlugs.includes(g.slug)).map((g) => g.label),
    ...(p?.custom_goal ? [p.custom_goal] : []),
  ];
  const slots = AVAILABILITY.filter((a) => p?.availability?.includes(a.value)).map((a) => a.label);

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 sm:px-8 sm:py-10">
      {sp.saved ? (
        <Alert tone="success" className="mb-6">
          Your changes have been saved.
        </Alert>
      ) : null}

      <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
        <ProfilePhoto
          name={p?.full_name}
          path={p?.avatar_path}
          external={p?.external_avatar_url}
          sizes="128px"
          priority
          className="size-32 shrink-0 rounded-full [&_span]:text-5xl"
        />
        <div className="min-w-0">
          <h1 className="font-condensed text-4xl leading-tight">
            {[p?.full_name, age].filter((v) => v != null && v !== "").join(", ")}
          </h1>
          {loc?.area_name || loc?.city ? <p className="mt-1 text-mute">{[loc.area_name, loc.city].filter(Boolean).join(", ")}</p> : null}
          {p?.bio ? <p className="mt-3 max-w-md text-[15px] leading-relaxed">{p.bio}</p> : null}
        </div>
      </div>

      <div className="mt-8 space-y-5">
        <Section title="Basic information" editHref="/onboarding/profile?edit=1">
          <dl className="divide-y divide-line">
            <Row label="Name" value={p?.full_name} />
            <Row label="Date of birth" value={p?.date_of_birth ? new Date(`${p.date_of_birth}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : null} />
            <Row label="Gender" value={labelFor(GENDERS, p?.gender)} />
            <Row label="Profile picture" optional value={p?.avatar_path || p?.external_avatar_url ? "Added" : null} />
            <Row label="Bio" optional value={p?.bio} />
          </dl>
        </Section>

        <Section title="Location" editHref="/onboarding/location?edit=1">
          <dl className="divide-y divide-line">
            <Row label="Pincode" value={loc?.pincode} />
            <Row label="Area" value={[loc?.area_name, loc?.city].filter(Boolean).join(", ")} />
            <Row
              label="Travel distance"
              value={loc ? `${labelFor(TRAVEL_RADII, loc.travel_radius)} · ${radiusTravelHint(loc.travel_radius)}` : null}
            />
          </dl>
          <p className="mt-3 text-xs text-mute">Your exact location is never shown to other people — only approximate distance and area.</p>
        </Section>

        <Section title="Activities" editHref="/onboarding/activities?edit=1">
          <ul className="flex flex-wrap gap-2">
            {activityLabels.map((l) => (
              <li key={l}>
                <Tag>{l}</Tag>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Goals, level & schedule" editHref="/onboarding/goals?edit=1">
          <dl className="divide-y divide-line">
            <Row label="Goals" value={goalLabels.join(", ")} />
            <Row label="Fitness level" value={labelFor(FITNESS_LEVELS, p?.fitness_level)} />
            <Row label="Availability" value={slots.join(", ")} />
          </dl>
        </Section>

        <Section title="Matching preferences" editHref="/onboarding/preferences?edit=1">
          <dl className="divide-y divide-line">
            <Row label="Match with" value={labelFor(GENDER_PREFERENCES, p?.gender_preference)} />
            <Row
              label="Contact sharing"
              value={
                p?.require_contact_approval == null
                  ? null
                  : p.require_contact_approval
                    ? "Ask me before sharing my contact details"
                    : "Share automatically when someone connects"
              }
            />
          </dl>
        </Section>

        <Section title="Contact details" editHref="/onboarding/profile?edit=1#contact">
          <dl className="divide-y divide-line">
            <Row label="Phone / WhatsApp" optional value={contacts?.phone} />
            <Row label="Instagram" optional value={contacts?.instagram ? `@${contacts.instagram}` : null} />
            <Row label="Share account email" optional value={contacts?.share_email ? email ?? "Yes" : "No"} />
          </dl>
          <p className="mt-3 text-xs text-mute">Only visible to people you&apos;ve connected with.</p>
        </Section>

        <section className="flex flex-col gap-4 rounded-2xl bg-mist p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <h2 className="font-condensed text-xl">Account</h2>
            <p className="mt-1 text-sm text-mute">Signed in as {email ?? "—"}</p>
          </div>
          <form action={signOut}>
            <Button type="submit" variant="outline">
              <LogOut className="size-4" aria-hidden="true" /> Sign out
            </Button>
          </form>
        </section>
      </div>
    </div>
  );
}

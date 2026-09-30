import "server-only";

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { getUserId } from "@/lib/auth";

export const ONBOARDING_STEPS = [
  { slug: "location", title: "Location", blurb: "So we can find people near you." },
  { slug: "activities", title: "Activities", blurb: "What you like doing, in your own words if needed." },
  { slug: "goals", title: "Goals, level & schedule", blurb: "Why you move, how hard, and when." },
  { slug: "preferences", title: "Matching preferences", blurb: "Who you're comfortable meeting and how you share contact details." },
  { slug: "profile", title: "Your profile", blurb: "The details people see before they connect." },
] as const;

export type OnboardingStep = (typeof ONBOARDING_STEPS)[number]["slug"];

export function stepIndex(step: OnboardingStep) {
  return ONBOARDING_STEPS.findIndex((s) => s.slug === step);
}
export function nextStep(step: OnboardingStep): OnboardingStep | null {
  return ONBOARDING_STEPS[stepIndex(step) + 1]?.slug ?? null;
}
export function prevStep(step: OnboardingStep): OnboardingStep | null {
  return ONBOARDING_STEPS[stepIndex(step) - 1]?.slug ?? null;
}

/** Snapshot of everything onboarding collects, for resuming and editing. */
export const getOnboardingSnapshot = cache(async () => {
  const userId = await getUserId();
  if (!userId) return null;
  const supabase = await createClient();

  const [profile, location, activities, goals, contacts] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
    supabase.from("user_locations").select("*").eq("user_id", userId).maybeSingle(),
    supabase.from("profile_activities").select("activity_slug").eq("profile_id", userId),
    supabase.from("profile_goals").select("goal_slug").eq("profile_id", userId),
    supabase.from("profile_contacts").select("*").eq("user_id", userId).maybeSingle(),
  ]);

  const p = profile.data;
  const activitySlugs = (activities.data ?? []).map((a) => a.activity_slug);
  const goalSlugs = (goals.data ?? []).map((g) => g.goal_slug);

  const done: Record<OnboardingStep, boolean> = {
    location: Boolean(location.data),
    activities: activitySlugs.length > 0 || Boolean(p?.custom_activity),
    goals: (goalSlugs.length > 0 || Boolean(p?.custom_goal)) && Boolean(p?.fitness_level) && (p?.availability?.length ?? 0) > 0,
    preferences: Boolean(p?.gender_preference) && p?.require_contact_approval != null,
    profile: Boolean(p?.full_name && p?.date_of_birth && p?.gender && p?.phone),
  };

  const firstIncomplete = ONBOARDING_STEPS.find((s) => !done[s.slug])?.slug ?? null;

  return {
    userId,
    profile: p,
    location: location.data,
    activitySlugs,
    goalSlugs,
    contacts: contacts.data,
    done,
    firstIncomplete,
    completed: Boolean(p?.onboarding_completed_at),
  };
});

export const getLookups = cache(async () => {
  const supabase = await createClient();
  const [activities, goals] = await Promise.all([
    supabase.from("activities").select("slug,label").eq("is_active", true).order("sort_order"),
    supabase.from("goals").select("slug,label").eq("is_active", true).order("sort_order"),
  ]);
  return { activities: activities.data ?? [], goals: goals.data ?? [] };
});

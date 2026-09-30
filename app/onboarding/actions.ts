"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUserId } from "@/lib/auth";
import { friendlyDbError, logServerError } from "@/lib/errors";
import { geocodePincode } from "@/lib/geo/provider";
import { nextStep, type OnboardingStep } from "@/lib/onboarding";
import {
  activitiesSchema,
  fieldErrors,
  goalsSchema,
  locationSchema,
  preferencesSchema,
  profileSchema,
} from "@/lib/validation";
import type { FormState } from "@/types/app";

function isEdit(fd: FormData) {
  return fd.get("edit") === "1";
}

function continueFrom(step: OnboardingStep, edit: boolean): never {
  revalidatePath("/", "layout");
  if (edit) redirect("/account?saved=1");
  const next = nextStep(step);
  redirect(next ? `/onboarding/${next}` : "/discover");
}

export async function saveLocation(_prev: FormState, fd: FormData): Promise<FormState> {
  const userId = await requireUserId();
  const raw = {
    pincode: fd.get("pincode"),
    latitude: fd.get("latitude") || undefined,
    longitude: fd.get("longitude") || undefined,
    areaName: fd.get("areaName") ?? "",
    city: fd.get("city") ?? "",
    travelRadius: fd.get("travelRadius"),
  };

  // If the browser didn't resolve coordinates, resolve them from the pincode server-side.
  if (!raw.latitude || !raw.longitude) {
    const pin = String(raw.pincode ?? "").trim();
    if (/^[1-9][0-9]{5}$/.test(pin)) {
      try {
        const geo = await geocodePincode(pin);
        if (geo) {
          raw.latitude = String(geo.latitude);
          raw.longitude = String(geo.longitude);
          raw.areaName = geo.areaName ?? "";
          raw.city = geo.city ?? "";
        }
      } catch (err) {
        logServerError("onboarding.location.geocode", err);
      }
    }
  }

  const parsed = locationSchema.safeParse(raw);
  if (!parsed.success) {
    const errs = fieldErrors(parsed.error);
    if (errs.latitude || errs.longitude) {
      errs.pincode = errs.pincode ?? ["We couldn't find that pincode. Check it and try again."];
    }
    return { status: "error", fieldErrors: errs };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("user_locations").upsert(
    {
      user_id: userId,
      pincode: parsed.data.pincode,
      latitude: parsed.data.latitude,
      longitude: parsed.data.longitude,
      area_name: parsed.data.areaName,
      city: parsed.data.city,
      travel_radius: parsed.data.travelRadius,
    },
    { onConflict: "user_id" },
  );
  if (error) {
    logServerError("onboarding.location", error);
    return { status: "error", message: "We couldn't save your location. Try again." };
  }
  continueFrom("location", isEdit(fd));
}

export async function saveActivities(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireUserId();
  const other = fd.get("other") === "on";
  const parsed = activitiesSchema.safeParse({
    activities: fd.getAll("activities").map(String),
    other,
    customActivity: String(fd.get("customActivity") ?? ""),
  });
  if (!parsed.success) return { status: "error", fieldErrors: fieldErrors(parsed.error) };

  const supabase = await createClient();
  const { error } = await supabase.rpc("save_activities", {
    p_slugs: parsed.data.activities,
    p_custom: parsed.data.other ? parsed.data.customActivity : null,
  });
  if (error) {
    logServerError("onboarding.activities", error);
    return { status: "error", message: friendlyDbError(error, "We couldn't save your activities. Try again.") };
  }
  continueFrom("activities", isEdit(fd));
}

export async function saveGoals(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireUserId();
  const parsed = goalsSchema.safeParse({
    goals: fd.getAll("goals").map(String),
    other: fd.get("other") === "on",
    customGoal: String(fd.get("customGoal") ?? ""),
    fitnessLevel: fd.get("fitnessLevel"),
    availability: fd.getAll("availability").map(String),
  });
  if (!parsed.success) return { status: "error", fieldErrors: fieldErrors(parsed.error) };

  const supabase = await createClient();
  const { error } = await supabase.rpc("save_goals_and_schedule", {
    p_goal_slugs: parsed.data.goals,
    p_custom_goal: parsed.data.other ? parsed.data.customGoal : null,
    p_fitness_level: parsed.data.fitnessLevel,
    p_availability: parsed.data.availability,
  });
  if (error) {
    logServerError("onboarding.goals", error);
    return { status: "error", message: friendlyDbError(error, "We couldn't save your goals. Try again.") };
  }
  continueFrom("goals", isEdit(fd));
}

export async function savePreferences(_prev: FormState, fd: FormData): Promise<FormState> {
  const userId = await requireUserId();
  const parsed = preferencesSchema.safeParse({
    genderPreference: fd.get("genderPreference"),
    requireApproval: fd.get("requireApproval"),
  });
  if (!parsed.success) return { status: "error", fieldErrors: fieldErrors(parsed.error) };

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      gender_preference: parsed.data.genderPreference,
      require_contact_approval: parsed.data.requireApproval === "yes",
    })
    .eq("id", userId);
  if (error) {
    logServerError("onboarding.preferences", error);
    return { status: "error", message: "We couldn't save your preferences. Try again." };
  }
  continueFrom("preferences", isEdit(fd));
}

export async function saveProfile(_prev: FormState, fd: FormData): Promise<FormState> {
  const userId = await requireUserId();
  const edit = isEdit(fd);
  const supabase = await createClient();
  // Email always comes from the signed-in account (email sign-up or Google), never the form.
  const { data: claims } = await supabase.auth.getClaims();
  const accountEmail = claims?.claims?.email;
  const parsed = profileSchema.safeParse({
    fullName: fd.get("fullName"),
    dateOfBirth: fd.get("dateOfBirth"),
    gender: fd.get("gender"),
    bio: String(fd.get("bio") ?? ""),
    avatarPath: String(fd.get("avatarPath") ?? ""),
    email: typeof accountEmail === "string" ? accountEmail : "",
    phone: String(fd.get("phone") ?? ""),
    instagram: String(fd.get("instagram") ?? ""),
    shareEmail: fd.get("shareEmail") === "on",
  });
  if (!parsed.success) return { status: "error", fieldErrors: fieldErrors(parsed.error) };
  const d = parsed.data;

  // Uploaded pictures must live in the user's own storage folder.
  const avatarPath = d.avatarPath && d.avatarPath.startsWith(`${userId}/`) ? d.avatarPath : null;
  if (d.avatarPath && !avatarPath) {
    return { status: "error", message: "That picture couldn't be used. Upload it again." };
  }

  const { data: before } = await supabase.from("profiles").select("avatar_path, onboarding_completed_at").eq("id", userId).single();

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: d.fullName,
      date_of_birth: d.dateOfBirth,
      gender: d.gender,
      bio: d.bio || null,
      avatar_path: avatarPath,
      phone: d.phone,
    })
    .eq("id", userId);
  if (error) {
    logServerError("onboarding.profile", error);
    return { status: "error", message: friendlyDbError(error, "We couldn't save your profile. Try again.") };
  }

  const { error: contactError } = await supabase.from("profile_contacts").upsert(
    { user_id: userId, phone: d.phone, instagram: d.instagram || null, share_email: d.shareEmail },
    { onConflict: "user_id" },
  );
  if (contactError) {
    logServerError("onboarding.contacts", contactError);
    return { status: "error", message: "We couldn't save your contact details. Try again." };
  }

  // Clean up a replaced picture (best effort).
  if (before?.avatar_path && before.avatar_path !== avatarPath) {
    await supabase.storage.from("avatars").remove([before.avatar_path]);
  }

  if (!before?.onboarding_completed_at) {
    const { error: completeError } = await supabase.rpc("complete_onboarding");
    if (completeError) {
      return { status: "error", message: friendlyDbError(completeError, "Finish the earlier steps first.") };
    }
    revalidatePath("/", "layout");
    redirect(edit ? "/account?saved=1" : "/discover?welcome=1");
  }
  continueFrom("profile", edit);
}

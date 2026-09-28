import type {
  AvailabilitySlot,
  FitnessLevel,
  GenderIdentity,
  GenderPreference,
  TravelRadius,
} from "@/types/app";

/** Keep in sync with public.min_age_years() in the database. */
export const MIN_AGE = 18;
export const BIO_MAX = 150;
export const CUSTOM_TAG_MAX = 40;
export const MAX_GOALS = 2;
export const AVATAR_MAX_BYTES = 5 * 1024 * 1024;
export const AVATAR_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

/**
 * Activity presentation. The list of activities itself lives in the
 * `activities` table (source of truth); this maps slugs to artwork.
 *
 * PHOTOGRAPHY: set `photo` to a file in /public/images/activities once the
 * client supplies approved imagery (e.g. "/images/activities/running.jpg").
 * Until then a branded illustrated tile is rendered.
 */
export type ActivityArt = { icon: ActivityIconName; photo: string | null };
export type ActivityIconName =
  | "footprints"
  | "dumbbell"
  | "bike"
  | "feather"
  | "circle-dot"
  | "disc"
  | "waves"
  | "music"
  | "volleyball"
  | "flower"
  | "sparkles";

export const ACTIVITY_ART: Record<string, ActivityArt> = {
  running: { icon: "footprints", photo: null },
  gym: { icon: "dumbbell", photo: null },
  cycling: { icon: "bike", photo: null },
  badminton: { icon: "feather", photo: null },
  tennis: { icon: "circle-dot", photo: null },
  pickleball: { icon: "disc", photo: null },
  swimming: { icon: "waves", photo: null },
  dance: { icon: "music", photo: null },
  football: { icon: "volleyball", photo: null },
  yoga: { icon: "flower", photo: null },
};
export const DEFAULT_ACTIVITY_ART: ActivityArt = { icon: "sparkles", photo: null };

/** Fallback list used only if the lookup table can't be read (e.g. before migrations run). */
export const FALLBACK_ACTIVITIES = [
  { slug: "running", label: "Running" },
  { slug: "gym", label: "Gym" },
  { slug: "cycling", label: "Cycling" },
  { slug: "badminton", label: "Badminton" },
  { slug: "tennis", label: "Tennis" },
  { slug: "pickleball", label: "Pickleball" },
  { slug: "swimming", label: "Swimming" },
  { slug: "dance", label: "Dance" },
  { slug: "football", label: "Football" },
  { slug: "yoga", label: "Yoga" },
];
export const FALLBACK_GOALS = [
  { slug: "get_fitter", label: "Get fitter" },
  { slug: "stay_consistent", label: "Stay consistent" },
  { slug: "try_new_sport", label: "Try a new sport" },
  { slug: "meet_new_people", label: "Meet new people" },
];

export const FITNESS_LEVELS: { value: FitnessLevel; label: string }[] = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

export const AVAILABILITY: { value: AvailabilitySlot; label: string; phrase: string }[] = [
  { value: "morning", label: "Morning", phrase: "mornings" },
  { value: "afternoon", label: "Afternoon", phrase: "afternoons" },
  { value: "evening", label: "Evening", phrase: "evenings" },
  { value: "weekends", label: "Weekends", phrase: "weekends" },
];

export const GENDERS: { value: GenderIdentity; label: string }[] = [
  { value: "woman", label: "Woman" },
  { value: "man", label: "Man" },
  { value: "non_binary", label: "Non-binary" },
  { value: "other", label: "Other" },
];

export const GENDER_PREFERENCES: { value: GenderPreference; label: string; hint: string }[] = [
  { value: "same_gender", label: "Same gender", hint: "Only see and be seen by people of your gender." },
  { value: "no_preference", label: "No preference", hint: "Match with anyone who shares your activities." },
];

export const TRAVEL_RADII: { value: TravelRadius; label: string; minKm: number; maxKm: number }[] = [
  { value: "1_2_km", label: "1–2 km", minKm: 1, maxKm: 2 },
  { value: "2_5_km", label: "2–5 km", minKm: 2, maxKm: 5 },
  // Keep maxKm in sync with public.radius_km() ("5+ km" is capped for matching).
  { value: "5_plus_km", label: "5+ km", minKm: 5, maxKm: 25 },
];

export function labelFor<T extends string>(list: { value: T; label: string }[], v: T | null | undefined) {
  return list.find((i) => i.value === v)?.label ?? "";
}

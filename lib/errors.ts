/**
 * Maps database/auth error codes to user-facing copy. Never surface raw
 * database messages to users; log them server-side instead.
 */
const MESSAGES: Record<string, string> = {
  under_min_age: "You need to be 18 or older to use KREW.",
  date_of_birth_in_future: "Date of birth can't be in the future.",
  invalid_activity: "One of the selected activities isn't available any more. Refresh and try again.",
  activity_required: "Pick at least one activity.",
  invalid_goal: "One of the selected goals isn't available any more. Refresh and try again.",
  goal_required: "Pick at least one goal.",
  too_many_goals: "Pick up to 2 goals.",
  fitness_level_required: "Choose your fitness level.",
  availability_required: "Pick at least one time you like to work out.",
  incomplete_profile: "Add your name, date of birth and gender to finish your profile.",
  incomplete_contact: "Add your email and phone number to finish your profile.",
  incomplete_location: "Set your location before finishing your profile.",
  incomplete_activities: "Choose your activities before finishing your profile.",
  incomplete_goals: "Set your goals, fitness level and schedule before finishing your profile.",
  incomplete_preferences: "Set your matching preferences before finishing your profile.",
  profile_unavailable: "This person isn't available to connect right now.",
  request_not_found: "This request is no longer available.",
  onboarding_incomplete: "Finish setting up your profile first.",
  cannot_connect_self: "You can't connect with yourself.",
};

export function friendlyDbError(err: { message?: string; code?: string } | null | undefined, fallback = "Something went wrong. Try again.") {
  if (!err?.message) return fallback;
  const key = Object.keys(MESSAGES).find((k) => err.message === k || err.message?.includes(k));
  return key ? MESSAGES[key] : fallback;
}

export function logServerError(scope: string, err: unknown) {
  // Server-side only; shows up in Vercel function logs.
  console.error(`[krew:${scope}]`, err);
}

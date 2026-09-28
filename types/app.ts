import type { Enums } from "./database";

export type GenderIdentity = Enums<"gender_identity">;
export type FitnessLevel = Enums<"fitness_level">;
export type TravelRadius = Enums<"travel_radius">;
export type GenderPreference = Enums<"gender_preference">;
export type AvailabilitySlot = Enums<"availability_slot">;
export type ConnectionStatus = Enums<"connection_status">;

/** Activity / goal as returned by the matching RPCs: predefined slug or `custom:<label>`. */
export type Tag = { key: string; label: string };

/** Standard return shape for form server actions used with useActionState. */
export type FormState = {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export const initialFormState: FormState = { status: "idle" };

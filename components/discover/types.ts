import type { AvailabilitySlot, FitnessLevel, Tag } from "@/types/app";

/** Serializable card data passed from the server page to the client feed. */
export type DiscoverCard = {
  id: string;
  name: string | null;
  age: number | null;
  avatarPath: string | null;
  externalAvatar: string | null;
  area: string | null;
  distanceKm: number;
  level: FitnessLevel | null;
  slots: AvailabilitySlot[];
  activities: Tag[];
  goals: Tag[];
  /** Labels of activities both people selected. */
  sharedActivities: string[];
  matchPercent: number;
};

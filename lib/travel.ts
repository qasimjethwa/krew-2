import { TRAVEL_RADII } from "./constants";
import type { TravelRadius } from "@/types/app";

/**
 * Estimated door-to-door travel time for short urban trips.
 *
 * This is a deliberate approximation (≈18 km/h average by auto/bike/car in
 * city traffic, plus a couple of minutes to get going) so the product can
 * show travel time without a paid routing API. To use real routing, replace
 * this function with a call to your mapping provider's distance-matrix API.
 */
const AVG_URBAN_KMH = 18;
const START_MINUTES = 2;

export function estimateTravelMinutes(km: number): number {
  if (!Number.isFinite(km) || km < 0) return 0;
  return Math.max(3, Math.round((km / AVG_URBAN_KMH) * 60 + START_MINUTES));
}

export function formatDistance(km: number | null | undefined): string {
  if (km == null) return "";
  if (km < 1) return `${Math.max(0.1, Math.round(km * 10) / 10)} km away`;
  return `${Math.round(km * 10) / 10} km away`;
}

export function formatTravel(km: number | null | undefined): string {
  if (km == null) return "";
  return `~${estimateTravelMinutes(km)} min`;
}

export function radiusTravelHint(radius: TravelRadius): string {
  const r = TRAVEL_RADII.find((x) => x.value === radius);
  if (!r) return "";
  if (radius === "5_plus_km") return `${estimateTravelMinutes(r.minKm)}+ min away`;
  return `About ${estimateTravelMinutes(r.minKm)}–${estimateTravelMinutes(r.maxKm)} min away`;
}

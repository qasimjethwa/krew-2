import "server-only";

import { getSiteUrl } from "@/lib/site-url";

/**
 * Location provider.
 *
 * Default implementation uses OpenStreetMap Nominatim (no API key). Its usage
 * policy allows light use with an identifying User-Agent and at most ~1
 * request/second; results are cached for a day. For higher traffic, swap the
 * two functions below for Google Maps / Mapbox / MapmyIndia and add the key
 * as a *server-only* environment variable (never NEXT_PUBLIC_).
 */
export type GeoResult = {
  pincode: string | null;
  latitude: number;
  longitude: number;
  areaName: string | null;
  city: string | null;
};

const BASE = "https://nominatim.openstreetmap.org";

type NominatimAddress = Partial<
  Record<
    "postcode" | "suburb" | "neighbourhood" | "city_district" | "quarter" | "town" | "village" | "city" | "state_district" | "county" | "state",
    string
  >
>;
type NominatimPlace = { lat: string; lon: string; address?: NominatimAddress };

function headers() {
  return {
    "User-Agent": `KREW/1.0 (+${getSiteUrl()})`,
    "Accept-Language": "en",
  };
}

function toResult(place: NominatimPlace, fallbackPincode: string | null): GeoResult {
  const a = place.address ?? {};
  return {
    pincode: (a.postcode ?? fallbackPincode ?? "").replace(/\s/g, "") || null,
    latitude: Number(place.lat),
    longitude: Number(place.lon),
    areaName: a.suburb ?? a.neighbourhood ?? a.quarter ?? a.city_district ?? a.town ?? a.village ?? null,
    city: a.city ?? a.town ?? a.state_district ?? a.county ?? a.state ?? null,
  };
}

export async function geocodePincode(pincode: string): Promise<GeoResult | null> {
  const url = `${BASE}/search?postalcode=${encodeURIComponent(pincode)}&country=India&format=jsonv2&addressdetails=1&limit=1`;
  const res = await fetch(url, { headers: headers(), next: { revalidate: 86_400 } });
  if (!res.ok) throw new Error(`geocode_failed_${res.status}`);
  const places = (await res.json()) as NominatimPlace[];
  if (!places.length) return null;
  return toResult(places[0], pincode);
}

export async function reverseGeocode(lat: number, lng: number): Promise<GeoResult | null> {
  const url = `${BASE}/reverse?lat=${lat.toFixed(5)}&lon=${lng.toFixed(5)}&format=jsonv2&addressdetails=1&zoom=16`;
  const res = await fetch(url, { headers: headers(), next: { revalidate: 86_400 } });
  if (!res.ok) throw new Error(`reverse_geocode_failed_${res.status}`);
  const place = (await res.json()) as NominatimPlace & { error?: string };
  if (place.error) return null;
  return { ...toResult(place, null), latitude: lat, longitude: lng };
}

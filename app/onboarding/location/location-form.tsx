"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { LocateFixed, MapPin } from "lucide-react";
import { saveLocation } from "../actions";
import { StepFooter } from "@/components/onboarding/step-footer";
import { Alert } from "@/components/ui/alert";
import { Choice } from "@/components/ui/choice";
import { Field, FieldError, Input } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { TRAVEL_RADII } from "@/lib/constants";
import { radiusTravelHint } from "@/lib/travel";
import { initialFormState, type TravelRadius } from "@/types/app";

type Geo = { latitude: number; longitude: number; areaName: string | null; city: string | null };

export function LocationForm({
  defaults,
  edit,
  backHref,
}: {
  defaults: { pincode: string; geo: Geo | null; radius: TravelRadius | null };
  edit: boolean;
  backHref: string | null;
}) {
  const [state, action, pending] = useActionState(saveLocation, initialFormState);
  const [pincode, setPincode] = useState(defaults.pincode);
  const [geo, setGeo] = useState<Geo | null>(defaults.geo);
  const [lookup, setLookup] = useState<{ status: "idle" | "loading" | "error"; message?: string }>({ status: "idle" });
  const [radius, setRadius] = useState<TravelRadius | null>(defaults.radius);
  const resolvedPin = useRef(defaults.geo ? defaults.pincode : "");

  // Resolve the pincode once it has 6 digits.
  useEffect(() => {
    if (!/^[1-9][0-9]{5}$/.test(pincode) || resolvedPin.current === pincode) return;
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      setLookup({ status: "loading" });
      try {
        const res = await fetch(`/api/geocode?pincode=${pincode}`, { signal: ctrl.signal });
        const body = await res.json();
        if (!res.ok) {
          setGeo(null);
          setLookup({ status: "error", message: body.error ?? "We couldn't find that pincode." });
          return;
        }
        resolvedPin.current = pincode;
        setGeo({ latitude: body.latitude, longitude: body.longitude, areaName: body.areaName, city: body.city });
        setLookup({ status: "idle" });
      } catch (err) {
        if ((err as Error).name !== "AbortError") setLookup({ status: "error", message: "Location lookup failed. Check your connection." });
      }
    }, 350);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [pincode]);

  function locateMe() {
    if (!("geolocation" in navigator)) {
      setLookup({ status: "error", message: "Your browser can't share location. Enter your pincode instead." });
      return;
    }
    setLookup({ status: "loading" });
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(`/api/geocode?lat=${latitude}&lng=${longitude}`);
          const body = await res.json();
          if (!res.ok || !body.pincode) {
            setLookup({ status: "error", message: "We couldn't work out your pincode. Enter it instead." });
            return;
          }
          resolvedPin.current = body.pincode;
          setPincode(body.pincode);
          setGeo({ latitude, longitude, areaName: body.areaName, city: body.city });
          setLookup({ status: "idle" });
        } catch {
          setLookup({ status: "error", message: "Location lookup failed. Enter your pincode instead." });
        }
      },
      () => setLookup({ status: "error", message: "Location access was blocked. Enter your pincode instead." }),
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 300_000 },
    );
  }

  const e = state.fieldErrors ?? {};
  const place = [geo?.areaName, geo?.city].filter(Boolean).join(", ");
  const bbox = geo
    ? [geo.longitude - 0.014, geo.latitude - 0.009, geo.longitude + 0.014, geo.latitude + 0.009].map((n) => n.toFixed(5)).join(",")
    : "";

  return (
    <form action={action} noValidate className="flex flex-1 flex-col">
      {edit ? <input type="hidden" name="edit" value="1" /> : null}
      <input type="hidden" name="latitude" value={geo?.latitude ?? ""} />
      <input type="hidden" name="longitude" value={geo?.longitude ?? ""} />
      <input type="hidden" name="areaName" value={geo?.areaName ?? ""} />
      <input type="hidden" name="city" value={geo?.city ?? ""} />

      {state.message ? <Alert className="mb-5">{state.message}</Alert> : null}

      <Field label="Pincode" htmlFor="pincode" errors={e.pincode ?? (lookup.status === "error" ? [lookup.message ?? ""] : undefined)}>
        <Input
          id="pincode"
          name="pincode"
          inputMode="numeric"
          autoComplete="postal-code"
          maxLength={6}
          placeholder="400050"
          value={pincode}
          invalid={!!e.pincode || lookup.status === "error"}
          onChange={(ev) => {
            setPincode(ev.target.value.replace(/\D/g, "").slice(0, 6));
            if (lookup.status === "error") setLookup({ status: "idle" });
          }}
          trailing={
            <button
              type="button"
              onClick={locateMe}
              className="grid size-9 place-items-center rounded-lg text-ink hover:bg-mist"
              aria-label="Use my current location"
              title="Use my current location"
            >
              {lookup.status === "loading" ? <Spinner className="size-4" /> : <LocateFixed className="size-4.5" />}
            </button>
          }
        />
      </Field>

      <div className="relative mt-4 aspect-[16/9] overflow-hidden rounded-2xl border border-line bg-mist">
        {geo ? (
          <>
            <iframe
              key={bbox}
              title={place ? `Map showing ${place}` : "Map of your area"}
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${geo.latitude.toFixed(5)},${geo.longitude.toFixed(5)}`}
              className="absolute inset-0 size-full grayscale-[35%]"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
            {place ? (
              <span className="pointer-events-none absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-paper px-3 py-1.5 text-sm font-semibold shadow-[var(--shadow-lift)]">
                <MapPin className="size-3.5" aria-hidden="true" /> {place}
              </span>
            ) : null}
          </>
        ) : (
          <div className="absolute inset-0 grid place-items-center p-6 text-center text-sm text-mute">
            {lookup.status === "loading" ? <Spinner label="Finding your area" /> : "Enter your pincode to see your area on the map."}
          </div>
        )}
      </div>
      <p className="mt-2 text-xs text-mute">Only your area name and approximate distance are shown to others.</p>

      <fieldset className="mt-9">
        <legend className="text-lg font-semibold">How far are you willing to travel?</legend>
        <p className="mt-1 text-sm text-mute">Choose your preferred distance.</p>
        <div className="mt-4 grid grid-cols-3 gap-2.5">
          {TRAVEL_RADII.map((r) => (
            <Choice
              key={r.value}
              name="travelRadius"
              value={r.value}
              label={r.label}
              checked={radius === r.value}
              onChange={() => setRadius(r.value)}
              className="justify-center gap-2 px-2 text-center"
            />
          ))}
        </div>
        <p className="mt-3 min-h-5 text-sm text-mute" aria-live="polite">
          {radius ? `${radiusTravelHint(radius)} by auto, bike or car.` : ""}
        </p>
        <FieldError errors={e.travelRadius} />
      </fieldset>

      <StepFooter backHref={backHref} pending={pending} edit={edit} disabled={lookup.status === "loading"} />
    </form>
  );
}

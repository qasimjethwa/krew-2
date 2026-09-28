import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getUserId } from "@/lib/auth";
import { geocodePincode, reverseGeocode } from "@/lib/geo/provider";
import { logServerError } from "@/lib/errors";

const query = z.union([
  z.object({ pincode: z.string().regex(/^[1-9][0-9]{5}$/) }),
  z.object({ lat: z.coerce.number().min(-90).max(90), lng: z.coerce.number().min(-180).max(180) }),
]);

/** Authenticated geocoding proxy (keeps provider details and rate limits server-side). */
export async function GET(request: NextRequest) {
  if (!(await getUserId())) {
    return NextResponse.json({ error: "Sign in to look up locations." }, { status: 401 });
  }
  const params = Object.fromEntries(request.nextUrl.searchParams);
  const parsed = query.safeParse(params);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid 6-digit pincode." }, { status: 400 });
  }

  try {
    const result =
      "pincode" in parsed.data
        ? await geocodePincode(parsed.data.pincode)
        : await reverseGeocode(parsed.data.lat, parsed.data.lng);
    if (!result) {
      return NextResponse.json({ error: "We couldn't find that pincode. Check it and try again." }, { status: 404 });
    }
    return NextResponse.json(result, { headers: { "Cache-Control": "private, max-age=3600" } });
  } catch (err) {
    logServerError("geocode", err);
    return NextResponse.json(
      { error: "Location lookup is unavailable right now. Try again in a moment." },
      { status: 502 },
    );
  }
}

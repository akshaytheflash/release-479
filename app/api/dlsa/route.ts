import { NextResponse } from "next/server";
import {
  DLSA_CONTACTS,
  DLSA_STATES,
  directorySummary,
  districtsForState,
  lookupDlsa,
  normalise,
} from "@/lib/dlsa";

export const runtime = "nodejs";

/**
 * DLSA directory lookup. The data is a vendored, cited CSV — not a live scrape.
 * If a district is not in the file, the route says so instead of inventing a
 * phone number or address.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const state = url.searchParams.get("state") ?? "";
  const district = url.searchParams.get("district") ?? "";

  if (!state) {
    return NextResponse.json({
      states: DLSA_STATES,
      summary: directorySummary(),
      note: "Pass ?state=Kerala&district=Ernakulam to look up an office.",
    });
  }

  const result = lookupDlsa(state, district);
  return NextResponse.json({
    ...result,
    districts: districtsForState(state),
    offices: DLSA_CONTACTS.filter((c) => normalise(c.state) === normalise(state)),
    summary: directorySummary(),
  });
}

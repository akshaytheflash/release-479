import { NextResponse } from "next/server";
import { STATE_CONTEXT_STATES, getStateContext } from "@/lib/stateContext";

export const runtime = "nodejs";

/**
 * Real State/UT undertrial row from data.gov.in, cached for 6 hours.
 * Never fabricates a number: if the resource has no row, the response says
 * "not published"; if the API rate-limits, it says so.
 */
export async function GET(req: Request) {
  const state = new URL(req.url).searchParams.get("state") ?? "";
  if (!state) {
    return NextResponse.json(
      {
        error: "state query parameter required.",
        states: STATE_CONTEXT_STATES,
      },
      { status: 400 }
    );
  }
  const result = await getStateContext(state);
  return NextResponse.json(result, {
    headers: {
      "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=86400",
    },
  });
}

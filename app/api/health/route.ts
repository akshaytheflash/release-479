import { NextResponse } from "next/server";
import { BHARATCODE_BASE_URL, BHARATCODE_MODEL } from "@/lib/llm";

export const runtime = "nodejs";

/**
 * Live dependency probe. Never fabricates: reports what actually responded.
 * - BharatCode GET /models (verified live 2026-11-06; POST may 500 → fallback)
 * - NJDG homepage reachability (HTML, not JSON)
 * - data.gov.in Civil Pendency dataset (requires a user API key — link only)
 */
export async function GET() {
  let bharatcode: { ok: boolean; detail: string } = { ok: false, detail: "not probed" };
  try {
    const key = process.env.BHARATCODE_API_KEY ?? "";
    const res = await fetch(`${BHARATCODE_BASE_URL}/models`, {
      headers: key ? { Authorization: `Bearer ${key}` } : undefined,
      signal: AbortSignal.timeout(15000),
    });
    const text = await res.text();
    bharatcode = {
      ok: res.ok,
      detail: `GET /models → HTTP ${res.status}. ${text.slice(0, 400)}`,
    };
  } catch (e) {
    bharatcode = { ok: false, detail: e instanceof Error ? e.message : "fetch failed" };
  }

  let njdg: { ok: boolean; detail: string } = { ok: false, detail: "not probed" };
  try {
    const res = await fetch("https://njdg.ecourts.gov.in/", {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(15000),
    });
    const text = await res.text();
    njdg = {
      ok: res.ok,
      detail: `Homepage → HTTP ${res.status}, content-type ${res.headers.get("content-type")}. ${text.slice(0, 200).replace(/\s+/g, " ")}`,
    };
  } catch (e) {
    njdg = { ok: false, detail: e instanceof Error ? e.message : "fetch failed" };
  }

  return NextResponse.json({
    at: new Date().toISOString(),
    bharatcode: { ...bharatcode, baseUrl: BHARATCODE_BASE_URL, model: BHARATCODE_MODEL },
    njdg: {
      ...njdg,
      note: "NJDG returns HTML dashboards, not JSON. This app links to https://njdg.ecourts.gov.in and does not fabricate medians.",
    },
    dataGovIn: {
      note: "data.gov.in Civil Pendency datasets require a user API key (api.data.gov.in). Without a key the API returns an authorization error — surfaced honestly; use the dataset link on /sources.",
    },
  });
}

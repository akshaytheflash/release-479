import { NextResponse } from "next/server";
import { computeEligibility } from "@/lib/eligibility";
import { BNS_BY_ID } from "@/lib/bns";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = (await req.json()) as {
    sectionIds?: string[];
    detentionStart?: string;
    firstTimeOffender?: boolean;
    pendingOtherCases?: boolean;
    accusedDelayDays?: number;
    today?: string;
  };
  if (!body.sectionIds?.length || !body.detentionStart) {
    return NextResponse.json(
      { error: "sectionIds (non-empty) and detentionStart are required." },
      { status: 400 }
    );
  }
  try {
    const result = computeEligibility({
      sectionIds: body.sectionIds,
      detentionStart: body.detentionStart,
      firstTimeOffender: !!body.firstTimeOffender,
      pendingOtherCases: !!body.pendingOtherCases,
      accusedDelayDays: body.accusedDelayDays ?? 0,
      today: body.today,
    });
    // Attach sourced section detail for the UI breakdown table.
    const sections = body.sectionIds.map((id) => {
      const s = BNS_BY_ID[id];
      return s ? { ...s } : { id, label: "Unknown", note: "Unsupported section" };
    });
    return NextResponse.json({ ...result, sections });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Computation failed." },
      { status: 400 }
    );
  }
}

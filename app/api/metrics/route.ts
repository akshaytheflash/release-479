import { NextResponse } from "next/server";
import { metrics, listPrisoners } from "@/lib/db";
import { computeEligibility } from "@/lib/eligibility";

export const runtime = "nodejs";

export async function GET() {
  const m = metrics();
  const overDetainedReal = listPrisoners()
    .filter((r) => r.is_sample === 0)
    .filter((r) => {
      try {
        const c = computeEligibility({
          sectionIds: JSON.parse(r.section_ids) as string[],
          detentionStart: r.detention_start,
          firstTimeOffender: r.first_time === 1,
          pendingOtherCases: r.pending_other === 1,
          accusedDelayDays: r.accused_delay_days,
        });
        return c.status === "ELIGIBLE_NOW" || c.status === "CEILING_BREACHED";
      } catch {
        return false;
      }
    }).length;
  return NextResponse.json({
    ...m,
    overDetainedFound: overDetainedReal,
    template: {
      screened_N: m.screened,
      overDetainedFound: overDetainedReal,
      applicationsFiled: m.applicationsFiled,
      releasesSecured: m.releasesSecured,
      date: new Date().toISOString().slice(0, 10),
    },
  });
}

import { NextResponse } from "next/server";
import { insertPrisoner } from "@/lib/db";

export const runtime = "nodejs";

/**
 * DEMO-ONLY sample rows. These are illustrative placeholders (clearly badged
 * in the UI, excluded from metrics) so judges can see the over-detained
 * rendering without real prisoner data. Never present as real records.
 * Detention-start dates are computed relative to today so the demo always
 * shows one over-detained and one eligible-soon case.
 */
export async function POST() {
  const today = new Date();
  const iso = (daysAgo: number) =>
    new Date(today.getTime() - daysAgo * 86400000).toISOString().slice(0, 10);
  const stamp = Date.now().toString(36);
  const rows = [
    {
      id: `demo-theft-${stamp}`,
      prisoner_name: "DEMO: Ramesh Kumar (sample)",
      case_no: "DEMO/Crime/2024/001",
      court: "DEMO Judicial Magistrate First Class",
      section_ids: ["bns303"], // 3yr theft, first-time → 1/3 = 365 days
      detention_start: iso(500), // 500 days in → 135 days over
      first_time: true,
      pending_other: false,
    },
    {
      id: `demo-cheat-${stamp}`,
      prisoner_name: "DEMO: Sunita Devi (sample)",
      case_no: "DEMO/Crime/2025/002",
      court: "DEMO Chief Judicial Magistrate",
      section_ids: ["bns318_simple"], // 3yr, not first-time → 1/2 = 548 days
      detention_start: iso(560), // just over the line
      first_time: false,
      pending_other: false,
    },
    {
      id: `demo-blocked-${stamp}`,
      prisoner_name: "DEMO: Arif Khan (sample)",
      case_no: "DEMO/Crime/2025/003",
      court: "DEMO Civil Judge (Sr. Div.)",
      section_ids: ["bns117"], // 7yr grievous hurt → 1/2 = 1278 days
      detention_start: iso(1400), // over, but second case pending → blocked
      first_time: false,
      pending_other: true,
    },
  ];
  for (const r of rows) {
    insertPrisoner({ ...r, is_sample: true, status: "SCREENED" });
  }
  return NextResponse.json({
    imported: rows.length,
    warning:
      "DEMO sample rows (is_sample=1). They are illustrative only — not real prisoners, excluded from deployment metrics.",
  });
}

export async function DELETE() {
  const { db } = await import("@/lib/db");
  const res = db().prepare("DELETE FROM prisoners WHERE is_sample = 1").run();
  return NextResponse.json({ deleted: Number(res.changes) });
}

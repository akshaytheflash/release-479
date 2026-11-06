import { NextResponse } from "next/server";
import { listPrisoners, insertPrisoner, updateStatus, deletePrisoner, type PrisonerRow } from "@/lib/db";
import { computeEligibility } from "@/lib/eligibility";

export const runtime = "nodejs";

function decorate(r: PrisonerRow, today?: string) {
  let sectionIds: string[] = [];
  try {
    sectionIds = JSON.parse(r.section_ids) as string[];
  } catch {
    sectionIds = [];
  }
  let comp = null;
  try {
    comp = computeEligibility({
      sectionIds,
      detentionStart: r.detention_start,
      firstTimeOffender: r.first_time === 1,
      pendingOtherCases: r.pending_other === 1,
      accusedDelayDays: r.accused_delay_days,
      today,
    });
  } catch {
    comp = null;
  }
  return { ...r, sectionIds, eligibility: comp };
}

export async function GET(req: Request) {
  const today = new URL(req.url).searchParams.get("today") ?? undefined;
  return NextResponse.json({ prisoners: listPrisoners().map((r) => decorate(r, today)) });
}

export async function POST(req: Request) {
  const body = (await req.json()) as {
    prisonerName?: string;
    caseNo?: string;
    court?: string;
    sectionIds?: string[];
    detentionStart?: string;
    firstTimeOffender?: boolean;
    pendingOtherCases?: boolean;
    accusedDelayDays?: number;
    contactNote?: string;
  };
  if (!body.prisonerName || !body.caseNo || !body.sectionIds?.length || !body.detentionStart) {
    return NextResponse.json(
      { error: "prisonerName, caseNo, sectionIds and detentionStart are required." },
      { status: 400 }
    );
  }
  const id = `p-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e4)}`;
  insertPrisoner({
    id,
    prisoner_name: body.prisonerName,
    case_no: body.caseNo,
    court: body.court ?? "",
    section_ids: body.sectionIds,
    detention_start: body.detentionStart,
    first_time: !!body.firstTimeOffender,
    pending_other: !!body.pendingOtherCases,
    accused_delay_days: body.accusedDelayDays ?? 0,
    status: "SCREENED",
    contact_note: body.contactNote ?? "",
    is_sample: false,
  });
  return NextResponse.json({ id }, { status: 201 });
}

export async function PATCH(req: Request) {
  const body = (await req.json()) as { id?: string; status?: string };
  if (!body.id || !body.status) {
    return NextResponse.json({ error: "id and status required." }, { status: 400 });
  }
  updateStatus(body.id, body.status);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required." }, { status: 400 });
  deletePrisoner(id);
  return NextResponse.json({ ok: true });
}

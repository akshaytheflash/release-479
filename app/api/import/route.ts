import { NextResponse } from "next/server";
import { insertPrisoner } from "@/lib/db";
import { BNS_BY_ID } from "@/lib/bns";

export const runtime = "nodejs";

/**
 * DLSA CSV import.
 * Expected header (exact, case-insensitive):
 *   prisoner_name,case_no,court,section_ids,detention_start,first_time,pending_other[,accused_delay_days,contact_note]
 * section_ids: semicolon-separated supported ids, e.g. "bns303;bns117"
 * first_time / pending_other: 1/0 or true/false. detention_start: YYYY-MM-DD.
 * The file must be exported from jail/DLSA records — this API validates every
 * row and never invents records.
 */
export async function POST(req: Request) {
  const { csv } = (await req.json()) as { csv?: string };
  if (!csv?.trim()) {
    return NextResponse.json({ error: "csv body required." }, { status: 400 });
  }
  const lines = csv.replace(/\r\n/g, "\n").split("\n").filter((l) => l.trim() !== "");
  if (lines.length < 2) {
    return NextResponse.json(
      { error: "CSV must contain a header row plus at least one data row." },
      { status: 400 }
    );
  }
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());

  function splitRow(line: string): string[] {
    const out: string[] = [];
    let cur = "";
    let quoted = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        if (quoted && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          quoted = !quoted;
        }
      } else if (c === "," && !quoted) {
        out.push(cur);
        cur = "";
      } else {
        cur += c;
      }
    }
    out.push(cur);
    return out.map((v) => v.trim());
  }

  const results: Array<{ line: number; ok: boolean; message: string }> = [];
  let imported = 0;
  for (let i = 1; i < lines.length; i++) {
    const cells = splitRow(lines[i]);
    const value = (name: string) =>
      headers.includes(name) ? cells[headers.indexOf(name)] ?? "" : "";
    const prisonerName = value("prisoner_name");
    const caseNo = value("case_no");
    const start = value("detention_start");
    const rawSections = value("section_ids");
    if (!prisonerName || !caseNo || !start || !rawSections) {
      results.push({
        line: i + 1,
        ok: false,
        message: "Missing prisoner_name / case_no / detention_start / section_ids.",
      });
      continue;
    }
    const sectionIds = rawSections
      .split(/[;\s|]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    const bad = sectionIds.filter((id) => !BNS_BY_ID[id]);
    if (!sectionIds.length || bad.length) {
      results.push({
        line: i + 1,
        ok: false,
        message: `Unsupported section id(s): ${bad.join(", ") || "(none listed)"}. See /sources for supported ids.`,
      });
      continue;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(start) || Number.isNaN(Date.parse(start))) {
      results.push({ line: i + 1, ok: false, message: "detention_start must be YYYY-MM-DD." });
      continue;
    }
    const truthy = (v: string) =>
      ["1", "true", "yes", "y"].includes(v.trim().toLowerCase());
    try {
      insertPrisoner({
        id: `csv-${Date.now().toString(36)}-${i}`,
        prisoner_name: prisonerName,
        case_no: caseNo,
        court: value("court"),
        section_ids: sectionIds,
        detention_start: start,
        first_time: truthy(value("first_time")),
        pending_other: truthy(value("pending_other")),
        accused_delay_days: Math.max(0, parseInt(value("accused_delay_days") || "0", 10) || 0),
        status: "SCREENED",
        contact_note: value("contact_note"),
        is_sample: false,
      });
      imported++;
      results.push({ line: i + 1, ok: true, message: `Imported: ${prisonerName} (${caseNo}).` });
    } catch (e) {
      results.push({ line: i + 1, ok: false, message: e instanceof Error ? e.message : "Insert failed." });
    }
  }
  return NextResponse.json({ imported, total: lines.length - 1, results });
}

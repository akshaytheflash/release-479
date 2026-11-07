import { NextResponse } from "next/server";
import { computeEligibility } from "@/lib/eligibility";
import { BNS_BY_ID } from "@/lib/bns";
import { bharatCodeChat } from "@/lib/llm";

export const runtime = "nodejs";

const DISCLAIMER =
  "Legal information tool, not legal advice. Verify with DLSA/advocate.";

export async function POST(req: Request) {
  const body = (await req.json()) as {
    prisonerName?: string;
    caseNo?: string;
    court?: string;
    jail?: string;
    district?: string;
    state?: string;
    sectionIds?: string[];
    detentionStart?: string;
    firstTimeOffender?: boolean;
    pendingOtherCases?: boolean;
    accusedDelayDays?: number;
    today?: string;
  };
  if (!body.prisonerName || !body.caseNo || !body.sectionIds?.length || !body.detentionStart) {
    return NextResponse.json(
      { error: "prisonerName, caseNo, sectionIds and detentionStart are required." },
      { status: 400 }
    );
  }
  const comp = computeEligibility({
    sectionIds: body.sectionIds,
    detentionStart: body.detentionStart,
    firstTimeOffender: !!body.firstTimeOffender,
    pendingOtherCases: !!body.pendingOtherCases,
    accusedDelayDays: body.accusedDelayDays ?? 0,
    today: body.today,
  });
  const labels = body.sectionIds.map(
    (id) => BNS_BY_ID[id]?.label ?? id
  );

  const factsBlock = [
    `Prisoner: ${body.prisonerName}`,
    `Case: ${body.caseNo} — ${body.court ?? ""}${body.district ? ", " + body.district : ""}`,
    `Charges: ${labels.join(", ")}`,
    `Detention start: ${body.detentionStart}`,
    `First-time offender: ${body.firstTimeOffender ? "YES" : "NO"} → fraction ${
      comp.fraction === 1 / 3 ? "1/3 (release on bond)" : "1/2 (release on bail)"
    }`,
    `Eligibility date: ${comp.eligibilityDate ?? "none"}`,
    `Effective days detained: ${comp.daysDetainedEffective}; days beyond limit: ${comp.daysOverLimit}`,
    `Status: ${comp.status}; pending other cases: ${body.pendingOtherCases ? "YES (s.479(2) bars release)" : "NO"}`,
  ].join("\n");

  const system =
    "You draft short, formal release applications under BNSS Section 479 (India). " +
    "Use ONLY the facts given. Never invent case law, citations, or sentence lengths. " +
    "Keep the 1/3-vs-1/2 computation exactly as given. End the English draft with exactly: " +
    "[Legal information tool, not legal advice. Verify with DLSA/advocate.]";
  const user = `Draft the following as a ready-to-file application:\n\n${factsBlock}\n\nReturn: (1) ENGLISH application in court format, (2) then a horizontal line --- , (3) HINDI application, same content, ending with the Hindi disclaimer line.`;

  const llm = await bharatCodeChat(system, user);

  // Deterministic template fallback (same facts, guaranteed to render).
  const { renderEnglishApplication, renderHindiApplication } = await import(
    "@/lib/draftTemplate"
  );
  const facts = {
    prisonerName: body.prisonerName,
    caseNo: body.caseNo,
    court: body.court ?? "____________",
    chargeLabels: labels,
    detentionStart: body.detentionStart,
    eligibilityDate: comp.eligibilityDate,
    firstTimeOffender: !!body.firstTimeOffender,
    fractionLabel: comp.fraction === 1 / 3 ? ("one-third" as const) : ("one-half" as const),
    releaseMode: comp.releaseMode,
    daysDetainedEffective: comp.daysDetainedEffective,
    daysOverLimit: comp.daysOverLimit,
    governingMaxYears: comp.governingMaxYears,
    district: body.district,
    state: body.state,
  };
  const template = `${renderEnglishApplication(facts)}\n\n---\n\n${renderHindiApplication(facts)}`;

  const { buildApplication } = await import("@/lib/application");
  const { lookupDlsa } = await import("@/lib/dlsa");
  const dlsa = body.district ? lookupDlsa(body.state ?? "", body.district) : null;
  const application = buildApplication({
    prisonerName: body.prisonerName,
    caseNo: body.caseNo,
    court: body.court ?? "____________",
    jail: body.jail ?? "District Jail",
    district: body.district ?? "____________",
    state: body.state ?? "____________",
    charges: labels,
    detentionStart: body.detentionStart,
    eligibilityDate: comp.eligibilityDate,
    firstTimeOffender: !!body.firstTimeOffender,
    fractionLabel: comp.fraction === 1 / 3 ? "one-third" : "one-half",
    releaseMode: comp.releaseMode,
    daysDetainedEffective: comp.daysDetainedEffective,
    daysOverLimit: comp.daysOverLimit,
    governingMaxYears: comp.governingMaxYears,
    status: comp.status,
    today: comp.today,
    dlsaOffice: dlsa?.matches[0]?.officeName,
  });

  const draft =
    llm.source === "bharatcode" && llm.text
      ? llm.text.includes("Legal information")
        ? llm.text
        : `${llm.text}\n\n[${DISCLAIMER}]`
      : template;

  return NextResponse.json({
    eligibility: comp,
    draft,
    application,
    draftSource: llm.source,
    model: llm.model,
    modelStatusNote: llm.modelStatusNote,
    attempts: llm.attempts,
    disclaimer: DISCLAIMER,
  });
}

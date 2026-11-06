import { BNS_BY_ID, BNS_SECTIONS } from "./bns";

/**
 * Pure BNSS-479 eligibility engine. No I/O — unit-testable.
 *
 * Rules implemented (from BNSS s.479 verbatim, see lib/bnss479.ts):
 *  - Excluded if ANY charged offence specifies death/life (s.479(1) parenthesis).
 *    Our BNS 109 entry covers the "10 years, no hurt" variant only — see its note.
 *  - Fraction: first-time offender (never convicted) → 1/3, released "on bond";
 *    everyone else → 1/2, released "on bail".
 *  - Multiple offences in one case: compute per-offence dates; the person's
 *    eligibility date is the LATEST of them (must satisfy every count).
 *  - Multiple CASES / pending other offence (s.479(2)): NOT eligible — blocked.
 *    ("Pending other cases" input maps to s.479(2). Same-case multiple counts
 *    are computed; multiple-case pendency blocks.)
 *  - Accused-caused delay (Explanation): excluded from detention computation →
 *    added to the eligibility date AND subtracted from days detained.
 *  - Ceiling (4th proviso): detention must never exceed the max period for the
 *    offence. Flagged separately if already exceeded.
 *  - Court may extend/continue detention beyond 1/2 for recorded reasons after
 *    hearing the PP (3rd proviso) — shown as a caveat, not a computed date.
 *
 * Date arithmetic: 1 year = 365 days; threshold days = round(365*years*fraction).
 * Eligibility date = detentionStart + thresholdDays + accusedDelayDays.
 * All dates are calendar dates (UTC) for determinism.
 */

export type EligibilityStatus =
  | "ELIGIBLE_NOW"
  | "NOT_YET"
  | "BLOCKED_PENDING_OTHER_CASES"
  | "EXCLUDED_DEATH_LIFE"
  | "CEILING_BREACHED"
  | "UNKNOWN_SECTION";

export interface EligibilityInput {
  sectionIds: string[];
  detentionStart: string; // YYYY-MM-DD
  firstTimeOffender: boolean;
  pendingOtherCases: boolean;
  accusedDelayDays?: number;
  today?: string; // YYYY-MM-DD, defaults to UTC today
}

export interface PerSectionResult {
  sectionId: string;
  label: string;
  maxSentenceYears: number;
  maxSentenceLabel: string;
  thresholdDays: number;
  eligibilityDate: string;
  excluded: boolean;
}

export interface EligibilityResult {
  status: EligibilityStatus;
  fraction: number; // 1/3 (first-time) or 1/2
  releaseMode: "bond" | "bail";
  perSection: PerSectionResult[];
  governingMaxYears: number;
  eligibilityDate: string | null;
  daysDetainedEffective: number;
  daysOverLimit: number;
  accusedDelayDays: number;
  notes: string[];
}

const DAY_MS = 86400000;

export function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function parseDate(iso: string): Date {
  const d = new Date(iso + "T00:00:00Z");
  if (Number.isNaN(d.getTime())) throw new Error(`Invalid date: ${iso}`);
  return d;
}

function addDays(iso: string, days: number): string {
  return toISODate(new Date(parseDate(iso).getTime() + days * DAY_MS));
}

export function computeEligibility(input: EligibilityInput): EligibilityResult {
  const today = input.today ?? toISODate(new Date());
  const fraction: number = input.firstTimeOffender ? 1 / 3 : 1 / 2;
  const releaseMode = input.firstTimeOffender ? "bond" : "bail";
  const accusedDelayDays = Math.max(0, Math.floor(input.accusedDelayDays ?? 0));

  const notes: string[] = [
    "Arithmetic uses 365 days per year. Courts may compute by calendar years — verify the date with DLSA/jail superintendent.",
    "BNSS 479(3): the jail Superintendent must apply to the Court on completion of the 1/3 or 1/2 period. This tool pre-computes so families/DLSA can follow up — it does not replace that duty.",
    "3rd proviso: the Court may, after hearing the Public Prosecutor and for recorded reasons, order continued detention beyond one-half or convert bond/bail. Eligibility ≠ guaranteed release.",
  ];

  if (!input.sectionIds.length) {
    return {
      status: "UNKNOWN_SECTION",
      fraction,
      releaseMode,
      perSection: [],
      governingMaxYears: 0,
      eligibilityDate: null,
      daysDetainedEffective: 0,
      daysOverLimit: 0,
      accusedDelayDays,
      notes: ["Select at least one charged section.", ...notes],
    };
  }

  const unknown = input.sectionIds.filter((id) => !BNS_BY_ID[id]);
  if (unknown.length) {
    return {
      status: "UNKNOWN_SECTION",
      fraction,
      releaseMode,
      perSection: [],
      governingMaxYears: 0,
      eligibilityDate: null,
      daysDetainedEffective: 0,
      daysOverLimit: 0,
      accusedDelayDays,
      notes: [
        `Unknown / unsupported section id(s): ${unknown.join(", ")}. This MVP supports ${BNS_SECTIONS.length} verified BNS entries only. Verify the chargesheet section with DLSA/advocate.`,
        ...notes,
      ],
    };
  }

  const perSection: PerSectionResult[] = input.sectionIds.map((id) => {
    const s = BNS_BY_ID[id];
    const thresholdDays = Math.round(365 * s.maxSentenceYears * fraction);
    return {
      sectionId: id,
      label: `${s.label} — ${s.title}`,
      maxSentenceYears: s.maxSentenceYears,
      maxSentenceLabel: s.maxSentenceLabel,
      thresholdDays,
      eligibilityDate: addDays(input.detentionStart, thresholdDays + accusedDelayDays),
      excluded: s.excludes479,
    };
  });

  const anyExcluded = perSection.some((p) => p.excluded);
  const governing = perSection.reduce(
    (a, b) => (b.thresholdDays > a.thresholdDays ? b : a),
    perSection[0]
  );
  const eligibilityDate = governing.eligibilityDate;
  const governingMaxYears = governing.maxSentenceYears;

  const rawDays = Math.floor(
    (parseDate(today).getTime() - parseDate(input.detentionStart).getTime()) / DAY_MS
  );
  const daysDetainedEffective = Math.max(0, rawDays - accusedDelayDays);
  const daysOverLimit = Math.max(0, daysDetainedEffective - governing.thresholdDays);
  const ceilingDays = Math.round(365 * governingMaxYears);
  const ceilingBreached = daysDetainedEffective > ceilingDays;

  if (anyExcluded) {
    return {
      status: "EXCLUDED_DEATH_LIFE",
      fraction,
      releaseMode,
      perSection,
      governingMaxYears,
      eligibilityDate,
      daysDetainedEffective,
      daysOverLimit,
      accusedDelayDays,
      notes: [
        "BNSS 479(1) applies only where the offence does NOT specify death or life imprisonment as one of the punishments. At least one selected charge falls outside Section 479 — seek DLSA/advocate advice; do not rely on this tool for release.",
        ...notes,
      ],
    };
  }

  if (input.pendingOtherCases) {
    return {
      status: "BLOCKED_PENDING_OTHER_CASES",
      fraction,
      releaseMode,
      perSection,
      governingMaxYears,
      eligibilityDate,
      daysDetainedEffective,
      daysOverLimit,
      accusedDelayDays,
      notes: [
        "BNSS 479(2): where investigation/inquiry/trial in more than one offence or multiple cases are pending, the person shall not be released on bail. This input blocks Section 479 release. DLSA may still review each case separately.",
        ...notes,
      ],
    };
  }

  if (ceilingBreached) {
    return {
      status: "CEILING_BREACHED",
      fraction,
      releaseMode,
      perSection,
      governingMaxYears,
      eligibilityDate,
      daysDetainedEffective,
      daysOverLimit,
      accusedDelayDays,
      notes: [
        `4th proviso breached: detention already exceeds the maximum period (${governingMaxYears} years) for the governing offence. Escalate immediately to the Court / DLSA / jail Superintendent.`,
        ...notes,
      ],
    };
  }

  if (daysDetainedEffective >= governing.thresholdDays) {
    return {
      status: "ELIGIBLE_NOW",
      fraction,
      releaseMode,
      perSection,
      governingMaxYears,
      eligibilityDate,
      daysDetainedEffective,
      daysOverLimit,
      accusedDelayDays,
      notes: [
        `Detention has reached ${fraction === 1 / 3 ? "one-third" : "one-half"} of the maximum period. First-time offenders are released on bond at 1/3; others on bail at 1/2 (verify bond vs bail with the Court).`,
        ...notes,
      ],
    };
  }

  return {
    status: "NOT_YET",
    fraction,
    releaseMode,
    perSection,
    governingMaxYears,
    eligibilityDate,
    daysDetainedEffective,
    daysOverLimit: 0,
    accusedDelayDays,
    notes,
  };
}

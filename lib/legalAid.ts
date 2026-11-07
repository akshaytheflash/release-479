import {
  INCOME_LIMITS,
  INCOME_TABLE_ACCESSED_ON,
  NALSA_ACT_URL,
  NALSA_HELPLINE,
  NALSA_LEGAL_AID_URL,
  NALSA_ONLINE_APPLICATION_URL,
  SUPREME_COURT_INCOME_LIMIT,
  incomeLimitFor,
} from "./incomeLimits";

/**
 * Section 12, Legal Services Authorities Act, 1987 — eligibility categories.
 *
 * The category wording follows NALSA's own summary of s.12 at
 * https://nalsa.gov.in/legal-aid/ (fetched 2026-11-06). This module is a
 * screening aid, not a decision: s.13(1) still requires the Authority to be
 * satisfied that the person has a genuine case.
 */

export type LegalAidCategoryId =
  | "sc_st"
  | "trafficking"
  | "woman"
  | "child"
  | "disability"
  | "disaster"
  | "industrial_workman"
  | "in_custody"
  | "low_income";

export interface LegalAidCategory {
  id: LegalAidCategoryId;
  clause: string;
  label: string;
  detail: string;
}

export const LEGAL_AID_CATEGORIES: LegalAidCategory[] = [
  {
    id: "sc_st",
    clause: "s.12(a)",
    label: "Scheduled Caste or Scheduled Tribe",
    detail: "A member of a Scheduled Caste or Scheduled Tribe.",
  },
  {
    id: "trafficking",
    clause: "s.12(b)",
    label: "Victim of trafficking or begar",
    detail:
      "A victim of trafficking in human beings or begar as referred to in Article 23 of the Constitution.",
  },
  {
    id: "woman",
    clause: "s.12(c)",
    label: "Woman",
    detail: "A woman, irrespective of income or financial status.",
  },
  {
    id: "child",
    clause: "s.12(c)",
    label: "Child",
    detail: "A child, until the age of majority (18 years).",
  },
  {
    id: "disability",
    clause: "s.12(d)",
    label: "Disabled person",
    detail: "A mentally ill or otherwise disabled person.",
  },
  {
    id: "disaster",
    clause: "s.12(e)",
    label: "Victim of disaster or violence",
    detail:
      "A person under circumstances of undeserved want, such as a victim of a mass disaster, ethnic violence, caste atrocity, flood, drought, earthquake or industrial disaster.",
  },
  {
    id: "industrial_workman",
    clause: "s.12(f)",
    label: "Industrial workman",
    detail: "An industrial workman.",
  },
  {
    id: "in_custody",
    clause: "s.12(g)",
    label: "In custody",
    detail:
      "A person in custody, including custody in a protective home, juvenile home, or psychiatric hospital or nursing home.",
  },
  {
    id: "low_income",
    clause: "s.12(h)",
    label: "Annual income below the limit",
    detail:
      "Annual income below the State's notified ceiling (or below ₹5,00,000 for a Supreme Court case).",
  },
];

export type CourtLevel = "district" | "high" | "supreme";

export interface LegalAidInput {
  categories: LegalAidCategoryId[];
  state?: string;
  annualIncome?: number;
  court?: CourtLevel;
}

export interface LegalAidResult {
  status: "eligible" | "not_eligible" | "need_info";
  qualifiedBy: Array<{
    id: LegalAidCategoryId;
    clause: string;
    label: string;
    reason: string;
  }>;
  incomeLimit: number | null;
  incomeLimitBasis: string;
  annualIncome: number | null;
  court: CourtLevel;
  route: Array<{ step: string; detail: string }>;
  caveats: string[];
  sources: Array<{ label: string; url: string; accessedOn: string }>;
}

const SOURCES = [
  {
    label: "NALSA — who is entitled to free legal services (s.12)",
    url: NALSA_LEGAL_AID_URL,
    accessedOn: INCOME_TABLE_ACCESSED_ON,
  },
  {
    label: "Legal Services Authorities Act, 1987 (NALSA text page)",
    url: NALSA_ACT_URL,
    accessedOn: INCOME_TABLE_ACCESSED_ON,
  },
];

export function checkLegalAid(input: LegalAidInput): LegalAidResult {
  const court = input.court ?? "district";
  const annualIncome =
    typeof input.annualIncome === "number" && Number.isFinite(input.annualIncome)
      ? Math.max(0, input.annualIncome)
      : null;
  const categories = input.categories.filter((id) =>
    LEGAL_AID_CATEGORIES.some((c) => c.id === id)
  );

  let incomeLimit: number | null = null;
  let incomeLimitBasis = "";
  if (court === "supreme") {
    incomeLimit = SUPREME_COURT_INCOME_LIMIT;
    incomeLimitBasis =
      "Supreme Court cases: ₹5,00,000 per year, as stated in NALSA's legal-aid FAQ.";
  } else if (input.state) {
    const row = incomeLimitFor(input.state);
    if (row) {
      incomeLimit = row.limit;
      incomeLimitBasis = `${row.state}: ₹${row.limit.toLocaleString("en-IN")} per year, as published in NALSA's State-wise income-ceiling table.`;
    } else {
      incomeLimitBasis =
        "No State income ceiling is in the sourced NALSA table for this State/UT. The DLSA will apply the notified limit.";
    }
  } else {
    incomeLimitBasis =
      "Choose a State/UT to see the income ceiling published by NALSA. Supreme Court cases use ₹5,00,000.";
  }

  const qualifiedBy: LegalAidResult["qualifiedBy"] = [];
  for (const id of categories) {
    const cat = LEGAL_AID_CATEGORIES.find((c) => c.id === id)!;
    if (id === "low_income") {
      if (annualIncome === null || incomeLimit === null) continue;
      if (annualIncome < incomeLimit) {
        qualifiedBy.push({
          id,
          clause: cat.clause,
          label: cat.label,
          reason: `Annual income ₹${annualIncome.toLocaleString("en-IN")} is below the ₹${incomeLimit.toLocaleString("en-IN")} ceiling.`,
        });
      }
      continue;
    }
    qualifiedBy.push({
      id,
      clause: cat.clause,
      label: cat.label,
      reason: cat.detail,
    });
  }

  const incomeSelected = categories.includes("low_income");
  const needsIncome =
    incomeSelected &&
    qualifiedBy.length === 0 &&
    (annualIncome === null || incomeLimit === null);

  const route: Array<{ step: string; detail: string }> = [
    {
      step: "Apply at the District Legal Services Authority",
      detail:
        "Go to the DLSA office in the district where the case is filed, or the legal-aid clinic in the jail. A written application on plain paper is enough; NALSA also accepts an online application.",
    },
    {
      step: "Use the online route if travel is difficult",
      detail: `NALSA online application: ${NALSA_ONLINE_APPLICATION_URL}. The national free legal-aid helpline is ${NALSA_HELPLINE} (toll-free).`,
    },
    {
      step: "Take the papers you already have",
      detail:
        "Caste or tribe certificate (for s.12(a)), income affidavit (for s.12(h)), custody or case number, and any disability, trafficking or disaster record. The Authority may accept an affidavit of income under s.13(2).",
    },
    {
      step: "Ask the DLSA to assign a legal-aid counsel",
      detail:
        "If the person is in custody, tell the jail Superintendent and the DLSA secretary. Under s.479(3) BNSS the Superintendent must move the court when the 1/3 or 1/2 period is complete.",
    },
  ];

  const caveats = [
    "Section 13(1) of the Legal Services Authorities Act, 1987 also requires the Authority to be satisfied that the person has a genuine case to prosecute or defend.",
    "This is a screening result based only on the boxes you ticked. The DLSA decides eligibility and may ask for proof.",
    "Legal information, not legal advice. Verify with the DLSA or an advocate.",
  ];

  if (qualifiedBy.length) {
    return {
      status: "eligible",
      qualifiedBy,
      incomeLimit,
      incomeLimitBasis,
      annualIncome,
      court,
      route,
      caveats,
      sources: SOURCES,
    };
  }

  if (needsIncome) {
    return {
      status: "need_info",
      qualifiedBy,
      incomeLimit,
      incomeLimitBasis,
      annualIncome,
      court,
      route,
      caveats,
      sources: SOURCES,
    };
  }

  return {
    status: "not_eligible",
    qualifiedBy,
    incomeLimit,
    incomeLimitBasis,
    annualIncome,
    court,
    route,
    caveats,
    sources: SOURCES,
  };
}

export function legalAidReference() {
  return {
    categories: LEGAL_AID_CATEGORIES,
    incomeLimits: INCOME_LIMITS,
    supremeCourtLimit: SUPREME_COURT_INCOME_LIMIT,
    accessedOn: INCOME_TABLE_ACCESSED_ON,
    helpline: NALSA_HELPLINE,
    onlineApplicationUrl: NALSA_ONLINE_APPLICATION_URL,
    sources: SOURCES,
  };
}

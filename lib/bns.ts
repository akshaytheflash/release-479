/**
 * Supported BNS offences with statutory MAXIMUM imprisonment (years).
 *
 * Source authority for every entry: Bharatiya Nyaya Sanhita, 2023, India Code
 * (https://www.indiacode.nic.in/handle/123456789/20062). The punishment clause
 * quoted in `punishmentVerbatim` was verified against the BNS text as mirrored
 * at https://devgan.in/bns/section/<n>/ on 2026-11-06 (India Code returns 403
 * to automated fetch; the Devgan lines are verbatim BNS provisions — verify
 * against the Gazette / India Code PDF before filing). No sentence value below
 * was invented; each is the "may extend to X years" maximum named in the section.
 *
 * Only the maximum is stored. Fine / community-service / minimums are for the
 * court; BNSS 479 computes against the MAXIMUM period specified for the offence.
 */

export interface BnsSection {
  /** Stable id used in forms, CSV and the DB. */
  id: string;
  /** e.g. "BNS 303(2)" */
  label: string;
  title: string;
  /** Maximum imprisonment in years (numeric, for date arithmetic). */
  maxSentenceYears: number;
  /** Human label, e.g. "3 years". */
  maxSentenceLabel: string;
  /**
   * Verbatim punishment clause (BNS). Includes aggravated/aggravated variants
   * in `note` where the section has graded punishments.
   */
  punishmentVerbatim: string;
  /** India Code Act URL (BNS 2023). */
  sourceUrl: string;
  /** If true, BNSS 479(1) expressly excludes the offence (death/life specified). */
  excludes479: boolean;
  /** Grading / variant notes the user must see before relying on the date. */
  note: string;
}

const BNS_ACT = "https://www.indiacode.nic.in/handle/123456789/20062";

export const BNS_SECTIONS: BnsSection[] = [
  {
    id: "bns115",
    label: "BNS 115",
    title: "Voluntarily causing hurt",
    maxSentenceYears: 1,
    maxSentenceLabel: "1 year",
    punishmentVerbatim:
      "Whoever, except in the case provided for by sub-section (1) of section 120 voluntarily causes hurt, shall be punished with imprisonment of either description for a term which may extend to one year, or with fine which may extend to ten thousand rupees, or with both. — BNS s.115(2).",
    sourceUrl: BNS_ACT,
    excludes479: false,
    note: "Devgan mirror: devgan.in/bns/section/115 (verified 2026-11-06).",
  },
  {
    id: "bns329_house",
    label: "BNS 329(3)",
    title: "House-trespass",
    maxSentenceYears: 1,
    maxSentenceLabel: "1 year",
    punishmentVerbatim:
      "Whoever commits house-trespass shall be punished with imprisonment of either description for a term which may extend to one year, or with fine which may extend to five thousand rupees, or with both. — BNS s.329(3). (Criminal trespass, s.329(2): may extend to three months.)",
    sourceUrl: BNS_ACT,
    excludes479: false,
    note: "Devgan mirror: devgan.in/bns/section/329 (verified 2026-11-06). House-trespass variant used; select simple criminal trespass only with DLSA advice.",
  },
  {
    id: "bns351_simple",
    label: "BNS 351(2)",
    title: "Criminal intimidation (simple)",
    maxSentenceYears: 2,
    maxSentenceLabel: "2 years",
    punishmentVerbatim:
      "Whoever commits the offence of criminal intimidation shall be punished with imprisonment of either description for a term which may extend to two years, or with fine, or with both. — BNS s.351(2).",
    sourceUrl: BNS_ACT,
    excludes479: false,
    note: "Devgan mirror: devgan.in/bns/section/351 (verified 2026-11-06). Aggravated form is BNS 351(3) (7 years, separate entry below).",
  },
  {
    id: "bns303",
    label: "BNS 303(2)",
    title: "Theft (ordinary)",
    maxSentenceYears: 3,
    maxSentenceLabel: "3 years",
    punishmentVerbatim:
      "Whoever commits theft shall be punished with imprisonment of either description for a term which may extend to three years, or with fine, or with both; and in case of second or subsequent conviction … rigid imprisonment … not less than one year but which may extend to five years … — BNS s.303 (theft definition + punishment).",
    sourceUrl: BNS_ACT,
    excludes479: false,
    note: "Devgan mirror: devgan.in/bns/section/303 (verified 2026-11-06). Repeat-conviction ceiling is 5 years — first-time detainees use 3 years; confirm with DLSA if prior conviction exists.",
  },
  {
    id: "bns318_simple",
    label: "BNS 318(2)",
    title: "Cheating (simple)",
    maxSentenceYears: 3,
    maxSentenceLabel: "3 years",
    punishmentVerbatim:
      "Whoever cheats shall be punished with imprisonment of either description for a term which may extend to three years, or with fine, or with both. — BNS s.318(2).",
    sourceUrl: BNS_ACT,
    excludes479: false,
    note: "Devgan mirror: devgan.in/bns/section/318 (verified 2026-11-06). s.318(3) raises to 5 years (wrongful loss to protected person); s.318(4) to 7 years (delivery of property) — separate entry below.",
  },
  {
    id: "bns316",
    label: "BNS 316(2)",
    title: "Criminal breach of trust (simple)",
    maxSentenceYears: 5,
    maxSentenceLabel: "5 years",
    punishmentVerbatim:
      "Whoever commits criminal breach of trust shall be punished with imprisonment of either description for a term which may extend to five years, or with fine, or with both. — BNS s.316(2). (Carrier/wharfinger s.316(3) and clerk/servant s.316(4): 7 years; public servant/banker etc. s.316(5): life or up to 10 years.)",
    sourceUrl: BNS_ACT,
    excludes479: false,
    note: "Devgan mirror: devgan.in/bns/section/316 (verified 2026-11-06). If the accused is a public servant/banker/agent with life imprisonment specified, BNSS 479 does NOT apply — take DLSA advice.",
  },
  {
    id: "bns117",
    label: "BNS 117(2)",
    title: "Voluntarily causing grievous hurt",
    maxSentenceYears: 7,
    maxSentenceLabel: "7 years",
    punishmentVerbatim:
      "Whoever, except in the case provided for by sub-section (3), voluntarily causes grievous hurt, shall be punished with imprisonment of either description for a term which may extend to seven years, and shall also be liable to fine. — BNS s.117(2). (Permanent disability/PVS: s.117(3), rigorous 10 years to life.)",
    sourceUrl: BNS_ACT,
    excludes479: false,
    note: "Devgan mirror: devgan.in/bns/section/117 (verified 2026-11-06). Permanent-disability variant specifies life — Section 479 excluded for that variant.",
  },
  {
    id: "bns351_agg",
    label: "BNS 351(3)",
    title: "Criminal intimidation (aggravated)",
    maxSentenceYears: 7,
    maxSentenceLabel: "7 years",
    punishmentVerbatim:
      "Whoever commits the offence of criminal intimidation by threatening to cause death or grievous hurt, or … an offence punishable with death or imprisonment for life, or with imprisonment for a term which may extend to seven years, or to impute unchastity to a woman, shall be punished with imprisonment of either description for a term which may extend to seven years, or with fine, or with both. — BNS s.351(3).",
    sourceUrl: BNS_ACT,
    excludes479: false,
    note: "Devgan mirror: devgan.in/bns/section/351 (verified 2026-11-06).",
  },
  {
    id: "bns318_delivery",
    label: "BNS 318(4)",
    title: "Cheating with delivery of property",
    maxSentenceYears: 7,
    maxSentenceLabel: "7 years",
    punishmentVerbatim:
      "Whoever cheats and thereby dishonestly induces the person deceived to deliver any property … shall be punished with imprisonment of either description for a term which may extend to seven years, and shall also be liable to fine. — BNS s.318(4).",
    sourceUrl: BNS_ACT,
    excludes479: false,
    note: "Devgan mirror: devgan.in/bns/section/318 (verified 2026-11-06).",
  },
  {
    id: "bns309",
    label: "BNS 309(4)",
    title: "Robbery (ordinary)",
    maxSentenceYears: 10,
    maxSentenceLabel: "10 years",
    punishmentVerbatim:
      "Whoever commits robbery shall be punished with rigorous imprisonment for a term which may extend to ten years, and shall also be liable to fine; and, if the robbery be committed on the highway between sunset and sunrise, the imprisonment may be extended to fourteen years. — BNS s.309(4).",
    sourceUrl: BNS_ACT,
    excludes479: false,
    note: "Devgan mirror: devgan.in/bns/section/309 (verified 2026-11-06). Highway-night variant: 14 years — verify with DLSA if applicable. Voluntarily causing hurt in robbery (s.309(6)) specifies life — Section 479 excluded for that variant.",
  },
  {
    id: "bns109",
    label: "BNS 109(1)",
    title: "Attempt to murder (no hurt caused)",
    maxSentenceYears: 10,
    maxSentenceLabel: "10 years (up to life if hurt is caused)",
    punishmentVerbatim:
      "Whoever does any act with such intention or knowledge … that, if he by that act caused death, he would be guilty of murder, shall be punished with imprisonment of either description for a term which may extend to ten years, and shall also be liable to fine; and if hurt is caused to any person by such act, the offender shall be liable either to imprisonment for life, or to such punishment as is hereinbefore mentioned. — BNS s.109(1).",
    sourceUrl: BNS_ACT,
    excludes479: false,
    note: "Devgan mirror: devgan.in/bns/section/109 (verified 2026-11-06). ⚠ If HURT was caused, life imprisonment is specified and BNSS 479(1) EXCLUDES the offence entirely — this tool must not be relied on. Confirm facts with DLSA/advocate.",
  },
];

export const BNS_BY_ID: Record<string, BnsSection> = Object.fromEntries(
  BNS_SECTIONS.map((s) => [s.id, s])
);

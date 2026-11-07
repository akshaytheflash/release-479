/**
 * BNSS Section 479 — verbatim statutory text.
 *
 * Authority: Bharatiya Nagarik Suraksha Sanhita, 2023, India Code
 * https://www.indiacode.nic.in/handle/123456789/20099
 * Text below was verified against the BNSS text as reproduced by Indian Kanoon
 * ("Section 479 in Bharatiya Nagarik Suraksha Sanhita, 2023", https://indiankanoon.org/doc/87702491/)
 * fetched 2026-11-06. India Code returns 403 to automated fetch; reconcile with
 * the Gazette / India Code PDF before filing. Do NOT edit wording.
 */
export const BNSS479_TITLE = "Section 479 in Bharatiya Nagarik Suraksha Sanhita, 2023";

export const BNSS479_HEADING =
  "479. Maximum period for which undertrial prisoner can be detained.";

export const BNSS479_VERBATIM = `479. Maximum period for which undertrial prisoner can be detained.
(1) Where a person has, during the period of investigation, inquiry or trial under this Sanhita of an offence under any law (not being an offence for which the punishment of death or life imprisonment has been specified as one of the punishments under that law) undergone detention for a period extending up to one-half of the maximum period of imprisonment specified for that offence under that law, he shall be released by the Court on bail:
Provided that where such person is a first-time offender (who has never been convicted of any offence in the past) he shall be released on bond by the Court, if he has undergone detention for the period extending up to one-third of the maximum period of imprisonment specified for such offence under that law:
Provided further that the Court may, after hearing the Public Prosecutor and for reasons to be recorded by it in writing, order the continued detention of such person for a period longer than one-half of the said period or release him on bail bond instead of his bond:
Provided also that no such person shall in any case be detained during the period of investigation, inquiry or trial for more than the maximum period of imprisonment provided for the said offence under that law.
Explanation.—In computing the period of detention under this section for granting bail, the period of detention passed due to delay in proceeding caused by the accused shall be excluded.
(2) Notwithstanding anything in sub-section (1), and subject to the third proviso thereof, where an investigation, inquiry or trial in more than one offence or in multiple cases are pending against a person, he shall not be released on bail by the Court.
(3) The Superintendent of jail, where the accused person is detained, on completion of one-half or one-third of the period mentioned in sub-section (1), as the case may be, shall forthwith make an application in writing to the Court to proceed under sub-section (1) for the release of such person on bail.`;

export const BNSS479_SOURCE_URL =
  "https://www.indiacode.nic.in/handle/123456789/20099";

/** Exact excerpts used in the generated application. Do not paraphrase. */
export const BNSS479_QUOTE = {
  sub1: BNSS479_VERBATIM.split("\n")[1],
  firstProviso: BNSS479_VERBATIM.split("\n")[2],
  sub3: BNSS479_VERBATIM.split("\n")[7],
};

/** NCRB Prison Statistics India 2024 — verified figures (see Sources page). */
export const NCRB_2024 = {
  totalPrisonersEnd2024: 511542,
  undertrialsEnd2024: 371440,
  undertrialSharePct: 72.6,
  report: "NCRB, Prison Statistics India 2024 (report PDF hosted at ncrb.mha.gov.in)",
  reportUrl: "https://www.ncrb.mha.gov.in/uploads/files/PSI-2024ason26022026.pdf",
};

export const NJDG_DASHBOARD_URL = "https://njdg.ecourts.gov.in/";

/**
 * data.gov.in Civil Pendency dataset search (requires a user API key; this app
 * never fabricates medians — it links to the dataset and shows the search UI).
 */
export const DATA_GOV_IN_SEARCH_URL =
  "https://data.gov.in/search?query=civil%20pendency";

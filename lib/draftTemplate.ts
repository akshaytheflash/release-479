/**
 * Deterministic court-format application templates (English + Hindi).
 *
 * These are the FALLBACK drafts used whenever the BharatCode LLM is unreachable
 * (the API returns 500/503 intermittently). They are also the baseline the LLM
 * is instructed to stay faithful to. Both carry the Section 479 premise, the
 * 1/3-or-1/2 computation, and the mandatory disclaimer. Fill every bracket
 * before filing; a DLSA advocate / jail Superintendent must review.
 */

export interface DraftFacts {
  prisonerName: string;
  caseNo: string;
  court: string;
  chargeLabels: string[];
  detentionStart: string;
  eligibilityDate: string | null;
  firstTimeOffender: boolean;
  fractionLabel: "one-third" | "one-half";
  releaseMode: "bond" | "bail";
  daysDetainedEffective: number;
  daysOverLimit: number;
  governingMaxYears?: number;
  district?: string;
  state?: string;
}

export function renderEnglishApplication(f: DraftFacts): string {
  const districtLine = f.district
    ? `District: ${f.district}${f.state ? ", " + f.state : ""}`
    : "District: ____________";
  return `IN THE COURT OF ${f.court}
${districtLine}
Case No.: ${f.caseNo}

State v. ${f.prisonerName} (accused)

APPLICATION UNDER SECTION 479 OF THE BHARATIYA NAGARIK SURAKSHA
SANHITA, 2023 FOR RELEASE ${f.releaseMode === "bond" ? "ON BOND" : "ON BAIL"}

May it please this Hon'ble Court:

1. The applicant, ${f.prisonerName}, is an undertrial in the above case
   charged under: ${f.chargeLabels.join(", ") || "____________"}.

2. The applicant was taken into custody on ${f.detentionStart} and has
   been detained since then. Effective detention (excluding any delay
   caused by the accused, per the Explanation to S. 479) is
   ${f.daysDetainedEffective} days.

3. ${f.firstTimeOffender ? "The applicant is a first-time offender (never convicted of any offence in the past)." : "The applicant is not a first-time offender."}
   The maximum period of imprisonment specified for the charged
   offence(s) is ${f.governingMaxYears ?? "____________"} years, and the ${f.fractionLabel} period computed under
   Section 479(1) was reached on ${f.eligibilityDate ?? "____________"}.
   The applicant has been detained ${f.daysOverLimit} days beyond that
   period.

4. Under Section 479(1) of the Bharatiya Nagarik Suraksha Sanhita, 2023
   the applicant is entitled to be released ${
     f.releaseMode === "bond" ? "on bond" : "on bail"
   } upon completion of ${f.fractionLabel} of the maximum period.
   Under Section 479(3), the Superintendent of Jail is required to apply
   to this Hon'ble Court forthwith on completion of the said period.

5. There is no other case / offence pending against the applicant
   [if applicable: and the applicant is ready to comply with any conditions
   this Hon'ble Court may impose].

WHEREFORE, it is most respectfully prayed that this Hon'ble Court may be
pleased to: (a) release the applicant ${f.releaseMode === "bond" ? "on bond" : "on bail"} in the above
case; (b) fix surety / bond conditions as deemed fit; and (c) pass such
further orders as this Hon'ble Court may deem just and proper in the
interest of justice.

Applicant (through DLSA / jail authorities as applicable):
${f.prisonerName}
Date: ____________
Place: ____________

[Legal information tool, not legal advice. Verify with DLSA/advocate.]`;
}

export function renderHindiApplication(f: DraftFacts): string {
  return `मा0 न्यायालय ${f.court}
जिला: ${f.district ?? "____________"}
वाद संख्या: ${f.caseNo}

राज्य बनाम ${f.prisonerName} (अभियुक्त)

भारतीय नागरिक सुरक्षा संहिता, 2023 की धारा 479 के अधीन ${
    f.releaseMode === "bond" ? "बंधन (बॉन्ड)" : "जमानत"
} पर रिहाई हेतु आवेदन

माननीय न्यायालय से सविनय निवेदन है:

1. आवेदक, ${f.prisonerName}, उपरोक्त वाद में विचाराधीन बंदी है।
   आरोप: ${f.chargeLabels.join(", ") || "____________"}।

2. आवेदक को ${f.detentionStart} को अभिरक्षा में लिया गया था।
   अभियुक्त-जनित विलंब को छोड़कर प्रभावी हिरासत ${f.daysDetainedEffective} दिन है।

3. ${f.firstTimeOffender ? "आवेदक प्रथम अपराधी है (अतीत में कभी दोषसिद्ध नहीं हुआ)।" : "आवेदक प्रथम अपराधी नहीं है।"}
   ${f.fractionLabel === "one-third" ? "एक-तिहाई" : "आधा"} की अवधि ${
     f.eligibilityDate ?? "____________"
   } को पूर्ण हुई।

4. भारतीय नागरिक सुरक्षा संहिता, 2023 की धारा 479(1) के अनुसार आवेदक ${
     f.releaseMode === "bond" ? "बंधन" : "जमानत"
   } पर रिहाई का हकदार है। धारा 479(3) के अनुसार जेल अधीक्षक को
   नियत अवधि पूर्ण होते ही न्यायालय को आवेदन देना होता है।

अतः निवेदन है कि माननीय न्यायालय आवेदक को ${
    f.releaseMode === "bond" ? "बंधन" : "जमानत"
} पर रिहा करने, प्रतिभू/बंधन शर्तें नियत करने तथा न्याय हित में
अन्य उपयुक्त आदेश पारित करने की कृपा करें।

आवेदक: ${f.prisonerName}
दिनांक: ____________  स्थान: ____________

[यह विधिक सूचना साधन है, विधिक सलाह नहीं। कृपया जिला विधिक सेवा प्राधिकरण (DLSA)/अधिवक्ता से जाँच करवाएँ।]`;
}

import { BNSS479_QUOTE } from "./bnss479";

/**
 * Deterministic court-format application. No LLM is required: the same facts
 * always produce the same document, so it can be printed and checked.
 *
 * Addressees are the jail Superintendent (who must move the court under
 * s.479(3) BNSS) and the court. The statutory excerpts are verbatim from
 * lib/bnss479.ts. The Hindi version is a translation and is marked as such.
 */

export interface ApplicationFacts {
  prisonerName: string;
  caseNo: string;
  court: string;
  jail: string;
  district: string;
  state: string;
  charges: string[];
  detentionStart: string;
  eligibilityDate: string | null;
  firstTimeOffender: boolean;
  fractionLabel: "one-third" | "one-half";
  releaseMode: "bond" | "bail";
  daysDetainedEffective: number;
  daysOverLimit: number;
  governingMaxYears: number;
  status: string;
  today: string;
  dlsaOffice?: string;
}

export interface ApplicationParagraph {
  no: number;
  text: string;
}

export interface ApplicationDoc {
  lang: "en" | "hi";
  addressees: string[];
  courtLine: string;
  caseNo: string;
  parties: string;
  title: string;
  body: ApplicationParagraph[];
  prayerLead: string;
  prayer: string[];
  statutoryQuote: string;
  statutoryNote: string;
  verification: string;
  signature: string[];
  disclaimer: string;
  caution: string | null;
}

export interface ApplicationBundle {
  english: ApplicationDoc;
  hindi: ApplicationDoc;
  hindiSummary: string;
}

const EN_DISCLAIMER =
  "Legal information tool, not legal advice. Verify with the District Legal Services Authority or an advocate before filing.";
const HI_DISCLAIMER =
  "यह विधिक सूचना साधन है, विधिक सलाह नहीं। दाखिल करने से पहले जिला विधिक सेवा प्राधिकरण या अधिवक्ता से जाँच करवाएँ।";

export function formatDateEn(iso: string | null): string {
  if (!iso) return "____________";
  const d = new Date(iso + "T00:00:00Z");
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function formatDateHi(iso: string | null): string {
  if (!iso) return "____________";
  const d = new Date(iso + "T00:00:00Z");
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("hi-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function orBlank(value: string): string {
  return value.trim() || "____________";
}

function titleFor(f: ApplicationFacts, lang: "en" | "hi"): string {
  const canApply = ["ELIGIBLE_NOW", "CEILING_BREACHED", "NOT_YET"].includes(f.status);
  if (lang === "en") {
    if (!canApply) {
      return "REPRESENTATION FOR DIRECTIONS UNDER SECTION 479 OF THE BHARATIYA NAGARIK SURAKSHA SANHITA, 2023";
    }
    return `APPLICATION UNDER SECTION 479(1) AND 479(3) OF THE BHARATIYA NAGARIK SURAKSHA SANHITA, 2023 FOR RELEASE ON ${f.releaseMode === "bond" ? "BOND" : "BAIL"}`;
  }
  if (!canApply) {
    return "भारतीय नागरिक सुरक्षा संहिता, 2023 की धारा 479 के अंतर्गत निर्देश हेतु प्रतिवेदन";
  }
  return `भारतीय नागरिक सुरक्षा संहिता, 2023 की धारा 479(1) एवं 479(3) के अंतर्गत ${f.releaseMode === "bond" ? "बंधन" : "जमानत"} पर रिहाई हेतु आवेदन`;
}

function cautionFor(f: ApplicationFacts): string | null {
  if (f.status === "BLOCKED_PENDING_OTHER_CASES") {
    return "Caution for the DLSA: s.479(2) BNSS says a person shall not be released on bail while more than one offence or multiple cases are pending. This document is a representation for directions, not a guarantee of release.";
  }
  if (f.status === "EXCLUDED_DEATH_LIFE") {
    return "Caution for the DLSA: at least one charged offence specifies death or life imprisonment, so s.479(1) may not apply. Verify the charge before filing.";
  }
  if (f.status === "UNKNOWN_SECTION") {
    return "Caution for the DLSA: the charge list is incomplete or unsupported. Verify the sections before filing.";
  }
  return null;
}

export function buildApplication(f: ApplicationFacts): ApplicationBundle {
  const name = orBlank(f.prisonerName);
  const caseNo = orBlank(f.caseNo);
  const court = orBlank(f.court);
  const jail = orBlank(f.jail);
  const district = orBlank(f.district);
  const state = orBlank(f.state);
  const charges = f.charges.length ? f.charges.join(", ") : "____________";
  const eligibility = formatDateEn(f.eligibilityDate);
  const start = formatDateEn(f.detentionStart);
  const fractionWord = f.fractionLabel;
  const releaseWord = f.releaseMode === "bond" ? "bond" : "bail";
  const canApply = ["ELIGIBLE_NOW", "CEILING_BREACHED", "NOT_YET"].includes(f.status);
  const pendingOther = f.status === "BLOCKED_PENDING_OTHER_CASES";
  const overText =
    f.daysOverLimit > 0
      ? `${f.daysOverLimit} days beyond that period`
      : "the period is not yet complete";

  const addresseesEn = [
    `The Superintendent, ${jail}, District ${district}, ${state}`,
    `The Hon'ble ${court}, District ${district}, ${state}`,
  ];
  if (f.dlsaOffice) addresseesEn.push(`Copy to: ${f.dlsaOffice}`);

  const addresseesHi = [
    `अधीक्षक, ${jail}, जिला ${district}, ${state}`,
    `माननीय ${court}, जिला ${district}, ${state}`,
  ];
  if (f.dlsaOffice) addresseesHi.push(`प्रतिलिपि: ${f.dlsaOffice}`);

  const english: ApplicationDoc = {
    lang: "en",
    addressees: addresseesEn,
    courtLine: `IN THE COURT OF ${court.toUpperCase()}`,
    caseNo,
    parties: `State v. ${name} (accused)`,
    title: titleFor(f, "en"),
    body: [
      {
        no: 1,
        text: `The applicant, ${name}, is an undertrial in the above case, charged under ${charges}. The applicant has been in custody in ${jail} since ${start}.`,
      },
      {
        no: 2,
        text: `The maximum period of imprisonment specified for the governing offence is ${f.governingMaxYears} years. The applicant is ${f.firstTimeOffender ? "a first-time offender who has never been convicted of any offence, so the applicable fraction is one-third on bond" : "not a first-time offender, so the applicable fraction is one-half on bail"}. The ${fractionWord} period was reached on ${eligibility}.`,
      },
      {
        no: 3,
        text: `Excluding any period of delay caused by the accused under the Explanation to s.479, the effective detention is ${f.daysDetainedEffective} days. The applicant has been detained ${overText}.`,
      },
      {
        no: 4,
        text: `Under s.479(1) BNSS the applicant is entitled to be released on ${releaseWord} on completion of ${fractionWord} of the maximum period. Under s.479(3), the Superintendent of the jail is required to apply to this Court forthwith when that period is complete.`,
      },
      {
        no: 5,
        text: pendingOther
          ? "Other cases are pending against the applicant. The applicant does not conceal this and seeks the Court's directions after hearing the Public Prosecutor, as required by s.479(2)."
          : "No other case or offence is pending against the applicant. The applicant is ready to comply with any conditions the Court imposes.",
      },
    ],
    prayerLead: "WHEREFORE, it is most respectfully prayed that this Hon'ble Court may be pleased to:",
    prayer: [
      `release the applicant on ${releaseWord} in the above case;`,
      "fix surety, bond or bail conditions as the Court deems fit; and",
      "pass any further order that is just and proper in the interest of justice.",
    ],
    statutoryQuote: `“${BNSS479_QUOTE.sub1}”\n\n“${BNSS479_QUOTE.firstProviso}”\n\n“${BNSS479_QUOTE.sub3}”`,
    statutoryNote:
      "Verbatim excerpts from the Bharatiya Nagarik Suraksha Sanhita, 2023, s.479. Reconcile with the Gazette / India Code text before filing.",
    verification: `I, ${name}, verify that the facts stated in paragraphs 1 to 5 are true to my knowledge and that I am making this application through the District Legal Services Authority.`,
    signature: [
      "Place: ____________",
      "Date: ____________",
      "____________________________",
      `Signature / left thumb impression of the applicant (${name})`,
      "Through: Legal Aid Counsel, District Legal Services Authority",
      `Forwarded by: Superintendent, ${jail}`,
    ],
    disclaimer: EN_DISCLAIMER,
    caution: cautionFor(f),
  };

  const hindi: ApplicationDoc = {
    lang: "hi",
    addressees: addresseesHi,
    courtLine: `माननीय ${court} के न्यायालय में`,
    caseNo,
    parties: `राज्य बनाम ${name} (अभियुक्त)`,
    title: titleFor(f, "hi"),
    body: [
      {
        no: 1,
        text: `आवेदक ${name} उपरोक्त वाद में विचाराधीन बंदी है और ${charges} के अंतर्गत आरोपित है। आवेदक ${start} से ${jail} में अभिरक्षा में है।`,
      },
      {
        no: 2,
        text: `नियंत्रक अपराध के लिए निर्धारित अधिकतम कारावास ${f.governingMaxYears} वर्ष है। आवेदक ${f.firstTimeOffender ? "प्रथम अपराधी है और पूर्व में किसी अपराध में दोषसिद्ध नहीं हुआ, अतः एक-तिहाई अवधि पर बंधन लागू होता है" : "प्रथम अपराधी नहीं है, अतः आधी अवधि पर जमानत लागू होती है"}। ${fractionWord === "one-third" ? "एक-तिहाई" : "आधी"} अवधि ${formatDateHi(f.eligibilityDate)} को पूरी हुई।`,
      },
      {
        no: 3,
        text: `धारा 479 के स्पष्टीकरण के अनुसार अभियुक्त-जनित विलंब को छोड़कर प्रभावी हिरासत ${f.daysDetainedEffective} दिन है। आवेदक उस अवधि से ${f.daysOverLimit > 0 ? `${f.daysOverLimit} दिन अधिक` : "अभी अधिक नहीं"} हिरासत में है।`,
      },
      {
        no: 4,
        text: `धारा 479(1) के अनुसार आवेदक अधिकतम अवधि की ${fractionWord === "one-third" ? "एक-तिहाई" : "आधी"} अवधि पूरी होने पर ${releaseWord === "bond" ? "बंधन" : "जमानत"} पर रिहाई का हकदार है। धारा 479(3) के अनुसार जेल अधीक्षक को अवधि पूरी होते ही इस न्यायालय को आवेदन देना होता है।`,
      },
      {
        no: 5,
        text: pendingOther
          ? "आवेदक के विरुद्ध अन्य मामले लंबित हैं। आवेदक इस तथ्य को नहीं छिपाता और धारा 479(2) के अनुसार लोक अभियोजक को सुनने के बाद न्यायालय के निर्देश चाहता है।"
          : "आवेदक के विरुद्ध कोई अन्य मामला या अपराध लंबित नहीं है। आवेदक न्यायालय द्वारा लगाई गई किसी भी शर्त का पालन करने को तैयार है।",
      },
    ],
    prayerLead: "अतः माननीय न्यायालय से सविनय प्रार्थना है कि:",
    prayer: [
      `आवेदक को उपरोक्त वाद में ${releaseWord === "bond" ? "बंधन" : "जमानत"} पर रिहा किया जाए;`,
      "प्रतिभू, बंधन या जमानत की शर्तें न्यायोचित रूप से निर्धारित की जाएँ; और",
      "न्याय के हित में कोई अन्य उपयुक्त आदेश पारित किया जाए।",
    ],
    statutoryQuote: `“${BNSS479_QUOTE.sub1}”\n\n“${BNSS479_QUOTE.firstProviso}”\n\n“${BNSS479_QUOTE.sub3}”`,
    statutoryNote:
      "धारा 479 का अंग्रेज़ी पाठ (अनुवाद नहीं)। दाखिल करने से पहले भारत सरकार के राजपत्र / इंडिया कोड की प्रति से मिलाएँ।",
    verification: `मैं, ${name}, सत्यापित करता/करती हूँ कि पैराग्राफ 1 से 5 में लिखे तथ्य मेरी जानकारी के अनुसार सत्य हैं और यह आवेदन जिला विधिक सेवा प्राधिकरण के माध्यम से दिया जा रहा है।`,
    signature: [
      "स्थान: ____________",
      "दिनांक: ____________",
      "____________________________",
      `आवेदक (${name}) के हस्ताक्षर / बाएँ अंगूठे का निशान`,
      "माध्यम: विधिक सहायता अधिवक्ता, जिला विधिक सेवा प्राधिकरण",
      `अग्रेषित: अधीक्षक, ${jail}`,
    ],
    disclaimer: HI_DISCLAIMER,
    caution: cautionFor(f),
  };

  const hindiSummary = buildHindiSummary(f, name, jail, district);

  return { english, hindi, hindiSummary };
}

export function buildHindiSummary(
  f: ApplicationFacts,
  name: string,
  jail: string,
  district: string
): string {
  const date = formatDateHi(f.eligibilityDate);
  const lines = [
    `${name} ${f.daysDetainedEffective} दिन से ${jail} में बंद हैं।`,
    f.daysOverLimit > 0
      ? `धारा 479 के तहत ${f.fractionLabel === "one-third" ? "एक-तिहाई" : "आधी"} अवधि ${date} को पूरी हो चुकी है। वे ${f.daysOverLimit} दिन अधिक हिरासत में हैं।`
      : `धारा 479 के तहत ${f.fractionLabel === "one-third" ? "एक-तिहाई" : "आधी"} अवधि ${date} को पूरी होगी। अभी अवधि पूरी नहीं हुई है।`,
    `मुफ़्त कानूनी सहायता के लिए जिला विधिक सेवा प्राधिकरण (DLSA), ${district} से मिलें या 15100 पर कॉल करें।`,
    "यह कानूनी जानकारी है, कानूनी सलाह नहीं। DLSA या वकील से जाँच करवाएँ।",
  ];
  return lines.join("\n");
}

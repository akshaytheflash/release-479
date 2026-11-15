// English source strings. Every other locale is a Partial of this map, so a
// missing translation falls back to English rather than showing a key.
// Add new keys here and run: node scripts/check-i18n.mjs

export const en = {
  "language.label": "Language",
  "language.select": "Choose a language",

  // ---------- shared chrome ----------
  "common.english": "English",
  "common.computing": "Computing…",
  "common.drafting": "Drafting…",
  "common.checking": "Checking…",
  "common.lookingUp": "Looking up…",
  "common.readingRegister": "Reading the register…",
  "common.copied": "Copied",
  "common.delete": "Delete",
  "common.sourced": "Sourced",
  "common.nalsaPage": "NALSA state page",
  "common.accessedDate": "Accessed {date}",
  "common.accessedInline": "· accessed {date}",
  "common.chooseState": "Choose a State/UT",
  "common.none": "No computable date",
  "common.error": "error",
  "common.years": "{years} years",
  "common.days": "{days} days",
  "common.dayOne": "1 day",
  "common.dayMany": "{days} days",

  "brand.homeAria": "479 case file — home",
  "brand.title": "Undertrial release file",
  "brand.sub": "BNSS Section 479 · India",

  "nav.main": "Main",
  "nav.caseFile": "Case file",
  "nav.legalAid": "Legal aid",
  "nav.dlsa": "DLSA desk",
  "nav.register": "Register",
  "nav.sources": "Sources",
  "nav.metrics": "Metrics",

  "disclaimer.short": "Legal information, not legal advice.",
  "disclaimer.verify":
    "Verify every date and draft with the District Legal Services Authority or an advocate before filing.",
  "disclaimer.full":
    "Legal information, not legal advice. Verify with the DLSA or an advocate.",

  "footer.about":
    "A case-file tool for the BNSS Section 479 release clock: compute the date, print the application, and route the family to free legal aid.",
  "footer.law": "The law",
  "footer.help": "Get help",
  "footer.helplineLabel": "NALSA legal-aid helpline:",
  "footer.checkAid": "Check Section 12 eligibility",
  "footer.findDlsa": "Find a sourced DLSA office",
  "footer.fine":
    "Scale: NCRB, Prison Statistics India 2024 — 5,11,542 prisoners at end-2024, 3,71,440 undertrials (72.6%). DLSA contacts transcribed from NALSA State Legal Services Authority pages on 6 November 2026. State undertrial rows from data.gov.in, as on 31 December 2022. Every figure on the site carries its own source and date.",

  "meta.title": "479 — BNSS Section 479 release file",
  "meta.description":
    "Compute a BNSS Section 479 release date, prepare a printable A4 application, check Section 12 legal-aid eligibility, and find a sourced DLSA office. Legal information, not legal advice.",

  "doc.englishOnly": "Official documents are issued in English.",

  // ---------- eligibility status ----------
  "status.ELIGIBLE_NOW.stamp": "Eligible now",
  "status.ELIGIBLE_NOW.plain": "Over the statutory limit",
  "status.ELIGIBLE_NOW.detail":
    "The 1/3 or 1/2 period is complete. Release is due on bond or bail.",
  "status.CEILING_BREACHED.stamp": "Ceiling breached",
  "status.CEILING_BREACHED.plain": "Beyond the maximum sentence",
  "status.CEILING_BREACHED.detail":
    "Detention has passed the maximum sentence for the governing offence. Escalate today.",
  "status.NOT_YET.stamp": "Not yet",
  "status.NOT_YET.plain": "The clock is still running",
  "status.NOT_YET.detail":
    "The statutory date has not arrived. Use this file to prepare in advance.",
  "status.BLOCKED_PENDING_OTHER_CASES.stamp": "Blocked by s.479(2)",
  "status.BLOCKED_PENDING_OTHER_CASES.plain": "Other cases are pending",
  "status.BLOCKED_PENDING_OTHER_CASES.detail":
    "Section 479(2) says a person shall not be released on bail while multiple cases are pending. The DLSA can still review each case.",
  "status.EXCLUDED_DEATH_LIFE.stamp": "Outside s.479",
  "status.EXCLUDED_DEATH_LIFE.plain": "Death or life specified",
  "status.EXCLUDED_DEATH_LIFE.detail":
    "At least one charge specifies death or life imprisonment, so s.479 does not apply. Take the file to the DLSA.",
  "status.UNKNOWN_SECTION.stamp": "Check the charge",
  "status.UNKNOWN_SECTION.plain": "Unsupported charge",
  "status.UNKNOWN_SECTION.detail":
    "The charge list is empty or outside the verified BNS table.",

  // ---------- home: cover ----------
  "home.cover.h1": "Section 479.",
  "home.cover.sub": "Work out the release date, then file for it.",
  "home.cover.lede":
    "Of the {figures} — 72.6%, not yet tried. Section 479 of the BNSS releases one of them after a third of the maximum sentence for a first-time offender, or a half otherwise. Enter the custody date. This file computes the date, shows how much of the sentence has already been served, and prepares the application for the Superintendent and the court.",
  "home.cover.figures":
    "5,11,542 people locked up in India at the end of 2024, 3,71,440 were undertrials",

  // ---------- home: folio marks ----------
  "home.folio1": "Folio 1",
  "home.folio2": "Folio 2",
  "home.folio3": "Folio 3",
  "home.folio4": "Folio 4",

  // ---------- home: custody ----------
  "home.custody.title": "Custody record",
  "home.custody.help":
    "Use the date on the custody memo or jail admission register. The arithmetic uses 365 days per year.",
  "home.custody.start": "Detention start date",
  "home.custody.delay": "Delay caused by the accused (days)",
  "home.custody.delayHelp":
    "Excluded from detention under the Explanation to s.479. Leave at 0 if no delay was recorded against the accused.",
  "home.custody.firstTimeLabel": "First-time offender.",
  "home.custody.firstTimeDetail":
    "Never convicted of any offence in the past. The fraction is one-third, on bond. Unchecked: one-half, on bail.",
  "home.custody.pendingLabel": "Other cases are pending.",
  "home.custody.pendingDetail":
    "Section 479(2) says the person shall not be released on bail while multiple cases are pending. This blocks the release route.",

  // ---------- home: charges ----------
  "home.charges.title": "Schedule of charges",
  "home.charges.help":
    "Verified BNS entries only. If the charge sheet uses a section outside this table, stop and take it to the DLSA. {link}.",
  "home.charges.link": "See the statute table",
  "home.charges.max": "max {label}",
  "home.charges.compute": "Compute the date",
  "home.charges.selectedOne": "1 charge selected",
  "home.charges.selectedMany": "{count} charges selected",
  "home.charges.none": "No charge selected",
  "error.selectSection": "Select at least one charged section.",
  "error.computeFailed": "Computation failed.",
  "error.network":
    "Could not reach the computation route. Check the connection and try again.",

  // ---------- home: result ----------
  "home.result.title": "Computation",
  "home.result.clause": "Section 479, {plain}.",
  "home.result.releaseDate": "Release date",
  "home.result.threshold": "Threshold",
  "home.result.thresholdValue": "{days} of {years} years’ maximum",
  "home.result.custodyCounted": "Custody counted",
  "home.result.overBy": "Over the limit by",
  "home.result.stillToServe": "Still to serve",
  "home.result.basis": "{summary} {detail} {fraction} {delay}",
  "home.result.fractionFirst":
    "First-time offender: one-third of the maximum, released on bond.",
  "home.result.fractionOther":
    "Not a first-time offender: one-half of the maximum, released on bail.",
  "home.result.delayExcluded":
    "{days} days of accused-caused delay are excluded.",
  "home.result.delayNone": "No accused-caused delay was deducted.",
  "home.result.notes": "Statute and caveats ({count})",
  "home.result.prepareLink": "Prepare the application",
  "home.result.checkAid": "Check free legal aid",
  "home.result.colCharge": "Charge",
  "home.result.colMaximum": "Maximum",
  "home.result.colThreshold": "Threshold",
  "home.result.colDate": "Date",
  "home.result.thresholdShort": "{days} d",
  "home.result.footnote":
    "With more than one charge, the latest date governs: every count must be satisfied. Dates are calendar dates; verify calendar-year arithmetic with the DLSA.",

  // ---------- home: computation notes ----------
  "home.notes.selectSection": "Select at least one charged section.",
  "home.notes.unknown":
    "Unknown / unsupported section id(s): {ids}. This MVP supports {count} verified BNS entries only. Verify the chargesheet section with DLSA/advocate.",
  "home.notes.arithmetic":
    "Arithmetic uses 365 days per year. Courts may compute by calendar years — verify the date with DLSA/jail superintendent.",
  "home.notes.superintendent":
    "BNSS 479(3): the jail Superintendent must apply to the Court on completion of the 1/3 or 1/2 period. This tool pre-computes so families/DLSA can follow up — it does not replace that duty.",
  "home.notes.proviso":
    "3rd proviso: the Court may, after hearing the Public Prosecutor and for recorded reasons, order continued detention beyond one-half or convert bond/bail. Eligibility ≠ guaranteed release.",
  "home.notes.eligibleNow":
    "Detention has reached {fraction} of the maximum period. First-time offenders are released on bond at 1/3; others on bail at 1/2 (verify bond vs bail with the Court).",
  "home.notes.excluded":
    "BNSS 479(1) applies only where the offence does NOT specify death or life imprisonment as one of the punishments. At least one selected charge falls outside Section 479 — seek DLSA/advocate advice; do not rely on this tool for release.",
  "home.notes.blocked":
    "BNSS 479(2): where investigation/inquiry/trial in more than one offence or multiple cases are pending, the person shall not be released on bail. This input blocks Section 479 release. DLSA may still review each case separately.",
  "home.notes.ceiling":
    "4th proviso breached: detention already exceeds the maximum period ({years} years) for the governing offence. Escalate immediately to the Court / DLSA / jail Superintendent.",
  "home.notes.fractionThird": "one-third",
  "home.notes.fractionHalf": "one-half",

  // ---------- home: application form ----------
  "home.application.title": "Release application",
  "home.application.intro":
    "The document is addressed to the Superintendent of the jail and to the court. It quotes s.479(1), the first proviso and s.479(3), and carries a signature and forwarding block. Print it on A4, sign it, and take it to the DLSA or the jail welfare officer.",
  "field.prisonerName": "Prisoner name",
  "field.prisonerNamePlaceholder": "Full name as in the case record",
  "field.caseNumber": "Case number",
  "field.caseNumberPlaceholder": "e.g. SC 123/2024",
  "field.court": "Court",
  "field.courtPlaceholder": "e.g. Court of JMFC, Ernakulam",
  "field.jail": "Jail",
  "field.jailPlaceholder": "e.g. District Jail, Ernakulam",
  "field.district": "District",
  "field.districtPlaceholder": "District where the case is filed",
  "field.state": "State / UT",
  "home.application.prepare": "Prepare A4 application",
  "home.application.copyHindi": "Copy Hindi summary",
  "home.application.copiedHindi": "Hindi summary copied",
  "home.application.print": "Print A4",
  "home.application.checkTitle": "Check before filing.",
  "home.application.checkBody":
    "The application is a draft. A DLSA advocate or the jail Superintendent must verify the charge, the custody date and the addressee. The printout contains the English and Hindi versions on separate A4 pages.",
  "home.application.preview": "Preview:",
  "home.application.hindiSummary":
    "Hindi summary for the family (one tap to copy)",
  "home.application.copySummary": "Copy this summary",
  "home.application.draftSummary":
    "Optional: generate a model-written draft (English + Hindi)",
  "home.application.draftIntro":
    "The printable application above is deterministic and does not need a model. This secondary draft calls the BharatCode model when it is reachable and falls back to a fixed template. Use it for a second pair of eyes, not as the filed document.",
  "home.application.generate": "Generate draft text",
  "home.application.draftMeta":
    "Draft source: {source} (model {model}, attempts {attempts}). {note}",
  "error.prepareFirst":
    "Prepare the application first; there is nothing to print yet.",
  "error.clipboardHindi":
    "The browser blocked clipboard access. Select the Hindi summary text and copy it manually.",
  "error.nameAndCase":
    "Enter the prisoner's name and the case number before preparing the application.",
  "error.nameAndCaseDraft": "Enter prisoner name and case no. to draft.",
  "error.draftFailed": "Draft failed.",
  "error.draftNetwork": "Could not reach the drafting route.",

  // ---------- home: help ----------
  "home.help.title": "If you need a lawyer",
  "home.help.intro":
    "Free legal aid is a statutory right for the categories in Section 12 of the Legal Services Authorities Act, 1987. A person in custody is one of them. The State pays the legal-aid counsel; the family does not.",
  "home.help.checkAid": "Check Section 12 eligibility",
  "home.help.findDlsa": "Find the DLSA office",
  "home.help.callNalsa": "Call NALSA 15100",
  "home.help.footnote":
    "Legal information, not legal advice. The DLSA decides eligibility and assigns counsel. Every citation on this page links to a source on {link}.",
  "home.help.sources": "Sources",

  // ---------- home: rail ----------
  "home.rail.computationLabel": "Computation sheet",
  "home.rail.computation": "Computation sheet",
  "home.rail.governingMax": "Governing maximum",
  "home.rail.fraction": "Fraction",
  "home.rail.threshold": "Threshold",
  "home.rail.delayExcluded": "Accused delay excluded",
  "home.rail.effective": "Effective detention",
  "home.rail.eligibilityDate": "Eligibility date",
  "home.rail.overLimit": "Days over limit",
  "home.rail.status": "Status",
  "home.rail.bond": "1/3 · bond",
  "home.rail.bail": "1/2 · bail",
  "home.rail.note":
    "BNSS s.479(1), first proviso and s.479(3). 365-day arithmetic; confirm calendar-year computation with the DLSA.",
  "home.rail.empty":
    "Select the charges and custody date, then compute. This sheet fills with the governing maximum, threshold and release date.",

  "home.rail.stateTitle": "State record",
  "home.rail.stateEmpty":
    "Choose a State/UT in the application form to see the published undertrial row from data.gov.in.",
  "home.rail.stateLoading": "Reading data.gov.in…",
  "home.rail.undertrials": "Undertrials, {period}",
  "home.rail.capacity": "All-jail capacity",
  "home.rail.occupancy": "Undertrial occupancy",
  "home.rail.share": "Share of 2024 national total",
  "home.rail.stateNote":
    "State row: {period}. National: 3,71,440 undertrials at end-2024 (NCRB PSI 2024). The share is an estimate from those two published figures. {link}.",
  "home.rail.stateLink": "data.gov.in record",
  "home.state.unconfigured":
    "The data.gov.in API key is not configured on this deployment. The source record is linked below; the live row is not shown.",
  "home.state.rateLimited":
    "data.gov.in rate-limited this request. The sourced dataset is linked below; try again later. No number is estimated or invented.",
  "home.state.notPublished":
    "This State/UT does not appear in the sourced data.gov.in resource. Not published.",
  "home.state.error":
    "The data.gov.in row is unavailable right now. The sourced dataset is linked below; no number is estimated.",

  "home.rail.dlsaTitle": "District legal aid",
  "home.rail.dlsaEmpty":
    "Add the district and State/UT to see a sourced DLSA office. If the district is not in the file, the tool says so rather than inventing a number.",
  "home.rail.dlsaLoading": "Looking up the DLSA…",
  "home.rail.openDlsa": "Open the full DLSA desk",
  "home.rail.dlsaFallback":
    "Contact details not yet sourced for this district. Call NALSA 15100; do not rely on an unverified number.",

  "home.rail.aidTitle": "Free legal aid",
  "home.rail.aidNote":
    "A person in custody is covered by Section 12(g) of the Legal Services Authorities Act, 1987. The DLSA assigns a lawyer at the State's cost.",
  "home.rail.aidLink": "Check the Section 12 route",

  // ---------- detention timeline ----------
  "timeline.custodyBegins": "Custody begins",
  "timeline.custodyBeginsDetail": "First day counted as detention.",
  "timeline.today": "Today",
  "timeline.todayDetail": "{days} effective days in custody.",
  "timeline.releaseDate": "Statutory release date",
  "timeline.releaseDateReached": "Statutory release date reached",
  "timeline.releaseDetailNotYet":
    "The 1/3 or 1/2 period completes on this date.",
  "timeline.releaseDetailDone":
    "The 1/3 or 1/2 period was completed on this date.",
  "timeline.scaleStart": "0 days",
  "timeline.scaleThreshold": "1/3 or 1/2: {days} days",
  "timeline.scaleMax": "max: {days} days",
  "timeline.explain":
    "The bar is scaled to the maximum sentence. The threshold sits at {pct}% of that maximum.",

  // ---------- floating clock ----------
  "clock.label": "Custody clock",
  "clock.days": "Days in custody",
  "clock.ofRequired": "{served} of {required} required",
  "clock.overOne": "Over the limit by 1 day",
  "clock.overMany": "Over the limit by {days} days",
  "clock.remainingOne": "1 day still to serve",
  "clock.remainingMany": "{days} days still to serve",
  "clock.due": "· due {date}",

  // ---------- dashboard ----------
  "dashboard.kicker": "District Legal Services Authority",
  "dashboard.title": "DLSA register",
  "dashboard.lede":
    "Every screened undertrial against the court-computed 1/3 or 1/2 date. The register starts empty. Rows enter only through a jail or DLSA CSV import, or through the clearly badged demo sample. Demo rows never count in metrics.",
  "dashboard.realRows": "{count} real rows",
  "dashboard.demoRows": "{count} demo rows",
  "dashboard.overLimit": "{count} over the limit",
  "dashboard.blocked": "{count} blocked by s.479(2)",
  "dashboard.importMark": "Import",
  "dashboard.importTitle": "Jail or DLSA CSV",
  "dashboard.importShow": "Show the import box and column format",
  "dashboard.importHelp":
    "Required header: {header}. {sectionIds} is semicolon-separated supported ids (e.g. {example}). {start} is YYYY-MM-DD; flags are 1/0. Quoted fields may contain commas.",
  "dashboard.csvRows": "CSV rows",
  "dashboard.importCsv": "Import CSV",
  "dashboard.insertSample": "Insert demo sample rows",
  "dashboard.clearDemo": "Clear demo rows",
  "dashboard.supportedIds": "Supported section ids: {ids}.",
  "dashboard.importSummary": "Imported {imported} of {total} rows.",
  "dashboard.importLine": "Line {line}: {result}: {message}",
  "dashboard.importOk": "ok",
  "dashboard.importFailed": "failed",
  "dashboard.importError": "Error: {error}",
  "dashboard.importMissing":
    "Missing prisoner_name / case_no / detention_start / section_ids.",
  "dashboard.importBadDate": "detention_start must be YYYY-MM-DD.",
  "dashboard.importUnsupported":
    "Unsupported section id(s): {ids}. See /sources for supported ids.",
  "dashboard.importedRow": "Imported: {name} ({caseNo}).",
  "dashboard.sampleImported": "Sample import: {imported} rows. {warning}",
  "dashboard.demoWarning":
    "DEMO sample rows (is_sample=1). They are illustrative only — not real prisoners, excluded from deployment metrics.",
  "dashboard.sampleCleared": "Cleared {deleted} demo sample rows.",
  "dashboard.registerMark": "Register",
  "dashboard.overTitle": "Over-detained ({count})",
  "dashboard.emptyTitle": "No prisoners screened yet",
  "dashboard.emptyBody":
    "Import the jail or DLSA undertrial list as CSV, or insert the clearly labelled demo rows to preview the over-detained register. The empty state is deliberate: this tool does not ship with prisoner records.",
  "dashboard.noOver":
    "No row is over the statutory limit today. The full register is below.",
  "dashboard.colPrisoner": "Prisoner",
  "dashboard.colCase": "Case",
  "dashboard.colReleaseDate": "Release date",
  "dashboard.colDaysIn": "Days in",
  "dashboard.colDaysOver": "Days over",
  "dashboard.colStatus": "Status",
  "dashboard.colAction": "Action",
  "dashboard.demoBadge": "demo",
  "dashboard.statusFor": "Status for {name}",
  "dashboard.statusScreened": "Screened",
  "dashboard.statusFiled": "Application filed",
  "dashboard.statusReleased": "Released",
  "dashboard.allMark": "All rows",
  "dashboard.allTitle": "Every screened undertrial ({count})",
  "dashboard.colCharges": "Charges",
  "dashboard.colStart": "Start",
  "dashboard.colFraction": "Fraction",
  "dashboard.colComputation": "Computation",
  "dashboard.fractionBond": "1/3 on bond",
  "dashboard.fractionBail": "1/2 on bail",
  "dashboard.computationWithDate": "{status}, {date}",
  "dashboard.railLabel": "Register notes",
  "dashboard.filingLoop": "Filing loop",
  "dashboard.stepScreen": "Screen",
  "dashboard.stepScreenDetail":
    "Import the jail register, then check the charge and custody date against the case record.",
  "dashboard.stepDraft": "Draft",
  "dashboard.stepDraftDetail":
    "Open a row in the case file, prepare the A4 application, and have the DLSA panel advocate review it.",
  "dashboard.stepFile": "File",
  "dashboard.stepFileDetail":
    "File with the court and the Superintendent under s.479(3). Mark APPLICATION_FILED only after it is actually filed.",
  "dashboard.stepVerify": "Verify",
  "dashboard.stepVerifyDetail":
    "Mark RELEASED only on a verified court order or jail release memo.",
  "dashboard.countingRule": "Counting rule",
  "dashboard.countingNote":
    "Metrics count real rows only. Demo rows are badged and excluded. One row is one screened undertrial. Never add demo rows to the four submission numbers.",
  "dashboard.openMetrics": "Open the metrics register",

  // ---------- DLSA directory ----------
  "dlsa.kicker": "District Legal Services Authority directory",
  "dlsa.title": "Find the office that can file for free.",
  "dlsa.lede":
    "A DLSA is the district-level legal aid office. This directory is transcribed from NALSA's State Legal Services Authority pages, with the source and access date on every row. It is not a live scrape. If a district is not in the file, the answer is “contact details not yet sourced” — never a made-up phone number.",
  "dlsa.lookupMark": "Lookup",
  "dlsa.lookupTitle": "State and district",
  "dlsa.districtPlaceholderState": "Start typing a district",
  "dlsa.districtPlaceholderNoState": "Choose a State first",
  "dlsa.stateOption": "{state} ({count})",
  "dlsa.find": "Find the DLSA office",
  "dlsa.callNalsa": "Call NALSA 15100",
  "dlsa.sourcedOffices": "{count} sourced offices",
  "dlsa.statesCount": "{count} States/UTs",
  "dlsa.accessed": "Accessed {date}",
  "dlsa.chooseDistrict":
    "Choose a district to see the office. The register below lists every sourced office in {state}.",
  "dlsa.notSourcedTitle": "Contact details not yet sourced.",
  "dlsa.sourcedDistricts":
    "The sourced districts in {state} are: {districts}.",
  "dlsa.notCoveredTitle": "This State/UT is not in the sourced file.",
  "dlsa.notCoveredBody":
    "Call the NALSA helpline {helpline} or use the NALSA office locator; do not rely on an unverified number.",
  "dlsa.registerMark": "Register",
  "dlsa.registerTitle": "Sourced offices in {state}",
  "dlsa.colDistrict": "District",
  "dlsa.colOffice": "Office and address",
  "dlsa.colPhone": "Phone",
  "dlsa.colSource": "Source",
  "dlsa.asideLabel": "Coverage and caveats",
  "dlsa.inFile": "What is in the file",
  "dlsa.summary":
    "{offices} offices across {states} States/UTs, transcribed on {date}.",
  "dlsa.loadingSummary": "Loading the directory summary…",
  "dlsa.caveat":
    "Vendored from NALSA state pages on 6 November 2026. West Bengal and Maharashtra list only the first directory page; other districts are marked not yet sourced. Verify the office and phone number before travelling.",
  "dlsa.coverage": "Coverage by State",
  "dlsa.colState": "State / UT",
  "dlsa.colOffices": "Offices",
  "dlsa.missingTitle": "If your district is missing",
  "dlsa.missingNote":
    "Call the NALSA helpline {helpline}. The State Legal Services Authority can give the current DLSA address. This tool will not guess a phone number or an office address.",
  "dlsa.locator": "NALSA office locator",

  // ---------- legal aid ----------
  "aid.kicker": "Legal Services Authorities Act, 1987",
  "aid.title": "Free legal aid is a statutory right.",
  "aid.lede":
    "Section 12 lists who is entitled to free legal services. A person in custody is on that list. This checker names the clause that applies, the income ceiling published by NALSA, and the exact office or helpline to use.",
  "aid.screeningMark": "Screening",
  "aid.screeningTitle": "Which Section 12 category applies?",
  "aid.cat.sc_st.label": "Scheduled Caste or Scheduled Tribe",
  "aid.cat.sc_st.detail":
    "A member of a Scheduled Caste or Scheduled Tribe.",
  "aid.cat.trafficking.label": "Victim of trafficking or begar",
  "aid.cat.trafficking.detail":
    "A victim of trafficking in human beings or begar as referred to in Article 23 of the Constitution.",
  "aid.cat.woman.label": "Woman",
  "aid.cat.woman.detail":
    "A woman, irrespective of income or financial status.",
  "aid.cat.child.label": "Child",
  "aid.cat.child.detail": "A child, until the age of majority (18 years).",
  "aid.cat.disability.label": "Disabled person",
  "aid.cat.disability.detail": "A mentally ill or otherwise disabled person.",
  "aid.cat.disaster.label": "Victim of disaster or violence",
  "aid.cat.disaster.detail":
    "A person under circumstances of undeserved want, such as a victim of a mass disaster, ethnic violence, caste atrocity, flood, drought, earthquake or industrial disaster.",
  "aid.cat.industrial_workman.label": "Industrial workman",
  "aid.cat.industrial_workman.detail": "An industrial workman.",
  "aid.cat.in_custody.label": "In custody",
  "aid.cat.in_custody.detail":
    "A person in custody, including custody in a protective home, juvenile home, or psychiatric hospital or nursing home.",
  "aid.cat.low_income.label": "Annual income below the limit",
  "aid.cat.low_income.detail":
    "Annual income below the State's notified ceiling (or below ₹5,00,000 for a Supreme Court case).",
  "aid.state": "State / UT",
  "aid.stateHelp":
    "The State ceiling applies to cases outside the Supreme Court.",
  "aid.district": "District (for the DLSA route)",
  "aid.districtPlaceholder": "e.g. Ernakulam",
  "aid.districtHelp":
    "Optional. If the district is not in the sourced directory, the route says so.",
  "aid.income": "Annual income (₹)",
  "aid.incomePlaceholder": "e.g. 180000",
  "aid.incomeHelp":
    "Only used for s.12(h). Tick the income category to enable it.",
  "aid.court": "Where is the case?",
  "aid.courtHelp":
    "Supreme Court cases use the ₹5,00,000 ceiling in NALSA's FAQ.",
  "aid.courtDistrict": "District court",
  "aid.courtHigh": "High Court",
  "aid.courtSupreme": "Supreme Court",
  "aid.check": "Check eligibility",
  "aid.selectedOne": "1 category selected",
  "aid.selectedMany": "{count} categories selected",
  "aid.selectedNone": "No category selected",
  "error.tickCategory": "Tick at least one Section 12 category.",
  "error.aidRoute": "Could not check eligibility.",
  "error.aidNetwork":
    "Could not reach the legal-aid route. Check the connection and try again.",
  "aid.resultMark": "Screening result",
  "aid.resultClause":
    "Section 12, Legal Services Authorities Act, 1987 · {clauses}",
  "aid.noClause": "no clause matched",
  "aid.clausesTitle": "The clauses that apply",
  "aid.incomeOnlyTitle": "Income is the only route selected.",
  "aid.incomeOnlyBody":
    "Enter the annual income and choose a State/UT. The State's notified ceiling is published in the table beside this form.",
  "aid.ceilingUsed": "Income ceiling used:",
  "aid.ceilingSupreme":
    "Supreme Court cases: ₹5,00,000 per year, as stated in NALSA's legal-aid FAQ.",
  "aid.ceilingState":
    "{state}: ₹{limit} per year, as published in NALSA's State-wise income-ceiling table.",
  "aid.ceilingNoRow":
    "No State income ceiling is in the sourced NALSA table for this State/UT. The DLSA will apply the notified limit.",
  "aid.ceilingChoose":
    "Choose a State/UT to see the income ceiling published by NALSA. Supreme Court cases use ₹5,00,000.",
  "aid.yourFigure": "Your figure: ₹{amount}.",
  "aid.reasonLowIncome":
    "Annual income ₹{income} is below the ₹{limit} ceiling.",
  "aid.dlsaOffice": "DLSA office:",
  "aid.dlsaFallback":
    "Add a district to look up a sourced office. The national helpline is 15100.",
  "aid.howTitle": "How to apply",
  "aid.route1.step": "Apply at the District Legal Services Authority",
  "aid.route1.detail":
    "Go to the DLSA office in the district where the case is filed, or the legal-aid clinic in the jail. A written application on plain paper is enough; NALSA also accepts an online application.",
  "aid.route2.step": "Use the online route if travel is difficult",
  "aid.route2.detail":
    "NALSA online application: {url}. The national free legal-aid helpline is {helpline} (toll-free).",
  "aid.route3.step": "Take the papers you already have",
  "aid.route3.detail":
    "Caste or tribe certificate (for s.12(a)), income affidavit (for s.12(h)), custody or case number, and any disability, trafficking or disaster record. The Authority may accept an affidavit of income under s.13(2).",
  "aid.route4.step": "Ask the DLSA to assign a legal-aid counsel",
  "aid.route4.detail":
    "If the person is in custody, tell the jail Superintendent and the DLSA secretary. Under s.479(3) BNSS the Superintendent must move the court when the 1/3 or 1/2 period is complete.",
  "aid.caveatsTitle": "Caveats",
  "aid.caveat1":
    "Section 13(1) of the Legal Services Authorities Act, 1987 also requires the Authority to be satisfied that the person has a genuine case to prosecute or defend.",
  "aid.caveat2":
    "This is a screening result based only on the boxes you ticked. The DLSA decides eligibility and may ask for proof.",
  "aid.caveat3":
    "Legal information, not legal advice. Verify with the DLSA or an advocate.",
  "aid.openApplication": "Open the NALSA application",
  "aid.call": "Call 15100",
  "aid.findDlsa": "Find the DLSA office",
  "aid.asideLabel": "Section 12 reference",
  "aid.coversTitle": "What Section 12 covers",
  "aid.coversNote":
    "The list is not a favour. Section 12(a) to (h) of the Legal Services Authorities Act, 1987 names the categories. Section 13(1) still requires a genuine case.",
  "aid.sourceLine": "Sourced · {link} · accessed {date}",
  "aid.nalsaAidPage": "NALSA's legal-aid page",
  "aid.ceilingTitle": "State income ceiling, s.12(h)",
  "aid.colState": "State / UT",
  "aid.perYear": "Per year",
  "aid.tableNote":
    "Reproduced from NALSA's published table on {date}. State Governments may revise the limit; confirm with the DLSA.",
  "aid.hardTitle": "If the form is hard to use",
  "aid.hardNote":
    "Call the national free legal-aid helpline {helpline}. A written application on plain paper is enough. The jail Superintendent and the DLSA secretary can also start the application for a person in custody.",
  "aid.status.eligible.stamp": "You qualify",
  "aid.status.eligible.plain": "A Section 12 category applies",
  "aid.status.eligible.detail":
    "On the facts you entered, you fall within a Section 12 category. The DLSA still decides eligibility and assigns counsel.",
  "aid.status.need_info.stamp": "Need income",
  "aid.status.need_info.plain": "Income is the only route selected",
  "aid.status.need_info.detail":
    "Enter the annual income and choose the State/UT, or tick another Section 12 category. The State ceiling decides.",
  "aid.status.not_eligible.stamp": "Not on these facts",
  "aid.status.not_eligible.plain": "No Section 12 category selected",
  "aid.status.not_eligible.detail":
    "On the facts entered, none of the Section 12 categories apply. That is not the end of the road: a DLSA officer can review the case.",

  // ---------- metrics ----------
  "metrics.kicker": "Deployment record",
  "metrics.title": "Metrics, with the demo rows removed.",
  "metrics.lede":
    "Four numbers, counted from real DLSA imports only. A demo row is a preview, not a prisoner. The register keeps the two apart so the submission numbers cannot be inflated.",
  "metrics.registerMark": "Register",
  "metrics.submissionTitle": "Submission numbers",
  "metrics.colNumber": "Number",
  "metrics.colCounts": "What it counts",
  "metrics.colValue": "Value",
  "metrics.rowScreened": "Screened (N)",
  "metrics.rowScreenedDetail":
    "Every real DLSA or jail CSV row imported. One row is one screened undertrial.",
  "metrics.rowOver": "Over-detained found",
  "metrics.rowOverDetail":
    "Real rows whose computation is ELIGIBLE_NOW or CEILING_BREACHED at today's date.",
  "metrics.rowFiled": "Applications filed",
  "metrics.rowFiledDetail":
    "Rows moved to APPLICATION_FILED after the draft was actually filed with the court or the Superintendent.",
  "metrics.rowReleased": "Releases secured",
  "metrics.rowReleasedDetail":
    "Rows moved to RELEASED only after a court order or jail release memo was verified.",
  "metrics.rowDemo": "Demo sample rows",
  "metrics.rowDemoDetail":
    "Badged preview rows. Excluded from every number above.",
  "metrics.notice":
    "{asOf} The register is empty until a real jail or DLSA list is imported. A zero is an honest zero, not a missing number.",
  "metrics.asOf": "As of {date}.",
  "metrics.copyTitle": "Copy-ready block",
  "metrics.copy": "Copy the block",
  "metrics.openRegister": "Open the register",
  "metrics.methodMark": "Method",
  "metrics.methodTitle": "How a row moves",
  "metrics.stepImport": "Import",
  "metrics.stepImportDetail":
    "A real CSV row enters the register with is_sample=0. It is counted as screened.",
  "metrics.stepScreen": "Screen",
  "metrics.stepScreenDetail":
    "The engine computes the 1/3 or 1/2 date. If the date has passed, the row enters over-detained found.",
  "metrics.stepFile": "File",
  "metrics.stepFileDetail":
    "After the DLSA advocate reviews and the application is filed, the status moves to APPLICATION_FILED.",
  "metrics.stepRelease": "Release",
  "metrics.stepReleaseDetail":
    "Only a verified order or release memo moves the row to RELEASED.",
  "metrics.railLabel": "Counting rules",
  "metrics.ruleTitle": "The rule",
  "metrics.ruleNote":
    "Demo rows never count. The API filters them out before computing every number on this page. If a figure here is zero, no real row has been imported yet.",
  "metrics.notClaimTitle": "What this does not claim",
  "metrics.notClaimNote":
    "It does not claim releases that were not verified, cases that were not filed, or prisoners who were not in a real import. It does not estimate a district's total from a sample.",
  "metrics.sourceTitle": "Source",
  "metrics.sourceNote":
    "Counts come from the SQLite register at {endpoint}. The same four numbers are on the submission template. See {link} for the statute and scale citations.",

  // ---------- sources ----------
  "sources.kicker": "Citations and live-data status",
  "sources.title": "Every number has a source and a date.",
  "sources.lede":
    "Statutes, sentence values, prison figures, DLSA contacts and income ceilings are listed here with the authority and the date they were checked. Where a source is unavailable or a district is missing, the page says so. Nothing is filled in to make the file look complete.",
  "sources.s1.title": "BNSS Section 479, verbatim",
  "sources.authority": "Authority: {authority}.",
  "sources.authorityBnss":
    "Bharatiya Nagarik Suraksha Sanhita, 2023, India Code",
  "sources.authorityNote":
    "The text below was verified against the Indian Kanoon mirror (indiankanoon.org/doc/87702491) on 6 November 2026. India Code blocks automated fetch; reconcile with the Gazette or the India Code PDF before filing.",
  "sources.quoteNote":
    "The printable application quotes s.479(1), the first proviso and s.479(3) exactly. The quote block used in the document begins: {quote}",
  "sources.bullet479a":
    "release on bail at one-half of the maximum period; one-third on bond for a first-time offender.",
  "sources.labelExclusion": "Exclusion:",
  "sources.bulletExclusion":
    "offences specifying death or life imprisonment are outside s.479.",
  "sources.labelExplanation": "Explanation:",
  "sources.bulletExplanation":
    "delay caused by the accused is excluded from the detention computation.",
  "sources.bullet479b":
    "multiple cases or offences pending means the person shall not be released on bail.",
  "sources.labelThird": "Third proviso:",
  "sources.bulletThird":
    "the court may order continued detention beyond one-half after hearing the Public Prosecutor, for recorded reasons.",
  "sources.labelFourth": "Fourth proviso:",
  "sources.bulletFourth":
    "never detained beyond the maximum period for the offence.",
  "sources.bullet479c":
    "the jail Superintendent must apply to the court forthwith when the period is complete.",
  "sources.s2.title": "BNS maximum sentences in the engine",
  "sources.bnsAuthority": "Authority: {authority}.",
  "sources.bnsAuthorityLink": "Bharatiya Nyaya Sanhita, 2023, India Code",
  "sources.bnsAuthorityNote":
    "Punishment clauses were checked against the BNS text mirrors on devgan.in on 6 November 2026. Only these eleven entries are computable. An IPC-era charge must go through the DLSA.",
  "sources.colSection": "Section",
  "sources.colOffence": "Offence",
  "sources.colMaximum": "Maximum",
  "sources.colSource": "Source",
  "sources.indiaCode": "India Code",
  "sources.s3.title": "National scale, NCRB 2024",
  "sources.ncrb":
    "{total} prisoners at end-2024, of which {undertrials} undertrials ({share}%). Roughly three in four prisoners were awaiting trial. Source: {report}. {link}.",
  "sources.reportPdf": "Report PDF",
  "sources.ncrbCheck":
    "Cross-checked on 6 November 2026 against the World Prison Brief India page (31 December 2024, NCRB) and News Minute DataViz (371,440 undertrials, up from 237,076 in 2005).",
  "sources.s4.title": "State undertrial row, data.gov.in",
  "sources.dataGov":
    "Resource: {resource}. Period: {period}. Publisher: National Crime Records Bureau, Ministry of Home Affairs, published on data.gov.in. {link}.",
  "sources.dataGovLink": "API record",
  "sources.dataGovNote":
    "The state row is fetched live on {endpoint} and cached for six hours. If the API rate-limits or the state is missing, the page says “not published” or “rate-limited”. The national 2024 figure and the state 2022 row are shown side by side, never merged. The “share of national total” is labelled an estimate because it divides two different years.",
  "sources.s5.title": "Free legal aid, Section 12",
  "sources.aidAuthority": "Authority: {act}.",
  "sources.actNalsaLink": "Legal Services Authorities Act, 1987",
  "sources.aidAuthorityNote":
    "The category list and the State-wise income ceiling table are reproduced from {page} on {date}. The Supreme Court ceiling of ₹5,00,000 is from the same NALSA FAQ. State Governments may revise the limits.",
  "sources.nalsaAidPage": "NALSA's legal-aid page",
  "sources.aidNote":
    "The checker applies s.12(a) to (h) and the published ceiling. It does not decide the case: s.13(1) requires the Authority to be satisfied that the person has a genuine case. The national helpline is {helpline}. {link}.",
  "sources.nalsaApplication": "NALSA online application",
  "sources.s6.title": "DLSA directory",
  "sources.dlsaSummary":
    "{offices} offices across {states} States/UTs, transcribed on {date} from the State Legal Services Authority pages hosted on NALSA.",
  "sources.loadingSummary": "Loading the directory summary…",
  "sources.dlsaNote":
    "The vendored CSV is at {path}; every row carries its source URL and access date. {link}.",
  "sources.openDlsa": "Open the DLSA desk",
  "sources.colState": "State / UT",
  "sources.colOffices": "Offices",
  "sources.colSourcePage": "Source page",
  "sources.colAccessed": "Accessed",
  "sources.s7.title": "What is estimated, and what is not",
  "sources.estimatedNot":
    "prisoner records, DLSA phone numbers, addresses, sentences, eligibility dates, legal-aid outcomes, releases.",
  "sources.estimatedLabel": "Labelled estimate:",
  "sources.estimatedText":
    "a State's share of the 2024 national undertrial total, computed from the 2022 State row and the 2024 national figure. The two years are printed beside it.",
  "sources.liveNot": "Not live:",
  "sources.liveText":
    "the DLSA directory is a vendored transcription, not a scrape. West Bengal and Maharashtra list only the first directory page; other districts are marked not yet sourced.",
  "sources.adviceNot": "Not legal advice:",
  "sources.adviceText":
    "every page and every generated document carries the disclaimer. A DLSA advocate or the jail Superintendent must verify the file before it is signed or filed.",
  "sources.notEstimated": "Not estimated:",
  "sources.s8.title": "Live dependency probe",
  "sources.probe":
    "The probe reports what actually responded. NJDG publishes HTML dashboards, not JSON; this app links to {link} and does not invent pendency medians.",
  "sources.probeLink": "the dashboard",
  "sources.showProbe": "Show the raw probe",
  "sources.asideLabel": "Source register",
  "sources.sourceRegister": "Source register",
  "sources.srcBnss": "BNSS, 2023",
  "sources.srcBnssDetail": "Section 479 release clock.",
  "sources.srcBns": "BNS, 2023",
  "sources.srcBnsDetail": "Maximum sentences.",
  "sources.srcNcrb": "NCRB PSI 2024",
  "sources.srcNcrbDetail": "National prison scale.",
  "sources.srcDataGov": "data.gov.in",
  "sources.srcDataGovDetail": "State undertrial row, 2022.",
  "sources.srcNalsa": "NALSA",
  "sources.srcNalsaDetail": "s.12 categories and income table.",
  "sources.srcNalsaDlsa": "NALSA DLSA pages",
  "sources.srcNalsaDlsaDetail": "10 States/UTs, 157 offices.",
  "sources.legalAid": "Legal aid",
  "sources.accessTitle": "Access date",
  "sources.accessNote":
    "Statutes, NCRB, NALSA and DLSA pages checked on 6 November 2026. The data.gov.in row is fetched at request time and cached for six hours. Every date on the site is printed with the figure it belongs to.",

  // ---------- BNS display labels (ids, section numbers and citation notes stay verbatim) ----------
  "bns.bns115.title": "Voluntarily causing hurt",
  "bns.bns329_house.title": "House-trespass",
  "bns.bns351_simple.title": "Criminal intimidation (simple)",
  "bns.bns303.title": "Theft (ordinary)",
  "bns.bns318_simple.title": "Cheating (simple)",
  "bns.bns316.title": "Criminal breach of trust (simple)",
  "bns.bns117.title": "Voluntarily causing grievous hurt",
  "bns.bns351_agg.title": "Criminal intimidation (aggravated)",
  "bns.bns318_delivery.title": "Cheating with delivery of property",
  "bns.bns309.title": "Robbery (ordinary)",
  "bns.bns109.title": "Attempt to murder (no hurt caused)",
  "bns.max.1": "1 year",
  "bns.max.2": "2 years",
  "bns.max.3": "3 years",
  "bns.max.5": "5 years",
  "bns.max.7": "7 years",
  "bns.max.10": "10 years",
  "bns.max.10life": "10 years (up to life if hurt is caused)",
} as const;

export type MessageKey = keyof typeof en;
export type Messages = Record<MessageKey, string>;
export type LocaleMessages = Partial<Messages>;

"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BNS_SECTIONS } from "@/lib/bns";
import { STATE_CONTEXT_STATES } from "@/lib/stateContext";
import { buildApplication, formatDateEn, type ApplicationBundle } from "@/lib/application";
import ApplicationSheet from "@/components/ApplicationSheet";
import DetentionTimeline from "@/components/DetentionTimeline";

interface Eligibility {
  status: string;
  fraction: number;
  releaseMode: "bond" | "bail";
  eligibilityDate: string | null;
  daysDetainedEffective: number;
  daysOverLimit: number;
  daysUntilEligible: number;
  governingMaxYears: number;
  governingThresholdDays: number;
  ceilingDays: number;
  accusedDelayDays: number;
  today: string;
  perSection: Array<{
    label: string;
    maxSentenceYears: number;
    maxSentenceLabel: string;
    thresholdDays: number;
    eligibilityDate: string;
    excluded: boolean;
  }>;
  notes: string[];
}

interface DlsaResult {
  status: string;
  state: string;
  district: string;
  matches: Array<{
    officeName: string;
    address: string;
    phone: string;
    email: string;
    sourceUrl: string;
    accessedOn: string;
    note: string;
  }>;
  sourcedDistricts: string[];
  message: string;
  sourceUrls: string[];
  accessedOn: string;
}

interface StateRecord {
  status: string;
  state: string;
  row: {
    state: string;
    undertrials: number | null;
    capacity: number | null;
    occupancyPct: number | null;
    centralUndertrials: number | null;
    districtUndertrials: number | null;
    subJailUndertrials: number | null;
    womenUndertrials: number | null;
  } | null;
  dataset: { title: string; period: string; sourceUrl: string };
  national: { undertrialsEnd2024: number; totalPrisonersEnd2024: number; undertrialSharePct: number };
  estimate: { stateShareOfNationalPct: number | null };
  message: string;
  fetchedAt: string;
  cached: boolean;
}

const STATUS_META: Record<
  string,
  { stamp: string; cls: string; plain: string; detail: string }
> = {
  ELIGIBLE_NOW: {
    stamp: "Eligible now",
    cls: "",
    plain: "Over the statutory limit",
    detail: "The 1/3 or 1/2 period is complete. Release is due on bond or bail.",
  },
  CEILING_BREACHED: {
    stamp: "Ceiling breached",
    cls: "",
    plain: "Beyond the maximum sentence",
    detail:
      "Detention has passed the maximum sentence for the governing offence. Escalate today.",
  },
  NOT_YET: {
    stamp: "Not yet",
    cls: "blue",
    plain: "The clock is still running",
    detail: "The statutory date has not arrived. Use this file to prepare in advance.",
  },
  BLOCKED_PENDING_OTHER_CASES: {
    stamp: "Blocked by s.479(2)",
    cls: "blue",
    plain: "Other cases are pending",
    detail:
      "Section 479(2) says a person shall not be released on bail while multiple cases are pending. The DLSA can still review each case.",
  },
  EXCLUDED_DEATH_LIFE: {
    stamp: "Outside s.479",
    cls: "ink",
    plain: "Death or life specified",
    detail:
      "At least one charge specifies death or life imprisonment, so s.479 does not apply. Take the file to the DLSA.",
  },
  UNKNOWN_SECTION: {
    stamp: "Check the charge",
    cls: "ink",
    plain: "Unsupported charge",
    detail: "The charge list is empty or outside the verified BNS table.",
  },
};

function num(value: number | null | undefined): string {
  return typeof value === "number" && Number.isFinite(value)
    ? value.toLocaleString("en-IN")
    : "—";
}

function isoDaysAgo(days: number): string {
  return new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);
}

export default function Home() {
  const [sectionIds, setSectionIds] = useState<string[]>(["bns303"]);
  const [detentionStart, setDetentionStart] = useState(() => isoDaysAgo(500));
  const [firstTime, setFirstTime] = useState(true);
  const [pendingOther, setPendingOther] = useState(false);
  const [delayDays, setDelayDays] = useState(0);

  const [prisonerName, setPrisonerName] = useState("");
  const [caseNo, setCaseNo] = useState("");
  const [court, setCourt] = useState("");
  const [jail, setJail] = useState("");
  const [district, setDistrict] = useState("");
  const [state, setState] = useState("");

  const [result, setResult] = useState<Eligibility | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [app, setApp] = useState<ApplicationBundle | null>(null);
  const [previewLang, setPreviewLang] = useState<"en" | "hi">("en");
  const [copied, setCopied] = useState(false);

  const [draft, setDraft] = useState("");
  const [draftMeta, setDraftMeta] = useState("");
  const [drafting, setDrafting] = useState(false);

  const [districts, setDistricts] = useState<string[]>([]);
  const [dlsa, setDlsa] = useState<DlsaResult | null>(null);
  const [dlsaLoading, setDlsaLoading] = useState(false);
  const [stateRecord, setStateRecord] = useState<StateRecord | null>(null);
  const [stateLoading, setStateLoading] = useState(false);

  const resultRef = useRef<HTMLElement | null>(null);

  const toggleSection = (id: string) =>
    setSectionIds((ids) =>
      ids.includes(id) ? ids.filter((s) => s !== id) : [...ids, id]
    );

  const compute = useCallback(
    async (scroll = false) => {
      if (!sectionIds.length) {
        setError("Select at least one charged section.");
        return;
      }
      setLoading(true);
      setError("");
      setDraft("");
      setApp(null);
      try {
        const res = await fetch("/api/eligibility", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sectionIds,
            detentionStart,
            firstTimeOffender: firstTime,
            pendingOtherCases: pendingOther,
            accusedDelayDays: delayDays,
          }),
        });
        const json = await res.json();
        if (!res.ok) {
          setError(json.error ?? "Computation failed.");
          return;
        }
        setResult(json as Eligibility);
        if (scroll) {
          setTimeout(() => resultRef.current?.scrollIntoView({ block: "start" }), 60);
        }
      } catch {
        setError("Could not reach the computation route. Check the connection and try again.");
      } finally {
        setLoading(false);
      }
    },
    [sectionIds, detentionStart, firstTime, pendingOther, delayDays]
  );

  useEffect(() => {
    compute(false);
    // The first run is a specimen based on the visible defaults (theft, 500 days ago).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setApp(null);
    setCopied(false);
  }, [result, prisonerName, caseNo, court, jail, district, state]);

  // District list for the datalist.
  useEffect(() => {
    if (!state) {
      setDistricts([]);
      return;
    }
    let alive = true;
    fetch(`/api/dlsa?state=${encodeURIComponent(state)}`)
      .then((r) => r.json())
      .then((json) => {
        if (alive) setDistricts(json.districts ?? []);
      })
      .catch(() => {
        if (alive) setDistricts([]);
      });
    return () => {
      alive = false;
    };
  }, [state]);

  // DLSA lookup, debounced while the district is typed.
  useEffect(() => {
    if (!state || !district.trim()) {
      setDlsa(null);
      return;
    }
    let alive = true;
    const timer = setTimeout(() => {
      setDlsaLoading(true);
      fetch(
        `/api/dlsa?state=${encodeURIComponent(state)}&district=${encodeURIComponent(district)}`
      )
        .then((r) => r.json())
        .then((json) => {
          if (alive) setDlsa(json as DlsaResult);
        })
        .catch(() => {
          if (alive) setDlsa(null);
        })
        .finally(() => {
          if (alive) setDlsaLoading(false);
        });
    }, 350);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [state, district]);

  // State/UT row from data.gov.in.
  useEffect(() => {
    if (!state) {
      setStateRecord(null);
      return;
    }
    let alive = true;
    setStateLoading(true);
    fetch(`/api/state-context?state=${encodeURIComponent(state)}`)
      .then((r) => r.json())
      .then((json) => {
        if (alive) setStateRecord(json as StateRecord);
      })
      .catch(() => {
        if (alive) setStateRecord(null);
      })
      .finally(() => {
        if (alive) setStateLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [state]);

  const meta = result ? STATUS_META[result.status] ?? STATUS_META.UNKNOWN_SECTION : null;

  const charges = useMemo(
    () =>
      sectionIds.map((id) => {
        const s = BNS_SECTIONS.find((x) => x.id === id);
        return s ? `${s.label} ${s.title}` : id;
      }),
    [sectionIds]
  );

  const prepare = () => {
    if (!result) return;
    if (!prisonerName.trim() || !caseNo.trim()) {
      setError("Enter the prisoner's name and the case number before preparing the application.");
      return;
    }
    setError("");
    const bundle = buildApplication({
      prisonerName,
      caseNo,
      court: court || "____________",
      jail: jail || "District Jail",
      district: district || "____________",
      state: state || "____________",
      charges,
      detentionStart,
      eligibilityDate: result.eligibilityDate,
      firstTimeOffender: firstTime,
      fractionLabel: result.fraction === 1 / 3 ? "one-third" : "one-half",
      releaseMode: result.releaseMode,
      daysDetainedEffective: result.daysDetainedEffective,
      daysOverLimit: result.daysOverLimit,
      governingMaxYears: result.governingMaxYears,
      status: result.status,
      today: result.today,
      dlsaOffice: dlsa?.matches[0]?.officeName,
    });
    setApp(bundle);
    setPreviewLang("en");
  };

  const copyHindi = async () => {
    if (!app) return;
    try {
      await navigator.clipboard.writeText(app.hindiSummary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      setError("The browser blocked clipboard access. Select the Hindi summary text and copy it manually.");
    }
  };

  const makeDraft = async () => {
    if (!prisonerName || !caseNo) {
      setError("Enter prisoner name and case no. to draft.");
      return;
    }
    setDrafting(true);
    setError("");
    try {
      const res = await fetch("/api/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prisonerName,
          caseNo,
          court: court || "Court of ____________",
          jail: jail || "District Jail",
          district,
          state,
          sectionIds,
          detentionStart,
          firstTimeOffender: firstTime,
          pendingOtherCases: pendingOther,
          accusedDelayDays: delayDays,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Draft failed.");
        return;
      }
      setDraft(json.draft);
      setDraftMeta(
        `Draft source: ${json.draftSource} (model ${json.model}, attempts ${json.attempts}). ${json.modelStatusNote}`
      );
    } catch {
      setError("Could not reach the drafting route.");
    } finally {
      setDrafting(false);
    }
  };

  const print = () => {
    if (!app) {
      setError("Prepare the application first; there is nothing to print yet.");
      return;
    }
    window.print();
  };

  return (
    <>
      <div className="screen-only">
        <div className="shell">
          <section className="cover">
            <h1>
              Section 479.{" "}
              <span className="h1-sub">Work out the release date, then file for it.</span>
            </h1>
            <p className="cover-lede">
              Of the{" "}
              <a
                href="https://www.ncrb.mha.gov.in/uploads/files/PSI-2024ason26022026.pdf"
                target="_blank"
                rel="noreferrer"
              >
                5,11,542 people locked up in India at the end of 2024, 3,71,440 were
                undertrials
              </a>{" "}
              — 72.6%, not yet tried. Section 479 of the BNSS releases one of them
              after a third of the maximum sentence for a first-time offender, or a
              half otherwise. Enter the custody date. This file computes the date,
              shows how much of the sentence has already been served, and prepares
              the application for the Superintendent and the court.
            </p>
          </section>

          <div className="case-layout">
            <div className="document">
              <section className="folio" id="custody">
                <div className="folio-head">
                  <span className="folio-mark">Folio 1</span>
                  <h2>Custody record</h2>
                </div>
                <p className="small" style={{ marginTop: -8, marginBottom: 22 }}>
                  Use the date on the custody memo or jail admission register.
                  The arithmetic uses 365 days per year.
                </p>

                <div className="form-grid">
                  <div className="field">
                    <label htmlFor="start">Detention start date</label>
                    <input
                      id="start"
                      type="date"
                      value={detentionStart}
                      onChange={(e) => setDetentionStart(e.target.value)}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="delay">Delay caused by the accused (days)</label>
                    <input
                      id="delay"
                      type="number"
                      min={0}
                      value={delayDays}
                      onChange={(e) => setDelayDays(Number(e.target.value))}
                    />
                    <p className="field-help">
                      Excluded from detention under the Explanation to s.479.
                      Leave at 0 if no delay was recorded against the accused.
                    </p>
                  </div>
                </div>

                <div style={{ marginTop: 14 }}>
                  <label className="check">
                    <input
                      type="checkbox"
                      checked={firstTime}
                      onChange={(e) => setFirstTime(e.target.checked)}
                    />
                    <span className="check-text">
                      <strong>First-time offender.</strong> Never convicted of
                      any offence in the past. The fraction is one-third, on
                      bond. Unchecked: one-half, on bail.
                    </span>
                  </label>
                  <label className="check">
                    <input
                      type="checkbox"
                      checked={pendingOther}
                      onChange={(e) => setPendingOther(e.target.checked)}
                    />
                    <span className="check-text">
                      <strong>Other cases are pending.</strong> Section 479(2)
                      says the person shall not be released on bail while
                      multiple cases are pending. This blocks the release route.
                    </span>
                  </label>
                </div>

                <h3>Schedule of charges</h3>
                <p className="small" style={{ marginTop: -4 }}>
                  Verified BNS entries only. If the charge sheet uses a section
                  outside this table, stop and take it to the DLSA.{" "}
                  <a href="/sources">See the statute table</a>.
                </p>
                <div className="schedule">
                  {BNS_SECTIONS.map((s) => {
                    const checked = sectionIds.includes(s.id);
                    return (
                      <label
                        key={s.id}
                        className="schedule-row"
                        data-checked={checked}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleSection(s.id)}
                        />
                        <span>
                          <span className="schedule-section">{s.label}</span>
                          <span className="schedule-title">{s.title}</span>
                          {s.note.startsWith("⚠") && (
                            <span className="schedule-note">{s.note}</span>
                          )}
                        </span>
                        <span className="schedule-max">
                          max {s.maxSentenceLabel}
                        </span>
                      </label>
                    );
                  })}
                </div>

                <div className="btn-row">
                  <button className="btn" onClick={() => compute(true)} disabled={loading}>
                    {loading ? "Computing…" : "Compute the date"}
                  </button>
                  <span className="small">
                    {sectionIds.length
                      ? `${sectionIds.length} charge${sectionIds.length === 1 ? "" : "s"} selected`
                      : "No charge selected"}
                  </span>
                </div>
                {error && (
                  <div className="notice error" role="alert">
                    {error}
                  </div>
                )}
              </section>

              {result && meta && (
                <section className="folio" id="result" ref={resultRef}>
                  <div className="folio-head">
                    <span className="folio-mark">Folio 2</span>
                    <h2>Computation</h2>
                  </div>

                  <div className="result-grid" aria-live="polite">
                    <div className={`verdict-stamp ${meta.cls}`}>{meta.stamp}</div>
                    <p className="result-clause">
                      Section 479, {meta.plain.toLowerCase()}.
                    </p>

                    <dl className="line-items">
                      <div className="line-item">
                        <dt>Release date</dt>
                        <dd>
                          {result.eligibilityDate
                            ? formatDateEn(result.eligibilityDate)
                            : "No computable date"}
                        </dd>
                      </div>
                      <div className="line-item">
                        <dt>Threshold</dt>
                        <dd>
                          {num(result.governingThresholdDays)} of {result.governingMaxYears}{" "}
                          years&#8217; maximum
                        </dd>
                      </div>
                      <div className="line-item">
                        <dt>Custody counted</dt>
                        <dd>{num(result.daysDetainedEffective)} days</dd>
                      </div>
                      <div className={`line-item ${result.daysOverLimit > 0 ? "alert" : ""}`}>
                        <dt>
                          {result.daysOverLimit > 0 ? "Over the limit by" : "Still to serve"}
                        </dt>
                        <dd>
                          {num(
                            result.daysOverLimit > 0
                              ? result.daysOverLimit
                              : result.daysUntilEligible
                          )}{" "}
                          {(result.daysOverLimit > 0 ? result.daysOverLimit : result.daysUntilEligible) === 1 ? "day" : "days"}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <p className="result-basis">
                    <strong>{meta.plain}.</strong> {meta.detail}{" "}
                    {result.fraction === 1 / 3
                      ? "First-time offender: one-third of the maximum, released on bond."
                      : "Not a first-time offender: one-half of the maximum, released on bail."}{" "}
                    {result.accusedDelayDays > 0
                      ? `${result.accusedDelayDays} days of accused-caused delay are excluded.`
                      : "No accused-caused delay was deducted."}
                  </p>

                  <DetentionTimeline
                    detentionStart={detentionStart}
                    today={result.today}
                    eligibilityDate={result.eligibilityDate}
                    daysDetained={result.daysDetainedEffective}
                    thresholdDays={result.governingThresholdDays}
                    maxDays={result.ceilingDays}
                    status={result.status}
                  />

                  <div className="btn-row">
                    <a className="btn" href="#application">
                      Prepare the application
                    </a>
                    <a className="btn secondary" href="/legal-aid">
                      Check free legal aid
                    </a>
                  </div>

                  <details style={{ marginTop: 22 }}>
                    <summary className="small" style={{ cursor: "pointer" }}>
                      Statute and caveats ({result.notes.length})
                    </summary>
                    <ol className="small" style={{ paddingLeft: 18, marginTop: 10 }}>
                      {result.notes.map((n, i) => (
                        <li key={i} style={{ marginBottom: 6 }}>
                          {n}
                        </li>
                      ))}
                    </ol>
                  </details>

                  <div className="table-scroll">
                    <table className="register">
                      <thead>
                        <tr>
                          <th>Charge</th>
                          <th>Maximum</th>
                          <th className="num">Threshold</th>
                          <th className="num">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.perSection.map((p, i) => (
                          <tr key={i}>
                            <td>{p.label}</td>
                            <td>{p.maxSentenceLabel}</td>
                            <td className="num">{num(p.thresholdDays)} d</td>
                            <td className="num">{formatDateEn(p.eligibilityDate)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="small">
                    With more than one charge, the latest date governs: every
                    count must be satisfied. Dates are calendar dates; verify
                    calendar-year arithmetic with the DLSA.
                  </p>
                </section>
              )}

              <section className="folio" id="application">
                <div className="folio-head">
                  <span className="folio-mark">Folio 3</span>
                  <h2>Release application</h2>
                </div>
                <p>
                  The document is addressed to the Superintendent of the jail and
                  to the court. It quotes s.479(1), the first proviso and
                  s.479(3), and carries a signature and forwarding block. Print
                  it on A4, sign it, and take it to the DLSA or the jail welfare
                  officer.
                </p>

                <div className="form-grid">
                  <div className="field">
                    <label htmlFor="pn">Prisoner name</label>
                    <input
                      id="pn"
                      type="text"
                      value={prisonerName}
                      onChange={(e) => setPrisonerName(e.target.value)}
                      placeholder="Full name as in the case record"
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="cn">Case number</label>
                    <input
                      id="cn"
                      type="text"
                      value={caseNo}
                      onChange={(e) => setCaseNo(e.target.value)}
                      placeholder="e.g. SC 123/2024"
                    />
                  </div>
                </div>

                <div className="form-grid" style={{ marginTop: 18 }}>
                  <div className="field">
                    <label htmlFor="court">Court</label>
                    <input
                      id="court"
                      type="text"
                      value={court}
                      onChange={(e) => setCourt(e.target.value)}
                      placeholder="e.g. Court of JMFC, Ernakulam"
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="jail">Jail</label>
                    <input
                      id="jail"
                      type="text"
                      value={jail}
                      onChange={(e) => setJail(e.target.value)}
                      placeholder="e.g. District Jail, Ernakulam"
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="district">District</label>
                    <input
                      id="district"
                      type="text"
                      list="district-list"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      placeholder="District where the case is filed"
                    />
                    <datalist id="district-list">
                      {districts.map((d) => (
                        <option key={d} value={d} />
                      ))}
                    </datalist>
                  </div>
                  <div className="field">
                    <label htmlFor="state">State / UT</label>
                    <select
                      id="state"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                    >
                      <option value="">Choose a State/UT</option>
                      {STATE_CONTEXT_STATES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="btn-row">
                  <button className="btn" onClick={prepare} disabled={!result}>
                    Prepare A4 application
                  </button>
                  <button
                    className="btn secondary"
                    onClick={copyHindi}
                    disabled={!app}
                  >
                    {copied ? "Hindi summary copied" : "Copy Hindi summary"}
                  </button>
                  <button className="btn secondary" onClick={print} disabled={!app}>
                    Print A4
                  </button>
                </div>

                {app && (
                  <>
                    <div className="notice">
                      <strong>Check before filing.</strong> The application is a
                      draft. A DLSA advocate or the jail Superintendent must
                      verify the charge, the custody date and the addressee. The
                      printout contains the English and Hindi versions on
                      separate A4 pages.
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: 10,
                        alignItems: "center",
                        marginTop: 18,
                      }}
                    >
                      <span className="small">Preview:</span>
                      <button
                        className={`btn small ${
                          previewLang === "en" ? "" : "secondary"
                        }`}
                        onClick={() => setPreviewLang("en")}
                      >
                        English
                      </button>
                      <button
                        className={`btn small ${
                          previewLang === "hi" ? "" : "secondary"
                        }`}
                        onClick={() => setPreviewLang("hi")}
                      >
                        हिन्दी
                      </button>
                    </div>

                    <div className="sheet-wrap">
                      <ApplicationSheet
                        doc={
                          previewLang === "en" ? app.english : app.hindi
                        }
                      />
                    </div>

                    <details style={{ marginTop: 18 }}>
                      <summary className="small" style={{ cursor: "pointer" }}>
                        Hindi summary for the family (one tap to copy)
                      </summary>
                      <pre
                        className="verbatim"
                        style={{
                          fontFamily: "var(--sans)",
                          whiteSpace: "pre-wrap",
                          marginTop: 10,
                        }}
                      >
                        {app.hindiSummary}
                      </pre>
                      <button className="btn secondary small" onClick={copyHindi}>
                        {copied ? "Copied" : "Copy this summary"}
                      </button>
                    </details>
                  </>
                )}

                <details style={{ marginTop: 26 }}>
                  <summary className="small" style={{ cursor: "pointer" }}>
                    Optional: generate a model-written draft (English + Hindi)
                  </summary>
                  <p className="small" style={{ marginTop: 10 }}>
                    The printable application above is deterministic and does
                    not need a model. This secondary draft calls the BharatCode
                    model when it is reachable and falls back to a fixed
                    template. Use it for a second pair of eyes, not as the filed
                    document.
                  </p>
                  <div className="btn-row" style={{ marginTop: 10 }}>
                    <button
                      className="btn secondary small"
                      onClick={makeDraft}
                      disabled={drafting}
                    >
                      {drafting ? "Drafting…" : "Generate draft text"}
                    </button>
                  </div>
                  {draftMeta && <p className="small">{draftMeta}</p>}
                  {draft && <pre className="verbatim" style={{ marginTop: 12 }}>{draft}</pre>}
                </details>
              </section>

              <section className="folio" id="help">
                <div className="folio-head">
                  <span className="folio-mark">Folio 4</span>
                  <h2>If you need a lawyer</h2>
                </div>
                <p>
                  Free legal aid is a statutory right for the categories in
                  Section 12 of the Legal Services Authorities Act, 1987. A
                  person in custody is one of them. The State pays the legal-aid
                  counsel; the family does not.
                </p>
                <div className="btn-row" style={{ marginTop: 4 }}>
                  <a className="btn" href="/legal-aid">
                    Check Section 12 eligibility
                  </a>
                  <a className="btn secondary" href="/dlsa">
                    Find the DLSA office
                  </a>
                  <a className="btn secondary" href="tel:15100">
                    Call NALSA 15100
                  </a>
                </div>
                <p className="small" style={{ marginTop: 16 }}>
                  Legal information, not legal advice. The DLSA decides
                  eligibility and assigns counsel. Every citation on this page
                  links to a source on <a href="/sources">Sources</a>.
                </p>
              </section>
            </div>

            <aside className="rail" aria-label="Computation sheet">
              <div className="rail-block">
                <p className="rail-title">Computation sheet</p>
                {result ? (
                  <>
                    <div className="rail-row">
                      <span>Governing maximum</span>
                      <span className="val">{result.governingMaxYears} years</span>
                    </div>
                    <div className="rail-row">
                      <span>Fraction</span>
                      <span className="val">
                        {result.fraction === 1 / 3 ? "1/3 · bond" : "1/2 · bail"}
                      </span>
                    </div>
                    <div className="rail-row">
                      <span>Threshold</span>
                      <span className="val">{num(result.governingThresholdDays)} days</span>
                    </div>
                    <div className="rail-row">
                      <span>Accused delay excluded</span>
                      <span className="val">{num(result.accusedDelayDays)} days</span>
                    </div>
                    <div className="rail-row">
                      <span>Effective detention</span>
                      <span className="val">{num(result.daysDetainedEffective)} days</span>
                    </div>
                    <div className="rail-row">
                      <span>Eligibility date</span>
                      <span className="val">{formatDateEn(result.eligibilityDate)}</span>
                    </div>
                    <div className="rail-row">
                      <span>Days over limit</span>
                      <span className="val">{num(result.daysOverLimit)}</span>
                    </div>
                    <div className="rail-row rail-total">
                      <span>Status</span>
                      <span className="val">{meta?.plain}</span>
                    </div>
                    <p className="rail-note">
                      BNSS s.479(1), first proviso and s.479(3). 365-day
                      arithmetic; confirm calendar-year computation with the
                      DLSA.
                    </p>
                  </>
                ) : (
                  <p className="rail-note">
                    Select the charges and custody date, then compute. This sheet
                    fills with the governing maximum, threshold and release date.
                  </p>
                )}
              </div>

              <div className="rail-block">
                <p className="rail-title">State record</p>
                {!state && (
                  <p className="rail-note">
                    Choose a State/UT in the application form to see the
                    published undertrial row from data.gov.in.
                  </p>
                )}
                {state && stateLoading && (
                  <p className="rail-note">Reading data.gov.in…</p>
                )}
                {state && !stateLoading && stateRecord && (
                  <>
                    {stateRecord.status === "ok" && stateRecord.row ? (
                      <>
                        <div className="rail-row">
                          <span>Undertrials, {stateRecord.dataset.period}</span>
                          <span className="val">{num(stateRecord.row.undertrials)}</span>
                        </div>
                        <div className="rail-row">
                          <span>All-jail capacity</span>
                          <span className="val">{num(stateRecord.row.capacity)}</span>
                        </div>
                        <div className="rail-row">
                          <span>Undertrial occupancy</span>
                          <span className="val">
                            {stateRecord.row.occupancyPct !== null
                              ? `${stateRecord.row.occupancyPct.toFixed(1)}%`
                              : "—"}
                          </span>
                        </div>
                        <div className="rail-row">
                          <span>Share of 2024 national total</span>
                          <span className="val">
                            {stateRecord.estimate.stateShareOfNationalPct !== null
                              ? `${stateRecord.estimate.stateShareOfNationalPct}%`
                              : "—"}
                          </span>
                        </div>
                        <p className="rail-note">
                          State row: {stateRecord.dataset.period}. National:
                          3,71,440 undertrials at end-2024 (NCRB PSI 2024). The
                          share is an estimate from those two published figures.{" "}
                          <a
                            href={stateRecord.dataset.sourceUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            data.gov.in record
                          </a>
                          .
                        </p>
                      </>
                    ) : (
                      <p className="rail-note">{stateRecord.message}</p>
                    )}
                  </>
                )}
              </div>

              <div className="rail-block">
                <p className="rail-title">District legal aid</p>
                {!state || !district.trim() ? (
                  <p className="rail-note">
                    Add the district and State/UT to see a sourced DLSA office.
                    If the district is not in the file, the tool says so rather
                    than inventing a number.
                  </p>
                ) : dlsaLoading ? (
                  <p className="rail-note">Looking up the DLSA…</p>
                ) : dlsa && dlsa.matches.length ? (
                  <>
                    {dlsa.matches.slice(0, 1).map((m) => (
                      <div key={m.officeName}>
                        <p className="rail-address">
                          <strong>{m.officeName}</strong>
                          <br />
                          {m.address}
                        </p>
                        <a className="rail-phone" href={`tel:${m.phone.split(",")[0].replace(/[^0-9+]/g, "")}`}>
                          {m.phone}
                        </a>
                        <p className="rail-note">
                          <span className="source-tag">Sourced</span>{" "}
                          <a href={m.sourceUrl} target="_blank" rel="noreferrer">
                            NALSA state page
                          </a>{" "}
                          · accessed {m.accessedOn}
                        </p>
                      </div>
                    ))}
                    <p className="rail-note">
                      <a href="/dlsa">Open the full DLSA desk</a>
                    </p>
                  </>
                ) : (
                  <p className="rail-note">
                    {dlsa?.message ??
                      "Contact details not yet sourced for this district. Call NALSA 15100; do not rely on an unverified number."}
                  </p>
                )}
              </div>

              <div className="rail-block">
                <p className="rail-title">Free legal aid</p>
                <p className="rail-note">
                  A person in custody is covered by Section 12(g) of the Legal
                  Services Authorities Act, 1987. The DLSA assigns a lawyer at
                  the State's cost.
                </p>
                <p className="rail-note">
                  <a href="/legal-aid">Check the Section 12 route</a> ·{" "}
                  <a href="tel:15100">15100</a>
                </p>
              </div>
            </aside>
          </div>
        </div>
      </div>

      <div className="print-only">
        {app && (
          <>
            <ApplicationSheet doc={app.english} />
            <ApplicationSheet doc={app.hindi} />
          </>
        )}
      </div>
    </>
  );
}

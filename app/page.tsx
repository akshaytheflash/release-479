"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BNS_BY_ID, BNS_SECTIONS } from "@/lib/bns";
import { STATE_CONTEXT_STATES } from "@/lib/stateContext";
import { buildApplication, formatDateEn, type ApplicationBundle } from "@/lib/application";
import { useI18n } from "@/components/I18nProvider";
import RichText from "@/components/RichText";
import ApplicationSheet from "@/components/ApplicationSheet";
import DetentionTimeline from "@/components/DetentionTimeline";
import FloatingClock from "@/components/FloatingClock";
import { bnsMaxKey, bnsTitleKey } from "@/lib/i18n/labels";
import type { MessageKey } from "@/lib/i18n/messages/en";

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
    sectionId: string;
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

interface DraftMeta {
  source: string;
  model: string;
  attempts: string;
  note: string;
}

type PageError = { key: MessageKey } | { text: string } | null;

const STATUS_META: Record<
  string,
  { stamp: MessageKey; cls: string; plain: MessageKey; detail: MessageKey }
> = {
  ELIGIBLE_NOW: {
    stamp: "status.ELIGIBLE_NOW.stamp",
    cls: "",
    plain: "status.ELIGIBLE_NOW.plain",
    detail: "status.ELIGIBLE_NOW.detail",
  },
  CEILING_BREACHED: {
    stamp: "status.CEILING_BREACHED.stamp",
    cls: "",
    plain: "status.CEILING_BREACHED.plain",
    detail: "status.CEILING_BREACHED.detail",
  },
  NOT_YET: {
    stamp: "status.NOT_YET.stamp",
    cls: "blue",
    plain: "status.NOT_YET.plain",
    detail: "status.NOT_YET.detail",
  },
  BLOCKED_PENDING_OTHER_CASES: {
    stamp: "status.BLOCKED_PENDING_OTHER_CASES.stamp",
    cls: "blue",
    plain: "status.BLOCKED_PENDING_OTHER_CASES.plain",
    detail: "status.BLOCKED_PENDING_OTHER_CASES.detail",
  },
  EXCLUDED_DEATH_LIFE: {
    stamp: "status.EXCLUDED_DEATH_LIFE.stamp",
    cls: "ink",
    plain: "status.EXCLUDED_DEATH_LIFE.plain",
    detail: "status.EXCLUDED_DEATH_LIFE.detail",
  },
  UNKNOWN_SECTION: {
    stamp: "status.UNKNOWN_SECTION.stamp",
    cls: "ink",
    plain: "status.UNKNOWN_SECTION.plain",
    detail: "status.UNKNOWN_SECTION.detail",
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
  const { t } = useI18n();
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
  const [error, setError] = useState<PageError>(null);

  const [app, setApp] = useState<ApplicationBundle | null>(null);
  const [previewLang, setPreviewLang] = useState<"en" | "hi">("en");
  const [copied, setCopied] = useState(false);

  const [draft, setDraft] = useState("");
  const [draftMeta, setDraftMeta] = useState<DraftMeta | null>(null);
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
        setError({ key: "error.selectSection" });
        return;
      }
      setLoading(true);
      setError(null);
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
          setError(json.error ? { text: json.error } : { key: "error.computeFailed" });
          return;
        }
        setResult(json as Eligibility);
        if (scroll) {
          setTimeout(() => resultRef.current?.scrollIntoView({ block: "start" }), 60);
        }
      } catch {
        setError({ key: "error.network" });
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

  // Charges are document data: the printable application and the request to the
  // drafting route stay in English, so these labels are not translated.
  const charges = useMemo(
    () =>
      sectionIds.map((id) => {
        const s = BNS_SECTIONS.find((x) => x.id === id);
        return s ? `${s.label} ${s.title}` : id;
      }),
    [sectionIds]
  );

  const notes = useMemo(() => {
    if (!result) return [];
    const common = [
      t("home.notes.arithmetic"),
      t("home.notes.superintendent"),
      t("home.notes.proviso"),
    ];
    switch (result.status) {
      case "ELIGIBLE_NOW":
        return [
          t("home.notes.eligibleNow", {
            fraction:
              result.fraction === 1 / 3
                ? t("home.notes.fractionThird")
                : t("home.notes.fractionHalf"),
          }),
          ...common,
        ];
      case "CEILING_BREACHED":
        return [t("home.notes.ceiling", { years: result.governingMaxYears }), ...common];
      case "BLOCKED_PENDING_OTHER_CASES":
        return [t("home.notes.blocked"), ...common];
      case "EXCLUDED_DEATH_LIFE":
        return [t("home.notes.excluded"), ...common];
      case "UNKNOWN_SECTION": {
        if (!sectionIds.length) return [t("home.notes.selectSection"), ...common];
        const unknown = sectionIds.filter((id) => !BNS_BY_ID[id]);
        return [
          t("home.notes.unknown", {
            ids: unknown.join(", ") || "—",
            count: BNS_SECTIONS.length,
          }),
          ...common,
        ];
      }
      default:
        return common;
    }
  }, [result, sectionIds, t]);

  const prepare = () => {
    if (!result) return;
    if (!prisonerName.trim() || !caseNo.trim()) {
      setError({ key: "error.nameAndCase" });
      return;
    }
    setError(null);
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
      setError({ key: "error.clipboardHindi" });
    }
  };

  const makeDraft = async () => {
    if (!prisonerName || !caseNo) {
      setError({ key: "error.nameAndCaseDraft" });
      return;
    }
    setDrafting(true);
    setError(null);
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
        setError(json.error ? { text: json.error } : { key: "error.draftFailed" });
        return;
      }
      setDraft(json.draft);
      setDraftMeta({
        source: json.draftSource,
        model: json.model,
        attempts: json.attempts,
        note: json.modelStatusNote,
      });
    } catch {
      setError({ key: "error.draftNetwork" });
    } finally {
      setDrafting(false);
    }
  };

  const print = () => {
    if (!app) {
      setError({ key: "error.prepareFirst" });
      return;
    }
    window.print();
  };

  const errorLabel = error ? ("key" in error ? t(error.key) : error.text) : "";

  const stateMessageKey = (() => {
    switch (stateRecord?.status) {
      case "unconfigured":
        return "home.state.unconfigured" as const;
      case "rate_limited":
        return "home.state.rateLimited" as const;
      case "not_published":
        return "home.state.notPublished" as const;
      default:
        return "home.state.error" as const;
    }
  })();

  return (
    <>
      <div className="screen-only">
        <div className="shell">
          <section className="cover">
            <h1>
              {t("home.cover.h1")}{" "}
              <span className="h1-sub">{t("home.cover.sub")}</span>
            </h1>
            <p className="cover-lede">
              <RichText
                template={t("home.cover.lede")}
                values={{
                  figures: (
                    <a
                      href="https://www.ncrb.mha.gov.in/uploads/files/PSI-2024ason26022026.pdf"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {t("home.cover.figures")}
                    </a>
                  ),
                }}
              />
            </p>
          </section>

          <div className="case-layout">
            <div className="document">
              <section className="folio" id="custody">
                <div className="folio-head">
                  <span className="folio-mark">{t("home.folio1")}</span>
                  <h2>{t("home.custody.title")}</h2>
                </div>
                <p className="small" style={{ marginTop: -8, marginBottom: 22 }}>
                  {t("home.custody.help")}
                </p>

                <div className="form-grid">
                  <div className="field">
                    <label htmlFor="start">{t("home.custody.start")}</label>
                    <input
                      id="start"
                      type="date"
                      value={detentionStart}
                      onChange={(e) => setDetentionStart(e.target.value)}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="delay">{t("home.custody.delay")}</label>
                    <input
                      id="delay"
                      type="number"
                      min={0}
                      value={delayDays}
                      onChange={(e) => setDelayDays(Number(e.target.value))}
                    />
                    <p className="field-help">{t("home.custody.delayHelp")}</p>
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
                      <strong>{t("home.custody.firstTimeLabel")}</strong>{" "}
                      {t("home.custody.firstTimeDetail")}
                    </span>
                  </label>
                  <label className="check">
                    <input
                      type="checkbox"
                      checked={pendingOther}
                      onChange={(e) => setPendingOther(e.target.checked)}
                    />
                    <span className="check-text">
                      <strong>{t("home.custody.pendingLabel")}</strong>{" "}
                      {t("home.custody.pendingDetail")}
                    </span>
                  </label>
                </div>

                <h3>{t("home.charges.title")}</h3>
                <p className="small" style={{ marginTop: -4 }}>
                  <RichText
                    template={t("home.charges.help")}
                    values={{
                      link: <a href="/sources">{t("home.charges.link")}</a>,
                    }}
                  />
                </p>
                <div className="schedule">
                  {BNS_SECTIONS.map((s) => {
                    const checked = sectionIds.includes(s.id);
                    const titleKey = bnsTitleKey(s.id);
                    const maxKey = bnsMaxKey(s.id);
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
                          <span className="schedule-title">
                            {titleKey ? t(titleKey) : s.title}
                          </span>
                          {s.note.startsWith("⚠") && (
                            <span className="schedule-note">{s.note}</span>
                          )}
                        </span>
                        <span className="schedule-max">
                          {t("home.charges.max", {
                            label: maxKey ? t(maxKey) : s.maxSentenceLabel,
                          })}
                        </span>
                      </label>
                    );
                  })}
                </div>

                <div className="btn-row">
                  <button className="btn" onClick={() => compute(true)} disabled={loading}>
                    {loading ? t("common.computing") : t("home.charges.compute")}
                  </button>
                  <span className="small">
                    {sectionIds.length
                      ? sectionIds.length === 1
                        ? t("home.charges.selectedOne")
                        : t("home.charges.selectedMany", { count: sectionIds.length })
                      : t("home.charges.none")}
                  </span>
                </div>
                {error && (
                  <div className="notice error" role="alert">
                    {errorLabel}
                  </div>
                )}
              </section>

              {result && meta && (
                <section className="folio" id="result" ref={resultRef}>
                  <div className="folio-head">
                    <span className="folio-mark">{t("home.folio2")}</span>
                    <h2>{t("home.result.title")}</h2>
                  </div>

                  <div className="result-grid" aria-live="polite">
                    <div className={`verdict-stamp ${meta.cls}`}>{t(meta.stamp)}</div>
                    <p className="result-clause">
                      {t("home.result.clause", { plain: t(meta.plain) })}
                    </p>

                    <dl className="line-items">
                      <div className="line-item">
                        <dt>{t("home.result.releaseDate")}</dt>
                        <dd>
                          {result.eligibilityDate
                            ? formatDateEn(result.eligibilityDate)
                            : t("common.none")}
                        </dd>
                      </div>
                      <div className="line-item">
                        <dt>{t("home.result.threshold")}</dt>
                        <dd>
                          {t("home.result.thresholdValue", {
                            days: num(result.governingThresholdDays),
                            years: result.governingMaxYears,
                          })}
                        </dd>
                      </div>
                      <div className="line-item">
                        <dt>{t("home.result.custodyCounted")}</dt>
                        <dd>{t("common.days", { days: num(result.daysDetainedEffective) })}</dd>
                      </div>
                      <div className={`line-item ${result.daysOverLimit > 0 ? "alert" : ""}`}>
                        <dt>
                          {result.daysOverLimit > 0
                            ? t("home.result.overBy")
                            : t("home.result.stillToServe")}
                        </dt>
                        <dd>
                          {(result.daysOverLimit > 0
                            ? result.daysOverLimit
                            : result.daysUntilEligible) === 1
                            ? t("common.dayOne")
                            : t("common.dayMany", {
                                days: num(
                                  result.daysOverLimit > 0
                                    ? result.daysOverLimit
                                    : result.daysUntilEligible
                                ),
                              })}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <p className="result-basis">
                    <RichText
                      template={t("home.result.basis")}
                      values={{
                        summary: <strong>{t(meta.plain)}.</strong>,
                        detail: t(meta.detail),
                        fraction:
                          result.fraction === 1 / 3
                            ? t("home.result.fractionFirst")
                            : t("home.result.fractionOther"),
                        delay:
                          result.accusedDelayDays > 0
                            ? t("home.result.delayExcluded", {
                                days: result.accusedDelayDays,
                              })
                            : t("home.result.delayNone"),
                      }}
                    />
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

                  <FloatingClock
                    daysServed={result.daysDetainedEffective}
                    thresholdDays={result.governingThresholdDays}
                    status={result.status}
                    eligibilityDate={result.eligibilityDate}
                  />

                  <div className="btn-row">
                    <a className="btn" href="#application">
                      {t("home.result.prepareLink")}
                    </a>
                    <a className="btn secondary" href="/legal-aid">
                      {t("home.result.checkAid")}
                    </a>
                  </div>

                  <details style={{ marginTop: 22 }}>
                    <summary className="small" style={{ cursor: "pointer" }}>
                      {t("home.result.notes", { count: notes.length })}
                    </summary>
                    <ol className="small" style={{ paddingLeft: 18, marginTop: 10 }}>
                      {notes.map((n, i) => (
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
                          <th>{t("home.result.colCharge")}</th>
                          <th>{t("home.result.colMaximum")}</th>
                          <th className="num">{t("home.result.colThreshold")}</th>
                          <th className="num">{t("home.result.colDate")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.perSection.map((p, i) => {
                          const titleKey = bnsTitleKey(p.sectionId);
                          const maxKey = bnsMaxKey(p.sectionId);
                          const section = BNS_BY_ID[p.sectionId];
                          return (
                            <tr key={i}>
                              <td>
                                {section
                                  ? `${section.label} — ${
                                      titleKey ? t(titleKey) : section.title
                                    }`
                                  : p.label}
                              </td>
                              <td>{maxKey ? t(maxKey) : p.maxSentenceLabel}</td>
                              <td className="num">
                                {t("home.result.thresholdShort", { days: num(p.thresholdDays) })}
                              </td>
                              <td className="num">{formatDateEn(p.eligibilityDate)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <p className="small">{t("home.result.footnote")}</p>
                </section>
              )}

              <section className="folio" id="application">
                <div className="folio-head">
                  <span className="folio-mark">{t("home.folio3")}</span>
                  <h2>{t("home.application.title")}</h2>
                </div>
                <p>{t("home.application.intro")}</p>

                <div className="form-grid">
                  <div className="field">
                    <label htmlFor="pn">{t("field.prisonerName")}</label>
                    <input
                      id="pn"
                      type="text"
                      value={prisonerName}
                      onChange={(e) => setPrisonerName(e.target.value)}
                      placeholder={t("field.prisonerNamePlaceholder")}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="cn">{t("field.caseNumber")}</label>
                    <input
                      id="cn"
                      type="text"
                      value={caseNo}
                      onChange={(e) => setCaseNo(e.target.value)}
                      placeholder={t("field.caseNumberPlaceholder")}
                    />
                  </div>
                </div>

                <div className="form-grid" style={{ marginTop: 18 }}>
                  <div className="field">
                    <label htmlFor="court">{t("field.court")}</label>
                    <input
                      id="court"
                      type="text"
                      value={court}
                      onChange={(e) => setCourt(e.target.value)}
                      placeholder={t("field.courtPlaceholder")}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="jail">{t("field.jail")}</label>
                    <input
                      id="jail"
                      type="text"
                      value={jail}
                      onChange={(e) => setJail(e.target.value)}
                      placeholder={t("field.jailPlaceholder")}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="district">{t("field.district")}</label>
                    <input
                      id="district"
                      type="text"
                      list="district-list"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      placeholder={t("field.districtPlaceholder")}
                    />
                    <datalist id="district-list">
                      {districts.map((d) => (
                        <option key={d} value={d} />
                      ))}
                    </datalist>
                  </div>
                  <div className="field">
                    <label htmlFor="state">{t("field.state")}</label>
                    <select
                      id="state"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                    >
                      <option value="">{t("common.chooseState")}</option>
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
                    {t("home.application.prepare")}
                  </button>
                  <button
                    className="btn secondary"
                    onClick={copyHindi}
                    disabled={!app}
                  >
                    {copied
                      ? t("home.application.copiedHindi")
                      : t("home.application.copyHindi")}
                  </button>
                  <button className="btn secondary" onClick={print} disabled={!app}>
                    {t("home.application.print")}
                  </button>
                </div>

                {app && (
                  <>
                    <div className="notice">
                      <strong>{t("home.application.checkTitle")}</strong>{" "}
                      {t("home.application.checkBody")}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: 10,
                        alignItems: "center",
                        marginTop: 18,
                      }}
                    >
                      <span className="small">{t("home.application.preview")}</span>
                      <button
                        className={`btn small ${
                          previewLang === "en" ? "" : "secondary"
                        }`}
                        onClick={() => setPreviewLang("en")}
                      >
                        {t("common.english")}
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

                    <p className="small" style={{ marginTop: 18, marginBottom: 0 }}>
                      {t("doc.englishOnly")}
                    </p>
                    <div className="sheet-wrap" lang="en">
                      <ApplicationSheet
                        doc={
                          previewLang === "en" ? app.english : app.hindi
                        }
                      />
                    </div>

                    <details style={{ marginTop: 18 }}>
                      <summary className="small" style={{ cursor: "pointer" }}>
                        {t("home.application.hindiSummary")}
                      </summary>
                      <pre
                        className="verbatim"
                        lang="hi"
                        style={{
                          fontFamily: "var(--sans)",
                          whiteSpace: "pre-wrap",
                          marginTop: 10,
                        }}
                      >
                        {app.hindiSummary}
                      </pre>
                      <button className="btn secondary small" onClick={copyHindi}>
                        {copied ? t("common.copied") : t("home.application.copySummary")}
                      </button>
                    </details>
                  </>
                )}

                <details style={{ marginTop: 26 }}>
                  <summary className="small" style={{ cursor: "pointer" }}>
                    {t("home.application.draftSummary")}
                  </summary>
                  <p className="small" style={{ marginTop: 10 }}>
                    {t("home.application.draftIntro")}
                  </p>
                  <div className="btn-row" style={{ marginTop: 10 }}>
                    <button
                      className="btn secondary small"
                      onClick={makeDraft}
                      disabled={drafting}
                    >
                      {drafting ? t("common.drafting") : t("home.application.generate")}
                    </button>
                  </div>
                  {draftMeta && (
                    <p className="small">
                      {t("home.application.draftMeta", {
                        source: draftMeta.source,
                        model: draftMeta.model,
                        attempts: draftMeta.attempts,
                        note: draftMeta.note,
                      })}
                    </p>
                  )}
                  {draft && (
                    <>
                      <p className="small" style={{ marginTop: 12 }}>
                        {t("doc.englishOnly")}
                      </p>
                      <pre className="verbatim" style={{ marginTop: 12 }} lang="en">
                        {draft}
                      </pre>
                    </>
                  )}
                </details>
              </section>

              <section className="folio" id="help">
                <div className="folio-head">
                  <span className="folio-mark">{t("home.folio4")}</span>
                  <h2>{t("home.help.title")}</h2>
                </div>
                <p>{t("home.help.intro")}</p>
                <div className="btn-row" style={{ marginTop: 4 }}>
                  <a className="btn" href="/legal-aid">
                    {t("home.help.checkAid")}
                  </a>
                  <a className="btn secondary" href="/dlsa">
                    {t("home.help.findDlsa")}
                  </a>
                  <a className="btn secondary" href="tel:15100">
                    {t("home.help.callNalsa")}
                  </a>
                </div>
                <p className="small" style={{ marginTop: 16 }}>
                  <RichText
                    template={t("home.help.footnote")}
                    values={{
                      link: <a href="/sources">{t("home.help.sources")}</a>,
                    }}
                  />
                </p>
              </section>
            </div>

            <aside className="rail" aria-label={t("home.rail.computationLabel")}>
              <div className="rail-block">
                <p className="rail-title">{t("home.rail.computation")}</p>
                {result ? (
                  <>
                    <div className="rail-row">
                      <span>{t("home.rail.governingMax")}</span>
                      <span className="val">
                        {t("common.years", { years: result.governingMaxYears })}
                      </span>
                    </div>
                    <div className="rail-row">
                      <span>{t("home.rail.fraction")}</span>
                      <span className="val">
                        {result.fraction === 1 / 3
                          ? t("home.rail.bond")
                          : t("home.rail.bail")}
                      </span>
                    </div>
                    <div className="rail-row">
                      <span>{t("home.rail.threshold")}</span>
                      <span className="val">
                        {t("common.days", { days: num(result.governingThresholdDays) })}
                      </span>
                    </div>
                    <div className="rail-row">
                      <span>{t("home.rail.delayExcluded")}</span>
                      <span className="val">
                        {t("common.days", { days: num(result.accusedDelayDays) })}
                      </span>
                    </div>
                    <div className="rail-row">
                      <span>{t("home.rail.effective")}</span>
                      <span className="val">
                        {t("common.days", { days: num(result.daysDetainedEffective) })}
                      </span>
                    </div>
                    <div className="rail-row">
                      <span>{t("home.rail.eligibilityDate")}</span>
                      <span className="val">{formatDateEn(result.eligibilityDate)}</span>
                    </div>
                    <div className="rail-row">
                      <span>{t("home.rail.overLimit")}</span>
                      <span className="val">{num(result.daysOverLimit)}</span>
                    </div>
                    <div className="rail-row rail-total">
                      <span>{t("home.rail.status")}</span>
                      <span className="val">{meta ? t(meta.plain) : ""}</span>
                    </div>
                    <p className="rail-note">{t("home.rail.note")}</p>
                  </>
                ) : (
                  <p className="rail-note">{t("home.rail.empty")}</p>
                )}
              </div>

              <div className="rail-block">
                <p className="rail-title">{t("home.rail.stateTitle")}</p>
                {!state && (
                  <p className="rail-note">{t("home.rail.stateEmpty")}</p>
                )}
                {state && stateLoading && (
                  <p className="rail-note">{t("home.rail.stateLoading")}</p>
                )}
                {state && !stateLoading && stateRecord && (
                  <>
                    {stateRecord.status === "ok" && stateRecord.row ? (
                      <>
                        <div className="rail-row">
                          <span>
                            {t("home.rail.undertrials", {
                              period: stateRecord.dataset.period,
                            })}
                          </span>
                          <span className="val">{num(stateRecord.row.undertrials)}</span>
                        </div>
                        <div className="rail-row">
                          <span>{t("home.rail.capacity")}</span>
                          <span className="val">{num(stateRecord.row.capacity)}</span>
                        </div>
                        <div className="rail-row">
                          <span>{t("home.rail.occupancy")}</span>
                          <span className="val">
                            {stateRecord.row.occupancyPct !== null
                              ? `${stateRecord.row.occupancyPct.toFixed(1)}%`
                              : "—"}
                          </span>
                        </div>
                        <div className="rail-row">
                          <span>{t("home.rail.share")}</span>
                          <span className="val">
                            {stateRecord.estimate.stateShareOfNationalPct !== null
                              ? `${stateRecord.estimate.stateShareOfNationalPct}%`
                              : "—"}
                          </span>
                        </div>
                        <p className="rail-note">
                          <RichText
                            template={t("home.rail.stateNote", {
                              period: stateRecord.dataset.period,
                            })}
                            values={{
                              link: (
                                <a
                                  href={stateRecord.dataset.sourceUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  {t("home.rail.stateLink")}
                                </a>
                              ),
                            }}
                          />
                        </p>
                      </>
                    ) : (
                      <p className="rail-note">{t(stateMessageKey)}</p>
                    )}
                  </>
                )}
              </div>

              <div className="rail-block">
                <p className="rail-title">{t("home.rail.dlsaTitle")}</p>
                {!state || !district.trim() ? (
                  <p className="rail-note">{t("home.rail.dlsaEmpty")}</p>
                ) : dlsaLoading ? (
                  <p className="rail-note">{t("home.rail.dlsaLoading")}</p>
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
                          <span className="source-tag">{t("common.sourced")}</span>{" "}
                          <a href={m.sourceUrl} target="_blank" rel="noreferrer">
                            {t("common.nalsaPage")}
                          </a>{" "}
                          {t("common.accessedInline", { date: m.accessedOn })}
                        </p>
                      </div>
                    ))}
                    <p className="rail-note">
                      <a href="/dlsa">{t("home.rail.openDlsa")}</a>
                    </p>
                  </>
                ) : (
                  <p className="rail-note">{t("home.rail.dlsaFallback")}</p>
                )}
              </div>

              <div className="rail-block">
                <p className="rail-title">{t("home.rail.aidTitle")}</p>
                <p className="rail-note">{t("home.rail.aidNote")}</p>
                <p className="rail-note">
                  <a href="/legal-aid">{t("home.rail.aidLink")}</a> ·{" "}
                  <a href="tel:15100">15100</a>
                </p>
              </div>
            </aside>
          </div>
        </div>
      </div>

      <div className="print-only" lang="en">
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

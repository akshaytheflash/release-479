"use client";

import { useEffect, useState } from "react";
import { BNS_SECTIONS } from "@/lib/bns";
import { useI18n } from "@/components/I18nProvider";
import RichText from "@/components/RichText";
import type { MessageKey } from "@/lib/i18n/messages/en";

interface Prisoner {
  id: string;
  prisoner_name: string;
  case_no: string;
  court: string;
  sectionIds: string[];
  detention_start: string;
  first_time: number;
  pending_other: number;
  status: string;
  is_sample: number;
  eligibility: {
    status: string;
    eligibilityDate: string | null;
    daysDetainedEffective: number;
    daysOverLimit: number;
  } | null;
}

const CSV_HEADER =
  "prisoner_name,case_no,court,section_ids,detention_start,first_time,pending_other,accused_delay_days,contact_note";

const STATUS_LABEL: Record<string, MessageKey> = {
  ELIGIBLE_NOW: "status.ELIGIBLE_NOW.stamp",
  CEILING_BREACHED: "status.CEILING_BREACHED.stamp",
  NOT_YET: "status.NOT_YET.stamp",
  BLOCKED_PENDING_OTHER_CASES: "status.BLOCKED_PENDING_OTHER_CASES.stamp",
  EXCLUDED_DEATH_LIFE: "status.EXCLUDED_DEATH_LIFE.stamp",
  UNKNOWN_SECTION: "status.UNKNOWN_SECTION.stamp",
};

export default function Dashboard() {
  const { t } = useI18n();
  const [rows, setRows] = useState<Prisoner[]>([]);
  const [csv, setCsv] = useState("");
  const [importResult, setImportResult] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const res = await fetch("/api/prisoners");
    const json = await res.json();
    setRows(json.prisoners);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  // The import route reports fixed diagnostic strings. Map them to keys so the
  // register reads in the visitor's language; unknown details fall back as-is.
  const importMessage = (message: string): string => {
    if (message === "Missing prisoner_name / case_no / detention_start / section_ids.") {
      return t("dashboard.importMissing");
    }
    if (message === "detention_start must be YYYY-MM-DD.") {
      return t("dashboard.importBadDate");
    }
    const unsupported = /^Unsupported section id\(s\): (.*)\. See \/sources for supported ids\.$/.exec(
      message
    );
    if (unsupported) {
      return t("dashboard.importUnsupported", { ids: unsupported[1] });
    }
    const imported = /^Imported: (.*) \((.*)\)\.$/.exec(message);
    if (imported) {
      return t("dashboard.importedRow", { name: imported[1], caseNo: imported[2] });
    }
    return message;
  };

  const importCsv = async () => {
    const res = await fetch("/api/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ csv }),
    });
    const json = await res.json();
    const lines = [
      t("dashboard.importSummary", {
        imported: json.imported ?? 0,
        total: json.total ?? 0,
      }),
      ...(json.results ?? []).map(
        (r: { line: number; ok: boolean; message: string }) =>
          t("dashboard.importLine", {
            line: r.line,
            result: r.ok ? t("dashboard.importOk") : t("dashboard.importFailed"),
            message: importMessage(r.message),
          })
      ),
    ];
    if (json.error) {
      lines.push(t("dashboard.importError", { error: json.error }));
    }
    setImportResult(lines.join("\n"));
    load();
  };

  const importSample = async () => {
    const res = await fetch("/api/sample", { method: "POST" });
    const json = await res.json();
    setMsg(
      t("dashboard.sampleImported", {
        imported: json.imported,
        warning: t("dashboard.demoWarning"),
      })
    );
    load();
  };

  const clearSample = async () => {
    const res = await fetch("/api/sample", { method: "DELETE" });
    const json = await res.json();
    setMsg(t("dashboard.sampleCleared", { deleted: json.deleted }));
    load();
  };

  const setStatus = async (id: string, status: string) => {
    await fetch("/api/prisoners", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    load();
  };

  const remove = async (id: string) => {
    await fetch(`/api/prisoners?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    load();
  };

  const overDetained = rows.filter(
    (r) =>
      r.eligibility?.status === "ELIGIBLE_NOW" ||
      r.eligibility?.status === "CEILING_BREACHED"
  );
  const blocked = rows.filter(
    (r) => r.eligibility?.status === "BLOCKED_PENDING_OTHER_CASES"
  );
  const realRows = rows.filter((r) => r.is_sample === 0);
  const demoRows = rows.length - realRows.length;

  return (
    <div className="screen-only">
      <div className="shell">
        <header className="page-head">
          <p className="page-kicker">{t("dashboard.kicker")}</p>
          <h1>{t("dashboard.title")}</h1>
          <p className="lede">{t("dashboard.lede")}</p>
        </header>

        <div className="case-layout" style={{ paddingTop: 28 }}>
          <div className="document">
            <div className="register-head">
              <div className="register-counts">
                <RichText
                  template={t("dashboard.realRows")}
                  values={{ count: <strong>{realRows.length}</strong> }}
                />
                <RichText
                  template={t("dashboard.demoRows")}
                  values={{ count: <strong>{demoRows}</strong> }}
                />
                <RichText
                  template={t("dashboard.overLimit")}
                  values={{ count: <strong>{overDetained.length}</strong> }}
                />
                <RichText
                  template={t("dashboard.blocked")}
                  values={{ count: <strong>{blocked.length}</strong> }}
                />
              </div>
            </div>

            <section className="folio" style={{ paddingTop: 0 }}>
              <div className="folio-head">
                <span className="folio-mark">{t("dashboard.importMark")}</span>
                <h2>{t("dashboard.importTitle")}</h2>
              </div>
              <details>
                <summary className="small" style={{ cursor: "pointer" }}>
                  {t("dashboard.importShow")}
                </summary>
                <p className="small" style={{ marginTop: 12 }}>
                  <RichText
                    template={t("dashboard.importHelp")}
                    values={{
                      header: <code>{CSV_HEADER}</code>,
                      sectionIds: <code>section_ids</code>,
                      example: <code>bns303;bns117</code>,
                      start: <code>detention_start</code>,
                    }}
                  />
                </p>
                <div className="field" style={{ marginTop: 10 }}>
                  <label htmlFor="csv" className="sr-only">
                    {t("dashboard.csvRows")}
                  </label>
                  <textarea
                    id="csv"
                    rows={7}
                    dir="ltr"
                    value={csv}
                    onChange={(e) => setCsv(e.target.value)}
                    placeholder={`${CSV_HEADER}\nMeena Rani,DC 88/2025,District Court,bns303,2024-02-01,1,0,0,phone on file`}
                  />
                </div>
                <div className="btn-row">
                  <button className="btn" onClick={importCsv}>
                    {t("dashboard.importCsv")}
                  </button>
                  <button className="btn secondary" onClick={importSample}>
                    {t("dashboard.insertSample")}
                  </button>
                  <button className="btn secondary" onClick={clearSample}>
                    {t("dashboard.clearDemo")}
                  </button>
                </div>
                <p className="small" style={{ marginTop: 10 }}>
                  {t("dashboard.supportedIds", {
                    ids: BNS_SECTIONS.map((s) => s.id).join(", "),
                  })}
                </p>
                {importResult && (
                  <pre className="verbatim" dir="ltr" style={{ marginTop: 12 }}>
                    {importResult}
                  </pre>
                )}
                {msg && <div className="notice warn">{msg}</div>}
              </details>
            </section>

            <section className="folio">
              <div className="folio-head">
                <span className="folio-mark">{t("dashboard.registerMark")}</span>
                <h2>{t("dashboard.overTitle", { count: overDetained.length })}</h2>
              </div>

              {loading ? (
                <p className="small">{t("common.readingRegister")}</p>
              ) : rows.length === 0 ? (
                <div className="empty-state">
                  <h3>{t("dashboard.emptyTitle")}</h3>
                  <p>{t("dashboard.emptyBody")}</p>
                  <div className="btn-row">
                    <button className="btn secondary" onClick={importSample}>
                      {t("dashboard.insertSample")}
                    </button>
                  </div>
                </div>
              ) : overDetained.length === 0 ? (
                <p className="small">{t("dashboard.noOver")}</p>
              ) : (
                <div className="table-scroll">
                  <table className="register">
                    <thead>
                      <tr>
                        <th>{t("dashboard.colPrisoner")}</th>
                        <th>{t("dashboard.colCase")}</th>
                        <th>{t("dashboard.colReleaseDate")}</th>
                        <th className="num">{t("dashboard.colDaysIn")}</th>
                        <th className="num">{t("dashboard.colDaysOver")}</th>
                        <th>{t("dashboard.colStatus")}</th>
                        <th>{t("dashboard.colAction")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {overDetained.map((r) => (
                        <tr key={r.id}>
                          <td>
                            <span className="row-strong">{r.prisoner_name}</span>
                            {r.is_sample === 1 && (
                              <span className="badge-demo">{t("dashboard.demoBadge")}</span>
                            )}
                            <br />
                            <span className="small">{r.court}</span>
                          </td>
                          <td className="mono">{r.case_no}</td>
                          <td className="mono">{r.eligibility?.eligibilityDate ?? "—"}</td>
                          <td className="num">{r.eligibility?.daysDetainedEffective ?? "—"}</td>
                          <td className="num alert">{r.eligibility?.daysOverLimit ?? "—"}</td>
                          <td>
                            <span className="small">
                              {STATUS_LABEL[r.eligibility?.status ?? ""]
                                ? t(STATUS_LABEL[r.eligibility?.status ?? ""])
                                : r.eligibility?.status ?? "—"}
                            </span>
                          </td>
                          <td>
                            <select
                              className="status-select"
                              value={r.status}
                              onChange={(e) => setStatus(r.id, e.target.value)}
                              aria-label={t("dashboard.statusFor", {
                                name: r.prisoner_name,
                              })}
                            >
                              <option value="SCREENED">
                                {t("dashboard.statusScreened")}
                              </option>
                              <option value="APPLICATION_FILED">
                                {t("dashboard.statusFiled")}
                              </option>
                              <option value="RELEASED">
                                {t("dashboard.statusReleased")}
                              </option>
                            </select>{" "}
                            <button className="link-quiet" onClick={() => remove(r.id)}>
                              {t("common.delete")}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {rows.length > 0 && (
              <section className="folio">
                <div className="folio-head">
                  <span className="folio-mark">{t("dashboard.allMark")}</span>
                  <h2>{t("dashboard.allTitle", { count: rows.length })}</h2>
                </div>
                <div className="table-scroll">
                  <table className="register">
                    <thead>
                      <tr>
                        <th>{t("dashboard.colPrisoner")}</th>
                        <th>{t("dashboard.colCase")}</th>
                        <th>{t("dashboard.colCharges")}</th>
                        <th>{t("dashboard.colStart")}</th>
                        <th>{t("dashboard.colFraction")}</th>
                        <th>{t("dashboard.colComputation")}</th>
                        <th>{t("dashboard.colStatus")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r) => {
                        const statusKey = STATUS_LABEL[r.eligibility?.status ?? ""];
                        const statusLabel = statusKey
                          ? t(statusKey)
                          : r.eligibility?.status ?? t("common.error");
                        return (
                          <tr key={r.id}>
                            <td>
                              <span className="row-strong">{r.prisoner_name}</span>
                              {r.is_sample === 1 && (
                                <span className="badge-demo">{t("dashboard.demoBadge")}</span>
                              )}
                            </td>
                            <td className="mono">{r.case_no}</td>
                            <td className="mono">{r.sectionIds.join(", ") || "—"}</td>
                            <td className="mono">{r.detention_start}</td>
                            <td>
                              {r.first_time === 1
                                ? t("dashboard.fractionBond")
                                : t("dashboard.fractionBail")}
                            </td>
                            <td className="small">
                              {r.eligibility?.eligibilityDate
                                ? t("dashboard.computationWithDate", {
                                    status: statusLabel,
                                    date: r.eligibility.eligibilityDate,
                                  })
                                : statusLabel}
                            </td>
                            <td>
                              <select
                                className="status-select"
                                value={r.status}
                                onChange={(e) => setStatus(r.id, e.target.value)}
                                aria-label={t("dashboard.statusFor", {
                                  name: r.prisoner_name,
                                })}
                              >
                                <option value="SCREENED">
                                  {t("dashboard.statusScreened")}
                                </option>
                                <option value="APPLICATION_FILED">
                                  {t("dashboard.statusFiled")}
                                </option>
                                <option value="RELEASED">
                                  {t("dashboard.statusReleased")}
                                </option>
                              </select>{" "}
                              <button className="link-quiet" onClick={() => remove(r.id)}>
                                {t("common.delete")}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </div>

          <aside className="rail" aria-label={t("dashboard.railLabel")}>
            <div className="rail-block">
              <p className="rail-title">{t("dashboard.filingLoop")}</p>
              <ol className="route-list" style={{ marginTop: 4 }}>
                <li>
                  <span className="route-step">{t("dashboard.stepScreen")}</span>
                  <span className="route-detail">{t("dashboard.stepScreenDetail")}</span>
                </li>
                <li>
                  <span className="route-step">{t("dashboard.stepDraft")}</span>
                  <span className="route-detail">{t("dashboard.stepDraftDetail")}</span>
                </li>
                <li>
                  <span className="route-step">{t("dashboard.stepFile")}</span>
                  <span className="route-detail">{t("dashboard.stepFileDetail")}</span>
                </li>
                <li>
                  <span className="route-step">{t("dashboard.stepVerify")}</span>
                  <span className="route-detail">{t("dashboard.stepVerifyDetail")}</span>
                </li>
              </ol>
            </div>
            <div className="rail-block">
              <p className="rail-title">{t("dashboard.countingRule")}</p>
              <p className="rail-note">{t("dashboard.countingNote")}</p>
              <p className="rail-note">
                <a href="/metrics">{t("dashboard.openMetrics")}</a>
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

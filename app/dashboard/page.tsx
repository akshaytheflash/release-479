"use client";

import { useEffect, useState } from "react";
import { BNS_SECTIONS } from "@/lib/bns";

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

const STATUS_LABEL: Record<string, string> = {
  ELIGIBLE_NOW: "Eligible now",
  CEILING_BREACHED: "Ceiling breached",
  NOT_YET: "Not yet",
  BLOCKED_PENDING_OTHER_CASES: "Blocked by s.479(2)",
  EXCLUDED_DEATH_LIFE: "Outside s.479",
  UNKNOWN_SECTION: "Check the charge",
};

export default function Dashboard() {
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

  const importCsv = async () => {
    const res = await fetch("/api/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ csv }),
    });
    const json = await res.json();
    setImportResult(
      `Imported ${json.imported ?? 0} of ${json.total ?? 0} rows.\n` +
        (json.results ?? [])
          .map(
            (r: { line: number; ok: boolean; message: string }) =>
              `Line ${r.line}: ${r.ok ? "ok" : "failed"}: ${r.message}`
          )
          .join("\n") +
        (json.error ? `\nError: ${json.error}` : "")
    );
    load();
  };

  const importSample = async () => {
    const res = await fetch("/api/sample", { method: "POST" });
    const json = await res.json();
    setMsg(`Sample import: ${json.imported} rows. ${json.warning}`);
    load();
  };

  const clearSample = async () => {
    const res = await fetch("/api/sample", { method: "DELETE" });
    const json = await res.json();
    setMsg(`Cleared ${json.deleted} demo sample rows.`);
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
          <p className="page-kicker">District Legal Services Authority</p>
          <h1>DLSA register</h1>
          <p className="lede">
            Every screened undertrial against the court-computed 1/3 or 1/2
            date. The register starts empty. Rows enter only through a jail or
            DLSA CSV import, or through the clearly badged demo sample. Demo rows
            never count in metrics.
          </p>
        </header>

        <div className="case-layout" style={{ paddingTop: 28 }}>
          <div className="document">
            <div className="register-head">
              <div className="register-counts">
                <span>
                  <strong>{realRows.length}</strong> real rows
                </span>
                <span>
                  <strong>{demoRows}</strong> demo rows
                </span>
                <span>
                  <strong>{overDetained.length}</strong> over the limit
                </span>
                <span>
                  <strong>{blocked.length}</strong> blocked by s.479(2)
                </span>
              </div>
            </div>

            <section className="folio" style={{ paddingTop: 0 }}>
              <div className="folio-head">
                <span className="folio-mark">Import</span>
                <h2>Jail or DLSA CSV</h2>
              </div>
              <details>
                <summary className="small" style={{ cursor: "pointer" }}>
                  Show the import box and column format
                </summary>
                <p className="small" style={{ marginTop: 12 }}>
                  Required header: <code>{CSV_HEADER}</code>.{" "}
                  <code>section_ids</code> is semicolon-separated supported ids
                  (e.g. <code>bns303;bns117</code>). <code>detention_start</code>{" "}
                  is YYYY-MM-DD; flags are 1/0. Quoted fields may contain commas.
                </p>
                <div className="field" style={{ marginTop: 10 }}>
                  <label htmlFor="csv" className="sr-only">
                    CSV rows
                  </label>
                  <textarea
                    id="csv"
                    rows={7}
                    value={csv}
                    onChange={(e) => setCsv(e.target.value)}
                    placeholder={`${CSV_HEADER}\nMeena Rani,DC 88/2025,District Court,bns303,2024-02-01,1,0,0,phone on file`}
                  />
                </div>
                <div className="btn-row">
                  <button className="btn" onClick={importCsv}>
                    Import CSV
                  </button>
                  <button className="btn secondary" onClick={importSample}>
                    Insert demo sample rows
                  </button>
                  <button className="btn secondary" onClick={clearSample}>
                    Clear demo rows
                  </button>
                </div>
                <p className="small" style={{ marginTop: 10 }}>
                  Supported section ids:{" "}
                  {BNS_SECTIONS.map((s) => s.id).join(", ")}.
                </p>
                {importResult && <pre className="verbatim" style={{ marginTop: 12 }}>{importResult}</pre>}
                {msg && <div className="notice warn">{msg}</div>}
              </details>
            </section>

            <section className="folio">
              <div className="folio-head">
                <span className="folio-mark">Register</span>
                <h2>Over-detained ({overDetained.length})</h2>
              </div>

              {loading ? (
                <p className="small">Reading the register…</p>
              ) : rows.length === 0 ? (
                <div className="empty-state">
                  <h3>No prisoners screened yet</h3>
                  <p>
                    Import the jail or DLSA undertrial list as CSV, or insert the
                    clearly labelled demo rows to preview the over-detained
                    register. The empty state is deliberate: this tool does not
                    ship with prisoner records.
                  </p>
                  <div className="btn-row">
                    <button className="btn secondary" onClick={importSample}>
                      Insert demo sample rows
                    </button>
                  </div>
                </div>
              ) : overDetained.length === 0 ? (
                <p className="small">
                  No row is over the statutory limit today. The full register is
                  below.
                </p>
              ) : (
                <div className="table-scroll">
                  <table className="register">
                    <thead>
                      <tr>
                        <th>Prisoner</th>
                        <th>Case</th>
                        <th>Release date</th>
                        <th className="num">Days in</th>
                        <th className="num">Days over</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {overDetained.map((r) => (
                        <tr key={r.id}>
                          <td>
                            <span className="row-strong">{r.prisoner_name}</span>
                            {r.is_sample === 1 && (
                              <span className="badge-demo">demo</span>
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
                              {STATUS_LABEL[r.eligibility?.status ?? ""] ??
                                r.eligibility?.status ??
                                "—"}
                            </span>
                          </td>
                          <td>
                            <select
                              className="status-select"
                              value={r.status}
                              onChange={(e) => setStatus(r.id, e.target.value)}
                              aria-label={`Status for ${r.prisoner_name}`}
                            >
                              <option>SCREENED</option>
                              <option>APPLICATION_FILED</option>
                              <option>RELEASED</option>
                            </select>{" "}
                            <button
                              className="link-quiet"
                              onClick={() => remove(r.id)}
                            >
                              Delete
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
                  <span className="folio-mark">All rows</span>
                  <h2>Every screened undertrial ({rows.length})</h2>
                </div>
                <div className="table-scroll">
                  <table className="register">
                    <thead>
                      <tr>
                        <th>Prisoner</th>
                        <th>Case</th>
                        <th>Charges</th>
                        <th>Start</th>
                        <th>Fraction</th>
                        <th>Computation</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r) => (
                        <tr key={r.id}>
                          <td>
                            <span className="row-strong">{r.prisoner_name}</span>
                            {r.is_sample === 1 && (
                              <span className="badge-demo">demo</span>
                            )}
                          </td>
                          <td className="mono">{r.case_no}</td>
                          <td className="mono">{r.sectionIds.join(", ") || "—"}</td>
                          <td className="mono">{r.detention_start}</td>
                          <td>{r.first_time === 1 ? "1/3 on bond" : "1/2 on bail"}</td>
                          <td className="small">
                            {STATUS_LABEL[r.eligibility?.status ?? ""] ??
                              r.eligibility?.status ??
                              "error"}
                            {r.eligibility?.eligibilityDate
                              ? `, ${r.eligibility.eligibilityDate}`
                              : ""}
                          </td>
                          <td>
                            <select
                              className="status-select"
                              value={r.status}
                              onChange={(e) => setStatus(r.id, e.target.value)}
                              aria-label={`Status for ${r.prisoner_name}`}
                            >
                              <option>SCREENED</option>
                              <option>APPLICATION_FILED</option>
                              <option>RELEASED</option>
                            </select>{" "}
                            <button
                              className="link-quiet"
                              onClick={() => remove(r.id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </div>

          <aside className="rail" aria-label="Register notes">
            <div className="rail-block">
              <p className="rail-title">Filing loop</p>
              <ol className="route-list" style={{ marginTop: 4 }}>
                <li>
                  <span className="route-step">Screen</span>
                  <span className="route-detail">
                    Import the jail register, then check the charge and custody
                    date against the case record.
                  </span>
                </li>
                <li>
                  <span className="route-step">Draft</span>
                  <span className="route-detail">
                    Open a row in the case file, prepare the A4 application, and
                    have the DLSA panel advocate review it.
                  </span>
                </li>
                <li>
                  <span className="route-step">File</span>
                  <span className="route-detail">
                    File with the court and the Superintendent under s.479(3).
                    Mark APPLICATION_FILED only after it is actually filed.
                  </span>
                </li>
                <li>
                  <span className="route-step">Verify</span>
                  <span className="route-detail">
                    Mark RELEASED only on a verified court order or jail release
                    memo.
                  </span>
                </li>
              </ol>
            </div>
            <div className="rail-block">
              <p className="rail-title">Counting rule</p>
              <p className="rail-note">
                Metrics count real rows only. Demo rows are badged and excluded.
                One row is one screened undertrial. Never add demo rows to the
                four submission numbers.
              </p>
              <p className="rail-note">
                <a href="/metrics">Open the metrics register</a>
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

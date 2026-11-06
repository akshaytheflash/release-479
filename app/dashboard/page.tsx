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

export default function Dashboard() {
  const [rows, setRows] = useState<Prisoner[]>([]);
  const [csv, setCsv] = useState("");
  const [importResult, setImportResult] = useState("");
  const [msg, setMsg] = useState("");

  const load = async () => {
    const res = await fetch("/api/prisoners");
    const json = await res.json();
    setRows(json.prisoners);
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
        (json.results ?? []).map((r: { line: number; ok: boolean; message: string }) => `Line ${r.line}: ${r.ok ? "✓" : "✗"} ${r.message}`).join("\n") +
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
    await fetch(`/api/prisoners?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    load();
  };

  const overDetained = rows.filter(
    (r) => r.eligibility?.status === "ELIGIBLE_NOW" || r.eligibility?.status === "CEILING_BREACHED"
  );
  const blocked = rows.filter((r) => r.eligibility?.status === "BLOCKED_PENDING_OTHER_CASES");

  return (
    <div>
      <h1>DLSA dashboard — over-detained undertrials</h1>
      <p className="muted">
        Screened prisoners vs their court-computed 1/3 / 1/2 dates.{" "}
        <strong>{rows.filter((r) => r.is_sample === 0).length} real</strong> +{" "}
        {rows.filter((r) => r.is_sample === 1).length} demo-sample rows ·{" "}
        <strong style={{ color: "#b3261e" }}>{overDetained.length} over the limit</strong> ·{" "}
        {blocked.length} blocked (s.479(2) pending other cases). Dashboard starts
        empty — import official jail/DLSA records only.
      </p>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>Import via DLSA / jail CSV</h2>
        <p className="muted" style={{ fontSize: 13 }}>
          Required header: <code>{CSV_HEADER}</code>
          <br />
          <code>section_ids</code> is semicolon-separated supported ids (e.g.{" "}
          <code>bns303;bns117</code>; supported ids: {BNS_SECTIONS.map((s) => s.id).join(", ")}).{" "}
          <code>detention_start</code> is YYYY-MM-DD; flags are 1/0. Quoted fields may contain commas.
        </p>
        <textarea rows={6} value={csv} onChange={(e) => setCsv(e.target.value)} placeholder={`${CSV_HEADER}\nMeena Rani,DC 88/2025,District Court,bns303,2024-02-01,1,0,0,phone on file`} />
        <div style={{ marginTop: 12, display: "flex", gap: 12 }}>
          <button onClick={importCsv}>Import CSV</button>
          <button className="secondary" onClick={importSample}>
            Insert demo sample rows (clearly badged)
          </button>
          <button className="secondary" onClick={clearSample}>
            Clear demo rows
          </button>
        </div>
        {importResult && <pre className="draft" style={{ marginTop: 12 }}>{importResult}</pre>}
        {msg && <p className="warn" style={{ marginTop: 12 }}>{msg}</p>}
      </div>

      <div className="card">
        {rows.length === 0 ? (
          <div className="empty">
            <p style={{ fontSize: 18, fontWeight: 800 }}>No prisoners screened yet</p>
            <p>
              Import the jail / DLSA undertrial list as CSV above, or insert the
              clearly-labelled demo sample rows to preview the over-detained
              rendering.
            </p>
          </div>
        ) : (
          <>
            <h2 style={{ marginTop: 0 }}>Over-detained ({overDetained.length})</h2>
            <table>
              <thead>
                <tr>
                  <th>Prisoner</th>
                  <th>Case</th>
                  <th>Eligibility date</th>
                  <th>Days detained (eff.)</th>
                  <th>Days over limit</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {overDetained.map((r) => (
                  <tr key={r.id}>
                    <td>
                      {r.prisoner_name}{" "}
                      {r.is_sample === 1 && <span className="badge amber">DEMO SAMPLE</span>}
                      <br />
                      <span className="muted">{r.court}</span>
                    </td>
                    <td>{r.case_no}</td>
                    <td>{r.eligibility?.eligibilityDate}</td>
                    <td>{r.eligibility?.daysDetainedEffective}</td>
                    <td style={{ color: "#b3261e", fontWeight: 800 }}>{r.eligibility?.daysOverLimit}</td>
                    <td>{r.status}</td>
                    <td>
                      <select value={r.status} onChange={(e) => setStatus(r.id, e.target.value)}>
                        <option>SCREENED</option>
                        <option>APPLICATION_FILED</option>
                        <option>RELEASED</option>
                      </select>{" "}
                      <button className="secondary" onClick={() => remove(r.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h2>All screened ({rows.length})</h2>
            <table>
              <thead>
                <tr>
                  <th>Prisoner</th>
                  <th>Case</th>
                  <th>Charges</th>
                  <th>Detention start</th>
                  <th>1st-time?</th>
                  <th>Eligibility status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td>
                      {r.prisoner_name}{" "}
                      {r.is_sample === 1 && <span className="badge amber">DEMO SAMPLE</span>}
                    </td>
                    <td>{r.case_no}</td>
                    <td>{r.sectionIds.join(", ") || "—"}</td>
                    <td>{r.detention_start}</td>
                    <td>{r.first_time === 1 ? "Yes (1/3)" : "No (1/2)"}</td>
                    <td>{r.eligibility?.status ?? "error"}{r.eligibility?.eligibilityDate ? ` · ${r.eligibility.eligibilityDate}` : ""}</td>
                    <td>
                      <select value={r.status} onChange={(e) => setStatus(r.id, e.target.value)}>
                        <option>SCREENED</option>
                        <option>APPLICATION_FILED</option>
                        <option>RELEASED</option>
                      </select>{" "}
                      <button className="secondary" onClick={() => remove(r.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
}

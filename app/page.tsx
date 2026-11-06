"use client";

import { useMemo, useState } from "react";
import { BNS_SECTIONS } from "@/lib/bns";

interface Eligibility {
  status: string;
  fraction: number;
  releaseMode: string;
  eligibilityDate: string | null;
  daysDetainedEffective: number;
  daysOverLimit: number;
  governingMaxYears: number;
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

const STATUS_BADGE: Record<string, { cls: string; text: string }> = {
  ELIGIBLE_NOW: { cls: "red", text: "ELIGIBLE NOW — over the 1/3 / 1/2 limit" },
  CEILING_BREACHED: { cls: "red", text: "CEILING BREACHED — detained beyond maximum sentence" },
  NOT_YET: { cls: "grey", text: "Not yet eligible" },
  BLOCKED_PENDING_OTHER_CASES: { cls: "amber", text: "BLOCKED — s.479(2): other cases pending" },
  EXCLUDED_DEATH_LIFE: { cls: "amber", text: "EXCLUDED — death/life specified, s.479 does not apply" },
  UNKNOWN_SECTION: { cls: "grey", text: "Unsupported section" },
};

export default function Home() {
  const [sectionIds, setSectionIds] = useState<string[]>([]);
  // Default: 500 days ago → theft-first-time shows ELIGIBLE NOW (365d threshold) on any demo day.
  const [detentionStart, setDetentionStart] = useState(() =>
    new Date(Date.now() - 500 * 86400000).toISOString().slice(0, 10)
  );
  const [firstTime, setFirstTime] = useState(true);
  const [pendingOther, setPendingOther] = useState(false);
  const [delayDays, setDelayDays] = useState(0);
  const [prisonerName, setPrisonerName] = useState("");
  const [caseNo, setCaseNo] = useState("");
  const [court, setCourt] = useState("");
  const [district, setDistrict] = useState("");
  const [state, setState] = useState("");
  const [result, setResult] = useState<Eligibility | null>(null);
  const [draft, setDraft] = useState<string>("");
  const [draftMeta, setDraftMeta] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [drafting, setDrafting] = useState(false);
  const [error, setError] = useState("");

  const toggleSection = (id: string) =>
    setSectionIds((ids) =>
      ids.includes(id) ? ids.filter((s) => s !== id) : [...ids, id]
    );

  const compute = async () => {
    if (!sectionIds.length) return setError("Select at least one charged section.");
    setLoading(true);
    setError("");
    setDraft("");
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
      if (!res.ok) return setError(json.error ?? "Computation failed.");
      setResult(json);
      // Pre-fill draft identity from last result for demo convenience.
    } finally {
      setLoading(false);
    }
  };

  const makeDraft = async () => {
    if (!prisonerName || !caseNo) return setError("Enter prisoner name and case no. to draft.");
    if (!sectionIds.length) return setError("Select at least one charged section.");
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
      if (!res.ok) return setError(json.error ?? "Draft failed.");
      setDraft(json.draft);
      setDraftMeta(
        `Draft source: ${json.draftSource} (model ${json.model}, attempts ${json.attempts}). ${json.modelStatusNote}`
      );
    } finally {
      setDrafting(false);
    }
  };

  const badge = useMemo(
    () => (result ? STATUS_BADGE[result.status] ?? { cls: "grey", text: result.status } : null),
    [result]
  );

  return (
    <div>
      <h1>BNSS Section 479 release eligibility engine</h1>
      <p className="muted">
        BNSS 479 mandates release at <strong>1/3 of the maximum sentence for
        first-time offenders (1/2 otherwise)</strong> — but nothing computes the
        dates. Enter the charge + detention start below; the engine resolves the
        statutory maximum, computes the eligibility date, and drafts the release
        application (English + Hindi).
      </p>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>1 · Charge &amp; detention inputs</h2>
        <label>
          Charged section(s) — supported BNS entries only (see{" "}
          <a className="ext" href="/sources">Sources</a> for verbatim punishment
          + India Code links)
        </label>
        <div className="checks">
          {BNS_SECTIONS.map((s) => (
            <label key={s.id}>
              <input
                type="checkbox"
                checked={sectionIds.includes(s.id)}
                onChange={() => toggleSection(s.id)}
              />
              <span>
                <strong>{s.label}</strong> — {s.title} (max {s.maxSentenceLabel})
                {s.note.startsWith("⚠") ? " ⚠" : ""}
              </span>
            </label>
          ))}
        </div>
        <div className="grid2">
          <div>
            <label htmlFor="start">Detention start date (custody date)</label>
            <input id="start" type="date" value={detentionStart} onChange={(e) => setDetentionStart(e.target.value)} />
          </div>
          <div>
            <label htmlFor="delay">Delay caused by accused (days, excluded per Explanation)</label>
            <input id="delay" type="number" min={0} value={delayDays} onChange={(e) => setDelayDays(Number(e.target.value))} />
          </div>
        </div>
        <div className="checks">
          <label>
            <input type="checkbox" checked={firstTime} onChange={(e) => setFirstTime(e.target.checked)} />
            <span>First-time offender — never convicted before (→ <strong>1/3, on bond</strong>). Unchecked → 1/2, on bail.</span>
          </label>
          <label>
            <input type="checkbox" checked={pendingOther} onChange={(e) => setPendingOther(e.target.checked)} />
            <span>Other cases pending against this person (→ s.479(2): <strong>shall not be released</strong>)</span>
          </label>
        </div>
        <div style={{ marginTop: 16 }}>
          <button onClick={compute} disabled={loading}>
            {loading ? "Computing…" : "Compute eligibility date"}
          </button>
        </div>
        {error && <p style={{ color: "#b3261e", fontWeight: 700 }}>{error}</p>}
      </div>

      {result && (
        <div className="card">
          <h2 style={{ marginTop: 0 }}>2 · Eligibility result</h2>
          {badge && <span className={`badge ${badge.cls}`}>{badge.text}</span>}
          <div className="grid2" style={{ marginTop: 12 }}>
            <div>
              <p>
                <strong>Governing maximum:</strong> {result.governingMaxYears} years →{" "}
                {result.fraction === 1 / 3 ? "1/3 (first-time, bond)" : "1/2 (bail)"}
              </p>
              <p>
                <strong>Eligibility date:</strong>{" "}
                {result.eligibilityDate ?? "—"} (detention start + threshold +
                accused-delay)
              </p>
            </div>
            <div>
              <p>
                <strong>Effective days detained:</strong> {result.daysDetainedEffective}
              </p>
              <p>
                <strong>Days over limit:</strong>{" "}
                <span style={{ color: result.daysOverLimit > 0 ? "#b3261e" : undefined, fontWeight: 800 }}>
                  {result.daysOverLimit}
                </span>
              </p>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Charge</th>
                <th>Max sentence</th>
                <th>1/3 or 1/2 threshold (days)</th>
                <th>Eligibility date</th>
              </tr>
            </thead>
            <tbody>
              {result.perSection.map((p, i) => (
                <tr key={i}>
                  <td>{p.label}</td>
                  <td>{p.maxSentenceLabel}</td>
                  <td>{p.thresholdDays}</td>
                  <td>{p.eligibilityDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="muted">Multiple charges: the latest date governs (every count must be satisfied).</p>
          {result.notes.map((n, i) => (
            <p key={i} className="muted" style={{ fontSize: 13 }}>• {n}</p>
          ))}
        </div>
      )}

      <div className="card">
        <h2 style={{ marginTop: 0 }}>3 · Draft release application (EN + HI)</h2>
        <p className="muted">
          Drafted by <strong>BharatCode</strong> (qwen-3.8-27b) when reachable; the
          API intermittently returns 500/503, so a deterministic template
          fallback guarantees the demo works offline. Overlay prints, signs,
          then verifies with DLSA/advocate.
        </p>
        <div className="grid2">
          <div>
            <label htmlFor="pn">Prisoner name</label>
            <input id="pn" type="text" value={prisonerName} onChange={(e) => setPrisonerName(e.target.value)} placeholder="Full name" />
          </div>
          <div>
            <label htmlFor="cn">Case no.</label>
            <input id="cn" type="text" value={caseNo} onChange={(e) => setCaseNo(e.target.value)} placeholder="e.g. SC 123/2024" />
          </div>
          <div>
            <label htmlFor="court">Court name</label>
            <input id="court" type="text" value={court} onChange={(e) => setCourt(e.target.value)} placeholder="e.g. Court of JMFC, ___" />
          </div>
          <div>
            <label htmlFor="dist">District / State</label>
            <input id="dist" type="text" value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="District" />
          </div>
        </div>
        <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
          <button className="green" onClick={makeDraft} disabled={drafting}>
            {drafting ? "Drafting…" : "Draft application"}
          </button>
          <button
            className="secondary"
            onClick={() => {
              const w = window.open("", "_blank");
              if (w) {
                w.document.write(`<pre>${draft.replace(/</g, "&lt;")}</pre>`);
                w.document.close();
                w.print();
              }
            }}
            disabled={!draft}
          >
            Print draft
          </button>
        </div>
        {draftMeta && <p className="muted">{draftMeta}</p>}
        {draft && <pre className="draft">{draft}</pre>}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { BNS_SECTIONS } from "@/lib/bns";
import { BNSS479_VERBATIM, BNSS479_SOURCE_URL, NCRB_2024, NJDG_DASHBOARD_URL, DATA_GOV_IN_SEARCH_URL } from "@/lib/bnss479";

export default function Sources() {
  const [health, setHealth] = useState<unknown>(null);
  useEffect(() => {
    fetch("/api/health").then((r) => r.json()).then(setHealth).catch(() => setHealth("probe failed"));
  }, []);

  return (
    <div>
      <h1>Sources — real law &amp; real scale</h1>
      <p className="muted">
        Every statute, sentence value, and statistic below is sourced from
        government material. India Code returns 403 to automated fetch; where
        noted, verbatim text was verified against a faithful mirror and must be
        reconciled with the Gazette / India Code PDF before filing. Nothing is
        invented; where live data is unavailable, this page says so plainly.
      </p>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>BNSS Section 479 — verbatim</h2>
        <p>
          Authority: <a className="ext" href={BNSS479_SOURCE_URL} target="_blank" rel="noreferrer">Bharatiya Nagarik Suraksha Sanhita, 2023 — India Code ({BNSS479_SOURCE_URL})</a>
          <br />
          <span className="muted">
            Verified text mirror: Indian Kanoon, “Section 479 in Bharatiya
            Nagarik Suraksha Sanhita, 2023” (indiankanoon.org/doc/87702491),
            fetched 2026-11-06.
          </span>
        </p>
        <div className="verbatim">{BNSS479_VERBATIM}</div>
        <ul>
          <li><strong>s.479(1):</strong> release on bail at <strong>1/2</strong> of the maximum period; <strong>1/3 on bond</strong> if first-time offender (never convicted).</li>
          <li><strong>Exclusion:</strong> offences specifying death or life imprisonment are outside s.479.</li>
          <li><strong>Explanation:</strong> accused-caused delay excluded from detention computation.</li>
          <li><strong>s.479(2):</strong> multiple cases / offences pending → shall not be released.</li>
          <li><strong>3rd proviso:</strong> court may order continued detention beyond 1/2 after hearing the PP, for recorded reasons.</li>
          <li><strong>4th proviso:</strong> never detained beyond the maximum period for the offence.</li>
          <li><strong>s.479(3):</strong> jail Superintendent must apply to the court forthwith on completion of the period.</li>
        </ul>
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>BNS maximum sentences — supported offences</h2>
        <p className="muted">
          Authority: <a className="ext" href="https://www.indiacode.nic.in/handle/123456789/20062" target="_blank" rel="noreferrer">Bharatiya Nyaya Sanhita, 2023 — India Code</a>.
          Punishment clauses verbatim from BNS text via devgan.in mirrors
          (verified 2026-11-06). Only offences below are computable; all other
          charges must go through DLSA / advocate.
        </p>
        <table>
          <thead>
            <tr><th>Section</th><th>Offence</th><th>Max</th><th>Punishment (verbatim clause)</th><th>Source</th></tr>
          </thead>
          <tbody>
            {BNS_SECTIONS.map((s) => (
              <tr key={s.id}>
                <td><strong>{s.label}</strong><br /><span className="muted">{s.id}</span></td>
                <td>{s.title}<br /><span className="muted" style={{ fontSize: 12 }}>{s.note}</span></td>
                <td><strong>{s.maxSentenceLabel}</strong></td>
                <td style={{ fontSize: 12 }}>{s.punishmentVerbatim}</td>
                <td><a className="ext" href={s.sourceUrl} target="_blank" rel="noreferrer">India Code</a></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>National scale — NCRB Prison Statistics India 2024</h2>
        <p>
          <strong>{NCRB_2024.totalPrisonersEnd2024.toLocaleString("en-IN")}</strong> prisoners
          at end-2024, of which <strong>{NCRB_2024.undertrialsEnd2024.toLocaleString("en-IN")} undertrials
          ({NCRB_2024.undertrialSharePct}%)</strong> — roughly 3 in 4 prisoners
          awaiting trial. {NCRB_2024.report}. Report PDF:{" "}
          <a className="ext" href={NCRB_2024.reportUrl} target="_blank" rel="noreferrer">{NCRB_2024.reportUrl}</a>
        </p>
        <p className="muted">
          Cross-checked 2026-11-06 against World Prison Brief (India, 31-12-2024,
          NCRB) and News Minute DataViz (NCRB 2024: 371,440 undertrials, up
          from 237,076 in 2005). This tool exists because date arithmetic at
          this scale cannot be left to manual registers.
        </p>
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>Live pendency aggregates — honest status</h2>
        <p>
          <strong>NJDG</strong> (National Judicial Data Grid):{" "}
          <a className="ext" href={NJDG_DASHBOARD_URL} target="_blank" rel="noreferrer">{NJDG_DASHBOARD_URL}</a> —
          live probe on 2026-11-06 returns HTML dashboards, not JSON. This app
          therefore links to the dashboard and does <strong>not</strong>
          display “median pendency” figures. No medians are fabricated.
        </p>
        <p>
          <strong>data.gov.in Civil Pendency datasets</strong>:{" "}
          <a className="ext" href={DATA_GOV_IN_SEARCH_URL} target="_blank" rel="noreferrer">{DATA_GOV_IN_SEARCH_URL}</a> —
          the api.data.gov.in endpoint requires a user API key (without one it
          returns an authorization error; verified live 2026-11-06). DLSA
          onboarding should register for a key and point this panel at the
          exact Civil Pendency resource.
        </p>
        <h3>Live probe (from /api/health)</h3>
        <pre className="draft">{JSON.stringify(health, null, 2)}</pre>
      </div>
    </div>
  );
}

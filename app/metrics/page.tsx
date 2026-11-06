"use client";

import { useEffect, useState } from "react";

interface Metrics {
  screened: number;
  demoRows: number;
  overDetainedFound: number;
  applicationsFiled: number;
  releasesSecured: number;
  template?: {
    screened_N: number;
    overDetainedFound: number;
    applicationsFiled: number;
    releasesSecured: number;
    date: string;
  };
}

export default function MetricsPage() {
  const [m, setM] = useState<Metrics | null>(null);
  useEffect(() => {
    fetch("/api/metrics").then((r) => r.json()).then(setM).catch(() => {});
  }, []);

  return (
    <div>
      <h1>Submission metrics</h1>
      <p className="muted">
        Field 1 is deployment data (tiebreaker). The dashboard counts{" "}
        <strong>real imports only</strong> — demo sample rows are excluded.
        Update statuses on /dashboard as cases progress.
      </p>
      <div className="card">
        {m ? (
          <>
            <table>
              <tbody>
                <tr><td>Screened (N, real imports)</td><td><strong>{m.template?.screened_N}</strong></td></tr>
                <tr><td>Over-detained found (ELIGIBLE_NOW / CEILING_BREACHED)</td><td><strong>{m.template?.overDetainedFound}</strong></td></tr>
                <tr><td>Applications filed</td><td><strong>{m.template?.applicationsFiled}</strong></td></tr>
                <tr><td>Releases secured</td><td><strong>{m.template?.releasesSecured}</strong></td></tr>
                <tr><td>Demo sample rows (excluded from above)</td><td>{m.demoRows}</td></tr>
              </tbody>
            </table>
            <h3>Copy-ready block</h3>
            <pre className="draft">{JSON.stringify(m.template, null, 2)}</pre>
          </>
        ) : (
          <p>Loading…</p>
        )}
      </div>
      <div className="card">
        <h2 style={{ marginTop: 0 }}>How to count (no inflation)</h2>
        <ul>
          <li><strong>Screened (N):</strong> every DLSA CSV row imported (is_sample=0). One row = one screened undertrial.</li>
          <li><strong>Over-detained found:</strong> computed ELIGIBLE_NOW / CEILING_BREACHED at today&apos;s date.</li>
          <li><strong>Applications filed:</strong> status moved to APPLICATION_FILED after the draft was actually filed with the court / jail Superintendent.</li>
          <li><strong>Releases secured:</strong> status RELEASED after a court order / jail release memo was verified.</li>
          <li>Never add demo rows to the four numbers above.</li>
        </ul>
      </div>
    </div>
  );
}

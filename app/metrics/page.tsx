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
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/metrics")
      .then((r) => r.json())
      .then(setM)
      .catch(() => {});
  }, []);

  const copy = async () => {
    if (!m?.template) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(m.template, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="screen-only">
      <div className="shell">
        <header className="page-head">
          <p className="page-kicker">Deployment record</p>
          <h1>Metrics, with the demo rows removed.</h1>
          <p className="lede">
            Four numbers, counted from real DLSA imports only. A demo row is a
            preview, not a prisoner. The register keeps the two apart so the
            submission numbers cannot be inflated.
          </p>
        </header>

        <div className="case-layout" style={{ paddingTop: 28 }}>
          <div className="document">
            <section className="folio" style={{ paddingTop: 0 }}>
              <div className="folio-head">
                <span className="folio-mark">Register</span>
                <h2>Submission numbers</h2>
              </div>

              {m ? (
                <>
                  <div className="table-scroll">
                    <table className="register">
                      <thead>
                        <tr>
                          <th>Number</th>
                          <th>What it counts</th>
                          <th className="num">Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="row-strong">Screened (N)</td>
                          <td>
                            Every real DLSA or jail CSV row imported. One row is
                            one screened undertrial.
                          </td>
                          <td className="num">{m.template?.screened_N ?? 0}</td>
                        </tr>
                        <tr>
                          <td className="row-strong">Over-detained found</td>
                          <td>
                            Real rows whose computation is ELIGIBLE_NOW or
                            CEILING_BREACHED at today&apos;s date.
                          </td>
                          <td className="num">{m.template?.overDetainedFound ?? 0}</td>
                        </tr>
                        <tr>
                          <td className="row-strong">Applications filed</td>
                          <td>
                            Rows moved to APPLICATION_FILED after the draft was
                            actually filed with the court or the Superintendent.
                          </td>
                          <td className="num">{m.template?.applicationsFiled ?? 0}</td>
                        </tr>
                        <tr>
                          <td className="row-strong">Releases secured</td>
                          <td>
                            Rows moved to RELEASED only after a court order or
                            jail release memo was verified.
                          </td>
                          <td className="num">{m.template?.releasesSecured ?? 0}</td>
                        </tr>
                        <tr>
                          <td>Demo sample rows</td>
                          <td>
                            Badged preview rows. Excluded from every number
                            above.
                          </td>
                          <td className="num">{m.demoRows}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="notice">
                    <strong>As of {m.template?.date}.</strong> The register is
                    empty until a real jail or DLSA list is imported. A zero is
                    an honest zero, not a missing number.
                  </div>

                  <h3>Copy-ready block</h3>
                  <pre className="verbatim">{JSON.stringify(m.template, null, 2)}</pre>
                  <div className="btn-row">
                    <button className="btn secondary" onClick={copy}>
                      {copied ? "Copied" : "Copy the block"}
                    </button>
                    <a className="btn secondary" href="/dashboard">
                      Open the register
                    </a>
                  </div>
                </>
              ) : (
                <p className="small">Reading the register…</p>
              )}
            </section>

            <section className="folio">
              <div className="folio-head">
                <span className="folio-mark">Method</span>
                <h2>How a row moves</h2>
              </div>
              <ol className="route-list">
                <li>
                  <span className="route-step">Import</span>
                  <span className="route-detail">
                    A real CSV row enters the register with is_sample=0. It is
                    counted as screened.
                  </span>
                </li>
                <li>
                  <span className="route-step">Screen</span>
                  <span className="route-detail">
                    The engine computes the 1/3 or 1/2 date. If the date has
                    passed, the row enters over-detained found.
                  </span>
                </li>
                <li>
                  <span className="route-step">File</span>
                  <span className="route-detail">
                    After the DLSA advocate reviews and the application is filed,
                    the status moves to APPLICATION_FILED.
                  </span>
                </li>
                <li>
                  <span className="route-step">Release</span>
                  <span className="route-detail">
                    Only a verified order or release memo moves the row to
                    RELEASED.
                  </span>
                </li>
              </ol>
            </section>
          </div>

          <aside className="rail" aria-label="Counting rules">
            <div className="rail-block">
              <p className="rail-title">The rule</p>
              <p className="rail-note">
                Demo rows never count. The API filters them out before computing
                every number on this page. If a figure here is zero, no real row
                has been imported yet.
              </p>
            </div>
            <div className="rail-block">
              <p className="rail-title">What this does not claim</p>
              <p className="rail-note">
                It does not claim releases that were not verified, cases that
                were not filed, or prisoners who were not in a real import. It
                does not estimate a district's total from a sample.
              </p>
            </div>
            <div className="rail-block">
              <p className="rail-title">Source</p>
              <p className="rail-note">
                Counts come from the SQLite register at{" "}
                <code>/api/metrics</code>. The same four numbers are on the
                submission template. See <a href="/sources">Sources</a> for the
                statute and scale citations.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

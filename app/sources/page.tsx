"use client";

import { useEffect, useState } from "react";
import { BNS_SECTIONS } from "@/lib/bns";
import {
  BNSS479_QUOTE,
  BNSS479_SOURCE_URL,
  BNSS479_VERBATIM,
  NCRB_2024,
  NJDG_DASHBOARD_URL,
} from "@/lib/bnss479";
import {
  DATA_GOV_PERIOD,
  DATA_GOV_RESOURCE_TITLE,
  DATA_GOV_SOURCE_URL,
} from "@/lib/stateContext";
import {
  INCOME_TABLE_ACCESSED_ON,
  NALSA_ACT_URL,
  NALSA_HELPLINE,
  NALSA_LEGAL_AID_URL,
  NALSA_ONLINE_APPLICATION_URL,
} from "@/lib/incomeLimits";

interface Summary {
  states: number;
  offices: number;
  accessedOn: string;
  caveat: string;
  rows: Array<{ state: string; offices: number; districts: number; sourceUrl: string }>;
}

export default function Sources() {
  const [health, setHealth] = useState<unknown>(null);
  const [summary, setSummary] = useState<Summary | null>(null);

  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then(setHealth)
      .catch(() => setHealth("probe failed"));
    fetch("/api/dlsa")
      .then((r) => r.json())
      .then((json) => setSummary(json.summary))
      .catch(() => setSummary(null));
  }, []);

  return (
    <div className="screen-only">
      <div className="shell">
        <header className="page-head">
          <p className="page-kicker">Citations and live-data status</p>
          <h1>Every number has a source and a date.</h1>
          <p className="lede">
            Statutes, sentence values, prison figures, DLSA contacts and income
            ceilings are listed here with the authority and the date they were
            checked. Where a source is unavailable or a district is missing, the
            page says so. Nothing is filled in to make the file look complete.
          </p>
        </header>

        <div className="case-layout" style={{ paddingTop: 34 }}>
          <div className="document">
            <section className="folio" style={{ paddingTop: 0 }}>
              <div className="folio-head">
                <span className="folio-mark">01</span>
                <h2>BNSS Section 479, verbatim</h2>
              </div>
              <p>
                Authority:{" "}
                <a href={BNSS479_SOURCE_URL} target="_blank" rel="noreferrer">
                  Bharatiya Nagarik Suraksha Sanhita, 2023, India Code
                </a>
                . The text below was verified against the Indian Kanoon mirror
                (indiankanoon.org/doc/87702491) on 6 November 2026. India Code
                blocks automated fetch; reconcile with the Gazette or the India
                Code PDF before filing.
              </p>
              <div className="verbatim">{BNSS479_VERBATIM}</div>
              <p className="small" style={{ marginTop: 12 }}>
                The printable application quotes s.479(1), the first proviso and
                s.479(3) exactly. The quote block used in the document begins:{" "}
                <span className="mono">{BNSS479_QUOTE.sub1.slice(0, 96)}…</span>
              </p>
              <ul className="small" style={{ paddingLeft: 18 }}>
                <li>
                  <strong>s.479(1):</strong> release on bail at one-half of the
                  maximum period; one-third on bond for a first-time offender.
                </li>
                <li>
                  <strong>Exclusion:</strong> offences specifying death or life
                  imprisonment are outside s.479.
                </li>
                <li>
                  <strong>Explanation:</strong> delay caused by the accused is
                  excluded from the detention computation.
                </li>
                <li>
                  <strong>s.479(2):</strong> multiple cases or offences pending
                  means the person shall not be released on bail.
                </li>
                <li>
                  <strong>Third proviso:</strong> the court may order continued
                  detention beyond one-half after hearing the Public Prosecutor,
                  for recorded reasons.
                </li>
                <li>
                  <strong>Fourth proviso:</strong> never detained beyond the
                  maximum period for the offence.
                </li>
                <li>
                  <strong>s.479(3):</strong> the jail Superintendent must apply
                  to the court forthwith when the period is complete.
                </li>
              </ul>
            </section>

            <section className="folio">
              <div className="folio-head">
                <span className="folio-mark">02</span>
                <h2>BNS maximum sentences in the engine</h2>
              </div>
              <p>
                Authority:{" "}
                <a
                  href="https://www.indiacode.nic.in/handle/123456789/20062"
                  target="_blank"
                  rel="noreferrer"
                >
                  Bharatiya Nyaya Sanhita, 2023, India Code
                </a>
                . Punishment clauses were checked against the BNS text mirrors on
                devgan.in on 6 November 2026. Only these eleven entries are
                computable. An IPC-era charge must go through the DLSA.
              </p>
              <div className="table-scroll">
                <table className="register">
                  <thead>
                    <tr>
                      <th>Section</th>
                      <th>Offence</th>
                      <th>Maximum</th>
                      <th>Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    {BNS_SECTIONS.map((s) => (
                      <tr key={s.id}>
                        <td className="mono row-strong">{s.label}</td>
                        <td>
                          {s.title}
                          <br />
                          <span className="small">{s.note}</span>
                        </td>
                        <td>{s.maxSentenceLabel}</td>
                        <td className="small">
                          <a href={s.sourceUrl} target="_blank" rel="noreferrer">
                            India Code
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="folio">
              <div className="folio-head">
                <span className="folio-mark">03</span>
                <h2>National scale, NCRB 2024</h2>
              </div>
              <p>
                <strong>{NCRB_2024.totalPrisonersEnd2024.toLocaleString("en-IN")}</strong>{" "}
                prisoners at end-2024, of which{" "}
                <strong>
                  {NCRB_2024.undertrialsEnd2024.toLocaleString("en-IN")} undertrials
                  ({NCRB_2024.undertrialSharePct}%)
                </strong>
                . Roughly three in four prisoners were awaiting trial. Source:{" "}
                {NCRB_2024.report}.{" "}
                <a href={NCRB_2024.reportUrl} target="_blank" rel="noreferrer">
                  Report PDF
                </a>
                .
              </p>
              <p className="small">
                Cross-checked on 6 November 2026 against the World Prison Brief
                India page (31 December 2024, NCRB) and News Minute DataViz
                (371,440 undertrials, up from 237,076 in 2005).
              </p>
            </section>

            <section className="folio">
              <div className="folio-head">
                <span className="folio-mark">04</span>
                <h2>State undertrial row, data.gov.in</h2>
              </div>
              <p>
                Resource: <strong>{DATA_GOV_RESOURCE_TITLE}</strong>. Period:{" "}
                {DATA_GOV_PERIOD}. Publisher: National Crime Records Bureau,
                Ministry of Home Affairs, published on data.gov.in.{" "}
                <a href={DATA_GOV_SOURCE_URL} target="_blank" rel="noreferrer">
                  API record
                </a>
                .
              </p>
              <p className="small">
                The state row is fetched live on <code>/api/state-context</code>{" "}
                and cached for six hours. If the API rate-limits or the state is
                missing, the page says “not published” or “rate-limited”. The
                national 2024 figure and the state 2022 row are shown side by
                side, never merged. The “share of national total” is labelled an
                estimate because it divides two different years.
              </p>
            </section>

            <section className="folio">
              <div className="folio-head">
                <span className="folio-mark">05</span>
                <h2>Free legal aid, Section 12</h2>
              </div>
              <p>
                Authority:{" "}
                <a href={NALSA_ACT_URL} target="_blank" rel="noreferrer">
                  the Legal Services Authorities Act, 1987, on NALSA
                </a>
                . The category list and the State-wise income ceiling table are
                reproduced from{" "}
                <a href={NALSA_LEGAL_AID_URL} target="_blank" rel="noreferrer">
                  NALSA's legal-aid page
                </a>{" "}
                on {INCOME_TABLE_ACCESSED_ON}. The Supreme Court ceiling of
                ₹5,00,000 is from the same NALSA FAQ. State Governments may
                revise the limits.
              </p>
              <p className="small">
                The checker applies s.12(a) to (h) and the published ceiling. It
                does not decide the case: s.13(1) requires the Authority to be
                satisfied that the person has a genuine case. The national
                helpline is {NALSA_HELPLINE}.{" "}
                <a href={NALSA_ONLINE_APPLICATION_URL} target="_blank" rel="noreferrer">
                  NALSA online application
                </a>
                .
              </p>
            </section>

            <section className="folio">
              <div className="folio-head">
                <span className="folio-mark">06</span>
                <h2>DLSA directory</h2>
              </div>
              <p>
                {summary
                  ? `${summary.offices} offices across ${summary.states} States/UTs, transcribed on ${summary.accessedOn} from the State Legal Services Authority pages hosted on NALSA.`
                  : "Loading the directory summary…"}{" "}
                The vendored CSV is at <code>data/dlsa-contacts.csv</code>; every
                row carries its source URL and access date.{" "}
                <a href="/dlsa">Open the DLSA desk</a>.
              </p>
              {summary && (
                <>
                  <p className="small">{summary.caveat}</p>
                  <div className="table-scroll">
                    <table className="register">
                      <thead>
                        <tr>
                          <th>State / UT</th>
                          <th className="num">Offices</th>
                          <th>Source page</th>
                          <th>Accessed</th>
                        </tr>
                      </thead>
                      <tbody>
                        {summary.rows.map((r) => (
                          <tr key={r.state}>
                            <td>{r.state}</td>
                            <td className="num">{r.offices}</td>
                            <td className="small">
                              <a href={r.sourceUrl} target="_blank" rel="noreferrer">
                                NALSA state page
                              </a>
                            </td>
                            <td className="mono small">{summary.accessedOn}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </section>

            <section className="folio">
              <div className="folio-head">
                <span className="folio-mark">07</span>
                <h2>What is estimated, and what is not</h2>
              </div>
              <ul className="small" style={{ paddingLeft: 18 }}>
                <li>
                  <strong>Not estimated:</strong> prisoner records, DLSA phone
                  numbers, addresses, sentences, eligibility dates, legal-aid
                  outcomes, releases.
                </li>
                <li>
                  <strong>Labelled estimate:</strong> a State's share of the
                  2024 national undertrial total, computed from the 2022 State
                  row and the 2024 national figure. The two years are printed
                  beside it.
                </li>
                <li>
                  <strong>Not live:</strong> the DLSA directory is a vendored
                  transcription, not a scrape. West Bengal and Maharashtra list
                  only the first directory page; other districts are marked not
                  yet sourced.
                </li>
                <li>
                  <strong>Not legal advice:</strong> every page and every
                  generated document carries the disclaimer. A DLSA advocate or
                  the jail Superintendent must verify the file before it is
                  signed or filed.
                </li>
              </ul>
            </section>

            <section className="folio">
              <div className="folio-head">
                <span className="folio-mark">08</span>
                <h2>Live dependency probe</h2>
              </div>
              <p className="small">
                The probe reports what actually responded. NJDG publishes HTML
                dashboards, not JSON; this app links to{" "}
                <a href={NJDG_DASHBOARD_URL} target="_blank" rel="noreferrer">
                  the dashboard
                </a>{" "}
                and does not invent pendency medians.
              </p>
              <details>
                <summary className="small" style={{ cursor: "pointer" }}>
                  Show the raw probe
                </summary>
                <pre className="verbatim" style={{ marginTop: 12 }}>
                  {JSON.stringify(health, null, 2)}
                </pre>
              </details>
            </section>
          </div>

          <aside className="rail" aria-label="Source register">
            <div className="rail-block">
              <p className="rail-title">Source register</p>
              <div className="source-list">
                <div className="source-row">
                  <div>
                    <span className="source-name">BNSS, 2023</span>
                    <span className="source-detail">Section 479 release clock.</span>
                  </div>
                  <a className="source-link" href={BNSS479_SOURCE_URL} target="_blank" rel="noreferrer">
                    India Code
                  </a>
                </div>
                <div className="source-row">
                  <div>
                    <span className="source-name">BNS, 2023</span>
                    <span className="source-detail">Maximum sentences.</span>
                  </div>
                  <a
                    className="source-link"
                    href="https://www.indiacode.nic.in/handle/123456789/20062"
                    target="_blank"
                    rel="noreferrer"
                  >
                    India Code
                  </a>
                </div>
                <div className="source-row">
                  <div>
                    <span className="source-name">NCRB PSI 2024</span>
                    <span className="source-detail">National prison scale.</span>
                  </div>
                  <a className="source-link" href={NCRB_2024.reportUrl} target="_blank" rel="noreferrer">
                    Report PDF
                  </a>
                </div>
                <div className="source-row">
                  <div>
                    <span className="source-name">data.gov.in</span>
                    <span className="source-detail">State undertrial row, 2022.</span>
                  </div>
                  <a className="source-link" href={DATA_GOV_SOURCE_URL} target="_blank" rel="noreferrer">
                    API record
                  </a>
                </div>
                <div className="source-row">
                  <div>
                    <span className="source-name">NALSA</span>
                    <span className="source-detail">s.12 categories and income table.</span>
                  </div>
                  <a className="source-link" href={NALSA_LEGAL_AID_URL} target="_blank" rel="noreferrer">
                    Legal aid
                  </a>
                </div>
                <div className="source-row">
                  <div>
                    <span className="source-name">NALSA DLSA pages</span>
                    <span className="source-detail">10 States/UTs, 157 offices.</span>
                  </div>
                  <a className="source-link" href="https://nalsa.gov.in/" target="_blank" rel="noreferrer">
                    NALSA
                  </a>
                </div>
              </div>
            </div>
            <div className="rail-block">
              <p className="rail-title">Access date</p>
              <p className="rail-note">
                Statutes, NCRB, NALSA and DLSA pages checked on 6 November 2026.
                The data.gov.in row is fetched at request time and cached for six
                hours. Every date on the site is printed with the figure it
                belongs to.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

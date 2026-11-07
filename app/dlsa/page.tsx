"use client";

import { useEffect, useState } from "react";

interface Office {
  state: string;
  district: string;
  officeName: string;
  address: string;
  phone: string;
  email: string;
  sourceUrl: string;
  accessedOn: string;
  note: string;
}

interface Lookup {
  status: "found" | "not_found" | "state_not_covered" | "missing_state";
  state: string;
  district: string;
  matches: Office[];
  districts: string[];
  offices: Office[];
  sourcedDistricts: string[];
  message: string;
  sourceUrls: string[];
  accessedOn: string;
}

interface Summary {
  states: number;
  offices: number;
  accessedOn: string;
  caveat: string;
  rows: Array<{ state: string; offices: number; districts: number; sourceUrl: string }>;
}

export default function DlsaPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [lookup, setLookup] = useState<Lookup | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/dlsa")
      .then((r) => r.json())
      .then((json) => setSummary(json.summary))
      .catch(() => setSummary(null));
  }, []);

  useEffect(() => {
    if (!state) {
      setLookup(null);
      return;
    }
    let alive = true;
    setLoading(true);
    fetch(`/api/dlsa?state=${encodeURIComponent(state)}`)
      .then((r) => r.json())
      .then((json) => {
        if (alive) setLookup(json as Lookup);
      })
      .catch(() => {
        if (alive) setLookup(null);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [state]);

  const search = async () => {
    if (!state) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/dlsa?state=${encodeURIComponent(state)}&district=${encodeURIComponent(district)}`
      );
      const json = await res.json();
      setLookup(json as Lookup);
    } finally {
      setLoading(false);
    }
  };

  const offices = lookup?.offices ?? [];

  return (
    <div className="screen-only">
      <div className="shell">
        <header className="page-head">
          <p className="page-kicker">District Legal Services Authority directory</p>
          <h1>Find the office that can file for free.</h1>
          <p className="lede">
            A DLSA is the district-level legal aid office. This directory is
            transcribed from NALSA's State Legal Services Authority pages, with
            the source and access date on every row. It is not a live scrape. If
            a district is not in the file, the answer is “contact details not
            yet sourced” — never a made-up phone number.
          </p>
        </header>

        <div className="aid-layout">
          <div>
            <section className="folio" style={{ borderTop: 0, paddingTop: 0 }}>
              <div className="folio-head">
                <span className="folio-mark">Lookup</span>
                <h2>State and district</h2>
              </div>
              <div className="form-grid">
                <div className="field">
                  <label htmlFor="d-state">State / UT</label>
                  <select
                    id="d-state"
                    value={state}
                    onChange={(e) => {
                      setState(e.target.value);
                      setDistrict("");
                    }}
                  >
                    <option value="">Choose a State/UT</option>
                    {(summary?.rows ?? []).map((r) => (
                      <option key={r.state} value={r.state}>
                        {r.state} ({r.offices})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="d-district">District</label>
                  <input
                    id="d-district"
                    type="text"
                    list="dlsa-districts"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder={state ? "Start typing a district" : "Choose a State first"}
                  />
                  <datalist id="dlsa-districts">
                    {(lookup?.districts ?? []).map((d) => (
                      <option key={d} value={d} />
                    ))}
                  </datalist>
                </div>
              </div>
              <div className="btn-row">
                <button className="btn" onClick={search} disabled={!state || loading}>
                  {loading ? "Looking up…" : "Find the DLSA office"}
                </button>
                <a className="btn secondary" href="tel:15100">
                  Call NALSA 15100
                </a>
              </div>

              {summary && (
                <div className="coverage-strip">
                  <span>
                    <strong>{summary.offices}</strong> sourced offices
                  </span>
                  <span>
                    <strong>{summary.states}</strong> States/UTs
                  </span>
                  <span>Accessed {summary.accessedOn}</span>
                </div>
              )}

              {lookup && lookup.matches.length > 0 && (
                <div className="office-card">
                  {lookup.matches.map((m) => (
                    <div key={`${m.state}-${m.district}`} style={{ marginBottom: 20 }}>
                      <h3>{m.officeName}</h3>
                      <p className="office-address">{m.address}</p>
                      <a
                        className="office-phone"
                        href={`tel:${m.phone.split(",")[0].replace(/[^0-9+]/g, "")}`}
                      >
                        {m.phone}
                      </a>
                      <div className="office-meta">
                        <span>
                          <span className="source-tag">Sourced</span>{" "}
                          <a href={m.sourceUrl} target="_blank" rel="noreferrer">
                            NALSA state page
                          </a>
                        </span>
                        <span>Accessed {m.accessedOn}</span>
                        {m.email && <span className="mono">{m.email}</span>}
                      </div>
                      {m.note && <p className="small">{m.note}</p>}
                    </div>
                  ))}
                </div>
              )}

              {lookup && state && !district.trim() && lookup.status !== "state_not_covered" && (
                <p className="small" style={{ marginTop: 16 }}>
                  Choose a district to see the office. The register below lists
                  every sourced office in {state}.
                </p>
              )}

              {lookup && district.trim() && lookup.matches.length === 0 && state && (
                <div className="notice warn" role="status">
                  <strong>Contact details not yet sourced.</strong>{" "}
                  {lookup.message}
                  {lookup.sourcedDistricts.length > 0 && (
                    <>
                      {" "}
                      The sourced districts in {lookup.state} are:{" "}
                      {lookup.sourcedDistricts.join(", ")}.
                    </>
                  )}
                </div>
              )}

              {lookup?.status === "state_not_covered" && (
                <div className="notice warn" role="status">
                  <strong>This State/UT is not in the sourced file.</strong>{" "}
                  {lookup.message}
                </div>
              )}
            </section>

            {offices.length > 0 && (
              <section className="folio">
                <div className="folio-head">
                  <span className="folio-mark">Register</span>
                  <h2>Sourced offices in {state}</h2>
                </div>
                <div className="table-scroll">
                  <table className="register">
                    <thead>
                      <tr>
                        <th>District</th>
                        <th>Office and address</th>
                        <th>Phone</th>
                        <th>Source</th>
                      </tr>
                    </thead>
                    <tbody>
                      {offices.map((o) => (
                        <tr key={`${o.state}-${o.district}-${o.phone}`}>
                          <td className="row-strong">{o.district}</td>
                          <td>
                            {o.officeName}
                            <br />
                            <span className="small">{o.address}</span>
                          </td>
                          <td className="num">
                            <a href={`tel:${o.phone.split(",")[0].replace(/[^0-9+]/g, "")}`}>
                              {o.phone}
                            </a>
                          </td>
                          <td className="small">
                            <a href={o.sourceUrl} target="_blank" rel="noreferrer">
                              NALSA
                            </a>
                            <br />
                            {o.accessedOn}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </div>

          <aside className="aid-rail" aria-label="Coverage and caveats">
            <div className="rail-block">
              <p className="rail-title">What is in the file</p>
              <p className="rail-note">
                {summary
                  ? `${summary.offices} offices across ${summary.states} States/UTs, transcribed on ${summary.accessedOn}.`
                  : "Loading the directory summary…"}
              </p>
              <p className="rail-note">{summary?.caveat}</p>
            </div>

            <div className="rail-block">
              <p className="rail-title">Coverage by State</p>
              <table className="register">
                <thead>
                  <tr>
                    <th>State / UT</th>
                    <th className="num">Offices</th>
                  </tr>
                </thead>
                <tbody>
                  {(summary?.rows ?? []).map((r) => (
                    <tr key={r.state}>
                      <td>{r.state}</td>
                      <td className="num">{r.offices}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="rail-block">
              <p className="rail-title">If your district is missing</p>
              <p className="rail-note">
                Call the NALSA helpline <a href="tel:15100">15100</a>. The State
                Legal Services Authority can give the current DLSA address. This
                tool will not guess a phone number or an office address.
              </p>
              <p className="rail-note">
                <a href="https://nalsa.gov.in/" target="_blank" rel="noreferrer">
                  NALSA office locator
                </a>
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

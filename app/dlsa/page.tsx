"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/components/I18nProvider";
import RichText from "@/components/RichText";
import { NALSA_HELPLINE } from "@/lib/incomeLimits";

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
  const { t } = useI18n();
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
          <p className="page-kicker">{t("dlsa.kicker")}</p>
          <h1>{t("dlsa.title")}</h1>
          <p className="lede">{t("dlsa.lede")}</p>
        </header>

        <div className="aid-layout">
          <div>
            <section className="folio" style={{ borderTop: 0, paddingTop: 0 }}>
              <div className="folio-head">
                <span className="folio-mark">{t("dlsa.lookupMark")}</span>
                <h2>{t("dlsa.lookupTitle")}</h2>
              </div>
              <div className="form-grid">
                <div className="field">
                  <label htmlFor="d-state">{t("field.state")}</label>
                  <select
                    id="d-state"
                    value={state}
                    onChange={(e) => {
                      setState(e.target.value);
                      setDistrict("");
                    }}
                  >
                    <option value="">{t("common.chooseState")}</option>
                    {(summary?.rows ?? []).map((r) => (
                      <option key={r.state} value={r.state}>
                        {t("dlsa.stateOption", {
                          state: r.state,
                          count: r.offices,
                        })}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="d-district">{t("dlsa.colDistrict")}</label>
                  <input
                    id="d-district"
                    type="text"
                    list="dlsa-districts"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder={
                      state
                        ? t("dlsa.districtPlaceholderState")
                        : t("dlsa.districtPlaceholderNoState")
                    }
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
                  {loading ? t("common.lookingUp") : t("dlsa.find")}
                </button>
                <a className="btn secondary" href="tel:15100">
                  {t("dlsa.callNalsa")}
                </a>
              </div>

              {summary && (
                <div className="coverage-strip">
                  <RichText
                    template={t("dlsa.sourcedOffices")}
                    values={{ count: <strong>{summary.offices}</strong> }}
                  />
                  <RichText
                    template={t("dlsa.statesCount")}
                    values={{ count: <strong>{summary.states}</strong> }}
                  />
                  <span>{t("dlsa.accessed", { date: summary.accessedOn })}</span>
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
                          <span className="source-tag">{t("common.sourced")}</span>{" "}
                          <a href={m.sourceUrl} target="_blank" rel="noreferrer">
                            {t("common.nalsaPage")}
                          </a>
                        </span>
                        <span>{t("common.accessedDate", { date: m.accessedOn })}</span>
                        {m.email && <span className="mono">{m.email}</span>}
                      </div>
                      {m.note && <p className="small">{m.note}</p>}
                    </div>
                  ))}
                </div>
              )}

              {lookup && state && !district.trim() && lookup.status !== "state_not_covered" && (
                <p className="small" style={{ marginTop: 16 }}>
                  {t("dlsa.chooseDistrict", { state })}
                </p>
              )}

              {lookup && district.trim() && lookup.matches.length === 0 && state && (
                <div className="notice warn" role="status">
                  <strong>{t("dlsa.notSourcedTitle")}</strong>
                  {lookup.sourcedDistricts.length > 0 && (
                    <>
                      {" "}
                      {t("dlsa.sourcedDistricts", {
                        state: lookup.state,
                        districts: lookup.sourcedDistricts.join(", "),
                      })}
                    </>
                  )}
                </div>
              )}

              {lookup?.status === "state_not_covered" && (
                <div className="notice warn" role="status">
                  <strong>{t("dlsa.notCoveredTitle")}</strong>{" "}
                  {t("dlsa.notCoveredBody", { helpline: NALSA_HELPLINE })}
                </div>
              )}
            </section>

            {offices.length > 0 && (
              <section className="folio">
                <div className="folio-head">
                  <span className="folio-mark">{t("dlsa.registerMark")}</span>
                  <h2>{t("dlsa.registerTitle", { state })}</h2>
                </div>
                <div className="table-scroll">
                  <table className="register">
                    <thead>
                      <tr>
                        <th>{t("dlsa.colDistrict")}</th>
                        <th>{t("dlsa.colOffice")}</th>
                        <th>{t("dlsa.colPhone")}</th>
                        <th>{t("dlsa.colSource")}</th>
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

          <aside className="aid-rail" aria-label={t("dlsa.asideLabel")}>
            <div className="rail-block">
              <p className="rail-title">{t("dlsa.inFile")}</p>
              <p className="rail-note">
                {summary
                  ? t("dlsa.summary", {
                      offices: summary.offices,
                      states: summary.states,
                      date: summary.accessedOn,
                    })
                  : t("dlsa.loadingSummary")}
              </p>
              <p className="rail-note">{t("dlsa.caveat")}</p>
            </div>

            <div className="rail-block">
              <p className="rail-title">{t("dlsa.coverage")}</p>
              <table className="register">
                <thead>
                  <tr>
                    <th>{t("dlsa.colState")}</th>
                    <th className="num">{t("dlsa.colOffices")}</th>
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
              <p className="rail-title">{t("dlsa.missingTitle")}</p>
              <p className="rail-note">
                <RichText
                  template={t("dlsa.missingNote")}
                  values={{ helpline: <a href="tel:15100">{NALSA_HELPLINE}</a> }}
                />
              </p>
              <p className="rail-note">
                <a href="https://nalsa.gov.in/" target="_blank" rel="noreferrer">
                  {t("dlsa.locator")}
                </a>
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

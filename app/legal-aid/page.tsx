"use client";

import { useState } from "react";
import {
  LEGAL_AID_CATEGORIES,
  type LegalAidCategoryId,
  type LegalAidResult,
} from "@/lib/legalAid";
import {
  INCOME_LIMITS,
  INCOME_TABLE_ACCESSED_ON,
  NALSA_HELPLINE,
  NALSA_LEGAL_AID_URL,
  NALSA_ONLINE_APPLICATION_URL,
} from "@/lib/incomeLimits";

interface DlsaMatch {
  officeName: string;
  address: string;
  phone: string;
  email: string;
  sourceUrl: string;
  accessedOn: string;
}

interface AidResponse extends LegalAidResult {
  dlsa: {
    status: string;
    matches: DlsaMatch[];
    message: string;
  } | null;
}

const STATUS = {
  eligible: {
    stamp: "You qualify",
    cls: "green",
    plain: "A Section 12 category applies",
    detail:
      "On the facts you entered, you fall within a Section 12 category. The DLSA still decides eligibility and assigns counsel.",
  },
  need_info: {
    stamp: "Need income",
    cls: "blue",
    plain: "Income is the only route selected",
    detail:
      "Enter the annual income and choose the State/UT, or tick another Section 12 category. The State ceiling decides.",
  },
  not_eligible: {
    stamp: "Not on these facts",
    cls: "ink",
    plain: "No Section 12 category selected",
    detail:
      "On the facts entered, none of the Section 12 categories apply. That is not the end of the road: a DLSA officer can review the case.",
  },
} as const;

export default function LegalAidPage() {
  const [categories, setCategories] = useState<LegalAidCategoryId[]>([]);
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [annualIncome, setAnnualIncome] = useState("");
  const [court, setCourt] = useState<"district" | "high" | "supreme">("district");
  const [result, setResult] = useState<AidResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const toggle = (id: LegalAidCategoryId) =>
    setCategories((ids) =>
      ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]
    );

  const check = async () => {
    if (!categories.length) {
      setError("Tick at least one Section 12 category.");
      return;
    }
    setError("");
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/legal-aid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categories,
          state: state || undefined,
          district: district || undefined,
          annualIncome: annualIncome === "" ? undefined : Number(annualIncome),
          court,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Could not check eligibility.");
        return;
      }
      setResult(json as AidResponse);
    } catch {
      setError("Could not reach the legal-aid route. Check the connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const meta = result ? STATUS[result.status] : null;
  const incomeOnly = categories.length === 1 && categories[0] === "low_income";

  return (
    <div className="screen-only">
      <div className="shell">
        <header className="page-head">
          <p className="page-kicker">Legal Services Authorities Act, 1987</p>
          <h1>Free legal aid is a statutory right.</h1>
          <p className="lede">
            Section 12 lists who is entitled to free legal services. A person in
            custody is on that list. This checker names the clause that applies,
            the income ceiling published by NALSA, and the exact office or
            helpline to use.
          </p>
        </header>

        <div className="aid-layout">
          <div>
            <section className="folio" style={{ borderTop: 0, paddingTop: 0 }}>
              <div className="folio-head">
                <span className="folio-mark">Screening</span>
                <h2>Which Section 12 category applies?</h2>
              </div>

              <div>
                {LEGAL_AID_CATEGORIES.map((c) => (
                  <label key={c.id} className="check">
                    <input
                      type="checkbox"
                      checked={categories.includes(c.id)}
                      onChange={() => toggle(c.id)}
                    />
                    <span className="check-text">
                      <span className="clause">{c.clause}</span>{" "}
                      <strong>{c.label}.</strong> {c.detail}
                    </span>
                  </label>
                ))}
              </div>

              <div className="form-grid" style={{ marginTop: 24 }}>
                <div className="field">
                  <label htmlFor="la-state">State / UT</label>
                  <select
                    id="la-state"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                  >
                    <option value="">Choose a State/UT</option>
                    {INCOME_LIMITS.map((r) => (
                      <option key={r.state} value={r.state}>
                        {r.state}
                      </option>
                    ))}
                  </select>
                  <p className="field-help">
                    The State ceiling applies to cases outside the Supreme Court.
                  </p>
                </div>
                <div className="field">
                  <label htmlFor="la-district">District (for the DLSA route)</label>
                  <input
                    id="la-district"
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="e.g. Ernakulam"
                  />
                  <p className="field-help">
                    Optional. If the district is not in the sourced directory,
                    the route says so.
                  </p>
                </div>
                <div className="field">
                  <label htmlFor="la-income">Annual income (₹)</label>
                  <input
                    id="la-income"
                    type="number"
                    min={0}
                    inputMode="numeric"
                    value={annualIncome}
                    onChange={(e) => setAnnualIncome(e.target.value)}
                    placeholder="e.g. 180000"
                    disabled={!categories.includes("low_income")}
                  />
                  <p className="field-help">
                    Only used for s.12(h). Tick the income category to enable it.
                  </p>
                </div>
                <div className="field">
                  <label htmlFor="la-court">Where is the case?</label>
                  <select
                    id="la-court"
                    value={court}
                    onChange={(e) =>
                      setCourt(e.target.value as "district" | "high" | "supreme")
                    }
                  >
                    <option value="district">District court</option>
                    <option value="high">High Court</option>
                    <option value="supreme">Supreme Court</option>
                  </select>
                  <p className="field-help">
                    Supreme Court cases use the ₹5,00,000 ceiling in NALSA's FAQ.
                  </p>
                </div>
              </div>

              <div className="btn-row">
                <button className="btn" onClick={check} disabled={loading}>
                  {loading ? "Checking…" : "Check eligibility"}
                </button>
                <span className="small">
                  {categories.length
                    ? `${categories.length} categor${categories.length === 1 ? "y" : "ies"} selected`
                    : "No category selected"}
                </span>
              </div>
              {error && (
                <div className="notice error" role="alert">
                  {error}
                </div>
              )}
            </section>

            {result && meta && (
              <section className="folio" aria-live="polite">
                <div className="folio-head">
                  <span className="folio-mark">Screening result</span>
                  <h2>{meta.plain}</h2>
                </div>

                <div className={`verdict-stamp ${meta.cls}`} style={{ marginBottom: 10 }}>
                  {meta.stamp}
                </div>
                <p className="result-clause">
                  Section 12, Legal Services Authorities Act, 1987 ·{" "}
                  {result.qualifiedBy.length
                    ? result.qualifiedBy.map((q) => q.clause).join(", ")
                    : "no clause matched"}
                </p>

                <p>{meta.detail}</p>

                {result.qualifiedBy.length > 0 && (
                  <>
                    <h3>The clauses that apply</h3>
                    <ul className="basis-list">
                      {result.qualifiedBy.map((q) => (
                        <li key={q.id}>
                          <div className="basis-head">
                            <span className="clause">{q.clause}</span>
                            <span className="basis-label">{q.label}</span>
                          </div>
                          <p className="basis-detail">{q.reason}</p>
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                {incomeOnly && result.status === "need_info" && (
                  <div className="notice">
                    <strong>Income is the only route selected.</strong> Enter the
                    annual income and choose a State/UT. The State's notified
                    ceiling is published in the table beside this form.
                  </div>
                )}

                <p className="small" style={{ marginTop: 14 }}>
                  <strong>Income ceiling used:</strong> {result.incomeLimitBasis}{" "}
                  {result.incomeLimit !== null && result.annualIncome !== null
                    ? `Your figure: ₹${result.annualIncome.toLocaleString("en-IN")}.`
                    : ""}
                </p>

                {result.dlsa?.matches.length ? (
                  <div className="office-card">
                    <h3>{result.dlsa.matches[0].officeName}</h3>
                    <p className="office-address">{result.dlsa.matches[0].address}</p>
                    <a
                      className="office-phone"
                      href={`tel:${result.dlsa.matches[0].phone
                        .split(",")[0]
                        .replace(/[^0-9+]/g, "")}`}
                    >
                      {result.dlsa.matches[0].phone}
                    </a>
                    <div className="office-meta">
                      <span>
                        <span className="source-tag">Sourced</span>{" "}
                        <a
                          href={result.dlsa.matches[0].sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          NALSA state page
                        </a>
                      </span>
                      <span>Accessed {result.dlsa.matches[0].accessedOn}</span>
                    </div>
                  </div>
                ) : (
                  <div className="notice">
                    <strong>DLSA office:</strong>{" "}
                    {result.dlsa?.message ??
                      "Add a district to look up a sourced office. The national helpline is 15100."}
                  </div>
                )}

                <h3>How to apply</h3>
                <ol className="route-list">
                  {result.route.map((r, i) => (
                    <li key={i}>
                      <span className="route-step">{r.step}</span>
                      <span className="route-detail">{r.detail}</span>
                    </li>
                  ))}
                </ol>

                <h3>Caveats</h3>
                <ul className="small" style={{ paddingLeft: 18 }}>
                  {result.caveats.map((c, i) => (
                    <li key={i} style={{ marginBottom: 5 }}>
                      {c}
                    </li>
                  ))}
                </ul>

                <div className="btn-row">
                  <a className="btn" href={NALSA_ONLINE_APPLICATION_URL} target="_blank" rel="noreferrer">
                    Open the NALSA application
                  </a>
                  <a className="btn secondary" href="tel:15100">
                    Call 15100
                  </a>
                  <a className="btn secondary" href="/dlsa">
                    Find the DLSA office
                  </a>
                </div>
              </section>
            )}
          </div>

          <aside className="aid-rail" aria-label="Section 12 reference">
            <div className="rail-block">
              <p className="rail-title">What Section 12 covers</p>
              <p className="rail-note">
                The list is not a favour. Section 12(a) to (h) of the Legal
                Services Authorities Act, 1987 names the categories. Section
                13(1) still requires a genuine case.
              </p>
              <ul className="basis-list">
                {LEGAL_AID_CATEGORIES.map((c) => (
                  <li key={c.id}>
                    <div className="basis-head">
                      <span className="clause">{c.clause}</span>
                      <span className="basis-label">{c.label}</span>
                    </div>
                  </li>
                ))}
              </ul>
              <p className="source-line">
                <span className="source-tag">Sourced</span>{" "}
                <a href={NALSA_LEGAL_AID_URL} target="_blank" rel="noreferrer">
                  NALSA legal-aid page
                </a>{" "}
                · accessed {INCOME_TABLE_ACCESSED_ON}
              </p>
            </div>

            <div className="rail-block">
              <p className="rail-title">State income ceiling, s.12(h)</p>
              <div className="income-scroll">
                <table className="register">
                  <thead>
                    <tr>
                      <th>State / UT</th>
                      <th className="num">Per year</th>
                    </tr>
                  </thead>
                  <tbody>
                    {INCOME_LIMITS.map((r) => (
                      <tr key={r.state} data-current={r.state === state}>
                        <td>{r.state}</td>
                        <td className="num">₹{r.limit.toLocaleString("en-IN")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="source-line">
                Reproduced from NALSA's published table on {INCOME_TABLE_ACCESSED_ON}.
                State Governments may revise the limit; confirm with the DLSA.
              </p>
            </div>

            <div className="rail-block">
              <p className="rail-title">If the form is hard to use</p>
              <p className="rail-note">
                Call the national free legal-aid helpline{" "}
                <a href="tel:15100">{NALSA_HELPLINE}</a>. A written application
                on plain paper is enough. The jail Superintendent and the DLSA
                secretary can also start the application for a person in
                custody.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

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
import { useI18n } from "@/components/I18nProvider";
import RichText from "@/components/RichText";
import type { MessageKey } from "@/lib/i18n/messages/en";

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

type PageError = { key: MessageKey } | { text: string } | null;

const STATUS: Record<
  "eligible" | "need_info" | "not_eligible",
  { stamp: MessageKey; cls: string; plain: MessageKey; detail: MessageKey }
> = {
  eligible: {
    stamp: "aid.status.eligible.stamp",
    cls: "green",
    plain: "aid.status.eligible.plain",
    detail: "aid.status.eligible.detail",
  },
  need_info: {
    stamp: "aid.status.need_info.stamp",
    cls: "blue",
    plain: "aid.status.need_info.plain",
    detail: "aid.status.need_info.detail",
  },
  not_eligible: {
    stamp: "aid.status.not_eligible.stamp",
    cls: "ink",
    plain: "aid.status.not_eligible.plain",
    detail: "aid.status.not_eligible.detail",
  },
};

const CAT_LABEL: Record<LegalAidCategoryId, MessageKey> = {
  sc_st: "aid.cat.sc_st.label",
  trafficking: "aid.cat.trafficking.label",
  woman: "aid.cat.woman.label",
  child: "aid.cat.child.label",
  disability: "aid.cat.disability.label",
  disaster: "aid.cat.disaster.label",
  industrial_workman: "aid.cat.industrial_workman.label",
  in_custody: "aid.cat.in_custody.label",
  low_income: "aid.cat.low_income.label",
};

const CAT_DETAIL: Record<LegalAidCategoryId, MessageKey> = {
  sc_st: "aid.cat.sc_st.detail",
  trafficking: "aid.cat.trafficking.detail",
  woman: "aid.cat.woman.detail",
  child: "aid.cat.child.detail",
  disability: "aid.cat.disability.detail",
  disaster: "aid.cat.disaster.detail",
  industrial_workman: "aid.cat.industrial_workman.detail",
  in_custody: "aid.cat.in_custody.detail",
  low_income: "aid.cat.low_income.detail",
};

const ROUTE_KEYS: Array<{ step: MessageKey; detail: MessageKey }> = [
  { step: "aid.route1.step", detail: "aid.route1.detail" },
  { step: "aid.route2.step", detail: "aid.route2.detail" },
  { step: "aid.route3.step", detail: "aid.route3.detail" },
  { step: "aid.route4.step", detail: "aid.route4.detail" },
];

const CAVEAT_KEYS: MessageKey[] = ["aid.caveat1", "aid.caveat2", "aid.caveat3"];

export default function LegalAidPage() {
  const { t } = useI18n();
  const [categories, setCategories] = useState<LegalAidCategoryId[]>([]);
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [annualIncome, setAnnualIncome] = useState("");
  const [court, setCourt] = useState<"district" | "high" | "supreme">("district");
  const [result, setResult] = useState<AidResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<PageError>(null);

  const toggle = (id: LegalAidCategoryId) =>
    setCategories((ids) =>
      ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]
    );

  const check = async () => {
    if (!categories.length) {
      setError({ key: "error.tickCategory" });
      return;
    }
    setError(null);
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
        setError(json.error ? { text: json.error } : { key: "error.aidRoute" });
        return;
      }
      setResult(json as AidResponse);
    } catch {
      setError({ key: "error.aidNetwork" });
    } finally {
      setLoading(false);
    }
  };

  const meta = result ? STATUS[result.status] : null;
  const incomeOnly = categories.length === 1 && categories[0] === "low_income";

  // The income-ceiling sentence is rebuilt from the result fields (court, state,
  // limit) so it renders in the visitor's language without touching the API.
  const incomeBasis = (() => {
    if (!result) return "";
    if (result.court === "supreme") return t("aid.ceilingSupreme");
    if (result.incomeLimit !== null && state) {
      return t("aid.ceilingState", {
        state,
        limit: result.incomeLimit.toLocaleString("en-IN"),
      });
    }
    if (state) return t("aid.ceilingNoRow");
    return t("aid.ceilingChoose");
  })();

  const clauseList = result
    ? result.qualifiedBy.length
      ? result.qualifiedBy.map((q) => q.clause).join(", ")
      : t("aid.noClause")
    : "";

  return (
    <div className="screen-only">
      <div className="shell">
        <header className="page-head">
          <p className="page-kicker">{t("aid.kicker")}</p>
          <h1>{t("aid.title")}</h1>
          <p className="lede">{t("aid.lede")}</p>
        </header>

        <div className="aid-layout">
          <div>
            <section className="folio" style={{ borderTop: 0, paddingTop: 0 }}>
              <div className="folio-head">
                <span className="folio-mark">{t("aid.screeningMark")}</span>
                <h2>{t("aid.screeningTitle")}</h2>
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
                      <strong>{t(CAT_LABEL[c.id])}.</strong> {t(CAT_DETAIL[c.id])}
                    </span>
                  </label>
                ))}
              </div>

              <div className="form-grid" style={{ marginTop: 24 }}>
                <div className="field">
                  <label htmlFor="la-state">{t("aid.state")}</label>
                  <select
                    id="la-state"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                  >
                    <option value="">{t("common.chooseState")}</option>
                    {INCOME_LIMITS.map((r) => (
                      <option key={r.state} value={r.state}>
                        {r.state}
                      </option>
                    ))}
                  </select>
                  <p className="field-help">{t("aid.stateHelp")}</p>
                </div>
                <div className="field">
                  <label htmlFor="la-district">{t("aid.district")}</label>
                  <input
                    id="la-district"
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder={t("aid.districtPlaceholder")}
                  />
                  <p className="field-help">{t("aid.districtHelp")}</p>
                </div>
                <div className="field">
                  <label htmlFor="la-income">{t("aid.income")}</label>
                  <input
                    id="la-income"
                    type="number"
                    min={0}
                    inputMode="numeric"
                    value={annualIncome}
                    onChange={(e) => setAnnualIncome(e.target.value)}
                    placeholder={t("aid.incomePlaceholder")}
                    disabled={!categories.includes("low_income")}
                  />
                  <p className="field-help">{t("aid.incomeHelp")}</p>
                </div>
                <div className="field">
                  <label htmlFor="la-court">{t("aid.court")}</label>
                  <select
                    id="la-court"
                    value={court}
                    onChange={(e) =>
                      setCourt(e.target.value as "district" | "high" | "supreme")
                    }
                  >
                    <option value="district">{t("aid.courtDistrict")}</option>
                    <option value="high">{t("aid.courtHigh")}</option>
                    <option value="supreme">{t("aid.courtSupreme")}</option>
                  </select>
                  <p className="field-help">{t("aid.courtHelp")}</p>
                </div>
              </div>

              <div className="btn-row">
                <button className="btn" onClick={check} disabled={loading}>
                  {loading ? t("common.checking") : t("aid.check")}
                </button>
                <span className="small">
                  {categories.length
                    ? categories.length === 1
                      ? t("aid.selectedOne")
                      : t("aid.selectedMany", { count: categories.length })
                    : t("aid.selectedNone")}
                </span>
              </div>
              {error && (
                <div className="notice error" role="alert">
                  {"key" in error ? t(error.key) : error.text}
                </div>
              )}
            </section>

            {result && meta && (
              <section className="folio" aria-live="polite">
                <div className="folio-head">
                  <span className="folio-mark">{t("aid.resultMark")}</span>
                  <h2>{t(meta.plain)}</h2>
                </div>

                <div className={`verdict-stamp ${meta.cls}`} style={{ marginBottom: 10 }}>
                  {t(meta.stamp)}
                </div>
                <p className="result-clause">
                  {t("aid.resultClause", { clauses: clauseList })}
                </p>

                <p>{t(meta.detail)}</p>

                {result.qualifiedBy.length > 0 && (
                  <>
                    <h3>{t("aid.clausesTitle")}</h3>
                    <ul className="basis-list">
                      {result.qualifiedBy.map((q) => (
                        <li key={q.id}>
                          <div className="basis-head">
                            <span className="clause">{q.clause}</span>
                            <span className="basis-label">{t(CAT_LABEL[q.id])}</span>
                          </div>
                          <p className="basis-detail">
                            {q.id === "low_income" &&
                            result.annualIncome !== null &&
                            result.incomeLimit !== null
                              ? t("aid.reasonLowIncome", {
                                  income: result.annualIncome.toLocaleString("en-IN"),
                                  limit: result.incomeLimit.toLocaleString("en-IN"),
                                })
                              : t(CAT_DETAIL[q.id])}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                {incomeOnly && result.status === "need_info" && (
                  <div className="notice">
                    <strong>{t("aid.incomeOnlyTitle")}</strong>{" "}
                    {t("aid.incomeOnlyBody")}
                  </div>
                )}

                <p className="small" style={{ marginTop: 14 }}>
                  <strong>{t("aid.ceilingUsed")}</strong> {incomeBasis}{" "}
                  {result.incomeLimit !== null && result.annualIncome !== null
                    ? t("aid.yourFigure", {
                        amount: result.annualIncome.toLocaleString("en-IN"),
                      })
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
                        <span className="source-tag">{t("common.sourced")}</span>{" "}
                        <a
                          href={result.dlsa.matches[0].sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {t("common.nalsaPage")}
                        </a>
                      </span>
                      <span>
                        {t("common.accessedDate", {
                          date: result.dlsa.matches[0].accessedOn,
                        })}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="notice">
                    <strong>{t("aid.dlsaOffice")}</strong>{" "}
                    {t("aid.dlsaFallback")}
                  </div>
                )}

                <h3>{t("aid.howTitle")}</h3>
                <ol className="route-list">
                  {result.route.map((r, i) => {
                    const keys = ROUTE_KEYS[i];
                    return (
                      <li key={i}>
                        <span className="route-step">
                          {keys ? t(keys.step) : r.step}
                        </span>
                        <span className="route-detail">
                          {keys
                            ? t(keys.detail, {
                                url: NALSA_ONLINE_APPLICATION_URL,
                                helpline: NALSA_HELPLINE,
                              })
                            : r.detail}
                        </span>
                      </li>
                    );
                  })}
                </ol>

                <h3>{t("aid.caveatsTitle")}</h3>
                <ul className="small" style={{ paddingLeft: 18 }}>
                  {result.caveats.map((c, i) => (
                    <li key={i} style={{ marginBottom: 5 }}>
                      {CAVEAT_KEYS[i] ? t(CAVEAT_KEYS[i]) : c}
                    </li>
                  ))}
                </ul>

                <div className="btn-row">
                  <a className="btn" href={NALSA_ONLINE_APPLICATION_URL} target="_blank" rel="noreferrer">
                    {t("aid.openApplication")}
                  </a>
                  <a className="btn secondary" href="tel:15100">
                    {t("aid.call")}
                  </a>
                  <a className="btn secondary" href="/dlsa">
                    {t("aid.findDlsa")}
                  </a>
                </div>
              </section>
            )}
          </div>

          <aside className="aid-rail" aria-label={t("aid.asideLabel")}>
            <div className="rail-block">
              <p className="rail-title">{t("aid.coversTitle")}</p>
              <p className="rail-note">{t("aid.coversNote")}</p>
              <ul className="basis-list">
                {LEGAL_AID_CATEGORIES.map((c) => (
                  <li key={c.id}>
                    <div className="basis-head">
                      <span className="clause">{c.clause}</span>
                      <span className="basis-label">{t(CAT_LABEL[c.id])}</span>
                    </div>
                  </li>
                ))}
              </ul>
              <p className="source-line">
                <RichText
                  template={t("aid.sourceLine")}
                  values={{
                    link: (
                      <a href={NALSA_LEGAL_AID_URL} target="_blank" rel="noreferrer">
                        {t("aid.nalsaAidPage")}
                      </a>
                    ),
                    date: INCOME_TABLE_ACCESSED_ON,
                  }}
                />
              </p>
            </div>

            <div className="rail-block">
              <p className="rail-title">{t("aid.ceilingTitle")}</p>
              <div className="income-scroll">
                <table className="register">
                  <thead>
                    <tr>
                      <th>{t("aid.colState")}</th>
                      <th className="num">{t("aid.perYear")}</th>
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
                {t("aid.tableNote", { date: INCOME_TABLE_ACCESSED_ON })}
              </p>
            </div>

            <div className="rail-block">
              <p className="rail-title">{t("aid.hardTitle")}</p>
              <p className="rail-note">
                <RichText
                  template={t("aid.hardNote")}
                  values={{
                    helpline: <a href="tel:15100">{NALSA_HELPLINE}</a>,
                  }}
                />
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

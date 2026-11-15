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
import { useI18n } from "@/components/I18nProvider";
import RichText from "@/components/RichText";
import { bnsMaxKey, bnsTitleKey } from "@/lib/i18n/labels";

interface Summary {
  states: number;
  offices: number;
  accessedOn: string;
  caveat: string;
  rows: Array<{ state: string; offices: number; districts: number; sourceUrl: string }>;
}

export default function Sources() {
  const { t } = useI18n();
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
          <p className="page-kicker">{t("sources.kicker")}</p>
          <h1>{t("sources.title")}</h1>
          <p className="lede">{t("sources.lede")}</p>
        </header>

        <div className="case-layout" style={{ paddingTop: 34 }}>
          <div className="document">
            <section className="folio" style={{ paddingTop: 0 }}>
              <div className="folio-head">
                <span className="folio-mark">01</span>
                <h2>{t("sources.s1.title")}</h2>
              </div>
              <p>
                <RichText
                  template={t("sources.authority")}
                  values={{
                    authority: (
                      <a href={BNSS479_SOURCE_URL} target="_blank" rel="noreferrer">
                        {t("sources.authorityBnss")}
                      </a>
                    ),
                  }}
                />{" "}
                {t("sources.authorityNote")}
              </p>
              <div className="verbatim" lang="en" dir="ltr">
                {BNSS479_VERBATIM}
              </div>
              <p className="small" style={{ marginTop: 12 }}>
                <RichText
                  template={t("sources.quoteNote")}
                  values={{
                    quote: (
                      <span className="mono" lang="en">
                        {BNSS479_QUOTE.sub1.slice(0, 96)}…
                      </span>
                    ),
                  }}
                />
              </p>
              <ul className="small" style={{ paddingLeft: 18 }}>
                <li>
                  <strong>s.479(1):</strong> {t("sources.bullet479a")}
                </li>
                <li>
                  <strong>{t("sources.labelExclusion")}</strong>{" "}
                  {t("sources.bulletExclusion")}
                </li>
                <li>
                  <strong>{t("sources.labelExplanation")}</strong>{" "}
                  {t("sources.bulletExplanation")}
                </li>
                <li>
                  <strong>s.479(2):</strong> {t("sources.bullet479b")}
                </li>
                <li>
                  <strong>{t("sources.labelThird")}</strong> {t("sources.bulletThird")}
                </li>
                <li>
                  <strong>{t("sources.labelFourth")}</strong>{" "}
                  {t("sources.bulletFourth")}
                </li>
                <li>
                  <strong>s.479(3):</strong> {t("sources.bullet479c")}
                </li>
              </ul>
            </section>

            <section className="folio">
              <div className="folio-head">
                <span className="folio-mark">02</span>
                <h2>{t("sources.s2.title")}</h2>
              </div>
              <p>
                <RichText
                  template={t("sources.bnsAuthority")}
                  values={{
                    authority: (
                      <a
                        href="https://www.indiacode.nic.in/handle/123456789/20062"
                        target="_blank"
                        rel="noreferrer"
                      >
                        {t("sources.bnsAuthorityLink")}
                      </a>
                    ),
                  }}
                />{" "}
                {t("sources.bnsAuthorityNote")}
              </p>
              <div className="table-scroll">
                <table className="register">
                  <thead>
                    <tr>
                      <th>{t("sources.colSection")}</th>
                      <th>{t("sources.colOffence")}</th>
                      <th>{t("sources.colMaximum")}</th>
                      <th>{t("sources.colSource")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {BNS_SECTIONS.map((s) => {
                      const titleKey = bnsTitleKey(s.id);
                      const maxKey = bnsMaxKey(s.id);
                      return (
                        <tr key={s.id}>
                          <td className="mono row-strong">{s.label}</td>
                          <td>
                            {titleKey ? t(titleKey) : s.title}
                            <br />
                            <span className="small" lang="en">
                              {s.note}
                            </span>
                          </td>
                          <td>{maxKey ? t(maxKey) : s.maxSentenceLabel}</td>
                          <td className="small">
                            <a href={s.sourceUrl} target="_blank" rel="noreferrer">
                              {t("sources.indiaCode")}
                            </a>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="folio">
              <div className="folio-head">
                <span className="folio-mark">03</span>
                <h2>{t("sources.s3.title")}</h2>
              </div>
              <p>
                <RichText
                  template={t("sources.ncrb")}
                  values={{
                    total: (
                      <strong>
                        {NCRB_2024.totalPrisonersEnd2024.toLocaleString("en-IN")}
                      </strong>
                    ),
                    undertrials: (
                      <strong>
                        {NCRB_2024.undertrialsEnd2024.toLocaleString("en-IN")}
                      </strong>
                    ),
                    share: <strong>{NCRB_2024.undertrialSharePct}</strong>,
                    report: NCRB_2024.report,
                    link: (
                      <a href={NCRB_2024.reportUrl} target="_blank" rel="noreferrer">
                        {t("sources.reportPdf")}
                      </a>
                    ),
                  }}
                />
              </p>
              <p className="small">{t("sources.ncrbCheck")}</p>
            </section>

            <section className="folio">
              <div className="folio-head">
                <span className="folio-mark">04</span>
                <h2>{t("sources.s4.title")}</h2>
              </div>
              <p>
                <RichText
                  template={t("sources.dataGov")}
                  values={{
                    resource: <strong>{DATA_GOV_RESOURCE_TITLE}</strong>,
                    period: DATA_GOV_PERIOD,
                    link: (
                      <a href={DATA_GOV_SOURCE_URL} target="_blank" rel="noreferrer">
                        {t("sources.dataGovLink")}
                      </a>
                    ),
                  }}
                />
              </p>
              <p className="small">{t("sources.dataGovNote")}</p>
            </section>

            <section className="folio">
              <div className="folio-head">
                <span className="folio-mark">05</span>
                <h2>{t("sources.s5.title")}</h2>
              </div>
              <p>
                <RichText
                  template={t("sources.aidAuthority")}
                  values={{
                    act: (
                      <a href={NALSA_ACT_URL} target="_blank" rel="noreferrer">
                        {t("sources.actNalsaLink")}
                      </a>
                    ),
                  }}
                />{" "}
                <RichText
                  template={t("sources.aidAuthorityNote")}
                  values={{
                    page: (
                      <a href={NALSA_LEGAL_AID_URL} target="_blank" rel="noreferrer">
                        {t("sources.nalsaAidPage")}
                      </a>
                    ),
                    date: INCOME_TABLE_ACCESSED_ON,
                  }}
                />
              </p>
              <p className="small">
                <RichText
                  template={t("sources.aidNote")}
                  values={{
                    helpline: NALSA_HELPLINE,
                    link: (
                      <a
                        href={NALSA_ONLINE_APPLICATION_URL}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {t("sources.nalsaApplication")}
                      </a>
                    ),
                  }}
                />
              </p>
            </section>

            <section className="folio">
              <div className="folio-head">
                <span className="folio-mark">06</span>
                <h2>{t("sources.s6.title")}</h2>
              </div>
              <p>
                {summary ? (
                  <RichText
                    template={t("sources.dlsaSummary")}
                    values={{
                      offices: summary.offices,
                      states: summary.states,
                      date: summary.accessedOn,
                    }}
                  />
                ) : (
                  t("sources.loadingSummary")
                )}{" "}
                <RichText
                  template={t("sources.dlsaNote")}
                  values={{
                    path: <code>data/dlsa-contacts.csv</code>,
                    link: <a href="/dlsa">{t("sources.openDlsa")}</a>,
                  }}
                />
              </p>
              {summary && (
                <>
                  <p className="small">{t("dlsa.caveat")}</p>
                  <div className="table-scroll">
                    <table className="register">
                      <thead>
                        <tr>
                          <th>{t("sources.colState")}</th>
                          <th className="num">{t("sources.colOffices")}</th>
                          <th>{t("sources.colSourcePage")}</th>
                          <th>{t("sources.colAccessed")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {summary.rows.map((r) => (
                          <tr key={r.state}>
                            <td>{r.state}</td>
                            <td className="num">{r.offices}</td>
                            <td className="small">
                              <a href={r.sourceUrl} target="_blank" rel="noreferrer">
                                {t("common.nalsaPage")}
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
                <h2>{t("sources.s7.title")}</h2>
              </div>
              <ul className="small" style={{ paddingLeft: 18 }}>
                <li>
                  <strong>{t("sources.notEstimated")}</strong>{" "}
                  {t("sources.estimatedNot")}
                </li>
                <li>
                  <strong>{t("sources.estimatedLabel")}</strong>{" "}
                  {t("sources.estimatedText")}
                </li>
                <li>
                  <strong>{t("sources.liveNot")}</strong> {t("sources.liveText")}
                </li>
                <li>
                  <strong>{t("sources.adviceNot")}</strong> {t("sources.adviceText")}
                </li>
              </ul>
            </section>

            <section className="folio">
              <div className="folio-head">
                <span className="folio-mark">08</span>
                <h2>{t("sources.s8.title")}</h2>
              </div>
              <p className="small">
                <RichText
                  template={t("sources.probe")}
                  values={{
                    link: (
                      <a href={NJDG_DASHBOARD_URL} target="_blank" rel="noreferrer">
                        {t("sources.probeLink")}
                      </a>
                    ),
                  }}
                />
              </p>
              <details>
                <summary className="small" style={{ cursor: "pointer" }}>
                  {t("sources.showProbe")}
                </summary>
                <pre className="verbatim" dir="ltr" style={{ marginTop: 12 }}>
                  {JSON.stringify(health, null, 2)}
                </pre>
              </details>
            </section>
          </div>

          <aside className="rail" aria-label={t("sources.asideLabel")}>
            <div className="rail-block">
              <p className="rail-title">{t("sources.sourceRegister")}</p>
              <div className="source-list">
                <div className="source-row">
                  <div>
                    <span className="source-name">{t("sources.srcBnss")}</span>
                    <span className="source-detail">{t("sources.srcBnssDetail")}</span>
                  </div>
                  <a className="source-link" href={BNSS479_SOURCE_URL} target="_blank" rel="noreferrer">
                    {t("sources.indiaCode")}
                  </a>
                </div>
                <div className="source-row">
                  <div>
                    <span className="source-name">{t("sources.srcBns")}</span>
                    <span className="source-detail">{t("sources.srcBnsDetail")}</span>
                  </div>
                  <a
                    className="source-link"
                    href="https://www.indiacode.nic.in/handle/123456789/20062"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {t("sources.indiaCode")}
                  </a>
                </div>
                <div className="source-row">
                  <div>
                    <span className="source-name">{t("sources.srcNcrb")}</span>
                    <span className="source-detail">{t("sources.srcNcrbDetail")}</span>
                  </div>
                  <a className="source-link" href={NCRB_2024.reportUrl} target="_blank" rel="noreferrer">
                    {t("sources.reportPdf")}
                  </a>
                </div>
                <div className="source-row">
                  <div>
                    <span className="source-name">{t("sources.srcDataGov")}</span>
                    <span className="source-detail">{t("sources.srcDataGovDetail")}</span>
                  </div>
                  <a className="source-link" href={DATA_GOV_SOURCE_URL} target="_blank" rel="noreferrer">
                    {t("sources.dataGovLink")}
                  </a>
                </div>
                <div className="source-row">
                  <div>
                    <span className="source-name">{t("sources.srcNalsa")}</span>
                    <span className="source-detail">{t("sources.srcNalsaDetail")}</span>
                  </div>
                  <a className="source-link" href={NALSA_LEGAL_AID_URL} target="_blank" rel="noreferrer">
                    {t("sources.legalAid")}
                  </a>
                </div>
                <div className="source-row">
                  <div>
                    <span className="source-name">{t("sources.srcNalsaDlsa")}</span>
                    <span className="source-detail">{t("sources.srcNalsaDlsaDetail")}</span>
                  </div>
                  <a className="source-link" href="https://nalsa.gov.in/" target="_blank" rel="noreferrer">
                    {t("sources.srcNalsa")}
                  </a>
                </div>
              </div>
            </div>
            <div className="rail-block">
              <p className="rail-title">{t("sources.accessTitle")}</p>
              <p className="rail-note">{t("sources.accessNote")}</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

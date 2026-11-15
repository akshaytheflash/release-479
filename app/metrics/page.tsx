"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/components/I18nProvider";
import RichText from "@/components/RichText";

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
  const { t } = useI18n();
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
          <p className="page-kicker">{t("metrics.kicker")}</p>
          <h1>{t("metrics.title")}</h1>
          <p className="lede">{t("metrics.lede")}</p>
        </header>

        <div className="case-layout" style={{ paddingTop: 28 }}>
          <div className="document">
            <section className="folio" style={{ paddingTop: 0 }}>
              <div className="folio-head">
                <span className="folio-mark">{t("metrics.registerMark")}</span>
                <h2>{t("metrics.submissionTitle")}</h2>
              </div>

              {m ? (
                <>
                  <div className="table-scroll">
                    <table className="register">
                      <thead>
                        <tr>
                          <th>{t("metrics.colNumber")}</th>
                          <th>{t("metrics.colCounts")}</th>
                          <th className="num">{t("metrics.colValue")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="row-strong">{t("metrics.rowScreened")}</td>
                          <td>{t("metrics.rowScreenedDetail")}</td>
                          <td className="num">{m.template?.screened_N ?? 0}</td>
                        </tr>
                        <tr>
                          <td className="row-strong">{t("metrics.rowOver")}</td>
                          <td>{t("metrics.rowOverDetail")}</td>
                          <td className="num">{m.template?.overDetainedFound ?? 0}</td>
                        </tr>
                        <tr>
                          <td className="row-strong">{t("metrics.rowFiled")}</td>
                          <td>{t("metrics.rowFiledDetail")}</td>
                          <td className="num">{m.template?.applicationsFiled ?? 0}</td>
                        </tr>
                        <tr>
                          <td className="row-strong">{t("metrics.rowReleased")}</td>
                          <td>{t("metrics.rowReleasedDetail")}</td>
                          <td className="num">{m.template?.releasesSecured ?? 0}</td>
                        </tr>
                        <tr>
                          <td>{t("metrics.rowDemo")}</td>
                          <td>{t("metrics.rowDemoDetail")}</td>
                          <td className="num">{m.demoRows}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="notice">
                    <RichText
                      template={t("metrics.notice")}
                      values={{
                        asOf: m.template ? (
                          <strong>
                            {t("metrics.asOf", { date: m.template.date })}
                          </strong>
                        ) : null,
                      }}
                    />
                  </div>

                  <h3>{t("metrics.copyTitle")}</h3>
                  <pre className="verbatim" dir="ltr">
                    {JSON.stringify(m.template, null, 2)}
                  </pre>
                  <div className="btn-row">
                    <button className="btn secondary" onClick={copy}>
                      {copied ? t("common.copied") : t("metrics.copy")}
                    </button>
                    <a className="btn secondary" href="/dashboard">
                      {t("metrics.openRegister")}
                    </a>
                  </div>
                </>
              ) : (
                <p className="small">{t("common.readingRegister")}</p>
              )}
            </section>

            <section className="folio">
              <div className="folio-head">
                <span className="folio-mark">{t("metrics.methodMark")}</span>
                <h2>{t("metrics.methodTitle")}</h2>
              </div>
              <ol className="route-list">
                <li>
                  <span className="route-step">{t("metrics.stepImport")}</span>
                  <span className="route-detail">{t("metrics.stepImportDetail")}</span>
                </li>
                <li>
                  <span className="route-step">{t("metrics.stepScreen")}</span>
                  <span className="route-detail">{t("metrics.stepScreenDetail")}</span>
                </li>
                <li>
                  <span className="route-step">{t("metrics.stepFile")}</span>
                  <span className="route-detail">{t("metrics.stepFileDetail")}</span>
                </li>
                <li>
                  <span className="route-step">{t("metrics.stepRelease")}</span>
                  <span className="route-detail">{t("metrics.stepReleaseDetail")}</span>
                </li>
              </ol>
            </section>
          </div>

          <aside className="rail" aria-label={t("metrics.railLabel")}>
            <div className="rail-block">
              <p className="rail-title">{t("metrics.ruleTitle")}</p>
              <p className="rail-note">{t("metrics.ruleNote")}</p>
            </div>
            <div className="rail-block">
              <p className="rail-title">{t("metrics.notClaimTitle")}</p>
              <p className="rail-note">{t("metrics.notClaimNote")}</p>
            </div>
            <div className="rail-block">
              <p className="rail-title">{t("metrics.sourceTitle")}</p>
              <p className="rail-note">
                <RichText
                  template={t("metrics.sourceNote")}
                  values={{
                    endpoint: <code>/api/metrics</code>,
                    link: <a href="/sources">{t("nav.sources")}</a>,
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

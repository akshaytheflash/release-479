"use client";

import { useI18n } from "@/components/I18nProvider";
import { formatDateEn } from "@/lib/application";

interface TimelineProps {
  detentionStart: string;
  today: string;
  eligibilityDate: string | null;
  daysDetained: number;
  thresholdDays: number;
  maxDays: number;
  status: string;
}

export default function DetentionTimeline({
  detentionStart,
  today,
  eligibilityDate,
  daysDetained,
  thresholdDays,
  maxDays,
  status,
}: TimelineProps) {
  const { t } = useI18n();
  const items = [
    {
      date: detentionStart,
      label: t("timeline.custodyBegins"),
      detail: t("timeline.custodyBeginsDetail"),
      cls: "start",
    },
    {
      date: today,
      label: t("timeline.today"),
      detail: t("timeline.todayDetail", { days: daysDetained }),
      cls: "today",
    },
    ...(eligibilityDate
      ? [
          {
            date: eligibilityDate,
            label:
              status === "NOT_YET"
                ? t("timeline.releaseDate")
                : t("timeline.releaseDateReached"),
            detail:
              status === "NOT_YET"
                ? t("timeline.releaseDetailNotYet")
                : t("timeline.releaseDetailDone"),
            cls: "eligibility",
          },
        ]
      : []),
  ].sort((a, b) => a.date.localeCompare(b.date));

  const max = Math.max(maxDays, daysDetained, 1);
  const servedPct = Math.min(100, (daysDetained / max) * 100);
  const thresholdPct = Math.min(100, (thresholdDays / max) * 100);

  return (
    <div>
      <div className="detention-bar" aria-hidden="true">
        <span className="served" style={{ width: `${servedPct}%` }} />
        <span className="remaining" style={{ width: `${100 - servedPct}%` }} />
      </div>
      <div className="detention-scale">
        <span>{t("timeline.scaleStart")}</span>
        <span>{t("timeline.scaleThreshold", { days: thresholdDays })}</span>
        <span>{t("timeline.scaleMax", { days: maxDays })}</span>
      </div>
      <div
        style={{
          fontFamily: "var(--sans)",
          fontSize: 10.5,
          color: "var(--ink-faint)",
          marginTop: 2,
        }}
      >
        {t("timeline.explain", { pct: Math.round(thresholdPct) })}
      </div>

      <div className="timeline">
        {items.map((item) => (
          <div key={item.cls} className={`tl-item ${item.cls}`}>
            <span className="tl-date">{formatDateEn(item.date)}</span>
            <span className="tl-label">{item.label}</span>
            <span className="tl-detail">{item.detail}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

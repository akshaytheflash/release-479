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
  const items = [
    {
      date: detentionStart,
      label: "Custody begins",
      detail: "First day counted as detention.",
      cls: "start",
    },
    {
      date: today,
      label: "Today",
      detail: `${daysDetained} effective days in custody.`,
      cls: "today",
    },
    ...(eligibilityDate
      ? [
          {
            date: eligibilityDate,
            label:
              status === "NOT_YET"
                ? "Statutory release date"
                : "Statutory release date reached",
            detail:
              status === "NOT_YET"
                ? "The 1/3 or 1/2 period completes on this date."
                : "The 1/3 or 1/2 period was completed on this date.",
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
        <span>0 days</span>
        <span>1/3 or 1/2: {thresholdDays} days</span>
        <span>max: {maxDays} days</span>
      </div>
      <div
        style={{
          fontFamily: "var(--sans)",
          fontSize: 10.5,
          color: "var(--ink-faint)",
          marginTop: 2,
        }}
      >
        The bar is scaled to the maximum sentence. The threshold sits at{" "}
        {Math.round(thresholdPct)}% of that maximum.
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

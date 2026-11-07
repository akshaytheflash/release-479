"use client";

import { useEffect, useState } from "react";

/**
 * The custody clock, kept in the corner of the file.
 *
 * A family reading this page cares about one number — how many days their
 * person has been inside versus how many the statute requires. That answer
 * shouldn't be something you scroll back up to find. This appears once the
 * computation is out of view.
 */
export default function FloatingClock({
  daysServed,
  thresholdDays,
  status,
  eligibilityDate,
}: {
  daysServed: number;
  thresholdDays: number;
  status: string;
  eligibilityDate: string | null;
}) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = document.getElementById("result");
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setShown(!e.isIntersecting), {
      rootMargin: "-120px 0px 0px 0px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  if (!shown) return null;

  const pct = thresholdDays > 0 ? Math.min(100, Math.round((daysServed / thresholdDays) * 100)) : 0;
  const over = daysServed - thresholdDays;

  return (
    <aside className={`float-clock ${status === "ELIGIBLE_NOW" || over >= 0 ? "is-due" : ""}`} aria-label="Custody clock">
      <p className="fc-label">Days in custody</p>
      <p className="fc-served">
        {daysServed.toLocaleString("en-IN")}
        <span> of {thresholdDays.toLocaleString("en-IN")} required</span>
      </p>
      <div className="fc-track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
        <span style={{ width: `${Math.min(100, pct)}%` }} />
      </div>
      <p className="fc-note">
        {over >= 0
          ? `Over the limit by ${over.toLocaleString("en-IN")} ${over === 1 ? "day" : "days"}`
          : `${Math.abs(over).toLocaleString("en-IN")} days still to serve`}
        {eligibilityDate && over >= 0 && <em> · due {eligibilityDate}</em>}
      </p>
    </aside>
  );
}

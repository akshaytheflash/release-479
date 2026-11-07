import test from "node:test";
import assert from "node:assert/strict";
import {
  addDays,
  computeEligibility,
  daysBetween,
} from "../lib/eligibility";

/**
 * Fixed "today" so the assertions never drift. 2026-11-06 is the date the
 * statute and datasets were verified.
 */
const TODAY = "2026-11-06";

test("first-time theft: 1/3 of 3 years is 365 days", () => {
  const r = computeEligibility({
    sectionIds: ["bns303"],
    detentionStart: "2024-06-15",
    firstTimeOffender: true,
    pendingOtherCases: false,
    today: TODAY,
  });
  assert.equal(r.status, "ELIGIBLE_NOW");
  assert.equal(r.fraction, 1 / 3);
  assert.equal(r.releaseMode, "bond");
  assert.equal(r.governingThresholdDays, 365);
  assert.equal(r.eligibilityDate, "2025-06-15");
  assert.equal(r.daysDetainedEffective, 874);
  assert.equal(r.daysOverLimit, 509);
  assert.equal(r.daysUntilEligible, 0);
});

test("not first-time: 1/2 of 3 years is 548 days", () => {
  const r = computeEligibility({
    sectionIds: ["bns303"],
    detentionStart: "2024-06-15",
    firstTimeOffender: false,
    pendingOtherCases: false,
    today: TODAY,
  });
  assert.equal(r.fraction, 1 / 2);
  assert.equal(r.releaseMode, "bail");
  assert.equal(r.governingThresholdDays, 548);
  assert.equal(r.eligibilityDate, "2025-12-15");
  assert.equal(r.daysOverLimit, 326);
});

test("multiple charges: the latest date governs", () => {
  const r = computeEligibility({
    sectionIds: ["bns303", "bns117"],
    detentionStart: "2024-06-15",
    firstTimeOffender: true,
    pendingOtherCases: false,
    today: TODAY,
  });
  assert.equal(r.status, "ELIGIBLE_NOW");
  assert.equal(r.governingSectionId, "bns117");
  assert.equal(r.governingMaxYears, 7);
  assert.equal(r.governingThresholdDays, 852);
  assert.equal(r.eligibilityDate, "2026-10-15");
  assert.equal(r.daysOverLimit, 22);
});

test("s.479(2): pending other cases blocks release", () => {
  const r = computeEligibility({
    sectionIds: ["bns303"],
    detentionStart: "2024-06-15",
    firstTimeOffender: true,
    pendingOtherCases: true,
    today: TODAY,
  });
  assert.equal(r.status, "BLOCKED_PENDING_OTHER_CASES");
  assert.equal(r.daysOverLimit, 509);
  assert.ok(r.notes.some((n) => n.includes("479(2)")));
});

test("accused-caused delay is excluded from detention and added to the date", () => {
  const r = computeEligibility({
    sectionIds: ["bns303"],
    detentionStart: "2024-06-15",
    firstTimeOffender: true,
    pendingOtherCases: false,
    accusedDelayDays: 100,
    today: TODAY,
  });
  assert.equal(r.eligibilityDate, "2025-09-23");
  assert.equal(r.daysDetainedEffective, 774);
  assert.equal(r.daysOverLimit, 409);
  assert.equal(r.accusedDelayDays, 100);
});

test("leap day is counted: 1 Jan 2024 + 365 days is 31 Dec 2024", () => {
  assert.equal(addDays("2024-01-01", 365), "2024-12-31");
  const r = computeEligibility({
    sectionIds: ["bns303"],
    detentionStart: "2024-01-01",
    firstTimeOffender: true,
    pendingOtherCases: false,
    today: TODAY,
  });
  assert.equal(r.eligibilityDate, "2024-12-31");
});

test("not yet eligible reports the days remaining", () => {
  const r = computeEligibility({
    sectionIds: ["bns303"],
    detentionStart: "2025-01-01",
    firstTimeOffender: true,
    pendingOtherCases: false,
    today: "2025-06-01",
  });
  assert.equal(r.status, "NOT_YET");
  assert.equal(r.daysDetainedEffective, 151);
  assert.equal(r.daysUntilEligible, 214);
  assert.equal(r.daysOverLimit, 0);
});

test("the exact threshold day counts as eligible", () => {
  const r = computeEligibility({
    sectionIds: ["bns303"],
    detentionStart: "2025-01-01",
    firstTimeOffender: true,
    pendingOtherCases: false,
    today: "2026-01-01", // 365 days later
  });
  assert.equal(r.daysDetainedEffective, 365);
  assert.equal(r.status, "ELIGIBLE_NOW");
  assert.equal(r.daysOverLimit, 0);
});

test("4th proviso: detention beyond the maximum sentence is a ceiling breach", () => {
  const r = computeEligibility({
    sectionIds: ["bns303"],
    detentionStart: "2021-01-01",
    firstTimeOffender: true,
    pendingOtherCases: false,
    today: TODAY,
  });
  assert.equal(r.status, "CEILING_BREACHED");
  assert.equal(r.ceilingDays, 1095);
  assert.ok(r.daysDetainedEffective > 1095);
});

test("unknown section id fails closed", () => {
  const r = computeEligibility({
    sectionIds: ["ipc379"],
    detentionStart: "2024-06-15",
    firstTimeOffender: true,
    pendingOtherCases: false,
    today: TODAY,
  });
  assert.equal(r.status, "UNKNOWN_SECTION");
  assert.equal(r.eligibilityDate, null);
});

test("daysBetween is a pure calendar-day count", () => {
  assert.equal(daysBetween("2024-01-01", "2024-01-31"), 30);
  assert.equal(daysBetween("2024-02-28", "2024-03-01"), 2); // leap year
  assert.equal(daysBetween("2025-02-28", "2025-03-01"), 1);
});

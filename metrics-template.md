# Submission metrics — 479 (BNSS Section 479 eligibility engine)

Deployment date: __________
District / DLSA: __________
Jail: __________

| Metric | Count | Source |
|---|---|---|
| Screened (N, real imports) | | /dashboard real rows |
| Over-detained found | | ELIGIBLE_NOW + CEILING_BREACHED on /metrics |
| Applications filed | | status = APPLICATION_FILED |
| Releases secured | | status = RELEASED (verified order) |

**Method:** One DB row per screened undertrial (DLSA CSV import only; demo
sample rows have `is_sample=1` and are excluded). Over-detained computed at
today's date against the per-case 1/3 (first-time) / 1/2 eligibility date.
Release counted only after court order / jail memo verification — never on
draft generation. Legal information tool, not legal advice.

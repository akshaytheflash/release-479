# 479 — BNSS Section 479 Undertrial Release Eligibility Engine

> **Legal information tool, not legal advice. Verify with DLSA/advocate.**

## The problem (wanted)

BNSS Section 479 *mandates* release of undertrials at **1/3 of the maximum sentence for first-time offenders, 1/2 otherwise** — but nothing computes those dates. Jail registers are manual; families don't know the fraction; the statutory 1/3–1/2 clock runs silently while people sit past the legal limit. This is a computation gap, not an information gap — which is why this is **not a Q&A chatbot**: it produces **release eligibility dates + filed-ready draft applications + an over-detained list**.

NCRB, *Prison Statistics India 2024*: **5,11,542 prisoners at end-2024, of which 3,71,440 undertrials (72.6%)** — awaiting trial, i.e. inside the Section 479 window. Report: `https://www.ncrb.mha.gov.in/uploads/files/PSI-2024ason26022026.pdf`

## How it works

1. **Inputs** — charged BNS section(s), detention-start date, first-time-offender flag, pending-other-cases flag, accused-caused delay (days).
2. **Max-sentence lookup** — each supported section carries its statutory **maximum imprisonment** + the **verbatim punishment clause** sourced from the Bharatiya Nyaya Sanhita, 2023 via India Code (`https://www.indiacode.nic.in/handle/123456789/20062`). Eleven entries: BNS 115 (1y), 329(3) (1y), 351(2) (2y), 303(2) (3y), 318(2) (3y), 316(2) (5y), 117(2) (7y), 351(3) (7y), 318(4) (7y), 309(4) (10y), 109(1) (10y, no-hurt variant). No invented sentences; the full table + mirrors are on `/sources`.
3. **Eligibility engine** (`lib/eligibility.ts`, pure & testable) — verbatim BNSS 479 (`https://www.indiacode.nic.in/handle/123456789/20099`; verbatim text embedded in `lib/bnss479.ts`, verified against Indian Kanoon mirror `indiankanoon.org/doc/87702491`, fetched 2026-11-06; India Code blocks automated fetch with 403, so reconcile against the Gazette/PDF before filing):
   - fraction 1/3 on bond (first-time) / 1/2 on bail;
   - multiple charges → latest date governs;
   - accused-caused delay excluded (Explanation);
   - s.479(2) multiple-case pendency → blocked;
   - death/life-specified offences → excluded;
   - 4th-proviso ceiling breach flagged.
4. **Draft application (EN + HI)** — BharatCode `qwen-3.8-27b` via OpenAI-compatible `/chat/completions`, with **exponential backoff (3 attempts) + deterministic template fallback** (`lib/draftTemplate.ts`) so the demo never dies when the API 500s/503s. Web app key stays server-side in `.env` (never committed).
5. **DLSA dashboard** — SQLite; **starts empty**; rows only via **DLSA CSV import** (`dlsa-template.csv`) or the explicitly badged **demo sample rows** (excluded from metrics). Lists over-detained prisoners + days over limit.

## Live-data status (verified 2026-11-06, tested for real)

| Source | Result | In-app handling |
|---|---|---|
| BharatCode `GET /models` | OK — `qwen-3.8-27b` live, 262k ctx | `/api/health` probes; draft tries live LLM first |
| BharatCode `POST /chat/completions` | HTTP 500 `internal_error` (both models, repeated) | Backoff ×3 → template fallback (draft always renders) |
| NJDG `njdg.ecourts.gov.in` | HTML dashboards, **not JSON** | Links to dashboard; **no fabricated medians** |
| data.gov.in Civil Pendency API | Needs user key (`Authorization field missing`) | Dataset-search link + onboarding note; no fabricated aggregates |

## Setup

```powershell
cd C:\Users\aksha\Downloads\hackathon\release479
Copy-Item .env.example .env   # then paste BHARATCODE_API_KEY (server-only)
npm install
npm run dev    # http://localhost:4790
```

Node ≥ 20 (tested 24.22.0). SQLite via Node's built-in `node:sqlite` — no native build steps. DB file `data.db` is created on first run and git-ignored, as is `.env`.

## Demo steps (judge script, ~3 min)

1. `/` → tick **BNS 303(2) Theft**, detention start **2024-06-15**, first-time ON → **Compute** → eligibility **2025-06-15** (365 days), ELIGIBLE NOW. (As of 2026-11-06: 874 effective days detained, 509 days over limit.)
2. Same inputs, first-time OFF → 1/2 date = **2025-12-15** (548 days).
3. Add **BNS 117 grievous hurt (7y)** → latest date **2027-12-15** (1,278 days) — one line shows multi-charge governance. The page defaults to "500 days ago" so the first run already shows ELIGIBLE NOW on any demo day.
4. Toggle **pending other cases** ON → BLOCKED per s.479(2).
5. Fill name/case/court → **Draft application** → English + Hindi court-format drafts (template mode when API is down). Print.
6. `/dashboard` → **Insert demo sample rows** (amber badged) → over-detained table with days-over-limit; import real data later via CSV.
7. `/sources` → verbatim BNSS 479 + BNS table + NCRB figures + live `/api/health` panel.
8. `/metrics` → submission numbers (real imports only).

## DLSA onboarding script

1. **Data pull (30 min):** jail undertrial register (undertrials only) → export one CSV per `dlsa-template.csv` (section *ids* `bns303` style, custody date YYYY-MM-DD). Two columns to double-check with the jail Superintendent: (a) accused-caused delay days (Explanation to s.479), (b) pending other cases (s.479(2)).
2. **Import & screen (30 min):** paste into Dashboard → Import → zero-import rows show *why* (unsupported section / bad date) rather than failing silently.
3. **Filing loop:** for each ELIGIBLE_NOW row, generate draft, have the DLSA panel advocate review, file with the court, mark `APPLICATION_FILED`; follow the s.479(3) Superintendent application; mark `RELEASED` only on verified order.
4. **Going to scale:** add a data.gov.in API key (free registration) and wire the exact Civil Pendency resource into `/api/health`; pin the NJDG dashboard link into the district's DLSA page. Contribute the district's anonymized screened/over-detained/release counts back via the metrics block.
5. **What this MVP does not do:** eCourts scraping (none), legal advice (disclaimer everywhere), IPC-era sentence values (BNS entries only — IPC charges need DLSA mapping), calendar-year day-count litigation (365-day arithmetic, flagged in the UI).

## Layout

```
app/page.tsx            calculator + drafter
app/dashboard/          DLSA dashboard + CSV import
app/sources/            verbatim statutes + NCRB + live probe
app/metrics/            deployment metrics
app/api/eligibility|draft|prisoners|import|sample|metrics|health
lib/bns.ts  lib/bnss479.ts  lib/eligibility.ts  lib/draftTemplate.ts  lib/llm.ts  lib/db.ts
```

import { NCRB_2024 } from "./bnss479";

/**
 * State/UT undertrial row from data.gov.in (NCRB Prison Statistics).
 *
 * Resource: "State/UT-wise Number of Distribution of Undertrial Prisoners in
 * Different Jails as on 31st December 2022", Ministry of Home Affairs / NCRB,
 * published on data.gov.in. Resource id e3097e03-680a-4198-a9ca-016de994f5b3.
 * Verified live 2026-11-06 against
 * https://api.data.gov.in/resource/e3097e03-680a-4198-a9ca-016de994f5b3
 *
 * The national comparison is NCRB Prison Statistics India 2024 (5,11,542
 * prisoners; 3,71,440 undertrials; 72.6%). The state row is from 2022 — the
 * latest State/UT total published in this data.gov.in series at the time of
 * access. The two years are labelled separately and never merged.
 */

export const DATA_GOV_RESOURCE_ID = "e3097e03-680a-4198-a9ca-016de994f5b3";
export const DATA_GOV_RESOURCE_TITLE =
  "State/UT-wise Number of Distribution of Undertrial Prisoners in Different Jails as on 31st December 2022";
export const DATA_GOV_SOURCE_URL = `https://api.data.gov.in/resource/${DATA_GOV_RESOURCE_ID}`;
export const DATA_GOV_PERIOD = "as on 31 December 2022";
export const DATA_GOV_PUBLISHER =
  "National Crime Records Bureau, Ministry of Home Affairs — published on data.gov.in";

const STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman & Nicobar Islands",
  "Chandigarh",
  "Dadra & Nagar Haveli",
  "Daman & Diu",
  "Delhi",
  "Jammu & Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

export const STATE_CONTEXT_STATES = STATES;

function normalise(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function canonicalState(value: string): string {
  const key = normalise(value);
  return (
    STATES.find((s) => normalise(s) === key) ??
    STATES.find((s) => normalise(s).includes(key) || key.includes(normalise(s))) ??
    value.trim()
  );
}

export interface StateContextRow {
  state: string;
  undertrials: number | null;
  capacity: number | null;
  occupancyPct: number | null;
  centralUndertrials: number | null;
  districtUndertrials: number | null;
  subJailUndertrials: number | null;
  womenUndertrials: number | null;
}

export interface StateContextResult {
  status: "ok" | "not_published" | "rate_limited" | "unconfigured" | "error";
  state: string;
  row: StateContextRow | null;
  dataset: {
    title: string;
    period: string;
    publisher: string;
    sourceUrl: string;
    resourceId: string;
  };
  national: typeof NCRB_2024;
  estimate: { stateShareOfNationalPct: number | null };
  message: string;
  fetchedAt: string;
  cached: boolean;
}

type CacheEntry = { at: number; value: StateContextResult };
const CACHE = new Map<string, CacheEntry>();
const TTL_MS = 6 * 60 * 60 * 1000;

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "" && value.trim() !== "NA") {
    const n = Number(value.replace(/,/g, ""));
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function emptyResult(
  status: StateContextResult["status"],
  state: string,
  message: string
): StateContextResult {
  return {
    status,
    state,
    row: null,
    dataset: {
      title: DATA_GOV_RESOURCE_TITLE,
      period: DATA_GOV_PERIOD,
      publisher: DATA_GOV_PUBLISHER,
      sourceUrl: DATA_GOV_SOURCE_URL,
      resourceId: DATA_GOV_RESOURCE_ID,
    },
    national: NCRB_2024,
    estimate: { stateShareOfNationalPct: null },
    message,
    fetchedAt: new Date().toISOString(),
    cached: false,
  };
}

export async function getStateContext(rawState: string): Promise<StateContextResult> {
  const state = canonicalState(rawState);
  if (!state) return emptyResult("not_published", state, "Choose a State/UT.");

  const key = normalise(state);
  const hit = CACHE.get(key);
  if (hit && Date.now() - hit.at < TTL_MS) {
    return { ...hit.value, cached: true };
  }

  const apiKey = process.env.DATA_GOV_IN_API_KEY;
  if (!apiKey) {
    return emptyResult(
      "unconfigured",
      state,
      "The data.gov.in API key is not configured on this deployment. The source record is linked below; the live row is not shown."
    );
  }

  const url =
    `https://api.data.gov.in/resource/${DATA_GOV_RESOURCE_ID}` +
    `?api-key=${encodeURIComponent(apiKey)}` +
    `&format=json&limit=5&filters[state_ut]=${encodeURIComponent(state)}`;

  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(14000),
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (res.status === 429) {
      const value = emptyResult(
        "rate_limited",
        state,
        "data.gov.in rate-limited this request. The sourced dataset is linked below; try again later. No number is estimated or invented."
      );
      CACHE.set(key, { at: Date.now() - TTL_MS + 120000, value });
      return value;
    }

    if (!res.ok) {
      return emptyResult(
        "error",
        state,
        `data.gov.in returned HTTP ${res.status}. The sourced dataset is linked below; no number is estimated.`
      );
    }

    const json = (await res.json()) as { records?: Array<Record<string, unknown>> };
    const record = json.records?.[0];
    if (!record) {
      const value = emptyResult(
        "not_published",
        state,
        "This State/UT does not appear in the sourced data.gov.in resource. Not published."
      );
      CACHE.set(key, { at: Date.now(), value });
      return value;
    }

    const undertrials = toNumber(record.all_jails___undertrial_population);
    const capacity = toNumber(record.all_jails___total_available_capacity);
    const occupancyPct = toNumber(record.all_jails___undertrial_occupancy_rate);
    const row: StateContextRow = {
      state: String(record.state_ut ?? state),
      undertrials,
      capacity,
      occupancyPct,
      centralUndertrials: toNumber(record.central_jail___undertrial_population),
      districtUndertrials: toNumber(record.district_jail___undertrial_population),
      subJailUndertrials: toNumber(record.sub_jail___undertrial_population),
      womenUndertrials: toNumber(record.women_jail___undertrial_population),
    };

    const value: StateContextResult = {
      status: "ok",
      state,
      row,
      dataset: {
        title: DATA_GOV_RESOURCE_TITLE,
        period: DATA_GOV_PERIOD,
        publisher: DATA_GOV_PUBLISHER,
        sourceUrl: DATA_GOV_SOURCE_URL,
        resourceId: DATA_GOV_RESOURCE_ID,
      },
      national: NCRB_2024,
      estimate: {
        stateShareOfNationalPct:
          undertrials !== null && NCRB_2024.undertrialsEnd2024 > 0
            ? Math.round((undertrials / NCRB_2024.undertrialsEnd2024) * 1000) / 10
            : null,
      },
      message:
        "State row from the 2022 data.gov.in resource; national figure from NCRB Prison Statistics India 2024. Different years — shown side by side, not combined.",
      fetchedAt: new Date().toISOString(),
      cached: false,
    };
    CACHE.set(key, { at: Date.now(), value });
    return value;
  } catch (e) {
    return emptyResult(
      "error",
      state,
      e instanceof Error
        ? `Could not reach data.gov.in (${e.message}). The sourced dataset is linked below; no number is estimated.`
        : "Could not reach data.gov.in. The sourced dataset is linked below."
    );
  }
}

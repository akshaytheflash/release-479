import { DLSA_ACCESSED_ON, DLSA_CONTACTS, type DlsaContact } from "./dlsaContacts";

export { DLSA_ACCESSED_ON, DLSA_CONTACTS };
export type { DlsaContact };

export const NALSA_DIRECTORY_URL = "https://nalsa.gov.in/";
export const NALSA_HELPLINE = "15100";

/** District renames and common spellings. Keys and values are normalised. */
const ALIASES: Record<string, string> = {
  bangalore: "bengaluru urban",
  bengaluru: "bengaluru urban",
  mysore: "mysuru",
  trivandrum: "thiruvananthapuram",
  calcutta: "kolkata",
  bombay: "mumbai",
  gurgaon: "gurugram",
  allahabad: "prayagraj",
  nuh: "mewat",
  aurangabad: "aurangabad",
  "chhatrapati sambhajinagar": "aurangabad",
  "east godavari": "east godavari",
  rajahmundry: "east godavari",
  rajamahendravaram: "east godavari",
  visakhapatnam: "visakhapatnam",
  vizag: "visakhapatnam",
  "jammu and kashmir": "jammu & kashmir",
  "dadra and nagar haveli": "dadra & nagar haveli",
  "daman and diu": "daman & diu",
  "andaman and nicobar islands": "andaman & nicobar islands",
  pondicherry: "puducherry",
};

export function normalise(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\b(district|dist|dt|rural district)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function canonical(value: string): string {
  const n = normalise(value);
  return ALIASES[n] ?? n;
}

export const DLSA_STATES: string[] = Array.from(
  new Set(DLSA_CONTACTS.map((c) => c.state))
).sort((a, b) => a.localeCompare(b));

export function districtsForState(state: string): string[] {
  const key = normalise(state);
  return Array.from(
    new Set(
      DLSA_CONTACTS.filter((c) => normalise(c.state) === key).map((c) => c.district)
    )
  ).sort((a, b) => a.localeCompare(b));
}

export interface DlsaLookup {
  status: "found" | "not_found" | "state_not_covered" | "missing_state";
  state: string;
  district: string;
  matches: DlsaContact[];
  /** Number of districts in this state that are in the sourced file. */
  sourcedDistricts: string[];
  message: string;
  sourceUrls: string[];
  accessedOn: string;
}

export function lookupDlsa(state: string, district: string): DlsaLookup {
  const stateKey = canonical(state);
  const districtKey = canonical(district);
  const stateRows = DLSA_CONTACTS.filter((c) => normalise(c.state) === stateKey);
  const sourcedDistricts = Array.from(new Set(stateRows.map((c) => c.district))).sort(
    (a, b) => a.localeCompare(b)
  );

  if (!state.trim()) {
    return {
      status: "missing_state",
      state,
      district,
      matches: [],
      sourcedDistricts: [],
      message: "Choose a state to look up a District Legal Services Authority.",
      sourceUrls: [],
      accessedOn: DLSA_ACCESSED_ON,
    };
  }

  if (!stateRows.length) {
    return {
      status: "state_not_covered",
      state,
      district,
      matches: [],
      sourcedDistricts: [],
      message:
        "This state is not yet in the sourced directory. Call the NALSA helpline 15100 or use the NALSA office locator; do not rely on an unverified number.",
      sourceUrls: [NALSA_DIRECTORY_URL],
      accessedOn: DLSA_ACCESSED_ON,
    };
  }

  if (!district.trim()) {
    return {
      status: "not_found",
      state,
      district,
      matches: [],
      sourcedDistricts,
      message: "Choose a district. The sourced offices for this state are listed below.",
      sourceUrls: Array.from(new Set(stateRows.map((r) => r.sourceUrl))),
      accessedOn: DLSA_ACCESSED_ON,
    };
  }

  const exact = stateRows.filter((c) => canonical(c.district) === districtKey);
  const contains = exact.length
    ? exact
    : stateRows.filter((c) => {
        const d = canonical(c.district);
        return d.includes(districtKey) || districtKey.includes(d);
      });

  if (contains.length) {
    return {
      status: "found",
      state,
      district,
      matches: contains,
      sourcedDistricts,
      message:
        contains.length > 1
          ? "More than one office matches this district name. Confirm the court complex before visiting."
          : "Sourced from the State Legal Services Authority page on NALSA.",
      sourceUrls: Array.from(new Set(contains.map((r) => r.sourceUrl))),
      accessedOn: DLSA_ACCESSED_ON,
    };
  }

  return {
    status: "not_found",
    state,
    district,
    matches: [],
    sourcedDistricts,
    message:
      "Contact details for this district are not yet sourced. Call the NALSA helpline 15100; we do not invent office addresses or phone numbers.",
    sourceUrls: Array.from(new Set(stateRows.map((r) => r.sourceUrl))),
    accessedOn: DLSA_ACCESSED_ON,
  };
}

export function directorySummary() {
  const byState = DLSA_STATES.map((state) => ({
    state,
    offices: DLSA_CONTACTS.filter((c) => c.state === state).length,
    districts: districtsForState(state).length,
    sourceUrl: DLSA_CONTACTS.find((c) => c.state === state)?.sourceUrl ?? NALSA_DIRECTORY_URL,
  }));
  return {
    states: byState.length,
    offices: DLSA_CONTACTS.length,
    rows: byState,
    accessedOn: DLSA_ACCESSED_ON,
    caveat:
      "Vendored from NALSA state pages on 6 November 2026. West Bengal and Maharashtra list only the first directory page; other districts are marked not yet sourced. Verify the office and phone number before travelling.",
  };
}

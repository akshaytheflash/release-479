/**
 * Income ceiling for free legal aid under s.12(h) of the Legal Services
 * Authorities Act, 1987.
 *
 * Source: NALSA, "Legal Aid" FAQ + the income-ceiling table at
 * https://nalsa.gov.in/legal-aid/ — fetched 2026-11-06. Values are reproduced
 * exactly as NALSA publishes them. The Supreme Court ceiling is ₹5,00,000
 * (NALSA FAQ), independent of the State table.
 *
 * State Governments may revise these limits. Always confirm with the DLSA.
 */

export const NALSA_LEGAL_AID_URL = "https://nalsa.gov.in/legal-aid/";
export const NALSA_ACT_URL =
  "https://nalsa.gov.in/the-legal-services-authorities-act-1987/";
export const NALSA_ONLINE_APPLICATION_URL =
  "https://scourtapp.nic.in/lsams/nologin/applicationFiling.action?requestLocale=en";
export const NALSA_HELPLINE = "15100";
export const SUPREME_COURT_INCOME_LIMIT = 500000;
export const INCOME_TABLE_ACCESSED_ON = "2026-11-06";

export interface IncomeLimit {
  state: string;
  limit: number;
}

export const INCOME_LIMITS: IncomeLimit[] = [
  { state: "Andhra Pradesh", limit: 300000 },
  { state: "Arunachal Pradesh", limit: 100000 },
  { state: "Assam", limit: 300000 },
  { state: "Bihar", limit: 150000 },
  { state: "Chhattisgarh", limit: 150000 },
  { state: "Goa", limit: 300000 },
  { state: "Gujarat", limit: 100000 },
  { state: "Haryana", limit: 300000 },
  { state: "Himachal Pradesh", limit: 300000 },
  { state: "Jammu & Kashmir", limit: 300000 },
  { state: "Jharkhand", limit: 300000 },
  { state: "Karnataka", limit: 300000 },
  { state: "Kerala", limit: 300000 },
  { state: "Madhya Pradesh", limit: 200000 },
  { state: "Maharashtra", limit: 300000 },
  { state: "Manipur", limit: 300000 },
  { state: "Meghalaya", limit: 300000 },
  { state: "Mizoram", limit: 25000 },
  { state: "Nagaland", limit: 100000 },
  { state: "Odisha", limit: 300000 },
  { state: "Punjab", limit: 300000 },
  { state: "Rajasthan", limit: 300000 },
  { state: "Sikkim", limit: 300000 },
  { state: "Telangana", limit: 300000 },
  { state: "Tamil Nadu", limit: 300000 },
  { state: "Tripura", limit: 150000 },
  { state: "Uttar Pradesh", limit: 300000 },
  { state: "Uttarakhand", limit: 300000 },
  { state: "West Bengal", limit: 100000 },
  { state: "Andaman & Nicobar Islands", limit: 300000 },
  { state: "Chandigarh", limit: 300000 },
  { state: "Dadra & Nagar Haveli", limit: 15000 },
  { state: "Daman & Diu", limit: 100000 },
  { state: "Delhi", limit: 300000 },
  { state: "Ladakh", limit: 100000 },
  { state: "Lakshadweep", limit: 300000 },
  { state: "Puducherry", limit: 100000 },
];

export function incomeLimitFor(state: string): IncomeLimit | undefined {
  const key = state.toLowerCase().replace(/&/g, "and").replace(/[^a-z]/g, "");
  return INCOME_LIMITS.find(
    (r) => r.state.toLowerCase().replace(/&/g, "and").replace(/[^a-z]/g, "") === key
  );
}

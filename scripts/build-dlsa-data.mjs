import fs from "node:fs";
import path from "node:path";

const csvPath = path.join(process.cwd(), "data", "dlsa-contacts.csv");
const outPath = path.join(process.cwd(), "lib", "dlsaContacts.ts");

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (quoted && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else {
        quoted = !quoted;
      }
    } else if (c === "," && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((c === "\n" || c === "\r") && !quoted) {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cell);
      if (row.some((v) => v.trim() !== "")) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += c;
    }
  }
  if (cell || row.length) {
    row.push(cell);
    if (row.some((v) => v.trim() !== "")) rows.push(row);
  }
  return rows;
}

const rows = parseCsv(fs.readFileSync(csvPath, "utf8"));
const header = rows.shift();
const idx = Object.fromEntries(header.map((h, i) => [h.trim(), i]));
const records = rows.map((r) => ({
  state: r[idx.state],
  district: r[idx.district],
  officeName: r[idx.office_name],
  address: r[idx.address],
  phone: r[idx.phone],
  email: r[idx.email],
  sourceUrl: r[idx.source_url],
  accessedOn: r[idx.accessed_on],
  note: r[idx.note],
}));

const body = `// GENERATED FILE — do not edit by hand.
// Source of truth: data/dlsa-contacts.csv (transcribed from NALSA state pages).
// Regenerate with: node scripts/build-dlsa-data.mjs

export interface DlsaContact {
  state: string;
  district: string;
  officeName: string;
  address: string;
  phone: string;
  email: string;
  sourceUrl: string;
  accessedOn: string;
  note: string;
}

export const DLSA_CONTACTS: DlsaContact[] = ${JSON.stringify(records, null, 2)};

export const DLSA_ACCESSED_ON = "2026-11-06";
`;

fs.writeFileSync(outPath, body, "utf8");
console.log(`Wrote ${records.length} DLSA rows to ${outPath}`);

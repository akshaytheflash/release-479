/**
 * SQLite store (Node built-in `node:sqlite` — no native deps).
 *
 * Table `prisoners`: one row per screened undertrial.
 * Dashboard starts EMPTY. Rows only enter via:
 *  - DLSA CSV import (POST /api/import), or
 *  - explicit "Insert demo sample rows" button (POST /api/sample, flagged
 *    is_sample=1, amber badge, never counted as real deployment data).
 */
import { DatabaseSync } from "node:sqlite";
import path from "node:path";

// Vercel serverless has a read-only filesystem except /tmp.
const DB_PATH =
  process.env.DB_PATH ??
  (process.env.VERCEL ? "/tmp/release479.db" : path.join(process.cwd(), "data.db"));

let _db: DatabaseSync | null = null;

export function db(): DatabaseSync {
  if (_db) return _db;
  const d = new DatabaseSync(DB_PATH);
  d.exec(`PRAGMA journal_mode = WAL;
CREATE TABLE IF NOT EXISTS prisoners (
  id TEXT PRIMARY KEY,
  prisoner_name TEXT NOT NULL,
  case_no TEXT NOT NULL,
  court TEXT NOT NULL DEFAULT '',
  section_ids TEXT NOT NULL DEFAULT '[]',
  detention_start TEXT NOT NULL,
  first_time INTEGER NOT NULL DEFAULT 0,
  pending_other INTEGER NOT NULL DEFAULT 0,
  accused_delay_days INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'SCREENED',
  contact_note TEXT NOT NULL DEFAULT '',
  is_sample INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);`);
  _db = d;
  return d;
}

export interface PrisonerRow {
  id: string;
  prisoner_name: string;
  case_no: string;
  court: string;
  section_ids: string;
  detention_start: string;
  first_time: number;
  pending_other: number;
  accused_delay_days: number;
  status: string;
  contact_note: string;
  is_sample: number;
  created_at: string;
}

export function listPrisoners(): PrisonerRow[] {
  return db()
    .prepare("SELECT * FROM prisoners ORDER BY created_at DESC")
    .all() as unknown as PrisonerRow[];
}

export function insertPrisoner(row: {
  id: string;
  prisoner_name: string;
  case_no: string;
  court?: string;
  section_ids: string[];
  detention_start: string;
  first_time: boolean;
  pending_other: boolean;
  accused_delay_days?: number;
  status?: string;
  contact_note?: string;
  is_sample?: boolean;
}): void {
  db()
    .prepare(
      `INSERT INTO prisoners (id, prisoner_name, case_no, court, section_ids, detention_start, first_time, pending_other, accused_delay_days, status, contact_note, is_sample)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      row.id,
      row.prisoner_name,
      row.case_no,
      row.court ?? "",
      JSON.stringify(row.section_ids),
      row.detention_start,
      row.first_time ? 1 : 0,
      row.pending_other ? 1 : 0,
      row.accused_delay_days ?? 0,
      row.status ?? "SCREENED",
      row.contact_note ?? "",
      row.is_sample ? 1 : 0
    );
}

export function updateStatus(id: string, status: string): void {
  db().prepare("UPDATE prisoners SET status = ? WHERE id = ?").run(status, id);
}

export function deletePrisoner(id: string): void {
  db().prepare("DELETE FROM prisoners WHERE id = ?").run(id);
}

/** Metrics for the submission template. `is_sample` rows never count as real. */
export function metrics() {
  const all = listPrisoners();
  const real = all.filter((r) => r.is_sample === 0);
  return {
    screened: real.length,
    demoRows: all.length - real.length,
    applicationsFiled: real.filter(
      (r) => r.status === "APPLICATION_FILED"
    ).length,
    releasesSecured: real.filter((r) => r.status === "RELEASED").length,
  };
}

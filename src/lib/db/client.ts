import Database from "better-sqlite3";
import { drizzle, type BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import * as schema from "./schema";

const DDL = `
CREATE TABLE IF NOT EXISTS workers (id TEXT PRIMARY KEY, name TEXT NOT NULL, kind TEXT NOT NULL, address TEXT NOT NULL, hue INTEGER NOT NULL, bio TEXT NOT NULL, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS tasks (id TEXT PRIMARY KEY, title TEXT NOT NULL, worker_id TEXT NOT NULL, amount INTEGER NOT NULL, token TEXT NOT NULL DEFAULT 'USDC', condition TEXT NOT NULL, deadline TEXT NOT NULL, refund_policy TEXT NOT NULL DEFAULT 'auto', state TEXT NOT NULL, payer TEXT NOT NULL, condition_hash TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, funded_at TEXT, settled_at TEXT, mode TEXT NOT NULL DEFAULT 'simulation', demo INTEGER NOT NULL DEFAULT 1);
CREATE INDEX IF NOT EXISTS tasks_state_idx ON tasks(state);
CREATE INDEX IF NOT EXISTS tasks_worker_idx ON tasks(worker_id);
CREATE TABLE IF NOT EXISTS events (id TEXT PRIMARY KEY, task_id TEXT NOT NULL, type TEXT NOT NULL, from_state TEXT, to_state TEXT, actor_role TEXT NOT NULL, actor_name TEXT NOT NULL, at TEXT NOT NULL, tx_hash TEXT, note TEXT);
CREATE INDEX IF NOT EXISTS events_task_idx ON events(task_id, at);
CREATE TABLE IF NOT EXISTS ledger (id TEXT PRIMARY KEY, task_id TEXT NOT NULL, kind TEXT NOT NULL, debit TEXT NOT NULL, credit TEXT NOT NULL, amount INTEGER NOT NULL, balance_after INTEGER NOT NULL, at TEXT NOT NULL, tx_hash TEXT);
CREATE INDEX IF NOT EXISTS ledger_at_idx ON ledger(at);
CREATE TABLE IF NOT EXISTS attestations (id TEXT PRIMARY KEY, task_id TEXT NOT NULL, digest TEXT NOT NULL, json TEXT NOT NULL, ok INTEGER, verification TEXT, created_at TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS att_task_idx ON attestations(task_id);
CREATE TABLE IF NOT EXISTS consumed_proofs (digest TEXT PRIMARY KEY, task_id TEXT NOT NULL, at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS access_requests (id TEXT PRIMARY KEY, email TEXT NOT NULL, company TEXT NOT NULL, use_case TEXT NOT NULL, volume TEXT NOT NULL, created_at TEXT NOT NULL, ip_hash TEXT);
CREATE TABLE IF NOT EXISTS idempotency (key TEXT PRIMARY KEY, route TEXT NOT NULL, status INTEGER NOT NULL, body TEXT NOT NULL, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS members (id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL, role TEXT NOT NULL, last_active TEXT);
CREATE TABLE IF NOT EXISTS api_keys (id TEXT PRIMARY KEY, name TEXT NOT NULL, prefix TEXT NOT NULL, scope TEXT NOT NULL, created_at TEXT NOT NULL, last_used TEXT);
CREATE TABLE IF NOT EXISTS webhooks (id TEXT PRIMARY KEY, url TEXT NOT NULL, events TEXT NOT NULL, active INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS webhook_deliveries (id TEXT PRIMARY KEY, webhook_id TEXT NOT NULL, event TEXT NOT NULL, status INTEGER NOT NULL, duration_ms INTEGER NOT NULL, at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
`;

export type Db = BetterSQLite3Database<typeof schema>;
type G = typeof globalThis & { __pp_db?: { db: Db; raw: Database.Database } };

export function getDbHandle() {
  const g = globalThis as G;
  if (g.__pp_db) return g.__pp_db;
  // Outside the project tree on purpose: SQLite writes inside it make the dev file-watcher reload the page in a loop.
  const file = process.env.DATABASE_FILE || path.join(os.tmpdir(), "proofpay", "proofpay.db");
  if (file !== ":memory:") fs.mkdirSync(path.dirname(file), { recursive: true });
  const raw = new Database(file);
  raw.pragma("journal_mode = WAL");
  raw.pragma("foreign_keys = OFF");
  raw.exec(DDL);
  const db = drizzle(raw, { schema });
  g.__pp_db = { db, raw };
  return g.__pp_db;
}

export function getDb(): Db {
  return getDbHandle().db;
}
export { schema };

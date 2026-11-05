import { drizzle as drizzlePg, type NodePgDatabase } from "drizzle-orm/node-postgres";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { Pool } from "pg";
import * as schema from "./schema";

const DDL = `
CREATE TABLE IF NOT EXISTS workers (id TEXT PRIMARY KEY, name TEXT NOT NULL, kind TEXT NOT NULL, address TEXT NOT NULL, hue INTEGER NOT NULL, bio TEXT NOT NULL, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS tasks (id TEXT PRIMARY KEY, title TEXT NOT NULL, worker_id TEXT NOT NULL, amount BIGINT NOT NULL, token TEXT NOT NULL DEFAULT 'USDC', condition JSONB NOT NULL, deadline TEXT NOT NULL, refund_policy TEXT NOT NULL DEFAULT 'auto', state TEXT NOT NULL, payer TEXT NOT NULL, condition_hash TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, funded_at TEXT, settled_at TEXT, mode TEXT NOT NULL DEFAULT 'simulation', demo BOOLEAN NOT NULL DEFAULT TRUE);
CREATE INDEX IF NOT EXISTS tasks_state_idx ON tasks(state);
CREATE INDEX IF NOT EXISTS tasks_worker_idx ON tasks(worker_id);
CREATE TABLE IF NOT EXISTS events (id TEXT PRIMARY KEY, task_id TEXT NOT NULL, type TEXT NOT NULL, from_state TEXT, to_state TEXT, actor_role TEXT NOT NULL, actor_name TEXT NOT NULL, at TEXT NOT NULL, tx_hash TEXT, note TEXT);
CREATE INDEX IF NOT EXISTS events_task_idx ON events(task_id, at);
CREATE TABLE IF NOT EXISTS ledger (id TEXT PRIMARY KEY, task_id TEXT NOT NULL, kind TEXT NOT NULL, debit TEXT NOT NULL, credit TEXT NOT NULL, amount BIGINT NOT NULL, balance_after BIGINT NOT NULL, at TEXT NOT NULL, tx_hash TEXT);
CREATE INDEX IF NOT EXISTS ledger_at_idx ON ledger(at);
CREATE TABLE IF NOT EXISTS attestations (id TEXT PRIMARY KEY, task_id TEXT NOT NULL, digest TEXT NOT NULL, json JSONB NOT NULL, ok BOOLEAN, verification JSONB, created_at TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS att_task_idx ON attestations(task_id);
CREATE TABLE IF NOT EXISTS consumed_proofs (digest TEXT PRIMARY KEY, task_id TEXT NOT NULL, at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS access_requests (id TEXT PRIMARY KEY, email TEXT NOT NULL, company TEXT NOT NULL, use_case TEXT NOT NULL, volume TEXT NOT NULL, created_at TEXT NOT NULL, ip_hash TEXT);
CREATE TABLE IF NOT EXISTS idempotency (key TEXT PRIMARY KEY, route TEXT NOT NULL, status INTEGER NOT NULL, body TEXT NOT NULL, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS members (id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL, role TEXT NOT NULL, last_active TEXT);
CREATE TABLE IF NOT EXISTS api_keys (id TEXT PRIMARY KEY, name TEXT NOT NULL, prefix TEXT NOT NULL, scope TEXT NOT NULL, created_at TEXT NOT NULL, last_used TEXT);
CREATE TABLE IF NOT EXISTS webhooks (id TEXT PRIMARY KEY, url TEXT NOT NULL, events JSONB NOT NULL, active BOOLEAN NOT NULL DEFAULT TRUE, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS webhook_deliveries (id TEXT PRIMARY KEY, webhook_id TEXT NOT NULL, event TEXT NOT NULL, status INTEGER NOT NULL, duration_ms INTEGER NOT NULL, at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
`;

export type Db = NodePgDatabase<typeof schema>;
type G = typeof globalThis & { __pp_db?: Promise<Db> };

/**
 * One database, two engines with the same Postgres dialect:
 *  - DATABASE_URL set (Neon, any Postgres): node-postgres pool. Use the pooled connection string on serverless.
 *  - otherwise: PGlite, an in-process Postgres. Zero setup for local dev and tests. Single process only.
 */
async function open(): Promise<Db> {
  const url = process.env.DATABASE_URL;
  if (url) {
    const pool = new Pool({ connectionString: url, max: Number(process.env.DATABASE_POOL_MAX ?? 3), ssl: /localhost|127\.0\.0\.1/.test(url) ? undefined : { rejectUnauthorized: true } });
    await pool.query(DDL);
    return drizzlePg(pool, { schema });
  }
  const file = process.env.DATABASE_FILE || path.join(os.tmpdir(), "proofpay", "pgdata");
  // Outside the project tree on purpose: writes inside it make the dev file-watcher reload the page in a loop.
  let dataDir: string | undefined = "memory://";
  if (file !== ":memory:") {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    dataDir = file;
  }
  // Loaded only here, so a deployment with DATABASE_URL never imports the WASM engine.
  const [{ PGlite }, { drizzle: drizzlePglite }] = await Promise.all([import("@electric-sql/pglite"), import("drizzle-orm/pglite")]);
  const lite = new PGlite(dataDir);
  await lite.exec(DDL);
  return drizzlePglite(lite, { schema }) as unknown as Db;
}

export function getDb(): Promise<Db> {
  const g = globalThis as G;
  return (g.__pp_db ??= open().catch((e) => {
    g.__pp_db = undefined; // let the next request retry instead of caching a failure
    throw e;
  }));
}
export { schema };

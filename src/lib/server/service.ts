import "server-only";
import { eq, sql } from "drizzle-orm";
import { keccak256, toHex } from "viem";
import { type Db, schema } from "@/lib/db/client";
import { conditionHashOf } from "@/lib/domain/condition";
import { DomainError } from "@/lib/domain/errors";
import type { Evidence, ProofProvider } from "@/lib/domain/provider";
import { SimulatedProvider } from "@/lib/domain/simulated-provider";
import { assertTransition, TransitionError } from "@/lib/domain/state-machine";
import type { Condition, Mode, Role, Task, TaskState, VerificationResult } from "@/lib/domain/types";
import { PrimusProvider } from "@/lib/domain/primus-provider";
import { liveConfig } from "./primus";
import { getMode, getTask, getWorker, ready, toTask } from "./repo";

export function getProvider(mode: Mode): ProofProvider {
  if (mode === "live") {
    if (!liveConfig().ready) throw new DomainError("bad_request", "Live mode is not configured. Add Primus credentials, a template and the attestor list (see README → Live mode), or switch to Simulation.", 400);
    return new PrimusProvider();
  }
  return new SimulatedProvider();
}

let seq = 0;
const eid = () => `ev_${Date.now().toString(36)}${(seq++ % 1296).toString(36).padStart(2, "0")}${Math.random().toString(36).slice(2, 5)}`;
const txOf = (s: string) => keccak256(toHex(`tx:${s}:${Date.now()}:${Math.random()}`));
const iso = (ms = Date.now()) => new Date(ms).toISOString();

type Actor = { role: Role; name: string };
type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];
/** One lock for every state-changing transaction (and the demo reseed). Keeps balances and transitions strictly ordered across serverless instances. */
const WRITE_LOCK = 746101;

/**
 * Runs `fn` in a transaction with the task re-read under the write lock. Everything inside must use `tx`, never the shared
 * pool: PGlite serves one connection, so a query outside the transaction would wait for it forever.
 */
async function mutate<T>(id: string, fn: (tx: Tx, task: Task) => Promise<T>): Promise<T> {
  const db = await ready();
  try {
    return await db.transaction(async (tx) => {
      await tx.execute(sql`SELECT pg_advisory_xact_lock(${WRITE_LOCK})`);
      const [row] = await tx.select().from(schema.tasks).where(eq(schema.tasks.id, id)).limit(1);
      if (!row) throw new DomainError("not_found", `Task ${id} was not found.`, 404);
      return await fn(tx, toTask(row));
    });
  } catch (e) {
    if (e instanceof TransitionError) throw new DomainError("invalid_state", e.message, 409);
    throw e;
  }
}

async function logEvent(
  tx: Tx,
  taskId: string,
  type: string,
  from: TaskState | null,
  to: TaskState | null,
  actor: Actor,
  extra: { txHash?: string | null; note?: string | null; at?: number } = {},
) {
  await tx
    .insert(schema.events)
    .values({ id: eid(), taskId, type, fromState: from, toState: to, actorRole: actor.role, actorName: actor.name, at: iso(extra.at), txHash: extra.txHash ?? null, note: extra.note ?? null });
  // Simulation: record the webhook delivery that would be sent. No outbound request is made.
  const name = type === "settled" ? "task.settled" : type === "expired" ? "task.expired" : type === "proof_failed" ? "proof.failed" : null;
  if (!name) return;
  const hooks = await tx.select().from(schema.webhooks);
  for (const h of hooks)
    if (h.active && h.events.includes(name))
      await tx.insert(schema.webhookDeliveries).values({ id: `d_${eid()}`, webhookId: h.id, event: name, status: 200, durationMs: 80 + Math.floor(Math.random() * 200), at: iso() });
}

async function setState(tx: Tx, task: Task, to: TaskState, patch: Partial<typeof schema.tasks.$inferInsert> = {}) {
  assertTransition(task.state, to);
  await tx.update(schema.tasks).set({ state: to, updatedAt: iso(), ...patch }).where(eq(schema.tasks.id, task.id));
  task.state = to;
}

async function ledgerPush(tx: Tx, task: Task, kind: "escrow_in" | "release" | "refund", debit: string, credit: string, txHash: string) {
  // The running balance is derived, not read from the last row, so it cannot drift if two rows share a timestamp.
  const [cur] = await tx
    .select({ b: sql<number>`COALESCE(SUM(CASE WHEN ${schema.ledger.kind} = 'escrow_in' THEN ${schema.ledger.amount} ELSE -${schema.ledger.amount} END), 0)::float8` })
    .from(schema.ledger);
  const bal = Number(cur?.b ?? 0) + (kind === "escrow_in" ? task.amount : -task.amount);
  await tx.insert(schema.ledger).values({ id: `le_${eid()}`, taskId: task.id, kind, debit, credit, amount: task.amount, balanceAfter: bal, at: iso(), txHash });
}

async function need(id: string): Promise<Task> {
  await ready();
  const t = await getTask(id);
  if (!t) throw new DomainError("not_found", `Task ${id} was not found.`, 404);
  return t;
}

/* ───────────────────────── commands ───────────────────────── */

export interface CreateTaskInput {
  title: string;
  workerId: string;
  amountUsdc: number;
  condition: Condition;
  deadline: string;
  refundPolicy: "auto" | "payer";
}
export async function createTask(input: CreateTaskInput, actor: Actor = { role: "payer", name: "Northgate Growth" }): Promise<Task> {
  const db = await ready();
  const worker = await getWorker(input.workerId);
  if (!worker) throw new DomainError("bad_request", "Unknown worker.", 400);
  if (new Date(input.deadline).getTime() <= Date.now()) throw new DomainError("bad_request", "The deadline must be in the future.", 400);
  const mode = await getMode();
  const id = `tsk_${Math.random().toString(36).slice(2, 6).toUpperCase().replace(/[IO]/g, "X")}`;
  const now = iso();
  const row = {
    id,
    title: input.title.trim(),
    workerId: input.workerId,
    amount: Math.round(input.amountUsdc * 1_000_000),
    token: "USDC",
    condition: input.condition,
    deadline: input.deadline,
    refundPolicy: input.refundPolicy,
    state: "draft",
    payer: actor.name,
    conditionHash: conditionHashOf(input.condition),
    createdAt: now,
    updatedAt: now,
    fundedAt: null,
    settledAt: null,
    mode,
    demo: mode === "simulation",
  };
  await db.transaction(async (tx) => {
    await tx.insert(schema.tasks).values(row);
    await logEvent(tx, id, "task_created", null, "draft", actor);
  });
  return toTask(row as typeof schema.tasks.$inferSelect);
}

export async function fundTask(id: string, actor: Actor = { role: "payer", name: "Northgate Growth" }): Promise<Task> {
  return mutate(id, async (tx, t) => {
    const txHash = txOf(`${id}:fund`);
    await setState(tx, t, "funded", { fundedAt: iso() });
    await logEvent(tx, id, "funded", "draft", "funded", actor, { txHash, note: "Deposit confirmed (simulated)" });
    await ledgerPush(tx, t, "escrow_in", `${t.payer} wallet`, "Escrow", txHash);
    await setState(tx, t, "awaiting_proof");
    await logEvent(tx, id, "awaiting_proof", "funded", "awaiting_proof", { role: "system", name: "ProofPay" });
    return t;
  });
}

export interface SubmitProofResult {
  task: Task;
  attestationId: string;
  verification: VerificationResult;
  settled: boolean;
}

/** Worker submits a proof. We verify it and, if it passes, settle: Proving → Verified → Settled. */
export async function submitProof(id: string, evidence: Evidence, actor: Actor): Promise<SubmitProofResult> {
  const t0 = await need(id);
  if (!["funded", "awaiting_proof"].includes(t0.state)) throw new DomainError("invalid_state", `This task is ${t0.state.replace("_", " ")}, so it can’t accept a proof.`, 409);
  if (new Date(t0.deadline).getTime() < Date.now()) throw new DomainError("expired", "The deadline has passed.", 409);
  const worker = await getWorker(t0.workerId);
  if (!worker) throw new DomainError("not_found", "Worker missing", 404);

  // No database work here: building the attestation can be slow (and, in Live, comes from the browser).
  const provider = getProvider(t0.mode);
  const req = await provider.createRequest(t0, worker);
  const att = await provider.submit(req, t0, evidence);

  return mutate(id, async (tx, t) => {
    // Re-check under the lock: another request may have settled or expired this task meanwhile.
    if (t.state === "funded") await setState(tx, t, "awaiting_proof");
    if (t.state !== "awaiting_proof") throw new DomainError("invalid_state", `This task is ${t.state.replace("_", " ")}, so it can’t accept a proof.`, 409);
    if (new Date(t.deadline).getTime() < Date.now()) throw new DomainError("expired", "The deadline has passed.", 409);

    const consumed = new Set((await tx.select().from(schema.consumedProofs)).map((r) => r.digest.toLowerCase()));
    const verification = await provider.verify(att, t, worker, { consumedDigests: consumed, registeredAttestors: t.mode === "live" ? liveConfig().attestors : undefined });

    await setState(tx, t, "proving");
    await logEvent(tx, id, "proof_started", "awaiting_proof", "proving", actor);
    await tx.insert(schema.attestations).values({ id: att.id, taskId: id, digest: att.digest, json: att, ok: verification.ok, verification, createdAt: iso() }).onConflictDoNothing();
    if (!verification.ok) {
      await setState(tx, t, "awaiting_proof");
      const msg = verification.steps.find((s) => !s.ok)?.detail ?? "Verification failed";
      await logEvent(tx, id, "proof_failed", "proving", "awaiting_proof", { role: "system", name: "ProofPay" }, { note: msg });
      return { task: t, attestationId: att.id, verification, settled: false };
    }
    await setState(tx, t, "verified");
    await logEvent(tx, id, "verified", "proving", "verified", { role: "system", name: "ProofPay" }, { note: "All six checks passed." });
    // automatic release
    const txHash = txOf(`${id}:release`);
    await setState(tx, t, "settled", { settledAt: iso() });
    await tx.insert(schema.consumedProofs).values({ digest: att.digest.toLowerCase(), taskId: id, at: iso() });
    await ledgerPush(tx, t, "release", "Escrow", worker.name, txHash);
    await logEvent(tx, id, "settled", "verified", "settled", { role: "system", name: "Escrow" }, { txHash, note: `Released to ${worker.name}` });
    return { task: t, attestationId: att.id, verification, settled: true };
  });
}

export async function expireTask(id: string, opts: { force?: boolean } = {}): Promise<Task> {
  return mutate(id, async (tx, t) => {
    const past = new Date(t.deadline).getTime() < Date.now();
    if (!past && !opts.force) throw new DomainError("invalid_state", "The deadline has not passed yet.", 409);
    if (opts.force && t.mode !== "simulation") throw new DomainError("forbidden", "Only Simulation tasks can be fast-forwarded.", 403);
    if (!past) await tx.update(schema.tasks).set({ deadline: iso(Date.now() - 60_000) }).where(eq(schema.tasks.id, id));
    const from = t.state;
    await setState(tx, t, "expired");
    await logEvent(tx, id, "expired", from, "expired", { role: "system", name: "ProofPay" }, { note: opts.force ? "Deadline fast-forwarded (Simulation)." : "Deadline passed without a valid proof." });
    return t;
  });
}

export async function refundTask(id: string, actor: Actor = { role: "payer", name: "Northgate Growth" }): Promise<Task> {
  return mutate(id, async (tx, t) => {
    const txHash = txOf(`${id}:refund`);
    await setState(tx, t, "refunded");
    await ledgerPush(tx, t, "refund", "Escrow", `${t.payer} wallet`, txHash);
    await logEvent(tx, id, "refunded", "expired", "refunded", actor, { txHash, note: "Escrow returned to payer" });
    return t;
  });
}

export async function disputeTask(id: string, note: string, actor: Actor): Promise<Task> {
  return mutate(id, async (tx, t) => {
    const from = t.state;
    await setState(tx, t, "disputed");
    await logEvent(tx, id, "disputed", from, "disputed", actor, { note });
    return t;
  });
}

export async function resolveTask(id: string, outcome: "release" | "refund", note: string, actor: Actor = { role: "arbiter", name: "Arbiter" }): Promise<Task> {
  const t0 = await need(id);
  const worker = await getWorker(t0.workerId);
  return mutate(id, async (tx, t) => {
    const txHash = txOf(`${id}:resolve`);
    await setState(tx, t, "resolved");
    if (outcome === "release") await ledgerPush(tx, t, "release", "Escrow", worker?.name ?? "Worker", txHash);
    else await ledgerPush(tx, t, "refund", "Escrow", `${t.payer} wallet`, txHash);
    await logEvent(tx, id, "resolved", "disputed", "resolved", actor, { txHash, note: `${outcome === "release" ? "Released to worker" : "Refunded to payer"}. ${note}` });
    return t;
  });
}

/* ───────────── idempotency + rate limiting (settlement actions) ───────────── */

export async function withIdempotency<T>(key: string | null, route: string, fn: () => Promise<{ status: number; body: T }>): Promise<{ status: number; body: T; replayed: boolean }> {
  if (!key) {
    const r = await fn();
    return { ...r, replayed: false };
  }
  const db = await ready();
  const [hit] = await db.select().from(schema.idempotency).where(eq(schema.idempotency.key, key)).limit(1);
  if (hit) {
    if (hit.route !== route) throw new DomainError("conflict", "This Idempotency-Key was used for a different request.", 422);
    return { status: hit.status, body: JSON.parse(hit.body) as T, replayed: true };
  }
  const r = await fn();
  await db.insert(schema.idempotency).values({ key, route, status: r.status, body: JSON.stringify(r.body), createdAt: iso() }).onConflictDoNothing();
  return { ...r, replayed: false };
}

type Bucket = { n: number; reset: number };
const buckets = new Map<string, Bucket>();
/** Token window: `limit` calls per `windowMs` per key. In-memory; swap for Redis when deployed with more than one instance. */
export function rateLimit(key: string, limit = 20, windowMs = 60_000) {
  const now = Date.now();
  if (buckets.size > 5000) for (const [k, v] of buckets) if (v.reset < now) buckets.delete(k); // bound memory
  const b = buckets.get(key);
  if (!b || b.reset < now) {
    buckets.set(key, { n: 1, reset: now + windowMs });
    return { ok: true, remaining: limit - 1, reset: now + windowMs };
  }
  b.n++;
  return { ok: b.n <= limit, remaining: Math.max(0, limit - b.n), reset: b.reset };
}

import "server-only";
import { eq } from "drizzle-orm";
import { keccak256, toHex } from "viem";
import { getDbHandle, schema } from "@/lib/db/client";
import { conditionHashOf } from "@/lib/domain/condition";
import { DomainError } from "@/lib/domain/errors";
import type { Evidence, ProofProvider } from "@/lib/domain/provider";
import { SimulatedProvider } from "@/lib/domain/simulated-provider";
import { assertTransition, TransitionError } from "@/lib/domain/state-machine";
import type { Condition, Mode, Role, Task, TaskState, VerificationResult } from "@/lib/domain/types";
import { PrimusProvider } from "@/lib/domain/primus-provider";
import { liveConfig } from "./primus";
import { consumedDigests, getMode, getTask, getWorker, ready, toTask } from "./repo";

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

function logEvent(
  taskId: string,
  type: string,
  from: TaskState | null,
  to: TaskState | null,
  actor: Actor,
  extra: { txHash?: string | null; note?: string | null; at?: number } = {},
) {
  const { db } = getDbHandle();
  db.insert(schema.events)
    .values({ id: eid(), taskId, type, fromState: from, toState: to, actorRole: actor.role, actorName: actor.name, at: iso(extra.at), txHash: extra.txHash ?? null, note: extra.note ?? null })
    .run();
  // Simulation: record the webhook delivery that would be sent. No outbound request is made.
  const hooks = db.select().from(schema.webhooks).all();
  const name = type === "settled" ? "task.settled" : type === "expired" ? "task.expired" : type === "proof_failed" ? "proof.failed" : null;
  if (name)
    for (const h of hooks)
      if (h.active && h.events.includes(name))
        db.insert(schema.webhookDeliveries).values({ id: `d_${eid()}`, webhookId: h.id, event: name, status: 200, durationMs: 80 + Math.floor(Math.random() * 200), at: iso() }).run();
}

function setState(task: Task, to: TaskState, patch: Partial<typeof schema.tasks.$inferInsert> = {}) {
  assertTransition(task.state, to);
  const { db } = getDbHandle();
  db.update(schema.tasks).set({ state: to, updatedAt: iso(), ...patch }).where(eq(schema.tasks.id, task.id)).run();
  task.state = to;
}

function ledgerPush(task: Task, kind: "escrow_in" | "release" | "refund", debit: string, credit: string, txHash: string) {
  const { db, raw } = getDbHandle();
  const last = raw.prepare("SELECT balance_after b FROM ledger ORDER BY at DESC, rowid DESC LIMIT 1").get() as { b: number } | undefined;
  const bal = (last?.b ?? 0) + (kind === "escrow_in" ? task.amount : -task.amount);
  db.insert(schema.ledger).values({ id: `le_${eid()}`, taskId: task.id, kind, debit, credit, amount: task.amount, balanceAfter: bal, at: iso(), txHash }).run();
}

async function need(id: string): Promise<Task> {
  await ready();
  const t = await getTask(id);
  if (!t) throw new DomainError("not_found", `Task ${id} was not found.`, 404);
  return t;
}
function wrap<T>(fn: () => T): T {
  try {
    return fn();
  } catch (e) {
    if (e instanceof TransitionError) throw new DomainError("invalid_state", e.message, 409);
    throw e;
  }
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
  db.insert(schema.tasks).values(row).run();
  logEvent(id, "task_created", null, "draft", actor);
  return toTask(row as typeof schema.tasks.$inferSelect);
}

export async function fundTask(id: string, actor: Actor = { role: "payer", name: "Northgate Growth" }): Promise<Task> {
  const t = await need(id);
  return wrap(() => {
    const { raw } = getDbHandle();
    const txHash = txOf(`${id}:fund`);
    raw.transaction(() => {
      setState(t, "funded", { fundedAt: iso() });
      logEvent(id, "funded", "draft", "funded", actor, { txHash, note: "Deposit confirmed (simulated)" });
      ledgerPush(t, "escrow_in", `${t.payer} wallet`, "Escrow", txHash);
      setState(t, "awaiting_proof");
      logEvent(id, "awaiting_proof", "funded", "awaiting_proof", { role: "system", name: "ProofPay" });
    })();
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
  const t = await need(id);
  if (t.state === "funded") wrap(() => setState(t, "awaiting_proof"));
  if (t.state !== "awaiting_proof") throw new DomainError("invalid_state", `This task is ${t.state.replace("_", " ")}, so it can’t accept a proof.`, 409);
  if (new Date(t.deadline).getTime() < Date.now()) throw new DomainError("expired", "The deadline has passed.", 409);
  const worker = await getWorker(t.workerId);
  if (!worker) throw new DomainError("not_found", "Worker missing", 404);

  const provider = getProvider(t.mode);
  const req = await provider.createRequest(t, worker);
  const att = await provider.submit(req, t, evidence);
  const consumed = await consumedDigests();
  const verification = await provider.verify(att, t, worker, { consumedDigests: consumed, registeredAttestors: t.mode === "live" ? liveConfig().attestors : undefined });

  const { raw, db } = getDbHandle();
  let settled = false;
  raw.transaction(() => {
    wrap(() => setState(t, "proving"));
    logEvent(id, "proof_started", "awaiting_proof", "proving", actor);
    db.insert(schema.attestations).values({ id: att.id, taskId: id, digest: att.digest, json: att, ok: verification.ok, verification, createdAt: iso() }).onConflictDoNothing().run();
    if (!verification.ok) {
      wrap(() => setState(t, "awaiting_proof"));
      const msg = verification.steps.find((s) => !s.ok)?.detail ?? "Verification failed";
      logEvent(id, "proof_failed", "proving", "awaiting_proof", { role: "system", name: "ProofPay" }, { note: msg });
      return;
    }
    wrap(() => setState(t, "verified"));
    logEvent(id, "verified", "proving", "verified", { role: "system", name: "ProofPay" }, { note: "All six checks passed." });
    // automatic release
    const txHash = txOf(`${id}:release`);
    wrap(() => setState(t, "settled", { settledAt: iso() }));
    db.insert(schema.consumedProofs).values({ digest: att.digest.toLowerCase(), taskId: id, at: iso() }).run();
    ledgerPush(t, "release", "Escrow", worker.name, txHash);
    logEvent(id, "settled", "verified", "settled", { role: "system", name: "Escrow" }, { txHash, note: `Released to ${worker.name}` });
    settled = true;
  })();
  const fresh = (await getTask(id))!;
  return { task: fresh, attestationId: att.id, verification, settled };
}

export async function expireTask(id: string, opts: { force?: boolean } = {}): Promise<Task> {
  const t = await need(id);
  const past = new Date(t.deadline).getTime() < Date.now();
  if (!past && !opts.force) throw new DomainError("invalid_state", "The deadline has not passed yet.", 409);
  if (opts.force && t.mode !== "simulation") throw new DomainError("forbidden", "Only Simulation tasks can be fast-forwarded.", 403);
  return wrap(() => {
    const { raw, db } = getDbHandle();
    raw.transaction(() => {
      if (!past) db.update(schema.tasks).set({ deadline: iso(Date.now() - 60_000) }).where(eq(schema.tasks.id, id)).run();
      const from = t.state;
      setState(t, "expired");
      logEvent(id, "expired", from, "expired", { role: "system", name: "ProofPay" }, { note: opts.force ? "Deadline fast-forwarded (Simulation)." : "Deadline passed without a valid proof." });
    })();
    return t;
  });
}

export async function refundTask(id: string, actor: Actor = { role: "payer", name: "Northgate Growth" }): Promise<Task> {
  const t = await need(id);
  return wrap(() => {
    const { raw } = getDbHandle();
    const txHash = txOf(`${id}:refund`);
    raw.transaction(() => {
      setState(t, "refunded");
      ledgerPush(t, "refund", "Escrow", `${t.payer} wallet`, txHash);
      logEvent(id, "refunded", "expired", "refunded", actor, { txHash, note: "Escrow returned to payer" });
    })();
    return t;
  });
}

export async function disputeTask(id: string, note: string, actor: Actor): Promise<Task> {
  const t = await need(id);
  return wrap(() => {
    const from = t.state;
    setState(t, "disputed");
    logEvent(id, "disputed", from, "disputed", actor, { note });
    return t;
  });
}

export async function resolveTask(id: string, outcome: "release" | "refund", note: string, actor: Actor = { role: "arbiter", name: "Arbiter" }): Promise<Task> {
  const t = await need(id);
  const worker = await getWorker(t.workerId);
  return wrap(() => {
    const { raw } = getDbHandle();
    const txHash = txOf(`${id}:resolve`);
    raw.transaction(() => {
      setState(t, "resolved");
      if (outcome === "release") ledgerPush(t, "release", "Escrow", worker?.name ?? "Worker", txHash);
      else ledgerPush(t, "refund", "Escrow", `${t.payer} wallet`, txHash);
      logEvent(id, "resolved", "disputed", "resolved", actor, { txHash, note: `${outcome === "release" ? "Released to worker" : "Refunded to payer"}. ${note}` });
    })();
    return t;
  });
}

/* ───────────── idempotency + rate limiting (settlement actions) ───────────── */

export async function withIdempotency<T>(key: string | null, route: string, fn: () => Promise<{ status: number; body: T }>): Promise<{ status: number; body: T; replayed: boolean }> {
  if (!key) {
    const r = await fn();
    return { ...r, replayed: false };
  }
  await ready();
  const { db } = getDbHandle();
  const hit = db.select().from(schema.idempotency).where(eq(schema.idempotency.key, key)).get();
  if (hit) {
    if (hit.route !== route) throw new DomainError("conflict", "This Idempotency-Key was used for a different request.", 422);
    return { status: hit.status, body: JSON.parse(hit.body) as T, replayed: true };
  }
  const r = await fn();
  db.insert(schema.idempotency).values({ key, route, status: r.status, body: JSON.stringify(r.body), createdAt: iso() }).onConflictDoNothing().run();
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

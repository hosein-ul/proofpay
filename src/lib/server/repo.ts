import "server-only";
import { and, asc, desc, eq, gte, inArray, sql } from "drizzle-orm";
import { ensureSeeded } from "@/lib/db/seed";
import { getDb, getDbHandle, schema } from "@/lib/db/client";
import type {
  Attestation,
  LedgerEntry,
  Mode,
  Overview,
  Task,
  TaskEvent,
  TaskState,
  VerificationResult,
  Worker,
} from "@/lib/domain/types";

const DAY = 86_400_000;

export async function ready() {
  await ensureSeeded();
  return getDb();
}

type TaskRow = typeof schema.tasks.$inferSelect;
export const toTask = (r: TaskRow): Task => ({
  id: r.id,
  title: r.title,
  workerId: r.workerId,
  amount: r.amount,
  token: "USDC",
  condition: r.condition,
  deadline: r.deadline,
  refundPolicy: r.refundPolicy as Task["refundPolicy"],
  state: r.state as TaskState,
  payer: r.payer,
  conditionHash: r.conditionHash,
  createdAt: r.createdAt,
  updatedAt: r.updatedAt,
  fundedAt: r.fundedAt,
  settledAt: r.settledAt,
  mode: r.mode as Mode,
  demo: r.demo,
});
const toEvent = (r: typeof schema.events.$inferSelect): TaskEvent => ({
  id: r.id,
  taskId: r.taskId,
  type: r.type,
  from: r.fromState as TaskState | null,
  to: r.toState as TaskState | null,
  actorRole: r.actorRole as TaskEvent["actorRole"],
  actorName: r.actorName,
  at: r.at,
  txHash: r.txHash,
  note: r.note,
});
const toLedger = (r: typeof schema.ledger.$inferSelect): LedgerEntry => ({
  id: r.id,
  taskId: r.taskId,
  kind: r.kind as LedgerEntry["kind"],
  debit: r.debit,
  credit: r.credit,
  amount: r.amount,
  balanceAfter: r.balanceAfter,
  at: r.at,
  txHash: r.txHash,
});

export async function listWorkers(): Promise<Worker[]> {
  const db = await ready();
  return db.select().from(schema.workers).all() as Worker[];
}
export async function getWorker(id: string): Promise<Worker | null> {
  const db = await ready();
  return ((db.select().from(schema.workers).where(eq(schema.workers.id, id)).get() as Worker | undefined) ?? null);
}

export async function listTasks(opts: { states?: TaskState[]; workerId?: string; limit?: number } = {}): Promise<Task[]> {
  const db = await ready();
  const conds = [];
  if (opts.states?.length) conds.push(inArray(schema.tasks.state, opts.states));
  if (opts.workerId) conds.push(eq(schema.tasks.workerId, opts.workerId));
  const q = db
    .select()
    .from(schema.tasks)
    .where(conds.length ? and(...conds) : undefined)
    .orderBy(desc(schema.tasks.updatedAt));
  const rows = opts.limit ? q.limit(opts.limit).all() : q.all();
  return rows.map(toTask);
}

export async function getTask(id: string): Promise<Task | null> {
  const db = await ready();
  const r = db.select().from(schema.tasks).where(eq(schema.tasks.id, id)).get();
  return r ? toTask(r) : null;
}

export async function getTaskDetail(id: string) {
  const db = await ready();
  const t = db.select().from(schema.tasks).where(eq(schema.tasks.id, id)).get();
  if (!t) return null;
  const task = toTask(t);
  const worker = await getWorker(task.workerId);
  const events = db.select().from(schema.events).where(eq(schema.events.taskId, id)).orderBy(asc(schema.events.at)).all().map(toEvent);
  const atts = db.select().from(schema.attestations).where(eq(schema.attestations.taskId, id)).orderBy(desc(schema.attestations.createdAt)).all();
  const ledger = db.select().from(schema.ledger).where(eq(schema.ledger.taskId, id)).orderBy(asc(schema.ledger.at)).all().map(toLedger);
  return {
    task,
    worker: worker!,
    events,
    attestations: atts.map((a) => ({
      attestation: a.json as Attestation,
      ok: a.ok,
      verification: (a.verification as VerificationResult | null) ?? null,
      createdAt: a.createdAt,
    })),
    ledger,
  };
}

export async function getAttestation(id: string) {
  const db = await ready();
  const a = db.select().from(schema.attestations).where(eq(schema.attestations.id, id)).get();
  if (!a) return null;
  const task = await getTask(a.taskId);
  const worker = task ? await getWorker(task.workerId) : null;
  return { attestation: a.json as Attestation, ok: a.ok, verification: (a.verification as VerificationResult | null) ?? null, task: task!, worker: worker! };
}

export async function latestAttestationForTask(taskId: string) {
  const db = await ready();
  const a = db.select().from(schema.attestations).where(eq(schema.attestations.taskId, taskId)).orderBy(desc(schema.attestations.createdAt)).limit(1).get();
  return a ? { id: a.id, ok: a.ok } : null;
}

export async function consumedDigests(): Promise<Set<string>> {
  const db = await ready();
  return new Set(db.select().from(schema.consumedProofs).all().map((r) => r.digest.toLowerCase()));
}

export async function listLedger(opts: { kind?: string; taskId?: string; since?: string } = {}): Promise<LedgerEntry[]> {
  const db = await ready();
  const conds = [];
  if (opts.kind) conds.push(eq(schema.ledger.kind, opts.kind));
  if (opts.taskId) conds.push(eq(schema.ledger.taskId, opts.taskId));
  if (opts.since) conds.push(gte(schema.ledger.at, opts.since));
  return db
    .select()
    .from(schema.ledger)
    .where(conds.length ? and(...conds) : undefined)
    .orderBy(desc(schema.ledger.at))
    .all()
    .map(toLedger);
}

export async function listEvents(limit = 60): Promise<(TaskEvent & { title: string })[]> {
  const db = await ready();
  const rows = db
    .select({ e: schema.events, title: schema.tasks.title })
    .from(schema.events)
    .leftJoin(schema.tasks, eq(schema.events.taskId, schema.tasks.id))
    .orderBy(desc(schema.events.at))
    .limit(limit)
    .all();
  return rows.map((r) => ({ ...toEvent(r.e), title: r.title ?? r.e.taskId }));
}

export async function workerStats() {
  const db = await ready();
  const workers = await listWorkers();
  const tasks = db.select().from(schema.tasks).all();
  const atts = db.select().from(schema.attestations).all();
  return workers.map((w) => {
    const mine = tasks.filter((t) => t.workerId === w.id);
    const settled = mine.filter((t) => t.state === "settled" || t.state === "resolved");
    const myAtts = atts.filter((a) => mine.some((t) => t.id === a.taskId) && a.ok !== null);
    const okAtts = myAtts.filter((a) => a.ok);
    const lat = settled
      .filter((t) => t.fundedAt && t.settledAt)
      .map((t) => new Date(t.settledAt!).getTime() - new Date(t.fundedAt!).getTime())
      .sort((a, b) => a - b);
    return {
      worker: w,
      proofs: myAtts.length,
      successRate: myAtts.length ? (okAtts.length / myAtts.length) * 100 : 0,
      medianMs: lat.length ? lat[Math.floor(lat.length / 2)] : 0,
      earned: settled.reduce((s, t) => s + t.amount, 0),
      active: mine.filter((t) => ["funded", "awaiting_proof", "proving", "verified"].includes(t.state)).length,
      tasks: mine.length,
    };
  });
}

const OPEN: TaskState[] = ["funded", "awaiting_proof", "proving", "verified"];
const HELD: TaskState[] = ["funded", "awaiting_proof", "proving", "verified", "disputed", "expired"];

export async function getOverview(rangeDays = 30): Promise<Overview> {
  const db = await ready();
  const now = Date.now();
  const tasks = db.select().from(schema.tasks).all();
  const ledger = db.select().from(schema.ledger).orderBy(asc(schema.ledger.at)).all();
  const atts = db.select().from(schema.attestations).all();

  const escrow = tasks.filter((t) => HELD.includes(t.state as TaskState)).reduce((s, t) => s + t.amount, 0);
  const releases = ledger.filter((l) => l.kind === "release");
  const inRange = (l: { at: string }, from: number, to: number) => {
    const t = new Date(l.at).getTime();
    return t >= from && t < to;
  };
  const settled30 = releases.filter((l) => inRange(l, now - 30 * DAY, now)).reduce((s, l) => s + l.amount, 0);
  const settledPrev = releases.filter((l) => inRange(l, now - 60 * DAY, now - 30 * DAY)).reduce((s, l) => s + l.amount, 0);
  const open = tasks.filter((t) => OPEN.includes(t.state as TaskState)).length;

  const recent = atts.filter((a) => a.ok !== null && now - new Date(a.createdAt).getTime() < 90 * DAY);
  const rate = recent.length ? (recent.filter((a) => a.ok).length / recent.length) * 100 : 0;
  const settleDurations = tasks
    .filter((t) => t.state === "settled" && t.fundedAt && t.settledAt)
    .map((t) => new Date(t.settledAt!).getTime() - new Date(t.fundedAt!).getTime())
    .sort((a, b) => a - b);
  const median = settleDurations.length ? settleDurations[Math.floor(settleDurations.length / 2)] : 0;

  // daily volume
  const day = (ms: number) => new Date(ms).toISOString().slice(0, 10);
  const vol = new Map<string, number>();
  for (let i = rangeDays - 1; i >= 0; i--) vol.set(day(now - i * DAY), 0);
  for (const l of releases) {
    const k = l.at.slice(0, 10);
    if (vol.has(k)) vol.set(k, (vol.get(k) ?? 0) + l.amount);
  }

  // sparks over 14 days
  const days = Array.from({ length: 14 }, (_, i) => now - (13 - i) * DAY);
  const balAt = (ms: number) => {
    let b = 0;
    for (const l of ledger) if (new Date(l.at).getTime() <= ms) b = l.balanceAfter;
    return b;
  };
  const sparkSettled = days.map((d) => releases.filter((l) => inRange(l, d - 7 * DAY, d)).reduce((s, l) => s + l.amount, 0));
  const sparkEscrow = days.map(balAt);
  const sparkOpen = days.map((d) => tasks.filter((t) => t.fundedAt && new Date(t.fundedAt).getTime() <= d && (!t.settledAt || new Date(t.settledAt).getTime() > d) && t.state !== "draft").length);
  const sparkSuccess = days.map((d) => {
    const w = atts.filter((a) => a.ok !== null && new Date(a.createdAt).getTime() <= d && new Date(a.createdAt).getTime() > d - 30 * DAY);
    return w.length ? (w.filter((a) => a.ok).length / w.length) * 100 : 0;
  });
  const sparkSettle = days.map((d) => {
    const w = tasks.filter((t) => t.settledAt && t.fundedAt && new Date(t.settledAt).getTime() <= d && new Date(t.settledAt).getTime() > d - 30 * DAY).map((t) => new Date(t.settledAt!).getTime() - new Date(t.fundedAt!).getTime()).sort((a, b) => a - b);
    return w.length ? w[Math.floor(w.length / 2)] : 0;
  });
  const pct = (a: number, b: number) => (b ? ((a - b) / b) * 100 : 0);
  return {
    escrowBalance: escrow,
    settled30d: settled30,
    openTasks: open,
    proofSuccessRate: rate,
    medianSettleMs: median,
    deltas: {
      escrow: pct(sparkEscrow[13], sparkEscrow[6] || 1),
      settled: pct(settled30, settledPrev || 1),
      open: open - sparkOpen[6],
      success: sparkSuccess[13] - sparkSuccess[6],
      settle: sparkSettle[6] ? (sparkSettle[13] - sparkSettle[6]) / 60_000 : 0,
    },
    sparks: { escrow: sparkEscrow, settled: sparkSettled, open: sparkOpen, success: sparkSuccess, settle: sparkSettle },
    volume: [...vol.entries()].map(([d, amount]) => ({ day: d, amount })),
  };
}

export async function attentionQueue() {
  const db = await ready();
  const now = Date.now();
  const tasks = db.select().from(schema.tasks).all().map(toTask);
  const events = db.select().from(schema.events).all();
  const items: { task: Task; reason: "expiring" | "disputed" | "proof_failed" | "expired"; detail: string }[] = [];
  for (const t of tasks) {
    const dl = new Date(t.deadline).getTime();
    if (t.state === "disputed") items.push({ task: t, reason: "disputed", detail: "Awaiting arbiter" });
    else if (t.state === "expired") items.push({ task: t, reason: "expired", detail: "Deadline passed. Refund available." });
    else if (["awaiting_proof", "proving", "funded"].includes(t.state)) {
      const fails = events.filter((e) => e.taskId === t.id && e.type === "proof_failed");
      const last = fails.at(-1);
      if (last && ["awaiting_proof"].includes(t.state)) items.push({ task: t, reason: "proof_failed", detail: last.note ?? "Proof failed" });
      else if (dl - now < 12 * 3_600_000 && dl > now) items.push({ task: t, reason: "expiring", detail: "Deadline soon" });
    }
  }
  const order = { disputed: 0, proof_failed: 1, expiring: 2, expired: 3 } as const;
  return items.sort((a, b) => order[a.reason] - order[b.reason]).slice(0, 6);
}

export async function listAccessRequests() {
  const db = await ready();
  return db.select().from(schema.accessRequests).orderBy(desc(schema.accessRequests.createdAt)).all();
}

export async function settingsData() {
  const db = await ready();
  return {
    members: db.select().from(schema.members).all(),
    keys: db.select().from(schema.apiKeys).all(),
    webhooks: db.select().from(schema.webhooks).all(),
    deliveries: db.select().from(schema.webhookDeliveries).orderBy(desc(schema.webhookDeliveries.at)).all(),
  };
}

export async function getMode(): Promise<Mode> {
  const db = await ready();
  const r = db.select().from(schema.settings).where(eq(schema.settings.key, "mode")).get();
  return (r?.value as Mode) ?? "simulation";
}
export async function setMode(mode: Mode) {
  const db = await ready();
  db.insert(schema.settings).values({ key: "mode", value: mode }).onConflictDoUpdate({ target: schema.settings.key, set: { value: mode } }).run();
}

export async function counts() {
  const { raw } = getDbHandle();
  void sql;
  return {
    tasks: (raw.prepare("SELECT COUNT(*) n FROM tasks").get() as { n: number }).n,
    workers: (raw.prepare("SELECT COUNT(*) n FROM workers").get() as { n: number }).n,
    events: (raw.prepare("SELECT COUNT(*) n FROM events").get() as { n: number }).n,
    ledger: (raw.prepare("SELECT COUNT(*) n FROM ledger").get() as { n: number }).n,
  };
}

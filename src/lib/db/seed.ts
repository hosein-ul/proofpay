import { keccak256, toHex, getAddress } from "viem";
import { SimulatedProvider } from "@/lib/domain/simulated-provider";
import { conditionHashOf } from "@/lib/domain/condition";
import { SIM_ATTESTOR_ADDRESS } from "@/lib/domain/attestation";
import type { Attestation, Condition, LedgerKind, Op, Role, TaskState, Worker } from "@/lib/domain/types";
import { getDb, getDbHandle, schema } from "./client";

const DAY = 86_400_000;
const HOUR = 3_600_000;
const MIN = 60_000;

function prng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
const hash = (s: string) => keccak256(toHex(s));
const tx = (s: string) => hash(`tx:${s}`);
const addr = (s: string) => getAddress(`0x${hash(`addr:${s}`).slice(-40)}`);
const iso = (ms: number) => new Date(ms).toISOString();

const WORKERS: { id: string; name: string; kind: "agent" | "contractor"; hue: number; bio: string }[] = [
  { id: "w_ada", name: "Ada", kind: "agent", hue: 218, bio: "Growth analytics agent. Pulls campaign stats and reports conversions." },
  { id: "w_kestrel", name: "Kestrel", kind: "agent", hue: 28, bio: "Lead-generation agent for B2B outreach batches." },
  { id: "w_sable", name: "Sable", kind: "agent", hue: 160, bio: "Documentation and content-migration agent." },
  { id: "w_quill", name: "Quill", kind: "agent", hue: 282, bio: "Support-triage agent that keeps queues under target." },
  { id: "w_pelle", name: "Pelle Nord", kind: "contractor", hue: 12, bio: "Freelance site-reliability engineer. Uptime and latency SLAs." },
  { id: "w_okafor", name: "Okafor Studio", kind: "contractor", hue: 320, bio: "Design and reporting studio, two people." },
  { id: "w_linnea", name: "Linnea Voss", kind: "contractor", hue: 190, bio: "Data engineer. Pipelines, backfills and row-count deliverables." },
  { id: "w_tomas", name: "Tomás Reyes", kind: "contractor", hue: 48, bio: "Open-source developer taking grants and bounties." },
];

interface Tpl {
  title: string;
  sourceId: string;
  sourceName: string;
  path: string;
  jsonPath: string;
  metric: string;
  op: Op;
  threshold: number;
  unit?: string;
  workers: string[];
  amounts: number[];
  pass: number;
  fail: number;
}
const TPL: Tpl[] = [
  { title: "Growth campaign", sourceId: "demo-campaign", sourceName: "Campaign stats", path: "campaigns/{k}/stats", jsonPath: "$.stats.conversions", metric: "conversions", op: ">=", threshold: 120, workers: ["w_ada"], amounts: [1800, 2500, 4200], pass: 138, fail: 96 },
  { title: "Lead-gen batch", sourceId: "demo-campaign", sourceName: "Campaign stats", path: "campaigns/{k}/stats", jsonPath: "$.stats.qualified_leads", metric: "qualified_leads", op: ">=", threshold: 400, workers: ["w_kestrel"], amounts: [850, 1200, 1800], pass: 431, fail: 352 },
  { title: "Uptime SLA", sourceId: "demo-job", sourceName: "Job status", path: "jobs/{k}/latency", jsonPath: "$.p95_ms", metric: "p95_ms", op: "<=", threshold: 240, unit: "ms", workers: ["w_pelle"], amounts: [1200, 2200, 3100], pass: 212, fail: 286 },
  { title: "Docs migration", sourceId: "demo-job", sourceName: "Job status", path: "jobs/{k}/progress", jsonPath: "$.job.pages_migrated", metric: "pages_migrated", op: ">=", threshold: 212, workers: ["w_sable"], amounts: [1500, 3100, 4500], pass: 212, fail: 187 },
  { title: "Report delivery", sourceId: "demo-job", sourceName: "Job status", path: "jobs/{k}/progress", jsonPath: "$.report.rows", metric: "report_rows", op: ">=", threshold: 5000, workers: ["w_okafor", "w_linnea"], amounts: [450, 640, 900], pass: 5320, fail: 4012 },
  { title: "Support queue under target", sourceId: "demo-job", sourceName: "Job status", path: "queues/{k}", jsonPath: "$.queue.open_tickets", metric: "open_tickets", op: "<=", threshold: 15, workers: ["w_quill"], amounts: [600, 1000, 1400], pass: 11, fail: 22 },
  { title: "Bounty test suite", sourceId: "demo-job", sourceName: "Job status", path: "checks/{k}", jsonPath: "$.checks.passing", metric: "checks_passing", op: ">=", threshold: 38, workers: ["w_tomas"], amounts: [2500, 5000, 8000], pass: 40, fail: 31 },
  { title: "Backfill complete", sourceId: "demo-job", sourceName: "Job status", path: "jobs/{k}/progress", jsonPath: "$.job.rows_loaded", metric: "rows_loaded", op: ">=", threshold: 1200000, workers: ["w_linnea"], amounts: [1800, 3500, 6500], pass: 1214882, fail: 998120 },
];

interface Spec {
  id: string;
  title: string;
  w: string;
  amountUsdc: number;
  tpl: Tpl;
  state: TaskState;
  ago: number; // days since created
  failedAttempts?: number;
  deadlineIn?: number; // hours from now (open tasks)
  settledAfterRetry?: boolean;
  resolveTo?: "released" | "refunded";
  disputeNote?: string;
}

const code = (n: number) => {
  const a = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
  let s = "";
  for (let i = 0; i < 4; i++) s += a[(n >> (i * 5)) & 31];
  return s;
};

function buildSpecs(): Spec[] {
  const r = prng(2026);
  const T = (name: string) => TPL.find((t) => t.title === name)!;
  const specs: Spec[] = [
    { id: "tsk_7Q2M", title: "Q4 growth campaign", w: "w_ada", amountUsdc: 2500, tpl: T("Growth campaign"), state: "settled", ago: 6 },
    { id: "tsk_4KD9", title: "Uptime SLA — October", w: "w_pelle", amountUsdc: 1200, tpl: T("Uptime SLA"), state: "verified", ago: 3 },
    { id: "tsk_9TNB", title: "Lead-gen batch 14", w: "w_kestrel", amountUsdc: 850, tpl: T("Lead-gen batch"), state: "proving", ago: 2, deadlineIn: 6 },
    { id: "tsk_2WHP", title: "Docs migration — v2", w: "w_sable", amountUsdc: 3100, tpl: T("Docs migration"), state: "awaiting_proof", ago: 4, deadlineIn: 9 * 24 },
    { id: "tsk_6B1X", title: "Grant milestone 2", w: "w_tomas", amountUsdc: 5000, tpl: T("Bounty test suite"), state: "disputed", ago: 9, failedAttempts: 1, disputeNote: "Worker says the source reported stale numbers; payer disagrees." },
    { id: "tsk_8E3F", title: "Report delivery", w: "w_okafor", amountUsdc: 640, tpl: T("Report delivery"), state: "awaiting_proof", ago: 5, failedAttempts: 2, deadlineIn: 30 },
    { id: "tsk_5N7C", title: "Support queue under 15", w: "w_quill", amountUsdc: 1000, tpl: T("Support queue under target"), state: "proving", ago: 1, deadlineIn: 70 },
    { id: "tsk_3GQ8", title: "Bounty #118 test suite", w: "w_tomas", amountUsdc: 8000, tpl: T("Bounty test suite"), state: "funded", ago: 0.3, deadlineIn: 14 * 24 },
    { id: "tsk_1YJA", title: "Pipeline backfill — Q3", w: "w_linnea", amountUsdc: 3500, tpl: T("Backfill complete"), state: "draft", ago: 0.1, deadlineIn: 20 * 24 },
    { id: "tsk_0ZPR", title: "Spring campaign (draft)", w: "w_ada", amountUsdc: 1800, tpl: T("Growth campaign"), state: "draft", ago: 0.2, deadlineIn: 12 * 24 },
    { id: "tsk_7RV2", title: "Latency SLA — September", w: "w_pelle", amountUsdc: 2200, tpl: T("Uptime SLA"), state: "expired", ago: 19, failedAttempts: 1 },
    { id: "tsk_5SDK", title: "Q3 lead-gen batch 9", w: "w_kestrel", amountUsdc: 1200, tpl: T("Lead-gen batch"), state: "expired", ago: 16 },
    { id: "tsk_2M8H", title: "Docs migration — v1", w: "w_sable", amountUsdc: 1500, tpl: T("Docs migration"), state: "refunded", ago: 34 },
    { id: "tsk_6HC4", title: "Q2 report rows", w: "w_linnea", amountUsdc: 450, tpl: T("Report delivery"), state: "refunded", ago: 48, failedAttempts: 2 },
    { id: "tsk_9A0E", title: "Support queue — June", w: "w_quill", amountUsdc: 600, tpl: T("Support queue under target"), state: "refunded", ago: 66 },
    { id: "tsk_4PWT", title: "Bounty #97 test suite", w: "w_tomas", amountUsdc: 2500, tpl: T("Bounty test suite"), state: "resolved", ago: 27, failedAttempts: 1, resolveTo: "released", disputeNote: "Source API was down at the deadline." },
  ];
  // settled history spread over ~80 days
  const hist: [string, string, number][] = [
    ["Growth campaign", "w_ada", 2], ["Lead-gen batch", "w_kestrel", 3], ["Uptime SLA", "w_pelle", 4], ["Docs migration", "w_sable", 5], ["Report delivery", "w_okafor", 7],
    ["Support queue under target", "w_quill", 9], ["Bounty test suite", "w_tomas", 11], ["Backfill complete", "w_linnea", 13], ["Growth campaign", "w_ada", 15], ["Lead-gen batch", "w_kestrel", 18],
    ["Uptime SLA", "w_pelle", 22], ["Report delivery", "w_linnea", 25], ["Bounty test suite", "w_tomas", 31], ["Growth campaign", "w_ada", 37], ["Docs migration", "w_sable", 41],
    ["Backfill complete", "w_linnea", 46], ["Support queue under target", "w_quill", 52], ["Uptime SLA", "w_pelle", 58], ["Lead-gen batch", "w_kestrel", 63], ["Bounty test suite", "w_tomas", 71],
  ];
  hist.forEach(([name, w, ago], i) => {
    const tpl = T(name);
    const amt = tpl.amounts[Math.floor(r() * tpl.amounts.length)];
    const n = Math.floor(r() * 1_000_000) + i;
    specs.push({
      id: `tsk_${code(n)}`,
      title: `${name}${["", " — week 3", " — sprint 6", " — cycle 2"][i % 4]}`.replace("Bounty test suite", `Bounty #${70 + i * 2}`),
      w,
      amountUsdc: amt,
      tpl,
      state: "settled",
      ago: ago + r() * 1.5,
      failedAttempts: r() < 0.2 ? 1 : 0,
      settledAfterRetry: r() < 0.2,
    });
  });
  return specs;
}

export async function seedDemo() {
  const { db, raw } = getDbHandle();
  const provider = new SimulatedProvider();
  const r = prng(7);
  const NOW = Date.now();
  raw.exec(
    "DELETE FROM workers; DELETE FROM tasks; DELETE FROM events; DELETE FROM ledger; DELETE FROM attestations; DELETE FROM consumed_proofs; DELETE FROM members; DELETE FROM api_keys; DELETE FROM webhooks; DELETE FROM webhook_deliveries; DELETE FROM idempotency;",
  );

  const workers: Worker[] = WORKERS.map((w, i) => ({ ...w, address: addr(w.id), createdAt: iso(NOW - (90 - i * 7) * DAY) }));
  db.insert(schema.workers).values(workers).run();
  const wById = new Map(workers.map((w) => [w.id, w]));

  const specs = buildSpecs();
  const taskRows: (typeof schema.tasks.$inferInsert)[] = [];
  const eventRows: (typeof schema.events.$inferInsert)[] = [];
  const attRows: (typeof schema.attestations.$inferInsert)[] = [];
  const consumed: (typeof schema.consumedProofs.$inferInsert)[] = [];
  const ledgerSeed: { at: number; id: string; taskId: string; kind: LedgerKind; amount: number; tx: string; debit: string; credit: string }[] = [];
  let ev = 0;
  const addEvent = (taskId: string, type: string, from: TaskState | null, to: TaskState | null, role: Role, name: string, at: number, txHash: string | null = null, note: string | null = null) =>
    eventRows.push({ id: `ev_${(ev++).toString(36).padStart(5, "0")}`, taskId, type, fromState: from, toState: to, actorRole: role, actorName: name, at: iso(at), txHash, note });

  for (const s of specs) {
    const worker = wById.get(s.w)!;
    const c = s.tpl;
    const key = s.id.slice(4).toLowerCase();
    const condition: Condition = {
      sourceId: c.sourceId,
      sourceName: c.sourceName,
      url: `https://partner.example/api/${c.path.replace("{k}", key)}`,
      method: "GET",
      jsonPath: c.jsonPath,
      metric: c.metric,
      op: c.op,
      threshold: c.threshold,
      unit: c.unit,
      disclosure: "threshold",
    };
    const conditionHash = conditionHashOf(condition);
    const created = NOW - s.ago * DAY;
    const open = s.deadlineIn !== undefined;
    const funded = s.state !== "draft" ? created + (5 + Math.floor(r() * 35)) * MIN : null;
    const deadline = open ? NOW + s.deadlineIn! * HOUR : created + (7 + Math.floor(r() * 14)) * DAY;
    const amount = s.amountUsdc * 1_000_000;
    const payer = "Northgate Growth";
    let updated = created;
    let settledAt: number | null = null;

    addEvent(s.id, "task_created", null, "draft", "payer", payer, created);
    if (funded) {
      addEvent(s.id, "funded", "draft", "funded", "payer", payer, funded, tx(`${s.id}:fund`), `Deposited ${s.amountUsdc.toLocaleString("en-US")}.00 USDC`);
      addEvent(s.id, "awaiting_proof", "funded", "awaiting_proof", "system", "ProofPay", funded + 20_000);
      updated = funded + 20_000;
      ledgerSeed.push({ at: funded, id: `le_${s.id}_in`, taskId: s.id, kind: "escrow_in", amount, tx: tx(`${s.id}:fund`), debit: "Northgate Growth wallet", credit: "Escrow" });
    }

    const baseTask = {
      id: s.id,
      title: s.title,
      workerId: s.w,
      amount,
      token: "USDC" as const,
      condition,
      deadline: iso(deadline),
      refundPolicy: "auto" as const,
      state: s.state,
      payer,
      conditionHash,
      createdAt: iso(created),
      mode: "simulation" as const,
      demo: true,
      fundedAt: funded ? iso(funded) : null,
    };
    const taskObj = baseTask as unknown as Parameters<typeof provider.createRequest>[0];

    async function attest(tsMs: number, value: number) {
      const req = await provider.createRequest(taskObj, worker);
      return provider.submit(req, taskObj, { value, timestamp: Math.floor(tsMs / 1000) });
    }
    const failTimes = Array.from({ length: s.failedAttempts ?? 0 }, (_, i) => (funded ?? created) + (3 + i * 6 + r() * 2) * HOUR);
    for (const ft of failTimes) {
      const att = await attest(ft, c.fail);
      const vr = await provider.verify(att, { ...taskObj, state: "proving" } as never, worker, { consumedDigests: new Set(), now: ft });
      attRows.push({ id: att.id, taskId: s.id, digest: att.digest, json: att, ok: false, verification: vr, createdAt: iso(ft) });
      addEvent(s.id, "proof_started", "awaiting_proof", "proving", "worker", worker.name, ft - 40_000);
      addEvent(s.id, "proof_failed", "proving", "awaiting_proof", "system", "ProofPay", ft, null, "Condition not met: the source reports a value outside the rule.");
      updated = Math.max(updated, ft);
    }

    const goodAfter = (funded ?? created) + (4 + r() * 20 + failTimes.length * 8) * HOUR;
    const needsGood = ["proving", "verified", "settled", "disputed", "resolved"].includes(s.state);
    if (needsGood && !(s.state === "disputed" && !open && false)) {
      const failedDispute = s.state === "disputed";
      const tsMs = Math.min(goodAfter, NOW - 20 * MIN);
      const value = failedDispute ? c.fail : c.pass;
      const att = await attest(tsMs, value);
      if (s.state === "proving") {
        attRows.push({ id: att.id, taskId: s.id, digest: att.digest, json: att, ok: null, verification: null, createdAt: iso(tsMs) });
        addEvent(s.id, "proof_started", "awaiting_proof", "proving", "worker", worker.name, tsMs - 30_000);
        addEvent(s.id, "proof_submitted", null, null, "worker", worker.name, tsMs, null, "Attestation submitted, waiting for verification.");
        updated = tsMs;
      } else {
        const vr = await provider.verify(att, { ...taskObj, state: "proving" } as never, worker, { consumedDigests: new Set(), now: tsMs + 20_000 });
        attRows.push({ id: att.id, taskId: s.id, digest: att.digest, json: att, ok: vr.ok, verification: vr, createdAt: iso(tsMs) });
        addEvent(s.id, "proof_started", "awaiting_proof", "proving", "worker", worker.name, tsMs - 30_000);
        if (failedDispute) {
          addEvent(s.id, "proof_failed", "proving", "awaiting_proof", "system", "ProofPay", tsMs + 20_000, null, "Condition not met.");
          addEvent(s.id, "disputed", "awaiting_proof", "disputed", "worker", worker.name, tsMs + 2 * HOUR, null, s.disputeNote ?? null);
          updated = tsMs + 2 * HOUR;
        } else {
          const vAt = tsMs + 20_000;
          addEvent(s.id, "verified", "proving", "verified", "system", "ProofPay", vAt, null, "All six checks passed.");
          updated = vAt;
          if (s.state === "settled") {
            const sAt = vAt + (2 + Math.floor(r() * 8)) * MIN;
            addEvent(s.id, "settled", "verified", "settled", "system", "Escrow", sAt, tx(`${s.id}:release`), `Released ${s.amountUsdc.toLocaleString("en-US")}.00 USDC to ${worker.name}`);
            consumed.push({ digest: att.digest.toLowerCase(), taskId: s.id, at: iso(sAt) });
            ledgerSeed.push({ at: sAt, id: `le_${s.id}_out`, taskId: s.id, kind: "release", amount, tx: tx(`${s.id}:release`), debit: "Escrow", credit: worker.name });
            settledAt = sAt;
            updated = sAt;
          }
          if (s.state === "resolved") {
            addEvent(s.id, "disputed", "verified", "disputed", "payer", payer, vAt + HOUR, null, s.disputeNote ?? null);
            const rAt = vAt + 2 * DAY;
            addEvent(s.id, "resolved", "disputed", "resolved", "arbiter", "Arbiter", rAt, tx(`${s.id}:resolve`), "Arbiter released the funds to the worker.");
            ledgerSeed.push({ at: rAt, id: `le_${s.id}_out`, taskId: s.id, kind: "release", amount, tx: tx(`${s.id}:resolve`), debit: "Escrow", credit: worker.name });
            consumed.push({ digest: att.digest.toLowerCase(), taskId: s.id, at: iso(rAt) });
            updated = rAt;
          }
        }
      }
    }

    if (s.state === "expired" || s.state === "refunded") {
      addEvent(s.id, "expired", "awaiting_proof", "expired", "system", "ProofPay", deadline, null, "Deadline passed without a valid proof.");
      updated = deadline;
      if (s.state === "refunded") {
        const rf = deadline + 3 * HOUR;
        addEvent(s.id, "refunded", "expired", "refunded", "payer", payer, rf, tx(`${s.id}:refund`), `Refunded ${s.amountUsdc.toLocaleString("en-US")}.00 USDC to payer`);
        ledgerSeed.push({ at: rf, id: `le_${s.id}_refund`, taskId: s.id, kind: "refund", amount, tx: tx(`${s.id}:refund`), debit: "Escrow", credit: "Northgate Growth wallet" });
        updated = rf;
      }
    }

    taskRows.push({
      id: s.id,
      title: s.title,
      workerId: s.w,
      amount,
      token: "USDC",
      condition,
      deadline: iso(deadline),
      refundPolicy: "auto",
      state: s.state,
      payer,
      conditionHash,
      createdAt: iso(created),
      updatedAt: iso(updated),
      fundedAt: funded ? iso(funded) : null,
      settledAt: settledAt ? iso(settledAt) : null,
      mode: "simulation",
      demo: true,
    });
  }

  db.insert(schema.tasks).values(taskRows).run();
  for (let i = 0; i < eventRows.length; i += 200) db.insert(schema.events).values(eventRows.slice(i, i + 200)).run();
  for (let i = 0; i < attRows.length; i += 50) db.insert(schema.attestations).values(attRows.slice(i, i + 50)).run();
  if (consumed.length) db.insert(schema.consumedProofs).values(consumed).run();

  // double-entry ledger, chronological, with running escrow balance
  ledgerSeed.sort((a, b) => a.at - b.at);
  let bal = 0;
  const ledgerRows = ledgerSeed.map((e) => {
    bal += e.kind === "escrow_in" ? e.amount : -e.amount;
    return { id: e.id, taskId: e.taskId, kind: e.kind, debit: e.debit, credit: e.credit, amount: e.amount, balanceAfter: bal, at: iso(e.at), txHash: e.tx };
  });
  for (let i = 0; i < ledgerRows.length; i += 200) db.insert(schema.ledger).values(ledgerRows.slice(i, i + 200)).run();

  db.insert(schema.members)
    .values([
      { id: "m_1", name: "Maya Okonkwo", email: "maya@northgate.example", role: "payer", lastActive: iso(NOW - 12 * MIN) },
      { id: "m_2", name: "Daniel Ferreira", email: "daniel@northgate.example", role: "payer", lastActive: iso(NOW - 3 * HOUR) },
      { id: "m_3", name: "Sofia Lindqvist", email: "sofia@northgate.example", role: "auditor", lastActive: iso(NOW - 2 * DAY) },
      { id: "m_4", name: "Ada (agent key)", email: "agents@northgate.example", role: "worker", lastActive: iso(NOW - 40 * MIN) },
    ])
    .run();
  db.insert(schema.apiKeys)
    .values([
      { id: "k_1", name: "Production agent", prefix: "pp_test_8f2c", scope: "tasks:write proofs:write", createdAt: iso(NOW - 41 * DAY), lastUsed: iso(NOW - 40 * MIN) },
      { id: "k_2", name: "Read-only audit", prefix: "pp_test_21ab", scope: "ledger:read tasks:read", createdAt: iso(NOW - 12 * DAY), lastUsed: iso(NOW - 2 * DAY) },
    ])
    .run();
  db.insert(schema.webhooks)
    .values([{ id: "wh_1", url: "https://hooks.northgate.example/proofpay", events: ["task.settled", "task.expired", "proof.failed"], active: true, createdAt: iso(NOW - 30 * DAY) }])
    .run();
  const deliveries = Array.from({ length: 12 }, (_, i) => ({
    id: `d_${i}`,
    webhookId: "wh_1",
    event: ["task.settled", "proof.failed", "task.settled", "task.expired"][i % 4],
    status: i === 5 ? 500 : i === 9 ? 408 : 200,
    durationMs: 90 + Math.floor(r() * 400),
    at: iso(NOW - (i * 9 + 4) * HOUR),
  }));
  db.insert(schema.webhookDeliveries).values(deliveries).run();
  db.insert(schema.settings).values([{ key: "mode", value: "simulation" }, { key: "workspace", value: "Northgate Growth" }]).onConflictDoNothing().run();
  void SIM_ATTESTOR_ADDRESS;
}

export function isSeeded(): boolean {
  const { raw } = getDbHandle();
  const row = raw.prepare("SELECT COUNT(*) AS n FROM tasks").get() as { n: number };
  return row.n > 0;
}

type G = typeof globalThis & { __pp_seed?: Promise<void> };
export function ensureSeeded(): Promise<void> {
  const g = globalThis as G;
  if (!g.__pp_seed) {
    g.__pp_seed = (async () => {
      getDb();
      if (!isSeeded()) await seedDemo();
    })();
  }
  return g.__pp_seed;
}

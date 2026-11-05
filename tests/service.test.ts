import { beforeAll, describe, expect, it } from "vitest";

process.env.DATABASE_FILE = ":memory:";

let svc: typeof import("@/lib/server/service");
let repo: typeof import("@/lib/server/repo");
let cond: typeof import("@/lib/domain/condition");

beforeAll(async () => {
  svc = await import("@/lib/server/service");
  repo = await import("@/lib/server/repo");
  cond = await import("@/lib/domain/condition");
  await repo.ready();
});

const condition = {
  sourceId: "demo-campaign",
  sourceName: "Campaign stats",
  url: "https://partner.example/api/campaigns/test/stats",
  method: "GET" as const,
  jsonPath: "$.stats.conversions",
  metric: "conversions",
  op: ">=" as const,
  threshold: 120,
  disclosure: "threshold" as const,
};
const future = () => new Date(Date.now() + 5 * 86_400_000).toISOString();

describe("seed", () => {
  it("has realistic demo data across all states", async () => {
    const c = await repo.counts();
    expect(c.workers).toBeGreaterThanOrEqual(6);
    expect(c.tasks).toBeGreaterThanOrEqual(25);
    const tasks = await repo.listTasks();
    const states = new Set(tasks.map((t) => t.state));
    for (const s of ["draft", "funded", "awaiting_proof", "proving", "verified", "settled", "expired", "refunded", "disputed", "resolved"]) expect(states.has(s as never)).toBe(true);
    expect(tasks.every((t) => t.demo)).toBe(true);
  });
  it("overview numbers are consistent", async () => {
    const o = await repo.getOverview(30);
    expect(o.escrowBalance).toBeGreaterThan(0);
    expect(o.volume).toHaveLength(30);
    expect(o.proofSuccessRate).toBeGreaterThan(50);
  });
});

describe("settlement lifecycle", () => {
  it("create → fund → failing proof → passing proof → settled, once", async () => {
    const t = await svc.createTask({ title: "Test campaign", workerId: "w_ada", amountUsdc: 500, condition, deadline: future(), refundPolicy: "auto" });
    expect(t.state).toBe("draft");
    const funded = await svc.fundTask(t.id);
    expect(funded.state).toBe("awaiting_proof");

    const bad = await svc.submitProof(t.id, { value: 96 }, { role: "worker", name: "Ada" });
    expect(bad.settled).toBe(false);
    expect(bad.verification.error).toBe("condition_not_met");
    expect((await repo.getTask(t.id))!.state).toBe("awaiting_proof");

    const good = await svc.submitProof(t.id, { value: 140 }, { role: "worker", name: "Ada" });
    expect(good.settled).toBe(true);
    expect(good.task.state).toBe("settled");
    await expect(svc.submitProof(t.id, { value: 140 }, { role: "worker", name: "Ada" })).rejects.toThrow(/can’t accept a proof/);

    const d = await repo.getTaskDetail(t.id);
    expect(d!.events.map((e) => e.type)).toEqual(["task_created", "funded", "awaiting_proof", "proof_started", "proof_failed", "proof_started", "verified", "settled"]);
    expect(d!.ledger.map((l) => l.kind)).toEqual(["escrow_in", "release"]);
  });

  it("expired → refunded returns the escrow", async () => {
    const before = (await repo.getOverview()).escrowBalance;
    const t = await svc.createTask({ title: "Will expire", workerId: "w_kestrel", amountUsdc: 750, condition, deadline: future(), refundPolicy: "auto" });
    await svc.fundTask(t.id);
    const mid = (await repo.getOverview()).escrowBalance;
    expect(mid - before).toBe(750_000_000);
    await svc.expireTask(t.id, { force: true });
    await svc.refundTask(t.id);
    expect((await repo.getTask(t.id))!.state).toBe("refunded");
    const ledger = await repo.listLedger({ taskId: t.id });
    expect(ledger.map((l) => l.kind).sort()).toEqual(["escrow_in", "refund"]);
  });

  it("dispute → resolve", async () => {
    const t = await svc.createTask({ title: "Disputed", workerId: "w_ada", amountUsdc: 300, condition, deadline: future(), refundPolicy: "payer" });
    await svc.fundTask(t.id);
    await svc.disputeTask(t.id, "Source was down", { role: "worker", name: "Ada" });
    const r = await svc.resolveTask(t.id, "release", "Verified manually");
    expect(r.state).toBe("resolved");
  });

  it("refuses illegal transitions", async () => {
    const t = await svc.createTask({ title: "Draft only", workerId: "w_ada", amountUsdc: 100, condition, deadline: future(), refundPolicy: "auto" });
    await expect(svc.refundTask(t.id)).rejects.toMatchObject({ code: "invalid_state" });
    await expect(svc.submitProof(t.id, { value: 150 }, { role: "worker", name: "Ada" })).rejects.toMatchObject({ code: "invalid_state" });
  });

  it("idempotency returns the stored response", async () => {
    let calls = 0;
    const run = () => svc.withIdempotency("key-1", "POST /x", async () => ({ status: 200, body: { n: ++calls } }));
    const a = await run();
    const b = await run();
    expect(a.body.n).toBe(1);
    expect(b.body.n).toBe(1);
    expect(b.replayed).toBe(true);
    await expect(svc.withIdempotency("key-1", "POST /y", async () => ({ status: 200, body: {} }))).rejects.toMatchObject({ code: "conflict" });
  });

  it("condition hash is stable for the same rule", () => {
    expect(cond.conditionHashOf(condition)).toBe(cond.conditionHashOf({ ...condition }));
    expect(cond.conditionHashOf(condition)).not.toBe(cond.conditionHashOf({ ...condition, threshold: 121 }));
  });
});

describe("concurrency (the write lock)", () => {
  const mk = async () => {
    const w = (await repo.listWorkers())[0];
    return svc.createTask({ title: "race", workerId: w.id, amountUsdc: 100, condition, deadline: future(), refundPolicy: "auto" });
  };

  it("funds a task exactly once when two requests race", async () => {
    const t = await mk();
    const before = (await repo.listLedger({ taskId: t.id })).length;
    const results = await Promise.allSettled([svc.fundTask(t.id), svc.fundTask(t.id)]);
    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    const rejected = results.find((r) => r.status === "rejected") as PromiseRejectedResult;
    expect(String(rejected.reason?.message ?? rejected.reason)).toMatch(/funded|awaiting|invalid|transition/i);
    expect((await repo.listLedger({ taskId: t.id })).length - before).toBe(1);
  });

  it("settles once and pays once when the same proof is submitted twice at the same time", async () => {
    const t = await mk();
    await svc.fundTask(t.id);
    const before = (await repo.listLedger({ taskId: t.id })).filter((l) => l.kind === "release").length;
    const actor = { role: "worker" as const, name: "Ada" };
    const results = await Promise.allSettled([svc.submitProof(t.id, { value: 150 }, actor), svc.submitProof(t.id, { value: 150 }, actor)]);
    expect(results.filter((r) => r.status === "fulfilled" && (r.value as { settled: boolean }).settled)).toHaveLength(1);
    expect((await repo.listLedger({ taskId: t.id })).filter((l) => l.kind === "release").length - before).toBe(1);
    expect((await repo.getTask(t.id))!.state).toBe("settled");
  });

  it("keeps the ledger balance equal to locks minus releases and refunds after the races", async () => {
    const all = await repo.listLedger();
    const sum = all.reduce((s, l) => s + (l.kind === "escrow_in" ? l.amount : -l.amount), 0);
    const newest = [...all].sort((a, b) => b.at.localeCompare(a.at))[0];
    expect(newest.balanceAfter).toBe(sum);
  });
});

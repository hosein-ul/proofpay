import { describe, expect, it } from "vitest";
import { SimulatedProvider } from "@/lib/domain/simulated-provider";
import { conditionHashOf } from "@/lib/domain/condition";
import { canTransition, assertTransition, TransitionError } from "@/lib/domain/state-machine";
import { SIM_ATTESTOR_ADDRESS } from "@/lib/domain/attestation";
import type { Condition, Task, Worker } from "@/lib/domain/types";

const condition: Condition = {
  sourceId: "demo-campaign",
  sourceName: "Demo campaign stats",
  url: "https://partner.example/api/campaigns/q4/stats",
  method: "GET",
  jsonPath: "$.stats.conversions",
  metric: "conversions",
  op: ">=",
  threshold: 120,
  disclosure: "threshold",
};
const worker: Worker = {
  id: "w_ada",
  name: "Ada",
  kind: "agent",
  address: "0x4B1e5e4f2f6A4B0d0cE9C6b9e7aD2f1c1b3a9aD2",
  hue: 210,
  bio: "",
  createdAt: new Date().toISOString(),
};
const now = Date.now();
const task: Task = {
  id: "tsk_7Q2M",
  title: "Q4 growth campaign",
  workerId: worker.id,
  amount: 2_500_000_000,
  token: "USDC",
  condition,
  deadline: new Date(now + 5 * 86_400_000).toISOString(),
  refundPolicy: "auto",
  state: "awaiting_proof",
  payer: "Northgate Growth",
  conditionHash: conditionHashOf(condition),
  createdAt: new Date(now - 86_400_000).toISOString(),
  updatedAt: new Date(now - 3_600_000).toISOString(),
  fundedAt: new Date(now - 80_000_000).toISOString(),
  settledAt: null,
  mode: "simulation",
  demo: true,
};
const provider = new SimulatedProvider();

async function prove(value: number, overrides: Partial<Task> = {}, w: Worker = worker) {
  const t = { ...task, ...overrides };
  const req = await provider.createRequest(t, w);
  const att = await provider.submit(req, t, { value });
  return { t, att };
}

describe("state machine", () => {
  it("allows the happy path and refuses skips", () => {
    expect(canTransition("draft", "funded")).toBe(true);
    expect(canTransition("verified", "settled")).toBe(true);
    expect(canTransition("draft", "settled")).toBe(false);
    expect(() => assertTransition("settled", "refunded")).toThrow(TransitionError);
  });
});

describe("simulated proof verification", () => {
  it("verifies a valid proof with all six checks", async () => {
    const { t, att } = await prove(138);
    expect(att.simulated).toBe(true);
    const r = await provider.verify(att, t, worker, { consumedDigests: new Set() });
    expect(r.ok).toBe(true);
    expect(r.steps.map((s) => s.id)).toEqual([
      "signature_valid",
      "attestor_registered",
      "bound_to_task",
      "not_replayed",
      "within_window",
      "condition_satisfied",
    ]);
  });

  it("reports condition_not_met when the source is below the threshold", async () => {
    const { t, att } = await prove(96);
    const r = await provider.verify(att, t, worker, { consumedDigests: new Set() });
    expect(r.ok).toBe(false);
    expect(r.error).toBe("condition_not_met");
  });

  it("rejects a replayed attestation", async () => {
    const { t, att } = await prove(138);
    const r = await provider.verify(att, t, worker, { consumedDigests: new Set([att.digest.toLowerCase()]) });
    expect(r.error).toBe("replayed");
  });

  it("rejects an unknown attestor", async () => {
    const { t, att } = await prove(138);
    const r = await provider.verify(att, t, worker, { consumedDigests: new Set(), registeredAttestors: ["0x000000000000000000000000000000000000dEaD"] });
    expect(r.error).toBe("attestor_unknown");
  });

  it("rejects a proof issued to a different beneficiary", async () => {
    const other: Worker = { ...worker, id: "w_x", address: "0x1111111111111111111111111111111111111111" };
    const t = task;
    const req = await provider.createRequest(t, other);
    const att = await provider.submit(req, t, { value: 140 });
    const r = await provider.verify(att, t, worker, { consumedDigests: new Set() });
    expect(r.error).toBe("wrong_beneficiary");
  });

  it("rejects a tampered attestation (signature no longer matches)", async () => {
    const { t, att } = await prove(96);
    const forged = { ...att, data: JSON.stringify({ conversions: "true" }) };
    const r = await provider.verify(forged, t, worker, { consumedDigests: new Set() });
    expect(r.ok).toBe(false);
    expect(["attestor_unknown", "proof_invalid"]).toContain(r.error);
  });

  it("rejects a proof for a different task", async () => {
    const { att } = await prove(138);
    const other = { ...task, id: "tsk_OTHER" };
    const r = await provider.verify(att, other, worker, { consumedDigests: new Set() });
    expect(r.error).toBe("not_bound");
  });

  it("rejects a proof outside the window", async () => {
    const t = { ...task, deadline: new Date(now - 10 * 86_400_000).toISOString() };
    const req = await provider.createRequest(t, worker);
    const att = await provider.submit(req, t, { value: 140 });
    const r = await provider.verify(att, t, worker, { consumedDigests: new Set() });
    expect(r.error).toBe("outside_window");
  });

  it("uses a simulated attestor, never the Primus one", async () => {
    const { att } = await prove(138);
    expect(att.attestors[0].attestorAddr).toBe(SIM_ATTESTOR_ADDRESS);
    expect(att.attestors[0].url.startsWith("simulated://")).toBe(true);
  });
});

import { describe, expect, it } from "vitest";
import { attestationDigest, signDigest, SIM_ATTESTOR_ADDRESS } from "@/lib/domain/attestation";
import { PrimusProvider } from "@/lib/domain/primus-provider";
import { attConditionsFor, conditionHashOf, taskAdditionParams } from "@/lib/domain/condition";
import type { Condition, Task, Worker } from "@/lib/domain/types";

const condition: Condition = { sourceId: "demo-campaign", sourceName: "Campaign stats", url: "https://partner.example/campaigns/cmp_ada/stats", method: "GET", jsonPath: "$.conversions", metric: "conversions", op: ">=", threshold: 1200, disclosure: "threshold" };
const worker: Worker = { id: "w_ada", name: "Ada", kind: "agent", address: "0xE86C0000000000000000000000000000000A2A0C", hue: 218, bio: "", createdAt: new Date().toISOString() };
const now = new Date().toISOString();
const task: Task = { id: "tsk_LIVE", title: "t", workerId: worker.id, amount: 1_000_000, token: "USDC", condition, deadline: new Date(Date.now() + 86_400_000).toISOString(), refundPolicy: "auto", state: "awaiting_proof", payer: "0x1", conditionHash: conditionHashOf(condition), createdAt: now, updatedAt: now, fundedAt: now, settledAt: null, mode: "live", demo: false };

async function sdkAttestation(tsMs: number) {
  const base = {
    recipient: worker.address,
    request: { url: condition.url, header: "{}", method: "GET", body: "" },
    responseResolve: [{ keyName: "conversions", parseType: "json", parsePath: "$.conversions" }],
    data: JSON.stringify({ conversions: "true" }),
    attConditions: attConditionsFor(condition),
    timestamp: Math.floor(tsMs / 1000),
    additionParams: taskAdditionParams(task.id, task.conditionHash),
  };
  const sig = await signDigest(attestationDigest(base));
  // SDK shape: `reponseResolve`, timestamp as a number (milliseconds here, to exercise the normaliser)
  return { recipient: base.recipient, request: base.request, reponseResolve: base.responseResolve, data: base.data, attConditions: base.attConditions, timestamp: tsMs, additionParams: base.additionParams, attestors: [{ attestorAddr: SIM_ATTESTOR_ADDRESS, url: "https://attestor.test" }], signatures: [sig] };
}

describe("PrimusProvider (mapping and verification; no network)", () => {
  const p = new PrimusProvider();
  it("maps an SDK-shaped attestation and verifies it when the attestor is trusted", async () => {
    const req = await p.createRequest(task, worker);
    const att = await p.submit(req, task, { attestation: await sdkAttestation(Date.now()) });
    expect(att.simulated).toBe(false);
    expect(att.mode).toBe("live");
    const v = await p.verify(att, task, worker, { consumedDigests: new Set(), registeredAttestors: [SIM_ATTESTOR_ADDRESS] });
    expect(v.steps.map((s) => [s.id, s.ok])).toEqual(v.steps.map((s) => [s.id, true]));
    expect(v.ok).toBe(true);
  });
  it("rejects an attestor that is not on the environment list", async () => {
    const att = await p.submit(await p.createRequest(task, worker), task, { attestation: await sdkAttestation(Date.now()) });
    const v = await p.verify(att, task, worker, { consumedDigests: new Set(), registeredAttestors: [] });
    expect(v.ok).toBe(false);
    expect(v.error).toBe("attestor_unknown");
  });
  it("refuses a body without an SDK attestation", async () => {
    await expect(p.submit(await p.createRequest(task, worker), task, { value: 5000 })).rejects.toThrow(/Primus SDK/);
  });
});

import { keccak256, toHex } from "viem";
import { attestationDigest, signDigest, SIM_ATTESTOR_ADDRESS, SIM_ATTESTOR_URL } from "./attestation";
import { attConditionsFor, evaluate, taskAdditionParams } from "./condition";
import type { Evidence, ProofProvider, ProofRequest, VerifyOptions } from "./provider";
import { verifyAttestation } from "./verify";
import type { Attestation, Task, Worker } from "./types";

/**
 * SimulatedProvider: deterministic and clearly synthetic. The attestor is a local test key, not Primus.
 * Every attestation it makes has `simulated: true` and the UI must label it wherever it is shown or exported.
 */
export class SimulatedProvider implements ProofProvider {
  mode = "simulation" as const;

  async createRequest(task: Task, worker: Worker): Promise<ProofRequest> {
    return {
      taskId: task.id,
      mode: "simulation",
      recipient: worker.address,
      url: task.condition.url,
      method: "GET",
      additionParams: taskAdditionParams(task.id, task.conditionHash),
      attConditions: attConditionsFor(task.condition),
      nonce: keccak256(toHex(`${task.id}:${Date.now()}:${Math.random()}`)).slice(0, 18),
      createdAt: new Date().toISOString(),
    };
  }

  async submit(req: ProofRequest, task: Task, evidence: Evidence): Promise<Attestation> {
    const c = task.condition;
    const value = evidence.value ?? c.threshold;
    const result = evaluate(c.op, value, c.threshold);
    const ts = evidence.timestamp ?? Math.floor(Date.now() / 1000);
    const base = {
      recipient: req.recipient,
      request: { url: req.url, header: JSON.stringify({ Authorization: "Bearer ••••••••" }), method: req.method, body: "" },
      responseResolve: [{ keyName: c.metric, parseType: "json", parsePath: c.jsonPath }],
      // For comparison conditions the verifier learns a boolean, not the value (docs.primuslabs.xyz/build/op).
      data: JSON.stringify({ [c.metric]: result ? "true" : "false" }),
      attConditions: req.attConditions,
      timestamp: ts,
      additionParams: req.additionParams,
    };
    const digest = attestationDigest(base);
    const signature = await signDigest(digest);
    return {
      id: `att_${digest.slice(2, 12)}`,
      taskId: task.id,
      mode: "simulation",
      simulated: true,
      ...base,
      attestors: [{ attestorAddr: SIM_ATTESTOR_ADDRESS, url: SIM_ATTESTOR_URL }],
      signatures: [signature],
      digest,
      createdAt: new Date(ts * 1000).toISOString(),
      privateFields: evidence.privateFields ?? [
        { key: "account_id", value: "acct_88213_nrthgt" },
        { key: "spend_usd", value: "48,210.55" },
        { key: c.metric, value: String(value) },
      ],
    };
  }

  verify(att: Attestation, task: Task, worker: Worker, opts: VerifyOptions) {
    return verifyAttestation(att, task, worker, {
      registeredAttestors: opts.registeredAttestors ?? [SIM_ATTESTOR_ADDRESS],
      consumedDigests: opts.consumedDigests,
      now: opts.now,
    });
  }
}

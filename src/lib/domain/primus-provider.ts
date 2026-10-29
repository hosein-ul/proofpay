import { keccak256, toHex, getAddress, isAddress } from "viem";
import { attestationDigest } from "./attestation";
import { attConditionsFor, taskAdditionParams } from "./condition";
import { DomainError } from "./errors";
import type { Evidence, ProofProvider, ProofRequest, VerifyOptions } from "./provider";
import { verifyAttestation } from "./verify";
import type { Attestation, Task, Worker } from "./types";

/** The shape `@primuslabs/zktls-js-sdk@0.3.15` returns from `startAttestation` (dist/types.d.ts). Note upstream's `reponseResolve`. */
interface SdkAttestation {
  recipient: string;
  request: { url: string; header: string; method: string; body: string };
  reponseResolve: { keyName: string; parseType: string; parsePath: string }[];
  data: string;
  attConditions: string;
  timestamp: number;
  additionParams: string;
  attestors: { attestorAddr: string; url: string }[];
  signatures: string[];
}

function isSdkAttestation(x: unknown): x is SdkAttestation {
  const a = x as Partial<SdkAttestation> | null;
  return !!a && typeof a === "object" && typeof a.recipient === "string" && isAddress(a.recipient, { strict: false }) && !!a.request && typeof a.request.url === "string" && Array.isArray(a.reponseResolve) && typeof a.data === "string" && typeof a.attConditions === "string" && typeof a.timestamp === "number" && typeof a.additionParams === "string" && Array.isArray(a.attestors) && Array.isArray(a.signatures) && a.signatures.every((s) => typeof s === "string");
}

/**
 * Live provider. The attestation itself is produced in the worker's browser by the Primus extension (a TLS session
 * only that browser can run), so `submit` does not make one: it maps the SDK's result into our shape and the same six
 * checks as Simulation run over it. UNVERIFIED against a real attestation: see DECISIONS.md D6.
 */
export class PrimusProvider implements ProofProvider {
  mode = "live" as const;

  async createRequest(task: Task, worker: Worker): Promise<ProofRequest> {
    return {
      taskId: task.id,
      mode: "live",
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
    if (!isSdkAttestation(evidence.attestation)) {
      throw new DomainError("bad_request", "Live mode needs the attestation returned by the Primus SDK in the request body (`attestation`).", 400);
    }
    const a = evidence.attestation;
    // Assumption (D6): the SDK's `timestamp` unit is not stated in its typings. Values above 1e12 are milliseconds.
    const ts = a.timestamp > 1e12 ? Math.floor(a.timestamp / 1000) : a.timestamp;
    const base = {
      recipient: getAddress(a.recipient),
      request: a.request,
      responseResolve: a.reponseResolve,
      data: a.data,
      attConditions: a.attConditions,
      timestamp: ts,
      additionParams: a.additionParams,
    };
    const digest = attestationDigest(base);
    return {
      id: `att_${digest.slice(2, 12)}`,
      taskId: task.id,
      mode: "live",
      simulated: false,
      ...base,
      attestors: a.attestors,
      signatures: a.signatures,
      digest,
      createdAt: new Date(ts * 1000).toISOString(),
      privateFields: [], // never leaves the worker's browser
    };
  }

  verify(att: Attestation, task: Task, worker: Worker, opts: VerifyOptions) {
    return verifyAttestation(att, task, worker, { registeredAttestors: opts.registeredAttestors ?? [], consumedDigests: opts.consumedDigests, now: opts.now });
  }
}

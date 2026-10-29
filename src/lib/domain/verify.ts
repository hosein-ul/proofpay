import { getAddress, keccak256, encodePacked } from "viem";
import { attestationDigest, recoverSigner } from "./digest";
import { attConditionsFor, taskAdditionParams } from "./condition";
import type { Attestation, ProofErrorCode, Task, VerificationResult, VerifyStep, Worker } from "./types";

export interface VerifyContext {
  registeredAttestors: string[];
  consumedDigests: Set<string>;
  now?: number; // ms
  skewMs?: number;
}

/**
 * The six checks every settlement goes through. This mirrors what the escrow contract does on-chain
 * (docs/primus-notes.md §2), so the backend and the contract agree on what "verified" means.
 * Pure: no I/O. Returns every step so the Proof Inspector can show them resolving one by one.
 */
export async function verifyAttestation(att: Attestation, task: Task, worker: Worker, ctx: VerifyContext): Promise<VerificationResult> {
  const now = ctx.now ?? Date.now();
  const skew = ctx.skewMs ?? 60_000;
  const steps: VerifyStep[] = [];
  const push = (s: VerifyStep) => steps.push(s);

  // 1. signature recovers to some address over the digest
  const digest = attestationDigest(att);
  const sig = att.signatures[0];
  const signer = sig && att.signatures.length === 1 ? await recoverSigner(digest, sig as `0x${string}`) : null;
  push(
    signer
      ? { id: "signature_valid", label: "Signature valid", ok: true, detail: `Recovered ${short(signer)} from digest ${short(digest)}.` }
      : { id: "signature_valid", label: "Signature valid", ok: false, detail: "The signature could not be recovered from the attestation digest.", code: "proof_invalid" },
  );

  // 2. signer is a registered attestor
  const registered = !!signer && ctx.registeredAttestors.some((a) => a.toLowerCase() === signer.toLowerCase());
  push(
    registered
      ? { id: "attestor_registered", label: "Attestor registered", ok: true, detail: `${short(signer!)} is on this environment’s attestor list.` }
      : {
          id: "attestor_registered",
          label: "Attestor registered",
          ok: false,
          detail: signer ? `${short(signer)} is not a registered attestor here.` : "No signer to check.",
          code: signer ? "attestor_unknown" : "proof_invalid",
        },
  );

  // 3. bound to this task: recipient, additionParams, URL and condition hash
  const expectedParams = taskAdditionParams(task.id, task.conditionHash);
  const urlHash = keccak256(encodePacked(["string", "string"], [att.request.url, att.attConditions]));
  let boundCode: ProofErrorCode | undefined;
  let boundDetail = `Recipient is ${worker.name}; additionParams carry ${task.id}; rule hash matches.`;
  if (safeAddr(att.recipient) !== safeAddr(worker.address)) {
    boundCode = "wrong_beneficiary";
    boundDetail = `Proof was issued to ${short(att.recipient)}, but the task’s worker is ${short(worker.address)}.`;
  } else if (att.additionParams !== expectedParams) {
    boundCode = "not_bound";
    boundDetail = "additionParams do not carry this task’s id and rule hash.";
  } else if (urlHash.toLowerCase() !== task.conditionHash.toLowerCase() || att.attConditions !== attConditionsFor(task.condition)) {
    boundCode = "not_bound";
    boundDetail = "The attested URL or condition does not match the rule committed when the task was created.";
  }
  push({ id: "bound_to_task", label: "Bound to this task", ok: !boundCode, detail: boundDetail, code: boundCode });

  // 4. not replayed
  const replayed = ctx.consumedDigests.has(digest.toLowerCase());
  push(
    replayed
      ? { id: "not_replayed", label: "Not replayed", ok: false, detail: "This attestation has already been used to settle a task.", code: "replayed" }
      : { id: "not_replayed", label: "Not replayed", ok: true, detail: "Digest has not been seen before." },
  );

  // 5. inside the window [funded − skew, deadline + skew]
  const ts = att.timestamp * 1000;
  const from = task.fundedAt ? new Date(task.fundedAt).getTime() - skew : 0;
  const to = new Date(task.deadline).getTime() + skew;
  const inWindow = ts >= from && ts <= to && now <= to + 365 * 86_400_000;
  push(
    inWindow
      ? { id: "within_window", label: "Within window", ok: true, detail: "Timestamp is after funding and before the deadline." }
      : { id: "within_window", label: "Within window", ok: false, detail: ts > to ? "Timestamp is after the task’s deadline." : "Timestamp is before the task was funded.", code: "outside_window" },
  );

  // 6. the disclosed claim satisfies the rule (verifier sees a boolean for comparison conditions)
  let claim: "true" | "false" | "missing" = "missing";
  try {
    const d = JSON.parse(att.data) as Record<string, unknown>;
    const v = d[task.condition.metric];
    claim = v === "true" || v === true ? "true" : v === "false" || v === false ? "false" : "missing";
  } catch {}
  push(
    claim === "true"
      ? { id: "condition_satisfied", label: "Condition satisfied", ok: true, detail: `Disclosed claim: ${task.condition.metric} meets the rule.` }
      : {
          id: "condition_satisfied",
          label: "Condition satisfied",
          ok: false,
          detail: claim === "false" ? "The attestation is valid and says the rule is not met." : "The attestation does not disclose a result for this rule.",
          code: claim === "false" ? "condition_not_met" : "proof_invalid",
        },
  );

  const first = steps.find((s) => !s.ok);
  return { ok: !first, steps, error: first?.code, verifiedAt: new Date(now).toISOString() };
}

const short = (s: string) => (s.length > 14 ? `${s.slice(0, 6)}…${s.slice(-4)}` : s);
function safeAddr(a: string): string {
  try {
    return getAddress(a);
  } catch {
    return a.toLowerCase();
  }
}

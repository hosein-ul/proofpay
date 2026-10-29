import type { ProofErrorCode } from "./types";

/** Error taxonomy: what happened, and what the person can do next. Shown inline in the UI. */
export const PROOF_ERRORS: Record<ProofErrorCode, { title: string; body: string; recovery: string; tone: "bad" | "warn" }> = {
  proof_invalid: {
    title: "Proof invalid",
    body: "The attestation signature does not match its contents, so it cannot have been issued as shown.",
    recovery: "Ask the worker to generate a new proof. If it keeps failing, open a dispute.",
    tone: "bad",
  },
  attestor_unknown: {
    title: "Attestor not recognised",
    body: "The signature is well formed, but the signer is not on this environment’s list of registered attestors.",
    recovery: "Check the environment (Simulation or Live) and that the worker used the matching attestor.",
    tone: "bad",
  },
  wrong_beneficiary: {
    title: "Wrong beneficiary",
    body: "The proof was issued to a different address than the task’s worker, so funds cannot be released to it.",
    recovery: "The worker must generate the proof from the address named on the task.",
    tone: "bad",
  },
  not_bound: {
    title: "Not bound to this task",
    body: "The proof does not carry this task’s id or rule. It may belong to another task.",
    recovery: "Generate the proof from this task’s page so the task id is included.",
    tone: "bad",
  },
  replayed: {
    title: "Proof already used",
    body: "This exact attestation has been used before. Each proof can settle only once.",
    recovery: "Generate a fresh proof. Check that the task has not already settled.",
    tone: "warn",
  },
  outside_window: {
    title: "Outside the proof window",
    body: "The proof’s timestamp is before the task was funded or after its deadline.",
    recovery: "If the deadline has passed, the payer can refund. Otherwise generate a new proof.",
    tone: "warn",
  },
  condition_not_met: {
    title: "Condition not met",
    body: "The proof is valid, and it shows the source does not meet the rule.",
    recovery: "The worker can try again before the deadline. After it, the payer can refund.",
    tone: "warn",
  },
  expired: {
    title: "Task expired",
    body: "The deadline has passed, so this task can no longer be settled.",
    recovery: "The payer can refund the escrow, or open a dispute.",
    tone: "warn",
  },
  network_error: {
    title: "Network error",
    body: "We could not reach the attestor or the chain. Nothing was changed.",
    recovery: "Try again in a moment. Your funds are safe in escrow.",
    tone: "warn",
  },
};

export class DomainError extends Error {
  constructor(
    public code: ProofErrorCode | "not_found" | "forbidden" | "invalid_state" | "bad_request" | "rate_limited" | "conflict",
    message: string,
    public status = 400,
  ) {
    super(message);
    this.name = "DomainError";
  }
}

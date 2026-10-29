import type { TaskState } from "./types";

/** Legal transitions. Everything that changes a task goes through `assertTransition`. */
export const TRANSITIONS: Record<TaskState, TaskState[]> = {
  draft: ["funded"],
  funded: ["awaiting_proof", "expired", "disputed"],
  awaiting_proof: ["proving", "expired", "disputed"],
  proving: ["verified", "awaiting_proof", "disputed", "expired"],
  verified: ["settled", "disputed"],
  settled: [],
  expired: ["refunded", "disputed"],
  refunded: [],
  disputed: ["resolved"],
  resolved: [],
};

export function canTransition(from: TaskState, to: TaskState): boolean {
  return TRANSITIONS[from].includes(to);
}

export class TransitionError extends Error {
  constructor(
    public from: TaskState,
    public to: TaskState,
  ) {
    super(`Cannot move a task from ${from} to ${to}.`);
    this.name = "TransitionError";
  }
}

export function assertTransition(from: TaskState, to: TaskState) {
  if (!canTransition(from, to)) throw new TransitionError(from, to);
}

export const TERMINAL: TaskState[] = ["settled", "refunded", "resolved"];
export const OPEN_STATES: TaskState[] = ["funded", "awaiting_proof", "proving", "verified"];
export const isTerminal = (s: TaskState) => TERMINAL.includes(s);

/** The primary action a payer or worker sees for each state. */
export function primaryAction(state: TaskState): { id: string; label: string; role: "payer" | "worker" | "system" } | null {
  switch (state) {
    case "draft":
      return { id: "fund", label: "Fund escrow", role: "payer" };
    case "funded":
    case "awaiting_proof":
      return { id: "prove", label: "Generate proof", role: "worker" };
    case "proving":
      return { id: "verify", label: "Verify proof", role: "system" };
    case "verified":
      return { id: "settle", label: "Release funds", role: "system" };
    case "expired":
      return { id: "refund", label: "Refund to payer", role: "payer" };
    case "disputed":
      return { id: "resolve", label: "Resolve dispute", role: "payer" };
    default:
      return null;
  }
}

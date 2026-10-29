/** The same names appear in the DB, the API, the contract and the UI. */
export const TASK_STATES = [
  "draft",
  "funded",
  "awaiting_proof",
  "proving",
  "verified",
  "settled",
  "expired",
  "refunded",
  "disputed",
  "resolved",
] as const;
export type TaskState = (typeof TASK_STATES)[number];

export const STATE_LABEL: Record<TaskState, string> = {
  draft: "Draft",
  funded: "Funded",
  awaiting_proof: "Awaiting proof",
  proving: "Proving",
  verified: "Verified",
  settled: "Settled",
  expired: "Expired",
  refunded: "Refunded",
  disputed: "Disputed",
  resolved: "Resolved",
};

export type Tone = "ok" | "info" | "warn" | "bad" | "mute";
export const STATE_TONE: Record<TaskState, Tone> = {
  draft: "mute",
  funded: "info",
  awaiting_proof: "info",
  proving: "warn",
  verified: "info",
  settled: "ok",
  expired: "warn",
  refunded: "mute",
  disputed: "bad",
  resolved: "ok",
};

export type Mode = "simulation" | "live";
export type Role = "payer" | "worker" | "auditor" | "arbiter" | "system";

export type Op = ">=" | ">" | "<=" | "<" | "=" | "!=";
export const OP_LABEL: Record<Op, string> = { ">=": "≥", ">": ">", "<=": "≤", "<": "<", "=": "=", "!=": "≠" };

export interface Condition {
  sourceId: string;
  sourceName: string;
  url: string;
  method: "GET";
  jsonPath: string;
  metric: string;
  op: Op;
  threshold: number;
  unit?: string;
  disclosure: "threshold" | "hash" | "reveal";
}

export interface Task {
  id: string;
  title: string;
  workerId: string;
  amount: number; // USDC micro-units (6 decimals)
  token: "USDC";
  condition: Condition;
  deadline: string; // ISO
  refundPolicy: "auto" | "payer";
  state: TaskState;
  payer: string;
  conditionHash: string;
  createdAt: string;
  updatedAt: string;
  fundedAt: string | null;
  settledAt: string | null;
  mode: Mode;
  demo: boolean;
}

export interface Worker {
  id: string;
  name: string;
  kind: "agent" | "contractor";
  address: string;
  hue: number;
  bio: string;
  createdAt: string;
}

export interface TaskEvent {
  id: string;
  taskId: string;
  type: string;
  from: TaskState | null;
  to: TaskState | null;
  actorRole: Role;
  actorName: string;
  at: string;
  txHash: string | null;
  note: string | null;
}

export type LedgerKind = "escrow_in" | "release" | "refund" | "fee";
export interface LedgerEntry {
  id: string;
  taskId: string;
  kind: LedgerKind;
  debit: string; // account name
  credit: string;
  amount: number; // micro
  balanceAfter: number; // escrow balance after, micro
  at: string;
  txHash: string | null;
}

export interface AttestationRequest {
  url: string;
  header: string;
  method: string;
  body: string;
}
export interface ResponseResolve {
  keyName: string;
  parseType: string;
  parsePath: string;
}
export interface Attestation {
  id: string;
  taskId: string;
  mode: Mode;
  simulated: boolean;
  recipient: string;
  request: AttestationRequest;
  responseResolve: ResponseResolve[];
  data: string;
  attConditions: string;
  timestamp: number; // unix seconds
  additionParams: string;
  attestors: { attestorAddr: string; url: string }[];
  signatures: string[];
  digest: string;
  createdAt: string;
  /** what the source actually returned, kept on the worker side only; never sent to the verifier */
  privateFields: { key: string; value: string }[];
}

export type VerifyStepId =
  | "signature_valid"
  | "attestor_registered"
  | "bound_to_task"
  | "not_replayed"
  | "within_window"
  | "condition_satisfied";
export interface VerifyStep {
  id: VerifyStepId;
  label: string;
  ok: boolean;
  detail: string;
  code?: ProofErrorCode;
}
export interface VerificationResult {
  ok: boolean;
  steps: VerifyStep[];
  error?: ProofErrorCode;
  verifiedAt: string;
}

export type ProofErrorCode =
  | "proof_invalid"
  | "attestor_unknown"
  | "wrong_beneficiary"
  | "not_bound"
  | "replayed"
  | "outside_window"
  | "condition_not_met"
  | "expired"
  | "network_error";

export interface Overview {
  escrowBalance: number;
  settled30d: number;
  openTasks: number;
  proofSuccessRate: number;
  medianSettleMs: number;
  deltas: { escrow: number; settled: number; open: number; success: number; settle: number };
  sparks: Record<"escrow" | "settled" | "open" | "success" | "settle", number[]>;
  volume: { day: string; amount: number }[];
}

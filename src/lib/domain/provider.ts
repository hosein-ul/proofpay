import type { Attestation, Mode, Task, VerificationResult, Worker } from "./types";

export interface ProofRequest {
  taskId: string;
  mode: Mode;
  recipient: string;
  url: string;
  method: "GET";
  additionParams: string;
  attConditions: string;
  nonce: string;
  createdAt: string;
}

/** What a worker hands the provider. In Simulation it is the value the demo source reports; in Live the SDK fetches it. */
export interface Evidence {
  /** numeric value the source reports for the rule's metric */
  value?: number;
  /** override the timestamp (tests, seeds) */
  timestamp?: number;
  /** extra private fields the source returned, kept off the attestation */
  privateFields?: { key: string; value: string }[];
}

export interface VerifyOptions {
  registeredAttestors?: string[];
  consumedDigests: Set<string>;
  now?: number;
}

export interface ProofProvider {
  mode: Mode;
  createRequest(task: Task, worker: Worker): Promise<ProofRequest>;
  submit(req: ProofRequest, task: Task, evidence: Evidence): Promise<Attestation>;
  verify(att: Attestation, task: Task, worker: Worker, opts: VerifyOptions): Promise<VerificationResult>;
}

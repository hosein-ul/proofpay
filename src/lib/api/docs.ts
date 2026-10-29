/** Hand-kept registry of the public API. tests/docs-registry.test.ts checks every entry maps to a real route file, so it cannot silently drift. */
export interface Endpoint { method: "GET" | "POST"; path: string; file: string; summary: string; body?: string; notes?: string }
export const ENDPOINTS: Endpoint[] = [
  { method: "GET", path: "/api/health", file: "health", summary: "Service and provider health." },
  { method: "GET", path: "/api/overview", file: "overview", summary: "Balances, volume and rates for the workspace." },
  { method: "GET", path: "/api/tasks", file: "tasks", summary: "List tasks. Filter with ?state= and ?workerId=." },
  { method: "POST", path: "/api/tasks", file: "tasks", summary: "Create a draft task.", body: `{ "title": "Q4 growth campaign", "workerId": "w_ada", "amountUsdc": 2500, "condition": { ... }, "deadline": "2026-11-20T12:00:00Z", "refundPolicy": "auto" }` },
  { method: "GET", path: "/api/tasks/{id}", file: "tasks/[id]", summary: "One task with events, ledger entries and proofs." },
  { method: "POST", path: "/api/tasks/{id}/fund", file: "tasks/[id]/fund", summary: "Lock the funds.", notes: "Send an Idempotency-Key header." },
  { method: "POST", path: "/api/tasks/{id}/proof", file: "tasks/[id]/proof", summary: "Submit a proof. Verified and, if valid, settled.", body: `{ "value": 1340 }  // Simulation only`, notes: "Returns the six checks and, on failure, an error code with a recovery step." },
  { method: "POST", path: "/api/tasks/{id}/expire", file: "tasks/[id]/expire", summary: "Mark an unproven task expired after its deadline." },
  { method: "POST", path: "/api/tasks/{id}/refund", file: "tasks/[id]/refund", summary: "Refund an expired task to the payer." },
  { method: "POST", path: "/api/tasks/{id}/dispute", file: "tasks/[id]/dispute", summary: "Open a dispute.", body: `{ "note": "The source figure is wrong" }` },
  { method: "POST", path: "/api/tasks/{id}/resolve", file: "tasks/[id]/resolve", summary: "Resolve a dispute (arbiter).", body: `{ "outcome": "release" | "refund", "note": "" }` },
  { method: "GET", path: "/api/workers", file: "workers", summary: "Workers with track records." },
  { method: "GET", path: "/api/ledger", file: "ledger", summary: "Ledger entries. Add ?format=csv to download." },
  { method: "GET", path: "/api/attestations/{id}", file: "attestations/[id]", summary: "An attestation. Private fields are never included." },
  { method: "GET", path: "/api/events", file: "events", summary: "Activity feed. ?significant=1 filters noise." },
];
export const ERROR_CODES = ["proof_invalid", "attestor_unknown", "wrong_beneficiary", "not_bound", "replayed", "outside_window", "condition_not_met", "expired", "network_error"] as const;

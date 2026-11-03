# Security review

**Status: internally reviewed. Not independently audited.** This document is the author's own review (an AI-assisted code review with static analysis). It is not a substitute for an audit by an outside firm and must not be described as one. Testnet only: do not put real funds behind this code.

## Method
- Static analysis: Slither 0.11.6 on `contracts/src` (excluding mocks, tests, deps).
- Manual review of `ProofPayEscrow`, the verification path, the HTTP API, and the browser tools.
- Each fix has a test; the contract fix was checked to fail before and pass after.
- Checks run in CI-style commands: 34 Foundry tests (incl. a 256-run fuzz), 24 unit tests, 42 Playwright tests (flows + axe a11y) against a production build.

## Findings and status

| # | Area | Severity (my rating) | Finding | Status |
|---|---|---|---|---|
| C1 | Contract | Medium | Replay key included the signature bytes. ECDSA signatures can be re-encoded (`s → n−s`), so one proof could pass as "new". | **Fixed.** Key is now a hash of the attested content only. Test `test_malleatedSignature_cannotReplay`. |
| C2 | Contract | Medium | A disputed task could stay frozen forever if the arbiter never acted. | **Fixed.** `splitStale` splits 50/50 after 30 days. Tests added. |
| C3 | Contract | Low | Zero-address inputs accepted for arbiter, verifier, token. Admin events not indexed. | **Fixed.** |
| C4 | Contract | Low | Anyone can pick a task id first (id squatting) and block that id. | Accepted. Use an unpredictable id; the app does. |
| C5 | Contract | Trust | The owner can swap the verifier instantly, and could then settle any funded task to its beneficiary. | **Accepted, documented.** Needs a timelock/multisig before any real use. |
| C6 | Contract | Trust | A party can dispute a funded task, including just as a proof arrives. The arbiter decides. | **Accepted, documented.** Inherent to having disputes. |
| C7 | Contract | Info | Primus' timestamp unit is not in the SDK typings. Values above 1e12 are treated as ms. | Open: verify against a real attestation (DECISIONS D6). |
| W1 | API | High on a public deploy | `/api/mode` and `/api/demo/reset` were unauthenticated. | **Fixed.** In production they need `ADMIN_TOKEN` (reset can opt in with `PUBLIC_DEMO=1`, rate limited). |
| W2 | API | Low | Admin token compared with `!==`. | **Fixed** (constant-time). |
| W3 | API | Low | CSV export could carry spreadsheet formulas. | **Fixed.** |
| W4 | API | Low | Rate limiting trusted a client-supplied `X-Forwarded-For`. | **Fixed:** edge-set headers preferred. |
| W5 | API | Low | No request-body size cap; unbounded rate-limit map. | **Fixed** (64 KB cap, bounded map). |
| W6 | Web | Medium | No security headers. | **Fixed:** CSP, HSTS, frame-ancestors none, nosniff, referrer and permissions policies. `script-src` still allows `'unsafe-inline'` (Next hydration, theme script): moving to nonces is open. |
| W7 | Web | Info | Demo demo-secret: the Simulation attestor key is public by design and no longer in the client bundle. | Fixed/verified. |

Slither reported no high or medium issues. Its low/informational items were the zero-checks (C3) and unindexed events (C3), and block-timestamp comparisons, which are intentional (deadlines).

## Not covered (needs an outside party)
- Independent smart-contract audit and a formal review of the Primus verifier assumptions.
- Penetration test of a deployed instance.
- Real authentication: roles are still a view switch. The API has no user accounts, so **do not expose a Live deployment**.
- Key management for deploys (use a hardware wallet or a managed signer; never commit keys).

## Reporting
The contact address in `src/lib/config.ts` is a placeholder (`security@example.invalid`). Replace it before any public launch.

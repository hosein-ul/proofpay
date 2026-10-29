# Decisions

## D1 — Verification path (Phase 0 gate): on-chain verifier, relayer as fallback
On-chain binding to task and beneficiary **is feasible**: `recipient` and `additionParams` are inside the digest the attestor signs, and `IPrimusZKTLS.verifyAttestation` is a view call the escrow can make. The verifier itself does not enforce replay, expiry or binding, so the escrow does all three. Active path in the UI: **"On-chain verifier"**. A `relayer` mode (backend verifies via SDK and a signer attests to escrow) stays as a configurable fallback, shown explicitly in the Trust Model if enabled. See `docs/primus-notes.md` §2.

## D2 — Chain: Base Sepolia (84532), mock 6-decimal USDC, testnet only.
## D3 — Product name lives in one constant (`PRODUCT_NAME`), set in Phase 1.
## D4 — Phase 0 brand directions are static HTML so they need no install; Phase 1 re-implements the chosen one as tokens in Next.js.

## D5 — Brand directions redone with the `design-studio` skill (user request)
The first Phase 0 directions (docs/brand-directions, now `.design/old-phase0/`) were the generic attractors the skill warns about (dark neon, purple SaaS, card kit) and are superseded. Installed `hosein-ul/design-studio` to `~/.claude/skills/design-studio`; followed gates 1–2: `.design/brief.md`, three directions in `.design/directions/` (board: `index.html`). Hooks not registered (gates followed manually). Blind critic subagent not run. Direction A uses a yellow marker signal (not blue) on purpose: it only ever marks the disclosed claim.

## D6 — Live provider: what is verified and what is not (Phase 4)
Verified against `@primuslabs/zktls-js-sdk@0.3.15` typings (`dist/index.d.ts`, `dist/types.d.ts`): `PrimusZKTLS.init(appId, appSecret?)`, `generateRequestParams(templateId, userAddress, { attConditions, additionParams })`, `sign(string)`, `startAttestation(string): Promise<Attestation>`; the `Attestation` type (upstream spells `reponseResolve`).
- **The SDK is the browser-extension flow.** The attestation is produced in the worker's browser. The server therefore only *signs the request* (`/api/tasks/{id}/proof/prepare`, app secret stays server-side) and later *re-verifies* the returned attestation (`/proof` with `attestation`). A server cannot generate a proof on a worker's behalf.
- **Unverified assumptions (no Primus credentials or template were available here):** (1) the unit of `timestamp` (the typings say `number`; seconds vs ms is not stated). Both the provider and the contract treat values above 1e12 as milliseconds. (2) That for a comparison condition `data` is `{"<metric>":"true"}`; the escrow compares `keccak256(data)` with the value stored at task creation, so a different shape fails closed instead of paying. (3) That our local digest recovery matches Primus' attestor signature for real attestations (it follows the packing in docs/primus-notes.md §2).
- **Attestor trust list** is configured via `PRIMUS_ATTESTORS` for the backend. On-chain, Primus' verifier owns the registry.
- Live end-to-end (extension → attestor → backend → on-chain `settle`) has **not** been run in this repository. Simulation exercises the same six checks with a local test attestor and is labelled as such.
- Contracts: `ProofPayEscrow` calls `IPrimusZKTLS.verifyAttestation` (view, reverts) and enforces binding, replay, window and deadline itself. `SignatureVerifier` is a test/demo re-implementation of Primus' documented checks, not Primus' contract. Foundry tests (30) use real secp256k1 signatures via `vm.sign`.
- API docs are a typed registry (`src/lib/api/docs.ts`) with a test that each endpoint maps to a real route file, instead of generating from route handlers. Cheaper, and it fails loudly on drift.

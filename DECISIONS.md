# Decisions

## D1 — Verification path (Phase 0 gate): on-chain verifier, relayer as fallback
On-chain binding to task and beneficiary **is feasible**: `recipient` and `additionParams` are inside the digest the attestor signs, and `IPrimusZKTLS.verifyAttestation` is a view call the escrow can make. The verifier itself does not enforce replay, expiry or binding, so the escrow does all three. Active path in the UI: **"On-chain verifier"**. A `relayer` mode (backend verifies via SDK and a signer attests to escrow) stays as a configurable fallback, shown explicitly in the Trust Model if enabled. See `docs/primus-notes.md` §2.

## D2 — Chain: Base Sepolia (84532), mock 6-decimal USDC, testnet only.
## D3 — Product name lives in one constant (`PRODUCT_NAME`), set in Phase 1.
## D4 — Phase 0 brand directions are static HTML so they need no install; Phase 1 re-implements the chosen one as tokens in Next.js.

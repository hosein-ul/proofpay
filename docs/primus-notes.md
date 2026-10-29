# Primus research notes (Phase 0)

Researched 2026-10-29 from the official docs and the `primus-labs/zktls-contracts` source. Anything not listed here is **unverified** and must not be assumed.

## 1. Which SDK fits which flow

| SDK | Package | Runs in | Needs | Source |
|---|---|---|---|---|
| Network-Core-SDK | `@primuslabs/network-core-sdk` (Node ≥ 18) | Backend | Funded wallet (ethers) on a supported chain; **no browser extension** | [install](https://docs.primuslabs.xyz/build/for-backend/install), [overview](https://docs.primuslabs.xyz/build/overview) |
| Network-JS-SDK | `@primuslabs/network-js-sdk` (Node ≥ 18) | Browser dApp | End user installs the Primus extension | [install](https://docs.primuslabs.xyz/build/for-dapp/install), [overview](https://docs.primuslabs.xyz/build/overview) |
| Enterprise Core SDK | (see enterprise docs) | Backend | Developer Hub project → `appId` + `appSecret`; `algorithmType` = `proxytls` or `mpctls` | [overview](https://docs.primuslabs.xyz/enterprise/core-sdk/overview) |

Network SDK flow (both variants): `init(provider|wallet, chainId)` → `submitTask(...)` → `attest(...)` → `verifyAndPollTaskResult({ taskId, reportTxHash })`. `withdrawBalance` collects fees. `attest` accepts `attConditions`, `additionParams` (JSON string), `attMode.algorithmType`, `allJsonResponseFlag`.

**Fit for ProofPay:** a server-driven flow (agent/worker proves, backend verifies) fits the **Network-Core-SDK** (no extension). A human-in-browser flow fits the Network-JS-SDK. Live-mode credential/template steps are manual in the Developer Hub (<https://dev.primuslabs.xyz>): create a project (get a paired `appId`/`appSecret`; **the secret is shown once**) and define a template (data-source URL + request). The docs do not describe automating this; document it as manual steps.

Open item: exact Network-Core-SDK parameter names differ slightly between the dApp and backend pages (`requests`/`responseResolves` vs template ID). Verify against the pinned package's `.d.ts` in Phase 4 before writing `PrimusProvider`.

## 2. What the on-chain verifier checks (source-verified)

Source: [`src/IPrimusZKTLS.sol`](https://github.com/primus-labs/zktls-contracts) and `src/PrimusZKTLS.sol`.

`verifyAttestation(Attestation calldata) external view` (returns nothing; reverts on failure):

1. exactly **one** signature, 65 bytes, `v ∈ {27, 28}`;
2. digest = `keccak256(abi.encodePacked(recipient, keccak256(url,header,method,body), keccak256(keyName,parseType,parsePath…), data, attConditions, timestamp, additionParams))`;
3. `ecrecover` on the raw digest (no EIP-191 prefix);
4. recovered address must be in the registered attestor list.

**It does not enforce:** expiry (despite the NatSpec), replay, that `data` matches `attConditions`, or any binding to your application. Those are the integrator's job. No low-s guard.

Attestation fields available on-chain: `recipient`, `request{url,header,method,body}`, `reponseResolve[]{keyName,parseType,parsePath}` (sic), `data` (JSON string), `attConditions` (JSON string), `timestamp` (uint64), `additionParams` (string), `attestors[]`, `signatures[]`.

### Binding to a task and beneficiary
Feasible, because `recipient` and `additionParams` are both inside the signed digest:
- `recipient` ⇒ must equal the task `beneficiary` (checked in escrow).
- `additionParams` ⇒ the caller sets it at `attest` time; ProofPay puts `{"taskId": …, "conditionHash": …}` there and escrow compares `keccak256(bytes(additionParams))` with the expected value.
- `request.url` / `attConditions` hashes ⇒ escrow compares to the hashes committed in `conditionHash` at task creation.
- **Replay:** escrow stores `keccak256(abi.encode(attestation))`-style digest as consumed and rejects reuse; task settles once; `timestamp` window enforced in escrow.

**Caveat:** `additionParams` is set by whoever calls `attest`. That is fine because the escrow also pins `recipient`, URL and condition hashes, so a worker cannot redirect funds, but a worker could also prove with different `additionParams` only if it matches the exact expected string. Verified binding is therefore: *this attestor signed this exact request/response/condition for this recipient and task string.*

## 3. Conditions and hashing

Passed as `attConditions`: nested arrays of `{ field, op, value? }`.
- Comparison ops → boolean: `>`, `<`, `=`, `!=`, `>=`, `<=`.
- Hash ops: `SHA256`, `SHA256_EX` (multiple fields/URLs).
- Default op in the backend SDK: `REVEAL_STRING` (plaintext).
- Example (docs): `[[{ field: "FIELD", op: ">", value: "TARGET" }]]`.
- Verifier sees: boolean per condition (comparison), the hash (SHA256), or plaintext (default). `attConditions` and `data` are **stringified JSON** in the attestation.

Source: <https://docs.primuslabs.xyz/build/op>, [attestation structure](https://docs.primuslabs.xyz/build/misc/attestation-structure).

## 4. Chains and addresses

- Network task contract (Network SDK): Base Sepolia `84532` → `0xC02234058caEaA9416506eABf6Ef3122fCA939E8`; HashKey testnet `133` → `0x6588a24D34C881cF10c8DA77e282f6E1fBc262C7` (mainnets exist; **not used here**). [Attestor node guide](https://docs.primuslabs.xyz/primus-network/attestor-node-guides).
- zkTLS verifier contract (`IPrimusZKTLS` proxy), testnets incl.: Base Sepolia `0xCE7cefB3B5A7eB44B59F60327A53c9Ce53B0afdE`; Sepolia `0x3760aB354507a29a9F5c65A66C74353fd86393FA`. [On-chain interactions](https://docs.primuslabs.xyz/enterprise/onchain-interaction/overview).
- **Re-verify addresses at deploy time.** The docs page lists them without a version.

**Chosen chain:** Base Sepolia (84532).

## 5. TEE
Primus documents TEE-backed attestor nodes (Phala TEE + KMS; signing happens inside the TEE after the zkTLS protocol ran). The docs do not list the trust assumptions or attestor selection. ProofPay copy must say "as documented by Primus" and nothing more. [Attestor security](https://docs.primuslabs.xyz/primus-network/attestor-security).

## Gaps / not verified
- Exact `.d.ts` of both SDKs (check when installing).
- Whether the single-signature check implies a one-attestor attestation for all templates.
- Verifier contract interface beyond the struct above; current Base Sepolia fee/funding requirements for `submitTask`.
- Dev Hub UI steps (docs are high-level only).

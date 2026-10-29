import { encodePacked, keccak256, recoverAddress, getAddress, type Hex } from "viem";
import { privateKeyToAccount, sign, serializeSignature } from "viem/accounts";
import type { Attestation, AttestationRequest, ResponseResolve } from "./types";

/**
 * Digest = the value the attestor signs. It follows the packing used by Primus' `PrimusZKTLS.encodeAttestation`
 * (see docs/primus-notes.md §2): recipient ‖ keccak(request) ‖ keccak(responseResolve) ‖ data ‖ attConditions ‖ timestamp ‖ additionParams.
 * Simulation signs this with a local key, so signature checks are real; only the attestor and the TLS session are simulated.
 */
export function encodeRequest(r: AttestationRequest): Hex {
  return keccak256(encodePacked(["string", "string", "string", "string"], [r.url, r.header, r.method, r.body]));
}
export function encodeResponse(rs: ResponseResolve[]): Hex {
  const types = rs.flatMap(() => ["string", "string", "string"] as const);
  const vals = rs.flatMap((r) => [r.keyName, r.parseType, r.parsePath]);
  return keccak256(encodePacked(types as unknown as ["string"], vals as unknown as [string]));
}

export function attestationDigest(a: Pick<Attestation, "recipient" | "request" | "responseResolve" | "data" | "attConditions" | "timestamp" | "additionParams">): Hex {
  return keccak256(
    encodePacked(
      ["address", "bytes32", "bytes32", "string", "string", "uint64", "string"],
      [
        getAddress(a.recipient),
        encodeRequest(a.request),
        encodeResponse(a.responseResolve),
        a.data,
        a.attConditions,
        BigInt(a.timestamp),
        a.additionParams,
      ],
    ),
  );
}

/** A publicly known test key. It identifies the *simulated* attestor and nothing else. Never used for funds. */
export const SIM_ATTESTOR_KEY: Hex = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d";
export const SIM_ATTESTOR_ADDRESS = privateKeyToAccount(SIM_ATTESTOR_KEY).address;
export const SIM_ATTESTOR_URL = "simulated://proofpay/attestor";

export async function signDigest(digest: Hex, privateKey: Hex = SIM_ATTESTOR_KEY): Promise<Hex> {
  const sig = await sign({ hash: digest, privateKey });
  return serializeSignature({ r: sig.r, s: sig.s, yParity: (sig.yParity ?? (sig.v ? Number(sig.v) - 27 : 0)) }) as Hex;
}

export async function recoverSigner(digest: Hex, signature: Hex): Promise<string | null> {
  try {
    return await recoverAddress({ hash: digest, signature });
  } catch {
    return null;
  }
}

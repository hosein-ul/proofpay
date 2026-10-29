import { privateKeyToAccount, sign, serializeSignature } from "viem/accounts";
import type { Hex } from "viem";

export { attestationDigest, encodeRequest, encodeResponse, recoverSigner } from "./digest";

/** A publicly known test key. It identifies the *simulated* attestor and nothing else. Never used for funds. */
export const SIM_ATTESTOR_KEY: Hex = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d";
export const SIM_ATTESTOR_ADDRESS = privateKeyToAccount(SIM_ATTESTOR_KEY).address;
export const SIM_ATTESTOR_URL = "simulated://proofpay/attestor";

export async function signDigest(digest: Hex, privateKey: Hex = SIM_ATTESTOR_KEY): Promise<Hex> {
  const sig = await sign({ hash: digest, privateKey });
  return serializeSignature({ r: sig.r, s: sig.s, yParity: (sig.yParity ?? (sig.v ? Number(sig.v) - 27 : 0)) }) as Hex;
}


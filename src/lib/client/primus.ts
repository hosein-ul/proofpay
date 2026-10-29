/** Browser side of Live mode. The attestation can only be produced here: the Primus extension runs the TLS session. */
export async function runPrimusAttestation(taskId: string): Promise<Record<string, unknown>> {
  const r = await fetch(`/api/tasks/${taskId}/proof/prepare`, { method: "POST" });
  const prep = await r.json();
  if (!r.ok) throw new Error(prep.error?.message ?? "Couldn’t prepare the attestation request.");

  // Loaded only when a Live proof is started: the SDK pulls in ethers and solana, which Simulation never needs.
  const { PrimusZKTLS } = await import("@primuslabs/zktls-js-sdk");
  const zk = new PrimusZKTLS();
  await zk.init(prep.appId); // appId is public; the secret never leaves the server
  const att = await zk.startAttestation(prep.attRequest);
  if (!zk.verifyAttestation(att)) throw new Error("The Primus SDK could not verify this attestation’s signature.");
  return att as unknown as Record<string, unknown>;
}

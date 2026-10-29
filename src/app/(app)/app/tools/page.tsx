import type { Metadata } from "next";
import { PageHeader } from "@/components/app/page-header";
import { ProofTools } from "@/components/app/proof-tools";
import { SIM_ATTESTOR_ADDRESS } from "@/lib/domain/attestation";
import { getAttestation, latestAttestationForTask, listTasks } from "@/lib/server/repo";

export const metadata: Metadata = { title: "Proof tools" };
export const dynamic = "force-dynamic";

export default async function ToolsPage() {
  // A simulated example in the shape the Primus SDK returns (note `reponseResolve`), so the tool can be tried immediately.
  const settled = (await listTasks({ states: ["settled"], limit: 1 }))[0];
  let sample = "";
  if (settled) {
    const latest = await latestAttestationForTask(settled.id);
    const att = latest ? (await getAttestation(latest.id))?.attestation : null;
    if (att) sample = JSON.stringify({ ...pick(att as unknown as Record<string, unknown>), reponseResolve: att.responseResolve }, null, 2);
  }
  return (
    <>
      <PageHeader title="Proof tools" description="Check an attestation, hash data, and compute the rule hash an escrow pins. Runs in your browser, so nothing you paste leaves it." />
      <ProofTools sample={sample} sampleAttestors={SIM_ATTESTOR_ADDRESS} />
    </>
  );
}

const KEYS = ["recipient", "request", "data", "attConditions", "timestamp", "additionParams", "attestors", "signatures"];
const pick = (o: Record<string, unknown>) => Object.fromEntries(KEYS.map((k) => [k, o[k]]));

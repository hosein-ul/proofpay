import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/app/page-header";
import { ProofInspector } from "@/components/app/proof-inspector";
import { getAttestation } from "@/lib/server/repo";

export const metadata: Metadata = { title: "Proof Inspector" };
export const dynamic = "force-dynamic";

export default async function ProofPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ just?: string }> }) {
  const [{ id }, { just }] = await Promise.all([params, searchParams]);
  const a = await getAttestation(id);
  if (!a) notFound();
  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: "Proofs", href: "/app/proofs" }, { label: id }]}
        title="Proof Inspector"
        description="Three views of one proof: what the source saw, what the attestor signed, and what the verifier learns. Then the six checks."
      />
      <ProofInspector att={a.attestation} ok={a.ok} verification={a.verification} task={a.task} worker={a.worker} just={just === "1"} />
    </>
  );
}

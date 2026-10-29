import type { Metadata } from "next";
import Link from "next/link";
import { Card, PageHero, Section } from "@/components/site/prose";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Product", description: "Tasks, proofs and a ledger that reconciles." };

export default function Product() {
  return (
    <>
      <PageHero eyebrow="Product" title="Escrow that checks its own conditions" lead="Four surfaces, one source of truth: tasks, proofs, a ledger and an API." />
      <Section>
        <div className="grid gap-4 md:grid-cols-2">
          <Card title="Task builder">Choose a worker, a source and a rule. See the sentence the escrow will enforce before you fund it.</Card>
          <Card title="Proof inspector">See what the source returned, what the attestor signed, and what the verifier learned, side by side. Six checks, each named.</Card>
          <Card title="Ledger">Every lock, release and refund as a double entry, with a running balance and a reconciliation check. Export CSV or print.</Card>
          <Card title="API and webhooks">Create, fund and prove over HTTP. Idempotency keys on every write. Events for each state change.</Card>
        </div>
        <div className="mt-8 flex gap-3"><Button variant="primary" asChild><Link href="/app">Open the demo</Link></Button><Button variant="secondary" asChild><Link href="/developers">Developer docs</Link></Button></div>
      </Section>
    </>
  );
}

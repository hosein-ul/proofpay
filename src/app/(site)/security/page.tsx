import type { Metadata } from "next";
import { TrustModel } from "@/components/app/trust-model";
import { Card, PageHero, Section } from "@/components/site/prose";
import { SECURITY_CONTACT } from "@/lib/config";

export const metadata: Metadata = { title: "Security and Trust Model", description: "What a proof establishes, what it does not, and how the beta is limited." };

export default function Security() {
  return (
    <>
      <PageHero eyebrow="Security" title="What we claim, and what we don’t" lead="This is a testnet beta. The contracts were reviewed internally, not independently audited, and hold mock tokens only. Here is the model in plain terms." />
      <Section title="Trust Model"><TrustModel /></Section>
      <Section title="Controls in the escrow" tone="sunk">
        <div className="grid gap-4 md:grid-cols-3">
          <Card title="Binding">Each proof names the worker’s address as recipient and carries the task id and rule hash. A proof for another task or person fails.</Card>
          <Card title="Replay and expiry">A proof digest is consumed once. Proofs outside the task’s time window are rejected.</Card>
          <Card title="Refunds">After the deadline the payer can refund in one step. Funds are never stuck behind an approval.</Card>
        </div>
      </Section>
      <Section title="Known limits">
        <ul className="grid max-w-[70ch] gap-2 text-[15px] text-text-2 [&_li]:ml-5 [&_li]:list-disc">
          <li>Reviewed internally (Slither plus manual review, findings fixed), but not independently audited. Do not use them with real funds. <a className="underline" href="https://github.com/hosein-ul/proofpay/blob/main/SECURITY.md">Read the review</a>.</li>
          <li>Simulation uses a public local test key as its attestor. It demonstrates the checks, not Primus’ network.</li>
          <li>The data source is trusted for its own numbers. A wrong dashboard produces a valid proof of a wrong number.</li>
          <li>Disputes are resolved by a named arbiter, which is a trust assumption.</li>
        </ul>
        <p className="mt-6 text-[14px] text-text-2">Report a vulnerability: <a className="underline" href={`mailto:${SECURITY_CONTACT}`}>{SECURITY_CONTACT}</a> <span className="text-text-3">(placeholder address, replace before launch)</span>.</p>
      </Section>
    </>
  );
}

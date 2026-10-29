import type { Metadata } from "next";
import { PageHero, Section } from "@/components/site/prose";

export const metadata: Metadata = { title: "Changelog" };
const LOG = [
  ["Testnet beta 0.1", "Task builder, proof inspector with six named checks, ledger with reconciliation, workers, HTTP API with idempotency keys, Simulation mode with real signature verification."],
];

export default function Changelog() {
  return (
    <>
      <PageHero eyebrow="Changelog" title="What changed" />
      <Section><ul className="grid max-w-[720px] gap-4">{LOG.map(([t, b]) => <li key={t} className="rounded-panel bg-raised p-5 shadow-rest"><h2 className="text-[16px] font-semibold">{t}</h2><p className="mt-1 text-[14.5px] text-text-2">{b}</p></li>)}</ul></Section>
    </>
  );
}

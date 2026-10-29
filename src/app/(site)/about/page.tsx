import type { Metadata } from "next";
import { PageHero, Prose } from "@/components/site/prose";
import { PRIMUS_DOCS } from "@/lib/config";

export const metadata: Metadata = { title: "About" };

export default function About() {
  return (
    <>
      <PageHero eyebrow="About" title="Small, careful, early" />
      <Prose>
        <p>This is an early testnet project exploring one idea: a payment should be able to wait for a fact, and release itself when the fact is proven.</p>
        <p>It uses <a href={PRIMUS_DOCS}>Primus zkTLS</a> for attestations. It is independent software, not affiliated with or endorsed by Primus.</p>
        <h2>What it is not</h2>
        <p>It is not a bank, a regulated service or a custodian. It holds mock tokens on a test network. The contracts have not been audited.</p>
      </Prose>
    </>
  );
}

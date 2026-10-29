import type { Metadata } from "next";
import { Mark, Logo } from "@/components/brand/mark";
import { PageHero, Section } from "@/components/site/prose";

export const metadata: Metadata = { title: "Brand assets" };

export default function Brand() {
  return (
    <>
      <PageHero eyebrow="Brand" title="The mark" lead="Three plates and a beam: a proof descending through the checks. The name is a working title." />
      <Section>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid place-items-center gap-4 rounded-stage bg-raised p-12 shadow-raised"><Mark size={96} title="ProofPay mark" /><Logo size={32} /></div>
          <div className="grid place-items-center rounded-stage bg-[#0B1424] p-12" data-theme="dark"><Logo size={32} /></div>
        </div>
        <p className="mt-6 max-w-[60ch] text-[14px] text-text-2">Do not use the Primus name or logo to imply partnership. Attribution is plain text: “Proofs by Primus zkTLS”.</p>
      </Section>
    </>
  );
}

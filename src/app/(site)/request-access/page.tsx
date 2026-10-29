import type { Metadata } from "next";
import { AccessForm } from "@/components/site/access-form";
import { PageHero } from "@/components/site/prose";

export const metadata: Metadata = { title: "Request early access" };

export default function RequestAccess() {
  return (
    <>
      <PageHero eyebrow="Early access" title="Tell us what you’d pay for with proof" lead="The beta is testnet only. We are looking for a few teams with a concrete payment that a number on a page could decide." />
      <div className="mx-auto max-w-[620px] px-5 py-12"><AccessForm /></div>
    </>
  );
}

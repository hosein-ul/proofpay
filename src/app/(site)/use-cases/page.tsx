import type { Metadata } from "next";
import Link from "next/link";
import { PageHero, Section } from "@/components/site/prose";
import { USE_CASES } from "@/lib/use-cases";

export const metadata: Metadata = { title: "Use cases" };

export default function UseCases() {
  return (
    <>
      <PageHero eyebrow="Use cases" title="Where paying on proof fits" lead="Anywhere a number on a trusted page can decide a payment." />
      <Section>
        <ul className="grid gap-4 md:grid-cols-3">
          {USE_CASES.map((u) => (
            <li key={u.slug}><Link href={`/use-cases/${u.slug}`} className="grid h-full gap-2 rounded-stage bg-raised p-6 shadow-raised transition-shadow hover:shadow-[0_0_0_1px_var(--line-strong)]">
              <h2 className="text-[18px] font-semibold tracking-[-0.02em]">{u.title}</h2>
              <p className="text-[14.5px] text-text-2">{u.lead}</p>
              <p className="mono mt-2 text-[12.5px] text-text-3">{u.rule}</p>
            </Link></li>
          ))}
        </ul>
      </Section>
    </>
  );
}

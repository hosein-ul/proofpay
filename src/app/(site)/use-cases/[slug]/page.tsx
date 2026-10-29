import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PageHero, Section } from "@/components/site/prose";
import { Button } from "@/components/ui/button";
import { SimTag } from "@/components/ui/chips";
import { USE_CASES } from "@/lib/use-cases";

export function generateStaticParams() { return USE_CASES.map((u) => ({ slug: u.slug })); }
export async function generateMetadata({ params }: PageProps<"/use-cases/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const u = USE_CASES.find((x) => x.slug === slug);
  return { title: u?.title ?? "Use case", description: u?.lead };
}

export default async function UseCase({ params }: PageProps<"/use-cases/[slug]">) {
  const { slug } = await params;
  const u = USE_CASES.find((x) => x.slug === slug);
  if (!u) notFound();
  return (
    <>
      <PageHero eyebrow="Use case" title={u.title} lead={u.lead} />
      <Section>
        <div className="grid gap-8 md:grid-cols-[1.2fr_1fr]">
          <ol className="grid gap-3">{u.steps.map((s, i) => <li key={s} className="flex gap-3 rounded-panel bg-raised p-4 shadow-rest"><span className="num grid size-6 shrink-0 place-items-center rounded-full bg-light text-[12px] font-semibold text-on-light">{i + 1}</span><span className="text-[15px]">{s}</span></li>)}</ol>
          <aside className="grid content-start gap-3 rounded-stage bg-raised p-6 shadow-raised">
            <div className="flex items-center justify-between"><p className="text-[13px] font-medium text-text-3">Example rule</p><SimTag label="Example" /></div>
            <p className="mono text-[14px]">{u.rule}</p>
            <p className="text-[13.5px] text-text-2">Source: {u.source}</p>
            <p className="num text-[24px] font-semibold">{u.amount}</p>
            <p className="border-t border-line pt-3 text-[13px] text-text-2"><strong className="text-text">Limit.</strong> {u.caveat}</p>
          </aside>
        </div>
        <div className="mt-8 flex gap-3"><Button variant="primary" asChild><Link href="/app/tasks/new">Try it in the demo</Link></Button><Button variant="secondary" asChild><Link href="/use-cases">All use cases</Link></Button></div>
      </Section>
    </>
  );
}

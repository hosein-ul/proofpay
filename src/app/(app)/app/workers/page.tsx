import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Chip, SimTag } from "@/components/ui/chips";
import { Hash } from "@/components/ui/copy";
import { Identicon } from "@/components/ui/identicon";
import { formatUsdc } from "@/lib/format";
import { workerStats } from "@/lib/server/repo";

export const metadata: Metadata = { title: "Workers" };
export const dynamic = "force-dynamic";

const dur = (ms: number) => (!ms ? "—" : ms < 3_600_000 ? `${Math.round(ms / 60_000)} min` : ms < 86_400_000 ? `${(ms / 3_600_000).toFixed(1)} h` : `${(ms / 86_400_000).toFixed(1)} d`);

export default async function WorkersPage() {
  const stats = await workerStats();
  return (
    <>
      <PageHeader title="Workers" description="Agents and contractors you pay. A worker’s address is bound into every proof, so only they can be paid." actions={<Button variant="primary" asChild><Link href="/app/tasks/new">New task</Link></Button>} />
      <div className="mb-3 flex items-center gap-2"><SimTag label="Demo data" /><span className="text-[12.5px] text-text-3">Track records come from verified proofs only.</span></div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {stats.map((s) => (
          <article key={s.worker.id} className="grid gap-4 rounded-stage bg-raised p-5 shadow-raised">
            <header className="flex items-start gap-3">
              <Identicon name={s.worker.name} hue={s.worker.hue} size={40} />
              <div className="grid min-w-0 flex-1 gap-0.5">
                <h2 className="flex items-center gap-2 text-[15.5px] font-semibold">{s.worker.name}<Chip tone="mute">{s.worker.kind}</Chip></h2>
                <p className="text-[13px] text-text-2">{s.worker.bio}</p>
              </div>
            </header>
            <dl className="grid grid-cols-3 gap-3 border-t border-line pt-3 text-[12.5px]">
              <div><dt className="text-text-3">Verified</dt><dd className="num mt-0.5 text-[16px] font-semibold">{s.proofs ? `${s.successRate.toFixed(0)}%` : "—"}</dd></div>
              <div><dt className="text-text-3">Median settle</dt><dd className="num mt-0.5 text-[16px] font-semibold">{dur(s.medianMs)}</dd></div>
              <div><dt className="text-text-3">Earned</dt><dd className="num mt-0.5 text-[16px] font-semibold">{formatUsdc(s.earned)}</dd></div>
            </dl>
            <footer className="flex items-center justify-between gap-2 text-[12.5px] text-text-3">
              <Hash value={s.worker.address} />
              <Link href={`/app/tasks?worker=${s.worker.id}`} className="shrink-0 text-text-2 hover:underline">{s.tasks} tasks{s.active ? ` · ${s.active} open` : ""}</Link>
            </footer>
          </article>
        ))}
      </div>
    </>
  );
}

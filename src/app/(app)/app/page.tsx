import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import { Onboarding } from "@/components/app/onboarding";
import { LiveFeed, VolumePanel } from "@/components/app/overview-live";
import { PageHeader, Panel } from "@/components/app/page-header";
import { AmountCell, Deadline, WorkerCell } from "@/components/app/task-bits";
import { Button } from "@/components/ui/button";
import { Kpi } from "@/components/ui/data";
import { StatusChip, Chip } from "@/components/ui/chips";
import { EmptyState } from "@/components/ui/feedback";
import { duration, formatCompact, splitAmount } from "@/lib/format";
import { attentionQueue, getMode, getOverview, listEvents, listTasks, listWorkers } from "@/lib/server/repo";
import { conditionText } from "@/lib/domain/condition";

export const metadata: Metadata = { title: "Overview" };
export const dynamic = "force-dynamic";

const REASON = { disputed: ["Disputed", "bad"], proof_failed: ["Proof failed", "bad"], expiring: ["Expiring", "warn"], expired: ["Expired", "warn"] } as const;

export default async function OverviewPage() {
  const [o, att, tasks, events, workers, mode] = await Promise.all([getOverview(30), attentionQueue(), listTasks({ limit: 8 }), listEvents(9, { significant: true }), listWorkers(), getMode()]);
  const wmap = new Map(workers.map((w) => [w.id, w]));
  const esc = splitAmount(o.escrowBalance);
  const set = splitAmount(o.settled30d);
  const pct = (n: number) => `${n >= 0 ? "+" : "−"}${Math.abs(n).toFixed(1)}%`;
  const spark = (k: keyof typeof o.sparks) => o.sparks[k].map((v) => v);
  return (
    <>
      <PageHeader
        title="Overview"
        description="Escrow, settlements and proofs across your workspace. All figures are demo data in Simulation."
        actions={
          <>
            <Button variant="secondary" asChild>
              <Link href="/app/ledger">Open ledger</Link>
            </Button>
            <Button variant="primary" asChild>
              <Link href="/app/tasks/new">
                <Plus className="size-4" /> New task
              </Link>
            </Button>
          </>
        }
      />
      <Onboarding />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <div className="col-span-2 lg:col-span-1">
          <Kpi label="Escrow balance" delta={o.deltas.escrow} deltaLabel={`${o.deltas.escrow >= 0 ? "+" : "−"}${formatCompact(Math.abs(o.deltas.escrow) / 1e6)}`} spark={spark("escrow")} hint="USDC currently held across funded tasks">
            {esc.whole}
            <span className="text-text-3">{esc.dec}</span> <span className="text-[12px] font-medium text-text-3">USDC</span>
          </Kpi>
        </div>
        <Kpi label="Funds settled · 30d" delta={o.deltas.settled} deltaLabel={pct(o.deltas.settled)} spark={spark("settled")}>
          {set.whole}
          <span className="text-text-3">{set.dec}</span> <span className="text-[12px] font-medium text-text-3">USDC</span>
        </Kpi>
        <Kpi label="Open tasks" delta={o.deltas.open} deltaLabel={`${o.deltas.open >= 0 ? "+" : "−"}${Math.abs(o.deltas.open)}`} spark={spark("open")} tone="info">
          {o.openTasks}
        </Kpi>
        <Kpi label="Proof success rate" delta={o.deltas.success} deltaLabel={`${o.deltas.success >= 0 ? "+" : "−"}${Math.abs(o.deltas.success).toFixed(1)} pts`} spark={spark("success")} tone="ok">
          {o.proofSuccessRate.toFixed(1)}
          <span className="text-text-3">%</span>
        </Kpi>
        <Kpi label="Median time to settle" delta={o.deltas.settle} deltaLabel={`${o.deltas.settle >= 0 ? "+" : "−"}${Math.abs(Math.round(o.deltas.settle))} min`} good="down" spark={spark("settle")}>
          {duration(o.medianSettleMs)}
        </Kpi>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-12">
        <Panel flush className="lg:col-span-8">
          <VolumePanel initial={o} />
        </Panel>
        <Panel title="Needs attention" description={att.length ? `${att.length} tasks` : undefined} className="lg:col-span-4" flush bodyClass="px-2 pb-2">
          {att.length === 0 ? (
            <EmptyState title="Nothing needs you" body="Proofs are flowing and no task is close to its deadline." className="py-8" />
          ) : (
            <ul className="grid grid-cols-[minmax(0,1fr)]">
              {att.map((a) => {
                const [label, tone] = REASON[a.reason];
                const w = wmap.get(a.task.workerId);
                return (
                  <li key={a.task.id}>
                    <Link href={`/app/tasks/${a.task.id}`} className="group flex items-start gap-3 rounded-control px-2.5 py-2.5 hover:bg-lift">
                      <Chip tone={tone} className="mt-0.5 shrink-0">{label}</Chip>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13.5px] font-medium group-hover:text-light-text">{a.task.title}</span>
                        <span className="block truncate text-[12px] text-text-3">
                          <span className="num">{splitAmount(a.task.amount).whole}{splitAmount(a.task.amount).dec}</span> · {w?.name} · {a.detail}
                        </span>
                      </span>
                      <ArrowRight className="mt-1 size-3.5 text-text-3 opacity-0 transition-opacity group-hover:opacity-100" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-12">
        <Panel title="Recent tasks" description="Latest activity first" className="lg:col-span-7" flush actions={<Link href="/app/tasks" className="text-[12.5px] font-medium text-light-text hover:underline">View all →</Link>}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-[13.5px]">
              <thead>
                <tr className="text-left text-[12px] text-text-3">
                  <th className="px-4 pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium">Task</th>
                  <th className="pb-2 font-medium">Worker</th>
                  <th className="pb-2 text-right font-medium">Amount</th>
                  <th className="px-4 pb-2 text-right font-medium">Deadline</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((t) => (
                  <tr key={t.id} className="group border-t border-line transition-colors hover:bg-lift">
                    <td className="h-[var(--row-h)] px-4"><StatusChip state={t.state} /></td>
                    <td className="max-w-[240px]">
                      <Link href={`/app/tasks/${t.id}`} className="block truncate font-medium hover:text-light-text">{t.title}</Link>
                      <span className="block truncate text-[12px] text-text-3">{conditionText(t.condition)}</span>
                    </td>
                    <td><WorkerCell worker={wmap.get(t.workerId)!} compact /></td>
                    <td className="text-right"><AmountCell micro={t.amount} unit={null} /></td>
                    <td className="px-4 text-right"><Deadline iso={t.deadline} state={t.state} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
        <Panel flush className="lg:col-span-5">
          <LiveFeed initial={events} canDemo={mode === "simulation"} />
        </Panel>
      </div>
    </>
  );
}

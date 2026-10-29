import { ArrowRight, Plus, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { PlateStack } from "@/components/brand/plate-stack";
import { Identicon } from "@/components/ui/identicon";
import type { Task, TaskState, Worker } from "@/lib/domain/types";
import { splitAmount } from "@/lib/format";
import { cn } from "@/lib/utils";

/** The top band. Always a deep navy surface, in both themes, so the one amber beam has something to cut through. */
export function DashboardHero({ workspace, escrow, open, success, attention, simulation }: { workspace: string; escrow: number; open: number; success: number; attention: number; simulation: boolean }) {
  const e = splitAmount(escrow);
  return (
    <section className="pp-rise-in relative isolate overflow-hidden rounded-stage bg-[#0a1530] text-[#eef2fa] shadow-raised" style={{ ["--d" as string]: 0 }}>
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(60%_90%_at_88%_10%,rgba(255,200,100,.22),transparent_60%),radial-gradient(50%_70%_at_0%_100%,rgba(70,110,255,.22),transparent_60%)]" />
      <div aria-hidden className="dots absolute inset-0 -z-10 opacity-30 [mask-image:linear-gradient(90deg,transparent,#000_70%)]" />
      <div className="grid items-center gap-6 p-6 sm:p-8 md:grid-cols-[1fr_auto]">
        <div className="grid gap-5">
          <div className="flex flex-wrap items-center gap-2 text-[12.5px] text-[#b4c0d8]">
            <span className="font-medium text-[#eef2fa]">{workspace}</span>
            <span aria-hidden>·</span>
            <span className="inline-flex items-center gap-1"><ShieldCheck className="size-3.5" /> {simulation ? "Simulation, no real funds" : "Live on Base Sepolia"}</span>
          </div>
          <div>
            <p className="text-[13px] font-medium text-[#b4c0d8]">Held in escrow right now</p>
            <p className="num mt-1 text-[clamp(38px,6vw,60px)] leading-none font-semibold tracking-[-0.04em] [font-variation-settings:'wdth'_112]">
              {e.whole}
              <span className="text-[#8497bd]">{e.dec}</span>
              <span className="ml-2 text-[18px] font-medium text-[#8497bd]">USDC</span>
            </p>
          </div>
          <dl className="flex flex-wrap gap-x-8 gap-y-3 text-[13px]">
            <HeroStat k="Open tasks" v={String(open)} />
            <HeroStat k="Proof success" v={`${success.toFixed(0)}%`} />
            <HeroStat k="Needs you" v={String(attention)} accent={attention > 0} />
          </dl>
          <div className="flex flex-wrap gap-2.5">
            <Link href="/app/tasks/new" className="inline-flex h-10 items-center gap-2 rounded-control bg-[linear-gradient(180deg,#fff8e6,#ffe3a6)] px-4 text-[14px] font-semibold text-[#1b1405] shadow-[0_10px_26px_-10px_rgba(255,205,110,.6)] transition-transform hover:-translate-y-0.5">
              <Plus className="size-4" /> New task
            </Link>
            <Link href="/app/ledger" className="inline-flex h-10 items-center gap-2 rounded-control bg-white/10 px-4 text-[14px] font-medium text-[#eef2fa] shadow-[0_0_0_1px_rgba(255,255,255,.14)_inset] transition-colors hover:bg-white/15">
              Open ledger <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
        <div className="relative hidden md:block">
          <PlateStack count={5} lit={4} size={230} />
          <span aria-hidden className="pp-beam-sweep absolute left-1/2 top-2 h-8 w-px bg-[#ffe3a6]" />
        </div>
      </div>
    </section>
  );
}

function HeroStat({ k, v, accent }: { k: string; v: string; accent?: boolean }) {
  return (
    <div>
      <dt className="text-[#8497bd]">{k}</dt>
      <dd className={cn("num mt-0.5 text-[20px] font-semibold", accent && "text-[#ffe3a6]")}>{v}</dd>
    </div>
  );
}

const GROUPS: { label: string; states: TaskState[]; bar: string; dot: string }[] = [
  { label: "Draft", states: ["draft"], bar: "bg-[var(--line-strong)]", dot: "bg-[var(--line-strong)]" },
  { label: "In escrow", states: ["funded", "awaiting_proof"], bar: "bg-info", dot: "bg-info" },
  { label: "Proving", states: ["proving", "verified"], bar: "bg-light", dot: "bg-light" },
  { label: "Settled", states: ["settled", "resolved"], bar: "bg-ok", dot: "bg-ok" },
  { label: "Needs attention", states: ["expired", "disputed"], bar: "bg-bad", dot: "bg-bad" },
  { label: "Refunded", states: ["refunded"], bar: "bg-text-3", dot: "bg-text-3" },
];

/** Where every task is right now: one proportional bar, then each stage with its count and the USDC sitting in it. */
export function Pipeline({ tasks }: { tasks: Task[] }) {
  const total = tasks.length || 1;
  const rows = GROUPS.map((g) => {
    const mine = tasks.filter((t) => g.states.includes(t.state));
    return { ...g, n: mine.length, sum: mine.reduce((x, t) => x + t.amount, 0) };
  }).filter((g) => g.n > 0);
  const maxSum = Math.max(1, ...rows.map((r) => r.sum));
  return (
    <div className="grid gap-5 p-4">
      <div className="flex h-3.5 w-full gap-0.5 overflow-hidden rounded-full" role="img" aria-label={`Task pipeline: ${rows.map((r) => `${r.n} ${r.label}`).join(", ")}`}>
        {rows.map((r) => <span key={r.label} className={cn("h-full first:rounded-l-full last:rounded-r-full", r.bar)} style={{ width: `${(r.n / total) * 100}%` }} />)}
      </div>
      <ul className="grid gap-3.5">
        {rows.map((r) => {
          const a = splitAmount(r.sum);
          return (
            <li key={r.label} className="grid gap-1.5">
              <div className="flex items-center gap-2.5 text-[13.5px]">
                <span className={cn("size-2.5 rounded-full", r.dot)} aria-hidden />
                <span className="font-medium">{r.label}</span>
                <span className="num rounded-full bg-sunk px-2 text-[12px] text-text-2">{r.n}</span>
                <span className="num ml-auto font-semibold">{a.whole}<span className="text-text-3">{a.dec}</span> <span className="text-[11.5px] font-medium text-text-3">USDC</span></span>
              </div>
              <span className="h-1.5 overflow-hidden rounded-full bg-sunk"><span className={cn("block h-full rounded-full", r.bar)} style={{ width: `${(r.sum / maxSum) * 100}%` }} /></span>
            </li>
          );
        })}
      </ul>
      <p className="text-[12px] text-text-3">Settled includes resolved disputes. {tasks.length} tasks in total.</p>
    </div>
  );
}

export function TopWorkers({ rows }: { rows: { worker: Worker; earned: number; proofs: number; successRate: number }[] }) {
  const top = [...rows].sort((a, b) => b.earned - a.earned).slice(0, 5);
  const max = Math.max(1, ...top.map((r) => r.earned));
  return (
    <ul className="grid gap-3 p-4">
      {top.map((r) => {
        const a = splitAmount(r.earned);
        return (
          <li key={r.worker.id}>
            <Link href="/app/workers" className="group grid gap-1.5">
              <span className="flex items-center gap-2.5 text-[13.5px]">
                <Identicon name={r.worker.name} hue={r.worker.hue} size={24} />
                <span className="font-medium group-hover:text-light-text">{r.worker.name}</span>
                <span className="num ml-auto font-semibold">{a.whole}<span className="text-text-3">{a.dec}</span></span>
              </span>
              <span className="h-1.5 overflow-hidden rounded-full bg-sunk">
                <span className="block h-full rounded-full bg-[linear-gradient(90deg,var(--light),var(--light-hi))]" style={{ width: `${(r.earned / max) * 100}%` }} />
              </span>
              <span className="text-[12px] text-text-3">{r.proofs ? `${r.proofs} proofs · ${r.successRate.toFixed(0)}% verified` : "No proofs yet"}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

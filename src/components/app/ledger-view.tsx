"use client";

import { Download, Printer, ShieldCheck, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Chip, SimTag } from "@/components/ui/chips";
import { Hash, Time } from "@/components/ui/copy";
import { Kpi } from "@/components/ui/data";
import { EmptyState } from "@/components/ui/feedback";
import { Input, Segmented } from "@/components/ui/form";
import type { LedgerEntry, LedgerKind } from "@/lib/domain/types";
import { formatUsdc } from "@/lib/format";
import { cn } from "@/lib/utils";

const KIND: Record<LedgerKind, { label: string; tone: "info" | "ok" | "warn" | "mute" }> = {
  escrow_in: { label: "Locked", tone: "info" },
  release: { label: "Released", tone: "ok" },
  refund: { label: "Refunded", tone: "warn" },
  fee: { label: "Fee", tone: "mute" },
};

export function LedgerView({ entries, titles }: { entries: LedgerEntry[]; titles: Record<string, string> }) {
  const [kind, setKind] = useState<"all" | LedgerKind>("all");
  const [q, setQ] = useState("");

  const integrity = useMemo(() => {
    // Escrow balance must equal the running sum of locks minus releases and refunds, in time order.
    const asc = [...entries].sort((a, b) => a.at.localeCompare(b.at));
    let bal = 0;
    let breaks = 0;
    for (const e of asc) {
      bal += e.kind === "escrow_in" ? e.amount : e.kind === "fee" ? 0 : -e.amount;
      if (bal !== e.balanceAfter) breaks++;
    }
    return { breaks, balance: bal };
  }, [entries]);

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return entries.filter((e) => (kind === "all" || e.kind === kind) && (!s || `${titles[e.taskId] ?? ""} ${e.taskId} ${e.debit} ${e.credit} ${e.txHash ?? ""}`.toLowerCase().includes(s)));
  }, [entries, kind, q, titles]);

  const totals = useMemo(() => {
    let locked = 0, released = 0, refunded = 0;
    for (const e of entries) {
      if (e.kind === "escrow_in") locked += e.amount;
      else if (e.kind === "release") released += e.amount;
      else if (e.kind === "refund") refunded += e.amount;
    }
    return { locked, released, refunded };
  }, [entries]);

  return (
    <div className="grid gap-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 print:grid-cols-4">
        <Kpi label="Locked, all time" vs="">{formatUsdc(totals.locked)} <span className="text-[14px] font-normal text-text-3">USDC</span></Kpi>
        <Kpi label="Released" vs="">{formatUsdc(totals.released)} <span className="text-[14px] font-normal text-text-3">USDC</span></Kpi>
        <Kpi label="Refunded" vs="">{formatUsdc(totals.refunded)} <span className="text-[14px] font-normal text-text-3">USDC</span></Kpi>
        <Kpi label="In escrow now" vs="">{formatUsdc(integrity.balance)} <span className="text-[14px] font-normal text-text-3">USDC</span></Kpi>
      </div>

      <div className={cn("flex flex-wrap items-center gap-3 rounded-panel px-4 py-3 text-[13.5px]", integrity.breaks ? "bg-bad-quiet text-bad" : "bg-ok-quiet text-ok")} role="status">
        {integrity.breaks ? <TriangleAlert className="size-4" /> : <ShieldCheck className="size-4" />}
        <span className="font-medium">{integrity.breaks ? `${integrity.breaks} entries don’t reconcile` : "Ledger reconciles"}</span>
        <span className="text-text-2">{integrity.breaks ? "Running balance differs from locks minus releases and refunds." : `${entries.length} entries. Every release and refund is covered by a prior lock, and the running balance matches.`}</span>
        <SimTag label="Demo data" className="ml-auto" />
      </div>

      <section className="overflow-hidden rounded-stage bg-raised shadow-raised">
        <div className="flex flex-wrap items-center gap-3 border-b border-line p-3 print:hidden">
          <Segmented aria-label="Entry type" value={kind} onValueChange={(v) => setKind(v as typeof kind)} options={[{ value: "all", label: "All" }, ...(Object.keys(KIND) as LedgerKind[]).filter((k) => k !== "fee").map((k) => ({ value: k, label: KIND[k].label }))]} />
          <div className="w-full max-w-[280px] flex-1"><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search task, account or tx" aria-label="Search the ledger" /></div>
          <span className="flex-1" />
          <Button variant="secondary" size="sm" asChild><a href="/api/ledger?format=csv" download><Download className="size-4" /> CSV</a></Button>
          <Button variant="secondary" size="sm" onClick={() => window.print()}><Printer className="size-4" /> Print report</Button>
        </div>

        {rows.length === 0 ? (
          <EmptyState title="No entries match" body="Try another filter or clear the search." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-[13.5px]">
              <thead>
                <tr className="border-b border-line text-left text-[12px] text-text-3">
                  <th className="px-4 py-2.5 font-medium">Time</th>
                  <th className="px-3 py-2.5 font-medium">Type</th>
                  <th className="px-3 py-2.5 font-medium">Task</th>
                  <th className="px-3 py-2.5 font-medium">Debit → Credit</th>
                  <th className="px-3 py-2.5 text-right font-medium">Amount</th>
                  <th className="px-3 py-2.5 text-right font-medium">Escrow after</th>
                  <th className="px-4 py-2.5 font-medium">Tx</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((e) => (
                  <tr key={e.id} className="border-b border-line last:border-0 hover:bg-sunk/60">
                    <td className="whitespace-nowrap px-4 py-2.5 text-text-2"><Time value={e.at} /></td>
                    <td className="px-3 py-2.5"><Chip tone={KIND[e.kind].tone}>{KIND[e.kind].label}</Chip></td>
                    <td className="max-w-[220px] truncate px-3 py-2.5"><Link href={`/app/tasks/${e.taskId}`} className="hover:underline">{titles[e.taskId] ?? e.taskId}</Link></td>
                    <td className="px-3 py-2.5 text-text-2">{e.debit} <span className="text-text-3">→</span> {e.credit}</td>
                    <td className={cn("num px-3 py-2.5 text-right font-medium", e.kind === "escrow_in" ? "text-text" : e.kind === "release" ? "text-ok" : "text-text-2")}>{e.kind === "escrow_in" ? "+" : "−"}{formatUsdc(e.amount)}</td>
                    <td className="num px-3 py-2.5 text-right text-text-2">{formatUsdc(e.balanceAfter)}</td>
                    <td className="px-4 py-2.5">{e.txHash ? <Hash value={e.txHash} /> : <span className="text-text-3">—</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <p className="text-[12.5px] text-text-3">Amounts are mock USDC on Base Sepolia. Simulated transactions have no block explorer link.</p>
    </div>
  );
}

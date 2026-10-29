"use client";

import { ArrowDownRight, ArrowUpRight, ChevronLeft, ChevronRight, Minus } from "lucide-react";
import Link from "next/link";
import { Accordion as RAccordion, Tabs as RTabs } from "radix-ui";
import { cn } from "@/lib/utils";
import { Hash } from "./copy";

/* ── sparkline ── */
export function Sparkline({ values, className, tone = "light", height = 28 }: { values: number[]; className?: string; tone?: "light" | "ok" | "info"; height?: number }) {
  if (values.length < 2) return <div style={{ height }} className={className} />;
  const w = 100;
  const mn = Math.min(...values);
  const mx = Math.max(...values);
  const pts = values.map((v, i) => [(i / (values.length - 1)) * w, height - 3 - ((v - mn) / (mx - mn || 1)) * (height - 6)] as const);
  const d = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join("");
  const color = tone === "ok" ? "var(--ok)" : tone === "info" ? "var(--info)" : "var(--light)";
  const last = pts.at(-1)!;
  return (
    <svg viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none" className={cn("block w-full overflow-visible", className)} style={{ height }} aria-hidden>
      <path d={`${d}L${w} ${height}L0 ${height}Z`} fill={color} opacity="0.1" />
      <path d={d} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      <circle cx={last[0]} cy={last[1]} r="2.2" fill={color} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/* ── KPI ── */
export function Kpi({ label, children, delta, deltaLabel, good = "up", spark, tone, hint, vs = "vs 7d ago" }: { vs?: string; label: string; children: React.ReactNode; delta?: number; deltaLabel?: string; good?: "up" | "down"; spark?: number[]; tone?: "light" | "ok" | "info"; hint?: string }) {
  const Icon = delta === undefined || Math.abs(delta) < 0.05 ? Minus : delta > 0 ? ArrowUpRight : ArrowDownRight;
  const positive = delta === undefined ? null : good === "up" ? delta >= 0 : delta <= 0;
  return (
    <div className="group relative overflow-hidden rounded-panel bg-raised p-4 shadow-raised">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,var(--light),transparent)] opacity-0 transition-opacity duration-300 group-hover:opacity-70" />
      <p className="text-[12px] font-medium text-text-3" title={hint}>
        {label}
      </p>
      <p className="num mt-2 text-[26px] leading-none font-semibold tracking-[-0.03em] [font-variation-settings:'wdth'_108]">{children}</p>
      <div className="mt-2 flex items-center gap-1.5 text-[12px]">
        {delta !== undefined && (
          <span className={cn("inline-flex items-center gap-0.5 font-medium", positive ? "text-ok" : "text-bad")}>
            <Icon className="size-3.5" aria-hidden />
            <span className="num">{deltaLabel}</span>
          </span>
        )}
        <span className="text-text-3">{vs}</span>
      </div>
      {spark && <Sparkline values={spark} tone={tone} className="mt-3" />}
    </div>
  );
}

/** USDC-style number with dimmed decimals and a small unit. */
export function Amount({ whole, dec, unit = "USDC", className, size = "md" }: { whole: string; dec?: string; unit?: string | null; className?: string; size?: "sm" | "md" | "lg" }) {
  return (
    <span className={cn("num whitespace-nowrap", className)}>
      {whole}
      {dec && <span className="text-text-3">{dec}</span>}
      {unit && <span className={cn("ml-1 font-medium text-text-3", size === "lg" ? "text-[14px]" : "text-[0.72em]")}>{unit}</span>}
    </span>
  );
}

/* ── tabs ── */
export const Tabs = RTabs.Root;
export function TabsList({ children, className }: { children: React.ReactNode; className?: string }) {
  return <RTabs.List className={cn("flex gap-1 overflow-x-auto border-b border-line", className)}>{children}</RTabs.List>;
}
export function TabsTrigger({ value, children, count }: { value: string; children: React.ReactNode; count?: number }) {
  return (
    <RTabs.Trigger value={value} className="relative inline-flex h-10 items-center gap-2 px-3 text-[14px] font-medium whitespace-nowrap text-text-2 transition-colors hover:text-text data-[state=active]:text-text after:absolute after:inset-x-3 after:-bottom-px after:h-[2px] after:origin-left after:scale-x-0 after:rounded-full after:bg-light after:transition-transform after:duration-200 data-[state=active]:after:scale-x-100">
      {children}
      {count !== undefined && <span className="num rounded-full bg-sunk px-1.5 text-[11px] text-text-2">{count}</span>}
    </RTabs.Trigger>
  );
}
export const TabsContent = ({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) => (
  <RTabs.Content value={value} className={cn("pt-5 outline-none [animation:pp-fade_200ms_ease-out]", className)}>
    {children}
  </RTabs.Content>
);

/* ── accordion ── */
export function Accordion({ items, className }: { items: { q: string; a: React.ReactNode }[]; className?: string }) {
  return (
    <RAccordion.Root type="single" collapsible className={cn("divide-y divide-line rounded-panel bg-raised shadow-raised", className)}>
      {items.map((it, i) => (
        <RAccordion.Item key={i} value={`i${i}`}>
          <RAccordion.Header>
            <RAccordion.Trigger className="group flex w-full items-center justify-between gap-6 px-5 py-4 text-left text-[15px] font-medium">
              {it.q}
              <span className="relative size-4 shrink-0 text-text-3 before:absolute before:inset-x-0 before:top-1/2 before:h-px before:bg-current after:absolute after:inset-y-0 after:left-1/2 after:w-px after:bg-current after:transition-transform group-data-[state=open]:after:scale-y-0" aria-hidden />
            </RAccordion.Trigger>
          </RAccordion.Header>
          <RAccordion.Content className="overflow-hidden data-[state=closed]:animate-[pp-fade_120ms_ease-in_reverse] data-[state=open]:[animation:pp-fade_200ms_ease-out]">
            <div className="px-5 pb-5 text-[14.5px] leading-relaxed text-text-2">{it.a}</div>
          </RAccordion.Content>
        </RAccordion.Item>
      ))}
    </RAccordion.Root>
  );
}

/* ── breadcrumbs / pagination / stepper ── */
export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[13px] text-text-3">
      {items.map((it, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {it.href ? <Link href={it.href} className="hover:text-text">{it.label}</Link> : <span className="text-text-2" aria-current="page">{it.label}</span>}
          {i < items.length - 1 && <ChevronRight className="size-3.5" aria-hidden />}
        </span>
      ))}
    </nav>
  );
}

export function Pagination({ page, pages, onPage, total, perPage }: { page: number; pages: number; onPage: (p: number) => void; total: number; perPage: number }) {
  const from = total === 0 ? 0 : (page - 1) * perPage + 1;
  const to = Math.min(total, page * perPage);
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 text-[13px] text-text-2">
      <span className="num">
        {from}–{to} of {total}
      </span>
      <div className="flex items-center gap-1">
        <button aria-label="Previous page" disabled={page <= 1} onClick={() => onPage(page - 1)} className="grid size-8 place-items-center rounded-control hover:bg-lift disabled:opacity-40">
          <ChevronLeft className="size-4" />
        </button>
        <span className="num px-2">
          {page} / {Math.max(1, pages)}
        </span>
        <button aria-label="Next page" disabled={page >= pages} onClick={() => onPage(page + 1)} className="grid size-8 place-items-center rounded-control hover:bg-lift disabled:opacity-40">
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  );
}

export function Stepper({ steps, current, onStep }: { steps: { label: string; hint?: string }[]; current: number; onStep?: (i: number) => void }) {
  return (
    <ol className="flex gap-1.5 overflow-x-auto" aria-label="Progress">
      {steps.map((s, i) => {
        const done = i < current;
        const on = i === current;
        return (
          <li key={s.label} className="min-w-0 flex-1">
            <button type="button" disabled={!onStep || i > current} onClick={() => onStep?.(i)} aria-current={on ? "step" : undefined} className="group grid w-full gap-1.5 text-left disabled:cursor-default">
              <span className={cn("h-[3px] rounded-full transition-colors", done || on ? "bg-light" : "bg-line-strong", on && "shadow-[0_0_10px_var(--light-glow)]")} />
              <span className="flex items-center gap-2 text-[13px]">
                <span className={cn("num grid size-5 place-items-center rounded-full text-[11px] font-semibold", done ? "bg-light text-on-light" : on ? "bg-light-quiet text-light-text" : "bg-sunk text-text-3")}>{done ? "✓" : i + 1}</span>
                <span className={cn("truncate font-medium", on ? "text-text" : "text-text-2")}>{s.label}</span>
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

/* ── timeline (event-sourced) ── */
export interface TimelineItem {
  id: string;
  title: React.ReactNode;
  meta?: React.ReactNode;
  note?: string | null;
  tx?: string | null;
  simulated?: boolean;
  tone?: "ok" | "info" | "warn" | "bad" | "mute" | "light";
  time: React.ReactNode;
}
const NODE: Record<string, string> = { ok: "var(--ok)", info: "var(--info)", warn: "var(--warn)", bad: "var(--bad)", mute: "var(--text-3)", light: "var(--light)" };
export function Timeline({ items, className }: { items: TimelineItem[]; className?: string }) {
  return (
    <ol className={cn("relative grid gap-0 pl-6", className)}>
      <span className="absolute bottom-2 left-[5px] top-2 w-[2px] rounded-full bg-[linear-gradient(180deg,var(--line-strong),var(--light)_85%,var(--light))] opacity-70" aria-hidden />
      {items.map((it, i) => (
        <li key={it.id} className="relative pb-5 last:pb-0">
          <span className="absolute -left-6 top-[5px] size-3 rounded-full border-2 bg-ground" style={{ borderColor: NODE[it.tone ?? "mute"], boxShadow: i === items.length - 1 ? `0 0 0 4px var(--light-quiet)` : undefined }} aria-hidden />
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
            <p className="text-[14px] font-medium">{it.title}</p>
            <span className="text-[12.5px] text-text-3">{it.meta}</span>
            <span className="ml-auto text-[12.5px] text-text-3">{it.time}</span>
          </div>
          {it.note && <p className="mt-0.5 text-[13px] text-text-2">{it.note}</p>}
          {it.tx && (
            <p className="mt-1 flex items-center gap-2 text-[12.5px] text-text-3">
              {it.simulated ? "Simulated tx" : "Tx"} <Hash value={it.tx} head={8} tail={6} />
            </p>
          )}
        </li>
      ))}
    </ol>
  );
}

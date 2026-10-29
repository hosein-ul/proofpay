"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Tip } from "./overlay";

/** Syntax-highlighted JSON with per-field explanations on hover and focus. Collapsible. */
export function JsonViewer({ value, explain = {}, title = "Raw attestation", defaultOpen = false, badge }: { value: unknown; explain?: Record<string, string>; title?: string; defaultOpen?: boolean; badge?: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="overflow-hidden rounded-panel bg-raised shadow-raised">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex w-full items-center gap-2 px-4 py-3 text-left text-[14px] font-medium hover:bg-lift">
        <ChevronDown className={cn("size-4 text-text-3 transition-transform", !open && "-rotate-90")} />
        {title}
        {badge}
        <span className="ml-auto text-[12px] font-normal text-text-3">{open ? "Hide" : "Show"}</span>
      </button>
      {open && (
        <pre className="mono max-h-[520px] overflow-auto border-t border-line bg-sunk p-4 text-[12.5px] leading-[1.65]" tabIndex={0}>
          <Node v={value} depth={0} path="" explain={explain} />
        </pre>
      )}
    </div>
  );
}

function Node({ v, depth, path, explain }: { v: unknown; depth: number; path: string; explain: Record<string, string> }) {
  const pad = "  ".repeat(depth + 1);
  const padEnd = "  ".repeat(depth);
  if (v === null) return <span className="text-text-3">null</span>;
  if (typeof v === "string") return <span style={{ color: "var(--ok)" }}>&quot;{v}&quot;</span>;
  if (typeof v === "number") return <span style={{ color: "var(--info)" }}>{v}</span>;
  if (typeof v === "boolean") return <span style={{ color: "var(--light-text)" }}>{String(v)}</span>;
  if (Array.isArray(v)) {
    if (!v.length) return <span>[]</span>;
    return (
      <>
        {"[\n"}
        {v.map((x, i) => (
          <span key={i}>
            {pad}
            <Node v={x} depth={depth + 1} path={`${path}[]`} explain={explain} />
            {i < v.length - 1 ? ",\n" : "\n"}
          </span>
        ))}
        {padEnd}]
      </>
    );
  }
  const entries = Object.entries(v as Record<string, unknown>);
  return (
    <>
      {"{\n"}
      {entries.map(([k, x], i) => {
        const p = path ? `${path}.${k}` : k;
        const tip = explain[p] ?? explain[k];
        const key = <span className={cn("text-text", tip && "cursor-help underline decoration-dotted decoration-text-3 underline-offset-4")}>&quot;{k}&quot;</span>;
        return (
          <span key={k}>
            {pad}
            {tip ? <Tip content={tip}><span tabIndex={0}>{key}</span></Tip> : key}
            {": "}
            <Node v={x} depth={depth + 1} path={p} explain={explain} />
            {i < entries.length - 1 ? ",\n" : "\n"}
          </span>
        );
      })}
      {padEnd}
      {"}"}
    </>
  );
}

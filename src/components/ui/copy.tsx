"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useState } from "react";
import { absoluteDateTime, relativeTime, truncateMiddle } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Tip } from "./overlay";

export function CopyButton({ value, label = "Copy", className }: { value: string; label?: string; className?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      aria-label={done ? "Copied" : `${label}`}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setDone(true);
          setTimeout(() => setDone(false), 1400);
        } catch {}
      }}
      className={cn("inline-grid size-6 shrink-0 place-items-center rounded-[6px] text-text-3 transition-colors hover:bg-lift hover:text-text", className)}
    >
      {done ? <Check className="size-3.5 text-ok" /> : <Copy className="size-3.5" />}
    </button>
  );
}

/** Truncated hash or address with the full value on hover and a copy button. */
export function Hash({ value, head = 6, tail = 4, className, copy = true, link }: { value: string; head?: number; tail?: number; className?: string; copy?: boolean; link?: string }) {
  const text = truncateMiddle(value, head, tail);
  const inner = <span className="mono text-text-2">{text}</span>;
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)}>
      <Tip content={<span className="mono break-all">{value}</span>}>{link ? <a href={link} target="_blank" rel="noreferrer" className="hover:underline">{inner}</a> : <span tabIndex={0}>{inner}</span>}</Tip>
      {copy && <CopyButton value={value} label="Copy full value" />}
    </span>
  );
}

/** A labelled read-only field with a copy button (keys, URLs, ids). */
export function CopyField({ value, mask, label }: { value: string; mask?: boolean; label?: string }) {
  const [show, setShow] = useState(!mask);
  return (
    <div className="flex h-10 items-center gap-1 rounded-control bg-sunk pl-3 pr-1 shadow-[0_0_0_1px_var(--line-strong)_inset]">
      <span aria-label={label} className="mono min-w-0 flex-1 truncate text-[13px] text-text">
        {show ? value : "•".repeat(Math.min(32, value.length))}
      </span>
      {mask && (
        <button type="button" onClick={() => setShow((s) => !s)} className="rounded-[6px] px-2 py-1 text-[12px] text-text-2 hover:bg-lift">
          {show ? "Hide" : "Show"}
        </button>
      )}
      <CopyButton value={value} />
    </div>
  );
}

/** Relative time with the absolute time on hover. Rendered on the client to avoid hydration drift. */
export function Time({ value, className }: { value: string; className?: string }) {
  const [rel, setRel] = useState<string | null>(null);
  useEffect(() => {
    const u = () => setRel(relativeTime(value));
    u();
    const t = setInterval(u, 30_000);
    return () => clearInterval(t);
  }, [value]);
  return (
    <Tip content={absoluteDateTime(value)}>
      <time dateTime={value} className={cn("whitespace-nowrap", className)} suppressHydrationWarning>
        {rel ?? absoluteDateTime(value).replace(/,? \d{2}:\d{2}.*/, "")}
      </time>
    </Tip>
  );
}

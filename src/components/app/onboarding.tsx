"use client";

import { Check, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const KEY = "pp-onboard";
const STEPS = [
  { id: "create", title: "Write a rule", body: "Pick a worker, a data source and a condition in plain words.", href: "/app/tasks/new", cta: "New task" },
  { id: "fund", title: "Lock the funds", body: "Fund the escrow in mock USDC. Nothing real moves.", href: "/app/tasks", cta: "Open a draft" },
  { id: "prove", title: "Generate a proof", body: "As the worker, submit a synthetic proof. Try one that fails.", href: "/app/tasks?view=awaiting", cta: "Find a task" },
  { id: "inspect", title: "Inspect the proof", body: "See what the source saw, what was signed, what the verifier learns.", href: "/app/proofs", cta: "Open inspector" },
  { id: "audit", title: "Check the ledger", body: "Every release and refund is a double entry. Export it.", href: "/app/ledger", cta: "Open ledger" },
];

export function markOnboarding(id: string) {
  try {
    const cur = new Set<string>(JSON.parse(localStorage.getItem(KEY) ?? "[]"));
    cur.add(id);
    localStorage.setItem(KEY, JSON.stringify([...cur]));
    window.dispatchEvent(new Event("pp-onboard"));
  } catch {}
}

export function Onboarding() {
  const [done, setDone] = useState<string[]>([]);
  // Rendered on the server so new visitors get no layout shift; returning visitors who dismissed it are hidden by CSS before first paint.
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    const read = () => {
      try {
        setDone(JSON.parse(localStorage.getItem(KEY) ?? "[]"));
        setHidden(localStorage.getItem("pp-onboard-hidden") === "1");
      } catch {
        setHidden(false);
      }
    };
    read();
    window.addEventListener("pp-onboard", read);
    return () => window.removeEventListener("pp-onboard", read);
  }, []);
  if (hidden) return null;
  const next = STEPS.find((s) => !done.includes(s.id));
  const count = STEPS.filter((s) => done.includes(s.id)).length;
  return (
    <section aria-label="Getting started" className="pp-rise-in relative rounded-panel bg-raised p-4 shadow-raised [html[data-onboard-hidden]_&]:hidden" style={{ ["--d" as string]: 1 }}>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3 pr-9">
        <div className="min-w-[200px]">
          <h2 className="text-[14px] font-semibold tracking-[-0.01em]">Try a settlement in five steps</h2>
          <p className="mt-0.5 text-[12.5px] text-text-2">{count === STEPS.length ? "You have done every step. Nice." : `${count} of ${STEPS.length} done. Nothing here moves real money.`}</p>
        </div>
        <ol className="flex flex-1 flex-wrap items-center gap-1.5">
          {STEPS.map((s, i) => {
            const d = done.includes(s.id);
            const on = next?.id === s.id;
            return (
              <li key={s.id}>
                <Link href={s.href} title={s.body} className={`inline-flex h-8 items-center gap-2 rounded-full px-3 text-[12.5px] font-medium transition-colors ${on ? "bg-light-quiet text-light-text shadow-[0_0_0_1px_color-mix(in_oklab,var(--light)_50%,transparent)]" : d ? "bg-sunk text-text-2" : "bg-sunk text-text-2 hover:bg-lift"}`}>
                  <span className={`grid size-4 place-items-center rounded-full text-[10px] font-semibold ${d ? "bg-light text-on-light" : "bg-raised text-text-3 shadow-[0_0_0_1px_var(--line-strong)]"}`}>{d ? <Check className="size-2.5" strokeWidth={3.5} /> : i + 1}</span>
                  {s.title}
                </Link>
              </li>
            );
          })}
        </ol>
        {next && (
          <Link href={next.href} className="text-[13px] font-medium text-light-text hover:underline">
            {next.cta} →
          </Link>
        )}
      </div>
      <Button variant="ghost" size="icon-sm" className="absolute right-2.5 top-2.5" aria-label="Dismiss getting started" onClick={() => { try { localStorage.setItem("pp-onboard-hidden", "1"); document.documentElement.dataset.onboardHidden = "1"; } catch {} setHidden(true); }}>
        <X className="size-4" />
      </Button>
    </section>
  );
}

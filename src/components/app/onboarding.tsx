"use client";

import { Check, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { PlateStack } from "@/components/brand/plate-stack";
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
  return (
    <section aria-label="Getting started" className="relative mb-6 [html[data-onboard-hidden]_&]:hidden overflow-hidden rounded-stage bg-raised shadow-raised">
      <div className="dots pointer-events-none absolute inset-y-0 right-0 w-1/2 opacity-60 [mask-image:linear-gradient(90deg,transparent,#000)]" aria-hidden />
      <div className="relative grid gap-5 p-5 md:grid-cols-[1fr_auto] md:items-center">
        <div className="grid gap-4">
          <div>
            <h2 className="text-[17px] font-semibold tracking-[-0.02em]">Try a settlement in five steps</h2>
            <p className="mt-1 max-w-[60ch] text-[13.5px] text-text-2">This is a demo workspace in Simulation. Create a task, fund it, prove it, and watch the escrow release. Nothing here moves real money.</p>
          </div>
          <ol className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
            {STEPS.map((s, i) => {
              const d = done.includes(s.id);
              const on = next?.id === s.id;
              return (
                <li key={s.id} className={`rounded-panel p-3 text-[13px] ${on ? "bg-light-quiet shadow-[0_0_0_1px_color-mix(in_oklab,var(--light)_50%,transparent)]" : "bg-sunk"}`}>
                  <div className="flex items-center gap-2">
                    <span className={`grid size-5 place-items-center rounded-full text-[11px] font-semibold ${d ? "bg-light text-on-light" : "bg-raised text-text-3 shadow-[0_0_0_1px_var(--line-strong)]"}`}>{d ? <Check className="size-3" strokeWidth={3} /> : i + 1}</span>
                    <span className="font-medium">{s.title}</span>
                  </div>
                  <p className="mt-1.5 text-[12.5px] text-text-2">{s.body}</p>
                  <Link href={s.href} className="mt-2 inline-block text-[12.5px] font-medium text-light-text underline-offset-2 hover:underline">
                    {s.cta} →
                  </Link>
                </li>
              );
            })}
          </ol>
        </div>
        <PlateStack count={4} size={120} className="hidden md:block" />
      </div>
      <Button variant="ghost" size="icon-sm" className="absolute right-3 top-3" aria-label="Dismiss getting started" onClick={() => { try { localStorage.setItem("pp-onboard-hidden", "1"); document.documentElement.dataset.onboardHidden = "1"; } catch {} setHidden(true); }}>
        <X className="size-4" />
      </Button>
    </section>
  );
}

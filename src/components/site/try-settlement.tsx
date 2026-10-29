"use client";

import { Check, Play, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { SimTag } from "@/components/ui/chips";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: "lock", title: "Payer locks 2,500.00 USDC", note: "Funds move into the escrow. The rule is hashed into the task." },
  { id: "prove", title: "Worker proves the number", note: "A simulated attestor signs “conversions ≥ 1,200 is true”. The value itself stays private." },
  { id: "verify", title: "Escrow checks six things", note: "Signature, attestor, binding, replay, time window, rule." },
  { id: "pay", title: "Escrow pays the worker", note: "No approval step. The check passing is the approval." },
];
const CHECKS = ["Signature is valid", "Attestor is registered", "Bound to this task and worker", "Not used before", "Inside the time window", "Rule is satisfied"];

export function TrySettlement() {
  const [step, setStep] = useState(-1);
  const [bad, setBad] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (step < 0 || step >= 3) return;
    const stopAt = bad && step === 2;
    if (stopAt) return;
    timer.current = setTimeout(() => setStep((s) => s + 1), step === 2 ? 1500 : 1100);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [step, bad]);

  const run = (fail: boolean) => { setBad(fail); setStep(0); };
  const failed = bad && step >= 2;
  const done = step >= 3 && !bad;

  return (
    <div className="overflow-hidden rounded-stage bg-raised shadow-raised">
      <div className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-3.5">
        <SimTag label="Simulation" />
        <p className="text-[13.5px] text-text-2">Runs in your browser. Nothing is sent or stored.</p>
        <span className="flex-1" />
        {step < 0 ? (
          <>
            <Button variant="primary" size="sm" onClick={() => run(false)}><Play className="size-3.5" /> Run a settlement</Button>
            <Button variant="secondary" size="sm" onClick={() => run(true)}>Try a bad proof</Button>
          </>
        ) : (
          <Button variant="secondary" size="sm" onClick={() => setStep(-1)}><RotateCcw className="size-3.5" /> Reset</Button>
        )}
      </div>
      <div className="grid gap-0 md:grid-cols-[1.1fr_1fr]">
        <ol className="grid gap-1 p-5">
          {STEPS.map((s, i) => {
            const on = step >= i;
            const cur = step === i;
            const isBad = failed && i >= 2;
            return (
              <li key={s.id} className={cn("flex gap-3 rounded-panel p-3 transition-colors", cur && !isBad && "bg-sunk")}>
                <span className={cn("mt-0.5 grid size-6 shrink-0 place-items-center rounded-full text-[12px] font-semibold transition-colors", isBad ? "bg-bad text-white" : on ? "bg-light text-on-light" : "bg-sunk text-text-3")}>
                  {on && !isBad && i < step || (done && i === 3) ? <Check className="size-3.5" strokeWidth={3} /> : isBad ? "!" : i + 1}
                </span>
                <span className="grid gap-0.5">
                  <span className={cn("text-[14.5px] font-medium", !on && "text-text-3")}>{i === 3 && failed ? "Escrow does not pay" : s.title}</span>
                  <span className="text-[13px] text-text-2">{i === 3 && failed ? "The funds stay locked. The worker can try again before the deadline, or the payer can refund after it." : s.note}</span>
                </span>
              </li>
            );
          })}
        </ol>
        <div className="border-t border-line bg-sunk p-5 md:border-l md:border-t-0" aria-live="polite">
          <p className="mb-3 text-[12.5px] font-medium text-text-3">Verification</p>
          <ul className="grid gap-2">
            {CHECKS.map((c, i) => {
              const shown = step >= 2;
              const fail = bad && i === 3 && shown;
              const pass = shown && !(bad && i >= 3);
              return (
                <li key={c} className={cn("flex items-center gap-2.5 text-[13.5px] transition-opacity", !shown && "opacity-40")} style={{ transitionDelay: shown ? `${i * 120}ms` : "0ms" }}>
                  <span className={cn("grid size-5 place-items-center rounded-full", fail ? "bg-bad-quiet text-bad" : pass ? "bg-ok-quiet text-ok" : "bg-raised text-text-3")}>{fail ? "×" : pass ? <Check className="size-3" strokeWidth={3} /> : ""}</span>
                  {c}
                  {fail && <span className="text-bad">Already used</span>}
                </li>
              );
            })}
          </ul>
          <p className="mt-5 rounded-control bg-raised px-3 py-2 text-[12.5px] text-text-2 shadow-rest">
            {step < 0 ? "Press Run to watch one task go from locked to paid." : done ? "Paid. In the real flow this is one transaction with a hash anyone can check." : failed ? "Rejected: the same proof was already used, so it cannot pay twice." : "Working…"}
          </p>
        </div>
      </div>
    </div>
  );
}

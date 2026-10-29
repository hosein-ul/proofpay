"use client";

import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Check, CircleAlert, Clock, Lock, Sparkles, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { PlateStack } from "@/components/brand/plate-stack";
import { Button } from "@/components/ui/button";
import { Chip, SimTag } from "@/components/ui/chips";
import { Stepper } from "@/components/ui/data";
import { Callout } from "@/components/ui/feedback";
import { Field, Input, NumberInput, RadioCards, Segmented, Select } from "@/components/ui/form";
import { Identicon } from "@/components/ui/identicon";
import { BrandMark, MarksCaption, TokenIcon, TokenOnChain } from "@/components/ui/marks";
import { Tip } from "@/components/ui/overlay";
import { conditionHashOf, conditionText } from "@/lib/domain/condition";
import { OP_LABEL, type Condition, type Op, type Worker } from "@/lib/domain/types";
import { formatUsdc } from "@/lib/format";
import { SOURCES, TEMPLATE_IDEAS } from "@/lib/sources";
import { cn } from "@/lib/utils";
import { markOnboarding } from "./onboarding";
import { TrustModel } from "./trust-model";

export interface WorkerLite extends Worker {
  proofs: number;
  successRate: number;
  active: number;
}

const STEPS = [
  { label: "Worker", hint: "Who gets paid" },
  { label: "Data source", hint: "Where the proof comes from" },
  { label: "Condition", hint: "What must be true" },
  { label: "Terms", hint: "Amount and deadline" },
  { label: "Review", hint: "Check and fund" },
];

interface Draft {
  step: number;
  workerId: string;
  sourceId: string;
  metricKey: string;
  op: Op;
  threshold: number | "";
  amount: number | "";
  title: string;
  titleTouched: boolean;
  days: number;
  deadline: string; // datetime-local
  refund: "auto" | "payer";
}
const KEY = "pp-builder-draft";
const toLocal = (d: Date) => new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
const daysFromNow = (n: number) => toLocal(new Date(Date.now() + n * 86_400_000));
const empty = (): Draft => ({ step: 0, workerId: "", sourceId: "", metricKey: "", op: ">=", threshold: "", amount: "", title: "", titleTouched: false, days: 7, deadline: daysFromNow(7), refund: "auto" });

export function TaskBuilder({ workers }: { workers: WorkerLite[] }) {
  const router = useRouter();
  const [d, setD] = useState<Draft>(empty);
  const [touched, setTouched] = useState<Record<number, boolean>>({});
  const [saved, setSaved] = useState<"idle" | "saved">("idle");
  const [restore, setRestore] = useState<Draft | null>(null);
  const [success, setSuccess] = useState<{ id: string } | null>(null);
  const first = useRef(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const p = JSON.parse(raw) as Draft;
        if (p.workerId || p.sourceId || p.amount) setRestore(p);
      }
    } catch {}
  }, []);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const t = setTimeout(() => {
      try {
        localStorage.setItem(KEY, JSON.stringify(d));
        setSaved("saved");
      } catch {}
    }, 500);
    return () => clearTimeout(t);
  }, [d]);

  const worker = workers.find((w) => w.id === d.workerId);
  const source = SOURCES.find((s) => s.id === d.sourceId);
  const metric = source?.metrics.find((m) => m.key === d.metricKey);
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((x) => ({ ...x, [k]: v }));

  const condition: Condition | null = useMemo(() => {
    if (!source || !metric || d.threshold === "") return null;
    return { sourceId: source.id, sourceName: source.name, url: source.url(`cmp_${(worker?.name ?? "demo").toLowerCase().replace(/[^a-z]/g, "").slice(0, 8)}`), method: "GET", jsonPath: metric.path, metric: metric.key, op: d.op, threshold: d.threshold, unit: metric.unit, disclosure: "threshold" };
  }, [source, metric, d.threshold, d.op, worker]);

  const errors = {
    0: !d.workerId ? "Choose who will do the work and get paid." : "",
    1: !d.sourceId || !d.metricKey ? "Pick a data source and the number it reports." : "",
    2: d.threshold === "" ? "Enter the threshold the number must reach." : "",
    3: d.amount === "" || d.amount <= 0 ? "Enter an amount above zero." : d.amount > 100000 ? "The testnet cap is 100,000 USDC per task." : new Date(d.deadline).getTime() < Date.now() + 3_600_000 ? "Set a deadline at least an hour from now." : d.title.trim().length < 3 ? "Give the task a short title." : "",
  } as Record<number, string>;
  const valid = (s: number) => !errors[s];

  // suggest a title once we know the worker and metric
  useEffect(() => {
    if (!d.titleTouched && worker && metric) setD((x) => ({ ...x, title: `${metric.label} for ${worker.name}` }));
  }, [worker, metric, d.titleTouched]);

  const create = useMutation({
    mutationFn: async (fund: boolean) => {
      if (!condition || d.amount === "") throw new Error("The task is incomplete.");
      const r = await fetch("/api/tasks", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ title: d.title.trim(), workerId: d.workerId, amountUsdc: d.amount, condition, deadline: new Date(d.deadline).toISOString(), refundPolicy: d.refund }) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error?.issues?.[0]?.message ?? j.error?.message ?? "Couldn’t create the task");
      if (fund) {
        const f = await fetch(`/api/tasks/${j.task.id}/fund`, { method: "POST", headers: { "idempotency-key": `fund-${j.task.id}` } });
        const fj = await f.json();
        if (!f.ok) throw Object.assign(new Error(fj.error?.message ?? "Couldn’t fund"), { taskId: j.task.id });
      }
      return { id: j.task.id as string, funded: fund };
    },
    onSuccess: ({ id, funded }) => {
      try {
        localStorage.removeItem(KEY);
      } catch {}
      markOnboarding("create");
      if (funded) markOnboarding("fund");
      if (funded) setSuccess({ id });
      else {
        toast.success("Draft saved", { description: "Fund it when you are ready." });
        router.push(`/app/tasks/${id}`);
      }
    },
    onError: (e: Error & { taskId?: string }) => {
      toast.error("Something went wrong", { description: e.message });
      if (e.taskId) router.push(`/app/tasks/${e.taskId}`);
    },
  });

  function next() {
    setTouched((t) => ({ ...t, [d.step]: true }));
    if (!valid(d.step)) return;
    set("step", Math.min(4, d.step + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (success)
    return (
      <div className="mx-auto grid max-w-[560px] justify-items-center gap-5 rounded-stage bg-raised px-6 py-14 text-center shadow-raised">
        <PlateStack count={4} lit={3} animate={false} size={150} />
        <div className="grid gap-1.5">
          <h2 className="text-[24px] font-semibold tracking-[-0.03em] [font-variation-settings:'wdth'_114]">Escrow funded</h2>
          <p className="text-[14.5px] text-text-2">
            {formatUsdc(Math.round(Number(d.amount) * 1e6))} USDC is locked for {worker?.name}. In Simulation nothing real moved. {worker?.name} can now generate a proof.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          <Button variant="primary" asChild><Link href={`/app/tasks/${success.id}`}>Open the task</Link></Button>
          <Button variant="secondary" onClick={() => { setSuccess(null); setD(empty()); setTouched({}); }}>Create another</Button>
        </div>
        <p className="text-[12.5px] text-text-3">Tip: switch the account menu to “Worker” to generate the proof yourself.</p>
      </div>
    );

  const showErr = (s: number) => touched[s] && errors[s];
  const total = d.amount === "" ? 0 : Math.round(d.amount * 1e6);
  const checks = reviewChecks({ d, worker, errors });

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="grid min-w-0 content-start gap-5">
        {restore && (
          <Callout tone="info" title="Continue where you left off?" action={<div className="flex gap-1.5"><Button size="sm" variant="secondary" onClick={() => { setD(restore); setRestore(null); }}>Restore draft</Button><Button size="sm" variant="ghost" onClick={() => { localStorage.removeItem(KEY); setRestore(null); }}>Discard</Button></div>}>
            You have an unsent draft in this browser.
          </Callout>
        )}
        <div className="rounded-panel bg-raised p-4 shadow-raised">
          <Stepper steps={STEPS} current={d.step} onStep={(i) => set("step", i)} />
        </div>

        <section className="rounded-stage bg-raised p-5 shadow-raised sm:p-6" aria-live="polite">
          <header className="mb-5 flex items-start gap-3">
            <div className="grid flex-1 gap-1">
              <h2 className="text-[20px] font-semibold tracking-[-0.025em] [font-variation-settings:'wdth'_110]">{["Who will do the work?", "Where does the proof come from?", "What has to be true?", "How much, and by when?", "Review and fund"][d.step]}</h2>
              <p className="text-[13.5px] text-text-2">{["The worker’s address is bound into the proof, so only they can be paid.", "The worker will prove one number from this source. Nothing else is revealed.", "A rule on that number. It is hashed into the task, so it can’t change later.", "Funds sit in escrow until the proof verifies or the deadline passes.", "Everything below is what the escrow will enforce."][d.step]}</p>
            </div>
            <span className="num mt-1 text-[12px] text-text-3">{saved === "saved" ? "Draft saved" : ""}</span>
          </header>

          {d.step === 0 && (
            <div className="grid gap-2.5 sm:grid-cols-2">
              {workers.map((w) => {
                const on = d.workerId === w.id;
                return (
                  <button key={w.id} type="button" onClick={() => set("workerId", w.id)} aria-pressed={on} className={cn("flex items-start gap-3 rounded-panel bg-raised p-3.5 text-left shadow-rest transition-shadow hover:shadow-[0_0_0_1px_var(--line-strong)]", on && "shadow-[0_0_0_1.5px_var(--light),0_0_0_5px_var(--light-quiet)]")}>
                    <Identicon name={w.name} hue={w.hue} size={36} />
                    <span className="grid min-w-0 flex-1 gap-0.5">
                      <span className="flex items-center gap-2 text-[14.5px] font-medium">{w.name} <span className="rounded-full bg-sunk px-1.5 text-[11px] font-normal text-text-3">{w.kind}</span></span>
                      <span className="text-[12.5px] text-text-2">{w.bio}</span>
                      <span className="num mt-1 text-[12px] text-text-3">{w.proofs ? `${w.proofs} proofs · ${w.successRate.toFixed(0)}% verified` : "No proofs yet"}</span>
                    </span>
                    {on && <Check className="size-4 text-light-text" strokeWidth={3} />}
                  </button>
                );
              })}
            </div>
          )}

          {d.step === 1 && (
            <div className="grid gap-5">
              <div className="grid gap-2.5 sm:grid-cols-2">
                {SOURCES.map((s) => {
                  const on = d.sourceId === s.id;
                  return (
                    <button key={s.id} type="button" onClick={() => setD((x) => ({ ...x, sourceId: s.id, metricKey: s.metrics[0].key, op: s.metrics[0].suggest.op, threshold: s.metrics[0].suggest.threshold }))} aria-pressed={on} className={cn("grid gap-1 rounded-panel bg-raised p-4 text-left shadow-rest hover:shadow-[0_0_0_1px_var(--line-strong)]", on && "shadow-[0_0_0_1.5px_var(--light),0_0_0_5px_var(--light-quiet)]")}>
                      <span className="flex items-center gap-2 text-[14.5px] font-medium">{s.name} <Chip tone="ok">Ready</Chip></span>
                      <span className="text-[13px] text-text-2">{s.blurb}</span>
                    </button>
                  );
                })}
              </div>
              {source && (
                <Field label="Which number will be proven?" hint={metric?.hint}>
                  <Select value={d.metricKey} onValueChange={(v) => { const m = source.metrics.find((x) => x.key === v)!; setD((x) => ({ ...x, metricKey: v, op: m.suggest.op, threshold: m.suggest.threshold })); }} options={source.metrics.map((m) => ({ value: m.key, label: m.label, hint: m.path }))} />
                </Field>
              )}
              <div className="rounded-panel bg-sunk p-4">
                <p className="text-[13px] font-medium">Bring your own source</p>
                <p className="mt-0.5 text-[12.5px] text-text-2">Any HTTPS page or API can be proven once it has a Primus template. These are examples of what people attest. Each needs its own template, created in the Primus Developer Hub.</p>
                <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {TEMPLATE_IDEAS.map((t) => (
                    <li key={t.id}>
                      <Tip content={`${t.example}. Needs a Primus template: not available in the beta.`}>
                        <span tabIndex={0} className="flex cursor-not-allowed items-center gap-2 rounded-control bg-raised px-2.5 py-2 text-[12.5px] text-text-2 opacity-80 shadow-rest"><BrandMark id={t.id} size={16} />{t.name}</span>
                      </Tip>
                    </li>
                  ))}
                </ul>
                <MarksCaption className="mt-3" />
              </div>
              {showErr(1) && <Err>{errors[1]}</Err>}
            </div>
          )}

          {d.step === 2 && source && metric && (
            <div className="grid gap-5">
              <div className="rounded-panel bg-sunk p-4">
                <p className="mb-3 text-[12.5px] font-medium text-text-3">Release the funds when</p>
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="inline-flex h-10 items-center rounded-control bg-raised px-3 text-[14px] font-medium shadow-rest">{metric.label}</span>
                  <Segmented aria-label="Comparison" value={d.op} onValueChange={(v) => set("op", v as Op)} options={(Object.keys(OP_LABEL) as Op[]).map((o) => ({ value: o, label: OP_LABEL[o] }))} />
                  <div className="w-[170px]"><NumberInput value={d.threshold} onChange={(n) => set("threshold", n)} unit={metric.unit} invalid={!!showErr(2)} /></div>
                </div>
                {showErr(2) && <Err className="mt-2">{errors[2]}</Err>}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-panel bg-raised p-4 shadow-rest">
                  <p className="text-[12.5px] font-medium text-text-3">In plain language</p>
                  <p className="mt-1.5 text-[15px] leading-snug">Pay <strong>{worker?.name}</strong> when <span className="rounded-[6px] bg-sunk px-1.5 py-0.5 font-medium">{condition ? conditionText(condition) : "…"}</span>.</p>
                </div>
                <div className="rounded-panel bg-raised p-4 shadow-rest">
                  <p className="text-[12.5px] font-medium text-text-3">What the verifier will learn</p>
                  <p className="mt-1.5 text-[14px] text-text-2">Only <strong className="text-text">true</strong> or <strong className="text-text">false</strong>. Not the value, not other fields.</p>
                </div>
              </div>
              <RadioCards value="threshold" onValueChange={() => {}} options={[{ value: "threshold", title: "Threshold only (recommended)", body: "The proof says whether the rule holds. The raw number stays private.", icon: <Lock className="size-4" /> }]} />
              <p className="text-[12.5px] text-text-3">Hash and reveal disclosures are not available in the beta.</p>
            </div>
          )}

          {d.step === 3 && (
            <div className="grid gap-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Amount" error={showErr(3) && d.amount === "" ? errors[3] : ""} hint="Mock USDC on Base Sepolia. 6 decimals.">
                  <div className="relative">
                    <NumberInput value={d.amount} onChange={(n) => set("amount", n)} unit="USDC" min={0} className="pl-11 text-[16px] font-medium" invalid={!!(showErr(3) && d.amount === "")} placeholder="2,500" />
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"><TokenIcon id="USDC" size={22} /></span>
                  </div>
                </Field>
                <Field label="Deadline" hint="After this, the payer can refund.">
                  <Input type="datetime-local" value={d.deadline} onChange={(e) => set("deadline", e.target.value)} className="num" />
                </Field>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[12.5px] text-text-3">Quick deadline</span>
                {[3, 7, 14, 30].map((n) => <Button key={n} size="xs" variant={d.days === n && d.deadline === daysFromNow(n) ? "primary" : "secondary"} onClick={() => setD((x) => ({ ...x, days: n, deadline: daysFromNow(n) }))}>{n} days</Button>)}
              </div>
              <Field label="Task title" error={showErr(3) && d.title.trim().length < 3 ? errors[3] : ""}>
                <Input value={d.title} onChange={(e) => setD((x) => ({ ...x, title: e.target.value, titleTouched: true }))} placeholder="Q4 growth campaign" />
              </Field>
              <Field label="If the deadline passes">
                <RadioCards value={d.refund} onValueChange={(v) => set("refund", v)} options={[{ value: "auto", title: "Payer can refund in one step", body: "Recommended. The funds are never stuck." }, { value: "payer", title: "Payer must approve a refund", body: "Same step, with an extra confirmation." }]} />
              </Field>
              {showErr(3) && d.amount !== "" && d.title.trim().length >= 3 && <Err>{errors[3]}</Err>}
            </div>
          )}

          {d.step === 4 && condition && worker && (
            <div className="grid gap-5">
              <dl className="grid gap-3 rounded-panel bg-sunk p-4 text-[14px]">
                <Line k="Task">{d.title}</Line>
                <Line k="Pays"><span className="inline-flex items-center gap-2"><Identicon name={worker.name} hue={worker.hue} size={20} />{worker.name}</span></Line>
                <Line k="Rule">{conditionText(condition)} <span className="text-text-3">· {source?.name}</span></Line>
                <Line k="Amount"><span className="inline-flex items-center gap-2"><TokenOnChain size={20} /><span className="num font-semibold">{formatUsdc(total)} USDC</span></span></Line>
                <Line k="Deadline">{new Date(d.deadline).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}</Line>
                <Line k="Refund">{d.refund === "auto" ? "Payer can refund in one step" : "Payer must approve"}</Line>
                <Line k="Rule hash"><span className="mono text-[12px] text-text-2">{conditionHashOf(condition).slice(0, 18)}…</span></Line>
              </dl>
              <div className="grid gap-2">
                <h3 className="text-[13.5px] font-semibold">Risk checks</h3>
                <ul className="grid gap-1.5">
                  {checks.map((c) => (
                    <li key={c.label} className="flex items-start gap-2.5 text-[13.5px]">
                      <span className={cn("mt-0.5 grid size-5 shrink-0 place-items-center rounded-full", c.ok ? "bg-ok-quiet text-ok" : "bg-warn-quiet text-warn")}>{c.ok ? <Check className="size-3" strokeWidth={3} /> : <TriangleAlert className="size-3" />}</span>
                      <span><span className="font-medium">{c.label}</span> <span className="text-text-2">{c.detail}</span></span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-panel bg-raised p-4 shadow-rest">
                <h3 className="text-[13.5px] font-semibold">Costs</h3>
                <dl className="mt-2 grid gap-1.5 text-[13.5px]">
                  <Line k="Protocol fee"><span className="num">0.00 USDC</span> <span className="text-text-3">(none during the testnet beta)</span></Line>
                  <Line k="Network gas">Paid in Base Sepolia ETH. <span className="text-text-3">Simulated in Simulation.</span></Line>
                </dl>
              </div>
              <div>
                <h3 className="mb-2 flex items-center gap-2 text-[13.5px] font-semibold">Trust Model <SimTag label="Simulation" /></h3>
                <TrustModel compact />
              </div>
            </div>
          )}

          <footer className="mt-6 flex flex-wrap items-center gap-2 border-t border-line pt-4">
            <Button variant="ghost" onClick={() => set("step", Math.max(0, d.step - 1))} disabled={d.step === 0}><ArrowLeft className="size-4" /> Back</Button>
            <span className="flex-1" />
            {d.step < 4 ? (
              <Button variant="primary" onClick={next}>Continue <ArrowRight className="size-4" /></Button>
            ) : (
              <>
                <Button variant="secondary" loading={create.isPending && create.variables === false} disabled={create.isPending || !valid(3)} onClick={() => create.mutate(false)}>Save as draft</Button>
                <Button variant="primary" loading={create.isPending && create.variables === true} disabled={create.isPending || !valid(3) || !condition} onClick={() => create.mutate(true)}><Lock className="size-4" /> Fund {formatUsdc(total)} USDC</Button>
              </>
            )}
          </footer>
        </section>
      </div>

      {/* live summary */}
      <aside className="lg:sticky lg:top-20 lg:self-start">
        <div className="relative overflow-hidden rounded-stage bg-raised p-5 shadow-raised">
          <div aria-hidden className="dots pointer-events-none absolute inset-0 opacity-50 [mask-image:radial-gradient(80%_60%_at_80%_0%,#000,transparent)]" />
          <div className="relative grid gap-4">
            <div className="flex items-start gap-3">
              <div className="grid flex-1 gap-1">
                <p className="text-[12px] font-medium text-text-3">Live summary</p>
                <p className="text-[16px] leading-snug">
                  Release <strong className="num">{d.amount === "" ? "—" : formatUsdc(total)}</strong> USDC to <strong>{worker?.name ?? "…"}</strong> when <span className="rounded-[6px] bg-sunk px-1.5 py-0.5 font-medium">{condition ? conditionText(condition) : "…"}</span>
                  {d.deadline ? <> by <strong>{new Date(d.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</strong></> : null}.
                </p>
              </div>
              <PlateStack count={4} lit={Math.min(3, d.step - 0)} animate={false} size={72} />
            </div>
            <ul className="grid gap-2 border-t border-line pt-3 text-[13px]">
              <Sum ok={!!worker} label="Worker">{worker?.name}</Sum>
              <Sum ok={!!metric} label="Source">{source ? `${source.name} → ${metric?.label ?? "…"}` : undefined}</Sum>
              <Sum ok={!!condition} label="Rule">{condition ? conditionText(condition) : undefined}</Sum>
              <Sum ok={d.amount !== "" && d.amount > 0} label="Amount">{d.amount !== "" ? `${formatUsdc(total)} USDC` : undefined}</Sum>
              <Sum ok={new Date(d.deadline).getTime() > Date.now()} label="Deadline"><span className="inline-flex items-center gap-1"><Clock className="size-3" />{new Date(d.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span></Sum>
            </ul>
            <p className="flex items-start gap-2 text-[12px] text-text-3"><Sparkles className="mt-0.5 size-3.5 shrink-0" /> The rule and the worker’s address are hashed into the task. A proof for anything else is rejected.</p>
          </div>
        </div>
      </aside>
    </div>
  );
}

function Err({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p role="alert" className={cn("flex items-center gap-1.5 text-[13px] text-bad", className)}>
      <CircleAlert className="size-4 shrink-0" /> {children}
    </p>
  );
}
function Line({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[96px_1fr] items-baseline gap-3">
      <dt className="text-text-3">{k}</dt>
      <dd>{children}</dd>
    </div>
  );
}
function Sum({ ok, label, children }: { ok: boolean; label: string; children?: React.ReactNode }) {
  return (
    <li className="flex items-center gap-2.5">
      <span className={cn("grid size-4 shrink-0 place-items-center rounded-full", ok ? "bg-light text-on-light" : "bg-sunk text-text-3 shadow-[0_0_0_1px_var(--line-strong)_inset]")}>{ok && <Check className="size-2.5" strokeWidth={3.5} />}</span>
      <span className="w-[68px] shrink-0 text-text-3">{label}</span>
      <span className={cn("min-w-0 truncate", ok ? "text-text" : "text-text-3")}>{children ?? "Not set"}</span>
    </li>
  );
}

function reviewChecks({ d, worker, errors }: { d: Draft; worker?: WorkerLite; errors: Record<number, string> }) {
  const hours = (new Date(d.deadline).getTime() - Date.now()) / 3_600_000;
  return [
    { ok: hours >= 24, label: "Deadline leaves room.", detail: hours >= 24 ? "At least a day for the worker to prove." : "Less than a day. The worker may not have time." },
    { ok: !!worker && worker.proofs > 0 && worker.successRate >= 70, label: "Worker has a track record.", detail: worker ? (worker.proofs ? `${worker.proofs} proofs, ${worker.successRate.toFixed(0)}% verified.` : "No proofs yet. That is fine for a first task.") : "" },
    { ok: d.amount !== "" && d.amount <= 100000, label: "Amount is within the testnet cap.", detail: "100,000 USDC per task on testnet." },
    { ok: !errors[2], label: "The rule is checkable.", detail: "The source has a ready template, so a proof can be generated." },
  ];
}

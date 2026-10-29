"use client";

import { useMutation } from "@tanstack/react-query";
import { ArrowRight, CalendarClock, ChevronRight, FastForward, Fingerprint, Gavel, Link2, MoreHorizontal, ShieldCheck, Undo2, Wallet } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Chip, ModeBadge, SimTag, StatusChip } from "@/components/ui/chips";
import { Hash, CopyField, Time } from "@/components/ui/copy";
import { Amount, Tabs, TabsContent, TabsList, TabsTrigger, Timeline, type TimelineItem } from "@/components/ui/data";
import { Callout, EmptyState } from "@/components/ui/feedback";
import { Field, NumberInput, Textarea, RadioCards, Switch } from "@/components/ui/form";
import { Identicon } from "@/components/ui/identicon";
import { TokenOnChain } from "@/components/ui/marks";
import { Confirm, Menu, MenuContent, MenuItem, MenuSeparator, MenuTrigger, Modal } from "@/components/ui/overlay";
import { conditionText } from "@/lib/domain/condition";
import { PROOF_ERRORS } from "@/lib/domain/errors";
import { isTerminal } from "@/lib/domain/state-machine";
import { OP_LABEL, STATE_LABEL, STATE_TONE, type Attestation, type LedgerEntry, type ProofErrorCode, type Task, type TaskEvent, type VerificationResult, type Worker } from "@/lib/domain/types";
import { absoluteDateTime, splitAmount } from "@/lib/format";
import { cn } from "@/lib/utils";
import { runPrimusAttestation } from "@/lib/client/primus";
import { markOnboarding } from "./onboarding";
import { useApp } from "./context";
import { StateRail } from "./state-rail";
import { TrustModel } from "./trust-model";

export interface DetailData {
  task: Task;
  worker: Worker;
  events: TaskEvent[];
  attestations: { attestation: Attestation; ok: boolean | null; verification: VerificationResult | null; createdAt: string }[];
  ledger: LedgerEntry[];
}

const EVENT_TITLE: Record<string, string> = {
  task_created: "Task created",
  funded: "Escrow funded",
  awaiting_proof: "Awaiting proof",
  proof_started: "Proof started",
  proof_submitted: "Proof submitted",
  proof_failed: "Proof failed",
  verified: "Proof verified",
  settled: "Funds released",
  expired: "Deadline passed",
  refunded: "Refunded to payer",
  disputed: "Dispute opened",
  resolved: "Dispute resolved",
};
const EVENT_TONE: Record<string, TimelineItem["tone"]> = { settled: "ok", resolved: "ok", verified: "info", funded: "info", proof_failed: "bad", disputed: "bad", expired: "warn", proof_started: "warn", refunded: "mute", task_created: "mute", awaiting_proof: "info", proof_submitted: "warn" };

async function call(path: string, body?: unknown, key?: string) {
  const r = await fetch(path, { method: "POST", headers: { "content-type": "application/json", ...(key ? { "idempotency-key": key } : {}) }, body: JSON.stringify(body ?? {}) });
  const j = await r.json();
  if (!r.ok) throw Object.assign(new Error(j.error?.message ?? "Request failed"), { recovery: j.error?.recovery as string | undefined });
  return j;
}

export function TaskDetailView({ data }: { data: DetailData }) {
  const { task, worker, events, attestations, ledger } = data;
  const { role, mode } = useApp();
  const router = useRouter();
  const [dlg, setDlg] = useState<null | "fund" | "prove" | "refund" | "dispute" | "resolve" | "ff">(null);
  const a = splitAmount(task.amount);
  const done = isTerminal(task.state);
  const lastFail = [...events].reverse().find((e) => e.type === "proof_failed");

  const refresh = () => router.refresh();
  const fund = useMutation({ mutationFn: () => call(`/api/tasks/${task.id}/fund`, {}, `fund-${task.id}`), onSuccess: () => { toast.success("Escrow funded", { description: `${a.whole}${a.dec} USDC locked (simulated).` }); markOnboarding("fund"); setDlg(null); refresh(); }, onError: (e: Error) => toast.error("Couldn’t fund the escrow", { description: e.message }) });
  const refund = useMutation({ mutationFn: () => call(`/api/tasks/${task.id}/refund`, {}, `refund-${task.id}`), onSuccess: () => { toast.success("Refunded to payer"); setDlg(null); refresh(); }, onError: (e: Error) => toast.error("Couldn’t refund", { description: e.message }) });
  const ff = useMutation({ mutationFn: () => call(`/api/tasks/${task.id}/expire`, { force: true }), onSuccess: () => { toast.message("Deadline fast-forwarded", { description: "Simulation only. The task is now expired." }); setDlg(null); refresh(); }, onError: (e: Error) => toast.error("Couldn’t fast-forward", { description: e.message }) });

  const primary = (() => {
    if (role === "auditor") return null;
    if (task.state === "draft" && role === "payer") return { label: "Fund escrow", icon: Wallet, on: () => setDlg("fund") };
    if (["awaiting_proof", "funded"].includes(task.state) && role === "worker") return { label: "Generate proof", icon: Fingerprint, on: () => setDlg("prove") };
    if (task.state === "expired" && role === "payer") return { label: "Refund to payer", icon: Undo2, on: () => setDlg("refund") };
    if (task.state === "disputed" && role === "payer") return { label: "Resolve dispute", icon: Gavel, on: () => setDlg("resolve") };
    return null;
  })();
  const waiting = !primary && !done && role !== "auditor" ? (task.state === "draft" ? "Waiting for the payer to fund" : ["awaiting_proof", "funded"].includes(task.state) ? "Waiting for the worker’s proof" : task.state === "expired" ? "Waiting for the payer to refund" : task.state === "disputed" ? "Waiting for the arbiter" : null) : null;

  const timeline: TimelineItem[] = events.map((e) => ({
    id: e.id,
    title: EVENT_TITLE[e.type] ?? e.type.replace(/_/g, " "),
    meta: `${e.actorName}${e.actorRole === "system" ? "" : ` · ${e.actorRole}`}`,
    note: e.note,
    tx: e.txHash,
    simulated: task.mode === "simulation",
    tone: EVENT_TONE[e.type] ?? "mute",
    time: <Time value={e.at} />,
  }));

  return (
    <div className="grid gap-5">
      {/* header */}
      <section className="relative overflow-hidden rounded-stage bg-raised shadow-raised">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_120%_at_100%_0%,var(--light-quiet),transparent_60%)]" />
        <div className="relative grid gap-5 p-5 sm:p-6 lg:grid-cols-[1fr_auto] lg:items-start">
          <div className="grid gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <StatusChip state={task.state} />
              <ModeBadge mode={task.mode} />
              <span className="mono text-[12px] text-text-3">{task.id}</span>
            </div>
            <h1 className="text-[30px] leading-[1.05] font-semibold tracking-[-0.035em] [font-variation-settings:'wdth'_114]">{task.title}</h1>
            <p className="max-w-[62ch] text-[15px] text-text-2">
              Release <strong className="num font-semibold text-text">{a.whole}{a.dec} USDC</strong> to <strong className="font-semibold text-text">{worker.name}</strong> when{" "}
              <span className="rounded-[6px] bg-sunk px-1.5 py-0.5 font-medium text-text">{conditionText(task.condition)}</span> by <strong className="font-semibold text-text">{absoluteDateTime(task.deadline).replace(/, \d\d:\d\d.*/, "")}</strong>.
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-text-2">
              <span className="inline-flex items-center gap-2"><Identicon name={task.payer} hue={250} size={22} /> {task.payer} <span className="text-text-3">payer</span></span>
              <ArrowRight className="size-3.5 text-text-3" aria-hidden />
              <Link href={`/app/workers?w=${worker.id}`} className="inline-flex items-center gap-2 hover:text-text"><Identicon name={worker.name} hue={worker.hue} size={22} /> {worker.name} <span className="text-text-3">{worker.kind}</span></Link>
              <span className="inline-flex items-center gap-1.5 text-text-3"><CalendarClock className="size-3.5" /> Deadline <Time value={task.deadline} className="font-medium text-text-2" /></span>
            </div>
          </div>
          <div className="grid gap-3 lg:justify-items-end">
            <div className="flex items-center gap-3">
              <TokenOnChain size={30} />
              <Amount whole={a.whole} dec={a.dec} unit="USDC" size="lg" className="text-[34px] leading-none font-semibold tracking-[-0.035em] [font-variation-settings:'wdth'_108]" />
            </div>
            <div className="flex flex-wrap items-center gap-2 lg:justify-end">
              {primary ? (
                <Button variant="primary" size="lg" onClick={primary.on}>
                  <primary.icon className="size-4" /> {primary.label}
                </Button>
              ) : waiting ? (
                <span className="text-[13px] text-text-3">{waiting}</span>
              ) : role === "auditor" ? (
                <Chip tone="mute">Read-only (auditor view)</Chip>
              ) : null}
              {role !== "auditor" && !done && (
                <Menu>
                  <MenuTrigger asChild>
                    <Button variant="secondary" size="icon" aria-label="More actions"><MoreHorizontal className="size-4" /></Button>
                  </MenuTrigger>
                  <MenuContent>
                    <MenuItem icon={<Gavel className="size-4" />} onSelect={() => setDlg("dispute")}>Open a dispute</MenuItem>
                    {task.mode === "simulation" && (
                      <>
                        <MenuSeparator />
                        <MenuItem icon={<FastForward className="size-4" />} onSelect={() => setDlg("ff")}>Fast-forward to deadline <SimTag className="ml-1" /></MenuItem>
                      </>
                    )}
                  </MenuContent>
                </Menu>
              )}
            </div>
          </div>
        </div>
        <div className="relative border-t border-line bg-lift/60 px-5 py-4 sm:px-6">
          <StateRail state={task.state} />
        </div>
      </section>

      {role === "auditor" && <Callout tone="info" title="You are viewing as an auditor">Actions are hidden. You can read the proof, the timeline and the ledger.</Callout>}
      {lastFail && task.state === "awaiting_proof" && (
        <Callout tone="warn" title="The last proof failed" action={<Button size="sm" variant="secondary" onClick={() => document.getElementById("tab-proof")?.click()}>See why</Button>}>
          {lastFail.note} The worker can try again until the deadline.
        </Callout>
      )}

      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0 rounded-panel bg-raised shadow-raised">
          <Tabs defaultValue="overview" className="px-1">
            <TabsList className="px-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="proof" count={attestations.length}><span id="tab-proof">Proof</span></TabsTrigger>
              <TabsTrigger value="activity" count={events.length}>Activity</TabsTrigger>
              <TabsTrigger value="ledger" count={ledger.length}>Ledger entries</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            <div className="px-4 pb-5">
              <TabsContent value="overview">
                <h2 className="mb-4 text-[14px] font-semibold">Settlement timeline</h2>
                <Timeline items={timeline} />
              </TabsContent>
              <TabsContent value="proof">
                <ProofTab data={data} onProve={role === "worker" && ["awaiting_proof", "funded"].includes(task.state) ? () => setDlg("prove") : undefined} />
              </TabsContent>
              <TabsContent value="activity">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[560px] text-[13.5px]">
                    <thead className="text-left text-[12px] text-text-3"><tr><th className="pb-2 font-medium">When</th><th className="pb-2 font-medium">Event</th><th className="pb-2 font-medium">Actor</th><th className="pb-2 font-medium">Transition</th><th className="pb-2 font-medium">Tx</th></tr></thead>
                    <tbody>
                      {[...events].reverse().map((e) => (
                        <tr key={e.id} className="border-t border-line align-top">
                          <td className="py-2.5 pr-4 text-text-2"><Time value={e.at} /></td>
                          <td className="py-2.5 pr-4 font-medium">{EVENT_TITLE[e.type] ?? e.type}</td>
                          <td className="py-2.5 pr-4 text-text-2">{e.actorName}</td>
                          <td className="py-2.5 pr-4 text-text-2">{e.from ? `${STATE_LABEL[e.from]} → ` : ""}{e.to ? STATE_LABEL[e.to] : "—"}</td>
                          <td className="py-2.5">{e.txHash ? <Hash value={e.txHash} head={8} tail={6} /> : <span className="text-text-3">—</span>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
              <TabsContent value="ledger">
                {ledger.length === 0 ? (
                  <EmptyState title="No ledger entries yet" body="Entries appear when the escrow is funded, and again on release or refund." className="rounded-panel" />
                ) : (
                  <table className="w-full text-[13.5px]">
                    <thead className="text-left text-[12px] text-text-3"><tr><th className="pb-2 font-medium">When</th><th className="pb-2 font-medium">Entry</th><th className="pb-2 font-medium">From → to</th><th className="pb-2 text-right font-medium">Amount</th></tr></thead>
                    <tbody>
                      {ledger.map((l) => (
                        <tr key={l.id} className="border-t border-line">
                          <td className="py-2.5 text-text-2"><Time value={l.at} /></td>
                          <td className="py-2.5 font-medium">{l.kind === "escrow_in" ? "Escrow in" : l.kind === "release" ? "Release" : l.kind === "refund" ? "Refund" : "Fee"}</td>
                          <td className="py-2.5 text-text-2">{l.debit} → {l.credit}</td>
                          <td className="num py-2.5 text-right">{l.kind === "escrow_in" ? "+" : "−"}{splitAmount(l.amount).whole}<span className="text-text-3">{splitAmount(l.amount).dec}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </TabsContent>
              <TabsContent value="settings">
                <div className="grid max-w-[560px] gap-5">
                  <div className="grid gap-1"><h3 className="text-[14px] font-semibold">Refund policy</h3><p className="text-[13.5px] text-text-2">{task.refundPolicy === "auto" ? "Automatic: after the deadline, the payer can refund in one step." : "Payer approval: the payer must approve any refund."}</p></div>
                  <div className="grid gap-1"><h3 className="text-[14px] font-semibold">Webhooks</h3><p className="text-[13.5px] text-text-2">Events for this task are sent to your workspace webhooks. See Settings → Webhooks.</p></div>
                  <Callout tone="sim" title="Simulation controls">
                    In Simulation you can fast-forward a task to its deadline to see the expiry and refund path.
                    <div className="mt-2"><Button size="sm" variant="secondary" disabled={done || task.mode !== "simulation"} onClick={() => setDlg("ff")}><FastForward className="size-3.5" /> Fast-forward to deadline</Button></div>
                  </Callout>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <aside className="grid content-start gap-4">
          <section className="rounded-panel bg-raised p-4 shadow-raised">
            <h2 className="text-[14px] font-semibold">The rule</h2>
            <dl className="mt-3 grid gap-3 text-[13px]">
              <Row label="Source">{task.condition.sourceName}</Row>
              <Row label="Request"><span className="mono break-all text-[12px] text-text-2">GET {task.condition.url.replace("https://", "")}</span></Row>
              <Row label="Reads"><span className="mono text-[12px] text-text-2">{task.condition.jsonPath}</span></Row>
              <Row label="Condition"><span className="font-medium">{task.condition.metric} {OP_LABEL[task.condition.op]} {task.condition.threshold}{task.condition.unit ? ` ${task.condition.unit}` : ""}</span></Row>
              <Row label="Discloses">{task.condition.disclosure === "threshold" ? "Only true or false" : task.condition.disclosure === "hash" ? "A hash of the value" : "The value"}</Row>
              <Row label="Rule hash"><Hash value={task.conditionHash} head={10} tail={6} /></Row>
            </dl>
          </section>
          <section className="rounded-panel bg-raised p-4 shadow-raised">
            <h2 className="flex items-center gap-2 text-[14px] font-semibold"><ShieldCheck className="size-4 text-info" /> Trust Model</h2>
            <p className="mt-2 text-[13px] text-text-2">A proof shows the source returned this response. It does not show the source is right, or that the work was done.</p>
            <Link href="/app/settings#trust-model" className="mt-2 inline-flex items-center gap-1 text-[13px] font-medium text-light-text hover:underline">Read the Trust Model <ChevronRight className="size-3.5" /></Link>
          </section>
          <section className="rounded-panel bg-raised p-4 shadow-raised">
            <h2 className="text-[14px] font-semibold">Share</h2>
            <div className="mt-2"><CopyField value={`/app/tasks/${task.id}`} label="Task link" /></div>
            <p className="mt-2 flex items-center gap-1.5 text-[12px] text-text-3"><Link2 className="size-3" /> Opens the demo workspace.</p>
          </section>
        </aside>
      </div>

      <Confirm
        open={dlg === "fund"}
        onOpenChange={(o) => !o && setDlg(null)}
        title="Fund the escrow?"
        description={`${a.whole}${a.dec} mock USDC will be locked until a valid proof arrives or the deadline passes. In Simulation, no real funds move.`}
        confirmLabel="Fund escrow"
        danger={false}
        loading={fund.isPending}
        onConfirm={() => fund.mutate()}
      />
      <Confirm open={dlg === "refund"} onOpenChange={(o) => !o && setDlg(null)} title="Refund the escrow to the payer?" description="The locked funds return to the payer. The task will be closed as refunded." confirmLabel="Refund" loading={refund.isPending} onConfirm={() => refund.mutate()} />
      <Confirm open={dlg === "ff"} onOpenChange={(o) => !o && setDlg(null)} title="Fast-forward to the deadline?" description="This marks the deadline as passed so you can try expiry and refund. It only exists in Simulation." confirmLabel="Fast-forward" danger={false} loading={ff.isPending} onConfirm={() => ff.mutate()} />
      <ProofDialog open={dlg === "prove"} onOpenChange={(o) => !o && setDlg(null)} task={task} worker={worker} onDone={() => { setDlg(null); refresh(); }} />
      <DisputeDialog open={dlg === "dispute"} onOpenChange={(o) => !o && setDlg(null)} task={task} onDone={() => { setDlg(null); refresh(); }} />
      <ResolveDialog open={dlg === "resolve"} onOpenChange={(o) => !o && setDlg(null)} task={task} onDone={() => { setDlg(null); refresh(); }} />
      <span className="hidden" aria-hidden>{mode}</span>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[84px_1fr] items-baseline gap-3">
      <dt className="text-text-3">{label}</dt>
      <dd className="min-w-0">{children}</dd>
    </div>
  );
}

function ProofTab({ data, onProve }: { data: DetailData; onProve?: () => void }) {
  const { attestations, task } = data;
  if (attestations.length === 0)
    return (
      <EmptyState
        title="No proof yet"
        body={task.state === "draft" ? "Fund the escrow first. Then the worker can generate a proof." : "When the worker proves the condition, the attestation appears here with its six checks."}
        action={onProve ? <Button variant="primary" onClick={onProve}><Fingerprint className="size-4" /> Generate proof</Button> : undefined}
        className="rounded-panel"
      />
    );
  return (
    <div className="grid gap-3">
      {onProve && <div className="flex justify-end"><Button variant="secondary" size="sm" onClick={onProve}><Fingerprint className="size-4" /> Try another proof</Button></div>}
      {attestations.map(({ attestation: att, ok, verification }) => {
        const err = verification?.error ? PROOF_ERRORS[verification.error] : null;
        return (
          <div key={att.id} className="rounded-panel bg-sunk p-4">
            <div className="flex flex-wrap items-center gap-2">
              {ok === null ? <Chip tone="warn">Waiting for verification</Chip> : ok ? <Chip tone="ok">Verified</Chip> : <Chip tone="bad">{err?.title ?? "Failed"}</Chip>}
              {att.simulated && <SimTag label="Simulated proof" />}
              <span className="mono text-[12px] text-text-3">{att.id}</span>
              <span className="ml-auto text-[12.5px] text-text-3"><Time value={att.createdAt} /></span>
            </div>
            {verification && (
              <ul className="mt-3 grid gap-1 sm:grid-cols-2">
                {verification.steps.map((s) => (
                  <li key={s.id} className={cn("flex items-center gap-2 text-[13px]", s.ok ? "text-text-2" : "font-medium text-bad")}>
                    <span className={cn("grid size-4 place-items-center rounded-full text-[10px]", s.ok ? "bg-ok-quiet text-ok" : "bg-bad-quiet text-bad")}>{s.ok ? "✓" : "✕"}</span>
                    {s.label}
                  </li>
                ))}
              </ul>
            )}
            {err && <p className="mt-3 text-[13px] text-text-2"><strong className="font-medium text-text">{err.title}.</strong> {err.body} {err.recovery}</p>}
            <Link href={`/app/proofs/${att.id}`} className="mt-3 inline-flex items-center gap-1 text-[13px] font-medium text-light-text hover:underline">Open in Proof Inspector <ChevronRight className="size-3.5" /></Link>
          </div>
        );
      })}
    </div>
  );
}

function ProofDialog({ open, onOpenChange, task, worker, onDone }: { open: boolean; onOpenChange: (o: boolean) => void; task: Task; worker: Worker; onDone: () => void }) {
  const router = useRouter();
  const c = task.condition;
  const passValue = c.op.startsWith("<") ? c.threshold - Math.max(1, Math.round(c.threshold * 0.1)) : c.threshold + Math.max(1, Math.round(c.threshold * 0.15));
  const failValue = c.op.startsWith("<") ? c.threshold + Math.max(1, Math.round(c.threshold * 0.2)) : c.threshold - Math.max(1, Math.round(c.threshold * 0.2));
  const [fail, setFail] = useState(false);
  const [value, setValue] = useState<number | "">("");
  const v = value === "" ? (fail ? failValue : passValue) : value;
  const [err, setErr] = useState<{ code: ProofErrorCode; msg: string } | null>(null);
  const live = task.mode === "live";
  const m = useMutation({
    mutationFn: async () => {
      // Live: the Primus extension makes the proof in this browser; we only forward what it returns.
      if (live) return call(`/api/tasks/${task.id}/proof`, { attestation: await runPrimusAttestation(task.id), actor: worker.name }, crypto.randomUUID());
      return call(`/api/tasks/${task.id}/proof`, { value: v, actor: worker.name }, crypto.randomUUID());
    },
    onSuccess: (r: { attestationId: string; settled: boolean; verification: VerificationResult }) => {
      markOnboarding("prove");
      if (r.settled) {
        toast.success("Proof verified. Funds released.", { description: `${worker.name} was paid (simulated).` });
        router.push(`/app/proofs/${r.attestationId}?just=1`);
        onDone();
      } else {
        const code = (r.verification.error ?? "proof_invalid") as ProofErrorCode;
        setErr({ code, msg: r.verification.steps.find((s) => !s.ok)?.detail ?? "" });
        toast.error(PROOF_ERRORS[code].title, { description: "The task stays open. You can try again." });
        router.refresh();
      }
    },
    onError: (e: Error & { recovery?: string }) => setErr({ code: "network_error", msg: e.message }),
  });
  return (
    <Modal
      open={open}
      onOpenChange={(o) => { onOpenChange(o); if (!o) setErr(null); }}
      title="Generate a proof"
      description={live ? `Prove ${conditionText(c)} with Primus. The proof is made in your browser by the Primus extension.` : `As ${worker.name}, attest what the source reports. The rule needs ${conditionText(c)}.`}
      footer={<><Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button><Button variant="primary" loading={m.isPending} onClick={() => { setErr(null); m.mutate(); }}><Fingerprint className="size-4" /> {live ? "Start Primus attestation" : "Generate and verify"}</Button></>}
    >
      <div className="grid gap-4">
        {live ? (
          <>
            <Callout tone="info" title="Live, on Base Sepolia (testnet)">
              The Primus browser extension opens the data source, runs the TLS session and returns a signed attestation. We re-check it with the same six checks before releasing anything.
            </Callout>
            <ol className="grid gap-1.5 pl-5 text-[13.5px] text-text-2 [&_li]:list-decimal">
              <li>Install the Primus extension if you have not.</li>
              <li>Press Start. Approve the request in the extension.</li>
              <li>Wait for the attestation. Do not close this window.</li>
            </ol>
          </>
        ) : (
          <>
        <Callout tone="sim" title="Simulation">
          The demo source reports the value below. The proof is signed by a local test attestor and labelled as synthetic. The checks run exactly as in Live.
        </Callout>
        <Field label={`What the source reports for “${c.metric}”`} hint={`Rule: ${conditionText(c)}. Only the result (true or false) is disclosed to the verifier.`}>
          <NumberInput value={value === "" ? v : value} onChange={setValue} unit={c.unit} />
        </Field>
        <label className="flex items-center gap-3 text-[13.5px]">
          <Switch checked={fail} onCheckedChange={(b) => { setFail(b); setValue(""); }} label="Make the proof fail" />
          Try a proof that does not meet the rule
        </label>
          </>
        )}
        {err && (
          <div role="alert" className="rounded-panel bg-bad-quiet p-3.5 text-[13px] text-bad">
            <p className="font-semibold">{PROOF_ERRORS[err.code].title}</p>
            <p className="mt-0.5 opacity-90">{err.msg || PROOF_ERRORS[err.code].body}</p>
            <p className="mt-1 font-medium">{PROOF_ERRORS[err.code].recovery}</p>
          </div>
        )}
      </div>
    </Modal>
  );
}

function DisputeDialog({ open, onOpenChange, task, onDone }: { open: boolean; onOpenChange: (o: boolean) => void; task: Task; onDone: () => void }) {
  const [note, setNote] = useState("");
  const m = useMutation({ mutationFn: () => call(`/api/tasks/${task.id}/dispute`, { note }), onSuccess: () => { toast.message("Dispute opened", { description: "An arbiter will decide." }); onDone(); }, onError: (e: Error) => toast.error("Couldn’t open the dispute", { description: e.message }) });
  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Open a dispute" description="Freezes the escrow until an arbiter decides. Use it when you believe the source or the proof is wrong." footer={<><Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button><Button variant="danger" loading={m.isPending} disabled={note.trim().length < 3} onClick={() => m.mutate()}>Open dispute</Button></>}>
      <Field label="What is wrong?" hint="The arbiter and the other party will see this.">
        <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="The source reported stale numbers at the deadline…" />
      </Field>
    </Modal>
  );
}

function ResolveDialog({ open, onOpenChange, task, onDone }: { open: boolean; onOpenChange: (o: boolean) => void; task: Task; onDone: () => void }) {
  const [outcome, setOutcome] = useState<"release" | "refund">("release");
  const [note, setNote] = useState("");
  const m = useMutation({ mutationFn: () => call(`/api/tasks/${task.id}/resolve`, { outcome, note }), onSuccess: () => { toast.success("Dispute resolved"); onDone(); }, onError: (e: Error) => toast.error("Couldn’t resolve", { description: e.message }) });
  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Resolve the dispute" description="In Simulation you act as the arbiter. In Live, a designated arbiter address resolves on-chain." footer={<><Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button><Button variant="primary" loading={m.isPending} onClick={() => m.mutate()}>Resolve</Button></>}>
      <div className="grid gap-4">
        <RadioCards value={outcome} onValueChange={setOutcome} options={[{ value: "release", title: "Release to the worker", body: "The work counts. Funds go to the worker." }, { value: "refund", title: "Refund the payer", body: "The condition was not met. Funds go back." }]} />
        <Field label="Note" optional><Textarea value={note} onChange={(e) => setNote(e.target.value)} className="min-h-[64px]" /></Field>
      </div>
    </Modal>
  );
}

export { STATE_TONE };

"use client";

import { Check, ChevronRight, CircleAlert, Eye, EyeOff, Fingerprint, LoaderCircle, Lock, RotateCcw } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Chip, SimTag } from "@/components/ui/chips";
import { Hash, Time } from "@/components/ui/copy";
import { JsonViewer } from "@/components/ui/json-viewer";
import { Tip } from "@/components/ui/overlay";
import { Callout } from "@/components/ui/feedback";
import { attestationDigest, encodeRequest } from "@/lib/domain/attestation";
import { conditionText } from "@/lib/domain/condition";
import { PROOF_ERRORS } from "@/lib/domain/errors";
import type { Attestation, Task, VerificationResult, Worker } from "@/lib/domain/types";
import { absoluteDateTime, splitAmount } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useApp } from "./context";
import { TrustModel } from "./trust-model";

const EXPLAIN: Record<string, string> = {
  recipient: "The address this proof was issued to. The escrow only pays this address.",
  request: "The request the attestor made to the source on the worker’s behalf: URL, headers, method and body.",
  "request.url": "The source. The escrow compares this with the URL committed when the task was created.",
  "request.header": "Request headers. Secrets are masked before signing.",
  "request.method": "HTTP method of the attested request.",
  "request.body": "Request body, if any.",
  responseResolve: "Which part of the response was read: a key name, how to parse it, and where to find it (JSON path).",
  data: "What the verifier is told. For a threshold rule this is only true or false, never the raw value.",
  attConditions: "The rule that was applied inside the attestation, as Primus conditions: field, operator, value.",
  timestamp: "When the attestation was created (unix seconds). The escrow checks it falls inside the task’s window.",
  additionParams: "Extra data the caller bound into the signature. ProofPay puts the task id and rule hash here so the proof cannot be reused elsewhere.",
  attestors: "Who signed. Only attestors registered with the verifier are accepted.",
  attestorAddr: "The signer’s address, recovered from the signature and checked against the registered list.",
  signatures: "The attestor’s signature over the digest of the fields above.",
  digest: "keccak256 over the signed fields. Used to detect replay: each digest can settle once.",
  simulated: "True in Simulation. The attestor is a local test key, not Primus.",
  mode: "Simulation or Live.",
};

export function ProofInspector({ att, ok, verification, task, worker, just }: { att: Attestation; ok: boolean | null; verification: VerificationResult | null; task: Task; worker: Worker; just: boolean }) {
  const { role } = useApp();
  const [reveal, setReveal] = useState(false);
  const data = safeJson(att.data);
  const publicAtt = (() => {
    const { privateFields: _p, ...rest } = att;
    void _p;
    return rest;
  })();
  const priv = att.privateFields;
  const canSee = role === "worker" || reveal;
  const a = splitAmount(task.amount);
  const err = verification?.error ? PROOF_ERRORS[verification.error] : null;
  const claimTrue = Object.values(data).some((v) => v === "true" || v === true);

  return (
    <div className="grid gap-5">
      {/* summary */}
      <section className="rounded-stage bg-raised p-5 shadow-raised">
        <div className="flex flex-wrap items-center gap-2">
          {ok === null ? <Chip tone="warn" icon={LoaderCircle}>Waiting for verification</Chip> : ok ? <Chip tone="ok" icon={Check}>Verified</Chip> : <Chip tone="bad" icon={CircleAlert}>{err?.title ?? "Failed"}</Chip>}
          {att.simulated && <SimTag label="Simulated proof, not a Primus attestation" />}
          <span className="mono text-[12px] text-text-3">{att.id}</span>
          <span className="ml-auto text-[12.5px] text-text-3">Issued <Time value={att.createdAt} /></span>
        </div>
        <p className="mt-3 text-[15px] text-text-2">
          For <Link href={`/app/tasks/${task.id}`} className="font-semibold text-text hover:text-light-text">{task.title}</Link>: release <span className="num font-medium text-text">{a.whole}{a.dec} USDC</span> to {worker.name} when{" "}
          <span className="rounded-[6px] bg-sunk px-1.5 py-0.5 font-medium text-text">{conditionText(task.condition)}</span>.
        </p>
      </section>

      {/* X-ray */}
      <section aria-label="Proof X-ray" className="relative overflow-hidden rounded-stage bg-raised shadow-raised">
        <div aria-hidden className="dots pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(70%_70%_at_50%_30%,#000,transparent)]" />
        <div className="relative grid lg:grid-cols-3">
          <Column n={1} title="What the source saw" sub={canSee ? "Worker’s private view" : "Private to the worker"} action={role !== "worker" && <Button size="xs" variant="secondary" onClick={() => setReveal((r) => !r)}>{reveal ? <EyeOff className="size-3" /> : <Eye className="size-3" />} {reveal ? "Hide" : "Reveal (Simulation)"}</Button>}>
            <KV k="Request" v={<span className="mono text-[12px] break-all">{att.request.method} {att.request.url.replace("https://", "")}</span>} />
            <KV k="Transport" v={<span>TLS 1.3 · 200 OK <SimTag label="session simulated" className="ml-1" /></span>} />
            <KV k="Auth" v={<span className="mono text-[12px]">Bearer ••••••••</span>} />
            <div className="mt-3 rounded-panel bg-sunk p-3">
              <p className="mb-2 text-[12px] font-medium text-text-3">Response body</p>
              <ul className="grid gap-2 text-[13px]">
                {priv.map((f) => (
                  <li key={f.key} className="flex items-center gap-3">
                    <span className="mono w-[110px] shrink-0 truncate text-[12px] text-text-3">{f.key}</span>
                    {canSee ? <span className="num font-medium">{f.value}</span> : <Redacted w={f.key.length * 7 + 24} />}
                    {!canSee && <Lock className="ml-auto size-3.5 text-text-3" aria-label="private" />}
                  </li>
                ))}
              </ul>
            </div>
            <p className="mt-3 text-[12.5px] text-text-3">ProofPay never stores these fields. {att.simulated ? "They are kept on the worker side of the simulation only." : ""}</p>
          </Column>

          <Column n={2} title="What the attestor signed" sub="Public. Checked by the escrow" divider>
            <KV k="recipient" tip={EXPLAIN.recipient} v={<Hash value={att.recipient} head={8} tail={6} />} />
            <KV k="request" tip={EXPLAIN.request} v={<Hash value={encodeRequest(att.request)} head={8} tail={6} />} />
            <KV k="resolve" tip={EXPLAIN.responseResolve} v={<span className="mono text-[12px]">{att.responseResolve.map((r) => `${r.keyName} ← ${r.parsePath}`).join(", ")}</span>} />
            <KV k="data" tip={EXPLAIN.data} v={<span className="mono text-[12px]">{att.data}</span>} />
            <KV k="attConditions" tip={EXPLAIN.attConditions} v={<span className="mono text-[12px] break-all">{att.attConditions}</span>} />
            <KV k="timestamp" tip={EXPLAIN.timestamp} v={<span className="num">{absoluteDateTime(att.timestamp * 1000)}</span>} />
            <KV k="additionParams" tip={EXPLAIN.additionParams} v={<span className="mono text-[12px] break-all">{att.additionParams}</span>} />
            <KV k="attestor" tip={EXPLAIN.attestorAddr} v={<span className="inline-flex flex-wrap items-center gap-1"><Hash value={att.attestors[0]?.attestorAddr ?? ""} head={8} tail={6} />{att.simulated && <SimTag label="test key" />}</span>} />
            <KV k="signature" tip={EXPLAIN.signatures} v={<Hash value={att.signatures[0] ?? ""} head={10} tail={6} />} />
            <KV k="digest" tip={EXPLAIN.digest} v={<Hash value={att.digest} head={10} tail={6} />} />
            <KV k="TEE" v={<span className="text-text-3">{att.simulated ? "Not applicable in Simulation" : "As documented by Primus"}</span>} />
            <p className="mt-3 text-[12.5px] text-text-3">Digest recomputed in your browser: <span className="mono">{attestationDigest(att).slice(0, 10)}…{attestationDigest(att) === att.digest ? " matches" : " does not match"}</span></p>
          </Column>

          <Column n={3} title="What the verifier learns" sub="All the escrow needs" divider last>
            <div className={cn("rounded-panel p-4", claimTrue ? "bg-[linear-gradient(180deg,var(--light-hi),var(--light))] text-on-light shadow-[0_0_30px_-8px_var(--light-glow)]" : "bg-bad-quiet text-bad")}>
              <p className="text-[12px] font-medium opacity-80">Disclosed claim</p>
              <p className="mt-1 text-[22px] leading-tight font-semibold tracking-[-0.02em]">{conditionText(task.condition)}</p>
              <p className="mt-2 inline-flex items-center gap-1.5 text-[15px] font-semibold">
                {claimTrue ? <Check className="size-4" strokeWidth={3} /> : <CircleAlert className="size-4" />} {claimTrue ? "true" : "false"}
              </p>
            </div>
            <div className="mt-3 rounded-panel bg-sunk p-3">
              <p className="mb-2 text-[12px] font-medium text-text-3">Hidden from the verifier</p>
              <ul className="grid gap-2">
                {priv.filter((f) => f.key !== task.condition.metric).map((f) => (
                  <li key={f.key}><Redacted w={80 + (f.value.length % 5) * 14} /></li>
                ))}
                <li><Redacted w={64} /></li>
              </ul>
              <p className="mt-2.5 text-[12.5px] text-text-3">The verifier sees neither these fields nor their names, and not even the raw value of {task.condition.metric}.</p>
            </div>
          </Column>
        </div>
      </section>

      {/* verification */}
      <VerifyChecklist verification={verification} animate={just || ok === null} task={task} att={att} />

      <JsonViewer value={publicAtt} explain={EXPLAIN} title="Raw attestation" badge={att.simulated ? <SimTag className="ml-1" /> : undefined} />

      <section className="rounded-stage bg-raised p-5 shadow-raised">
        <h2 className="mb-3 text-[14px] font-semibold">Trust Model</h2>
        <TrustModel mode={att.mode} />
      </section>
    </div>
  );
}

function Column({ n, title, sub, children, action, divider, last }: { n: number; title: string; sub: string; children: React.ReactNode; action?: React.ReactNode; divider?: boolean; last?: boolean }) {
  return (
    <div className={cn("relative p-5", divider && "border-t border-line lg:border-l lg:border-t-0")}>
      {divider && (
        <span aria-hidden className="absolute -top-[9px] left-1/2 z-[2] grid size-[18px] -translate-x-1/2 place-items-center rounded-full bg-light text-on-light shadow-[0_0_0_4px_var(--raised)] lg:left-0 lg:top-9 lg:-translate-x-1/2">
          <ChevronRight className="size-3 rotate-90 lg:rotate-0" strokeWidth={3} />
        </span>
      )}
      <div className="mb-3 flex items-start gap-3">
        <span className="num grid size-6 shrink-0 place-items-center rounded-full bg-sunk text-[12px] font-semibold text-text-2">{n}</span>
        <div className="grid flex-1 gap-0.5">
          <h2 className="text-[16px] leading-tight font-semibold tracking-[-0.02em]">{title}</h2>
          <p className="text-[12.5px] text-text-3">{sub}</p>
        </div>
        {action}
      </div>
      <div className="grid gap-2.5">{children}</div>
      {last && null}
    </div>
  );
}

function KV({ k, v, tip }: { k: string; v: React.ReactNode; tip?: string }) {
  return (
    <div className="grid grid-cols-[104px_1fr] items-baseline gap-3 text-[13px]">
      <dt className="text-text-3">{tip ? <Tip content={tip}><span tabIndex={0} className="cursor-help underline decoration-dotted decoration-text-3 underline-offset-4">{k}</span></Tip> : k}</dt>
      <dd className="min-w-0">{v}</dd>
    </div>
  );
}

function Redacted({ w }: { w: number }) {
  return <span className="inline-block h-[14px] rounded-[4px] bg-text align-middle opacity-90" style={{ width: w }} role="img" aria-label="redacted" />;
}

function VerifyChecklist({ verification, animate, task, att }: { verification: VerificationResult | null; animate: boolean; task: Task; att: Attestation }) {
  const reduced = useReducedMotion();
  const steps = verification?.steps ?? [];
  const [shown, setShown] = useState(animate && !reduced ? 0 : steps.length);
  const [run, setRun] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const play = useCallback(() => {
    clearTimeout(timer.current);
    setShown(0);
    setRun((r) => r + 1);
  }, []);
  useEffect(() => {
    if (!steps.length) return;
    if ((!animate && run === 0) || reduced) {
      setShown(steps.length);
      return;
    }
    let i = 0;
    const tick = () => {
      i++;
      setShown(i);
      if (i < steps.length) timer.current = setTimeout(tick, 380);
    };
    timer.current = setTimeout(tick, 420);
    return () => clearTimeout(timer.current);
  }, [run, steps.length, animate, reduced]);
  if (!verification)
    return (
      <Callout tone="warn" title="This proof has not been verified yet">The worker submitted it and the escrow is waiting to run the six checks.</Callout>
    );
  const finished = shown >= steps.length;
  const failed = steps.slice(0, shown).find((s) => !s.ok);
  return (
    <section aria-label="Verification checklist" className="rounded-stage bg-raised p-5 shadow-raised">
      <div className="flex items-center gap-3">
        <h2 className="flex items-center gap-2 text-[15px] font-semibold"><Fingerprint className="size-4 text-text-2" /> Verification</h2>
        <span className="text-[12.5px] text-text-3">Six checks, the same ones the escrow contract runs</span>
        <Button variant="ghost" size="xs" className="ml-auto" onClick={play}><RotateCcw className="size-3" /> Replay</Button>
      </div>
      <ol className="mt-4 grid gap-1">
        {steps.map((s, i) => {
          const state = i < shown ? (s.ok ? "ok" : "bad") : i === shown && !finished && !failed ? "run" : "idle";
          return (
            <motion.li key={s.id} initial={false} animate={{ opacity: state === "idle" ? 0.45 : 1 }} transition={{ duration: 0.16 }} className="grid grid-cols-[22px_1fr] gap-3 rounded-control px-2 py-2">
              <span className={cn("mt-0.5 grid size-[22px] place-items-center rounded-full text-[11px] transition-colors duration-150", state === "ok" && "bg-ok text-white", state === "bad" && "bg-bad text-white", state === "run" && "bg-light-quiet text-light-text", state === "idle" && "bg-sunk text-text-3 shadow-[0_0_0_1px_var(--line-strong)_inset]")}>
                {state === "ok" ? <Check className="size-3.5" strokeWidth={3} /> : state === "bad" ? "✕" : state === "run" ? <LoaderCircle className="size-3.5 animate-spin" /> : i + 1}
              </span>
              <span className="grid gap-0.5">
                <span className={cn("text-[14px] font-medium", state === "bad" && "text-bad")}>{s.label}</span>
                {(state === "ok" || state === "bad") && <motion.span initial={reduced ? false : { opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.16 }} className={cn("text-[12.5px]", state === "bad" ? "text-bad" : "text-text-3")}>{s.detail}</motion.span>}
              </span>
            </motion.li>
          );
        })}
      </ol>
      {finished && (
        <motion.div initial={reduced ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.24 }} className="mt-4">
          {verification.ok ? (
            <Callout tone="ok" title="Verified. The escrow released the funds.">
              {task.state === "settled" || task.state === "resolved" ? <>Released to the worker. Transaction <Hash value={att.digest} head={10} tail={6} /> <span className="text-text-3">(simulated)</span>.</> : "All six checks passed."}
            </Callout>
          ) : (
            <Callout tone="bad" title={`${PROOF_ERRORS[verification.error!].title}`}>
              {PROOF_ERRORS[verification.error!].body} <strong className="font-medium">{PROOF_ERRORS[verification.error!].recovery}</strong>
            </Callout>
          )}
        </motion.div>
      )}
    </section>
  );
}

function safeJson(s: string): Record<string, unknown> {
  try {
    return JSON.parse(s);
  } catch {
    return {};
  }
}

"use client";

import { Check, CircleAlert, FileCheck2, Hash as HashIcon, Link2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { isHex, keccak256, stringToBytes, toHex } from "viem";
import { Chip } from "@/components/ui/chips";
import { CopyField } from "@/components/ui/copy";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/data";
import { Field, Input, Segmented, Textarea } from "@/components/ui/form";
import { attConditionsFor, conditionHashOf, taskAdditionParams } from "@/lib/domain/condition";
import { attestationDigest, recoverSigner } from "@/lib/domain/digest";
import type { Condition, Op } from "@/lib/domain/types";
import { OP_LABEL } from "@/lib/domain/types";
import { cn } from "@/lib/utils";

/** Everything here runs in the browser. Nothing you paste is sent anywhere. */
export function ProofTools({ sample, sampleAttestors }: { sample: string; sampleAttestors: string }) {
  return (
    <Tabs defaultValue="verify">
      <TabsList>
        <TabsTrigger value="verify"><FileCheck2 className="size-4" /> Verify an attestation</TabsTrigger>
        <TabsTrigger value="hash"><HashIcon className="size-4" /> Hash text</TabsTrigger>
        <TabsTrigger value="rule"><Link2 className="size-4" /> Rule hash</TabsTrigger>
      </TabsList>
      <TabsContent value="verify"><VerifyTool sample={sample} sampleAttestors={sampleAttestors} /></TabsContent>
      <TabsContent value="hash"><HashTool /></TabsContent>
      <TabsContent value="rule"><RuleTool /></TabsContent>
    </Tabs>
  );
}

/* ── 1. Verify ── */
type Parsed = { recipient: string; request: { url: string; header: string; method: string; body: string }; responseResolve: { keyName: string; parseType: string; parsePath: string }[]; data: string; attConditions: string; timestamp: number; additionParams: string; signatures: string[]; attestors: { attestorAddr: string; url: string }[] };

function parse(text: string): { ok: true; a: Parsed } | { ok: false; error: string } {
  try {
    const j = JSON.parse(text);
    const a = j.attestation ?? j; // accept a wrapped response
    const rr = a.reponseResolve ?? a.responseResolve; // Primus spells it `reponseResolve`
    if (!a.recipient || !a.request?.url || !Array.isArray(rr) || typeof a.data !== "string" || typeof a.attConditions !== "string" || typeof a.additionParams !== "string" || !Array.isArray(a.signatures)) return { ok: false, error: "This is missing fields a Primus attestation has: recipient, request, reponseResolve, data, attConditions, timestamp, additionParams, signatures." };
    const ts = Number(a.timestamp);
    if (!Number.isFinite(ts)) return { ok: false, error: "timestamp must be a number." };
    return { ok: true, a: { recipient: a.recipient, request: a.request, responseResolve: rr, data: a.data, attConditions: a.attConditions, timestamp: ts > 1e12 ? Math.floor(ts / 1000) : ts, additionParams: a.additionParams, signatures: a.signatures, attestors: a.attestors ?? [] } };
  } catch {
    return { ok: false, error: "That is not valid JSON." };
  }
}

function VerifyTool({ sample, sampleAttestors }: { sample: string; sampleAttestors: string }) {
  const [text, setText] = useState("");
  const [trusted, setTrusted] = useState("");
  const [res, setRes] = useState<null | { digest: string; signer: string | null; error?: string }>(null);
  const parsed = useMemo(() => (text.trim() ? parse(text) : null), [text]);

  useEffect(() => {
    let live = true;
    setRes(null);
    if (!parsed || !parsed.ok) return;
    (async () => {
      try {
        const digest = attestationDigest(parsed.a as never);
        const signer = parsed.a.signatures.length === 1 ? await recoverSigner(digest, parsed.a.signatures[0] as `0x${string}`) : null;
        if (live) setRes({ digest, signer, error: parsed.a.signatures.length !== 1 ? "Primus’ verifier expects exactly one signature." : undefined });
      } catch (e) {
        if (live) setRes({ digest: "", signer: null, error: (e as Error).message });
      }
    })();
    return () => { live = false; };
  }, [parsed]);

  const list = trusted.split(/[\s,]+/).filter(Boolean).map((s) => s.toLowerCase());
  const inList = res?.signer ? (list.length ? list.includes(res.signer.toLowerCase()) : null) : null;
  let data: Record<string, unknown> | null = null;
  if (parsed?.ok) try { data = JSON.parse(parsed.a.data); } catch {}

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="grid content-start gap-4">
        <Field label="Attestation JSON" hint="Paste what the Primus SDK returned from startAttestation, or an attestation from this app.">
          <Textarea value={text} onChange={(e) => setText(e.target.value)} className="mono min-h-[260px] text-[12px]" placeholder='{ "recipient": "0x…", "request": { … }, "reponseResolve": [ … ], … }' spellCheck={false} />
        </Field>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className="text-[13px] font-medium text-light-text hover:underline" onClick={() => { setText(sample); setTrusted(sampleAttestors); }}>Load a simulated example</button>
          <span className="text-[12.5px] text-text-3">It is signed by the public test key, so it recovers to the Simulation attestor.</span>
        </div>
        <Field label="Attestor addresses you trust" optional hint="Comma-separated. Leave empty to only recover the signer.">
          <Input value={trusted} onChange={(e) => setTrusted(e.target.value)} className="mono text-[12px]" placeholder="0x…, 0x…" />
        </Field>
      </div>

      <div className="grid content-start gap-3" aria-live="polite">
        {!parsed && <p className="rounded-panel bg-sunk p-5 text-[14px] text-text-2">Paste an attestation to see the digest the attestor signed and the address that signed it. This is the same check the escrow runs first.</p>}
        {parsed && !parsed.ok && <p role="alert" className="flex items-start gap-2 rounded-panel bg-bad-quiet p-4 text-[13.5px] text-bad"><CircleAlert className="mt-0.5 size-4 shrink-0" />{parsed.error}</p>}
        {parsed?.ok && res && (
          <>
            <div className={cn("flex items-center gap-2.5 rounded-panel p-4 text-[14px] font-medium", res.signer && !res.error ? "bg-ok-quiet text-ok" : "bg-bad-quiet text-bad")}>
              {res.signer && !res.error ? <Check className="size-4" strokeWidth={3} /> : <CircleAlert className="size-4" />}
              {res.signer && !res.error ? "Signature recovers to an address" : res.error ?? "No signer could be recovered"}
            </div>
            <CopyField label="Digest (what was signed)" value={res.digest} />
            {res.signer && <CopyField label="Recovered signer" value={res.signer} />}
            {inList !== null && <p className="flex items-center gap-2 text-[13.5px]">{inList ? <Chip tone="ok">On your trusted list</Chip> : <Chip tone="bad">Not on your trusted list</Chip>}</p>}
            <dl className="grid gap-2 rounded-panel bg-sunk p-4 text-[13px]">
              <Row k="Recipient" v={parsed.a.recipient} mono />
              <Row k="URL" v={parsed.a.request.url} mono />
              <Row k="Timestamp" v={new Date(parsed.a.timestamp * 1000).toUTCString()} />
              <Row k="attConditions" v={parsed.a.attConditions} mono />
              <Row k="Disclosed data" v={data ? JSON.stringify(data) : parsed.a.data} mono />
              <Row k="additionParams" v={parsed.a.additionParams} mono />
            </dl>
            <p className="text-[12px] text-text-3">This proves who signed these exact fields. It does not prove the signer is a Primus attestor: check the address against Primus’ registry, or the verifier contract.</p>
          </>
        )}
      </div>
    </div>
  );
}

function Row({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="grid grid-cols-[110px_1fr] gap-3">
      <dt className="text-text-3">{k}</dt>
      <dd className={cn("min-w-0 break-all", mono && "mono text-[12px]")}>{v}</dd>
    </div>
  );
}

/* ── 2. Hash ── */
async function sha256Hex(bytes: Uint8Array): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", bytes as BufferSource);
  return toHex(new Uint8Array(buf));
}

function HashTool() {
  const [mode, setMode] = useState<"text" | "hex">("text");
  const [input, setInput] = useState("conversions");
  const [out, setOut] = useState<{ sha256: string; keccak: string; bytes: number } | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        if (mode === "hex" && input.trim() && !isHex(input.trim())) throw new Error("Hex input must start with 0x and have an even number of digits.");
        const bytes = mode === "hex" ? (input.trim() ? (stringToBytesFromHex(input.trim())) : new Uint8Array()) : stringToBytes(input);
        const sha = await sha256Hex(bytes);
        if (live) { setErr(""); setOut({ sha256: sha, keccak: keccak256(bytes), bytes: bytes.length }); }
      } catch (e) {
        if (live) { setErr((e as Error).message); setOut(null); }
      }
    })();
    return () => { live = false; };
  }, [input, mode]);

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="grid content-start gap-4">
        <Segmented aria-label="Input type" value={mode} onValueChange={(v) => setMode(v as typeof mode)} options={[{ value: "text", label: "Text (UTF-8)" }, { value: "hex", label: "Hex bytes" }]} />
        <Field label="Input" error={err}>
          <Textarea value={input} onChange={(e) => setInput(e.target.value)} className="mono min-h-[140px] text-[12.5px]" spellCheck={false} />
        </Field>
        <p className="text-[12.5px] text-text-3">SHA-256 is Primus’ hash disclosure (<code className="mono">SHA256</code> in an attestation condition). Keccak-256 is what the escrow uses for the rule and request hashes.</p>
      </div>
      <div className="grid content-start gap-3">
        {out ? (
          <>
            <CopyField label="SHA-256" value={out.sha256} />
            <CopyField label="Keccak-256" value={out.keccak} />
            <p className="num text-[12.5px] text-text-3">{out.bytes} bytes</p>
          </>
        ) : (
          <p className="rounded-panel bg-sunk p-5 text-[14px] text-text-2">Enter text or hex to hash it.</p>
        )}
      </div>
    </div>
  );
}
function stringToBytesFromHex(h: string): Uint8Array {
  const s = h.startsWith("0x") ? h.slice(2) : h;
  if (s.length % 2) throw new Error("Hex input needs an even number of digits.");
  const out = new Uint8Array(s.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(s.slice(i * 2, i * 2 + 2), 16);
  return out;
}

/* ── 3. Rule hash ── */
function RuleTool() {
  const [url, setUrl] = useState("https://partner.example/campaigns/cmp_ada/stats");
  const [metric, setMetric] = useState("conversions");
  const [op, setOp] = useState<Op>(">=");
  const [threshold, setThreshold] = useState("1200");
  const [taskId, setTaskId] = useState("tsk_7Q2M");
  const n = Number(threshold);
  const ok = url.startsWith("http") && metric.trim() && threshold.trim() !== "" && Number.isFinite(n);
  const c: Condition | null = ok ? { sourceId: "custom", sourceName: "Custom", url, method: "GET", jsonPath: `$.${metric}`, metric, op, threshold: n, disclosure: "threshold" } : null;
  const hash = c ? conditionHashOf(c) : "";
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="grid content-start gap-4">
        <Field label="Request URL"><Input value={url} onChange={(e) => setUrl(e.target.value)} className="mono text-[12.5px]" /></Field>
        <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-3">
          <Field label="Field"><Input value={metric} onChange={(e) => setMetric(e.target.value)} /></Field>
          <Segmented aria-label="Operator" value={op} onValueChange={(v) => setOp(v as Op)} options={(Object.keys(OP_LABEL) as Op[]).map((o) => ({ value: o, label: OP_LABEL[o] }))} />
          <Field label="Value"><Input value={threshold} onChange={(e) => setThreshold(e.target.value)} inputMode="decimal" /></Field>
        </div>
        <Field label="Task id" hint="Goes into additionParams with the rule hash."><Input value={taskId} onChange={(e) => setTaskId(e.target.value)} className="mono text-[12.5px]" /></Field>
      </div>
      <div className="grid content-start gap-3">
        {c ? (
          <>
            <CopyField label="attConditions (passed to the Primus SDK)" value={attConditionsFor(c)} />
            <CopyField label="Rule hash = keccak256(url ‖ attConditions)" value={hash} />
            <CopyField label="additionParams (bound into the signature)" value={taskAdditionParams(taskId, hash)} />
            <p className="text-[12.5px] text-text-3">The escrow stores these at creation. A proof whose URL, conditions or additionParams differ is rejected.</p>
          </>
        ) : (
          <p className="rounded-panel bg-sunk p-5 text-[14px] text-text-2">Fill in the URL, field and value.</p>
        )}
      </div>
    </div>
  );
}

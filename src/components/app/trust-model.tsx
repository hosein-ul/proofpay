import { Check, Minus, ShieldQuestion } from "lucide-react";
import Link from "next/link";
import { PRIMUS_DOCS } from "@/lib/config";
import type { Mode } from "@/lib/domain/types";
import { cn } from "@/lib/utils";

/** The Trust Model: plain, calm, no hype. One source, reused in Builder review, Proof Inspector, Settings and the website. */
export function TrustModel({ mode = "simulation", className, compact }: { mode?: Mode; className?: string; compact?: boolean }) {
  return (
    <div id="trust-model" className={cn("grid gap-4", !compact && "md:grid-cols-2", className)}>
      <Block title="What a Primus attestation proves" icon={<Check className="size-4 text-ok" />}>
        <li>The response came from that source, over TLS, unmodified.</li>
        <li>A registered attestor ran the session and signed the result.</li>
        <li>For a threshold rule, only the result (true or false) is disclosed. The raw value stays private.</li>
      </Block>
      <Block title="What it does not prove" icon={<Minus className="size-4 text-bad" />}>
        <li>That the source’s data is truthful. A dashboard can be wrong.</li>
        <li>That the worker did the work. Only that the source reports the condition.</li>
        <li>Anything about work the source does not measure.</li>
      </Block>
      <Block title="Verification path in use" icon={<ShieldQuestion className="size-4 text-info" />}>
        <li>
          <strong>On-chain verifier.</strong> The escrow contract checks the attestor’s signature, the recipient, the task id and rule hash, replay, and the time window before it pays.
        </li>
        <li>Who can sign: only attestors registered with the Primus verifier contract. {mode === "simulation" ? "In Simulation: one local test attestor." : ""}</li>
        <li>Fallback relayer path: off. If it is ever turned on, it will be shown here.</li>
      </Block>
      <Block title={mode === "simulation" ? "What is simulated here" : "What is live here"} icon={<span className="grid size-4 place-items-center rounded-full bg-light-quiet text-[10px] font-bold text-light-text">S</span>}>
        {mode === "simulation" ? (
          <>
            <li>The attestor is a local test key, not Primus. The TLS session is not real.</li>
            <li>Chain transactions are simulated. No funds move. Every simulated proof is labelled.</li>
            <li>Signatures, digests, binding, replay and window checks are real and run exactly as in Live.</li>
          </>
        ) : (
          <>
            <li>Attestations come from Primus attestors via the SDK, on Base Sepolia (testnet).</li>
            <li>Funds are mock USDC. No real money.</li>
          </>
        )}
      </Block>
      {!compact && (
        <p className="text-[12.5px] text-text-3 md:col-span-2">
          Proofs by{" "}
          <a href={PRIMUS_DOCS} target="_blank" rel="noreferrer" className="underline underline-offset-2">
            Primus zkTLS
          </a>
          . ProofPay is independent software built on it and is not endorsed by Primus. <Link href="/security" className="underline underline-offset-2">Read the security page</Link>.
        </p>
      )}
    </div>
  );
}

function Block({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-panel bg-sunk p-4">
      <h3 className="flex items-center gap-2 text-[13.5px] font-semibold">
        {icon} {title}
      </h3>
      <ul className="mt-2 grid list-disc gap-1.5 pl-5 text-[13px] leading-relaxed text-text-2 marker:text-text-3">{children}</ul>
    </section>
  );
}

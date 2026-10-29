import { ArrowRight, Check, Minus } from "lucide-react";
import Link from "next/link";
import { PlateStack } from "@/components/brand/plate-stack";
import { TrySettlement } from "@/components/site/try-settlement";
import { Button } from "@/components/ui/button";
import { SimTag } from "@/components/ui/chips";
import { BrandMark, MarksCaption, TokenOnChain } from "@/components/ui/marks";
import { PRIMUS_DOCS, TAGLINE } from "@/lib/config";

const FAQ = [
  ["Does this move real money?", "No. The beta runs on Base Sepolia with a mock USDC token. Simulation mode moves nothing at all, and every simulated proof is labelled."],
  ["What does a proof actually prove?", "That a source returned a response over TLS, that a registered attestor signed it, and, for a threshold rule, that the rule held. It does not prove the source is truthful, or that someone did the work."],
  ["Who can sign a proof?", "Only attestors registered with the verifier contract. In Simulation that is one local test key, clearly marked."],
  ["Can a proof be reused?", "No. Each proof digest is consumed once, and it is bound to one task and one worker address."],
  ["Is it audited?", "No. The contracts are testnet code and have not been audited. Do not use them with real funds."],
  ["What if nobody proves anything?", "After the deadline the payer refunds in one step."],
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-line">
        <div aria-hidden className="dots pointer-events-none absolute inset-0 opacity-60 [mask-image:radial-gradient(70%_80%_at_80%_20%,#000,transparent)]" />
        <div className="relative mx-auto grid max-w-[1200px] items-center gap-10 px-5 py-20 lg:grid-cols-[1.1fr_1fr] lg:py-28">
          <div className="grid gap-6">
            <p className="inline-flex w-fit items-center gap-2 rounded-full bg-sunk px-3 py-1 text-[12.5px] text-text-2"><TokenOnChain size={16} /> Testnet beta · mock USDC on Base Sepolia</p>
            <h1 className="t-display max-w-[14ch]">{TAGLINE}</h1>
            <p className="max-w-[52ch] text-[18px] leading-relaxed text-text-2">Lock funds against a condition. The worker proves it with a zkTLS attestation. The escrow checks the proof and pays. No invoice chasing, no manual approval.</p>
            <div className="flex flex-wrap gap-3">
              <Button variant="primary" size="lg" asChild><Link href="/app">Open the demo <ArrowRight className="size-4" /></Link></Button>
              <Button variant="secondary" size="lg" asChild><Link href="/request-access">Request early access</Link></Button>
            </div>
            <p className="text-[13px] text-text-3">The demo runs in Simulation with seeded data. It needs no wallet.</p>
          </div>
          <div className="relative grid justify-items-center">
            <div className="relative w-full max-w-[460px] rounded-stage bg-raised p-6 shadow-raised">
              <div className="mb-4 flex items-center justify-between"><SimTag label="Simulation" /><span className="text-[12px] text-text-3">Example task</span></div>
              <div className="grid grid-cols-[auto_1fr] items-center gap-5">
                <PlateStack count={4} lit={3} size={120} />
                <div className="grid gap-1">
                  <p className="text-[13px] text-text-3">Q4 growth campaign</p>
                  <p className="num text-[30px] font-semibold leading-none tracking-[-0.03em]">2,500.00 <span className="text-[14px] font-normal text-text-3">USDC</span></p>
                  <p className="text-[13.5px] text-text-2">Released to Ada when conversions ≥ 1,200</p>
                </div>
              </div>
              <ul className="mt-5 grid gap-1.5 border-t border-line pt-4 text-[13px]">
                {["Signature valid", "Attestor registered", "Bound to task and worker", "Not replayed", "Inside window", "Rule satisfied"].map((c) => (
                  <li key={c} className="flex items-center gap-2"><span className="grid size-4 place-items-center rounded-full bg-ok-quiet text-ok"><Check className="size-2.5" strokeWidth={3.5} /></span>{c}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Built on */}
      <section aria-label="Built on" className="border-b border-line bg-sunk">
        <div className="mx-auto max-w-[1200px] px-5 py-8">
          <p className="mb-4 text-[13px] font-medium text-text-3">Proofs can be built on systems like these (each needs its own template)</p>
          <ul className="flex flex-wrap items-center gap-x-8 gap-y-3 text-[14px] text-text-2">
            {([["github", "GitHub"], ["stripe", "Stripe"], ["shopify", "Shopify"], ["googleanalytics", "Google Analytics"], ["datadog", "Datadog"], ["hubspot", "HubSpot"]] as const).map(([id, name]) => (
              <li key={id} className="flex items-center gap-2"><BrandMark id={id} size={18} /><span>{name}</span></li>
            ))}
          </ul>
          <MarksCaption className="mt-4" />
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-[1200px] px-5 py-20">
        <h2 className="t-h1 max-w-[20ch]">Three steps, and the middle one is math</h2>
        <ol className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            ["1", "Write the rule", "Pick a source and a threshold. The rule and the worker’s address are hashed into the task."],
            ["2", "Lock the funds", "The payer funds the escrow. Until the deadline, the funds can go one of two ways: paid or refunded."],
            ["3", "Prove and release", "The worker generates a proof. The escrow verifies it on its own and pays, or says exactly which check failed."],
          ].map(([n, t, b]) => (
            <li key={n} className="grid content-start gap-2 rounded-stage bg-raised p-6 shadow-raised">
              <span className="num text-[13px] font-semibold text-light-text">Step {n}</span>
              <h3 className="text-[18px] font-semibold tracking-[-0.02em]">{t}</h3>
              <p className="text-[14.5px] text-text-2">{b}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Try it */}
      <section className="border-y border-line bg-sunk">
        <div className="mx-auto max-w-[1200px] px-5 py-20">
          <h2 className="t-h1 mb-2">Try a settlement</h2>
          <p className="mb-8 max-w-[60ch] text-[16px] text-text-2">The same six checks the escrow runs, in your browser. Try a bad proof to see a payment refuse.</p>
          <TrySettlement />
        </div>
      </section>

      {/* Trust */}
      <section className="mx-auto grid max-w-[1200px] gap-8 px-5 py-20 md:grid-cols-2">
        <div className="grid content-start gap-3">
          <h2 className="t-h1">What it proves, and what it doesn’t</h2>
          <p className="text-[16px] text-text-2">A proof makes one narrow claim very reliable. We would rather say where it ends.</p>
          <Button variant="secondary" asChild className="w-fit"><Link href="/security">Read the Trust Model</Link></Button>
        </div>
        <div className="grid gap-3">
          <div className="rounded-panel bg-raised p-5 shadow-raised">
            <p className="mb-2 flex items-center gap-2 text-[14px] font-semibold"><Check className="size-4 text-ok" /> Proves</p>
            <p className="text-[14px] text-text-2">The response came from that source over TLS, a registered attestor signed it, and the rule held. Only “true” or “false” is disclosed.</p>
          </div>
          <div className="rounded-panel bg-raised p-5 shadow-raised">
            <p className="mb-2 flex items-center gap-2 text-[14px] font-semibold"><Minus className="size-4 text-bad" /> Does not prove</p>
            <p className="text-[14px] text-text-2">That the source is correct, or that the work was done. If the dashboard is wrong, the proof is of a wrong number.</p>
          </div>
        </div>
      </section>

      {/* Developers */}
      <section className="border-y border-line bg-sunk">
        <div className="mx-auto grid max-w-[1200px] items-center gap-8 px-5 py-20 md:grid-cols-[1fr_1.1fr]">
          <div className="grid gap-3">
            <h2 className="t-h1">An API for agents</h2>
            <p className="text-[16px] text-text-2">Create a task, fund it and submit a proof over plain HTTP. Every write takes an idempotency key.</p>
            <Button variant="secondary" asChild className="w-fit"><Link href="/developers">Read the docs</Link></Button>
          </div>
          <pre tabIndex={0} className="mono overflow-x-auto rounded-stage bg-[#0B1424] p-5 text-[12.5px] leading-relaxed text-[#D6DEEE]"><code>{`curl -X POST $BASE/api/tasks/tsk_7Q2M/fund \\
  -H "Idempotency-Key: fund-tsk_7Q2M"

# → { "task": { "state": "funded", ... } }`}</code></pre>
        </div>
      </section>

      {/* Compare */}
      <section className="mx-auto max-w-[1200px] px-5 py-20">
        <h2 className="t-h1 mb-8">Compared with the usual options</h2>
        <div className="overflow-x-auto rounded-stage bg-raised shadow-raised">
          <table className="w-full min-w-[640px] text-left text-[14px]">
            <thead><tr className="border-b border-line text-[12.5px] text-text-3"><th className="p-4 font-medium"> </th><th className="p-4 font-medium">Invoice</th><th className="p-4 font-medium">Manual escrow</th><th className="p-4 font-medium text-text">This</th></tr></thead>
            <tbody>
              {[
                ["Who decides it’s done", "The payer", "A third party", "A verified fact"],
                ["Time to pay", "Days to weeks", "Hours to days", "One transaction"],
                ["Payer can withhold", "Yes", "Sometimes", "No, once locked"],
                ["Worker can overclaim", "Yes", "Sometimes", "Only if the source does"],
              ].map((r) => (
                <tr key={r[0]} className="border-b border-line last:border-0">{r.map((c, i) => <td key={i} className={i === 0 ? "p-4 font-medium" : i === 3 ? "p-4 font-medium" : "p-4 text-text-2"}>{c}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[12.5px] text-text-3">A qualitative comparison, not a benchmark. The last row is why the Trust Model matters.</p>
      </section>

      {/* FAQ */}
      <section className="border-t border-line bg-sunk">
        <div className="mx-auto grid max-w-[900px] gap-6 px-5 py-20">
          <h2 className="t-h1">Questions</h2>
          <div className="grid gap-2">
            {FAQ.map(([q, a]) => (
              <details key={q} className="group rounded-panel bg-raised px-5 py-4 shadow-rest">
                <summary className="cursor-pointer list-none text-[15.5px] font-medium marker:hidden">{q}</summary>
                <p className="mt-2 text-[14.5px] text-text-2">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-[1200px] px-5 py-20">
        <div className="grid items-center gap-6 rounded-stage bg-[#0B1424] p-10 text-[#EEF2FA] md:grid-cols-[1fr_auto]">
          <div className="grid gap-2">
            <h2 className="text-[30px] font-semibold tracking-[-0.03em] [font-variation-settings:'wdth'_112]">See a task settle itself</h2>
            <p className="max-w-[52ch] text-[15.5px] text-[#B4C0D8]">Open the demo and run a proof. Or tell us what you would pay for with proof, and we will get in touch. Proofs by <a className="underline" href={PRIMUS_DOCS}>Primus zkTLS</a>.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="primary" size="lg" asChild><Link href="/app">Open the demo</Link></Button>
            <Button variant="secondary" size="lg" asChild><Link href="/request-access">Request early access</Link></Button>
          </div>
        </div>
      </section>
    </>
  );
}

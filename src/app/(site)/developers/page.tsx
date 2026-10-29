import type { Metadata } from "next";
import Link from "next/link";
import { Card, PageHero, Section } from "@/components/site/prose";
import { Button } from "@/components/ui/button";
import { PRIMUS_DOCS } from "@/lib/config";

export const metadata: Metadata = { title: "Developers", description: "Quickstart, concepts and the HTTP API." };

const CODE = (s: string) => <pre className="mono overflow-x-auto rounded-panel bg-[#0B1424] p-4 text-[12.5px] leading-relaxed text-[#D6DEEE]"><code>{s}</code></pre>;

export default function Developers() {
  return (
    <>
      <PageHero eyebrow="Developers" title="Quickstart" lead="Create a task, lock it, prove it, watch it settle. Four calls." />
      <Section>
        <ol className="grid max-w-[820px] gap-8">
          <li className="grid gap-2"><h2 className="text-[18px] font-semibold">1. Create a task</h2>{CODE(`curl -X POST $BASE/api/tasks -H "content-type: application/json" -d '{
  "title": "Q4 growth campaign", "workerId": "w_ada", "amountUsdc": 2500,
  "deadline": "2026-11-20T12:00:00Z",
  "condition": { "sourceId": "demo-campaign", "sourceName": "Campaign stats",
    "url": "https://partner.example/campaigns/cmp_ada/stats", "jsonPath": "$.conversions",
    "metric": "conversions", "op": ">=", "threshold": 1200 }
}'`)}</li>
          <li className="grid gap-2"><h2 className="text-[18px] font-semibold">2. Fund it</h2>{CODE(`curl -X POST $BASE/api/tasks/$ID/fund -H "Idempotency-Key: fund-$ID"`)}</li>
          <li className="grid gap-2"><h2 className="text-[18px] font-semibold">3. Submit a proof</h2>{CODE(`curl -X POST $BASE/api/tasks/$ID/proof -H "content-type: application/json" -d '{ "value": 1340 }'`)}<p className="text-[14px] text-text-2">In Simulation the value is supplied and the attestor is a local test key. In Live the SDK fetches it and Primus attests it.</p></li>
          <li className="grid gap-2"><h2 className="text-[18px] font-semibold">4. Read the result</h2><p className="text-[14.5px] text-text-2">The response carries the six named checks. The task is now <code className="mono rounded bg-sunk px-1 text-[13px]">settled</code> and the ledger has a release entry.</p></li>
        </ol>
        <div className="mt-10 flex flex-wrap gap-3"><Button variant="primary" asChild><Link href="/developers/api">API reference</Link></Button><Button variant="secondary" asChild><a href={PRIMUS_DOCS}>Primus zkTLS docs</a></Button></div>
      </Section>
      <Section title="Concepts" tone="sunk">
        <div className="grid gap-4 md:grid-cols-3">
          <Card title="Task states">draft → funded → awaiting_proof → proving → verified → settled. Side exits: expired → refunded, disputed → resolved.</Card>
          <Card title="Binding">conditionHash = keccak256(url ‖ conditions). The attestation carries the task id and rule hash in additionParams and the worker as recipient.</Card>
          <Card title="Idempotency">Every write accepts an Idempotency-Key. Repeating a key returns the first response, so retries cannot double-pay.</Card>
        </div>
      </Section>
    </>
  );
}

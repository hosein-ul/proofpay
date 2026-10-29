import type { Metadata } from "next";
import { PageHero, Section } from "@/components/site/prose";
import { ENDPOINTS, ERROR_CODES } from "@/lib/api/docs";
import { PROOF_ERRORS } from "@/lib/domain/errors";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "API reference" };

export default function ApiRef() {
  return (
    <>
      <PageHero eyebrow="Developers" title="API reference" lead="JSON over HTTPS. Errors carry a code, a message and, where it helps, a recovery step." />
      <Section>
        <div className="grid gap-3">
          {ENDPOINTS.map((e) => (
            <article key={e.method + e.path} id={`${e.method}-${e.path}`} className="grid gap-2 rounded-panel bg-raised p-5 shadow-rest">
              <h2 className="flex flex-wrap items-center gap-3 text-[15px]"><span className={cn("mono rounded px-1.5 py-0.5 text-[12px] font-semibold", e.method === "GET" ? "bg-info-quiet text-info" : "bg-ok-quiet text-ok")}>{e.method}</span><code className="mono text-[14px]">{e.path}</code></h2>
              <p className="text-[14.5px] text-text-2">{e.summary}</p>
              {e.body && <pre className="mono overflow-x-auto rounded-control bg-sunk p-3 text-[12.5px]"><code>{e.body}</code></pre>}
              {e.notes && <p className="text-[13px] text-text-3">{e.notes}</p>}
            </article>
          ))}
        </div>
      </Section>
      <Section title="Error codes" tone="sunk">
        <dl className="grid gap-3 md:grid-cols-2">
          {ERROR_CODES.map((c) => (
            <div key={c} className="rounded-panel bg-raised p-4 shadow-rest"><dt className="mono text-[13px] font-semibold">{c}</dt><dd className="mt-1 text-[14px] text-text-2">{PROOF_ERRORS[c].title}. {PROOF_ERRORS[c].recovery}</dd></div>
          ))}
        </dl>
      </Section>
    </>
  );
}

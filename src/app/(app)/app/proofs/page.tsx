import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/app/page-header";
import { Chip, SimTag } from "@/components/ui/chips";
import { Time } from "@/components/ui/copy";
import { EmptyState } from "@/components/ui/feedback";
import { Identicon } from "@/components/ui/identicon";
import { PROOF_ERRORS } from "@/lib/domain/errors";
import { conditionText } from "@/lib/domain/condition";
import { getDb, schema } from "@/lib/db/client";
import { listTasks, listWorkers, ready } from "@/lib/server/repo";
import type { Attestation, VerificationResult } from "@/lib/domain/types";
import { desc } from "drizzle-orm";

export const metadata: Metadata = { title: "Proofs" };
export const dynamic = "force-dynamic";

export default async function ProofsPage() {
  await ready();
  const [tasks, workers] = await Promise.all([listTasks(), listWorkers()]);
  const t = new Map(tasks.map((x) => [x.id, x]));
  const w = new Map(workers.map((x) => [x.id, x]));
  const rows = getDb().select().from(schema.attestations).orderBy(desc(schema.attestations.createdAt)).all();
  return (
    <>
      <PageHeader title="Proofs" description="Every attestation submitted in this workspace, with its verification result. Open one to see what each side saw." />
      <div className="overflow-hidden rounded-panel bg-raised shadow-raised">
        {rows.length === 0 ? (
          <EmptyState title="No proofs yet" body="Proofs appear when a worker attests a task’s condition. Open a funded task to generate one." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-[13.5px]">
              <thead className="bg-sunk text-left text-[12px] text-text-3">
                <tr><th className="h-9 px-4 font-medium">Result</th><th className="font-medium">Proof</th><th className="font-medium">Task</th><th className="font-medium">Worker</th><th className="px-4 text-right font-medium">When</th></tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const att = r.json as Attestation;
                  const v = r.verification as VerificationResult | null;
                  const task = t.get(r.taskId);
                  const worker = task ? w.get(task.workerId) : null;
                  return (
                    <tr key={r.id} className="group border-t border-line hover:bg-lift">
                      <td className="h-[var(--row-h)] px-4">{r.ok === null ? <Chip tone="warn">Unverified</Chip> : r.ok ? <Chip tone="ok">Verified</Chip> : <Chip tone="bad">{v?.error ? PROOF_ERRORS[v.error].title : "Failed"}</Chip>}</td>
                      <td><Link href={`/app/proofs/${r.id}`} className="mono text-[12.5px] hover:text-light-text">{r.id}</Link> {att.simulated && <SimTag className="ml-1.5" />}</td>
                      <td className="max-w-[260px]"><Link href={`/app/tasks/${r.taskId}`} className="block truncate font-medium hover:text-light-text">{task?.title}</Link><span className="block truncate text-[12px] text-text-3">{task && conditionText(task.condition)}</span></td>
                      <td>{worker && <span className="inline-flex items-center gap-2"><Identicon name={worker.name} hue={worker.hue} size={22} />{worker.name}</span>}</td>
                      <td className="px-4 text-right text-text-2"><Time value={r.createdAt} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

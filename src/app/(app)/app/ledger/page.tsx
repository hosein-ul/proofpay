import type { Metadata } from "next";
import { LedgerView } from "@/components/app/ledger-view";
import { PageHeader } from "@/components/app/page-header";
import { listLedger, listTasks } from "@/lib/server/repo";

export const metadata: Metadata = { title: "Ledger" };
export const dynamic = "force-dynamic";

export default async function LedgerPage() {
  const [entries, tasks] = await Promise.all([listLedger(), listTasks()]);
  const titles = Object.fromEntries(tasks.map((t) => [t.id, t.title]));
  return (
    <>
      <PageHeader title="Ledger" description="Every lock, release and refund as a double entry, with the escrow balance after each one." />
      <LedgerView entries={entries} titles={titles} />
    </>
  );
}

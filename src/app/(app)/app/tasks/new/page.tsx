import type { Metadata } from "next";
import { PageHeader } from "@/components/app/page-header";
import { TaskBuilder } from "@/components/app/task-builder";
import { workerStats } from "@/lib/server/repo";

export const metadata: Metadata = { title: "New task" };
export const dynamic = "force-dynamic";

export default async function NewTaskPage() {
  const stats = await workerStats();
  return (
    <>
      <PageHeader breadcrumbs={[{ label: "Tasks", href: "/app/tasks" }, { label: "New task" }]} title="New task" description="Write a rule, set the amount, and lock the funds. The worker proves it; the escrow does the rest." />
      <TaskBuilder workers={stats.map((s) => ({ ...s.worker, proofs: s.proofs, successRate: s.successRate, active: s.active }))} />
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { TasksTable, type TaskRow } from "@/components/app/tasks-table";
import { Button } from "@/components/ui/button";
import { attentionQueue, listTasks, listWorkers } from "@/lib/server/repo";

export const metadata: Metadata = { title: "Tasks" };
export const dynamic = "force-dynamic";

export default async function TasksPage({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const [{ view }, tasks, workers, att] = await Promise.all([searchParams, listTasks(), listWorkers(), attentionQueue()]);
  const w = new Map(workers.map((x) => [x.id, x]));
  const attn = new Set(att.map((a) => a.task.id));
  const rows: TaskRow[] = tasks.map((t) => ({ ...t, worker: w.get(t.workerId)!, attention: attn.has(t.id) }));
  const initialView = view === "awaiting" ? "open" : (view ?? "all");
  return (
    <>
      <PageHeader
        title="Tasks"
        description="Every payment locked against a condition. Filter, sort, and open a task to see its proof and timeline."
        actions={
          <Button variant="primary" asChild>
            <Link href="/app/tasks/new">
              <Plus className="size-4" /> New task
            </Link>
          </Button>
        }
      />
      <TasksTable rows={rows} workers={workers} initialView={initialView} />
    </>
  );
}

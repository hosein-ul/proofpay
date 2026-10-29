import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/app/page-header";
import { TaskDetailView } from "@/components/app/task-detail";
import { getTaskDetail } from "@/lib/server/repo";
import { Breadcrumbs } from "@/components/ui/data";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const d = await getTaskDetail(id);
  return { title: d ? d.task.title : "Task not found" };
}

export default async function TaskPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const d = await getTaskDetail(id);
  if (!d) notFound();
  void PageHeader;
  return (
    <>
      <div className="mb-4">
        <Breadcrumbs items={[{ label: "Tasks", href: "/app/tasks" }, { label: d.task.id }]} />
      </div>
      <TaskDetailView data={d} />
    </>
  );
}

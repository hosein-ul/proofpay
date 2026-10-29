import { handle, json, limit, parseBody } from "@/lib/api/http";
import { CreateTaskSchema } from "@/lib/api/schemas";
import { TASK_STATES, type TaskState } from "@/lib/domain/types";
import { listTasks } from "@/lib/server/repo";
import { createTask } from "@/lib/server/service";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  return handle(async () => {
    const sp = new URL(req.url).searchParams;
    const states = (sp.get("state")?.split(",") ?? []).filter((s): s is TaskState => (TASK_STATES as readonly string[]).includes(s));
    return json({ tasks: await listTasks({ states: states.length ? states : undefined, workerId: sp.get("worker") ?? undefined }) });
  });
}

export async function POST(req: Request) {
  return handle(async () => {
    limit(req, "tasks:create", 30);
    const body = await parseBody(req, CreateTaskSchema);
    const task = await createTask(body);
    return json({ task }, { status: 201 });
  });
}

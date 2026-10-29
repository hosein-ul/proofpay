import { handle, json, limit } from "@/lib/api/http";
import { DomainError } from "@/lib/domain/errors";
import { signAttestationRequest } from "@/lib/server/primus";
import { getTask, getWorker } from "@/lib/server/repo";

export const dynamic = "force-dynamic";

/** Live mode only: returns the signed attestation request for the worker's browser to pass to the Primus extension. */
export async function POST(req: Request, ctx: RouteContext<"/api/tasks/[id]/proof/prepare">) {
  return handle(async () => {
    const { id } = await ctx.params;
    limit(req, `prepare:${id}`, 10);
    const task = await getTask(id);
    if (!task) throw new DomainError("not_found", "Task not found", 404);
    if (task.mode !== "live") throw new DomainError("bad_request", "This is a Simulation task. Submit a value to /proof instead.", 400);
    const worker = await getWorker(task.workerId);
    if (!worker) throw new DomainError("not_found", "Worker missing", 404);
    return json(await signAttestationRequest(task, worker));
  });
}

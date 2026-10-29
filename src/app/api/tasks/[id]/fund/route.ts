import { handle, json } from "@/lib/api/http";
import { fundTask, withIdempotency } from "@/lib/server/service";

export const dynamic = "force-dynamic";

export async function POST(req: Request, ctx: RouteContext<"/api/tasks/[id]/fund">) {
  return handle(async () => {
    const { id } = await ctx.params;
    const r = await withIdempotency(req.headers.get("idempotency-key"), `POST /api/tasks/${id}/fund`, async () => ({ status: 200, body: { task: await fundTask(id) } }));
    return json(r.body, { status: r.status, headers: r.replayed ? { "idempotent-replayed": "true" } : {} });
  });
}

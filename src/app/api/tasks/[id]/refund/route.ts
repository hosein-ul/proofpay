import { handle, json } from "@/lib/api/http";
import { refundTask, withIdempotency } from "@/lib/server/service";

export const dynamic = "force-dynamic";

export async function POST(req: Request, ctx: RouteContext<"/api/tasks/[id]/refund">) {
  return handle(async () => {
    const { id } = await ctx.params;
    const r = await withIdempotency(req.headers.get("idempotency-key"), `POST /api/tasks/${id}/refund`, async () => ({ status: 200, body: { task: await refundTask(id) } }));
    return json(r.body, { status: r.status, headers: r.replayed ? { "idempotent-replayed": "true" } : {} });
  });
}

import { handle, json, limit, parseBody } from "@/lib/api/http";
import { SubmitProofSchema } from "@/lib/api/schemas";
import { submitProof, withIdempotency } from "@/lib/server/service";

export const dynamic = "force-dynamic";

/** Submit a proof for a task. Rate limited (10/min per client). Idempotent with `Idempotency-Key`. */
export async function POST(req: Request, ctx: RouteContext<"/api/tasks/[id]/proof">) {
  return handle(async () => {
    const { id } = await ctx.params;
    limit(req, `proof:${id}`, 10);
    const body = await parseBody(req, SubmitProofSchema);
    const r = await withIdempotency(req.headers.get("idempotency-key"), `POST /api/tasks/${id}/proof`, async () => {
      const out = await submitProof(id, { value: body.value }, { role: "worker", name: body.actor ?? "Worker" });
      return { status: 200, body: out };
    });
    return json(r.body, { status: r.status, headers: r.replayed ? { "idempotent-replayed": "true" } : {} });
  });
}

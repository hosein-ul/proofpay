import { handle, json, parseBody } from "@/lib/api/http";
import { DisputeSchema } from "@/lib/api/schemas";
import { disputeTask } from "@/lib/server/service";

export const dynamic = "force-dynamic";

export async function POST(req: Request, ctx: RouteContext<"/api/tasks/[id]/dispute">) {
  return handle(async () => {
    const { id } = await ctx.params;
    const body = await parseBody(req, DisputeSchema);
    return json({ task: await disputeTask(id, body.note, { role: "payer", name: "Northgate Growth" }) });
  });
}

import { handle, json, parseBody } from "@/lib/api/http";
import { ResolveSchema } from "@/lib/api/schemas";
import { resolveTask } from "@/lib/server/service";

export const dynamic = "force-dynamic";

export async function POST(req: Request, ctx: RouteContext<"/api/tasks/[id]/resolve">) {
  return handle(async () => {
    const { id } = await ctx.params;
    const body = await parseBody(req, ResolveSchema);
    return json({ task: await resolveTask(id, body.outcome, body.note) });
  });
}

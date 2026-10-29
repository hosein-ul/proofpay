import { handle, json, parseBody } from "@/lib/api/http";
import { ExpireSchema } from "@/lib/api/schemas";
import { expireTask } from "@/lib/server/service";

export const dynamic = "force-dynamic";

export async function POST(req: Request, ctx: RouteContext<"/api/tasks/[id]/expire">) {
  return handle(async () => {
    const { id } = await ctx.params;
    const body = await parseBody(req, ExpireSchema);
    return json({ task: await expireTask(id, { force: body.force }) });
  });
}

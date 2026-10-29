import { handle, json } from "@/lib/api/http";
import { DomainError } from "@/lib/domain/errors";
import { getTaskDetail } from "@/lib/server/repo";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: RouteContext<"/api/tasks/[id]">) {
  return handle(async () => {
    const { id } = await ctx.params;
    const d = await getTaskDetail(id);
    if (!d) throw new DomainError("not_found", `Task ${id} was not found.`, 404);
    return json(d);
  });
}

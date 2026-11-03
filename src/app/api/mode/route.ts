import { requireOperator } from "@/lib/api/security";
import { liveConfig } from "@/lib/server/primus";
import { handle, json, parseBody } from "@/lib/api/http";
import { ModeSchema } from "@/lib/api/schemas";
import { DomainError } from "@/lib/domain/errors";
import { getMode, setMode } from "@/lib/server/repo";

export const dynamic = "force-dynamic";

export async function GET() {
  return handle(async () => json({ mode: await getMode(), liveConfigured: liveConfig().ready }));
}
export async function POST(req: Request) {
  return handle(async () => {
    requireOperator(req);
    const { mode } = await parseBody(req, ModeSchema);
    if (mode === "live" && !liveConfig().ready)
      throw new DomainError("bad_request", "Live mode needs PRIMUS_APP_ID, PRIMUS_APP_SECRET, PRIMUS_TEMPLATE_ID and PRIMUS_ATTESTORS on the server. See README → Live mode.", 400);
    await setMode(mode);
    return json({ mode });
  });
}

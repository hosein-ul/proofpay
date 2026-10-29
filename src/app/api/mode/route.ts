import { handle, json, parseBody } from "@/lib/api/http";
import { ModeSchema } from "@/lib/api/schemas";
import { DomainError } from "@/lib/domain/errors";
import { getMode, setMode } from "@/lib/server/repo";

export const dynamic = "force-dynamic";

export async function GET() {
  return handle(async () => json({ mode: await getMode(), liveConfigured: !!(process.env.PRIMUS_APP_ID && process.env.PRIMUS_APP_SECRET) }));
}
export async function POST(req: Request) {
  return handle(async () => {
    const { mode } = await parseBody(req, ModeSchema);
    if (mode === "live" && !(process.env.PRIMUS_APP_ID && process.env.PRIMUS_APP_SECRET))
      throw new DomainError("bad_request", "Live mode needs PRIMUS_APP_ID and PRIMUS_APP_SECRET on the server. See README → Live mode.", 400);
    await setMode(mode);
    return json({ mode });
  });
}

import { handle, json } from "@/lib/api/http";
import { listEvents } from "@/lib/server/repo";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  return handle(async () => json({ events: await listEvents(Number(new URL(req.url).searchParams.get("limit") ?? 30)) }));
}

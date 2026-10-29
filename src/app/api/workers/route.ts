import { handle, json } from "@/lib/api/http";
import { workerStats } from "@/lib/server/repo";

export const dynamic = "force-dynamic";

export async function GET() {
  return handle(async () => json({ workers: await workerStats() }));
}

import { handle, json, limit } from "@/lib/api/http";
import { seedDemo } from "@/lib/db/seed";
import { requireOperator } from "@/lib/api/security";
import { DomainError } from "@/lib/domain/errors";
import { getMode, ready } from "@/lib/server/repo";

export const dynamic = "force-dynamic";

/** Re-seeds the demo database. Simulation only. */
export async function POST(req: Request) {
  return handle(async () => {
    requireOperator(req, { allowPublicDemo: true });
    limit(req, "reset", process.env.NODE_ENV === "production" ? Number(process.env.RESET_LIMIT ?? 3) : 1000, 10 * 60_000);
    await ready();
    if ((await getMode()) !== "simulation") throw new DomainError("forbidden", "Reset is only available in Simulation.", 403);
    await seedDemo();
    return json({ ok: true });
  });
}

import { handle, json } from "@/lib/api/http";
import { seedDemo } from "@/lib/db/seed";
import { DomainError } from "@/lib/domain/errors";
import { getMode, ready } from "@/lib/server/repo";

export const dynamic = "force-dynamic";

/** Re-seeds the demo database. Simulation only. */
export async function POST() {
  return handle(async () => {
    await ready();
    if ((await getMode()) !== "simulation") throw new DomainError("forbidden", "Reset is only available in Simulation.", 403);
    await seedDemo();
    return json({ ok: true });
  });
}

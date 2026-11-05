import { sql } from "drizzle-orm";
import { getMode, ready } from "@/lib/server/repo";
import { handle, json } from "@/lib/api/http";
import { SIM_ATTESTOR_ADDRESS } from "@/lib/domain/attestation";

export const dynamic = "force-dynamic";

export async function GET() {
  return handle(async () => {
    const t0 = performance.now();
    const db = await ready();
    await db.execute(sql`SELECT 1`);
    const mode = await getMode();
    return json({
      status: "ok",
      time: new Date().toISOString(),
      mode,
      checks: {
        database: { ok: true, ms: Math.round(performance.now() - t0) },
        proofProvider: mode === "simulation" ? { ok: true, detail: "Simulated attestor", attestor: SIM_ATTESTOR_ADDRESS } : { ok: !!process.env.PRIMUS_APP_ID, detail: process.env.PRIMUS_APP_ID ? "Primus credentials present" : "Primus credentials missing" },
        chain: { ok: true, detail: "Base Sepolia (84532), testnet only" },
      },
    });
  });
}

import { sql } from "drizzle-orm";
import { getDb } from "../src/lib/db/client";
import { seedDemo } from "../src/lib/db/seed";

// Reseeds the database named by DATABASE_URL (Postgres), or the local PGlite directory.
// Do not run this against a PGlite directory while `pnpm dev` is using it: PGlite is single-process. Use Settings → Reset instead.
async function main() {
  await seedDemo();
  const db = await getDb();
  const one = async (q: string) => (await db.execute(sql.raw(q))).rows;
  console.log((await one("SELECT (SELECT COUNT(*) FROM workers) workers, (SELECT COUNT(*) FROM tasks) tasks, (SELECT COUNT(*) FROM events) events, (SELECT COUNT(*) FROM ledger) ledger, (SELECT COUNT(*) FROM attestations) attestations"))[0]);
  console.log(await one("SELECT state, COUNT(*)::int n FROM tasks GROUP BY state ORDER BY n DESC"));
  console.log("escrow balance (micro):", (await one("SELECT COALESCE(SUM(CASE WHEN kind='escrow_in' THEN amount ELSE -amount END),0) b FROM ledger"))[0]);
  process.exit(0);
}
main();

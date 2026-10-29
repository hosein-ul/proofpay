import { seedDemo } from "../src/lib/db/seed";
import { getDbHandle } from "../src/lib/db/client";

async function main() {
  await seedDemo();
  const { raw } = getDbHandle();
  const n = (t: string) => (raw.prepare(`SELECT COUNT(*) n FROM ${t}`).get() as { n: number }).n;
  const states = raw.prepare("SELECT state, COUNT(*) n FROM tasks GROUP BY state ORDER BY n DESC").all();
  console.log({ workers: n("workers"), tasks: n("tasks"), events: n("events"), ledger: n("ledger"), attestations: n("attestations") });
  console.log(states);
  const range = raw.prepare("SELECT MIN(at) a, MAX(at) b FROM ledger").get();
  console.log(range);
  const bal = raw.prepare("SELECT balance_after b FROM ledger ORDER BY at DESC LIMIT 1").get();
  console.log("escrow balance (micro):", bal);
}
main();

import type { Metadata } from "next";
import { PageHero, Section } from "@/components/site/prose";
import { Chip } from "@/components/ui/chips";
import { sql } from "drizzle-orm";
import { getMode, ready } from "@/lib/server/repo";

export const metadata: Metadata = { title: "Status" };
export const dynamic = "force-dynamic";

export default async function Status() {
  const t0 = performance.now();
  let db = false;
  let mode = "simulation";
  try { const d = await ready(); await d.execute(sql`SELECT 1`); db = true; mode = await getMode(); } catch {}
  const ms = Math.round(performance.now() - t0);
  const rows = [
    ["Web app and API", db, db ? `Responding in ${ms} ms` : "Not responding"],
    ["Database", db, db ? "Reachable" : "Unreachable"],
    ["Proof provider", true, mode === "simulation" ? "Simulated attestor" : "Primus (Live)"],
    ["Chain", true, "Base Sepolia, testnet only"],
  ] as const;
  return (
    <>
      <PageHero eyebrow="Status" title={db ? "All systems running" : "Something is degraded"} lead="Checked just now, from this server. There is no historical uptime figure to show yet." />
      <Section>
        <ul className="grid max-w-[720px] gap-2">
          {rows.map(([n, ok, d]) => (
            <li key={n} className="flex items-center gap-3 rounded-panel bg-raised px-5 py-4 shadow-rest"><span className="flex-1 text-[15px] font-medium">{n}</span><span className="text-[13.5px] text-text-2">{d}</span><Chip tone={ok ? "ok" : "bad"}>{ok ? "Operational" : "Down"}</Chip></li>
          ))}
        </ul>
      </Section>
    </>
  );
}

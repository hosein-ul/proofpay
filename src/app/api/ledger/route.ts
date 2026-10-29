import { handle, json } from "@/lib/api/http";
import { listLedger } from "@/lib/server/repo";
import { formatUsdc } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  return handle(async () => {
    const sp = new URL(req.url).searchParams;
    const entries = await listLedger({ kind: sp.get("kind") ?? undefined, taskId: sp.get("task") ?? undefined });
    if (sp.get("format") === "csv") {
      const head = "id,at,kind,task,debit,credit,amount_usdc,escrow_balance_usdc,tx,mode";
      const esc = (s: string) => `"${s.replace(/"/g, '""')}"`;
      const rows = entries.map((e) => [e.id, e.at, e.kind, e.taskId, esc(e.debit), esc(e.credit), formatUsdc(e.amount, { full: true }), formatUsdc(e.balanceAfter, { full: true }), e.txHash ?? "", "simulation (demo data)"].join(","));
      return new Response([head, ...rows].join("\n"), { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": 'attachment; filename="proofpay-ledger-demo.csv"', "cache-control": "no-store" } });
    }
    return json({ entries });
  });
}

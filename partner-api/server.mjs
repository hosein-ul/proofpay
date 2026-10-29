// Demo partner API. A stand-in for "a source of truth" that a Primus template can attest.
// Zero dependencies. Run: PARTNER_TOKEN=... node server.mjs   (PORT defaults to 4010)
// Deploy it somewhere public to use it with Live mode: an attestor cannot reach localhost.
import { createServer } from "node:http";
import { timingSafeEqual } from "node:crypto";

const TOKEN = process.env.PARTNER_TOKEN ?? "";
const PORT = Number(process.env.PORT ?? 4010);

// Demo data. Not real campaigns or jobs.
const CAMPAIGNS = {
  cmp_ada: { name: "Q4 growth campaign (demo)", conversions: 1340, clicks: 18210, spend_usd: 48210.55, updated: "2026-10-28T09:00:00Z" },
  cmp_kestrel: { name: "Lead-gen batch (demo)", conversions: 412, clicks: 6120, spend_usd: 9120.0, updated: "2026-10-28T09:00:00Z" },
};
const JOBS = {
  job_204: { name: "Docs migration (demo)", status: "completed", progress: 100, items_done: 482, items_total: 482 },
  job_205: { name: "Backfill (demo)", status: "running", progress: 61, items_done: 294, items_total: 482 },
};

const same = (a, b) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));
const send = (res, code, body) => { res.writeHead(code, { "content-type": "application/json", "cache-control": "no-store" }); res.end(JSON.stringify(body)); };

export const server = createServer((req, res) => {
  const url = new URL(req.url ?? "/", "http://x");
  if (req.method !== "GET") return send(res, 405, { error: "method_not_allowed" });
  if (url.pathname === "/health") return send(res, 200, { status: "ok", demo: true });

  if (TOKEN) {
    const given = (req.headers.authorization ?? "").replace(/^Bearer\s+/i, "");
    if (!same(given, TOKEN)) return send(res, 401, { error: "unauthorized", hint: "Send Authorization: Bearer <PARTNER_TOKEN>" });
  }
  let m = url.pathname.match(/^\/campaigns\/([\w-]+)\/stats$/);
  if (m) return CAMPAIGNS[m[1]] ? send(res, 200, CAMPAIGNS[m[1]]) : send(res, 404, { error: "not_found" });
  m = url.pathname.match(/^\/jobs\/([\w-]+)$/);
  if (m) return JOBS[m[1]] ? send(res, 200, JOBS[m[1]]) : send(res, 404, { error: "not_found" });
  send(res, 404, { error: "not_found" });
});

if (import.meta.url === `file://${process.argv[1]}`) server.listen(PORT, () => console.log(`partner-api (demo data) on :${PORT}${TOKEN ? " (token required)" : " (open: set PARTNER_TOKEN to require auth)"}`));

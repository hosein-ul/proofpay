import test from "node:test";
import assert from "node:assert/strict";

process.env.PARTNER_TOKEN = "test-token";
const { server } = await import("./server.mjs");
await new Promise((r) => server.listen(0, r));
const base = `http://127.0.0.1:${server.address().port}`;
const get = (p, token) => fetch(base + p, { headers: token ? { authorization: `Bearer ${token}` } : {} });

test("health is open", async () => assert.equal((await get("/health")).status, 200));
test("stats need the token", async () => assert.equal((await get("/campaigns/cmp_ada/stats")).status, 401));
test("wrong token is rejected", async () => assert.equal((await get("/campaigns/cmp_ada/stats", "nope")).status, 401));
test("campaign stats", async () => { const r = await get("/campaigns/cmp_ada/stats", "test-token"); assert.equal(r.status, 200); assert.equal((await r.json()).conversions, 1340); });
test("job status", async () => { const r = await get("/jobs/job_204", "test-token"); assert.equal((await r.json()).status, "completed"); });
test("unknown id is 404", async () => assert.equal((await get("/jobs/nope", "test-token")).status, 404));
test.after(() => server.close());

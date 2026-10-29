import { expect, test } from "@playwright/test";

test.beforeEach(async ({ request }) => {
  const r = await request.post("/api/demo/reset");
  expect(r.ok()).toBeTruthy();
});

test("a persistent Simulation badge is visible in the app", async ({ page }) => {
  await page.goto("/app");
  await expect(page.getByText("Simulation").first()).toBeVisible();
  await expect(page.getByText(/no real funds move/i)).toBeVisible();
});

test("create → fund → prove → verified → settled", async ({ page }) => {
  await page.goto("/app/tasks/new"); // the default role is payer
  await page.getByRole("button", { name: /Ada/ }).first().click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: /Campaign/i }).first().click();
  await page.getByRole("button", { name: "Continue" }).click(); // source → condition
  await page.getByRole("button", { name: "Continue" }).click(); // condition → terms
  await page.getByPlaceholder("2,500").fill("1200");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByRole("heading", { name: "Review and fund" })).toBeVisible();
  await page.getByRole("button", { name: /Fund 1,200\.00 USDC/ }).click();
  await expect(page.getByRole("heading", { name: "Escrow funded" })).toBeVisible();
  await page.getByRole("link", { name: "Open the task" }).click();
  await page.waitForURL(/\/app\/tasks\/tsk_/);

  await page.evaluate(() => localStorage.setItem("pp-role", "worker"));
  await page.reload();
  await page.getByRole("button", { name: "Generate proof" }).first().click();
  await page.getByRole("dialog").getByRole("button", { name: "Generate and verify" }).click();
  await expect(page.getByText(/Settled/).first()).toBeVisible({ timeout: 15_000 });
});

test("a proof that fails shows which check failed and keeps funds locked", async ({ request }) => {
  const workers = await (await request.get("/api/workers")).json();
  const ada = (workers.workers ?? workers)[0];
  const create = await request.post("/api/tasks", { data: { title: "E2E fail", workerId: ada.worker?.id ?? ada.id, amountUsdc: 100, deadline: new Date(Date.now() + 864e5).toISOString(), refundPolicy: "auto", condition: { sourceId: "demo-campaign", sourceName: "Campaign stats", url: "https://partner.example/campaigns/cmp_ada/stats", method: "GET", jsonPath: "$.conversions", metric: "conversions", op: ">=", threshold: 1200, disclosure: "threshold" } } });
  const { task } = await create.json();
  await request.post(`/api/tasks/${task.id}/fund`, { headers: { "idempotency-key": `e2e-${task.id}` } });
  const r = await (await request.post(`/api/tasks/${task.id}/proof`, { data: { value: 10 } })).json();
  expect(r.settled).toBe(false);
  expect(r.verification.error).toBe("condition_not_met");
  const after = await (await request.get(`/api/tasks/${task.id}`)).json();
  expect((after.task ?? after).state).toBe("awaiting_proof");
});

test("an idempotent retry does not fund twice", async ({ request }) => {
  const workers = await (await request.get("/api/workers")).json();
  const w = (workers.workers ?? workers)[0];
  const body = { title: "E2E idem", workerId: w.worker?.id ?? w.id, amountUsdc: 50, deadline: new Date(Date.now() + 864e5).toISOString(), refundPolicy: "auto", condition: { sourceId: "demo-job", sourceName: "Job status", url: "https://partner.example/jobs/job_204", method: "GET", jsonPath: "$.progress", metric: "progress", op: ">=", threshold: 100, disclosure: "threshold" } };
  const { task } = await (await request.post("/api/tasks", { data: body })).json();
  const h = { "idempotency-key": `idem-${task.id}` };
  const a = await request.post(`/api/tasks/${task.id}/fund`, { headers: h });
  const b = await request.post(`/api/tasks/${task.id}/fund`, { headers: h });
  expect(a.status()).toBe(200);
  expect(b.status()).toBe(200);
  expect(b.headers()["idempotent-replayed"]).toBe("true");
});

test("expiry → refund (Simulation fast-forward)", async ({ page, request }) => {
  const list = await (await request.get("/api/tasks?state=awaiting_proof")).json();
  const t = (list.tasks ?? list)[0];
  await request.post(`/api/tasks/${t.id}/expire`, { data: { force: true } });
  const r = await request.post(`/api/tasks/${t.id}/refund`);
  expect(r.ok()).toBeTruthy();
  await page.goto(`/app/tasks/${t.id}`);
  await expect(page.getByText(/Refunded/).first()).toBeVisible();
});

test("dispute → resolve", async ({ request }) => {
  const list = await (await request.get("/api/tasks?state=awaiting_proof")).json();
  const t = (list.tasks ?? list)[0];
  expect((await request.post(`/api/tasks/${t.id}/dispute`, { data: { note: "The source figure looks wrong" } })).ok()).toBeTruthy();
  const res = await request.post(`/api/tasks/${t.id}/resolve`, { data: { outcome: "refund", note: "ok" } });
  expect(res.ok()).toBeTruthy();
  const after = await (await request.get(`/api/tasks/${t.id}`)).json();
  expect((after.task ?? after).state).toBe("resolved");
});

test("request access: validation, then success", async ({ page }) => {
  await page.goto("/request-access");
  await page.getByRole("button", { name: "Request early access" }).last().click();
  await expect(page.getByText("Enter a work email.")).toBeVisible();
  await page.getByLabel("Work email").fill("tester@example.com");
  await page.getByRole("textbox", { name: "Company" }).fill("Example Co");
  await page.getByLabel(/What would you pay for/).fill("Pay an agency per verified conversion target.");
  await page.getByRole("button", { name: "Request early access" }).last().click();
  await expect(page.getByRole("heading", { name: "Request received" })).toBeVisible();
});

test("the site never claims what it must not", async ({ page }) => {
  for (const p of ["/", "/product", "/security", "/developers", "/about"]) {
    await page.goto(p);
    const text = (await page.locator("main").innerText()).toLowerCase();
    for (const bad of ["audited by", "bank-grade", "fully regulated", "is regulated", "insured", "trustless", "guaranteed"]) expect(text, `${p} contains "${bad}"`).not.toContain(bad);
  }
});

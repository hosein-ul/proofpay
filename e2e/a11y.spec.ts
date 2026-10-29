import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const PAGES = ["/", "/product", "/security", "/developers", "/developers/api", "/request-access", "/use-cases/ad-campaigns", "/app", "/app/tasks", "/app/tasks/new", "/app/proofs", "/app/ledger", "/app/workers", "/app/tools", "/app/settings", "/design"];

for (const theme of ["light", "dark"] as const) {
  for (const path of PAGES) {
    test(`a11y ${theme} ${path}`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: theme });
      await page.goto(path);
      await page.waitForTimeout(600);
      const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
      const v = r.violations.map((x) => `${x.id} (${x.impact}) x${x.nodes.length}: ${x.nodes[0].target.join(" ")}`);
      expect(v, v.join("\n")).toEqual([]);
    });
  }
}

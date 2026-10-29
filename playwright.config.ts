import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.E2E_PORT ?? 3111);
export default defineConfig({
  testDir: "e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
    ...devices["Desktop Chrome"],
    // Set PW_CHROMIUM=/path/to/chrome to use a browser that is already installed (e.g. in CI images).
    launchOptions: process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM, args: ["--no-sandbox"] } : {},
  },
  // Reuses a running dev server; otherwise starts one on the chosen port.
  webServer: { command: `pnpm dev -p ${PORT}`, url: `http://localhost:${PORT}/api/health`, reuseExistingServer: true, timeout: 120_000 },
});

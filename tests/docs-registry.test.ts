import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { ENDPOINTS } from "@/lib/api/docs";

describe("API docs registry", () => {
  it("maps every documented endpoint to a route file", () => {
    for (const e of ENDPOINTS) expect(existsSync(`src/app/api/${e.file}/route.ts`), e.path).toBe(true);
  });
});

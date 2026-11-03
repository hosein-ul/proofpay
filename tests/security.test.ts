import { describe, expect, it } from "vitest";
import { csvCell, safeEqual } from "@/lib/api/security";

describe("security helpers", () => {
  it("neutralises spreadsheet formulas in CSV cells", () => {
    for (const bad of ["=HYPERLINK(\"http://x\")", "+1+1", "-2+3", "@SUM(A1)", "\t=1", "\r=1"]) expect(csvCell(bad).startsWith(`"'`)).toBe(true);
    expect(csvCell("Ada")).toBe('"Ada"');
    expect(csvCell('say "hi"')).toBe('"say ""hi"""');
  });
  it("compares secrets without short-circuiting on content", () => {
    expect(safeEqual("abc", "abc")).toBe(true);
    expect(safeEqual("abc", "abd")).toBe(false);
    expect(safeEqual("abc", "abcd")).toBe(false);
  });
});

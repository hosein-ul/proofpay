import "server-only";
import { timingSafeEqual } from "node:crypto";
import { DomainError } from "@/lib/domain/errors";

/** Constant-time string comparison (length is not secret here, the contents are). */
export function safeEqual(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export function hasAdminToken(req: Request): boolean {
  const token = process.env.ADMIN_TOKEN;
  const given = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  return !!token && safeEqual(given, token);
}

/**
 * Operator actions (switching mode, wiping demo data) must not be open to the internet on a deployed server.
 * Outside production they stay open for local work. In production they need ADMIN_TOKEN, except that a public
 * Simulation demo may opt in to resets with PUBLIC_DEMO=1 (rate limited by the caller).
 */
export function requireOperator(req: Request, opts: { allowPublicDemo?: boolean } = {}) {
  if (process.env.NODE_ENV !== "production") return;
  if (opts.allowPublicDemo && process.env.PUBLIC_DEMO === "1") return;
  if (!hasAdminToken(req)) throw new DomainError("forbidden", "This action needs the operator token.", 401);
}

/** Spreadsheet apps run text that starts with = + - @ as a formula. Neutralise it in exported cells. */
export function csvCell(v: string): string {
  const safe = /^[=+\-@\t\r]/.test(v) ? `'${v}` : v;
  return `"${safe.replace(/"/g, '""')}"`;
}

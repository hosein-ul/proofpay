import "server-only";
import { ZodError, type ZodType } from "zod";
import { DomainError, PROOF_ERRORS } from "@/lib/domain/errors";
import type { ProofErrorCode } from "@/lib/domain/types";
import { rateLimit } from "@/lib/server/service";

export function json<T>(body: T, init: ResponseInit & { status?: number } = {}) {
  return Response.json(body, { ...init, headers: { "cache-control": "no-store", ...(init.headers ?? {}) } });
}

export function errorResponse(e: unknown) {
  if (e instanceof DomainError) {
    const info = PROOF_ERRORS[e.code as ProofErrorCode];
    return json({ error: { code: e.code, message: e.message, recovery: info?.recovery } }, { status: e.status });
  }
  if (e instanceof ZodError) {
    return json({ error: { code: "bad_request", message: "The request body is not valid.", issues: e.issues.map((i) => ({ path: i.path.join("."), message: i.message })) } }, { status: 400 });
  }
  // Never log secrets or request bodies. Structured, minimal.
  console.error(JSON.stringify({ level: "error", msg: "unhandled", name: (e as Error)?.name, message: (e as Error)?.message }));
  return json({ error: { code: "internal", message: "Something went wrong on our side. Nothing was changed." } }, { status: 500 });
}

export async function parseBody<T>(req: Request, schema: ZodType<T>): Promise<T> {
  let raw: unknown = {};
  const text = await req.text();
  if (text) {
    try {
      raw = JSON.parse(text);
    } catch {
      throw new DomainError("bad_request", "The request body is not valid JSON.", 400);
    }
  }
  return schema.parse(raw);
}

export function clientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "local";
}

export function limit(req: Request, bucket: string, n = 20, windowMs = 60_000) {
  const r = rateLimit(`${bucket}:${clientIp(req)}`, n, windowMs);
  if (!r.ok) throw new DomainError("rate_limited", "Too many requests. Wait a moment and try again.", 429);
  return r;
}

export async function handle(fn: () => Promise<Response>): Promise<Response> {
  try {
    return await fn();
  } catch (e) {
    return errorResponse(e);
  }
}

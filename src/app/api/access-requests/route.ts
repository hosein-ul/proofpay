import { createHash } from "node:crypto";
import { handle, json, limit, parseBody, clientIp } from "@/lib/api/http";
import { AccessRequestSchema } from "@/lib/api/schemas";
import { getDbHandle, schema } from "@/lib/db/client";
import { ready } from "@/lib/server/repo";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  return handle(async () => {
    const body = await parseBody(req, AccessRequestSchema);
    // Rate limit real attempts only; an invalid form costs nothing. Looser outside production so tests can repeat.
    limit(req, "access", process.env.NODE_ENV === "production" ? 5 : 100, 10 * 60_000);
    // Honeypot filled → pretend success so bots learn nothing.
    if (body.website) return json({ ok: true }, { status: 201 });
    await ready();
    const { db } = getDbHandle();
    db.insert(schema.accessRequests)
      .values({
        id: `ar_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
        email: body.email,
        company: body.company,
        useCase: body.useCase,
        volume: body.volume,
        createdAt: new Date().toISOString(),
        ipHash: createHash("sha256").update(clientIp(req) + (process.env.IP_SALT ?? "pp")).digest("hex").slice(0, 16),
      })
      .run();
    return json({ ok: true }, { status: 201 });
  });
}

import { handle, json } from "@/lib/api/http";
import { DomainError } from "@/lib/domain/errors";
import { listAccessRequests } from "@/lib/server/repo";

export const dynamic = "force-dynamic";

/** Admin-only. Send `Authorization: Bearer $ADMIN_TOKEN`. */
export async function GET(req: Request) {
  return handle(async () => {
    const token = process.env.ADMIN_TOKEN;
    const given = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    if (!token || given !== token) throw new DomainError("forbidden", "Admin token required.", 401);
    return json({ requests: await listAccessRequests() });
  });
}

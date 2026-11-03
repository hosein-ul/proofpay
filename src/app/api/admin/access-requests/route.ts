import { handle, json } from "@/lib/api/http";
import { hasAdminToken } from "@/lib/api/security";
import { DomainError } from "@/lib/domain/errors";
import { listAccessRequests } from "@/lib/server/repo";

export const dynamic = "force-dynamic";

/** Admin-only. Send `Authorization: Bearer $ADMIN_TOKEN`. */
export async function GET(req: Request) {
  return handle(async () => {
    if (!hasAdminToken(req)) throw new DomainError("forbidden", "Admin token required.", 401);
    return json({ requests: await listAccessRequests() });
  });
}

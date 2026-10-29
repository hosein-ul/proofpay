import { handle, json } from "@/lib/api/http";
import { getOverview } from "@/lib/server/repo";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  return handle(async () => {
    const r = Number(new URL(req.url).searchParams.get("range") ?? 30);
    return json(await getOverview([7, 30, 90].includes(r) ? r : 30));
  });
}

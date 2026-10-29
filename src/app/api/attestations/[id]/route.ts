import { handle, json } from "@/lib/api/http";
import { DomainError } from "@/lib/domain/errors";
import { getAttestation } from "@/lib/server/repo";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: RouteContext<"/api/attestations/[id]">) {
  return handle(async () => {
    const { id } = await ctx.params;
    const a = await getAttestation(id);
    if (!a) throw new DomainError("not_found", "Attestation not found.", 404);
    // The verifier-side view only: private fields never leave the worker side.
    const { privateFields: _pf, ...publicAtt } = a.attestation;
    void _pf;
    return json({ attestation: publicAtt, verification: a.verification, simulated: a.attestation.simulated });
  });
}

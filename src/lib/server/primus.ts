import "server-only";
import { DomainError } from "@/lib/domain/errors";
import { attConditionsFor, taskAdditionParams } from "@/lib/domain/condition";
import type { Task, Worker } from "@/lib/domain/types";

export function liveConfig() {
  const appId = process.env.PRIMUS_APP_ID;
  const appSecret = process.env.PRIMUS_APP_SECRET;
  const templateId = process.env.PRIMUS_TEMPLATE_ID;
  const attestors = (process.env.PRIMUS_ATTESTORS ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  return { appId, appSecret, templateId, attestors, ready: !!(appId && appSecret && templateId && attestors.length) };
}

/**
 * Builds the request the worker's browser hands to the Primus extension, and signs it with the app secret.
 * The secret stays on the server; the browser only receives the signed string. Calls `PrimusZKTLS.init/generateRequestParams/sign`
 * exactly as typed in @primuslabs/zktls-js-sdk@0.3.15. Not exercised against Primus' service in this repo (D6).
 */
export async function signAttestationRequest(task: Task, worker: Worker): Promise<{ attRequest: string; templateId: string }> {
  const cfg = liveConfig();
  if (!cfg.ready) throw new DomainError("bad_request", "Live mode needs PRIMUS_APP_ID, PRIMUS_APP_SECRET, PRIMUS_TEMPLATE_ID and PRIMUS_ATTESTORS on the server.", 400);
  const { PrimusZKTLS } = await import("@primuslabs/zktls-js-sdk");
  const zk = new PrimusZKTLS();
  await zk.init(cfg.appId!, cfg.appSecret!);
  const req = zk.generateRequestParams(cfg.templateId!, worker.address, {
    attConditions: JSON.parse(attConditionsFor(task.condition)),
    additionParams: taskAdditionParams(task.id, task.conditionHash),
  });
  const attRequest = await zk.sign(req.toJsonString());
  return { attRequest, templateId: cfg.templateId! };
}

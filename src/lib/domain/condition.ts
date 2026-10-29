import { keccak256, encodePacked, toHex } from "viem";
import { OP_LABEL, type Condition, type Op } from "./types";

export function evaluate(op: Op, value: number, threshold: number): boolean {
  switch (op) {
    case ">=":
      return value >= threshold;
    case ">":
      return value > threshold;
    case "<=":
      return value <= threshold;
    case "<":
      return value < threshold;
    case "=":
      return value === threshold;
    case "!=":
      return value !== threshold;
  }
}

const nf = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
export function conditionText(c: Pick<Condition, "metric" | "op" | "threshold" | "unit">): string {
  return `${c.metric} ${OP_LABEL[c.op]} ${nf.format(c.threshold)}${c.unit ? ` ${c.unit}` : ""}`;
}

/** The Primus `attConditions` value for a comparison: nested arrays of { field, op, value }.
 *  Source: docs.primuslabs.xyz/build/op. Kept canonical (no whitespace) so its hash is stable. */
export function attConditionsFor(c: Condition): string {
  return JSON.stringify([[{ field: c.metric, op: c.op, value: String(c.threshold) }]]);
}

/** conditionHash = keccak256(url ‖ attConditions). The escrow pins this at task creation and
 *  compares it with the hash of the attested request URL and attConditions. */
export function conditionHashOf(c: Condition): `0x${string}` {
  return keccak256(encodePacked(["string", "string"], [c.url, attConditionsFor(c)]));
}

export function taskAdditionParams(taskId: string, conditionHash: string): string {
  return JSON.stringify({ taskId, conditionHash });
}

export function taskIdToBytes32(id: string): `0x${string}` {
  return keccak256(toHex(id));
}

import { Identicon } from "@/components/ui/identicon";
import { Amount } from "@/components/ui/data";
import { Time } from "@/components/ui/copy";
import { conditionText } from "@/lib/domain/condition";
import { isTerminal } from "@/lib/domain/state-machine";
import type { Condition, TaskState, Worker } from "@/lib/domain/types";
import { splitAmount } from "@/lib/format";
import { cn } from "@/lib/utils";

export function WorkerCell({ worker, compact }: { worker: Pick<Worker, "name" | "hue" | "kind">; compact?: boolean }) {
  return (
    <span className="inline-flex min-w-0 items-center gap-2">
      <Identicon name={worker.name} hue={worker.hue} size={compact ? 20 : 24} />
      <span className="truncate">{worker.name}</span>
      {!compact && <span className="hidden rounded-full bg-sunk px-1.5 text-[11px] text-text-3 xl:inline">{worker.kind}</span>}
    </span>
  );
}

export function AmountCell({ micro, unit = "USDC", className }: { micro: number; unit?: string | null; className?: string }) {
  const a = splitAmount(micro);
  return <Amount whole={a.whole} dec={a.dec} unit={unit} className={className} />;
}

export function ConditionSummary({ condition, className }: { condition: Condition; className?: string }) {
  return <span className={cn("text-text-2", className)}>{conditionText(condition)}</span>;
}

export function Deadline({ iso, state }: { iso: string; state: TaskState }) {
  const soon = !isTerminal(state) && state !== "expired" && new Date(iso).getTime() - Date.now() < 12 * 3_600_000 && new Date(iso).getTime() > Date.now();
  return <Time value={iso} className={cn("text-text-2", soon && "font-medium text-warn")} />;
}

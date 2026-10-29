import { Check } from "lucide-react";
import { STATE_LABEL, type TaskState } from "@/lib/domain/types";
import { cn } from "@/lib/utils";

const MAIN: TaskState[] = ["draft", "funded", "awaiting_proof", "proving", "verified", "settled"];
const EXIT: Partial<Record<TaskState, string>> = { expired: "Expired", refunded: "Refunded", disputed: "Disputed", resolved: "Resolved" };

/** The lifecycle as a lit path: past steps solid, current lit, future quiet. Exits shown as a branch. */
export function StateRail({ state }: { state: TaskState }) {
  const exit = EXIT[state];
  const idx = exit ? -1 : MAIN.indexOf(state);
  return (
    <div className="grid gap-3">
      <ol className="flex items-start" aria-label="Task lifecycle">
        {MAIN.map((s, i) => {
          const past = i < idx || (state === "settled" && i <= idx);
          const cur = i === idx && state !== "settled";
          return (
            <li key={s} className="relative flex min-w-0 flex-1 flex-col items-center gap-2 text-center" aria-current={cur ? "step" : undefined}>
              {i > 0 && <span aria-hidden className={cn("absolute right-1/2 top-[11px] h-[2px] w-full", i <= idx ? "bg-light shadow-[0_0_8px_var(--light-glow)]" : "bg-line-strong")} />}
              <span className={cn("relative z-[1] grid size-6 place-items-center rounded-full text-[11px] font-semibold transition-colors", past ? "bg-light text-on-light" : cur ? "bg-raised text-light-text shadow-[0_0_0_2px_var(--light),0_0_0_6px_var(--light-quiet)]" : "bg-sunk text-text-3 shadow-[0_0_0_1px_var(--line-strong)_inset]")}>
                {past || (state === "settled" && i === idx) ? <Check className="size-3.5" strokeWidth={3} /> : i + 1}
              </span>
              <span className={cn("px-0.5 text-[12px] leading-tight", cur || past ? "font-medium text-text" : "text-text-3")}>{STATE_LABEL[s]}</span>
            </li>
          );
        })}
      </ol>
      {exit && (
        <p className="rounded-control bg-warn-quiet px-3 py-2 text-[13px] text-warn">
          This task left the main path: <strong className="font-semibold">{exit}</strong>. {state === "expired" ? "The deadline passed without a valid proof." : state === "disputed" ? "An arbiter will decide." : state === "refunded" ? "The escrow went back to the payer." : "The dispute was resolved."}
        </p>
      )}
    </div>
  );
}

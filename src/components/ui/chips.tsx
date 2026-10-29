import {
  CircleAlert,
  CircleCheck,
  CircleDashed,
  Clock,
  Lock,
  Scale,
  ShieldCheck,
  TimerOff,
  TriangleAlert,
  Undo2,
  LoaderCircle,
  FlaskConical,
  Radio,
} from "lucide-react";
import { STATE_LABEL, STATE_TONE, type Mode, type TaskState, type Tone } from "@/lib/domain/types";
import { cn } from "@/lib/utils";

const TONE: Record<Tone, string> = {
  ok: "bg-ok-quiet text-ok",
  info: "bg-info-quiet text-info",
  warn: "bg-warn-quiet text-warn",
  bad: "bg-bad-quiet text-bad",
  mute: "bg-sunk text-text-2",
};

export function Chip({ tone = "mute", className, children, icon: Icon }: { tone?: Tone; className?: string; children: React.ReactNode; icon?: React.ComponentType<{ className?: string }> }) {
  return (
    <span className={cn("inline-flex h-6 items-center gap-1.5 whitespace-nowrap rounded-chip px-2 text-[12px] font-medium", TONE[tone], className)}>
      {Icon && <Icon className="size-3.5" />}
      {children}
    </span>
  );
}

const STATE_ICON: Record<TaskState, React.ComponentType<{ className?: string }>> = {
  draft: CircleDashed,
  funded: Lock,
  awaiting_proof: Clock,
  proving: LoaderCircle,
  verified: ShieldCheck,
  settled: CircleCheck,
  expired: TimerOff,
  refunded: Undo2,
  disputed: TriangleAlert,
  resolved: Scale,
};

/** Status chip: colour + icon + text, never colour alone. */
export function StatusChip({ state, className }: { state: TaskState; className?: string }) {
  const Icon = STATE_ICON[state];
  return (
    <Chip tone={STATE_TONE[state]} className={className}>
      <Icon className={cn("size-3.5", state === "proving" && "animate-spin [animation-duration:2.4s]")} aria-hidden />
      <span>{STATE_LABEL[state]}</span>
    </Chip>
  );
}

/** Persistent environment badge. Simulation is always visible and never looks like Live. */
export function ModeBadge({ mode, className }: { mode: Mode; className?: string }) {
  if (mode === "live")
    return (
      <span className={cn("inline-flex h-6 items-center gap-1.5 rounded-full bg-ok-quiet px-2.5 text-[12px] font-medium text-ok", className)}>
        <Radio className="size-3.5" aria-hidden /> Live · testnet
      </span>
    );
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1.5 rounded-full border border-dashed border-[color-mix(in_oklab,var(--light)_70%,transparent)] bg-light-quiet px-2.5 text-[12px] font-medium text-light-text",
        className,
      )}
      title="Simulation: proofs are synthetic, no real attestor and no real funds."
    >
      <FlaskConical className="size-3.5" aria-hidden /> Simulation
    </span>
  );
}

/** Small tag for a single simulated artefact (a proof, an export, a demo figure). */
export function SimTag({ label = "Simulated", className }: { label?: string; className?: string }) {
  return (
    <span className={cn("inline-flex h-5 items-center gap-1 rounded-[5px] border border-dashed border-[color-mix(in_oklab,var(--light)_60%,transparent)] px-1.5 text-[11px] font-medium text-light-text", className)}>
      <FlaskConical className="size-3" aria-hidden /> {label}
    </span>
  );
}

export function ErrorChip({ children }: { children: React.ReactNode }) {
  return (
    <Chip tone="bad" icon={CircleAlert}>
      {children}
    </Chip>
  );
}

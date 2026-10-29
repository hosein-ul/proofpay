import { CircleAlert, Info, ShieldAlert, TriangleAlert, CircleCheck } from "lucide-react";
import { PlateStack } from "@/components/brand/plate-stack";
import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton", className)} aria-hidden />;
}

/** Layout-matching skeleton rows for tables. */
export function TableSkeleton({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div role="status" aria-label="Loading" className="divide-y divide-line">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex h-[var(--row-h)] items-center gap-6 px-4">
          {Array.from({ length: cols }, (_, j) => (
            <Skeleton key={j} className={cn("h-3", j === 1 ? "w-48" : "w-20")} />
          ))}
        </div>
      ))}
    </div>
  );
}

/** Purposeful empty state: a short plate stack, one sentence, one clear action. */
export function EmptyState({ title, body, action, className, lit = 1 }: { title: string; body: string; action?: React.ReactNode; className?: string; lit?: number }) {
  return (
    <div className={cn("dots grid place-items-center gap-4 px-6 py-14 text-center", className)}>
      <PlateStack count={3} lit={lit} size={120} />
      <div className="grid max-w-[44ch] gap-1">
        <h3 className="text-[16px] font-semibold tracking-[-0.015em]">{title}</h3>
        <p className="text-[14px] text-text-2">{body}</p>
      </div>
      {action}
    </div>
  );
}

const CALL = {
  info: { icon: Info, cls: "bg-info-quiet text-info" },
  warn: { icon: TriangleAlert, cls: "bg-warn-quiet text-warn" },
  bad: { icon: CircleAlert, cls: "bg-bad-quiet text-bad" },
  ok: { icon: CircleCheck, cls: "bg-ok-quiet text-ok" },
  sim: { icon: ShieldAlert, cls: "bg-light-quiet text-light-text" },
} as const;

export function Callout({ tone = "info", title, children, action, className }: { tone?: keyof typeof CALL; title?: string; children?: React.ReactNode; action?: React.ReactNode; className?: string }) {
  const { icon: Icon, cls } = CALL[tone];
  return (
    <div role={tone === "bad" ? "alert" : "note"} className={cn("flex items-start gap-3 rounded-panel p-3.5 text-[13.5px]", cls, className)}>
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
      <div className="grid flex-1 gap-0.5">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className="text-[13px] leading-relaxed opacity-90 [&_a]:underline">{children}</div>}
      </div>
      {action}
    </div>
  );
}

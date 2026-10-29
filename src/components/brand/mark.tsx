import { plate } from "@/lib/plates";
import { PRODUCT_NAME } from "@/lib/config";
import { cn } from "@/lib/utils";

/** Brand mark: three plates and the beam. Built from the same projection as every other asset. */
export function Mark({ size = 28, className, title }: { size?: number; className?: string; title?: string }) {
  const plates = [0, 1, 2].map((i) => plate(8, 4.2, 14, 6.5 + i * 7.2, 2.2));
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      className={cn("shrink-0", className)}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {[2, 1, 0].map((i) => {
        const p = plates[i];
        const lit = i === 2;
        return (
          <g key={i}>
            <polygon points={p.left} style={{ fill: "var(--slab-l)" }} />
            <polygon points={p.right} style={{ fill: "var(--slab-r)" }} />
            <polygon
              points={p.top}
              style={{ fill: lit ? "var(--light)" : "var(--slab-top)", stroke: lit ? "var(--light)" : "var(--line-strong)", strokeWidth: 0.7 }}
            />
          </g>
        );
      })}
      <rect x="13.4" y="1" width="1.2" height="26" rx="0.6" style={{ fill: "var(--light)" }} opacity="0.95" />
    </svg>
  );
}

export function Logo({ className, size = 26, wordmark = true }: { className?: string; size?: number; wordmark?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <Mark size={size} />
      {wordmark && (
        <span className="text-[17px] leading-none font-semibold tracking-[-0.02em]" style={{ fontVariationSettings: '"wdth" 118' }}>
          {PRODUCT_NAME}
        </span>
      )}
    </span>
  );
}

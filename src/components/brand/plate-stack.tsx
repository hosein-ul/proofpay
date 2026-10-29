import { plate } from "@/lib/plates";
import { cn } from "@/lib/utils";

/** A short stack with a packet of light descending. Used for empty states, loaders and the 404.
 *  Pure CSS animation (see .pp-stack in globals) so it works in server components. */
export function PlateStack({
  count = 4,
  lit = -1,
  animate = true,
  className,
  size = 160,
}: {
  count?: number;
  /** index of the plate that is lit; -1 = all quiet */
  lit?: number;
  animate?: boolean;
  className?: string;
  size?: number;
}) {
  const gap = 34;
  const h = 70 + (count - 1) * gap;
  const plates = Array.from({ length: count }, (_, i) => ({ i, p: plate(70, 32, 110, 44 + i * gap, 8) }));
  return (
    <svg
      viewBox={`0 0 220 ${h}`}
      width={size}
      height={(size * h) / 220}
      className={cn("pp-stack overflow-visible", className)}
      aria-hidden
      data-animate={animate ? "" : undefined}
      style={{ ["--travel" as string]: `${h - 44}px` }}
    >
      {[...plates].reverse().map(({ i, p }) => {
        const on = lit === i || (animate && lit < 0);
        return (
          <g key={i} className="pp-stack-plate" style={{ ["--i" as string]: i, ["--n" as string]: count }}>
            <polygon points={p.left} style={{ fill: "var(--slab-l)" }} />
            <polygon points={p.right} style={{ fill: "var(--slab-r)" }} />
            <polygon
              points={p.top}
              className="pp-stack-top"
              style={{
                fill: "var(--slab-top)",
                stroke: lit === i ? "var(--light)" : "var(--line-strong)",
                strokeWidth: lit === i ? 1.6 : 1,
              }}
              data-on={on ? "" : undefined}
            />
          </g>
        );
      })}
      <line x1="110" x2="110" y1="30" y2={h - 14} style={{ stroke: "var(--light)", strokeWidth: 1.5 }} opacity="0.45" />
      {animate && <circle className="pp-stack-packet" cx="110" cy="30" r="4.5" style={{ fill: "var(--light)" }} />}
    </svg>
  );
}

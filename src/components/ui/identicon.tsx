import { cn } from "@/lib/utils";

/** Deterministic avatar from a name + hue: a small stack of plates. Distinct, not a letter in a circle. */
export function Identicon({ name, hue, size = 28, className }: { name: string; hue: number; size?: number; className?: string }) {
  const initials = name
    .replace(/[^\p{L}\s]/gu, "")
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <span
      aria-hidden
      className={cn("relative inline-grid shrink-0 place-items-center overflow-hidden rounded-[9px] font-semibold text-white", className)}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        background: `linear-gradient(145deg, oklch(0.62 0.15 ${hue}), oklch(0.42 0.13 ${(hue + 40) % 360}))`,
        boxShadow: "inset 0 1px 0 rgb(255 255 255 / .35), 0 0 0 1px rgb(0 0 0 / .08)",
      }}
    >
      <span className="absolute inset-x-0 top-0 h-1/2 bg-[linear-gradient(180deg,rgb(255_255_255/.22),transparent)]" />
      <span className="relative">{initials}</span>
    </span>
  );
}

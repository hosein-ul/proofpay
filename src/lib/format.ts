const usd = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const usd6 = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 6,
  maximumFractionDigits: 6,
});

/** USDC amounts are stored as integer micro-units (6 decimals). */
export const USDC_DECIMALS = 6;

export function microToNumber(micro: number | bigint): number {
  return Number(micro) / 10 ** USDC_DECIMALS;
}
export function toMicro(amount: number): number {
  return Math.round(amount * 10 ** USDC_DECIMALS);
}
export function formatUsdc(micro: number | bigint, opts: { full?: boolean } = {}): string {
  const n = microToNumber(micro);
  return (opts.full ? usd6 : usd).format(n);
}
/** Split "48,210.55" into whole + decimals so UIs can dim the decimals. */
export function splitAmount(micro: number | bigint): { whole: string; dec: string } {
  const s = formatUsdc(micro);
  const i = s.lastIndexOf(".");
  return { whole: s.slice(0, i), dec: s.slice(i) };
}
export function formatCompact(n: number): string {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n);
}
export function formatPercent(n: number, digits = 1): string {
  return `${n.toFixed(digits)}%`;
}

const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
export function relativeTime(iso: string | number | Date, now: number = Date.now()): string {
  const t = new Date(iso).getTime();
  const diff = t - now;
  const abs = Math.abs(diff);
  const m = 60_000;
  const h = 60 * m;
  const d = 24 * h;
  if (abs < m) return "just now";
  if (abs < h) return rtf.format(Math.round(diff / m), "minute");
  if (abs < d) return rtf.format(Math.round(diff / h), "hour");
  if (abs < 30 * d) return rtf.format(Math.round(diff / d), "day");
  return absoluteDate(t);
}
export function absoluteDate(iso: string | number | Date): string {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(iso));
}
export function absoluteDateTime(iso: string | number | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
    timeZoneName: "short",
  }).format(new Date(iso));
}
export function shortDate(iso: string | number | Date): string {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(iso));
}
export function duration(ms: number): string {
  const m = Math.round(ms / 60000);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return mm ? `${h}h ${mm}m` : `${h}h`;
}
export function truncateMiddle(s: string, head = 6, tail = 4): string {
  if (s.length <= head + tail + 1) return s;
  return `${s.slice(0, head)}…${s.slice(-tail)}`;
}

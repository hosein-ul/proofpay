"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { formatCompact, formatUsdc, shortDate } from "@/lib/format";

/** Settlement volume: thin line, soft area fill, direct label on the last point, aligned tooltip. */
export function VolumeChart({ data, height = 220 }: { data: { day: string; amount: number }[]; height?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(640);
  const [hover, setHover] = useState<number | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(280, Math.round(e.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const padL = 44;
  const padR = 12;
  const padT = 14;
  const padB = 24;
  const { max, ticks } = useMemo(() => {
    const vals = data.map((d) => d.amount / 1e6);
    const mx = Math.max(1, ...vals) * 1.12;
    const niceStep = Math.pow(10, Math.floor(Math.log10(mx / 3)));
    const step = [1, 2, 5, 10].map((m) => m * niceStep).find((s) => mx / s <= 4) ?? niceStep * 10;
    const t: number[] = [];
    for (let v = 0; v <= mx; v += step) t.push(v);
    return { max: mx, ticks: t };
  }, [data]);
  const n = data.length;
  const step = (w - padL - padR) / n;
  const bw = Math.max(3, Math.min(22, step * 0.62));
  const ma = data.map((_, i) => {
    const sl = data.slice(Math.max(0, i - 6), i + 1);
    return sl.reduce((a, d) => a + d.amount, 0) / sl.length / 1e6;
  });
  const y = (v: number) => padT + (1 - v / max) * (height - padT - padB);
  const x = (i: number) => padL + step * i + step / 2;
  const maLine = ma.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join("");
  const total = data.reduce((s, d) => s + d.amount, 0);
  return (
    <div ref={ref} className="relative" onPointerLeave={() => setHover(null)}>
      <svg
        width={w}
        height={height}
        role="img"
        aria-label={`Settlement volume over ${data.length} days, total ${formatUsdc(total)} USDC. Demo data.`}
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          const px = e.clientX - r.left;
          const i = Math.floor((px - padL) / step);
          setHover(Math.min(n - 1, Math.max(0, i)));
        }}
      >
        <defs>
          <linearGradient id="vc-bar" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="var(--light-hi)" stopOpacity="0.95" />
            <stop offset="1" stopColor="var(--light)" stopOpacity="0.55" />
          </linearGradient>
        </defs>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={padL} x2={w - padR} y1={y(t)} y2={y(t)} stroke="var(--line)" />
            <text x={padL - 8} y={y(t) + 4} textAnchor="end" className="num" fontSize="11" fill="var(--text-3)">
              {formatCompact(t)}
            </text>
          </g>
        ))}
        {data.map((d, i) => {
          const h = Math.max(d.amount > 0 ? 2 : 0, (d.amount / 1e6 / max) * (height - padT - padB));
          return <rect key={d.day} x={x(i) - bw / 2} y={height - padB - h} width={bw} height={h} rx={Math.min(3, bw / 3)} fill="url(#vc-bar)" opacity={hover === null || hover === i ? 1 : 0.55} />;
        })}
        <path d={maLine} fill="none" stroke="var(--text)" strokeOpacity="0.55" strokeWidth="1.5" strokeLinejoin="round" strokeDasharray="1 0" />
        {[0, Math.floor(n / 2), n - 1].map((i) => (
          <text key={i} x={x(i)} y={height - 6} textAnchor={i === 0 ? "start" : i === n - 1 ? "end" : "middle"} fontSize="11" fill="var(--text-3)">
            {shortDate(data[i].day)}
          </text>
        ))}
        {hover !== null && <line x1={x(hover)} x2={x(hover)} y1={padT} y2={height - padB} stroke="var(--line-strong)" />}
      </svg>
      {hover !== null && (
        <div className="pointer-events-none absolute z-10 -translate-x-1/2 rounded-[8px] bg-ink-band px-2.5 py-1.5 text-[12px] text-ink-band-text shadow-float" style={{ left: Math.min(w - 80, Math.max(80, x(hover))), top: Math.max(0, y(data[hover].amount / 1e6) - 58) }}>
          <p className="text-ink-band-text-2">{shortDate(data[hover].day)}</p>
          <p className="num font-medium">{formatUsdc(data[hover].amount)} USDC</p>
          <p className="num text-ink-band-text-2">7-day avg {formatCompact(ma[hover])}</p>
        </div>
      )}
    </div>
  );
}

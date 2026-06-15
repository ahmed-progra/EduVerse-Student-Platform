"use client";

import type { GrowthPoint } from "@/types/mentor";

/**
 * Lightweight inline-SVG area chart of cumulative XP over time.
 * No charting dependency — scales to its container via viewBox.
 */
export function GrowthChart({ data }: { data: GrowthPoint[] }) {
  if (!data || data.length < 2) {
    return (
      <p className="text-sm text-eduverse-text-muted">
        Not enough activity yet to chart your growth. Complete a few lessons and your XP curve will appear here.
      </p>
    );
  }

  const W = 640;
  const H = 180;
  const pad = 10;
  const maxXp = Math.max(...data.map((d) => d.xp), 1);
  const minXp = Math.min(...data.map((d) => d.xp));
  const span = Math.max(1, maxXp - minXp);
  const x = (i: number) => pad + (i / (data.length - 1)) * (W - pad * 2);
  const y = (v: number) => H - pad - ((v - minXp) / span) * (H - pad * 2.4);

  const line = data.map((d, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(d.xp).toFixed(1)}`).join(" ");
  const area = `${line} L ${x(data.length - 1).toFixed(1)} ${(H - pad).toFixed(1)} L ${x(0).toFixed(1)} ${(H - pad).toFixed(1)} Z`;
  const last = data[data.length - 1];

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Cumulative XP over time">
        <defs>
          <linearGradient id="mentorGrowthFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-eduverse-accent)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--color-eduverse-accent)" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#mentorGrowthFill)" />
        <path d={line} fill="none" stroke="var(--color-eduverse-accent)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        <circle cx={x(data.length - 1)} cy={y(last.xp)} r="4" fill="var(--color-eduverse-accent)" />
      </svg>
      <div className="flex items-center justify-between mt-1 text-xs text-eduverse-text-muted font-mono">
        <span>{data[0].date}</span>
        <span className="text-eduverse-accent font-semibold">{last.xp.toLocaleString()} XP</span>
        <span>{last.date}</span>
      </div>
    </div>
  );
}

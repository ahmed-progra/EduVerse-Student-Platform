"use client";

import { Gauge, Brain, Flame, Zap, BookOpen } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface MetricTilesProps {
  level: number;
  xp: number;
  learningSpeed: string;
  retention: number;
  momentum: number;
  lessonsCompleted: number;
}

const speedLabel: Record<string, string> = { slow: "Steady climb", steady: "On pace", fast: "Fast learner" };

/** The "current skill assessment" strip on the coach dashboard. */
export function MetricTiles({ level, xp, learningSpeed, retention, momentum, lessonsCompleted }: MetricTilesProps) {
  const tiles: { label: string; value: string; sub?: string; icon: LucideIcon }[] = [
    { label: "Level", value: String(level), sub: `${xp.toLocaleString()} XP`, icon: Zap },
    { label: "Learning Speed", value: speedLabel[learningSpeed] || "On pace", icon: Brain },
    { label: "Retention", value: `${retention}%`, sub: "quiz pass rate", icon: Gauge },
    { label: "Momentum", value: `${momentum}/100`, sub: "last 7 days", icon: Flame },
    { label: "Lessons Done", value: String(lessonsCompleted), icon: BookOpen },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {tiles.map((t) => (
        <div key={t.label} className="app-card p-4">
          <t.icon className="w-4 h-4 text-eduverse-text-muted mb-2" aria-hidden="true" />
          <div className="text-lg font-bold text-eduverse-text font-mono leading-tight">{t.value}</div>
          <div className="text-[11px] text-eduverse-text-muted mt-0.5">{t.label}</div>
          {t.sub && <div className="text-[10px] text-eduverse-text-muted/70 font-mono mt-0.5">{t.sub}</div>}
        </div>
      ))}
    </div>
  );
}

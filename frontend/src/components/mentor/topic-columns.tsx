"use client";

import { TrendingUp, TrendingDown } from "lucide-react";

/** Strong vs weak topics, aggregated across every course. */
export function TopicColumns({ strengths, weaknesses }: { strengths: string[]; weaknesses: string[] }) {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <Column
        title="Strong topics"
        icon={<TrendingUp size={14} className="text-eduverse-success" aria-hidden="true" />}
        items={strengths}
        empty="No mastered topics yet — keep going and they'll show up here."
        tone="success"
      />
      <Column
        title="Needs work"
        icon={<TrendingDown size={14} className="text-eduverse-warning" aria-hidden="true" />}
        items={weaknesses}
        empty="No clear gaps detected. Take a placement assessment for a sharper read."
        tone="warning"
      />
    </div>
  );
}

function Column({
  title,
  icon,
  items,
  empty,
  tone,
}: {
  title: string;
  icon: React.ReactNode;
  items: string[];
  empty: string;
  tone: "success" | "warning";
}) {
  const color = tone === "success" ? "var(--color-eduverse-success)" : "var(--color-eduverse-warning)";
  return (
    <div className="app-card p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-eduverse-text mb-3">
        {icon}
        {title}
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-eduverse-text-muted">{empty}</p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {items.map((t) => (
            <span
              key={t}
              className="text-xs px-2.5 py-1 rounded-full border"
              style={{ borderColor: color, color: "var(--color-eduverse-text-body)", background: "var(--color-eduverse-raised)" }}
            >
              {t}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

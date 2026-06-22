"use client";

import Link from "next/link";
import { TrendingUp, TrendingDown, Sprout } from "lucide-react";

/** Strong vs weak topics, aggregated across every course.
 *  `weakLinks` (label → /apprentice deep-link) turns each gap into a "teach it" action. */
export function TopicColumns({
  strengths,
  weaknesses,
  weakLinks,
}: {
  strengths: string[];
  weaknesses: string[];
  weakLinks?: Record<string, string>;
}) {
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
        links={weakLinks}
        hint="Tip: teach a gap to Pip to close it fast."
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
  links,
  hint,
}: {
  title: string;
  icon: React.ReactNode;
  items: string[];
  empty: string;
  tone: "success" | "warning";
  links?: Record<string, string>;
  hint?: string;
}) {
  const color =
    tone === "success" ? "var(--color-eduverse-success)" : "var(--color-eduverse-warning)";
  return (
    <div className="app-card p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-eduverse-text mb-3">
        {icon}
        {title}
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-eduverse-text-muted">{empty}</p>
      ) : (
        <>
          <div className="flex flex-wrap gap-1.5">
            {items.map((t) => {
              const href = links?.[t];
              const className =
                "text-xs px-2.5 py-1 rounded-full border inline-flex items-center gap-1 transition-colors";
              const style = {
                borderColor: color,
                color: "var(--color-eduverse-text-body)",
                background: "var(--color-eduverse-raised)",
              };
              return href ? (
                <Link
                  key={t}
                  href={href}
                  className={`${className} hover:border-eduverse-accent`}
                  style={style}
                  title={`Teach ${t} to Pip`}
                >
                  {t}
                  <Sprout size={11} className="text-eduverse-accent" aria-hidden="true" />
                </Link>
              ) : (
                <span key={t} className={className} style={style}>
                  {t}
                </span>
              );
            })}
          </div>
          {hint && links && Object.keys(links).length > 0 && (
            <p className="text-[11px] text-eduverse-text-muted mt-2.5">{hint}</p>
          )}
        </>
      )}
    </div>
  );
}

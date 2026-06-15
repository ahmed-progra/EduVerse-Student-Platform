"use client";

import Link from "next/link";
import { Lightbulb, TrendingUp, AlertTriangle, Repeat, ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { MentorInsight, MentorRecommendation } from "@/types/mentor";

const kindIcon: Record<string, LucideIcon> = {
  strength: TrendingUp,
  gap: AlertTriangle,
  habit: Repeat,
  tip: Lightbulb,
};

export function InsightsList({
  insights,
  recommendations,
}: {
  insights: MentorInsight[];
  recommendations: MentorRecommendation[];
}) {
  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <div className="app-card p-5">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-eduverse-text mb-3">
          <Lightbulb size={15} className="text-eduverse-accent" aria-hidden="true" /> AI Insights
        </h3>
        {insights.length === 0 ? (
          <p className="text-xs text-eduverse-text-muted">No insights yet — sync your mentor to generate them.</p>
        ) : (
          <ul className="space-y-3">
            {insights.map((ins, i) => {
              const Icon = kindIcon[ins.kind] || Lightbulb;
              return (
                <li key={i} className="flex items-start gap-2.5">
                  <Icon size={15} className="text-eduverse-accent mt-0.5 shrink-0" aria-hidden="true" />
                  <div>
                    <div className="text-sm font-semibold text-eduverse-text">{ins.title}</div>
                    <p className="text-xs text-eduverse-text-muted mt-0.5">{ins.body}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="app-card p-5">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-eduverse-text mb-3">
          <ArrowRight size={15} className="text-eduverse-accent" aria-hidden="true" /> Recommended Actions
        </h3>
        {recommendations.length === 0 ? (
          <p className="text-xs text-eduverse-text-muted">No recommendations yet.</p>
        ) : (
          <div className="space-y-2">
            {recommendations.map((r, i) => (
              <Link
                key={i}
                href={r.href}
                className="flex items-center justify-between gap-3 px-3 py-2.5 rounded border border-eduverse-border hover:border-eduverse-accent transition-colors group"
              >
                <div>
                  <div className="text-sm font-semibold text-eduverse-text">{r.title}</div>
                  <div className="text-xs text-eduverse-text-muted mt-0.5">{r.reason}</div>
                </div>
                <ArrowRight size={15} className="text-eduverse-text-muted group-hover:text-eduverse-accent shrink-0 transition-colors" aria-hidden="true" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

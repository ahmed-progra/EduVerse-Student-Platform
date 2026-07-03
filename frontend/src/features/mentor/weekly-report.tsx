"use client";

import {
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
  Compass,
  Hammer,
} from "lucide-react";
import type { MentorReportData } from "@/types/mentor";

interface WeeklyReportProps {
  report: MentorReportData | null;
  loading: boolean;
  error: string;
  onRefresh: () => void;
}

export function WeeklyReport({ report, loading, error, onRefresh }: WeeklyReportProps) {
  if (loading) {
    return (
      <div className="space-y-2 animate-pulse" aria-label="Generating weekly report">
        <div className="h-3.5 w-full rounded-[var(--radius-sm)] bg-eduverse-raised" />
        <div className="h-3.5 w-5/6 rounded-[var(--radius-sm)] bg-eduverse-raised" />
        <div className="h-20 rounded-[var(--radius-sm)] bg-eduverse-raised mt-3" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-eduverse-text-muted">
        <p role="alert">Error: {error}</p>
        <button className="ai-panel-action-btn ai-panel-action-sm mt-3" onClick={onRefresh}>
          <RefreshCw size={12} aria-hidden="true" /> Retry
        </button>
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-eduverse-text-body">{report.narrative}</p>

      <div className="grid sm:grid-cols-3 gap-3">
        <ReportList
          title="Improved"
          icon={<ArrowUpRight size={13} className="text-eduverse-success" />}
          items={report.improved}
        />
        <ReportList
          title="Regressed"
          icon={<ArrowDownRight size={13} className="text-eduverse-danger" />}
          items={report.regressed}
          emptyText="Nothing slipped — nice."
        />
        <ReportList
          title="Needs work"
          icon={<AlertCircle size={13} className="text-eduverse-warning" />}
          items={report.needsWork}
          emptyText="No gaps flagged."
        />
      </div>

      {report.focusAreas.length > 0 && (
        <div className="flex items-start gap-2 text-sm">
          <Compass size={15} className="text-eduverse-accent mt-0.5 shrink-0" aria-hidden="true" />
          <p className="text-eduverse-text-body">
            <span className="text-eduverse-text-muted">Focus next: </span>
            {report.focusAreas.join(", ")}
          </p>
        </div>
      )}

      {report.projects.length > 0 && (
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-eduverse-text-muted mb-2">
            <Hammer size={12} className="text-eduverse-accent" aria-hidden="true" /> Suggested
            projects
          </div>
          <div className="grid sm:grid-cols-2 gap-2">
            {report.projects.map((p, i) => (
              <div
                key={i}
                className="rounded-[var(--radius-button)] border border-eduverse-border p-3"
              >
                <div className="text-sm font-semibold text-eduverse-text">{p.title}</div>
                <p className="text-xs text-eduverse-text-muted mt-1">{p.brief}</p>
                {p.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {p.skills.map((s) => (
                      <span
                        key={s}
                        className="text-[10px] px-1.5 py-0.5 rounded-[var(--radius-sm)] bg-eduverse-raised text-eduverse-text-muted"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        className="ai-panel-action-btn ai-panel-action-sm ai-panel-action-ghost"
        onClick={onRefresh}
      >
        <RefreshCw size={12} aria-hidden="true" /> Regenerate report
      </button>
    </div>
  );
}

function ReportList({
  title,
  icon,
  items,
  emptyText = "—",
}: {
  title: string;
  icon: React.ReactNode;
  items: string[];
  emptyText?: string;
}) {
  return (
    <div className="app-card p-3">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-eduverse-text mb-2">
        {icon}
        {title}
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-eduverse-text-muted">{emptyText}</p>
      ) : (
        <ul className="space-y-1">
          {items.map((it, i) => (
            <li key={i} className="text-xs text-eduverse-text-body leading-snug">
              {it}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

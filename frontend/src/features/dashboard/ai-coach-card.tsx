"use client";

import { useState } from "react";
import Link from "next/link";
import { Compass, RefreshCw, ArrowRight, Sparkles } from "lucide-react";
import { api } from "@/services/api-client";
import { GlassCard } from "@/components/ui/glass-card";

interface Recommendation {
  title: string;
  reason: string;
  area: string;
  href: string;
}

/**
 * Dashboard card: the AI coach reads the student's real progress
 * (lessons, battles, skills, XP) and suggests the next best steps.
 * Loads on demand so the dashboard stays fast and quota-friendly.
 */
export function AICoachCard() {
  const [focus, setFocus] = useState("");
  const [recs, setRecs] = useState<Recommendation[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.aiRecommend();
      setFocus(res.data.focus);
      setRecs(res.data.recommendations);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not load recommendations.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassCard>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <h2 className="flex items-center gap-2 text-sm font-mono text-eduverse-text-muted">
          <span className="text-eduverse-accent">//</span> AI Coach
        </h2>
        <div className="flex items-center gap-2">
          {recs && (
            <button
              className="ai-panel-action-btn ai-panel-action-sm ai-panel-action-ghost"
              onClick={load}
              disabled={loading}
              aria-label="Refresh recommendations"
            >
              <RefreshCw size={12} aria-hidden="true" /> Refresh
            </button>
          )}
          <Link
            href="/mentor"
            className="ai-panel-action-btn ai-panel-action-sm"
            aria-label="Open the full AI Coach dashboard"
          >
            <Sparkles size={12} aria-hidden="true" /> Open AI Coach
          </Link>
        </div>
      </div>

      {!recs && !loading && (
        <div className="text-sm text-eduverse-text-muted">
          <p className="mb-3">
            Ask the AI coach what to work on next — it reads your actual progress and suggests the
            highest-impact next steps.
          </p>
          <button className="ai-panel-action-btn" onClick={load}>
            <Compass size={14} aria-hidden="true" /> Get My Plan
          </button>
          {error && (
            <p className="mt-3" role="alert">
              Error: {error}
            </p>
          )}
        </div>
      )}

      {loading && (
        <div className="space-y-3 animate-pulse" aria-label="Loading recommendations">
          <div className="h-3.5 w-3/4 rounded bg-eduverse-raised" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 rounded bg-eduverse-raised" />
          ))}
        </div>
      )}

      {recs && !loading && (
        <div>
          {focus && <p className="text-sm text-eduverse-text-body mb-4">{focus}</p>}
          <div className="space-y-2">
            {recs.map((r, i) => (
              <Link
                key={i}
                href={r.href}
                className="flex items-center justify-between gap-3 px-3 py-3 rounded border border-eduverse-border hover:border-eduverse-accent transition-colors group"
              >
                <div>
                  <div className="text-sm font-semibold text-eduverse-text">{r.title}</div>
                  <div className="text-xs text-eduverse-text-muted mt-0.5">{r.reason}</div>
                </div>
                <ArrowRight
                  size={16}
                  className="text-eduverse-text-muted group-hover:text-eduverse-accent shrink-0 transition-colors"
                  aria-hidden="true"
                />
              </Link>
            ))}
          </div>
          {error && (
            <p className="text-sm text-eduverse-text-muted mt-3" role="alert">
              Error: {error}
            </p>
          )}
        </div>
      )}
    </GlassCard>
  );
}

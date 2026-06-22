"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sprout,
  Star,
  Trophy,
  CheckCircle,
  Circle,
  ChevronRight,
  SkipForward,
  RefreshCw,
  Clock,
  Target,
  TrendingUp,
  TrendingDown,
  RotateCcw,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { api } from "@/services/api-client";
import { GlassCard } from "@/components/ui/glass-card";

interface RoadmapItem {
  lessonId: string;
  order: number;
  title: string;
  difficulty: string;
  estMinutes: number;
  status: "required" | "skipped";
  completed: boolean;
  reason: string;
}

interface Mastery {
  [topic: string]: { status: string; score: number };
}

export interface LearningStateData {
  assessed: boolean;
  assessment: {
    score: number;
    total: number;
    level: string;
    analysis: { summary?: string; scorePct?: number };
  } | null;
  profile: { level: string; mastery: Mastery; strengths: string[]; weaknesses: string[] } | null;
  roadmap: { items: RoadmapItem[]; focus: string; estMinutes: number; version: number } | null;
  topics: string[];
}

const LEVELS: Record<string, { icon: LucideIcon; color: string; label: string }> = {
  beginner: { icon: Sprout, color: "var(--color-eduverse-success)", label: "Beginner" },
  intermediate: { icon: Star, color: "var(--color-eduverse-warning)", label: "Intermediate" },
  advanced: { icon: Trophy, color: "var(--color-eduverse-accent)", label: "Advanced" },
};

const STATUS_COLOR: Record<string, string> = {
  mastered: "var(--color-eduverse-success)",
  partial: "var(--color-eduverse-warning)",
  weak: "var(--color-eduverse-danger)",
  missing: "var(--color-eduverse-text-muted)",
};

function topicLabelFromKey(key: string): string {
  return key
    .split("-")
    .map((w) => w[0]?.toUpperCase() + w.slice(1))
    .join(" ");
}

/**
 * The personalized path: level + score header, AI summary, topic mastery
 * grid, strengths/weaknesses, and the lesson-by-lesson roadmap where every
 * skipped lesson carries its justification.
 */
export function RoadmapView({
  courseId,
  state,
  onStateChange,
  onRetake,
}: {
  courseId: string;
  state: LearningStateData;
  onStateChange: (next: LearningStateData) => void;
  onRetake: () => void;
}) {
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [showSkipped, setShowSkipped] = useState(true);

  const profile = state.profile!;
  const roadmap = state.roadmap!;
  const level = LEVELS[profile.level] || LEVELS.beginner;
  const LevelIcon = level.icon;

  const required = roadmap.items.filter((i) => i.status === "required");
  const skipped = roadmap.items.filter((i) => i.status === "skipped");
  const doneCount = required.filter((i) => i.completed).length;
  const nextUp = required.find((i) => !i.completed);
  const pct = required.length ? Math.round((doneCount / required.length) * 100) : 0;
  const hours = Math.floor(roadmap.estMinutes / 60);
  const mins = roadmap.estMinutes % 60;

  const refresh = async () => {
    setRefreshing(true);
    setError("");
    try {
      const res = await api.learningRefresh(courseId);
      onStateChange({
        ...state,
        profile: {
          ...profile,
          level: res.data.level,
          strengths: res.data.strengths,
          weaknesses: res.data.weaknesses,
        },
        roadmap: res.data.roadmap,
        assessment: state.assessment
          ? {
              ...state.assessment,
              analysis: { ...state.assessment.analysis, summary: res.data.summary },
            }
          : state.assessment,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not refresh the path.");
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* ── Level + plan header ── */}
      <GlassCard>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <span
              className="w-12 h-12 rounded flex items-center justify-center shrink-0"
              style={{ background: "var(--color-eduverse-accent-soft)" }}
            >
              <LevelIcon className="w-6 h-6" style={{ color: level.color }} aria-hidden="true" />
            </span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold font-display">{level.label} path</h2>
                <span className="text-xs font-mono text-eduverse-text-muted">
                  assessment{" "}
                  {state.assessment?.analysis?.scorePct ??
                    Math.round(
                      ((state.assessment?.score || 0) / Math.max(1, state.assessment?.total || 1)) *
                        100,
                    )}
                  %
                </span>
              </div>
              <p className="text-xs text-eduverse-text-muted mt-0.5 flex items-center gap-3 flex-wrap">
                <span className="inline-flex items-center gap-1">
                  <Target size={12} aria-hidden="true" /> {required.length} lessons on your path ·{" "}
                  {skipped.length} skipped
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock size={12} aria-hidden="true" /> ~{hours > 0 ? `${hours}h ` : ""}
                  {mins}m remaining
                </span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="ai-panel-action-btn ai-panel-action-sm"
              onClick={refresh}
              disabled={refreshing}
              title="AI re-evaluates your profile and rebuilds the path"
            >
              <RefreshCw
                size={12}
                className={refreshing ? "animate-spin" : ""}
                aria-hidden="true"
              />
              {refreshing ? "Updating…" : "Update my path"}
            </button>
            <button
              className="ai-panel-action-btn ai-panel-action-sm ai-panel-action-ghost"
              onClick={onRetake}
              title="Retake the placement assessment"
            >
              <RotateCcw size={12} aria-hidden="true" /> Retake
            </button>
          </div>
        </div>

        {state.assessment?.analysis?.summary && (
          <p className="text-sm text-eduverse-text-body mt-4">
            {state.assessment.analysis.summary}
          </p>
        )}
        {roadmap.focus && (
          <p className="text-sm mt-2" style={{ color: "var(--color-eduverse-accent)" }}>
            <Target size={13} className="inline mr-1.5" aria-hidden="true" />
            {roadmap.focus}
          </p>
        )}
        {error && (
          <p className="text-sm mt-3 text-eduverse-danger" role="alert">
            {error}
          </p>
        )}

        {/* progress */}
        <div className="flex items-center gap-3 mt-4">
          <div className="h-2 rounded bg-eduverse-accent-soft overflow-hidden flex-1 max-w-sm">
            <motion.div
              className="h-full rounded"
              style={{ background: "var(--color-eduverse-accent-strong)" }}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
          <span className="text-xs text-eduverse-text-muted whitespace-nowrap">
            {doneCount}/{required.length} completed
          </span>
        </div>

        {pct === 100 && required.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="mt-4 flex items-center gap-3 rounded-[var(--radius-card)] border border-[var(--color-eduverse-border-mid)] bg-eduverse-accent-soft px-4 py-3"
          >
            <Trophy className="w-5 h-5 text-eduverse-accent shrink-0" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-eduverse-text">Path complete!</p>
              <p className="text-xs text-eduverse-text-muted">
                You finished every required lesson on this roadmap. Update your path to unlock the
                next level.
              </p>
            </div>
          </motion.div>
        )}
      </GlassCard>

      {/* ── Mastery + strengths/weaknesses ── */}
      <GlassCard>
        <h3 className="flex items-center gap-2 text-sm font-mono text-eduverse-text-muted mb-4">
          <span className="text-eduverse-accent">//</span> Topic Mastery
        </h3>
        <div className="flex flex-wrap gap-2 mb-5">
          {Object.entries(profile.mastery).map(([topic, m]) => (
            <span
              key={topic}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs"
              style={{
                border: "1px solid var(--color-eduverse-border)",
                color: "var(--color-eduverse-text-body)",
              }}
              title={`${m.status} — ${m.score}/100`}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ background: STATUS_COLOR[m.status] }}
                aria-hidden="true"
              />
              {topicLabelFromKey(topic)}
              <span className="font-mono text-eduverse-text-muted">{m.score}</span>
            </span>
          ))}
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <h4 className="text-xs font-semibold text-eduverse-text mb-2 flex items-center gap-1.5">
              <TrendingUp size={14} className="text-eduverse-success" aria-hidden="true" />{" "}
              Strengths
            </h4>
            {profile.strengths.length ? (
              <ul className="space-y-1">
                {profile.strengths.map((s, i) => (
                  <li key={i} className="text-sm text-eduverse-text-body">
                    · {s}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-eduverse-text-muted">None identified yet — keep going.</p>
            )}
          </div>
          <div>
            <h4 className="text-xs font-semibold text-eduverse-text mb-2 flex items-center gap-1.5">
              <TrendingDown size={14} className="text-eduverse-danger" aria-hidden="true" /> Focus
              areas
            </h4>
            {profile.weaknesses.length ? (
              <ul className="space-y-1">
                {profile.weaknesses.map((s, i) => (
                  <li key={i} className="text-sm text-eduverse-text-body">
                    · {s}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-eduverse-text-muted">No major gaps detected.</p>
            )}
          </div>
        </div>
      </GlassCard>

      {/* ── The path ── */}
      <div>
        <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
          <h3 className="flex items-center gap-2 text-sm font-mono text-eduverse-text-muted">
            <span className="text-eduverse-accent">//</span> Your Personalized Path
          </h3>
          {skipped.length > 0 && (
            <button
              className="text-xs text-eduverse-text-muted hover:text-eduverse-accent transition-colors"
              onClick={() => setShowSkipped((s) => !s)}
            >
              {showSkipped ? "Hide" : "Show"} {skipped.length} skipped lessons
            </button>
          )}
        </div>
        <div className="space-y-2.5">
          {roadmap.items.map((item, i) => {
            if (item.status === "skipped" && !showSkipped) return null;
            const isNext = nextUp?.lessonId === item.lessonId;
            if (item.status === "skipped") {
              return (
                <motion.div
                  key={item.lessonId}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.02, 0.4), duration: 0.3 }}
                >
                  <div
                    className="rounded border px-4 py-3"
                    style={{ borderColor: "var(--color-eduverse-border)", opacity: 0.65 }}
                  >
                    <div className="flex items-center gap-3">
                      <SkipForward
                        className="w-4 h-4 text-eduverse-text-muted shrink-0"
                        aria-label="Skipped"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-sm text-eduverse-text-muted">
                          <span className="font-mono mr-1.5" style={{ fontSize: "0.75em" }}>
                            {String(item.order).padStart(2, "0")}
                          </span>
                          <s>{item.title}</s>
                        </span>
                        <p
                          className="text-xs mt-0.5"
                          style={{ color: "var(--color-eduverse-text-muted)" }}
                        >
                          <span
                            className="font-semibold"
                            style={{ color: "var(--color-eduverse-success)" }}
                          >
                            Skipped:
                          </span>{" "}
                          {item.reason}
                        </p>
                      </div>
                      <Link
                        href={`/lessons/${item.lessonId}`}
                        className="text-xs text-eduverse-text-muted hover:text-eduverse-accent shrink-0 transition-colors"
                      >
                        review anyway
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            }
            return (
              <motion.div
                key={item.lessonId}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.02, 0.4), duration: 0.3 }}
              >
                <Link href={`/lessons/${item.lessonId}`} className="block group">
                  <GlassCard
                    className="flex items-center gap-4 !py-3.5"
                    style={
                      isNext
                        ? {
                            borderColor: "var(--color-eduverse-accent)",
                            boxShadow: "0 0 0 1px var(--color-eduverse-accent)",
                          }
                        : undefined
                    }
                  >
                    {item.completed ? (
                      <CheckCircle
                        className="w-5 h-5 text-eduverse-success shrink-0"
                        aria-label="Completed"
                      />
                    ) : (
                      <Circle
                        className="w-5 h-5 text-eduverse-text-muted shrink-0"
                        aria-hidden="true"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4
                        className="font-semibold text-sm truncate"
                        style={{ color: "var(--color-eduverse-text)" }}
                      >
                        <span
                          className="text-eduverse-text-muted font-normal font-mono mr-1.5"
                          style={{ fontSize: "0.8em" }}
                        >
                          {String(item.order).padStart(2, "0")}
                        </span>
                        {item.title}
                        {isNext && (
                          <span
                            className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-mono align-middle"
                            style={{
                              background: "var(--color-eduverse-accent-soft)",
                              color: "var(--color-eduverse-accent)",
                            }}
                          >
                            START HERE
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-eduverse-text-muted mt-0.5 font-mono capitalize">
                        {item.difficulty} · ~{item.estMinutes}m
                      </p>
                    </div>
                    <ChevronRight
                      className="w-4 h-4 text-eduverse-text-muted transition-transform duration-200 group-hover:translate-x-1 shrink-0"
                      aria-hidden="true"
                    />
                  </GlassCard>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

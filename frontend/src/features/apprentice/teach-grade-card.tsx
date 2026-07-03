"use client";

import { motion } from "framer-motion";
import {
  Zap,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Award,
  Sparkles,
} from "lucide-react";
import type { TeachGrade } from "@/types/apprentice";

interface TeachGradeCardProps {
  grade: TeachGrade;
  topic: string;
  onTeachAgain: () => void;
}

function tier(overall: number): { label: string; color: string } {
  if (overall >= 85) return { label: "Master Teacher", color: "var(--color-eduverse-success)" };
  if (overall >= 70) return { label: "Great Explanation", color: "var(--color-eduverse-success)" };
  if (overall >= 50) return { label: "Solid Effort", color: "var(--color-eduverse-warning)" };
  return { label: "Keep Practicing", color: "var(--color-eduverse-warning)" };
}

export function TeachGradeCard({ grade, topic, onTeachAgain }: TeachGradeCardProps) {
  const t = tier(grade.overall);
  const bars: { label: string; value: number }[] = [
    { label: "Clarity", value: grade.clarity },
    { label: "Correctness", value: grade.correctness },
    { label: "Completeness", value: grade.completeness },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Headline */}
      <div className="flex items-center gap-4 mb-5">
        <div
          className="flex flex-col items-center justify-center rounded-full w-20 h-20 shrink-0"
          style={{
            border: `2px solid ${t.color}`,
            background: "var(--color-eduverse-accent-soft)",
          }}
        >
          <span className="text-2xl font-bold font-mono text-eduverse-text leading-none">
            {grade.overall}
          </span>
          <span className="text-[9px] text-eduverse-text-muted mt-0.5">/ 100</span>
        </div>
        <div>
          <div className="flex items-center gap-2 text-lg font-bold text-eduverse-text font-display">
            <Award size={18} style={{ color: t.color }} aria-hidden="true" /> {t.label}
          </div>
          <p className="text-sm text-eduverse-text-muted mt-0.5">You taught Pip about {topic}.</p>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="flex items-center gap-1 text-sm font-bold font-mono text-eduverse-warning">
              <Zap size={13} aria-hidden="true" /> +{grade.xpAwarded} XP
            </span>
            {grade.masteryBoosted && (
              <span className="flex items-center gap-1 text-xs font-semibold text-eduverse-success">
                <TrendingUp size={13} aria-hidden="true" /> Mastery boosted
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Verdict */}
      <div className="rounded-[var(--radius-button)] border border-eduverse-border p-3 mb-4 flex items-start gap-2">
        <Sparkles size={15} className="text-eduverse-accent mt-0.5 shrink-0" aria-hidden="true" />
        <p className="text-sm text-eduverse-text-body">{grade.verdict}</p>
      </div>

      {/* Score bars */}
      <div className="space-y-3 mb-4">
        {bars.map((b, i) => (
          <div key={b.label}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-eduverse-text-body">{b.label}</span>
              <span className="font-mono text-eduverse-text-muted">{b.value}</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden bg-eduverse-raised">
              <motion.div
                className="h-full rounded-full"
                style={{ background: "var(--color-eduverse-accent)" }}
                initial={{ width: 0 }}
                animate={{ width: `${b.value}%` }}
                transition={{ delay: 0.15 + i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Strengths / improvements */}
      <div className="grid sm:grid-cols-2 gap-3 mb-5">
        <div className="app-card p-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-eduverse-text mb-2">
            <CheckCircle2 size={13} className="text-eduverse-success" aria-hidden="true" /> What you
            nailed
          </div>
          <ul className="space-y-1">
            {grade.strengths.length ? (
              grade.strengths.map((s, i) => (
                <li key={i} className="text-xs text-eduverse-text-body leading-snug">
                  • {s}
                </li>
              ))
            ) : (
              <li className="text-xs text-eduverse-text-muted">—</li>
            )}
          </ul>
        </div>
        <div className="app-card p-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-eduverse-text mb-2">
            <AlertCircle size={13} className="text-eduverse-warning" aria-hidden="true" /> Sharpen
            next time
          </div>
          <ul className="space-y-1">
            {grade.improvements.length ? (
              grade.improvements.map((s, i) => (
                <li key={i} className="text-xs text-eduverse-text-body leading-snug">
                  • {s}
                </li>
              ))
            ) : (
              <li className="text-xs text-eduverse-text-muted">—</li>
            )}
          </ul>
        </div>
      </div>

      <button className="ai-panel-action-btn" onClick={onTeachAgain}>
        <RotateCcw size={14} aria-hidden="true" /> Teach Another Topic
      </button>
    </motion.div>
  );
}

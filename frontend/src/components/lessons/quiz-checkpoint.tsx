"use client";

import { useState } from "react";
import { ListChecks, CheckCircle, XCircle, RefreshCw, Zap } from "lucide-react";
import { api } from "@/lib/api";
import { GlassCard } from "@/components/ui/glass-card";

interface QuizQuestion {
  q: string;
  options: string[];
}

interface QuizResult {
  correct: number;
  total: number;
  pct: number;
  passed: boolean;
  xpGained: number;
  results: { correct: boolean; answer: number; explain: string }[];
}

/**
 * The lesson's quiz checkpoint. Graded server-side; results feed the
 * skill profile so the roadmap keeps adapting as you learn.
 */
export function QuizCheckpoint({ lessonId, quiz }: { lessonId: string; quiz: QuizQuestion[] }) {
  const [selected, setSelected] = useState<number[]>(new Array(quiz.length).fill(-1));
  const [result, setResult] = useState<QuizResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (quiz.length === 0) return null;

  const allAnswered = selected.every((s) => s >= 0);

  const submit = async () => {
    setSubmitting(true);
    setError("");
    try {
      const res = await api.lessonQuiz(lessonId, selected);
      setResult(res.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not grade the quiz.");
    } finally {
      setSubmitting(false);
    }
  };

  const retry = () => {
    setResult(null);
    setSelected(new Array(quiz.length).fill(-1));
  };

  return (
    <GlassCard>
      <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
        <h2 className="flex items-center gap-2 text-sm font-mono text-eduverse-text-muted">
          <span className="text-eduverse-accent">//</span> Quiz Checkpoint
        </h2>
        {result && (
          <span
            className="inline-flex items-center gap-1.5 text-sm font-bold font-mono"
            style={{ color: result.passed ? "var(--color-eduverse-success)" : "var(--color-eduverse-danger)" }}
          >
            {result.passed ? <CheckCircle size={15} aria-hidden="true" /> : <XCircle size={15} aria-hidden="true" />}
            {result.correct}/{result.total} {result.passed ? "— passed" : "— keep practicing"}
            {result.xpGained > 0 && (
              <span className="inline-flex items-center gap-0.5 ml-2" style={{ color: "var(--color-eduverse-warning)" }}>
                <Zap size={13} aria-hidden="true" /> +{result.xpGained} XP
              </span>
            )}
          </span>
        )}
      </div>

      {!result && (
        <p className="text-sm text-eduverse-text-muted mb-4">
          Lock in what you just learned — your answers update your skill profile and your personalized path.
        </p>
      )}

      <div className="space-y-5">
        {quiz.map((q, qi) => {
          const verdict = result?.results[qi];
          return (
            <div key={qi}>
              <div className="text-sm font-semibold text-eduverse-text mb-2 flex items-start gap-2">
                <span className="font-mono text-eduverse-accent shrink-0">{qi + 1}.</span>
                <span>{q.q}</span>
                {verdict?.correct && <CheckCircle size={15} className="text-eduverse-success mt-0.5 shrink-0" aria-label="Correct" />}
                {verdict && !verdict.correct && <XCircle size={15} className="text-eduverse-danger mt-0.5 shrink-0" aria-label="Incorrect" />}
              </div>
              <div className="space-y-1.5">
                {q.options.map((opt, oi) => {
                  const chosen = selected[qi] === oi;
                  const showCorrect = verdict && oi === verdict.answer;
                  const showWrong = verdict && chosen && oi !== verdict.answer;
                  return (
                    <button
                      key={oi}
                      onClick={() => {
                        if (result) return;
                        setSelected((p) => p.map((v, i) => (i === qi ? oi : v)));
                      }}
                      className="ai-choice w-full text-left text-sm px-3 py-2 rounded border transition-colors"
                      style={{
                        borderColor: showCorrect
                          ? "var(--color-eduverse-success)"
                          : showWrong
                            ? "var(--color-eduverse-danger)"
                            : chosen
                              ? "var(--color-eduverse-accent)"
                              : "var(--color-eduverse-border)",
                        background: chosen || showCorrect ? "var(--color-eduverse-accent-soft)" : "transparent",
                        color: "var(--color-eduverse-text-body)",
                        cursor: result ? "default" : "pointer",
                      }}
                      aria-pressed={chosen}
                      disabled={!!result}
                    >
                      <span className="font-mono mr-2">{String.fromCharCode(65 + oi)}.</span>
                      {opt}
                    </button>
                  );
                })}
              </div>
              {verdict && verdict.explain && (
                <p className="text-xs text-eduverse-text-muted mt-2 pl-1">{verdict.explain}</p>
              )}
            </div>
          );
        })}
      </div>

      {error && <p className="text-sm mt-4 text-eduverse-danger" role="alert">{error}</p>}

      <div className="flex items-center gap-3 mt-5">
        {!result ? (
          <button className="ai-panel-action-btn" onClick={submit} disabled={!allAnswered || submitting}>
            {submitting ? "Grading…" : allAnswered ? "Check Answers" : "Answer all questions first"}
          </button>
        ) : (
          !result.passed && (
            <button className="ai-panel-action-btn ai-panel-action-sm ai-panel-action-ghost" onClick={retry}>
              <RefreshCw size={12} aria-hidden="true" /> Try Again
            </button>
          )
        )}
      </div>
    </GlassCard>
  );
}

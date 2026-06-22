"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ClipboardCheck, ChevronLeft, ChevronRight, SkipForward, Loader2 } from "lucide-react";
import { api } from "@/services/api-client";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientButton } from "@/components/ui/gradient-button";

interface ServedQuestion {
  id: string;
  type: "mcq" | "predict" | "code";
  topics: string[];
  difficulty: number;
  prompt: string;
  code?: string;
  options?: string[];
  starter?: string;
}

interface AssessmentRunnerProps {
  courseId: string;
  courseTitle: string;
  questionCount: number;
  topics: string[];
  onComplete: (result: unknown) => void;
}

/**
 * The placement assessment: an intro gate, a one-question-at-a-time runner
 * (MCQ, code-reading, and open code-writing tasks), and AI-graded submission.
 */
export function AssessmentRunner({ courseId, courseTitle, questionCount, topics, onComplete }: AssessmentRunnerProps) {
  const [phase, setPhase] = useState<"intro" | "running" | "submitting">("intro");
  const [assessmentId, setAssessmentId] = useState("");
  const [questions, setQuestions] = useState<ServedQuestion[]>([]);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number | string | null>>({});
  const [error, setError] = useState("");

  const start = async () => {
    setError("");
    try {
      const res = await api.assessmentStart(courseId);
      setAssessmentId(res.data.assessmentId);
      setQuestions(res.data.questions);
      // Pre-fill code tasks with their starter so learners edit, not retype.
      const initial: Record<string, number | string | null> = {};
      for (const q of res.data.questions) {
        if (q.type === "code") initial[q.id] = q.starter || "";
      }
      setAnswers(initial);
      setIdx(0);
      setPhase("running");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not start the assessment.");
    }
  };

  const submit = async () => {
    setPhase("submitting");
    setError("");
    try {
      const normalized: Record<string, number | string | null> = {};
      for (const q of questions) {
        const a = answers[q.id];
        if (q.type === "code") {
          // Untouched starter code counts as not attempted.
          const text = typeof a === "string" ? a : "";
          normalized[q.id] = text.trim() && text.trim() !== (q.starter || "").trim() ? text : "";
        } else {
          normalized[q.id] = typeof a === "number" ? a : null;
        }
      }
      const res = await api.assessmentSubmit(courseId, { assessmentId, answers: normalized });
      onComplete(res.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Submission failed. Your answers are kept — try again.");
      setPhase("running");
    }
  };

  if (phase === "intro") {
    return (
      <GlassCard>
        <div className="flex items-start gap-4">
          <ClipboardCheck className="w-8 h-8 text-eduverse-accent shrink-0 mt-1" aria-hidden="true" />
          <div className="min-w-0">
            <h2 className="text-xl font-bold font-display mb-2">Find your starting point</h2>
            <p className="text-sm text-eduverse-text-body mb-3">
              Before the lessons begin, a placement assessment maps what you already know — so your {courseTitle} path
              skips what you've mastered and focuses on your gaps. It mixes concept questions, code reading, and two
              short coding tasks graded by AI. Skipping a question is fine: it simply marks that topic as untested.
            </p>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {topics.map((t) => (
                <span key={t} className="px-2 py-0.5 rounded text-xs font-mono"
                  style={{ background: "var(--color-eduverse-accent-soft)", color: "var(--color-eduverse-text-muted)" }}>
                  {t}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <GradientButton onClick={start}>Start assessment ({questionCount} questions)</GradientButton>
              <span className="text-xs text-eduverse-text-muted">~10–15 minutes · earns +75 XP</span>
            </div>
            {error && <p className="text-sm mt-3 text-eduverse-danger" role="alert">{error}</p>}
          </div>
        </div>
      </GlassCard>
    );
  }

  if (phase === "submitting") {
    return (
      <GlassCard>
        <div className="flex flex-col items-center py-10 text-center">
          <Loader2 className="w-8 h-8 text-eduverse-accent animate-spin mb-4" aria-hidden="true" />
          <h2 className="text-lg font-bold font-display mb-1">Analyzing your answers…</h2>
          <p className="text-sm text-eduverse-text-muted max-w-md">
            Grading your code, mapping topic mastery, and building your personalized roadmap. This takes a few seconds.
          </p>
        </div>
      </GlassCard>
    );
  }

  const q = questions[idx];
  const answered = q.type === "code"
    ? typeof answers[q.id] === "string"
    : typeof answers[q.id] === "number";
  const isLast = idx === questions.length - 1;
  const progress = Math.round(((idx + 1) / questions.length) * 100);

  return (
    <GlassCard>
      {/* Progress */}
      <div className="flex items-center justify-between gap-3 mb-1">
        <span className="text-xs font-mono text-eduverse-text-muted">
          Question {idx + 1} / {questions.length}
        </span>
        <span className="text-xs font-mono text-eduverse-text-muted capitalize">
          {q.type === "code" ? "coding task" : q.type === "predict" ? "read the code" : "concept"}
        </span>
      </div>
      <div className="h-1.5 rounded bg-eduverse-accent-soft overflow-hidden mb-5">
        <motion.div
          className="h-full rounded"
          style={{ background: "var(--color-eduverse-accent-strong)" }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={q.id}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
        >
          <p className="text-sm font-semibold text-eduverse-text mb-3">{q.prompt}</p>
          {q.code && (
            <pre className="lesson-code mb-4" style={{ fontSize: "0.85rem", overflowX: "auto" }}>
              <code>{q.code}</code>
            </pre>
          )}

          {q.type === "code" ? (
            <textarea
              className="ai-panel-textarea w-full font-mono"
              rows={8}
              value={typeof answers[q.id] === "string" ? (answers[q.id] as string) : ""}
              onChange={(e) => setAnswers((p) => ({ ...p, [q.id]: e.target.value }))}
              spellCheck={false}
              aria-label="Code answer"
            />
          ) : (
            <div className="space-y-2">
              {q.options?.map((opt, oi) => {
                const chosen = answers[q.id] === oi;
                return (
                  <button
                    key={oi}
                    onClick={() => setAnswers((p) => ({ ...p, [q.id]: oi }))}
                    className="ai-choice w-full text-left text-sm px-3 py-2.5 rounded border transition-colors"
                    style={{
                      borderColor: chosen ? "var(--color-eduverse-accent)" : "var(--color-eduverse-border)",
                      background: chosen ? "var(--color-eduverse-accent-soft)" : "transparent",
                      color: "var(--color-eduverse-text-body)",
                    }}
                    aria-pressed={chosen}
                  >
                    <span className="font-mono mr-2 text-eduverse-text-muted">{String.fromCharCode(65 + oi)}.</span>
                    <span style={{ whiteSpace: "pre-wrap" }}>{opt}</span>
                  </button>
                );
              })}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {error && <p className="text-sm mt-3 text-eduverse-danger" role="alert">{error}</p>}

      {/* Nav */}
      <div className="flex items-center justify-between gap-3 mt-6 flex-wrap">
        <button
          className="ai-panel-action-btn ai-panel-action-sm ai-panel-action-ghost"
          onClick={() => setIdx((i) => Math.max(0, i - 1))}
          disabled={idx === 0}
        >
          <ChevronLeft size={14} aria-hidden="true" /> Back
        </button>
        <div className="flex items-center gap-2">
          {!isLast && (
            <button
              className="ai-panel-action-btn ai-panel-action-sm ai-panel-action-ghost"
              onClick={() => {
                if (q.type !== "code" && answers[q.id] === undefined) setAnswers((p) => ({ ...p, [q.id]: null }));
                setIdx((i) => i + 1);
              }}
              title="Skip — counts as untested, not wrong"
            >
              <SkipForward size={14} aria-hidden="true" /> Skip
            </button>
          )}
          {isLast ? (
            <GradientButton onClick={submit}>Submit assessment</GradientButton>
          ) : (
            <GradientButton onClick={() => setIdx((i) => i + 1)} disabled={!answered}>
              Next <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </GradientButton>
          )}
        </div>
      </div>
    </GlassCard>
  );
}

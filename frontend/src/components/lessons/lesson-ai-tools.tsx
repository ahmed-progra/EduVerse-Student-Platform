"use client";

import { useState } from "react";
import { Sparkles, ListChecks, RefreshCw, CheckCircle, XCircle } from "lucide-react";
import { api } from "@/lib/api";
import { GlassCard } from "@/components/ui/glass-card";

interface QuizQuestion {
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

interface LessonAIToolsProps {
  title: string;
  content: string;
  language: string;
}

/**
 * AI study tools shown under each lesson: a one-click summary with key
 * points, and a generated practice quiz graded in place.
 */
export function LessonAITools({ title, content, language }: LessonAIToolsProps) {
  const [tab, setTab] = useState<"summary" | "quiz">("summary");

  const [summary, setSummary] = useState<{ summary: string; keyPoints: string[] } | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState("");

  const [questions, setQuestions] = useState<QuizQuestion[] | null>(null);
  const [selected, setSelected] = useState<number[]>([]);
  const [checked, setChecked] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizError, setQuizError] = useState("");

  const loadSummary = async () => {
    setSummaryLoading(true);
    setSummaryError("");
    try {
      const res = await api.aiSummary({ title, content });
      setSummary(res.data);
    } catch (err: unknown) {
      setSummaryError(err instanceof Error ? err.message : "Could not generate the summary.");
    } finally {
      setSummaryLoading(false);
    }
  };

  const loadQuiz = async () => {
    setQuizLoading(true);
    setQuizError("");
    setChecked(false);
    try {
      const res = await api.aiQuiz({ topic: `${language} lesson: ${title}`, content, count: 4 });
      setQuestions(res.data.questions);
      setSelected(new Array(res.data.questions.length).fill(-1));
    } catch (err: unknown) {
      setQuestions(null);
      setQuizError(err instanceof Error ? err.message : "Could not generate the quiz.");
    } finally {
      setQuizLoading(false);
    }
  };

  const correctCount = questions
    ? questions.reduce((acc, q, i) => acc + (selected[i] === q.answerIndex ? 1 : 0), 0)
    : 0;
  const allAnswered = questions ? selected.every((s) => s >= 0) : false;

  const tabBtn = (key: "summary" | "quiz", label: string, Icon: typeof Sparkles) => (
    <button
      onClick={() => setTab(key)}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-colors"
      style={{
        background: tab === key ? "var(--color-eduverse-accent-soft)" : "transparent",
        color: tab === key ? "var(--color-eduverse-accent)" : "var(--color-eduverse-text-muted)",
        border: `1px solid ${tab === key ? "var(--color-eduverse-accent-soft)" : "transparent"}`,
      }}
      aria-pressed={tab === key}
    >
      <Icon size={13} aria-hidden="true" /> {label}
    </button>
  );

  return (
    <GlassCard>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <h2 className="flex items-center gap-2 text-sm font-mono text-eduverse-text-muted">
          <span className="text-eduverse-accent">//</span> AI Study Tools
        </h2>
        <div className="flex gap-1.5">
          {tabBtn("summary", "Summary", Sparkles)}
          {tabBtn("quiz", "Practice Quiz", ListChecks)}
        </div>
      </div>

      {tab === "summary" && (
        <div>
          {!summary && !summaryLoading && (
            <div className="text-sm text-eduverse-text-muted">
              <p className="mb-3">Get an AI summary of this lesson with the key points to remember.</p>
              <button className="ai-panel-action-btn" onClick={loadSummary}>Summarize Lesson</button>
              {summaryError && <p className="mt-3" role="alert">Error: {summaryError}</p>}
            </div>
          )}
          {summaryLoading && (
            <div className="space-y-2 animate-pulse" aria-label="Generating summary">
              <div className="h-3.5 w-full rounded bg-eduverse-raised" />
              <div className="h-3.5 w-5/6 rounded bg-eduverse-raised" />
              <div className="h-3.5 w-2/3 rounded bg-eduverse-raised" />
            </div>
          )}
          {summary && !summaryLoading && (
            <div>
              <p className="text-sm leading-relaxed text-eduverse-text-body mb-4">{summary.summary}</p>
              {summary.keyPoints.length > 0 && (
                <ul className="space-y-1.5 mb-4">
                  {summary.keyPoints.map((kp, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-eduverse-text-body">
                      <CheckCircle size={14} className="text-eduverse-success mt-0.5 shrink-0" aria-hidden="true" />
                      {kp}
                    </li>
                  ))}
                </ul>
              )}
              <button className="ai-panel-action-btn ai-panel-action-sm ai-panel-action-ghost" onClick={loadSummary} disabled={summaryLoading}>
                <RefreshCw size={12} aria-hidden="true" /> Regenerate
              </button>
            </div>
          )}
        </div>
      )}

      {tab === "quiz" && (
        <div>
          {!questions && !quizLoading && (
            <div className="text-sm text-eduverse-text-muted">
              <p className="mb-3">Test yourself with 4 AI-generated questions about this lesson.</p>
              <button className="ai-panel-action-btn" onClick={loadQuiz}>Generate Quiz</button>
              {quizError && <p className="mt-3" role="alert">Error: {quizError}</p>}
            </div>
          )}
          {quizLoading && (
            <div className="space-y-3 animate-pulse" aria-label="Generating quiz">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 rounded bg-eduverse-raised" />
              ))}
            </div>
          )}
          {questions && !quizLoading && (
            <div className="space-y-5">
              {questions.map((q, qi) => {
                const isCorrect = checked && selected[qi] === q.answerIndex;
                const isWrong = checked && selected[qi] !== -1 && selected[qi] !== q.answerIndex;
                return (
                  <div key={qi}>
                    <div className="text-sm font-semibold text-eduverse-text mb-2 flex items-start gap-2">
                      <span className="font-mono text-eduverse-accent shrink-0">{qi + 1}.</span>
                      <span>{q.question}</span>
                      {isCorrect && <CheckCircle size={15} className="text-eduverse-success mt-0.5 shrink-0" aria-label="Correct" />}
                      {isWrong && <XCircle size={15} className="text-eduverse-danger mt-0.5 shrink-0" aria-label="Incorrect" />}
                    </div>
                    <div className="space-y-1.5">
                      {q.options.map((opt, oi) => {
                        const chosen = selected[qi] === oi;
                        const showCorrect = checked && oi === q.answerIndex;
                        const showWrong = checked && chosen && oi !== q.answerIndex;
                        return (
                          <button
                            key={oi}
                            onClick={() => {
                              if (checked) return;
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
                              cursor: checked ? "default" : "pointer",
                            }}
                            aria-pressed={chosen}
                            disabled={checked}
                          >
                            <span className="font-mono mr-2">{String.fromCharCode(65 + oi)}.</span>
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                    {checked && q.explanation && (
                      <p className="text-xs text-eduverse-text-muted mt-2 pl-1">{q.explanation}</p>
                    )}
                  </div>
                );
              })}
              <div className="flex items-center gap-3 flex-wrap">
                {!checked ? (
                  <button className="ai-panel-action-btn" onClick={() => setChecked(true)} disabled={!allAnswered}>
                    {allAnswered ? "Check Answers" : "Answer all questions first"}
                  </button>
                ) : (
                  <>
                    <span className="text-sm font-bold font-mono text-eduverse-text">
                      {correctCount}/{questions.length} correct
                    </span>
                    <button className="ai-panel-action-btn ai-panel-action-sm ai-panel-action-ghost" onClick={loadQuiz}>
                      <RefreshCw size={12} aria-hidden="true" /> New Quiz
                    </button>
                  </>
                )}
              </div>
              {quizError && <p className="text-sm text-eduverse-text-muted" role="alert">Error: {quizError}</p>}
            </div>
          )}
        </div>
      )}
    </GlassCard>
  );
}

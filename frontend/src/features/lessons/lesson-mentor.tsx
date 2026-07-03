"use client";

import { useState } from "react";
import { Brain, RefreshCw, Code2, Lightbulb, Send } from "lucide-react";
import { api } from "@/services/api-client";
import { GlassCard } from "@/components/ui/glass-card";

interface LessonMentorProps {
  title: string;
  content: string;
  language: string;
}

/**
 * Context-aware in-lesson mentor. Every action ships the lesson content as
 * context so explanations, examples, and practice are grounded in THIS lesson.
 * Built entirely on existing AI endpoints (mentor chat, review, hints).
 */
export function LessonMentor({ title, content, language }: LessonMentorProps) {
  const [tab, setTab] = useState<"help" | "review">("help");

  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeAction, setActiveAction] = useState("");
  const [custom, setCustom] = useState("");

  const [code, setCode] = useState("");
  const [review, setReview] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState("");

  const ask = async (label: string, message: string) => {
    setLoading(true);
    setError("");
    setActiveAction(label);
    setAnswer("");
    try {
      const res = await api.aiMentor(message, [], `Lesson "${title}" (${language}):\n${content}`);
      setAnswer(res.data.text);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "The mentor couldn't respond. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const actions: { label: string; message: string }[] = [
    {
      label: "Explain differently",
      message: "Re-explain the core idea of this lesson in a different way, using a fresh analogy.",
    },
    {
      label: "Simplify",
      message: "Explain this lesson as simply as possible, like I'm a complete beginner.",
    },
    {
      label: "Another example",
      message: "Give me one more worked example that illustrates this lesson's main concept.",
    },
    {
      label: "Practice exercise",
      message:
        "Create one short practice exercise based on this lesson. Give the task only — do NOT include the solution.",
    },
  ];

  const runReview = async () => {
    if (!code.trim()) return;
    setReviewLoading(true);
    setReviewError("");
    setReview("");
    try {
      const res = await api.aiReview(code, language);
      setReview(res.data.text);
    } catch (err: unknown) {
      setReviewError(err instanceof Error ? err.message : "Could not review the code.");
    } finally {
      setReviewLoading(false);
    }
  };

  const tabBtn = (key: "help" | "review", label: string, Icon: typeof Brain) => (
    <button
      onClick={() => setTab(key)}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-button)] text-xs font-semibold transition-colors"
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
          <span className="text-eduverse-accent">//</span> AI Mentor
        </h2>
        <div className="flex gap-1.5">
          {tabBtn("help", "Lesson Help", Brain)}
          {tabBtn("review", "Review My Code", Code2)}
        </div>
      </div>

      {tab === "help" && (
        <div>
          <div className="flex flex-wrap gap-2 mb-3">
            {actions.map((a) => (
              <button
                key={a.label}
                onClick={() => ask(a.label, a.message)}
                disabled={loading}
                className="text-xs px-3 py-1.5 rounded-full border border-eduverse-border hover:border-eduverse-accent text-eduverse-text-body transition-colors disabled:opacity-50"
              >
                {a.label}
              </button>
            ))}
          </div>

          <div className="flex gap-2 mb-3">
            <input
              className="flex-1 px-3 py-2 rounded-[var(--radius-input)] border border-eduverse-border bg-transparent text-sm text-eduverse-text focus:border-eduverse-accent outline-none transition-colors"
              placeholder="Ask about this lesson, or paste an error to understand it…"
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && custom.trim()) ask("Your question", custom.trim());
              }}
              disabled={loading}
              aria-label="Ask the mentor about this lesson"
            />
            <button
              className="px-3 py-2 rounded-[var(--radius-button)] bg-eduverse-accent-strong text-white text-sm font-semibold hover:brightness-110 active:scale-[0.97] transition-[filter,transform] duration-150 disabled:opacity-50 flex items-center gap-1.5"
              onClick={() => custom.trim() && ask("Your question", custom.trim())}
              disabled={!custom.trim() || loading}
            >
              <Send size={14} aria-hidden="true" /> Ask
            </button>
          </div>

          {loading && (
            <div className="space-y-2 animate-pulse" aria-label="Mentor is responding">
              <div className="h-3.5 w-full rounded-[var(--radius-sm)] bg-eduverse-raised" />
              <div className="h-3.5 w-5/6 rounded-[var(--radius-sm)] bg-eduverse-raised" />
              <div className="h-3.5 w-2/3 rounded-[var(--radius-sm)] bg-eduverse-raised" />
            </div>
          )}
          {error && (
            <p className="text-sm text-eduverse-text-muted" role="alert">
              Error: {error}
            </p>
          )}
          {answer && !loading && (
            <div role="status" aria-live="polite">
              {activeAction && (
                <div className="text-xs font-mono text-eduverse-accent mb-1.5">{activeAction}</div>
              )}
              <p className="text-sm leading-relaxed text-eduverse-text-body whitespace-pre-wrap">
                {answer}
              </p>
            </div>
          )}
          {!answer && !loading && !error && (
            <p className="text-sm text-eduverse-text-muted flex items-center gap-2">
              <Lightbulb size={14} className="text-eduverse-accent" aria-hidden="true" />
              Stuck? Pick an action above or ask anything — the mentor answers using this lesson.
            </p>
          )}
        </div>
      )}

      {tab === "review" && (
        <div>
          <p className="text-sm text-eduverse-text-muted mb-2">
            Paste your code and get focused feedback for this lesson.
          </p>
          <textarea
            className="w-full h-40 px-3 py-2 rounded-[var(--radius-input)] border border-eduverse-border bg-transparent text-sm font-mono text-eduverse-text focus:border-eduverse-accent outline-none transition-colors resize-y"
            placeholder={`Paste your ${language} code here…`}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            aria-label="Code to review"
          />
          <div className="flex items-center gap-3 mt-3">
            <button
              className="ai-panel-action-btn"
              onClick={runReview}
              disabled={!code.trim() || reviewLoading}
            >
              {reviewLoading ? (
                <RefreshCw size={14} className="animate-spin" aria-hidden="true" />
              ) : (
                <Code2 size={14} aria-hidden="true" />
              )}
              {reviewLoading ? "Reviewing…" : "Review Code"}
            </button>
          </div>
          {reviewError && (
            <p className="text-sm text-eduverse-text-muted mt-3" role="alert">
              Error: {reviewError}
            </p>
          )}
          {review && !reviewLoading && (
            <p className="text-sm leading-relaxed text-eduverse-text-body whitespace-pre-wrap mt-3">
              {review}
            </p>
          )}
        </div>
      )}
    </GlassCard>
  );
}

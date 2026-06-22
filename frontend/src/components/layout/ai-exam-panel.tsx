"use client";

import { useState, useEffect } from "react";
import { GraduationCap, CheckCircle, XCircle } from "lucide-react";
import { api } from "@/services/api-client";
import { AIPanelShell } from "./ai-panel-shell";
import { useTopicOptions } from "@/hooks/use-topic-options";

interface GradeResult {
  score: number;
  passed: boolean;
  feedback: string;
  strengths: string[];
  improvements: string[];
}

export function ExamPanel({ onClose }: { onClose: () => void }) {
  const [phase, setPhase] = useState<"start" | "question" | "result">("start");
  const [topic, setTopic] = useState("python");
  const topicOptions = useTopicOptions();
  useEffect(() => {
    if (topicOptions.length && !topicOptions.some((o) => o.value === topic)) {
      setTopic(topicOptions[0].value);
    }
  }, [topicOptions, topic]);
  const [difficulty, setDifficulty] = useState("medium");
  const [question, setQuestion] = useState("");
  const [userAnswer, setUserAnswer] = useState("");
  const [grade, setGrade] = useState<GradeResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [examHistory, setExamHistory] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);

  const fetchQuestion = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.aiChallenge(topic, difficulty);
      const c = res.data.challenge;
      setQuestion(`${c.title}\n\n${c.description}${c.example ? `\n\nExample:\n${c.example}` : ""}`);
      setPhase("question");
      setUserAnswer("");
      setGrade(null);
      return true;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Request failed");
      return false;
    } finally {
      setLoading(false);
    }
  };

  /** Fresh exam session: reset the running score, then load a question. */
  const startExam = async () => {
    setExamHistory([]);
    setScore(0);
    setTotal(0);
    await fetchQuestion();
  };

  /** Next question keeps the session score going. */
  const nextQuestion = async () => {
    await fetchQuestion();
  };

  const submitAnswer = async () => {
    if (!userAnswer.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await api.aiExamGrade({ question, answer: userAnswer, topic, difficulty });
      setGrade(res.data);
      setTotal((p) => p + 1);
      if (res.data.passed) setScore((p) => p + 1);
      setExamHistory((p) => [
        ...p,
        `Q: ${question.substring(0, 60)}...`,
        `A: ${res.data.score}/10 — ${userAnswer.substring(0, 48)}...`,
      ]);
      setPhase("result");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AIPanelShell
      title="Exam Mode"
      subtitle="AI-generated coding exams"
      onClose={onClose}
      icon={GraduationCap}
    >
      <div className="ai-panel-gen">
        {phase === "start" && (
          <>
            <div className="ai-panel-gen-row">
              <select
                className="ai-panel-select"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                aria-label="Exam topic"
              >
                {topicOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <select
                className="ai-panel-select"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <button className="ai-panel-action-btn" onClick={startExam} disabled={loading}>
              {loading ? "Generating..." : "Start Exam"}
            </button>
            {error && (
              <div className="ai-panel-empty" role="alert">
                Error: {error}
              </div>
            )}
          </>
        )}

        {(phase === "question" || phase === "result") && (
          <>
            <div className="ai-panel-exam-header">
              <span className="ai-panel-exam-score">
                Score: {score}/{total}
              </span>
              <button
                className="ai-panel-action-btn ai-panel-action-sm"
                onClick={nextQuestion}
                disabled={loading}
              >
                {loading && phase === "result" ? "Loading..." : "Next Question"}
              </button>
            </div>
            <div className="ai-panel-exam-question">
              <div className="ai-panel-exam-label">Question:</div>
              <pre className="ai-panel-exam-text">{question}</pre>
            </div>
            {error && (
              <div className="ai-panel-empty" role="alert">
                Error: {error}
              </div>
            )}
            {phase === "question" && (
              <>
                <textarea
                  className="ai-panel-textarea ai-panel-exam-answer"
                  placeholder="Write your solution..."
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  rows={6}
                />
                <button
                  className="ai-panel-action-btn"
                  onClick={submitAnswer}
                  disabled={loading || !userAnswer.trim()}
                >
                  {loading ? "Evaluating..." : "Submit Answer"}
                </button>
              </>
            )}
            {phase === "result" && grade && (
              <div className="ai-panel-result">
                <div className="ai-panel-exam-header">
                  <span
                    className="ai-panel-exam-score"
                    style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
                  >
                    {grade.passed ? (
                      <CheckCircle size={14} aria-hidden="true" />
                    ) : (
                      <XCircle size={14} aria-hidden="true" />
                    )}
                    {grade.score}/10 {grade.passed ? "— Passed" : "— Keep practicing"}
                  </span>
                </div>
                <div className="ai-panel-result-text">{grade.feedback}</div>
                {grade.strengths.length > 0 && (
                  <div className="ai-panel-result-text" style={{ marginTop: 8 }}>
                    {grade.strengths.map((s, i) => (
                      <div key={i}>✓ {s}</div>
                    ))}
                  </div>
                )}
                {grade.improvements.length > 0 && (
                  <div className="ai-panel-result-text" style={{ marginTop: 8 }}>
                    {grade.improvements.map((s, i) => (
                      <div key={i}>→ {s}</div>
                    ))}
                  </div>
                )}
                <button
                  className="ai-panel-action-btn mt-2"
                  onClick={() => {
                    setPhase("question");
                    setGrade(null);
                  }}
                >
                  Revise Answer
                </button>
              </div>
            )}
          </>
        )}

        {examHistory.length > 0 && (
          <div className="ai-panel-exam-history">
            <div className="ai-panel-exam-label">History</div>
            {examHistory.slice(-6).map((entry, i) => (
              <div
                key={i}
                className={`ai-panel-exam-history-entry ${entry.startsWith("Q:") ? "exam-q" : "exam-a"}`}
              >
                {entry}
              </div>
            ))}
          </div>
        )}
      </div>
    </AIPanelShell>
  );
}

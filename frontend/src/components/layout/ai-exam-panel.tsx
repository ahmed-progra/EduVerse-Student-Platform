"use client";

import { useState } from "react";
import { GraduationCap } from "lucide-react";
import { api } from "@/lib/api";
import { AIPanelShell } from "./ai-panel-shell";

export function ExamPanel({ onClose }: { onClose: () => void }) {
  const [phase, setPhase] = useState<"start" | "question" | "result">("start");
  const [topic, setTopic] = useState("python");
  const [difficulty, setDifficulty] = useState("medium");
  const [question, setQuestion] = useState("");
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [examHistory, setExamHistory] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);

  const startExam = async () => {
    setLoading(true);
    try {
      const res = await api.aiChallenge(topic, difficulty);
      const c = res.data.challenge;
      setQuestion(`${c.title}\n\n${c.description}${c.example ? `\n\nExample:\n${c.example}` : ""}`);
      setPhase("question");
      setUserAnswer("");
      setFeedback("");
      setExamHistory([]);
      setScore(0);
      setTotal(0);
    } catch (err: unknown) {
      setQuestion(`Error: ${err instanceof Error ? err.message : "Request failed"}`);
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!userAnswer.trim()) return;
    setLoading(true);
    setTotal((p) => p + 1);
    try {
      const res = await api.aiMentor(
        `I'm taking a ${difficulty} ${topic} exam. The question is:\n${question}\n\nMy answer:\n\`\`\`python\n${userAnswer}\n\`\`\`\n\nEvaluate my answer. Give a score (0-10), what I did well, and what to improve. Be concise but specific.`
      );
      setFeedback(res.data.text);
      setExamHistory((p) => [...p, `Q: ${question.substring(0, 60)}...`, `A: ${userAnswer.substring(0, 60)}...`]);
      if (res.data.text.includes("10/10") || res.data.text.includes("9/10") || res.data.text.includes("8/10")) {
        setScore((p) => p + 1);
      }
      setPhase("result");
    } catch (err: unknown) {
      setFeedback(`Error: ${err instanceof Error ? err.message : "Request failed"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AIPanelShell title="Exam Mode" subtitle="AI-generated coding exams" onClose={onClose} icon={GraduationCap}>
      <div className="ai-panel-gen">
        {phase === "start" && (
          <>
            <div className="ai-panel-gen-row">
              <select className="ai-panel-select" value={topic} onChange={(e) => setTopic(e.target.value)}>
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
                <option value="algorithms">Algorithms</option>
              </select>
              <select className="ai-panel-select" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <button className="ai-panel-action-btn" onClick={startExam} disabled={loading}>
              {loading ? "Generating..." : "Start Exam"}
            </button>
          </>
        )}

        {(phase === "question" || phase === "result") && (
          <>
            <div className="ai-panel-exam-header">
              <span className="ai-panel-exam-score">Score: {score}/{total}</span>
              <button className="ai-panel-action-btn ai-panel-action-sm" onClick={startExam} disabled={loading}>
                New Question
              </button>
            </div>
            <div className="ai-panel-exam-question">
              <div className="ai-panel-exam-label">Question:</div>
              <pre className="ai-panel-exam-text">{question}</pre>
            </div>
            {phase === "question" && (
              <>
                <textarea
                  className="ai-panel-textarea ai-panel-exam-answer"
                  placeholder="Write your solution..."
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  rows={6}
                />
                <button className="ai-panel-action-btn" onClick={submitAnswer} disabled={loading || !userAnswer.trim()}>
                  {loading ? "Evaluating..." : "Submit Answer"}
                </button>
              </>
            )}
            {phase === "result" && feedback && (
              <div className="ai-panel-result">
                <div className="ai-panel-result-text">{feedback}</div>
                <button className="ai-panel-action-btn mt-2" onClick={() => setPhase("question")}>
                  Try Again
                </button>
              </div>
            )}
          </>
        )}

        {examHistory.length > 0 && (
          <div className="ai-panel-exam-history">
            <div className="ai-panel-exam-label">History</div>
            {examHistory.slice(-4).map((entry, i) => (
              <div key={i} className={`ai-panel-exam-history-entry ${i % 2 === 0 ? "exam-q" : "exam-a"}`}>
                {entry}
              </div>
            ))}
          </div>
        )}
      </div>
    </AIPanelShell>
  );
}

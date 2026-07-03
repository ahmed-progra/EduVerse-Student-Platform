"use client";

import { useState, useEffect } from "react";
import { Sparkles, Copy } from "lucide-react";
import { api } from "@/services/api-client";
import { AIPanelShell } from "./ai-panel-shell";
import { useTopicOptions } from "@/hooks/use-topic-options";

interface GeneratedChallenge {
  title: string;
  description: string;
  example?: string;
  difficulty?: string;
  topics?: string[];
}

export function ChallengePanel({ onClose }: { onClose: () => void }) {
  const [topic, setTopic] = useState("python");
  const topicOptions = useTopicOptions();
  useEffect(() => {
    if (topicOptions.length && !topicOptions.some((o) => o.value === topic)) {
      setTopic(topicOptions[0].value);
    }
  }, [topicOptions, topic]);
  const [difficulty, setDifficulty] = useState("medium");
  const [challenge, setChallenge] = useState<GeneratedChallenge | null>(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [responseLabel, setResponseLabel] = useState("");

  const generate = async () => {
    if (loading) return;
    setLoading(true);
    setSaved(false);
    setError("");
    try {
      const res = await api.aiChallenge(topic, difficulty);
      setResponseLabel(res.data.model || "Gemini");
      setChallenge(res.data.challenge);
    } catch (err: unknown) {
      setChallenge(null);
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  };

  const addToMyChallenges = () => {
    if (!challenge) return;
    try {
      const existing = JSON.parse(localStorage.getItem("eduverse_my_challenges") || "[]");
      existing.push({ ...challenge, topic, difficulty, added: Date.now() });
      localStorage.setItem("eduverse_my_challenges", JSON.stringify(existing));
      setSaved(true);
    } catch {
      localStorage.setItem(
        "eduverse_my_challenges",
        JSON.stringify([{ ...challenge, topic, difficulty, added: Date.now() }]),
      );
      setSaved(true);
    }
  };

  return (
    <AIPanelShell
      title="Challenge Generator"
      subtitle="AI generates problems for your level"
      onClose={onClose}
      icon={Sparkles}
    >
      <div className="ai-panel-gen">
        <div className="ai-panel-gen-row">
          <select
            className="ai-panel-select"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            aria-label="Challenge topic"
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
        <button className="ai-panel-action-btn" onClick={generate} disabled={loading}>
          {loading ? "Generating..." : "Generate Challenge"}
        </button>
        {error && (
          <div className="ai-panel-empty" role="alert">
            Error: {error}
          </div>
        )}
        {challenge && (
          <div className="ai-panel-challenge-card">
            <div className={`ai-panel-diff ai-panel-diff-${difficulty}`}>
              {difficulty === "easy"
                ? "Easy — great to start"
                : difficulty === "medium"
                  ? "Medium — think harder"
                  : "Hard — you'll earn this one"}
            </div>
            <div className="ai-panel-challenge-title">{challenge.title}</div>
            <div className="ai-panel-challenge-desc">{challenge.description}</div>
            {challenge.example && (
              <pre className="ai-panel-exam-text" style={{ marginTop: 8 }}>
                {challenge.example}
              </pre>
            )}
            <div className="ai-panel-meta">
              <span className="ai-panel-tag">{responseLabel}</span>
              <button
                className="ai-panel-copy"
                onClick={() =>
                  navigator.clipboard.writeText(
                    `${challenge.title}\n\n${challenge.description}${challenge.example ? `\n\nExample:\n${challenge.example}` : ""}`,
                  )
                }
                title="Copy challenge"
                aria-label="Copy challenge"
              >
                <Copy size={12} aria-hidden="true" />
              </button>
            </div>
            <button className="ai-panel-save-btn" onClick={addToMyChallenges} disabled={saved}>
              {saved ? "Saved!" : "Add to My Challenges"}
            </button>
          </div>
        )}
      </div>
    </AIPanelShell>
  );
}

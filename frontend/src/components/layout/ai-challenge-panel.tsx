"use client";

import { useState } from "react";
import { Sparkles, Copy } from "lucide-react";
import { api } from "@/lib/api";
import { AIPanelShell } from "./ai-panel-shell";

export function ChallengePanel({ onClose }: { onClose: () => void }) {
  const [topic, setTopic] = useState("python");
  const [difficulty, setDifficulty] = useState("medium");
  const [challenge, setChallenge] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [responseLabel, setResponseLabel] = useState("");

  const generate = async () => {
    if (loading) return;
    setLoading(true);
    setSaved(false);
    try {
      const res = await api.aiChallenge(topic, difficulty);
      setResponseLabel("Claude AI");
      setChallenge(JSON.stringify(res.data.challenge));
    } catch (err: unknown) {
      setChallenge(JSON.stringify({ title: "Error", description: err instanceof Error ? err.message : "Request failed" }));
    } finally {
      setLoading(false);
    }
  };

  const addToMyChallenges = () => {
    if (!challenge) return;
    const c = JSON.parse(challenge);
    const existing = JSON.parse(localStorage.getItem("eduverse_my_challenges") || "[]");
    existing.push({ ...c, topic, difficulty, added: Date.now() });
    localStorage.setItem("eduverse_my_challenges", JSON.stringify(existing));
    setSaved(true);
  };

  return (
    <AIPanelShell title="Challenge Generator" subtitle="AI generates problems for your level" onClose={onClose} icon={Sparkles}>
      <div className="ai-panel-gen">
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
        <button className="ai-panel-action-btn" onClick={generate} disabled={loading}>
          {loading ? "Generating..." : "Generate Challenge"}
        </button>
        {challenge && (() => {
          const c = JSON.parse(challenge);
          return (
            <div className="ai-panel-challenge-card">
              <div className={`ai-panel-diff ai-panel-diff-${difficulty}`}>
                {difficulty === "easy" ? "Easy — great to start" : difficulty === "medium" ? "Medium — think harder" : "Hard — you'll earn this one"}
              </div>
              <div className="ai-panel-challenge-title">{c.title}</div>
              <div className="ai-panel-challenge-desc">{c.desc}</div>
              <div className="ai-panel-meta">
                <span className="ai-panel-tag">{responseLabel}</span>
                <button className="ai-panel-copy" onClick={() => navigator.clipboard.writeText(c.desc)} title="Copy challenge">
                  <Copy size={12} />
                </button>
              </div>
              <button className="ai-panel-save-btn" onClick={addToMyChallenges} disabled={saved}>
                {saved ? "Saved!" : "Add to My Challenges"}
              </button>
            </div>
          );
        })()}
      </div>
    </AIPanelShell>
  );
}

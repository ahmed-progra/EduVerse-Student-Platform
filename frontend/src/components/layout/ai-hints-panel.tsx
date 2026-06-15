"use client";

import { useState } from "react";
import { Lightbulb } from "lucide-react";
import { api } from "@/services/api-client";
import { AIPanelShell } from "./ai-panel-shell";

export function HintsPanel({ onClose }: { onClose: () => void }) {
  const [unlocked, setUnlocked] = useState(0);
  const [revealed, setRevealed] = useState<number[]>([]);
  const [challenge, setChallenge] = useState("");
  const [hints, setHints] = useState<string[]>(["Describe your challenge above, then generate AI-powered progressive hints."]);
  const [loadingHints, setLoadingHints] = useState(false);
  const [error, setError] = useState("");

  const generateHints = async () => {
    setLoadingHints(true);
    setError("");
    try {
      const res = await api.aiHints(challenge.trim() || undefined);
      const parts = res.data.hints?.length
        ? res.data.hints
        : res.data.text.split("|||").map((s: string) => s.trim()).filter(Boolean);
      setHints(parts.length >= 1 ? parts : ["No hints returned — try again."]);
      setUnlocked(0);
      setRevealed([]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not generate hints. Try again later.");
    } finally {
      setLoadingHints(false);
    }
  };

  const reveal = (level: number) => {
    if (level > unlocked) return;
    if (!revealed.includes(level)) setRevealed((p) => [...p, level]);
    if (level + 1 > unlocked && level < hints.length - 1) setUnlocked(level + 1);
  };

  return (
    <AIPanelShell title="Hints" subtitle="AI-powered progressive hints" onClose={onClose} icon={Lightbulb}>
      <div className="ai-panel-hints">
        <textarea
          className="ai-panel-textarea"
          placeholder="Paste or describe the challenge you're stuck on (e.g. 'reverse a linked list in Python')..."
          value={challenge}
          onChange={(e) => setChallenge(e.target.value)}
          rows={3}
        />
        <button className="ai-panel-action-btn" onClick={generateHints} disabled={loadingHints}>
          {loadingHints ? "Generating..." : "Generate Hints"}
        </button>
        {error && <div className="ai-panel-empty" role="alert">{error}</div>}
        <div className="ai-panel-hint-btns">
          {hints.map((_, i) => (
            <button
              key={i}
              className={`ai-panel-hint-btn ${revealed.includes(i) ? "ai-panel-hint-used" : ""} ${i > unlocked ? "ai-panel-hint-locked" : ""}`}
              onClick={() => reveal(i)}
              disabled={i > unlocked}
            >
              {i > unlocked ? "Locked" : revealed.includes(i) ? "Revealed" : `Hint ${i + 1}`}
            </button>
          ))}
        </div>
        <div className="ai-panel-hint-list">
          {revealed.map((i) => (
            <div key={i} className="ai-panel-hint-item">
              <div className="ai-panel-hint-label">Hint {i + 1}</div>
              <div className="ai-panel-hint-text">{hints[i]}</div>
            </div>
          ))}
        </div>
      </div>
    </AIPanelShell>
  );
}

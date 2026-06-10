"use client";

import { useState } from "react";
import { Lightbulb } from "lucide-react";
import { api } from "@/lib/api";
import { AIPanelShell } from "./ai-panel-shell";

export function HintsPanel({ onClose }: { onClose: () => void }) {
  const [unlocked, setUnlocked] = useState(0);
  const [revealed, setRevealed] = useState<number[]>([]);
  const [hints, setHints] = useState<string[]>(["Click Generate Hints to get AI-powered progressive hints."]);
  const [loadingHints, setLoadingHints] = useState(false);

  const generateHints = async () => {
    setLoadingHints(true);
    try {
      const res = await api.aiHints("Python programming challenge");
      const parts = res.data.text.split("|||").map((s: string) => s.trim());
      setHints(parts.length >= 3 ? parts : [res.data.text]);
      setUnlocked(0);
      setRevealed([]);
    } catch {
      setHints(["Could not generate hints. Try again later."]);
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
        <button className="ai-panel-action-btn" onClick={generateHints} disabled={loadingHints}>
          {loadingHints ? "Generating..." : "Generate Hints"}
        </button>
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

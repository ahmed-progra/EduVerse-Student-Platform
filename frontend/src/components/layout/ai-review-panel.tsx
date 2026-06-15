"use client";

import { useState } from "react";
import { Code2, Copy } from "lucide-react";
import { api } from "@/services/api-client";
import { AIPanelShell } from "./ai-panel-shell";

export function CodeReviewPanel({ onClose }: { onClose: () => void }) {
  const [code, setCode] = useState("");
  const [lang, setLang] = useState("python");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [responseLabel, setResponseLabel] = useState("");

  const review = async () => {
    if (!code.trim() || loading) return;
    setLoading(true);
    setResult("");
    try {
      const res = await api.aiReview(code, lang);
      setResponseLabel(res.data.model || "Gemini");
      setResult(res.data.text);
    } catch (err: unknown) {
      setResult(`Error: ${err instanceof Error ? err.message : "Request failed"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AIPanelShell title="Code Review" subtitle="Get AI feedback on your code" onClose={onClose} icon={Code2}>
      <div className="ai-panel-review">
        <select className="ai-panel-select" value={lang} onChange={(e) => setLang(e.target.value)}>
          <option value="python">Python</option>
          <option value="javascript">JavaScript</option>
          <option value="other">Other</option>
        </select>
        <textarea className="ai-panel-textarea" placeholder="Paste your code here..." value={code} onChange={(e) => setCode(e.target.value)} rows={8} />
        <button className="ai-panel-action-btn" onClick={review} disabled={!code.trim() || loading}>
          {loading ? "Analyzing..." : "Review Code"}
        </button>
        {result && (
          <div className="ai-panel-result">
            <div className="ai-panel-result-text">{result}</div>
            <div className="ai-panel-meta">
              <span className="ai-panel-tag">{responseLabel}</span>
              <button className="ai-panel-copy" onClick={() => navigator.clipboard.writeText(result)} title="Copy review">
                <Copy size={12} />
              </button>
            </div>
          </div>
        )}
      </div>
    </AIPanelShell>
  );
}

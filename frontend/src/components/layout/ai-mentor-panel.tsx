"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Brain, Copy } from "lucide-react";
import { api } from "@/lib/api";
import { AIPanelShell } from "./ai-panel-shell";

export function AIMentorPanel({ onClose }: { onClose: () => void }) {
  const [msgs, setMsgs] = useState<{ role: string; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [responseLabel, setResponseLabel] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  const send = useCallback(async () => {
    if (!input.trim() || loading) return;
    const msg = input;
    setMsgs((p) => [...p, { role: "user", text: msg }]);
    setInput("");
    setLoading(true);
    try {
      const res = await api.aiMentor(msg);
      setResponseLabel("Claude AI");
      setMsgs((p) => [...p, { role: "assistant", text: res.data.text }]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Request failed";
      setMsgs((p) => [...p, { role: "assistant", text: `Error: ${msg}` }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading]);

  const copyText = (text: string) => navigator.clipboard.writeText(text);

  return (
    <AIPanelShell title="AI Mentor" subtitle="Ask any programming question" onClose={onClose} icon={Brain}>
      <div className="ai-panel-chat">
        {msgs.length === 0 && !loading && (
          <div className="ai-panel-empty">Ask a programming question and get guidance.</div>
        )}
        {msgs.map((m, i) => (
          <div key={i} className={`ai-panel-msg ai-panel-${m.role}`}>
            {m.text}
            {m.role === "assistant" && (
              <div className="ai-panel-meta">
                <span className="ai-panel-tag">{responseLabel}</span>
                <button className="ai-panel-copy" onClick={() => copyText(m.text)} title="Copy response">
                  <Copy size={12} />
                </button>
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="ai-panel-msg ai-panel-assistant">
            <span className="ai-panel-typing">Thinking</span>
          </div>
        )}
        <div ref={endRef} />
      </div>
      <div className="ai-panel-input-row">
        <input className="ai-panel-input" data-ai-shortcut placeholder="Ask a question..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} disabled={loading} />
        <button className="ai-panel-send" onClick={send} disabled={!input.trim() || loading}>Send</button>
      </div>
    </AIPanelShell>
  );
}

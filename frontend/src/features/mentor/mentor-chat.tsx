"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Sparkles } from "lucide-react";
import { api } from "@/services/api-client";

interface ChatMsg {
  role: "user" | "assistant";
  text: string;
}

const SUGGESTIONS = [
  "What should I focus on this week?",
  "Explain my weakest topic simply",
  "Give me a project idea for my level",
];

/**
 * Profile-aware mentor chat. Unlike the lesson-scoped AI Mentor panel, this
 * endpoint loads the learner's full MentorProfile as context (the "AI memory").
 */
export function MentorChat() {
  const [msgs, setMsgs] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, loading]);

  const send = useCallback(
    async (text: string) => {
      const msg = text.trim();
      if (!msg || loading) return;
      const history = msgs
        .filter((m) => !m.text.startsWith("Error:"))
        .map((m) => ({ role: m.role === "assistant" ? "model" : "user", text: m.text }));
      setMsgs((p) => [...p, { role: "user", text: msg }]);
      setInput("");
      setLoading(true);
      try {
        const res = await api.mentorChat(msg, history);
        setMsgs((p) => [...p, { role: "assistant", text: res.data.text }]);
      } catch (err: unknown) {
        setMsgs((p) => [...p, { role: "assistant", text: `Error: ${err instanceof Error ? err.message : "Request failed"}` }]);
      } finally {
        setLoading(false);
      }
    },
    [loading, msgs]
  );

  return (
    <div>
      <div className="space-y-3 max-h-80 overflow-y-auto pr-1 mb-3">
        {msgs.length === 0 && !loading && (
          <div className="text-sm text-eduverse-text-muted">
            <p className="mb-3">Your mentor knows your full progress. Ask anything — it answers in context.</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="text-xs px-2.5 py-1.5 rounded-full border border-eduverse-border hover:border-eduverse-accent text-eduverse-text-body transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {msgs.map((m, i) => (
          <div
            key={i}
            className="text-sm leading-relaxed rounded-lg px-3 py-2 whitespace-pre-wrap"
            style={{
              background: m.role === "user" ? "var(--color-eduverse-accent-soft)" : "var(--color-eduverse-raised)",
              color: "var(--color-eduverse-text-body)",
              marginLeft: m.role === "user" ? "auto" : 0,
              maxWidth: "92%",
              width: "fit-content",
            }}
          >
            {m.text}
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-sm text-eduverse-text-muted">
            <Sparkles size={14} className="text-eduverse-accent animate-pulse" aria-hidden="true" /> Mentor is thinking…
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="flex gap-2">
        <input
          className="flex-1 px-3 py-2 rounded border border-eduverse-border bg-transparent text-sm text-eduverse-text focus:border-eduverse-accent outline-none transition-colors"
          placeholder="Ask your mentor…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send(input)}
          disabled={loading}
          aria-label="Message your mentor"
        />
        <button
          className="px-3 py-2 rounded bg-eduverse-accent-strong text-white text-sm font-semibold hover:brightness-110 active:scale-[0.97] transition-[filter,transform] duration-150 disabled:opacity-50 flex items-center gap-1.5"
          onClick={() => send(input)}
          disabled={!input.trim() || loading}
        >
          <Send size={14} aria-hidden="true" /> Send
        </button>
      </div>
    </div>
  );
}

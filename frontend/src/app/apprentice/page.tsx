"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sprout, Send, GraduationCap, Sparkles, ChevronRight, Lightbulb, WifiOff, Compass } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { EmptyState } from "@/components/ui/empty-state";
import { useAuthStore } from "@/stores/auth-store";
import { api } from "@/services/api-client";
import type { TeachTurn, TeachGrade, TeachableCourse } from "@/types/apprentice";
import { PipAvatar } from "@/features/apprentice/pip-avatar";
import { TeachGradeCard } from "@/features/apprentice/teach-grade-card";

const ease = [0.22, 1, 0.36, 1] as const;

interface StartTarget {
  topic: string;
  topicKey: string | null;
  courseSlug: string | null;
  courseLabel?: string;
}

export default function ApprenticePage() {
  const { updateXp } = useAuthStore();

  const [phase, setPhase] = useState<"pick" | "teach" | "graded">("pick");
  const [catalog, setCatalog] = useState<TeachableCourse[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogOffline, setCatalogOffline] = useState(false);
  const [maxTurns, setMaxTurns] = useState(5);
  const [suggested, setSuggested] = useState<StartTarget[]>([]);

  // picker selection
  const [selCourse, setSelCourse] = useState("");
  const [selTopic, setSelTopic] = useState("");
  const [customTopic, setCustomTopic] = useState("");

  // active session
  const [target, setTarget] = useState<StartTarget | null>(null);
  const [messages, setMessages] = useState<TeachTurn[]>([]);
  const [understanding, setUnderstanding] = useState(0);
  const [done, setDone] = useState(false);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [grading, setGrading] = useState(false);
  const [grade, setGrade] = useState<TeachGrade | null>(null);
  const [error, setError] = useState("");

  const endRef = useRef<HTMLDivElement>(null);
  const autoStartedRef = useRef(false);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, thinking]);

  const mentorTurns = messages.filter((m) => m.role === "mentor").length;

  // ── load topic catalog + suggested weak topics ──
  useEffect(() => {
    setCatalogLoading(true);
    setCatalogOffline(false);
    api
      .apprenticeTopics()
      .then((res) => {
        setCatalog(res.data.courses);
        setMaxTurns(res.data.maxTurns);
        if (res.data.courses[0]) setSelCourse(res.data.courses[0].courseSlug);
        // Pull weak topics from the mentor profile (cached) and map them to the catalog.
        api.mentorProfile().then((p) => {
          const weak = p.data.metrics?.weakTopics || [];
          const byTitle = new Map(res.data.courses.map((c) => [c.courseTitle, c]));
          const targets: StartTarget[] = [];
          for (const w of weak.slice(0, 5)) {
            const course = byTitle.get(w.course);
            if (course) targets.push({ topic: w.label, topicKey: w.key, courseSlug: course.courseSlug, courseLabel: course.courseTitle });
          }
          setSuggested(targets);
        }).catch(() => {});
      })
      .catch(() => {
        setCatalogOffline(true);
        setError("Could not load topics. Is the backend running?");
      })
      .finally(() => setCatalogLoading(false));
  }, []);

  const startTeaching = useCallback(async (t: StartTarget) => {
    setError("");
    setTarget(t);
    setPhase("teach");
    setMessages([]);
    setUnderstanding(0);
    setDone(false);
    setGrade(null);
    setThinking(true);
    try {
      const res = await api.apprenticeStart({ topic: t.topic, courseLabel: t.courseLabel });
      setMessages([{ role: "apprentice", text: res.data.say }]);
      setUnderstanding(res.data.understanding);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Pip couldn't start the lesson. Try again.");
      setMessages([{ role: "apprentice", text: "Hmm, I got distracted — could you start explaining and I'll catch up?" }]);
    } finally {
      setThinking(false);
    }
  }, []);

  // ── deep-link: /apprentice?topic=Loops&topicKey=loops&course=python ──
  // From the Coach dashboard (full topic) or a teach mission (topicKey only —
  // the label is resolved from the catalog once it loads).
  // Guarded so React StrictMode's double-invoke can't fire two sessions.
  useEffect(() => {
    if (autoStartedRef.current) return;
    const q = new URLSearchParams(window.location.search);
    const topic = q.get("topic");
    const topicKey = q.get("topicKey");
    const course = q.get("course");
    if (topic) {
      autoStartedRef.current = true;
      startTeaching({ topic, topicKey, courseSlug: course, courseLabel: q.get("courseLabel") || undefined });
    } else if (topicKey && course && catalog.length) {
      const c = catalog.find((x) => x.courseSlug === course);
      const t = c?.topics.find((x) => x.key === topicKey);
      if (c && t) {
        autoStartedRef.current = true;
        startTeaching({ topic: t.label, topicKey, courseSlug: course, courseLabel: c.courseTitle });
      }
    }
  }, [startTeaching, catalog]);

  const sendExplanation = async () => {
    const text = input.trim();
    if (!text || thinking || !target) return;
    const newMessages: TeachTurn[] = [...messages, { role: "mentor", text }];
    setMessages(newMessages);
    setInput("");
    setThinking(true);
    setError("");
    try {
      const turnIndex = newMessages.filter((m) => m.role === "mentor").length - 1;
      const res = await api.apprenticeReply({ topic: target.topic, turns: newMessages, turnIndex });
      setMessages((p) => [...p, { role: "apprentice", text: res.data.say }]);
      setUnderstanding(res.data.understanding);
      if (res.data.done) setDone(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Pip didn't respond. Try again.");
    } finally {
      setThinking(false);
    }
  };

  const finishAndGrade = async () => {
    if (!target || grading) return;
    setGrading(true);
    setError("");
    try {
      const res = await api.apprenticeGrade({ topic: target.topic, topicKey: target.topicKey, courseSlug: target.courseSlug, turns: messages });
      setGrade(res.data);
      setPhase("graded");
      // Reflect awarded XP in the sidebar.
      api.getProfile().then((p) => updateXp(p.data.xp, p.data.level)).catch(() => {});
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Grading failed. Try again.");
    } finally {
      setGrading(false);
    }
  };

  const reset = () => {
    setPhase("pick");
    setTarget(null);
    setMessages([]);
    setGrade(null);
    setUnderstanding(0);
    setDone(false);
    setError("");
    setCustomTopic("");
  };

  const courseTopics = catalog.find((c) => c.courseSlug === selCourse)?.topics || [];

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* ── Header ── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }}>
        <h1 className="text-3xl font-bold mb-1 font-display flex items-center gap-2">
          <Sprout className="w-7 h-7 text-eduverse-accent" aria-hidden="true" /> Apprentice
        </h1>
        <p className="text-eduverse-text-muted">
          Meet Pip — your AI apprentice. Teach Pip a topic and you&apos;ll learn it twice as deeply. <span className="text-eduverse-text-body">Teaching is the best way to learn.</span>
        </p>
      </motion.div>

      {error && phase === "pick" && catalogOffline && (
        <EmptyState icon={WifiOff} title="Can't reach the server" message="The EduVerse API isn't responding, so the topic catalog can't be loaded." />
      )}

      {error && phase === "pick" && !catalogOffline && (
        <p className="text-sm text-eduverse-text-muted" role="alert">Error: {error}</p>
      )}

      {/* ── PICK ── */}
      {phase === "pick" && catalogLoading && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05, duration: 0.5, ease }} className="space-y-5">
          <div className="space-y-2" aria-label="Loading topics">
            <div className="h-20 rounded animate-pulse bg-eduverse-surface" />
            <div className="h-48 rounded animate-pulse bg-eduverse-surface" />
          </div>
        </motion.div>
      )}

      {phase === "pick" && !catalogLoading && !catalogOffline && catalog.length === 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05, duration: 0.5, ease }}>
          <EmptyState icon={Compass} title="No topics available" message="The topic catalog returned empty. Try again later or check with your instructor." />
        </motion.div>
      )}

      {phase === "pick" && !catalogLoading && !catalogOffline && catalog.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05, duration: 0.5, ease }} className="space-y-5">
          {suggested.length > 0 && (
            <GlassCard>
              <h2 className="flex items-center gap-2 text-sm font-mono text-eduverse-text-muted mb-3">
                <Lightbulb size={14} className="text-eduverse-accent" aria-hidden="true" /> Teach a weak topic (recommended)
              </h2>
              <p className="text-xs text-eduverse-text-muted mb-3">Your AI Coach flagged these gaps. Teaching them to Pip is the fastest way to close them.</p>
              <div className="flex flex-wrap gap-2">
                {suggested.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => startTeaching(s)}
                    className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg border border-eduverse-border hover:border-eduverse-accent text-eduverse-text-body transition-colors"
                  >
                    {s.topic} <span className="text-[10px] text-eduverse-text-muted">· {s.courseLabel}</span>
                    <ChevronRight size={13} className="text-eduverse-accent" aria-hidden="true" />
                  </button>
                ))}
              </div>
            </GlassCard>
          )}

          <GlassCard>
            <h2 className="flex items-center gap-2 text-sm font-mono text-eduverse-text-muted mb-4">
              <GraduationCap size={14} className="text-eduverse-accent" aria-hidden="true" /> Pick a topic to teach
            </h2>
            <div className="grid sm:grid-cols-2 gap-3 mb-3">
              <select
                value={selCourse}
                onChange={(e) => { setSelCourse(e.target.value); setSelTopic(""); }}
                className="px-3 py-2 rounded border border-eduverse-border bg-eduverse-surface text-sm text-eduverse-text focus:border-eduverse-accent outline-none"
                aria-label="Course"
              >
                {catalog.map((c) => (
                  <option key={c.courseSlug} value={c.courseSlug}>{c.courseTitle}</option>
                ))}
              </select>
              <select
                value={selTopic}
                onChange={(e) => setSelTopic(e.target.value)}
                className="px-3 py-2 rounded border border-eduverse-border bg-eduverse-surface text-sm text-eduverse-text focus:border-eduverse-accent outline-none"
                aria-label="Topic"
              >
                <option value="">Choose a topic…</option>
                {courseTopics.map((t) => (
                  <option key={t.key} value={t.key}>{t.label}</option>
                ))}
              </select>
            </div>
            <button
              className="ai-panel-action-btn"
              disabled={!selTopic}
              onClick={() => {
                const course = catalog.find((c) => c.courseSlug === selCourse);
                const topic = courseTopics.find((t) => t.key === selTopic);
                if (course && topic) startTeaching({ topic: topic.label, topicKey: topic.key, courseSlug: course.courseSlug, courseLabel: course.courseTitle });
              }}
            >
              <Sprout size={14} aria-hidden="true" /> Start Teaching Pip
            </button>

            <div className="border-t border-eduverse-border mt-5 pt-4">
              <p className="text-xs text-eduverse-text-muted mb-2">…or teach Pip anything else:</p>
              <div className="flex gap-2">
                <input
                  className="flex-1 px-3 py-2 rounded border border-eduverse-border bg-transparent text-sm text-eduverse-text focus:border-eduverse-accent outline-none transition-colors"
                  placeholder="e.g. Recursion, REST APIs, the box model…"
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && customTopic.trim() && startTeaching({ topic: customTopic.trim(), topicKey: null, courseSlug: null })}
                />
                <button
                  className="px-3 py-2 rounded bg-eduverse-accent-strong text-white text-sm font-semibold hover:brightness-110 active:scale-[0.97] transition-[filter,transform] duration-150 disabled:opacity-50"
                  disabled={!customTopic.trim()}
                  onClick={() => customTopic.trim() && startTeaching({ topic: customTopic.trim(), topicKey: null, courseSlug: null })}
                >
                  Teach
                </button>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* ── TEACH ── */}
      {phase === "teach" && target && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease }}>
          <GlassCard>
            <div className="flex items-center justify-between gap-3 mb-1">
              <div className="text-sm font-mono text-eduverse-text-muted">
                Teaching: <span className="text-eduverse-accent">{target.topic}</span>
              </div>
              <div className="text-xs font-mono text-eduverse-text-muted">Turn {Math.min(mentorTurns, maxTurns)} / {maxTurns}</div>
            </div>
            <div className="py-3 border-b border-eduverse-border mb-4">
              <PipAvatar understanding={understanding} thinking={thinking} />
            </div>

            <div className="space-y-3 max-h-[24rem] overflow-y-auto pr-1 mb-4">
              <AnimatePresence initial={false}>
                {messages.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease }}
                    className="text-sm leading-relaxed rounded-lg px-3 py-2 whitespace-pre-wrap"
                    style={{
                      background: m.role === "mentor" ? "var(--color-eduverse-accent-soft)" : "var(--color-eduverse-raised)",
                      color: "var(--color-eduverse-text-body)",
                      marginLeft: m.role === "mentor" ? "auto" : 0,
                      maxWidth: "90%",
                      width: "fit-content",
                    }}
                  >
                    {m.role === "apprentice" && <span className="text-[11px] font-semibold text-eduverse-accent block mb-0.5">Pip</span>}
                    {m.text}
                  </motion.div>
                ))}
              </AnimatePresence>
              {thinking && (
                <div className="flex items-center gap-2 text-sm text-eduverse-text-muted">
                  <Sparkles size={14} className="text-eduverse-accent animate-pulse" aria-hidden="true" /> Pip is thinking…
                </div>
              )}
              <div ref={endRef} />
            </div>

            {done && (
              <div className="text-xs text-eduverse-success mb-2 flex items-center gap-1.5">
                <Sparkles size={12} aria-hidden="true" /> Pip feels ready — grade your teaching whenever you like!
              </div>
            )}

            <div className="flex gap-2 mb-3">
              <textarea
                className="flex-1 h-20 px-3 py-2 rounded border border-eduverse-border bg-transparent text-sm text-eduverse-text focus:border-eduverse-accent outline-none transition-colors resize-y"
                placeholder="Explain it to Pip in your own words…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) sendExplanation(); }}
                disabled={thinking}
                aria-label="Your explanation"
              />
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <button
                className="px-3 py-2 rounded bg-eduverse-accent-strong text-white text-sm font-semibold hover:brightness-110 active:scale-[0.97] transition-[filter,transform] duration-150 disabled:opacity-50 flex items-center gap-1.5"
                onClick={sendExplanation}
                disabled={!input.trim() || thinking}
              >
                <Send size={14} aria-hidden="true" /> Explain to Pip
              </button>
              <button
                className="ai-panel-action-btn ai-panel-action-ghost"
                onClick={finishAndGrade}
                disabled={mentorTurns < 1 || grading || thinking}
                style={done ? { borderColor: "var(--color-eduverse-success)", color: "var(--color-eduverse-success)" } : undefined}
              >
                <GraduationCap size={14} aria-hidden="true" /> {grading ? "Grading…" : "Finish & Get Graded"}
              </button>
              <button className="text-xs text-eduverse-text-muted hover:text-eduverse-accent transition-colors" onClick={reset}>
                Cancel
              </button>
            </div>
            {error && <p className="text-sm text-eduverse-text-muted mt-3" role="alert">Error: {error}</p>}
          </GlassCard>
        </motion.div>
      )}

      {/* ── GRADED ── */}
      {phase === "graded" && grade && target && (
        <GlassCard>
          <TeachGradeCard grade={grade} topic={target.topic} onTeachAgain={reset} />
        </GlassCard>
      )}
    </div>
  );
}

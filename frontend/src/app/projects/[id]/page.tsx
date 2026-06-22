"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer, fastEaseTransition } from "@/lib/motion";
import {
  ChevronLeft, Save, Sparkles, CheckCircle2, Circle, Zap, Award,
  TrendingUp, AlertCircle, Globe, EyeOff, WifiOff, Rocket, RefreshCw,
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { EmptyState } from "@/components/ui/empty-state";
import { useAuthStore } from "@/stores/auth-store";
import { api } from "@/services/api-client";
import type { Project, ProjectMilestone } from "@/types/project";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });
const langLabel: Record<string, string> = { python: "Python", javascript: "JavaScript", html: "HTML", css: "CSS", cpp: "C++" };

export default function ProjectWorkspace() {
  const { id } = useParams();
  const { user, updateXp, updateCoins } = useAuthStore();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);
  const [code, setCode] = useState("");
  const [milestones, setMilestones] = useState<ProjectMilestone[]>([]);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .projectGet(id as string)
      .then((res) => {
        setProject(res.data);
        setCode(res.data.code || res.data.starterCode);
        setMilestones(res.data.milestones);
      })
      .catch(() => setOffline(true))
      .finally(() => setLoading(false));
  }, [id]);

  const save = async (nextMilestones?: ProjectMilestone[]) => {
    setSaving(true);
    setError("");
    try {
      const res = await api.projectUpdate(id as string, { code, milestones: nextMilestones || milestones });
      setProject(res.data);
      setSavedAt(true);
      setTimeout(() => setSavedAt(false), 1600);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setSaving(false);
    }
  };

  const toggleMilestone = (i: number) => {
    const next = milestones.map((m, idx) => (idx === i ? { ...m, done: !m.done } : m));
    setMilestones(next);
    save(next);
  };

  const submit = async () => {
    setSubmitting(true);
    setError("");
    try {
      // make sure the latest code is persisted before grading
      await api.projectUpdate(id as string, { code, milestones });
      const res = await api.projectSubmit(id as string);
      setProject(res.data.project);
      // reflect XP + coins earned in the sidebar
      api.getProfile().then((p) => { updateXp(p.data.xp, p.data.level); updateCoins(p.data.coins); }).catch(() => {});
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Review failed. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const togglePublish = async () => {
    if (!project) return;
    setPublishing(true);
    try {
      const res = await api.projectPublish(id as string, !project.published);
      setProject(res.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not update visibility.");
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 max-w-6xl mx-auto" aria-hidden="true">
        <div className="sk-card" style={{ height: "40px", width: "250px" }} />
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="sk-card" style={{ height: "380px" }} />
          <div className="sk-card" style={{ height: "380px" }} />
        </div>
      </div>
    );
  }
  if (offline || !project) {
    return (
      <EmptyState icon={offline ? WifiOff : Rocket} title={offline ? "Can't reach the server" : "Project not found"} message={offline ? "Start the backend and refresh." : "This project doesn't exist."}>
        <Link href="/projects" className="inline-flex items-center gap-1.5 px-5 py-2 rounded-[var(--radius-button)] text-sm font-semibold bg-eduverse-accent-strong text-white hover:brightness-110 transition-[filter]">Back to Studio</Link>
      </EmptyState>
    );
  }

  const done = project.status === "completed";

  return (
    <motion.div className="space-y-5 max-w-6xl mx-auto" initial="hidden" animate="visible" variants={staggerContainer}>
      <motion.div variants={fadeUp} transition={fastEaseTransition}>
        <div className="section-label">
          <span className="section-label-prefix">//</span> Project
        </div>
        <Link href="/projects" className="text-sm text-eduverse-text-muted hover:text-eduverse-accent inline-flex items-center gap-1 mb-3 transition-colors">
          <ChevronLeft className="w-4 h-4" aria-hidden="true" /> Project Studio
        </Link>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold font-display tracking-tight">{project.title}</h1>
            <div className="flex items-center gap-3 mt-1.5 text-sm text-eduverse-text-muted">
              <span className="font-mono text-xs">{langLabel[project.language] || project.language}</span>
              <span className="capitalize">{project.difficulty}</span>
              {done && <span className="flex items-center gap-1 text-eduverse-success"><CheckCircle2 className="w-4 h-4" aria-hidden="true" /> Completed · {project.score}/100</span>}
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Brief + milestones */}
        <motion.div variants={fadeUp} transition={{ ...fastEaseTransition, delay: 0.05 }} className="space-y-4">
          <GlassCard>
            <h2 className="flex items-center gap-2 text-sm font-mono text-eduverse-text-muted mb-2"><span className="text-eduverse-accent">//</span> Brief</h2>
            <p className="text-sm leading-relaxed text-eduverse-text-body">{project.brief}</p>
            {project.skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {project.skills.map((s) => (
                  <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-eduverse-raised text-eduverse-text-muted">{s}</span>
                ))}
              </div>
            )}
          </GlassCard>

          {milestones.length > 0 && (
            <GlassCard>
              <h2 className="flex items-center gap-2 text-sm font-mono text-eduverse-text-muted mb-3"><span className="text-eduverse-accent">//</span> Milestones</h2>
              <div className="space-y-1.5">
                {milestones.map((m, i) => (
                  <button key={i} onClick={() => toggleMilestone(i)} className="flex items-start gap-2 text-left w-full group">
                    {m.done ? <CheckCircle2 size={16} className="text-eduverse-success mt-0.5 shrink-0" aria-hidden="true" /> : <Circle size={16} className="text-eduverse-text-muted mt-0.5 shrink-0 group-hover:text-eduverse-accent transition-colors" aria-hidden="true" />}
                    <span className={`text-sm ${m.done ? "text-eduverse-text-muted line-through" : "text-eduverse-text-body"}`}>{m.text}</span>
                  </button>
                ))}
              </div>
            </GlassCard>
          )}
        </motion.div>

        {/* Editor */}
        <motion.div variants={fadeUp} transition={{ ...fastEaseTransition, delay: 0.1 }}>
          <GlassCard className="p-0 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-eduverse-border">
              <span className="text-xs font-mono text-eduverse-text-muted">{`main.${project.language === "cpp" ? "cpp" : project.language === "javascript" ? "js" : project.language === "python" ? "py" : project.language}`}</span>
              <button className="ai-panel-action-btn ai-panel-action-sm ai-panel-action-ghost" onClick={() => save()} disabled={saving}>
                <Save size={12} aria-hidden="true" /> {saving ? "Saving…" : savedAt ? "Saved ✓" : "Save"}
              </button>
            </div>
            <MonacoEditor
              height="420px"
              language={project.language}
              theme="vs-dark"
              value={code}
              onChange={(v) => setCode(v ?? "")}
              options={{ fontSize: 13, minimap: { enabled: false }, scrollBeyondLastLine: false, padding: { top: 12 }, fontFamily: "var(--font-mono), monospace" }}
            />
          </GlassCard>
        </motion.div>
      </div>

      {/* Submit / actions */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          className="px-4 py-2.5 rounded bg-eduverse-accent-strong text-white text-sm font-semibold hover:brightness-110 active:scale-[0.97] transition-[filter,transform] duration-150 disabled:opacity-50 flex items-center gap-2"
          onClick={submit}
          disabled={submitting}
        >
          {submitting ? <RefreshCw size={15} className="animate-spin" aria-hidden="true" /> : <Sparkles size={15} aria-hidden="true" />}
          {submitting ? "AI is reviewing…" : done ? "Resubmit for Review" : "Submit for Review"}
        </button>
        {done && (
          <>
            <button className="ai-panel-action-btn ai-panel-action-ghost" onClick={togglePublish} disabled={publishing}>
              {project.published ? <><EyeOff size={14} aria-hidden="true" /> Unpublish</> : <><Globe size={14} aria-hidden="true" /> Publish to portfolio</>}
            </button>
            {user && project.published && (
              <Link href={`/u/${user.username}`} className="text-sm text-eduverse-accent hover:underline">View on portfolio →</Link>
            )}
          </>
        )}
      </div>
      {error && <p className="text-sm text-eduverse-text-muted" role="alert">Error: {error}</p>}

      {/* Grade */}
      {done && project.score !== null && (
        <motion.div variants={fadeUp} transition={fastEaseTransition}>
          <GlassCard>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex flex-col items-center justify-center rounded-full w-20 h-20 shrink-0" style={{ border: "2px solid var(--color-eduverse-success)", background: "var(--color-eduverse-accent-soft)" }}>
                <span className="text-2xl font-bold font-mono text-eduverse-text leading-none">{project.score}</span>
                <span className="text-[9px] text-eduverse-text-muted mt-0.5">/ 100</span>
              </div>
              <div>
                <div className="flex items-center gap-2 text-lg font-bold text-eduverse-text font-display"><Award size={18} className="text-eduverse-success" aria-hidden="true" /> Project Reviewed</div>
                <span className="flex items-center gap-1 text-sm font-bold font-mono text-eduverse-warning mt-1"><Zap size={13} aria-hidden="true" /> +{project.xpAwarded} XP & coins</span>
              </div>
            </div>

            <p className="text-sm leading-relaxed text-eduverse-text-body mb-4">{project.feedback}</p>

            {project.rubric.length > 0 && (
              <div className="space-y-3 mb-4">
                {project.rubric.map((r, i) => {
                  const pct = Math.min(100, Math.round((r.score / Math.max(1, r.max)) * 100));
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-eduverse-text-body">{r.criterion}</span>
                        <span className="font-mono text-eduverse-text-muted">{r.score}/{r.max}</span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden bg-eduverse-raised">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "var(--color-eduverse-accent)" }} />
                      </div>
                      {r.note && <p className="text-[11px] text-eduverse-text-muted mt-1">{r.note}</p>}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-3">
              <div className="app-card p-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-eduverse-text mb-2"><TrendingUp size={13} className="text-eduverse-success" aria-hidden="true" /> Strengths</div>
                <ul className="space-y-1">{project.strengths.length ? project.strengths.map((s, i) => <li key={i} className="text-xs text-eduverse-text-body">• {s}</li>) : <li className="text-xs text-eduverse-text-muted">—</li>}</ul>
              </div>
              <div className="app-card p-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-eduverse-text mb-2"><AlertCircle size={13} className="text-eduverse-warning" aria-hidden="true" /> Improve next</div>
                <ul className="space-y-1">{project.improvements.length ? project.improvements.map((s, i) => <li key={i} className="text-xs text-eduverse-text-body">• {s}</li>) : <li className="text-xs text-eduverse-text-muted">—</li>}</ul>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {done && (
        <motion.div variants={fadeUp} transition={{ ...fastEaseTransition, delay: 0.05 }}>
          <GlassCard className="text-center py-6">
            <p className="text-sm font-semibold text-eduverse-text mb-1">What&apos;s next?</p>
            <p className="text-xs text-eduverse-text-muted mb-4 max-w-md mx-auto">
              {project.skills.length > 0
                ? `You just practiced ${project.skills.slice(0, 3).join(", ")}. See where it fits on your skill tree, or ship another project.`
                : "Keep building — track your progress on the skill tree, or start another project."}
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link href="/skill-tree" className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-[var(--radius-button)] text-sm font-semibold bg-eduverse-accent-strong text-white hover:brightness-110 transition-[filter]">
                Explore the Skill Tree
              </Link>
              <Link href="/projects" className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-[var(--radius-button)] text-sm font-medium border border-[var(--color-eduverse-border-mid)] text-eduverse-text hover:border-eduverse-accent transition-colors">
                Start another project
              </Link>
            </div>
          </GlassCard>
        </motion.div>
      )}
    </motion.div>
  );
}

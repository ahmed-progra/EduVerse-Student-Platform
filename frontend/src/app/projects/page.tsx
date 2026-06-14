"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Rocket, Sparkles, Plus, Wand2, CheckCircle2, Clock, Trophy, ArrowRight, WifiOff } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { EmptyState } from "@/components/ui/empty-state";
import { useAuthStore } from "@/stores/auth-store";
import { api } from "@/lib/api";
import type { Project } from "@/lib/project-types";

const ease = [0.22, 1, 0.36, 1] as const;
const LANGS = ["python", "javascript", "html", "css", "cpp"];
const langLabel: Record<string, string> = { python: "Python", javascript: "JavaScript", html: "HTML", css: "CSS", cpp: "C++" };

export default function ProjectsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);
  const [suggesting, setSuggesting] = useState(false);
  const [suggestLang, setSuggestLang] = useState("");
  const [error, setError] = useState("");

  // custom create
  const [showCustom, setShowCustom] = useState(false);
  const [cTitle, setCTitle] = useState("");
  const [cBrief, setCBrief] = useState("");
  const [cLang, setCLang] = useState("python");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    api
      .projectsList()
      .then((res) => setProjects(res.data))
      .catch(() => setOffline(true))
      .finally(() => setLoading(false));
  }, []);

  const getIdea = async () => {
    setSuggesting(true);
    setError("");
    try {
      const res = await api.projectSuggest(suggestLang ? { language: suggestLang } : {});
      router.push(`/projects/${res.data.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not generate a project idea.");
      setSuggesting(false);
    }
  };

  const createCustom = async () => {
    if (!cTitle.trim() || !cBrief.trim()) return;
    setCreating(true);
    setError("");
    try {
      const res = await api.projectCreate({ title: cTitle.trim(), brief: cBrief.trim(), language: cLang });
      router.push(`/projects/${res.data.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not create the project.");
      setCreating(false);
    }
  };

  const inProgress = projects.filter((p) => p.status !== "completed");
  const completed = projects.filter((p) => p.status === "completed");

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }}>
        <h1 className="text-3xl font-bold mb-1 font-display flex items-center gap-2">
          <Rocket className="w-7 h-7 text-eduverse-accent" aria-hidden="true" /> Project Studio
        </h1>
        <p className="text-eduverse-text-muted">
          Turn what you&apos;ve learned into real, AI-reviewed projects — and a portfolio that proves it.
          {user && (
            <>
              {" "}
              <Link href={`/u/${user.username}`} className="text-eduverse-accent hover:underline">
                View your public portfolio →
              </Link>
            </>
          )}
        </p>
      </motion.div>

      {/* Start a project */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05, duration: 0.5, ease }}>
        <GlassCard>
          <h2 className="flex items-center gap-2 text-sm font-mono text-eduverse-text-muted mb-4">
            <span className="text-eduverse-accent">//</span> Start a project
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {/* AI idea */}
            <div className="rounded border border-eduverse-border p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-eduverse-text mb-1">
                <Wand2 size={15} className="text-eduverse-accent" aria-hidden="true" /> Get an AI project idea
              </div>
              <p className="text-xs text-eduverse-text-muted mb-3">The mentor designs a project tailored to your level and weak spots.</p>
              <div className="flex gap-2">
                <select
                  value={suggestLang}
                  onChange={(e) => setSuggestLang(e.target.value)}
                  className="px-2.5 py-2 rounded border border-eduverse-border bg-eduverse-surface text-sm text-eduverse-text focus:border-eduverse-accent outline-none"
                  aria-label="Preferred language"
                >
                  <option value="">Any language</option>
                  {LANGS.map((l) => (
                    <option key={l} value={l}>{langLabel[l]}</option>
                  ))}
                </select>
                <button className="ai-panel-action-btn" onClick={getIdea} disabled={suggesting}>
                  <Sparkles size={14} aria-hidden="true" /> {suggesting ? "Designing…" : "Generate"}
                </button>
              </div>
            </div>

            {/* Custom */}
            <div className="rounded border border-eduverse-border p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-eduverse-text mb-1">
                <Plus size={15} className="text-eduverse-accent" aria-hidden="true" /> Start your own
              </div>
              <p className="text-xs text-eduverse-text-muted mb-3">Have an idea already? Define it and start building.</p>
              {!showCustom ? (
                <button className="ai-panel-action-btn ai-panel-action-ghost" onClick={() => setShowCustom(true)}>
                  <Plus size={14} aria-hidden="true" /> New blank project
                </button>
              ) : (
                <div className="space-y-2">
                  <input
                    className="w-full px-3 py-2 rounded border border-eduverse-border bg-transparent text-sm text-eduverse-text focus:border-eduverse-accent outline-none"
                    placeholder="Project title"
                    value={cTitle}
                    onChange={(e) => setCTitle(e.target.value)}
                  />
                  <textarea
                    className="w-full h-16 px-3 py-2 rounded border border-eduverse-border bg-transparent text-sm text-eduverse-text focus:border-eduverse-accent outline-none resize-y"
                    placeholder="What will you build? (the brief / requirements)"
                    value={cBrief}
                    onChange={(e) => setCBrief(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <select
                      value={cLang}
                      onChange={(e) => setCLang(e.target.value)}
                      className="px-2.5 py-2 rounded border border-eduverse-border bg-eduverse-surface text-sm text-eduverse-text focus:border-eduverse-accent outline-none"
                      aria-label="Language"
                    >
                      {LANGS.map((l) => (
                        <option key={l} value={l}>{langLabel[l]}</option>
                      ))}
                    </select>
                    <button className="ai-panel-action-btn" onClick={createCustom} disabled={creating || !cTitle.trim() || !cBrief.trim()}>
                      {creating ? "Creating…" : "Create & build"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          {error && <p className="text-sm text-eduverse-text-muted mt-3" role="alert">Error: {error}</p>}
        </GlassCard>
      </motion.div>

      {/* My projects */}
      {loading ? (
        <div className="grid sm:grid-cols-2 gap-4 animate-pulse" aria-hidden="true">
          {[1, 2].map((i) => <div key={i} className="h-32 rounded bg-eduverse-surface" />)}
        </div>
      ) : offline ? (
        <EmptyState icon={WifiOff} title="Can't reach the server" message="Start the backend, then refresh." />
      ) : projects.length === 0 ? (
        <EmptyState icon={Rocket} title="No projects yet" message="Generate an AI idea above and ship your first project — it'll appear on your portfolio." />
      ) : (
        <div className="space-y-6">
          {inProgress.length > 0 && (
            <ProjectSection title="In progress" icon={Clock} projects={inProgress} />
          )}
          {completed.length > 0 && (
            <ProjectSection title="Completed" icon={Trophy} projects={completed} />
          )}
        </div>
      )}
    </div>
  );
}

function ProjectSection({ title, icon: Icon, projects }: { title: string; icon: typeof Clock; projects: Project[] }) {
  return (
    <div>
      <h2 className="flex items-center gap-2 text-sm font-mono text-eduverse-text-muted mb-3">
        <Icon size={14} className="text-eduverse-accent" aria-hidden="true" /> {title}
        <span className="text-xs">{projects.length}</span>
      </h2>
      <div className="grid sm:grid-cols-2 gap-4">
        {projects.map((p) => (
          <Link key={p.id} href={`/projects/${p.id}`}>
            <GlassCard className="h-full hover:border-eduverse-accent transition-colors">
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="font-semibold text-eduverse-text">{p.title}</h3>
                {p.status === "completed" ? (
                  <span className="flex items-center gap-1 text-xs font-bold font-mono text-eduverse-success shrink-0">
                    <CheckCircle2 size={13} aria-hidden="true" /> {p.score}/100
                  </span>
                ) : (
                  <span className="text-[11px] font-mono text-eduverse-text-muted shrink-0">in progress</span>
                )}
              </div>
              <p className="text-xs text-eduverse-text-muted line-clamp-2 mb-3">{p.brief}</p>
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-eduverse-raised text-eduverse-text-muted font-mono">{langLabel[p.language] || p.language}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-eduverse-raised text-eduverse-text-muted">{p.difficulty}</span>
                </div>
                <ArrowRight size={15} className="text-eduverse-text-muted shrink-0" aria-hidden="true" />
              </div>
            </GlassCard>
          </Link>
        ))}
      </div>
    </div>
  );
}

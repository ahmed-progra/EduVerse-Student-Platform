"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer, fastEaseTransition } from "@/lib/motion";
import {
  Rocket,
  Sparkles,
  Plus,
  Wand2,
  CheckCircle2,
  Clock,
  Trophy,
  ArrowRight,
  WifiOff,
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { EmptyState } from "@/components/ui/empty-state";
import { useAuthStore } from "@/stores/auth-store";
import { api } from "@/services/api-client";
import type { Project } from "@/types/project";
const LANGS = ["python", "javascript", "html", "css", "cpp"];
const langLabel: Record<string, string> = {
  python: "Python",
  javascript: "JavaScript",
  html: "HTML",
  css: "CSS",
  cpp: "C++",
};

export default function ProjectsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);
  const [suggesting, setSuggesting] = useState(false);
  const [suggestLang, setSuggestLang] = useState("");
  const [error, setError] = useState("");

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
      const res = await api.projectCreate({
        title: cTitle.trim(),
        brief: cBrief.trim(),
        language: cLang,
      });
      router.push(`/projects/${res.data.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not create the project.");
      setCreating(false);
    }
  };

  const inProgress = projects.filter((p) => p.status !== "completed");
  const completed = projects.filter((p) => p.status === "completed");

  return (
    <motion.div
      className="space-y-8 max-w-6xl mx-auto"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      <motion.div variants={fadeUp} transition={fastEaseTransition}>
        <div className="section-label">
          <span className="section-label-prefix">//</span> Projects
        </div>
        <h1 className="text-3xl font-bold mb-2 font-display flex items-center gap-3 tracking-tight">
          <div className="w-9 h-9 rounded-[var(--radius-button)] bg-eduverse-accent-soft border border-eduverse-border flex items-center justify-center">
            <Rocket className="w-4 h-4 text-eduverse-accent" aria-hidden="true" />
          </div>
          Project Studio
        </h1>
        <p className="text-eduverse-text-muted mt-1">
          Turn what you&apos;ve learned into real, AI-reviewed projects — and a portfolio that
          proves it.
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
      <motion.div variants={fadeUp} transition={{ ...fastEaseTransition, delay: 0.05 }}>
        <GlassCard>
          <div className="section-label">
            <span className="section-label-prefix">//</span> Start a project
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {/* AI idea */}
            <div className="rounded-[var(--radius-card)] border border-eduverse-border bg-eduverse-editor p-5 transition-colors hover:border-eduverse-border-mid">
              <div className="flex items-center gap-2 text-sm font-semibold text-eduverse-text mb-1">
                <div className="w-7 h-7 rounded-lg bg-eduverse-accent-soft border border-eduverse-border flex items-center justify-center">
                  <Wand2 size={13} className="text-eduverse-accent" aria-hidden="true" />
                </div>
                Get an AI project idea
              </div>
              <p className="text-xs text-eduverse-text-muted mb-4 ml-9">
                The mentor designs a project tailored to your level and weak spots.
              </p>
              <div className="flex gap-2">
                <select
                  value={suggestLang}
                  onChange={(e) => setSuggestLang(e.target.value)}
                  className="app-input py-2 text-sm flex-1"
                  aria-label="Preferred language"
                >
                  <option value="">Any language</option>
                  {LANGS.map((l) => (
                    <option key={l} value={l}>
                      {langLabel[l]}
                    </option>
                  ))}
                </select>
                <button
                  className="ai-panel-action-btn shrink-0"
                  onClick={getIdea}
                  disabled={suggesting}
                >
                  <Sparkles size={14} aria-hidden="true" />
                  {suggesting ? "Designing…" : "Generate"}
                </button>
              </div>
            </div>

            {/* Custom */}
            <div className="rounded-[var(--radius-card)] border border-eduverse-border bg-eduverse-editor p-5 transition-colors hover:border-eduverse-border-mid">
              <div className="flex items-center gap-2 text-sm font-semibold text-eduverse-text mb-1">
                <div className="w-7 h-7 rounded-lg bg-eduverse-accent-soft border border-eduverse-border flex items-center justify-center">
                  <Plus size={13} className="text-eduverse-accent" aria-hidden="true" />
                </div>
                Start your own
              </div>
              <p className="text-xs text-eduverse-text-muted mb-4 ml-9">
                Have an idea already? Define it and start building.
              </p>
              {!showCustom ? (
                <button
                  className="ai-panel-action-btn ai-panel-action-ghost"
                  onClick={() => setShowCustom(true)}
                >
                  <Plus size={14} aria-hidden="true" /> New blank project
                </button>
              ) : (
                <div className="space-y-2">
                  <input
                    className="app-input text-sm"
                    placeholder="Project title"
                    value={cTitle}
                    onChange={(e) => setCTitle(e.target.value)}
                  />
                  <textarea
                    className="app-input h-16 text-sm resize-y"
                    placeholder="What will you build? (the brief / requirements)"
                    value={cBrief}
                    onChange={(e) => setCBrief(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <select
                      value={cLang}
                      onChange={(e) => setCLang(e.target.value)}
                      className="app-input py-2 text-sm flex-1"
                      aria-label="Language"
                    >
                      {LANGS.map((l) => (
                        <option key={l} value={l}>
                          {langLabel[l]}
                        </option>
                      ))}
                    </select>
                    <button
                      className="ai-panel-action-btn shrink-0"
                      onClick={createCustom}
                      disabled={creating || !cTitle.trim() || !cBrief.trim()}
                    >
                      {creating ? "Creating…" : "Create & build"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          {error && (
            <div className="form-error mt-3 text-sm" role="alert">
              {error}
            </div>
          )}
        </GlassCard>
      </motion.div>

      {/* My projects */}
      {loading ? (
        <div className="grid sm:grid-cols-2 gap-4" aria-hidden="true">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="sk-card" style={{ height: "140px" }} />
          ))}
        </div>
      ) : offline ? (
        <EmptyState
          icon={WifiOff}
          title="Can't reach the server"
          message="Start the backend, then refresh."
        />
      ) : projects.length === 0 ? (
        <EmptyState
          icon={Rocket}
          title="No projects yet"
          message="Generate an AI idea above and ship your first project — it'll appear on your portfolio."
        />
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
    </motion.div>
  );
}

function ProjectSection({
  title,
  icon: Icon,
  projects,
}: {
  title: string;
  icon: typeof Clock;
  projects: Project[];
}) {
  return (
    <div>
      <div className="section-label">
        <Icon size={13} className="text-eduverse-accent" aria-hidden="true" />
        <span className="section-label-prefix">//</span>
        {title}
        <span className="text-xs text-eduverse-text-muted ml-1 font-mono">({projects.length})</span>
      </div>
      <motion.div
        className="grid sm:grid-cols-2 gap-4"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        {projects.map((p) => (
          <motion.div key={p.id} variants={fadeUp} transition={fastEaseTransition}>
            <Link href={`/projects/${p.id}`} className="block h-full">
              <GlassCard className="h-full app-card-link">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className="font-semibold text-eduverse-text">{p.title}</h3>
                  {p.status === "completed" ? (
                    <span className="flex items-center gap-1 text-xs font-bold font-mono text-eduverse-success shrink-0">
                      <CheckCircle2 size={13} aria-hidden="true" /> {p.score}/100
                    </span>
                  ) : (
                    <span className="text-[11px] font-mono text-eduverse-text-muted shrink-0 px-2 py-0.5 rounded-full bg-eduverse-raised border border-eduverse-border">
                      in progress
                    </span>
                  )}
                </div>
                <p className="text-xs text-eduverse-text-muted line-clamp-2 mb-4 leading-relaxed">
                  {p.brief}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1.5">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-eduverse-raised text-eduverse-text-muted font-mono border border-eduverse-border">
                      {langLabel[p.language] || p.language}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-eduverse-raised text-eduverse-text-muted border border-eduverse-border">
                      {p.difficulty}
                    </span>
                  </div>
                  <ArrowRight
                    size={15}
                    className="text-eduverse-text-muted shrink-0"
                    aria-hidden="true"
                  />
                </div>
              </GlassCard>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

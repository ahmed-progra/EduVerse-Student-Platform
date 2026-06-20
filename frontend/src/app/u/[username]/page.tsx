"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer, fastEaseTransition } from "@/lib/motion";
import { Rocket, Trophy, Sparkles, Code2, Calendar, Gauge } from "lucide-react";
import { api } from "@/services/api-client";
import type { PortfolioData } from "@/types/project";
const langLabel: Record<string, string> = { python: "Python", javascript: "JavaScript", html: "HTML", css: "CSS", cpp: "C++" };

export default function PortfolioPage() {
  const { username } = useParams();
  const [data, setData] = useState<PortfolioData | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "notfound">("loading");

  useEffect(() => {
    api
      .portfolio(username as string)
      .then((res) => { setData(res.data); setState("ready"); })
      .catch(() => setState("notfound"));
  }, [username]);

  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <header className="flex items-center justify-between px-5 md:px-10 py-4 border-b" style={{ borderColor: "var(--color-eduverse-border)" }}>
        <Link href="/" className="text-xl font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--color-eduverse-text)" }}>
          EduVerse
        </Link>
        <Link href="/auth/register" className="nav-cta">Start learning</Link>
      </header>

      <main className="max-w-4xl mx-auto px-5 md:px-8 py-10">
        {state === "loading" && (
          <div className="space-y-6" aria-hidden="true">
            <div className="sk-card" style={{ height: "96px" }} />
            <div className="grid sm:grid-cols-2 gap-4">{[1, 2, 3, 4].map((i) => <div key={i} className="sk-card" style={{ height: "160px" }} />)}</div>
          </div>
        )}

        {state === "notfound" && (
          <div className="text-center py-24">
            <Rocket className="w-10 h-10 text-eduverse-text-muted mx-auto mb-4" aria-hidden="true" />
            <h1 className="text-2xl font-bold font-display mb-2">Portfolio not found</h1>
            <p className="text-eduverse-text-muted mb-6">No learner exists at this link yet.</p>
            <Link href="/auth/register" className="nav-cta">Create yours on EduVerse</Link>
          </div>
        )}

        {state === "ready" && data && (
          <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
            {/* Profile header */}
            <motion.div variants={fadeUp} transition={fastEaseTransition}>
              <div className="app-card p-6 flex items-center gap-5 flex-wrap">
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold font-mono shrink-0" style={{ background: "var(--color-eduverse-accent-soft)", color: "var(--color-eduverse-accent)" }}>
                  {data.user.username[0]?.toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h1 className="text-2xl font-bold font-display text-eduverse-text">{data.user.username}</h1>
                  <div className="flex items-center gap-3 mt-1 text-sm text-eduverse-text-muted flex-wrap">
                    <span className="flex items-center gap-1 capitalize"><Gauge size={14} className="text-eduverse-accent" aria-hidden="true" /> {data.user.placementLevel}</span>
                    <span className="flex items-center gap-1"><Sparkles size={14} className="text-eduverse-accent" aria-hidden="true" /> Level {data.user.level}</span>
                    <span className="flex items-center gap-1"><Trophy size={14} className="text-eduverse-accent" aria-hidden="true" /> {data.projects.length} {data.projects.length === 1 ? "project" : "projects"}</span>
                    <span className="flex items-center gap-1"><Calendar size={14} aria-hidden="true" /> Since {new Date(data.user.createdAt).toLocaleDateString(undefined, { month: "short", year: "numeric" })}</span>
                  </div>
                  {data.user.bio && <p className="text-sm text-eduverse-text-body mt-2">{data.user.bio}</p>}
                </div>
              </div>
            </motion.div>

            <div className="section-label mt-8 mb-4">
              <span className="section-label-prefix">//</span> projects built on EduVerse
            </div>

            {data.projects.length === 0 ? (
              <motion.div variants={fadeUp} transition={fastEaseTransition}>
                <div className="app-card p-10 text-center">
                  <Rocket className="w-8 h-8 text-eduverse-text-muted mx-auto mb-3" aria-hidden="true" />
                  <p className="text-eduverse-text-muted">No published projects yet — check back soon.</p>
                </div>
              </motion.div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {data.projects.map((p, i) => (
                  <motion.div key={p.id} variants={fadeUp} transition={{ ...fastEaseTransition, delay: 0.05 + i * 0.05 }}>
                    <div className="app-card p-5 h-full">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="font-semibold text-eduverse-text">{p.title}</h3>
                        {p.score !== null && (
                          <span className="flex items-center gap-1 text-xs font-bold font-mono text-eduverse-success shrink-0">
                            <Trophy size={12} aria-hidden="true" /> {p.score}/100
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-eduverse-text-muted mb-3 line-clamp-3">{p.brief}</p>
                      <div className="flex flex-wrap gap-1.5">
                        <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-eduverse-raised text-eduverse-text-muted font-mono">
                          <Code2 size={10} aria-hidden="true" /> {langLabel[p.language] || p.language}
                        </span>
                        {p.skills.slice(0, 3).map((s) => (
                          <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-eduverse-raised text-eduverse-text-muted">{s}</span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            <div className="text-center mt-12 pt-8 border-t" style={{ borderColor: "var(--color-eduverse-border)" }}>
              <p className="text-sm text-eduverse-text-muted mb-3">Built with <span className="text-eduverse-accent">EduVerse</span> — learn to code, then prove it.</p>
              <Link href="/auth/register" className="nav-cta">Start your own portfolio</Link>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}

"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer, fastEaseTransition } from "@/lib/motion";
import { Sparkles, RefreshCw, TrendingUp, Target, Compass, MessageSquare, WifiOff, Rocket, ArrowRight } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { EmptyState } from "@/components/ui/empty-state";
import { useAuthStore } from "@/stores/auth-store";
import { api } from "@/services/api-client";
import type { MentorProfileData, Mission, MentorReportData } from "@/types/mentor";
import { MetricTiles } from "@/features/mentor/metric-tiles";
import { GrowthChart } from "@/features/mentor/growth-chart";
import { TopicColumns } from "@/features/mentor/topic-columns";
import { MissionsBoard } from "@/features/mentor/missions-board";
import { WeeklyReport } from "@/features/mentor/weekly-report";
import { InsightsList } from "@/features/mentor/insights-list";
import { MentorChat } from "@/features/mentor/mentor-chat";

function Section({ title, icon: Icon, children, delay = 0 }: { title: string; icon: typeof Target; children: React.ReactNode; delay?: number }) {
  return (
    <motion.section variants={fadeUp} transition={{ ...fastEaseTransition, delay }}>
      <h2 className="flex items-center gap-2 text-sm font-mono text-eduverse-text-muted mb-3">
        <Icon size={14} className="text-eduverse-accent" aria-hidden="true" /> {title}
      </h2>
      {children}
    </motion.section>
  );
}

function SkeletonCard() {
  return <GlassCard><div className="sk-card" style={{ height: "80px" }} /></GlassCard>;
}

export default function MentorPage() {
  const { user } = useAuthStore();

  const [profile, setProfile] = useState<MentorProfileData | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState("");
  const [syncing, setSyncing] = useState(false);

  const [daily, setDaily] = useState<Mission[]>([]);
  const [weekly, setWeekly] = useState<Mission[]>([]);

  const [report, setReport] = useState<MentorReportData | null>(null);
  const [reportLoading, setReportLoading] = useState(true);
  const [reportError, setReportError] = useState("");

  const loadProfile = useCallback(async (refresh = false) => {
    refresh ? setSyncing(true) : setProfileLoading(true);
    setProfileError("");
    try {
      const res = refresh ? await api.mentorSync() : await api.mentorProfile();
      setProfile(res.data);
    } catch (err: unknown) {
      setProfileError(err instanceof Error ? err.message : "Could not load your mentor profile.");
    } finally {
      setProfileLoading(false);
      setSyncing(false);
    }
  }, []);

  const loadReport = useCallback(async (refresh = false) => {
    setReportLoading(true);
    setReportError("");
    try {
      const res = await api.mentorReport(refresh);
      setReport(res.data);
    } catch (err: unknown) {
      setReportError(err instanceof Error ? err.message : "Could not load your weekly report.");
    } finally {
      setReportLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
    loadReport();
    api
      .mentorMissions()
      .then((res) => {
        setDaily(res.data.daily || []);
        setWeekly(res.data.weekly || []);
      })
      .catch(() => {
        /* missions are non-critical; board shows empty */
      });
  }, [loadProfile, loadReport]);

  const onMissionsChange = (data: { daily?: Mission[]; weekly?: Mission[] }) => {
    if (data.daily) setDaily(data.daily);
    if (data.weekly) setWeekly(data.weekly);
  };

  const metrics = profile?.metrics;
  const lessonsCompleted = metrics?.totals?.lessonsCompleted ?? 0;

  // Build label → /apprentice deep-links so each gap becomes a "teach it to Pip" action.
  const titleToSlug = new Map((metrics?.perCourse || []).map((c) => [c.title, c.slug]));
  const weakLinks: Record<string, string> = {};
  for (const w of metrics?.weakTopics || []) {
    const slug = titleToSlug.get(w.course);
    if (slug) {
      const q = new URLSearchParams({ topic: w.label, topicKey: w.key, course: slug, courseLabel: w.course });
      weakLinks[w.label] = `/apprentice?${q.toString()}`;
    }
  }

  return (
    <motion.div className="space-y-8" initial="hidden" animate="visible" variants={staggerContainer}>
      {/* ── Header ── */}
      <motion.div variants={fadeUp} transition={fastEaseTransition}>
        <div className="section-label">
          <span className="section-label-prefix">//</span> Coach
        </div>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold mb-1 font-display flex items-center gap-2 tracking-tight">
              <Sparkles className="w-7 h-7 text-eduverse-accent" aria-hidden="true" /> AI Coach
            </h1>
            <p className="text-eduverse-text-muted">Your personal programming mentor — it learns you and adapts.</p>
          </div>
          <button className="ai-panel-action-btn" onClick={() => loadProfile(true)} disabled={syncing}>
            <RefreshCw size={14} className={syncing ? "animate-spin" : ""} aria-hidden="true" />
            {syncing ? "Syncing…" : "Sync Mentor"}
          </button>
        </div>
      </motion.div>

      {/* ── Mentor summary + motivation ── */}
      <motion.div variants={fadeUp} transition={{ ...fastEaseTransition, delay: 0.05 }}>
        <GlassCard>
          {profileLoading ? (
            <div className="space-y-2 animate-pulse" aria-label="Loading mentor profile">
              <div className="h-4 w-3/4 rounded bg-eduverse-raised" />
              <div className="h-4 w-2/3 rounded bg-eduverse-raised" />
            </div>
          ) : profileError ? (
            <EmptyState icon={WifiOff} title="Mentor unavailable" message={profileError}>
              <button className="ai-panel-action-btn" onClick={() => loadProfile()}>
                <RefreshCw size={14} aria-hidden="true" /> Retry
              </button>
            </EmptyState>
          ) : profile ? (
            <div>
              <p className="text-base leading-relaxed text-eduverse-text-body">{profile.summary}</p>
              {profile.motivation && (
                <p className="mt-3 text-sm text-eduverse-accent flex items-start gap-2">
                  <Sparkles size={15} className="mt-0.5 shrink-0" aria-hidden="true" /> {profile.motivation}
                </p>
              )}
              {profile.focus && (
                <p className="mt-2 text-sm text-eduverse-text-muted">
                  <span className="text-eduverse-text-body font-semibold">Focus: </span>
                  {profile.focus}
                </p>
              )}
            </div>
          ) : null}
        </GlassCard>
      </motion.div>

      {/* ── Skill assessment tiles ── */}
      <Section title="Current Skill Assessment" icon={Target} delay={0.1}>
        {profileLoading ? (
          <SkeletonCard />
        ) : profile ? (
          <MetricTiles
            level={user?.level ?? 1}
            xp={user?.xp ?? 0}
            learningSpeed={profile.learningSpeed}
            retention={profile.retention}
            momentum={profile.momentum}
            lessonsCompleted={lessonsCompleted}
          />
        ) : null}
      </Section>

      {/* ── Growth chart ── */}
      <Section title="Your Growth" icon={TrendingUp} delay={0.13}>
        <GlassCard>
          {profileLoading ? (
            <div className="space-y-3 animate-pulse" aria-label="Loading">
              <div className="h-4 w-1/2 rounded bg-eduverse-raised" />
              <div className="h-4 w-2/3 rounded bg-eduverse-raised" />
              <div className="h-4 w-3/4 rounded bg-eduverse-raised" />
            </div>
          ) : profile ? (
            <GrowthChart data={metrics?.growthSeries || []} />
          ) : null}
        </GlassCard>
      </Section>

      {/* ── Strong / weak topics ── */}
      <Section title="Strengths & Gaps" icon={Compass} delay={0.16}>
        {profileLoading ? (
          <SkeletonCard />
        ) : profile ? (
          <TopicColumns strengths={profile.strengths} weaknesses={profile.weaknesses} weakLinks={weakLinks} />
        ) : null}
      </Section>

      {/* ── Missions ── */}
      <Section title="Smart Missions" icon={Target} delay={0.19}>
        <MissionsBoard daily={daily} weekly={weekly} onChange={onMissionsChange} />
      </Section>

      {/* ── Weekly report ── */}
      <Section title="Weekly Learning Report" icon={TrendingUp} delay={0.22}>
        <GlassCard>
          <WeeklyReport report={report} loading={reportLoading} error={reportError} onRefresh={() => loadReport(true)} />
        </GlassCard>
      </Section>

      {/* ── Insights + recommendations ── */}
      <Section title="Insights & Next Steps" icon={Sparkles} delay={0.25}>
        {profileLoading ? (
          <SkeletonCard />
        ) : profile ? (
          <InsightsList insights={profile.insights} recommendations={profile.recommendations} />
        ) : null}
      </Section>

      {/* ── Project ideas → Studio ── */}
      {profile && (
        <Section title="Project Ideas" icon={Rocket} delay={0.27}>
          <GlassCard>
            {profile.projects.length > 0 ? (
              <>
                <p className="text-sm text-eduverse-text-muted mb-3">
                  Turn your learning into proof. Build one of these in the Project Studio — it gets AI-reviewed and added to your portfolio.
                </p>
                <div className="grid sm:grid-cols-2 gap-3 mb-4">
                  {profile.projects.map((p, i) => (
                    <div key={i} className="app-card p-3">
                      <div className="text-sm font-semibold text-eduverse-text">{p.title}</div>
                      <p className="text-xs text-eduverse-text-muted mt-1">{p.brief}</p>
                      {p.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {p.skills.map((s) => (
                            <span key={s} className="text-[10px] px-1.5 py-0.5 rounded bg-eduverse-raised text-eduverse-text-muted">{s}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <Link href="/projects" className="ai-panel-action-btn ai-panel-action-sm inline-flex">
                  <Rocket size={13} aria-hidden="true" /> Open Project Studio <ArrowRight size={13} aria-hidden="true" />
                </Link>
              </>
            ) : (
              <EmptyState icon={Rocket} title="No project ideas yet" message="Complete more lessons and assessments to unlock personalized project ideas." />
            )}
          </GlassCard>
        </Section>
      )}

      {/* ── Mentor chat ── */}
      <Section title="Talk to Your Mentor" icon={MessageSquare} delay={0.3}>
        <GlassCard>
          <MentorChat />
        </GlassCard>
      </Section>
    </motion.div>
  );
}

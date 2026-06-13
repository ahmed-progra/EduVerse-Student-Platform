"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Sparkles, RefreshCw, TrendingUp, Target, Compass, MessageSquare, WifiOff } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { EmptyState } from "@/components/ui/empty-state";
import { useAuthStore } from "@/stores/auth-store";
import { api } from "@/lib/api";
import type { MentorProfileData, Mission, MentorReportData } from "@/lib/mentor-types";
import { MetricTiles } from "@/components/mentor/metric-tiles";
import { GrowthChart } from "@/components/mentor/growth-chart";
import { TopicColumns } from "@/components/mentor/topic-columns";
import { MissionsBoard } from "@/components/mentor/missions-board";
import { WeeklyReport } from "@/components/mentor/weekly-report";
import { InsightsList } from "@/components/mentor/insights-list";
import { MentorChat } from "@/components/mentor/mentor-chat";

const ease = [0.22, 1, 0.36, 1] as const;

function Section({ title, icon: Icon, children, delay = 0 }: { title: string; icon: typeof Target; children: React.ReactNode; delay?: number }) {
  return (
    <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.5, ease }}>
      <h2 className="flex items-center gap-2 text-sm font-mono text-eduverse-text-muted mb-3">
        <Icon size={14} className="text-eduverse-accent" aria-hidden="true" /> {title}
      </h2>
      {children}
    </motion.section>
  );
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

  return (
    <div className="space-y-8">
      {/* ── Header ── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }}>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold mb-1 font-display flex items-center gap-2">
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
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05, duration: 0.5, ease }}>
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
      {profile && (
        <Section title="Current Skill Assessment" icon={Target} delay={0.1}>
          <MetricTiles
            level={user?.level ?? 1}
            xp={user?.xp ?? 0}
            learningSpeed={profile.learningSpeed}
            retention={profile.retention}
            momentum={profile.momentum}
            lessonsCompleted={lessonsCompleted}
          />
        </Section>
      )}

      {/* ── Growth chart ── */}
      {profile && (
        <Section title="Your Growth" icon={TrendingUp} delay={0.13}>
          <GlassCard>
            <GrowthChart data={metrics?.growthSeries || []} />
          </GlassCard>
        </Section>
      )}

      {/* ── Strong / weak topics ── */}
      {profile && (
        <Section title="Strengths & Gaps" icon={Compass} delay={0.16}>
          <TopicColumns strengths={profile.strengths} weaknesses={profile.weaknesses} />
        </Section>
      )}

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
      {profile && (
        <Section title="Insights & Next Steps" icon={Sparkles} delay={0.25}>
          <InsightsList insights={profile.insights} recommendations={profile.recommendations} />
        </Section>
      )}

      {/* ── Mentor chat ── */}
      <Section title="Talk to Your Mentor" icon={MessageSquare} delay={0.28}>
        <GlassCard>
          <MentorChat />
        </GlassCard>
      </Section>
    </div>
  );
}

"use client";

import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { XpBar } from "@/components/ui/xp-bar";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { EmptyState } from "@/components/ui/empty-state";
import { SkeletonActivity, SkeletonCardGrid } from "@/components/ui/skeleton";
import { AICoachCard } from "@/features/dashboard/ai-coach-card";
import { useAuthStore } from "@/stores/auth-store";
import { api } from "@/services/api-client";
import { updateStreak } from "@/lib/streak";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BookOpen, Swords, GitBranch, ShoppingBag,
  Zap, Code2, Flame, Trophy, Star, Clock, Target, Flag, WifiOff, Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface XpLogEntry {
  id: string;
  source: string;
  amount: number;
  createdAt: string;
}

interface ProfileData {
  xp: number;
  level: number;
  progress?: { completed: boolean }[];
  skills?: { unlocked: boolean }[];
}

interface BattleEntry {
  id: string;
  winnerId: string | null;
}

const sourceIcons: Record<string, LucideIcon> = {
  lesson: BookOpen,
  battle: Swords,
  challenge: Target,
  placement: Flag,
};

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({ lessonsDone: 0, battlesWon: 0, skillsUnlocked: 0, totalXp: 0 });
  const [recentActivity, setRecentActivity] = useState<XpLogEntry[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [offline, setOffline] = useState(false);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    setStreak(updateStreak());
    async function load() {
      try {
        const [profileRes, logsRes, battlesRes] = await Promise.all([
          api.getProfile(),
          api.getXpLogs(),
          api.getBattleHistory().catch(() => ({ data: [] as BattleEntry[] })),
        ]);
        const profile = profileRes.data as ProfileData;
        const battles = (battlesRes.data as BattleEntry[]) || [];
        const userId = useAuthStore.getState().user?.id;
        setStats({
          lessonsDone: profile.progress?.filter((p) => p.completed).length || 0,
          battlesWon: battles.filter((b) => b.winnerId && b.winnerId === userId).length,
          skillsUnlocked: profile.skills?.filter((s) => s.unlocked).length || 0,
          totalXp: profile.xp,
        });
        setRecentActivity(logsRes.data || []);
      } catch {
        setOffline(true);
      }
      setLoaded(true);
    }
    load();
  }, []);

  const quickActions = [
    { label: "Continue Learning", icon: BookOpen, href: "/courses", color: "text-eduverse-accent" },
    { label: "Enter Battle", icon: Swords, href: "/battle", color: "text-eduverse-danger" },
    { label: "Skill Tree", icon: GitBranch, href: "/skill-tree", color: "text-eduverse-success" },
    { label: "Visit Shop", icon: ShoppingBag, href: "/shop", color: "text-eduverse-warning" },
  ];

  const statCards = [
    { label: "Lessons Done", value: stats.lessonsDone, icon: Code2 },
    { label: "Battles Won", value: stats.battlesWon, icon: Trophy },
    { label: "Skills Unlocked", value: stats.skillsUnlocked, icon: Star },
    { label: "Total XP", value: stats.totalXp, icon: Zap },
  ];

  return (
    <div className="space-y-8">

      {/* ── Welcome Header ── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold mb-1 font-display">
              Welcome back, <span className="text-eduverse-accent">{user?.username}</span>
            </h1>
            <p className="text-eduverse-text-muted">Continue your quest to become a code master.</p>
          </div>
          {streak > 0 && (
            <div className="streak-badge">
              <Flame className="w-4 h-4" aria-hidden="true" />
              <span>{streak} day streak{streak >= 7 ? " · On fire!" : ""}</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* ── XP Bar ── */}
      {user && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
          <GlassCard>
            <XpBar xp={user.xp} size="lg" />
          </GlassCard>
        </motion.div>
      )}

      {/* ── Quick Actions ── */}
      <div>
        <div className="section-label">
          <span className="section-label-prefix">//</span> Quick Actions
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action, i) => (
            <motion.div
              key={action.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + 0.07 * i, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link href={action.href} className="block">
                <motion.div
                  whileTap={{ scale: 0.97 }}
                  className="app-card quick-action-card app-card-link"
                >
                  <div className="quick-action-icon">
                    <action.icon className={`w-5 h-5 ${action.color}`} aria-hidden="true" />
                  </div>
                  <span className="quick-action-label">{action.label}</span>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Stats Grid ── */}
      {!loaded ? (
        <SkeletonCardGrid count={4} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {statCards.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + 0.07 * i, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="app-card p-6">
                <div className="stat-card-icon">
                  <stat.icon className="w-4 h-4 text-eduverse-accent" aria-hidden="true" />
                </div>
                <div className="stat-number">
                  {loaded && !offline ? <AnimatedNumber value={stat.value} delay={i * 90} /> : "—"}
                </div>
                <div className="text-xs text-eduverse-text-muted mt-2">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── AI Coach ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
        <AICoachCard />
      </motion.div>

      {/* ── Recent Activity ── */}
      <GlassCard>
        <div className="section-label">
          <span className="section-label-prefix">//</span> Recent Activity
        </div>
        {!loaded ? (
          <div className="space-y-1" aria-hidden="true">
            {[1, 2, 3, 4].map((i) => (
              <SkeletonActivity key={i} />
            ))}
          </div>
        ) : offline ? (
          <EmptyState
            icon={WifiOff}
            title="Can't reach the server"
            message="The EduVerse API isn't responding. Start the backend, then refresh this page."
          />
        ) : recentActivity.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="No activity yet"
            message="Complete a lesson or win a battle to start your journey. Every action earns XP."
          >
            <Link href="/courses" className="px-4 py-3 rounded-[var(--radius-button)] text-sm font-semibold bg-eduverse-accent-strong text-white hover:brightness-110 transition-[filter]">
              Start a course
            </Link>
          </EmptyState>
        ) : (
          <div className="space-y-1">
            {recentActivity.slice(0, 10).map((log, i) => {
              const Icon = sourceIcons[log.source] || Zap;
              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="flex items-center justify-between py-3 px-3 rounded-[var(--radius-button)] border border-transparent hover:border-eduverse-border hover:bg-eduverse-accent-soft/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 flex items-center justify-center shrink-0">
                      <Icon className="w-3.5 h-3.5 text-eduverse-text-muted" aria-hidden="true" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-eduverse-text capitalize">{log.source}</div>
                      <div className="text-xs text-eduverse-text-muted flex items-center gap-1 mt-0.5">
                        <Clock className="w-2.5 h-2.5" aria-hidden="true" />
                        {new Date(log.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                      </div>
                    </div>
                  </div>
                  <span className="text-sm font-bold font-mono text-eduverse-success">
                    +{log.amount} XP
                  </span>
                </motion.div>
              );
            })}
          </div>
        )}
      </GlassCard>
    </div>
  );
}

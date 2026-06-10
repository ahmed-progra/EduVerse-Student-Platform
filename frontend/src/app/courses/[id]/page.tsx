"use client";

import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientButton } from "@/components/ui/gradient-button";
import { EmptyState } from "@/components/ui/empty-state";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle, Circle, ChevronRight, ChevronLeft, BookOpen, Zap, Sprout, Star, Trophy, WifiOff } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface CourseLesson {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  order: number;
  xpReward: number;
}

interface CourseData {
  id: string;
  title: string;
  description: string;
  icon: string;
  lessons: CourseLesson[];
}

interface PlacementData {
  score: number;
  total: number;
  level: string;
}

const tiers: Record<string, { icon: LucideIcon; color: string }> = {
  beginner: { icon: Sprout, color: "var(--color-eduverse-success)" },
  intermediate: { icon: Star, color: "var(--color-eduverse-warning)" },
  advanced: { icon: Trophy, color: "var(--color-eduverse-accent)" },
};

export default function CourseDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<CourseData | null>(null);
  const [placement, setPlacement] = useState<PlacementData | null>(null);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    Promise.all([
      api.getCourse(id as string),
      api.getPlacementResult(id as string).catch(() => ({ data: null })),
    ]).then(([courseRes, placementRes]) => {
      setCourse(courseRes.data);
      setPlacement(placementRes.data);
      setLoading(false);
    }).catch(() => {
      setOffline(true);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse" aria-hidden="true">
        <div className="h-8 w-64 rounded-lg bg-eduverse-surface" />
        <div className="h-20 rounded-2xl bg-eduverse-surface" />
        {[1, 2, 3, 4].map((i) => <div key={i} className="h-16 rounded-2xl bg-eduverse-surface" />)}
      </div>
    );
  }

  if (offline) {
    return (
      <EmptyState icon={WifiOff} title="Can't reach the server" message="The EduVerse API isn't responding. Start the backend, then refresh.">
        <Link href="/courses" className="px-4 py-2 rounded-lg text-sm font-semibold bg-eduverse-accent-strong text-white hover:brightness-110 transition-[filter]">
          Back to Courses
        </Link>
      </EmptyState>
    );
  }

  if (!course) {
    return (
      <EmptyState icon={BookOpen} title="Course not found" message="This course doesn't exist or has been removed.">
        <Link href="/courses" className="px-4 py-2 rounded-lg text-sm font-semibold bg-eduverse-accent-strong text-white hover:brightness-110 transition-[filter]">
          Back to Courses
        </Link>
      </EmptyState>
    );
  }

  const tier = placement ? tiers[placement.level] : null;
  const TierIcon = tier?.icon;
  const completedCount = course.lessons?.filter((l) => l.completed).length || 0;
  const totalCount = course.lessons?.length || 0;
  const pct = totalCount ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
        <Link href="/courses" className="text-sm text-eduverse-text-muted hover:text-eduverse-accent mb-4 inline-flex items-center gap-1 transition-colors">
          <ChevronLeft className="w-4 h-4" aria-hidden="true" /> Back to Courses
        </Link>
        <div className="flex items-center gap-4 mb-2">
          <span
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0"
            style={{ background: "var(--color-eduverse-accent-soft)", border: "1px solid var(--color-eduverse-border-mid)" }}
            aria-hidden="true"
          >
            {course.icon}
          </span>
          <div className="min-w-0">
            <h1 className="text-3xl font-bold">{course.title}</h1>
            <p className="text-eduverse-text-muted">{course.description}</p>
          </div>
        </div>
        {totalCount > 0 && (
          <div className="flex items-center gap-3 mt-4">
            <div className="h-2 rounded-full bg-eduverse-accent-soft overflow-hidden flex-1 max-w-sm">
              <motion.div
                className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg, oklch(58% 0.21 293), oklch(70% 0.16 295))" }}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
            <span className="text-xs text-eduverse-text-muted whitespace-nowrap">{completedCount}/{totalCount} completed</span>
          </div>
        )}
      </motion.div>

      {/* Placement banner */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
        <GlassCard hover={false}>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              {TierIcon ? (
                <TierIcon className="w-5 h-5 shrink-0" style={{ color: tier!.color }} aria-hidden="true" />
              ) : (
                <BookOpen className="w-5 h-5 text-eduverse-text-muted shrink-0" aria-hidden="true" />
              )}
              {placement ? (
                <div>
                  <span className="text-sm text-eduverse-text-muted">Your {course.title} level: </span>
                  <span className="font-bold capitalize" style={{ color: tier?.color }}>{placement.level}</span>
                  <span className="text-sm text-eduverse-text-muted ml-2">({placement.score}/{placement.total} correct)</span>
                </div>
              ) : (
                <span className="text-sm text-eduverse-text-muted">
                  Take the {course.title} assessment to find your starting level and earn bonus XP.
                </span>
              )}
            </div>
            <GradientButton
              onClick={() => router.push(`/placement-test?courseId=${id}`)}
              variant={placement ? "ghost" : "primary"}
              className="text-sm"
            >
              {placement ? "Retake" : "Take"} Assessment <Zap className="w-4 h-4" aria-hidden="true" />
            </GradientButton>
          </div>
        </GlassCard>
      </motion.div>

      {/* Lessons */}
      <div className="space-y-3">
        {course.lessons?.map((lesson, i) => (
          <motion.div
            key={lesson.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.04, 0.5), duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link href={`/lessons/${lesson.id}`} className="block group">
              <GlassCard className="flex items-center gap-4 !py-4">
                {lesson.completed ? (
                  <CheckCircle className="w-6 h-6 text-eduverse-success shrink-0" aria-label="Completed" />
                ) : (
                  <Circle className="w-6 h-6 text-eduverse-text-muted shrink-0" aria-hidden="true" />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate" style={{ fontFamily: "var(--font-sans)", color: "var(--color-eduverse-text)" }}>
                    <span className="text-eduverse-text-muted font-normal mr-1.5" style={{ fontFamily: "var(--font-mono)", fontSize: "0.8em" }}>
                      {String(lesson.order).padStart(2, "0")}
                    </span>
                    {lesson.title}
                  </h3>
                  <p className="text-xs text-eduverse-text-muted mt-0.5">+{lesson.xpReward} XP</p>
                </div>
                <ChevronRight className="w-5 h-5 text-eduverse-text-muted transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
              </GlassCard>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

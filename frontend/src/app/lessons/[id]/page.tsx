"use client";

import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientButton } from "@/components/ui/gradient-button";
import { EmptyState } from "@/components/ui/empty-state";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, ChevronLeft, Zap, BookOpen, WifiOff } from "lucide-react";
import dynamic from "next/dynamic";
import { ErrorBoundary } from "@/components/ui/error-boundary";

const Visualizer = dynamic(() => import("@/components/visualizer/visualizer").then(m => ({ default: m.Visualizer })), { ssr: false });

interface LessonData {
  id: string;
  title: string;
  description: string;
  codeTemplate: string;
  language: string;
  content: string;
  courseId: string;
  xpReward: number;
  completed?: boolean;
}

export default function LessonPage() {
  const { id } = useParams();
  const { user, updateXp } = useAuthStore();
  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [completed, setCompleted] = useState(false);
  const [xpGained, setXpGained] = useState(0);
  const [showXpGain, setShowXpGain] = useState(false);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);
  const [initialCode, setInitialCode] = useState("");

  useEffect(() => {
    api.getLesson(id as string).then((res) => {
      setLesson(res.data);
      setInitialCode(res.data.codeTemplate);
      setCompleted(res.data.completed);
      setLoading(false);
    }).catch(() => {
      setOffline(true);
      setLoading(false);
    });
  }, [id]);

  const handleComplete = async () => {
    try {
      const res = await api.completeLesson(id as string);
      if (res.data.xpGained > 0) {
        setXpGained(res.data.xpGained);
        setShowXpGain(true);
        setCompleted(true);
        if (user) {
          updateXp(res.data.xp, res.data.level);
        }
        setTimeout(() => setShowXpGain(false), 3200);
      }
    } catch {}
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto animate-pulse" aria-hidden="true">
        <div className="h-8 w-72 rounded-lg bg-eduverse-surface" />
        <div className="h-64 rounded-2xl bg-eduverse-surface" />
        <div className="h-[420px] rounded-2xl bg-eduverse-surface" />
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

  if (!lesson) {
    return (
      <EmptyState icon={BookOpen} title="Lesson not found" message="This lesson doesn't exist or has been removed.">
        <Link href="/courses" className="px-4 py-2 rounded-lg text-sm font-semibold bg-eduverse-accent-strong text-white hover:brightness-110 transition-[filter]">
          Back to Courses
        </Link>
      </EmptyState>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* XP gain toast */}
      <AnimatePresence>
        {showXpGain && (
          <motion.div
            initial={{ opacity: 0, y: -14, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="xp-toast"
            role="status"
          >
            <Zap className="w-6 h-6 text-eduverse-warning" aria-hidden="true" />
            <div>
              <div className="font-bold text-eduverse-warning">+{xpGained} XP</div>
              <div className="text-xs text-eduverse-text-muted">Lesson completed!</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
        <Link href={`/courses/${lesson.courseId}`} className="text-sm text-eduverse-text-muted hover:text-eduverse-accent inline-flex items-center gap-1 mb-4 transition-colors">
          <ChevronLeft className="w-4 h-4" aria-hidden="true" /> Back to Course
        </Link>
        <h1 className="text-2xl font-bold">{lesson.title}</h1>
        <div className="flex items-center gap-4 mt-2 text-sm text-eduverse-text-muted">
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem" }}>{lesson.language.toUpperCase()}</span>
          <span>+{lesson.xpReward} XP</span>
          {completed && <span className="text-eduverse-success flex items-center gap-1"><CheckCircle className="w-4 h-4" aria-hidden="true" />Completed</span>}
        </div>
      </motion.div>

      {/* Content */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.07, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
        <GlassCard hover={false}>
          <div className="lesson-content" dangerouslySetInnerHTML={{ __html: lesson.content }} />
        </GlassCard>
      </motion.div>

      {/* Visualizer */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
        <GlassCard hover={false} className="p-4">
          <ErrorBoundary>
            <Visualizer initialCode={initialCode} language={lesson.language} />
          </ErrorBoundary>
        </GlassCard>
      </motion.div>

      {/* Complete button */}
      {!completed && (
        <div className="flex justify-center">
          <GradientButton onClick={handleComplete}>
            <CheckCircle className="w-4 h-4" aria-hidden="true" /> Mark Complete (+{lesson.xpReward} XP)
          </GradientButton>
        </div>
      )}
    </div>
  );
}

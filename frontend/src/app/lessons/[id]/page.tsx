"use client";

import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientButton } from "@/components/ui/gradient-button";
import { EmptyState } from "@/components/ui/empty-state";
import { api } from "@/services/api-client";
import { useAuthStore } from "@/stores/auth-store";
import { fadeUp, staggerContainer, fastEaseTransition } from "@/lib/motion";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, ChevronLeft, Zap, BookOpen, WifiOff } from "lucide-react";
import dynamic from "next/dynamic";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { LessonAITools } from "@/features/lessons/lesson-ai-tools";
import { LessonMentor } from "@/features/lessons/lesson-mentor";
import { QuizCheckpoint } from "@/features/lessons/quiz-checkpoint";

const Visualizer = dynamic(() => import("@/features/visualizer/visualizer").then(m => ({ default: m.Visualizer })), { ssr: false });

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
  quiz?: { q: string; options: string[] }[];
  difficulty?: string;
  estMinutes?: number;
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
      api.clearCache();
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
      <div className="space-y-6 max-w-6xl mx-auto" aria-hidden="true">
        <div className="sk-card" style={{ height: "80px" }} />
        <div className="sk-card" style={{ height: "200px" }} />
        <div className="sk-card" style={{ height: "420px" }} />
      </div>
    );
  }

  if (offline) {
    return (
      <EmptyState icon={WifiOff} title="Can't reach the server" message="The EduVerse API isn't responding. Start the backend, then refresh.">
        <Link href="/courses" className="inline-flex items-center gap-1.5 px-5 py-2 rounded-[var(--radius-button)] text-sm font-semibold bg-eduverse-accent-strong text-white hover:brightness-110 transition-[filter]">Back to Courses</Link>
      </EmptyState>
    );
  }

  if (!lesson) {
    return (
      <EmptyState icon={BookOpen} title="Lesson not found" message="This lesson doesn't exist or has been removed.">
        <Link href="/courses" className="inline-flex items-center gap-1.5 px-5 py-2 rounded-[var(--radius-button)] text-sm font-semibold bg-eduverse-accent-strong text-white hover:brightness-110 transition-[filter]">Back to Courses</Link>
      </EmptyState>
    );
  }

  return (
    <motion.div className="space-y-6 max-w-6xl mx-auto" initial="hidden" animate="visible" variants={staggerContainer}>
      {/* XP gain toast */}
      <AnimatePresence>
        {showXpGain && (
          <motion.div
            initial={{ opacity: 0, y: -14, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, transition: { duration: 0.18, ease: "easeOut" } }}
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
      <motion.div variants={fadeUp} transition={fastEaseTransition}>
        <div className="section-label">
          <span className="section-label-prefix">//</span> Lesson
        </div>
        <Link href={`/courses/${lesson.courseId}`} className="text-sm text-eduverse-text-muted hover:text-eduverse-accent inline-flex items-center gap-1 mb-4 transition-colors">
          <ChevronLeft className="w-4 h-4" aria-hidden="true" /> Back to Course
        </Link>
        <h1 className="text-2xl font-bold font-display tracking-tight">{lesson.title}</h1>
        <div className="flex items-center gap-4 mt-2 text-sm text-eduverse-text-muted">
          <span className="font-mono text-xs">{lesson.language.toUpperCase()}</span>
          <span>+{lesson.xpReward} XP</span>
          {completed && <span className="text-eduverse-success flex items-center gap-1"><CheckCircle className="w-4 h-4" aria-hidden="true" />Completed</span>}
        </div>
      </motion.div>

      {/* Content */}
      <motion.div variants={fadeUp} transition={{ ...fastEaseTransition, delay: 0.07 }}>
        <GlassCard>
          <div className="lesson-content" dangerouslySetInnerHTML={{ __html: lesson.content }} />
        </GlassCard>
      </motion.div>

      {/* Visualizer */}
      <motion.div variants={fadeUp} transition={{ ...fastEaseTransition, delay: 0.14 }}>
        <GlassCard className="p-4">
          <ErrorBoundary>
            <Visualizer initialCode={initialCode} language={lesson.language} />
          </ErrorBoundary>
        </GlassCard>
      </motion.div>

      {/* Quiz checkpoint */}
      {lesson.quiz && lesson.quiz.length > 0 && (
        <motion.div variants={fadeUp} transition={{ ...fastEaseTransition, delay: 0.18 }}>
          <ErrorBoundary>
            <QuizCheckpoint lessonId={lesson.id} quiz={lesson.quiz} />
          </ErrorBoundary>
        </motion.div>
      )}

      {/* Context-aware AI mentor */}
      <motion.div variants={fadeUp} transition={{ ...fastEaseTransition, delay: 0.22 }}>
        <ErrorBoundary>
          <LessonMentor title={lesson.title} content={lesson.content} language={lesson.language} />
        </ErrorBoundary>
      </motion.div>

      {/* AI study tools */}
      <motion.div variants={fadeUp} transition={{ ...fastEaseTransition, delay: 0.26 }}>
        <ErrorBoundary>
          <LessonAITools title={lesson.title} content={lesson.content} language={lesson.language} />
        </ErrorBoundary>
      </motion.div>

      {/* Complete button */}
      {!completed && (
        <motion.div variants={fadeUp} transition={{ ...fastEaseTransition, delay: 0.3 }} className="flex justify-center">
          <GradientButton onClick={handleComplete}>
            <CheckCircle className="w-4 h-4" aria-hidden="true" /> Mark Complete (+{lesson.xpReward} XP)
          </GradientButton>
        </motion.div>
      )}
    </motion.div>
  );
}

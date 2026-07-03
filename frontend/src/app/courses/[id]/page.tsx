"use client";

import { motion, AnimatePresence } from "framer-motion";
import { EmptyState } from "@/components/ui/empty-state";
import { api } from "@/services/api-client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft, BookOpen, WifiOff, Zap } from "lucide-react";
import { AssessmentRunner } from "@/features/learning/assessment-runner";
import { RoadmapView, LearningStateData } from "@/features/learning/roadmap-view";

interface CourseData {
  id: string;
  title: string;
  description: string;
  icon: string;
  lessons: { id: string }[];
}

export default function CourseDetailPage() {
  const { id } = useParams();
  const courseId = id as string;
  const [course, setCourse] = useState<CourseData | null>(null);
  const [state, setState] = useState<LearningStateData | null>(null);
  const [questionCount, setQuestionCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);
  const [retaking, setRetaking] = useState(false);
  const [justCompleted, setJustCompleted] = useState<{ xp?: { xpGained?: number } } | null>(null);

  const load = useCallback(async () => {
    try {
      const [courseRes, stateRes] = await Promise.all([
        api.getCourse(courseId),
        api.learningState(courseId),
      ]);
      setCourse(courseRes.data);
      setState(stateRes.data);
      setQuestionCount(stateRes.data.questionCount || 0);
      setLoading(false);
    } catch {
      setOffline(true);
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleAssessmentComplete = async (result: unknown) => {
    setJustCompleted(result as { xp?: { xpGained?: number } });
    setRetaking(false);
    // Re-fetch the canonical state (profile + roadmap persisted server-side).
    try {
      const stateRes = await api.learningState(courseId);
      setState(stateRes.data);
    } catch {
      /* keep current view */
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="space-y-4 max-w-6xl mx-auto" aria-hidden="true">
        <div className="sk-card" style={{ height: "32px", width: "256px" }} />
        <div className="sk-card" style={{ height: "80px" }} />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="sk-card" style={{ height: "64px" }} />
        ))}
      </div>
    );
  }

  if (offline) {
    return (
      <EmptyState
        icon={WifiOff}
        title="Can't reach the server"
        message="The EduVerse API isn't responding. Start the backend, then refresh."
      >
        <Link
          href="/courses"
          className="px-4 py-2 rounded-[var(--radius-button)] text-sm font-semibold bg-eduverse-accent-strong text-white hover:brightness-110 transition-[filter]"
        >
          Back to Courses
        </Link>
      </EmptyState>
    );
  }

  if (!course || !state) {
    return (
      <EmptyState
        icon={BookOpen}
        title="Course not found"
        message="This course doesn't exist or has been removed."
      >
        <Link
          href="/courses"
          className="px-4 py-2 rounded-[var(--radius-button)] text-sm font-semibold bg-eduverse-accent-strong text-white hover:brightness-110 transition-[filter]"
        >
          Back to Courses
        </Link>
      </EmptyState>
    );
  }

  const showRunner = !state.assessed || retaking;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <Link
          href="/courses"
          className="text-sm text-eduverse-text-muted hover:text-eduverse-accent mb-4 inline-flex items-center gap-1 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" aria-hidden="true" /> Back to Courses
        </Link>
        <div className="flex items-center gap-4 mb-2">
          <span className="text-3xl leading-none shrink-0" aria-hidden="true">
            {course.icon}
          </span>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold font-display tracking-tight">{course.title}</h1>
            <p className="text-eduverse-text-muted">{course.description}</p>
          </div>
        </div>
      </motion.div>

      {/* One-time celebration after submitting an assessment */}
      <AnimatePresence>
        {justCompleted && !showRunner && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8, transition: { duration: 0.18, ease: "easeOut" } }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <div
              className="px-4 py-3 text-sm flex items-center gap-2.5 flex-wrap rounded-[var(--radius-card)] bg-eduverse-success/8 border border-eduverse-success/22"
              role="status"
            >
              <Zap
                size={15}
                style={{ color: "var(--color-eduverse-success)" }}
                aria-hidden="true"
              />
              <span className="text-eduverse-text">
                Assessment complete — your personalized path is ready
                {justCompleted?.xp?.xpGained ? ` (+${justCompleted.xp.xpGained} XP)` : ""}.
              </span>
              <button
                className="ml-auto text-xs underline opacity-70 hover:opacity-100 transition-opacity"
                onClick={() => setJustCompleted(null)}
              >
                dismiss
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        {showRunner ? (
          <div className="space-y-3">
            {retaking && (
              <button
                className="text-xs text-eduverse-text-muted hover:text-eduverse-accent transition-colors"
                onClick={() => setRetaking(false)}
              >
                ← Back to my current path
              </button>
            )}
            <AssessmentRunner
              courseId={courseId}
              courseTitle={course.title}
              questionCount={questionCount}
              topics={state.topics || []}
              onComplete={handleAssessmentComplete}
            />
          </div>
        ) : (
          <RoadmapView
            courseId={courseId}
            state={state}
            onStateChange={setState}
            onRetake={() => setRetaking(true)}
          />
        )}
      </motion.div>
    </div>
  );
}

"use client";

import { Suspense, useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientButton } from "@/components/ui/gradient-button";
import { EmptyState } from "@/components/ui/empty-state";
import { AssessmentRunner } from "@/features/learning/assessment-runner";
import { api } from "@/services/api-client";
import { fadeUp, fastEaseTransition } from "@/lib/motion";
import {
  ChevronLeft,
  ChevronRight,
  Zap,
  Trophy,
  Star,
  Sprout,
  BookOpen,
  WifiOff,
  GraduationCap,
} from "lucide-react";

interface CourseLite {
  id: string;
  title: string;
  description: string;
  icon: string;
}

interface AssessmentResult {
  score: number;
  total: number;
  level: string;
  xp?: { xpGained?: number };
}

/**
 * Standalone placement-test entry point. Picks up `?courseId=` and runs the
 * canonical {@link AssessmentRunner} (the same flow embedded in the course page),
 * so question handling, answer normalization, and submission errors all behave
 * identically. Without a course id it shows a picker rather than dead-ending.
 */
function PlacementTestContent() {
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId");

  const [courses, setCourses] = useState<CourseLite[]>([]);
  const [course, setCourse] = useState<CourseLite | null>(null);
  const [questionCount, setQuestionCount] = useState(0);
  const [topics, setTopics] = useState<string[]>([]);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    setResult(null);
    (async () => {
      try {
        // No course chosen yet — load the catalog so the learner can pick one.
        if (!courseId) {
          const res = await api.getCourses();
          if (cancelled) return;
          setCourses(res.data as CourseLite[]);
          setLoading(false);
          return;
        }
        // A course is selected — gather the title + the runner's inputs.
        const [coursesRes, stateRes] = await Promise.all([
          api.getCourses(),
          api.learningState(courseId),
        ]);
        if (cancelled) return;
        const found = (coursesRes.data as CourseLite[]).find((c) => c.id === courseId) || null;
        setCourse(found);
        setQuestionCount(stateRes.data.questionCount || 0);
        setTopics(Array.isArray(stateRes.data.topics) ? stateRes.data.topics : []);
        setLoading(false);
      } catch {
        if (!cancelled) {
          setError("We couldn't load the placement test. Check your connection and try again.");
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [courseId]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="sk-card" style={{ width: "400px", height: "260px" }} aria-hidden="true" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <EmptyState icon={WifiOff} title="Something went wrong" message={error}>
          <Link
            href="/courses"
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-eduverse-accent-strong text-white hover:brightness-110 transition-[filter]"
          >
            Back to Courses
          </Link>
        </EmptyState>
      </div>
    );
  }

  // Course picker — no course selected.
  if (!courseId) {
    return (
      <motion.div
        className="max-w-3xl mx-auto py-8"
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        transition={fastEaseTransition}
      >
        <div className="section-label">
          <span className="section-label-prefix">//</span> Placement Test
        </div>
        <h1 className="text-3xl font-bold mb-2 font-display tracking-tight">
          Find your starting point
        </h1>
        <p className="text-eduverse-text-muted mb-6">
          Pick a course and take a short placement test — we&apos;ll map what you already know and
          tailor your path.
        </p>
        {courses.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No courses yet"
            message="The course catalog is empty. Seed the database to add courses."
          />
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {courses.map((c) => (
              <Link
                key={c.id}
                href={`/placement-test?courseId=${c.id}`}
                className="block h-full group app-card-link"
              >
                <GlassCard className="h-full">
                  <div className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-xl"
                      style={{ background: "var(--color-eduverse-accent-soft)" }}
                      aria-hidden="true"
                    >
                      {c.icon || <GraduationCap className="w-5 h-5 text-eduverse-accent" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg font-bold mb-1 tracking-tight">{c.title}</h2>
                      <p className="text-sm text-eduverse-text-muted line-clamp-2">
                        {c.description}
                      </p>
                    </div>
                    <ChevronRight
                      className="w-4 h-4 text-eduverse-accent transition-transform duration-200 group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </div>
                </GlassCard>
              </Link>
            ))}
          </div>
        )}
      </motion.div>
    );
  }

  // Result screen — shown after the assessment is submitted.
  if (result) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={fastEaseTransition}
        >
          <GlassCard className="text-center p-12 max-w-md">
            <div
              className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center"
              style={{
                background: "var(--color-eduverse-accent-soft)",
                border: "1px solid var(--color-eduverse-border-mid)",
                color:
                  result.level === "advanced"
                    ? "var(--color-eduverse-accent)"
                    : result.level === "intermediate"
                      ? "var(--color-eduverse-warning)"
                      : "var(--color-eduverse-success)",
              }}
            >
              {result.level === "advanced" ? (
                <Trophy size={36} aria-hidden="true" />
              ) : result.level === "intermediate" ? (
                <Star size={36} aria-hidden="true" />
              ) : (
                <Sprout size={36} aria-hidden="true" />
              )}
            </div>
            <h2 className="text-3xl font-bold mb-4 font-display">
              You are <span className="capitalize text-eduverse-accent">{result.level}</span>!
            </h2>
            <div className="text-5xl font-bold mb-2 font-mono">
              {result.score}/{result.total}
            </div>
            <p className="text-eduverse-text-muted mb-2">questions correct</p>
            {result.xp?.xpGained && result.xp.xpGained > 0 ? (
              <div className="flex items-center justify-center gap-2 text-eduverse-warning font-bold mb-6">
                <Zap className="w-5 h-5" aria-hidden="true" /> XP Bonus: {result.xp.xpGained}
              </div>
            ) : (
              <div className="mb-6" />
            )}
            <GradientButton
              onClick={() => window.location.assign(`/courses/${courseId}`)}
              className="w-full"
            >
              Go to your path
            </GradientButton>
          </GlassCard>
        </motion.div>
      </div>
    );
  }

  // Running the assessment via the canonical runner.
  return (
    <div className="max-w-3xl mx-auto py-8">
      <Link
        href="/placement-test"
        className="text-sm text-eduverse-text-muted hover:text-eduverse-accent mb-4 inline-flex items-center gap-1 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" aria-hidden="true" /> Choose a different course
      </Link>
      <AssessmentRunner
        courseId={courseId}
        courseTitle={course?.title || "this course"}
        questionCount={questionCount}
        topics={topics}
        onComplete={(r) => {
          setResult(r as AssessmentResult);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />
    </div>
  );
}

export default function PlacementTestPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center p-4">
          <div className="sk-card" style={{ width: "400px", height: "200px" }} aria-hidden="true" />
        </div>
      }
    >
      <PlacementTestContent />
    </Suspense>
  );
}

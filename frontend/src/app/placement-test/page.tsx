"use client";

import { Suspense } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientButton } from "@/components/ui/gradient-button";
import { api } from "@/services/api-client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Zap, Trophy, Star, Sprout } from "lucide-react";

interface QuestionData {
  id: string;
  question: string;
  options: string[];
  correctIndex?: number;
}

interface AssessmentResult {
  score: number;
  total: number;
  level: string;
  xp?: { xp: number; level: number; coins: number; leveledUp: boolean; xpGained: number };
}

function PlacementTestContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId");
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!courseId) {
      setLoading(false);
      setError("No course selected. Please choose a course from the courses page.");
      return;
    }
    api.assessmentStart(courseId).then((res) => {
      setAssessmentId(res.data.assessmentId);
      setQuestions(res.data.questions);
      setAnswers({});
      setLoading(false);
    }).catch(() => {
      setLoading(false);
      setError("Failed to load questions for this course.");
    });
  }, [courseId]);

  const handleAnswer = (index: number) => {
    setAnswers((prev) => ({ ...prev, [questions[currentQ].id]: index }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await api.assessmentSubmit(courseId!, { assessmentId: assessmentId!, answers });
      setResult(res.data);
    } catch {}
    setSubmitting(false);
  };

  if (!courseId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--color-eduverse-bg)" }}>
        <GlassCard className="p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4 font-display">No Course Selected</h2>
          <p className="text-eduverse-text-muted mb-6">{error}</p>
          <GradientButton onClick={() => router.push("/courses")} className="w-full">
            Browse Courses
          </GradientButton>
        </GlassCard>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--color-eduverse-bg)" }}>
        <div className="w-8 h-8 border-2 border-eduverse-accent border-t-transparent rounded animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--color-eduverse-bg)" }}>
        <GlassCard className="p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4 font-display">Something went wrong</h2>
          <p className="text-eduverse-text-muted mb-6">{error}</p>
          <GradientButton onClick={() => router.push("/courses")} className="w-full">
            Back to Courses
          </GradientButton>
        </GlassCard>
      </div>
    );
  }

  if (result) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--color-eduverse-bg)" }}>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <GlassCard className="text-center p-12 max-w-md" >
            <div
              className="w-20 h-20 rounded mx-auto mb-6 flex items-center justify-center"
              style={{
                background: "var(--color-eduverse-accent-soft)",
                border: "1px solid var(--color-eduverse-border-mid)",
                color: result.level === "advanced" ? "var(--color-eduverse-accent)" : result.level === "intermediate" ? "var(--color-eduverse-warning)" : "var(--color-eduverse-success)",
              }}
            >
              {result.level === "advanced" ? <Trophy size={36} aria-hidden="true" /> : result.level === "intermediate" ? <Star size={36} aria-hidden="true" /> : <Sprout size={36} aria-hidden="true" />}
            </div>
            <h2 className="text-3xl font-bold mb-4 font-display">
              You are <span className="capitalize text-eduverse-accent">{result.level}</span>!
            </h2>
            <div className="text-5xl font-bold mb-2 font-mono">{result.score}/{result.total}</div>
            <p className="text-eduverse-text-muted mb-2">questions correct</p>
            {result.xp?.xpGained && result.xp.xpGained > 0 && (
              <div className="flex items-center justify-center gap-2 text-eduverse-warning font-bold mb-6">
                <Zap className="w-5 h-5" /> XP Bonus: {result.xp.xpGained}
              </div>
            )}
            <GradientButton onClick={() => router.push(`/courses/${courseId}`)} className="w-full">
              Back to Course
            </GradientButton>
          </GlassCard>
        </motion.div>
      </div>
    );
  }

  const q = questions[currentQ];
  const allAnswered = questions.every((q) => answers[q.id] !== undefined);
  const progress = ((currentQ + 1) / questions.length) * 100;

  if (!q) return null;

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--color-eduverse-bg)" }}>
      <motion.div
        key={currentQ}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="w-full max-w-2xl"
      >
        <GlassCard className="p-8">
          <div className="mb-6">
            <div className="flex justify-between text-sm text-eduverse-text-muted mb-2">
              <span>Question {currentQ + 1} of {questions.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 rounded bg-white/10 overflow-hidden">
              <motion.div
                className="h-full rounded bg-eduverse-accent-strong"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          <h2 className="text-xl font-bold mb-6 font-display">{q.question}</h2>

          <div className="space-y-3 mb-8">
            {q.options.map((option, i) => (
              <motion.button
                key={i}
                whileHover={{ x: 4 }}
                onClick={() => handleAnswer(i)}
                className={`w-full text-left p-4 rounded border transition-all ${
                  answers[q.id] === i
                    ? "border-eduverse-accent bg-eduverse-accent/20"
                    : "border-white/10 bg-white/5 hover:bg-white/10"
                }`}
              >
                <span className="text-sm">{option}</span>
              </motion.button>
            ))}
          </div>

          <div className="flex justify-between">
            <GradientButton
              onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
              disabled={currentQ === 0}
              variant="ghost"
              className="flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </GradientButton>

            {currentQ < questions.length - 1 ? (
              <GradientButton
                onClick={() => setCurrentQ(currentQ + 1)}
                disabled={answers[q.id] === undefined}
                className="flex items-center gap-1"
              >
                Next <ChevronRight className="w-4 h-4" />
              </GradientButton>
            ) : (
              <GradientButton
                onClick={handleSubmit}
                disabled={!allAnswered}
                loading={submitting}
              >
                Submit Test
              </GradientButton>
            )}
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}

export default function PlacementTestPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--color-eduverse-bg)" }}>
        <div className="w-8 h-8 border-2 border-eduverse-accent border-t-transparent rounded animate-spin" />
      </div>
    }>
      <PlacementTestContent />
    </Suspense>
  );
}

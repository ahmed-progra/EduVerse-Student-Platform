import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";
import { addXp } from "../services/xp-service";
import { adaptAfterEvent, recordEvent } from "../services/learning-service";
import { syncMissionProgress } from "../services/mentor-service";

const router = Router();

router.get("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const lesson = await prisma.lesson.findUnique({
      where: { id: req.params.id as string },
      include: { course: { select: { slug: true } } },
    });
    if (!lesson) {
      res.status(404).json({ success: false, error: "Lesson not found" });
      return;
    }

    const progress = req.userId
      ? await prisma.userProgress.findUnique({
          where: {
            userId_lessonId: { userId: req.userId, lessonId: lesson.id },
          },
        })
      : null;

    // Quiz answers stay server-side; ship only the questions and options.
    const quiz = (JSON.parse(lesson.quiz || "[]") as Array<{ q: string; options: string[] }>).map(
      (q) => ({
        q: q.q,
        options: q.options,
      }),
    );

    const { course, ...lessonData } = lesson;
    res.json({
      success: true,
      data: {
        ...lessonData,
        topics: JSON.parse(lesson.topics || "[]"),
        quiz,
        courseSlug: course.slug,
        completed: progress?.completed || false,
        score: progress?.score || null,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to fetch lesson" });
  }
});

router.post("/:id/complete", requireAuth, async (req: Request, res: Response) => {
  try {
    const lesson = await prisma.lesson.findUnique({
      where: { id: req.params.id as string },
      include: { course: { select: { slug: true } } },
    });
    if (!lesson) {
      res.status(404).json({ success: false, error: "Lesson not found" });
      return;
    }

    const existing = await prisma.userProgress.findUnique({
      where: {
        userId_lessonId: { userId: req.userId!, lessonId: lesson.id },
      },
    });

    if (existing?.completed) {
      res.json({ success: true, data: { message: "Already completed", xpGained: 0 } });
      return;
    }

    await prisma.userProgress.upsert({
      where: {
        userId_lessonId: { userId: req.userId!, lessonId: lesson.id },
      },
      create: {
        userId: req.userId!,
        lessonId: lesson.id,
        completed: true,
        score: 100,
      },
      update: {
        completed: true,
        score: 100,
      },
    });

    const xpResult = await addXp(req.userId!, lesson.xpReward, "lesson");

    // Continuous adaptation: completion nudges this lesson's topics upward
    // and refreshes the roadmap (rule-based — no AI cost on the hot path).
    const topics = JSON.parse(lesson.topics || "[]") as string[];
    await recordEvent(req.userId!, lesson.courseId, lesson.id, "lesson_complete", {
      title: lesson.title,
    });
    await adaptAfterEvent(req.userId!, lesson.courseId, lesson.course.slug, topics, {
      kind: "complete",
    }).catch((e) => console.error("[learning] adapt after complete failed:", e));

    // Advance any active mentor missions (lesson_complete / topic-scoped / xp_earn).
    await syncMissionProgress(req.userId!, {
      kind: "lesson_complete",
      courseSlug: lesson.course.slug,
      topicKeys: topics,
    });

    res.json({ success: true, data: xpResult });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to complete lesson" });
  }
});

/* ── Quiz checkpoint: graded server-side, feeds the skill profile ──── */

router.post("/:id/quiz", requireAuth, async (req: Request, res: Response) => {
  try {
    const lesson = await prisma.lesson.findUnique({
      where: { id: req.params.id as string },
      include: { course: { select: { slug: true } } },
    });
    if (!lesson) {
      res.status(404).json({ success: false, error: "Lesson not found" });
      return;
    }
    const quiz = JSON.parse(lesson.quiz || "[]") as Array<{
      q: string;
      options: string[];
      answer: number;
      explain: string;
    }>;
    if (quiz.length === 0) {
      res.status(404).json({ success: false, error: "This lesson has no quiz" });
      return;
    }
    const { answers } = req.body as { answers?: number[] };
    if (!Array.isArray(answers) || answers.length !== quiz.length) {
      res.status(400).json({ success: false, error: `Expected ${quiz.length} answers` });
      return;
    }

    const results = quiz.map((q, i) => ({
      correct: answers[i] === q.answer,
      answer: q.answer,
      explain: q.explain,
    }));
    const correct = results.filter((r) => r.correct).length;
    const pct = Math.round((correct / quiz.length) * 100);
    const passed = pct >= 66;

    const topics = JSON.parse(lesson.topics || "[]") as string[];
    await recordEvent(req.userId!, lesson.courseId, lesson.id, passed ? "quiz_pass" : "quiz_fail", {
      title: lesson.title,
      pct,
      correct,
      total: quiz.length,
    });
    await adaptAfterEvent(req.userId!, lesson.courseId, lesson.course.slug, topics, {
      kind: "quiz",
      pct,
    }).catch((e) => console.error("[learning] adapt after quiz failed:", e));

    // Bonus XP for first-class quiz performance (kept modest; main XP is completion).
    let xpGained = 0;
    if (passed) {
      const bonus = pct === 100 ? 25 : 15;
      await addXp(req.userId!, bonus, "challenge");
      xpGained = bonus;
      // Advance mentor missions (quiz_pass / topic_mastery for these topics).
      await syncMissionProgress(req.userId!, {
        kind: "quiz_pass",
        courseSlug: lesson.course.slug,
        topicKeys: topics,
      });
    }

    res.json({
      success: true,
      data: { correct, total: quiz.length, pct, passed, results, xpGained },
    });
  } catch (err) {
    console.error("[lessons] quiz error:", err);
    res.status(500).json({ success: false, error: "Failed to grade quiz" });
  }
});

export default router;

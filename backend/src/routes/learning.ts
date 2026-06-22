import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";
import { aiLimiter } from "../middleware/rate-limit";
import { addXp } from "../services/xp-service";
import { serveBank, getBank } from "../learning/assessment-banks";
import { COURSE_TOPICS, topicLabel } from "../learning/topics";
import {
  aggregateTopics,
  buildMastery,
  classifyLevel,
  gradeCodeTask,
  aiAnalyzeAndPlan,
  buildAndSaveRoadmap,
  saveProfile,
  getProfile,
  recordEvent,
  ruleSkips,
  MasteryMap,
} from "../services/learning-service";
import { syncMissionProgress } from "../services/mentor-service";

const router = Router();
router.use(requireAuth);

async function findCourse(courseId: string) {
  return prisma.course.findUnique({ where: { id: courseId } });
}

/* ── Course learning state (drives the adaptive course page) ───────── */

router.get("/:courseId/state", async (req: Request, res: Response) => {
  try {
    const course = await findCourse(req.params.courseId as string);
    if (!course) {
      res.status(404).json({ success: false, error: "Course not found" });
      return;
    }
    const userId = req.userId!;
    const [assessment, profile, roadmap] = await Promise.all([
      prisma.assessment.findFirst({
        where: { userId, courseId: course.id, status: "completed" },
        orderBy: { completedAt: "desc" },
      }),
      getProfile(userId, course.id),
      prisma.roadmap.findUnique({ where: { userId_courseId: { userId, courseId: course.id } } }),
    ]);

    // Keep roadmap completion flags in sync with current progress.
    let items = roadmap ? JSON.parse(roadmap.items || "[]") : [];
    if (items.length > 0) {
      const progress = await prisma.userProgress.findMany({
        where: { userId, completed: true },
        select: { lessonId: true },
      });
      const done = new Set(progress.map((p) => p.lessonId));
      items = items.map((i: { lessonId: string }) => ({ ...i, completed: done.has(i.lessonId) }));
    }

    res.json({
      success: true,
      data: {
        assessed: !!assessment && !!profile,
        questionCount: getBank(course.slug).length,
        topics: (COURSE_TOPICS[course.slug] || []).map((t) => t.label),
        assessment: assessment
          ? {
              id: assessment.id,
              score: assessment.score,
              total: assessment.total,
              level: assessment.level,
              completedAt: assessment.completedAt,
              analysis: JSON.parse(assessment.analysis || "{}"),
            }
          : null,
        profile: profile
          ? {
              level: profile.level,
              mastery: JSON.parse(profile.mastery || "{}"),
              strengths: JSON.parse(profile.strengths || "[]"),
              weaknesses: JSON.parse(profile.weaknesses || "[]"),
              updatedAt: profile.updatedAt,
            }
          : null,
        roadmap: roadmap
          ? {
              items,
              focus: roadmap.focus,
              estMinutes: roadmap.estMinutes,
              version: roadmap.version,
              updatedAt: roadmap.updatedAt,
            }
          : null,
      },
    });
  } catch (err) {
    console.error("[learning] state error:", err);
    res.status(500).json({ success: false, error: "Failed to load learning state" });
  }
});

/* ── Assessment lifecycle ──────────────────────────────────────────── */

router.post("/:courseId/assessment/start", async (req: Request, res: Response) => {
  try {
    const course = await findCourse(req.params.courseId as string);
    if (!course) {
      res.status(404).json({ success: false, error: "Course not found" });
      return;
    }
    const questions = serveBank(course.slug);
    if (questions.length === 0) {
      res.status(404).json({ success: false, error: "No assessment available for this course" });
      return;
    }
    const assessment = await prisma.assessment.create({
      data: {
        userId: req.userId!,
        courseId: course.id,
        status: "in_progress",
        questions: JSON.stringify(questions.map((q) => q.id)),
        total: questions.length,
      },
    });
    res.json({ success: true, data: { assessmentId: assessment.id, questions } });
  } catch (err) {
    console.error("[learning] start error:", err);
    res.status(500).json({ success: false, error: "Failed to start assessment" });
  }
});

router.post("/:courseId/assessment/submit", aiLimiter, async (req: Request, res: Response) => {
  try {
    const course = await findCourse(req.params.courseId as string);
    if (!course) {
      res.status(404).json({ success: false, error: "Course not found" });
      return;
    }
    const userId = req.userId!;
    const { assessmentId, answers } = req.body as {
      assessmentId?: string;
      answers?: Record<string, number | string | null>;
    };
    if (!answers || typeof answers !== "object") {
      res.status(400).json({ success: false, error: "Answers are required" });
      return;
    }
    const assessment = assessmentId
      ? await prisma.assessment.findUnique({ where: { id: assessmentId } })
      : null;
    if (!assessment || assessment.userId !== userId || assessment.courseId !== course.id) {
      res
        .status(404)
        .json({ success: false, error: "Assessment session not found — start it first" });
      return;
    }
    if (assessment.status === "completed") {
      res.status(400).json({ success: false, error: "This assessment was already submitted" });
      return;
    }

    const bank = getBank(course.slug);

    // 1) AI-grade the open code tasks (sequentially — they share a rate limit).
    const codeScores: Record<string, number> = {};
    const codeFeedback: Record<string, string> = {};
    for (const q of bank.filter((q) => q.type === "code")) {
      const ans = answers[q.id];
      const graded = await gradeCodeTask(course.slug, q, typeof ans === "string" ? ans : "");
      codeScores[q.id] = graded.score;
      codeFeedback[q.id] = graded.feedback;
    }

    // 2) Deterministic aggregation → mastery map → tier-based level.
    const { stats, correct, gradable } = aggregateTopics(bank, answers, codeScores);
    const mastery = buildMastery(course.slug, stats);
    const scorePct = Math.round(
      (Object.values(mastery).reduce((a, m) => a + m.score, 0) /
        (Object.keys(mastery).length * 100)) *
        100,
    );
    const ruleLevel = classifyLevel(course.slug, mastery);

    // 3) One AI call: confirm level, narrate strengths/weaknesses, justify skips.
    const lessons = await prisma.lesson.findMany({
      where: { courseId: course.id },
      orderBy: { order: "asc" },
    });
    const lites = lessons.map((l) => ({
      id: l.id,
      order: l.order,
      title: l.title,
      difficulty: l.difficulty,
      estMinutes: l.estMinutes,
      topics: JSON.parse(l.topics || "[]") as string[],
    }));
    const plannedSkips = ruleSkips(ruleLevel, lites, mastery);
    const analysis = await aiAnalyzeAndPlan(
      course.slug,
      course.title,
      mastery,
      scorePct,
      ruleLevel,
      lites,
      plannedSkips,
      [],
    );

    // If the AI adjusted the level, recompute the skips for the final level.
    const finalLevel = analysis.level;
    const finalSkips =
      finalLevel === ruleLevel ? plannedSkips : ruleSkips(finalLevel, lites, mastery);

    // 4) Persist: profile, assessment, roadmap, XP, event.
    await saveProfile(
      userId,
      course.id,
      finalLevel,
      mastery,
      analysis.strengths,
      analysis.weaknesses,
    );
    const roadmap = await buildAndSaveRoadmap(userId, course.id, course.slug, mastery, finalLevel, {
      ...analysis,
      skipReasons: analysis.skipReasons,
    });

    const analysisRecord = {
      summary: analysis.summary,
      strengths: analysis.strengths,
      weaknesses: analysis.weaknesses,
      scorePct,
      codeFeedback,
      mastery,
    };
    await prisma.assessment.update({
      where: { id: assessment.id },
      data: {
        status: "completed",
        answers: JSON.stringify(answers),
        score: correct,
        total: gradable,
        level: finalLevel,
        analysis: JSON.stringify(analysisRecord),
        completedAt: new Date(),
      },
    });
    await prisma.user.update({ where: { id: userId }, data: { placementLevel: finalLevel } });
    await recordEvent(userId, course.id, null, "assessment_complete", {
      scorePct,
      level: finalLevel,
    });
    const xpResult = await addXp(userId, 75, "placement");
    await syncMissionProgress(userId, { kind: "assessment", courseSlug: course.slug });

    const masteredTopics = Object.entries(mastery)
      .filter(([, m]) => m.status === "mastered")
      .map(([k]) => topicLabel(course.slug, k));
    const missingTopics = Object.entries(mastery)
      .filter(([, m]) => m.status === "missing" || m.status === "weak")
      .map(([k]) => topicLabel(course.slug, k));

    res.json({
      success: true,
      data: {
        level: finalLevel,
        score: correct,
        total: gradable,
        scorePct,
        summary: analysis.summary,
        strengths: analysis.strengths,
        weaknesses: analysis.weaknesses,
        masteredTopics,
        missingTopics,
        mastery,
        codeFeedback,
        roadmap: {
          items: roadmap.items,
          focus: roadmap.focus,
          estMinutes: roadmap.estMinutes,
          version: roadmap.version,
        },
        xp: xpResult,
      },
    });
  } catch (err) {
    console.error("[learning] submit error:", err);
    res
      .status(500)
      .json({ success: false, error: "Failed to grade the assessment. Please try again." });
  }
});

/* ── Continuous adaptation: AI roadmap refresh ─────────────────────── */

router.post("/:courseId/refresh", aiLimiter, async (req: Request, res: Response) => {
  try {
    const course = await findCourse(req.params.courseId as string);
    if (!course) {
      res.status(404).json({ success: false, error: "Course not found" });
      return;
    }
    const userId = req.userId!;
    const profile = await getProfile(userId, course.id);
    if (!profile) {
      res.status(400).json({ success: false, error: "Take the placement assessment first" });
      return;
    }

    const mastery: MasteryMap = JSON.parse(profile.mastery || "{}");
    const scorePct = Math.round(
      Object.values(mastery).reduce((a, m) => a + m.score, 0) /
        Math.max(1, Object.keys(mastery).length),
    );
    const ruleLevel = classifyLevel(course.slug, mastery);

    const [lessons, events] = await Promise.all([
      prisma.lesson.findMany({ where: { courseId: course.id }, orderBy: { order: "asc" } }),
      prisma.learningEvent.findMany({
        where: { userId, courseId: course.id },
        orderBy: { createdAt: "desc" },
        take: 12,
      }),
    ]);
    const lites = lessons.map((l) => ({
      id: l.id,
      order: l.order,
      title: l.title,
      difficulty: l.difficulty,
      estMinutes: l.estMinutes,
      topics: JSON.parse(l.topics || "[]") as string[],
    }));
    const recentEvents = events.map(
      (e) => `${e.type} ${e.createdAt.toISOString().slice(0, 10)} ${e.payload}`,
    );
    const plannedSkips = ruleSkips(ruleLevel, lites, mastery);
    const analysis = await aiAnalyzeAndPlan(
      course.slug,
      course.title,
      mastery,
      scorePct,
      ruleLevel,
      lites,
      plannedSkips,
      recentEvents,
    );

    await saveProfile(
      userId,
      course.id,
      analysis.level,
      mastery,
      analysis.strengths,
      analysis.weaknesses,
    );
    const roadmap = await buildAndSaveRoadmap(
      userId,
      course.id,
      course.slug,
      mastery,
      analysis.level,
      analysis,
    );

    res.json({
      success: true,
      data: {
        level: analysis.level,
        summary: analysis.summary,
        strengths: analysis.strengths,
        weaknesses: analysis.weaknesses,
        roadmap: {
          items: roadmap.items,
          focus: roadmap.focus,
          estMinutes: roadmap.estMinutes,
          version: roadmap.version,
        },
      },
    });
  } catch (err) {
    console.error("[learning] refresh error:", err);
    res.status(500).json({ success: false, error: "Failed to refresh the roadmap" });
  }
});

export default router;

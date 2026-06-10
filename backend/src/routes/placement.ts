import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { addXp } from "../services/xp-service";
import { requireAuth } from "../middleware/auth";
import { getQuestionsForCourse } from "../placement/questions";

const router = Router();

router.get("/:courseId/questions", requireAuth, async (req: Request, res: Response) => {
  try {
    const courseId = req.params.courseId as string;
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      res.status(404).json({ success: false, error: "Course not found" });
      return;
    }
    const questions = getQuestionsForCourse(course.slug);
    if (questions.length === 0) {
      res.status(404).json({ success: false, error: "No questions for this course" });
      return;
    }
    const safe = questions.map(({ correctIndex, ...q }) => q);
    res.json({ success: true, data: safe });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to fetch questions" });
  }
});

router.post("/:courseId/submit", requireAuth, async (req: Request, res: Response) => {
  try {
    const { answers } = req.body;
    if (!answers || !Array.isArray(answers)) {
      res.status(400).json({ success: false, error: "Invalid answers format" });
      return;
    }

    const courseId = req.params.courseId as string;
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      res.status(404).json({ success: false, error: "Course not found" });
      return;
    }

    const questions = getQuestionsForCourse(course.slug);
    if (questions.length === 0) {
      res.status(404).json({ success: false, error: "No questions for this course" });
      return;
    }

    let correct = 0;
    for (let i = 0; i < questions.length; i++) {
      if (answers[i] === questions[i].correctIndex) correct++;
    }

    let level: string;
    let startingXp: number;

    if (correct >= 8) {
      level = "advanced";
      startingXp = 100;
    } else if (correct >= 5) {
      level = "intermediate";
      startingXp = 50;
    } else {
      level = "beginner";
      startingXp = 0;
    }

    await prisma.coursePlacement.upsert({
      where: {
        userId_courseId: { userId: req.userId!, courseId: course.id },
      },
      create: {
        userId: req.userId!,
        courseId: course.id,
        level,
        score: correct,
        total: questions.length,
      },
      update: {
        level,
        score: correct,
        total: questions.length,
        takenAt: new Date(),
      },
    });

    await prisma.user.update({
      where: { id: req.userId },
      data: { placementLevel: level },
    });

    if (startingXp > 0) {
      await addXp(req.userId!, startingXp, "challenge");
    }

    res.json({
      success: true,
      data: { score: correct, total: questions.length, level, startingXp },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to submit placement test" });
  }
});

router.get("/:courseId/my-result", requireAuth, async (req: Request, res: Response) => {
  try {
    const courseId = req.params.courseId as string;
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      res.status(404).json({ success: false, error: "Course not found" });
      return;
    }

    const placement = await prisma.coursePlacement.findUnique({
      where: {
        userId_courseId: { userId: req.userId!, courseId: course.id },
      },
    });

    if (!placement) {
      res.json({ success: true, data: null });
      return;
    }

    res.json({
      success: true,
      data: {
        level: placement.level,
        score: placement.score,
        total: placement.total,
        takenAt: placement.takenAt,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to fetch placement result" });
  }
});

export default router;

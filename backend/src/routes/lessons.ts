import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";
import { addXp } from "../services/xp-service";

const router = Router();

router.get("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const lesson = await prisma.lesson.findUnique({
      where: { id: req.params.id as string },
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

    res.json({
      success: true,
      data: {
        ...lesson,
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

    res.json({ success: true, data: xpResult });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to complete lesson" });
  }
});

export default router;

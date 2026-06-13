import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/", requireAuth, async (_req: Request, res: Response) => {
  try {
    const courses = await prisma.course.findMany({
      orderBy: { order: "asc" },
      include: {
        lessons: {
          orderBy: { order: "asc" },
          select: { id: true, title: true, order: true, xpReward: true },
        },
      },
    });
    res.json({ success: true, data: courses });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to fetch courses" });
  }
});

router.get("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const course = await prisma.course.findUnique({
      where: { id: req.params.id as string },
      include: {
        lessons: {
          orderBy: { order: "asc" },
          select: {
            id: true, title: true, order: true, xpReward: true,
            difficulty: true, estMinutes: true, topics: true, language: true,
          },
        },
      },
    });
    if (!course) {
      res.status(404).json({ success: false, error: "Course not found" });
      return;
    }
    // Merge the user's completion state so the UI can show real progress.
    const progress = await prisma.userProgress.findMany({
      where: { userId: req.userId!, completed: true },
      select: { lessonId: true },
    });
    const done = new Set(progress.map((p) => p.lessonId));
    const lessons = course.lessons.map((l) => ({
      ...l,
      topics: JSON.parse(l.topics || "[]"),
      completed: done.has(l.id),
    }));
    res.json({ success: true, data: { ...course, lessons } });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to fetch course" });
  }
});

export default router;

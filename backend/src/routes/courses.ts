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
        },
      },
    });
    if (!course) {
      res.status(404).json({ success: false, error: "Course not found" });
      return;
    }
    res.json({ success: true, data: course });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to fetch course" });
  }
});

export default router;

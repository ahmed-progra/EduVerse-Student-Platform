import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/profile", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: {
        progress: { include: { lesson: true } },
        inventory: { include: { item: true } },
        skills: { include: { skill: true } },
        xpLogs: { orderBy: { createdAt: "desc" }, take: 50 },
      },
    });
    if (!user) {
      res.status(404).json({ success: false, error: "User not found" });
      return;
    }
    const { passwordHash, ...safe } = user;
    res.json({ success: true, data: safe });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to fetch profile" });
  }
});

router.put("/profile", requireAuth, async (req: Request, res: Response) => {
  try {
    const { username, avatar, bio } = req.body;
    const data: Record<string, string> = {};
    if (username !== undefined) data.username = username;
    if (avatar !== undefined) data.avatar = avatar;
    if (bio !== undefined) data.bio = bio;

    const user = await prisma.user.update({
      where: { id: req.userId },
      data,
    });
    const { passwordHash, ...safe } = user;
    res.json({ success: true, data: safe });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to update profile" });
  }
});

router.get("/xp-logs", requireAuth, async (req: Request, res: Response) => {
  try {
    const logs = await prisma.xpLog.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    res.json({ success: true, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to fetch XP logs" });
  }
});

export default router;

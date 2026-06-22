import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { validUsername, validBio, validAvatar } from "../lib/validate";
import { requireAuth } from "../middleware/auth";
import { clearCache } from "../lib/cache";

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
    if (username !== undefined) {
      if (!validUsername(username)) {
        res.status(400).json({ success: false, error: "Username must be 3-20 characters (letters, numbers, underscore)" });
        return;
      }
      data.username = username;
    }
    if (avatar !== undefined) {
      if (!validAvatar(avatar)) {
        res.status(400).json({ success: false, error: "Avatar must be an image under 2 MB" });
        return;
      }
      data.avatar = avatar;
    }
    if (bio !== undefined) {
      if (!validBio(bio)) {
        res.status(400).json({ success: false, error: "Bio must be 300 characters or fewer" });
        return;
      }
      data.bio = bio;
    }

    const user = await prisma.user.update({
      where: { id: req.userId },
      data,
    });
    clearCache(`user:${req.userId}`); // profile changed — invalidate cached /auth/me
    const { passwordHash, ...safe } = user;
    res.json({ success: true, data: safe });
  } catch (err: unknown) {
    if (typeof err === "object" && err !== null && (err as { code?: string }).code === "P2002") {
      res.status(409).json({ success: false, error: "That username is already taken" });
      return;
    }
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

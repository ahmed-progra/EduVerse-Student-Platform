import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";
import { addXp } from "../services/xp-service";
import { getCached, setCache, clearCache } from "../lib/cache";

const router = Router();

router.get("/", requireAuth, async (_req: Request, res: Response) => {
  try {
    const cacheKey = `skilltree:${_req.userId}`;
    const cached = getCached<any[]>(cacheKey);
    if (cached) {
      res.json({ success: true, data: cached });
      return;
    }
    const nodes = await prisma.skillTreeNode.findMany();
    const userSkills = await prisma.userSkill.findMany({
      where: { userId: _req.userId },
    });

    const unlockedMap = new Map(userSkills.map((s) => [s.skillId, s.unlocked]));

    const data = nodes.map((n) => ({
      id: n.id,
      name: n.name,
      description: n.description,
      branch: n.branch,
      position: { x: n.positionX, y: n.positionY },
      prerequisites: JSON.parse(n.prerequisites),
      xpCost: n.xpCost,
      levelRequired: n.levelRequired,
      effect: {
        type: n.effectType,
        value: n.effectValue,
        description: n.effectDesc,
      },
      unlocked: unlockedMap.get(n.id) || false,
    }));

    setCache(cacheKey, data);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to fetch skill tree" });
  }
});

router.post("/unlock/:nodeId", requireAuth, async (req: Request, res: Response) => {
  try {
    const node = await prisma.skillTreeNode.findUnique({
      where: { id: req.params.nodeId as string },
    });
    if (!node) {
      res.status(404).json({ success: false, error: "Skill node not found" });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) {
      res.status(404).json({ success: false, error: "User not found" });
      return;
    }

    if (user.level < node.levelRequired) {
      res.status(400).json({ success: false, error: "Level requirement not met" });
      return;
    }

    if (user.xp < node.xpCost) {
      res.status(400).json({ success: false, error: "Not enough XP" });
      return;
    }

    const existing = await prisma.userSkill.findUnique({
      where: { userId_skillId: { userId: user.id, skillId: node.id } },
    });
    if (existing?.unlocked) {
      res.status(400).json({ success: false, error: "Already unlocked" });
      return;
    }

    const prerequisites: string[] = JSON.parse(node.prerequisites);
    if (prerequisites.length > 0) {
      const unlockedPrereqs = await prisma.userSkill.findMany({
        where: {
          userId: user.id,
          skillId: { in: prerequisites },
          unlocked: true,
        },
      });
      if (unlockedPrereqs.length !== prerequisites.length) {
        res.status(400).json({ success: false, error: "Prerequisites not met" });
        return;
      }
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { xp: user.xp - node.xpCost },
    });

    await prisma.userSkill.upsert({
      where: { userId_skillId: { userId: user.id, skillId: node.id } },
      create: { userId: user.id, skillId: node.id, unlocked: true },
      update: { unlocked: true },
    });

    clearCache(`skilltree:${req.userId}`);

    res.json({
      success: true,
      data: {
        message: `Unlocked ${node.name}`,
        effect: { type: node.effectType, value: node.effectValue },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to unlock skill" });
  }
});

export default router;

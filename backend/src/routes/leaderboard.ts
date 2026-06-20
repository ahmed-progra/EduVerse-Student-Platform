import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";
import { getCached, setCache } from "../lib/cache";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const period = (req.query.period as string) || "all";
    const cacheKey = `leaderboard:${period}`;
    const cached = getCached<any>(cacheKey);
    if (cached) {
      res.json({ success: true, data: cached });
      return;
    }
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (period === "weekly") {
      const weekStart = getWeekStart();
      where.weekStart = weekStart;
    }

    const [entries, total] = await Promise.all([
      prisma.leaderboardEntry.findMany({
        where,
        orderBy: { score: "desc" },
        skip,
        take: limit,
        include: {
          user: { select: { id: true, username: true, avatar: true, level: true, xp: true } },
        },
      }),
      prisma.leaderboardEntry.count({ where }),
    ]);

    const data = entries.map((e, i) => ({
      id: e.id,
      userId: e.userId,
      username: e.user.username,
      avatar: e.user.avatar,
      level: e.user.level,
      xp: e.user.xp,
      score: e.score,
      rank: skip + i + 1,
    }));

    const result = { entries: data, total, page, limit };
    setCache(cacheKey, result);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to fetch leaderboard" });
  }
});

router.get("/rank", requireAuth, async (req: Request, res: Response) => {
  try {
    const entry = await prisma.leaderboardEntry.findUnique({
      where: { userId: req.userId },
    });

    if (!entry) {
      res.json({ success: true, data: { rank: 0, score: 0 } });
      return;
    }

    const higherRanked = await prisma.leaderboardEntry.count({
      where: { score: { gt: entry.score } },
    });

    res.json({ success: true, data: { rank: higherRanked + 1, score: entry.score } });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to get rank" });
  }
});

function getWeekStart(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  return monday.toISOString().split("T")[0];
}

export default router;

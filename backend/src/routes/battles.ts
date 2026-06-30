import { Router, Request, Response } from "express";
import { requireAuth } from "../middleware/auth";
import {
  createBattle,
  joinBattle,
  submitBattleSolution,
  getActiveBattles,
  getBattleHistory,
} from "../services/battle-service";

const router = Router();

router.post("/create", requireAuth, async (req: Request, res: Response) => {
  try {
    const { difficulty, timeLimit } = req.body;
    if (!difficulty || !timeLimit) {
      res.status(400).json({ success: false, error: "Missing difficulty or timeLimit" });
      return;
    }
    const battle = await createBattle(req.userId!, difficulty, timeLimit);
    res.status(201).json({ success: true, data: battle });
  } catch (_err) {
    res.status(500).json({ success: false, error: "Failed to create battle" });
  }
});

router.post("/join/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const battle = await joinBattle(req.params.id as string, req.userId!);
    res.json({ success: true, data: battle });
  } catch (_err) {
    res.status(500).json({ success: false, error: "Failed to join battle" });
  }
});

router.post("/submit", requireAuth, async (req: Request, res: Response) => {
  try {
    const { battleId, code, timeTakenMs, timeLimitMs } = req.body;
    const result = await submitBattleSolution(
      battleId,
      req.userId!,
      code,
      timeTakenMs,
      timeLimitMs,
    );
    res.json({ success: true, data: result });
  } catch (_err) {
    res.status(500).json({ success: false, error: "Failed to submit" });
  }
});

router.get("/active", requireAuth, async (req: Request, res: Response) => {
  try {
    const battles = await getActiveBattles(req.userId!);
    res.json({ success: true, data: battles });
  } catch (_err) {
    res.status(500).json({ success: false, error: "Failed to fetch battles" });
  }
});

router.get("/history", requireAuth, async (req: Request, res: Response) => {
  try {
    const battles = await getBattleHistory(req.userId!);
    res.json({ success: true, data: battles });
  } catch (_err) {
    res.status(500).json({ success: false, error: "Failed to fetch battle history" });
  }
});

export default router;

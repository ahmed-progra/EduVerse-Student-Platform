import { Router, Request, Response } from "express";
import { requireAuth } from "../middleware/auth";
import { codeExecutionLimiter } from "../middleware/rate-limit";
import { executeCode } from "../services/judge0";

const router = Router();

router.post("/execute", requireAuth, codeExecutionLimiter, async (req: Request, res: Response) => {
  try {
    const { code, language, stdin } = req.body;
    if (!code || !language) {
      res.status(400).json({ success: false, error: "Missing code or language" });
      return;
    }

    const result = await executeCode(code, language, stdin || "");
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: "Code execution failed" });
  }
});

export default router;

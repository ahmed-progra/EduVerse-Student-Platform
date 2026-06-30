import { Router, Request, Response } from "express";
import { requireAuth } from "../middleware/auth";
import { codeExecutionLimiter } from "../middleware/rate-limit";
import { executeCode } from "../services/judge0";

const router = Router();

/* Input bounds (defense-in-depth — the runner is also rate-limited and sandboxed). */
const MAX_CODE = 50_000;
const MAX_STDIN = 10_000;

router.post("/execute", requireAuth, codeExecutionLimiter, async (req: Request, res: Response) => {
  try {
    const { code, language, stdin } = req.body;
    if (typeof code !== "string" || !code || typeof language !== "string" || !language) {
      res.status(400).json({ success: false, error: "Missing code or language" });
      return;
    }
    if (code.length > MAX_CODE) {
      res.status(413).json({ success: false, error: "Code is too large to run." });
      return;
    }
    const stdinStr = typeof stdin === "string" ? stdin.slice(0, MAX_STDIN) : "";

    const result = await executeCode(code, language, stdinStr);
    res.json({ success: true, data: result });
  } catch (_err) {
    res.status(500).json({ success: false, error: "Code execution failed" });
  }
});

export default router;

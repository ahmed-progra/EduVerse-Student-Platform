/**
 * Apprentice routes — "teach the AI" (protégé effect) HTTP surface.
 * Stateless: the dialogue transcript travels with each request.
 */

import { Router, Request, Response } from "express";
import { requireAuth } from "../middleware/auth";
import { aiLimiter } from "../middleware/rate-limit";
import { AIError } from "../services/ai-service";
import {
  apprenticeStart,
  apprenticeReply,
  gradeTeaching,
  teachableTopics,
  TeachTurn,
  MAX_TEACH_TURNS,
} from "../services/apprentice-service";

const router = Router();
router.use(requireAuth);

function sendErr(res: Response, err: unknown, op: string) {
  if (err instanceof AIError) {
    res.status(err.httpStatus).json({ success: false, error: err.message });
    return;
  }
  console.error(`[apprentice] route=${op} unexpected:`, err);
  res.status(500).json({ success: false, error: "Unexpected apprentice error. Please try again." });
}

const asString = (v: unknown) => (typeof v === "string" ? v : "");

/** Validate + clamp an incoming transcript. */
function sanitizeTurns(raw: unknown): TeachTurn[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((t): t is { role: string; text: string } => !!t && typeof (t as { text?: unknown }).text === "string" && (t as { text: string }).text.trim().length > 0)
    .slice(-20)
    .map((t) => ({ role: t.role === "apprentice" || t.role === "model" ? "apprentice" : "mentor", text: t.text }));
}

/* ── Topic catalog for the picker ──────────────────────────────────── */

router.get("/topics", async (_req: Request, res: Response) => {
  try {
    res.json({ success: true, data: { maxTurns: MAX_TEACH_TURNS, courses: await teachableTopics() } });
  } catch (err) {
    sendErr(res, err, "topics");
  }
});

/* ── Start a teaching session ──────────────────────────────────────── */

router.post("/start", aiLimiter, async (req: Request, res: Response) => {
  const topic = asString(req.body?.topic).trim();
  if (!topic) {
    res.status(400).json({ success: false, error: "A topic to teach is required" });
    return;
  }
  try {
    const courseLabel = asString(req.body?.courseLabel).trim() || undefined;
    const opener = await apprenticeStart(topic.slice(0, 120), courseLabel);
    res.json({ success: true, data: { ...opener, maxTurns: MAX_TEACH_TURNS } });
  } catch (err) {
    sendErr(res, err, "start");
  }
});

/* ── Continue the dialogue ─────────────────────────────────────────── */

router.post("/reply", aiLimiter, async (req: Request, res: Response) => {
  const topic = asString(req.body?.topic).trim();
  const turns = sanitizeTurns(req.body?.turns);
  if (!topic || turns.length === 0) {
    res.status(400).json({ success: false, error: "topic and conversation turns are required" });
    return;
  }
  try {
    const turnIndex = Math.max(0, Math.min(MAX_TEACH_TURNS, Math.round(Number(req.body?.turnIndex) || 0)));
    const reply = await apprenticeReply(topic.slice(0, 120), turns, turnIndex);
    res.json({ success: true, data: reply });
  } catch (err) {
    sendErr(res, err, "reply");
  }
});

/* ── Grade the teaching + reward ───────────────────────────────────── */

router.post("/grade", aiLimiter, async (req: Request, res: Response) => {
  const topic = asString(req.body?.topic).trim();
  const turns = sanitizeTurns(req.body?.turns);
  if (!topic || turns.length === 0) {
    res.status(400).json({ success: false, error: "topic and conversation turns are required" });
    return;
  }
  // Require at least one real explanation from the mentor before grading.
  if (!turns.some((t) => t.role === "mentor")) {
    res.status(400).json({ success: false, error: "Teach Pip something first, then ask to be graded" });
    return;
  }
  try {
    const topicKey = asString(req.body?.topicKey).trim() || null;
    const courseSlug = asString(req.body?.courseSlug).trim() || null;
    const grade = await gradeTeaching(req.userId!, topic.slice(0, 120), topicKey, courseSlug, turns);
    res.json({ success: true, data: grade });
  } catch (err) {
    sendErr(res, err, "grade");
  }
});

export default router;

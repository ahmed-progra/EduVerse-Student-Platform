/**
 * AI Mentor routes — the global coaching layer's HTTP surface.
 *
 * Everything here is backed by mentor-service.ts (Google AI Studio via the
 * shared ai-service). Profile / missions / report all build lazily and cache,
 * so a normal dashboard load is cheap; ?refresh=1 (or the POST variants) force
 * a fresh AI synthesis.
 */

import { Router, Request, Response } from "express";
import { requireAuth } from "../middleware/auth";
import { aiLimiter } from "../middleware/rate-limit";
import { AIError, ChatTurn } from "../services/ai-service";
import {
  buildProfile,
  getActiveMissions,
  generateMissions,
  completeMissionManually,
  buildReport,
  mentorChat,
} from "../services/mentor-service";

const router = Router();
router.use(requireAuth);

/* ── Helpers (mirror the ai.ts shapes) ─────────────────────────────── */

function sendErr(res: Response, err: unknown, op: string) {
  if (err instanceof AIError) {
    res.status(err.httpStatus).json({ success: false, error: err.message });
    return;
  }
  console.error(`[mentor] route=${op} unexpected:`, err);
  res.status(500).json({ success: false, error: "Unexpected mentor error. Please try again." });
}

function serializeProfile(p: Awaited<ReturnType<typeof buildProfile>>) {
  const j = <T>(raw: string, fb: T): T => {
    try {
      return JSON.parse(raw) as T;
    } catch {
      return fb;
    }
  };
  return {
    summary: p.summary,
    motivation: p.motivation,
    focus: p.focus,
    strengths: j<string[]>(p.strengths, []),
    weaknesses: j<string[]>(p.weaknesses, []),
    insights: j<unknown[]>(p.insights, []),
    recommendations: j<unknown[]>(p.recommendations, []),
    projects: j<unknown[]>(p.projects, []),
    learningSpeed: p.learningSpeed,
    retention: p.retention,
    momentum: p.momentum,
    metrics: j<Record<string, unknown>>(p.metrics, {}),
    version: p.version,
    lastSyncedAt: p.lastSyncedAt,
  };
}

function serializeMission(m: { [k: string]: unknown }) {
  return {
    id: m.id,
    scope: m.scope,
    type: m.type,
    title: m.title,
    description: m.description,
    rationale: m.rationale,
    target: m.target,
    progress: m.progress,
    xpReward: m.xpReward,
    status: m.status,
    courseSlug: m.courseSlug,
    topicKey: m.topicKey,
    difficulty: m.difficulty,
    completedAt: m.completedAt,
  };
}

function serializeReport(r: Awaited<ReturnType<typeof buildReport>>) {
  const j = <T>(raw: string, fb: T): T => {
    try {
      return JSON.parse(raw) as T;
    } catch {
      return fb;
    }
  };
  return {
    periodKey: r.periodKey,
    narrative: r.narrative,
    improved: j<string[]>(r.improved, []),
    regressed: j<string[]>(r.regressed, []),
    needsWork: j<string[]>(r.needsWork, []),
    focusAreas: j<string[]>(r.focusAreas, []),
    projects: j<unknown[]>(r.projects, []),
    createdAt: r.createdAt,
  };
}

/* ── Profile ───────────────────────────────────────────────────────── */

router.get("/profile", aiLimiter, async (req: Request, res: Response) => {
  try {
    const force = req.query.refresh === "1" || req.query.refresh === "true";
    const profile = await buildProfile(req.userId!, { force });
    res.json({ success: true, data: serializeProfile(profile) });
  } catch (err) {
    sendErr(res, err, "profile");
  }
});

router.post("/sync", aiLimiter, async (req: Request, res: Response) => {
  try {
    const profile = await buildProfile(req.userId!, { force: true });
    res.json({ success: true, data: serializeProfile(profile) });
  } catch (err) {
    sendErr(res, err, "sync");
  }
});

/* ── Missions ──────────────────────────────────────────────────────── */

router.get("/missions", aiLimiter, async (req: Request, res: Response) => {
  try {
    const { daily, weekly } = await getActiveMissions(req.userId!);
    res.json({ success: true, data: { daily: daily.map(serializeMission), weekly: weekly.map(serializeMission) } });
  } catch (err) {
    sendErr(res, err, "missions");
  }
});

router.post("/missions/generate", aiLimiter, async (req: Request, res: Response) => {
  try {
    const scope = req.query.scope === "weekly" ? "weekly" : req.query.scope === "daily" ? "daily" : null;
    if (scope) {
      const missions = await generateMissions(req.userId!, scope, { force: true });
      res.json({ success: true, data: { [scope]: missions.map(serializeMission) } });
      return;
    }
    const [daily, weekly] = await Promise.all([
      generateMissions(req.userId!, "daily", { force: true }),
      generateMissions(req.userId!, "weekly", { force: true }),
    ]);
    res.json({ success: true, data: { daily: daily.map(serializeMission), weekly: weekly.map(serializeMission) } });
  } catch (err) {
    sendErr(res, err, "missions-generate");
  }
});

router.post("/missions/:id/complete", async (req: Request, res: Response) => {
  try {
    const mission = await completeMissionManually(req.userId!, req.params.id as string);
    res.json({ success: true, data: serializeMission(mission) });
  } catch (err) {
    sendErr(res, err, "mission-complete");
  }
});

/* ── Weekly report ─────────────────────────────────────────────────── */

router.get("/report", aiLimiter, async (req: Request, res: Response) => {
  try {
    const force = req.query.refresh === "1" || req.query.refresh === "true";
    const report = await buildReport(req.userId!, { force });
    res.json({ success: true, data: serializeReport(report) });
  } catch (err) {
    sendErr(res, err, "report");
  }
});

router.post("/report/generate", aiLimiter, async (req: Request, res: Response) => {
  try {
    const report = await buildReport(req.userId!, { force: true });
    res.json({ success: true, data: serializeReport(report) });
  } catch (err) {
    sendErr(res, err, "report-generate");
  }
});

/* ── Profile-aware chat (the "AI memory") ──────────────────────────── */

router.post("/chat", aiLimiter, async (req: Request, res: Response) => {
  const message = typeof req.body?.message === "string" ? req.body.message.trim() : "";
  if (!message) {
    res.status(400).json({ success: false, error: "Message is required" });
    return;
  }
  try {
    const rawHistory = Array.isArray(req.body?.history) ? req.body.history : [];
    const history: ChatTurn[] = rawHistory
      .filter((t: unknown): t is { role: string; text: string } => !!t && typeof (t as { text?: unknown }).text === "string")
      .slice(-12)
      .map((t: { role: string; text: string }) => ({ role: t.role === "model" || t.role === "assistant" ? "model" : "user", text: t.text }));
    const { text, model } = await mentorChat(req.userId!, message, history);
    res.json({ success: true, data: { text, model } });
  } catch (err) {
    sendErr(res, err, "chat");
  }
});

export default router;

/**
 * Project Studio routes. Authenticated CRUD + AI suggest/grade, plus ONE public
 * endpoint: the shareable portfolio at /api/projects/portfolio/:username.
 */

import { Router, Request, Response } from "express";
import { requireAuth } from "../middleware/auth";
import { aiLimiter } from "../middleware/rate-limit";
import { AIError } from "../services/ai-service";
import {
  suggestProject,
  createProject,
  listProjects,
  getProject,
  updateProject,
  setPublished,
  gradeProject,
  getPortfolio,
} from "../services/project-service";

const router = Router();

function sendErr(res: Response, err: unknown, op: string) {
  if (err instanceof AIError) {
    res.status(err.httpStatus).json({ success: false, error: err.message });
    return;
  }
  console.error(`[projects] route=${op} unexpected:`, err);
  res.status(500).json({ success: false, error: "Unexpected project error. Please try again." });
}

function j<T>(raw: string, fb: T): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fb;
  }
}

type ProjectRow = NonNullable<Awaited<ReturnType<typeof getProject>>>;
function serialize(p: ProjectRow) {
  return {
    id: p.id,
    title: p.title,
    brief: p.brief,
    language: p.language,
    difficulty: p.difficulty,
    skills: j<string[]>(p.skills, []),
    milestones: j<Array<{ text: string; done: boolean }>>(p.milestones, []),
    starterCode: p.starterCode,
    code: p.code,
    status: p.status,
    source: p.source,
    score: p.score,
    feedback: p.feedback,
    rubric: j<unknown[]>(p.rubric, []),
    strengths: j<string[]>(p.strengths, []),
    improvements: j<string[]>(p.improvements, []),
    published: p.published,
    xpAwarded: p.xpAwarded,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    completedAt: p.completedAt,
  };
}

const asStr = (v: unknown) => (typeof v === "string" ? v : "");

/* ── Public portfolio (NO auth) ────────────────────────────────────── */

router.get("/portfolio/:username", async (req: Request, res: Response) => {
  try {
    const data = await getPortfolio(req.params.username as string);
    if (!data) {
      res.status(404).json({ success: false, error: "Portfolio not found" });
      return;
    }
    res.json({ success: true, data });
  } catch (err) {
    sendErr(res, err, "portfolio");
  }
});

/* ── Authenticated routes ──────────────────────────────────────────── */

router.use(requireAuth);

router.get("/", async (req: Request, res: Response) => {
  try {
    const projects = await listProjects(req.userId!);
    res.json({ success: true, data: projects.map(serialize) });
  } catch (err) {
    sendErr(res, err, "list");
  }
});

router.post("/suggest", aiLimiter, async (req: Request, res: Response) => {
  try {
    const spec = await suggestProject(req.userId!, {
      language: asStr(req.body?.language) || undefined,
      topicHint: asStr(req.body?.topicHint) || undefined,
    });
    const project = await createProject(req.userId!, spec, "suggested");
    res.json({ success: true, data: serialize(project) });
  } catch (err) {
    sendErr(res, err, "suggest");
  }
});

router.post("/", async (req: Request, res: Response) => {
  const title = asStr(req.body?.title).trim();
  const brief = asStr(req.body?.brief).trim();
  if (!title || !brief) {
    res.status(400).json({ success: false, error: "A title and a brief are required" });
    return;
  }
  try {
    const project = await createProject(
      req.userId!,
      {
        title,
        brief,
        language: asStr(req.body?.language) || "python",
        difficulty: asStr(req.body?.difficulty) || "beginner",
        skills: Array.isArray(req.body?.skills) ? req.body.skills.map(String) : [],
        milestones: Array.isArray(req.body?.milestones) ? req.body.milestones.map(String) : [],
        starterCode: asStr(req.body?.starterCode),
      },
      "custom"
    );
    res.json({ success: true, data: serialize(project) });
  } catch (err) {
    sendErr(res, err, "create");
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const project = await getProject(req.userId!, req.params.id as string);
    if (!project) {
      res.status(404).json({ success: false, error: "Project not found" });
      return;
    }
    res.json({ success: true, data: serialize(project) });
  } catch (err) {
    sendErr(res, err, "get");
  }
});

router.patch("/:id", async (req: Request, res: Response) => {
  try {
    const project = await updateProject(req.userId!, req.params.id as string, {
      code: typeof req.body?.code === "string" ? req.body.code : undefined,
      milestones: Array.isArray(req.body?.milestones) ? req.body.milestones : undefined,
    });
    res.json({ success: true, data: serialize(project) });
  } catch (err) {
    sendErr(res, err, "update");
  }
});

router.patch("/:id/publish", async (req: Request, res: Response) => {
  try {
    const project = await setPublished(req.userId!, req.params.id as string, Boolean(req.body?.published));
    res.json({ success: true, data: serialize(project) });
  } catch (err) {
    sendErr(res, err, "publish");
  }
});

router.post("/:id/submit", aiLimiter, async (req: Request, res: Response) => {
  try {
    const { project, grade } = await gradeProject(req.userId!, req.params.id as string);
    res.json({ success: true, data: { project: serialize(project!), grade } });
  } catch (err) {
    sendErr(res, err, "submit");
  }
});

export default router;

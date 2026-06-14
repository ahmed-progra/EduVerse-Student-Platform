/**
 * Project Studio service — the destination of the EduVerse journey.
 *
 * Learners build a real, single-file project tailored to their skills, submit it,
 * and an AI reviewer grades it against the brief + milestones. A completed project
 * pays XP + coins, completes "finish a project" missions, and lands on the
 * learner's public portfolio (/u/:username) as shareable proof of what they built.
 *
 * AI runs through the shared ai-service (Gemini) with deterministic fallbacks so
 * the studio always works even when the model is rate-limited.
 */

import { prisma } from "../lib/prisma";
import { generateJSON, AIError, clampText } from "./ai-service";
import { addXp } from "./xp-service";
import { recordEvent } from "./learning-service";
import { gatherSignals, syncMissionProgress } from "./mentor-service";

const LANGUAGES = new Set(["python", "javascript", "html", "css", "cpp"]);
const DIFFICULTIES = new Set(["beginner", "intermediate", "advanced"]);
const XP_BASE: Record<string, number> = { beginner: 150, intermediate: 250, advanced: 400 };

export interface ProjectSpec {
  title: string;
  brief: string;
  language: string;
  difficulty: string;
  skills: string[];
  milestones: string[];
  starterCode: string;
}

/* ── helpers ───────────────────────────────────────────────────────── */

function str(v: unknown, fallback: string): string {
  const s = typeof v === "string" ? v.trim() : "";
  return s || fallback;
}
function strArr(v: unknown, max: number): string[] {
  return (Array.isArray(v) ? v : []).map((x) => String(x)).filter(Boolean).slice(0, max);
}
const STARTERS: Record<string, string> = {
  python: "def main():\n    # your code here\n    pass\n\n\nif __name__ == \"__main__\":\n    main()\n",
  javascript: "function main() {\n  // your code here\n}\n\nmain();\n",
  html: "<!doctype html>\n<html>\n  <head><title>My Project</title></head>\n  <body>\n    <!-- your markup here -->\n  </body>\n</html>\n",
  css: "/* your styles here */\n.card {\n}\n",
  cpp: "#include <iostream>\nusing namespace std;\n\nint main() {\n    // your code here\n    return 0;\n}\n",
};

/* ── Suggest a project (AI, tailored to the learner) ───────────────── */

const SUGGEST_SYSTEM = `You are EduVerse's project mentor. Design ONE small, buildable coding project tailored to a student's level and weak areas. It must be doable in a SINGLE file and runnable. Encouraging, concrete, plain text.
Respond with JSON:
{"title": string (catchy, under 8 words),
 "brief": string (2-4 sentences: what to build + the key requirements),
 "language": "python"|"javascript"|"html"|"css"|"cpp",
 "difficulty": "beginner"|"intermediate"|"advanced",
 "skills": string[] (2-5 topics it practices),
 "milestones": string[] (3-5 concrete checklist steps, each a short imperative),
 "starterCode": string (a minimal runnable scaffold in the chosen language)}`;

function suggestFallback(language: string, difficulty: string, skills: string[]): ProjectSpec {
  const lang = LANGUAGES.has(language) ? language : "python";
  return {
    title: "Number Guessing Game",
    brief: "Build a small program where the computer picks a secret number and the player guesses it. Tell the player whether each guess is too high or too low, and count how many tries it took.",
    language: lang,
    difficulty: DIFFICULTIES.has(difficulty) ? difficulty : "beginner",
    skills: skills.length ? skills.slice(0, 4) : ["variables", "conditionals", "loops"],
    milestones: ["Pick a random secret number", "Read the player's guess", "Give higher/lower feedback in a loop", "Announce the win and the number of tries"],
    starterCode: STARTERS[lang] || STARTERS.python,
  };
}

export async function suggestProject(
  userId: string,
  opts: { language?: string; topicHint?: string } = {}
): Promise<ProjectSpec> {
  const signals = await gatherSignals(userId);
  const level = signals.user.placementLevel || "beginner";
  const wantLang = opts.language && LANGUAGES.has(opts.language) ? opts.language : "";
  const context = [
    `Student level: ${level} (account level ${signals.user.level}).`,
    signals.strengths.length ? `Strong topics: ${signals.strengths.slice(0, 6).join(", ")}.` : "",
    signals.weaknesses.length ? `Weak topics to target: ${signals.weaknesses.slice(0, 6).join(", ")}.` : "",
    `Courses they're taking: ${signals.perCourse.filter((c) => c.completed > 0).map((c) => c.title).join(", ") || "just starting"}.`,
    wantLang ? `Use language: ${wantLang}.` : "Pick the most fitting language for them.",
    opts.topicHint ? `Center the project on: ${opts.topicHint}.` : "",
  ].filter(Boolean).join("\n");

  try {
    const { data } = await generateJSON<Record<string, unknown>>({
      system: SUGGEST_SYSTEM,
      prompt: `${context}\n\nDesign one tailored project as JSON.`,
      op: "project-suggest",
      temperature: 0.7,
      maxOutputTokens: 1200,
    });
    const language = LANGUAGES.has(String(data.language)) ? String(data.language) : wantLang || "python";
    const fb = suggestFallback(language, String(data.difficulty), signals.weaknesses);
    const milestones = strArr(data.milestones, 6);
    return {
      title: clampText(str(data.title, fb.title), 80),
      brief: clampText(str(data.brief, fb.brief), 800),
      language,
      difficulty: DIFFICULTIES.has(String(data.difficulty)) ? String(data.difficulty) : fb.difficulty,
      skills: strArr(data.skills, 5).length ? strArr(data.skills, 5) : fb.skills,
      milestones: milestones.length >= 2 ? milestones : fb.milestones,
      starterCode: str(data.starterCode, STARTERS[language] || STARTERS.python),
    };
  } catch (err) {
    if (err instanceof AIError) {
      console.error("[projects] suggest AI unavailable, using fallback:", err.message);
      return suggestFallback(wantLang || "python", level, signals.weaknesses);
    }
    throw err;
  }
}

/* ── CRUD ──────────────────────────────────────────────────────────── */

export async function createProject(userId: string, spec: ProjectSpec, source: "custom" | "suggested") {
  const language = LANGUAGES.has(spec.language) ? spec.language : "python";
  return prisma.project.create({
    data: {
      userId,
      title: clampText(str(spec.title, "Untitled Project"), 80),
      brief: clampText(str(spec.brief, ""), 1200),
      language,
      difficulty: DIFFICULTIES.has(spec.difficulty) ? spec.difficulty : "beginner",
      skills: JSON.stringify(strArr(spec.skills, 6)),
      milestones: JSON.stringify(strArr(spec.milestones, 8).map((text) => ({ text, done: false }))),
      starterCode: str(spec.starterCode, STARTERS[language] || ""),
      code: str(spec.starterCode, STARTERS[language] || ""),
      source,
    },
  });
}

export async function listProjects(userId: string) {
  return prisma.project.findMany({ where: { userId }, orderBy: { updatedAt: "desc" } });
}

export async function getProject(userId: string, id: string) {
  return prisma.project.findFirst({ where: { id, userId } });
}

export async function updateProject(
  userId: string,
  id: string,
  patch: { code?: string; milestones?: Array<{ text: string; done: boolean }> }
) {
  const project = await getProject(userId, id);
  if (!project) throw new AIError("Project not found.", 404);
  const data: Record<string, unknown> = {};
  if (typeof patch.code === "string") data.code = clampText(patch.code, 40000);
  if (Array.isArray(patch.milestones)) {
    data.milestones = JSON.stringify(
      patch.milestones.map((m) => ({ text: String(m.text || ""), done: Boolean(m.done) })).slice(0, 8)
    );
  }
  return prisma.project.update({ where: { id }, data });
}

export async function setPublished(userId: string, id: string, published: boolean) {
  const project = await getProject(userId, id);
  if (!project) throw new AIError("Project not found.", 404);
  return prisma.project.update({ where: { id }, data: { published } });
}

/* ── Grade a submission (AI) + reward ──────────────────────────────── */

const GRADE_SYSTEM = `You are an EduVerse project reviewer. Evaluate the student's submitted code against the project brief and milestones. Fair and encouraging, but honest — reward working, well-structured code; note what's missing. Plain text.
Respond with JSON:
{"score": number (0-100 overall),
 "feedback": string (3-5 sentences addressed to the student),
 "rubric": [{"criterion": string, "score": number, "max": number, "note": string}] (3-4 criteria, e.g. Requirements, Correctness, Code Quality, Completeness),
 "strengths": string[] (2-3 short items),
 "improvements": string[] (2-3 short, actionable items)}`;

const languageToSlug: Record<string, string | undefined> = {
  python: "python",
  cpp: "cpp",
  html: "html",
  css: "css",
  javascript: undefined,
};

export interface GradedProject {
  score: number;
  feedback: string;
  rubric: Array<{ criterion: string; score: number; max: number; note: string }>;
  strengths: string[];
  improvements: string[];
  xpAwarded: number;
}

export async function gradeProject(userId: string, id: string): Promise<{ project: Awaited<ReturnType<typeof getProject>>; grade: GradedProject }> {
  const project = await getProject(userId, id);
  if (!project) throw new AIError("Project not found.", 404);
  if (!project.code || project.code.trim().length < 10) {
    throw new AIError("Write some code before submitting for review.", 400);
  }

  const milestones = (() => {
    try {
      return (JSON.parse(project.milestones || "[]") as Array<{ text: string }>).map((m) => `- ${m.text}`).join("\n");
    } catch {
      return "";
    }
  })();

  let grade: Omit<GradedProject, "xpAwarded">;
  try {
    const { data } = await generateJSON<Record<string, unknown>>({
      system: GRADE_SYSTEM,
      prompt: `Project: ${project.title}\nLanguage: ${project.language}\nBrief:\n${clampText(project.brief, 1200)}\n\nMilestones:\n${milestones || "(none)"}\n\nStudent's submitted code:\n\`\`\`${project.language}\n${clampText(project.code, 24000)}\n\`\`\`\n\nGrade it as JSON.`,
      op: "project-grade",
      temperature: 0.3,
      maxOutputTokens: 1400,
    });
    const score = Math.max(0, Math.min(100, Math.round(Number(data.score) || 0)));
    const rubric = (Array.isArray(data.rubric) ? data.rubric : [])
      .filter((r: unknown) => r && typeof (r as { criterion?: unknown }).criterion === "string")
      .slice(0, 4)
      .map((r: Record<string, unknown>) => ({
        criterion: String(r.criterion),
        score: Math.max(0, Math.round(Number(r.score) || 0)),
        max: Math.max(1, Math.round(Number(r.max) || 100)),
        note: clampText(String(r.note || ""), 300),
      }));
    grade = {
      score,
      feedback: str(data.feedback, "Nice work building this — it's a real step forward."),
      rubric,
      strengths: strArr(data.strengths, 3),
      improvements: strArr(data.improvements, 3),
    };
  } catch (err) {
    if (!(err instanceof AIError)) throw err;
    grade = {
      score: 65,
      feedback: "Automatic review was unavailable, but you shipped a project — that's what counts. Revisit the brief's requirements and refine when you can.",
      rubric: [{ criterion: "Submission", score: 65, max: 100, note: "Project submitted; detailed review pending." }],
      strengths: ["You built and submitted a complete project"],
      improvements: ["Re-check each milestone is fully met", "Tidy naming and add a comment or two"],
    };
  }

  const base = XP_BASE[project.difficulty] || XP_BASE.beginner;
  const xpAwarded = Math.max(50, Math.round((base * grade.score) / 100));

  const completed = await prisma.project.update({
    where: { id: project.id },
    data: {
      status: "completed",
      score: grade.score,
      feedback: grade.feedback,
      rubric: JSON.stringify(grade.rubric),
      strengths: JSON.stringify(grade.strengths),
      improvements: JSON.stringify(grade.improvements),
      xpAwarded,
      completedAt: new Date(),
    },
  });

  // Rewards + learning-loop wiring (each guarded — never sink the response).
  await addXp(userId, xpAwarded, "challenge").catch((e) => console.error("[projects] XP payout failed:", e));
  const slug = languageToSlug[project.language];
  if (slug) {
    const course = await prisma.course.findUnique({ where: { slug } });
    if (course) await recordEvent(userId, course.id, null, "project_complete", { title: project.title, score: grade.score }).catch(() => {});
  }
  await syncMissionProgress(userId, { kind: "project", courseSlug: slug }).catch(() => {});

  return { project: completed, grade: { ...grade, xpAwarded } };
}

/* ── Public portfolio ──────────────────────────────────────────────── */

export async function getPortfolio(username: string) {
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return null;
  const projects = await prisma.project.findMany({
    where: { userId: user.id, status: "completed", published: true },
    orderBy: { completedAt: "desc" },
  });
  return {
    user: {
      username: user.username,
      avatar: user.avatar,
      bio: user.bio,
      level: user.level,
      xp: user.xp,
      placementLevel: user.placementLevel,
      createdAt: user.createdAt,
    },
    projects: projects.map((p) => ({
      id: p.id,
      title: p.title,
      brief: p.brief,
      language: p.language,
      difficulty: p.difficulty,
      skills: safeArr(p.skills),
      score: p.score,
      completedAt: p.completedAt,
    })),
  };
}

function safeArr(raw: string): string[] {
  try {
    return JSON.parse(raw || "[]");
  } catch {
    return [];
  }
}

import { Router, Request, Response } from "express";
import { requireAuth } from "../middleware/auth";
import { aiLimiter } from "../middleware/rate-limit";
import { prisma } from "../lib/prisma";
import {
  AIError,
  ChatTurn,
  clampText,
  generateJSON,
  generateText,
  isConfigured,
} from "../services/ai-service";

const router = Router();

router.use(requireAuth, aiLimiter);

/* ── Input limits (characters) ─────────────────────────────────────── */
const MAX_MESSAGE = 8_000;
const MAX_CODE = 30_000;
const MAX_CONTENT = 60_000;

/* ── System prompts ────────────────────────────────────────────────── */

const MENTOR_SYSTEM = `You are EduVerse AI Mentor, a friendly programming tutor for university students.
Guide users with Socratic questioning — help them discover answers rather than giving them directly.
Keep responses concise (3-6 sentences). Use short code examples when helpful.
The platform teaches Python, JavaScript, HTML, CSS, and C++. Use plain text, not heavy markdown.`;

const REVIEW_SYSTEM = `You are a code reviewer for a learning platform. Analyze the provided code and give:
1. A score out of 10 (format exactly "Score: N/10" on the first line)
2. 2-3 specific issues or improvements, referencing line numbers where possible
3. One positive observation
Be concise and constructive. Use short bullet points. Plain text only.`;

const HINTS_SYSTEM = `You are a progressive hint system for programming challenges.
Given a challenge, produce exactly 3 hints with increasing specificity:
1. A subtle nudge about the approach or data structure
2. More direct guidance about the algorithm
3. A concrete suggestion approaching pseudo-code (but never the full solution)
Each hint must be under 2 sentences.
Respond with JSON: {"hints": ["hint1", "hint2", "hint3"]}`;

const CHALLENGE_SYSTEM = `You are a programming challenge generator for EduVerse, a coding learning platform.
Generate one coding challenge for the given topic and difficulty.
Respond with JSON: {"title": string, "description": string (under 100 words, plain text),
"example": string (show sample input and output), "difficulty": string, "topics": string[]}.
The challenge must be solvable in under 30 lines of code.`;

const EXAM_GRADE_SYSTEM = `You are a strict but encouraging programming exam grader.
Evaluate the student's answer to the exam question.
Respond with JSON: {"score": number (integer 0-10), "feedback": string (2-4 sentences, plain text),
"strengths": string[] (1-3 short items), "improvements": string[] (1-3 short items)}.
A score of 7 or higher means the answer is essentially correct.`;

const SUMMARY_SYSTEM = `You summarize programming lessons for students who just finished reading them.
Produce a clear, plain-text summary that reinforces learning.
Respond with JSON: {"summary": string (3-5 sentences, plain text),
"keyPoints": string[] (3-5 short bullet points, each under 15 words)}.`;

const QUIZ_SYSTEM = `You generate multiple-choice quizzes for a programming learning platform.
Create questions strictly about the given topic/lesson content.
Respond with JSON: {"questions": [{"question": string, "options": [string, string, string, string],
"answerIndex": number (0-3), "explanation": string (1-2 sentences why the answer is correct)}]}.
Make distractors plausible. Exactly one correct option per question.`;

const RECOMMEND_SYSTEM = `You are a learning coach for EduVerse, a programming learning platform with
courses (Python, HTML, CSS, C++), coding battles, a skill tree, and XP levels.
Based on the student's progress data, recommend what to do next.
Respond with JSON: {"focus": string (one sentence summarizing where the student should focus),
"recommendations": [{"title": string (under 8 words), "reason": string (one sentence),
"area": "courses" | "battle" | "skill-tree" | "codelab"}]}.
Give exactly 3 recommendations, most impactful first. Be specific to their data, not generic.`;

const EXPLAIN_ERROR_SYSTEM = `You are a debugging assistant for students.
Given code and a runtime error, explain in plain language:
1. What the error means
2. Why it happened on that line
3. How to fix it (with a one-line corrected snippet if applicable)
Keep it under 6 sentences. Plain text, no headers.`;

/* ── Helpers ───────────────────────────────────────────────────────── */

function sendAIError(res: Response, err: unknown, op: string) {
  if (err instanceof AIError) {
    res.status(err.httpStatus).json({ success: false, error: err.message });
    return;
  }
  console.error(`[ai] route=${op} unexpected:`, err);
  res.status(500).json({ success: false, error: "Unexpected AI service error. Please try again." });
}

function asString(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function sanitizeHistory(raw: unknown): ChatTurn[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (t): t is { role: string; text: string } =>
        !!t &&
        typeof t === "object" &&
        typeof (t as any).text === "string" &&
        (t as any).text.trim().length > 0,
    )
    .slice(-12)
    .map((t) => ({
      role: t.role === "model" || t.role === "assistant" ? "model" : "user",
      text: t.text,
    }));
}

/** Strip HTML tags from lesson content so we send clean text to the model. */
function htmlToText(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/* ── Status (used by frontend to surface configuration problems) ──── */

router.get("/status", (_req: Request, res: Response) => {
  res.json({ success: true, data: { configured: isConfigured(), provider: "google-ai-studio" } });
});

/* ── Mentor chat (multi-turn) ──────────────────────────────────────── */

router.post("/mentor", async (req: Request, res: Response) => {
  const message = asString(req.body?.message).trim();
  if (!message) {
    res.status(400).json({ success: false, error: "Message is required" });
    return;
  }
  try {
    const history = sanitizeHistory(req.body?.history);
    const context = asString(req.body?.context).trim();
    const prompt = context
      ? `Context about what the student is working on:\n${clampText(context, 4_000)}\n\nThe student asks: "${clampText(message, MAX_MESSAGE)}"`
      : clampText(message, MAX_MESSAGE);

    const { text, model } = await generateText({
      system: MENTOR_SYSTEM,
      prompt,
      history,
      op: "mentor",
      maxOutputTokens: 1024,
    });
    res.json({ success: true, data: { text, model } });
  } catch (err) {
    sendAIError(res, err, "mentor");
  }
});

/* ── Code review ───────────────────────────────────────────────────── */

router.post("/review", async (req: Request, res: Response) => {
  const code = asString(req.body?.code);
  if (!code.trim()) {
    res.status(400).json({ success: false, error: "Code is required" });
    return;
  }
  try {
    const language = asString(req.body?.language) || "python";
    const { text, model } = await generateText({
      system: REVIEW_SYSTEM,
      prompt: `Review this ${language} code:\n\`\`\`${language}\n${clampText(code, MAX_CODE)}\n\`\`\``,
      op: "review",
      maxOutputTokens: 1024,
    });
    res.json({ success: true, data: { text, model } });
  } catch (err) {
    sendAIError(res, err, "review");
  }
});

/* ── Progressive hints ─────────────────────────────────────────────── */

router.post("/hints", async (req: Request, res: Response) => {
  try {
    const challenge =
      asString(req.body?.challenge).trim() || "a general Python programming challenge";
    const { data, model } = await generateJSON<{ hints: string[] }>({
      system: HINTS_SYSTEM,
      prompt: `The student is working on this challenge: "${clampText(challenge, MAX_MESSAGE)}"\n\nGenerate the 3 progressive hints as JSON.`,
      op: "hints",
      maxOutputTokens: 512,
    });
    const hints = (Array.isArray(data.hints) ? data.hints : [])
      .map((h) => String(h))
      .filter(Boolean)
      .slice(0, 3);
    if (hints.length === 0) throw new AIError("AI returned no hints. Please try again.", 502);
    res.json({
      success: true,
      // `text` keeps the legacy "|||" format so older clients keep working.
      data: { hints, text: hints.join("|||"), model },
    });
  } catch (err) {
    sendAIError(res, err, "hints");
  }
});

/* ── Challenge generator ───────────────────────────────────────────── */

interface GeneratedChallenge {
  title: string;
  description: string;
  example: string;
  difficulty: string;
  topics: string[];
}

router.post("/challenge", async (req: Request, res: Response) => {
  try {
    const topic = asString(req.body?.topic).trim() || "python";
    const difficulty = asString(req.body?.difficulty).trim() || "medium";
    const { data, model } = await generateJSON<GeneratedChallenge>({
      system: CHALLENGE_SYSTEM,
      prompt: `Generate a ${clampText(difficulty, 40)} difficulty programming challenge about ${clampText(topic, 200)}.`,
      op: "challenge",
      maxOutputTokens: 1024,
    });
    if (!data || !data.title || !data.description) {
      throw new AIError("AI returned an incomplete challenge. Please try again.", 502);
    }
    const challenge: GeneratedChallenge = {
      title: String(data.title),
      description: String(data.description),
      example: String(data.example || ""),
      difficulty: String(data.difficulty || difficulty),
      topics: Array.isArray(data.topics) ? data.topics.map(String) : [topic],
    };
    res.json({ success: true, data: { challenge, model } });
  } catch (err) {
    sendAIError(res, err, "challenge");
  }
});

/* ── Exam grading (structured) ─────────────────────────────────────── */

router.post("/exam/grade", async (req: Request, res: Response) => {
  const question = asString(req.body?.question).trim();
  const answer = asString(req.body?.answer).trim();
  if (!question || !answer) {
    res.status(400).json({ success: false, error: "Question and answer are required" });
    return;
  }
  try {
    const topic = asString(req.body?.topic) || "programming";
    const difficulty = asString(req.body?.difficulty) || "medium";
    const { data, model } = await generateJSON<{
      score: number;
      feedback: string;
      strengths: string[];
      improvements: string[];
    }>({
      system: EXAM_GRADE_SYSTEM,
      prompt: `Exam topic: ${clampText(topic, 100)} (${clampText(difficulty, 40)} difficulty)\n\nQuestion:\n${clampText(question, MAX_MESSAGE)}\n\nStudent's answer:\n${clampText(answer, MAX_CODE)}\n\nGrade it as JSON.`,
      op: "exam-grade",
      maxOutputTokens: 1024,
      temperature: 0.3,
    });
    const score = Math.max(0, Math.min(10, Math.round(Number(data.score) || 0)));
    res.json({
      success: true,
      data: {
        score,
        passed: score >= 7,
        feedback: String(data.feedback || ""),
        strengths: Array.isArray(data.strengths) ? data.strengths.map(String).slice(0, 3) : [],
        improvements: Array.isArray(data.improvements)
          ? data.improvements.map(String).slice(0, 3)
          : [],
        model,
      },
    });
  } catch (err) {
    sendAIError(res, err, "exam-grade");
  }
});

/* ── Lesson summary ────────────────────────────────────────────────── */

router.post("/summary", async (req: Request, res: Response) => {
  const rawContent = asString(req.body?.content);
  if (!rawContent.trim()) {
    res.status(400).json({ success: false, error: "Content is required" });
    return;
  }
  try {
    const title = asString(req.body?.title) || "Lesson";
    const content = clampText(htmlToText(rawContent), MAX_CONTENT);
    const { data, model } = await generateJSON<{ summary: string; keyPoints: string[] }>({
      system: SUMMARY_SYSTEM,
      prompt: `Lesson title: ${clampText(title, 200)}\n\nLesson content:\n${content}\n\nSummarize as JSON.`,
      op: "summary",
      maxOutputTokens: 1024,
      temperature: 0.4,
    });
    const summary = String(data.summary || "").trim();
    if (!summary) throw new AIError("AI returned an empty summary. Please try again.", 502);
    res.json({
      success: true,
      data: {
        summary,
        keyPoints: Array.isArray(data.keyPoints) ? data.keyPoints.map(String).slice(0, 6) : [],
        model,
      },
    });
  } catch (err) {
    sendAIError(res, err, "summary");
  }
});

/* ── Practice quiz generation ──────────────────────────────────────── */

interface QuizQuestion {
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

router.post("/quiz", async (req: Request, res: Response) => {
  const topic = asString(req.body?.topic).trim();
  const rawContent = asString(req.body?.content);
  if (!topic && !rawContent.trim()) {
    res.status(400).json({ success: false, error: "A topic or lesson content is required" });
    return;
  }
  try {
    const count = Math.max(1, Math.min(8, Number(req.body?.count) || 4));
    const source = rawContent.trim()
      ? `Lesson content:\n${clampText(htmlToText(rawContent), MAX_CONTENT)}`
      : `Topic: ${clampText(topic, 300)}`;
    const { data, model } = await generateJSON<{ questions: QuizQuestion[] }>({
      system: QUIZ_SYSTEM,
      prompt: `${source}\n\nGenerate exactly ${count} multiple-choice questions as JSON.`,
      op: "quiz",
      maxOutputTokens: 2048,
      temperature: 0.6,
    });
    const questions = (Array.isArray(data.questions) ? data.questions : [])
      .filter(
        (q) =>
          q && typeof q.question === "string" && Array.isArray(q.options) && q.options.length >= 2,
      )
      .slice(0, count)
      .map((q) => ({
        question: String(q.question),
        options: q.options.map(String).slice(0, 4),
        answerIndex: Math.max(
          0,
          Math.min(q.options.length - 1, Math.round(Number(q.answerIndex) || 0)),
        ),
        explanation: String(q.explanation || ""),
      }));
    if (questions.length === 0)
      throw new AIError("AI returned no quiz questions. Please try again.", 502);
    res.json({ success: true, data: { questions, model } });
  } catch (err) {
    sendAIError(res, err, "quiz");
  }
});

/* ── Personalized recommendations ──────────────────────────────────── */

router.post("/recommend", async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const [user, courses, progress, skills, battles] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.course.findMany({
        include: { lessons: { select: { id: true } } },
        orderBy: { order: "asc" },
      }),
      prisma.userProgress.findMany({
        where: { userId, completed: true },
        include: { lesson: { select: { courseId: true, title: true } } },
      }),
      prisma.userSkill.count({ where: { userId, unlocked: true } }),
      prisma.battle.count({
        where: { OR: [{ player1Id: userId }, { player2Id: userId }], status: "completed" },
      }),
    ]);
    if (!user) {
      res.status(404).json({ success: false, error: "User not found" });
      return;
    }

    const perCourse = courses.map((c) => {
      const done = progress.filter((p) => p.lesson.courseId === c.id).length;
      return `${c.title}: ${done}/${c.lessons.length} lessons completed`;
    });
    const recentLessons = progress.slice(-5).map((p) => p.lesson.title);

    const profileSummary = [
      `Level ${user.level}, ${user.xp} XP, placement level: ${user.placementLevel}`,
      `Course progress: ${perCourse.join("; ") || "none"}`,
      `Recently completed lessons: ${recentLessons.join(", ") || "none"}`,
      `Skills unlocked: ${skills}`,
      `Battles played: ${battles}`,
    ].join("\n");

    const { data, model } = await generateJSON<{
      focus: string;
      recommendations: Array<{ title: string; reason: string; area: string }>;
    }>({
      system: RECOMMEND_SYSTEM,
      prompt: `Student progress data:\n${profileSummary}\n\nGive your coaching recommendations as JSON.`,
      op: "recommend",
      maxOutputTokens: 1024,
      temperature: 0.5,
    });

    const areaToHref: Record<string, string> = {
      courses: "/courses",
      battle: "/battle",
      "skill-tree": "/skill-tree",
      codelab: "/codelab",
    };
    const recommendations = (Array.isArray(data.recommendations) ? data.recommendations : [])
      .slice(0, 3)
      .map((r) => ({
        title: String(r.title || ""),
        reason: String(r.reason || ""),
        area: String(r.area || "courses"),
        href: areaToHref[String(r.area)] || "/courses",
      }))
      .filter((r) => r.title);
    if (recommendations.length === 0)
      throw new AIError("AI returned no recommendations. Please try again.", 502);
    res.json({ success: true, data: { focus: String(data.focus || ""), recommendations, model } });
  } catch (err) {
    sendAIError(res, err, "recommend");
  }
});

/* ── Runtime error explanation (visualizer "Ask AI") ───────────────── */

router.post("/explain-error", async (req: Request, res: Response) => {
  const errorMessage = asString(req.body?.errorMessage).trim();
  if (!errorMessage) {
    res.status(400).json({ success: false, error: "errorMessage is required" });
    return;
  }
  try {
    const code = asString(req.body?.code);
    const errorType = asString(req.body?.errorType) || "Error";
    const line = Number(req.body?.line) || 0;
    const language = asString(req.body?.language) || "python";
    const { text, model } = await generateText({
      system: EXPLAIN_ERROR_SYSTEM,
      prompt: `Language: ${language}\nError: ${errorType}${line ? ` at line ${line}` : ""}: "${clampText(errorMessage, 2_000)}"\n\nCode:\n\`\`\`${language}\n${clampText(code, MAX_CODE)}\n\`\`\`\n\nExplain and fix.`,
      op: "explain-error",
      maxOutputTokens: 768,
    });
    res.json({ success: true, data: { text, model } });
  } catch (err) {
    sendAIError(res, err, "explain-error");
  }
});

export default router;

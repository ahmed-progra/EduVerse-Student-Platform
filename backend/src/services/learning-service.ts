/**
 * Adaptive learning service — the brain of EduVerse's personalized paths.
 *
 * Responsibilities:
 *  - grade placement assessments (objective locally, code tasks via AI)
 *  - build per-topic mastery profiles (mastered / partial / weak / missing)
 *  - classify level from topic-tier performance (not raw thresholds),
 *    with the AI confirming/adjusting using the full per-topic picture
 *  - generate personalized roadmaps with a justification per skipped lesson
 *  - continuously adapt the profile and roadmap as quizzes and lessons land
 */

import { prisma } from "../lib/prisma";
import { generateJSON, AIError, clampText } from "./ai-service";
import { COURSE_TOPICS, topicLabel, topicTier } from "../learning/topics";
import { getBank as _getBank, BankQuestion } from "../learning/assessment-banks";

export type MasteryStatus = "mastered" | "partial" | "weak" | "missing";

export interface TopicMastery {
  status: MasteryStatus;
  score: number; // 0-100
}

export type MasteryMap = Record<string, TopicMastery>;

export interface RoadmapItem {
  lessonId: string;
  order: number;
  title: string;
  difficulty: string;
  estMinutes: number;
  status: "required" | "skipped";
  completed: boolean;
  reason: string; // justification for skips, "" for required
}

/* ── Mastery math ──────────────────────────────────────────────────── */

export function statusFor(score: number, attempted: boolean): MasteryStatus {
  if (!attempted) return "missing";
  if (score >= 75) return "mastered";
  if (score >= 45) return "partial";
  return "weak";
}

interface TopicStat {
  total: number;
  sum: number;
  attempted: boolean;
}

/** Grade objective answers + AI-scored code tasks into a topic-stat table. */
export function aggregateTopics(
  bank: BankQuestion[],
  answers: Record<string, number | string | null>,
  codeScores: Record<string, number>,
): { stats: Record<string, TopicStat>; correct: number; gradable: number } {
  const stats: Record<string, TopicStat> = {};
  let correct = 0;
  let gradable = 0;

  const add = (topic: string, score: number) => {
    if (!stats[topic]) stats[topic] = { total: 0, sum: 0, attempted: false };
    stats[topic].total++;
    stats[topic].sum += score;
    stats[topic].attempted = true;
  };

  for (const q of bank) {
    const answer = answers[q.id];
    if (q.type === "code") {
      const attempted = typeof answer === "string" && answer.trim().length > 0;
      gradable++;
      if (!attempted) continue; // skipped = no evidence, not negative evidence
      const score = codeScores[q.id] ?? 0;
      if (score >= 75) correct++;
      for (const t of q.topics) add(t, score);
    } else {
      const attempted = typeof answer === "number" && answer >= 0;
      gradable++;
      if (!attempted) continue; // skipped questions leave the topic untested
      const isRight = answer === q.answer;
      if (isRight) correct++;
      for (const t of q.topics) add(t, isRight ? 100 : 0);
    }
  }
  return { stats, correct, gradable };
}

export function buildMastery(courseSlug: string, stats: Record<string, TopicStat>): MasteryMap {
  const mastery: MasteryMap = {};
  for (const topic of COURSE_TOPICS[courseSlug] || []) {
    const s = stats[topic.key];
    if (!s || s.total === 0) {
      mastery[topic.key] = { status: "missing", score: 0 };
    } else {
      const score = Math.round(s.sum / s.total);
      mastery[topic.key] = { status: statusFor(score, s.attempted), score };
    }
  }
  return mastery;
}

/** Tier-based classification: performance per topic tier, not one raw cutoff. */
export function classifyLevel(
  courseSlug: string,
  mastery: MasteryMap,
): "beginner" | "intermediate" | "advanced" {
  const tiers: Record<string, { mastered: number; partialUp: number; total: number }> = {
    fundamental: { mastered: 0, partialUp: 0, total: 0 },
    core: { mastered: 0, partialUp: 0, total: 0 },
    advanced: { mastered: 0, partialUp: 0, total: 0 },
  };
  for (const topic of COURSE_TOPICS[courseSlug] || []) {
    const t = tiers[topicTier(courseSlug, topic.key)];
    const m = mastery[topic.key];
    t.total++;
    if (m?.status === "mastered") {
      t.mastered++;
      t.partialUp++;
    } else if (m?.status === "partial") {
      t.partialUp++;
    }
  }
  const pct = (x: number, total: number) => (total === 0 ? 0 : x / total);

  const f = tiers.fundamental;
  const c = tiers.core;
  const a = tiers.advanced;

  if (
    pct(f.mastered, f.total) >= 0.8 &&
    pct(c.mastered, c.total) >= 0.6 &&
    pct(a.partialUp, a.total) >= 0.5
  ) {
    return "advanced";
  }
  if (pct(f.mastered, f.total) >= 0.6 && pct(c.partialUp, c.total) >= 0.4) {
    return "intermediate";
  }
  return "beginner";
}

/* ── AI: code grading ──────────────────────────────────────────────── */

export async function gradeCodeTask(
  courseSlug: string,
  question: BankQuestion,
  answer: string,
): Promise<{ score: number; feedback: string }> {
  if (!answer || !answer.trim()) return { score: 0, feedback: "Not attempted." };
  try {
    const { data } = await generateJSON<{ score: number; feedback: string }>({
      system: `You grade short ${courseSlug} placement-test code answers. Judge whether the code solves the task:
correctness of logic matters most; minor syntax slips cost a little; empty or off-task answers score near 0.
Respond with JSON: {"score": number (integer 0-100), "feedback": string (1-2 sentences, plain text)}.`,
      prompt: `Task:\n${question.prompt}\n\nStudent's answer:\n${clampText(answer, 6000)}\n\nGrade it as JSON.`,
      op: "assess-code",
      maxOutputTokens: 512,
      temperature: 0.2,
    });
    return {
      score: Math.max(0, Math.min(100, Math.round(Number(data.score) || 0))),
      feedback: String(data.feedback || ""),
    };
  } catch (err) {
    // Grading must not sink the whole assessment — fall back to a labeled neutral score.
    console.error("[learning] code grading failed:", err instanceof Error ? err.message : err);
    return {
      score: 40,
      feedback: "Automatic grading was unavailable for this answer; a neutral score was applied.",
    };
  }
}

/* ── AI: analysis + roadmap reasoning (one combined call) ──────────── */

interface LessonLite {
  id: string;
  order: number;
  title: string;
  difficulty: string;
  estMinutes: number;
  topics: string[];
}

export interface AIAnalysis {
  level: "beginner" | "intermediate" | "advanced";
  summary: string;
  strengths: string[];
  weaknesses: string[];
  focus: string;
  skipReasons: Record<number, string>;
}

function masteryTable(courseSlug: string, mastery: MasteryMap): string {
  return (COURSE_TOPICS[courseSlug] || [])
    .map(
      (t) =>
        `${t.label} [${topicTier(courseSlug, t.key)}]: ${mastery[t.key]?.status || "missing"} (${mastery[t.key]?.score ?? 0}/100)`,
    )
    .join("\n");
}

/** Rule-based skip decision — deterministic, AI writes the human story. */
export function ruleSkips(level: string, lessons: LessonLite[], mastery: MasteryMap): Set<string> {
  const skips = new Set<string>();
  if (level === "beginner") return skips; // full curriculum
  for (const lesson of lessons) {
    if (lesson.topics.length === 0) continue;
    const allMastered = lesson.topics.every((t) => mastery[t]?.status === "mastered");
    const allPartialUp = lesson.topics.every(
      (t) => mastery[t]?.status === "mastered" || mastery[t]?.status === "partial",
    );
    if (allMastered) skips.add(lesson.id);
    else if (level === "advanced" && lesson.difficulty === "beginner" && allPartialUp)
      skips.add(lesson.id);
  }
  return skips;
}

function templateReason(lesson: LessonLite, courseSlug: string, mastery: MasteryMap): string {
  const parts = lesson.topics.map((t) => `${topicLabel(courseSlug, t)} ${mastery[t]?.score ?? 0}%`);
  return `Assessment shows command of this material (${parts.join(", ")}).`;
}

export async function aiAnalyzeAndPlan(
  courseSlug: string,
  courseTitle: string,
  mastery: MasteryMap,
  scorePct: number,
  ruleLevel: string,
  lessons: LessonLite[],
  skips: Set<string>,
  recentEvents: string[],
): Promise<AIAnalysis> {
  const _skippedLessons = lessons.filter((l) => skips.has(l.id));
  const lessonLines = lessons
    .map(
      (l) =>
        `#${l.order} "${l.title}" [${l.difficulty}] topics: ${l.topics.join(", ")}${skips.has(l.id) ? " (PLANNED SKIP)" : ""}`,
    )
    .join("\n");

  const fallback: AIAnalysis = {
    level: ruleLevel as AIAnalysis["level"],
    summary: `Placement complete: ${scorePct}% overall. Level set to ${ruleLevel} from topic-by-topic performance.`,
    strengths: Object.entries(mastery)
      .filter(([, m]) => m.status === "mastered")
      .slice(0, 3)
      .map(([k]) => topicLabel(courseSlug, k)),
    weaknesses: Object.entries(mastery)
      .filter(([, m]) => m.status === "weak" || m.status === "missing")
      .slice(0, 3)
      .map(([k]) => topicLabel(courseSlug, k)),
    focus:
      ruleLevel === "beginner"
        ? "Build solid fundamentals from the start of the course."
        : "Close the identified gaps, then advance.",
    skipReasons: {},
  };

  try {
    const { data } = await generateJSON<{
      level: string;
      summary: string;
      strengths: string[];
      weaknesses: string[];
      focus: string;
      skipReasons: Array<{ order: number; reason: string }>;
    }>({
      system: `You are the learning architect for EduVerse, classifying a student after a ${courseTitle} placement assessment and personalizing their lesson roadmap.
Ground every statement in the topic data provided — never invent performance. Plain text only.
Respond with JSON:
{"level": "beginner"|"intermediate"|"advanced",
 "summary": string (2-3 sentences addressed to the student about their level and why),
 "strengths": string[] (2-4 topic names they performed best in),
 "weaknesses": string[] (2-4 topic names needing the most work),
 "focus": string (one sentence: what this personalized path concentrates on),
 "skipReasons": [{"order": number, "reason": string (ONE sentence justifying skipping that lesson, citing their mastery)}]}
Provide a skipReason entry for EVERY lesson marked (PLANNED SKIP). Keep the rule-based level unless the topic data clearly contradicts it (then adjust by at most one step).`,
      prompt: `Student overall score: ${scorePct}%
Rule-based level (from tier performance): ${ruleLevel}
${recentEvents.length ? `Recent learning activity:\n${recentEvents.join("\n")}\n` : ""}
Topic mastery:
${masteryTable(courseSlug, mastery)}

Course lessons:
${clampText(lessonLines, 14000)}

Produce the JSON analysis.`,
      op: "assess-analyze",
      maxOutputTokens: 2048,
      temperature: 0.4,
    });

    const level = ["beginner", "intermediate", "advanced"].includes(data.level)
      ? (data.level as AIAnalysis["level"])
      : (ruleLevel as AIAnalysis["level"]);
    const skipReasons: Record<number, string> = {};
    for (const r of Array.isArray(data.skipReasons) ? data.skipReasons : []) {
      const order = Math.round(Number(r.order));
      if (order > 0 && typeof r.reason === "string" && r.reason.trim())
        skipReasons[order] = r.reason.trim();
    }
    return {
      level,
      summary: String(data.summary || fallback.summary),
      strengths: (Array.isArray(data.strengths) ? data.strengths : fallback.strengths)
        .map(String)
        .slice(0, 4),
      weaknesses: (Array.isArray(data.weaknesses) ? data.weaknesses : fallback.weaknesses)
        .map(String)
        .slice(0, 4),
      focus: String(data.focus || fallback.focus),
      skipReasons,
    };
  } catch (err) {
    if (err instanceof AIError) {
      console.error("[learning] AI analysis unavailable, using rule-based fallback:", err.message);
      return fallback;
    }
    throw err;
  }
}

/* ── Roadmap persistence ───────────────────────────────────────────── */

export async function buildAndSaveRoadmap(
  userId: string,
  courseId: string,
  courseSlug: string,
  mastery: MasteryMap,
  level: string,
  analysis: AIAnalysis | null,
): Promise<{ items: RoadmapItem[]; estMinutes: number; focus: string; version: number }> {
  const [lessons, progress] = await Promise.all([
    prisma.lesson.findMany({ where: { courseId }, orderBy: { order: "asc" } }),
    prisma.userProgress.findMany({
      where: { userId, completed: true },
      select: { lessonId: true },
    }),
  ]);
  const completedIds = new Set(progress.map((p) => p.lessonId));

  const lites: LessonLite[] = lessons.map((l) => ({
    id: l.id,
    order: l.order,
    title: l.title,
    difficulty: l.difficulty,
    estMinutes: l.estMinutes,
    topics: JSON.parse(l.topics || "[]"),
  }));

  const skips = ruleSkips(level, lites, mastery);

  const items: RoadmapItem[] = lites.map((l) => {
    const skipped = skips.has(l.id);
    return {
      lessonId: l.id,
      order: l.order,
      title: l.title,
      difficulty: l.difficulty,
      estMinutes: l.estMinutes,
      status: skipped ? "skipped" : "required",
      completed: completedIds.has(l.id),
      reason: skipped
        ? analysis?.skipReasons?.[l.order] || templateReason(l, courseSlug, mastery)
        : "",
    };
  });

  const estMinutes = items
    .filter((i) => i.status === "required" && !i.completed)
    .reduce((acc, i) => acc + i.estMinutes, 0);
  const focus = analysis?.focus || "";

  const existing = await prisma.roadmap.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });
  const version = (existing?.version || 0) + 1;
  await prisma.roadmap.upsert({
    where: { userId_courseId: { userId, courseId } },
    create: { userId, courseId, items: JSON.stringify(items), focus, estMinutes, version: 1 },
    update: {
      items: JSON.stringify(items),
      focus: focus || existing?.focus || "",
      estMinutes,
      version,
    },
  });

  return { items, estMinutes, focus, version };
}

/* ── Continuous adaptation ─────────────────────────────────────────── */

export async function getProfile(userId: string, courseId: string) {
  return prisma.skillProfile.findUnique({ where: { userId_courseId: { userId, courseId } } });
}

export async function saveProfile(
  userId: string,
  courseId: string,
  level: string,
  mastery: MasteryMap,
  strengths: string[],
  weaknesses: string[],
) {
  await prisma.skillProfile.upsert({
    where: { userId_courseId: { userId, courseId } },
    create: {
      userId,
      courseId,
      level,
      mastery: JSON.stringify(mastery),
      strengths: JSON.stringify(strengths),
      weaknesses: JSON.stringify(weaknesses),
    },
    update: {
      level,
      mastery: JSON.stringify(mastery),
      strengths: JSON.stringify(strengths),
      weaknesses: JSON.stringify(weaknesses),
    },
  });
}

export async function recordEvent(
  userId: string,
  courseId: string,
  lessonId: string | null,
  type: string,
  payload: object,
) {
  await prisma.learningEvent.create({
    data: { userId, courseId, lessonId, type, payload: JSON.stringify(payload) },
  });
}

/**
 * Update topic mastery after a quiz or lesson completion, then rebuild the
 * roadmap with rule-based skips (cheap — no AI call). The "Update my path"
 * action runs the full AI re-analysis on top of this evolving profile.
 */
export async function adaptAfterEvent(
  userId: string,
  courseId: string,
  courseSlug: string,
  lessonTopics: string[],
  signal: { kind: "quiz"; pct: number } | { kind: "complete" },
): Promise<void> {
  const profile = await getProfile(userId, courseId);
  if (!profile) return; // no assessment yet — nothing to adapt

  const mastery: MasteryMap = JSON.parse(profile.mastery || "{}");
  for (const topic of lessonTopics) {
    const current = mastery[topic] ?? { status: "missing" as MasteryStatus, score: 0 };
    let score = current.score;
    if (signal.kind === "quiz") {
      // Exponential blend toward the quiz result — recent evidence weighs 35%.
      score = Math.round(current.score * 0.65 + signal.pct * 0.35);
    } else {
      // Completing a lesson nudges its topics upward modestly.
      score = Math.min(100, Math.round(current.score * 0.85 + 100 * 0.15));
    }
    mastery[topic] = { score, status: statusFor(score, true) };
  }

  const level = classifyLevel(courseSlug, mastery);
  await saveProfile(
    userId,
    courseId,
    level,
    mastery,
    JSON.parse(profile.strengths || "[]"),
    JSON.parse(profile.weaknesses || "[]"),
  );
  await buildAndSaveRoadmap(userId, courseId, courseSlug, mastery, level, null);
}

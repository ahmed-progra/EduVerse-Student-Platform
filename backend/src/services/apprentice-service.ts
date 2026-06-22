/**
 * Apprentice service — "teach the AI to learn it yourself" (the protégé effect).
 *
 * Flips EduVerse's AI tutor on its head: the learner becomes the teacher and
 * the AI ("Pip") is a curious novice. Pip asks beginner questions, voices
 * misconceptions to be corrected, and its understanding meter climbs as the
 * learner explains well. A separate evaluator then grades the QUALITY of the
 * teaching and pays out XP — and, because teaching a topic is strong evidence
 * of mastering it, a good session nudges the learner's per-course SkillProfile
 * upward and advances any topic-mastery mentor mission.
 *
 * Stateless like mentor chat: the transcript travels with each request.
 */

import { prisma } from "../lib/prisma";
import { generateJSON, AIError, clampText } from "./ai-service";
import { addXp } from "./xp-service";
import { COURSE_TOPICS, topicLabel } from "../learning/topics";
import {
  getProfile,
  saveProfile,
  statusFor,
  classifyLevel,
  recordEvent,
  MasteryMap,
} from "./learning-service";
import { syncMissionProgress } from "./mentor-service";

export const MAX_TEACH_TURNS = 5;

export interface TeachTurn {
  role: "mentor" | "apprentice";
  text: string;
}

/* ── Pip's persona ─────────────────────────────────────────────────── */

const APPRENTICE_PERSONA = `You are Pip, an eager but novice coding apprentice on EduVerse. The USER is your mentor and is teaching YOU a programming topic. You are the LEARNER — you do NOT already understand the topic.
Rules:
- Stay fully in character as a curious, friendly beginner. NEVER lecture, and never reveal that you secretly know the answer — you are here to learn from your mentor.
- Ask genuine, specific beginner questions about exactly what your mentor just said.
- Roughly one reply in three, voice a believable beginner MISCONCEPTION (e.g. "Oh, so does that mean...?") so your mentor gets a chance to catch and correct it.
- Keep replies short: 2-4 sentences, warm and enthusiastic.
- React honestly: if an explanation was unclear, say what confused you; when it clicks, show a small "aha".`;

const TURN_JSON = `Respond with JSON: {"say": string (your in-character reply, plain text), "understanding": number (0-100, how well you NOW grasp the topic given everything explained so far), "done": boolean (true only once you genuinely understand it or the session is wrapping up)}.`;

/* ── helpers ───────────────────────────────────────────────────────── */

function str(v: unknown, fallback: string): string {
  const s = typeof v === "string" ? v.trim() : "";
  return s || fallback;
}
function clampPct(v: unknown, fallback: number): number {
  const n = Math.round(Number(v));
  if (Number.isNaN(n)) return fallback;
  return Math.max(0, Math.min(100, n));
}
function transcriptText(turns: TeachTurn[]): string {
  return turns
    .map((t) => `${t.role === "mentor" ? "Mentor (the student)" : "Pip"}: ${t.text}`)
    .join("\n");
}

/* ── Open a teaching session ───────────────────────────────────────── */

export async function apprenticeStart(topic: string, courseLabel?: string) {
  const fallback = {
    say: `Hi! I'm Pip, your apprentice — I'm really excited to learn about ${topic}! To start us off: in your own words, what is ${topic}, and why would I ever need it?`,
    understanding: 12,
    done: false,
  };
  try {
    const { data } = await generateJSON<{ say: string; understanding: number }>({
      system: `${APPRENTICE_PERSONA}\n${TURN_JSON}`,
      prompt: `Your mentor is about to teach you "${topic}"${courseLabel ? ` (from ${courseLabel})` : ""}. You barely know anything about it yet (understanding 5-20). Greet your mentor warmly and ask ONE specific opening question about ${topic}.`,
      op: "apprentice-start",
      temperature: 0.85,
      maxOutputTokens: 400,
    });
    return {
      say: str(data.say, fallback.say),
      understanding: clampPct(data.understanding, 12),
      done: false,
    };
  } catch (err) {
    if (err instanceof AIError) return fallback;
    throw err;
  }
}

/* ── Continue the dialogue ─────────────────────────────────────────── */

export async function apprenticeReply(topic: string, turns: TeachTurn[], turnIndex: number) {
  const forceWrap = turnIndex >= MAX_TEACH_TURNS - 1;
  const fallback = {
    say: forceWrap
      ? `That helps a lot — I think I finally get ${topic}! Thanks for walking me through it, mentor.`
      : `Interesting! Could you give me a tiny concrete example of ${topic} so it sticks better?`,
    understanding: forceWrap ? 78 : 45,
    done: forceWrap,
  };
  try {
    const { data } = await generateJSON<{ say: string; understanding: number; done: boolean }>({
      system: `${APPRENTICE_PERSONA}\n${TURN_JSON}`,
      prompt: `Topic you're learning: "${topic}".\n\nConversation so far (the last Mentor line is your mentor's newest explanation):\n${clampText(transcriptText(turns), 9000)}\n\n${
        forceWrap
          ? "This is the FINAL exchange. Reflect your honest overall understanding, show whether it clicked, and set done=true."
          : "Reply in character: ask ONE focused follow-up about whatever is still fuzzy, OR voice a beginner misconception for your mentor to correct. Set done=true only if you now truly understand it."
      }`,
      op: "apprentice-reply",
      temperature: 0.8,
      maxOutputTokens: 450,
    });
    return {
      say: str(data.say, fallback.say),
      understanding: clampPct(data.understanding, fallback.understanding),
      done: forceWrap ? true : Boolean(data.done),
    };
  } catch (err) {
    if (err instanceof AIError) return fallback;
    throw err;
  }
}

/* ── Grade the teaching + reward + feed the learning loop ──────────── */

const GRADE_SYSTEM = `You are an EduVerse teaching evaluator. In the transcript, the student played the role of MENTOR, teaching a programming topic to a curious novice (Pip). Judge ONLY the quality of the student's TEACHING — not Pip's lines.
Score each dimension 0-100:
- clarity: was it easy to follow, well-structured, jargon explained?
- correctness: was everything technically accurate (penalize wrong claims)?
- completeness: did they cover the core of the topic and address Pip's questions/misconceptions?
Respond with JSON: {"clarity": number, "correctness": number, "completeness": number, "overall": number (0-100, holistic), "verdict": string (1-2 sentences: did Pip end up genuinely understanding, and was the teaching accurate?), "strengths": string[] (2-3 short items), "improvements": string[] (2-3 short, actionable items)}.`;

export interface TeachGrade {
  clarity: number;
  correctness: number;
  completeness: number;
  overall: number;
  verdict: string;
  strengths: string[];
  improvements: string[];
  xpAwarded: number;
  masteryBoosted: boolean;
}

function xpForGrade(overall: number): number {
  // Generous but bounded: a weak attempt still earns something; a great one is worth a lesson+.
  return Math.max(20, Math.min(120, Math.round(overall * 0.8) + 20));
}

export async function gradeTeaching(
  userId: string,
  topic: string,
  topicKey: string | null,
  courseSlug: string | null,
  turns: TeachTurn[],
): Promise<TeachGrade> {
  let grade: Omit<TeachGrade, "xpAwarded" | "masteryBoosted">;
  try {
    const { data } = await generateJSON<{
      clarity: number;
      correctness: number;
      completeness: number;
      overall: number;
      verdict: string;
      strengths: string[];
      improvements: string[];
    }>({
      system: GRADE_SYSTEM,
      prompt: `Topic taught: "${topic}".\n\nTranscript:\n${clampText(transcriptText(turns), 12000)}\n\nGrade the student's teaching as JSON.`,
      op: "apprentice-grade",
      temperature: 0.3,
      maxOutputTokens: 900,
    });
    const clarity = clampPct(data.clarity, 50);
    const correctness = clampPct(data.correctness, 50);
    const completeness = clampPct(data.completeness, 50);
    const overall = clampPct(data.overall, Math.round((clarity + correctness + completeness) / 3));
    grade = {
      clarity,
      correctness,
      completeness,
      overall,
      verdict: str(data.verdict, "Pip came away with a clearer picture — nice work."),
      strengths: (Array.isArray(data.strengths) ? data.strengths : [])
        .map(String)
        .filter(Boolean)
        .slice(0, 3),
      improvements: (Array.isArray(data.improvements) ? data.improvements : [])
        .map(String)
        .filter(Boolean)
        .slice(0, 3),
    };
  } catch (err) {
    if (!(err instanceof AIError)) throw err;
    // Fallback: reward participation modestly so the session always resolves.
    grade = {
      clarity: 55,
      correctness: 55,
      completeness: 50,
      overall: 55,
      verdict:
        "Automatic grading was unavailable, but teaching is still great practice — Pip appreciated it!",
      strengths: ["You stuck with it and explained in your own words"],
      improvements: ["Try one concrete example next time", "Check Pip understood before moving on"],
    };
  }

  const xpAwarded = xpForGrade(grade.overall);
  await addXp(userId, xpAwarded, "challenge").catch((e) =>
    console.error("[apprentice] XP payout failed:", e),
  );

  // Feed the learning loop: a confident, accurate teach-back is mastery evidence.
  let masteryBoosted = false;
  const course = courseSlug
    ? await prisma.course.findUnique({ where: { slug: courseSlug } })
    : null;
  if (course) {
    await recordEvent(userId, course.id, null, "teach_back", {
      topic,
      topicKey,
      overall: grade.overall,
    }).catch(() => {});
    if (
      grade.overall >= 65 &&
      topicKey &&
      (COURSE_TOPICS[courseSlug!] || []).some((t) => t.key === topicKey)
    ) {
      masteryBoosted = await boostTopicMastery(
        userId,
        course.id,
        courseSlug!,
        topicKey,
        grade.overall,
      ).catch(() => false);
    }
    // A reasonably good teach-back advances teach_back + topic_mastery missions.
    if (grade.overall >= 50) {
      await syncMissionProgress(userId, {
        kind: "teach_back",
        courseSlug: courseSlug ?? undefined,
        topicKeys: topicKey ? [topicKey] : [],
      });
    }
  }

  return { ...grade, xpAwarded, masteryBoosted };
}

/** Blend a strong teach-back into the per-course SkillProfile (like a quiz signal). */
async function boostTopicMastery(
  userId: string,
  courseId: string,
  courseSlug: string,
  topicKey: string,
  overall: number,
): Promise<boolean> {
  const profile = await getProfile(userId, courseId);
  if (!profile) return false; // no assessment yet — XP only
  const mastery: MasteryMap = JSON.parse(profile.mastery || "{}");
  const current = mastery[topicKey] ?? { status: "missing" as const, score: 0 };
  // Teaching evidence weighs ~30%, like a quiz result.
  const score = Math.min(100, Math.round(current.score * 0.7 + overall * 0.3));
  mastery[topicKey] = { score, status: statusFor(score, true) };
  const level = classifyLevel(courseSlug, mastery);
  await saveProfile(
    userId,
    courseId,
    level,
    mastery,
    JSON.parse(profile.strengths || "[]"),
    JSON.parse(profile.weaknesses || "[]"),
  );
  return true;
}

/* ── Topic catalog for the picker ──────────────────────────────────── */

export async function teachableTopics() {
  const courses = await prisma.course.findMany({
    orderBy: { order: "asc" },
    select: { slug: true, title: true },
  });
  return courses
    .filter((c) => COURSE_TOPICS[c.slug])
    .map((c) => ({
      courseSlug: c.slug,
      courseTitle: c.title,
      topics: (COURSE_TOPICS[c.slug] || []).map((t) => ({
        key: t.key,
        label: topicLabel(c.slug, t.key),
      })),
    }));
}

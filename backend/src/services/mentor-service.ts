/**
 * AI Mentor service — the global, cross-course coaching brain of EduVerse.
 *
 * Where learning-service.ts owns ONE course's adaptive path, this service sits
 * above all of them and gives every learner a single persistent AI mentor that:
 *  - aggregates every signal (all courses, battles, skill tree, XP, quizzes)
 *    into deterministic learning-science metrics (retention, speed, momentum)
 *  - synthesizes a living MentorProfile via Gemini (summary, insights, focus,
 *    recommendations, project ideas) — grounded in those metrics, never invented
 *  - generates dynamic daily/weekly missions and auto-tracks them off real
 *    events, paying out XP through the shared xp-service
 *  - writes weekly learning reports that diff this week against the last
 *
 * Every AI call has a deterministic fallback so the dashboard always renders,
 * mirroring the pattern in learning-service.ts (aiAnalyzeAndPlan).
 */

import { prisma } from "../lib/prisma";
import { generateJSON, generateText, AIError, clampText, ChatTurn } from "./ai-service";
import { addXp } from "./xp-service";
import { COURSE_TOPICS, topicLabel } from "../learning/topics";

/* ── Period helpers (UTC; new Date() is fine in the backend) ───────── */

export function dayKey(d: Date = new Date()): string {
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

/** ISO-8601 week key, e.g. "2026-W24". */
export function isoWeekKey(d: Date = new Date()): string {
  const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dayNum = date.getUTCDay() || 7; // Mon=1..Sun=7
  date.setUTCDate(date.getUTCDate() + 4 - dayNum); // nearest Thursday
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((date.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

const VALID_COURSES = new Set(Object.keys(COURSE_TOPICS));

/* ── Signals: everything the mentor knows about a learner ──────────── */

export interface TopicRef {
  key: string;
  label: string;
  course: string; // course title
  score: number;
}
export interface GrowthPoint {
  date: string;
  xp: number; // cumulative
}
export type LearningSpeed = "slow" | "steady" | "fast";

export interface Signals {
  user: { id: string; username: string; level: number; xp: number; placementLevel: string };
  totals: {
    lessonsCompleted: number;
    coursesStarted: number;
    skillsUnlocked: number;
    battlesWon: number;
    battlesPlayed: number;
    assessmentsTaken: number;
  };
  perCourse: Array<{
    slug: string;
    title: string;
    level: string;
    completed: number;
    total: number;
  }>;
  strongTopics: TopicRef[];
  weakTopics: TopicRef[];
  strengths: string[]; // deduped labels for the profile
  weaknesses: string[];
  retention: number; // 0-100
  learningSpeed: LearningSpeed;
  momentum: number; // 0-100
  growthSeries: GrowthPoint[];
  recentActivity: string[];
}

const DAY_MS = 86_400_000;

function computeGrowth(xpLogs: Array<{ amount: number; createdAt: Date }>): GrowthPoint[] {
  const byDay = new Map<string, number>();
  for (const log of xpLogs) {
    const k = dayKey(log.createdAt);
    byDay.set(k, (byDay.get(k) || 0) + log.amount);
  }
  const days = [...byDay.keys()].sort();
  let cum = 0;
  const series = days.map((d) => {
    cum += byDay.get(d) || 0;
    return { date: d, xp: cum };
  });
  return series.slice(-14);
}

export async function gatherSignals(userId: string): Promise<Signals> {
  const [
    user,
    profiles,
    progress,
    events,
    xpLogs,
    skillsUnlocked,
    battlesPlayed,
    battlesWon,
    courses,
    assessmentsTaken,
  ] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.skillProfile.findMany({
      where: { userId },
      include: { course: { select: { slug: true, title: true } } },
    }),
    prisma.userProgress.findMany({
      where: { userId, completed: true },
      include: { lesson: { select: { courseId: true } } },
    }),
    prisma.learningEvent.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.xpLog.findMany({ where: { userId }, orderBy: { createdAt: "asc" } }),
    prisma.userSkill.count({ where: { userId, unlocked: true } }),
    prisma.battle.count({
      where: { OR: [{ player1Id: userId }, { player2Id: userId }], status: "completed" },
    }),
    prisma.battle.count({ where: { winnerId: userId } }),
    prisma.course.findMany({
      include: { lessons: { select: { id: true } } },
      orderBy: { order: "asc" },
    }),
    prisma.assessment.count({ where: { userId, status: "completed" } }),
  ]);

  if (!user) throw new Error("User not found");

  // Per-course progress + level (from the per-course SkillProfile when present).
  const profileBySlug = new Map(profiles.map((p) => [p.course.slug, p]));
  const perCourse = courses.map((c) => ({
    slug: c.slug,
    title: c.title,
    level: profileBySlug.get(c.slug)?.level || "—",
    completed: progress.filter((p) => p.lesson.courseId === c.id).length,
    total: c.lessons.length,
  }));
  const coursesStarted = perCourse.filter((c) => c.completed > 0 || c.level !== "—").length;

  // Aggregate topic mastery across every course's SkillProfile.
  const strong: TopicRef[] = [];
  const weak: TopicRef[] = [];
  for (const p of profiles) {
    const mastery = safeJson<Record<string, { status: string; score: number }>>(p.mastery, {});
    for (const [key, m] of Object.entries(mastery)) {
      const ref: TopicRef = {
        key,
        label: topicLabel(p.course.slug, key),
        course: p.course.title,
        score: m.score ?? 0,
      };
      if (m.status === "mastered") strong.push(ref);
      else if (m.status === "weak" || m.status === "missing") weak.push(ref);
    }
  }
  strong.sort((a, b) => b.score - a.score);
  weak.sort((a, b) => a.score - b.score);

  // Deduped label lists for the profile (a topic mastered in any course is a strength).
  const strongLabels = dedupeLabels(strong);
  const weakLabels = dedupeLabels(weak).filter((l) => !strongLabels.includes(l));

  // Retention: share of quiz attempts passed (recent window).
  const quizPass = events.filter((e) => e.type === "quiz_pass").length;
  const quizFail = events.filter((e) => e.type === "quiz_fail").length;
  const retention =
    quizPass + quizFail > 0 ? Math.round((quizPass / (quizPass + quizFail)) * 100) : 0;

  // Learning speed: lessons completed per active day.
  const activeDays = new Set(xpLogs.map((l) => dayKey(l.createdAt))).size;
  const rate = activeDays > 0 ? progress.length / activeDays : 0;
  const learningSpeed: LearningSpeed =
    progress.length === 0 ? "steady" : rate >= 3 ? "fast" : rate >= 1.2 ? "steady" : "slow";

  // Momentum: activity density over the last 7 days.
  const weekAgo = Date.now() - 7 * DAY_MS;
  const recentCount = xpLogs.filter((l) => l.createdAt.getTime() >= weekAgo).length;
  const momentum = Math.min(100, recentCount * 10);

  const recentActivity = events.slice(0, 12).map((e) => {
    const payload = safeJson<Record<string, unknown>>(e.payload, {});
    const title = (payload.title as string) || "";
    const pct = payload.pct !== undefined ? ` ${payload.pct}%` : "";
    return `${e.type.replace(/_/g, " ")} — ${e.createdAt.toISOString().slice(0, 10)}${title ? ` "${title}"` : ""}${pct}`;
  });

  return {
    user: {
      id: user.id,
      username: user.username,
      level: user.level,
      xp: user.xp,
      placementLevel: user.placementLevel,
    },
    totals: {
      lessonsCompleted: progress.length,
      coursesStarted,
      skillsUnlocked,
      battlesWon,
      battlesPlayed,
      assessmentsTaken,
    },
    perCourse,
    strongTopics: strong.slice(0, 12),
    weakTopics: weak.slice(0, 12),
    strengths: strongLabels.slice(0, 8),
    weaknesses: weakLabels.slice(0, 8),
    retention,
    learningSpeed,
    momentum,
    growthSeries: computeGrowth(xpLogs),
    recentActivity,
  };
}

function dedupeLabels(refs: TopicRef[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const r of refs) {
    if (!seen.has(r.label)) {
      seen.add(r.label);
      out.push(r.label);
    }
  }
  return out;
}

function safeJson<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/* ── AI prompt grounding ───────────────────────────────────────────── */

function signalsTable(s: Signals): string {
  const courses = s.perCourse
    .map((c) => `  ${c.title}: ${c.completed}/${c.total} lessons (level: ${c.level})`)
    .join("\n");
  const strong =
    s.strongTopics
      .slice(0, 8)
      .map((t) => `${t.label} (${t.course} ${t.score}%)`)
      .join(", ") || "none yet";
  const weak =
    s.weakTopics
      .slice(0, 8)
      .map((t) => `${t.label} (${t.course})`)
      .join(", ") || "none identified";
  return [
    `Learner: ${s.user.username}`,
    `Overall: level ${s.user.level}, ${s.user.xp} XP, placement ${s.user.placementLevel}`,
    `Lessons completed: ${s.totals.lessonsCompleted} | Battles: ${s.totals.battlesWon}/${s.totals.battlesPlayed} won | Skills unlocked: ${s.totals.skillsUnlocked} | Assessments: ${s.totals.assessmentsTaken}`,
    `Learning speed: ${s.learningSpeed} | Retention: ${s.retention}% | Momentum: ${s.momentum}/100`,
    ``,
    `Per-course progress:`,
    courses || "  (no courses started)",
    ``,
    `Strong topics: ${strong}`,
    `Weak / missing topics: ${weak}`,
    s.recentActivity.length
      ? `\nRecent activity:\n${s.recentActivity
          .slice(0, 10)
          .map((a) => `  ${a}`)
          .join("\n")}`
      : "",
  ].join("\n");
}

/* ── MentorProfile (the living AI memory) ──────────────────────────── */

const PROFILE_CACHE_MS = 6 * 60 * 60 * 1000; // re-sync at most every 6h unless forced

const MENTOR_PROFILE_SYSTEM = `You are EduVerse AI Mentor — a personal programming coach analyzing one student's full learning history across courses (Python, JavaScript, HTML, CSS, C++), coding battles, a skill tree, and XP levels.
Ground EVERY statement in the data provided; never invent performance. Be warm, specific, and motivating. Plain text only (no markdown).
Respond with JSON:
{"summary": string (2-3 sentences: who this learner is right now, their level and trajectory),
 "motivation": string (one encouraging sentence, specific to their progress),
 "focus": string (one sentence: the single most valuable thing to work on next),
 "insights": [{"title": string (under 8 words), "body": string (1-2 sentences), "kind": "strength"|"gap"|"habit"|"tip"}] (3-4 items),
 "recommendations": [{"title": string (under 8 words), "reason": string (one sentence), "area": "courses"|"battle"|"skill-tree"|"codelab"|"mentor"}] (exactly 3, most impactful first),
 "projects": [{"title": string, "brief": string (1-2 sentences describing a small buildable project), "skills": string[] (2-4 topics it practices)}] (2 items, matched to their level and gaps)}`;

export interface AIProfile {
  summary: string;
  motivation: string;
  focus: string;
  insights: Array<{ title: string; body: string; kind: string }>;
  recommendations: Array<{ title: string; reason: string; area: string; href: string }>;
  projects: Array<{ title: string; brief: string; skills: string[] }>;
}

const AREA_HREF: Record<string, string> = {
  courses: "/courses",
  battle: "/battle",
  "skill-tree": "/skill-tree",
  codelab: "/codelab",
  mentor: "/mentor",
};

function profileFallback(s: Signals): AIProfile {
  const topGap = s.weakTopics[0]?.label;
  const topCourse = [...s.perCourse].sort(
    (a, b) => a.completed / Math.max(1, a.total) - b.completed / Math.max(1, b.total),
  )[0];
  return {
    summary: `You're a level ${s.user.level} learner with ${s.totals.lessonsCompleted} lessons completed and ${s.user.xp} XP. ${
      s.strengths.length
        ? `You're strongest in ${s.strengths.slice(0, 2).join(" and ")}.`
        : "You're just getting started — every lesson counts."
    }`,
    motivation:
      s.momentum >= 40
        ? "You've built real momentum this week — keep the streak alive!"
        : "Small daily steps compound fast. Let's get one win today.",
    focus: topGap
      ? `Shore up ${topGap} — it's your biggest current gap.`
      : "Build solid fundamentals across your active course.",
    insights: [
      ...(s.strengths.length
        ? [
            {
              title: "Clear strengths",
              body: `You're performing well in ${s.strengths.slice(0, 3).join(", ")}.`,
              kind: "strength",
            },
          ]
        : []),
      ...(s.weaknesses.length
        ? [
            {
              title: "Focus areas",
              body: `${s.weaknesses.slice(0, 3).join(", ")} need more practice.`,
              kind: "gap",
            },
          ]
        : []),
      {
        title: "Retention",
        body: `Your quiz pass rate is ${s.retention}%. ${s.retention >= 70 ? "Solid recall." : "Revisit lessons before quizzes to lift this."}`,
        kind: "habit",
      },
    ].slice(0, 4),
    recommendations: [
      {
        title: topCourse ? `Continue ${topCourse.title}` : "Start a course",
        reason: "Move your least-finished course forward.",
        area: "courses",
        href: "/courses",
      },
      {
        title: "Try a coding battle",
        reason: "Apply what you know under time pressure.",
        area: "battle",
        href: "/battle",
      },
      {
        title: "Ask your mentor",
        reason: "Get unstuck on your weakest topic.",
        area: "mentor",
        href: "/mentor",
      },
    ],
    projects: [
      {
        title: "Mini practice project",
        brief: "Build a small program that exercises your current course's core skills.",
        skills: s.strengths.slice(0, 3).length ? s.strengths.slice(0, 3) : ["fundamentals"],
      },
      {
        title: "Gap-closer challenge",
        brief: topGap
          ? `Write something that forces you to use ${topGap}.`
          : "Pick a weak topic and build a tiny demo around it.",
        skills: s.weaknesses.slice(0, 3).length ? s.weaknesses.slice(0, 3) : ["practice"],
      },
    ],
  };
}

async function aiProfile(s: Signals): Promise<AIProfile> {
  try {
    const { data } = await generateJSON<{
      summary: string;
      motivation: string;
      focus: string;
      insights: Array<{ title: string; body: string; kind: string }>;
      recommendations: Array<{ title: string; reason: string; area: string }>;
      projects: Array<{ title: string; brief: string; skills: string[] }>;
    }>({
      system: MENTOR_PROFILE_SYSTEM,
      prompt: `Student learning data:\n${clampText(signalsTable(s), 12_000)}\n\nProduce the mentor profile JSON.`,
      op: "mentor-profile",
      maxOutputTokens: 2048,
      temperature: 0.5,
    });
    const fb = profileFallback(s);
    return {
      summary: str(data.summary, fb.summary),
      motivation: str(data.motivation, fb.motivation),
      focus: str(data.focus, fb.focus),
      insights: (Array.isArray(data.insights) ? data.insights : [])
        .filter((i) => i && i.title)
        .slice(0, 4)
        .map((i) => ({
          title: String(i.title),
          body: String(i.body || ""),
          kind: ["strength", "gap", "habit", "tip"].includes(i.kind) ? i.kind : "tip",
        })),
      recommendations: (Array.isArray(data.recommendations) ? data.recommendations : [])
        .filter((r) => r && r.title)
        .slice(0, 3)
        .map((r) => ({
          title: String(r.title),
          reason: String(r.reason || ""),
          area: String(r.area || "courses"),
          href: AREA_HREF[String(r.area)] || "/courses",
        })),
      projects: (Array.isArray(data.projects) ? data.projects : [])
        .filter((p) => p && p.title)
        .slice(0, 2)
        .map((p) => ({
          title: String(p.title),
          brief: String(p.brief || ""),
          skills: (Array.isArray(p.skills) ? p.skills : []).map(String).slice(0, 4),
        })),
    };
  } catch (err) {
    if (err instanceof AIError) {
      console.error("[mentor] profile AI unavailable, using fallback:", err.message);
      return profileFallback(s);
    }
    throw err;
  }
}

export async function buildProfile(userId: string, opts: { force?: boolean } = {}) {
  const existing = await prisma.mentorProfile.findUnique({ where: { userId } });
  if (
    !opts.force &&
    existing?.lastSyncedAt &&
    Date.now() - existing.lastSyncedAt.getTime() < PROFILE_CACHE_MS
  ) {
    return existing;
  }
  const signals = await gatherSignals(userId);
  const ai = await aiProfile(signals);

  const metrics = {
    totals: signals.totals,
    perCourse: signals.perCourse,
    growthSeries: signals.growthSeries,
    strongTopics: signals.strongTopics,
    weakTopics: signals.weakTopics,
    retention: signals.retention,
    momentum: signals.momentum,
    learningSpeed: signals.learningSpeed,
  };

  const payload = {
    summary: ai.summary,
    motivation: ai.motivation,
    focus: ai.focus,
    strengths: JSON.stringify(signals.strengths),
    weaknesses: JSON.stringify(signals.weaknesses),
    insights: JSON.stringify(ai.insights),
    recommendations: JSON.stringify(ai.recommendations),
    projects: JSON.stringify(ai.projects),
    learningSpeed: signals.learningSpeed,
    retention: signals.retention,
    momentum: signals.momentum,
    metrics: JSON.stringify(metrics),
    lastSyncedAt: new Date(),
  };

  return prisma.mentorProfile.upsert({
    where: { userId },
    create: { userId, ...payload, version: 1 },
    update: { ...payload, version: (existing?.version || 0) + 1 },
  });
}

/* ── Missions ──────────────────────────────────────────────────────── */

const MISSION_TYPES = new Set([
  "lesson_complete",
  "quiz_pass",
  "battle_win",
  "topic_mastery",
  "assessment",
  "project",
  "xp_earn",
  "teach_back",
]);
const DAILY_COUNT = 3;
const WEEKLY_COUNT = 4;

export interface MissionSpec {
  type: string;
  title: string;
  description: string;
  rationale: string;
  target: number;
  xpReward: number;
  courseSlug: string | null;
  topicKey: string | null;
  difficulty: string | null;
}

const MISSIONS_SYSTEM = `You are EduVerse AI Mentor, generating concrete learning missions for one student. Missions must be specific, achievable in the given window, and target the student's ACTUAL weak areas where possible.
Mission types and what "target" means:
- lesson_complete: finish N lessons (target 1-5)
- quiz_pass: pass N lesson quizzes (target 1-4)
- battle_win: win N coding battles (target 1-3)
- topic_mastery: practice a specific weak topic via quizzes (target 1-3, set topicKey)
- teach_back: teach a specific weak topic to the AI apprentice Pip (target 1-2, set topicKey) — the single most effective way to cement a weak topic
- assessment: take a course placement assessment (target 1)
- project: build a small project (target 1)
- xp_earn: earn N XP (target 50-300)
Respond with JSON:
{"missions": [{"type": <one type above>, "title": string (under 8 words), "description": string (one sentence), "rationale": string (one sentence citing their data), "target": number, "xpReward": number (25-100), "courseSlug": "python"|"cpp"|"html"|"css"|null, "topicKey": string|null, "difficulty": "easy"|"medium"|"hard"|null}]}`;

function clampTarget(type: string, n: number): number {
  const v = Math.round(Number(n) || 1);
  switch (type) {
    case "xp_earn":
      return Math.max(50, Math.min(300, v || 100));
    case "lesson_complete":
      return Math.max(1, Math.min(5, v));
    case "quiz_pass":
    case "battle_win":
    case "topic_mastery":
      return Math.max(1, Math.min(type === "battle_win" ? 3 : 4, v));
    case "teach_back":
      return Math.max(1, Math.min(2, v));
    default:
      return 1;
  }
}

function missionsFallback(s: Signals, scope: "daily" | "weekly"): MissionSpec[] {
  const weakCourse = [...s.perCourse]
    .filter((c) => c.total > 0)
    .sort((a, b) => a.completed / a.total - b.completed / b.total)[0];
  const weakTopic = s.weakTopics[0];
  const weakSlug = weakTopic
    ? (s.perCourse.find((c) => c.title === weakTopic.course)?.slug ?? null)
    : null;
  if (scope === "daily") {
    return [
      {
        type: "lesson_complete",
        title: "Complete 2 lessons",
        description: "Finish two lessons in any course today.",
        rationale: "Steady daily practice builds momentum.",
        target: 2,
        xpReward: 40,
        courseSlug: weakCourse?.slug || null,
        topicKey: null,
        difficulty: null,
      },
      {
        type: "quiz_pass",
        title: "Ace a quiz",
        description: "Pass one lesson quiz to lock in what you learned.",
        rationale: "Quizzes strengthen retention.",
        target: 1,
        xpReward: 30,
        courseSlug: null,
        topicKey: null,
        difficulty: null,
      },
      {
        type: "xp_earn",
        title: "Earn 100 XP",
        description: "Rack up 100 XP from any activity.",
        rationale: "Keep your growth curve climbing.",
        target: 100,
        xpReward: 50,
        courseSlug: null,
        topicKey: null,
        difficulty: null,
      },
    ];
  }
  return [
    {
      type: "lesson_complete",
      title: "Finish 5 lessons",
      description: "Complete five lessons this week.",
      rationale: "Consistent volume drives progress.",
      target: 5,
      xpReward: 80,
      courseSlug: weakCourse?.slug || null,
      topicKey: null,
      difficulty: null,
    },
    {
      type: "battle_win",
      title: "Win 2 battles",
      description: "Win two coding battles this week.",
      rationale: "Battles sharpen applied skills.",
      target: 2,
      xpReward: 90,
      courseSlug: null,
      topicKey: null,
      difficulty: null,
    },
    weakTopic
      ? {
          type: "teach_back",
          title: `Teach ${weakTopic.label} to Pip`,
          description: `Teach ${weakTopic.label} to your AI apprentice to lock it in.`,
          rationale: `${weakTopic.label} is one of your weakest topics — teaching it is the fastest way to master it.`,
          target: 1,
          xpReward: 80,
          courseSlug: weakSlug,
          topicKey: weakTopic.key,
          difficulty: null,
        }
      : {
          type: "quiz_pass",
          title: "Pass 3 quizzes",
          description: "Pass three lesson quizzes this week.",
          rationale: "Reinforce what you've studied.",
          target: 3,
          xpReward: 70,
          courseSlug: null,
          topicKey: null,
          difficulty: null,
        },
    {
      type: "project",
      title: "Build a mini project",
      description: "Apply your skills in a small self-chosen project.",
      rationale: "Projects turn knowledge into ability.",
      target: 1,
      xpReward: 100,
      courseSlug: null,
      topicKey: null,
      difficulty: null,
    },
  ];
}

function topicExists(courseSlug: string | null, topicKey: string | null): boolean {
  if (!topicKey) return false;
  if (courseSlug) return (COURSE_TOPICS[courseSlug] || []).some((t) => t.key === topicKey);
  return Object.values(COURSE_TOPICS).some((list) => list.some((t) => t.key === topicKey));
}

/**
 * Make topic-scoped missions reliably actionable: backfill a real topicKey when
 * the model omitted one, and guarantee a weekly teach-back when the learner has
 * a clear gap (teaching is EduVerse's differentiator — it should always surface).
 */
function normalizeTopicScoped(
  s: Signals,
  scope: "daily" | "weekly",
  specs: MissionSpec[],
  count: number,
): void {
  const weakest = s.weakTopics[0];
  if (!weakest) return;
  const slugFor = (courseTitle: string) =>
    s.perCourse.find((c) => c.title === courseTitle)?.slug ?? null;

  for (const m of specs) {
    if ((m.type === "topic_mastery" || m.type === "teach_back") && !m.topicKey) {
      m.topicKey = weakest.key;
      if (!m.courseSlug) m.courseSlug = slugFor(weakest.course);
    }
  }

  if (scope === "weekly" && !specs.some((m) => m.type === "teach_back")) {
    const teach: MissionSpec = {
      type: "teach_back",
      title: `Teach ${weakest.label} to Pip`,
      description: `Teach ${weakest.label} to your AI apprentice to lock it in.`,
      rationale: `${weakest.label} is one of your weakest topics — teaching it is the fastest way to master it.`,
      target: 1,
      xpReward: 80,
      courseSlug: slugFor(weakest.course),
      topicKey: weakest.key,
      difficulty: null,
    };
    const idx = specs.findIndex((m) => m.type === "topic_mastery");
    if (idx >= 0) specs[idx] = teach;
    else if (specs.length >= count) specs[count - 1] = teach;
    else specs.push(teach);
  }
}

async function aiMissions(
  s: Signals,
  scope: "daily" | "weekly",
  count: number,
): Promise<MissionSpec[]> {
  try {
    const { data } = await generateJSON<{ missions: Array<Record<string, unknown>> }>({
      system: MISSIONS_SYSTEM.replace(
        "the given window",
        scope === "daily" ? "a single day" : "one week",
      ),
      prompt: `Window: ${scope}. Generate exactly ${count} missions.\n\nStudent data:\n${clampText(signalsTable(s), 10_000)}`,
      op: `mentor-missions-${scope}`,
      maxOutputTokens: 1536,
      temperature: 0.6,
    });
    const raw = Array.isArray(data.missions) ? data.missions : [];
    const specs: MissionSpec[] = [];
    for (const m of raw) {
      const type = String(m.type || "");
      if (!MISSION_TYPES.has(type)) continue;
      const courseSlug = VALID_COURSES.has(String(m.courseSlug)) ? String(m.courseSlug) : null;
      let topicKey = m.topicKey ? String(m.topicKey) : null;
      const topicScoped = type === "topic_mastery" || type === "teach_back";
      if (topicScoped && !topicExists(courseSlug, topicKey)) topicKey = null;
      if (!topicScoped) topicKey = null;
      const difficulty = ["easy", "medium", "hard"].includes(String(m.difficulty))
        ? String(m.difficulty)
        : null;
      specs.push({
        type,
        title: clampText(String(m.title || "Mission"), 80),
        description: clampText(String(m.description || ""), 200),
        rationale: clampText(String(m.rationale || ""), 200),
        target: clampTarget(type, Number(m.target)),
        xpReward: Math.max(25, Math.min(100, Math.round(Number(m.xpReward) || 50))),
        courseSlug,
        topicKey,
        difficulty: type === "battle_win" ? difficulty : null,
      });
      if (specs.length >= count) break;
    }
    if (specs.length === 0) return missionsFallback(s, scope);
    normalizeTopicScoped(s, scope, specs, count);
    return specs;
  } catch (err) {
    if (err instanceof AIError) {
      console.error(`[mentor] missions AI unavailable (${scope}), using fallback:`, err.message);
      return missionsFallback(s, scope);
    }
    throw err;
  }
}

export async function generateMissions(
  userId: string,
  scope: "daily" | "weekly",
  opts: { force?: boolean } = {},
) {
  const periodKey = scope === "daily" ? dayKey() : isoWeekKey();
  const existing = await prisma.mission.findMany({
    where: { userId, scope, periodKey },
    orderBy: { createdAt: "asc" },
  });
  if (existing.length > 0 && !opts.force) return existing;
  if (opts.force) await prisma.mission.deleteMany({ where: { userId, scope, periodKey } });

  const signals = await gatherSignals(userId);
  const specs = await aiMissions(signals, scope, scope === "daily" ? DAILY_COUNT : WEEKLY_COUNT);
  const created = [];
  for (const spec of specs) {
    created.push(
      await prisma.mission.create({
        data: { userId, scope, periodKey, status: "active", progress: 0, ...spec },
      }),
    );
  }
  return created;
}

/** Active daily + weekly missions for the current periods (generated if absent). */
export async function getActiveMissions(userId: string) {
  const [daily, weekly] = await Promise.all([
    generateMissions(userId, "daily"),
    generateMissions(userId, "weekly"),
  ]);
  return { daily, weekly };
}

/* ── Mission auto-tracking (the XP integration) ────────────────────── */

export interface MissionEvent {
  kind: "lesson_complete" | "quiz_pass" | "battle_win" | "assessment" | "teach_back" | "project";
  courseSlug?: string;
  topicKeys?: string[];
  difficulty?: string;
}

type MissionRow = Awaited<ReturnType<typeof prisma.mission.findFirst>>;

function matchesAction(m: NonNullable<MissionRow>, e: MissionEvent): boolean {
  if (m.courseSlug) {
    if (!e.courseSlug || e.courseSlug !== m.courseSlug) return false;
  }
  switch (m.type) {
    case "lesson_complete":
      return e.kind === "lesson_complete";
    case "quiz_pass":
      return e.kind === "quiz_pass";
    case "assessment":
      return e.kind === "assessment";
    case "battle_win":
      if (m.difficulty && e.difficulty && m.difficulty !== e.difficulty) return false;
      return e.kind === "battle_win";
    case "topic_mastery":
      // Both passing a quiz and teaching the topic to Pip count as mastery work.
      if (e.kind !== "quiz_pass" && e.kind !== "teach_back") return false;
      if (!m.topicKey) return true;
      return Array.isArray(e.topicKeys) && e.topicKeys.includes(m.topicKey);
    case "teach_back":
      // Completed by teaching the topic to Pip (gated on a decent grade upstream).
      if (e.kind !== "teach_back") return false;
      if (!m.topicKey) return true;
      return Array.isArray(e.topicKeys) && e.topicKeys.includes(m.topicKey);
    case "project":
      // Auto-completed by shipping a real project in the Project Studio.
      return e.kind === "project";
    default:
      return false; // xp_earn (recomputed separately)
  }
}

/**
 * Advance any active missions that match this event; pay out XP on completion.
 * Returns the missions that just completed (for a UI toast). Never throws into
 * the caller — completion hooks stay non-blocking like adaptAfterEvent.
 */
export async function syncMissionProgress(userId: string, event: MissionEvent) {
  try {
    const periodKeys = { daily: dayKey(), weekly: isoWeekKey() };
    const missions = await prisma.mission.findMany({
      where: {
        userId,
        status: "active",
        OR: [
          { scope: "daily", periodKey: periodKeys.daily },
          { scope: "weekly", periodKey: periodKeys.weekly },
        ],
      },
    });

    const completed = [];
    for (const m of missions) {
      let nextProgress = m.progress;
      if (m.type === "xp_earn") {
        const agg = await prisma.xpLog.aggregate({
          _sum: { amount: true },
          where: { userId, createdAt: { gte: m.createdAt } },
        });
        nextProgress = Math.min(m.target, agg._sum.amount || 0);
      } else if (matchesAction(m, event)) {
        nextProgress = Math.min(m.target, m.progress + 1);
      }
      if (nextProgress <= m.progress) continue;

      const done = nextProgress >= m.target;
      const updated = await prisma.mission.update({
        where: { id: m.id },
        data: {
          progress: nextProgress,
          status: done ? "completed" : "active",
          completedAt: done ? new Date() : null,
        },
      });
      if (done) {
        await addXp(userId, m.xpReward, "challenge").catch((e) =>
          console.error("[mentor] mission XP payout failed:", e),
        );
        completed.push(updated);
      }
    }
    return completed;
  } catch (err) {
    console.error("[mentor] syncMissionProgress failed:", err instanceof Error ? err.message : err);
    return [];
  }
}

/** Manually complete a self-paced (project) mission. */
export async function completeMissionManually(userId: string, missionId: string) {
  const m = await prisma.mission.findFirst({ where: { id: missionId, userId } });
  if (!m) throw new AIError("Mission not found.", 404);
  if (m.status === "completed") return m;
  if (m.type !== "project")
    throw new AIError("This mission completes automatically as you learn.", 400);
  const updated = await prisma.mission.update({
    where: { id: m.id },
    data: { progress: m.target, status: "completed", completedAt: new Date() },
  });
  await addXp(userId, m.xpReward, "challenge").catch((e) =>
    console.error("[mentor] project XP payout failed:", e),
  );
  return updated;
}

/* ── Weekly report ─────────────────────────────────────────────────── */

const REPORT_SYSTEM = `You write a weekly learning report for an EduVerse student, as their personal AI mentor. Ground it strictly in the metrics and week-over-week deltas provided. Encouraging but honest. Plain text only.
Respond with JSON:
{"narrative": string (3-5 sentences summarizing the week and pointing forward),
 "projects": [{"title": string, "brief": string (1-2 sentences), "skills": string[] (2-4 topics)}] (1-2 project ideas matched to their focus areas)}`;

interface MetricSnap {
  lessonsCompleted: number;
  battlesWon: number;
  retention: number;
  momentum: number;
  masteredCount: number;
  weakCount: number;
}

function snapOf(s: Signals): MetricSnap {
  return {
    lessonsCompleted: s.totals.lessonsCompleted,
    battlesWon: s.totals.battlesWon,
    retention: s.retention,
    momentum: s.momentum,
    masteredCount: s.strongTopics.length,
    weakCount: s.weakTopics.length,
  };
}

function diffMetrics(
  s: Signals,
  prev: MetricSnap | null,
): { improved: string[]; regressed: string[]; needsWork: string[] } {
  const cur = snapOf(s);
  const improved: string[] = [];
  const regressed: string[] = [];
  const needsWork = s.weakTopics.slice(0, 4).map((w) => `${w.label} (${w.course})`);

  if (!prev) {
    if (cur.lessonsCompleted > 0) improved.push(`Completed ${cur.lessonsCompleted} lessons`);
    if (cur.masteredCount > 0) improved.push(`Mastered ${cur.masteredCount} topics`);
    if (s.user.level > 1) improved.push(`Reached level ${s.user.level}`);
    if (cur.battlesWon > 0) improved.push(`Won ${cur.battlesWon} battles`);
    if (improved.length === 0) improved.push("Started your learning journey");
    return { improved, regressed, needsWork };
  }

  const lessonsDelta = cur.lessonsCompleted - prev.lessonsCompleted;
  if (lessonsDelta > 0) improved.push(`Completed ${lessonsDelta} more lessons`);
  const masteredDelta = cur.masteredCount - prev.masteredCount;
  if (masteredDelta > 0) improved.push(`Mastered ${masteredDelta} new topics`);
  const battlesDelta = cur.battlesWon - prev.battlesWon;
  if (battlesDelta > 0) improved.push(`Won ${battlesDelta} more battles`);
  if (cur.retention > prev.retention) improved.push(`Retention up to ${cur.retention}%`);
  else if (cur.retention < prev.retention) regressed.push(`Retention dipped to ${cur.retention}%`);
  if (cur.momentum < prev.momentum - 10) regressed.push("Activity slowed down this week");
  else if (cur.momentum > prev.momentum + 10) improved.push("Activity picked up this week");
  if (masteredDelta < 0) regressed.push("Some topics slipped from mastered");

  if (improved.length === 0) improved.push("Held steady — consistency matters");
  return { improved, regressed, needsWork };
}

async function aiReport(
  s: Signals,
  improved: string[],
  regressed: string[],
  needsWork: string[],
): Promise<{
  narrative: string;
  projects: Array<{ title: string; brief: string; skills: string[] }>;
}> {
  const fallback = {
    narrative: `This week you completed ${s.totals.lessonsCompleted} lessons total and reached level ${s.user.level}. ${
      improved.length ? `Wins: ${improved.slice(0, 3).join("; ")}. ` : ""
    }${needsWork.length ? `Next, focus on ${needsWork.slice(0, 2).join(" and ")}.` : "Keep your momentum going."}`,
    projects: profileFallback(s).projects,
  };
  try {
    const { data } = await generateJSON<{
      narrative: string;
      projects: Array<{ title: string; brief: string; skills: string[] }>;
    }>({
      system: REPORT_SYSTEM,
      prompt: `Student metrics:\n${clampText(signalsTable(s), 9_000)}\n\nThis week's deltas:\nImproved: ${improved.join("; ") || "—"}\nRegressed: ${regressed.join("; ") || "—"}\nNeeds work: ${needsWork.join("; ") || "—"}\n\nWrite the weekly report JSON.`,
      op: "mentor-report",
      maxOutputTokens: 1200,
      temperature: 0.5,
    });
    return {
      narrative: str(data.narrative, fallback.narrative),
      projects: (Array.isArray(data.projects) ? data.projects : fallback.projects)
        .filter((p) => p && p.title)
        .slice(0, 2)
        .map((p) => ({
          title: String(p.title),
          brief: String(p.brief || ""),
          skills: (Array.isArray(p.skills) ? p.skills : []).map(String).slice(0, 4),
        })),
    };
  } catch (err) {
    if (err instanceof AIError) {
      console.error("[mentor] report AI unavailable, using fallback:", err.message);
      return fallback;
    }
    throw err;
  }
}

export async function buildReport(userId: string, opts: { force?: boolean } = {}) {
  const periodKey = isoWeekKey();
  const existing = await prisma.mentorReport.findUnique({
    where: { userId_periodKey: { userId, periodKey } },
  });
  if (existing && !opts.force) return existing;

  const signals = await gatherSignals(userId);
  const prevReport = await prisma.mentorReport.findFirst({
    where: { userId, periodKey: { not: periodKey } },
    orderBy: { createdAt: "desc" },
  });
  const prevSnap = prevReport ? safeJson<MetricSnap | null>(prevReport.metrics, null) : null;
  const { improved, regressed, needsWork } = diffMetrics(signals, prevSnap);
  const ai = await aiReport(signals, improved, regressed, needsWork);
  const focusAreas = signals.weaknesses.slice(0, 4);

  const payload = {
    narrative: ai.narrative,
    improved: JSON.stringify(improved),
    regressed: JSON.stringify(regressed),
    needsWork: JSON.stringify(needsWork),
    focusAreas: JSON.stringify(focusAreas),
    projects: JSON.stringify(ai.projects),
    metrics: JSON.stringify(snapOf(signals)),
  };

  return prisma.mentorReport.upsert({
    where: { userId_periodKey: { userId, periodKey } },
    create: { userId, periodKey, ...payload },
    update: { ...payload },
  });
}

/* ── Mentor chat (profile-aware "AI memory") ───────────────────────── */

const MENTOR_CHAT_SYSTEM = `You are EduVerse AI Mentor, this student's personal programming coach. You are given their living learning profile as context — reference their actual strengths, gaps, level, and goals in your guidance.
For problem-solving, prefer Socratic nudges over handing over answers. Be concise (3-6 sentences), warm, and practical. Plain text, short code snippets only when they truly help.
The platform teaches Python, JavaScript, HTML, CSS, and C++.`;

export async function mentorChat(userId: string, message: string, history: ChatTurn[]) {
  const profile = await prisma.mentorProfile.findUnique({ where: { userId } });
  let context = "";
  if (profile) {
    const strengths = safeJson<string[]>(profile.strengths, []);
    const weaknesses = safeJson<string[]>(profile.weaknesses, []);
    context = [
      `Learner profile (for grounding):`,
      profile.summary ? `Summary: ${profile.summary}` : "",
      `Learning speed: ${profile.learningSpeed} | Retention: ${profile.retention}% | Momentum: ${profile.momentum}/100`,
      strengths.length ? `Strengths: ${strengths.join(", ")}` : "",
      weaknesses.length ? `Gaps to work on: ${weaknesses.join(", ")}` : "",
      profile.focus ? `Current focus: ${profile.focus}` : "",
    ]
      .filter(Boolean)
      .join("\n");
  }
  const prompt = context
    ? `${context}\n\nThe student asks: "${clampText(message, 8_000)}"`
    : clampText(message, 8_000);
  return generateText({
    system: MENTOR_CHAT_SYSTEM,
    prompt,
    history,
    op: "mentor-chat",
    maxOutputTokens: 1024,
  });
}

/* ── small util ────────────────────────────────────────────────────── */

function str(v: unknown, fallback: string): string {
  const s = typeof v === "string" ? v.trim() : "";
  return s || fallback;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
import type { MentorProfileData, Mission, MentorReportData } from "@/types/mentor";
import type { ApprenticeTurn, TeachGrade, TeachableCourse } from "@/types/apprentice";
import type { Project, ProjectMilestone, ProjectRubric, PortfolioData } from "@/types/project";
import type {
  AuthResponse,
  CodeExecutionResult,
  ShopItem,
  SkillTreeNode,
  User,
  UserInventory,
  XpLog,
} from "@/types/api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

/** AI generations can legitimately take a while (model retries included). */
const AI_TIMEOUT_MS = 90_000;

/** Simple in-memory response cache with TTL to speed up navigation. */
const CACHE_TTL = 30_000; // 30 seconds
const cache = new Map<string, { data: unknown; expires: number }>();
const pending = new Map<string, Promise<unknown>>();

function cacheKey(path: string, options: FetchOptions): string {
  return `${options.method || "GET"}::${path}::${JSON.stringify(options.body || "")}`;
}

function isCacheable(method: string | undefined, path: string): boolean {
  if (method && method !== "GET" && method !== "POST") return false;
  if (!method || method === "GET") return true;
  // Only cache POST endpoints known to be read-like, never mutations.
  const readPostPatterns = ["/learning/", "/auth/me"];
  return readPostPatterns.some((p) => path.includes(p));
}

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
  timeoutMs?: number;
  /** Skip response cache for this request. */
  noCache?: boolean;
}

async function fetchApi<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { skipAuth: _skipAuth, timeoutMs, noCache, ...fetchOpts } = options;

  // Check cache first for cacheable requests.
  const key = cacheKey(path, options);
  if (!noCache && isCacheable(options.method, path)) {
    const hit = cache.get(key);
    if (hit && hit.expires > Date.now()) return hit.data as T;
  }

  // Deduplicate in-flight requests.
  if (!noCache && pending.has(key)) {
    return pending.get(key) as Promise<T>;
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(fetchOpts.headers as Record<string, string>),
  };

  const promise = (async () => {
    let res: Response;
    try {
      res = await fetch(`${API_BASE}${path}`, {
        ...fetchOpts,
        headers,
        credentials: "include",
        signal: timeoutMs
          ? fetchOpts.signal
            ? AbortSignal.any([fetchOpts.signal, AbortSignal.timeout(timeoutMs)])
            : AbortSignal.timeout(timeoutMs)
          : fetchOpts.signal,
      });
    } catch (err) {
      if (
        err instanceof DOMException &&
        (err.name === "TimeoutError" || err.name === "AbortError")
      ) {
        throw new Error("Request timed out. Please try again.");
      }
      throw new Error("Can't reach the EduVerse server. Is the backend running?");
    }

    let data: { error?: string } & T;
    try {
      data = await res.json();
    } catch {
      throw new Error(`Server returned an invalid response (HTTP ${res.status})`);
    }

    if (!res.ok) {
      throw new Error(data.error || "API request failed");
    }

    // Store in cache for cacheable requests.
    if (!noCache && isCacheable(options.method, path)) {
      cache.set(key, { data, expires: Date.now() + CACHE_TTL });
    }

    return data;
  })();

  // Store pending promise for deduplication.
  if (!noCache) {
    pending.set(key, promise);
    promise.finally(() => pending.delete(key));
  }

  return promise;
}

/**
 * The single HTTP entry point for the app — every network call goes through here (no inline
 * `fetch` lives elsewhere). Stable single-shape entities are typed with `@/types/api`; the
 * remaining `data` payloads are rich, page-specific aggregates that each consuming page models
 * with its own local interface, so api-client stays a thin transport seam for those rather than
 * duplicating those shapes here.
 */
export const api = {
  // Auth
  register: (body: { email: string; username: string; password: string }) =>
    fetchApi<{ success: boolean; data: AuthResponse }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
      skipAuth: true,
    }),

  login: (body: { email: string; password: string }) =>
    fetchApi<{ success: boolean; data: AuthResponse }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
      skipAuth: true,
    }),

  googleAuth: (body: { email: string; username: string; googleId: string }) =>
    fetchApi<{ success: boolean; data: AuthResponse }>("/auth/google", {
      method: "POST",
      body: JSON.stringify(body),
      skipAuth: true,
    }),

  logout: () =>
    fetchApi<{ success: boolean; data: { message: string } }>("/auth/logout", {
      method: "POST",
    }),
  getMe: () => fetchApi<{ success: boolean; data: User }>("/auth/me"),

  // Courses
  getCourses: () => fetchApi<{ success: boolean; data: any[] }>("/courses"),
  getCourse: (id: string) => fetchApi<{ success: boolean; data: any }>(`/courses/${id}`),

  // Lessons
  getLesson: (id: string) => fetchApi<{ success: boolean; data: any }>(`/lessons/${id}`),
  completeLesson: (id: string) =>
    fetchApi<{ success: boolean; data: any }>(`/lessons/${id}/complete`, { method: "POST" }),

  // Code Execution
  executeCode: (body: { code: string; language: string; stdin?: string }) =>
    fetchApi<{ success: boolean; data: CodeExecutionResult }>("/submissions/execute", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  // Battles
  createBattle: (body: { difficulty: string; timeLimit: number }) =>
    fetchApi<{ success: boolean; data: any }>("/battles/create", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  joinBattle: (id: string) =>
    fetchApi<{ success: boolean; data: any }>(`/battles/join/${id}`, { method: "POST" }),
  submitBattle: (body: {
    battleId: string;
    code: string;
    timeTakenMs: number;
    timeLimitMs: number;
  }) =>
    fetchApi<{ success: boolean; data: any }>("/battles/submit", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  getActiveBattles: () => fetchApi<{ success: boolean; data: any[] }>("/battles/active"),
  getBattleHistory: () => fetchApi<{ success: boolean; data: any[] }>("/battles/history"),

  // Leaderboard
  getLeaderboard: (params?: { period?: string; page?: number; limit?: number }) => {
    const search = new URLSearchParams();
    if (params?.period) search.set("period", params.period);
    if (params?.page) search.set("page", String(params.page));
    if (params?.limit) search.set("limit", String(params.limit));
    const qs = search.toString();
    return fetchApi<{ success: boolean; data: any }>(`/leaderboard${qs ? `?${qs}` : ""}`);
  },
  getRank: () => fetchApi<{ success: boolean; data: any }>("/leaderboard/rank"),

  // Shop
  getShopItems: () => fetchApi<{ success: boolean; data: ShopItem[] }>("/shop/items"),
  buyItem: (itemId: string) =>
    fetchApi<{ success: boolean; data: { message: string; item: ShopItem; coins: number } }>(
      `/shop/buy/${itemId}`,
      { method: "POST" },
    ),
  equipItem: (itemId: string) =>
    fetchApi<{ success: boolean; data: UserInventory }>(`/shop/equip/${itemId}`, {
      method: "POST",
    }),
  getInventory: () => fetchApi<{ success: boolean; data: UserInventory[] }>("/shop/inventory"),

  // User
  getProfile: () => fetchApi<{ success: boolean; data: any }>("/user/profile"),
  updateProfile: (body: { username?: string; avatar?: string; bio?: string }) =>
    fetchApi<{ success: boolean; data: any }>("/user/profile", {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  getXpLogs: () => fetchApi<{ success: boolean; data: XpLog[] }>("/user/xp-logs"),

  // Skill Tree
  getSkillTree: () => fetchApi<{ success: boolean; data: SkillTreeNode[] }>("/skilltree"),
  unlockSkill: (nodeId: string) =>
    fetchApi<{ success: boolean; data: any }>(`/skilltree/unlock/${nodeId}`, { method: "POST" }),

  // Adaptive learning (assessment → skill profile → personalized roadmap)
  learningState: (courseId: string) =>
    fetchApi<{ success: boolean; data: any }>(`/learning/${courseId}/state`),
  assessmentStart: (courseId: string) =>
    fetchApi<{ success: boolean; data: { assessmentId: string; questions: any[] } }>(
      `/learning/${courseId}/assessment/start`,
      { method: "POST", body: JSON.stringify({}) },
    ),
  assessmentSubmit: (
    courseId: string,
    body: { assessmentId: string; answers: Record<string, number | string | null> },
  ) =>
    fetchApi<{ success: boolean; data: any }>(`/learning/${courseId}/assessment/submit`, {
      method: "POST",
      body: JSON.stringify(body),
      timeoutMs: AI_TIMEOUT_MS,
    }),
  learningRefresh: (courseId: string) =>
    fetchApi<{ success: boolean; data: any }>(`/learning/${courseId}/refresh`, {
      method: "POST",
      body: JSON.stringify({}),
      timeoutMs: AI_TIMEOUT_MS,
    }),
  lessonQuiz: (lessonId: string, answers: number[]) =>
    fetchApi<{
      success: boolean;
      data: {
        correct: number;
        total: number;
        pct: number;
        passed: boolean;
        xpGained: number;
        results: { correct: boolean; answer: number; explain: string }[];
      };
    }>(`/lessons/${lessonId}/quiz`, {
      method: "POST",
      body: JSON.stringify({ answers }),
    }),

  // AI (all powered by Google AI Studio via the backend AI service)
  aiStatus: () =>
    fetchApi<{ success: boolean; data: { configured: boolean; provider: string } }>("/ai/status"),
  aiMentor: (message: string, history?: { role: string; text: string }[], context?: string) =>
    fetchApi<{ success: boolean; data: { text: string; model: string } }>("/ai/mentor", {
      method: "POST",
      body: JSON.stringify({ message, history, context }),
      timeoutMs: AI_TIMEOUT_MS,
    }),
  aiReview: (code: string, language?: string) =>
    fetchApi<{ success: boolean; data: { text: string; model: string } }>("/ai/review", {
      method: "POST",
      body: JSON.stringify({ code, language }),
      timeoutMs: AI_TIMEOUT_MS,
    }),
  aiHints: (challenge?: string) =>
    fetchApi<{ success: boolean; data: { hints: string[]; text: string; model: string } }>(
      "/ai/hints",
      {
        method: "POST",
        body: JSON.stringify({ challenge }),
        timeoutMs: AI_TIMEOUT_MS,
      },
    ),
  aiChallenge: (topic?: string, difficulty?: string) =>
    fetchApi<{ success: boolean; data: { challenge: any; model: string } }>("/ai/challenge", {
      method: "POST",
      body: JSON.stringify({ topic, difficulty }),
      timeoutMs: AI_TIMEOUT_MS,
    }),
  aiExamGrade: (body: { question: string; answer: string; topic?: string; difficulty?: string }) =>
    fetchApi<{
      success: boolean;
      data: {
        score: number;
        passed: boolean;
        feedback: string;
        strengths: string[];
        improvements: string[];
        model: string;
      };
    }>("/ai/exam/grade", {
      method: "POST",
      body: JSON.stringify(body),
      timeoutMs: AI_TIMEOUT_MS,
    }),
  aiSummary: (body: { title: string; content: string }) =>
    fetchApi<{ success: boolean; data: { summary: string; keyPoints: string[]; model: string } }>(
      "/ai/summary",
      {
        method: "POST",
        body: JSON.stringify(body),
        timeoutMs: AI_TIMEOUT_MS,
      },
    ),
  aiQuiz: (body: { topic?: string; content?: string; count?: number }) =>
    fetchApi<{
      success: boolean;
      data: {
        questions: {
          question: string;
          options: string[];
          answerIndex: number;
          explanation: string;
        }[];
        model: string;
      };
    }>("/ai/quiz", {
      method: "POST",
      body: JSON.stringify(body),
      timeoutMs: AI_TIMEOUT_MS,
    }),
  aiRecommend: () =>
    fetchApi<{
      success: boolean;
      data: {
        focus: string;
        recommendations: { title: string; reason: string; area: string; href: string }[];
        model: string;
      };
    }>("/ai/recommend", {
      method: "POST",
      body: JSON.stringify({}),
      timeoutMs: AI_TIMEOUT_MS,
    }),
  aiExplainError: (body: {
    code: string;
    errorType: string;
    errorMessage: string;
    line?: number;
    language?: string;
  }) =>
    fetchApi<{ success: boolean; data: { text: string; model: string } }>("/ai/explain-error", {
      method: "POST",
      body: JSON.stringify(body),
      timeoutMs: AI_TIMEOUT_MS,
    }),

  // AI Mentor System — global, persistent, cross-course coach (Google AI Studio)
  mentorProfile: (refresh?: boolean) =>
    fetchApi<{ success: boolean; data: MentorProfileData }>(
      `/mentor/profile${refresh ? "?refresh=1" : ""}`,
      {
        timeoutMs: AI_TIMEOUT_MS,
      },
    ),
  mentorSync: () =>
    fetchApi<{ success: boolean; data: MentorProfileData }>("/mentor/sync", {
      method: "POST",
      body: JSON.stringify({}),
      timeoutMs: AI_TIMEOUT_MS,
    }),
  mentorMissions: () =>
    fetchApi<{ success: boolean; data: { daily: Mission[]; weekly: Mission[] } }>(
      "/mentor/missions",
      {
        timeoutMs: AI_TIMEOUT_MS,
      },
    ),
  mentorGenerateMissions: (scope?: "daily" | "weekly") =>
    fetchApi<{ success: boolean; data: { daily?: Mission[]; weekly?: Mission[] } }>(
      `/mentor/missions/generate${scope ? `?scope=${scope}` : ""}`,
      { method: "POST", body: JSON.stringify({}), timeoutMs: AI_TIMEOUT_MS },
    ),
  mentorCompleteMission: (id: string) =>
    fetchApi<{ success: boolean; data: Mission }>(`/mentor/missions/${id}/complete`, {
      method: "POST",
      body: JSON.stringify({}),
    }),
  mentorReport: (refresh?: boolean) =>
    fetchApi<{ success: boolean; data: MentorReportData }>(
      `/mentor/report${refresh ? "?refresh=1" : ""}`,
      {
        timeoutMs: AI_TIMEOUT_MS,
      },
    ),
  mentorChat: (message: string, history?: { role: string; text: string }[]) =>
    fetchApi<{ success: boolean; data: { text: string; model: string } }>("/mentor/chat", {
      method: "POST",
      body: JSON.stringify({ message, history }),
      timeoutMs: AI_TIMEOUT_MS,
    }),

  // Apprentice Mode — teach the AI (protégé effect)
  apprenticeTopics: () =>
    fetchApi<{ success: boolean; data: { maxTurns: number; courses: TeachableCourse[] } }>(
      "/apprentice/topics",
    ),
  apprenticeStart: (body: { topic: string; courseLabel?: string }) =>
    fetchApi<{ success: boolean; data: ApprenticeTurn }>("/apprentice/start", {
      method: "POST",
      body: JSON.stringify(body),
      timeoutMs: AI_TIMEOUT_MS,
    }),
  apprenticeReply: (body: {
    topic: string;
    turns: { role: string; text: string }[];
    turnIndex: number;
  }) =>
    fetchApi<{ success: boolean; data: ApprenticeTurn }>("/apprentice/reply", {
      method: "POST",
      body: JSON.stringify(body),
      timeoutMs: AI_TIMEOUT_MS,
    }),
  apprenticeGrade: (body: {
    topic: string;
    topicKey?: string | null;
    courseSlug?: string | null;
    turns: { role: string; text: string }[];
  }) =>
    fetchApi<{ success: boolean; data: TeachGrade }>("/apprentice/grade", {
      method: "POST",
      body: JSON.stringify(body),
      timeoutMs: AI_TIMEOUT_MS,
    }),

  // Project Studio + public Portfolio
  projectsList: () => fetchApi<{ success: boolean; data: Project[] }>("/projects"),
  projectGet: (id: string) => fetchApi<{ success: boolean; data: Project }>(`/projects/${id}`),
  projectSuggest: (body?: { language?: string; topicHint?: string }) =>
    fetchApi<{ success: boolean; data: Project }>("/projects/suggest", {
      method: "POST",
      body: JSON.stringify(body || {}),
      timeoutMs: AI_TIMEOUT_MS,
    }),
  projectCreate: (body: {
    title: string;
    brief: string;
    language?: string;
    difficulty?: string;
    skills?: string[];
    milestones?: string[];
    starterCode?: string;
  }) =>
    fetchApi<{ success: boolean; data: Project }>("/projects", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  projectUpdate: (id: string, body: { code?: string; milestones?: ProjectMilestone[] }) =>
    fetchApi<{ success: boolean; data: Project }>(`/projects/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  projectPublish: (id: string, published: boolean) =>
    fetchApi<{ success: boolean; data: Project }>(`/projects/${id}/publish`, {
      method: "PATCH",
      body: JSON.stringify({ published }),
    }),
  projectSubmit: (id: string) =>
    fetchApi<{
      success: boolean;
      data: {
        project: Project;
        grade: {
          score: number;
          feedback: string;
          rubric: ProjectRubric[];
          strengths: string[];
          improvements: string[];
          xpAwarded: number;
        };
      };
    }>(`/projects/${id}/submit`, {
      method: "POST",
      body: JSON.stringify({}),
      timeoutMs: AI_TIMEOUT_MS,
    }),
  portfolio: (username: string) =>
    fetchApi<{ success: boolean; data: PortfolioData }>(
      `/projects/portfolio/${encodeURIComponent(username)}`,
      { skipAuth: true },
    ),

  /** Clear the in-memory response cache (call after mutations to force fresh data). */
  clearCache: () => {
    cache.clear();
    pending.clear();
  },
};

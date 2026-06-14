import type { MentorProfileData, Mission, MentorReportData } from "./mentor-types";
import type { ApprenticeTurn, TeachGrade, TeachableCourse } from "./apprentice-types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

/** AI generations can legitimately take a while (model retries included). */
const AI_TIMEOUT_MS = 90_000;

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
  timeoutMs?: number;
}

async function fetchApi<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { skipAuth, timeoutMs, ...fetchOpts } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(fetchOpts.headers as Record<string, string>),
  };

  if (!skipAuth && typeof window !== "undefined") {
    const token = localStorage.getItem("eduverse_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...fetchOpts,
      headers,
      signal: timeoutMs ? AbortSignal.timeout(timeoutMs) : fetchOpts.signal,
    });
  } catch (err) {
    if (err instanceof DOMException && (err.name === "TimeoutError" || err.name === "AbortError")) {
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

  return data;
}

export const api = {
  // Auth
  register: (body: { email: string; username: string; password: string }) =>
    fetchApi<{ success: boolean; data: { user: any; token: string } }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
      skipAuth: true,
    }),

  login: (body: { email: string; password: string }) =>
    fetchApi<{ success: boolean; data: { user: any; token: string } }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
      skipAuth: true,
    }),

  googleAuth: (body: { email: string; username: string; googleId: string }) =>
    fetchApi<{ success: boolean; data: { user: any; token: string } }>("/auth/google", {
      method: "POST",
      body: JSON.stringify(body),
      skipAuth: true,
    }),

  getMe: () => fetchApi<{ success: boolean; data: any }>("/auth/me"),

  // Courses
  getCourses: () => fetchApi<{ success: boolean; data: any[] }>("/courses"),
  getCourse: (id: string) => fetchApi<{ success: boolean; data: any }>(`/courses/${id}`),

  // Lessons
  getLesson: (id: string) => fetchApi<{ success: boolean; data: any }>(`/lessons/${id}`),
  completeLesson: (id: string) =>
    fetchApi<{ success: boolean; data: any }>(`/lessons/${id}/complete`, { method: "POST" }),

  // Code Execution
  executeCode: (body: { code: string; language: string; stdin?: string }) =>
    fetchApi<{ success: boolean; data: any }>("/submissions/execute", {
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
  submitBattle: (body: { battleId: string; code: string; timeTakenMs: number; timeLimitMs: number }) =>
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
  getShopItems: () => fetchApi<{ success: boolean; data: any[] }>("/shop/items"),
  buyItem: (itemId: string) =>
    fetchApi<{ success: boolean; data: { message: string; item: any; coins: number } }>(`/shop/buy/${itemId}`, { method: "POST" }),
  equipItem: (itemId: string) =>
    fetchApi<{ success: boolean; data: any }>(`/shop/equip/${itemId}`, { method: "POST" }),
  getInventory: () => fetchApi<{ success: boolean; data: any[] }>("/shop/inventory"),

  // User
  getProfile: () => fetchApi<{ success: boolean; data: any }>("/user/profile"),
  updateProfile: (body: { username?: string; avatar?: string; bio?: string }) =>
    fetchApi<{ success: boolean; data: any }>("/user/profile", {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  getXpLogs: () => fetchApi<{ success: boolean; data: any[] }>("/user/xp-logs"),

  // Skill Tree
  getSkillTree: () => fetchApi<{ success: boolean; data: any[] }>("/skilltree"),
  unlockSkill: (nodeId: string) =>
    fetchApi<{ success: boolean; data: any }>(`/skilltree/unlock/${nodeId}`, { method: "POST" }),

  // Adaptive learning (assessment → skill profile → personalized roadmap)
  learningState: (courseId: string) =>
    fetchApi<{ success: boolean; data: any }>(`/learning/${courseId}/state`),
  assessmentStart: (courseId: string) =>
    fetchApi<{ success: boolean; data: { assessmentId: string; questions: any[] } }>(
      `/learning/${courseId}/assessment/start`,
      { method: "POST", body: JSON.stringify({}) }
    ),
  assessmentSubmit: (courseId: string, body: { assessmentId: string; answers: Record<string, number | string | null> }) =>
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
      data: { correct: number; total: number; pct: number; passed: boolean; xpGained: number; results: { correct: boolean; answer: number; explain: string }[] };
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
    fetchApi<{ success: boolean; data: { hints: string[]; text: string; model: string } }>("/ai/hints", {
      method: "POST",
      body: JSON.stringify({ challenge }),
      timeoutMs: AI_TIMEOUT_MS,
    }),
  aiChallenge: (topic?: string, difficulty?: string) =>
    fetchApi<{ success: boolean; data: { challenge: any; model: string } }>("/ai/challenge", {
      method: "POST",
      body: JSON.stringify({ topic, difficulty }),
      timeoutMs: AI_TIMEOUT_MS,
    }),
  aiExamGrade: (body: { question: string; answer: string; topic?: string; difficulty?: string }) =>
    fetchApi<{
      success: boolean;
      data: { score: number; passed: boolean; feedback: string; strengths: string[]; improvements: string[]; model: string };
    }>("/ai/exam/grade", {
      method: "POST",
      body: JSON.stringify(body),
      timeoutMs: AI_TIMEOUT_MS,
    }),
  aiSummary: (body: { title: string; content: string }) =>
    fetchApi<{ success: boolean; data: { summary: string; keyPoints: string[]; model: string } }>("/ai/summary", {
      method: "POST",
      body: JSON.stringify(body),
      timeoutMs: AI_TIMEOUT_MS,
    }),
  aiQuiz: (body: { topic?: string; content?: string; count?: number }) =>
    fetchApi<{
      success: boolean;
      data: { questions: { question: string; options: string[]; answerIndex: number; explanation: string }[]; model: string };
    }>("/ai/quiz", {
      method: "POST",
      body: JSON.stringify(body),
      timeoutMs: AI_TIMEOUT_MS,
    }),
  aiRecommend: () =>
    fetchApi<{
      success: boolean;
      data: { focus: string; recommendations: { title: string; reason: string; area: string; href: string }[]; model: string };
    }>("/ai/recommend", {
      method: "POST",
      body: JSON.stringify({}),
      timeoutMs: AI_TIMEOUT_MS,
    }),
  aiExplainError: (body: { code: string; errorType: string; errorMessage: string; line?: number; language?: string }) =>
    fetchApi<{ success: boolean; data: { text: string; model: string } }>("/ai/explain-error", {
      method: "POST",
      body: JSON.stringify(body),
      timeoutMs: AI_TIMEOUT_MS,
    }),

  // AI Mentor System — global, persistent, cross-course coach (Google AI Studio)
  mentorProfile: (refresh?: boolean) =>
    fetchApi<{ success: boolean; data: MentorProfileData }>(`/mentor/profile${refresh ? "?refresh=1" : ""}`, {
      timeoutMs: AI_TIMEOUT_MS,
    }),
  mentorSync: () =>
    fetchApi<{ success: boolean; data: MentorProfileData }>("/mentor/sync", {
      method: "POST",
      body: JSON.stringify({}),
      timeoutMs: AI_TIMEOUT_MS,
    }),
  mentorMissions: () =>
    fetchApi<{ success: boolean; data: { daily: Mission[]; weekly: Mission[] } }>("/mentor/missions", {
      timeoutMs: AI_TIMEOUT_MS,
    }),
  mentorGenerateMissions: (scope?: "daily" | "weekly") =>
    fetchApi<{ success: boolean; data: { daily?: Mission[]; weekly?: Mission[] } }>(
      `/mentor/missions/generate${scope ? `?scope=${scope}` : ""}`,
      { method: "POST", body: JSON.stringify({}), timeoutMs: AI_TIMEOUT_MS }
    ),
  mentorCompleteMission: (id: string) =>
    fetchApi<{ success: boolean; data: Mission }>(`/mentor/missions/${id}/complete`, {
      method: "POST",
      body: JSON.stringify({}),
    }),
  mentorReport: (refresh?: boolean) =>
    fetchApi<{ success: boolean; data: MentorReportData }>(`/mentor/report${refresh ? "?refresh=1" : ""}`, {
      timeoutMs: AI_TIMEOUT_MS,
    }),
  mentorChat: (message: string, history?: { role: string; text: string }[]) =>
    fetchApi<{ success: boolean; data: { text: string; model: string } }>("/mentor/chat", {
      method: "POST",
      body: JSON.stringify({ message, history }),
      timeoutMs: AI_TIMEOUT_MS,
    }),

  // Apprentice Mode — teach the AI (protégé effect)
  apprenticeTopics: () =>
    fetchApi<{ success: boolean; data: { maxTurns: number; courses: TeachableCourse[] } }>("/apprentice/topics"),
  apprenticeStart: (body: { topic: string; courseLabel?: string }) =>
    fetchApi<{ success: boolean; data: ApprenticeTurn }>("/apprentice/start", {
      method: "POST",
      body: JSON.stringify(body),
      timeoutMs: AI_TIMEOUT_MS,
    }),
  apprenticeReply: (body: { topic: string; turns: { role: string; text: string }[]; turnIndex: number }) =>
    fetchApi<{ success: boolean; data: ApprenticeTurn }>("/apprentice/reply", {
      method: "POST",
      body: JSON.stringify(body),
      timeoutMs: AI_TIMEOUT_MS,
    }),
  apprenticeGrade: (body: { topic: string; topicKey?: string | null; courseSlug?: string | null; turns: { role: string; text: string }[] }) =>
    fetchApi<{ success: boolean; data: TeachGrade }>("/apprentice/grade", {
      method: "POST",
      body: JSON.stringify(body),
      timeoutMs: AI_TIMEOUT_MS,
    }),
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
}

async function fetchApi<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { skipAuth, ...fetchOpts } = options;

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

  const res = await fetch(`${API_BASE}${path}`, {
    ...fetchOpts,
    headers,
  });

  const data = await res.json();

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
    fetchApi<{ success: boolean; data: any }>(`/shop/buy/${itemId}`, { method: "POST" }),
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

  // Placement
  getCoursePlacementQuestions: (courseId: string) =>
    fetchApi<{ success: boolean; data: any[] }>(`/placement/${courseId}/questions`),
  submitCoursePlacement: (courseId: string, body: { answers: number[] }) =>
    fetchApi<{ success: boolean; data: any }>(`/placement/${courseId}/submit`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  getPlacementResult: (courseId: string) =>
    fetchApi<{ success: boolean; data: any }>(`/placement/${courseId}/my-result`),

  // AI
  aiMentor: (message: string) =>
    fetchApi<{ success: boolean; data: { text: string } }>("/ai/mentor", {
      method: "POST",
      body: JSON.stringify({ message }),
    }),
  aiReview: (code: string, language?: string) =>
    fetchApi<{ success: boolean; data: { text: string } }>("/ai/review", {
      method: "POST",
      body: JSON.stringify({ code, language }),
    }),
  aiHints: (challenge?: string) =>
    fetchApi<{ success: boolean; data: { text: string } }>("/ai/hints", {
      method: "POST",
      body: JSON.stringify({ challenge }),
    }),
  aiChallenge: (topic?: string, difficulty?: string) =>
    fetchApi<{ success: boolean; data: { challenge: any } }>("/ai/challenge", {
      method: "POST",
      body: JSON.stringify({ topic, difficulty }),
    }),
};

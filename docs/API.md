# API Reference

All endpoints are served by the Express backend under the `/api` prefix
(default base URL `http://localhost:4000`).

## Conventions

- **Format** — JSON request and response bodies. Every response wraps data in
  `{ success: boolean, data?: T, error?: string }`.
- **Auth** — protected endpoints require an `Authorization: Bearer <jwt>`
  header. Obtain a token from `/api/auth/login`, `/api/auth/register`, or
  `/api/auth/google`.
- **Validation** — request bodies are validated; invalid input returns `400`
  with an error description.
- **Rate limiting** — separate limiters for general API, AI endpoints, auth
  attempts, and code execution.
- **CORS** — restricted to the configured `FRONTEND_URL` origin(s) (defaults:
  `localhost:3000-3003`).

> 🔒 = requires authentication.

---

## Health

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/api/health` | — | Liveness probe |

```
Response: { success: true, data: { status: "ok", timestamp: "<ISO>" } }
```

---

## Auth — `/api/auth`

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| POST | `/register` | — | Create an account, returns a JWT |
| POST | `/login` | — | Email/password login, returns a JWT |
| POST | `/google` | — | Google OAuth sign-in, returns a JWT |
| GET | `/me` | 🔒 | Current authenticated user with inventory + skills |

### POST /api/auth/register

```
Request:  { email: string, username: string, password: string }
Response: { success: true, data: { user: User, token: string } }
Errors: 400 (validation), 409 (email/username taken)
```

### POST /api/auth/login

```
Request:  { email: string, password: string }
Response: { success: true, data: { user: User, token: string } }
Errors: 401 (invalid credentials)
```

### POST /api/auth/google

```
Request:  { email: string, username?: string, googleId: string }
Response: { success: true, data: { user: User, token: string } }
Errors: 501 (Google sign-in not configured)
```

### GET /api/auth/me

```
Response: { success: true, data: User & { inventory: UserInventory[], skills: UserSkill[] } }
```

---

## Courses — `/api/courses`

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/` | 🔒 | List all courses with lesson outlines |
| GET | `/:id` | 🔒 | Course detail with lessons + user completion state |

### GET /api/courses/:id

Each lesson includes `completed: boolean` merged from `UserProgress`.

---

## Lessons — `/api/lessons`

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/:id` | 🔒 | Lesson detail (content, template, quiz without answers) |
| POST | `/:id/complete` | 🔒 | Mark a lesson complete; awards XP/coins |
| POST | `/:id/quiz` | 🔒 | Submit a quiz checkpoint |

### GET /api/lessons/:id

```
Response: { success: true, data: {
  ...Lesson, topics: string[], quiz: { q: string, options: string[] }[],
  courseSlug: string, completed: boolean, score: number | null
} }
```

Quiz answers are stripped — only questions and options are sent to the client.

### POST /api/lessons/:id/complete

```
Request:  (no body required)
Response: { success: true, data: { xpGained: number, coins: number, ... } }
```

Triggers continuous adaptation (rule-based, no AI cost) and advances active
mentor missions.

### POST /api/lessons/:id/quiz

```
Request:  { answers: number[] }
Response: { success: true, data: { correct: number, total: number, pct: number,
           passed: boolean, results: { correct: boolean, answer: number, explain: string }[],
           xpGained: number } }
Errors: 404 (no quiz on this lesson), 400 (wrong number of answers)
```

Passing threshold: 66%. Bonus XP for first-time passes (100% = 25, pass = 15).

---

## Submissions — `/api/submissions`

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| POST | `/execute` | 🔒 | Execute submitted code (C++ via Judge0) |

```
Request:  { code: string, language: string, stdin?: string }
Response: { success: true, data: { stdout: string, stderr: string, exitCode: number } }
```

Subject to code-execution rate limiter.

---

## Learning (adaptive) — `/api/learning`

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/:courseId/state` | 🔒 | Skill profile + roadmap + assessment state for a course |
| POST | `/:courseId/assessment/start` | 🔒 | Start a placement assessment |
| POST | `/:courseId/assessment/submit` | 🔒 | Submit answers; builds mastery profile + roadmap |
| POST | `/:courseId/refresh` | 🔒 | Regenerate the personalized roadmap |

### GET /api/learning/:courseId/state

```
Response: { success: true, data: {
  assessed: boolean, questionCount: number, topics: string[],
  assessment: { id, score, total, level, completedAt, analysis } | null,
  profile: { level, mastery, strengths, weaknesses, updatedAt } | null,
  roadmap: { items, focus, estMinutes, version, updatedAt } | null
} }
```

### POST /api/learning/:courseId/assessment/start

```
Response: { success: true, data: { assessmentId: string, questions: PlacementQuestion[] } }
```

### POST /api/learning/:courseId/assessment/submit

```
Request:  { assessmentId: string, answers: Record<string, number | string | null> }
Response: { success: true, data: {
  level: string, score: number, total: number, scorePct: number,
  summary: string, strengths: string[], weaknesses: string[],
  masteredTopics: string[], missingTopics: string[],
  mastery: object, codeFeedback: object,
  roadmap: { items, focus, estMinutes, version },
  xp: { xpGained, coins }
} }
```

Triggers AI analysis to determine level, narrate strengths/weaknesses, and
generate a personalized roadmap with lesson skip justifications.

### POST /api/learning/:courseId/refresh

Regenerates the roadmap based on the latest activity and profile. No new
assessment required.

---

## Mentor (AI Coach) — `/api/mentor`

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/profile` | 🔒 | Cross-course mentor profile (cached; pass `?refresh=1` to force) |
| POST | `/sync` | 🔒 | Force recompute the mentor profile |
| GET | `/missions` | 🔒 | Active daily/weekly missions |
| POST | `/missions/generate` | 🔒 | Generate new AI missions (`?scope=daily\|weekly`) |
| POST | `/missions/:id/complete` | 🔒 | Manually complete a mission; awards XP |
| GET | `/report` | 🔒 | Latest weekly report (`?refresh=1` to force) |
| POST | `/report/generate` | 🔒 | Generate this week's report |
| POST | `/chat` | 🔒 | Profile-aware mentor chat |

### GET /api/mentor/profile

```
Response: { success: true, data: {
  summary, motivation, focus,
  strengths: string[], weaknesses: string[],
  insights: object[], recommendations: object[], projects: object[],
  learningSpeed, retention: number, momentum: number,
  metrics: object, version: number, lastSyncedAt
} }
```

### GET /api/mentor/missions

```
Response: { success: true, data: {
  daily: Mission[], weekly: Mission[]
} }
```

### POST /api/mentor/chat

```
Request:  { message: string, history?: { role: string, text: string }[] }
Response: { success: true, data: { text: string, model: string } }
```

---

## Apprentice (teach-the-AI) — `/api/apprentice`

The "protégé effect" feature — learners teach an AI named Pip.

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/topics` | 🔒 | Topics available to teach, grouped by course |
| POST | `/start` | 🔒 | Start a teaching session with Pip |
| POST | `/reply` | 🔒 | Continue the dialogue |
| POST | `/grade` | 🔒 | Grade how well the user taught; awards XP |

### POST /api/apprentice/start

```
Request:  { topic: string, courseLabel?: string }
Response: { success: true, data: { role, text, turnIndex, maxTurns } }
```

### POST /api/apprentice/reply

```
Request:  { topic: string, turns: { role: string, text: string }[], turnIndex: number }
Response: { success: true, data: { role, text, turnIndex } }
```

### POST /api/apprentice/grade

```
Request:  { topic: string, turns: { role: string, text: string }[], topicKey?: string, courseSlug?: string }
Response: { success: true, data: { score, feedback, strengths, improvements, xpGained } }
```

Maximum 20 turns per session. At least one mentor turn required before grading.

---

## Projects (Studio + Portfolio) — `/api/projects`

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/portfolio/:username` | — | Public portfolio for a user |
| GET | `/` | 🔒 | List the user's projects |
| POST | `/suggest` | 🔒 | AI-suggest a project based on user's level |
| POST | `/` | 🔒 | Create a custom project |
| GET | `/:id` | 🔒 | Project detail |
| PATCH | `/:id` | 🔒 | Update project code or milestones |
| PATCH | `/:id/publish` | 🔒 | Toggle portfolio visibility |
| POST | `/:id/submit` | 🔒 | Submit for AI review and grading |

### POST /api/projects (create custom)

```
Request:  { title: string, brief: string, language?: string, difficulty?: string,
           skills?: string[], milestones?: string[], starterCode?: string }
Response: { success: true, data: Project }
```

### POST /api/projects/suggest

```
Request:  { language?: string, topicHint?: string }
Response: { success: true, data: Project }  (auto-created from AI suggestion)
```

### POST /api/projects/:id/submit

Triggers AI grading: score (0-100), feedback, rubric, strengths, improvements,
and XP award.

---

## AI endpoints — `/api/ai`

Lower-level AI utilities consumed by lesson and codelab panels. All require
authentication and use the AI rate limiter.

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/status` | 🔒 | AI service availability + provider name |
| POST | `/mentor` | 🔒 | One-off mentor prompt with optional context |
| POST | `/review` | 🔒 | AI code review (score + line-level issues) |
| POST | `/hints` | 🔒 | 3 progressive hints for a challenge |
| POST | `/challenge` | 🔒 | Generate a coding challenge |
| POST | `/exam/grade` | 🔒 | Grade an exam answer (0-10 score) |
| POST | `/summary` | 🔒 | Summarize lesson content |
| POST | `/quiz` | 🔒 | Generate multiple-choice quiz questions |
| POST | `/recommend` | 🔒 | Personalized next-step recommendations |
| POST | `/explain-error` | 🔒 | Explain a runtime/compile error |

### GET /api/ai/status

```
Response: { success: true, data: { configured: boolean, provider: "google-ai-studio" } }
```

### POST /api/ai/review

```
Request:  { code: string, language?: string }
Response: { success: true, data: { text: string, model: string } }
```

Text includes "Score: N/10" on the first line, followed by issues and positive
observations.

### POST /api/ai/hints

```
Request:  { challenge: string }
Response: { success: true, data: { hints: string[], text: string, model: string } }
```

Returns exactly 3 hints with increasing specificity.

### POST /api/ai/exam/grade

```
Request:  { question: string, answer: string, topic?: string, difficulty?: string }
Response: { success: true, data: { score: number, passed: boolean, feedback: string,
           strengths: string[], improvements: string[], model: string } }
```

Passing threshold: score >= 7.

### POST /api/ai/recommend

```
Response: { success: true, data: {
  focus: string,
  recommendations: { title: string, reason: string, area: string, href: string }[],
  model: string
} }
```

Grounded in the user's actual progress data — course completion, skills
unlocked, battles played.

### POST /api/ai/explain-error

```
Request:  { errorMessage: string, code?: string, errorType?: string, line?: number, language?: string }
Response: { success: true, data: { text: string, model: string } }
```

---

## Battles — `/api/battles`

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| POST | `/create` | 🔒 | Create a battle (waiting for opponent) |
| POST | `/join/:id` | 🔒 | Join a waiting battle |
| POST | `/submit` | 🔒 | Submit a battle solution |
| GET | `/active` | 🔒 | Active/waiting battles for the current user |
| GET | `/history` | 🔒 | Past battles (last 20) |

### POST /api/battles/create

```
Request:  { difficulty: string, timeLimit: number }
Response: { success: true, data: Battle }
```

### POST /api/battles/join/:id

```
Response: { success: true, data: Battle }
```

### POST /api/battles/submit

```
Request:  { battleId: string, code: string, timeTakenMs: number, timeLimitMs: number }
Response: { success: true, data: { winner, score, xpGained } }
```

---

## Skill Tree — `/api/skilltree`

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/` | 🔒 | All skill tree nodes + per-user unlock state |
| POST | `/unlock/:nodeId` | 🔒 | Unlock a skill node (spends XP) |

### POST /api/skilltree/unlock/:nodeId

```
Response: { success: true, data: { message: string, effect: { type: string, value: number } } }
Errors: 400 (level too low, not enough XP, prerequisites not met, already unlocked), 404 (node not found)
```

---

## Leaderboard — `/api/leaderboard`

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/` | — | Leaderboard standings (paginated) |
| GET | `/rank` | 🔒 | The current user's rank + score |

### GET /api/leaderboard

```
Query:    ?period=all|weekly&page=1&limit=50
Response: { success: true, data: {
  entries: { id, userId, username, avatar, level, xp, score, rank }[],
  total: number, page: number, limit: number
} }
```

### GET /api/leaderboard/rank

```
Response: { success: true, data: { rank: number, score: number } }
```

---

## Shop — `/api/shop`

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/items` | — | Available shop items (sorted by price) |
| GET | `/inventory` | 🔒 | The user's owned items |
| POST | `/buy/:itemId` | 🔒 | Buy an item (spends coins, not XP) |
| POST | `/equip/:itemId` | 🔒 | Equip an owned item |

### POST /api/shop/buy/:itemId

```
Response: { success: true, data: { message: string, item: ShopItem, coins: number } }
Errors: 400 (level too low, not enough coins, already owned), 404 (item not found)
```

Uses a Prisma `$transaction` to prevent double-spending.

### POST /api/shop/equip/:itemId

Unships any currently equipped item of the same type before equipping the new
one.

---

## User — `/api/user`

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/profile` | 🔒 | Full user profile (progress, inventory, skills, XP logs) |
| PUT | `/profile` | 🔒 | Update profile (username, bio, avatar) |
| GET | `/xp-logs` | 🔒 | XP history (last 50 entries) |

### GET /api/user/profile

```
Response: { success: true, data: User & {
  progress: UserProgress[], inventory: UserInventory[],
  skills: UserSkill[], xpLogs: XpLog[]
} }
```

### PUT /api/user/profile

```
Request:  { username?: string, bio?: string, avatar?: string }
Response: { success: true, data: User }
Errors: 400 (validation), 409 (username taken)
```

---

## Response shapes

### User

```json
{
  "id": "uuid",
  "email": "string",
  "username": "string",
  "avatar": "string",
  "bio": "string | null",
  "level": 1,
  "xp": 0,
  "coins": 0,
  "rank": 0,
  "placementLevel": "beginner | intermediate | advanced",
  "createdAt": "ISO date",
  "updatedAt": "ISO date"
}
```

### Error response

```json
{
  "success": false,
  "error": "Human-readable error message"
}
```

---

> This reference is generated from the route definitions in
> `backend/src/routes/`. When you add or change a route, update this file in the
> same PR.

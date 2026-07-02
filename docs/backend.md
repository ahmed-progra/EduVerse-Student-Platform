# Backend Architecture

The EduVerse backend is an **Express 5** REST API written in **TypeScript**,
using **Prisma ORM** with **PostgreSQL** (Supabase) and a **SQLite** local mirror.

---

## Tech Stack

| Technology            | Purpose                                |
| --------------------- | -------------------------------------- |
| Express 5             | HTTP framework                         |
| TypeScript            | Type safety                            |
| Prisma 6              | ORM with PostgreSQL and SQLite support |
| PostgreSQL (Supabase) | Production database                    |
| SQLite                | Local development mirror               |
| Jsonwebtoken          | JWT authentication                     |
| Bcryptjs              | Password hashing                       |
| Google AI Studio SDK  | Gemini AI integration                  |
| Express Rate Limit    | API rate limiting                      |

---

## Project Structure

```
backend/
├── src/
│   ├── index.ts                # Express app bootstrap
│   ├── routes/                 # 15 route groups
│   │   ├── auth.ts             # Register, login, Google OAuth, me
│   │   ├── courses.ts          # Course catalog
│   │   ├── lessons.ts          # Lesson content, complete, quiz
│   │   ├── submissions.ts      # Code execution (Judge0)
│   │   ├── battles.ts          # Battle arena CRUD
│   │   ├── leaderboard.ts      # Rankings
│   │   ├── shop.ts             # Items, buy, equip, inventory
│   │   ├── user.ts             # Profile, XP logs
│   │   ├── skilltree.ts        # Tree, unlock nodes
│   │   ├── ai.ts               # Mentor, review, hints, challenge, quiz, etc.
│   │   ├── learning.ts         # Adaptive learning assessment
│   │   ├── mentor.ts           # Mentor profile, missions, reports
│   │   ├── apprentice.ts       # Teach-the-AI
│   │   ├── health.ts            # Liveness probe
│   │   └── projects.ts         # Project studio + portfolio
│   ├── services/               # Business logic
│   │   ├── ai-service.ts       # Gemini gateway (retry, fallback, JSON mode)
│   │   ├── learning-service.ts # Adaptive engine (assessment, mastery, roadmap)
│   │   ├── mentor-service.ts   # AI Mentor (profile, missions, reports)
│   │   ├── apprentice-service.ts # Pip persona (teach-the-AI)
│   │   ├── project-service.ts  # Project CRUD + AI grading
│   │   ├── xp-service.ts       # XP, coins, level, leaderboard
│   │   ├── battle-service.ts   # Battle orchestration
│   │   └── judge0.ts           # Judge0 code execution client
│   ├── middleware/
│   │   ├── auth.ts             # JWT verification (requireAuth / optionalAuth)
│   │   └── rate-limit.ts       # Rate limiters (api, auth, code, ai)
│   ├── learning/
│   │   ├── topics.ts           # Canonical topic catalogs per course
│   │   └── assessment-banks.ts # Placement question banks
│   └── lib/
│       ├── prisma.ts           # PrismaClient singleton
│       ├── jwt.ts              # JWT sign/verify helpers
│       ├── validate.ts         # Input validation utilities
│       └── cache.ts            # In-memory TTL cache
├── curriculum/                 # Authored lesson content (172 lessons, 7 courses)
│   ├── index.ts                # COURSES array aggregator
│   ├── types.ts                # LessonDef, renderLesson(), helpers
│   ├── python-a.ts / python-b.ts  # Python (36 lessons)
│   ├── html-a.ts / html-b.ts       # HTML (26 lessons)
│   ├── css-a.ts / css-b.ts         # CSS (28 lessons)
│   ├── cpp-a.ts / cpp-b.ts         # C++ (34 lessons)
│   ├── math.ts                     # Mathematics (16 lessons)
│   ├── physics.ts                  # Physics (16 lessons)
│   └── science.ts                  # Science (16 lessons)
├── prisma/
│   ├── schema.prisma           # PostgreSQL schema
│   ├── schema.sqlite.prisma    # SQLite mirror schema
│   └── migrations/             # 7 migration sets
└── scripts/                    # E2E test suites + seed
    ├── seed.ts                 # Database seeder
    ├── learning-e2e.mjs        # Adaptive learning tests
    ├── mentor-e2e.mjs          # AI Mentor tests
    ├── apprentice-e2e.mjs      # Apprentice tests
    ├── projects-e2e.mjs        # Project Studio tests
    ├── teachback-e2e.mjs       # Teach-back tests
    └── ai-e2e.mjs              # AI endpoint tests
```

---

## Middleware Stack

The Express app applies middleware in this order:

1. **CORS** — Restricted to `FRONTEND_URL` (default: `http://localhost:3000`)
2. **Security headers** — `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`
3. **JSON body parser** — 4 MB limit
4. **Global rate limiter** — 100 requests per minute
5. **Route-level middleware** — Auth verification, domain-specific rate limits

---

## API Routes

| Group       | Path               | Auth     | Rate Limit               |
| ----------- | ------------------ | -------- | ------------------------ |
| Auth        | `/api/auth`        | Varies   | 10/min (register, login) |
| Courses     | `/api/courses`     | Required | Global                   |
| Lessons     | `/api/lessons`     | Required | Global                   |
| Submissions | `/api/submissions` | Required | 20/min (code exec)       |
| AI          | `/api/ai`          | Required | 30/min                   |
| Learning    | `/api/learning`    | Required | 30/min (assessment)      |
| Mentor      | `/api/mentor`      | Required | 30/min                   |
| Apprentice  | `/api/apprentice`  | Required | 30/min                   |
| Projects    | `/api/projects`    | Varies   | 30/min (AI)              |
| Battles     | `/api/battles`     | Required | Global                   |
| Leaderboard | `/api/leaderboard` | Public   | Global                   |
| Shop        | `/api/shop`        | Varies   | Global                   |
| User        | `/api/user`        | Required | Global                   |
| Skill Tree  | `/api/skilltree`   | Required | Global                   |

Full endpoint reference: [api.md](api.md)

---

## AI Service Architecture

The AI service (`services/ai-service.ts`) is a centralized gateway to Google AI Studio (Gemini):

```
Client → Route → Service → ai-service.ts → Gemini API
                          ↓
                    Retry (3x, exponential backoff)
                    Model fallback (2.5-flash → 2.0-flash → flash-latest)
                    JSON parsing (loose parser for Gemini output)
                    Input clamping (prevents oversized payloads)
                    Deterministic fallbacks (degrade gracefully)
```

### Exported functions

- `generateText(prompt, options)` — Plain text generation
- `generateJSON(prompt, options)` — Structured JSON generation
- `parseJsonLoose(text)` — Lenient JSON extraction from model output
- `clampText(text, maxChars)` — Truncate input to fit context window

### Higher-level services that use AI

| Service              | AI Usage                                                                         | Fallback Behavior                   |
| -------------------- | -------------------------------------------------------------------------------- | ----------------------------------- |
| `mentor-service`     | Profile analysis, mission generation, weekly reports, chat                       | Rule-based missions, cached profile |
| `apprentice-service` | Pip dialogue and grading                                                         | Deterministic grading fallback      |
| `learning-service`   | Assessment analysis, roadmap generation                                          | Rule-based placement                |
| `project-service`    | Project suggestion, rubric grading                                               | Template-based suggestions          |
| `routes/ai.ts`       | Code review, hints, challenge, quiz, summary, recommendations, error explanation | Static fallback responses           |

---

## Authentication Flow

1. User registers or logs in via `/api/auth`
2. Backend hashes password (bcrypt) and stores user record
3. Backend signs a JWT (7-day expiry) with user ID
4. Backend sets the JWT as an **httpOnly, `SameSite` cookie** (not readable by JavaScript)
5. The browser sends the cookie automatically on every request (`credentials: "include"`)
6. `auth` middleware verifies the token and attaches `req.userId`
7. Protected routes use `req.userId` for user-scoped queries

Full reference: [authentication.md](authentication.md)

---

## Database Layer

- **PrismaClient** is instantiated as a singleton via `lib/prisma.ts`
- Two schema files: PostgreSQL (production) and SQLite (local dev)
- 7 migration sets covering initial schema through project studio
- JSON columns used for flexible data (topics, quizzes, mentor profiles)

Full reference: [database.md](database.md)

---

## Curriculum System

Authored lesson content lives in `curriculum/`. Each file exports lesson
definitions using:

- `LessonDef` interface — title, content, code template, quiz questions, topics
- `renderLesson()` — Converts structured data to HTML for database storage
- `L()` — Helper to create a lesson
- `q()` — Helper to create a quiz question

The `index.ts` file aggregates all lessons into the `COURSES` array consumed
by the seed script.

---

## Scripts

| Script                         | Purpose                                                          |
| ------------------------------ | ---------------------------------------------------------------- |
| `scripts/seed.ts`              | Main database seeder (courses, lessons, users, shop, skill tree) |
| `scripts/seed-fast.ts`         | Faster seed variant (skips verification)                         |
| `scripts/seed-courses-only.ts` | Seeds only course/lesson data                                    |
| `scripts/learning-e2e.mjs`     | E2E test for adaptive learning                                   |
| `scripts/mentor-e2e.mjs`       | E2E test for AI mentor                                           |
| `scripts/apprentice-e2e.mjs`   | E2E test for apprentice                                          |
| `scripts/projects-e2e.mjs`     | E2E test for project studio                                      |
| `scripts/teachback-e2e.mjs`    | E2E test for teach-back missions                                 |
| `scripts/ai-e2e.mjs`           | E2E test for AI endpoints                                        |

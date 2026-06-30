# Architecture

EduVerse is a TypeScript monorepo with three npm workspaces: a Next.js frontend,
an Express backend, and a small shared-types package. The backend owns all
persistence and AI orchestration; the frontend is a pure client of the REST API.

## High-level diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                          Browser                                  │
│  Next.js App Router (React 19)                                    │
│  ├─ src/app/*          route segments (dashboard, lessons, …)     │
│  ├─ src/components/*   UI, layout, and feature panels             │
│  ├─ src/stores/*       Zustand (auth store)                       │
│  ├─ src/services/api-client.ts     typed fetch client → backend               │
│  └─ Skulpt / iframe    in-browser code execution (Python / HTML)  │
└──────────────────┬───────────────────────────────────────────────┘
                   │  HTTPS  (JWT in Authorization header)
                   ▼
┌──────────────────────────────────────────────────────────────────┐
│                     Backend — Express 5                           │
│  src/index.ts          app bootstrap, CORS, rate limit            │
│  ├─ middleware/*       auth (JWT), rate-limit                    │
│  ├─ routes/*           15 routers under /api/*                    │
│  ├─ services/*         business logic + AI orchestration          │
│  ├─ learning/*         topic catalogs, assessment banks           │
│  ├─ curriculum/*       172 authored lessons, 7 courses (seed)     │
│  └─ lib/*              prisma client, jwt, validate, cache         │
└──────┬───────────────────────────────┬───────────────────────────┘
       │ Prisma ORM                    │ HTTPS
       ▼                               ▼
┌────────────────────┐       ┌──────────────────────────────────┐
│ PostgreSQL          │       │ External services                │
│ (via DATABASE_URL)  │       │ • Google AI Studio (Gemini API)  │
│ pooled + direct URL │       │ • Judge0 (C++ code execution)    │
└────────────────────┘       └──────────────────────────────────┘
```

## Workspaces

| Workspace   | Package              | Responsibility                                                                |
| ----------- | -------------------- | ----------------------------------------------------------------------------- |
| `frontend/` | `@eduverse/frontend` | Next.js App Router UI, client-side code execution                             |
| `backend/`  | `@eduverse/backend`  | REST API, persistence, AI orchestration                                       |
| `shared/`   | `@eduverse/shared`   | Types shared across the boundary (`User`, `Course`, `Lesson`, `Battle`, etc.) |

The root `package.json` ties them together with npm workspaces and orchestrates
dev/build via `concurrently`. The shared package is built first, then backend
and frontend can compile independently.

## Frontend

- **Routing** — Next.js App Router. Each folder under `src/app/` is a route
  segment; dynamic segments use `[id]` / `[username]`. Pages are mostly client
  components that fetch from the API.
- **State** — Zustand for auth (`src/stores/auth-store.ts`); most feature state
  is local to the route or fetched on demand.
- **API access** — a single typed client in `src/lib/api.ts` attaches the JWT
  and centralizes base-URL handling.
- **Components** are grouped by domain: `ui/` (primitives), `layout/`, and
  feature folders (`mentor/`, `apprentice/`, `lessons/`, `visualizer/`, …).
- **Code execution** happens client-side where possible: Skulpt steps through
  Python with live variable state; HTML/CSS render in a sandboxed iframe. C++ is
  delegated to the backend via Judge0.
- **Design system** — the warm "Code Sorcery" theme; tokens live in
  `src/app/globals.css`, documented in [design-system.md](design-system.md).

## Backend

The backend is a thin, layered Express app:

1. **`index.ts`** — configures CORS (restricted to `FRONTEND_URL`), JSON body
   limit (4 MB), security headers, and a global rate limiter, then mounts 14
   routers under `/api/*`.
2. **Middleware** — `auth` verifies the JWT and attaches the user to `req.userId`;
   `rate-limit` protects the API surface with domain-specific limiters (auth,
   AI, code execution).
3. **Routes** — each router validates input and delegates to a service. Routers
   stay thin; they do not contain business logic.
4. **Services** — the real work: `ai-service` (Gemini orchestration),
   `learning-service`, `mentor-service`, `apprentice-service`,
   `project-service`, `xp-service`, `battle-service`, plus `judge0`.
5. **Data** — Prisma is the only path to PostgreSQL (`lib/prisma.ts`). The
   client is a singleton to avoid connection exhaustion in development.

See [API.md](API.md) for the endpoint catalog and [DATABASE.md](DATABASE.md) for
the schema.

## The AI layer

Every AI feature flows through one hardened service, `services/ai-service.ts`,
which talks to **Google AI Studio (Gemini API)**. The service provides:

- a single configured model (default `gemini-2.5-flash`, overridable via
  `GOOGLE_AI_MODEL`);
- retries with exponential backoff and model fallback on transient failures;
- **deterministic fallbacks** so a feature degrades gracefully (rather than
  erroring) when the API is unavailable or quota-limited;
- plain-text and strict-JSON generation modes;
- input clamping so oversized lesson content can't blow up requests;
- structured logging for every call and failure.

Higher-level services (mentor, apprentice, learning, projects) compose prompts,
ground them in the learner's real activity pulled from the database, and persist
structured results. JSON-shaped AI output is stored in `String` columns by
convention — see [DATABASE.md](DATABASE.md#json-columns).

The AI route module (`routes/ai.ts`) exposes lower-level utilities consumed by
lesson and codelab panels: code review, progressive hints, challenge generation,
exam grading, lesson summaries, quiz generation, personalized recommendations,
and error explanations. Each endpoint has a dedicated system prompt.

## Code execution

| Language   | Where it runs    | How                                                      |
| ---------- | ---------------- | -------------------------------------------------------- |
| Python     | Browser          | Skulpt — stepped execution with live variable/heap state |
| HTML / CSS | Browser          | Sandboxed `<iframe>` live preview                        |
| C++        | Backend → Judge0 | `services/judge0.ts` submits to the Judge0 CE API        |

## Authentication

- **Email/password** — bcrypt-hashed passwords, validated with zod-level checks.
- **Google OAuth** — `POST /api/auth/google` links a Google ID to an existing
  account or creates a new one (requires `GOOGLE_CLIENT_ID` to be configured).
- On success the backend issues a signed JWT (`JWT_SECRET`, expires in 7 days).
- The frontend stores it (localStorage) and sends it as a Bearer token; the
  `auth` middleware guards protected routes.

## Request lifecycle (example: completing a lesson)

```
POST /api/lessons/:id/complete  (Bearer JWT)
  → rate-limit → auth (resolve user to req.userId)
  → lessons route validates params (zod)
  → upsert UserProgress row (userId + lessonId)
  → xp-service awards XP/coins, logs to XpLog
  → recordEvent → learning-service adaptAfterEvent (rule-based)
  → syncMissionProgress → mentor-service advances active missions
  → JSON result returned to the client
```

## Build & deploy shape

```
npm run build          # builds shared → backend → frontend in order
npm run dev            # concurrently runs backend (tsx watch) + frontend (next dev)
npm run start          # runs compiled backend (node dist/index.js)
npm run db:migrate     # applies Prisma migrations to PostgreSQL
npm run db:seed        # seeds courses, 172 lessons, shop items, skill tree, demo user
```

- The backend compiles to `backend/dist` and runs with `node dist/index.js`.
- The frontend is a standard Next.js build.
- PostgreSQL is expected at `DATABASE_URL` / `DIRECT_URL` (Supabase-compatible).
- `docker-compose.yml` provides local PostgreSQL and Judge0 for self-hosting.

## Key design decisions

### Why a monorepo?

Three workspaces let the shared types package be a single source of truth across
the boundary. Shared types, not shared runtime code — each service compiles
independently and can be deployed separately.

### Why PostgreSQL?

Relational integrity matters for a gamified learning platform: XP must not
double-spend, leaderboard ranks must be consistent, and composite keys across
join tables enforce referential constraints. Prisma abstracts the dialect and
provides type-safe queries.

### Why Google AI Studio (Gemini)?

Gemini offers a generous free tier, low-latency responses, and structured JSON
output. The ai-service layer abstracts the provider behind a stable interface,
making it straightforward to swap providers if needed.

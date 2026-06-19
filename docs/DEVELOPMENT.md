# Development Guide

This guide covers local setup, environment configuration, available scripts,
tests, and troubleshooting.

## Prerequisites

- **Node.js 20+** (see [`.nvmrc`](../.nvmrc) — run `nvm use`)
- **npm 10+**
- A **PostgreSQL** database. The project targets **Supabase**; any PostgreSQL 14+
  works, and `docker-compose.yml` can spin one up locally.
- A **Google AI Studio** API key for AI features —
  <https://aistudio.google.com/apikey>
- *(Optional)* A **Judge0** endpoint/key for C++ execution.

## 1. Clone & install

```bash
git clone https://github.com/ragnarlufe/eduverse.git
cd eduverse
npm install        # installs all workspaces (frontend, backend, shared)
```

## 2. Configure environment

The backend reads `backend/.env` (and falls back to the repo-root `.env`).
Copy the template and fill in your values:

```bash
cp .env.example backend/.env
```

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | ✅ | App connection (Supabase transaction pooler, `:6543`) |
| `DIRECT_URL` | ✅ | Migration connection (session pooler, `:5432`) |
| `JWT_SECRET` | ✅ | Signing secret — **change it** for any deployment |
| `JWT_EXPIRES_IN` | — | Token lifetime (default `7d`) |
| `PORT` | — | Backend port (default `4000`) |
| `FRONTEND_URL` | — | Allowed CORS origin (default `http://localhost:3000`) |
| `GOOGLE_AI_API_KEY` | ✅ (AI) | Google AI Studio key |
| `GOOGLE_AI_MODEL` | — | Override the default `gemini-2.5-flash` |
| `JUDGE0_URL` / `JUDGE0_API_KEY` / `JUDGE0_HOST` | — | C++ execution |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | — | Google OAuth sign-in |

> Secrets live only in gitignored `.env` files and are never committed.

## 3. Set up the database

```bash
cd backend
npx prisma generate     # generate the Prisma client
npx prisma db push      # create tables (or: npx prisma migrate dev)
npm run db:seed         # seed courses, lessons, shop, skill tree, demo user
```

This creates the demo account: **demo@eduverse.dev** / **demo1234**.

## 4. Run

From the repo root (runs backend + frontend together):

```bash
npm run dev
```

- Frontend → <http://localhost:3000>
- Backend API → <http://localhost:4000>
- Health check → <http://localhost:4000/api/health>

Or run them individually:

```bash
npm run dev:backend     # tsx watch on src/index.ts
npm run dev:frontend    # next dev
```

## Available scripts

### Root

| Script | Description |
| --- | --- |
| `npm run dev` | Backend + frontend together |
| `npm run build` | Build `shared → backend → frontend` |
| `npm run start` | Start the compiled backend |
| `npm run typecheck` | `tsc --noEmit` across all workspaces |
| `npm run format` / `format:check` | Prettier write / verify |
| `npm run db:generate` | Generate the Prisma client |
| `npm run db:migrate` | Apply migrations |
| `npm run db:seed` | Seed the database |
| `npm run db:setup` | Migrate + seed |
| `npm run test:e2e` | Run all backend E2E suites |

### Backend (`-w backend`)

`dev`, `build`, `start`, `typecheck`, `db:generate`, `db:migrate`, `db:seed`,
`db:reset` (destructive), `test:e2e`.

### Frontend (`-w frontend`)

`dev`, `build`, `start`, `typecheck`.

## Tests

End-to-end suites run against a **live backend** and the **real Gemini API**, so
start the backend and configure `GOOGLE_AI_API_KEY` first:

```bash
cd backend
node scripts/learning-e2e.mjs     # adaptive learning
node scripts/mentor-e2e.mjs       # AI Coach + missions
node scripts/apprentice-e2e.mjs   # teach-the-AI
node scripts/projects-e2e.mjs     # Project Studio + portfolio
node scripts/teachback-e2e.mjs    # teach-back grading
node scripts/ai-e2e.mjs           # AI endpoints
# or all at once:
npm run test:e2e
```

## Continuous integration

[`.github/workflows/ci.yml`](../.github/workflows/ci.yml) runs on every push/PR
to `main`: install → generate Prisma client → type-check all workspaces →
validate the Prisma schema. Keep `npm run typecheck` green before opening a PR.

## Project structure

```
eduverse/
├── backend/
│   ├── src/
│   │   ├── routes/         14 Express routers (/api/*)
│   │   ├── services/       business logic + AI orchestration
│   │   ├── middleware/     auth (JWT), rate-limit
│   │   ├── learning/       topic catalogs + assessment banks
│   │   └── lib/            prisma client, jwt, zod validate
│   ├── curriculum/         124+ authored lessons (seed source)
│   ├── prisma/             schema + migrations
│   ├── scripts/            *-e2e.mjs end-to-end suites
│   └── seed.ts             database seeder
├── frontend/
│   └── src/
│       ├── app/            App Router route segments
│       ├── components/     ui, layout, and feature panels
│       ├── hooks/          reusable React hooks
│       ├── lib/            api client, types, helpers
│       ├── stores/         Zustand stores (auth)
│       └── types/          ambient type declarations
├── shared/                 types shared across the boundary
├── docs/                   this documentation
└── docker-compose.yml      local Postgres + Judge0
```

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| `prisma generate` EPERM on Windows | Stop the running backend (it locks the query-engine DLL), then retry. |
| Database unreachable | Free Supabase projects auto-pause — open the dashboard, **Restore**, and retry. |
| AI features return fallbacks | Check `GOOGLE_AI_API_KEY`; the service degrades gracefully when the key is missing or quota-limited. |
| CORS errors in the browser | Ensure `FRONTEND_URL` matches the frontend origin. |
| `/courses` renders empty | The backend isn't running or the DB isn't seeded — start it and run `npm run db:seed`. |
| C++ "execution unavailable" | Set `JUDGE0_URL` (and a key for reliable demos). |

## Local infrastructure (optional)

To run Postgres and Judge0 locally instead of Supabase:

```bash
docker compose up -d
# then point DATABASE_URL / DIRECT_URL at localhost:5432
# and JUDGE0_URL at http://localhost:2358
```

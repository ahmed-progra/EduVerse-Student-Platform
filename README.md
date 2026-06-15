# EduVerse — Learn Programming Through RPG Adventure

**See your code run, line by line.** EduVerse is an AI‑powered, gamified learning platform that transforms programming education into an RPG adventure. Every learner gets a personal AI mentor, a skill tree to conquer, coding battles to fight, and an AI apprentice to teach — turning mastery into an actual, shareable portfolio.

Languages: **Python, HTML, CSS, C++** — 4 courses, ~120 lessons, one journey.

---

## Overview

EduVerse reimagines how programming is learned. Instead of static tutorials and disconnected exercises, it wraps a full CS curriculum inside a role‑playing game. You earn XP by completing lessons, unlock abilities on a branching skill tree, duel other players in coding battles, and collect cosmetics from the shop. Every feature is tied to real learning progress.

The platform's signature feature is a **step‑through code visualizer**: it executes code line by line and shows variables, loops, and the call stack changing in real time. Around it, an **AI mentor** adapts to your strengths and weaknesses, assigns smart daily missions, and generates weekly learning reports. An **apprentice mode** lets you teach a novice AI called **Pip** — the protégé effect in action, where teaching solidifies your own understanding.

Built by students, for students. The UI is a warm, dark "Code Sorcery" theme with purposeful motion and zero fluff — no gradient text, no glassmorphism, no fake numbers.

## Features

- **Step‑through Code Visualizer** — Watch Python execute line by line with live variable state; HTML/CSS render in a live preview; C++ runs via an external judge.
- **AI Mentor** (`/mentor`) — Persistent, cross‑course coach that tracks your mastery profile, identifies weak topics, assigns smart daily/weekly missions, and produces weekly learning reports. Profile‑aware chat grounded in your real activity.
- **Skill Tree** — Branching ability map across Python mastery, frontend mastery, algorithms, and debugging. Unlock nodes with XP and level requirements.
- **Battle Arena** (`/battle`) — Timed coding duels against other players. Multiple difficulty levels and challenge types (debug, write function, predict output).
- **Code Lab** (`/codelab`) — In‑browser code editor with Monaco, live preview, and the step visualizer.
- **Project Studio + Portfolio** (`/projects`, `/u/:username`) — AI suggests projects appropriate to your level. Build them in‑app, get them AI‑graded against a rubric. Publish to a shareable public portfolio.
- **Placement Test** — Adaptive assessment that builds a per‑topic mastery profile and generates a personalized roadmap, skipping content you already know.
- **Apprentice Teaching** (`/apprentice`) — Teach a novice AI (**Pip**) a topic. Pip asks beginner questions, its understanding meter climbs, then it grades how well you taught. The AI Mentor can assign "teach this weak topic" missions.
- **Shop** — Cosmetics (avatars, frames, animations, titles, themes) bought with **Coins** — a separate currency so shopping never costs you progression XP.
- **Leaderboard** — Weekly and all‑time rankings with gold / silver / bronze tiers.
- **Adaptive Daily Challenges** — Personalized coding exercises generated based on your current mastery profile.

## Tech Stack

| Category     | Technology                                                                 |
| ------------ | -------------------------------------------------------------------------- |
| Frontend     | Next.js 16 (App Router), React 19, Framer Motion, Tailwind CSS v4, Zustand |
| Backend      | Express 5, Prisma ORM, SQLite (via Better‑SQLite3)                         |
| AI           | Anthropic Claude API (powering mentor, apprentice, projects, missions)     |
| Code Editor  | Monaco Editor (via `@monaco-editor/react`)                                 |
| Code Exec.   | Skulpt (Python, in‑browser) · Judge0 (C++) · sandboxed iframe (HTML/CSS)   |
| Tooling      | TypeScript 5, Turbopack, Prettier, tsx                                     |
| Monorepo     | npm workspaces (`frontend`, `backend`, `shared`)                           |

## Architecture

EduVerse is an **npm workspaces monorepo** with three packages:

| Package      | Purpose                                                      |
| ------------ | ------------------------------------------------------------ |
| `frontend/`  | Next.js 16 App Router — dashboard, courses, code lab, mentor, apprentice, battle, shop, leaderboard, user profiles |
| `backend/`   | Express 5 REST API — auth, courses, lessons, AI services, battles, leaderboard, shop, project grading, skill tree |
| `shared/`    | TypeScript types and interfaces shared between frontend and backend |

The frontend communicates with the backend via RESTful JSON endpoints. AI features (mentor, apprentice, project grading, mission generation) flow through a centralized AI service in the backend that interfaces with the Anthropic Claude API with retry and fallback logic. The Skill Tree and XP system drive gamification across all surfaces.

## Prerequisites

- **Node.js** 20+ (see `.nvmrc`)
- **npm** 10+

## Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-org/eduverse.git
cd eduverse

# 2. Install all dependencies (all workspaces)
npm install

# 3. Set up environment variables
cp .env.example backend/.env
# Edit backend/.env with your keys (see Environment Variables below)

# 4. Initialize the database and seed data
npm run db:setup

# 5. Start development (backend + frontend concurrently)
npm run dev
```

The backend starts on **http://localhost:4000** and the frontend on **http://localhost:3000**.

### Demo Account

After seeding, log in with:

> **Email:** `demo@eduverse.dev`  
> **Password:** `demo1234`

## Environment Variables

Copy `.env.example` to `backend/.env` and fill in the values.

| Variable            | Description                                        | Required |
| ------------------- | -------------------------------------------------- | -------- |
| `DATABASE_URL`      | SQLite database file path (e.g., `file:./dev.db`)  | Yes      |
| `ANTHROPIC_API_KEY` | Anthropic Claude API key                           | Yes      |
| `JWT_SECRET`        | Secret key for signing JWT tokens                  | Yes      |
| `JWT_EXPIRES_IN`    | Token expiration duration (default `7d`)           | No       |
| `PORT`              | Backend server port (default `4000`)               | No       |
| `FRONTEND_URL`      | Frontend origin for CORS (default `http://localhost:3000`) | No |
| `JUDGE0_URL`        | Judge0 CE endpoint for C++ execution               | No       |
| `JUDGE0_API_KEY`    | Judge0 API key (optional, public endpoint works without one) | No |
| `JUDGE0_HOST`       | Judge0 custom host header (for RapidAPI setups)    | No       |

## Development

### Running individual workspaces

```bash
npm run dev:frontend   # Next.js dev server on :3000
npm run dev:backend    # Express API with tsx watch on :4000
npm run dev            # Both concurrently
```

### Common commands

| Command                  | Description                              |
| ------------------------ | ---------------------------------------- |
| `npm run build`          | Build all workspaces                     |
| `npm run typecheck`      | TypeScript check across all workspaces   |
| `npm run format`         | Format code with Prettier                |
| `npm run format:check`   | Check formatting without writing         |
| `npm run db:generate`    | Regenerate Prisma client                 |
| `npm run db:migrate`     | Run Prisma migrations                    |
| `npm run db:seed`        | Seed the database with courses, lessons, demo account |
| `npm run db:setup`       | Migrate + seed (one step)                |
| `npm run test:e2e`       | Run all E2E test suites                  |

### E2E tests

End‑to‑end test suites run against a live backend and the real Anthropic API:

```bash
cd backend
node scripts/learning-e2e.mjs       # adaptive learning placement
node scripts/mentor-e2e.mjs         # AI mentor + missions
node scripts/apprentice-e2e.mjs     # apprentice teaching
node scripts/projects-e2e.mjs       # project studio + portfolio
node scripts/ai-e2e.mjs             # AI endpoint integration
```

## Project Structure

```
eduverse/
├── frontend/                  # Next.js 16 web application
│   ├── src/
│   │   ├── app/               # App Router pages
│   │   │   ├── dashboard/
│   │   │   ├── courses/
│   │   │   ├── lessons/
│   │   │   ├── codelab/
│   │   │   ├── mentor/
│   │   │   ├── apprentice/
│   │   │   ├── projects/
│   │   │   ├── battle/
│   │   │   ├── leaderboard/
│   │   │   ├── shop/
│   │   │   └── u/[username]/  # Public user portfolio
│   │   ├── components/        # UI, layout, feature components
│   │   └── globals.css        # Design system tokens
│   └── public/
├── backend/                   # Express 5 API
│   ├── src/
│   │   ├── routes/            # Auth, courses, lessons, battles,
│   │   │                      # leaderboard, shop, skill tree, AI,
│   │   │                      # mentor, apprentice, projects
│   │   ├── services/          # AI service, learning, mentor,
│   │   │                      # apprentice, project, XP, battle
│   │   └── index.ts           # Entry point
│   ├── prisma/                # Prisma schema + migrations
│   ├── curriculum/            # Authored lesson content
│   └── scripts/               # E2E test suites
├── shared/                    # Shared TypeScript types
│   └── types.ts
├── docs/                      # Documentation
├── .env.example               # Environment template
├── package.json               # Root workspace config
└── tsconfig.base.json         # Shared TypeScript config
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full contribution workflow — including branch naming, commit conventions (Conventional Commits), code style, and how to run tests before opening a PR. All contributors must adhere to our [Code of Conduct](CODE_OF_CONDUCT.md).

## License

MIT — see [LICENSE](LICENSE).

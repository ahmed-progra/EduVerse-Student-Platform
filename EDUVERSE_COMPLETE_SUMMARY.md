# EduVerse — Complete Project Summary

> AI-powered, gamified platform for learning to program. See your code run, line by line.
> Live at: **http://localhost:3000** | Backend API: **http://localhost:4000**

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    EduVerse Monorepo                     │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐  │
│  │  shared/  │  │ backend/ │  │      frontend/       │  │
│  │  (types)  │  │ Express  │  │ Next.js 16 + React 19│  │
│  │           │  │  Prisma  │  │  framer-motion       │  │
│  │  index.ts │  │  Gemini  │  │  Tailwind v4         │  │
│  └──────────┘  │ Supabase  │  │  Zustand             │  │
│                │ Judge0    │  │  Monaco Editor       │  │
│                └──────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

- **Monorepo** with npm workspaces: `shared/`, `backend/`, `frontend/`
- **Database**: PostgreSQL on Supabase (remote)
- **AI**: Google AI Studio (Gemini) — powers all AI features
- **Code Execution**: Judge0 (Docker) — runs Python/C++ code

---

## Project Structure

### Root (`/`)

| File | Purpose |
|---|---|
| `package.json` | Monorepo root — scripts: `dev` (concurrently backend+frontend), `build`, `db:seed`, `db:setup` |
| `tsconfig.base.json` | Shared TypeScript config |
| `.env` | Environment variables |
| `docker-compose.yml` | PostgreSQL + Judge0 services |
| `README.md` | Project readme |
| `design-philosophy.md` | Design philosophy ("Code Sorcery" — warm dark amber theme) |
| `CHANGELOG.md` | Version history |

---

### `shared/` — Shared TypeScript Types

**`src/index.ts`** — Type definitions shared between frontend and backend:
- `User`, `Course`, `Lesson`, `Battle`, `SkillTreeNode`, `ShopItem`
- `ApiResponse<T>` — generic API response wrapper
- `ApiSuccess<T>`, `ApiError` — typed response shapes

---

### `backend/` — Express API Server

**Stack**: Express 5, Prisma 6, TypeScript, Google AI Studio (Gemini), Judge0, JWT auth, Zod validation, bcrypt

#### Entry Point: `src/index.ts`
- Express server on **port 4000**
- CORS, JSON parsing, rate limiting
- 14 route groups mounted under `/api/`

#### Prisma Schema: `prisma/schema.prisma` (380 lines, 19 models)

| Model | Purpose |
|---|---|
| **User** | Core user — xp, coins, level, rank, placementLevel |
| **Course** | Course catalog — title, slug, icon, order |
| **Lesson** | Per-course lessons — content, codeTemplate, topics, quiz, difficulty |
| **CoursePlacement** | Many-to-many: user-course placement level |
| **Assessment** | Placement assessment attempts with AI analysis |
| **SkillProfile** | Per-course topic mastery (JSON mastery map) |
| **Roadmap** | Personalized lesson plan with per-skip justification |
| **LearningEvent** | Analytics trail (quiz passes/fails, completions) |
| **MentorProfile** | Global AI mentor memory: summary, insights, metrics |
| **Mission** | Dynamic daily/weekly missions with XP rewards |
| **MentorReport** | Weekly AI learning report snapshots |
| **Project** | Project Studio — code, milestones, AI grade, feedback, portfolio |
| **UserProgress** | Lesson completion tracking |
| **XpLog** | XP earning log |
| **SkillTreeNode** | RPG-style skill tree nodes |
| **UserSkill** | User-skill unlocks |
| **Battle** / **BattleSubmission** | Coding battles with matchmaking |
| **LeaderboardEntry** | Leaderboard rankings |
| **ShopItem** / **UserInventory** | Shop items + user inventory |

#### Routes: `src/routes/` (14 files)

| Route File | Endpoints |
|---|---|
| `auth.ts` | POST `/register`, `/login`, `/google` — bcrypt + JWT, GET `/me` |
| `courses.ts` | GET `/` (cached), `/:id` — course listing with lessons |
| `lessons.ts` | GET `/:id`, POST `/:id/complete`, POST `/:id/quiz` — mark complete, graded quiz |
| `submissions.ts` | POST `/execute` — code execution via Judge0 |
| `battles.ts` | POST `/create`, `/join/:id`, `/submit` — battle arena |
| `leaderboard.ts` | GET `/` (paginated, period filter), `/rank` |
| `shop.ts` | GET `/items`, POST `/buy/:id`, `/equip/:id`, GET `/inventory` |
| `user.ts` | GET `/profile`, PUT `/profile`, GET `/xp-logs` |
| `skilltree.ts` | GET `/`, POST `/unlock/:id` — unlock with XP cost + level check |
| `ai.ts` | POST `/mentor`, `/review`, `/hints`, `/challenge`, `/exam/grade`, `/summary`, `/quiz`, `/recommend`, `/explain-error` — all via Gemini |
| `learning.ts` | POST `/:id/assessment/start`, `/submit`, GET `/:id/state`, POST `/:id/refresh` |
| `mentor.ts` | GET `/profile`, POST `/sync`, GET `/missions`, POST `/missions/generate`, POST `/missions/:id/complete`, GET `/report`, POST `/chat` |
| `apprentice.ts` | GET `/topics`, POST `/start`, `/reply`, `/grade` — teach-the-AI mode |
| `projects.ts` | GET `/`, `/:id`, POST `/`, `/suggest`, PATCH `/:id`, PATCH `/:id/publish`, POST `/:id/submit`, GET `/portfolio/:username` |

#### Services: `src/services/` (8 files)

| Service | Purpose |
|---|---|
| `ai-service.ts` | **Central Gemini client** — API key handling, retries with backoff, model fallback (gemini-2.5-flash → gemini-2.0-flash), structured JSON parsing, input clamping, logging |
| `learning-service.ts` | **Adaptive learning engine** — grades assessments, builds mastery profiles, classifies levels (beginner/intermediate/advanced), generates personalized roadmaps with AI skip justifications |
| `mentor-service.ts` | **Global AI mentor** — aggregates all learner signals, synthesizes MentorProfile via Gemini, generates missions, weekly reports, cross-course coaching |
| `apprentice-service.ts` | **Protégé effect engine** — AI "Pip" as curious apprentice, learner teaches a topic, AI grades teaching quality (clarity/correctness/completeness), awards XP |
| `project-service.ts` | **Project Studio** — AI suggests projects, grades submissions against rubric (5 criteria), manages milestones, public portfolio |
| `battle-service.ts` | **Battle engine** — generates challenges, test cases, Judge0 scoring, XP rewards |
| `xp-service.ts` | **Core XP system** — sqrt-based leveling, updates XP + coins + leaderboard, emits leveledUp events |
| `judge0.ts` | **Judge0 client** — Python/C++ execution, handles auth (RapidAPI / self-hosted), timeouts, retries |

#### Middleware: `src/middleware/`

| File | Purpose |
|---|---|
| `auth.ts` | `requireAuth` (401 if no token) + `optionalAuth` (attaches userId if present) |
| `rate-limit.ts` | Rate limiters: general (100/min), auth (10/min), code exec (20/min), AI (30/min) |

#### Curriculum: `curriculum/` (10 files)

| File | Purpose |
|---|---|
| `types.ts` | Curriculum type definitions |
| `index.ts` | Exports all 4 courses as `COURSES` array |
| `python-a.ts`, `python-b.ts` | Python: 36 lessons (print → decorators → generators → APIs) |
| `html-a.ts`, `html-b.ts` | HTML: 26 lessons (semantics → forms → media → APIs) |
| `css-a.ts`, `css-b.ts` | CSS: 28 lessons (selectors → flexbox → grid → animations) |
| `cpp-a.ts`, `cpp-b.ts` | C++: 34 lessons (hello world → pointers → STL → smart pointers) |

#### Database Seed: `scripts/seed.ts`

Creates: 4 courses with full lessons, 2 test users (alice/bob), 15 shop items, 18 skill tree nodes. Run with `npm run db:seed`.

#### E2E Tests: `scripts/` (*.mjs files)

`ai-e2e.mjs`, `apprentice-e2e.mjs`, `learning-e2e.mjs`, `mentor-e2e.mjs`, `projects-e2e.mjs`, `teachback-e2e.mjs` — full end-to-end tests for each major feature.

---

### `frontend/` — Next.js 16 App

**Stack**: Next.js 16 (App Router), React 19, Framer Motion 12, Tailwind CSS v4, Zustand, Monaco Editor, Lucide icons

#### Design System (`frontend/src/app/globals.css`)

**"Code Sorcery" theme** — warm dark palette, amber accent. ~3800 lines of CSS.

**Design Tokens (Tailwind v4 `@theme`):**
- Background: `oklch(12% 0.02 55)` — deep warm brown-black
- Accent: `oklch(78% 0.14 85)` — warm amber/gold
- Surface: `oklch(16% 0.025 50)` — raised cards
- Text: `oklch(93% 0.01 80)` — near-white
- Success: `oklch(76% 0.14 165)` — green
- Danger: `oklch(66% 0.19 25)` — red
- Border: `oklch(70% 0.03 55 / 0.08)` — subtle

**CSS Includes:** Landing page, AI panels, step visualizer, dashboard, skill map SVG, battle arena, auth shell, leaderboard podium, shop, profile achievements, code lab, skeleton shimmer animations.

#### Layout System

| File | Purpose |
|---|---|
| `layout.tsx` (root) | Loads 3 fonts (Fraunces/IBM Plex Sans/IBM Plex Mono), ambient background, wraps in `<Providers>` |
| `providers.tsx` | Client wrapper — renders `<AppLayout>` |
| `components/layout/app-layout.tsx` | **Main app shell** — sidebar nav (collapsible, mobile drawer), auth gate, AI panel overlay (5 panels), user info + XP bar |
| `components/layout/ai-*-panel.tsx` | 5 AI panels: Mentor (chat), Exam, Code Review, Hints, Challenges |

#### Shared Motion System: `lib/motion.ts`

```typescript
export const fadeUp: Variants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };
export const staggerContainer: Variants = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };
export const fastEaseTransition = { duration: 0.3, ease: [0.22, 1, 0.36, 1] };
// Also: fadeIn, fadeLeft, fadeRight, scaleIn, staggerFast, cardHover, springTransition, easeTransition
```

Used consistently across all app pages with `initial="hidden" animate="visible" variants={staggerContainer}` pattern.

#### UI Primitives: `components/ui/` (8 files)

| Component | Purpose |
|---|---|
| `glass-card.tsx` | Animated glassmorphism card with `app-card` class, optional click handler with scale feedback |
| `gradient-button.tsx` | Styled button — 4 variants (primary/secondary/danger/ghost), loading spinner, hover/tap animations |
| `xp-bar.tsx` | XP progress bar — level display, animated fill with shimmer, 3 sizes (sm/md/lg) |
| `empty-state.tsx` | Empty/error display — icon, title, message, optional action buttons |
| `skeleton.tsx` | 8 skeleton variants — Card, Text, Row, Activity, Widget, Podium, CardGrid |
| `animated-number.tsx` | Count-up animation on scroll-into-view with reduced-motion support |
| `error-boundary.tsx` | React error boundary for catching render errors |
| `tooltip.tsx` | Simple hover tooltip |

#### Feature Components: `features/` (9 directories)

| Feature | Components | Purpose |
|---|---|---|
| `landing/` | `hero-demo.tsx` | Animated code visualizer on landing page |
| `auth/` | `auth-shell.tsx` | Two-column auth layout (brand panel + form) |
| `dashboard/` | `ai-coach-card.tsx` | AI recommendations card on dashboard |
| `mentor/` | 7 components | Mentor chat, growth chart, metric tiles, insights, topics, missions, weekly report |
| `learning/` | 2 components | Placement assessment runner, personalized roadmap view |
| `lessons/` | 3 components | AI tools (summary + quiz), context-aware mentor, quiz checkpoint |
| `skill-map/` | `skill-map.tsx` | Interactive SVG skill tree with pan/zoom |
| `visualizer/` | 5 components | Main visualizer, step engine (Skulpt), memory/debug/AST panels |
| `apprentice/` | 2 components | Pip avatar (AI apprentice), teaching grade card |

#### Pages: `app/` (19 routes, 17 refactored)

| Route | Key Features |
|---|---|
| `/` (landing) | Hero, features, daily challenges with inline editor, streak tracker, confetti. **Standalone CSS animations** |
| `/dashboard` | Welcome, XP bar, quick action cards, stats grid, AI coach card, activity feed |
| `/auth/login` | Email/password login with error states |
| `/auth/register` | Registration with validation (username, email, password) |
| `/courses` | Course catalog grid with loading/offline/empty states |
| `/courses/[id]` | Course detail with assessment runner + personalized roadmap |
| `/lessons/[id]` | Lesson content, Monaco editor, visualizer, AI mentor, quiz, XP toast |
| `/codelab` | Interactive Python lab — presets, bug mutation, visualizer, shortcuts |
| `/battle` | 3-phase battle: lobby (config) → staging (countdown) → arena (editor + timer) |
| `/leaderboard` | Podium, ranked list with search, period toggle |
| `/skill-tree` | SVG skill map, node detail panel, code examples, unlock flow |
| `/shop` | Item grid, coin balance, buy/equip flow, tab filtering |
| `/profile` | Avatar upload, inline edit, stats, activity heatmap, XP chart, achievements, inventory |
| `/mentor` | AI Coach dashboard — 9 sections: summary, metrics, growth, topics, missions, report, insights, projects, chat |
| `/apprentice` | 3-phase: pick topic → teach Pip → graded results |
| `/projects` | Project listing, AI idea generator, custom create form |
| `/projects/[id]` | Workspace: brief, milestones, Monaco editor, AI submit/grade |
| `/placement-test` | Course assessment: questions, progress bar, scoring, XP rewards |
| `/u/[username]` | Public portfolio: user info + completed projects |

#### API Client: `services/api-client.ts`

- Base URL: `http://localhost:4000/api` (configurable via `NEXT_PUBLIC_API_URL`)
- In-memory response cache (30s TTL) for GET + read-like POST endpoints
- Request deduplication (in-flight dedup)
- Automatic JWT injection from localStorage
- AI-specific timeout (90s)
- Complete coverage of all 14 backend route groups

#### State Management: `stores/auth-store.ts`

Zustand store managing:
- `user` — current user object
- `token` — JWT from localStorage
- `login/register/logout/loadUser` — auth lifecycle
- `updateXp/updateCoins` — sync XP/coins from API responses

#### Route Map Summary

```
                 EduVerse Route Map
                ┌─────────────────────────────┐
                │         Landing /            │
                │   (public, standalone CSS)   │
                └─────────────┬───────────────┘
                              │
                    ┌─────────▼─────────┐
                    │    Auth Gate       │
                    │   /auth/login      │
                    │   /auth/register   │
                    └─────────┬─────────┘
                              │
         ┌────────────────────┼────────────────────┐
         ▼                    ▼                    ▼
   ┌──────────┐        ┌──────────┐         ┌──────────┐
   │  Learn   │        │  Compete │         │   AI     │
   ├──────────┤        ├──────────┤         ├──────────┤
   │Dashboard │        │  Battle  │         │  Mentor  │
   │ Courses  │        │Leadersb. │         │Apprentice│
   │ Lessons  │        │  Shop    │         │ Projects │
   │ Code Lab │        └──────────┘         │AI Panels │
   │Skill Tree│                             └──────────┘
   │ Placemnt │
   └──────────┘
```

---

## Getting Started

### Prerequisites
- Node.js >= 20
- Docker (for Judge0 code execution)

### Running

```bash
# Install
npm install

# Generate Prisma client
cd backend && npx prisma generate && cd ..

# Seed database
npm run db:seed

# Start both services
npm run dev
# → Backend: http://localhost:4000
# → Frontend: http://localhost:3000

# Test users created by seed:
#   alice / password123
#   bob   / password123
```

### Environment Variables (`.env`)

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Supabase PostgreSQL connection string |
| `JWT_SECRET` | JWT signing secret |
| `GOOGLE_AI_API_KEY` | Google AI Studio API key for Gemini |
| `JUDGE0_URL` | Judge0 code execution endpoint |
| `NEXT_PUBLIC_API_URL` | Frontend API base URL (default: localhost:4000/api) |

---

## Key Technical Decisions

1. **Warm dark amber theme** — "Code Sorcery" aesthetic. No violet/purple. Uses OKLCH colors. Background dots pattern
2. **Framer Motion shared variants** — `fadeUp`, `staggerContainer`, `fastEaseTransition` used across all pages
3. **AI-first architecture** — Gemini powers mentor, hints, code review, exam prep, challenges, summary, quiz, apprentice, project grading
4. **Adaptive learning** — Placement assessment → mastery profile → personalized roadmap with AI skip justifications
5. **Protégé effect** — Teaching the AI (apprentice mode) as a learning strategy
6. **Project-based assessment** — AI-generated projects with rubric-based grading
7. **XP economy** — sqrt-based leveling, dual currency (XP for progression, coins for shop), streak system
8. **SQLite-ready** — Schema designed to work with both PostgreSQL and SQLite (for local dev)

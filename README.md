# EduVerse 🪄

**See your code run, line by line.** EduVerse is an AI‑powered, gamified platform for learning to program — it doesn't just *teach* you, it gives every learner a personal AI coach, lets you *teach an AI apprentice*, and turns your learning into a real, AI‑reviewed project portfolio.

Languages covered: **Python, JavaScript, HTML, CSS, C++.**

---

## ✨ Highlights

- **Step‑through Code Visualizer** — watch Python execute line by line with live variable state; HTML/CSS render in a live preview; C++ runs via Judge0.
- **Adaptive Learning** — a placement assessment builds a per‑topic *mastery profile* and a **personalized roadmap** that skips what you already know (with an AI reason for each skip).
- **AI Coach** (`/mentor`) — a persistent, cross‑course mentor: skill assessment, growth chart, strong/weak topics, **smart daily/weekly missions**, weekly learning reports, and a profile‑aware chat. All grounded in your real activity.
- **Apprentice Mode** (`/apprentice`) — *teach the AI to learn it yourself.* You teach a novice AI (**Pip**) a topic; it asks beginner questions, its understanding meter climbs, then it grades **how well you taught** (the protégé effect). The Coach can even assign “teach this weak topic” missions.
- **Project Studio + Portfolio** (`/projects`, public `/u/<username>`) — the AI suggests a project for your level, you build it in‑app, AI grades it against a rubric, and it lands on a **shareable public portfolio**.
- **Battles, Skill Tree, Leaderboard, Shop** — coding duels against the clock, an arcane skill map, XP/levels, and cosmetics bought with **Coins** (a separate currency, so shopping never costs you progression).
- **Crafted UI** — a warm “Code Sorcery” dark theme (Fraunces + IBM Plex), a living ambient background, and tuned micro‑animations.

Every AI feature is real — powered by **Google AI Studio (Gemini)** through one hardened service with retries, model fallback, and graceful deterministic fallbacks.

---

## 🧱 Tech stack

| Layer | Tech |
| --- | --- |
| Frontend | Next.js 16 (App Router, React 19), Tailwind v4, Framer Motion, Monaco editor |
| Backend | Node + Express 5, TypeScript |
| Database | PostgreSQL (Supabase) via Prisma ORM |
| AI | Google AI Studio — Gemini (`gemini-2.5-flash` + fallbacks) |
| Code execution | Skulpt (Python, in‑browser stepper) · Judge0 (C++) · sandboxed iframe (HTML/CSS) |

---

## 🚀 Quick start

**Prerequisites:** Node.js 18+ and a PostgreSQL database (this project uses Supabase).

### 1. Configure environment
Copy `.env.example` and fill in your values. The backend reads `backend/.env` (and the repo‑root `.env`):

```env
# backend/.env
DATABASE_URL="postgresql://postgres.<ref>:<password>@aws-1-<region>.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.<ref>:<password>@aws-1-<region>.pooler.supabase.com:5432/postgres"
GOOGLE_AI_API_KEY="<your-google-ai-studio-key>"   # https://aistudio.google.com/apikey
```
> Get the two database strings from your Supabase project → **Connect → ORMs → Prisma**.

### 2. Backend
```bash
cd backend
npm install
npx prisma db push     # creates the tables on your database
npm run db:seed        # seeds courses, 124 lessons, shop, skill tree, demo account
npm run dev            # API on http://localhost:4000
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev            # app on http://localhost:3000
```

### 4. Log in
Use the seeded demo account to see a populated experience:

> **demo@eduverse.dev** / **demo1234**

---

## 🗺️ Project structure

```
backend/
  src/
    routes/        auth, courses, lessons, battles, leaderboard, shop, user,
                   skilltree, ai, learning, mentor, apprentice, projects
    services/      ai-service, learning-service, mentor-service,
                   apprentice-service, project-service, xp-service, battle-service
    learning/      topic catalogs + assessment banks
  curriculum/      124 authored lessons (Python/C++/HTML/CSS)
  prisma/          schema.prisma
  scripts/         *-e2e.mjs  (end-to-end test suites)
frontend/
  src/app/         routes: dashboard, courses, lessons, codelab, mentor,
                   apprentice, projects, u/[username], battle, leaderboard, shop, ...
  src/components/  ui, layout, mentor, apprentice, lessons, dashboard, learning
```

## 🧪 Tests
End‑to‑end suites run against a live backend + the real Gemini API:
```bash
cd backend
node scripts/learning-e2e.mjs     # adaptive learning (28 checks)
node scripts/mentor-e2e.mjs       # AI Coach + missions (22 checks)
node scripts/apprentice-e2e.mjs   # teach-the-AI (16 checks)
node scripts/projects-e2e.mjs     # Project Studio + portfolio (16 checks)
node scripts/ai-e2e.mjs           # AI endpoints (20 checks)
```

## 📝 Notes
- Free Supabase projects **auto‑pause** after inactivity — if the database seems unreachable, open the Supabase dashboard and **Restore** the project, then retry.
- Secrets live only in the gitignored `.env` files and are never committed.

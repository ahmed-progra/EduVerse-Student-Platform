# Getting Started

This guide gets you from zero to a running EduVerse instance in about five minutes.

---

## Prerequisites

- **Node.js** 20+ (check with `node --version`, use `.nvmrc` if you have `nvm`)
- **npm** 10+ (`npm --version`)
- **PostgreSQL** 16+ or Docker (see below)

---

## Step 1: Clone

```bash
git clone https://github.com/ahmed-progra/EduVerse-Student-Platform.git
cd EduVerse-Student-Platform
```

---

## Step 2: Install dependencies

```bash
npm install
```

This installs both workspaces (`frontend`, `backend`) via npm workspaces.

---

## Step 3: Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

| Variable            | Required | Notes                                                                |
| ------------------- | -------- | -------------------------------------------------------------------- |
| `DATABASE_URL`      | ✅       | Supabase PostgreSQL connection string                                |
| `DIRECT_URL`        | ✅       | Supabase direct connection for migrations                            |
| `GOOGLE_AI_API_KEY` | ✅       | Get one at [aistudio.google.com](https://aistudio.google.com/apikey) |
| `JWT_SECRET`        | ✅       | Any secure random string                                             |

---

## Step 4: Database

### Option A: Supabase (recommended)

1. Create a project at [supabase.com](https://supabase.com)
2. Copy the connection strings from **Project Settings → Database → Connection string → Prisma**
3. Set `DATABASE_URL` (transaction pooler, port `6543`) and `DIRECT_URL` (session pooler, port `5432`)

### Option B: Local Docker

```bash
docker compose up -d postgres
```

Then set:

```
DATABASE_URL="postgresql://eduverse:eduverse_pass@localhost:5432/eduverse"
DIRECT_URL="postgresql://eduverse:eduverse_pass@localhost:5432/eduverse"
```

### Option C: Local SQLite (no PostgreSQL required)

The project includes a SQLite schema at `backend/prisma/schema.sqlite.prisma`. Set:

```
DATABASE_URL="file:./dev.db"
```

And use the SQLite schema file.

---

## Step 5: Migrate and seed

```bash
npm run db:setup
```

This runs Prisma migrations and seeds the database with:

- 7 courses (Python, HTML, CSS, C++, Mathematics, Physics, Science)
- 172 lessons
- Skill tree
- Shop items
- Demo accounts

---

## Step 6: Start development

```bash
npm run dev
```

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:4000
- **API Health**: http://localhost:4000/api/health

---

## Step 7: Log in

| Account | Email               | Password      | Description                   |
| ------- | ------------------- | ------------- | ----------------------------- |
| Demo    | `demo@eduverse.dev` | `demo1234`    | Intermediate learner, 500+ XP |
| Alice   | `alice@example.com` | `password123` | Fresh account                 |

---

## What's next?

- Browse the [Architecture](ARCHITECTURE.md) to understand the system design
- Read the [Frontend](frontend.md) and [Backend](backend.md) deep-dives
- Explore the [API Reference](API.md) to understand available endpoints
- Check the [Development Guide](DEVELOPMENT.md) for workflows and scripts

# Database

EduVerse uses **PostgreSQL** accessed through **Prisma ORM**. The schema is the
single source of truth: [`backend/prisma/schema.prisma`](../backend/prisma/schema.prisma).

## Connection

Two URLs are configured (Supabase-compatible pattern):

| Variable | Port | Used for |
| --- | --- | --- |
| `DATABASE_URL` | `6543` (transaction pooler, `pgbouncer=true`) | The running app |
| `DIRECT_URL` | `5432` (session pooler) | Migrations (`prisma migrate`) |

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

## Conventions

### JSON columns

Several models store structured data in `String` columns that hold JSON
(arrays/objects), defaulting to `"[]"` or `"{}"`. This keeps AI-generated,
evolving payloads flexible without a migration per shape change:

- `SkillProfile.mastery` — topic → mastery status map
- `Roadmap.items` — ordered lesson plan with skip justifications
- `MentorProfile.insights`, `recommendations`, `projects` — AI-generated coaching data
- `MentorReport.improved`, `regressed`, `needsWork`, `focusAreas` — weekly summaries
- `Project.skills`, `milestones`, `rubric`, `strengths`, `improvements` — project metadata
- `Lesson.topics`, `Lesson.quiz` — lesson metadata and checkpoint questions
- `Mission.rationale` — why the mentor chose this mission
- `Assessment.questions`, `answers`, `analysis` — placement assessment data
- `LearningEvent.payload` — event-specific data
- `SkillTreeNode.prerequisites` — prerequisite skill IDs

Always `JSON.parse` on read and `JSON.stringify` on write; treat an empty
default as "not yet computed."

### Composite keys

Join and ownership tables use composite primary keys instead of surrogate IDs:

| Table | Composite key |
| --- | --- |
| `UserProgress` | `(userId, lessonId)` |
| `UserSkill` | `(userId, skillId)` |
| `UserInventory` | `(userId, itemId)` |
| `CoursePlacement` | `(userId, courseId)` |
| `SkillProfile` | `(userId, courseId)` |
| `Roadmap` | `(userId, courseId)` |

### Currencies

- **`User.xp`** — permanent progression. Drives level + leaderboard. Never spent.
- **`User.coins`** — spendable shop currency. Earned alongside XP. Buying items
  decrements coins in a Prisma `$transaction` to prevent double-spending.

### Timestamps

Every model includes `createdAt` and `updatedAt` (where mutable) via Prisma's
`@default(now())` and `@updatedAt` attributes.

---

## Model map

### Identity & progression

| Model | Purpose |
| --- | --- |
| `User` | Account, profile, level/xp/coins, placement level, OAuth link |
| `UserProgress` | Per-lesson completion + score |
| `XpLog` | Append-only XP history (source-tagged: lesson, battle, challenge, placement) |

### Content

| Model | Purpose |
| --- | --- |
| `Course` | A language course (Python, HTML, CSS, C++) with slug, icon, and order |
| `Lesson` | Lesson content, code template, topics, quiz questions, difficulty, XP reward |

### Adaptive learning

| Model | Purpose |
| --- | --- |
| `CoursePlacement` | Per-course placement result (level + score) — composite key |
| `Assessment` | One placement-assessment attempt with question snapshot + AI analysis |
| `SkillProfile` | Living per-course topic → mastery profile — composite key |
| `Roadmap` | Personalized lesson plan with per-skip justification — composite key |
| `LearningEvent` | Analytics trail feeding continuous adaptation |

### AI mentor system

| Model | Purpose |
| --- | --- |
| `MentorProfile` | Global cross-course coach profile — one per user, 1-1 with `User` |
| `Mission` | AI-generated daily/weekly missions with auto-tracked progress |
| `MentorReport` | Weekly learning-report snapshots — unique per `(userId, periodKey)` |
| `Project` | AI Project Studio entries (brief, code, AI rubric, portfolio visibility) |

### Gamification

| Model | Purpose |
| --- | --- |
| `SkillTreeNode` | Skill tree definitions (branches: python_mastery, frontend_mastery, algorithms, debugging) |
| `UserSkill` | Per-user skill unlock state — composite key |
| `Battle` | Coding duels (player1, player2, winner, challenge, difficulty, time limit) |
| `BattleSubmission` | Per-player battle submissions (code + score) |
| `LeaderboardEntry` | Per-user leaderboard standing with weekly scoping |
| `ShopItem` | Cosmetics catalog (avatar, frame, animation, title, theme, effect) |
| `UserInventory` | Ownership + equip state — composite key |

---

## Key relationships

```
User ──1─*── UserProgress ──*──1── Lesson ──*──1── Course
User ──1─*── XpLog
User ──1─*── UserSkill ──*──1── SkillTreeNode
User ──1─*── Battle (as player1 / player2 / winner)
User ──1─*── BattleSubmission
User ──1─1── LeaderboardEntry
User ──1─*── UserInventory ──*──1── ShopItem
User ──1─*── CoursePlacement ──*──1── Course
User ──1─*── Assessment ──*──1── Course
User ──1─*── SkillProfile ──*──1── Course
User ──1─*── Roadmap ──*──1── Course
User ──1─*── LearningEvent
User ──1─1── MentorProfile
User ──1─*── Mission
User ──1─*── MentorReport
User ──1─*── Project
```

- `User` is the central hub — it owns progress, XP logs, skills, battles,
  inventory, placements, assessments, skill profiles, roadmaps, learning events,
  the mentor profile, missions, reports, and projects.
- `Course 1—* Lesson` — both feed the adaptive-learning models keyed by
  `(userId, courseId)`.
- `MentorProfile` is `1—1` with `User`; `Mission`, `MentorReport`, and `Project`
  are `1—*`.
- `Battle` references `User` three ways: `player1`, `player2`, and `winner`.
- `CoursePlacement`, `SkillProfile`, and `Roadmap` all use composite keys
  `(userId, courseId)` to ensure one row per user per course.

---

## Migrations & seeding

Migrations live in `backend/prisma/migrations/` with a history spanning init →
placement → bio → adaptive learning → mentor system → coins → projects.

```bash
cd backend

# Create and apply a migration in development
npx prisma migrate dev

# Push schema without a migration (quick setup)
npx prisma db push

# Seed courses, 124+ lessons, shop items, skill tree, and demo user
npm run db:seed

# Reset database and reseed (destructive)
npm run db:reset

# Browse data in a GUI
npx prisma studio
```

The seed script (`backend/seed.ts`) sources lessons from `backend/curriculum/`,
creates shop items, populates the skill tree, and creates the demo account
`demo@eduverse.dev` / `demo1234`.

> Free Supabase projects auto-pause after inactivity. If the database seems
> unreachable, open the Supabase dashboard, restore the project, and retry.

# Contributing to EduVerse

Thanks for your interest in improving EduVerse! This document explains how to set up your environment, the conventions we follow, and how to get a change merged.

## Code of Conduct

This project adheres to a [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold it. Please report unacceptable behaviour to the maintainers.

## Project layout

EduVerse is an npm-workspaces monorepo:

| Workspace   | Purpose                                   |
| ----------- | ----------------------------------------- |
| `frontend/` | Next.js 16 (App Router, React 19) web app |
| `backend/`  | Express 5 + TypeScript API, Prisma ORM    |

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the full picture.

## Getting started

**Prerequisites:** Node.js 20+ (`.nvmrc`), npm 10+, and a PostgreSQL database (the project uses Supabase).

```bash
git clone <your-fork-url>
cd eduverse
npm install                 # installs all workspaces
cp .env.example .env  # then fill in the values
npm run db:setup            # prisma migrate + seed
npm run dev                 # backend :4000 + frontend :3000
```

Full setup details: [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md).

## Development workflow

1. **Branch** off `main` using a descriptive name: `feature/<short-name>`, `fix/<short-name>`, or `docs/<short-name>`.
2. **Make your change.** Keep it focused — one logical change per PR.
3. **Verify** before pushing:
   ```bash
   npm run typecheck       # TypeScript across all workspaces
   npm run format:check    # Prettier
   npm run lint            # ESLint (if available)
   ```
4. **Run the relevant E2E suite** if you touched backend or AI logic (see [Tests](#tests)).
5. **Open a Pull Request** against `main` and fill in the [pull request template](.github/PULL_REQUEST_TEMPLATE.md).

## Coding standards

- **TypeScript everywhere.** Prefer explicit types at module boundaries. Enable strict mode — no `any` without a compelling reason and an eslint-ignore comment.
- **Formatting** is enforced by Prettier (`.prettierrc.json`). Run `npm run format` before committing.
- **Naming:** `kebab-case.ts(x)` for modules and components. Match the existing tree — don't introduce a competing convention.
- **Styling:** Reuse the established design-system classes (see [docs/design-system.md](docs/design-system.md)) instead of reinventing styles. We use Tailwind CSS with a custom theme.
- **Imports:** Keep imports clean. Prefer named exports. Group imports: built-in → external → internal.

## Commit conventions

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(optional scope): <description>

feat: add weekly mentor report regeneration
fix(auth): reject expired Google tokens
docs: document the /api/mentor endpoints
chore: bump prisma to 6.19
```

Common types: `feat`, `fix`, `docs`, `refactor`, `chore`, `test`, `perf`, `style`, `polish`.

Use the scope to indicate the affected workspace or component (e.g. `frontend`, `backend`, `auth`, `mentor`).

## Tests

End-to-end suites run against a live backend and the real Gemini API:

```bash
cd backend
node scripts/learning-e2e.mjs     # adaptive learning
node scripts/mentor-e2e.mjs       # AI Coach + missions
node scripts/apprentice-e2e.mjs   # teach-the-AI
node scripts/projects-e2e.mjs     # Project Studio + portfolio
node scripts/teachback-e2e.mjs    # teach-the-AI (student teaches Pip)
node scripts/ai-e2e.mjs           # AI endpoints
```

A change to an AI feature should keep its suite green. If you add new functionality, consider adding or extending the relevant E2E script.

## Code review guidelines

- Every PR needs at least one approval from a maintainer before merging.
- Keep PRs small and focused. If a change touches multiple concerns, split it.
- Respond to review comments promptly. Mark conversations as resolved once addressed.
- Squash-merge into `main` — keep a clean linear history.

## Reporting bugs & requesting features

Use the issue templates under **New issue**:

- [Bug report](.github/ISSUE_TEMPLATE/bug_report.md) — include reproduction steps and environment details.
- [Feature request](.github/ISSUE_TEMPLATE/feature_request.md) — describe the problem and proposed solution.

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).

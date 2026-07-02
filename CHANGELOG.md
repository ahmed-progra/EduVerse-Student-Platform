# Changelog

All notable changes to this project are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] — 2026-06-27

### Added

- Academic courses: Mathematics, Physics, Science (48 new lessons, 7 courses total, 172 lessons).
- Interactive 3D Lab (`/lab`) with Three.js scenes across physics, engineering, mathematics,
  computer science, chemistry, electronics, and biology — each fully interactive with live
  parameter controls, simulation-native charts, and readouts.
- Command palette (`Ctrl+K`) for rapid navigation across all sections.
- Level-up celebrations: confetti + animated toasts on milestone levels.
- SQLite mirror schema for local development (`backend/prisma/schema.sqlite.prisma`).
- `use-topic-options` hook for dynamic AI challenge/exam topic selection.
- Professional repository scaffolding: `LICENSE` (MIT), `CONTRIBUTING.md`,
  `CODE_OF_CONDUCT.md`, `SECURITY.md`, issue/PR templates, and a CI workflow.
- `docs/` set: architecture, API reference, database schema, development guide,
  deployment guide, FAQ, troubleshooting, and product context.
- Root tooling: Prettier config, `.editorconfig`, `.nvmrc`, and `format`/`typecheck`
  npm scripts.
- Additional documentation: `docs/deployment.md`, `docs/faq.md`, `docs/troubleshooting.md`.
- Open Graph and Twitter social-share cards (`opengraph-image.tsx`, `twitter-image.tsx`).
- `robots.txt` and `sitemap.xml` generation for SEO.
- Flat ESLint config (`eslint.config.mjs`) with Next.js presets and tuned rules.
- Canonical API entity types (`frontend/src/types/api.ts`).
- SVG app icon (`frontend/public/icon.svg`).

### Changed

- UI design system overhaul: refined color tokens, spacing scale, typography utilities.
- AI panel accessibility: aria-live regions, keyboard navigation, role semantics.
- Code visualizer: improved memory panel and step engine async handling.
- Dashboard: added rank chip, projects quick action, streak refactor.
- Hardened `.gitignore` and `.gitattributes`; untracked local AI/design tooling
  scratch (fonts, `.agents/`, `graphify-out/`, `.claude/`, etc.) from version control.
- Relocated `DESIGN.md`, `PRODUCT.md`, and `TODO.md` into `docs/`.
- Docker compose: added health checks, pinned Judge0 to 1.13.1, removed deprecated `version` field.
- CI pipeline: added format check and build verification steps.
- Shared types: added `bio`, `coins` to `User`; expanded `XpLog.source` variants.
- README: comprehensive rewrite with badges, architecture diagram, full docs index.
- Backend: graceful shutdown on `SIGTERM`/`SIGINT` (drains in-flight requests, closes the
  Prisma connection pool) for clean container restarts.

### Security

- Frontend: baseline HTTP security headers on every route (`X-Content-Type-Options`,
  `X-Frame-Options`, `Referrer-Policy`, `Strict-Transport-Security`, `X-DNS-Prefetch-Control`,
  `Permissions-Policy`) via `next.config.js`. CSP guidance documented in `docs/deployment.md`.

## [1.0.0]

### Added

- AI Project Studio + public Portfolio (`/projects`, `/u/<username>`).
- AI Mentor system: cross-course coach, missions, weekly reports, profile-aware chat.
- Apprentice mode (teach-the-AI / protégé effect) with the Pip avatar.
- Adaptive learning: placement assessment, per-topic mastery profile, personalized roadmap.
- Step-through code visualizer (Skulpt for Python, Judge0 for C++, sandboxed iframe for HTML/CSS).
- Battles, skill tree, leaderboard, and a coins-based shop.
- 124 authored lessons across Python, HTML, CSS, and C++.

### Changed

- Migrated the database from SQLite to Supabase PostgreSQL.
- Animation craft pass and ambient-background cohesion pass (warm "Code Sorcery" theme).

[1.1.0]: https://github.com/ahmed-progra/EduVerse-Student-Platform/releases/tag/v1.1.0
[1.0.0]: https://github.com/ahmed-progra/EduVerse-Student-Platform/releases/tag/v1.0.0

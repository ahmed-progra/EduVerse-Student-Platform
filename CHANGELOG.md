# Changelog

All notable changes to this project are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Professional repository scaffolding: `LICENSE` (MIT), `CONTRIBUTING.md`,
  `CODE_OF_CONDUCT.md`, `SECURITY.md`, issue/PR templates, and a CI workflow.
- `docs/` set: architecture, API reference, database schema, and development guide.
- Root tooling: Prettier config, `.editorconfig`, `.nvmrc`, and `format`/`typecheck`
  npm scripts.

### Changed
- Hardened `.gitignore` and `.gitattributes`; untracked local AI/design tooling
  scratch (fonts, `.agents/`, `graphify-out/`, etc.) from version control.
- Relocated `DESIGN.md`, `PRODUCT.md`, and `TODO.md` into `docs/`.

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

[Unreleased]: https://github.com/ragnarlufe/eduverse/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/ragnarlufe/eduverse/releases/tag/v1.0.0

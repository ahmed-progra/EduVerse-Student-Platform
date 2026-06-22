# Contributing to EduVerse

> **Note**: This document provides a quick-reference overview. For the full
> contributing guide (setup, workflow, conventions, tests), see the root
> [CONTRIBUTING.md](../CONTRIBUTING.md).

---

## Quick Links

- [CONTRIBUTING.md](../CONTRIBUTING.md) — Full contributing guide
- [Code of Conduct](../CODE_OF_CONDUCT.md) — Community standards
- [Security Policy](../SECURITY.md) — Vulnerability reporting
- [Issue Templates](../.github/ISSUE_TEMPLATE/) — Bug reports and feature requests
- [PR Template](../.github/PULL_REQUEST_TEMPLATE.md) — Pull request checklist

---

## Development Setup

```bash
git clone https://github.com/ahmed-progra/EduVerse-Student-Platform.git
cd EduVerse-Student-Platform
npm install
cp .env.example .env
npm run db:setup
npm run dev
```

Full setup details: [getting-started.md](getting-started.md)

---

## Branch Naming

```
feature/<short-description>
fix/<short-description>
docs/<short-description>
chore/<short-description>
```

---

## Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

feat(mentor): add weekly report regeneration
fix(auth): validate token expiry
docs(api): document mentor endpoints
chore(deps): bump prisma to 6.19
```

---

## Pre-submit Checklist

- [ ] `npm run typecheck` passes (all workspaces)
- [ ] `npm run format:check` passes (Prettier)
- [ ] Relevant E2E tests pass (`npm run test:e2e`)
- [ ] PR template filled out

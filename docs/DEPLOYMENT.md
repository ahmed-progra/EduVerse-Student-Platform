# Deployment Guide

## Overview

EduVerse is a monorepo with three workspaces: `shared`, `backend`, and `frontend`. The
backend runs as an Express API, the frontend as a Next.js application. A PostgreSQL
database powers the backend, with an optional Judge0 instance for code execution.

## Architecture (production)

```
                         ┌──────────────┐
                         │   CDN / DNS  │
                         └──────┬───────┘
                                │
                    ┌───────────┴───────────┐
                    │    Next.js (frontend)  │
                    │   Vercel / Railway     │
                    └───────────┬───────────┘
                                │ (HTTP API calls)
                    ┌───────────┴───────────┐
                    │   Express (backend)    │
                    │   Railway / Fly.io     │
                    └───────────┬───────────┘
                                │
             ┌──────────────────┼──────────────────┐
             ▼                  ▼                  ▼
       ┌──────────┐     ┌──────────────┐   ┌──────────────┐
       │PostgreSQL│     │  Google AI   │   │   Judge0     │
       │Supabase  │     │   Studio     │   │(code exec)   │
       └──────────┘     └──────────────┘   └──────────────┘
```

## Deploying the backend

### Prerequisites

- Node.js >= 20
- A PostgreSQL database (Supabase recommended)
- A Google AI Studio API key
- (Optional) A Judge0 instance for code execution

### Environment variables

Copy `.env.example` to `backend/.env` or the root `.env` and configure all variables:

```bash
cp .env.example .env
```

Required variables:

| Variable            | Description                  |
| ------------------- | ---------------------------- |
| `DATABASE_URL`      | PostgreSQL connection string |
| `JWT_SECRET`        | JWT signing secret           |
| `GOOGLE_AI_API_KEY` | Google AI Studio API key     |
| `FRONTEND_URL`      | Frontend URL for CORS        |
| `PORT`              | Backend port (default 4000)  |

### Building

```bash
npm run build
```

### Starting

```bash
npm run start
```

The backend starts on the configured `PORT` (default 4000).

### Database migrations

```bash
npm run db:migrate
npm run db:seed
```

## Deploying the frontend

### Prerequisites

- Node.js >= 20
- The backend must be deployed and reachable

### Environment variables

| Variable              | Description                     |
| --------------------- | ------------------------------- |
| `NEXT_PUBLIC_API_URL` | URL of the deployed backend API |

### Building

```bash
npm run build -w frontend
```

### Starting (standalone)

```bash
npm run start -w frontend
```

### Deploying to Vercel

1. Connect the repository to Vercel
2. Set `root directory` to `frontend`
3. Add the environment variable `NEXT_PUBLIC_API_URL`
4. Deploy

### Deploying to Railway

1. Add both `backend` and `frontend` as services
2. Set the build command to `npm run build` for both
3. Set the start command to `npm run start` for both
4. Add environment variables for each service

## Docker deployment

### Local development

```bash
docker compose up -d
```

This starts PostgreSQL and Judge0. Then run the backend and frontend as usual.

### Production

For production, we recommend using managed services:

- **Database**: Supabase (PostgreSQL)
- **Backend**: Railway, Fly.io, or Render
- **Frontend**: Vercel or Railway
- **Code execution**: Judge0 Cloud or self-hosted

## Health checks

- Backend health: `GET /api/health` returns `{ status: "ok" }`
- Frontend health: any successful page load

## Security headers

- **Backend** (`backend/src/index.ts`) sets `X-Content-Type-Options`, `X-Frame-Options`,
  and `Referrer-Policy` on every API response, plus CORS locked to `FRONTEND_URL`.
- **Frontend** (`frontend/next.config.js`) sets `X-Content-Type-Options`, `X-Frame-Options`,
  `Referrer-Policy`, `Strict-Transport-Security` (HTTPS only), `X-DNS-Prefetch-Control`, and a
  restrictive `Permissions-Policy` on every route.
- **Content-Security-Policy is intentionally not enabled by default.** A strict CSP must account
  for Monaco's `blob:` web workers, Three.js, and Next's inline runtime. Add it via the `headers()`
  hook in `next.config.js` and validate every page on a staging deploy (editor, 3D Lab, AI panels)
  before enabling it in production.

## Monitoring

- Use the backend's built-in rate limiting (configured in `src/middleware/rate-limit.ts`)
- Monitor logs via your hosting platform
- Set up uptime monitoring (e.g., Better Stack, Pingdom)

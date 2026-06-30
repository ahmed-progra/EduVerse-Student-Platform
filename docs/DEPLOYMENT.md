# Deployment Guide

## Architecture (production)

```
                         ┌──────────────┐
                         │   Vercel     │
                         │  (frontend)  │
                         └──────┬───────┘
                                │ HTTPS / CORS
                     ┌──────────┴──────────┐
                     │   Railway / Render   │
                     │  (Express backend)   │
                     └──────────┬──────────┘
                                │
              ┌─────────────────┼─────────────────┐
              ▼                 ▼                  ▼
        ┌──────────┐     ┌────────────┐    ┌──────────────┐
        │ Supabase │     │ Google AI  │    │   Judge0    │
        │PostgreSQL│     │  Studio    │    │ (code exec)  │
        └──────────┘     └────────────┘    └──────────────┘
```

**Frontend** (Vercel) and **Backend** (Railway) are different origins — cookies use
`SameSite=None; Secure`. CORS is locked to the Vercel domain.

---

## 1. Supabase — Database

1. Create a project at [supabase.com](https://supabase.com) (Free tier is fine)
2. From **Project Settings → Database → Connection string → ORMs (Prisma)**:
   - Copy `DATABASE_URL` (transaction pooler, port `6543`, with `?pgbouncer=true`)
   - Copy `DIRECT_URL` (session pooler, port `5432`)
3. Run migrations + seed against production DB:
   ```bash
   DATABASE_URL="<pooler-string>" DIRECT_URL="<session-string>" npm run db:migrate
   DATABASE_URL="<pooler-string>" DIRECT_URL="<session-string>" npm run db:seed
   ```

> **Note**: If `prisma migrate dev` fails on a remote DB, use `prisma migrate deploy` instead.

---

## 2. Railway — Backend (Express API)

1. Create an account at [railway.com](https://railway.com)
2. **New Project → Deploy from GitHub repo** → select `ahmed-progra/EduVerse-Student-Platform`
3. Configure the service:

| Setting          | Value                         |
| ---------------- | ----------------------------- |
| Root directory   | (leave blank — monorepo root) |
| Build command    | `npm run build`               |
| Start command    | `npm run start`               |
| Healthcheck path | `/api/health`                 |

4. Add all environment variables from `.env.example` — **critical ones:**

| Variable            | Value / Where to get it                                     |
| ------------------- | ----------------------------------------------------------- |
| `NODE_ENV`          | `production`                                                |
| `PORT`              | `4000` (Railway sets this too)                              |
| `DATABASE_URL`      | From Supabase (pooler)                                      |
| `DIRECT_URL`        | From Supabase (session)                                     |
| `JWT_SECRET`        | Generate: `openssl rand -hex 32`                            |
| `FRONTEND_URL`      | Your Vercel domain (e.g. `https://eduverse.vercel.app`)     |
| `GOOGLE_AI_API_KEY` | From [Google AI Studio](https://aistudio.google.com/apikey) |
| `GOOGLE_CLIENT_ID`  | From Google Cloud Console (optional)                        |

5. Deploy. Verify: `https://your-railway-url.up.railway.app/api/health`

---

## 3. Vercel — Frontend (Next.js)

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import `ahmed-progra/EduVerse-Student-Platform`
3. **Root Directory:** `frontend`
4. **Framework Preset:** Next.js (auto-detected)
5. **Environment Variables:**

| Variable               | Value                                         |
| ---------------------- | --------------------------------------------- |
| `NEXT_PUBLIC_API_URL`  | `https://your-railway-url.up.railway.app/api` |
| `NEXT_PUBLIC_SITE_URL` | `https://eduverse.vercel.app`                 |

6. Deploy. Set the domain as **Production** in Vercel dashboard.

---

## 4. Post-deploy verification

| Test         | Steps                                    | Expected                                                        |
| ------------ | ---------------------------------------- | --------------------------------------------------------------- |
| Health       | Visit `{railway-url}/api/health`         | `{"success":true,"data":{"status":"ok","db":"healthy"}}`        |
| Register     | Open Vercel URL → Register a new account | 201, cookie set, redirect to dashboard                          |
| Login        | Logout → Login with same creds           | 200, cookie set, dashboard loads                                |
| Lessons      | Navigate to a course → open a lesson     | Content renders, no console errors                              |
| Python code  | CodeLab → write `print("hello")` → Run   | Output shows "hello"                                            |
| Leaderboard  | Visit `/leaderboard`                     | Rows load (seeded users)                                        |
| CORS check   | Open browser DevTools → Network tab      | No CORS errors on API calls                                     |
| Cookie check | DevTools → Application → Cookies         | `eduverse_token` present, httpOnly ✓, Secure ✓, SameSite=None ✓ |

---

## Environment variable reference

| Variable               | Who needs it                       | Required                |
| ---------------------- | ---------------------------------- | ----------------------- |
| `DATABASE_URL`         | Backend (Prisma runtime)           | ✅                      |
| `DIRECT_URL`           | Backend (Prisma migrations)        | ✅                      |
| `JWT_SECRET`           | Backend                            | ✅                      |
| `FRONTEND_URL`         | Backend (CORS + CSRF origin check) | ✅                      |
| `NODE_ENV`             | Backend + Frontend                 | ✅                      |
| `NEXT_PUBLIC_API_URL`  | Frontend                           | ✅                      |
| `GOOGLE_AI_API_KEY`    | Backend                            | ✅ (AI features)        |
| `JUDGE0_URL`           | Backend                            | optional                |
| `JUDGE0_API_KEY`       | Backend                            | optional                |
| `GOOGLE_CLIENT_ID`     | Backend                            | optional (Google OAuth) |
| `GOOGLE_CLIENT_SECRET` | Backend                            | optional                |
| `NEXT_PUBLIC_SITE_URL` | Frontend                           | optional (SEO)          |

---

## Docker (local only)

For full local reproduction (PostgreSQL + Judge0 + backend + frontend):

```bash
docker compose up -d
npm run dev      # backend + frontend via concurrently
```

For Postgres-only (faster):

```bash
docker compose -f docker-compose.local.yml up -d
npm run dev
```

---

## Updating after deploy

```bash
git push main
# Railway auto-deploys backend (if connected)
# Vercel auto-deploys frontend (if connected)
```

To re-run migrations on production DB after schema changes:

```bash
DATABASE_URL="<supabase-pooler>" DIRECT_URL="<supabase-session>" npx prisma migrate deploy
```

# Troubleshooting Guide

Common issues and their solutions when setting up or running EduVerse.

## Installation

### `npm install` fails

| Symptom           | Cause               | Solution                                                                   |
| ----------------- | ------------------- | -------------------------------------------------------------------------- |
| `node-gyp` errors | Missing build tools | Install build-essential (Linux) / Xcode (macOS) / VS Build Tools (Windows) |
| Permission errors | npm cache issues    | `npm cache clean --force && rm -rf node_modules && npm install`            |
| Network timeouts  | Slow connection     | Use `npm install --prefer-offline` or set a registry mirror                |

### TypeScript compilation errors after install

```bash
npm run build
# then restart your editor/IDE
```

If errors persist, clear TypeScript build cache:

```bash
rm -f **/*.tsbuildinfo
npm run typecheck
```

---

## Database

### `npm run db:migrate` fails

**"Can't reach database server"**

1. Check that PostgreSQL is running
2. Verify `DATABASE_URL` in `.env`
3. If using Docker: `docker compose up -d postgres`
4. Try connecting manually: `psql "$DATABASE_URL"`

**"Migration already applied"**

```bash
npx prisma migrate reset
npm run db:seed
```

### Seed script fails

**"Unique constraint violation"**

The seed script is idempotent. If you see unique violations, the database
may have partial data. Reset and re-seed:

```bash
npm run db:migrate
npm run db:seed
```

**"Lesson count mismatch"**

Verify your curriculum files are correctly registered in
`backend/curriculum/index.ts` with the right `order` values.

---

## Backend

### Backend won't start

**Port in use**

```bash
# Windows
netstat -ano | findstr :4000
# Kill the process using the PID

# Linux/macOS
lsof -i :4000
kill -9 <PID>
```

**"JWT_SECRET not set"**

Set `JWT_SECRET` in your `.env` file. For development, the fallback
`"dev-secret-change-in-production"` is used, but you should set a real secret.

### API returns 500

1. Check `backend.log` and `backend.err.log`
2. Ensure database is reachable
3. Verify all environment variables are set
4. Check Prisma client is generated: `npm run db:generate`

### CORS errors

Configure `FRONTEND_URL` in `.env`:

```
FRONTEND_URL=http://localhost:3000,http://localhost:3001
```

---

## Frontend

### Frontend won't start / build

**"Module not found"**

```bash
npm install
npm run build
```

**"Next.js build fails"**

Use the webpack-based build (Turbopack may be unstable):

```bash
npm run build -w frontend
# This uses --webpack flag per package.json
```

**"Can't find module X"**

Check that the workspace is correctly linked:

```bash
npm install
```

### API calls fail from frontend

1. Open browser DevTools → Network tab
2. Look for failed requests to `localhost:4000/api/...`
3. Ensure backend is running: `curl http://localhost:4000/api/health`
4. Check CORS configuration on the backend

### 3D Lab doesn't load

1. Check WebGL support: visit [get.webgl.org](https://get.webgl.org/)
2. Enable WebGL in browser settings
3. Update graphics drivers
4. Disable browser extensions that block WebGL

---

## AI Features

### AI Mentor / Chat returns errors

**"AI provider not configured"**

Set `GOOGLE_AI_API_KEY` in `.env`. Verify at `GET /api/ai/status`.

**"Rate limited"**

The AI endpoint is rate-limited to 30 requests/minute. Wait and retry.

**"Request timed out"**

Large conversations may exceed the 90-second timeout. Try a shorter message.

### Code review doesn't work

Ensure the code is valid and complete. The AI model has a context window
limit — very long files may be truncated.

---

## Judge0

### Judge0 container won't start

```bash
docker compose up judge0
```

If it fails:

1. Ensure Docker has enough resources (4GB+ RAM recommended)
2. Check if port 2358 is already in use
3. On Linux, ensure `privileged: true` is supported

### Code execution returns errors

1. Verify Judge0 is healthy: `curl http://localhost:2358/info`
2. Check supported language IDs: 71 (Python), 54 (C++)
3. Ensure the API key matches what's in `.env`

---

## Windows-specific

### PowerShell execution policy blocks scripts

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

### npm scripts hang or fail

Use `cmd /c` prefix to bypass PowerShell:

```powershell
cmd /c npm run dev
```

### Port 3000 already in use

```powershell
net stop winnat
# or
npx kill-port 3000
```

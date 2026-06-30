# Authentication

EduVerse uses **JWT-based authentication** with bcrypt password hashing and
optional Google OAuth. The JWT is stored in an **httpOnly, Secure, SameSite**
cookie — never in localStorage.

---

## Overview

```
┌─────────┐     POST /api/auth/register      ┌──────────┐
│         │     ─────────────────────────→    │          │
│         │     { email, username, password } │ Express  │
│ Browser │     ←─────────────────────────    │ Backend  │
│         │     { user, token }               │          │
│         │     + Set-Cookie: eduverse_token  │          │
│         │       (httpOnly, Secure, SameSite)│          │
│         │                                   │          │
│         │     POST /api/auth/login          │          │
│         │     ─────────────────────────→    │          │
│         │     { email, password }           │          │
│         │     ←─────────────────────────    │          │
│         │     { user, token }               │          │
│         │     + Set-Cookie: eduverse_token  │          │
└─────────┘                                   └──────────┘
     │                                              │
     │  Every subsequent request:                    │
     │  Cookie: eduverse_token=<jwt>                  │
     │  (sent automatically by browser)               │
     │─────────────────────────────────────────────→│
     │                                              │
     │                                     JWT verified
     │                                     req.userId set
```

---

## Endpoints

### Register

```
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "user",
  "password": "securepassword"
}
```

Response (201):

```json
{
  "success": true,
  "data": {
    "user": { "id": "uuid", "email": "user@example.com", "username": "user", ... },
    "token": "eyJhbGci..."
  }
}
```

Sets cookie `eduverse_token` (httpOnly, Secure in production, SameSite=None in
production / Lax in development). Token is also returned in body for E2E scripts
that use `Authorization: Bearer`.

Rate limited: **10 requests per minute**.

### Login

```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

Response (200):

```json
{
  "success": true,
  "data": {
    "user": { "id": "uuid", "email": "user@example.com", "username": "user", ... },
    "token": "eyJhbGci..."
  }
}
```

Sets cookie `eduverse_token`. Rate limited: **10 requests per minute**.

### Logout

```
POST /api/auth/logout
```

Clears the `eduverse_token` cookie. Returns `{ "success": true, "data": { "message": "Logged out" } }`.

### Google OAuth

```
POST /api/auth/google
Content-Type: application/json

{
  "email": "user@gmail.com",
  "name": "User Name",
  "googleId": "12345..."
}
```

Requires `GOOGLE_CLIENT_ID` to be configured. Returns 501 (Not Implemented)
if Google OAuth is not configured.

### Get current user

```
GET /api/auth/me
```

Cookie or `Authorization: Bearer <token>` header accepted. Returns the
authenticated user's profile. Response is cached (30s TTL).

---

## Token Format

- **Algorithm**: HS256
- **Payload**: `{ userId: string, iat: number, exp: number }`
- **Expiry**: 7 days (configurable via `JWT_EXPIRES_IN`)
- **Secret**: Set via `JWT_SECRET` environment variable

---

## Cookie Options

| Setting    | Development | Production |
| ---------- | ----------- | ---------- |
| `httpOnly` | `true`      | `true`     |
| `secure`   | `false`     | `true`     |
| `sameSite` | `lax`       | `none`     |
| `maxAge`   | 7 days      | 7 days     |

In production (Vercel frontend + Railway backend are different origins),
`SameSite=None` is required for cross-domain cookies. `Secure` is mandatory
with `None`.

---

## CSRF Protection

Since `SameSite=None` removes the browser's CSRF protection, a lightweight
**origin check middleware** (`backend/src/middleware/csrf.ts`) guards all
mutating requests (POST/PUT/PATCH/DELETE) in production:

- Reads the `Origin` header (or `Referer` as fallback)
- Validates it matches the configured `FRONTEND_URL`
- Returns 403 on mismatch

No CSRF token or double-submit pattern is needed — the origin check is simpler
and provides equivalent protection when all state-changing endpoints are
behind it.

---

## Security Design

| Measure          | Implementation                                                    |
| ---------------- | ----------------------------------------------------------------- |
| Password storage | bcrypt hashing (no plaintext)                                     |
| Token signing    | HMAC-SHA256 with server secret                                    |
| Cookie transport | httpOnly (inaccessible to JS)                                     |
| CSRF protection  | Origin header check (production)                                  |
| Rate limiting    | 10 req/min on auth, 30/min on AI, 100/min general                 |
| CORS             | Restricted to configured `FRONTEND_URL`                           |
| Security headers | `nosniff`, `DENY`, `no-referrer`, HSTS, CSP                       |
| Input validation | Custom validators + Zod schemas                                   |
| Google OAuth     | Gated behind `GOOGLE_CLIENT_ID`, ID token verified against Google |

### JWT secret

The JWT secret is read from `JWT_SECRET`. In development, a warning is logged
if it's not set and a fallback is used. **In production, always set a strong,
unique `JWT_SECRET`.**

---

## Frontend Integration

The frontend **never stores the JWT in localStorage**. The cookie is managed
entirely by the browser:

```
Login → server sets httpOnly cookie → redirect to /dashboard
Every API call → browser sends Cookie header automatically
  (credentials: 'include' on fetch)
401 response → clear user state → redirect to /auth/login
Logout → POST /auth/logout → server clears cookie → redirect to /
```

The `api-client.ts` service handles:

- Automatic cookie transmission via `credentials: 'include'`
- 401 response → error thrown, caught by `auth-store.loadUser()`
- No token injection or localStorage reads

---

## Auth Middleware

Backend routes use two middleware variants:

- `requireAuth` — Returns 401 if no valid token (reads cookie, fallback to Bearer header)
- `optionalAuth` — Attaches user if token present, continues if not

Public routes (no auth):

| Route                                   | Purpose            |
| --------------------------------------- | ------------------ |
| `POST /api/auth/register`               | Registration       |
| `POST /api/auth/login`                  | Login              |
| `POST /api/auth/logout`                 | Logout             |
| `POST /api/auth/google`                 | Google OAuth       |
| `GET /api/leaderboard`                  | Public leaderboard |
| `GET /api/shop/items`                   | Shop catalog       |
| `GET /api/projects/portfolio/:username` | Public portfolio   |

---

## Password Policy

- Minimum length: 6 characters (validated server-side)
- Hashed with bcrypt (salt rounds: 10)
- No password complexity requirements enforced (email/password only)
- Google OAuth users have an empty password hash and cannot use password login

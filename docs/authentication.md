# Authentication

EduVerse uses **JWT-based authentication** with bcrypt password hashing and
optional Google OAuth.

---

## Overview

```
┌─────────┐     POST /api/auth/register      ┌──────────┐
│         │     ─────────────────────────→    │          │
│         │     { email, username, password } │ Express  │
│ Browser │     ←─────────────────────────    │ Backend  │
│         │     { user, token }               │          │
│         │                                   │          │
│         │     POST /api/auth/login          │          │
│         │     ─────────────────────────→    │          │
│         │     { email, password }           │          │
│         │     ←─────────────────────────    │          │
│         │     { user, token }               │          │
└─────────┘                                   └──────────┘
     │                                              │
     │  Every subsequent request:                    │
     │  Authorization: Bearer <token>                │
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

Rate limited: **10 requests per minute**.

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
Authorization: Bearer <token>
```

Returns the authenticated user's profile. Response is cached (30s TTL).

---

## Token Format

- **Algorithm**: HS256
- **Payload**: `{ userId: string, iat: number, exp: number }`
- **Expiry**: 7 days (configurable via `JWT_EXPIRES_IN`)
- **Secret**: Set via `JWT_SECRET` environment variable

---

## Security Design

| Measure          | Implementation                             |
| ---------------- | ------------------------------------------ |
| Password storage | bcrypt hashing (no plaintext)              |
| Token signing    | HMAC-SHA256 with server secret             |
| Rate limiting    | 10 req/min on auth endpoints, 30/min on AI |
| CORS             | Restricted to configured `FRONTEND_URL`    |
| Security headers | `nosniff`, `DENY`, `no-referrer`           |
| Input validation | Custom validators + Zod schemas            |
| Google OAuth     | Gated behind `GOOGLE_CLIENT_ID` config     |

### JWT secret

The JWT secret is read from `JWT_SECRET`. In development, a warning is logged
if it's not set and a fallback is used. **In production, always set a strong,
unique `JWT_SECRET`.**

---

## Frontend Integration

The frontend stores the JWT in `localStorage` via Zustand (`auth-store.ts`):

```
Login → store token → redirect to /dashboard
Every API call → api-client reads token → adds Bearer header
401 response → clear token → redirect to /auth/login
Logout → clear token + user → redirect to /
```

The `api-client.ts` service handles:

- Automatic token injection
- 401 response interception
- Token refresh (via re-login)

---

## Protected Routes

Backend routes use two middleware variants:

- `requireAuth` — Returns 401 if no valid token
- `optionalAuth` — Attaches user if token present, continues if not

Public routes (no auth):

| Route                                   | Purpose            |
| --------------------------------------- | ------------------ |
| `POST /api/auth/register`               | Registration       |
| `POST /api/auth/login`                  | Login              |
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

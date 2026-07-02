# Security Policy

## Supported Versions

EduVerse is under active development. Security fixes are applied to the `main` branch and the latest tagged release.

| Version                | Supported |
| ---------------------- | --------- |
| `main` (bleeding edge) | ✅        |
| Latest tagged release  | ✅        |
| Older releases         | ❌        |

If you are using an older release, we recommend upgrading to the latest version as soon as possible.

## Reporting a Vulnerability

**Please do not open a public issue for security vulnerabilities.**

Instead, report it privately using one of these methods:

1. **GitHub private vulnerability reporting** — navigate to the **Security** tab of the repository and click **Report a vulnerability**.
2. **Email the maintainers** — if you do not have access to GitHub's private reporting, reach out to **eduverse@googlegroups.com** with a clear description and reproduction steps.

We aim to:

- Acknowledge receipt within **72 hours**
- Provide an initial assessment and remediation timeline after triage
- Keep you informed throughout the process

## What to include

When reporting, please include:

- A description of the vulnerability and its potential impact
- Steps to reproduce (proof-of-concept is ideal)
- Affected component(s): frontend, backend, database, AI service, authentication, etc.
- Any suggested remediation (if known)

## Disclosure policy

We believe in coordinated disclosure. We will:

1. Confirm the vulnerability and assess its severity
2. Develop and test a fix
3. Release the fix in a new version
4. Publicly disclose the vulnerability after users have had reasonable time to update

We ask that reporters give us a reasonable window to address vulnerabilities before making any details public.

## Security practices

- All secrets live in **gitignored `.env` files** and are never committed. Use `.env.example` as the template.
- The repository's history and current tree must contain **no** real API keys, database URLs, or JWT secrets. If you find one, treat it as a vulnerability and report it privately so the credential can be rotated.
- `JWT_SECRET` must be changed from the example value in any deployed environment.

### Security-relevant design notes

- Passwords are hashed with `bcryptjs`; plaintext passwords are never stored.
- Authentication uses signed JWTs (`jsonwebtoken`) delivered as an **`httpOnly`, `Secure`, `SameSite` cookie**, so tokens are not readable from JavaScript. The signing algorithm is pinned to `HS256` on both sign and verify to prevent algorithm-confusion attacks.
- State-changing requests in production must carry an `Origin`/`Referer` that **exactly** matches a configured `FRONTEND_URL` origin (`csrfGuard`). The check compares full origins, not string prefixes, so lookalike hosts (e.g. `https://app.example.com.evil.com`) are rejected.
- API input is validated with dedicated validation utilities (`lib/validate.ts`). Avatar uploads are restricted to base64 **raster** image data URLs (PNG/JPEG/GIF/WebP); SVG is rejected to avoid script-carrying data URLs.
- Lesson HTML is sanitized with DOMPurify before it is rendered.
- Rate limiting (`express-rate-limit`) is applied globally, with tighter limits on auth, code-execution, and AI endpoints.
- CORS is restricted to the configured `FRONTEND_URL` origin(s), and standard hardening headers (CSP, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, HSTS, `Permissions-Policy`) are set on both the API and the Next.js app.
- Data-access queries are scoped by the authenticated user's id; per-resource ownership is verified before reads/writes to prevent IDOR.

### Dependency advisories

`npm audit` is run in CI and fails the build on **high/critical** advisories. A small number of
**moderate** advisories are knowingly accepted because they are transitive, build-time or
editor-internal, and cannot be fixed without breaking-change downgrades:

- **`dompurify` (via `monaco-editor`)** — the code editor bundles its own pinned copy of DOMPurify for internal rendering. The application's own DOMPurify (used to sanitize lesson HTML) is kept current. Resolved when `monaco-editor` updates its pin.
- **`postcss` (via `next`)** — Next.js bundles its own `postcss` for its build pipeline. `npm audit fix --force` would downgrade Next.js to a years-old major version, so it is intentionally not applied. Resolved by upstream Next.js updates.

These are re-evaluated on each dependency bump.

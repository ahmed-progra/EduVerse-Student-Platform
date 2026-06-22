# Frequently Asked Questions

## General

### What is EduVerse?

EduVerse is an AI-powered, gamified learning platform that transforms programming
and academic education into an RPG adventure. It features a step-through code
visualizer, personal AI mentor, skill tree, coding battles, and more.

### Who is EduVerse for?

EduVerse is built for university students, self-taught learners, and anyone who
wants to learn programming or academic subjects (mathematics, physics, science)
in an interactive, engaging way.

### Is EduVerse free?

EduVerse is open source under the MIT license. You can self-host it for free.
If you use the hosted version, pricing may vary — check the project's website.

### What subjects are available?

- **Programming**: Python, HTML, CSS, C++ (124 lessons)
- **Academic**: Mathematics, Physics, Science (48 lessons)
- **Total**: 7 courses, 172 lessons

---

## Technical

### What tech stack does EduVerse use?

| Category    | Technology                                                                 |
| ----------- | -------------------------------------------------------------------------- |
| Frontend    | Next.js 16 (App Router), React 19, Framer Motion, Tailwind CSS v4, Zustand |
| Backend     | Express 5, Prisma ORM, PostgreSQL (Supabase), SQLite (local dev)           |
| AI          | Google AI Studio — Gemini                                                  |
| Code Editor | Monaco Editor                                                              |
| Code Exec.  | Skulpt (Python, in-browser) · Judge0 (C++)                                 |
| 3D          | Three.js + React Three Fiber                                               |

### Why does the `/lab` need WebGL?

The 3D Interactive Lab uses Three.js to render educational 3D scenes.
WebGL is required. If your browser doesn't support it, the lab will show
a fallback message.

### How does the AI Mentor work?

The AI Mentor (at `/mentor`) uses Google Gemini to build a persistent,
cross-course coaching profile. It tracks your mastery across topics,
assigns daily/weekly missions, and provides personalized recommendations.
All AI calls are routed through the backend at `/api/ai/*` and `/api/mentor/*`.

### Can I use EduVerse offline?

Some features work offline (announcements, resources via localStorage),
but most features require a network connection for the backend API and AI.

---

## Development

### How do I set up EduVerse locally?

See the [DEVELOPMENT.md](DEVELOPMENT.md) guide for full instructions.

### How do I add a new course?

Create a curriculum file in `backend/curriculum/`, define lessons using the
`renderLesson()` helper, then add it to `backend/curriculum/index.ts`.
Run `npm run db:seed` to populate the database.

### How do I run the E2E tests?

```bash
npm run test:e2e
```

### How do I contribute?

See [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.

---

## Troubleshooting

### The frontend can't reach the backend

1. Ensure the backend is running on port 4000
2. Check that `NEXT_PUBLIC_API_URL` is set correctly
3. Verify CORS settings in the backend `.env`
4. Check browser console for network errors

### The database seed fails

1. Ensure your database is running
2. Verify `DATABASE_URL` in `.env` is correct
3. Run `npm run db:migrate` first
4. Check for unique constraint violations

### The AI features don't work

1. Verify `GOOGLE_AI_API_KEY` is set
2. Check `/api/ai/status` returns `{ configured: true }`
3. Ensure the backend has internet access
4. Check the backend logs for API errors

### The 3D Lab doesn't render

1. Ensure your browser supports WebGL
2. Check for JavaScript errors in the console
3. Try a different browser (Chrome, Firefox, Edge)
4. Check that Three.js loaded correctly

# Frontend Architecture

The EduVerse frontend is a **Next.js 16** application using the **App Router**,
built with **React 19**, styled with **Tailwind CSS v4**, and animated with
**Framer Motion**.

---

## Tech Stack

| Technology      | Purpose                                          |
| --------------- | ------------------------------------------------ |
| Next.js 16      | React framework, App Router, SSR/SSG             |
| React 19        | UI library                                       |
| Tailwind CSS v4 | Utility-first styling with CSS variables theming |
| Framer Motion   | Layout animations, entrance choreography         |
| Three.js + R3F  | 3D Interactive Lab                               |
| Zustand         | Client-side state (auth store)                   |
| Monaco Editor   | Code editor in Code Lab and Lesson pages         |
| Skulpt          | In-browser Python execution and step visualizer  |
| Lucide React    | Icon library                                     |

---

## Routes

The App Router defines **23 route segments**:

| Route             | Page                            | Auth     |
| ----------------- | ------------------------------- | -------- |
| `/`               | Landing page                    | Public   |
| `/dashboard`      | Learner dashboard               | Required |
| `/courses`        | Course catalog                  | Required |
| `/courses/[id]`   | Course detail with lesson list  | Required |
| `/lessons/[id]`   | Lesson viewer + code visualizer | Required |
| `/lab`            | 3D Lab subject selection        | Required |
| `/lab/[subject]`  | Interactive 3D scene            | Required |
| `/codelab`        | Code playground                 | Required |
| `/mentor`         | AI Mentor dashboard             | Required |
| `/apprentice`     | Teach the AI (Pip)              | Required |
| `/projects`       | Project studio list             | Required |
| `/projects/[id]`  | Project detail + editor         | Required |
| `/battle`         | Battle arena                    | Required |
| `/leaderboard`    | Rankings                        | Required |
| `/shop`           | Cosmetics shop                  | Required |
| `/skill-tree`     | Ability tree                    | Required |
| `/placement-test` | Adaptive placement assessment   | Required |
| `/resources`      | Learning resources library      | Required |
| `/announcements`  | Bulletin board                  | Required |
| `/profile`        | User profile settings           | Required |
| `/u/[username]`   | Public portfolio                | Public   |
| `/auth/login`     | Login                           | Public   |
| `/auth/register`  | Registration                    | Public   |

---

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout with providers
│   ├── providers.tsx       # Client providers (auth, etc.)
│   ├── globals.css         # Design system tokens + Tailwind
│   ├── error.tsx           # Global error boundary
│   ├── loading.tsx         # App-level loading state
│   ├── not-found.tsx       # 404 page
│   └── */page.tsx          # Route pages
├── components/
│   ├── layout/             # App shell, navigation, AI panels
│   │   ├── app-layout.tsx         # Main app shell
│   │   ├── command-palette.tsx     # ⌘K command menu
│   │   ├── ai-panel-shell.tsx      # Shared AI panel wrapper
│   │   ├── ai-challenge-panel.tsx  # AI challenge generator
│   │   ├── ai-exam-panel.tsx       # AI exam mode
│   │   ├── ai-hints-panel.tsx      # Progressive hints
│   │   ├── ai-mentor-panel.tsx     # Mentor chat panel
│   │   └── ai-review-panel.tsx     # Code review panel
│   └── ui/                 # Design primitives
│       ├── glass-card.tsx          # Frosted glass container
│       ├── gradient-button.tsx     # Themed button
│       ├── confetti.tsx            # Celebration effect
│       ├── skeleton.tsx            # Loading skeletons
│       ├── xp-bar.tsx              # XP progress bar
│       ├── empty-state.tsx         # Empty state placeholder
│       ├── error-boundary.tsx      # React error boundary
│       ├── animated-number.tsx     # Count-up animation
│       └── tooltip.tsx             # CSS tooltip
├── features/               # Domain modules (12)
│   ├── lab/                # 3D Lab scenes, models, workbench
│   ├── mentor/             # Mentor dashboard components
│   ├── apprentice/         # Pip avatar, grade card
│   ├── lessons/            # AI tools, mentor, quiz checkpoint
│   ├── learning/           # Assessment runner, roadmap viewer
│   ├── visualizer/         # Step-through code visualizer
│   ├── skill-map/          # SVG skill tree
│   ├── dashboard/          # AI coach card
│   ├── landing/            # Hero demo animation
│   ├── announcements/      # Bulletin board components
│   ├── resources/          # Resource library components
│   └── auth/               # Auth shell layout
├── hooks/                  # Custom React hooks
│   ├── use-local-storage.ts
│   ├── use-scroll-reveal.ts
│   └── use-topic-options.ts
├── lib/                    # Utilities
│   ├── motion.ts           # Framer Motion variants
│   ├── streak.ts           # Activity streak tracking
│   ├── content.ts          # Feature card data
│   └── utils.ts            # General helpers
├── services/
│   └── api-client.ts       # Cached, deduplicated API client
├── stores/
│   └── auth-store.ts       # Zustand auth state
└── types/
    ├── apprentice.ts       # Apprentice API types
    ├── mentor.ts           # Mentor API types
    ├── project.ts          # Project API types
    └── skulpt.d.ts         # Skulpt type declarations
```

---

## State Management

- **Auth state**: Zustand store (`auth-store.ts`), persisted to localStorage
- **API cache**: In-memory TTL cache (30 seconds) in `api-client.ts`
- **Feature state**: Local to route components via `useState` / `useEffect`
- **Persistent data**: Announcements and Resources use localStorage

### Data flow

```
Page component
  → api.getLessons(id)       # calls API client
  → api-client.ts checks cache
    → cache hit → return cached
    → cache miss → fetch → deduplicate if in-flight → cache → return
  → setState(data)
  → render
```

---

## Code Execution

| Language | Runtime                         | Visualizer                                        |
| -------- | ------------------------------- | ------------------------------------------------- |
| Python   | Skulpt (in-browser)             | Step-by-step with live variables, AST, call stack |
| HTML/CSS | Sandboxed `<iframe>`            | Live preview                                      |
| C++      | Judge0 (backend → external API) | Output display                                    |

---

## 3D Interactive Lab

The `/lab` feature uses **Three.js** with **React Three Fiber**:

- `scenes.ts` — 15+ parametric 3D scenes covering math, physics, biology
- `model-viewer.tsx` — GLTF/GLB model loader with orbit controls
- `lab-workbench.tsx` — Real-time parameter sliders and controls
- `lab-chart.tsx` — Live data charting alongside 3D view
- `three-scene.tsx` — Scene initialization and render loop

---

## Design System

The "Code Sorcery" theme is defined via CSS custom properties in `globals.css`:

- **Colors**: Warm dark amber palette in OKLCH
- **Typography**: Bricolage Grotesque (display), Work Sans (body), Geist Mono (code)
- **Motion**: Consistent easing curves, entrance choreography, reduced-motion support
- **Components**: Glass cards, gradient buttons, skeleton loaders

Full reference: [design-system.md](design-system.md)

---

## Performance Considerations

- **Code splitting**: Monaco Editor, Three.js, and Skulpt are dynamically imported
- **Image optimization**: Next.js `next/image` for assets
- **Font loading**: `next/font` for Bricolage Grotesque, Work Sans, Geist Mono
- **Caching**: API client has 30s TTL with request deduplication
- **Animations**: Framer Motion with `prefers-reduced-motion` respect

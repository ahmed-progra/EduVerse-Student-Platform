# Code Sorcery — Complete EduVerse Design

**Date:** 2026-06-11
**Status:** Design phase
**Scope:** All pages — full visual identity redesign

---

## 1. Design Identity

"Code Sorcery" — a midnight coding platform where writing code feels like casting spells. The UI is a wizard's workbench: dark warm canvas, amber candlelight accents, carved-serif headings like ancient stone, and code comments used as visual ornamentation.

The goal is a strong point of view that cannot be confused with an AI-generated template. No violet, no cool tones, no rounded pills, no glassmorphism, no particles, no aurora. The personality comes from typography and warmth, not decoration.

### Core Philosophy

The interface must behave like a developer tool — precise, functional, and structured — not like a marketing dashboard or SaaS product. This governs all UI density decisions, animation choices, component simplicity, and interaction style.

---

## 2. Color Palette (OKLCH)

Warm dark canvas. Amber/gold accent like candlelight. No cool tones.

| Token | Value | Usage |
|-------|-------|-------|
| `--color-eduverse-bg` | `oklch(12% 0.02 55)` | Page background — deep warm near-black |
| `--color-eduverse-surface` | `oklch(16% 0.025 50)` | Sidebar, secondary surfaces |
| `--color-eduverse-raised` | `oklch(20% 0.03 50)` | Hover states, tooltips |
| `--color-eduverse-editor` | `oklch(9% 0.015 55)` | Code editor, darkest surface |
| `--color-eduverse-glass` | `oklch(16% 0.025 50 / 0.78)` | Backdrop surfaces (sticky nav only) |
| `--color-eduverse-border` | `oklch(70% 0.03 55 / 0.08)` | Hairline card borders |
| `--color-eduverse-border-mid` | `oklch(72% 0.04 55 / 0.14)` | Stronger borders, inputs |
| `--color-eduverse-accent` | `oklch(78% 0.14 85)` | Amber/gold — links, icons, highlights |
| `--color-eduverse-accent-strong` | `oklch(60% 0.18 75)` | Button fills |
| `--color-eduverse-accent-light` | `oklch(85% 0.1 85)` | Hover on accent elements |
| `--color-eduverse-accent-soft` | `oklch(78% 0.14 85 / 0.1)` | Subtle accent tinted surfaces |
| `--color-eduverse-success` | `oklch(76% 0.14 165)` | Console output, positive actions |
| `--color-eduverse-warning` | `oklch(80% 0.13 85)` | Amber-warm (matches accent) |
| `--color-eduverse-danger` | `oklch(66% 0.19 25)` | Errors, destructive actions |
| `--color-eduverse-text` | `oklch(93% 0.01 80)` | Warm white — headings, primary |
| `--color-eduverse-text-body` | `oklch(72% 0.02 70)` | Warm gray — body text |
| `--color-eduverse-text-muted` | `oklch(55% 0.03 65)` | Dim warm — labels, metadata |
| `--color-eduverse-gold` | `oklch(82% 0.14 85)` | Leaderboard rank 1 |
| `--color-eduverse-silver` | `oklch(80% 0.01 270)` | Leaderboard rank 2 |
| `--color-eduverse-bronze` | `oklch(68% 0.1 60)` | Leaderboard rank 3 |

One accent family. No purple, no violet. Warm amber across the entire identity.

### Accent Color Usage Hierarchy

To preserve visual hierarchy and prevent overuse:

- `--color-eduverse-accent-strong` → primary actions only (main buttons, confirmed actions, active states)
- `--color-eduverse-accent` → links, highlights, key emphasis
- `--color-eduverse-accent-soft` → background tints only, never interactive elements
- `--color-eduverse-gold/silver/bronze` → leaderboard only (strictly isolated usage)
- `--color-eduverse-warning` → warnings only (non-destructive alerts, hints)

Rule: if something is visually important, it does NOT automatically become accent-colored.

---

## 3. Typography

| Role | Font | Weights | Notes |
|------|------|---------|-------|
| **Display/Headings** | Fraunces | 400, 600, 700 (variable) | Set SOFT axis to ~80 for warm ink feel. WONK axis optional. |
| **Body/UI** | IBM Plex Sans | 400, 500, 600 | Clean, warm, not overused. |
| **Monospace** | IBM Plex Mono | 400, 500, 600 | Warm monospace, matches body font family. |

### Font Sizes

- H1: clamp(2rem, 4vw, 3rem) — Fraunces 600, tight tracking -0.02em
- H2: clamp(1.25rem, 2.5vw, 1.75rem) — Fraunces 600
- H3: 1.125rem — Fraunces 600
- Body: 0.938rem (15px) — IBM Plex Sans 400, line-height 1.65
- Small/Meta: 0.813rem (13px) — IBM Plex Sans 400
- Code/Data: same size as body — IBM Plex Mono 400
- Section headers: 0.813rem IBM Plex Mono, `// Section Name` style

### Design System Hierarchy

Font choice defines meaning, not aesthetics:

- **Fraunces**: identity, headings, emotional hierarchy
- **IBM Plex Sans**: interaction, UI structure, readable content
- **IBM Plex Mono**: data, metrics, code, system information

### Rules

- All numeric data (stats, XP, level, rankings, counts) uses IBM Plex Mono
- Section headers use code-comment style: `// Dashboard` in amber monospace
- Body measure max-width: 68ch
- No Inter, no Work Sans, no Geist

---

## 4. Components

### Card
- `border-radius: 4px` (IDE-tab sharp, not decorative)
- Background: `var(--color-eduverse-editor)` (oklch(9% 0.015 55))
- Border: `0.5px solid var(--color-eduverse-border)`
- No shadows. No hover lift. No hover effects.
- Padding: 24px (p-6)

### Button — Primary
- Background: `var(--color-eduverse-accent-strong)`
- Color: white
- Border-radius: 4px
- Padding: 10px 20px (py-2.5 px-5)
- Font: IBM Plex Sans 500
- Active: scale(0.98)
- Hover: brightness(1.1)

### Button — Secondary
- Background: transparent
- Border: `1px solid var(--color-eduverse-border-mid)`
- Color: `var(--color-eduverse-text-body)`
- Border-radius: 4px

### Button — Ghost
- No background, no border
- Color: `var(--color-eduverse-text-muted)`
- Hover: color to text-body

### Input
- Background: `var(--color-eduverse-editor)`
- Border: `1px solid var(--color-eduverse-border-mid)`
- Focus: amber accent ring (2px)
- Border-radius: 4px
- Padding: 10px 14px
- Font: IBM Plex Sans 400
- Placeholder: `var(--color-eduverse-text-muted)`

### Sidebar (Nav)
- Background: `var(--color-eduverse-surface)`
- Width: 240px (lg), full-screen overlay on mobile
- Current page indicator: amber left border + amber text
- Inactive items: muted warm text
- Items are monospace labels, letter-spacing 0.02em
- Default weight: 400
- Active item weight: 500
- Monospace is structural, not decorative

### XpBar
- Track: `var(--color-eduverse-raised)`, height 8px (sm), 12px (md), 16px (lg)
- Fill: linear-gradient to right, amber accent colors
- Border-radius: 2px (harder than pill)
- Label above: monospace, "Level X · XXXX / XXXX XP"

### Icon convention
- All icons: naked. No background circle, no pill, no colored container.
- Icon color: `var(--color-eduverse-text-muted)` by default
- Interactive icons (links, buttons): `var(--color-eduverse-accent)` on hover

### Section headers
- `<h2 className="flex items-center gap-2 text-sm font-mono text-eduverse-text-muted">`
- `<span className="text-eduverse-accent">//</span> Section Name`
- No decorative icons in headers

### EmptyStates
- Centered layout with large icon + title + description + optional CTA button
- Icon: text-muted, no background

---

## 5. Spacing System

Consistent spacing scale. No arbitrary values.

| Token | Value |
|-------|-------|
| xs | 4px |
| sm | 8px |
| md | 12px |
| lg | 16px |
| xl | 24px |
| 2xl | 32px |

Usage rules:
- UI components must never use arbitrary spacing values
- Layout spacing must always reference this scale
- Section padding between groups: 48–64px (3x–4x of 2xl)

---



## 6. Page Layouts

### App Layout (shared)
```
┌──────────────────────────────────────────┐
│  ┌──────────┐  ┌───────────────────┐    │
│  │          │  │                   │    │
│  │  Sidebar  │  │   Main Content   │    │
│  │  240px    │  │   (flex-1)       │    │
│  │          │  │   max-w-7xl      │    │
│  │          │  │   mx-auto        │    │
│  │          │  │                   │    │
│  └──────────┘  └───────────────────┘    │
└──────────────────────────────────────────┘
```

Sidebar: fixed left, full height. Logo at top (EduVerse in Fraunces), then nav items.
Mobile: sidebar hidden behind hamburger, overlay when open.

### Dashboard
- Welcome header (Fraunces H1, amber username)
- Streak badge (amber flame + count, no background pill — just text + icon inline)
- XP bar card (full width)
- `// Quick Actions` section header
- 4 card grid (2x2 on mobile, 4 col on md+), each with one icon + label
- `// Stats` section header
- 4 stat cards (2x2 grid), each with icon + monospace number + label
- `// Recent Activity` section header
- Activity list with icon + source name + date + XP amount

### Courses
- Page title (Fraunces H1)
- `// Available Paths` section header
- 2-column card grid
- Each card: emoji/icon + course title (Fraunces H3) + description + `N lessons` in monospace

### Course Detail
- Left panel: lesson list (`// Lessons` header, numbered items, current highlighted)
- Right panel: lesson content (title, body, code block, navigation buttons)

### Battle
- `// Battle Arena` header
- Two side-by-side editor panels (left: player 1, right: player 2)
- Top bar: challenge name, timer, status
- Bottom: chat or result area

### Code Lab
- Full screen editor layout
- Left: file tree sidebar (`// Files`)
- Center: code editor (monospace, dark background)
- Bottom: output panel with tab for "Console", "Tests", "Results"
- Top: run button (amber filled), language selector, settings

### Skill Tree
- `// Grimoire` header
- Interactive nodes connected by lines
- Each node: icon + skill name + unlock state + XP cost
- Locked nodes in muted tones, unlocked in amber, next available highlighted
- Horizontal scroll on mobile, centered on desktop

### Leaderboard
- `// Hall of Fame` header
- Top 3: large cards with gold/silver/bronze accents, avatar, username, XP
- Rest: numbered list with rank, avatar, username, XP
- Current user highlighted if on the list
- All XP values in monospace

### Shop
- `// Emporium` header
- Grid of item cards
- Each card: item icon/emoji + name + price + "Buy" button
- Purchased items show "Owned" badge

### Profile
- `// Profile` header
- Avatar + username + level (Fraunces H2)
- XP bar (small)
- Stats row (monospace values)
- Edit profile form (inputs with labels)
- Achievements/badges section

### Auth (Login / Register)
- Centered card on full dark background
- Logo (Fraunces) + tagline at top
- Form fields (email, password, username for register)
- Submit button (amber filled)
- Link to switch between login/register

---

## 7. Motion Model

Strict motion tiers. Motion is a system state, not a visual style.

| Tier | Allowed | Examples |
|------|---------|----------|
| Static UI | No transitions or animations | Cards, buttons idle, text |
| Loading | Subtle pulse only | Skeleton placeholders |
| Page entrance | Single transition on initial render | Opacity + translateY, fires once |
| Continuous | Strictly forbidden | No loops, no ambient movement |

### Page Entrances
- One choreography per page load: opacity 0 → 1 + translateY 16px → 0
- Duration: 500ms
- Easing: cubic-bezier(0.22, 1, 0.36, 1)
- Stagger: 80ms between items, max 5 items in the stagger
- No entrance animation on subsequent navigations (instant)
- prefers-reduced-motion: all entrances resolve to final state immediately

### Interaction Micro-Feedback
Hover states are allowed only as subtle, non-decorative feedback:
- Border color shift (low intensity)
- Background tint change (very slight)
- No shadows, no glow effects, no elevation
- Transitions: 120–180ms, linear or simple ease-out
- Feedback must feel like UI responsiveness, not animation

### Per-element Rules
- Buttons: active scale(0.98), hover: brightness(1.1) (filled) or border lightens (outlined)
- Cards: no hover, no lift, no glow, no effects
- Links: color change to amber on hover (no underline unless in body text)
- Sidebar items: background tint on hover, amber text for active
- No tilt, no parallax, no glare, no shimmer sweep

---

## 8. Empty / Loading / Error States

### Loading
- Skeleton pulses: muted surface-colored blocks with pulse animation
- Shape matches the content (card-sized rectangles for cards, lines for text)
- aria-hidden="true" so screen readers skip it

### Empty
- Large icon (text-muted, no background)
- Title: H3 Fraunces at text-body color
- Message: body text at text-muted
- Optional CTA: primary button

### Error
- Same as EmptyState with danger-colored icon
- Message explains the problem
- "Try again" button when appropriate
- Offline detection: wifi-off icon + "Can't reach the server" message

---

## 9. Accessibility Requirements (WCAG AA Baseline)

All pages must comply with:
- Minimum WCAG AA contrast compliance for text and UI elements
- Visible focus states for all interactive elements (keyboard navigation)
- All icon-only buttons must include `aria-label`
- Reduced-motion mode must disable entrance animations and loading pulses (fallback to static placeholders)

Accessibility is a core system requirement, not a feature layer.

---

## 10. Density Mode System

Two layout density modes:
- **Default mode**: standard spacing (dashboard, profile, shop)
- **Compact mode**: reduced spacing (Code Lab, Battle, editor-heavy views)

Rules:
- Spacing scale remains the same (4/8/12/16/24/32px)
- Only applied padding/margins adjust contextually
- Never affects typography scale

---

## 11. Code Editor Styling

For all editor-based views (Code Lab, Battle, lessons):
- Font size: 13–14px
- Line height: 1.6
- Font: IBM Plex Mono
- Visible gutter (line numbers required)
- Active line highlight: extremely subtle background tint only
- Selection highlight: accent-soft tint (low opacity)

The editor must feel like a real development environment, not a styled text box.

---

## 12. Controlled Visual Variation

To prevent excessive uniformity while keeping strict design rules, controlled variation is allowed within constraints.

### 12.1 Page Rhythm Flexibility

All pages follow the same design system but can vary layout rhythm:
- Sections can alternate between dense mode (tight grouping, data-heavy) and relaxed mode (more spacing between blocks)
- Variation applies only to layout spacing between sections, not component styles
- Component tokens (colors, typography, radius, motion) remain unchanged

### 12.2 Emphasis Distribution

Each page must choose one primary focal zone:
- One section per page can be visually dominant (slightly larger spacing, stronger hierarchy)
- All other sections remain standard density

Examples:
- Dashboard → XP + progress section is dominant
- Shop → featured item grid is dominant
- Leaderboard → top 3 section is dominant
- Skill Tree → the tree visualization is dominant

### 12.3 Layout Asymmetry

Within grid systems:
- Slight asymmetry is allowed (e.g., 2/3 + 1/3 split instead of strict equal grids)
- Must remain structurally aligned (no chaos layouts)
- Asymmetry is used only to guide attention, never for decoration

### 12.4 Content Density Scaling

Within a page, sections need not carry equal information density:
- High-density sections: tables, stats, logs
- Medium-density sections: cards, lists
- Low-density sections: hero, empty states

Density is a storytelling tool, not a fixed grid rule.

### 12.5 Micro-Personality Zones

Each page may include one "personality zone" — a section that slightly emphasizes:
- Typography scale contrast (e.g., larger Fraunces heading than other sections)
- Spacing contrast (more generous padding around that section)
- Layout emphasis (positioning, asymmetry)

The zone still obeys: same colors, same components, same motion rules.

---

## 13. File Changes

All frontend files in `frontend/src/`:

| File | Change |
|------|--------|
| `app/globals.css` | Replace all color tokens (violet → warm amber). Update fonts. Remove all vestiges of old design (.app-ambient aurora, .app-particles). Update .app-card tokens. |
| `app/layout.tsx` | Update font imports (Fraunces, IBM Plex Sans, IBM Plex Mono). |
| `components/ui/glass-card.tsx` | Keep as flat card, no hover prop. |
| `app/dashboard/page.tsx` | Code-comment headers, amber accent, monospace data, naked icons, Fraunces headings. |
| `app/courses/page.tsx` | Same treatment. |
| `app/courses/[id]/page.tsx` | Same treatment. |
| `app/battle/page.tsx` | Same treatment. |
| `app/codelab/page.tsx` | Same treatment. |
| `app/leaderboard/page.tsx` | Same treatment. |
| `app/shop/page.tsx` | Same treatment. |
| `app/skill-tree/page.tsx` | Same treatment. |
| `app/profile/page.tsx` | Same treatment. |
| `app/auth/login/page.tsx` | Centered card, amber accent, clean form. |
| `app/auth/register/page.tsx` | Same treatment. |
| `components/layout/app-layout.tsx` | Update sidebar styling for warm palette. |
| `components/ui/xp-bar.tsx` | Amber gradient track. |
| `components/ui/empty-state.tsx` | Adjust icon styling. |
| (landing page if exists) | Full hero section with code visualizer. |

---

## 14. Acceptance Criteria

1. All color tokens switched from violet/cool to warm amber palette
2. Fraunces (headings) + IBM Plex Sans (body) + IBM Plex Mono (code) used consistently
3. Accent color hierarchy enforced: strong-amber for buttons only, amber for links/highlights, soft-amber for backgrounds only
4. All section headers use `// comment` style
5. All numeric data uses monospace
6. All icons are naked (no background pills)
7. Cards are 4px radius, editor-dark, no shadows, no hover lift
8. No ambient animation anywhere — continuous motion strictly forbidden
9. Interaction feedback uses only border/bg shifts at 120–180ms, no shadows/glow/elevation
10. Spacing uses only the defined scale (4/8/12/16/24/32px) — no arbitrary values
11. All pages implement loading, empty, and error states
12. WCAG AA contrast met, visible focus states on all interactive elements, aria-labels on icon-only buttons
13. prefers-reduced-motion disables all entrance animations
14. Code editor views use 13–14px IBM Plex Mono, 1.6 line-height, visible gutter
15. Build passes with zero errors
16. Site looks distinctive — not like an AI template

---

## 15. Implementation Order

1. globals.css — new color palette, typography tokens, card/component styles
2. layout.tsx — new font imports
3. Core components: Button, Input, Card, XpBar, EmptyState, Sidebar
4. Dashboard page (most complex, sets pattern for others)
5. Courses, Course Detail
6. Code Lab
7. Battle
8. Leaderboard, Shop, Skill Tree, Profile
9. Auth pages (login, register)
10. Build, verify, polish

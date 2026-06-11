# Dorm Room Redesign — Stripping the AI-Made Look

**Date:** 2026-06-11
**Status:** Approved
**Component:** `frontend/src/app/globals.css`, `frontend/src/components/ui/glass-card.tsx`, dashboard, battle

## Motivation

The web app looks like a generic AI-generated template: rounded cards, purple accents, ambient animation, icon pills, hover lifts, shadows. This contradicts the project's stated identity as a "student-built learning platform" and its original design philosophy of "calm premium."

The redesign strips every decorative element that makes it look like a SaaS template and replaces it with developer-tool conventions. The code visualizer should be the personality — everything else should get out of its way.

## Design Principles

1. **Content drives, decoration follows.** If an element doesn't serve the learning or coding experience, remove it.
2. **Developer-tool conventions.** Monospace for data, sharp corners, naked icons, comment-style headers. The UI should feel like an IDE, not a marketing page.
3. **One accent, functional only.** Violet appears only on interactive elements (buttons, links, syntax highlighting). Cards and surfaces are neutral dark.
4. **No hover effects on cards.** Cards are containers, not interactions. Hover implies clickability — only real buttons/links hover.

## Changes

### 1. Ambient → Vignette only

| Before | After |
|--------|-------|
| `.app-ambient::before` — aurora gradient with `hue-rotate` animation | Removed entirely |
| `.app-particles` — 8 radial-gradient blobs with 240s drift | Removed entirely |
| `.app-ambient::after` — vignette | Stays (functional, improves readability) |

The `.app-ambient` element is now just the vignette overlay. The dot grid on `body` remains. Nothing animates in the background.

### 2. Card radius: 16px → 4px

```css
.app-card {
  border-radius: 4px; /* was 16px */
}
```

4px is intentionally not 0 (brutalist) and not 16px (SaaS template). It's the radius of an IDE tab, a tool window — functional, not decorative.

### 3. Card hover: removed entirely

| Before | After |
|--------|-------|
| `whileHover: { y: -1 }` on GlassCard | `whileHover: undefined` |
| `.app-card-hover` box-shadow on hover | Removed |
| `glass-card.tsx` hover prop | Kept but unused — cards never lift |

### 4. Card shadows: removed

```css
.app-card-hover:hover {
  box-shadow: none; /* was var(--shadow-eduverse-md) */
}
```

Cards are flat containers. Depth comes from the dark surface colors, not from shadows.

### 5. Naked icons

All icon background pills, circles, and colored containers are removed across the app:

- **Dashboard quick actions**: icon pills with `bg-eduverse-accent-soft border` → no background, icon only
- **Dashboard stat cards**: same — icon only, no pill
- **Course cards**: icon pill with `bg-eduverse-accent-soft` → no background, icon only
- **All other pages**: search for any `icon` in a background container and remove the container

### 6. Monospace for data

All numeric values, stats, labels, and metadata use `font-mono` (Geist Mono):

- Dashboard stat numbers
- Lesson counts, XP values, timestamps
- Leaderboard rank numbers and XP
- Sidebar labels stay Work Sans, headings stay Bricolage

### 7. Code-comment section headers

Section titles on the dashboard, courses, and other app pages use `// Section Name` comment-style formatting:

```tsx
{/* Instead of <h2>Quick Actions</h2> */}
<h2 className="flex items-center gap-2 text-sm font-mono text-eduverse-text-muted">
  <span className="text-eduverse-accent">//</span> Quick Actions
</h2>
```

Small touch, massive personality shift. Reads like a code comment.

### 8. Thinner borders

```css
.app-card {
  border-width: 0.5px;
}
```

Hairline borders are barely visible — enough to define card edges, not enough to create visual noise.

### 9. Editor-dark surfaces

Card backgrounds shift to the editor color for more contrast with the page background:

- Cards currently: `--color-eduverse-surface` (`oklch(17.5% 0.026 295)`)
- Cards change to: `--color-eduverse-editor` (`oklch(12% 0.02 295)`)

This makes cards recede into the page, keeping focus on content.

### 10. Token updates

| Token | Old | New |
|-------|-----|-----|
| `--color-eduverse-border` | `oklch(70% 0.06 295 / 0.08)` | stays (already softened) |
| `--color-eduverse-border-mid` | `oklch(72% 0.08 295 / 0.14)` | stays |
| `--shadow-eduverse-sm/md/lg` | softened values | revert to `none` — shadows eliminated |

## File Changes

| File | Change |
|------|--------|
| `frontend/src/app/globals.css` | Remove `.app-ambient::before` aurora, remove `.app-particles` block, update `.app-card` radius/background/border/hover |
| `frontend/src/components/ui/glass-card.tsx` | Remove `whileHover`, update padding |
| `frontend/src/app/dashboard/page.tsx` | Naked icons, monospace stats, code-comment headers |
| `frontend/src/app/battle/page.tsx` | Existing EmptyState stays |
| `frontend/src/app/courses/page.tsx` | Naked icons on course cards |

## Acceptance Criteria

1. No ambient animation anywhere (no aurora, no particles, no float)
2. Card radius is 4px (not 16px)
3. Cards do not lift or shadow on hover
4. Icons have no background pills or containers
5. All numeric data uses monospace font
6. Section headers use `// comment` style
7. Card borders are hairlines
8. Build passes with zero errors

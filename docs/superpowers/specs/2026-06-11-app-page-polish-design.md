# App Page Polish — Calm Premium Propagation

**Date:** 2026-06-11
**Status:** Approved
**Component:** `frontend/src/app/globals.css`, `frontend/src/components/ui/glass-card.tsx`, individual app pages

## Overview

Propagate the "calm premium" design direction (currently applied to the landing page) to all authenticated app pages: dashboard, courses, lessons, codelab, battle, profile.

## Motivation

The landing page was rebuilt with restrained typography, soft borders, wide shadows, and consistent spacing. The app pages still use the older style with harder borders, denser shadows, multi-color card accents, and inconsistent gaps. Bringing the entire authenticated experience to the same quality level makes EduVerse feel cohesive end-to-end.

## Design Principles

1. **Restraint over decoration.** One accent hue, not four. Borders that disappear rather than announce themselves.
2. **Consistency across pages.** Same card sizing, same spacing rhythm, same hover language on dashboard, courses, lessons, and profile.
3. **Graceful emptiness.** Every data-driven page handles loading, empty, and error states with designed components.
4. **Minimal diff.** Token changes in CSS rather than rewriting components. No new dependencies.

## Token Changes

All in `globals.css` `@theme` block:

### Borders (lower opacity = softer)

| Token | Old | New |
|-------|-----|-----|
| `--color-eduverse-border` | `oklch(70% 0.06 295 / 0.14)` | `oklch(70% 0.06 295 / 0.08)` |
| `--color-eduverse-border-mid` | `oklch(72% 0.08 295 / 0.24)` | `oklch(72% 0.08 295 / 0.14)` |

### Shadows (wider, more diffuse)

| Token | Old | New |
|-------|-----|-----|
| `--shadow-eduverse-sm` | `0 1px 2px oklch(0% 0 0 / 0.3)` | `0 1px 3px oklch(0% 0 0 / 0.2)` |
| `--shadow-eduverse-md` | `0 4px 16px oklch(0% 0 0 / 0.35)` | `0 4px 24px oklch(0% 0 0 / 0.25)` |
| `--shadow-eduverse-lg` | `0 16px 48px oklch(0% 0 0 / 0.45)` | `0 12px 48px oklch(0% 0 0 / 0.3)` |

## CSS Class Changes

### `.app-card`

```css
.app-card {
  background: var(--color-eduverse-surface);
  border: 1px solid var(--color-eduverse-border);
  border-radius: 16px;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}
```

- Slower transition (0.3s vs the current faster timing) — feels more premium
- Border and border-radius unchanged (just inherits the new token)

### `.app-card-hover`

Subtler hover: `y: -1` (was `-2`), lighter shadow, slower timing.

### New: accent strip pattern

Instead of coloring entire card backgrounds or icon pills with per-section hues, use a 3px left border strip:

```css
.app-card-accent-lessons  { border-left: 3px solid oklch(75% 0.11 250 / 0.4); }
.app-card-accent-battle   { border-left: 3px solid oklch(80% 0.13 85 / 0.4); }
.app-card-accent-skills   { border-left: 3px solid oklch(70% 0.16 295 / 0.4); }
.app-card-accent-xp       { border-left: 3px solid oklch(76% 0.14 165 / 0.4); }
```

Less visual weight than full card tints, but still provides section identity.

## Component Changes

### `glass-card.tsx`

- Update default padding from `p-5` to `p-6` for more breathing room
- Change framer-motion hover from `y: -2` to `y: -1`
- Remove any remaining glass-specific class names (confirmed: already removed)

### `<EmptyState>` usage

Add to pages missing fallback content:

| Page | Condition | Component |
|------|-----------|-----------|
| `/dashboard` | No stats loaded | `<EmptyState icon={LayoutDashboard}>` |
| `/courses` | Empty course list | `<EmptyState icon={BookOpen}>` |
| `/battle` | No active battles | `<EmptyState icon={Swords}>` |
| `/leaderboard` | No entries | `<EmptyState icon={Medal}>` |

## Pages Not Touched

- **Landing page (`/`)** — already calm-premium
- **Auth pages** (`/login`, `/register`) — intentionally minimal, separate pass
- **Skill tree** — custom layout, not card-based
- **Shop** — grid layout, already uses GlassCard
- **Placement test** — standalone form flow

## File Changes

| File | Type of Change |
|------|----------------|
| `frontend/src/app/globals.css` | Token values, `.app-card` transitions, new `.app-card-accent-*` classes |
| `frontend/src/components/ui/glass-card.tsx` | Padding (`p-5` → `p-6`), hover lift (`-2` → `-1`) |
| `frontend/src/app/dashboard/page.tsx` | Replace multi-color icon tints with left-border accents, add EmptyState fallback |
| `frontend/src/app/courses/page.tsx` | Add EmptyState for empty list |
| `frontend/src/app/battle/page.tsx` | Add EmptyState for no battles |
| `frontend/src/app/leaderboard/page.tsx` | Add EmptyState for no entries |
| `frontend/src/app/codelab/page.tsx` | Card-ify tool panels if using raw divs |
| `frontend/src/app/profile/page.tsx` | Minor spacing alignment |

## Acceptance Criteria

1. Dashboard cards use left-border accent strips instead of full-card colored tints
2. All card borders are visually softer (lower opacity)
3. Hover shadows are wider and more diffuse
4. Hover lift is subtler (`-1px`)
5. All data-driven pages show `<EmptyState>` when backend returns empty
6. Card padding is consistent (p-6) across all pages
7. No visual regression on the landing page
8. Build passes with zero errors

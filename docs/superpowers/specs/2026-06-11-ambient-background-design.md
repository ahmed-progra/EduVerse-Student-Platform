# Ambient Background Upgrade — Living Aurora + Atmospheric Particles

**Date:** 2026-06-11
**Status:** Approved
**Component:** `frontend/src/app/globals.css` + `frontend/src/components/layout/app-layout.tsx`

## Overview

Upgrade the existing static-drift ambient background (`.app-ambient`) with a subtle aurora color-shift and an ultra-faint atmospheric density layer. CSS-only. Zero new dependencies.

## Motivation

The current `.app-ambient` uses two radial-gradient orbs that drift over 70-90s cycles but do not change color. This feels flat. A living gradient that slowly shifts hue and an imperceptible atmospheric layer add depth — making the platform feel premium and futuristic without compromising readability.

## Design Constraints

1. **Learning-first, visuals-second.** The background must never compete with content. All ambient layers must be subliminal — noticeable only after several seconds of stillness.
2. **CSS only.** No canvas, WebGL, Three.js, or Framer Motion for the background.
3. **Accessible.** `prefers-reduced-motion: reduce` collapses all animation (covered by the global rule in `globals.css:223`).
4. **GPU-composited.** Only `transform`, `filter`, and `opacity` animations. No layout or paint thrashing.
5. **No negative z-index.** All ambient layers use `z-index: 0`. Content sits at `z-index: 1+`.
6. **OKLCH fallback.** Explicit rgb fallback for older browsers.

## HTML Changes

One child element added to the existing `.app-ambient` in `app-layout.tsx:119`:

```tsx
<div className="app-ambient" aria-hidden="true">
  <div className="app-particles" aria-hidden="true" />
</div>
```

## CSS Structure

### Layer stack (bottom to top)

| Layer | Element | z-index | Description |
|-------|---------|---------|-------------|
| Dark base | `body` background | behind | `rgb(18,18,24)` fallback / `oklch(14% 0.022 295)` |
| Dot grid | `body` background-image | behind | 1px dots at 6% opacity, 28px spacing |
| Vignette | `.app-ambient::after` | 0 | Dark vignette for readability on large screens |
| Aurora haze | `.app-ambient::before` | 0 | Violet-teal hue-rotating gradient, slow drift |
| Atmosphere | `.app-particles::before` | 0 | 8 radial-gradient density blobs, vertical drift |
| **Content** | app pages/sidebars | **1+** | All UI surfaces sit above ambient |

### `.app-ambient`

```css
.app-ambient {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}
```

No `-1` z-index anywhere. Ambient and content live in the same stacking context; content wins at z-index 1+.

### Aurora haze (`.app-ambient::before`)

- Large radial gradient (55vmax) using the violet accent palette
- **Single opacity channel**: opacity baked into the gradient color (`/ 0.05`). Element opacity stays at 1.
- Hue shift via `filter: hue-rotate()` — GPU-composited, no repaint
- `transform: translate3d()` for slow drift
- `will-change: transform, filter` on the pseudo-element

### Vignette (`.app-ambient::after`)

```css
.app-ambient::after {
  content: '';
  position: fixed;
  inset: 0;
  z-index: 0;
  background: radial-gradient(ellipse at center, transparent 40%, rgb(0 0 0 / 0.35) 100%);
  pointer-events: none;
}
```

Improves readability on large screens by darkening edges. No animation needed.

### Atmospheric particles (`.app-particles::before`)

- **Not dots, stars, snow, sparks, or floating circles.**
- 8 radial-gradient layers on a single `background-image` property — large soft blooms (120-180px radius) at opacity 0.02 in the violet/teal palette
- **No box-shadow.** Multiple `radial-gradient()` entries in `background-image` are fully GPU-composited and don't trigger repaint
- Parent `.app-particles` has `filter: blur(60px)` — no recognizable shapes
- `transform: translateY` animated over 240s — too slow to track consciously
- `will-change: transform` on `.app-particles`

### Reduced motion

The existing global rule handles this. No changes needed.

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

All ambient animations collapse to their final frame. No visual change for motion-sensitive users.

### Performance

| Property | Compositor | Cost |
|----------|-----------|------|
| `transform: translate3d` | GPU | Near-zero |
| `filter: hue-rotate` | GPU | Near-zero |
| `filter: blur` | GPU | One-time composite |
| `radial-gradient` (background-image) | GPU (with `will-change`) | One-time paint |
| `opacity` | GPU | Near-zero |

No box-shadow particles, no background animation, no JS, no layout recalculations.

## Keyframe Design

### Aurora hue + drift (70s)

```css
@keyframes aurora-drift {
  0%   { transform: translate3d(0, 0, 0) scale(1); filter: hue-rotate(0deg); }
  33%  { transform: translate3d(5vmax, 4vmax, 0) scale(1.12); filter: hue-rotate(8deg); }
  66%  { transform: translate3d(-3vmax, 2vmax, 0) scale(1.05); filter: hue-rotate(-5deg); }
  100% { transform: translate3d(0, 0, 0) scale(1); filter: hue-rotate(0deg); }
}
```

- Hue rotates a maximum of ±8 degrees — barely perceptible as color change, reads as atmospheric "breathing"
- Scale and position drift prevent static feel

### Particle drift (240s)

```css
@keyframes particle-drift {
  from { transform: translateY(0); }
  to   { transform: translateY(-80px); }
}
```

Extremely slow vertical translation. The blobs appear to "breathe" upward over minutes.

### Duration asymmetry

| Animation | Duration | Purpose |
|-----------|----------|---------|
| Aurora drift | 70s | Primary atmosphere |
| Particle drift | 240s | Subliminal motion |
| Vignette | none | Static, no animation needed |

Different durations prevent "loop detection" — the two layers never sync up.

## Fallback

```css
.app-ambient::before {
  background: rgb(18, 18, 24);
  background: radial-gradient(circle, oklch(58% 0.21 293 / 0.05) 0%, transparent 65%);
}
```

Browsers that don't support `oklch()` fall back to the solid rgb base. No broken rendering.

## Opacity Model (simplified)

**Single opacity channel.** No stacking of gradient opacity × element opacity × keyframe opacity.

- Opacity is set **only** inside the gradient color via the `/ alpha` syntax in OKLCH (e.g., `/ 0.05`)
- Element `opacity` is always `1` on all pseudo-elements
- Keyframes animate `filter: hue-rotate()` and `transform`, never `opacity`

This eliminates any risk of accidentally becoming invisible.

## File Changes

| File | Change |
|------|--------|
| `frontend/src/components/layout/app-layout.tsx` | Add `<div className="app-particles" aria-hidden="true" />` child to `.app-ambient` |
| `frontend/src/app/globals.css` | Replace `.app-ambient` CSS (lines 2756-2796) with new implementation + add `.app-particles` rules + add keyframes |

## Acceptance Criteria

1. Background never distracts from reading code or lesson content
2. Aurora orbs slowly shift hue (±8°) and position over 70s cycle via `hue-rotate`
3. Atmospheric blobs have zero visible edges — pure blur, no dot/starburst artifacts
4. All animations freeze under `prefers-reduced-motion: reduce`
5. No JS errors, no layout shift, no performance regression
6. No negative z-index anywhere in the ambient system
7. OKLCH fallback renders correctly in browsers without oklch support
8. Existing glassmorphism cards, sidebars, and modals remain fully opaque and readable above the ambient layer

# Ambient Background Upgrade — Living Aurora + Atmospheric Particles

**Date:** 2026-06-11
**Status:** Approved
**Component:** `frontend/src/app/globals.css` + `frontend/src/components/layout/app-layout.tsx`

## Overview

Upgrade the existing static-drift ambient background (`.app-ambient`) with a subtle aurora color-shift and an ultra-faint atmospheric density layer. CSS-only. Zero new dependencies.

## Motivation

The current `.app-ambient` uses two radial-gradient orbs that drift over 70-90s cycles but do not change color. This feels flat. A living gradient that slowly shifts hue and an imperceptible particle layer add depth and atmosphere — making the platform feel premium and futuristic without compromising readability.

## Design Constraints

1. **Learning-first, visuals-second.** The background must never compete with content. All ambient layers must be subliminal — noticeable only after several seconds of stillness.
2. **CSS only.** No canvas, WebGL, Three.js, or Framer Motion for the background.
3. **Accessible.** `prefers-reduced-motion: reduce` collapses all animation (already covered by the global rule in `globals.css:223`).
4. **GPU-composited.** Only `transform`, `opacity`, and `filter` animations. No layout or paint thrashing.
5. **Backward compatible.** Fallback to solid dark base if OKLCH is unsupported.

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
| Dark base | `body` background | behind | `oklch(14% 0.022 295)` |
| Dot grid | `body` background-image | behind | 1px dots at 6% opacity, 28px spacing |
| Aurora orb 1 | `.app-ambient::before` | -1 | Violet radial gradient, drifts + shifts hue |
| Aurora orb 2 | `.app-ambient::after` | -1 | Teal radial gradient, drifts + shifts hue |
| Atmosphere | `.app-particles::before` | -1 | 8-10 large blurred blobs, vertical drift |

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

**z-index = 0** ensures the ambient layer stays behind all glassmorphism cards, sidebars, and content surfaces (which use z-index >= 1).

### Aurora orbs (using existing `::before` / `::after`)

Each pseudo-element is a large (55vmax) radial gradient with multiple keyframe stops that animate:
- `transform: translate3d()` — slow drift (same pattern as existing)
- `opacity` — subtle breathing between 0.4 and 1.0
- `background` hue shift — cycles through 3 color stops over 60-80s

**Opacity cap:** `0.06` at peak — ensures the aurora is barely perceptible. The `background` opacity is baked into the gradient color (uses `/ 0.04` to `/ 0.06` range in OKLCH).

### Atmospheric particles (`.app-particles::before`)

- **Not dots, stars, snow, sparks, or floating circles.**
- 8-10 large blurred blobs (120-180px) at opacity 0.01-0.03
- Implemented via `box-shadow` on `::before` — each entry is a large spread-radius shadow
- Parent `.app-particles` has `filter: blur(80px)` — no recognizable shapes, no sharp edges
- `transform: translateY` animated over 180-300s — too slow to track consciously
- Blobs use the same OKLCH violet/teal palette but at such low opacity they read as slight "density variations" in the dark

### Reduced motion

The existing global rule handles this:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
}
```

All ambient animations collapse to their final frame. No visual change for motion-sensitive users.

### Performance

| Property | Compositor | Cost |
|----------|-----------|------|
| `transform: translate3d` | GPU | Near-zero |
| `opacity` | GPU | Near-zero |
| `filter: blur` | GPU (if `will-change` set) | One-time paint |
| `box-shadow` | GPU | One-time paint for blobs |

No JS-driven animations, no `requestAnimationFrame`, no layout recalculations.

## Keyframe Design

### Aurora cycle (60-80s)

```
@keyframes aurora-drift-1 {
  0%   { transform: translate3d(0, 0, 0) scale(1); opacity: 0.4; }
  25%  { transform: translate3d(4vmax, 3vmax, 0) scale(1.1); opacity: 0.7; }
  50%  { transform: translate3d(8vmax, 6vmax, 0) scale(1.15); opacity: 1.0; }
  75%  { transform: translate3d(4vmax, 3vmax, 0) scale(1.05); opacity: 0.6; }
  100% { transform: translate3d(0, 0, 0) scale(1); opacity: 0.4; }
}
```

Note: The actual opacity is relative to the gradient's base opacity (`/ 0.04` to `/ 0.06` in the OKLCH color). So `opacity: 1.0` in the keyframe means full 0.06 of the gradient — still extremely faint.

### Particle drift (180-300s)

```
@keyframes particle-drift {
  from { transform: translateY(0); }
  to   { transform: translateY(-100px); }
}
```

Extremely slow vertical translation. The blobs appear to "breathe" upward over minutes.

## File Changes

| File | Change |
|------|--------|
| `frontend/src/components/layout/app-layout.tsx` | Add `<div className="app-particles" aria-hidden="true" />` child to `.app-ambient` |
| `frontend/src/app/globals.css` | Replace `.app-ambient` CSS (lines 2756-2796) with new implementation + add `.app-particles` rules + add keyframes |

## Acceptance Criteria

1. Background never distracts from reading code or lesson content
2. Aurora orbs slowly shift hue and position over 60-80s cycle
3. Atmospheric blobs have zero visible edges — pure blur
4. All animations freeze under `prefers-reduced-motion: reduce`
5. No JS errors, no layout shift, no performance regression
6. Existing glassmorphism cards, sidebars, and modals remain fully opaque and readable above the ambient layer

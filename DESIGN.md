# EduVerse — Design System (landing-first, propagates to app later)

## Theme
Dark. Scene: a CS student at 11pm in a dim dorm room deciding in 10 seconds whether
this platform is legit. The product surface (code editor) is dark; the page matches it.

## Color (OKLCH, violet identity preserved but restrained: accent <=10% of surface)
- bg            oklch(14% 0.022 295)   — violet-tinted near-black, never #000
- surface       oklch(17.5% 0.026 295)
- raised        oklch(21% 0.03 295)
- editor        oklch(12% 0.02 295)    — code panes sit darker than the page
- border        oklch(70% 0.06 295 / 0.14), mid: / 0.24
- text          oklch(96% 0.008 295)
- text-body     oklch(76% 0.02 295)
- text-muted    oklch(60% 0.025 295)
- accent        oklch(70% 0.16 295)    — text/icon accent on dark
- accent-strong oklch(58% 0.21 293)    — button fills only
- success       oklch(76% 0.14 165)    — console output, "easy"
- warning       oklch(80% 0.13 85)
- danger        oklch(66% 0.19 25)

No gradient text. No glassmorphism on cards (backdrop-filter on the sticky nav only).

## Typography
- Display: Bricolage Grotesque (next/font/google), headings, tight tracking (-0.03em)
- Body/UI: Work Sans (next/font/google)
- Code: Geist Mono (next/font/google)
- Scale ratio >=1.25 between steps; hero uses clamp(). Body line-height 1.7,
  +0.05 on dark per light-on-dark rule. Body measure <=68ch.
- Inter is banned (reflex default). Fonts self-hosted via next/font, never <link>.

## Motion rules
- Ambient: ONE static hero glow + faint dot grid. Nothing loops forever.
  No aurora drift, no particle canvas, no float keyframes, no shimmer sweeps.
- Entrance: one staggered hero choreography on load (opacity + translateY 14px,
  700ms, cubic-bezier(.22,1,.36,1), 80ms stagger).
- Scroll: .rv reveals fire once, 600ms, same ease, slight per-item delay.
- Hover: cards lift 2px + border lightens (200ms); buttons translateY(-1px),
  active scale(.98). No tilt, no glare, no parallax. Buttons NEVER drift.
- The hero visualizer demo is the only continuously animating element; it pauses
  off-screen and renders its final frame statically under prefers-reduced-motion.
- prefers-reduced-motion: targeted disabling (entrances resolve to final state),
  not a blanket `animation: none` on *.

## Layout
- Hero is a split layout (copy left-aligned, demo right), not a centered stack.
- Features are columns on the page background with hairline top rule — no card boxes.
- Cards only where the affordance is real (clickable challenge items).
- Section rhythm varies: 96-128px between sections, tight inside groups.

## Shadows (one scale, used sparingly — dark themes need borders more than shadows)
- sm: 0 1px 2px oklch(0% 0 0 / .3)
- md: 0 4px 16px oklch(0% 0 0 / .35)
- lg: 0 16px 48px oklch(0% 0 0 / .45)

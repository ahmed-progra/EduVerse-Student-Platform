# EduVerse — Design System ("Code Sorcery")

Source of truth is `frontend/src/app/globals.css` (`@theme` block). This file documents it.
Identity evolved from the original violet draft to a **warm amber dark** palette; the
amber is the real system now. No violet anywhere in the app.

## Theme
Dark, warm. Scene: a CS student at 11pm in a dim dorm room deciding in 10 seconds whether
this platform is legit. The product surface (code editor) is the darkest layer; the page
sits a step lighter, warmed toward amber rather than the usual cold-blue "dev tool" reflex.

## Color (OKLCH — warm dark, amber accent. Restrained: accent carries meaning, not decoration)
- bg            oklch(12% 0.02 55)     — warm near-black, never #000
- surface       oklch(16% 0.025 50)    — cards, panels
- raised        oklch(20% 0.03 50)     — hover/raised fills
- editor        oklch(9% 0.015 55)     — code panes, darkest layer
- glass         oklch(16% 0.025 50 / 0.78) — sticky nav backdrop only
- border        oklch(70% 0.03 55 / 0.08), mid: oklch(72% 0.04 55 / 0.14)
- accent        oklch(78% 0.14 85)     — amber; text/icon accent, current selection, state
- accent-strong oklch(60% 0.18 75)     — button fills only
- accent-light  oklch(85% 0.1 85)
- accent-soft   oklch(78% 0.14 85 / 0.1) — tints, selected backgrounds
- success       oklch(76% 0.14 165)    — console output, "easy", pass
- warning       oklch(80% 0.13 85)
- danger        oklch(66% 0.19 25)
- text          oklch(93% 0.01 80)     — headings
- text-body     oklch(72% 0.02 70)     — paragraphs
- text-muted    oklch(55% 0.03 65)     — labels, secondary
- gold / silver / bronze — leaderboard ranks

No gradient text. No glassmorphism on cards (backdrop-filter on the sticky nav only).
Accent is amber and used for meaning (primary action, selection, state), not as decoration.

## Typography
- Display: Bricolage Grotesque (next/font), headings, tight tracking (-0.03em). Class: `font-display`.
- Body/UI: Work Sans (next/font). Default.
- Code/labels: Geist Mono (next/font). Class/var: `--font-mono`. Used for meta, counts, tags.
- Scale ratio >=1.25 between steps; hero uses clamp(). Body line-height 1.7 (+0.05 on dark).
  Body measure <=68ch. Inter is banned (reflex default). Fonts self-hosted via next/font.

## Motion
- Canonical easing: `--ease-out-expo: cubic-bezier(0.22, 1, 0.36, 1)`. No bounce, no elastic.
- Ambient: ONE static hero glow + faint dot grid. Nothing loops forever (the hero visualizer
  demo is the only exception; it pauses off-screen and freezes under reduced-motion).
- Entrance: staggered rise (opacity + translateY 14px, 700ms, ease-out-expo, 80ms stagger).
  App pages use `.page-rise` (0.45s). Scroll `.rv` reveals fire once (600ms).
- Hover: cards lift 2px + border lightens (~180ms); buttons translateY(-1px), active scale(.97).
  No tilt, no glare, no parallax. Buttons never drift.
- Durations: 150-250ms for state changes; transform on `--ease-out-expo`, color/bg on `ease`.
- prefers-reduced-motion: targeted disabling (entrances resolve to final state), not blanket none.

## Layout
- Section rhythm varies: generous between sections, tight inside groups. Don't pad everything equally.
- Cards (`.app-card`) only where the affordance is real (clickable lessons, panels, stat tiles).
  No nested cards. Features can be columns on the page background with a hairline rule.
- Don't wrap everything in a container; most groups don't need a box.

## Components (established classes in globals.css — reuse, don't reinvent)
- `.app-card` — the standard panel/card surface (used by GlassCard).
- `.ai-panel-action-btn` (+ `.ai-panel-action-sm`) — primary amber action button; has hover
  lift, active scale(.97), focus-visible ring. `.ai-panel-textarea`, `.ai-panel-select` — inputs.
- `.side-item` — sidebar nav row (default/hover/active/danger/collapsed).
- `.btn`, `GradientButton` — primary CTA. Interaction states standardized across these.
- Every interactive element needs: default, hover, focus-visible, active, disabled, loading.

## Shadows (one scale, sparing — dark themes lean on borders more than shadows)
- sm: 0 1px 2px oklch(0% 0 0 / .3)
- md: 0 4px 16px oklch(0% 0 0 / .35)
- lg: 0 16px 48px oklch(0% 0 0 / .45)

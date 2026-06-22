# TODO — EduVerse Frontend

## Done: landing page "calm premium" rebuild (2026-06-10)

Supersedes the earlier anti-gravity float/tilt work, which was removed.
Design direction is recorded in [product.md](product.md).

- [x] Replace 8 competing ambient animation systems (particle canvas, aurora blobs,
      floats, glow pulses, tilt/glare, parallax, shimmer) with one static hero glow
- [x] Hero: split layout with auto-playing visualizer demo (`hero-demo.tsx`),
      pauses off-screen, static final frame under prefers-reduced-motion
- [x] Entrance choreography (.intro stagger) + working scroll reveals (.rv)
- [x] Fonts via next/font (Bricolage Grotesque / Work Sans / Geist Mono), Inter removed
- [x] OKLCH token palette in globals.css @theme (all token names preserved)
- [x] Honest copy (no fake 300M+ stats), no gradient text on landing
- [x] Deleted dead code: visual-effects.tsx, background-effect(.wrapper).tsx,
      use-card-tilt.ts, Typewriter/CountUp components
- [x] Targeted prefers-reduced-motion handling (animations resolve to final frame)
- [x] TypeScript check passes; verified in preview at 1440px and 375px

## Next

- [ ] Propagate the calm-premium system to app pages (dashboard, courses, codelab,
      lessons, auth) — replace glassmorphism cards, align fonts/tokens, audit
      remaining continuous animations there
- [ ] Backend offline: /courses renders an empty list without the API; consider
      a designed empty state

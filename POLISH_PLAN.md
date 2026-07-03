# POLISH_PLAN.md — EduVerse World-Class Polish Pass (Ultimate Edition)

> **Mission:** the final 5%. No new features, no backend/API/DB/auth/routing/logic changes.
> Preserve the "Aurora in the Void" identity — refine it, never redesign it.
> Bar: would the Linear/Vercel design team approve this PR?
>
> **Method:** 12-auditor waved audit (102 findings, 0 failed agents) + first-hand verification
> of every high-severity claim against current source. All items below cite `file:line` evidence.
> **Gates after every workstream:** `npm run lint` (typecheck + prettier), `eslint . --max-warnings 0`, `npm run build`.

---

## 0. Verified strengths — DO NOT TOUCH

These are already launch-quality and must be preserved exactly:

- **Token system** (`globals.css` @theme, lines 3–55): OKLCH void/amber palette, radius scale (6/8/12/16/20/999), void-tinted shadow ramp, easing tokens.
- **Reduced motion**: global `prefers-reduced-motion` collapse + `<MotionConfig reducedMotion="user">` in `providers.tsx`.
- **Global `:focus-visible`** (globals.css:91) — 2px accent outline baseline.
- **Shared primitives**: `EmptyState` (halo + orbiting stars), `Skeleton` shimmer system, `Confetti`, `AnimatedNumber` (reduced-motion aware), `GradientButton` (token-driven hover/press/loading), `XpBar` ARIA.
- **CommandPalette**: focus save/restore, trap, Escape, `role="dialog"` — model implementation.
- **Mobile drawer** (`app-layout.tsx`): scroll lock, `inert`, dialog semantics.
- **Code splitting**: AI panels / Three.js / Monaco / Skulpt all `dynamic` `ssr:false`; Three.js disposal.
- **Battle flow craft**: skippable 3-2-1 countdown, final-30s danger clock, one-shot victory confetti, graceful defeat (still shows XP).
- **Skill map keyboard access** + pointer drag-vs-click disambiguation; unlock flow with optimistic update + confetti.
- **ModelViewer GLB loading** (real progress %); `.wb-*` custom controls; `@media (hover:none)` handling.
- **Leaderboard own-row highlight**, podium gold/silver/bronze tiers, `.toLocaleString()` number formatting everywhere.
- **api-client 30s GET cache + dedupe**; lesson `dangerouslySetInnerHTML` is reviewed-safe (trusted seed-time curriculum render).

---

## W1 — Color-token conformance (identity integrity)

The "Aurora in the Void" hue (~262) must reach every surface. Raw white/black/hex bypasses it.

| #   | Sev  | Where                                                           | Issue → Fix                                                                                                                                                                                                                                                                                |
| --- | ---- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1.1 | HIGH | `features/visualizer/visualizer.tsx:346,380,429,484,599`        | `bg-black/20` toolbar chrome — literal black, no hue-262 tint, uncovered by the override block → replace with editor/void token at alpha                                                                                                                                                   |
| 1.2 | HIGH | `globals.css:2174,2241`                                         | `.code-editor-wrap`/`.visualizer-editor-area` hardcode `#0d0d1a` → `var(--color-eduverse-editor)`; also `#e4e4ef` (~2207) → text token                                                                                                                                                     |
| 1.3 | HIGH | `globals.css:~2318+` (visualizer/debugger)                      | status colors hardcoded `#ef4444`/`#34d399`/`#fbbf24` → `--color-eduverse-danger/success/warning`                                                                                                                                                                                          |
| 1.4 | HIGH | `globals.css:2924` block                                        | the `!important` white/black override patch masks 7 files still authoring raw white/black utilities (profile, leaderboard, battle, skill-tree, projects, skeleton, visualizer). Migrate those files to token classes; keep the block as a safety net until raw usages hit zero, then prune |
| 1.5 | MED  | `components/ui/skeleton.tsx:18`                                 | `bg-white/[0.01]` (uncovered arbitrary value) on the app-wide skeleton primitive → covered value or surface token                                                                                                                                                                          |
| 1.6 | MED  | `app/profile/page.tsx:774`                                      | `hover:bg-white/[0.025]` uncovered arbitrary hover → covered value/token                                                                                                                                                                                                                   |
| 1.7 | MED  | `app/leaderboard/page.tsx:227`                                  | `border-white/[0.06]` one-off divider → `--color-eduverse-border`                                                                                                                                                                                                                          |
| 1.8 | MED  | `features/lab/lab-workbench.tsx:478` + `.wb-range`/`.wb-switch` | same track-base oklch literal duplicated 3× → one `--color-eduverse-track` token                                                                                                                                                                                                           |

## W2 — Radius normalization (one system, zero ad-hoc values)

Bare Tailwind `rounded` (4px) and off-scale values (10/11/13/14px, literal `999px`/`100px`) leak past the token scale.

| #    | Sev  | Where                                                                          | Fix                                                                                                          |
| ---- | ---- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| 2.1  | HIGH | `features/learning/roadmap-view.tsx:141`                                       | course icon badge bare `rounded` → `rounded-xl` (matches courses:96, placement-test:155)                     |
| 2.2  | HIGH | `app/placement-test/page.tsx:193`                                              | 80px result trophy circle bare `rounded` — the payoff moment looks clipped → `rounded-2xl`/token             |
| 2.3  | MED  | `globals.css:3925`                                                             | `.battle-staging` (the most dramatic surface in the battle flow) `border-radius: 4px` → `var(--radius-card)` |
| 2.4  | MED  | `globals.css:142–167`                                                          | lesson `code`/`pre.lesson-code`/`.lesson-output` 4px → `var(--radius-sm)`                                    |
| 2.5  | MED  | `app/not-found.tsx:28,35` + `app/error.tsx:28`                                 | fallback-page CTAs bare `rounded` → `rounded-[var(--radius-button)]`                                         |
| 2.6  | MED  | `app/apprentice/page.tsx:323+`                                                 | selects/inputs/textarea/buttons bare `rounded` → input/button tokens                                         |
| 2.7  | MED  | `globals.css:1556+` (.ai-panel-\*)                                             | hardcoded 8/10/12/100px radii → button/input/pill tokens                                                     |
| 2.8  | MED  | `globals.css:1019,4453,4481,…`                                                 | icon-chip family radii 11/13/12/14px → one shared value (`--radius-card` or new `--radius-chip`)             |
| 2.9  | LOW  | `globals.css:2275` `.visualizer-controls` 10px; `:460` `.mobile-nav-link` 10px | → `var(--radius-button)`                                                                                     |
| 2.10 | LOW  | `globals.css` 9× literal `999px`, 4× `100px`                                   | → `var(--radius-pill)` everywhere                                                                            |
| 2.11 | LOW  | `app/courses/[id]/page.tsx:86`                                                 | `rounded-lg` on CTA vs token form used in lessons → `rounded-[var(--radius-button)]`                         |

## W3 — Page-shell standardization (one product, one designer)

First-hand verified drift across all 23 pages.

- **3.1 (HIGH) Page header pattern.** One recipe everywhere: `section-label` eyebrow + `h1.text-3xl.font-bold.font-display.tracking-tight.mb-2` + muted subtitle.
  - `courses/[id]/page.tsx:126,131` — missing eyebrow AND `tracking-tight` (only page that breaks both).
  - `mb-1` pages (dashboard:133, mentor:155, apprentice:230, projects:100) vs `mb-2` majority → standardize `mb-2`.
  - `resources:83`, `announcements:39`, `lab:94` — bespoke `lab-hero` h1 with no `mb-*` → fold into standard pattern.
  - Detail-page policy: `[id]` pages read one step down (`text-2xl`) — make courses/[id] conform (currently `text-3xl`), keep lessons/projects/u as-is.
- **3.2 (HIGH) Container width policy.** Currently five values + uncapped pages. Policy: **content pages `max-w-6xl`** (battle, codelab, lessons, projects already there); **reading pages narrower** (leaderboard 4xl, apprentice 3xl, u/ 4xl stay); **uncapped pages get `max-w-6xl`**: dashboard:124, courses:40, shop:121, resources:75, announcements:32, skill-tree (main column). Profile 5xl → 6xl or documented exception.
  - `app/loading.tsx:8` is `max-w-7xl` — wider than every real page → `max-w-6xl` (kills skeleton→content shift).
- **3.3 (MED) Entrance mechanism.** Pages split between CSS `page-enter` (resources, announcements, lab) and Framer `staggerContainer`/`fadeUp` (courses, dashboard…). Standardize on the Framer stagger for authed pages: lab hub (`lab/page.tsx:84`), projects grid (`projects/page.tsx:279` — currently NO entrance at all), resources, announcements.

## W4 — Typography

- **4.1 (HIGH)** `.lesson-content` has no measure constraint inside `max-w-6xl` — paragraphs run ~1100px (`globals.css:97`, `lessons/[id]/page.tsx:146`). Add `max-width: 68ch` to lesson prose. This is where students spend most of their time.
- **4.2 (MED)** Three code-block type scales for the same concept (lesson pre 0.82rem/1.6 vs skill-tree `text-xs` vs codelab) → one shared code-block size.
- **4.3 (LOW)** Editor chrome labels mix sans/mono (`visualizer.tsx:348` vs `.debug-value` etc.) → pick mono for technical chrome, apply consistently.
- **4.4 (INFO)** Landing `.sec-title` clamp() scale vs app `text-3xl` — intentional marketing/app split, leave.

## W5 — Motion coherence (nothing static, nothing janky)

`lib/motion.ts` is the source of truth — enforce it.

| #    | Sev  | Where                                             | Issue → Fix                                                                                                               |
| ---- | ---- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| 5.1  | HIGH | `components/ui/xp-bar.tsx:56`                     | fill animates `width` (layout thrash) → `scaleX` + `transform-origin:left` (pattern already used by battle countdown bar) |
| 5.2  | HIGH | `app/battle/page.tsx:448`                         | verdict panel inside AnimatePresence with no `exit` → pops out on "lobby" → add matching exit                             |
| 5.3  | MED  | `app/courses/[id]/page.tsx:138`                   | dismissible celebration banner: no AnimatePresence/exit → wrap + exit                                                     |
| 5.4  | MED  | `app/auth/login/page.tsx:53` (+register)          | error message no exit → AnimatePresence + fade                                                                            |
| 5.5  | MED  | `app/dashboard/page.tsx:182`                      | quick-action hover fought over by CSS `.app-card-link` AND Framer `cardHover` on same transform → pick one                |
| 5.6  | MED  | `lib/motion.ts:52`                                | exported `springTransition` (260/24) is **never imported** — either adopt it for the pop-in springs or delete it          |
| 5.7  | MED  | dashboard:213 etc.                                | stagger delays ad-hoc (`0.2+0.07i` uncapped vs others) → shared `staggerDelay(i, step, max)` helper or nested variants    |
| 5.8  | MED  | `app/projects/page.tsx:279`                       | project grid: no entrance at all vs courses' stagger → add (part of 3.3)                                                  |
| 5.9  | LOW  | `features/lessons/quiz-checkpoint.tsx:102`        | correct/incorrect verdict pops with no transition — the payoff moment → small fade/rise via `fastEaseTransition`          |
| 5.10 | LOW  | `app/leaderboard/page.tsx:240`                    | row entrance omits duration/ease (framer defaults) → match roadmap rows                                                   |
| 5.11 | LOW  | `features/learning/assessment-runner.tsx:179,189` | `"easeOut"` string vs codebase bezier → `[0.22,1,0.36,1]`                                                                 |
| 5.12 | LOW  | `app/codelab/page.tsx:128`                        | preset/reset/inject-bug buttons: hover but no pressed state → join `:active` scale group                                  |
| 5.13 | LOW  | `app/apprentice/page.tsx:24` (+2 files)           | inline `[0.22,1,0.36,1]` redeclared → import from lib/motion                                                              |
| 5.14 | LOW  | durations mix 150/200/300/500ms                   | codify fast=150 / base=200 / slow=300; `missions-board.tsx:183` 500ms outlier → 300                                       |

## W6 — Loading / error / empty states

| #    | Sev  | Where                                         | Issue → Fix                                                                                                                                                       |
| ---- | ---- | --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 6.1  | HIGH | `app/profile/page.tsx:207,320`                | fetch failure → `catch(() => setLoading(false))` with `if (loading \|\| !profile)` guard = **infinite skeleton** → offline EmptyState + retry (dashboard pattern) |
| 6.2  | MED  | `app/skill-tree/page.tsx:114`                 | `catch {}` swallows errors — backend-down renders an empty map, indistinguishable from "no skills" → offline flag + WifiOff EmptyState                            |
| 6.3  | MED  | `app/mentor/page.tsx:177,224`                 | 3 different skeleton languages on one page; error leaves sections silently blank → standardize on `sk-card`; add error branch                                     |
| 6.4  | MED  | `app/courses/[id]/page.tsx:66`                | only page using flat `animate-pulse` instead of shimmer `sk-card` → convert                                                                                       |
| 6.5  | MED  | `app/battle/page.tsx:66`                      | history has no loading flag — veterans see "No battles yet" flash → `historyLoading` + skeleton rows                                                              |
| 6.6  | MED  | `app/shop/page.tsx:286`                       | "Lv.X required" always neutral — can't tell "can't afford" from "level locked" → warning tone when `user.level < levelRequired`                                   |
| 6.7  | LOW  | `app/skill-tree/loading.tsx` vs page.tsx:166  | route-level vs in-component loading render different skeletons → share one                                                                                        |
| 6.8  | LOW  | `app/resources/page.tsx:187` (+announcements) | `!ready ? null` blank flash → light skeleton                                                                                                                      |
| 6.9  | LOW  | `app/lab/[subject]/page.tsx:14`               | hand-rolled not-found div → shared `<EmptyState>`                                                                                                                 |
| 6.10 | LOW  | `app/dashboard/page.tsx:262`                  | empty-state CTA duplicates the Quick Action above it → point at placement test                                                                                    |
| 6.11 | LOW  | `features/dashboard/ai-coach-card.tsx:78,116` | AI errors as unstyled text → `.form-error` treatment                                                                                                              |
| 6.12 | MED  | `features/lab/three-scene.tsx:230`            | WebGL-failure fallback ad-hoc vs ModelViewer's `.lab-loading` → unify                                                                                             |

## W7 — Accessibility (no functionality changes)

| #    | Sev  | Where                                                              | Fix                                                                                                                       |
| ---- | ---- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| 7.1  | HIGH | `ai-mentor-panel.tsx:50`                                           | `.ai-panel-chat` → `role="log" aria-live="polite"` (matches mentor-chat.tsx)                                              |
| 7.2  | HIGH | `globals.css:2201,2222`                                            | code editor `outline:none` with no replacement → `.code-editor-wrap:focus-within` accent ring                             |
| 7.3  | MED  | `app/profile/page.tsx:347`                                         | avatar upload div not keyboard-operable → role/tabIndex/keydown                                                           |
| 7.4  | MED  | `features/visualizer/ast-viewer.tsx:229`, `memory-panel.tsx:173`   | clickable divs → buttons/keyboard handlers                                                                                |
| 7.5  | MED  | `app/skill-tree/page.tsx:265`                                      | mobile skill-detail overlay: no dialog semantics, no Escape → `role="dialog" aria-modal` + Escape (mirrors mobile drawer) |
| 7.6  | MED  | `ai-hints-panel.tsx:53`, `ai-review-panel.tsx:38,43,53`            | missing `aria-label`s; review result needs `aria-live`                                                                    |
| 7.7  | MED  | `ai-panel-shell.tsx:31`                                            | panel title is a `<div>` though it replaces the page → `<h1>`                                                             |
| 7.8  | LOW  | copy buttons (mentor:61, review:58, challenge:122)                 | `title` only → add `aria-label`                                                                                           |
| 7.9  | LOW  | `app/resources/page.tsx:108,141,148` (+projects/apprentice inputs) | placeholder-only inputs → `aria-label`s                                                                                   |
| 7.10 | LOW  | `features/lessons/lesson-mentor.tsx:158`, `visualizer.tsx:482`     | AI answer / run output not announced → `role="status" aria-live="polite"`                                                 |
| 7.11 | LOW  | `app/page.tsx:606`                                                 | welcome toast → `role="status"`                                                                                           |
| 7.12 | LOW  | globals.css:1689 pattern                                           | inputs suppress outline, 1px border shift only → add focus ring shadow on `:focus-visible`                                |
| 7.13 | LOW  | `components/ui/glass-card.tsx:21`                                  | `onClick` without button semantics → role/tabIndex/keydown when onClick passed                                            |

## W8 — Micro-interactions & dead-feeling surfaces

| #   | Sev  | Where                               | Fix                                                                                                |
| --- | ---- | ----------------------------------- | -------------------------------------------------------------------------------------------------- |
| 8.1 | HIGH | `globals.css:1705` `.ai-panel-send` | primary Send button has **no hover state** (siblings all do) → mirror `.ai-panel-action-btn:hover` |
| 8.2 | MED  | `globals.css:1824` `.ai-choice`     | quiz/assessment options: no hover → subtle border/surface shift                                    |
| 8.3 | MED  | `.res-card`/`.ann-card`             | no card-level hover at all → `.app-card-link`-style border+shadow shift                            |
| 8.4 | MED  | `visualizer.tsx:640`                | readOnly editor looks identical to editable → dim + cursor change                                  |
| 8.5 | MED  | `visualizer.tsx:499`                | 3 control groups undifferentiated → divider (codelab pattern)                                      |
| 8.6 | MED  | `app/profile/page.tsx:536`          | bare stat icons vs dashboard's `.stat-card-icon` chips → apply chip treatment                      |
| 8.7 | LOW  | `debugger-panel.tsx:86`             | raw ✓ glyph → Lucide icon / existing badge                                                         |
| 8.8 | LOW  | `app/profile/page.tsx:677`          | 2 section labels outside `fadeUp` wrappers → wrap like siblings                                    |

## W9 — Structural hygiene (dead code, duplicates, overlaps)

| #   | Sev | Where                                                  | Fix                                                                                                                                                                                                                                                                                         |
| --- | --- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 9.1 | MED | `globals.css:3076` vs `:4519`                          | `.streak-badge` defined **twice** with conflicting values → delete the superseded first block                                                                                                                                                                                               |
| 9.2 | MED | `globals.css:1959` `.ai-panel-diff-*`                  | difficulty badges reimplemented with hardcoded colors vs `.diff-*` tokens → reuse/tokenize                                                                                                                                                                                                  |
| 9.3 | MED | `components/ui/backend-status.tsx:39`                  | fixed banner overlaps mobile top bar (both `top-0`) → offset via CSS var/body class                                                                                                                                                                                                         |
| 9.4 | LOW | `components/ui/tooltip.tsx` + `.tp-*` CSS              | dead code (zero imports) → remove (or wire properly if adopting)                                                                                                                                                                                                                            |
| 9.5 | LOW | `globals.css:936–994` `.feature-grid/col/*`            | unused (landing uses `.feature-bento`) → delete with responsive overrides                                                                                                                                                                                                                   |
| 9.6 | LOW | `globals.css:2083` `.shortcut-hint`                    | dead + double-faded contrast → delete                                                                                                                                                                                                                                                       |
| 9.7 | MED | `app/lab/page.tsx:48`                                  | lab hub uses `.glass-panel` for dense card grids, violating the system's own "glass = showcase only" rule (courses/projects use app-card) → **decision: convert to app-card OR document the lab as an intentional showcase exception** (visual change is noticeable — confirm before doing) |
| 9.8 | MED | not-found.tsx inline styles vs error.tsx token classes | converge on error.tsx's approach + `page-enter`                                                                                                                                                                                                                                             |

## W10 — Responsiveness & touch

| #    | Sev | Where                               | Fix                                                                           |
| ---- | --- | ----------------------------------- | ----------------------------------------------------------------------------- |
| 10.1 | MED | `globals.css:6930` `.lab-gcard-fav` | 30×30px favourite star next to a card link → ≥40px hit area                   |
| 10.2 | LOW | `globals.css:5735` `.res-card-del`  | ~24px delete button → ≥40px hit area                                          |
| 10.3 | LOW | `app/profile/page.tsx:478`          | stats grid `2→md:4` missing `sm:3` step (its sibling grids have it) → add     |
| 10.4 | LOW | `globals.css:6251` `.wb-rail`       | horizontal model rail has no scroll affordance → trailing-edge fade mask      |
| 10.5 | LOW | `globals.css:3894` `.sm-meta`       | 9px SVG labels illegible at min zoom → bump size or hide below zoom threshold |
| 10.6 | —   | Uncapped pages on ultra-wide        | covered by W3.2 container policy                                              |

## W11 — Signature interactions (implement ONLY after user approval)

Five concepts proposed in chat — awaiting selection. Reserved as the final workstream so they land on a consistent foundation.

---

## Execution order

1. **W9 hygiene + W1 tokens + W2 radii** — mechanical, zero-risk, unlocks consistency for everything after. _(gate)_
2. **W3 page shell + W4 typography** — the "one product" pass. _(gate)_
3. **W6 states + W7 a11y** — correctness of experience. _(gate)_
4. **W5 motion + W8 micro-interactions** — the "alive" pass. _(gate)_
5. **W10 responsiveness sweep** + preview verification at mobile/tablet/desktop/ultra-wide. _(gate)_
6. **W11 approved signature interactions.** _(gate)_
7. **Final quality loop:** side-by-side page comparison, judge-mode flaw hunt, repeat until dry.

**Verification per phase:** `npm run lint` → `eslint . --max-warnings 0` → `npm run build` (all must stay 0). Preview-server visual checks for every visual workstream (remember: clear `.next` if Turbopack serves stale CSS; auth-gated pages render at ≥1024px viewport).

**Known decisions needed from user:** 9.7 (lab glass→app-card is a visible change), W11 concept selection.

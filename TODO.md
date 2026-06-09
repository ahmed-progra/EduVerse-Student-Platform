# TODO — EduVerse Anti-Gravity Visual Upgrade

- [x] Step 1: Update `frontend/src/app/globals.css`
  - [x] Add float keyframes + glow pulse
  - [x] Add shadow depth variables
  - [x] Apply float animations to feature cards, hero badge, hero CTA buttons, integration pills, dashboard preview (if present), navbar logo only
  - [x] Ensure float pause on hover and reduced-motion handling
  - [x] Update shadows/hover shadows using the new 3-layer formula
  - [x] IMPORTANT exclusions: nav links/buttons, paragraphs, code editor content, aurora blobs, canvas background

- [x] Step 2: Update `frontend/src/hooks/use-card-tilt.ts`
  - [x] Replace current landing-only tilt with reusable initTilt(selector, options)
  - [x] Disable tilt on mobile/hover:none
  - [x] Add glare overlay when enabled
  - [x] Ensure hover pauses float via CSS (animation-play-state paused on hover)
  - [x] Add subtle scroll parallax that stacks with tilt transforms (via CSS vars + combined transform output)
  - [x] Apply tilt to: `.feature-card`, `.skill-node`, `.dashboard-preview`, `.btn-primary`, `.integration-pill` (and map `.pill-tag` to `.integration-pill` via CSS only if needed)
  - [x] Do NOT apply tilt to: navbar, code editor, text blocks, input fields, canvas

- [ ] Step 3: TypeScript check
  - [ ] Run TypeScript check (npm scripts blocked by PowerShell execution policy in this environment)

- [ ] Step 4: Quick sanity verify by running build/lint if possible



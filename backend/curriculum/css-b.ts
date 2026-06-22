import { L, q, ex, LessonDef } from "./types";

/** CSS curriculum — Part B: stacking, flexbox, grid, responsive, motion, modern CSS (lessons 15–28). */
export const cssB: LessonDef[] = [
  L("Z-index & Stacking Contexts", ["positioning", "advanced-css"], "advanced", 12, {
    intro: `<p><code>z-index</code> controls which overlapping element paints on top — but it only works on positioned (or flex/grid-child) elements, and it operates within <em>stacking contexts</em>. The infamous "z-index: 99999 still doesn't work" bug is always a stacking-context problem, and after this lesson you'll diagnose it in seconds.</p>`,
    concepts: [
      `<strong>z-index needs position</strong> — static elements ignore it`,
      `<strong>Stacking contexts</strong> — created by positioned+z-index, opacity&lt;1, transform, filter, etc.`,
      `<strong>Context = sealed bag</strong> — children compete only INSIDE their context`,
      `<strong>Sibling contexts</strong> — compared by the contexts' own z-indexes, not their children's`,
    ],
    examples: [
      ex(
        "The classic trap, explained",
        `.sidebar {\n    position: relative;\n    z-index: 1;          /* creates a stacking context */\n}\n.sidebar .dropdown {\n    position: absolute;\n    z-index: 99999;       /* trapped inside the sidebar's context! */\n}\n.header {\n    position: relative;\n    z-index: 2;           /* beats the ENTIRE sidebar bag, dropdown included */\n}`,
        undefined,
        `The dropdown's 99999 only ranks it among sidebar children. Against the header, the comparison is 1 vs 2.`,
      ),
      ex(
        "A sane z-scale",
        `:root {\n    --z-dropdown: 100;\n    --z-sticky: 200;\n    --z-modal-backdrop: 900;\n    --z-modal: 1000;\n    --z-toast: 1100;\n}`,
      ),
    ],
    realWorld: `Every app eventually has the modal-under-the-header bug. Design systems publish z-scales (like the variables above) precisely so layers don't escalate into five-digit arms races.`,
    practice: `Reproduce the trap: a sidebar (z-index 1) containing a high-z dropdown, plus a header with z-index 2 overlapping it. Then fix it by restructuring (move the dropdown out, or rethink the contexts).`,
    mistakes: [
      `Cranking z-index higher instead of finding which ANCESTOR creates the limiting context`,
      `Forgetting that transform/opacity/filter silently create stacking contexts — animations can break layering`,
    ],
    best: [
      `Maintain a documented z-scale with gaps; never write a raw 99999`,
      `Render modals/toasts at the document root (portals) so no ancestor context can trap them`,
    ],
    template: `.header { position: sticky; top: 0; z-index: 200; background: white; }\n.dropdown { position: absolute; z-index: 100; }\n.modal { position: fixed; inset: 0; z-index: 1000; }`,
    quiz: [
      q(
        "z-index has no effect when the element is…",
        ["A flex child", "position: static (the default)", "Absolutely positioned", "In a grid"],
        1,
        `Static elements don't participate in z ordering — position them first.`,
      ),
      q(
        "A child with z-index 99999 renders under a sibling-of-its-parent with z-index 2. Why?",
        [
          "Browser bug",
          "The child is sealed inside its parent's stacking context, which ranks 1 vs 2",
          "Needs !important",
          "Wrong units",
        ],
        1,
        `Contexts compare as wholes; children can't escape their bag.`,
      ),
      q(
        "Which property does NOT create a stacking context?",
        ["opacity: 0.9", "transform: scale(1)", "color: red", "filter: blur(2px)"],
        2,
        `Paint-level properties like color don't; opacity/transform/filter do.`,
      ),
    ],
  }),

  L("Flexbox Fundamentals", ["flexbox"], "intermediate", 14, {
    intro: `<p>Flexbox lays out items along one axis — a row or a column — and finally makes "put these things next to each other, spaced nicely" trivial. One <code>display: flex</code> on the parent changes the rules for all its children, and two properties (<code>justify-content</code>, <code>align-items</code>) place them.</p>`,
    concepts: [
      `<strong>display: flex</strong> — the PARENT opts in; children become flex items`,
      `<strong>flex-direction</strong> — row (default) or column; defines the main axis`,
      `<strong>justify-content</strong> — distribution along the main axis`,
      `<strong>align-items</strong> — alignment on the cross axis`,
      `<strong>gap</strong> — spacing between items without margin hacks`,
    ],
    examples: [
      ex(
        "The navbar in five lines",
        `.navbar {\n    display: flex;\n    justify-content: space-between;\n    align-items: center;\n    gap: 16px;\n    padding: 12px 24px;\n}`,
        undefined,
        `Logo left, links right, everything vertically centered — the layout that used to take floats and prayers.`,
      ),
      ex(
        "Perfect centering",
        `.overlay {\n    display: flex;\n    justify-content: center;\n    align-items: center;\n    min-height: 100vh;\n}`,
        undefined,
        `The two-axis centering problem that haunted CSS for 15 years: solved in three declarations.`,
      ),
    ],
    realWorld: `Navbars, button rows, card footers, form layouts, media objects (avatar + text) — flexbox is the default tool for every one-dimensional arrangement, which is most arrangements.`,
    practice: `Build a navbar: brand name left, three links right (space-between), all centered vertically with a gap. Then a 100vh hero that perfectly centers one heading both ways.`,
    mistakes: [
      `Setting flex properties on the CHILDREN's parent expectations backwards — display: flex goes on the container`,
      `Mixing up the axes: justify-content follows flex-direction; in a column it's vertical!`,
    ],
    best: [
      `Reach for gap instead of margins between flex items — no first/last exceptions needed`,
      `Think in axes, not directions: main axis = flex-direction, cross axis = the other one`,
    ],
    template: `.navbar {\n    display: flex;\n    justify-content: space-between;\n    align-items: center;\n    gap: 16px;\n    padding: 12px 24px;\n    border-bottom: 1px solid #eee;\n}`,
    quiz: [
      q(
        "display: flex is applied to…",
        ["Each item", "The container whose children you're arranging", "The body", "Both"],
        1,
        `The parent declares the layout; children obey.`,
      ),
      q(
        "In flex-direction: column, justify-content controls…",
        [
          "Horizontal placement",
          "Vertical placement (the main axis is now vertical)",
          "Nothing",
          "Text alignment",
        ],
        1,
        `justify always follows the main axis, wherever it points.`,
      ),
      q(
        "The cleanest way to space flex items apart is…",
        [
          "Margins on each",
          "The gap property on the container",
          "Padding everywhere",
          "Empty divs",
        ],
        1,
        `gap handles inter-item spacing with zero edge cases.`,
      ),
    ],
  }),

  L("Flexbox: Grow, Shrink & Wrap", ["flexbox"], "intermediate", 14, {
    intro: `<p>The second half of flexbox is how items SIZE themselves: <code>flex-grow</code> shares leftover space, <code>flex-shrink</code> absorbs overflow, <code>flex-basis</code> sets the starting size, and <code>flex-wrap</code> lets crowded rows break into new lines. The shorthand <code>flex: 1</code> hides all three.</p>`,
    concepts: [
      `<strong>flex-grow</strong> — proportional shares of extra space`,
      `<strong>flex-shrink / flex-basis</strong> — how items give way / their starting size`,
      `<strong>flex: 1</strong> — grow 1, shrink 1, basis 0 — equal-share columns`,
      `<strong>flex-wrap: wrap</strong> — overflow becomes new rows`,
      `<strong>align-self</strong> — per-item cross-axis override`,
    ],
    examples: [
      ex(
        "The holy-grail content row",
        `.layout {\n    display: flex;\n    gap: 16px;\n}\n.sidebar { flex: 0 0 220px; }   /* fixed: no grow, no shrink, 220px */\n.content { flex: 1; }            /* takes ALL remaining space */`,
        undefined,
        `A fixed sidebar and fluid content — the most-built layout on the web.`,
      ),
      ex(
        "Wrapping card rows",
        `.cards {\n    display: flex;\n    flex-wrap: wrap;\n    gap: 16px;\n}\n.card {\n    flex: 1 1 240px;   /* grow, shrink, ideal 240px */\n}`,
        undefined,
        `Cards sit 4-up on wide screens, 2-up on tablets, stacked on phones — zero media queries.`,
      ),
    ],
    realWorld: `The flex: 1 1 240px wrapping pattern powers half the responsive card grids in production. Search bars (input flex: 1, button fixed), chat layouts (messages grow, composer fixed) — sizing IS the layout.`,
    practice: `Build a search row: a fixed 80px label, an input with flex: 1, and a fixed button. Below it, a wrapping card row of five cards with flex: 1 1 200px. Resize and watch both adapt.`,
    mistakes: [
      `flex: 1 on text containers without min-width: 0 — long words refuse to shrink past their content size`,
      `Expecting wrap by default — flex rows clip/squish until you say flex-wrap: wrap`,
    ],
    best: [
      `Write the full shorthand consciously: flex: &lt;grow&gt; &lt;shrink&gt; &lt;basis&gt;`,
      `For equal columns use flex: 1 (basis 0); for content-aware columns use flex: 1 1 auto`,
    ],
    template: `.row {\n    display: flex;\n    gap: 8px;\n}\n.row input { flex: 1; padding: 8px; }\n.row button { flex: 0 0 auto; padding: 8px 16px; }`,
    quiz: [
      q(
        "flex: 1 expands to…",
        ["grow 1 only", "grow 1, shrink 1, basis 0", "grow 1, shrink 0, basis auto", "width 100%"],
        1,
        `That zero basis is why flex: 1 columns end up perfectly equal.`,
      ),
      q(
        ".sidebar { flex: 0 0 220px } means…",
        [
          "Grows from 220px",
          "Fixed at 220px: never grows, never shrinks",
          "Max 220px",
          "Min 220px",
        ],
        1,
        `No grow, no shrink, basis 220 — a locked column.`,
      ),
      q(
        "Cards with flex: 1 1 240px in a wrap container will…",
        [
          "Always be 240px",
          "Wrap into fewer columns as space shrinks, flexing around 240px",
          "Overflow",
          "Stack always",
        ],
        1,
        `Basis sets the ideal; grow/shrink and wrap negotiate the rest.`,
      ),
    ],
  }),

  L("Flexbox Patterns", ["flexbox", "modern-layout"], "intermediate", 12, {
    intro: `<p>Time to cash in: this lesson is a cookbook of the flex patterns you'll build weekly — the media object, the sticky-footer page, push-apart rows, and the centered badge. Each is a few lines, and together they cover a startling share of real interfaces.</p>`,
    concepts: [
      `<strong>Media object</strong> — fixed avatar + flexible text`,
      `<strong>Sticky footer</strong> — min-height column with content flex: 1`,
      `<strong>margin-left: auto</strong> — push ONE item to the far end`,
      `<strong>Column cards</strong> — equal-height cards whose footers align`,
    ],
    examples: [
      ex(
        "Media object + auto-push",
        `.comment {\n    display: flex;\n    gap: 12px;\n    align-items: flex-start;\n}\n.comment img { flex: 0 0 48px; border-radius: 50%; }\n.comment .body { flex: 1; }\n.comment .time { margin-left: auto; }   /* pushed to the far right */`,
      ),
      ex(
        "Sticky footer page",
        `body {\n    min-height: 100vh;\n    display: flex;\n    flex-direction: column;\n    margin: 0;\n}\nmain { flex: 1; }   /* absorbs all spare height */\nfooter { padding: 16px; }`,
        undefined,
        `Short pages: footer rests at the viewport bottom. Long pages: it follows the content. One pattern, both behaviors.`,
      ),
    ],
    realWorld: `Every chat message, notification row, and comment thread is a media object. The sticky footer pattern ended a decade of hacks. Card grids where all footers align (flex column cards with margin-top:auto on the footer) are a design-review staple.`,
    practice: `Build a notification row: icon (fixed), title+text (flex: 1), timestamp pushed right with margin-left: auto, and a "mark read" button. Then sketch the sticky-footer page skeleton.`,
    mistakes: [
      `Nesting five flex containers when one with wrap/auto margins would do — flat layouts debug faster`,
      `Using space-between to push one item when margin-left: auto reads clearer with 3+ items`,
    ],
    best: [
      `Learn auto margins in flex — they absorb free space and solve "push just this one" elegantly`,
      `For equal-height cards: the card is a flex column, its footer carries margin-top: auto`,
    ],
    template: `.notification {\n    display: flex;\n    align-items: center;\n    gap: 12px;\n    padding: 12px;\n    border: 1px solid #eee;\n    border-radius: 8px;\n}\n.notification .text { flex: 1; }\n.notification time { margin-left: auto; color: #888; }`,
    quiz: [
      q(
        "In a flex row, margin-left: auto on the last item…",
        [
          "Centers it",
          "Pushes it to the far right, absorbing free space",
          "Hides it",
          "Breaks layout",
        ],
        1,
        `Auto margins eat available space — the push-apart tool.`,
      ),
      q(
        "The sticky-footer recipe is…",
        [
          "position: fixed footer",
          "body as min-100vh flex column; main gets flex: 1",
          "Giant margins",
          "A grid only",
        ],
        1,
        `main absorbs spare height, pinning the footer to the bottom on short pages.`,
      ),
      q(
        "To align footers across equal-height cards…",
        [
          "Fixed heights",
          "Each card is a flex column; the footer has margin-top: auto",
          "Tables",
          "JavaScript",
        ],
        1,
        `The auto margin pushes the footer to each card's bottom edge.`,
      ),
    ],
  }),

  L("Grid Fundamentals", ["grid"], "intermediate", 14, {
    intro: `<p>CSS Grid is two-dimensional: rows AND columns at once. Define the tracks on the container — <code>grid-template-columns: repeat(3, 1fr)</code> — and children fill the cells automatically. The <code>fr</code> unit divides space in fractions, and one <code>gap</code> rules all gutters.</p>`,
    concepts: [
      `<strong>display: grid</strong> + <strong>grid-template-columns/rows</strong> — declare the tracks`,
      `<strong>fr</strong> — fraction of free space; mix with px/auto freely`,
      `<strong>repeat()</strong> — <code>repeat(4, 1fr)</code>, and the magic <code>repeat(auto-fit, minmax(220px, 1fr))</code>`,
      `<strong>gap</strong> — row and column gutters in one property`,
    ],
    examples: [
      ex(
        "A 3-column gallery",
        `.gallery {\n    display: grid;\n    grid-template-columns: repeat(3, 1fr);\n    gap: 16px;\n}`,
        undefined,
        `Nine images? Three perfect rows. No clearfixes, no width math, no wrapping bugs.`,
      ),
      ex(
        "The responsive one-liner",
        `.cards {\n    display: grid;\n    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));\n    gap: 16px;\n}`,
        undefined,
        `As many ≥220px columns as fit, all equal, at every screen size — zero media queries. The most famous line of modern CSS.`,
      ),
    ],
    realWorld: `Photo galleries, product listings, dashboards, form layouts — grid handles the two-axis structures flexbox contorts around. The auto-fit/minmax line alone replaced thousands of media-query blocks across the industry.`,
    practice: `Build a 12-item gallery with repeat(3, 1fr) and gap, then swap in the auto-fit/minmax line and resize the window — count the columns at each width.`,
    mistakes: [
      `Sizing children with widths instead of sizing TRACKS on the container — grid thinks in tracks`,
      `Confusing auto-fit (collapses empty tracks, items stretch) with auto-fill (keeps ghost tracks)`,
    ],
    best: [
      `Mixed tracks are fine and powerful: <code>grid-template-columns: 220px 1fr 1fr</code>`,
      `Default to grid for 2-D layouts and flexbox for 1-D rows — they're teammates, not rivals`,
    ],
    template: `.cards {\n    display: grid;\n    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));\n    gap: 16px;\n}\n.card {\n    border: 1px solid #ddd;\n    border-radius: 8px;\n    padding: 16px;\n}`,
    quiz: [
      q(
        "grid-template-columns: 1fr 2fr creates…",
        ["Two equal columns", "Two columns; the second twice as wide", "Three columns", "An error"],
        1,
        `fr units split free space proportionally: 1 share vs 2 shares.`,
      ),
      q(
        "What does repeat(auto-fit, minmax(220px, 1fr)) achieve?",
        [
          "Fixed 220px columns",
          "As many ≥220px equal columns as fit the container",
          "One column",
          "Requires media queries",
        ],
        1,
        `The container packs and resizes columns automatically — intrinsic responsiveness.`,
      ),
      q(
        "Grid differs from flexbox because it…",
        [
          "Is newer",
          "Controls rows and columns simultaneously",
          "Only does columns",
          "Replaces HTML",
        ],
        1,
        `Two-dimensional track control is grid's defining power.`,
      ),
    ],
  }),

  L("Grid Template Areas", ["grid"], "intermediate", 12, {
    intro: `<p>Grid areas let you draw your layout as ASCII art: name regions in <code>grid-template-areas</code>, assign children with <code>grid-area</code>, and the stylesheet becomes a picture of the page. Rearranging the whole layout — including for mobile — means redrawing the picture, not touching the HTML.</p>`,
    concepts: [
      `<strong>grid-template-areas</strong> — quoted rows of area names`,
      `<strong>grid-area: name</strong> — places a child into its named region`,
      `<strong>Spanning</strong> — repeat a name across cells to stretch its area`,
      `<strong>"." placeholder</strong> — an intentionally empty cell`,
    ],
    examples: [
      ex(
        "The app shell, drawn",
        `.app {\n    display: grid;\n    grid-template-columns: 220px 1fr;\n    grid-template-rows: 56px 1fr 40px;\n    grid-template-areas:\n        "sidebar header"\n        "sidebar main"\n        "sidebar footer";\n    min-height: 100vh;\n}\n.app > header { grid-area: header; }\n.app > aside  { grid-area: sidebar; }\n.app > main   { grid-area: main; }\n.app > footer { grid-area: footer; }`,
        undefined,
        `Read the areas block — you can SEE the sidebar running down the left. Code that draws itself.`,
      ),
      ex(
        "Mobile: redraw, don't refactor",
        `@media (max-width: 700px) {\n    .app {\n        grid-template-columns: 1fr;\n        grid-template-rows: 56px 1fr auto 40px;\n        grid-template-areas:\n            "header"\n            "main"\n            "sidebar"\n            "footer";\n    }\n}`,
        undefined,
        `Same HTML, totally rearranged — the sidebar drops below main on phones.`,
      ),
    ],
    realWorld: `Admin dashboards, email clients, IDE-like apps — anything with named regions (header/sidebar/main/panel) reads beautifully as template areas, and design discussions can literally point at the CSS.`,
    practice: `Build the app shell above, then add a right-hand "panel" column on wide screens by extending the columns and the drawing. Verify the mobile redraw stacks everything.`,
    mistakes: [
      `Non-rectangular areas (an L-shaped name) — invalid; every named area must form a rectangle`,
      `Mismatched cell counts between rows in the template — the whole declaration is ignored silently`,
    ],
    best: [
      `Format the template strings aligned in columns — the readability IS the feature`,
      `Name areas by role (header, main) not position (top, left) — positions change per breakpoint`,
    ],
    template: `.app {\n    display: grid;\n    grid-template-columns: 200px 1fr;\n    grid-template-rows: 56px 1fr 40px;\n    grid-template-areas:\n        "sidebar header"\n        "sidebar main"\n        "sidebar footer";\n    min-height: 60vh;\n}\nheader { grid-area: header; background: #eee; }\naside { grid-area: sidebar; background: #ddd; }\nmain { grid-area: main; }\nfooter { grid-area: footer; background: #eee; }`,
    quiz: [
      q(
        'How does a child claim the "main" region?',
        ['class="main"', "grid-area: main;", 'area="main"', "grid-cell: main"],
        1,
        `grid-area binds the element to the named template region.`,
      ),
      q(
        'What does "." mean in a template row?',
        ["Error", "An intentionally empty cell", "Auto content", "A 1px track"],
        1,
        `The dot is the official empty-cell placeholder.`,
      ),
      q(
        "Why are template areas powerful for responsive design?",
        [
          "They're faster",
          "Redrawing the area map re-lays-out the page without HTML changes",
          "They compress CSS",
          "They aren't",
        ],
        1,
        `Breakpoints swap drawings, not markup.`,
      ),
    ],
  }),

  L("Grid Placement & Spanning", ["grid", "modern-layout"], "advanced", 12, {
    intro: `<p>Beyond auto-flow, you can place items surgically on the grid's numbered lines: <code>grid-column: 1 / 3</code> stretches across columns, <code>span 2</code> counts cells, and negative numbers count from the end. This is how featured cards break out of uniform grids — and how overlaps become possible without absolute positioning.</p>`,
    concepts: [
      `<strong>Line numbers</strong> — a 3-column grid has lines 1,2,3,4; -1 is the last line`,
      `<strong>grid-column / grid-row</strong> — start / end placement`,
      `<strong>span N</strong> — occupy N tracks from wherever auto-placement lands`,
      `<strong>Full bleed</strong> — <code>grid-column: 1 / -1</code> spans everything`,
    ],
    examples: [
      ex(
        "A featured card",
        `.grid {\n    display: grid;\n    grid-template-columns: repeat(4, 1fr);\n    gap: 16px;\n}\n.featured {\n    grid-column: span 2;\n    grid-row: span 2;\n}\n.banner {\n    grid-column: 1 / -1;   /* full width regardless of column count */\n}`,
        undefined,
        `The featured tile takes a 2×2 block; the banner always spans edge to edge.`,
      ),
      ex(
        "Deliberate overlap",
        `.stack {\n    display: grid;\n}\n.stack > * {\n    grid-area: 1 / 1;   /* every child in the same cell */\n}\n.stack .caption { align-self: end; }`,
        undefined,
        `All children share one cell — image below, caption overlaid at the bottom. Grid as a layering tool.`,
      ),
    ],
    realWorld: `Magazine-style portfolio grids, dashboard tiles of varying sizes (the 2×2 chart among 1×1 stats), and image-with-overlay patterns. The single-cell stack has largely replaced position: absolute for overlays.`,
    practice: `Make a 4-column, 12-tile dashboard where tile #1 spans 2×2 and tile #6 spans all columns (1 / -1). Then build the single-cell stack: a placeholder image with a caption pinned to its bottom.`,
    mistakes: [
      `Off-by-one on lines: 3 columns means line 4 exists — grid-column: 1 / 4 is full width, not overflow`,
      `Explicit placements colliding — later items get auto-flowed into surprising holes; check the grid inspector`,
    ],
    best: [
      `Use -1 for "the end" so spans survive column-count changes`,
      `Open DevTools' grid overlay when placing — the numbered lines remove all guesswork`,
    ],
    template: `.dash {\n    display: grid;\n    grid-template-columns: repeat(4, 1fr);\n    gap: 12px;\n}\n.tile { background: #eee; border-radius: 8px; min-height: 70px; }\n.tile.hero { grid-column: span 2; grid-row: span 2; }\n.tile.banner { grid-column: 1 / -1; }`,
    quiz: [
      q(
        "grid-column: 1 / -1 means…",
        [
          "First column only",
          "From the first line to the last — full width",
          "Reverse order",
          "Invalid",
        ],
        1,
        `Negative indices count from the end; -1 is the final line.`,
      ),
      q(
        "In a 4-column grid, how many vertical lines exist?",
        ["3", "4", "5", "8"],
        2,
        `Lines bound the tracks: n columns → n+1 lines.`,
      ),
      q(
        "Placing every child at grid-area: 1 / 1 creates…",
        ["An error", "A stack — children layer in one cell", "A single row", "Spacing"],
        1,
        `Same-cell placement overlaps items — the modern overlay technique.`,
      ),
    ],
  }),

  L("Media Queries", ["responsive"], "intermediate", 12, {
    intro: `<p>Media queries apply CSS conditionally — by viewport width, orientation, color-scheme preference, or motion tolerance. They're the classic backbone of responsive design: define breakpoints where the layout genuinely needs to change, and let everything else flex.</p>`,
    concepts: [
      `<strong>@media (min-width: 768px)</strong> — rules for wider screens (mobile-first style)`,
      `<strong>Breakpoints by content</strong> — break where the design breaks, not at device names`,
      `<strong>prefers-color-scheme / prefers-reduced-motion</strong> — user preference queries`,
      `<strong>Viewport meta required</strong> — without it, phones fake 980px`,
    ],
    examples: [
      ex(
        "Mobile-first column count",
        `.cards { display: grid; grid-template-columns: 1fr; gap: 16px; }\n\n@media (min-width: 600px) {\n    .cards { grid-template-columns: repeat(2, 1fr); }\n}\n@media (min-width: 1000px) {\n    .cards { grid-template-columns: repeat(4, 1fr); }\n}`,
        undefined,
        `Base styles serve phones; each query ADDS for bigger screens. One direction, no overrides fighting.`,
      ),
      ex(
        "Respecting user preferences",
        `@media (prefers-color-scheme: dark) {\n    body { background: #15131f; color: #eee; }\n}\n@media (prefers-reduced-motion: reduce) {\n    * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }\n}`,
        undefined,
        `Dark mode and motion sensitivity are OS settings your CSS can honor automatically.`,
      ),
    ],
    realWorld: `60%+ of web traffic is mobile; responsive isn't optional. The preference queries are accessibility requirements too — vestibular-disorder users rely on reduced-motion, and EduVerse's own stylesheet honors it.`,
    practice: `Build a stat row that's stacked on mobile, 2-up at 600px, 4-up at 1000px (mobile-first). Add a prefers-color-scheme: dark block that swaps your colors.`,
    mistakes: [
      `Mixing min- and max-width chaotically — overlapping ranges where both apply and fight`,
      `Breakpoints named after devices ("ipad") — devices churn; content-driven widths endure`,
    ],
    best: [
      `Pick ONE direction (mobile-first min-width) and stay consistent`,
      `Test by dragging the window — the design should never look broken BETWEEN breakpoints`,
    ],
    template: `.stats { display: grid; grid-template-columns: 1fr; gap: 12px; }\n@media (min-width: 600px) {\n    .stats { grid-template-columns: repeat(2, 1fr); }\n}\n@media (min-width: 1000px) {\n    .stats { grid-template-columns: repeat(4, 1fr); }\n}`,
    quiz: [
      q(
        "Mobile-first means…",
        [
          "Designing only for phones",
          "Base styles for small screens; min-width queries add for larger",
          "max-width queries",
          "An app store strategy",
        ],
        1,
        `You enhance upward instead of overriding downward.`,
      ),
      q(
        "@media (prefers-reduced-motion: reduce) exists because…",
        [
          "Slow networks",
          "Some users get dizzy/nauseous from interface motion",
          "Battery saving",
          "Old browsers",
        ],
        1,
        `It's a vestibular accessibility setting your CSS should respect.`,
      ),
      q(
        "Where should breakpoints come from?",
        [
          "Apple's device list",
          "Wherever YOUR layout starts to break",
          "Round numbers",
          "Frameworks only",
        ],
        1,
        `Content-driven breakpoints outlive any device generation.`,
      ),
    ],
  }),

  L("Fluid & Intrinsic Design", ["responsive", "modern-layout"], "advanced", 12, {
    intro: `<p>The modern school of responsive design uses fewer media queries, not more: <code>clamp()</code> for fluid type, <code>min()</code>/<code>max()</code> for self-limiting sizes, and intrinsic patterns like auto-fit grids that adapt to their container. The layout responds continuously instead of jumping at breakpoints.</p>`,
    concepts: [
      `<strong>clamp(min, preferred, max)</strong> — fluid values with guardrails`,
      `<strong>Fluid type</strong> — <code>font-size: clamp(1rem, 0.8rem + 1vw, 1.5rem)</code>`,
      `<strong>min() / max()</strong> — <code>width: min(90%, 70rem)</code> replaces width+max-width`,
      `<strong>Intrinsic layout</strong> — auto-fit grids and flex-wrap respond to CONTAINER size`,
    ],
    examples: [
      ex(
        "Fluid heading + container",
        `h1 {\n    font-size: clamp(1.75rem, 1.2rem + 2.5vw, 3.5rem);\n}\n.container {\n    width: min(92%, 72rem);\n    margin-inline: auto;\n}`,
        undefined,
        `The heading scales smoothly from phone to desktop — no breakpoint stairsteps. The container caps itself in one declaration.`,
      ),
      ex(
        "The complete intrinsic card grid",
        `.cards {\n    display: grid;\n    grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr));\n    gap: clamp(12px, 2vw, 24px);\n}`,
        undefined,
        `min(100%, 240px) prevents overflow on ultra-narrow screens. Zero media queries, fully adaptive.`,
      ),
    ],
    realWorld: `Design systems ship fluid type scales (clamp curves per heading level) so typography fits every screen without per-breakpoint font sizes. Component libraries lean intrinsic because a card can't know if it renders in a sidebar or a hero.`,
    practice: `Make a page with: a clamp()-fluid h1, a min(92%, 70rem) container, and an intrinsic card grid with fluid gap. Resize continuously — nothing should ever jump.`,
    mistakes: [
      `Pure-vw font sizes without clamp — microscopic on phones, billboard on monitors, and they break zoom`,
      `Breakpointing things that could be fluid — every query is future maintenance`,
    ],
    best: [
      `Include a rem term in clamp's middle value (0.8rem + 1vw) so user font-size settings still scale text`,
      `Queries for STRUCTURE changes (sidebar drops below), fluidity for SIZE changes`,
    ],
    template: `h1 { font-size: clamp(1.5rem, 1rem + 2.5vw, 3rem); }\n.container { width: min(92%, 70rem); margin-inline: auto; }\n.cards {\n    display: grid;\n    grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr));\n    gap: clamp(12px, 2vw, 24px);\n}`,
    quiz: [
      q(
        "clamp(1rem, 2.5vw, 2rem) guarantees…",
        [
          "Always 2.5vw",
          "Never below 1rem nor above 2rem, fluid between",
          "Exactly 1.5rem",
          "Breakpoints",
        ],
        1,
        `clamp is a fluid value with a floor and a ceiling.`,
      ),
      q(
        "width: min(90%, 60rem) is equivalent to…",
        ["width 90% only", "width: 90% with max-width: 60rem", "max() reversed", "60rem always"],
        1,
        `min() picks the smaller — percentage on small screens, cap on large.`,
      ),
      q(
        "Why include a rem term in fluid font formulas?",
        [
          "Tradition",
          "So browser/user font-size preferences still affect the text (zoom & a11y)",
          "Performance",
          "vw is buggy",
        ],
        1,
        `Pure-viewport text ignores user scaling — the rem component restores it.`,
      ),
    ],
  }),

  L("Transitions", ["transitions"], "intermediate", 10, {
    intro: `<p>Transitions animate property CHANGES: hover states, theme switches, panel toggles. Declare which properties, how long, and with what easing — the browser tweens the frames. The craft is speed (fast!), easing choice, and animating only the properties the GPU can composite.</p>`,
    concepts: [
      `<strong>transition: property duration easing delay</strong>`,
      `<strong>Performance pair</strong> — transform and opacity animate cheap; width/top cause layout`,
      `<strong>Easing</strong> — ease-out for entrances, ease-in for exits; cubic-bezier for character`,
      `<strong>Where to declare</strong> — on the base state, so it runs BOTH ways`,
    ],
    examples: [
      ex(
        "A button that feels alive",
        `.btn {\n    background: #7c5cff;\n    transform: translateY(0);\n    box-shadow: 0 2px 6px rgb(0 0 0 / 0.15);\n    transition: transform 150ms ease-out, box-shadow 150ms ease-out;\n}\n.btn:hover {\n    transform: translateY(-2px);\n    box-shadow: 0 6px 16px rgb(0 0 0 / 0.2);\n}\n.btn:active { transform: translateY(0); }`,
        undefined,
        `150ms — interfaces should respond, not perform. The lift+shadow pair sells the depth.`,
      ),
      ex(
        "Why transform beats top/width",
        `/* ✗ janky: layout recalculated every frame */\n.panel { left: -300px; transition: left 300ms; }\n\n/* ✓ smooth: GPU compositing only */\n.panel { transform: translateX(-300px); transition: transform 300ms ease-out; }`,
      ),
    ],
    realWorld: `Micro-interactions — button lifts, card hovers, toggle sweeps — are what make products feel "premium" (this project's own DESIGN.md budgets motion deliberately). Jank from animating layout properties is a top frontend-performance complaint.`,
    practice: `Build a card whose hover lifts it 4px with a deepening shadow over 180ms ease-out, and a link whose underline fades in via opacity (not text-decoration). Verify both reverse smoothly.`,
    mistakes: [
      `transition: all — accidentally animating layout shifts and color flashes you never intended`,
      `300ms+ on hover effects — the UI feels like it's underwater; 120–200ms is the pocket`,
    ],
    best: [
      `Name the exact properties you transition; never all`,
      `Wrap motion in @media (prefers-reduced-motion: no-preference) or zero it in the reduce query`,
    ],
    template: `.card {\n    transform: translateY(0);\n    box-shadow: 0 1px 4px rgb(0 0 0 / 0.12);\n    transition: transform 180ms ease-out, box-shadow 180ms ease-out;\n}\n.card:hover {\n    transform: translateY(-4px);\n    box-shadow: 0 10px 24px rgb(0 0 0 / 0.16);\n}`,
    quiz: [
      q(
        "Which pair animates cheapest?",
        ["width & height", "transform & opacity", "top & left", "margin & padding"],
        1,
        `They composite on the GPU without triggering layout or paint.`,
      ),
      q(
        "Where does the transition property belong for symmetric in/out animation?",
        ["On :hover", "On the base state", "On both", "In a keyframe"],
        1,
        `Declared on :hover only, the EXIT snaps with no transition.`,
      ),
      q(
        "Why avoid transition: all?",
        [
          "Syntax error",
          "It animates unintended properties and costs performance",
          "Too fast",
          "Deprecated",
        ],
        1,
        `Explicit property lists keep motion intentional and cheap.`,
      ),
    ],
  }),

  L("Transforms", ["transitions", "animations"], "intermediate", 10, {
    intro: `<p><code>transform</code> moves, scales, rotates, and skews elements in their own compositing layer — without disturbing the layout around them. That independence is why transforms are the muscle behind nearly all UI motion, from hover lifts to spinners to 3D card flips.</p>`,
    concepts: [
      `<strong>translate / scale / rotate</strong> — move, resize, spin (combinable, order matters)`,
      `<strong>transform-origin</strong> — the pivot point`,
      `<strong>Centering trick</strong> — <code>translate(-50%, -50%)</code> from a 50%/50% position`,
      `<strong>3D basics</strong> — perspective + rotateY for flips`,
    ],
    examples: [
      ex(
        "Combining transforms",
        `.icon:hover {\n    transform: translateY(-2px) scale(1.1) rotate(-3deg);\n    transition: transform 160ms ease-out;\n}\n.dropdown {\n    transform-origin: top center;\n    transform: scaleY(0.95);\n    opacity: 0;\n}\n.dropdown.open {\n    transform: scaleY(1);\n    opacity: 1;\n}`,
        undefined,
        `Dropdowns that grow from their origin feel attached; origin controls the story.`,
      ),
      ex(
        "The absolute-center classic",
        `.modal {\n    position: fixed;\n    top: 50%;\n    left: 50%;\n    transform: translate(-50%, -50%);\n}`,
        undefined,
        `Position sets the element's top-left at center; the translate pulls it back by half its OWN size.`,
      ),
    ],
    realWorld: `Loading spinners are rotate animations; toast slide-ins are translates; "card flip" reveals are rotateY with perspective; pinch-zoom maps are scale. Transform is the vocabulary of every product's motion language.`,
    practice: `Build a badge that scales 1.15 and tilts -4deg on hover (with a transition), and center a fixed modal using the translate trick. Bonus: set transform-origin so the badge pivots from its bottom-left.`,
    mistakes: [
      `Expecting transforms to push neighbors — they don't; surrounding layout is untouched (feature, not bug)`,
      `Order blindness: rotate-then-translate moves along the ROTATED axis; translate-then-rotate doesn't`,
    ],
    best: [
      `Animate transforms instead of top/left/width — always`,
      `Set transform-origin to match the motion's physical story (menus grow from their trigger)`,
    ],
    template: `.badge {\n    display: inline-block;\n    padding: 6px 14px;\n    background: #7c5cff;\n    color: white;\n    border-radius: 999px;\n    transition: transform 160ms ease-out;\n}\n.badge:hover {\n    transform: scale(1.15) rotate(-4deg);\n}`,
    quiz: [
      q(
        "transform: translateX(40px) affects surrounding elements how?",
        [
          "Pushes them right",
          "Not at all — the element moves in its own layer",
          "Reflows text",
          "Hides them",
        ],
        1,
        `Transforms are visual displacement; layout stays where it was.`,
      ),
      q(
        "The translate(-50%, -50%) centering trick works because…",
        [
          "Percentages refer to the PARENT",
          "Translate percentages refer to the element's OWN size",
          "It rounds",
          "Magic numbers",
        ],
        1,
        `That self-reference is what position offsets can't do alone.`,
      ),
      q(
        "Does transform order matter?",
        [
          "No",
          "Yes — each transform operates in the coordinate space left by the previous",
          "Only with 3D",
          "Only with scale",
        ],
        1,
        `rotate(45deg) translateX(100px) moves diagonally; the reverse doesn't.`,
      ),
    ],
  }),

  L("Keyframe Animations", ["animations"], "advanced", 12, {
    intro: `<p>Where transitions need a trigger, <code>@keyframes</code> animations run on their own: spinners, pulses, entrance sequences, skeleton shimmers. Define the timeline in percentages, then attach it with the <code>animation</code> shorthand — duration, easing, delay, iteration count, fill mode.</p>`,
    concepts: [
      `<strong>@keyframes name { from/to or % }</strong> — the timeline`,
      `<strong>animation shorthand</strong> — name duration easing delay count direction fill`,
      `<strong>infinite + linear</strong> — spinners; <strong>alternate</strong> — pulse loops`,
      `<strong>fill-mode: both</strong> — hold the first/last frame outside the run`,
      `<strong>Stagger</strong> — same animation, increasing delays per item`,
    ],
    examples: [
      ex(
        "Spinner and entrance",
        `@keyframes spin {\n    to { transform: rotate(360deg); }\n}\n.loader {\n    animation: spin 0.8s linear infinite;\n}\n\n@keyframes fade-up {\n    from { opacity: 0; transform: translateY(12px); }\n    to   { opacity: 1; transform: translateY(0); }\n}\n.card {\n    animation: fade-up 0.5s ease-out both;\n}`,
      ),
      ex(
        "Staggered list reveal",
        `.item { animation: fade-up 0.4s ease-out both; }\n.item:nth-child(1) { animation-delay: 0ms; }\n.item:nth-child(2) { animation-delay: 60ms; }\n.item:nth-child(3) { animation-delay: 120ms; }`,
        undefined,
        `The 60ms cascade reads as one choreographed entrance — EduVerse's own dashboard does exactly this.`,
      ),
    ],
    realWorld: `Skeleton loading shimmers, typing indicators, notification pulses, hero entrance choreography — every polished product runs on a small set of named keyframe animations reused everywhere.`,
    practice: `Create three animations: an infinite spinner, a fade-up entrance with fill both, and a 3-item staggered list (60ms steps). Then add the prefers-reduced-motion guard that disables them.`,
    mistakes: [
      `Animating without fill-mode — the element snaps back to its pre-animation state at the end`,
      `Infinite attention-seeking pulses on non-critical UI — motion fatigue is real; loops are for loading states`,
    ],
    best: [
      `Name keyframes by what they DO (fade-up, pulse) and reuse them as a motion vocabulary`,
      `Always ship the reduced-motion override — looping animation is an accessibility hazard`,
    ],
    template: `@keyframes fade-up {\n    from { opacity: 0; transform: translateY(12px); }\n    to   { opacity: 1; transform: translateY(0); }\n}\n.item { animation: fade-up 0.4s ease-out both; }\n.item:nth-child(2) { animation-delay: 60ms; }\n.item:nth-child(3) { animation-delay: 120ms; }\n@media (prefers-reduced-motion: reduce) {\n    .item { animation: none; }\n}`,
    quiz: [
      q(
        "Transitions vs animations?",
        [
          "Same thing",
          "Transitions need a property change; animations run from keyframe timelines on their own",
          "Animations are faster",
          "Transitions loop",
        ],
        1,
        `Keyframes give autonomous, multi-step, loopable motion.`,
      ),
      q(
        "animation-fill-mode: both does what?",
        [
          "Plays twice",
          "Applies the first frame before and holds the last frame after",
          "Reverses",
          "Infinite",
        ],
        1,
        `Without fill, elements snap to their unanimated state at the edges.`,
      ),
      q(
        "A loading spinner uses…",
        ["alternate + ease", "linear + infinite", "one iteration", "fill: none only"],
        1,
        `Constant-speed endless rotation: linear easing, infinite count.`,
      ),
    ],
  }),

  L("CSS Variables & calc()", ["advanced-css", "modern-layout"], "advanced", 12, {
    intro: `<p>Custom properties (<code>--name</code>) turn your stylesheet into a themable system: define design tokens once on <code>:root</code>, reference them everywhere with <code>var()</code>, and override them per-section or per-theme — they cascade like any property. <code>calc()</code> mixes units arithmetically, and together they replace entire preprocessor workflows.</p>`,
    concepts: [
      `<strong>--token: value</strong> on :root; <strong>var(--token, fallback)</strong> to use`,
      `<strong>Cascade-aware</strong> — redefine inside any selector to retheme its subtree`,
      `<strong>Theming</strong> — a [data-theme="dark"] block that only swaps token values`,
      `<strong>calc()</strong> — <code>width: calc(100% - 2rem)</code>; mixes %, rem, px`,
    ],
    examples: [
      ex(
        "Tokens and a dark theme",
        `:root {\n    --bg: #ffffff;\n    --text: #1c1a26;\n    --accent: #7c5cff;\n    --space: 1rem;\n}\n[data-theme="dark"] {\n    --bg: #15131f;\n    --text: #eceaf4;\n    --accent: #9b82ff;\n}\nbody {\n    background: var(--bg);\n    color: var(--text);\n}\n.btn { background: var(--accent); padding: calc(var(--space) / 2) var(--space); }`,
        undefined,
        `Dark mode = one attribute flip on &lt;html&gt;. No component rewrites — the tokens carry the theme.`,
      ),
      ex(
        "calc in layout",
        `.sidebar-layout main {\n    width: calc(100% - 260px);\n}\n.full-bleed {\n    margin-inline: calc(50% - 50vw);   /* escape a centered container */\n}`,
      ),
    ],
    realWorld: `EduVerse's entire visual identity lives in custom-property tokens in globals.css — exactly this pattern. Every design system (Tailwind themes, Material, Radix) ships as token sets; runtime theme switching is only possible because variables cascade live.`,
    practice: `Build a token set (--bg, --text, --accent, --radius, --space), a card consuming only tokens, and a [data-theme="dark"] override block. Toggle the attribute in DevTools and watch the retheme.`,
    mistakes: [
      `calc without spaces around - and +: <code>calc(100%-2rem)</code> is invalid`,
      `Hardcoding values next to the token system — every raw #hex is a future inconsistency`,
    ],
    best: [
      `Name tokens semantically (--surface, --text-muted) not by value (--light-gray) — themes change values`,
      `Give var() fallbacks in component libraries: <code>var(--radius, 8px)</code>`,
    ],
    template: `:root {\n    --bg: #fff;\n    --text: #1c1a26;\n    --accent: #7c5cff;\n    --radius: 10px;\n    --space: 1rem;\n}\n.card {\n    background: var(--bg);\n    color: var(--text);\n    border: 1px solid color-mix(in srgb, var(--accent) 25%, transparent);\n    border-radius: var(--radius);\n    padding: var(--space);\n}`,
    quiz: [
      q(
        "Where are global design tokens conventionally defined?",
        ["body", ":root", "html *", "@tokens"],
        1,
        `:root has the highest-level scope — every element inherits from it.`,
      ),
      q(
        "How does CSS-only dark mode typically work?",
        [
          "Duplicate stylesheets",
          "A theme selector overrides the same custom properties with dark values",
          "JavaScript repaints",
          "Filters",
        ],
        1,
        `Components reference tokens; themes redefine them.`,
      ),
      q(
        "Which calc is valid?",
        ["calc(100%-20px)", "calc(100% - 20px)", "calc(100% -20px)", "calc(100 % - 20px)"],
        1,
        `The +/- operators require surrounding spaces.`,
      ),
    ],
  }),

  L("Pseudo-classes & Pseudo-elements", ["selectors", "advanced-css"], "intermediate", 12, {
    intro: `<p>Pseudo-classes (single colon) select STATES and positions: :hover, :focus-visible, :nth-child, :not. Pseudo-elements (double colon) create or target SUB-PARTS: ::before, ::after, ::placeholder, ::selection. Together they style interaction and generate decoration without touching the HTML.</p>`,
    concepts: [
      `<strong>Interaction states</strong> — :hover, :focus-visible, :active, :disabled, :checked`,
      `<strong>Structural</strong> — :first-child, :nth-child(odd / 3n+1), :last-child, :empty`,
      `<strong>Logical</strong> — :not(), :is() to compress selector lists`,
      `<strong>::before/::after</strong> — generated content (needs <code>content</code>), decoration layer`,
    ],
    examples: [
      ex(
        "States and stripes",
        `tr:nth-child(even) { background: #f7f6fb; }\nbutton:focus-visible { outline: 2px solid #7c5cff; outline-offset: 2px; }\nbutton:disabled { opacity: 0.5; cursor: not-allowed; }\nli:not(:last-child) { border-bottom: 1px solid #eee; }`,
        undefined,
        `Zebra tables, visible keyboard focus, and divider-between-items — all markup-free.`,
      ),
      ex(
        "Generated decoration",
        `.tag::before {\n    content: "# ";\n    color: #7c5cff;\n}\n.external::after {\n    content: " ↗";\n    font-size: 0.85em;\n}\n.quote::selection { background: #7c5cff; color: white; }`,
        undefined,
        `::before/::after are real boxes you can style, position, and animate — the decoration workhorses.`,
      ),
    ],
    realWorld: `Checkbox-styled toggles ride on :checked + sibling selectors; required-field asterisks are ::after content; tooltips, ribbons, and underline animations are positioned pseudo-elements. Interfaces would need double the markup without them.`,
    practice: `Style a list: zebra striping (nth-child), dividers between items (:not(:last-child)), a "▸" ::before marker on each, and a :focus-visible outline on its links. No HTML changes allowed.`,
    mistakes: [
      `Forgetting content: "" — the pseudo-element doesn't render at all without it`,
      `Styling :focus away (or only :hover) — keyboard users need :focus-visible affordances`,
    ],
    best: [
      `Use :focus-visible (not bare :focus) — focus rings for keyboard users without mouse-click flashes`,
      `Keep generated content decorative — critical info in ::before is invisible to most assistive tech`,
    ],
    template: `li { padding: 8px 4px; }\nli:nth-child(even) { background: #f6f4fc; }\nli:not(:last-child) { border-bottom: 1px solid #e8e5f2; }\nli::before { content: "▸ "; color: #7c5cff; }\na:focus-visible { outline: 2px solid #7c5cff; outline-offset: 2px; }`,
    quiz: [
      q(
        "::before requires which property to render?",
        ["display", 'content (even if empty "")', "position", "z-index"],
        1,
        `No content declaration, no box — the most common pseudo-element gotcha.`,
      ),
      q(
        ":nth-child(odd) on table rows gives you…",
        ["The first row", "Zebra striping", "Hover states", "Column styling"],
        1,
        `Alternating-row backgrounds without extra classes.`,
      ),
      q(
        ":focus-visible differs from :focus by…",
        [
          "Nothing",
          "Showing primarily for keyboard navigation, not mouse clicks",
          "Working on divs",
          "Being faster",
        ],
        1,
        `It targets focus indication where it's needed without the click-flash complaints.`,
      ),
    ],
  }),
];

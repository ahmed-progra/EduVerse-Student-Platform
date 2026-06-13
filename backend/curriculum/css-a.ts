import { L, q, ex, LessonDef } from "./types";

/** CSS curriculum — Part A: selectors, color, typography, box model (lessons 1–14). */
export const cssA: LessonDef[] = [
  L("Intro to CSS", ["selectors"], "beginner", 8, {
    intro: `<p>CSS styles HTML: you select elements, then declare property–value pairs for them. Three places can hold CSS — inline, a &lt;style&gt; block, or (best) an external file — and the "cascade" decides what wins when rules collide.</p>`,
    concepts: [
      `<strong>Rule anatomy</strong> — <code>selector { property: value; }</code>`,
      `<strong>Three locations</strong> — inline style="", &lt;style&gt; block, linked .css file`,
      `<strong>The cascade</strong> — later/more-specific rules override earlier/looser ones`,
      `<strong>Comments</strong> — <code>/* like this */</code>`,
    ],
    examples: [
      ex("First stylesheet", `/* styles.css */\nbody {\n    font-family: Georgia, serif;\n    background: #faf8f5;\n    color: #222;\n}\nh1 {\n    color: #7c5cff;\n}`, undefined, `Linked via &lt;link rel="stylesheet" href="styles.css"&gt; — one file styles every page.`),
      ex("Why external beats inline", `<!-- ✗ repeated on every element, unmaintainable -->\n<p style="color: blue; font-size: 18px">...</p>\n\n/* ✓ one rule, site-wide */\np { color: blue; font-size: 18px; }`),
    ],
    realWorld: `Every visual property of every site you use — spacing, color, motion — is CSS. Teams keep it in versioned external files so a single change re-themes thousands of pages.`,
    practice: `Style a page: serif body font, off-white background, one accent color applied to all h2 elements, and a comment labeling each section of your stylesheet.`,
    mistakes: [
      `Missing semicolons between declarations — the next property silently breaks`,
      `Inline styles everywhere — they're hardest to override and impossible to reuse`,
    ],
    best: [
      `Keep all CSS in external files; reserve inline styles for one-off dynamic values`,
      `Group related rules and comment sections — stylesheets grow fast`,
    ],
    template: `body {\n    font-family: Georgia, serif;\n    background: #faf8f5;\n}\n/* Headings */\nh2 {\n    color: #7c5cff;\n}`,
    quiz: [
      q("In p { color: red; }, what is p?", ["A property", "The selector", "A value", "A variable"], 1, `The selector chooses which elements the declarations apply to.`),
      q("Which CSS location is most maintainable?", ["Inline styles", "Style blocks per page", "External stylesheet", "JavaScript"], 2, `One linked file serves the whole site and caches in the browser.`),
      q("What separates declarations inside a rule?", ["Commas", "Semicolons", "Newlines only", "Pipes"], 1, `property: value pairs end with ; — omitting it breaks the next pair.`),
    ],
  }),

  L("Selectors: Element, Class & ID", ["selectors"], "beginner", 10, {
    intro: `<p>Selectors are how you aim your styles. Element selectors hit every tag of a kind; class selectors (<code>.card</code>) hit whatever you've labeled; ID selectors (<code>#header</code>) hit the single element with that id. Classes are the workhorse — reusable, composable, and not too powerful.</p>`,
    concepts: [
      `<strong>element</strong> — <code>p { }</code> all paragraphs`,
      `<strong>.class</strong> — any elements carrying class="..." (reusable)`,
      `<strong>#id</strong> — the one element with that id (unique per page)`,
      `<strong>Grouping & combining</strong> — <code>h1, h2 { }</code> and <code>p.note</code> (p that has .note)`,
    ],
    examples: [
      ex("The three aims", `p { line-height: 1.6; }\n\n.card {\n    border: 1px solid #ddd;\n    padding: 16px;\n}\n\n#site-header {\n    position: sticky;\n    top: 0;\n}`, undefined, `HTML side: &lt;div class="card"&gt;, &lt;header id="site-header"&gt;.`),
      ex("Combining classes", `.btn { padding: 8px 16px; border-radius: 6px; }\n.btn-danger { background: crimson; color: white; }\n\n/* <button class="btn btn-danger">Delete</button> gets both */`),
    ],
    realWorld: `Design systems are class libraries: .btn, .card, .badge composed across thousands of components. IDs are mostly reserved for JS hooks and label/for bindings — modern CSS leans on classes almost exclusively.`,
    practice: `Style a pricing trio: a shared .plan class (border, padding), a .featured class adding an accent border, applied together on the middle plan, and an id-targeted #best-badge.`,
    mistakes: [
      `Reusing an id on multiple elements — invalid HTML and breaks label/anchor behavior`,
      `Styling everything by element (div { }) — too broad; you'll fight your own rules`,
    ],
    best: [
      `Default to classes for styling; let ids serve anchors, labels, and scripts`,
      `Name classes by role (.price-card) not appearance (.blue-box) — designs change`,
    ],
    template: `.plan {\n    border: 1px solid #ccc;\n    padding: 20px;\n    border-radius: 8px;\n}\n.featured {\n    border-color: #7c5cff;\n    border-width: 2px;\n}`,
    quiz: [
      q("Which selector targets class=\"alert\"?", ["alert", "#alert", ".alert", "*alert"], 2, `Dot prefix selects classes; hash selects ids.`),
      q("How many elements may share one id?", ["Unlimited", "One", "Two", "One per section"], 1, `ids are unique per page — that's their contract.`),
      q("What does p.note select?", ["All p and all .note", "Paragraphs that ALSO have class note", "Notes inside paragraphs", "Invalid"], 1, `Concatenated simple selectors must all match the same element.`),
    ],
  }),

  L("Combinators & Attribute Selectors", ["selectors"], "intermediate", 12, {
    intro: `<p>Combinators select by relationship: descendants, direct children, adjacent siblings. Attribute selectors match by attributes and their values. Together they let you style structures precisely without classing every element.</p>`,
    concepts: [
      `<strong>A B</strong> — any B descendant of A`,
      `<strong>A &gt; B</strong> — B only as a direct child`,
      `<strong>A + B</strong> — the B immediately after A; <strong>A ~ B</strong> — all following siblings`,
      `<strong>[attr] / [attr="v"] / [attr^="v"]</strong> — has attribute / exact / starts-with`,
    ],
    examples: [
      ex("Relationship targeting", `nav a { text-decoration: none; }     /* any link inside nav */\n.menu > li { border-bottom: 1px solid #eee; }  /* direct items only */\nh2 + p { font-size: 1.1em; }          /* the paragraph right after each h2 */`),
      ex("Attribute matching", `input[type="checkbox"] { accent-color: #7c5cff; }\na[target="_blank"]::after { content: " ↗"; }\na[href^="https://"] { color: seagreen; }\n[data-state="locked"] { opacity: 0.5; }`, undefined, `The ↗ arrow auto-marks every new-tab link — pure CSS, no extra classes.`),
    ],
    realWorld: `Form styling runs on attribute selectors (every input type differs). Docs sites style external links automatically with [href^="http"]. Data-attribute selectors pair with the data-* lessons from HTML — state-driven styling without class juggling.`,
    practice: `Write rules that: remove underlines from links inside nav only, give the first paragraph after every h3 a larger font (+), and add a 🔒 after any element with data-locked="true" using ::after.`,
    mistakes: [
      `Deep descendant chains (.page .content .card .title) — brittle; one HTML change breaks them`,
      `Confusing A B (any depth) with A > B (one level) — different matches`,
    ],
    best: [
      `Keep selectors shallow — two levels is usually plenty`,
      `Prefer attribute/state selectors ([data-open]) over adding/removing style classes from JS`,
    ],
    template: `nav a { text-decoration: none; }\nh3 + p { font-size: 1.1em; }\n[data-locked="true"]::after { content: " 🔒"; }`,
    quiz: [
      q("What does .menu > li match?", ["All li inside .menu at any depth", "Only li that are direct children of .menu", "The first li", "li after .menu"], 1, `> is the child combinator — one level only.`),
      q("h2 + p selects…", ["Every p after any h2", "The single p immediately following each h2", "p inside h2", "h2 inside p"], 1, `+ is adjacent sibling — the very next element.`),
      q("a[href^=\"https\"] matches links whose href…", ["contains https", "ends with https", "starts with https", "equals https"], 2, `^= is the starts-with attribute operator.`),
    ],
  }),

  L("Specificity & the Cascade", ["selectors", "advanced-css"], "intermediate", 12, {
    intro: `<p>When two rules target the same element, CSS resolves the conflict in order: importance, then specificity, then source order. Specificity is a score — inline beats id beats class beats element. Most "why isn't my CSS applying?!" moments are specificity puzzles, so let's make the scoring explicit.</p>`,
    concepts: [
      `<strong>Specificity tiers</strong> — inline (1,0,0,0) &gt; id (0,1,0,0) &gt; class/attribute/pseudo-class (0,0,1,0) &gt; element (0,0,0,1)`,
      `<strong>Compare tier by tier</strong> — one id outranks ANY number of classes`,
      `<strong>Ties</strong> — the later rule in the stylesheet wins`,
      `<strong>!important</strong> — overrides everything; a last resort that breeds more !important`,
    ],
    examples: [
      ex("Scoring rules", `p { color: gray; }              /* 0,0,0,1 */\n.note { color: blue; }          /* 0,0,1,0 — beats p */\np.note { color: teal; }         /* 0,0,1,1 — beats .note */\n#intro { color: crimson; }      /* 0,1,0,0 — beats all above */`, undefined, `A &lt;p id="intro" class="note"&gt; renders crimson — the id tier dominates.`),
      ex("The debugging view", `/* DevTools shows losing rules struck through.\n   To override .sidebar .link (0,0,2,0):\n   ✗ a            (0,0,0,1) loses\n   ✓ .sidebar a.link or two classes (0,0,2,*) ties+later or beats */`),
    ],
    realWorld: `Every developer has fought a stylesheet where someone "fixed" things with #page #content .card !important. Design systems keep specificity FLAT (single classes) precisely so overrides stay predictable.`,
    practice: `Predict the color, then verify: an element matching all of <code>div p</code> (gray), <code>.text</code> (blue), <code>p.text</code> (green), <code>#main p</code> (purple). Rank the four scores first.`,
    mistakes: [
      `Reaching for !important instead of understanding the losing score — the arms race begins`,
      `Believing 11 classes beat 1 id — tiers don't carry over; they're compared independently`,
    ],
    best: [
      `Keep selectors low-specificity (single classes) so overriding stays easy`,
      `Reserve !important for utility classes designed to always win (.visually-hidden)`,
    ],
    template: `p { color: gray; }\n.text { color: blue; }\np.text { color: green; }\n#main p { color: purple; }\n/* <p id=? class="text"> inside #main renders: purple */`,
    quiz: [
      q("Which selector wins: #hero or .big.bold.title.banner?", ["The four classes", "#hero — one id outranks any number of classes", "Tie", "Last one written"], 1, `Tiers compare independently; classes never add up to an id.`),
      q("Two rules have identical specificity. Which applies?", ["The first", "The later one in source order", "Neither", "Alphabetical"], 1, `Source order is the final tiebreaker.`),
      q("Why is !important discouraged?", ["It's slow", "It escapes the cascade, forcing future overrides to escalate too", "Deprecated", "Browser support"], 1, `Each !important makes the next change harder — a debt spiral.`),
    ],
  }),

  L("Colors", ["colors"], "beginner", 10, {
    intro: `<p>CSS gives you several ways to write color: keywords, hex codes, <code>rgb()</code>, and the more design-friendly <code>hsl()</code> (hue, saturation, lightness). Add an alpha channel for transparency, and learn why contrast between text and background is a hard requirement, not a taste.</p>`,
    concepts: [
      `<strong>Hex</strong> — #rrggbb, shorthand #rgb, with alpha #rrggbbaa`,
      `<strong>rgb(255 0 128 / 0.5)</strong> — channels plus optional alpha`,
      `<strong>hsl(265 80% 60%)</strong> — pick hue, tune saturation/lightness intuitively`,
      `<strong>Contrast</strong> — WCAG asks 4.5:1 for body text`,
    ],
    examples: [
      ex("Same purple, four spellings", `.a { color: #7c5cff; }\n.b { color: rgb(124 92 255); }\n.c { color: hsl(256 100% 68%); }\n.d { color: rgb(124 92 255 / 0.35); }  /* translucent */`),
      ex("Why HSL wins for palettes", `.brand        { background: hsl(256 90% 60%); }\n.brand-hover  { background: hsl(256 90% 52%); }  /* same hue, darker */\n.brand-soft   { background: hsl(256 90% 95%); }  /* same hue, near-white */`, undefined, `One hue number, three coordinated shades — that's why design systems think in HSL.`),
    ],
    realWorld: `EduVerse's own theme is defined in OKLCH (HSL's modern successor) tokens in globals.css. Dark modes, hover states, and brand palettes are all "same hue, shifted lightness" — trivial in HSL, opaque in hex.`,
    practice: `Build a 4-shade palette from one hue in hsl(): background tint (95% lightness), border (80%), base (60%), and text-on-light (30%). Apply them to a small card.`,
    mistakes: [
      `Light gray text on white (#aaa on #fff ≈ 2.3:1) — fails contrast; people genuinely can't read it`,
      `opacity: 0.5 on a container when you meant a translucent BACKGROUND — opacity fades the children too`,
    ],
    best: [
      `Check text contrast with DevTools' built-in checker — 4.5:1 minimum for body text`,
      `Define colors once as custom properties (--accent) and reference them everywhere (full lesson later)`,
    ],
    template: `.card {\n    background: hsl(256 90% 96%);\n    border: 1px solid hsl(256 60% 82%);\n    color: hsl(256 50% 28%);\n}\n.card .accent { color: hsl(256 90% 55%); }`,
    quiz: [
      q("In hsl(200 80% 50%), what is 200?", ["Saturation", "The hue angle on the color wheel", "Lightness", "Alpha"], 1, `Hue is degrees: 0 red, 120 green, 240 blue.`),
      q("How do you make a color 50% transparent in modern syntax?", ["transparency: 50%", "rgb(0 0 0 / 0.5)", "alpha(0.5)", "#000-50"], 1, `The /alpha slash syntax works in rgb(), hsl(), and 8-digit hex.`),
      q("Why does contrast matter?", ["Aesthetics only", "Low-contrast text is unreadable for many users and fails WCAG", "Print quality", "It doesn't"], 1, `4.5:1 for body text is the accessibility floor.`),
    ],
  }),

  L("Units: px, em, rem & %", ["typography", "box-model"], "beginner", 10, {
    intro: `<p>CSS lengths come in absolute (px) and relative flavors (%, em, rem, vw/vh). The choice ripples through accessibility and responsiveness: rem respects the user's font-size setting, % adapts to containers, and viewport units track the screen itself.</p>`,
    concepts: [
      `<strong>px</strong> — fixed; predictable but ignores user preferences when used for text`,
      `<strong>rem</strong> — multiples of the ROOT font size (user-adjustable, default 16px)`,
      `<strong>em</strong> — multiples of the CURRENT element's font size (compounds!)`,
      `<strong>% / vw / vh</strong> — relative to parent / viewport width / viewport height`,
    ],
    examples: [
      ex("rem-based type scale", `html { font-size: 100%; }      /* respect user setting (usually 16px) */\nbody { font-size: 1rem; }\nh1 { font-size: 2rem; }        /* 32px by default, scales with user prefs */\nsmall { font-size: 0.875rem; } /* 14px */`),
      ex("em compounding trap", `.parent { font-size: 1.2em; }\n.child  { font-size: 1.2em; }  /* 1.2 × 1.2 = 1.44× root! */\n/* With rem, .child would stay a predictable 1.2 × root */`, undefined, `em multiplies up the tree; rem always references the root — that predictability is why rem dominates.`),
    ],
    realWorld: `Users with low vision raise their browser's base font size; px-sized text ignores them (an accessibility failure), rem text scales perfectly. Meanwhile fluid layouts mix %, vw, and max-widths — the responsive design toolkit.`,
    practice: `Build a card using only relative units: width 80% capped with max-width 30rem, 1rem padding, 1.25rem heading, and a hero section that's exactly 50vh tall.`,
    mistakes: [
      `Setting html { font-size: 10px } "for easy math" — overrides the user's chosen size; use 62.5% if you must`,
      `Deeply nested em sizes compounding into giant or microscopic text`,
    ],
    best: [
      `Text in rem, borders in px, spacing in rem (or a spacing scale), containers in % with max-width`,
      `Use em deliberately for things that should scale WITH local text (e.g. icon size, button padding)`,
    ],
    template: `.card {\n    width: 80%;\n    max-width: 30rem;\n    padding: 1rem;\n    border: 1px solid #ddd;\n}\n.card h2 { font-size: 1.25rem; }`,
    quiz: [
      q("1rem equals…", ["16px always", "The root element's font size", "The parent's font size", "1% of the viewport"], 1, `rem = root em; 16px is only the common default.`),
      q("Why prefer rem over px for text?", ["Shorter to type", "It scales with the user's browser font-size preference", "It renders sharper", "px is deprecated"], 1, `Respecting user settings is an accessibility requirement.`),
      q("Nested .a{font-size:2em} inside .b{font-size:2em} renders text at…", ["2× root", "4× root", "2× parent only", "Error"], 1, `em compounds: 2 × 2 = 4× the root size.`),
    ],
  }),

  L("Typography", ["typography"], "beginner", 12, {
    intro: `<p>Most of the web is text, so typography is most of web design. Five properties carry the craft: <code>font-family</code> with proper fallback stacks, <code>font-size</code>, <code>font-weight</code>, <code>line-height</code>, and <code>letter-spacing</code> — plus measure (line length) which lives on the container.</p>`,
    concepts: [
      `<strong>Font stacks</strong> — ordered fallbacks ending in a generic: <code>Georgia, serif</code>`,
      `<strong>line-height</strong> — unitless ~1.5–1.7 for body text`,
      `<strong>Measure</strong> — 45–75 characters per line; <code>max-width: 65ch</code>`,
      `<strong>Hierarchy</strong> — size + weight + spacing distinguish levels, not size alone`,
    ],
    examples: [
      ex("A readable text body", `article {\n    font-family: Georgia, "Times New Roman", serif;\n    font-size: 1.05rem;\n    line-height: 1.65;\n    max-width: 65ch;\n}\nh2 {\n    font-family: "Helvetica Neue", Arial, sans-serif;\n    font-weight: 700;\n    line-height: 1.2;\n    letter-spacing: -0.01em;\n}`, undefined, `Long-form text: serif, loose leading, capped measure. Headlines: tighter everything.`),
      ex("System font stack (fast, native)", `body {\n    font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;\n}`, undefined, `Zero download, instant render, native feel — what most apps actually ship.`),
    ],
    realWorld: `Reading speed and comprehension studies drive these numbers — news sites cap measure around 65ch and set 1.6 line-height because bounce rates say so. EduVerse's own lesson pages follow exactly these rules.`,
    practice: `Style a blog post: serif body at 1.05rem/1.65, sans-serif headings with tight line-height, 65ch measure, and visibly distinct h2 vs h3 using weight + size + spacing.`,
    mistakes: [
      `line-height with units (px) on text that later changes size — it stops scaling; keep it unitless`,
      `Full-width paragraphs on desktop — 200-character lines are exhausting to read`,
    ],
    best: [
      `End every font stack with a generic family (serif/sans-serif/monospace)`,
      `Set body line-height between 1.5 and 1.7; tighten to ~1.1–1.3 for large headlines`,
    ],
    template: `article {\n    font-family: Georgia, serif;\n    line-height: 1.65;\n    max-width: 65ch;\n}\nh2 {\n    font-family: Arial, sans-serif;\n    line-height: 1.2;\n    letter-spacing: -0.01em;\n}`,
    quiz: [
      q("A good body line-height is…", ["1.0", "Around 1.5–1.7, unitless", "3.0", "16px always"], 1, `Unitless values scale with the font; 1.5+ gives comfortable leading.`),
      q("What does max-width: 65ch do?", ["65 columns", "Caps lines near 65 characters — the readability sweet spot", "65% width", "Nothing"], 1, `The ch unit approximates character width — perfect for measure.`),
      q("Why end stacks with a generic like sans-serif?", ["Required syntax", "A guaranteed fallback when all named fonts are unavailable", "Faster", "SEO"], 1, `The generic ensures SOME appropriate font always renders.`),
    ],
  }),

  L("Web Fonts & Font Loading", ["typography"], "intermediate", 10, {
    intro: `<p>Custom fonts arrive via <code>@font-face</code> or services like Google Fonts — and they cost performance if handled carelessly. The craft is loading only the weights you use, controlling the swap behavior, and giving the browser a head start with preconnect.</p>`,
    concepts: [
      `<strong>@font-face</strong> — register a font file under a family name`,
      `<strong>font-display: swap</strong> — show fallback text immediately, swap when loaded`,
      `<strong>Subset your weights</strong> — each weight/style is a separate download`,
      `<strong>woff2</strong> — the modern, compressed format`,
    ],
    examples: [
      ex("Self-hosted font", `@font-face {\n    font-family: "Bricolage";\n    src: url("/fonts/bricolage.woff2") format("woff2");\n    font-weight: 400 700;   /* variable font range */\n    font-display: swap;\n}\nbody { font-family: "Bricolage", system-ui, sans-serif; }`, undefined, `font-display: swap prevents invisible text while the file downloads.`),
      ex("Google Fonts, properly", `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" rel="stylesheet">`, undefined, `Only two weights requested — not the whole family of nine.`),
    ],
    realWorld: `Fonts are render-blocking gold: news sites measure revenue impact of font-loading strategies. FOIT (invisible text) vs FOUT (fallback flash) is a deliberate tradeoff every brand decides. This very project self-hosts its fonts with next/font for the same reasons.`,
    practice: `Write an @font-face for a hypothetical "Studeo" font (woff2, swap), use it with a system fallback stack, and list which TWO weights you'd load for a typical site (and why not six).`,
    mistakes: [
      `Loading 6+ weights "just in case" — hundreds of wasted kilobytes before first paint`,
      `No font-display — some browsers hide text up to 3s waiting (FOIT)`,
    ],
    best: [
      `Pick a fallback metrically close to the webfont to minimize layout shift on swap`,
      `Self-host when you can (privacy + speed); always woff2 first`,
    ],
    template: `@font-face {\n    font-family: "Studeo";\n    src: url("/fonts/studeo.woff2") format("woff2");\n    font-display: swap;\n}\nbody { font-family: "Studeo", system-ui, sans-serif; }`,
    quiz: [
      q("font-display: swap does what?", ["Swaps fonts hourly", "Shows fallback text immediately, swapping in the webfont when ready", "Disables fallbacks", "Preloads"], 1, `Users read instantly; the brand font arrives without blocking.`),
      q("Why limit loaded font weights?", ["Licensing", "Every weight is a separate network download", "CSS limits", "No reason"], 1, `Unused weights are pure waste on the critical path.`),
      q("The preferred web font format is…", ["ttf", "otf", "woff2", "eot"], 2, `woff2's compression beats the older formats significantly.`),
    ],
  }),

  L("The Box Model", ["box-model"], "beginner", 12, {
    intro: `<p>Every element is a rectangle of four layers: content, padding, border, margin. The classic gotcha: by default, width applies to the CONTENT only — padding and border grow the box beyond it. <code>box-sizing: border-box</code> fixes that, which is why every modern stylesheet starts with it.</p>`,
    concepts: [
      `<strong>Content → padding → border → margin</strong> — inside to outside`,
      `<strong>content-box (default)</strong> — width excludes padding/border`,
      `<strong>border-box</strong> — width INCLUDES padding/border (sane)`,
      `<strong>The universal reset</strong> — <code>*, *::before, *::after { box-sizing: border-box; }</code>`,
    ],
    examples: [
      ex("Same width, different totals", `.default {\n    width: 200px;\n    padding: 20px;\n    border: 5px solid;\n    /* real width: 200+40+10 = 250px! */\n}\n.sane {\n    box-sizing: border-box;\n    width: 200px;\n    padding: 20px;\n    border: 5px solid;\n    /* real width: exactly 200px */\n}`),
      ex("The standard opening lines", `*, *::before, *::after {\n    box-sizing: border-box;\n}\nbody { margin: 0; }`, undefined, `These two rules open virtually every production stylesheet on the web.`),
    ],
    realWorld: `Three 33.33% columns with padding overflow their row under content-box — the classic "why does my layout wrap?!" bug that border-box eliminates. DevTools' box-model inspector exists because of this layer cake.`,
    practice: `Create two identical 200px-wide boxes with 24px padding and a 4px border — one content-box, one border-box. Measure both in DevTools and write the math as a comment.`,
    mistakes: [
      `Calculating layout widths forgetting padding/border under the default model`,
      `Using padding when you meant margin (and vice versa) — inside vs outside spacing`,
    ],
    best: [
      `Apply the border-box reset in every project, first thing`,
      `Padding for space inside the border (background extends through it); margin for space between boxes`,
    ],
    template: `*, *::before, *::after { box-sizing: border-box; }\n\n.box {\n    width: 200px;\n    padding: 24px;\n    border: 4px solid #7c5cff;\n    margin: 16px;\n}`,
    quiz: [
      q("Default model: width 100px + 10px padding each side + 2px border = visible width…", ["100px", "124px", "112px", "120px"], 1, `content-box adds padding (20) and border (4) on top of 100.`),
      q("Which is INSIDE the border?", ["Margin", "Padding", "Outline", "Gap"], 1, `Padding sits between content and border; margin is outside.`),
      q("box-sizing: border-box means…", ["No borders", "Declared width includes padding and border", "Margins collapse", "Content only"], 1, `What you declare is what you measure — the sane model.`),
    ],
  }),

  L("Margins, Padding & Collapsing", ["box-model"], "beginner", 10, {
    intro: `<p>Spacing is design. The shorthand syntax (<code>margin: 8px 16px</code>) compresses four sides into patterns, <code>margin-inline: auto</code> centers blocks, and vertical margins between elements <em>collapse</em> into each other — a behavior that surprises everyone exactly once.</p>`,
    concepts: [
      `<strong>Shorthand orders</strong> — 1 value: all; 2: vertical horizontal; 4: top right bottom left (clockwise)`,
      `<strong>auto centering</strong> — <code>margin: 0 auto</code> on a width-capped block`,
      `<strong>Margin collapsing</strong> — adjacent vertical margins merge to the LARGER one`,
      `<strong>Negative margins</strong> — pull elements closer/overlap (use sparingly)`,
    ],
    examples: [
      ex("Shorthand fluency", `.a { margin: 16px; }              /* all four */\n.b { margin: 8px 24px; }          /* 8 top/bottom, 24 sides */\n.c { margin: 0 0 24px; }          /* only bottom */\n.d { padding: 12px 20px 16px 20px; } /* clockwise from top */`),
      ex("Collapsing in action", `h2 { margin-bottom: 24px; }\np  { margin-top: 16px; }\n/* Gap between h2 and p: 24px, NOT 40px — the margins collapse */`, undefined, `Only vertical margins of block elements collapse; padding never does.`),
    ],
    realWorld: `Design systems define spacing scales (4, 8, 12, 16, 24, 32…) and teams apply them via these shorthands. The "one-direction margin" convention (only margin-bottom) exists specifically to make collapsing predictable.`,
    practice: `Build a centered article (max-width + auto margins) where headings carry only margin-bottom and paragraphs only margin-bottom — then explain in a comment what gap appears between an h2 (24px bottom) and p (16px top).`,
    mistakes: [
      `Expecting 24px + 16px = 40px between stacked elements — collapsing gives you 24px`,
      `margin: auto to center INLINE or un-widthed elements — it needs a block with a set width`,
    ],
    best: [
      `Adopt a spacing scale and stick to its steps — random values accumulate into visual noise`,
      `Space flowing content in ONE direction (margin-bottom only) to sidestep collapse confusion`,
    ],
    template: `article {\n    max-width: 36rem;\n    margin: 0 auto;\n    padding: 0 1rem;\n}\nh2 { margin: 0 0 1rem; }\np { margin: 0 0 1rem; }`,
    quiz: [
      q("margin: 10px 20px means…", ["10 left, 20 right", "10 top/bottom, 20 left/right", "All 10 then all 20", "Invalid"], 1, `Two values: vertical then horizontal.`),
      q("h2 (24px bottom) above p (16px top) — the visible gap is…", ["40px", "24px", "16px", "8px"], 1, `Vertical margins collapse to the larger of the two.`),
      q("What centers a block horizontally?", ["text-align: center", "A set max-width + margin-inline auto", "padding: auto", "position: center"], 1, `Auto side margins split leftover space — the element needs a width to leave space.`),
    ],
  }),

  L("Borders, Radius & Shadows", ["box-model", "colors"], "beginner", 10, {
    intro: `<p>Borders outline boxes, <code>border-radius</code> rounds them (up to full circles), and <code>box-shadow</code> lifts them off the page. These three properties — used with restraint — are most of what makes a "card" read as a card.</p>`,
    concepts: [
      `<strong>border</strong> — width style color shorthand; per-side control`,
      `<strong>border-radius</strong> — corners; 50% turns squares into circles`,
      `<strong>box-shadow</strong> — x y blur spread color; layerable with commas`,
      `<strong>outline</strong> — drawn OUTSIDE the box, no layout shift (focus rings!)`,
    ],
    examples: [
      ex("The modern card recipe", `.card {\n    border: 1px solid hsl(220 15% 88%);\n    border-radius: 12px;\n    box-shadow: 0 1px 3px rgb(0 0 0 / 0.08),\n                0 4px 12px rgb(0 0 0 / 0.06);\n    padding: 20px;\n}`, undefined, `Two stacked soft shadows read more naturally than one heavy one.`),
      ex("Avatar circle + focus ring", `.avatar {\n    width: 64px;\n    height: 64px;\n    border-radius: 50%;\n}\nbutton:focus-visible {\n    outline: 2px solid #7c5cff;\n    outline-offset: 2px;\n}`, undefined, `outline (not border!) for focus — it doesn't shift layout when it appears.`),
    ],
    realWorld: `Every interface card, avatar, button, and modal you've seen is this trio. Elevation systems (Material Design's dp levels) are formalized box-shadow scales mapping height to blur.`,
    practice: `Build a profile card: rounded corners, subtle two-layer shadow, a circular 64px avatar (use a placeholder div), and a left accent border 3px wide in your brand color.`,
    mistakes: [
      `outline: none on focused elements with no replacement — keyboard users lose their position`,
      `Heavy dark shadows (0 0 30px black) — amateur hour; real elevation is subtle and directional`,
    ],
    best: [
      `Shadow color from the background's hue at low alpha beats pure black`,
      `Keep a radius scale (4/8/12px) consistent across components — mixed radii look broken`,
    ],
    template: `.card {\n    border: 1px solid #e3e0ee;\n    border-left: 3px solid #7c5cff;\n    border-radius: 12px;\n    box-shadow: 0 1px 3px rgb(0 0 0 / 0.08), 0 4px 12px rgb(0 0 0 / 0.06);\n    padding: 20px;\n}\n.avatar { width: 64px; height: 64px; border-radius: 50%; background: #cbc3f5; }`,
    quiz: [
      q("border-radius: 50% on a square makes…", ["A rounded square", "A circle", "An oval always", "Nothing"], 1, `Half of each dimension rounds the square into a circle.`),
      q("In box-shadow: 0 4px 12px rgba(...), 12px is the…", ["Vertical offset", "Blur radius", "Spread", "Opacity"], 1, `Order: x-offset, y-offset, blur, (spread), color.`),
      q("Why use outline instead of border for focus styles?", ["Prettier", "Outline doesn't affect layout, so nothing shifts on focus", "Border is deprecated", "Outline animates"], 1, `Outlines paint outside the box model — zero layout impact.`),
    ],
  }),

  L("Backgrounds & Gradients", ["colors"], "intermediate", 10, {
    intro: `<p>The background family layers color, images, and gradients behind your content: position and size them (<code>cover</code> vs <code>contain</code>), stack multiple layers, and generate gradients — linear, radial, conic — that are resolution-independent and cost zero downloads.</p>`,
    concepts: [
      `<strong>background-size</strong> — cover fills (cropping), contain fits (letterboxing)`,
      `<strong>position / repeat</strong> — where the image sits; tiling control`,
      `<strong>linear-gradient(angle, stops)</strong> — also radial- and conic-`,
      `<strong>Multiple backgrounds</strong> — comma-separated, first on top`,
    ],
    examples: [
      ex("Hero with readable text", `.hero {\n    background:\n        linear-gradient(rgb(10 8 28 / 0.65), rgb(10 8 28 / 0.65)),\n        url("city.jpg") center / cover no-repeat;\n    color: white;\n    min-height: 50vh;\n}`, undefined, `The gradient layer is a dimming scrim — the standard trick for text over photos.`),
      ex("Pure-CSS texture", `.banner {\n    background: linear-gradient(135deg, #7c5cff, #4ecdc4);\n}\n.dots {\n    background-image: radial-gradient(circle, #ccc 1px, transparent 1px);\n    background-size: 16px 16px;\n}`, undefined, `Gradient + background-size tiling = patterns with no image files at all.`),
    ],
    realWorld: `Every hero section with white text over a photo uses the scrim pattern. Brand gradients (Stripe, Instagram) are linear-gradients. Skeleton loading shimmer? An animated gradient.`,
    practice: `Build a hero: background photo (any placeholder URL) under a dark scrim gradient, sized cover, centered, 40vh tall, with a white heading. Then a second card using a 135° two-color brand gradient.`,
    mistakes: [
      `White text on an un-scrimmed photo — unreadable wherever the image is bright`,
      `background-size: cover without a positioned focal point — faces crop at edges; set background-position`,
    ],
    best: [
      `Always pair text-over-image with a scrim or heavy text-shadow`,
      `Gradients between similar hues look richest; add a slight angle (135deg) for life`,
    ],
    template: `.hero {\n    background:\n        linear-gradient(rgb(10 8 28 / 0.6), rgb(10 8 28 / 0.6)),\n        url("https://placehold.co/1200x600") center / cover no-repeat;\n    color: white;\n    min-height: 40vh;\n    display: grid;\n    place-items: center;\n}`,
    quiz: [
      q("background-size: cover does what?", ["Fits entirely, may letterbox", "Fills the box, may crop", "Tiles", "Stretches distorting"], 1, `cover guarantees full coverage at the cost of cropping.`),
      q("How do you layer a gradient over an image?", ["Two elements only", "Comma-separated backgrounds, gradient listed first", "filter", "Impossible"], 1, `Multiple backgrounds stack; the first is on top — perfect for scrims.`),
      q("Why use a scrim under text on photos?", ["Style trend", "It guarantees contrast wherever the photo is bright", "Faster loading", "SEO"], 1, `The translucent dark layer makes text reliably readable.`),
    ],
  }),

  L("Display: block, inline & none", ["box-model", "positioning"], "beginner", 10, {
    intro: `<p>The <code>display</code> property sets how an element participates in layout: blocks stack and accept dimensions, inlines flow within text and ignore width/height, inline-block hybridizes, and <code>none</code> removes the element entirely — different from merely hiding it.</p>`,
    concepts: [
      `<strong>block</strong> — full-width stacking; width/height/margins all work`,
      `<strong>inline</strong> — flows in text; width/height ignored, vertical margins too`,
      `<strong>inline-block</strong> — flows inline BUT accepts dimensions`,
      `<strong>none vs visibility/opacity</strong> — removed vs invisible-but-present`,
    ],
    examples: [
      ex("Why won't my link size?!", `a.button {\n    /* width: 120px; height: 40px;  ← ignored: links are inline! */\n    display: inline-block;\n    width: 120px;\n    padding: 10px 0;\n    text-align: center;\n    background: #7c5cff;\n    color: white;\n    border-radius: 6px;\n}`, undefined, `The single most common beginner fix: make it inline-block (or flex-child) first.`),
      ex("Three ways to disappear", `.gone     { display: none; }       /* removed: no space, unfocusable */\n.invisible { visibility: hidden; }  /* keeps its space */\n.ghost    { opacity: 0; }           /* keeps space AND stays clickable! */`),
    ],
    realWorld: `Mobile menu toggles, tab panels, and modals all hinge on display switching. The opacity-0-but-clickable trap is a real accessibility/UX bug class — invisible buttons that still intercept taps.`,
    practice: `Make a nav of links styled as buttons (inline-block, padded, rounded). Then demonstrate the three hiding methods on three boxes and note in comments which keep space and which stay interactive.`,
    mistakes: [
      `Setting width/height on inline elements and concluding "CSS is broken"`,
      `Hiding interactive content with opacity: 0 — it remains focusable and clickable`,
    ],
    best: [
      `display: none for true removal; pair visual hiding with <code>aria-hidden</code>/<code>inert</code> when needed`,
      `Most "inline-block grids" of the past are flexbox jobs today — coming two lessons from now`,
    ],
    template: `nav a {\n    display: inline-block;\n    padding: 10px 16px;\n    background: #7c5cff;\n    color: white;\n    border-radius: 6px;\n    text-decoration: none;\n}`,
    quiz: [
      q("Why is width ignored on a plain <a>?", ["Links are special", "Anchors are inline — inline boxes don't take dimensions", "Browser bug", "Needs !important"], 1, `Inline elements size to their content; switch display to control them.`),
      q("Which hiding method keeps layout space?", ["display: none", "visibility: hidden", "Removing the element", "All of them"], 1, `visibility hides the pixels but the box still occupies flow.`),
      q("opacity: 0 on a button — what's the trap?", ["It's gone", "Still clickable and focusable while invisible", "It animates", "Becomes inline"], 1, `Invisible interactive elements ambush users; manage interactivity too.`),
    ],
  }),

  L("Positioning", ["positioning"], "intermediate", 12, {
    intro: `<p><code>position</code> lifts elements out of normal flow: relative nudges (and anchors), absolute pins to the nearest positioned ancestor, fixed pins to the viewport, and sticky toggles between flowing and pinned. The non-obvious key: <em>absolute positions relative to the nearest ancestor that has a position set</em>.</p>`,
    concepts: [
      `<strong>relative</strong> — stays in flow; becomes an anchor for absolute children`,
      `<strong>absolute</strong> — out of flow; offsets from nearest positioned ancestor`,
      `<strong>fixed</strong> — pinned to the viewport (toolbars, FABs)`,
      `<strong>sticky</strong> — scrolls until its threshold, then pins (needs top + a scrollable parent)`,
    ],
    examples: [
      ex("The badge pattern", `.card {\n    position: relative;   /* the anchor */\n}\n.badge {\n    position: absolute;\n    top: -8px;\n    right: -8px;\n    background: crimson;\n    color: white;\n    border-radius: 999px;\n    padding: 2px 8px;\n}`, undefined, `Without position: relative on the card, the badge would pin to the page instead.`),
      ex("Sticky section headers", `.section-title {\n    position: sticky;\n    top: 0;\n    background: white;\n}`, undefined, `Each title rides along until the next one pushes it away — contact-list style.`),
    ],
    realWorld: `Notification badges, dropdown menus, image-corner ribbons (absolute); cookie banners and chat bubbles (fixed); table headers and sidebars (sticky). Every overlay UI is positioning arithmetic.`,
    practice: `Build a product card with: an absolute "SALE" ribbon in the top-left (card is the relative anchor), and make the page's h2 sticky at top: 0 with a solid background. Scroll to verify.`,
    mistakes: [
      `Absolute children with NO positioned ancestor — they fly to the document corner`,
      `sticky not sticking: missing top value, or an overflow:hidden ancestor killing it`,
    ],
    best: [
      `The moment you write position: absolute, decide and SET its anchor's position: relative`,
      `Prefer sticky over fixed for in-content pinning — it respects its container's bounds`,
    ],
    template: `.card {\n    position: relative;\n    border: 1px solid #ddd;\n    border-radius: 8px;\n    padding: 24px;\n}\n.ribbon {\n    position: absolute;\n    top: 8px;\n    left: -6px;\n    background: crimson;\n    color: white;\n    padding: 2px 10px;\n}`,
    quiz: [
      q("position: absolute offsets from…", ["The page always", "The nearest ancestor with a position set (else the page)", "Its parent always", "The viewport"], 1, `That ancestor rule is the whole trick — anchor with relative.`),
      q("Which position keeps an element pinned during scroll, viewport-wide?", ["relative", "absolute", "fixed", "static"], 2, `fixed attaches to the viewport — toolbars and chat buttons.`),
      q("A sticky element isn't sticking. Most likely cause?", ["Wrong color", "No top/bottom offset set (or an overflow ancestor)", "Too wide", "Needs z-index 9999"], 1, `sticky requires a threshold like top: 0 — and a scrollable, non-clipped ancestor.`),
    ],
  }),
];

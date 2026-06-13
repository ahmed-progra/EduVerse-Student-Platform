import { L, q, ex, LessonDef } from "./types";

/** HTML curriculum — Part B: semantics, media, accessibility, HTML5 APIs (lessons 14–26). */
export const htmlB: LessonDef[] = [
  L("Form Validation Attributes", ["forms"], "intermediate", 10, {
    intro: `<p>Browsers can reject bad input before it ever reaches your server — if you declare the rules. <code>required</code>, <code>minlength</code>, <code>pattern</code>, <code>min</code>/<code>max</code> turn the browser into your first validation layer, complete with built-in error messages.</p>`,
    concepts: [
      `<strong>required</strong> — the field must be filled to submit`,
      `<strong>minlength / maxlength</strong> — text length bounds`,
      `<strong>min / max / step</strong> — numeric and date ranges`,
      `<strong>pattern</strong> — a regex the value must match`,
      `<strong>Type validation</strong> — email/url types validate their format automatically`,
    ],
    examples: [
      ex("Declarative rules", `<form>\n    <input type="text" name="username" required minlength="3" maxlength="20"\n           pattern="[a-z0-9_]+" title="lowercase letters, digits, underscore">\n    <input type="email" name="email" required>\n    <input type="number" name="qty" min="1" max="99" required>\n    <button type="submit">Order</button>\n</form>`, undefined, `Try submitting empty or with "AB" — the browser blocks and explains, zero JavaScript.`),
    ],
    realWorld: `Client-side validation cuts failed submissions and server load — but it's UX, not security: every real backend re-validates. (EduVerse's own register form does both: browser checks, then the API's validators.)`,
    practice: `Build a coupon form: code input requiring exactly 6 uppercase letters/digits (pattern="[A-Z0-9]{6}"), an email (required), and a quantity 1–5. Test all the failure messages.`,
    mistakes: [
      `Trusting client validation alone — anyone can bypass it with devtools; servers must re-check`,
      `pattern without a title attribute — users see a generic error with no clue what's expected`,
    ],
    best: [
      `Pair every pattern with a human-readable title explaining the rule`,
      `Use the right input type first — type="email" beats any hand-rolled email regex`,
    ],
    template: `<form>\n    <label for="code">Coupon (6 chars A-Z, 0-9)</label>\n    <input id="code" name="code" required pattern="[A-Z0-9]{6}"\n           title="Exactly 6 uppercase letters or digits">\n    <label for="qty">Quantity</label>\n    <input id="qty" type="number" name="qty" min="1" max="5" value="1" required>\n    <button type="submit">Apply</button>\n</form>`,
    quiz: [
      q("What does the required attribute do?", ["Styles the field red", "Blocks submission while the field is empty", "Encrypts the value", "Marks it for the server"], 1, `The browser refuses to submit and focuses the empty field with a message.`),
      q("Why must servers still validate after client-side checks?", ["They don't", "Client checks can be bypassed entirely (devtools, curl)", "For speed", "Browsers are buggy"], 1, `The browser is the user's agent, not yours — never trust input.`),
      q("Which attribute enforces a custom format like ABC123?", ["format", "match", "pattern", "regex"], 2, `pattern takes a regular expression the value must satisfy.`),
    ],
  }),

  L("Buttons & Interactive Elements", ["forms", "semantic-elements"], "beginner", 8, {
    intro: `<p>Buttons trigger actions; links navigate. That one-sentence rule untangles most interactive-element confusion. The &lt;button&gt; element has three types — and the default inside forms surprises almost everyone by submitting.</p>`,
    concepts: [
      `<strong>type="submit"</strong> — sends the enclosing form (the DEFAULT!)`,
      `<strong>type="button"</strong> — does nothing on its own; for JavaScript`,
      `<strong>type="reset"</strong> — clears the form (rarely wise)`,
      `<strong>Button vs link</strong> — actions vs navigation; never fake one with the other`,
    ],
    examples: [
      ex("The three types", `<form>\n    <input name="q" placeholder="Search...">\n    <button type="submit">Search</button>\n    <button type="button" onclick="alert('saved draft')">Save draft</button>\n    <button type="reset">Clear</button>\n</form>`, undefined, `Without type, the "Save draft" button would SUBMIT the form — the classic surprise.`),
      ex("Disabled state", `<button type="submit" disabled>Processing...</button>`, undefined, `Disable during async work to prevent double submissions.`),
    ],
    realWorld: `Double-charged checkouts trace to non-disabled submit buttons. Keyboard and screen-reader users depend on real buttons: a styled &lt;div onclick&gt; is unfocusable, unannounced, and a hallmark of inaccessible apps.`,
    practice: `Build a comment box: textarea, a submit button, and a "Preview" button (type="button") that must NOT submit. Then add disabled to the submit and observe.`,
    mistakes: [
      `Omitting type inside forms — every button defaults to submit and fires the form`,
      `&lt;div class="btn" onclick&gt; — no keyboard focus, no Enter/Space activation, invisible to assistive tech`,
    ],
    best: [
      `Always write the type explicitly, even when it's submit — intent documented`,
      `Actions get buttons, destinations get links — style them however you like with CSS`,
    ],
    template: `<form>\n    <label for="c">Comment</label>\n    <textarea id="c" name="comment" rows="3"></textarea>\n    <button type="submit">Post</button>\n    <button type="button">Preview</button>\n</form>`,
    quiz: [
      q("A <button> with no type inside a form…", ["Does nothing", "Submits the form", "Resets the form", "Is invalid"], 1, `submit is the default type — a frequent source of mystery page reloads.`),
      q("\"Go to settings page\" should be a…", ["button", "link styled as needed", "div with onclick", "input"], 1, `Navigation is link territory; actions are button territory.`),
      q("Why are clickable divs an accessibility failure?", ["Too slow", "No keyboard focus, no role, no Enter/Space handling", "They're fine", "CSS conflicts"], 1, `Real buttons give you focus, semantics, and key activation for free.`),
    ],
  }),

  L("Div, Span & Grouping", ["document-structure"], "beginner", 8, {
    intro: `<p>&lt;div&gt; (block) and &lt;span&gt; (inline) are the generic containers: they mean nothing by themselves and exist to group content for styling or scripting. The skill is knowing when they're right — and when a semantic element should take their place.</p>`,
    concepts: [
      `<strong>div</strong> — generic block-level grouping (layout wrappers, cards)`,
      `<strong>span</strong> — generic inline grouping (a few words inside a sentence)`,
      `<strong>class / id</strong> — the hooks CSS and JavaScript grab onto`,
      `<strong>Semantics first</strong> — reach for nav/article/button BEFORE div`,
    ],
    examples: [
      ex("Legitimate generic grouping", `<div class="card">\n    <h3>Python Course</h3>\n    <p>36 lessons · <span class="highlight">Beginner friendly</span></p>\n</div>`, undefined, `The card is purely presentational grouping — div is correct. The highlighted words are styling — span is correct.`),
      ex("Divitis vs semantics", `<!-- ✗ divitis -->\n<div class="nav"><div class="item">Home</div></div>\n\n<!-- ✓ semantic -->\n<nav><a href="/">Home</a></nav>`),
    ],
    realWorld: `Component frameworks (React, Vue) render oceans of divs for layout — fine. The bugs start when divs replace interactive or structural elements: unclickable "buttons", unnavigable "menus". Auditors call it divitis.`,
    practice: `Build a profile card: a div wrapper with class "profile", an h3 name, a paragraph bio where two words are wrapped in a span with class "accent". Then list which parts could use more semantic elements.`,
    mistakes: [
      `div with onclick instead of button; div class="header" instead of header — semantics lost`,
      `Putting block elements (div) inside inline ones (span) — invalid nesting`,
    ],
    best: [
      `Ask "is there an element that MEANS this?" — only when the answer is no, use div/span`,
      `Name classes by purpose (class="price-tag") not appearance (class="red-text")`,
    ],
    template: `<div class="profile">\n    <h3>Ada Lovelace</h3>\n    <p>Wrote the <span class="accent">first algorithm</span> in 1843.</p>\n</div>`,
    quiz: [
      q("div vs span — the difference?", ["None", "div is block-level, span is inline", "span is newer", "div is deprecated"], 1, `div stacks as a block; span flows within text.`),
      q("Which is a correct use of span?", ["Wrapping a page section", "Highlighting two words inside a paragraph", "As a clickable button", "As a navigation bar"], 1, `Inline fragments of text are exactly span's job.`),
      q("\"Divitis\" refers to…", ["A CSS bug", "Overusing generic divs where semantic elements belong", "Too many ids", "Inline styles"], 1, `It's the anti-pattern of meaning-free markup.`),
    ],
  }),

  L("Semantic Layout: header, nav, main & footer", ["semantic-elements"], "intermediate", 10, {
    intro: `<p>HTML5 gave pages a vocabulary for their own anatomy: &lt;header&gt;, &lt;nav&gt;, &lt;main&gt;, and &lt;footer&gt;. These landmark elements let screen readers jump straight to content, help search engines weigh sections, and make your code self-documenting.</p>`,
    concepts: [
      `<strong>header</strong> — introductory content: logo, title, top nav`,
      `<strong>nav</strong> — major navigation blocks (not every list of links)`,
      `<strong>main</strong> — THE content; exactly one per page`,
      `<strong>footer</strong> — copyright, contact, secondary links`,
    ],
    examples: [
      ex("A page skeleton", `<body>\n    <header>\n        <h1>EduVerse</h1>\n        <nav>\n            <a href="/courses">Courses</a>\n            <a href="/battle">Battle</a>\n        </nav>\n    </header>\n    <main>\n        <h2>Today's lesson</h2>\n        <p>Semantic layout...</p>\n    </main>\n    <footer>\n        <p>© 2026 EduVerse — built by students</p>\n    </footer>\n</body>`, undefined, `Screen-reader users get a landmark menu: jump to navigation, jump to main — no tabbing through 40 links.`),
    ],
    realWorld: `"Skip to main content" — the first link on government and news sites — targets &lt;main&gt;. Reader modes in browsers extract it. Replace these with divs and every one of those features dies.`,
    practice: `Restructure this div soup into landmarks: &lt;div class="top"&gt;, &lt;div class="menu"&gt;, &lt;div class="content"&gt;, &lt;div class="bottom"&gt; → header/nav/main/footer with appropriate children.`,
    mistakes: [
      `Multiple &lt;main&gt; elements — exactly one visible main per page`,
      `Wrapping EVERY link list in nav — reserve it for major navigation blocks`,
    ],
    best: [
      `Landmarks first, divs inside them for layout — structure outside, styling hooks inside`,
      `headers and footers can also nest inside articles — they're sectional, not just page-level`,
    ],
    template: `<header>\n    <h1>My Site</h1>\n    <nav>\n        <a href="/">Home</a>\n        <a href="/about">About</a>\n    </nav>\n</header>\n<main>\n    <h2>Welcome</h2>\n    <p>Main content lives here.</p>\n</main>\n<footer>© 2026</footer>`,
    quiz: [
      q("How many <main> elements may a page show?", ["Unlimited", "One", "Two", "Zero required"], 1, `main marks THE primary content — singular by definition.`),
      q("What do landmark elements give screen-reader users?", ["Colors", "A jump menu of page regions", "Faster loading", "Nothing"], 1, `Users navigate by landmarks instead of crawling the whole DOM.`),
      q("Which belongs in <footer>?", ["The page's h1", "Primary navigation", "Copyright and secondary links", "The main article"], 2, `Footers carry closing metadata — copyright, contact, legal.`),
    ],
  }),

  L("Article, Section & Aside", ["semantic-elements"], "intermediate", 10, {
    intro: `<p>Three more semantic containers refine your structure: &lt;article&gt; for self-contained pieces (a post, a card, a comment), &lt;section&gt; for thematic groupings with headings, and &lt;aside&gt; for tangential content like sidebars. The test for article: would it make sense in an RSS feed alone?</p>`,
    concepts: [
      `<strong>article</strong> — independently distributable content`,
      `<strong>section</strong> — a themed chunk, almost always with a heading`,
      `<strong>aside</strong> — related-but-separate: sidebars, pull quotes, ads`,
      `<strong>Nesting logic</strong> — articles can contain sections; sections can contain articles`,
    ],
    examples: [
      ex("A blog page's anatomy", `<main>\n    <article>\n        <h2>Why Learn C++ in 2026</h2>\n        <section>\n            <h3>Performance still matters</h3>\n            <p>...</p>\n        </section>\n        <section>\n            <h3>Where C++ dominates</h3>\n            <p>...</p>\n        </section>\n    </article>\n    <aside>\n        <h3>Related posts</h3>\n        <a href="/python-vs-cpp">Python vs C++</a>\n    </aside>\n</main>`, undefined, `The article stands alone; its sections organize it; the aside is takeaway-able without loss.`),
    ],
    realWorld: `News sites mark every story as an article — syndication, reader views, and search snippets depend on it. Product cards in listings are articles too: self-contained, repeatable units.`,
    practice: `Mark up a recipe page: the recipe as an article containing two sections (Ingredients, Steps), plus an aside with "More desserts" links. Every section gets a heading.`,
    mistakes: [
      `section as a styling wrapper with no heading — that's a div's job`,
      `aside for content the page can't live without — it's for the tangential`,
    ],
    best: [
      `Apply the standalone test for article: meaningful in isolation? Use it`,
      `If you can't give a section a natural heading, it probably isn't a section`,
    ],
    template: `<article>\n    <h2>5-Minute Brownies</h2>\n    <section>\n        <h3>Ingredients</h3>\n        <ul><li>Cocoa</li><li>Flour</li><li>Sugar</li></ul>\n    </section>\n    <section>\n        <h3>Steps</h3>\n        <ol><li>Mix</li><li>Microwave</li></ol>\n    </section>\n</article>\n<aside>\n    <h3>More desserts</h3>\n    <a href="#">Mug cake</a>\n</aside>`,
    quiz: [
      q("The test for using <article> is…", ["It contains text", "The content makes sense standing alone (feed/card/post)", "It's long", "It has images"], 1, `Self-contained distribution is article's definition.`),
      q("A <section> should almost always contain…", ["A form", "A heading", "An image", "Links"], 1, `Sections are thematic groupings — the heading names the theme.`),
      q("A sidebar of related links belongs in…", ["<main>", "<aside>", "<footer>", "<nav> only"], 1, `Tangentially related content is aside's role (it can wrap a nav inside).`),
    ],
  }),

  L("Audio & Video", ["media"], "intermediate", 10, {
    intro: `<p>HTML plays media natively — no plugins since the Flash era ended. &lt;video&gt; and &lt;audio&gt; take sources, controls, and crucially &lt;track&gt; for captions. The attribute set (autoplay, muted, loop, poster, preload) covers most player needs before JavaScript enters.</p>`,
    concepts: [
      `<strong>controls</strong> — the browser's built-in play/pause UI`,
      `<strong>source elements</strong> — multiple formats; the browser picks the first it supports`,
      `<strong>poster / preload</strong> — preview image; how much to fetch upfront`,
      `<strong>track kind="captions"</strong> — subtitles from .vtt files`,
      `<strong>Autoplay policy</strong> — only muted videos may autoplay`,
    ],
    examples: [
      ex("A proper video element", `<video controls width="640" poster="preview.jpg" preload="metadata">\n    <source src="lesson.webm" type="video/webm">\n    <source src="lesson.mp4" type="video/mp4">\n    <track kind="captions" src="captions.vtt" srclang="en" label="English" default>\n    Your browser doesn't support video.\n</video>`, undefined, `Fallback chain: webm → mp4 → the text message. Captions ship as a sidecar .vtt file.`),
      ex("Background audio controls", `<audio controls src="podcast.mp3" preload="none"></audio>`),
    ],
    realWorld: `Course platforms (like this one could be), product demos, and podcasts all ride on these elements. Caption tracks aren't optional in education — they're how deaf users, noisy-environment users, and non-native speakers follow along.`,
    practice: `Embed a video with controls, a poster, two source formats, and a captions track. Then explain (in a comment) why autoplay without muted won't work.`,
    mistakes: [
      `Autoplaying with sound — browsers block it, and users despise it`,
      `One source format only — Safari and older browsers may show nothing`,
    ],
    best: [
      `Always offer captions for speech content — accessibility AND comprehension`,
      `Use preload="none" or "metadata" for long media — don't burn bandwidth speculatively`,
    ],
    template: `<video controls width="480" poster="https://placehold.co/480x270">\n    <source src="demo.mp4" type="video/mp4">\n    Sorry, your browser can't play this video.\n</video>\n<audio controls preload="none" src="theme.mp3"></audio>`,
    quiz: [
      q("Why list multiple <source> elements?", ["Faster playback", "Browsers pick the first format they support", "Required syntax", "For SEO"], 1, `It's a graceful degradation chain across codec support.`),
      q("Which combination can autoplay in modern browsers?", ["autoplay", "autoplay + muted", "autoplay + loop", "None ever"], 1, `Sound-on autoplay is blocked; muted autoplay (think hero videos) is allowed.`),
      q("What does <track kind=\"captions\"> add?", ["A chapter list", "Timed text captions from a .vtt file", "A second audio", "Speed control"], 1, `track binds caption files to the media timeline.`),
    ],
  }),

  L("Iframes & Embeds", ["media"], "intermediate", 10, {
    intro: `<p>An &lt;iframe&gt; embeds one page inside another — maps, videos, payment widgets. It's also a security boundary you must configure: the <code>sandbox</code> and <code>allow</code> attributes decide what the guest page may do inside your page.</p>`,
    concepts: [
      `<strong>src + title</strong> — the embedded URL and its accessible name (required!)`,
      `<strong>sandbox</strong> — opt-in permissions for the framed content`,
      `<strong>allow</strong> — feature policy: camera, fullscreen, autoplay…`,
      `<strong>loading="lazy"</strong> — defer offscreen embeds`,
    ],
    examples: [
      ex("A safe third-party embed", `<iframe\n    src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"\n    title="Course intro video"\n    width="560" height="315"\n    loading="lazy"\n    allow="fullscreen"\n    sandbox="allow-scripts allow-same-origin allow-presentation">\n</iframe>`, undefined, `title names it for screen readers; sandbox grants only what the embed needs.`),
    ],
    realWorld: `Stripe renders card fields in an iframe so card numbers never touch your page's code — that isolation is WHY it passes payment compliance. Maps, calendars, and chat widgets all arrive as iframes.`,
    practice: `Embed any map or video with: a descriptive title, fixed dimensions, lazy loading, and a sandbox allowing only scripts. Note what breaks as you remove sandbox permissions.`,
    mistakes: [
      `No title attribute — screen readers announce "frame" with zero context`,
      `Embedding untrusted content WITHOUT sandbox — the guest can navigate your page, open popups, run plugins`,
    ],
    best: [
      `Start sandbox empty and add permissions one by one until the embed works — least privilege`,
      `Lazy-load below-the-fold iframes; they're often the heaviest resources on the page`,
    ],
    template: `<iframe\n    src="https://www.openstreetmap.org/export/embed.html?bbox=31.2,30.0,31.3,30.1"\n    title="Map of Cairo"\n    width="500" height="300"\n    loading="lazy">\n</iframe>`,
    quiz: [
      q("Why does every iframe need a title?", ["Styling", "It's the accessible name screen readers announce", "SEO only", "It doesn't"], 1, `Without it, users hear just 'frame' — unnavigable.`),
      q("What does the sandbox attribute do?", ["Speeds loading", "Restricts the embedded page's capabilities to those you grant", "Adds borders", "Caches the frame"], 1, `It's a permission allowlist for the guest content.`),
      q("Payment providers use iframes because…", ["They're pretty", "Isolation keeps card data out of the host page's reach", "They're faster", "No reason"], 1, `The frame boundary is a security boundary — host scripts can't read inside.`),
    ],
  }),

  L("Accessibility Fundamentals", ["accessibility"], "intermediate", 12, {
    intro: `<p>Accessibility (a11y) means people using screen readers, keyboards, magnifiers, or voice control can actually use your page. Most of it isn't extra work — it's using HTML correctly: real buttons, labeled inputs, alt text, logical headings. This lesson consolidates the practices into a checklist.</p>`,
    concepts: [
      `<strong>Semantic HTML IS accessibility</strong> — roles and names come free with the right elements`,
      `<strong>Keyboard operability</strong> — everything clickable must be Tab-reachable and Enter-activatable`,
      `<strong>Text alternatives</strong> — alt, labels, captions for every non-text thing`,
      `<strong>Contrast & focus</strong> — visible focus outlines; readable color contrast (4.5:1)`,
    ],
    examples: [
      ex("Same UI, two worlds", `<!-- ✗ invisible to assistive tech -->\n<div class="btn" onclick="save()">Save</div>\n\n<!-- ✓ accessible by construction -->\n<button type="button" onclick="save()">Save</button>`, undefined, `The button is focusable, announced as "Save, button", and works with Enter, Space, and voice commands — all for free.`),
      ex("The five-minute audit", `1. Unplug your mouse — can you Tab to everything?\n2. Are focus outlines visible as you Tab?\n3. Does every image have appropriate alt?\n4. Does every input have a label?\n5. Read the headings alone — is the outline logical?`),
    ],
    realWorld: `Roughly 1 in 6 people has a disability affecting computer use; legal exposure (ADA, EAA 2025 in Europe) is real and growing. Accessible sites also rank better and convert better — the overlap with good UX is nearly total.`,
    practice: `Run the five-step audit above on the lesson template below, find the three planted violations (missing alt, missing label, div-button), and fix them.`,
    mistakes: [
      `Removing focus outlines with CSS (outline: none) and replacing them with nothing`,
      `Conveying state by color alone — "errors are red" fails colorblind users; add icons/text`,
    ],
    best: [
      `Test with a real screen reader (NVDA is free, VoiceOver is built into Mac) at least once`,
      `Fix accessibility AT the markup level first — ARIA patches come later and only when needed`,
    ],
    template: `<!-- Fix the three violations: -->\n<img src="chart.png">\n<input type="email" placeholder="Email">\n<div class="btn" onclick="subscribe()">Subscribe</div>\n\n<!-- Fixed versions:\n<img src="chart.png" alt="Signups doubling each month">\n<label for="em">Email</label><input id="em" type="email" name="email">\n<button type="button" onclick="subscribe()">Subscribe</button>\n-->`,
    quiz: [
      q("The single biggest accessibility lever is…", ["ARIA everywhere", "Using semantically correct HTML elements", "More JavaScript", "Bigger fonts"], 1, `Correct elements carry roles, names, and keyboard behavior natively.`),
      q("Keyboard-only users require…", ["A special site", "Everything interactive reachable via Tab and usable via Enter/Space", "Nothing special", "Mouse emulation"], 1, `If Tab can't reach it or Enter can't fire it, it's broken for them.`),
      q("Why is color-only error indication insufficient?", ["Looks bad", "Colorblind users can't perceive the distinction — pair with text/icons", "It's fine", "Too subtle on mobile"], 1, `State must be conveyed by more than hue.`),
    ],
  }),

  L("ARIA Essentials", ["accessibility"], "advanced", 12, {
    intro: `<p>ARIA attributes (<code>role</code>, <code>aria-*</code>) describe custom widgets to assistive technology when native HTML can't express them — tabs, modals, live-updating regions. The First Rule of ARIA: don't use it if a native element does the job. The second: incorrect ARIA is worse than none.</p>`,
    concepts: [
      `<strong>aria-label / aria-labelledby</strong> — accessible names for unnamed things`,
      `<strong>aria-expanded / aria-current</strong> — state on toggles and navigation`,
      `<strong>aria-live</strong> — regions whose updates get announced`,
      `<strong>role</strong> — what a custom widget IS (tablist, dialog, alert)`,
    ],
    examples: [
      ex("Naming icon-only buttons", `<button aria-label="Close dialog">✕</button>\n<button aria-label="Search">🔍</button>`, undefined, `Without aria-label these announce as "button" or worse, the emoji name.`),
      ex("State and live updates", `<button aria-expanded="false" aria-controls="menu">Menu</button>\n<ul id="menu" hidden>...</ul>\n\n<div aria-live="polite" id="status"></div>\n<!-- JS later sets: status.textContent = "3 results found" -->`, undefined, `aria-expanded tells users the menu state; aria-live announces the result count when it changes.`),
    ],
    realWorld: `EduVerse's own UI uses these: the AI panels set aria-pressed on nav buttons and role="status" on loading spinners. Every design system (Material, Radix) ships components with the ARIA wiring done — knowing it lets you verify theirs.`,
    practice: `Mark up an icon-only toolbar: three emoji buttons with aria-labels, where one is a toggle carrying aria-pressed="false". Add an empty aria-live="polite" status region that would announce actions.`,
    mistakes: [
      `role="button" on a div instead of using button — you now owe keyboard handlers, focus, AND the role`,
      `aria-hidden="true" on focusable content — focus lands on invisible-to-AT elements (a WCAG failure)`,
    ],
    best: [
      `Prefer native elements; reach for ARIA only for genuinely custom widgets`,
      `Test every aria-live region — over-chatty announcements are as harmful as silence`,
    ],
    template: `<div role="toolbar" aria-label="Formatting">\n    <button aria-label="Bold" aria-pressed="false"><b>B</b></button>\n    <button aria-label="Italic" aria-pressed="false"><i>I</i></button>\n    <button aria-label="Clear formatting">✕</button>\n</div>\n<div aria-live="polite" class="sr-status"></div>`,
    quiz: [
      q("The First Rule of ARIA is…", ["Use it everywhere", "Prefer native HTML elements over ARIA retrofits", "Roles before labels", "ARIA is required"], 1, `Native elements already carry correct semantics and behavior.`),
      q("aria-live=\"polite\" makes a region…", ["Invisible", "Announce its content changes to screen readers", "Focusable", "Read-only"], 1, `Dynamic updates (search counts, toasts) get spoken without stealing focus.`),
      q("An icon-only button needs…", ["title only", "aria-label with its action name", "Nothing", "tabindex"], 1, `The label provides the accessible name the icon can't.`),
    ],
  }),

  L("SEO Essentials", ["seo"], "advanced", 12, {
    intro: `<p>Search engines read your HTML the way screen readers do: structure, headings, links, and metadata. Technical SEO is mostly shipping honest, well-structured markup — titles that describe, headings that outline, alt text that explains, and structured data that machines can parse.</p>`,
    concepts: [
      `<strong>Title & description</strong> — your search-result ad copy`,
      `<strong>One topic, one h1, clean outline</strong> — relevance signals`,
      `<strong>Canonical & robots</strong> — duplicate control and crawl directives`,
      `<strong>Open Graph tags</strong> — how links unfurl on social platforms`,
      `<strong>Structured data (JSON-LD)</strong> — rich results: ratings, recipes, FAQs`,
    ],
    examples: [
      ex("An SEO-complete head", `<head>\n    <title>Learn Python Free — 36 Interactive Lessons | EduVerse</title>\n    <meta name="description" content="Master Python with interactive lessons, an AI mentor, and real coding practice. Built by students, free forever.">\n    <link rel="canonical" href="https://eduverse.app/courses/python">\n    <meta property="og:title" content="Learn Python Free — EduVerse">\n    <meta property="og:image" content="https://eduverse.app/og/python.png">\n</head>`),
      ex("Structured data", `<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "Course",\n  "name": "Python Fundamentals",\n  "provider": { "@type": "Organization", "name": "EduVerse" }\n}\n</script>`, undefined, `This JSON-LD is what makes course cards, star ratings, and FAQ dropdowns appear in Google results.`),
    ],
    realWorld: `The difference between result #1 and #8 is a business. Course platforms specifically benefit from Course structured data — Google renders them as rich cards with provider and rating, doubling click-through.`,
    practice: `Write the complete head for an EduVerse C++ course page: unique title under 60 chars, compelling description under 155, canonical URL, and og:title/og:image. Bonus: a Course JSON-LD block.`,
    mistakes: [
      `Keyword stuffing — modern engines penalize it; write for humans`,
      `Same title/description on every page — each page competes against its siblings`,
    ],
    best: [
      `Front-load titles with the specific topic; brand goes last`,
      `Match structured data to VISIBLE content — invisible-only data risks penalties`,
    ],
    template: `<head>\n    <title>Learn C++ Free — 34 Interactive Lessons | EduVerse</title>\n    <meta name="description" content="From pointers to STL: master C++ with interactive lessons and AI-powered code review.">\n    <link rel="canonical" href="https://eduverse.app/courses/cpp">\n    <meta property="og:title" content="Learn C++ Free — EduVerse">\n</head>`,
    quiz: [
      q("Where does your search-result snippet text come from?", ["The first paragraph always", "meta description (usually)", "alt text", "Comments"], 1, `Engines usually display the description — or rewrite it if it's poor.`),
      q("What does rel=\"canonical\" solve?", ["Speed", "Duplicate URLs competing — it names the authoritative version", "Mobile layout", "Security"], 1, `It consolidates ranking signals onto one URL.`),
      q("JSON-LD structured data enables…", ["Faster pages", "Rich results like ratings, FAQs, and course cards", "Better fonts", "Caching"], 1, `Schema.org data is how machines understand entities on the page.`),
    ],
  }),

  L("Data Attributes", ["html5-apis"], "intermediate", 8, {
    intro: `<p>Sometimes elements need to carry custom data — a product ID, a difficulty level, a state flag. <code>data-*</code> attributes are the sanctioned way: valid HTML, invisible to users, and readable from JavaScript via <code>element.dataset</code> and from CSS via attribute selectors.</p>`,
    concepts: [
      `<strong>data-anything</strong> — invent attribute names under the data- prefix`,
      `<strong>dataset API</strong> — <code>el.dataset.userId</code> reads <code>data-user-id</code> (camelCase ↔ kebab-case)`,
      `<strong>CSS hooks</strong> — <code>[data-state="open"] { }</code> styles by data`,
      `<strong>Data, not content</strong> — visible information belongs in real markup`,
    ],
    examples: [
      ex("Carrying state and metadata", `<article class="card"\n         data-course-id="cpp-201"\n         data-difficulty="advanced"\n         data-state="locked">\n    <h3>Smart Pointers</h3>\n</article>`, undefined, `JS: card.dataset.courseId → "cpp-201". CSS: [data-state="locked"] { opacity: 0.5 }`),
      ex("Behavior hooks", `<button data-action="delete" data-target="42">Delete</button>\n<!-- One listener reads dataset.action and dataset.target -->`, undefined, `Event delegation reads the data instead of binding a handler per button.`),
    ],
    realWorld: `Every frontend framework compiles down to patterns like this; analytics tools track clicks via data-track attributes; test suites locate elements with data-testid. It's the standard contract between markup and script.`,
    practice: `Create three lesson cards with data-lesson-id, data-difficulty (one each: beginner/intermediate/advanced), and data-completed="true/false". Write the CSS attribute selector that would dim completed ones.`,
    mistakes: [
      `Storing user-visible content in data attributes — screen readers and search engines never see it`,
      `Expecting types: dataset values are ALWAYS strings ("true" is a string, not a boolean)`,
    ],
    best: [
      `Name data attributes by meaning (data-state, data-id) and keep values short`,
      `Prefer data-testid hooks for tests over brittle class selectors`,
    ],
    template: `<div class="card" data-lesson-id="7" data-difficulty="advanced" data-completed="false">\n    <h3>Smart Pointers</h3>\n</div>\n<style>\n[data-completed="true"] { opacity: 0.55; }\n[data-difficulty="advanced"] { border-left: 3px solid purple; }\n</style>`,
    quiz: [
      q("How does JavaScript read data-user-id=\"7\"?", ["el.data('user-id')", "el.dataset.userId", "el.userid", "el.getData()"], 1, `dataset camelCases the kebab-case attribute name.`),
      q("What type is every dataset value?", ["Inferred", "String", "JSON", "Number when numeric"], 1, `dataset returns strings — convert explicitly when you need numbers/booleans.`),
      q("Which is a misuse of data attributes?", ["Storing a record id", "Storing the product description users must read", "A test hook", "A state flag for CSS"], 1, `Visible content belongs in real elements, not attribute storage.`),
    ],
  }),

  L("Web Storage & HTML5 APIs", ["html5-apis"], "advanced", 12, {
    intro: `<p>Modern browsers ship application platforms: persistent storage (<code>localStorage</code>), location (<code>geolocation</code>), clipboard access, and more — all exposed through JavaScript but grounded in the HTML5 spec family. This lesson tours the storage API you'll use immediately, plus the permission model the others share.</p>`,
    concepts: [
      `<strong>localStorage</strong> — persistent key→string storage per origin (~5MB)`,
      `<strong>sessionStorage</strong> — same API, dies with the tab`,
      `<strong>JSON round-trip</strong> — objects must be stringified/parsed`,
      `<strong>Permission-gated APIs</strong> — geolocation, notifications, clipboard ask the user`,
    ],
    examples: [
      ex("Persisting preferences", `// Save\nlocalStorage.setItem("theme", "dark");\nlocalStorage.setItem("progress", JSON.stringify({ lesson: 7, done: true }));\n\n// Load (possibly in a later visit)\nconst theme = localStorage.getItem("theme");           // "dark"\nconst progress = JSON.parse(localStorage.getItem("progress") || "{}");\nconsole.log(theme, progress.lesson);`, `dark 7`),
      ex("A permissioned API", `navigator.geolocation.getCurrentPosition(\n    pos => console.log(pos.coords.latitude, pos.coords.longitude),\n    err => console.log("denied or unavailable")\n);`, undefined, `The browser shows a permission prompt — the user, not the developer, decides.`),
    ],
    realWorld: `EduVerse itself stores your auth token and saved challenges in localStorage — open DevTools → Application and look. Theme togglers, carts for logged-out users, and draft autosaves all live here.`,
    practice: `In the editor, sketch the save/load cycle for a settings object {fontSize, theme}: stringify-set, get-parse with a default fallback, and a removeItem reset. Note one kind of data that must NEVER go in localStorage (secrets!).`,
    mistakes: [
      `Storing objects without JSON.stringify — you get "[object Object]" back`,
      `Treating localStorage as secure — any script on the page (including injected ones) can read it`,
    ],
    best: [
      `Wrap parses in try/catch with defaults — storage can hold stale or corrupted shapes`,
      `Namespace your keys ("eduverse_token") to avoid collisions with other code on the origin`,
    ],
    template: `// Simulated storage logic (run in a real browser console):\nconst storage = {};\nfunction save(key, value) { storage[key] = JSON.stringify(value); }\nfunction load(key, fallback) {\n    try { return JSON.parse(storage[key]); } catch { return fallback; }\n}\nsave("settings", { fontSize: 16, theme: "dark" });\nconsole.log(load("settings", {}));\nconsole.log(load("missing", { theme: "light" }));`,
    quiz: [
      q("localStorage vs sessionStorage?", ["No difference", "localStorage persists across visits; sessionStorage dies with the tab", "session is bigger", "local is per-page"], 1, `Same API, different lifetime.`),
      q("How do you store an object in localStorage?", ["Directly", "JSON.stringify it first, JSON.parse on read", "Use objectStorage", "You can't"], 1, `Storage holds strings only — serialize both ways.`),
      q("Why must secrets stay out of localStorage?", ["Size limits", "Any script on the page can read it (XSS exposure)", "It's slow", "It expires"], 1, `Storage offers no isolation from page scripts — token theft is the classic attack.`),
    ],
  }),

  L("Details, Summary & Dialog", ["html5-apis", "semantic-elements"], "advanced", 10, {
    intro: `<p>Two interactive widgets ship in pure HTML — no JavaScript required: &lt;details&gt;/&lt;summary&gt; for accordions and disclosure panels, and &lt;dialog&gt; for modals with focus management and a backdrop. Knowing these saves you entire JavaScript libraries.</p>`,
    concepts: [
      `<strong>details + summary</strong> — built-in expand/collapse with keyboard support`,
      `<strong>open attribute</strong> — expanded state, toggleable in HTML or JS`,
      `<strong>dialog.showModal()</strong> — true modal: focus trap, Esc to close, ::backdrop`,
      `<strong>method="dialog"</strong> — forms that close their dialog on submit`,
    ],
    examples: [
      ex("A zero-JS accordion", `<details>\n    <summary>What's included in the free plan?</summary>\n    <p>All 124 lessons, AI mentor access, and coding battles.</p>\n</details>\n<details open>\n    <summary>Do I need to install anything?</summary>\n    <p>No — everything runs in the browser.</p>\n</details>`, undefined, `Click or press Enter on the summary — expansion, collapse, and announcements all built in.`),
      ex("A native modal", `<dialog id="confirm">\n    <p>Delete this draft?</p>\n    <form method="dialog">\n        <button value="cancel">Cancel</button>\n        <button value="yes">Delete</button>\n    </form>\n</dialog>\n<button onclick="document.getElementById('confirm').showModal()">Delete…</button>`, undefined, `showModal() traps focus, dims the page via ::backdrop, and Esc closes — behaviors teams used to hand-build badly.`),
    ],
    realWorld: `FAQ accordions (which Google can show as rich results), mobile nav disclosures, settings panels, confirmation modals — these two elements now cover what once required jQuery plugins, with accessibility handled by the browser.`,
    practice: `Build a 3-question FAQ with details/summary (one open by default), plus a dialog with a short form using method="dialog" and two buttons that both close it with different values.`,
    mistakes: [
      `Rebuilding accordions as div+JS while details exists — more code, worse accessibility`,
      `Using dialog with show() (non-modal) when you wanted showModal() — no focus trap, no backdrop`,
    ],
    best: [
      `Put only the clickable summary line inside &lt;summary&gt;; content follows it inside details`,
      `Style ::backdrop for dialogs — the dimmed layer is part of the element`,
    ],
    template: `<details open>\n    <summary>Is EduVerse free?</summary>\n    <p>Yes — built by students, for students.</p>\n</details>\n<details>\n    <summary>Which languages can I learn?</summary>\n    <p>Python, C++, HTML, and CSS.</p>\n</details>\n\n<dialog id="hi">\n    <p>Welcome!</p>\n    <form method="dialog"><button>Close</button></form>\n</dialog>`,
    quiz: [
      q("What does <summary> define?", ["The page summary", "The always-visible toggle line of a details widget", "Metadata", "A caption"], 1, `summary is the clickable header; the rest of details expands below it.`),
      q("showModal() vs show() on dialog?", ["Identical", "showModal traps focus and adds a backdrop; show is non-modal", "show is newer", "showModal needs jQuery"], 1, `True modal behavior — focus trap, Esc, backdrop — comes only with showModal().`),
      q("A button inside <form method=\"dialog\"> does what?", ["Submits to the server", "Closes the dialog, with its value as the result", "Reloads", "Nothing"], 1, `dialog-method forms close the dialog and set dialog.returnValue.`),
    ],
  }),
];

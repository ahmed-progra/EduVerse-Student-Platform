import { L, q, ex, LessonDef } from "./types";

/** HTML curriculum — Part A: structure, text, tables, forms (lessons 1–13). */
export const htmlA: LessonDef[] = [
  L("Your First HTML Page", ["document-structure"], "beginner", 8, {
    intro: `<p>HTML is the skeleton of every web page: elements wrapped in tags describe what each piece of content <em>is</em>. A valid page always follows the same scaffold — doctype, html, head, and body — and browsers are built to render it.</p>`,
    concepts: [
      `<strong>&lt;!DOCTYPE html&gt;</strong> — tells the browser this is modern HTML5`,
      `<strong>&lt;html&gt;</strong> — the root element wrapping everything`,
      `<strong>&lt;head&gt;</strong> — invisible metadata: title, charset, styles`,
      `<strong>&lt;body&gt;</strong> — everything the user actually sees`,
    ],
    examples: [
      ex(
        "The complete scaffold",
        `<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <title>My First Page</title>\n</head>\n<body>\n    <h1>Hello, web!</h1>\n    <p>This page is mine.</p>\n</body>\n</html>`,
        undefined,
        `The browser tab shows "My First Page"; the body renders the heading and paragraph.`,
      ),
    ],
    realWorld: `Every one of the billions of web pages online starts from exactly this scaffold — view-source on any site and you'll find it. Editors and frameworks generate it, but professionals must know what each line does.`,
    practice: `Build a page with the full scaffold: a title of your choice, one h1 with your name, and a paragraph about why you're learning HTML. Validate the nesting: head before body, both inside html.`,
    mistakes: [
      `Putting visible content in &lt;head&gt; — it belongs in &lt;body&gt;`,
      `Forgetting to close tags: an unclosed &lt;p&gt; makes following content swallow into it`,
    ],
    best: [
      `Always declare <code>lang</code> on &lt;html&gt; — screen readers and search engines rely on it`,
      `Include <code>&lt;meta charset="UTF-8"&gt;</code> first in head so all characters render correctly`,
    ],
    template: `<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <title>About Me</title>\n</head>\n<body>\n    <h1>Your Name</h1>\n    <p>I'm learning HTML because...</p>\n</body>\n</html>`,
    quiz: [
      q(
        "Where does the <title> element belong?",
        ["<body>", "<head>", "<html> directly", "Anywhere"],
        1,
        `title is metadata — it lives in head and appears in the browser tab.`,
      ),
      q(
        "What does <!DOCTYPE html> do?",
        [
          "Imports HTML",
          "Declares the document as HTML5 so browsers render in standards mode",
          "Adds a title",
          "Nothing",
        ],
        1,
        `Without it browsers fall into quirks mode with legacy behavior.`,
      ),
      q(
        "Which element contains everything the user sees?",
        ["<head>", "<meta>", "<body>", "<html>"],
        2,
        `body holds the rendered content; head holds invisible metadata.`,
      ),
    ],
  }),

  L("The Head: Metadata & SEO Tags", ["document-structure", "seo"], "beginner", 10, {
    intro: `<p>The &lt;head&gt; is your page's passport: it tells browsers how to render, search engines what the page is about, and social networks what card to show when shared. A few lines of metadata decide how your page appears everywhere it travels.</p>`,
    concepts: [
      `<strong>meta charset</strong> — character encoding (always UTF-8)`,
      `<strong>meta viewport</strong> — makes pages scale properly on phones`,
      `<strong>meta description</strong> — the snippet search engines display`,
      `<strong>link / script</strong> — attach CSS and JavaScript files`,
    ],
    examples: [
      ex(
        "A production-grade head",
        `<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1">\n    <meta name="description" content="Learn programming with interactive lessons.">\n    <title>EduVerse — Learn by Doing</title>\n    <link rel="stylesheet" href="styles.css">\n    <link rel="icon" href="favicon.ico">\n</head>`,
        undefined,
        `Title and description are what Google shows; viewport is why the page isn't tiny on a phone.`,
      ),
    ],
    realWorld: `Forgot the viewport meta? Your site renders desktop-width on phones — unreadable. Weak description? Google writes its own, often badly. Marketing teams literally A/B test these two lines.`,
    practice: `Write a head for a recipe site page: charset, viewport, a compelling 150-character description, a title under 60 characters, and a stylesheet link.`,
    mistakes: [
      `Skipping viewport — the #1 cause of "my site looks broken on mobile"`,
      `Duplicate titles across pages — every page needs a unique, descriptive title`,
    ],
    best: [
      `Keep titles under ~60 characters and descriptions under ~155 — search results truncate beyond that`,
      `Put charset first in head so the parser never misreads bytes`,
    ],
    template: `<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1">\n    <meta name="description" content="Fresh 20-minute pasta recipes for busy weeknights.">\n    <title>Weeknight Pasta — Quick Recipes</title>\n</head>`,
    quiz: [
      q(
        "Which meta tag makes a page mobile-friendly?",
        ["charset", "viewport", "description", "robots"],
        1,
        `viewport tells the browser to match the device width instead of pretending to be a desktop.`,
      ),
      q(
        "Where does the meta description appear?",
        ["On the page", "In search engine result snippets", "In the tab", "In the console"],
        1,
        `It's invisible on the page but drives click-through from search results.`,
      ),
      q(
        "How do you attach an external stylesheet?",
        ["<style src>", '<link rel="stylesheet" href="...">', "<css href>", "<script css>"],
        1,
        `link with rel=stylesheet in the head loads external CSS.`,
      ),
    ],
  }),

  L("Headings & Paragraphs", ["document-structure"], "beginner", 8, {
    intro: `<p>Headings (&lt;h1&gt;–&lt;h6&gt;) and paragraphs (&lt;p&gt;) carry the document's structure. Heading levels form an outline — like a book's chapters and sections — and that outline is what screen readers navigate and search engines parse.</p>`,
    concepts: [
      `<strong>h1–h6</strong> — six levels of hierarchy, not six font sizes`,
      `<strong>One h1 per page</strong> — the page's main topic`,
      `<strong>No skipping levels</strong> — h2 follows h1; h3 follows h2`,
      `<strong>&lt;p&gt;</strong> — a block of body text`,
    ],
    examples: [
      ex(
        "A proper outline",
        `<h1>Coffee Brewing Guide</h1>\n<p>Everything you need for a great cup.</p>\n\n<h2>Equipment</h2>\n<p>A grinder, a scale, and a kettle.</p>\n\n<h2>Methods</h2>\n<h3>Pour Over</h3>\n<p>Clean and bright flavors.</p>\n<h3>French Press</h3>\n<p>Rich and full-bodied.</p>`,
        undefined,
        `Read the headings alone — they summarize the page. That's the test of good structure.`,
      ),
    ],
    realWorld: `Screen-reader users jump heading-to-heading to scan pages — broken hierarchies strand them. Search engines weight heading text heavily. Docs sites generate their sidebar navigation directly from this outline.`,
    practice: `Structure a "My Favorite Games" page: one h1, two h2 genre sections, each with one h3 game title and a paragraph review. Then read just the headings — do they make sense alone?`,
    mistakes: [
      `Choosing heading levels for their SIZE — that's CSS's job; levels are structure`,
      `Multiple h1s or jumping h1 → h4 — breaks the outline for assistive tech`,
    ],
    best: [
      `Draft the heading outline before writing content — it's your page's table of contents`,
      `Keep paragraphs short on the web — 2–4 sentences scan better`,
    ],
    template: `<h1>My Favorite Games</h1>\n<h2>Strategy</h2>\n<h3>Chess</h3>\n<p>The classic. Easy to learn, impossible to master.</p>\n<h2>Puzzle</h2>\n<h3>Tetris</h3>\n<p>Still perfect after four decades.</p>`,
    quiz: [
      q(
        "How many h1 elements should a page have?",
        ["As many as you like", "One", "Two", "Zero"],
        1,
        `One h1 announces the page topic; everything else nests beneath.`,
      ),
      q(
        "Why not pick <h4> just because you like its size?",
        [
          "You can",
          "Heading levels are structure for readers and machines; size is CSS's job",
          "h4 is deprecated",
          "It's slower",
        ],
        1,
        `Levels build the document outline — styling is a separate concern.`,
      ),
      q(
        "Which element holds a block of body text?",
        ["<text>", "<p>", "<span>", "<block>"],
        1,
        `p is the paragraph element.`,
      ),
    ],
  }),

  L("Text Semantics: strong, em & code", ["semantic-elements"], "beginner", 8, {
    intro: `<p>HTML offers elements that say what text <em>means</em>, not just how it looks: &lt;strong&gt; for importance, &lt;em&gt; for emphasis, &lt;code&gt; for code, &lt;mark&gt; for highlights. Browsers style them, but their real value is the meaning machines can read.</p>`,
    concepts: [
      `<strong>&lt;strong&gt; vs &lt;b&gt;</strong> — importance vs bare bold styling`,
      `<strong>&lt;em&gt; vs &lt;i&gt;</strong> — stress emphasis vs italic styling`,
      `<strong>&lt;code&gt;, &lt;pre&gt;</strong> — inline code and preformatted blocks`,
      `<strong>&lt;mark&gt;, &lt;small&gt;, &lt;del&gt;/&lt;ins&gt;</strong> — highlight, fine print, edits`,
    ],
    examples: [
      ex(
        "Meaningful markup",
        `<p><strong>Warning:</strong> this action <em>cannot</em> be undone.</p>\n<p>Run <code>npm install</code> before starting.</p>\n<p>Price: <del>$50</del> <ins>$35</ins> <small>(tax included)</small></p>`,
        undefined,
        `Screen readers can stress strong/em; styling-only b/i say nothing.`,
      ),
    ],
    realWorld: `Documentation sites mark every command with &lt;code&gt;, store fronts mark price cuts with del/ins (search engines understand the discount), and accessibility audits flag b/i misuse in legal or safety text.`,
    practice: `Mark up a short product update note: one critical warning (strong), one stressed word (em), one terminal command (code), and an old vs new price (del/ins).`,
    mistakes: [
      `Using &lt;b&gt; for warnings — visually identical, semantically empty`,
      `Wrapping whole paragraphs in &lt;strong&gt; — if everything is important, nothing is`,
    ],
    best: [
      `Choose the element by meaning first; adjust looks with CSS after`,
      `Use &lt;pre&gt;&lt;code&gt; together for multi-line code so whitespace survives`,
    ],
    template: `<p><strong>Heads up:</strong> the API <em>will</em> change next week.</p>\n<p>Update with <code>git pull</code> first.</p>\n<p>Pro plan: <del>$12</del> <ins>$9</ins>/month</p>`,
    quiz: [
      q(
        "Which element marks text as important?",
        ["<b>", "<strong>", "<big>", "<bold>"],
        1,
        `strong carries semantic weight; b is styling only.`,
      ),
      q(
        "Best element for the command 'git status'?",
        ["<em>", "<kbd>", "<code>", "<pre> alone"],
        2,
        `Inline code belongs in code; kbd is for keyboard input, pre for blocks.`,
      ),
      q(
        "What does <del> communicate?",
        ["Deleted/removed content", "Danger", "A link", "Emphasis"],
        0,
        `del (paired with ins) marks edits — like a visible price change.`,
      ),
    ],
  }),

  L("Links", ["document-structure"], "beginner", 10, {
    intro: `<p>Links are what make the web a web. The anchor element &lt;a&gt; can point to other sites, other pages of your site, sections within a page, emails, and downloads — and the text between the tags matters as much as the destination.</p>`,
    concepts: [
      `<strong>href</strong> — the destination URL (absolute or relative)`,
      `<strong>Relative vs absolute</strong> — <code>/about.html</code> vs <code>https://site.com</code>`,
      `<strong>Fragments</strong> — <code>#section-id</code> jumps within a page`,
      `<strong>target="_blank"</strong> — new tab; pair with <code>rel="noopener"</code>`,
    ],
    examples: [
      ex(
        "The link toolkit",
        `<a href="https://developer.mozilla.org">MDN Web Docs</a>\n<a href="/courses">Our courses</a>\n<a href="#pricing">Jump to pricing</a>\n<a href="mailto:team@example.com">Email us</a>\n<a href="https://example.com" target="_blank" rel="noopener">Opens in new tab</a>`,
        undefined,
        `Relative links survive domain moves; fragment links need an element with id="pricing".`,
      ),
    ],
    realWorld: `Navigation menus, "skip to content" accessibility links, table-of-contents jumps in documentation, and email CTAs in marketing pages — every interaction path on the web routes through anchors.`,
    practice: `Build a mini nav: three relative links (home, blog, contact), one external link opening in a new tab with rel="noopener", and one fragment link to a #footer section on the same page.`,
    mistakes: [
      `Link text like "click here" — meaningless out of context (screen readers list links by text alone)`,
      `target="_blank" without rel="noopener" — the opened page gains scripting access to yours (security)`,
    ],
    best: [
      `Make link text describe the destination: "read the pricing guide", not "here"`,
      `Use relative URLs for internal links so staging and production both work`,
    ],
    template: `<nav>\n    <a href="/">Home</a>\n    <a href="/blog">Blog</a>\n    <a href="/contact">Contact</a>\n    <a href="https://developer.mozilla.org" target="_blank" rel="noopener">MDN</a>\n</nav>\n<p><a href="#footer">Skip to footer</a></p>\n<footer id="footer">© 2026</footer>`,
    quiz: [
      q(
        'What does href="#faq" do?',
        ["Opens faq.html", 'Scrolls to the element with id="faq"', "Downloads a file", "Nothing"],
        1,
        `Fragment links target an id on the page.`,
      ),
      q(
        "Why is 'click here' bad link text?",
        [
          "Too short",
          "Out of context it says nothing about the destination",
          "It's slower",
          "Browsers block it",
        ],
        1,
        `Assistive tech and scanners read link text in isolation.`,
      ),
      q(
        'What should accompany target="_blank"?',
        ['rel="noopener"', "id", 'class="new"', "download"],
        0,
        `noopener severs the new page's handle on your window — a security baseline.`,
      ),
    ],
  }),

  L("Images", ["media"], "beginner", 10, {
    intro: `<p>The &lt;img&gt; element embeds pictures — and carries two responsibilities beyond showing pixels: describing the image for people who can't see it (<code>alt</code>) and not wrecking performance (dimensions, lazy loading, modern formats).</p>`,
    concepts: [
      `<strong>src & alt</strong> — the file and its text alternative (required!)`,
      `<strong>width/height attributes</strong> — reserve space, prevent layout jumps`,
      `<strong>loading="lazy"</strong> — defer offscreen images for speed`,
      `<strong>&lt;figure&gt; + &lt;figcaption&gt;</strong> — images with captions`,
    ],
    examples: [
      ex(
        "A responsible image",
        `<img src="trail.jpg"\n     alt="Hikers on a pine forest trail at sunrise"\n     width="800" height="533"\n     loading="lazy">`,
        undefined,
        `The alt text paints the picture in words; width/height stop the page from jumping as it loads.`,
      ),
      ex(
        "Captioned figure",
        `<figure>\n    <img src="chart.png" alt="Sales rising 40% from January to June" width="600" height="400">\n    <figcaption>Figure 1: H1 2026 sales growth.</figcaption>\n</figure>`,
      ),
    ],
    realWorld: `Images are the heaviest part of most pages — lazy loading and sized images are core web performance work. Meanwhile alt text is both an accessibility legal requirement in many sectors and what search engines index.`,
    practice: `Embed two images: a content photo with descriptive alt, sizes, and lazy loading; and a decorative divider with empty alt="" (so screen readers skip it). Wrap the first in a captioned figure.`,
    mistakes: [
      `Missing alt — screen readers read the FILENAME aloud ("IMG underscore 4 7 3 2 dot jay-peg")`,
      `alt text like "image of..." — redundant; describe the content itself`,
    ],
    best: [
      `Decorative images get alt="" (empty, present) so assistive tech skips them silently`,
      `Always set width and height (or CSS aspect-ratio) — layout shift is a ranking and UX penalty`,
    ],
    template: `<figure>\n    <img src="https://placehold.co/600x400" \n         alt="A placeholder landscape image"\n         width="600" height="400" loading="lazy">\n    <figcaption>A captioned demo image.</figcaption>\n</figure>`,
    quiz: [
      q(
        "What happens when an image lacks alt and fails to load?",
        [
          "Nothing shows",
          "Browsers/screen readers fall back to the filename — useless noise",
          "It retries",
          "Error page",
        ],
        1,
        `alt is the graceful fallback for both failures and non-visual users.`,
      ),
      q(
        "Correct alt for a purely decorative swirl?",
        ['"decorative swirl image"', 'alt="" (empty)', "Omit the attribute", '"swirl.png"'],
        1,
        `Empty alt explicitly tells assistive tech to skip; omitting it does not.`,
      ),
      q(
        "Why set width and height attributes?",
        [
          "Required by HTML5",
          "The browser reserves space, preventing layout shift",
          "They compress the image",
          "SEO keywords",
        ],
        1,
        `Reserved space means content doesn't jump when images arrive.`,
      ),
    ],
  }),

  L("Lists", ["document-structure"], "beginner", 8, {
    intro: `<p>HTML has three list types: unordered (&lt;ul&gt;) for bullet collections, ordered (&lt;ol&gt;) for sequences where position matters, and description lists (&lt;dl&gt;) for term–definition pairs. Lists also happen to be the standard skeleton for navigation menus.</p>`,
    concepts: [
      `<strong>&lt;ul&gt; / &lt;ol&gt;</strong> — bullets vs numbers; &lt;li&gt; for every item`,
      `<strong>Nesting</strong> — a list inside an &lt;li&gt; creates sub-items`,
      `<strong>start / reversed</strong> — control ordered list numbering`,
      `<strong>&lt;dl&gt;, &lt;dt&gt;, &lt;dd&gt;</strong> — glossaries and key–value displays`,
    ],
    examples: [
      ex(
        "Ordered steps with nesting",
        `<ol>\n    <li>Preheat the oven</li>\n    <li>Mix the batter\n        <ul>\n            <li>Dry ingredients first</li>\n            <li>Then fold in the wet</li>\n        </ul>\n    </li>\n    <li>Bake 25 minutes</li>\n</ol>`,
      ),
      ex(
        "A description list",
        `<dl>\n    <dt>HTML</dt>\n    <dd>Structures content</dd>\n    <dt>CSS</dt>\n    <dd>Styles it</dd>\n</dl>`,
      ),
    ],
    realWorld: `Site navs are ul + CSS. Checkout steps, rankings, and recipes are ol (sequence matters — search engines show numbered rich results). API docs use dl for parameter tables.`,
    practice: `Write your morning routine as an ordered list of 4 steps, where one step contains a nested unordered list of 2 options. Add a 2-term description list defining "frontend" and "backend".`,
    mistakes: [
      `Choosing ul when order matters (instructions!) — semantics communicate sequence`,
      `Nesting the sub-list as a SIBLING of &lt;li&gt; instead of inside it — invalid HTML`,
    ],
    best: [
      `If items have an inherent order, use ol — readers and machines both benefit`,
      `Use lists for navigation menus; assistive tech announces "list, 5 items" giving instant orientation`,
    ],
    template: `<ol>\n    <li>Wake up</li>\n    <li>Breakfast\n        <ul>\n            <li>Coffee</li>\n            <li>Oats</li>\n        </ul>\n    </li>\n    <li>Stretch</li>\n    <li>Code</li>\n</ol>`,
    quiz: [
      q(
        "Recipe steps belong in…",
        ["<ul>", "<ol>", "<dl>", "<div>s"],
        1,
        `Order matters — that's exactly what ol communicates.`,
      ),
      q(
        "Where does a nested list go?",
        ["After the parent </ul>", "Inside the parent <li>", "Inside <head>", "Anywhere"],
        1,
        `The sub-list is part of its parent item, so it lives within that li.`,
      ),
      q(
        "Which trio builds a description list?",
        ["dl, dt, dd", "ul, ol, li", "table, tr, td", "div, span, p"],
        0,
        `dl wraps; dt is the term; dd is the description.`,
      ),
    ],
  }),

  L("Tables", ["tables"], "beginner", 10, {
    intro: `<p>Tables display genuinely tabular data — rows and columns with meaning. The grid is built from &lt;table&gt;, &lt;tr&gt; rows, &lt;th&gt; header cells, and &lt;td&gt; data cells. (Using tables for page layout died in 2005; today they're for data only.)</p>`,
    concepts: [
      `<strong>&lt;tr&gt;</strong> — a row; cells live inside rows`,
      `<strong>&lt;th&gt; vs &lt;td&gt;</strong> — header cells vs data cells`,
      `<strong>colspan / rowspan</strong> — cells spanning multiple columns/rows`,
      `<strong>&lt;caption&gt;</strong> — the table's accessible title`,
    ],
    examples: [
      ex(
        "A data table",
        `<table>\n    <caption>Q1 Sales by Region</caption>\n    <tr>\n        <th>Region</th>\n        <th>Sales</th>\n    </tr>\n    <tr>\n        <td>North</td>\n        <td>$42,000</td>\n    </tr>\n    <tr>\n        <td>South</td>\n        <td>$38,500</td>\n    </tr>\n</table>`,
      ),
      ex(
        "Spanning cells",
        `<table>\n    <tr>\n        <th colspan="2">Server Status</th>\n    </tr>\n    <tr>\n        <td>API</td>\n        <td>✅ online</td>\n    </tr>\n</table>`,
        undefined,
        `colspan="2" stretches the header across both columns.`,
      ),
    ],
    realWorld: `Pricing comparisons, sports standings, financial reports, admin dashboards — anywhere data has two axes, tables are correct and unmatched. Spreadsheet exports render straight into them.`,
    practice: `Build a 3-row class schedule table: caption "My Schedule", header row (Day, Subject, Time), and two data rows. Make the caption render above the grid.`,
    mistakes: [
      `Cells outside of &lt;tr&gt; — every td/th needs a row parent`,
      `Using tables for page layout — breaks responsive design and confuses screen readers`,
    ],
    best: [
      `Always start with a header row of th cells — it's what makes the data interpretable`,
      `Add a caption: visible context for everyone, essential for screen reader users`,
    ],
    template: `<table>\n    <caption>My Schedule</caption>\n    <tr>\n        <th>Day</th><th>Subject</th><th>Time</th>\n    </tr>\n    <tr>\n        <td>Mon</td><td>Math</td><td>09:00</td>\n    </tr>\n    <tr>\n        <td>Tue</td><td>CS</td><td>11:00</td>\n    </tr>\n</table>`,
    quiz: [
      q(
        "Which element is a header cell?",
        ["<td>", "<th>", "<header>", "<hd>"],
        1,
        `th = table header; browsers bold/center it and screen readers announce it.`,
      ),
      q(
        'What does colspan="3" do?',
        [
          "Creates 3 columns",
          "Makes one cell span across 3 columns",
          "Repeats the cell 3 times",
          "Adds 3px spacing",
        ],
        1,
        `The cell stretches over three column slots.`,
      ),
      q(
        "Tables should be used for…",
        ["Page layout", "Two-dimensional data", "Navigation", "Image grids"],
        1,
        `Layout belongs to CSS; tables are for data with rows-and-columns meaning.`,
      ),
    ],
  }),

  L("Accessible Tables", ["tables", "accessibility"], "intermediate", 10, {
    intro: `<p>A sighted reader scans a table visually; a screen-reader user hears one cell at a time. Structural elements — &lt;thead&gt;, &lt;tbody&gt;, &lt;tfoot&gt; — and the <code>scope</code> attribute tell assistive tech which headers describe which cells, turning a wall of numbers back into a table.</p>`,
    concepts: [
      `<strong>thead / tbody / tfoot</strong> — semantic row groups`,
      `<strong>scope="col" / scope="row"</strong> — what a th governs`,
      `<strong>Caption first</strong> — context before the data`,
      `<strong>Avoid merged-cell mazes</strong> — complex spans confuse navigation`,
    ],
    examples: [
      ex(
        "Fully structured table",
        `<table>\n    <caption>Monthly Budget</caption>\n    <thead>\n        <tr>\n            <th scope="col">Category</th>\n            <th scope="col">Planned</th>\n            <th scope="col">Actual</th>\n        </tr>\n    </thead>\n    <tbody>\n        <tr>\n            <th scope="row">Food</th>\n            <td>$300</td>\n            <td>$342</td>\n        </tr>\n        <tr>\n            <th scope="row">Transport</th>\n            <td>$120</td>\n            <td>$98</td>\n        </tr>\n    </tbody>\n    <tfoot>\n        <tr>\n            <th scope="row">Total</th>\n            <td>$420</td>\n            <td>$440</td>\n        </tr>\n    </tfoot>\n</table>`,
        undefined,
        `A screen reader on "$342" announces: "Food, Actual, $342" — scope makes that mapping.`,
      ),
    ],
    realWorld: `Government and banking sites are legally required (WCAG) to ship tables like this. Bonus: thead/tbody enable sticky headers and printable repeating headers — accessibility work pays UX dividends.`,
    practice: `Upgrade your schedule table from the last lesson: wrap rows in thead/tbody, set scope="col" on column headers, make the first cell of each body row a th with scope="row".`,
    mistakes: [
      `Bolding td cells to fake headers — no semantics, no announcements`,
      `Leaving scope off when both column AND row headers exist — ambiguity for assistive tech`,
    ],
    best: [
      `Row label cells should be &lt;th scope="row"&gt;, not bolded td`,
      `Keep one header concept per axis; if you need merged headers everywhere, consider splitting tables`,
    ],
    template: `<table>\n    <caption>Workouts</caption>\n    <thead>\n        <tr><th scope="col">Day</th><th scope="col">Focus</th></tr>\n    </thead>\n    <tbody>\n        <tr><th scope="row">Mon</th><td>Push</td></tr>\n        <tr><th scope="row">Wed</th><td>Pull</td></tr>\n    </tbody>\n</table>`,
    quiz: [
      q(
        'What does scope="row" on a th mean?',
        [
          "The cell spans the row",
          "This header describes the cells of its row",
          "Style the row",
          "Nothing",
        ],
        1,
        `scope binds headers to the cells they label for assistive tech.`,
      ),
      q(
        "Which element groups the header row(s)?",
        ["<header>", "<thead>", "<th>", "<top>"],
        1,
        `thead wraps header rows; tbody holds the data rows.`,
      ),
      q(
        "Why do screen readers need table structure?",
        [
          "They don't",
          "They read cell-by-cell and rely on header mappings for context",
          "For speed",
          "To skip tables",
        ],
        1,
        `Without scope/structure, a cell is just a floating number with no meaning.`,
      ),
    ],
  }),

  L("Forms: The Basics", ["forms"], "beginner", 12, {
    intro: `<p>Forms are how the web collects input — logins, searches, checkouts, signups. A &lt;form&gt; wraps controls like &lt;input&gt;, defines where the data goes (<code>action</code>) and how (<code>method</code>), and the <code>name</code> attribute on each control is the key the server receives.</p>`,
    concepts: [
      `<strong>&lt;form action method&gt;</strong> — destination URL and GET/POST`,
      `<strong>&lt;input name&gt;</strong> — name= is what the server sees; no name, no data`,
      `<strong>GET vs POST</strong> — visible query params vs request body`,
      `<strong>Submit</strong> — a button inside the form sends it`,
    ],
    examples: [
      ex(
        "A minimal working form",
        `<form action="/search" method="get">\n    <input type="text" name="q" placeholder="Search courses...">\n    <button type="submit">Search</button>\n</form>`,
        undefined,
        `Submitting navigates to /search?q=whatever-you-typed — name="q" became the parameter.`,
      ),
      ex(
        "Login form (POST)",
        `<form action="/login" method="post">\n    <input type="email" name="email" placeholder="Email">\n    <input type="password" name="password" placeholder="Password">\n    <button type="submit">Log in</button>\n</form>`,
        undefined,
        `Credentials go in the request body with POST — never in a URL.`,
      ),
    ],
    realWorld: `Every signup you've completed was this exact machinery. Even modern JavaScript apps build on form semantics — and when JS fails, a real form still works. EduVerse's own login page is one.`,
    practice: `Build a newsletter form: an email input named "email", a select named "frequency" (weekly/monthly), and a submit button. Choose GET or POST and justify your choice in a comment.`,
    mistakes: [
      `Inputs without name — the field silently sends nothing`,
      `GET for sensitive data — passwords would appear in URLs, history, and server logs`,
    ],
    best: [
      `Use POST for anything that changes data or carries secrets; GET for safe, shareable queries like search`,
      `Always include an explicit &lt;button type="submit"&gt; — implicit submission alone confuses users`,
    ],
    template: `<form action="/subscribe" method="post">\n    <input type="email" name="email" placeholder="you@example.com">\n    <select name="frequency">\n        <option value="weekly">Weekly</option>\n        <option value="monthly">Monthly</option>\n    </select>\n    <button type="submit">Subscribe</button>\n</form>`,
    quiz: [
      q(
        "A form input has no name attribute. What happens on submit?",
        ["Error", "Its value is not sent at all", "It sends as 'unnamed'", "The form won't submit"],
        1,
        `name is the data key — without it the field is invisible to the server.`,
      ),
      q(
        "Which method should a login form use?",
        ["GET", "POST", "PUT", "Either"],
        1,
        `POST keeps credentials out of URLs, history, and logs.`,
      ),
      q(
        'Where does method="get" put the form data?',
        ["Request body", "URL query string", "Cookies", "Headers"],
        1,
        `GET serializes fields into ?key=value pairs on the URL.`,
      ),
    ],
  }),

  L("Input Types", ["forms"], "intermediate", 12, {
    intro: `<p>The <code>type</code> attribute transforms &lt;input&gt; into twenty different controls: email with built-in validation, number with spinners, date with a calendar, range sliders, color pickers. Picking the right type buys you mobile keyboards, validation, and UI for free.</p>`,
    concepts: [
      `<strong>Text family</strong> — text, email, password, url, tel, search`,
      `<strong>Numbers & dates</strong> — number (min/max/step), date, time`,
      `<strong>Pickers</strong> — range, color, file`,
      `<strong>Choices</strong> — checkbox (many) vs radio (one of a group)`,
    ],
    examples: [
      ex(
        "Types in action",
        `<input type="email" name="email" placeholder="you@site.com">\n<input type="number" name="age" min="13" max="120">\n<input type="date" name="birthday">\n<input type="range" name="volume" min="0" max="100" value="60">\n<input type="color" name="theme" value="#7c5cff">`,
        undefined,
        `On phones, email type shows the @-keyboard; number shows digits — small types, big UX.`,
      ),
      ex(
        "Radio groups share a name",
        `<label><input type="radio" name="plan" value="free" checked> Free</label>\n<label><input type="radio" name="plan" value="pro"> Pro</label>\n<label><input type="checkbox" name="newsletter" value="yes"> Send me tips</label>`,
        undefined,
        `Radios with the same name are one group — selecting one deselects the others.`,
      ),
    ],
    realWorld: `Checkout forms live and die by input types: tel keyboards for phone fields, date pickers for delivery, number steppers for quantity. Wrong types measurably increase form abandonment on mobile.`,
    practice: `Build an event RSVP: name (text), email, number of guests (number 1–10), event date (date), dietary preference (3 radios), and a checkbox for "+1 parking". Test what your browser validates for free.`,
    mistakes: [
      `Radios with DIFFERENT names — they stop being a group and multiple can be selected`,
      `type="number" for phone numbers — strips leading zeros and blocks "+"; use type="tel"`,
    ],
    best: [
      `Always set min/max/step on number and range — they're your first validation line`,
      `Give checked defaults where a sensible choice exists (e.g. the free plan)`,
    ],
    template: `<form>\n    <input type="text" name="name" placeholder="Full name">\n    <input type="email" name="email" placeholder="Email">\n    <input type="number" name="guests" min="1" max="10" value="1">\n    <input type="date" name="when">\n    <label><input type="radio" name="diet" value="any" checked> Any</label>\n    <label><input type="radio" name="diet" value="veg"> Vegetarian</label>\n    <button type="submit">RSVP</button>\n</form>`,
    quiz: [
      q(
        "How do radio buttons form an exclusive group?",
        ["Same id", "Same name attribute", "Same value", "Inside one div"],
        1,
        `The shared name makes the browser enforce single selection.`,
      ),
      q(
        "Best input type for a phone number?",
        ["number", "tel", "text", "phone"],
        1,
        `tel gives the phone keyboard without number's formatting problems.`,
      ),
      q(
        'What does <input type="range"> render?',
        ["A text box", "A slider", "A progress bar", "A spinner"],
        1,
        `range is the built-in slider control.`,
      ),
    ],
  }),

  L("Labels & Form Accessibility", ["forms", "accessibility"], "intermediate", 10, {
    intro: `<p>A form without labels is unusable for screen-reader users and clumsy for everyone else. The &lt;label&gt; element binds text to a control: clicking the label focuses the field, and assistive tech announces it. This single habit fixes the most common accessibility failure on the web.</p>`,
    concepts: [
      `<strong>label for= / id</strong> — explicit binding between text and control`,
      `<strong>Wrapping labels</strong> — &lt;label&gt;Text &lt;input&gt;&lt;/label&gt; needs no ids`,
      `<strong>fieldset + legend</strong> — group related controls with a caption`,
      `<strong>Placeholders are NOT labels</strong> — they vanish on typing`,
    ],
    examples: [
      ex(
        "Two binding styles",
        `<label for="email">Email address</label>\n<input id="email" type="email" name="email">\n\n<label>\n    Password\n    <input type="password" name="password">\n</label>`,
        undefined,
        `Click either label text — the input focuses. That's the binding working.`,
      ),
      ex(
        "Grouping with fieldset",
        `<fieldset>\n    <legend>Shipping speed</legend>\n    <label><input type="radio" name="speed" value="std" checked> Standard</label>\n    <label><input type="radio" name="speed" value="exp"> Express</label>\n</fieldset>`,
        undefined,
        `Screen readers announce "Shipping speed" before each option — context that placeholders can't give.`,
      ),
    ],
    realWorld: `Accessibility lawsuits over forms are routine (retail, banking, government). Beyond compliance: labeled forms convert better — bigger click targets and no "what was this field?" amnesia after autofill.`,
    practice: `Take your RSVP form from last lesson and label every control properly: explicit for/id on text inputs, wrapped labels on radios/checkboxes, and a fieldset+legend around the dietary radios.`,
    mistakes: [
      `Relying on placeholder as the only label — it disappears the moment users type, and fails contrast standards`,
      `for= pointing at a name instead of an id — the binding silently fails`,
    ],
    best: [
      `Every control gets a real label. No exceptions — hide it visually with CSS if design demands, never remove it`,
      `Group every radio/checkbox set in a fieldset with a meaningful legend`,
    ],
    template: `<form>\n    <label for="name">Name</label>\n    <input id="name" type="text" name="name">\n\n    <fieldset>\n        <legend>Contact preference</legend>\n        <label><input type="radio" name="contact" value="email" checked> Email</label>\n        <label><input type="radio" name="contact" value="sms"> SMS</label>\n    </fieldset>\n    <button type="submit">Save</button>\n</form>`,
    quiz: [
      q(
        'What connects <label for="x"> to an input?',
        ['name="x"', 'id="x"', 'class="x"', 'value="x"'],
        1,
        `for matches the input's id — that's the explicit association.`,
      ),
      q(
        "Why can't placeholder replace a label?",
        [
          "It can",
          "It disappears while typing and isn't reliably announced",
          "It's too long",
          "Styling limits",
        ],
        1,
        `Placeholders are hints, not names — they fail users mid-entry.`,
      ),
      q(
        "What do fieldset and legend provide?",
        [
          "Styling only",
          "A grouped, captioned context announced with each control",
          "Validation",
          "Layout",
        ],
        1,
        `The legend gives every control inside the group its shared context.`,
      ),
    ],
  }),

  L("Select, Textarea & Datalist", ["forms"], "intermediate", 10, {
    intro: `<p>Three controls round out the form toolkit: &lt;select&gt; for choosing from a list, &lt;textarea&gt; for multi-line text, and &lt;datalist&gt; for the hybrid — type freely OR pick a suggestion. Knowing which to use is a small UX design decision you'll make constantly.</p>`,
    concepts: [
      `<strong>select &gt; option</strong> — dropdown; value vs display text; optgroup for sections`,
      `<strong>multiple</strong> — multi-select lists`,
      `<strong>textarea rows/cols</strong> — sized multi-line input (closing tag holds the default text)`,
      `<strong>input + datalist</strong> — free text with autocompletion suggestions`,
    ],
    examples: [
      ex(
        "Select with groups",
        `<label for="course">Course</label>\n<select id="course" name="course">\n    <optgroup label="Frontend">\n        <option value="html">HTML</option>\n        <option value="css">CSS</option>\n    </optgroup>\n    <optgroup label="Systems">\n        <option value="cpp" selected>C++</option>\n    </optgroup>\n</select>`,
      ),
      ex(
        "Textarea and datalist",
        `<label for="bio">Bio</label>\n<textarea id="bio" name="bio" rows="4" placeholder="A sentence about you..."></textarea>\n\n<label for="city">City</label>\n<input id="city" name="city" list="cities">\n<datalist id="cities">\n    <option value="Cairo">\n    <option value="Oslo">\n    <option value="Tokyo">\n</datalist>`,
        undefined,
        `datalist suggests but doesn't restrict — users may type any city.`,
      ),
    ],
    realWorld: `Country pickers (select), support-ticket descriptions (textarea), and search boxes with suggestions (datalist pattern) appear in virtually every product. Choosing select vs datalist is the "closed set vs open set" decision.`,
    practice: `Build a feedback widget: a select with 3 grouped topics, a textarea for details (4 rows), and a datalist-backed input suggesting 3 "how did you find us?" options.`,
    mistakes: [
      `Putting the default value of a textarea in a value attribute — it goes BETWEEN the tags`,
      `Using select for 50+ options without groups or search — unusable; consider datalist`,
    ],
    best: [
      `Closed, known set of options → select. Open-ended with hints → input+datalist`,
      `Always pair option value= (sent to server) with human-friendly display text`,
    ],
    template: `<label for="topic">Topic</label>\n<select id="topic" name="topic">\n    <option value="bug">Bug report</option>\n    <option value="idea">Feature idea</option>\n</select>\n\n<label for="details">Details</label>\n<textarea id="details" name="details" rows="4"></textarea>\n\n<button type="submit">Send</button>`,
    quiz: [
      q(
        "Where does a textarea's initial content go?",
        ["value attribute", "Between <textarea> and </textarea>", "placeholder", "data-value"],
        1,
        `Unlike input, textarea content is its children.`,
      ),
      q(
        "datalist differs from select because…",
        [
          "It looks nicer",
          "Users can type values beyond the suggestions",
          "It's required",
          "It submits twice",
        ],
        1,
        `datalist augments a free-text input; select restricts to its options.`,
      ),
      q(
        "What does optgroup provide?",
        ["Multiple selection", "Labeled sections inside a dropdown", "Validation", "Sorting"],
        1,
        `optgroup visually and semantically groups related options.`,
      ),
    ],
  }),
];

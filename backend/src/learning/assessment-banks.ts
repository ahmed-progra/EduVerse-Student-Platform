/**
 * Placement assessment banks — topic-tagged questions per course.
 *
 * Question types:
 *  - mcq:     conceptual multiple choice
 *  - predict: "what does this code do/output" — tests reading ability
 *  - code:    open-ended writing task, graded by the AI service
 *
 * Every objective question maps to exactly one canonical topic key
 * (see topics.ts); code tasks map to several. The learning service
 * aggregates correctness per topic into the mastery profile.
 */

export type QuestionType = "mcq" | "predict" | "code";

export interface BankQuestion {
  id: string;
  type: QuestionType;
  topics: string[];
  difficulty: 1 | 2 | 3;
  prompt: string;
  code?: string;
  options?: string[];
  answer?: number; // index into options — stripped before serving
  starter?: string; // for code tasks
}

const m = (id: string, topic: string, difficulty: 1 | 2 | 3, prompt: string, options: string[], answer: number): BankQuestion => ({
  id, type: "mcq", topics: [topic], difficulty, prompt, options, answer,
});
const p = (id: string, topic: string, difficulty: 1 | 2 | 3, prompt: string, code: string, options: string[], answer: number): BankQuestion => ({
  id, type: "predict", topics: [topic], difficulty, prompt, code, options, answer,
});
const c = (id: string, topics: string[], difficulty: 1 | 2 | 3, prompt: string, starter: string): BankQuestion => ({
  id, type: "code", topics, difficulty, prompt, starter,
});

/* ── PYTHON ────────────────────────────────────────────────────────── */

const python: BankQuestion[] = [
  m("py-var", "variables", 1, "Which is a valid Python variable name?", ["2nd_place", "user-name", "total_score", "class"], 2),
  p("py-types", "data-types", 1, "What does this print?", `x = "5"\ny = 5\nprint(x == y, type(x) == type(y))`, ["True True", "False False", "True False", "False True"], 1),
  p("py-io", "io", 1, "The user types 7. What prints?", `n = input("Number: ")\nprint(n * 2)`, ["14", "77", "Error", "7 7"], 1),
  p("py-ops", "operators", 1, "What does this print?", `print(17 // 5, 17 % 5, 2 ** 3)`, ["3 2 8", "3.4 2 6", "3 2 6", "2 3 8"], 0),
  p("py-cond", "conditionals", 1, "What prints for score = 85?", `score = 85\nif score >= 90:\n    print("A")\nelif score >= 80:\n    print("B")\nelif score >= 85:\n    print("B+")\nelse:\n    print("C")`, ["A", "B", "B+", "C"], 1),
  p("py-loop", "loops", 1, "What does this print?", `total = 0\nfor i in range(1, 5):\n    total += i\nprint(total)`, ["10", "15", "5", "4"], 0),
  p("py-str", "strings", 2, "What does this print?", `s = "adaptive"\nprint(s[1:4], s[-1], s[::-1][:3])`, ["dap e evi", "dapt e evi", "dap e ev", "ada a pad"], 0),
  p("py-func", "functions", 2, "What does this print?", `def f(x, y=10):\n    return x + y\n\nprint(f(5), f(5, 1))`, ["15 6", "Error", "5 6", "15 51"], 0),
  p("py-list", "lists", 2, "What does this print?", `a = [1, 2, 3]\nb = a\nb.append(4)\nprint(len(a))`, ["3", "4", "Error", "1"], 1),
  m("py-tup", "tuples", 2, "Why use a tuple instead of a list?", ["Tuples can grow faster", "Immutability — fixed records, usable as dict keys", "Tuples allow mixed types", "No difference"], 1),
  p("py-dict", "dictionaries", 2, "What does this print?", `d = {"a": 1}\nd["b"] = d.get("b", 0) + 5\nprint(d["b"], d.get("c"))`, ["5 None", "Error", "5 0", "None None"], 0),
  p("py-set", "sets", 2, "What does this print?", `a = {1, 2, 3}\nb = {3, 4}\nprint(len(a | b), len(a & b))`, ["4 1", "5 1", "4 0", "5 2"], 0),
  m("py-mod", "modules", 2, "After 'from math import sqrt', which call is valid?", ["math.sqrt(9)", "sqrt(9)", "import.sqrt(9)", "math::sqrt(9)"], 1),
  m("py-file", "file-handling", 2, "Why is 'with open(...) as f:' preferred over open()/close()?", ["It's faster", "The file closes automatically even if an exception occurs", "It reads the whole file", "It locks the file"], 1),
  p("py-exc", "exceptions", 2, "What does this print?", `try:\n    x = int("abc")\nexcept ValueError:\n    print("bad value")\nfinally:\n    print("done")`, ["bad value", "done", "bad value then done", "Error"], 2),
  p("py-oop", "oop", 3, "What does this print?", `class Animal:\n    def speak(self):\n        return "..."\n\nclass Dog(Animal):\n    def speak(self):\n        return "Woof"\n\na = [Animal(), Dog()]\nprint(a[0].speak(), a[1].speak())`, ["... ...", "Woof Woof", "... Woof", "Error"], 2),
  m("py-gen", "generators", 3, "What does yield do that return doesn't?", ["Ends the function permanently", "Emits a value and pauses, resuming on the next request", "Returns multiple values at once", "Raises StopIteration immediately"], 1),
  m("py-dec", "decorators", 3, "@logger above def f() is equivalent to…", ["logger = f(logger)", "f = logger(f)", "f.logger()", "logger(f) discarded"], 1),
  p("py-lam", "lambdas", 3, "What does this print?", `pairs = [("a", 3), ("b", 1), ("c", 2)]\npairs.sort(key=lambda p: p[1])\nprint(pairs[0][0])`, ["a", "b", "c", "Error"], 1),
  m("py-api", "apis", 3, "An HTTP request returns status 429. What does that mean and what should robust code do?", ["Not found — give up", "Rate limited — back off and retry", "Server error — crash", "Success — parse the body"], 1),
  p("py-adv", "advanced-python", 3, "What does this print?", `nums = [1, 2, 3, 4, 5, 6]\nresult = [n * 10 for n in nums if n % 2 == 0]\nprint(result)`, ["[20, 40, 60]", "[10, 30, 50]", "[2, 4, 6]", "[60]"], 0),
  c("py-code1", ["functions", "loops", "conditionals"], 2,
    "Write a function count_evens(numbers) that returns how many numbers in the list are even. Then call it on [3, 8, 12, 7, 4] (expected result: 3).",
    `def count_evens(numbers):\n    # your code here\n    pass\n\nprint(count_evens([3, 8, 12, 7, 4]))`),
  c("py-code2", ["dictionaries", "strings", "loops"], 3,
    "Write code that counts how many times each word appears in the sentence 'the quick the lazy the end' and prints the count of 'the' (expected: 3). Use a dictionary.",
    `sentence = "the quick the lazy the end"\n# your code here`),
];

/* ── C++ ───────────────────────────────────────────────────────────── */

const cpp: BankQuestion[] = [
  m("cp-var", "variables", 1, "What does 'int x;' hold before any assignment (as a local variable)?", ["0", "null", "An unpredictable garbage value", "Empty"], 2),
  m("cp-types", "data-types", 1, "Which literal is a char in C++?", ["\"A\"", "'A'", "`A`", "char(A)"], 1),
  p("cp-ops", "operators", 1, "What does this print?", `int a = 7, b = 2;\ncout << a / b << " " << a % b;`, ["3.5 1", "3 1", "3.5 0", "3 2"], 1),
  p("cp-io", "io", 1, "The user types: Grace Hopper. What does this print?", `string name;\ncin >> name;\ncout << name;`, ["Grace Hopper", "Grace", "Hopper", "Nothing"], 1),
  p("cp-cond", "conditionals", 1, "What does this print?", `int x = 0;\nif (x = 5) {\n    cout << "yes " << x;\n} else {\n    cout << "no " << x;\n}`, ["no 0", "yes 5", "no 5", "Compile error"], 1),
  p("cp-loop", "loops", 1, "How many times does the body run?", `for (int i = 0; i < 5; i += 2) {\n    cout << i;\n}`, ["2", "3", "5", "Infinite"], 1),
  p("cp-func", "functions", 2, "What does this print?", `void bump(int n) { n += 10; }\n\nint main() {\n    int x = 5;\n    bump(x);\n    cout << x;\n}`, ["15", "5", "10", "Error"], 1),
  p("cp-arr", "arrays", 2, "What does this print?", `int a[] = {10, 20, 30};\nint* p = a;\ncout << *(p + 1);`, ["10", "20", "30", "The address of a[1]"], 1),
  p("cp-ptr", "pointers", 2, "What does this print?", `int x = 10;\nint* p = &x;\n*p = 20;\ncout << x;`, ["10", "20", "The address of x", "Error"], 1),
  p("cp-ref", "references", 2, "What does this print?", `int a = 1, b = 2;\nint& r = a;\nr = b;\nr = 99;\ncout << a << " " << b;`, ["99 2", "1 99", "99 99", "1 2"], 0),
  m("cp-struct", "structures", 2, "How do you access member x through a pointer 'Point* p'?", ["p.x", "p->x", "*p.x", "p::x"], 1),
  m("cp-class", "classes", 2, "What can access a private member of a class?", ["Any code in the same file", "Only the class's own methods (and friends)", "All subclasses", "main()"], 1),
  m("cp-ctor", "constructors", 2, "A class defines only Timer(int s). What does 'Timer t;' do?", ["Uses s = 0", "Compile error — the default constructor no longer exists", "Runtime error", "Creates an empty Timer"], 1),
  m("cp-dtor", "destructors", 3, "When does a local object's destructor run?", ["At program exit", "When its scope ends", "Only via delete", "Never automatically"], 1),
  m("cp-inh", "inheritance", 3, "What does 'class Dog : public Animal' mean?", ["Dog contains an Animal member", "Dog is-an Animal and inherits its members", "Animal inherits from Dog", "They share static data"], 1),
  p("cp-poly", "polymorphism", 3, "speak() is NOT virtual. What does this print?", `Animal* a = new Dog();\ncout << a->speak();  // Animal::speak returns "...", Dog::speak returns "Woof"`, ["Woof", "...", "Compile error", "Undefined"], 1),
  m("cp-tmpl", "templates", 3, "When is code generated for template<typename T> functions?", ["At runtime", "When instantiated with a concrete type at compile time", "When the program starts", "Never"], 1),
  p("cp-stl", "stl", 3, "What does this print?", `vector<int> v = {5, 2, 8};\nsort(v.begin(), v.end());\nv.push_back(1);\ncout << v[0] << v.back();`, ["28", "21", "12", "51"], 1),
  m("cp-mem", "memory-management", 3, "Memory allocated with new int[10] must be freed with…", ["delete", "delete[]", "free()", "Nothing — automatic"], 1),
  m("cp-exc", "exception-handling", 3, "How should exceptions be caught in C++?", ["By value", "By const reference", "By pointer", "With error codes"], 1),
  m("cp-adv", "advanced-cpp", 3, "Why can't a unique_ptr be copied?", ["A bug in the STL", "Copying would create two sole owners of one object", "Performance reasons", "It can be copied"], 1),
  c("cp-code1", ["functions", "loops", "conditionals"], 2,
    "Write a function int sumOdds(int n) that returns the sum of all odd numbers from 1 to n. main() should print sumOdds(7) (expected: 16).",
    `#include <iostream>\nusing namespace std;\n\n// your function here\n\nint main() {\n    // call and print\n    return 0;\n}`),
  c("cp-code2", ["classes", "constructors", "references"], 3,
    "Write a class Counter with a private int, a constructor taking the start value, an increment() method, and a get() const method. In main, create one at 10, increment twice, print 12.",
    `#include <iostream>\nusing namespace std;\n\n// your class here\n\nint main() {\n    // use it\n    return 0;\n}`),
];

/* ── HTML ──────────────────────────────────────────────────────────── */

const html: BankQuestion[] = [
  m("ht-doc1", "document-structure", 1, "Where does the <title> element belong?", ["<body>", "<head>", "Directly in <html>", "Anywhere"], 1),
  m("ht-doc2", "document-structure", 1, "How many <h1> elements should a page have?", ["As many as needed", "One", "One per section", "Zero"], 1),
  m("ht-sem1", "semantic-elements", 2, "Which element marks the page's primary content (exactly one per page)?", ["<content>", "<main>", "<section>", "<body>"], 1),
  m("ht-sem2", "semantic-elements", 2, "The test for using <article> is…", ["It contains text", "The content makes sense standing alone (post, card, comment)", "It's longer than a paragraph", "It has a heading"], 1),
  m("ht-form1", "forms", 1, "A form input has no name attribute. What happens on submit?", ["Validation error", "Its value is not sent to the server", "It sends as 'unnamed'", "The form won't submit"], 1),
  m("ht-form2", "forms", 2, "Which method should a login form use, and why?", ["GET — simpler", "POST — credentials stay out of URLs, history, and logs", "PUT — it updates state", "Either, no difference"], 1),
  m("ht-form3", "forms", 2, "How do radio buttons become one exclusive group?", ["Same id", "Same name attribute", "Same value", "Wrapped in one div"], 1),
  m("ht-tbl1", "tables", 1, "Which element is a table header cell?", ["<td>", "<th>", "<header>", "<thead> directly"], 1),
  m("ht-tbl2", "tables", 2, "What does scope=\"row\" on a <th> communicate?", ["The cell spans the row", "This header describes the cells in its row (for assistive tech)", "Style the whole row", "Nothing — invalid"], 1),
  m("ht-med1", "media", 1, "What happens when an image has no alt attribute?", ["Nothing changes", "Screen readers fall back to reading the filename", "The image won't load", "Browsers add alt automatically"], 1),
  m("ht-med2", "media", 2, "Why list multiple <source> elements inside <video>?", ["Faster playback", "The browser plays the first format it supports", "Required by HTML5", "For subtitles"], 1),
  m("ht-acc1", "accessibility", 2, "The single biggest accessibility lever is…", ["Adding ARIA everywhere", "Using semantically correct native HTML elements", "Bigger fonts", "More JavaScript"], 1),
  m("ht-acc2", "accessibility", 3, "Why is a <div onclick> 'button' an accessibility failure?", ["It's slower", "No keyboard focus, no role announcement, no Enter/Space activation", "It can't be styled", "It is fine"], 1),
  m("ht-seo1", "seo", 2, "Where does the text in search-result snippets usually come from?", ["The first paragraph always", "The meta description", "alt text", "Hidden keywords"], 1),
  m("ht-seo2", "seo", 3, "What does rel=\"canonical\" solve?", ["Page speed", "Duplicate URLs competing — it names the authoritative version", "Mobile rendering", "Security"], 1),
  m("ht-api1", "html5-apis", 2, "localStorage vs sessionStorage?", ["Identical", "localStorage persists across visits; sessionStorage dies with the tab", "sessionStorage is larger", "localStorage is per-page"], 1),
  m("ht-api2", "html5-apis", 3, "How does JavaScript read data-user-id=\"7\" from an element?", ["el.data('user-id')", "el.dataset.userId", "el.userid", "el.attributes.data"], 1),
  c("ht-code1", ["forms", "accessibility"], 2,
    "Write an accessible signup form fragment: an email input and a password input, EACH with a properly associated <label>, plus a submit button. Use correct input types.",
    `<form action="/signup" method="post">\n    <!-- your fields here -->\n</form>`),
];

/* ── CSS ───────────────────────────────────────────────────────────── */

const css: BankQuestion[] = [
  m("cs-sel1", "selectors", 1, "Which selector targets elements with class=\"alert\"?", ["alert", "#alert", ".alert", "*alert"], 2),
  m("cs-sel2", "selectors", 2, "Which wins: #hero or .big.bold.title.banner?", ["The four classes", "#hero — one id outranks any number of classes", "Tie — last one wins", "Neither"], 1),
  m("cs-col1", "colors", 1, "In hsl(200 80% 50%), what is 200?", ["Saturation", "The hue angle", "Lightness", "Alpha"], 1),
  m("cs-col2", "colors", 2, "Why does text contrast matter?", ["Aesthetics only", "Low contrast is unreadable for many users and fails WCAG (4.5:1 for body text)", "Print fidelity", "It doesn't"], 1),
  m("cs-typ1", "typography", 1, "A good body-text line-height is…", ["1.0", "Around 1.5–1.7, unitless", "3.0", "Always 16px"], 1),
  m("cs-typ2", "typography", 2, "1rem equals…", ["Always 16px", "The root element's font size", "The parent's font size", "1% of viewport"], 1),
  p("cs-box1", "box-model", 2, "Default box-sizing. An element has width: 200px, padding: 20px, border: 5px solid. Its visible width is…", `.box {\n    width: 200px;\n    padding: 20px;\n    border: 5px solid;\n}`, ["200px", "240px", "250px", "225px"], 2),
  m("cs-box2", "box-model", 1, "Which layer is INSIDE the border?", ["Margin", "Padding", "Outline", "Gap"], 1),
  m("cs-pos1", "positioning", 2, "position: absolute positions the element relative to…", ["The page always", "The nearest ancestor with a position set", "Its direct parent always", "The viewport always"], 1),
  m("cs-pos2", "positioning", 3, "A sticky element isn't sticking. The most likely cause is…", ["Wrong z-index", "No top/bottom offset (or an overflow-hidden ancestor)", "Too much padding", "Missing !important"], 1),
  p("cs-flex1", "flexbox", 2, "What layout does this create?", `.nav {\n    display: flex;\n    justify-content: space-between;\n    align-items: center;\n}`, ["Items stacked vertically", "Items pushed to opposite ends, vertically centered", "A 2-column grid", "Centered column"], 1),
  m("cs-flex2", "flexbox", 2, "flex: 1 on an item expands to…", ["grow 1 only", "grow 1, shrink 1, basis 0 — equal sharing", "width: 100%", "grow 1, shrink 0, basis auto"], 1),
  m("cs-grid1", "grid", 2, "grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)) gives you…", ["Fixed 220px columns", "As many ≥220px equal columns as fit — responsive without media queries", "Exactly 4 columns", "An error"], 1),
  m("cs-grid2", "grid", 3, "grid-column: 1 / -1 places an item…", ["In the first column", "Across the full width — first line to last", "In reverse", "Outside the grid"], 1),
  m("cs-resp1", "responsive", 2, "Mobile-first CSS means…", ["Designing only for phones", "Base styles for small screens; min-width queries enhance upward", "Using max-width queries", "A separate mobile site"], 1),
  m("cs-resp2", "responsive", 3, "clamp(1rem, 2.5vw, 2rem) produces…", ["Always 2.5vw", "A fluid value never below 1rem nor above 2rem", "Exactly 1.5rem", "A breakpoint"], 1),
  m("cs-tran1", "transitions", 2, "Which property pair animates cheapest (GPU-composited)?", ["width & height", "transform & opacity", "top & left", "margin & padding"], 1),
  m("cs-anim1", "animations", 3, "Transitions vs keyframe animations?", ["Identical", "Transitions need a property change to trigger; animations run timelines on their own", "Animations are hover-only", "Transitions can loop"], 1),
  m("cs-modern1", "modern-layout", 3, "Where are global design tokens (custom properties) conventionally declared?", ["body", ":root", "@theme only", "Every selector"], 1),
  m("cs-adv1", "advanced-css", 3, "A dropdown has z-index 99999 but renders under a header with z-index 2. Why?", ["Browser bug", "The dropdown is trapped in an ancestor's stacking context that ranks below the header", "Needs 100000", "Headers always win"], 1),
  c("cs-code1", ["flexbox", "box-model"], 2,
    "Write CSS for a .navbar that lays out its children in a row with the first item pushed left and the rest right, vertically centered, 16px gaps, and 12px vertical / 24px horizontal padding. Use flexbox.",
    `.navbar {\n    /* your css here */\n}\n.navbar .brand {\n    /* hint: auto margin */\n}`),
];

export const ASSESSMENT_BANKS: Record<string, BankQuestion[]> = { python, cpp, html, css };

/** Served (client-safe) question shape — answers stripped. */
export function serveBank(slug: string) {
  const bank = ASSESSMENT_BANKS[slug] || [];
  return bank.map(({ answer, ...rest }) => rest);
}

export function getBank(slug: string): BankQuestion[] {
  return ASSESSMENT_BANKS[slug] || [];
}

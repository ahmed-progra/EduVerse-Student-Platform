import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clean existing data (order matters for foreign keys)
  await prisma.coursePlacement.deleteMany();
  await prisma.userInventory.deleteMany();
  await prisma.userSkill.deleteMany();
  await prisma.userProgress.deleteMany();
  await prisma.xpLog.deleteMany();
  await prisma.battleSubmission.deleteMany();
  await prisma.battle.deleteMany();
  await prisma.leaderboardEntry.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.course.deleteMany();
  await prisma.shopItem.deleteMany();
  await prisma.skillTreeNode.deleteMany();

  // ==================== COURSES & LESSONS ====================
  const courses = [
    {
      title: "Python",
      slug: "python",
      description: "Master Python from basics to advanced. Learn variables, loops, functions, OOP, and more.",
      icon: "🐍",
      order: 1,
      lessons: generatePythonLessons(),
    },
    {
      title: "HTML",
      slug: "html",
      description: "Build the structure of the web. Learn tags, forms, semantic HTML, and best practices.",
      icon: "🌐",
      order: 2,
      lessons: generateHtmlLessons(),
    },
    {
      title: "CSS",
      slug: "css",
      description: "Style the web with CSS. Master layouts, animations, responsive design, and more.",
      icon: "🎨",
      order: 3,
      lessons: generateCssLessons(),
    },
    {
      title: "C++",
      slug: "cpp",
      description: "Learn C++ from scratch. Master pointers, OOP, STL, and memory management.",
      icon: "⚡",
      order: 4,
      lessons: generateCppLessons(),
    },
  ];

  for (const course of courses) {
    const { lessons, ...courseData } = course;
    const created = await prisma.course.create({
      data: courseData,
    });
    console.log(`  Created course: ${created.title}`);

    for (const lesson of lessons) {
      await prisma.lesson.create({
        data: { ...lesson, courseId: created.id },
      });
    }
    console.log(`  Added ${lessons.length} lessons`);
  }

  // ==================== TEST USERS ====================
  const passwordHash = await bcrypt.hash("password123", 10);

  await prisma.user.upsert({
    where: { email: "alice@example.com" },
    update: {},
    create: { email: "alice@example.com", username: "alice", passwordHash, xp: 0, level: 1 },
  });

  await prisma.user.upsert({
    where: { email: "bob@example.com" },
    update: {},
    create: { email: "bob@example.com", username: "bob", passwordHash, xp: 0, level: 1 },
  });

  console.log("  Created 2 test users (alice, bob)");

  // ==================== SKILL TREE NODES ====================
  const createdNodes: Record<string, string> = {};

  const skillNodesData = [
    // Python Mastery Branch
    {
      name: "Python Basics",
      description: "Unlock +10% XP from Python lessons",
      branch: "python_mastery",
      positionX: 1,
      positionY: 1,
      prerequisites: "[]",
      xpCost: 200,
      levelRequired: 2,
      effectType: "xp_boost",
      effectValue: 0.1,
      effectDesc: "+10% XP from Python lessons",
    },
    {
      name: "Loop Master",
      description: "Unlock +15% XP from Python lessons",
      branch: "python_mastery",
      positionX: 2,
      positionY: 1,
      prerequisites: "Python Basics",
      xpCost: 500,
      levelRequired: 5,
      effectType: "xp_boost",
      effectValue: 0.15,
      effectDesc: "+15% XP from Python lessons",
    },
    {
      name: "Python Guru",
      description: "Unlock +25% XP from Python lessons",
      branch: "python_mastery",
      positionX: 3,
      positionY: 1,
      prerequisites: "Loop Master",
      xpCost: 1000,
      levelRequired: 10,
      effectType: "xp_boost",
      effectValue: 0.25,
      effectDesc: "+25% XP from Python lessons",
    },

    // Frontend Mastery Branch
    {
      name: "HTML Fundamentals",
      description: "+10% XP from HTML/CSS lessons",
      branch: "frontend_mastery",
      positionX: 1,
      positionY: 2,
      prerequisites: "[]",
      xpCost: 200,
      levelRequired: 2,
      effectType: "xp_boost",
      effectValue: 0.1,
      effectDesc: "+10% XP from HTML/CSS lessons",
    },
    {
      name: "CSS Artist",
      description: "+15% XP from CSS lessons",
      branch: "frontend_mastery",
      positionX: 2,
      positionY: 2,
      prerequisites: "HTML Fundamentals",
      xpCost: 500,
      levelRequired: 5,
      effectType: "xp_boost",
      effectValue: 0.15,
      effectDesc: "+15% XP from CSS lessons",
    },
    {
      name: "Frontend Architect",
      description: "+25% XP from frontend lessons",
      branch: "frontend_mastery",
      positionX: 3,
      positionY: 2,
      prerequisites: "CSS Artist",
      xpCost: 1000,
      levelRequired: 10,
      effectType: "xp_boost",
      effectValue: 0.25,
      effectDesc: "+25% XP from frontend lessons",
    },

    // Algorithms Branch
    {
      name: "Sorting Basics",
      description: "+10 battle damage (score boost)",
      branch: "algorithms",
      positionX: 1,
      positionY: 3,
      prerequisites: "[]",
      xpCost: 300,
      levelRequired: 3,
      effectType: "damage_boost",
      effectValue: 10,
      effectDesc: "+10 battle score bonus",
    },
    {
      name: "Search Algorithms",
      description: "+20 battle damage (score boost)",
      branch: "algorithms",
      positionX: 2,
      positionY: 3,
      prerequisites: "Sorting Basics",
      xpCost: 600,
      levelRequired: 6,
      effectType: "damage_boost",
      effectValue: 20,
      effectDesc: "+20 battle score bonus",
    },
    {
      name: "Algorithm Master",
      description: "+50 battle damage (score boost)",
      branch: "algorithms",
      positionX: 3,
      positionY: 3,
      prerequisites: "Search Algorithms",
      xpCost: 1200,
      levelRequired: 12,
      effectType: "damage_boost",
      effectValue: 50,
      effectDesc: "+50 battle score bonus",
    },

    // Debugging Branch
    {
      name: "Bug Hunter",
      description: "Unlock medium-difficulty challenges",
      branch: "debugging",
      positionX: 1,
      positionY: 4,
      prerequisites: "[]",
      xpCost: 200,
      levelRequired: 2,
      effectType: "unlock_challenge",
      effectValue: 1,
      effectDesc: "Unlock medium challenges",
    },
    {
      name: "Code Detective",
      description: "+5% XP from all sources",
      branch: "debugging",
      positionX: 2,
      positionY: 4,
      prerequisites: "Bug Hunter",
      xpCost: 500,
      levelRequired: 5,
      effectType: "xp_boost",
      effectValue: 0.05,
      effectDesc: "+5% XP from all sources",
    },
  ];

  for (const node of skillNodesData) {
    let prereqIds: string[] = [];
    if (node.prerequisites !== "[]") {
      const parentId = createdNodes[node.prerequisites];
      if (parentId) {
        prereqIds = [parentId];
      }
    }
    const created = await prisma.skillTreeNode.create({
      data: {
        ...node,
        prerequisites: JSON.stringify(prereqIds),
      },
    });
    createdNodes[node.name] = created.id;
  }
  console.log(`  Created ${skillNodesData.length} skill tree nodes`);

  // ==================== SHOP ITEMS ====================
  const shopItems = [
    // Avatars
    { name: "Wizard Avatar", type: "avatar", description: "A mystical wizard persona", price: 500, levelRequired: 2, imageUrl: "/avatars/wizard.png" },
    { name: "Knight Avatar", type: "avatar", description: "Brave knight in shining armor", price: 500, levelRequired: 2, imageUrl: "/avatars/knight.png" },
    { name: "Cyborg Avatar", type: "avatar", description: "Half-human, half-machine", price: 800, levelRequired: 4, imageUrl: "/avatars/cyborg.png" },
    { name: "Ninja Avatar", type: "avatar", description: "Stealthy ninja warrior", price: 800, levelRequired: 4, imageUrl: "/avatars/ninja.png" },
    { name: "Mage Avatar", type: "avatar", description: "Powerful mage with arcane powers", price: 1200, levelRequired: 7, imageUrl: "/avatars/mage.png" },

    // Frames
    { name: "Gold Frame", type: "frame", description: "Shiny golden profile frame", price: 300, levelRequired: 1, imageUrl: "/frames/gold.png" },
    { name: "Ruby Frame", type: "frame", description: "Deep red ruby-encrusted frame", price: 600, levelRequired: 3, imageUrl: "/frames/ruby.png" },
    { name: "Obsidian Frame", type: "frame", description: "Dark obsidian crystal frame", price: 600, levelRequired: 3, imageUrl: "/frames/obsidian.png" },
    { name: "Crystal Frame", type: "frame", description: "Ethereal crystal clear frame", price: 1000, levelRequired: 6, imageUrl: "/frames/crystal.png" },
    { name: "Void Frame", type: "frame", description: "Mysterious void-themed frame", price: 1500, levelRequired: 10, imageUrl: "/frames/void.png" },

    // Animations
    { name: "Level-Up Burst", type: "animation", description: "Explosive level-up animation", price: 400, levelRequired: 2, imageUrl: "/animations/levelup.png" },
    { name: "Lightning Strike", type: "animation", description: "Electric lightning effect", price: 700, levelRequired: 4, imageUrl: "/animations/lightning.png" },
    { name: "Aura Glow", type: "animation", description: "Soft glowing aura around profile", price: 1000, levelRequired: 6, imageUrl: "/animations/aura.png" },

    // Titles
    { name: "Code Master", type: "title", description: "Title: Code Master", price: 2000, levelRequired: 15, imageUrl: "/titles/code-master.png" },
    { name: "Bug Hunter", type: "title", description: "Title: Bug Hunter", price: 1500, levelRequired: 10, imageUrl: "/titles/bug-hunter.png" },
    { name: "Algorithm King", type: "title", description: "Title: Algorithm King", price: 2500, levelRequired: 18, imageUrl: "/titles/algorithm-king.png" },

    // Editor Themes
    { name: "Matrix Theme", type: "theme", description: "Green-on-black Matrix editor theme", price: 800, levelRequired: 5, imageUrl: "/themes/matrix.png" },
    { name: "Sunset Theme", type: "theme", description: "Warm sunset-colored editor theme", price: 800, levelRequired: 5, imageUrl: "/themes/sunset.png" },

    // Effects
    { name: "Particle Trail", type: "effect", description: "Particles follow your cursor", price: 600, levelRequired: 3, imageUrl: "/effects/particles.png" },
    { name: "Neon Glow", type: "effect", description: "Neon glow effect on profile", price: 900, levelRequired: 5, imageUrl: "/effects/neon.png" },
  ];

  for (const item of shopItems) {
    await prisma.shopItem.create({ data: item });
  }
  console.log(`  Created ${shopItems.length} shop items`);

  console.log("Seeding complete!");
}

function generatePythonLessons() {
  const titles = [
    "Hello, Python!", "Variables & Data Types", "Numbers & Math", "Strings", "String Methods",
    "Lists", "List Operations", "Tuples & Sets", "Dictionaries", "If Statements",
    "Boolean Logic", "For Loops", "While Loops", "Loop Control", "Functions",
    "Function Arguments", "Lambda Functions", "Scope & Namespace", "Modules & Imports", "File I/O",
    "Error Handling", "Custom Exceptions", "Classes & Objects", "Inheritance", "Polymorphism",
    "Magic Methods", "Decorators", "Generators", "List Comprehensions", "Working with APIs",
  ];
  const templates = [
    `print("Hello, World!")`,
    `name = "Alice"\nage = 25\nprint(f"My name is {name} and I am {age}")`,
    `a = 10\nb = 3\nprint(f"Sum: {a+b}, Product: {a*b}")`,
    `text = "Python"\nprint(text[0])\nprint(text[-1])`,
    `text = "  hello world  "\nprint(text.strip().upper())`,
    `fruits = ["apple", "banana", "cherry"]\nprint(fruits[0])`,
    `nums = [1, 2, 3]\nnums.append(4)\nprint(nums)`,
    `a = {1, 2, 3}\nb = {3, 4, 5}\nprint(a & b)`,
    `scores = {"Alice": 95, "Bob": 87}\nprint(scores["Alice"])`,
    `x = 10\nif x > 5:\n    print("Greater!")`,
    `age = 20\nif age >= 18:\n    print("Adult")\nelse:\n    print("Minor")`,
    `for i in range(5):\n    print(i)`,
    `count = 0\nwhile count < 3:\n    print(count)\n    count += 1`,
    `for i in range(10):\n    if i == 5:\n        break\n    print(i)`,
    `def greet(name):\n    return f"Hello, {name}!"\nprint(greet("Alice"))`,
    `def add(*args):\n    return sum(args)\nprint(add(1, 2, 3))`,
    `square = lambda x: x ** 2\nprint(square(5))`,
    `x = 10\ndef change():\n    global x\n    x = 5\nchange()\nprint(x)`,
    `import math\nprint(math.sqrt(16))`,
    `with open("test.txt", "w") as f:\n    f.write("Hello")`,
    `try:\n    x = 1 / 0\nexcept ZeroDivisionError:\n    print("Cannot divide by zero")`,
    `class NegativeError(Exception):\n    pass\n\nraise NegativeError("Negative!")`,
    `class Dog:\n    def __init__(self, name):\n        self.name = name\n\nd = Dog("Rex")\nprint(d.name)`,
    `class Animal:\n    def speak(self):\n        pass\n\nclass Cat(Animal):\n    def speak(self):\n        return "Meow"`,
    `class Shape:\n    def area(self):\n        pass\n\nclass Circle(Shape):\n    def __init__(self, r):\n        self.r = r\n    def area(self):\n        return 3.14 * self.r ** 2`,
    `class Point:\n    def __init__(self, x, y):\n        self.x = x\n        self.y = y\n    def __str__(self):\n        return f"({self.x}, {self.y})"`,
    `def timer(f):\n    def wrapper():\n        import time\n        start = time.time()\n        f()\n        print(time.time() - start)\n    return wrapper`,
    `def countdown(n):\n    while n > 0:\n        yield n\n        n -= 1\n\nfor x in countdown(5):\n    print(x)`,
    `squares = [x**2 for x in range(10) if x % 2 == 0]\nprint(squares)`,
    `import requests\nresponse = requests.get("https://api.github.com")\nprint(response.status_code)`,
  ];

  return titles.map((title, i) => ({
    title,
    content: generateLessonContent("python", title, i + 1),
    codeTemplate: templates[i] || `print("Lesson ${i + 1}")`,
    language: "python",
    order: i + 1,
    xpReward: 50 + i * 5,
  }));
}

function generateHtmlLessons() {
  const titles = [
    "Your First HTML Page", "Headings & Paragraphs", "Text Formatting", "Links & Anchors", "Images",
    "Lists", "Tables", "Forms", "Input Types", "Buttons",
    "Div & Span", "Semantic HTML", "HTML5 Structure", "Iframes", "Audio & Video",
    "Meta Tags", "Comments", "Entities & Symbols", "Emojis in HTML", "Data Attributes",
    "Fieldset & Legend", "Select & Options", "Textarea", "Checkboxes & Radios", "File Uploads",
    "Progress & Meter", "Details & Summary", "Datalist", "Output Element", "Complete HTML Project",
  ];
  const templates = [
    `<!DOCTYPE html>\n<html>\n<head>\n    <title>My Page</title>\n</head>\n<body>\n    <h1>Hello World!</h1>\n</body>\n</html>`,
    `<h1>Main Title</h1>\n<h2>Subtitle</h2>\n<p>This is a paragraph.</p>`,
    `<p><b>Bold</b>, <i>italic</i>, <u>underline</u></p>`,
    `<a href="https://example.com">Visit Example</a>`,
    `<img src="image.jpg" alt="Description" width="200">`,
    `<ul>\n    <li>Item 1</li>\n    <li>Item 2</li>\n</ul>`,
    `<table>\n    <tr><th>Name</th><th>Age</th></tr>\n    <tr><td>Alice</td><td>25</td></tr>\n</table>`,
    `<form>\n    <input type="text" name="name">\n    <button type="submit">Submit</button>\n</form>`,
    `<input type="email" placeholder="Enter email">\n<input type="password" placeholder="Password">`,
    `<button onclick="alert('Clicked!')">Click Me</button>`,
    `<div style="background:lightblue">\n    <span style="color:red">Red text</span>\n</div>`,
    `<header>\n    <nav>Navigation</nav>\n</header>\n<main>Content</main>\n<footer>Footer</footer>`,
    `<article>\n    <section>\n        <h2>Section Title</h2>\n        <p>Section content</p>\n    </section>\n</article>`,
    `<iframe src="https://example.com" width="400" height="300"></iframe>`,
    `<video controls>\n    <source src="video.mp4" type="video/mp4">\n</video>`,
    `<meta charset="UTF-8">\n<meta name="description" content="My page">\n<meta name="viewport" content="width=device-width">`,
  ];

  return titles.map((title, i) => ({
    title,
    content: generateLessonContent("html", title, i + 1),
    codeTemplate: templates[i % templates.length] || `<!-- ${title} -->\n<p>Lesson ${i + 1}</p>`,
    language: "html",
    order: i + 1,
    xpReward: 50 + i * 5,
  }));
}

function generateCssLessons() {
  const titles = [
    "Intro to CSS", "Selectors", "Colors & Backgrounds", "Typography", "Box Model",
    "Margins & Padding", "Borders", "Width & Height", "Display Property", "Positioning",
    "Flexbox Basics", "Flexbox Alignment", "Flexbox Layouts", "CSS Grid", "Grid Areas",
    "Media Queries", "Responsive Design", "Transitions", "Transformations", "Animations",
    "Keyframes", "Pseudo-classes", "Pseudo-elements", "Variables (Custom Props)", "Gradients",
    "Shadows", "Filters", "Z-index & Stacking", "CSS Specificity", "Complete CSS Project",
  ];
  const templates = [
    `body {\n    font-family: Arial, sans-serif;\n    background: #f0f0f0;\n}`,
    `h1 { color: blue; }\n.special { font-weight: bold; }\n#unique { font-size: 24px; }`,
    `body {\n    background: linear-gradient(45deg, #ff6b6b, #4ecdc4);\n    color: white;\n}`,
    `p {\n    font-family: 'Georgia', serif;\n    font-size: 18px;\n    line-height: 1.6;\n}`,
    `div {\n    width: 200px;\n    height: 100px;\n    padding: 20px;\n    border: 2px solid black;\n    margin: 10px;\n}`,
    `h1 { margin: 20px 0; }\np { padding: 15px; }`,
    `.card {\n    border: 1px solid #ddd;\n    border-radius: 8px;\n    box-shadow: 2px 2px 10px rgba(0,0,0,0.1);\n}`,
    `.container { width: 100%; max-width: 1200px; height: auto; }`,
    `.hidden { display: none; }\n.inline { display: inline; }\n.block { display: block; }`,
    `.relative { position: relative; top: 10px; }\n.absolute { position: absolute; top: 0; }`,
    `.flex-container {\n    display: flex;\n    gap: 10px;\n}`,
    `.center {\n    display: flex;\n    justify-content: center;\n    align-items: center;\n    height: 100vh;\n}`,
    `.navbar {\n    display: flex;\n    justify-content: space-between;\n    align-items: center;\n}`,
    `.grid {\n    display: grid;\n    grid-template-columns: 1fr 1fr 1fr;\n    gap: 20px;\n}`,
    `.layout {\n    display: grid;\n    grid-template-areas:\n        "header header"\n        "sidebar main"\n        "footer footer";\n}`,
  ];

  return titles.map((title, i) => ({
    title,
    content: generateLessonContent("css", title, i + 1),
    codeTemplate: templates[i % templates.length] || `/* ${title} */\n.element {\n    /* styles */\n}`,
    language: "css",
    order: i + 1,
    xpReward: 50 + i * 5,
  }));
}

function generateCppLessons() {
  const titles = [
    "Hello C++", "Variables & Types", "Constants & Literals", "Input & Output", "Arithmetic Operators",
    "If Statements", "Switch Cases", "For Loops", "While Loops", "Arrays",
    "Multidimensional Arrays", "Strings", "String Methods", "Functions", "Function Overloading",
    "References & Pointers", "Dynamic Memory", "Structs", "Classes", "Constructors & Destructors",
    "Inheritance", "Polymorphism", "Virtual Functions", "Templates", "Vectors",
    "Iterators", "File Handling", "Exception Handling", "STL Algorithms", "Final C++ Project",
  ];
  const templates = [
    `#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello C++!" << endl;\n    return 0;\n}`,
    `int age = 25;\ndouble price = 19.99;\nchar grade = 'A';\nbool isReady = true;`,
    `const double PI = 3.14159;\nconst int MAX_USERS = 100;`,
    `int x;\ncout << "Enter a number: ";\ncin >> x;\ncout << "You entered: " << x;`,
    `int a = 10, b = 3;\ncout << a + b << " " << a * b << " " << a / b;`,
    `if (score >= 90) {\n    cout << "A";\n} else if (score >= 80) {\n    cout << "B";\n}`,
    `switch(day) {\n    case 1: cout << "Monday"; break;\n    case 2: cout << "Tuesday"; break;\n    default: cout << "Other";\n}`,
    `for (int i = 0; i < 5; i++) {\n    cout << i << " ";\n}`,
    `int i = 0;\nwhile (i < 5) {\n    cout << i;\n    i++;\n}`,
    `int nums[5] = {1, 2, 3, 4, 5};\ncout << nums[0];`,
    `int matrix[2][3] = {{1,2,3}, {4,5,6}};\ncout << matrix[0][1];`,
    `string name = "Alice";\ncout << "Hello " << name;`,
    `string s = "Hello";\ncout << s.length() << " " << s.substr(0, 2);`,
    `int add(int a, int b) {\n    return a + b;\n}\ncout << add(3, 4);`,
    `int area(int w, int h) { return w * h; }\ndouble area(double r) { return 3.14 * r * r; }`,
    `int x = 10;\nint& ref = x;\nref = 20;\ncout << x;`,
    `int* p = new int(42);\ncout << *p;\ndelete p;`,
    `struct Point {\n    int x, y;\n};\nPoint p = {10, 20};`,
    `class Dog {\npublic:\n    string name;\n    void bark() { cout << "Woof!"; }\n};`,
    `class Rectangle {\npublic:\n    Rectangle(int w, int h) : width(w), height(h) {}\n    int area() { return width * height; }\nprivate:\n    int width, height;\n};`,
  ];

  return titles.map((title, i) => ({
    title,
    content: generateLessonContent("cpp", title, i + 1),
    codeTemplate: templates[i % templates.length] || `// ${title}\n#include <iostream>\nusing namespace std;\n\nint main() {\n    // Your code here\n    return 0;\n}`,
    language: "cpp",
    order: i + 1,
    xpReward: 50 + i * 5,
  }));
}

/* ====================================================================
   RICH LESSON CONTENT GENERATOR
   Each lesson gets: intro, concepts, examples, exercise, pitfalls, takeaways
   ==================================================================== */

function esc(t: string): string {
  return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function codeBlock(code: string, lang = ""): string {
  return `<pre class="lesson-code"><code>${esc(code)}</code></pre>`;
}

function outputBlock(text: string): string {
  return `<div class="lesson-output"><strong>Output:</strong> ${esc(text)}</div>`;
}

/* ── Python lesson content map ── */

function pyCode(s: TemplateStringsArray, ...args: any[]): string {
  // Build the code string from template literals, escaping any $ that
  // appears before { so that Python f-string interpolation is preserved.
  let r = "";
  for (let i = 0; i < s.length; i++) {
    r += s[i];
    if (i < args.length) r += String(args[i]);
  }
  return r.replace(/\$\{/g, "\\x24{");
}

const pythonContent: Record<number, { intro: string; concepts: string; examples: string; exercise: string; pitfalls: string; takeaways: string }> = {
  1: {
    intro: `<p>Every programming journey starts with a single line of code. In Python, the simplest way to output text is with the <code>print()</code> function. Think of it as Python's way of talking back to you — whatever you put inside the parentheses gets displayed on the screen.</p>`,
    concepts: `<li><strong>The print() function</strong> — displays text or values to the console</li><li><strong>Strings</strong> — text surrounded by quotes (<code>"Hello"</code> or <code>'World'</code>)</li><li><strong>Running Python code</strong> — the computer executes your instructions line by line</li>`,
    examples: `<p><strong>Example 1: Basic greeting</strong></p>${codeBlock('print("Hello, World!")')}${outputBlock('Hello, World!')}<p><strong>Example 2: Multiple values</strong></p>${codeBlock('print("Hello", "Python", 2025)')}${outputBlock('Hello Python 2025')}`,
    exercise: `<p>Modify the code to print your own name and favorite programming language. Try it: <code>print("My name is ...")</code></p>`,
    pitfalls: `<li>Forgetting quotes around text — <code>print(hello)</code> will error because Python thinks <code>hello</code> is a variable name</li><li>Mixing quote types like <code>"it\'s"</code> — use <code>"it\\'s"</code> or double quotes outside</li>`,
    takeaways: `<li><code>print()</code> is your best friend for seeing what your code does</li><li>Strings must be wrapped in quotes</li><li>Python runs top-to-bottom</li>`,
  },
  2: {
    intro: `<p>Variables are like labeled boxes where you store data. Python is dynamically typed, meaning you don't have to declare what type a variable holds — just assign a value and Python figures it out. This lesson covers the basic data types: strings, integers, floats, and booleans.</p>`,
    concepts: `<li><strong>Variables</strong> — named containers for values (<code>name = "Alice"</code>)</li><li><strong>Data types</strong> — <code>int</code> (whole numbers), <code>float</code> (decimals), <code>str</code> (text), <code>bool</code> (True/False)</li><li><strong>Type checking</strong> — use <code>type()</code> to see what type a variable is</li>`,
    examples: `<p><strong>Example 1: Creating variables</strong></p>${codeBlock('name = "Alice"\nage = 25\nheight = 1.68\nis_student = True\nprint(name, age, height, is_student)')}${outputBlock('Alice 25 1.68 True')}<p><strong>Example 2: Type checking</strong></p>${codeBlock('print(type("Hello"))\nprint(type(42))\nprint(type(3.14))\nprint(type(False))')}${outputBlock("<class 'str'>\n<class 'int'>\n<class 'float'>\n<class 'bool'>")}`,
    exercise: `<p>Create variables for your name, birth year, and a hobby. Print them all in one sentence using f-strings: <code>print(f"My name is {name}")</code></p>`,
    pitfalls: `<li>Using undefined variables — Python will throw <code>NameError</code></li><li>Mixing types without conversion — <code>"Age: " + 25</code> errors; use <code>f"Age: {25}"</code></li>`,
    takeaways: `<li>Variables store data for later use</li><li>Python infers types automatically</li><li>Use <code>f"{variable}"</code> to embed variables in strings</li>`,
  },
  3: {
    intro: `<p>Python can do math right out of the box. The basic arithmetic operators work like a calculator, but Python also includes some powerful built-in functions and a <code>math</code> module for advanced operations.</p>`,
    concepts: `<li><strong>Arithmetic operators</strong> — <code>+</code> (add), <code>-</code> (subtract), <code>*</code> (multiply), <code>/</code> (divide), <code>//</code> (floor divide), <code>%</code> (modulo), <code>**</code> (exponent)</li><li><strong>Operator precedence</strong> — PEMDAS (Parentheses, Exponents, Multiply/Divide, Add/Subtract)</li><li><strong>Built-in math functions</strong> — <code>abs()</code>, <code>round()</code>, <code>pow()</code>, <code>max()</code>, <code>min()</code></li>`,
    examples: `<p><strong>Example 1: Basic arithmetic</strong></p>${codeBlock('a = 15\nb = 4\nprint(f"Sum: {a+b}")\nprint(f"Difference: {a-b}")\nprint(f"Product: {a*b}")\nprint(f"Quotient: {a/b}")\nprint(f"Floor division: {a//b}")\nprint(f"Remainder: {a%b}")\nprint(f"Power: {a**b}")')}${outputBlock('Sum: 19\nDifference: 11\nProduct: 60\nQuotient: 3.75\nFloor division: 3\nRemainder: 3\nPower: 50625')}<p><strong>Example 2: Real-world tip calculator</strong></p>${codeBlock('bill = 47.50\ntip_pct = 15\ntip = bill * tip_pct / 100\ntotal = bill + tip\nprint(f"Tip: ${tip}")\nprint(f"Total: ${total}")')}${outputBlock('Tip: 7.125\nTotal: 54.625')}`,
    exercise: `<p>Write a program that converts Celsius to Fahrenheit: <code>F = C * 9/5 + 32</code>. Try it with 0\u00b0C, 100\u00b0C, and your body temperature (37\u00b0C).</p>`,
    pitfalls: `<li>Integer division — <code>5 / 2</code> gives <code>2.5</code>, but <code>5 // 2</code> gives <code>2</code></li><li>Modulo with negative numbers — <code>-7 % 3</code> gives <code>2</code>, not <code>-1</code></li>`,
    takeaways: `<li>Python supports all standard math operations</li><li><code>//</code> gives integer division, <code>%</code> gives remainder</li><li>Use parentheses to control evaluation order</li>`,
  },
  4: {
    intro: `<p>Strings are sequences of characters — they're how Python handles text. You can access individual characters, slice out portions, and combine strings together. Understanding strings is essential because almost every program deals with text at some point.</p>`,
    concepts: `<li><strong>String indexing</strong> — characters at positions starting from <code>0</code></li><li><strong>Negative indexing</strong> — <code>-1</code> is the last character</li><li><strong>Slicing</strong> — extract parts with <code>[start:end:step]</code></li><li><strong>String concatenation</strong> — combine with <code>+</code> or f-strings</li>`,
    examples: `<p><strong>Example 1: Indexing and slicing</strong></p>${codeBlock('text = "Python"\nprint(f"First char: {text[0]}")\nprint(f"Last char: {text[-1]}")\nprint(f"First 3: {text[0:3]}")\nprint(f"Every other: {text[::2]}")\nprint(f"Reversed: {text[::-1]}")')}${outputBlock('First char: P\nLast char: n\nFirst 3: Pyt\nEvery other: Pto\nReversed: nohtyP')}<p><strong>Example 2: Concatenation</strong></p>${codeBlock('first = "John"\nlast = "Doe"\nfull = first + " " + last\nprint(full)\nprint(f"Hello, {full}!")')}${outputBlock('John Doe\nHello, John Doe!')}`,
    exercise: `<p>Take the string <code>"Hello, Python Programmer!"</code> and print: the first word, the last word, the string in reverse, and the string in uppercase.</p>`,
    pitfalls: `<li>Index out of range — <code>text[100]</code> raises <code>IndexError</code></li><li>Strings are immutable — <code>text[0] = "J"</code> will error</li>`,
    takeaways: `<li>String indexes start at 0</li><li>Use <code>[start:end]</code> to slice, <code>[::-1]</code> to reverse</li><li>f-strings are the cleanest way to combine text and variables</li>`,
  },
  5: {
    intro: `<p>Python strings come with a rich set of built-in methods that let you manipulate and analyze text. From changing case to stripping whitespace, these methods save you from writing lots of manual code.</p>`,
    concepts: `<li><strong>Case methods</strong> — <code>.upper()</code>, <code>.lower()</code>, <code>.title()</code>, <code>.swapcase()</code></li><li><strong>Whitespace methods</strong> — <code>.strip()</code>, <code>.lstrip()</code>, <code>.rstrip()</code></li><li><strong>Search methods</strong> — <code>.find()</code>, <code>.startswith()</code>, <code>.endswith()</code>, <code>.count()</code></li><li><strong>Split and join</strong> — <code>.split()</code> breaks into list, <code>" ".join()</code> combines</li>`,
    examples: `<p><strong>Example 1: Cleaning and transforming</strong></p>${codeBlock('text = "  hello world!  "\nprint(f"Original: \'{text}\'")\nprint(f"Strip: \'{text.strip()}\'")\nprint(f"Upper: {text.strip().upper()}")\nprint(f"Title: {text.strip().title()}")')}${outputBlock("Original: '  hello world!  '\nStrip: 'hello world!'\nUpper: HELLO WORLD!\nTitle: Hello World!")}<p><strong>Example 2: Splitting a sentence</strong></p>${codeBlock('sentence = "Python is awesome"\nwords = sentence.split()\nprint(words)\nprint(f"Word count: {len(words)}")\nrejoined = " | ".join(words)\nprint(rejoined)')}${outputBlock("['Python', 'is', 'awesome']\nWord count: 3\nPython | is | awesome")}`,
    exercise: `<p>Take the string <code>"  data-science-is-fun  "</code>. Strip it, split by hyphens, capitalize each word, and rejoin with spaces. Expected: <code>"Data Science Is Fun"</code></p>`,
    pitfalls: `<li>String methods return new strings — they don't modify the original (strings are immutable)</li><li><code>.find()</code> returns <code>-1</code> if not found, while <code>.index()</code> raises an error</li>`,
    takeaways: `<li>String methods don't change the original — they return a new string</li><li><code>.strip()</code> removes whitespace from both ends</li><li><code>.split()</code> and <code>.join()</code> are powerful for text processing</li>`,
  },
  6: {
    intro: `<p>Lists are ordered collections that can hold any type of data — numbers, strings, even other lists. They're one of Python's most versatile data structures and you'll use them constantly.</p>`,
    concepts: `<li><strong>Creating lists</strong> — square brackets: <code>[1, 2, 3]</code> or <code>list()</code> constructor</li><li><strong>Indexing and slicing</strong> — works the same as strings</li><li><strong>List methods</strong> — <code>.append()</code>, <code>.insert()</code>, <code>.remove()</code>, <code>.pop()</code>, <code>.sort()</code></li><li><strong>Checking membership</strong> — <code>in</code> and <code>not in</code></li>`,
    examples: `<p><strong>Example 1: Working with a shopping list</strong></p>${codeBlock('items = ["milk", "bread", "eggs"]\nprint(f"First item: {items[0]}")\nprint(f"Last item: {items[-1]}")\nitems.append("butter")\nprint(f"After append: {items}")\nitems.insert(1, "cheese")\nprint(f"After insert: {items}")\nremoved = items.pop()\nprint(f"Popped: {removed}, Remaining: {items}")')}${outputBlock("First item: milk\nLast item: eggs\nAfter append: ['milk', 'bread', 'eggs', 'butter']\nAfter insert: ['milk', 'cheese', 'bread', 'eggs', 'butter']\nPopped: butter, Remaining: ['milk', 'cheese', 'bread', 'eggs']")}<p><strong>Example 2: Mixed types and nested lists</strong></p>${codeBlock('mixed = [42, "hello", 3.14, True]\nprint(mixed)\nmatrix = [[1, 2], [3, 4], [5, 6]]\nprint(f"Row 2, col 1: {matrix[1][0]}")')}${outputBlock("[42, 'hello', 3.14, True]\nRow 2, col 1: 3")}`,
    exercise: `<p>Create a list of your 5 favorite foods. Add one more, remove the second item, sort alphabetically, and print the final list.</p>`,
    pitfalls: `<li>Using <code>remove()</code> on an item that doesn't exist — raises <code>ValueError</code></li><li>Modifying a list while iterating over it leads to bugs</li>`,
    takeaways: `<li>Lists are ordered, mutable, and can hold mixed types</li><li><code>.append()</code> adds to end, <code>.pop()</code> removes from end</li><li>Use indexing the same way as strings</li>`,
  },
};

/* ── Generic lesson content (used when no specific content exists) ── */

function genIntro(lang: string, title: string, num: number): string {
  return `<p>Welcome to Lesson ${num}. In this lesson, we dive into <strong>${title}</strong> — an important concept in ${lang.toUpperCase()} programming. Understanding this will help you write more effective and efficient code.</p>`;
}

function genConcepts(title: string): string {
  return `<li>Understand the core principles of <strong>${title}</strong></li><li>See practical examples that demonstrate how it works</li><li>Practice writing code that applies what you've learned</li>`;
}

function genExamples(title: string): string {
  return `<p>Use the code editor below to experiment with <strong>${title}</strong>. Try modifying the template code and run it to see what happens. The best way to learn is by doing!</p>`;
}

function genExercise(title: string): string {
  return `<p>Write your own code that demonstrates <strong>${title}</strong>. Start with the template provided, then try extending it with your own variations. See if you can break it and understand why.</p>`;
}

function genPitfalls(): string {
  return `<li>Always test your code with different inputs — edge cases often reveal bugs</li><li>Read error messages carefully — Python tells you exactly what went wrong and where</li>`;
}

function genTakeaways(title: string): string {
  return `<li><strong>${title}</strong> is a fundamental concept in programming</li><li>Practice is the best way to master it</li><li>Don't be afraid to experiment and make mistakes</li>`;
}

/* ── Python-specific content helper ── */

function getPythonContent(num: number, title: string): { intro: string; concepts: string; examples: string; exercise: string; pitfalls: string; takeaways: string } {
  if (pythonContent[num]) return pythonContent[num];
  return {
    intro: genIntro("Python", title, num),
    concepts: genConcepts(title),
    examples: genExamples(title),
    exercise: genExercise(title),
    pitfalls: genPitfalls(),
    takeaways: genTakeaways(title),
  };
}

/* ── HTML-specific content helper ── */

function getHtmlContent(num: number, title: string): { intro: string; concepts: string; examples: string; exercise: string; pitfalls: string; takeaways: string } {
  return {
    intro: genIntro("HTML", title, num),
    concepts: genConcepts(title),
    examples: genExamples(title),
    exercise: genExercise(title),
    pitfalls: genPitfalls(),
    takeaways: genTakeaways(title),
  };
}

/* ── CSS-specific content helper ── */

function getCssContent(num: number, title: string): { intro: string; concepts: string; examples: string; exercise: string; pitfalls: string; takeaways: string } {
  return {
    intro: genIntro("CSS", title, num),
    concepts: genConcepts(title),
    examples: genExamples(title),
    exercise: genExercise(title),
    pitfalls: genPitfalls(),
    takeaways: genTakeaways(title),
  };
}

/* ── C++-specific content helper ── */

function getCppContent(num: number, title: string): { intro: string; concepts: string; examples: string; exercise: string; pitfalls: string; takeaways: string } {
  return {
    intro: genIntro("C++", title, num),
    concepts: genConcepts(title),
    examples: genExamples(title),
    exercise: genExercise(title),
    pitfalls: genPitfalls(),
    takeaways: genTakeaways(title),
  };
}

/* ── Main content generator ── */

function generateLessonContent(lang: string, title: string, num: number): string {
  const contentMap: Record<string, (num: number, title: string) => { intro: string; concepts: string; examples: string; exercise: string; pitfalls: string; takeaways: string }> = {
    python: getPythonContent,
    html: getHtmlContent,
    css: getCssContent,
    cpp: getCppContent,
  };
  const getter = contentMap[lang] || getPythonContent;
  const c = getter(num, title);
  return `
<div class="lesson-content">
  <div class="lesson-intro">
    <h2>${esc(title)}</h2>
    ${c.intro}
  </div>
  <div class="lesson-section">
    <h3>What You'll Learn</h3>
    <ul>${c.concepts}</ul>
  </div>
  <div class="lesson-section">
    <h3>Examples</h3>
    ${c.examples}
  </div>
  <div class="lesson-section">
    <h3>Try It Yourself</h3>
    ${c.exercise}
  </div>
  <div class="lesson-section">
    <h3>Common Mistakes</h3>
    <ul>${c.pitfalls}</ul>
  </div>
  <div class="lesson-section">
    <h3>Key Takeaways</h3>
    <ul>${c.takeaways}</ul>
  </div>
</div>`;
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

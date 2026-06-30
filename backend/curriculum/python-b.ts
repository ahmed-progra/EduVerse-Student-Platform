import { L, q, ex, LessonDef } from "./types";

/** Python curriculum — Part B: functions through advanced (lessons 19–36). */
export const pythonB: LessonDef[] = [
  L("Functions", ["functions"], "intermediate", 14, {
    intro: `<p>A function packages a block of code under a name so you can run it whenever you need it — with different inputs each time. Functions are how programs scale: instead of copy-pasting logic, you define it once and call it everywhere.</p>`,
    concepts: [
      `<strong>def</strong> — defines a function; the body runs only when called`,
      `<strong>Parameters</strong> — names that receive the caller's values`,
      `<strong>return</strong> — hands a result back (and exits the function)`,
      `<strong>None</strong> — what a function returns if you don't return anything`,
    ],
    examples: [
      ex(
        "Define, then call",
        `def greet(name):\n    return "Hello, " + name + "!"\n\nprint(greet("Ada"))\nprint(greet("Linus"))`,
        `Hello, Ada!\nHello, Linus!`,
      ),
      ex(
        "Compute and reuse",
        `def area(width, height):\n    return width * height\n\nrooms = [(3, 4), (5, 2), (4, 4)]\ntotal = 0\nfor w, h in rooms:\n    total += area(w, h)\nprint("Total area:", total)`,
        `Total area: 38`,
      ),
    ],
    realWorld: `Every API endpoint, every button handler, every test case is a function. Splitting a program into small, named, single-purpose functions is the single most important structuring habit in software.`,
    practice: `Write <code>def celsius_to_fahrenheit(c):</code> returning <code>c * 9/5 + 32</code>, and a second function <code>describe(c)</code> that uses it to return strings like <code>"25°C is 77.0°F"</code>. Test both.`,
    mistakes: [
      `Printing instead of returning — a function that prints can't be used in further calculations`,
      `Calling before defining: Python reads top-to-bottom; define first, call after`,
    ],
    best: [
      `One job per function — if you describe it with "and", split it`,
      `Name functions as verbs: <code>calculate_total()</code>, <code>send_email()</code>, <code>is_valid()</code>`,
    ],
    template: `def celsius_to_fahrenheit(c):\n    return c * 9 / 5 + 32\n\ndef describe(c):\n    return str(c) + "C is " + str(celsius_to_fahrenheit(c)) + "F"\n\nprint(describe(25))\nprint(describe(0))`,
    quiz: [
      q(
        "What does a function without a return statement return?",
        ["0", '""', "None", "Error"],
        2,
        `Functions implicitly return None when no return executes.`,
      ),
      q(
        "What happens to code after a return statement in the same block?",
        ["It runs next call", "It never runs", "It runs once", "Syntax error"],
        1,
        `return exits immediately; following lines in that path are unreachable.`,
      ),
      q(
        "Why prefer return over print inside functions?",
        [
          "print is slower",
          "Returned values can be reused, composed, and tested",
          "print is deprecated",
          "No difference",
        ],
        1,
        `Returning separates computation from display — the foundation of testable code.`,
      ),
    ],
  }),

  L("Function Arguments", ["functions"], "intermediate", 14, {
    intro: `<p>Python gives you a flexible toolkit for passing data into functions: positional arguments, keyword arguments, default values, and variable-length <code>*args</code> / <code>**kwargs</code>. Mastering these makes your functions both convenient and hard to misuse.</p>`,
    concepts: [
      `<strong>Positional</strong> — matched by order: <code>pow(2, 10)</code>`,
      `<strong>Keyword</strong> — matched by name: <code>round(3.14159, ndigits=2)</code>`,
      `<strong>Defaults</strong> — parameters with fallback values make arguments optional`,
      `<strong>*args / **kwargs</strong> — accept any number of positional / keyword arguments`,
    ],
    examples: [
      ex(
        "Defaults and keywords",
        `def brew(drink, size="medium", sugar=0):\n    return size + " " + drink + " (" + str(sugar) + " sugar)"\n\nprint(brew("coffee"))\nprint(brew("tea", sugar=2))\nprint(brew("latte", "large"))`,
        `medium coffee (0 sugar)\nmedium tea (2 sugar)\nlarge latte (0 sugar)`,
      ),
      ex(
        "*args gathers extras",
        `def total(*prices):\n    return sum(prices)\n\nprint(total(5))\nprint(total(5, 10, 25))`,
        `5\n40`,
        `Inside the function, prices is a tuple of everything passed.`,
      ),
    ],
    realWorld: `Library APIs you already use are built this way — <code>print(*values, sep=" ", end="\\n")</code> combines *args with keyword defaults. Designing good signatures is designing a good developer experience.`,
    practice: `Write <code>def order(item, qty=1, *extras, express=False):</code> that prints a summary line. Call it three different ways: minimal, with extras, and with express=True.`,
    mistakes: [
      `Mutable default trap: <code>def add(item, bag=[])</code> shares ONE list across all calls — use <code>bag=None</code> then create inside`,
      `Positional after keyword: <code>brew(size="L", "tea")</code> is a syntax error — keywords come last`,
    ],
    best: [
      `Use keyword arguments at call sites when the meaning isn't obvious: <code>resize(image, width=800)</code> beats <code>resize(image, 800)</code>`,
      `Keep required parameters first, defaults after — and few in number`,
    ],
    template: `def order(item, qty=1, express=False):\n    line = str(qty) + " x " + item\n    if express:\n        line += " (EXPRESS)"\n    print(line)\n\norder("laptop")\norder("mouse", 3)\norder("ssd", 2, express=True)`,
    quiz: [
      q(
        "Why is def f(x, items=[]) dangerous?",
        [
          "Syntax error",
          "The default list is created once and shared between calls",
          "Lists can't be defaults",
          "It's fine",
        ],
        1,
        `Defaults are evaluated once at definition time — mutations persist across calls. Use None and create inside.`,
      ),
      q(
        "What is args inside def f(*args)?",
        ["A list", "A tuple", "A dict", "A set"],
        1,
        `*args collects extra positional arguments into a tuple.`,
      ),
      q(
        "Which call is INVALID for def f(a, b=2)?",
        ["f(1)", "f(1, 3)", "f(b=4, a=1)", "f(a=1, 5)"],
        3,
        `Positional arguments can't follow keyword arguments.`,
      ),
    ],
  }),

  L("Scope & Return Values", ["functions", "variables"], "intermediate", 12, {
    intro: `<p>Where a variable is created determines where it's visible — its <em>scope</em>. Variables made inside a function are local and vanish when the function ends. Understanding scope explains a whole family of confusing bugs, and returning values is how functions communicate results outward properly.</p>`,
    concepts: [
      `<strong>Local scope</strong> — names assigned inside a function exist only there`,
      `<strong>Global scope</strong> — module-level names; readable inside functions`,
      `<strong>LEGB rule</strong> — Python looks up names Local → Enclosing → Global → Built-in`,
      `<strong>Returning multiple values</strong> — <code>return a, b</code> returns a tuple`,
    ],
    examples: [
      ex(
        "Locals don't leak",
        `def double(n):\n    result = n * 2\n    return result\n\nprint(double(5))\n# print(result)  # NameError: result only exists inside`,
        `10`,
      ),
      ex(
        "Multiple returns",
        `def min_max(nums):\n    return min(nums), max(nums)\n\nlow, high = min_max([4, 9, 1, 7])\nprint("low:", low, "high:", high)`,
        `low: 1 high: 7`,
        `Returning a tuple and unpacking it is the Python way to give back several results.`,
      ),
    ],
    realWorld: `Scope discipline is why big programs don't collapse: a thousand functions can each use a variable named <code>result</code> without colliding. Code that leans on global mutable state is the code teams dread maintaining.`,
    practice: `Write <code>def stats(numbers):</code> that returns the count, total, and average as three values. Unpack and print them for <code>[12, 8, 20, 4]</code>.`,
    mistakes: [
      `Expecting a function to see your local variables — pass them as arguments instead`,
      `Assigning to a global inside a function creates a new local unless you declare <code>global</code> (and you usually shouldn't)`,
    ],
    best: [
      `Pass data in via parameters and out via return — avoid the global keyword in everyday code`,
      `Return early for edge cases: <code>if not nums: return 0, 0, 0</code> keeps the main path unindented`,
    ],
    template: `def stats(numbers):\n    count = len(numbers)\n    total = sum(numbers)\n    return count, total, total / count\n\nn, t, avg = stats([12, 8, 20, 4])\nprint("count:", n, "total:", t, "avg:", avg)`,
    quiz: [
      q(
        "x = 1; def f(): x = 2 — after f(), what is global x?",
        ["2", "1", "None", "Error"],
        1,
        `Assignment inside the function creates a LOCAL x; the global is untouched.`,
      ),
      q(
        "What does return a, b actually return?",
        ["Two separate values", "A tuple (a, b)", "A list [a, b]", "Only b"],
        1,
        `Python packs them into a tuple, which callers usually unpack.`,
      ),
      q(
        "In what order does Python resolve names?",
        ["Global, Local", "Local, Enclosing, Global, Built-in", "Built-in first", "Random"],
        1,
        `The LEGB rule — innermost scope wins.`,
      ),
    ],
  }),

  L("Lambda Functions", ["lambdas", "functions"], "intermediate", 10, {
    intro: `<p>A lambda is a tiny anonymous function written in a single expression: <code>lambda x: x * 2</code>. Lambdas shine as throwaway arguments to functions like <code>sorted()</code>, <code>min()</code>, and <code>filter()</code> — places where defining a full function would be ceremony.</p>`,
    concepts: [
      `<strong>Syntax</strong> — <code>lambda params: expression</code> (no statements, no return keyword)`,
      `<strong>Use as arguments</strong> — pass behavior into sorting, filtering, mapping`,
      `<strong>key= functions</strong> — the most common lambda home`,
      `<strong>Limits</strong> — one expression only; anything bigger deserves def`,
    ],
    examples: [
      ex(
        "Sorting with a key",
        `users = [("Ada", 36), ("Bo", 25), ("Cy", 31)]\nby_age = sorted(users, key=lambda u: u[1])\nprint(by_age)`,
        `[('Bo', 25), ('Cy', 31), ('Ada', 36)]`,
      ),
      ex(
        "filter and map",
        `nums = [1, 2, 3, 4, 5, 6]\nevens = list(filter(lambda n: n % 2 == 0, nums))\ndoubled = list(map(lambda n: n * 2, evens))\nprint(evens, doubled)`,
        `[2, 4, 6] [4, 8, 12]`,
        `filter keeps items where the lambda is true; map transforms each item.`,
      ),
    ],
    realWorld: `"Sort products by price", "find the newest message", "keep only active users" — real codebases are full of one-line key and predicate lambdas passed into sorting and filtering utilities.`,
    practice: `Given <code>words = ["banana", "Fig", "cherry", "date"]</code>, sort them case-insensitively (key with <code>.lower()</code>), and find the longest word with <code>max()</code> and a lambda.`,
    mistakes: [
      `Cramming multi-step logic into a lambda — unreadable; switch to def`,
      `Assigning lambdas to names everywhere (<code>f = lambda x: ...</code>) — PEP 8 says use def for named functions`,
    ],
    best: [
      `Keep lambdas to one obvious transformation; if you need a comment, it's too complex`,
      `Often a built-in replaces the lambda entirely: <code>key=len</code>, <code>key=str.lower</code>`,
    ],
    template: `words = ["banana", "Fig", "cherry", "date"]\nprint(sorted(words, key=lambda w: w.lower()))\nprint(max(words, key=lambda w: len(w)))`,
    quiz: [
      q(
        "Which is equivalent to lambda x: x + 1?",
        ["def f(x): x + 1", "def f(x): return x + 1", "def f(): return x + 1", "x => x + 1"],
        1,
        `A lambda implicitly returns its expression — the def needs an explicit return.`,
      ),
      q(
        "What does sorted(words, key=len) do?",
        ["Sorts alphabetically", "Sorts by word length", "Errors", "Removes duplicates"],
        1,
        `key extracts the comparison value for each item — here their lengths.`,
      ),
      q(
        "What CAN'T a lambda contain?",
        ["A condition", "Arithmetic", "Statements like loops and assignments", "Function calls"],
        2,
        `Lambdas are single expressions — no statements allowed.`,
      ),
    ],
  }),

  L("List Comprehensions", ["advanced-python", "lists"], "intermediate", 12, {
    intro: `<p>A list comprehension builds a new list from an existing iterable in one readable line: <code>[expression for item in iterable if condition]</code>. It replaces the three-line append loop you've written a dozen times — and Python programmers reach for it constantly.</p>`,
    concepts: [
      `<strong>Map form</strong> — <code>[n * 2 for n in nums]</code> transforms every item`,
      `<strong>Filter form</strong> — <code>[n for n in nums if n > 0]</code> keeps some items`,
      `<strong>Combined</strong> — transform and filter together`,
      `<strong>Dict/set comprehensions</strong> — same idea with <code>{}</code>`,
    ],
    examples: [
      ex(
        "Loop vs comprehension",
        `nums = [1, 2, 3, 4, 5]\n\nsquares = []\nfor n in nums:\n    squares.append(n ** 2)\n\nsquares2 = [n ** 2 for n in nums]\nprint(squares == squares2, squares2)`,
        `True [1, 4, 9, 16, 25]`,
      ),
      ex(
        "Filter + transform",
        `words = ["hi", "hello", "hey", "howdy"]\nlong_caps = [w.upper() for w in words if len(w) > 3]\nprint(long_caps)\nlengths = {w: len(w) for w in words}\nprint(lengths)`,
        `['HELLO', 'HOWDY']\n{'hi': 2, 'hello': 5, 'hey': 3, 'howdy': 5}`,
      ),
    ],
    realWorld: `Extracting one field from a list of records (<code>[u["email"] for u in users]</code>), cleaning datasets, and building lookup tables are everyday comprehension territory in data work and web backends alike.`,
    practice: `From <code>range(1, 21)</code>, build: a list of multiples of 3, a list of squares of even numbers, and a dict mapping each number 1–5 to its cube — all with comprehensions.`,
    mistakes: [
      `Nesting comprehensions until unreadable — two for-clauses is the comfortable maximum`,
      `Using a comprehension for side effects like printing — that's what plain loops are for`,
    ],
    best: [
      `If the line needs wrapping or a comment, convert it back into a loop`,
      `Order reads left to right: expression, then for, then if — keep conditions simple`,
    ],
    template: `mult3 = [n for n in range(1, 21) if n % 3 == 0]\nsq_even = [n ** 2 for n in range(1, 21) if n % 2 == 0]\ncubes = {n: n ** 3 for n in range(1, 6)}\nprint(mult3)\nprint(sq_even)\nprint(cubes)`,
    quiz: [
      q(
        'What does [c.upper() for c in "abc"] produce?',
        ['"ABC"', "['A','B','C']", "['abc']", "Error"],
        1,
        `It maps over the string's characters and collects results into a list.`,
      ),
      q(
        "Which comprehension keeps only positive numbers?",
        [
          "[n if n > 0 for n in nums]",
          "[n for n in nums if n > 0]",
          "[for n in nums if n > 0]",
          "[n > 0 for n in nums]",
        ],
        1,
        `The filter clause goes at the end: expression, for, if.`,
      ),
      q(
        "What does [n > 0 for n in [1, -2]] give?",
        ["[1]", "[True, False]", "[1, -2]", "Error"],
        1,
        `The expression n > 0 is a boolean — the list collects True/False values.`,
      ),
    ],
  }),

  L("Modules & Imports", ["modules"], "intermediate", 10, {
    intro: `<p>A module is simply a Python file whose functions and variables you can use from another file. Imports are how Python code is organized, shared, and reused — from your own helper files up to the giant ecosystem on PyPI.</p>`,
    concepts: [
      `<strong>import module</strong> — access contents as <code>module.name</code>`,
      `<strong>from module import name</strong> — bring one name in directly`,
      `<strong>as</strong> — rename on import: <code>import datetime as dt</code>`,
      `<strong>Your own modules</strong> — any .py file is importable from siblings`,
    ],
    examples: [
      ex(
        "Importing from the standard library",
        `import math\nfrom random import randint\n\nprint(math.sqrt(144))\nprint(math.pi)\nprint(randint(1, 6))  # a dice roll`,
        `12.0\n3.141592653589793\n4`,
      ),
      ex(
        "Module as namespace",
        `import math\n\nradius = 5\narea = math.pi * radius ** 2\nprint(round(area, 2))`,
        `78.54`,
        `The math. prefix tells readers exactly where pi came from.`,
      ),
    ],
    realWorld: `Real projects are dozens of modules: <code>models.py</code>, <code>views.py</code>, <code>utils.py</code>. The import system is also the gateway to third-party power — web frameworks, data science stacks, game engines — all one import away.`,
    practice: `Import <code>math</code> and compute the hypotenuse of a 3-4 right triangle with <code>math.sqrt()</code>, then with <code>math.hypot()</code>. Confirm both give 5.0.`,
    mistakes: [
      `<code>from module import *</code> floods your namespace and hides where names came from`,
      `Naming your file the same as a library (<code>random.py</code>) — your file shadows the real one and breaks imports`,
    ],
    best: [
      `Keep imports at the top of the file, standard library first, then third-party, then your own`,
      `Prefer <code>import module</code> + qualified names in shared code — clarity beats brevity`,
    ],
    template: `import math\n\na, b = 3, 4\nprint(math.sqrt(a ** 2 + b ** 2))\nprint(math.hypot(a, b))`,
    quiz: [
      q(
        "After 'import math', how do you use sqrt?",
        ["sqrt(9)", "math.sqrt(9)", "math->sqrt(9)", "import sqrt first"],
        1,
        `Plain import keeps names inside the module namespace.`,
      ),
      q(
        "Why avoid 'from x import *'?",
        [
          "It's slower",
          "It imports nothing",
          "It dumps unknown names into your namespace and invites collisions",
          "It's a syntax error",
        ],
        2,
        `Wildcard imports make code harder to read and can silently shadow names.`,
      ),
      q(
        "What does 'import numpy as np' do?",
        [
          "Renames the library on disk",
          "Imports it under the shorter alias np",
          "Imports only part of it",
          "Nothing",
        ],
        1,
        `Aliasing is convention for frequently used libraries.`,
      ),
    ],
  }),

  L("The Standard Library Tour", ["modules"], "intermediate", 12, {
    intro: `<p>Python ships "batteries included": hundreds of modules ready to import. Knowing what already exists saves you from rewriting solved problems. This lesson tours four modules you'll use constantly: <code>random</code>, <code>datetime</code>, <code>collections</code>, and <code>json</code>.</p>`,
    concepts: [
      `<strong>random</strong> — randint, choice, shuffle for games and sampling`,
      `<strong>datetime</strong> — dates, times, and arithmetic between them`,
      `<strong>collections.Counter</strong> — counting made trivial`,
      `<strong>json</strong> — convert between Python objects and JSON text`,
    ],
    examples: [
      ex(
        "random and Counter",
        `import random\nfrom collections import Counter\n\nrolls = [random.randint(1, 6) for _ in range(10)]\nprint(rolls)\nprint(Counter(rolls).most_common(1))`,
        `[3, 1, 6, 3, 2, 3, 5, 1, 4, 6]\n[(3, 3)]`,
        `Counter turns "tally these up" from a loop into a single call.`,
      ),
      ex(
        "json round-trip",
        `import json\n\nuser = {"name": "Ada", "skills": ["math", "code"]}\ntext = json.dumps(user)\nprint(text)\nback = json.loads(text)\nprint(back["skills"][0])`,
        `{"name": "Ada", "skills": ["math", "code"]}\nmath`,
      ),
    ],
    realWorld: `json.dumps/loads is the bridge between Python and every web API. Counter powers quick analytics. datetime handles "posted 3 days ago". A developer who knows the standard library writes half the code of one who doesn't.`,
    practice: `Use <code>random.choice()</code> to pick a winner from a list of five names, run it in a loop 100 times, and use <code>Counter</code> to show how many times each name won.`,
    mistakes: [
      `Reinventing the wheel — writing your own date parser or counter when the stdlib has a tested one`,
      `Confusing json.dumps (object → string) with json.dump (writes to a file) — and same for loads/load`,
    ],
    best: [
      `Before writing a utility, search "python stdlib &lt;problem&gt;" — it probably exists`,
      `Use Counter, defaultdict, and namedtuple from collections to remove boilerplate`,
    ],
    template: `import random\nfrom collections import Counter\n\nnames = ["Ada", "Bo", "Cy", "Dee", "Eli"]\nwins = [random.choice(names) for _ in range(100)]\nfor name, count in Counter(wins).most_common():\n    print(name, count)`,
    quiz: [
      q(
        "Which converts a Python dict to a JSON string?",
        ["json.loads", "json.dumps", "json.parse", "str()"],
        1,
        `dumps = dump-to-string. loads parses the other way.`,
      ),
      q(
        "What does Counter(\"aabbbc\") report for 'b'?",
        ["1", "2", "3", "Error"],
        2,
        `Counter tallies every element — three b's.`,
      ),
      q(
        "Which picks a random item from a list?",
        ["random.randint(list)", "random.choice(list)", "random.pick(list)", "list.random()"],
        1,
        `choice selects one element uniformly at random.`,
      ),
    ],
  }),

  L("File Handling: Reading & Writing", ["file-handling"], "intermediate", 14, {
    intro: `<p>Programs that can't persist data forget everything when they exit. File handling lets you save results and read them back. The <code>with open(...)</code> pattern is the safe way: it guarantees the file closes even if something goes wrong mid-operation.</p>`,
    concepts: [
      `<strong>Modes</strong> — <code>"r"</code> read, <code>"w"</code> write (overwrites!), <code>"a"</code> append`,
      `<strong>with statement</strong> — auto-closes the file when the block ends`,
      `<strong>Reading</strong> — <code>.read()</code> whole file, <code>.readlines()</code>, or loop line by line`,
      `<strong>Writing</strong> — <code>.write()</code> doesn't add newlines for you`,
    ],
    examples: [
      ex(
        "Write, then read back",
        `with open("notes.txt", "w") as f:\n    f.write("line one\\n")\n    f.write("line two\\n")\n\nwith open("notes.txt", "r") as f:\n    content = f.read()\nprint(content)`,
        `line one\nline two`,
      ),
      ex(
        "Processing line by line",
        `with open("notes.txt") as f:\n    for i, line in enumerate(f, 1):\n        print(i, line.strip())`,
        `1 line one\n2 line two`,
        `Looping over the file object reads one line at a time — memory-friendly for huge files.`,
      ),
    ],
    realWorld: `Log files, configuration files, exports, report generation — server software reads and writes files constantly. The same open/process/close discipline extends to databases and network connections.`,
    practice: `Write a list of three favorite quotes to <code>quotes.txt</code> (one per line), then read the file back and print each line numbered. (Run this in real Python on your machine — the in-browser runner has no file system.)`,
    mistakes: [
      `Opening with <code>"w"</code> when you meant <code>"a"</code> — write mode erases the existing file instantly`,
      `Forgetting <code>"\\n"</code> in write() — everything lands on one line`,
    ],
    best: [
      `Always use <code>with</code> — manual open()/close() leaks file handles when exceptions strike`,
      `Strip lines when reading (<code>line.strip()</code>) — trailing newlines cause subtle comparison bugs`,
    ],
    template: `# File I/O needs a real file system - run locally.\n# In-browser, we simulate the logic:\nlines = ["line one", "line two"]\nfor i, line in enumerate(lines, 1):\n    print(i, line)`,
    quiz: [
      q(
        'What does opening a file in "w" mode do if it already exists?',
        ["Appends to it", "Raises an error", "Erases its contents", "Opens read-only"],
        2,
        `Write mode truncates the file to empty — use "a" to append.`,
      ),
      q(
        "Why prefer 'with open(...) as f:'?",
        [
          "It's faster",
          "The file closes automatically, even on errors",
          "It reads the whole file",
          "It's required syntax",
        ],
        1,
        `The context manager guarantees cleanup — no leaked handles.`,
      ),
      q(
        "How do you read a file line by line memory-efficiently?",
        ["f.read().split()", "for line in f:", "f.readlines()[:]", "while f.next():"],
        1,
        `Iterating the file object streams lines without loading the whole file.`,
      ),
    ],
  }),

  L("Working with CSV & JSON", ["file-handling", "modules"], "intermediate", 14, {
    intro: `<p>Two file formats dominate data exchange: CSV (spreadsheet-style rows) and JSON (nested structures, the language of web APIs). Python's <code>csv</code> and <code>json</code> modules parse both safely — never split CSV by hand; quoted commas will betray you.</p>`,
    concepts: [
      `<strong>csv.reader / csv.DictReader</strong> — rows as lists or as dicts keyed by header`,
      `<strong>csv.writer</strong> — writes rows, handles quoting for you`,
      `<strong>json.load / json.dump</strong> — file versions of loads/dumps`,
      `<strong>Choosing</strong> — CSV for flat tables, JSON for nested data`,
    ],
    examples: [
      ex(
        "CSV with DictReader (concept)",
        `import csv\n\n# students.csv:  name,grade\n#                Ada,95\n#                Bo,88\nwith open("students.csv") as f:\n    for row in csv.DictReader(f):\n        print(row["name"], "got", row["grade"])`,
        `Ada got 95\nBo got 88`,
      ),
      ex(
        "JSON for nested data",
        `import json\n\nconfig = {"app": "EduVerse", "features": {"ai": True, "battles": True}}\ntext = json.dumps(config, indent=2)\nprint(text)`,
        `{\n  "app": "EduVerse",\n  "features": {\n    "ai": true,\n    "battles": true\n  }\n}`,
        `indent=2 produces human-readable output — handy for config files.`,
      ),
    ],
    realWorld: `Exporting analytics to Excel? CSV. Calling a weather API? JSON in, JSON out. Every data pipeline starts and ends in one of these formats, and bad hand-rolled parsers are a notorious bug source.`,
    practice: `Build a list of dicts for three products (name, price). Convert it to a JSON string with indent=2 and print it. Then parse it back with json.loads and print the second product's price.`,
    mistakes: [
      `Splitting CSV with <code>line.split(",")</code> — breaks on quoted values like <code>"Smith, John"</code>`,
      `JSON isn't Python: it uses <code>true/false/null</code> and double quotes only — write it with the json module, not string concatenation`,
    ],
    best: [
      `Use DictReader/DictWriter so columns are referenced by name, not fragile indexes`,
      `Validate parsed data before trusting it — files and APIs lie`,
    ],
    template: `import json\n\nproducts = [\n    {"name": "Keyboard", "price": 49},\n    {"name": "Mouse", "price": 25},\n    {"name": "Monitor", "price": 199},\n]\ntext = json.dumps(products, indent=2)\nprint(text)\nback = json.loads(text)\nprint("Second price:", back[1]["price"])`,
    quiz: [
      q(
        'Why not parse CSV with str.split(",")?',
        [
          "Too slow",
          "Quoted fields containing commas break it",
          "split can't take a comma",
          "It works fine",
        ],
        1,
        `"Smith, John" is one field — naive splitting cuts it in two. The csv module handles quoting.`,
      ),
      q(
        "json.load vs json.loads — the difference?",
        [
          "No difference",
          "load reads from a file object, loads from a string",
          "loads is plural",
          "load is deprecated",
        ],
        1,
        `The trailing s means string.`,
      ),
      q(
        "Which Python value becomes null in JSON?",
        ["0", '""', "None", "False"],
        2,
        `Python None maps to JSON null.`,
      ),
    ],
  }),

  L("Exceptions & Error Handling", ["exceptions"], "intermediate", 14, {
    intro: `<p>Things go wrong: files are missing, users type "abc" where numbers belong, networks drop. Exceptions are Python's mechanism for signaling and handling these failures. <code>try/except</code> lets your program respond gracefully instead of crashing with a traceback.</p>`,
    concepts: [
      `<strong>try / except</strong> — attempt risky code, catch named failures`,
      `<strong>Specific exceptions</strong> — ValueError, TypeError, KeyError, ZeroDivisionError…`,
      `<strong>else / finally</strong> — else runs on success; finally runs no matter what`,
      `<strong>Exception objects</strong> — <code>except ValueError as e:</code> captures the message`,
    ],
    examples: [
      ex(
        "Catching bad input",
        `def safe_int(text):\n    try:\n        return int(text)\n    except ValueError:\n        return None\n\nprint(safe_int("42"))\nprint(safe_int("forty-two"))`,
        `42\nNone`,
      ),
      ex(
        "Multiple handlers + finally",
        `data = {"a": 1}\ntry:\n    value = data["b"]\n    result = 10 / value\nexcept KeyError:\n    print("missing key")\nexcept ZeroDivisionError:\n    print("divided by zero")\nfinally:\n    print("cleanup runs always")`,
        `missing key\ncleanup runs always`,
      ),
    ],
    realWorld: `Production services wrap I/O — network calls, database queries, file reads — in exception handlers with logging and retries. Yesterday's AI service in this very project retries on rate-limit exceptions; that pattern is exactly this lesson.`,
    practice: `Write a loop that asks for a number until <code>int(input())</code> succeeds (catch ValueError), then prints 100 divided by it — also handling the zero case with a friendly message.`,
    mistakes: [
      `Bare <code>except:</code> swallows EVERYTHING — including typos like NameError — making bugs invisible`,
      `Wrapping huge blocks in one try — keep the try small so you know what failed`,
    ],
    best: [
      `Catch the most specific exception that you can actually handle`,
      `Use finally (or with-statements) for cleanup that must always run`,
    ],
    template: `def divide_100_by(text):\n    try:\n        n = int(text)\n        return 100 / n\n    except ValueError:\n        return "not a number"\n    except ZeroDivisionError:\n        return "cannot divide by zero"\n\nprint(divide_100_by("4"))\nprint(divide_100_by("abc"))\nprint(divide_100_by("0"))`,
    quiz: [
      q(
        'Which exception does int("hello") raise?',
        ["TypeError", "ValueError", "KeyError", "NameError"],
        1,
        `The type (str) is acceptable; the VALUE can't be parsed — ValueError.`,
      ),
      q(
        "When does finally run?",
        ["Only on success", "Only on failure", "Always", "Never with return"],
        2,
        `finally executes on success, on exception, even past return statements.`,
      ),
      q(
        "Why is bare 'except:' discouraged?",
        [
          "Syntax error",
          "It catches everything, hiding real bugs",
          "It's slow",
          "It only catches ValueError",
        ],
        1,
        `Catching all exceptions indiscriminately buries typos and system errors alike.`,
      ),
    ],
  }),

  L("Raising & Custom Exceptions", ["exceptions", "oop"], "advanced", 12, {
    intro: `<p>Handling errors is half the story — well-designed code also <em>raises</em> them. <code>raise</code> signals that something is wrong; custom exception classes give failures precise, catchable names. Good error design is what separates a usable library from a frustrating one.</p>`,
    concepts: [
      `<strong>raise</strong> — <code>raise ValueError("age cannot be negative")</code>`,
      `<strong>Custom classes</strong> — subclass Exception for domain-specific failures`,
      `<strong>Fail fast</strong> — validate inputs early, raise immediately with clear messages`,
      `<strong>re-raising</strong> — catch, act (log), then <code>raise</code> again to propagate`,
    ],
    examples: [
      ex(
        "Validating with raise",
        `def set_age(age):\n    if age < 0:\n        raise ValueError("age cannot be negative: " + str(age))\n    return age\n\ntry:\n    set_age(-5)\nexcept ValueError as e:\n    print("Rejected:", e)`,
        `Rejected: age cannot be negative: -5`,
      ),
      ex(
        "A custom exception",
        `class InsufficientFunds(Exception):\n    pass\n\ndef withdraw(balance, amount):\n    if amount > balance:\n        raise InsufficientFunds("need " + str(amount - balance) + " more")\n    return balance - amount\n\ntry:\n    withdraw(50, 80)\nexcept InsufficientFunds as e:\n    print("Bank says:", e)`,
        `Bank says: need 30 more`,
      ),
    ],
    realWorld: `Frameworks define rich exception families — Django's ValidationError, requests' Timeout — so callers can react differently to different failures. Your EduVerse backend defines AIError for exactly this reason.`,
    practice: `Create <code>class EmptyCartError(Exception)</code>. Write <code>checkout(items)</code> that raises it for an empty list, otherwise returns the total. Call it both ways with try/except.`,
    mistakes: [
      `Returning error strings or -1 instead of raising — callers forget to check, bugs travel silently`,
      `Raising bare Exception — callers can't catch yours without catching everything`,
    ],
    best: [
      `Inherit from Exception (not BaseException) and name with the Error suffix`,
      `Write actionable messages: include the bad value and what was expected`,
    ],
    template: `class EmptyCartError(Exception):\n    pass\n\ndef checkout(items):\n    if len(items) == 0:\n        raise EmptyCartError("cart is empty")\n    return sum(items)\n\ntry:\n    print(checkout([19, 5]))\n    print(checkout([]))\nexcept EmptyCartError as e:\n    print("Error:", e)`,
    quiz: [
      q(
        "What does raise do?",
        ["Logs a warning", "Throws an exception up the call stack", "Exits Python", "Returns None"],
        1,
        `raise interrupts normal flow and propagates until something catches it.`,
      ),
      q(
        "A custom exception should inherit from…",
        ["BaseException", "Exception", "Error", "object"],
        1,
        `Exception is the conventional base; BaseException is reserved for system-level signals.`,
      ),
      q(
        "Why raise instead of returning an error code?",
        [
          "It's faster",
          "Errors can't be ignored accidentally and carry rich context",
          "Return codes are deprecated",
          "No reason",
        ],
        1,
        `Unhandled exceptions are loud; ignored return codes are silent corruption.`,
      ),
    ],
  }),

  L("Classes & Objects", ["oop"], "advanced", 16, {
    intro: `<p>A class is a blueprint for creating objects that bundle data (attributes) with behavior (methods). Instead of passing the same dict to twenty functions, you define a class once and each object carries its own state. This is object-oriented programming — the organizing principle of most large codebases.</p>`,
    concepts: [
      `<strong>class</strong> — defines the blueprint; instances are made by calling it`,
      `<strong>__init__</strong> — the initializer that sets up each new object`,
      `<strong>self</strong> — the instance being worked on; first parameter of every method`,
      `<strong>Attributes vs methods</strong> — data on the object vs functions on the object`,
    ],
    examples: [
      ex(
        "A class with state and behavior",
        `class BankAccount:\n    def __init__(self, owner, balance=0):\n        self.owner = owner\n        self.balance = balance\n\n    def deposit(self, amount):\n        self.balance += amount\n\n    def summary(self):\n        return self.owner + ": $" + str(self.balance)\n\nacct = BankAccount("Ada", 100)\nacct.deposit(50)\nprint(acct.summary())`,
        `Ada: $150`,
      ),
      ex(
        "Each instance is independent",
        `a = BankAccount("Ada", 100)\nb = BankAccount("Bo")\na.deposit(25)\nprint(a.balance, b.balance)`,
        `125 0`,
        `Two objects from one class — separate state, shared behavior.`,
      ),
    ],
    realWorld: `Django models, game entities, GUI widgets, the Prisma client in this project's backend — all classes. When data and the operations on it always travel together, a class is the natural container.`,
    practice: `Write a <code>Playlist</code> class with a name and a song list. Add methods <code>add(song)</code>, <code>total()</code> returning the count, and <code>show()</code> printing each song numbered. Create one and exercise all three.`,
    mistakes: [
      `Forgetting self in method definitions — Python complains about argument counts on every call`,
      `Mutable class-level attributes (a list defined on the class) shared by ALL instances — initialize per-instance in __init__`,
    ],
    best: [
      `Keep classes small and focused; name them in CapWords (<code>BankAccount</code>)`,
      `If a "class" has only __init__ and one method, a plain function (or dataclass) may serve better`,
    ],
    template: `class Playlist:\n    def __init__(self, name):\n        self.name = name\n        self.songs = []\n\n    def add(self, song):\n        self.songs.append(song)\n\n    def show(self):\n        for i, s in enumerate(self.songs, 1):\n            print(i, s)\n\np = Playlist("Focus")\np.add("Lo-fi beats")\np.add("Rainy mood")\np.show()`,
    quiz: [
      q(
        "What is self?",
        [
          "A keyword for private data",
          "The instance the method is called on",
          "The class itself",
          "A global object",
        ],
        1,
        `self is just the conventional name for the first parameter — the instance.`,
      ),
      q(
        "When does __init__ run?",
        [
          "When the class is defined",
          "Every time an instance is created",
          "Only the first time",
          "When you call init()",
        ],
        1,
        `Calling the class — BankAccount(...) — constructs an instance and runs __init__ on it.`,
      ),
      q(
        'a = Dog(); b = Dog(); a.name = "Rex". What about b.name?',
        ['Also "Rex"', "Unset — instances have independent attributes", "Error always", '""'],
        1,
        `Setting an attribute on one instance doesn't touch others.`,
      ),
    ],
  }),

  L("Inheritance & Polymorphism", ["oop"], "advanced", 16, {
    intro: `<p>Inheritance lets a class build on another: the child gets everything the parent has, then adds or overrides behavior. Polymorphism is the payoff — code that works with the parent type automatically works with every child, each responding in its own way.</p>`,
    concepts: [
      `<strong>class Child(Parent)</strong> — inherits attributes and methods`,
      `<strong>Overriding</strong> — redefine a method in the child to specialize it`,
      `<strong>super()</strong> — call the parent's version from the child`,
      `<strong>Polymorphism</strong> — one interface, many implementations`,
    ],
    examples: [
      ex(
        "Inherit and override",
        `class Animal:\n    def __init__(self, name):\n        self.name = name\n    def speak(self):\n        return "..."\n\nclass Dog(Animal):\n    def speak(self):\n        return "Woof!"\n\nclass Cat(Animal):\n    def speak(self):\n        return "Meow"\n\nfor pet in [Dog("Rex"), Cat("Mia"), Animal("Blob")]:\n    print(pet.name, "says", pet.speak())`,
        `Rex says Woof!\nMia says Meow\nBlob says ...`,
      ),
      ex(
        "Extending with super()",
        `class Employee:\n    def __init__(self, name):\n        self.name = name\n\nclass Manager(Employee):\n    def __init__(self, name, team_size):\n        super().__init__(name)\n        self.team_size = team_size\n\nm = Manager("Ada", 5)\nprint(m.name, "manages", m.team_size)`,
        `Ada manages 5`,
        `super() runs the parent's __init__ so you don't repeat its setup.`,
      ),
    ],
    realWorld: `GUI frameworks (every widget extends Widget), game engines (every entity extends GameObject), and web frameworks (your view extends the base View) all hand you a parent class to inherit. Polymorphism is why the framework can call YOUR code without knowing it exists.`,
    practice: `Create <code>Shape</code> with method <code>area()</code> returning 0. Make <code>Rectangle(w, h)</code> and <code>Circle(r)</code> override it. Loop over a list of mixed shapes printing each area — that loop is polymorphism.`,
    mistakes: [
      `Forgetting <code>super().__init__()</code> in the child — parent attributes never get set`,
      `Deep inheritance towers (A→B→C→D→E) — hard to trace; prefer shallow hierarchies or composition`,
    ],
    best: [
      `Inherit for true "is-a" relationships only; for "has-a", store the other object as an attribute (composition)`,
      `Keep parent methods meaningful — children should refine behavior, not contradict it`,
    ],
    template: `class Shape:\n    def area(self):\n        return 0\n\nclass Rectangle(Shape):\n    def __init__(self, w, h):\n        self.w = w\n        self.h = h\n    def area(self):\n        return self.w * self.h\n\nclass Circle(Shape):\n    def __init__(self, r):\n        self.r = r\n    def area(self):\n        return 3.14159 * self.r ** 2\n\nfor s in [Rectangle(3, 4), Circle(5)]:\n    print(round(s.area(), 2))`,
    quiz: [
      q(
        "What does class Dog(Animal) mean?",
        [
          "Dog contains an Animal",
          "Dog inherits from Animal",
          "Dog and Animal are equal",
          "Animal inherits from Dog",
        ],
        1,
        `The parenthesized class is the parent; Dog receives its members.`,
      ),
      q(
        "What does super().__init__(name) do?",
        [
          "Creates a second object",
          "Calls the parent class's initializer",
          "Resets the object",
          "Imports the parent",
        ],
        1,
        `It reuses the parent's setup logic on the current instance.`,
      ),
      q(
        "Polymorphism means…",
        [
          "Many classes in one file",
          "Calling the same method on different types, each behaving its own way",
          "Multiple inheritance",
          "Renaming methods",
        ],
        1,
        `One interface (speak), many forms (Woof/Meow) — that's the definition.`,
      ),
    ],
  }),

  L("Magic Methods & Dataclasses", ["oop", "advanced-python"], "advanced", 14, {
    intro: `<p>Why does <code>len([1,2])</code> work? Because lists define <code>__len__</code>. Double-underscore "magic" methods let YOUR classes plug into Python's built-in syntax — printing, comparison, arithmetic, len(). And when a class is mostly data, <code>@dataclass</code> writes the boilerplate for you.</p>`,
    concepts: [
      `<strong>__str__</strong> — what print() shows for your object`,
      `<strong>__eq__ / __lt__</strong> — make ==, &lt;, and sorting work`,
      `<strong>__len__ / __add__</strong> — len() support and + overloading`,
      `<strong>@dataclass</strong> — auto-generates __init__, __repr__, __eq__ from field declarations`,
    ],
    examples: [
      ex(
        "Making print() friendly",
        `class Point:\n    def __init__(self, x, y):\n        self.x = x\n        self.y = y\n    def __str__(self):\n        return "(" + str(self.x) + ", " + str(self.y) + ")"\n    def __add__(self, other):\n        return Point(self.x + other.x, self.y + other.y)\n\np = Point(1, 2) + Point(3, 4)\nprint(p)`,
        `(4, 6)`,
      ),
      ex(
        "Dataclasses remove boilerplate",
        `from dataclasses import dataclass\n\n@dataclass\nclass Song:\n    title: str\n    seconds: int\n\na = Song("Lo-fi", 180)\nb = Song("Lo-fi", 180)\nprint(a)\nprint(a == b)`,
        `Song(title='Lo-fi', seconds=180)\nTrue`,
        `Without @dataclass, that == would be False (identity comparison) and printing would show a memory address.`,
      ),
    ],
    realWorld: `ORMs print readable records, vector math libraries overload +, money types compare safely — all magic methods. Dataclasses are the modern standard for config objects and API payloads in production Python.`,
    practice: `Build a <code>Duration</code> class storing seconds, with <code>__str__</code> showing "MM:SS" and <code>__add__</code> combining two durations. Add two song lengths and print the total.`,
    mistakes: [
      `Defining __eq__ without thinking about __hash__ — your objects may stop working in sets/dict keys`,
      `Overloading operators unnaturally (using + to mean "remove") — magic should match intuition`,
    ],
    best: [
      `Always give domain classes a __str__ or __repr__ — debugging output you can read pays for itself`,
      `Reach for @dataclass first for data-holder classes; write magic methods manually only for real behavior`,
    ],
    template: `class Duration:\n    def __init__(self, seconds):\n        self.seconds = seconds\n    def __str__(self):\n        m = self.seconds // 60\n        s = self.seconds % 60\n        return str(m) + ":" + str(s).zfill(2)\n    def __add__(self, other):\n        return Duration(self.seconds + other.seconds)\n\ntotal = Duration(215) + Duration(187)\nprint(total)`,
    quiz: [
      q(
        "Which method controls what print(obj) displays?",
        ["__print__", "__str__", "__show__", "__text__"],
        1,
        `print calls str(obj), which calls __str__.`,
      ),
      q(
        "What does @dataclass generate for you?",
        [
          "Database tables",
          "__init__, __repr__, __eq__ from the declared fields",
          "Getters and setters",
          "Nothing",
        ],
        1,
        `It writes the standard boilerplate from the field declarations.`,
      ),
      q(
        "a + b on your objects calls…",
        ["a.__plus__(b)", "a.__add__(b)", "add(a, b)", "It can't work on custom classes"],
        1,
        `Operator syntax maps to magic methods — + is __add__.`,
      ),
    ],
  }),

  L("Generators & Iterators", ["generators"], "advanced", 14, {
    intro: `<p>A generator is a function that produces values one at a time with <code>yield</code>, pausing between each. Instead of building a million-item list in memory, a generator hands out items on demand. This lazy evaluation is how Python processes data streams larger than RAM.</p>`,
    concepts: [
      `<strong>yield</strong> — emit a value, freeze the function until the next request`,
      `<strong>Lazy evaluation</strong> — values are computed only when consumed`,
      `<strong>next()</strong> — pull one value; for-loops do this automatically`,
      `<strong>Generator expressions</strong> — <code>(n*n for n in nums)</code>, like comprehensions but lazy`,
    ],
    examples: [
      ex(
        "A simple generator",
        `def countdown(n):\n    while n > 0:\n        yield n\n        n -= 1\n    yield "liftoff!"\n\nfor x in countdown(3):\n    print(x)`,
        `3\n2\n1\nliftoff!`,
      ),
      ex(
        "Lazy means cheap",
        `def evens():\n    n = 0\n    while True:\n        yield n\n        n += 2\n\ngen = evens()  # infinite! but nothing computed yet\nprint(next(gen), next(gen), next(gen))`,
        `0 2 4`,
        `An infinite sequence is fine — values exist only when you ask.`,
      ),
    ],
    realWorld: `Reading a 10 GB log file line by line, paginating through an API, streaming database rows — generators let production code process unbounded data with constant memory. Python's own range() works on this principle.`,
    practice: `Write a generator <code>squares_up_to(limit)</code> yielding square numbers below the limit. Loop over <code>squares_up_to(100)</code> and print each — then sum a generator expression of the same squares.`,
    mistakes: [
      `Trying to reuse an exhausted generator — they're one-shot; create a new one to iterate again`,
      `Calling len() or indexing a generator — they have no length until consumed; wrap in list() if you truly need one`,
    ],
    best: [
      `Return generators from functions that produce sequences — callers choose whether to materialize a list`,
      `Use generator expressions inside sum()/max()/any() — <code>sum(x*x for x in nums)</code> never builds a list`,
    ],
    template: `def squares_up_to(limit):\n    n = 1\n    while n * n < limit:\n        yield n * n\n        n += 1\n\nfor sq in squares_up_to(100):\n    print(sq)\nprint("sum:", sum(squares_up_to(100)))`,
    quiz: [
      q(
        "What does yield do that return doesn't?",
        [
          "Exits faster",
          "Emits a value and pauses, resuming on the next request",
          "Returns multiple values at once",
          "Nothing different",
        ],
        1,
        `yield suspends the function's state; return ends it for good.`,
      ),
      q(
        "What happens when you loop over an already-consumed generator?",
        ["It restarts", "The loop body never runs", "Error on creation", "Values repeat"],
        1,
        `Generators are exhausted after one pass — iteration simply yields nothing.`,
      ),
      q(
        "Why prefer sum(x*x for x in big) over sum([x*x for x in big])?",
        [
          "It's always faster",
          "No intermediate list is built in memory",
          "The list version errors",
          "No reason",
        ],
        1,
        `The generator feeds sum one value at a time — constant memory.`,
      ),
    ],
  }),

  L("Decorators", ["decorators"], "advanced", 16, {
    intro: `<p>A decorator wraps a function with extra behavior — timing, logging, access checks — without touching the function's own code. The <code>@decorator</code> line above a def is just a clean syntax for "replace this function with a wrapped version of itself".</p>`,
    concepts: [
      `<strong>Functions are values</strong> — they can be passed and returned like any object`,
      `<strong>Wrapper pattern</strong> — a function that takes a function and returns an enhanced one`,
      `<strong>@syntax</strong> — <code>@deco</code> above def equals <code>f = deco(f)</code>`,
      `<strong>*args, **kwargs</strong> — wrappers forward any signature`,
    ],
    examples: [
      ex(
        "A logging decorator",
        `def log_calls(func):\n    def wrapper(*args):\n        print("calling", func.__name__, "with", args)\n        result = func(*args)\n        print("->", result)\n        return result\n    return wrapper\n\n@log_calls\ndef add(a, b):\n    return a + b\n\nadd(3, 4)`,
        `calling add with (3, 4)\n-> 7`,
      ),
      ex(
        "The @ line is just sugar",
        `def shout(func):\n    def wrapper():\n        return func().upper() + "!"\n    return wrapper\n\ndef greet():\n    return "hello"\n\ngreet = shout(greet)  # same as @shout\nprint(greet())`,
        `HELLO!`,
      ),
    ],
    realWorld: `You've already met decorators in the wild: Flask's <code>@app.route("/")</code>, pytest's <code>@fixture</code>, Django's <code>@login_required</code>. Authentication on this project's Express routes plays the identical role — wrap the handler, add a check.`,
    practice: `Write a <code>@twice</code> decorator that calls the wrapped function two times. Apply it to a function printing "beep" and confirm you get two beeps from one call.`,
    mistakes: [
      `Forgetting to return the inner function's result — the decorated function silently returns None`,
      `Writing <code>@deco()</code> when the decorator takes no arguments (or forgetting () when it does)`,
    ],
    best: [
      `Use functools.wraps on the wrapper to preserve the original function's name and docstring`,
      `Keep decorators single-purpose: one for timing, one for auth — compose by stacking`,
    ],
    template: `def twice(func):\n    def wrapper(*args):\n        func(*args)\n        func(*args)\n    return wrapper\n\n@twice\ndef beep(name):\n    print("beep", name)\n\nbeep("A")`,
    quiz: [
      q(
        "@deco above def f() is equivalent to…",
        ["deco = f(deco)", "f = deco(f)", "f.deco()", "deco(f) discarded"],
        1,
        `The decorator receives the function and its return value replaces it.`,
      ),
      q(
        "Why do wrappers use *args, **kwargs?",
        [
          "Style",
          "So they can forward any argument signature to the wrapped function",
          "Required by Python",
          "Performance",
        ],
        1,
        `The wrapper doesn't know the target's parameters — splat operators forward everything.`,
      ),
      q(
        "A decorator must return…",
        ["None", "A string", "A callable (usually the wrapper function)", "The original arguments"],
        2,
        `Whatever it returns REPLACES the decorated function — so it must be callable.`,
      ),
    ],
  }),

  L("Consuming Web APIs", ["apis"], "advanced", 16, {
    intro: `<p>Most modern programs talk to other programs over HTTP APIs: weather data, payments, AI models. The request/response cycle is always the same — send a request to a URL, receive structured JSON, handle the failure cases. Python's <code>requests</code> library (or built-in <code>urllib</code>) makes this a few lines.</p>`,
    concepts: [
      `<strong>HTTP methods</strong> — GET reads data, POST sends it`,
      `<strong>Status codes</strong> — 200 OK, 404 not found, 429 rate-limited, 500 server error`,
      `<strong>JSON responses</strong> — <code>response.json()</code> parses into dicts/lists`,
      `<strong>Error handling</strong> — timeouts and bad statuses are normal, plan for them`,
    ],
    examples: [
      ex(
        "A GET request (run locally with requests installed)",
        `import requests\n\nresp = requests.get("https://api.github.com/users/python", timeout=10)\nprint(resp.status_code)\ndata = resp.json()\nprint(data["name"], "-", data["public_repos"], "repos")`,
        `200\nPython - 248 repos`,
      ),
      ex(
        "Defensive API code",
        `def fetch_user(username):\n    try:\n        r = requests.get("https://api.github.com/users/" + username, timeout=10)\n        if r.status_code == 404:\n            return None\n        r.raise_for_status()\n        return r.json()\n    except requests.Timeout:\n        return None`,
        ``,
        `Real API code always handles: not-found, server errors, and timeouts.`,
      ),
    ],
    realWorld: `EduVerse itself does this: the backend you're using right now calls Google's Gemini API with exactly this pattern — POST request, JSON body, status-code checks, timeout, retries. Every integration you'll ever build follows this shape.`,
    practice: `Sketch (in the editor) a function <code>get_temperature(city)</code> that would call a weather API: build the URL, check status, pull a field from the JSON, return a default on failure. Focus on the structure — run it locally with a real API later.`,
    mistakes: [
      `No timeout — a hung server hangs your whole program; always pass one`,
      `Trusting response shape blindly — missing keys raise KeyError; use .get() on API data`,
    ],
    best: [
      `Check status codes before parsing; raise_for_status() turns bad codes into exceptions`,
      `Never hardcode API keys in source — read them from environment variables (exactly like this project's .env)`,
    ],
    template: `# Structure of real API code (requests isn't available in-browser):\ndef get_temperature(city):\n    # r = requests.get(API_URL + city, timeout=10)\n    # if r.status_code != 200: return None\n    # return r.json()["main"]["temp"]\n    fake_response = {"main": {"temp": 21.5}}\n    return fake_response["main"]["temp"]\n\nprint(get_temperature("Cairo"), "C")`,
    quiz: [
      q(
        "Which status code means success?",
        ["404", "200", "500", "302"],
        1,
        `2xx codes are success; 200 is the standard OK.`,
      ),
      q(
        "Why always set a timeout on requests?",
        [
          "Faster responses",
          "So a hung server can't freeze your program forever",
          "Servers require it",
          "It retries automatically",
        ],
        1,
        `Without a timeout, a dead connection blocks indefinitely.`,
      ),
      q(
        "Where should API keys live?",
        [
          "In the source code",
          "In environment variables / .env files excluded from git",
          "In the README",
          "In comments",
        ],
        1,
        `Secrets in code leak through version control — environment config is the standard.`,
      ),
    ],
  }),

  L("Pythonic Patterns", ["advanced-python"], "advanced", 14, {
    intro: `<p>"Pythonic" code uses the language's idioms — patterns the community has converged on because they're readable and robust. This capstone lesson collects the ones professionals expect to see: enumerate, zip, unpacking, conditional expressions, and EAFP error style.</p>`,
    concepts: [
      `<strong>enumerate(items)</strong> — index + item without manual counters`,
      `<strong>zip(a, b)</strong> — iterate two sequences in lockstep`,
      `<strong>Unpacking</strong> — <code>first, *rest = items</code>; <code>a, b = b, a</code>`,
      `<strong>Ternary</strong> — <code>x = "even" if n % 2 == 0 else "odd"</code>`,
      `<strong>EAFP</strong> — "easier to ask forgiveness": try it, catch the exception`,
    ],
    examples: [
      ex(
        "enumerate and zip",
        `names = ["Ada", "Bo", "Cy"]\nscores = [95, 88, 91]\nfor i, (name, score) in enumerate(zip(names, scores), 1):\n    print(i, name, score)`,
        `1 Ada 95\n2 Bo 88\n3 Cy 91`,
      ),
      ex(
        "Unpacking and ternary",
        `first, *rest = [10, 20, 30, 40]\nprint(first, rest)\nn = 7\nparity = "even" if n % 2 == 0 else "odd"\nprint(n, "is", parity)`,
        `10 [20, 30, 40]\n7 is odd`,
      ),
    ],
    realWorld: `Code review in Python shops polices exactly these idioms: a manual index counter where enumerate belongs, or index-juggling where zip fits, marks code as translated-from-another-language. Idiomatic code is easier for the team to maintain.`,
    practice: `Given parallel lists of products and prices, print a numbered receipt using enumerate + zip, compute the total with sum(), and mark each line "(deal)" with a ternary when price < 10.`,
    mistakes: [
      `<code>for i in range(len(items))</code> just to access items[i] — use enumerate`,
      `zip stops at the SHORTEST sequence — silent data loss if lengths differ unexpectedly`,
    ],
    best: [
      `Follow PEP 8 (the style guide): snake_case, 4-space indents, readable line lengths`,
      `Choose the idiom that reads as English — "for index, item in enumerate" says exactly what it does`,
    ],
    template: `products = ["pen", "notebook", "backpack"]\nprices = [3, 8, 45]\nfor i, (item, price) in enumerate(zip(products, prices), 1):\n    tag = " (deal)" if price < 10 else ""\n    print(i, item, "$" + str(price) + tag)\nprint("Total: $" + str(sum(prices)))`,
    quiz: [
      q(
        "What replaces 'for i in range(len(xs)): use xs[i]'?",
        ["map", "for i, x in enumerate(xs):", "zip(xs)", "while loops"],
        1,
        `enumerate yields (index, item) pairs directly.`,
      ),
      q(
        'zip([1,2,3], ["a","b"]) yields how many pairs?',
        ["3", "2", "1", "Error"],
        1,
        `zip stops at the shortest input — two pairs.`,
      ),
      q(
        "What does first, *rest = [1,2,3] assign?",
        ["first=1, rest=[2,3]", "first=[1], rest=[2,3]", "Error", "first=1, rest=(2,3)"],
        0,
        `Star-unpacking collects the remainder into a list.`,
      ),
    ],
  }),
];

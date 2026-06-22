import { L, q, ex, LessonDef } from "./types";

/** Python curriculum — Part A: fundamentals (lessons 1–18). */
export const pythonA: LessonDef[] = [
  L("Hello, Python!", ["io"], "beginner", 8, {
    intro: `<p>Every program needs a way to communicate with the person running it. In Python, <code>print()</code> writes text to the screen. It's the first tool you learn because you'll use it constantly — to show results, to debug, and to understand what your code is doing.</p>`,
    concepts: [
      `<strong>print()</strong> — writes values to the console`,
      `<strong>Strings</strong> — text wrapped in quotes: <code>"Hello"</code> or <code>'Hello'</code>`,
      `<strong>Comments</strong> — lines starting with <code>#</code> are ignored by Python`,
      `Python executes your file top to bottom, line by line`,
    ],
    examples: [
      ex(
        "A first program",
        `# My first program\nprint("Hello, World!")\nprint("Python is fun")`,
        `Hello, World!\nPython is fun`,
      ),
      ex(
        "Printing several values at once",
        `print("Year:", 2026)\nprint("2 + 2 =", 2 + 2)`,
        `Year: 2026\n2 + 2 = 4`,
        `<code>print()</code> separates multiple values with a space and evaluates math before printing.`,
      ),
    ],
    realWorld: `Every language has its "write to the console" tool — and professional developers still use it daily. Server logs, build scripts, and quick debugging sessions all start with printing values to see what's happening inside a program.`,
    practice: `Print three lines: your name, the language you're learning, and the result of <code>7 * 6</code> — using one <code>print()</code> per line.`,
    mistakes: [
      `Forgetting quotes: <code>print(hello)</code> fails with <code>NameError</code> because Python looks for a variable named hello`,
      `Mismatched quotes: <code>print("hi')</code> is a syntax error — open and close with the same quote type`,
    ],
    best: [
      `Use comments to explain <em>why</em>, not what — the code already shows what`,
      `Keep one statement per line while you're learning; it makes errors easier to find`,
    ],
    template: `# Print your own three lines below\nprint("Hello, World!")\nprint("Year:", 2026)\nprint("2 + 2 =", 2 + 2)`,
    quiz: [
      q(
        'What does print("5" ) output compared to print(5)?',
        [
          "They both print 5",
          "The first errors",
          "The second errors",
          "The first prints quotes too",
        ],
        0,
        `Both display 5 — but the first is text (a string) and the second is a number. The difference matters later.`,
      ),
      q(
        "Which line is a valid comment?",
        ["// note", "# note", "<!-- note -->", "** note **"],
        1,
        `Python comments start with #. The others belong to JavaScript, HTML, and Markdown.`,
      ),
      q(
        "What happens when Python runs print(greeting) and greeting was never defined?",
        ["Prints empty text", "Prints the word greeting", "NameError", "SyntaxError"],
        2,
        `Unquoted words are treated as variable names — using an undefined one raises NameError.`,
      ),
    ],
  }),

  L("Variables & Assignment", ["variables", "data-types"], "beginner", 10, {
    intro: `<p>A variable is a name attached to a value. Instead of repeating the value everywhere, you store it once and refer to it by name. Python creates a variable the moment you assign to it — no declaration keyword needed.</p>`,
    concepts: [
      `<strong>Assignment</strong> — <code>name = value</code> binds a name to a value`,
      `<strong>Dynamic typing</strong> — Python infers the type from the value`,
      `<strong>Reassignment</strong> — a name can point to a new value (even a new type) later`,
      `<strong>Naming rules</strong> — letters, digits, underscores; can't start with a digit; case-sensitive`,
    ],
    examples: [
      ex(
        "Creating and using variables",
        `name = "Ada"\nage = 36\nprint(name, "is", age)`,
        `Ada is 36`,
      ),
      ex(
        "Reassignment and swapping",
        `x = 1\ny = 2\nx, y = y, x\nprint(x, y)`,
        `2 1`,
        `Python can swap two variables in one line — most languages need a temporary variable.`,
      ),
    ],
    realWorld: `Configuration values, user data, scores in a game, totals in a shopping cart — all of it lives in variables. Choosing clear variable names is one of the highest-impact habits in professional code review.`,
    practice: `Create variables <code>city</code>, <code>population</code>, and <code>country</code> with values of your choice, then print a sentence using all three.`,
    mistakes: [
      `Using a variable before assigning it — Python raises <code>NameError</code>`,
      `Invalid names: <code>2nd_place = 1</code> and <code>my-score = 5</code> are syntax errors (starts with digit / contains a hyphen)`,
    ],
    best: [
      `Use descriptive snake_case names: <code>total_price</code>, not <code>tp</code>`,
      `Don't shadow built-ins — naming a variable <code>list</code> or <code>print</code> breaks those functions for the rest of the program`,
    ],
    template: `city = "Cairo"\npopulation = 10100000\ncountry = "Egypt"\nprint(city, "in", country, "has", population, "people")`,
    quiz: [
      q(
        "Which is a valid Python variable name?",
        ["user-name", "2players", "total_score", "class"],
        2,
        `Hyphens and leading digits are invalid, and class is a reserved keyword. snake_case with underscores is the Python convention.`,
      ),
      q(
        'After x = 5 then x = "five", what is x?',
        ["5", '"five"', "Error — type can't change", "None"],
        1,
        `Python is dynamically typed: a name can be re-bound to a value of any type.`,
      ),
      q(
        "What does a, b = 10, 20 do?",
        ["Syntax error", "a=10 and b=20", "a=20 and b=10", "Creates a tuple named ab"],
        1,
        `This is tuple unpacking — values assign left to right.`,
      ),
    ],
  }),

  L("Numbers & Math", ["data-types", "operators"], "beginner", 10, {
    intro: `<p>Python has two main number types: <code>int</code> for whole numbers and <code>float</code> for decimals. Combined with arithmetic operators, Python works like a precise calculator — including a few operators most calculators don't have.</p>`,
    concepts: [
      `<strong>Operators</strong> — <code>+</code> <code>-</code> <code>*</code> <code>/</code>, plus <code>//</code> (floor division), <code>%</code> (remainder), <code>**</code> (power)`,
      `<strong>int vs float</strong> — <code>/</code> always produces a float; <code>//</code> keeps it whole`,
      `<strong>Precedence</strong> — <code>**</code> before <code>*</code>/<code>/</code> before <code>+</code>/<code>-</code>; parentheses override`,
      `<strong>Augmented assignment</strong> — <code>count += 1</code> is short for <code>count = count + 1</code>`,
    ],
    examples: [
      ex(
        "The seven operators",
        `a, b = 17, 5\nprint(a + b, a - b, a * b)\nprint(a / b)   # true division\nprint(a // b)  # floor division\nprint(a % b)   # remainder\nprint(a ** 2)  # power`,
        `22 12 85\n3.4\n3\n2\n289`,
      ),
      ex(
        "A real calculation",
        `bill = 60.0\npeople = 4\ntip = bill * 0.15\nper_person = (bill + tip) / people\nprint("Each pays:", per_person)`,
        `Each pays: 17.25`,
      ),
    ],
    realWorld: `The modulo operator <code>%</code> shows up everywhere in real code: checking even/odd numbers, wrapping around a clock (<code>hour % 24</code>), cycling through colors in a chart, and splitting items into rows and columns.`,
    practice: `A movie is 147 minutes long. Use <code>//</code> and <code>%</code> to print its length as hours and minutes (expected: 2 hours 27 minutes).`,
    mistakes: [
      `Expecting <code>10 / 2</code> to be an int — it's <code>5.0</code>; use <code>//</code> when you need whole numbers`,
      `Floating point surprises: <code>0.1 + 0.2 == 0.3</code> is False — compare floats with a tolerance, not equality`,
    ],
    best: [
      `Use parentheses to make precedence obvious, even when not strictly needed`,
      `Use <code>round(value, 2)</code> when displaying money — but store exact cents (ints) in serious financial code`,
    ],
    template: `minutes = 147\nhours = minutes // 60\nrest = minutes % 60\nprint(hours, "hours", rest, "minutes")`,
    quiz: [
      q(
        "What is 7 // 2?",
        ["3.5", "3", "4", "1"],
        1,
        `Floor division drops the fractional part: 7 // 2 is 3.`,
      ),
      q(
        "What is 2 ** 3 ** 2?",
        ["64", "512", "36", "Error"],
        1,
        `** is right-associative: 3 ** 2 = 9 first, then 2 ** 9 = 512.`,
      ),
      q(
        "Which expression checks if n is even?",
        ["n / 2 == 0", "n % 2 == 0", "n // 2 == 0", "n ** 2 == 0"],
        1,
        `A number is even when dividing by 2 leaves remainder 0 — that's exactly what % tests.`,
      ),
    ],
  }),

  L("User Input", ["io", "data-types"], "beginner", 10, {
    intro: `<p>Programs get interesting when they react to the user. <code>input()</code> pauses the program, waits for the user to type something, and returns it. One crucial detail: it <em>always</em> returns a string, even if the user types a number.</p>`,
    concepts: [
      `<strong>input(prompt)</strong> — shows the prompt and returns what the user typed`,
      `<strong>Type conversion</strong> — <code>int()</code>, <code>float()</code>, <code>str()</code> convert between types`,
      `<strong>Why conversion matters</strong> — <code>"5" + "5"</code> is <code>"55"</code>, but <code>5 + 5</code> is <code>10</code>`,
    ],
    examples: [
      ex(
        "Reading text",
        `name = input("Your name: ")\nprint("Welcome,", name)`,
        `Your name: Ada\nWelcome, Ada`,
      ),
      ex(
        "Reading numbers (the right way)",
        `age_text = input("Age: ")\nage = int(age_text)\nprint("Next year you'll be", age + 1)`,
        `Age: 21\nNext year you'll be 22`,
        `Without <code>int()</code>, <code>age + 1</code> would crash: you can't add a number to a string.`,
      ),
    ],
    realWorld: `Command-line tools — installers, git, deployment scripts — all read user input. The string-vs-number lesson generalizes everywhere: web forms and APIs also deliver text that your code must validate and convert before doing math.`,
    practice: `Ask the user for two numbers and print their sum and product. Make sure 3 and 4 give 7 and 12, not 34!`,
    mistakes: [
      `Doing math on raw input: <code>input("n: ") * 2</code> repeats the string instead of doubling the number`,
      `Converting non-numeric text: <code>int("abc")</code> raises <code>ValueError</code> — real programs validate first or handle the exception`,
    ],
    best: [
      `Convert input immediately at the boundary: <code>n = int(input("n: "))</code>`,
      `Write clear prompts that show the expected format, e.g. <code>"Birth year (YYYY): "</code>`,
    ],
    template: `a = int(input("First number: "))\nb = int(input("Second number: "))\nprint("Sum:", a + b)\nprint("Product:", a * b)`,
    quiz: [
      q(
        "What type does input() always return?",
        ["int", "float", "str", "Depends on what was typed"],
        2,
        `input() always returns a string — converting it is your job.`,
      ),
      q(
        "The user types 7. What does input() * 2 give?",
        ["14", '"77"', "Error", '"14"'],
        1,
        `Multiplying a string repeats it: \"7\" * 2 is \"77\".`,
      ),
      q(
        'What does int("3.9") do?',
        ["Returns 3", "Returns 4", "Raises ValueError", "Returns 3.9"],
        2,
        `int() can't parse a decimal string directly — use float(\"3.9\") first, then int() to truncate.`,
      ),
    ],
  }),

  L("Strings & Slicing", ["strings"], "beginner", 12, {
    intro: `<p>A string is a sequence of characters, and Python gives you precise tools to take it apart. Each character has a position (index) starting at 0, and slicing lets you extract any portion with <code>[start:end]</code> syntax.</p>`,
    concepts: [
      `<strong>Indexing</strong> — <code>s[0]</code> is the first character, <code>s[-1]</code> the last`,
      `<strong>Slicing</strong> — <code>s[start:end]</code> includes start, excludes end`,
      `<strong>Step</strong> — <code>s[::2]</code> takes every 2nd char; <code>s[::-1]</code> reverses`,
      `<strong>len()</strong> — number of characters`,
      `<strong>Immutability</strong> — strings can't be changed in place; operations build new strings`,
    ],
    examples: [
      ex(
        "Indexing and length",
        `word = "Python"\nprint(word[0], word[-1])\nprint(len(word))`,
        `P n\n6`,
      ),
      ex(
        "Slicing",
        `s = "programming"\nprint(s[0:3])\nprint(s[3:])\nprint(s[::-1])`,
        `pro\ngramming\ngnimmargorp`,
        `Leaving a side empty means "from the beginning" or "to the end".`,
      ),
    ],
    realWorld: `Slicing is how real code extracts file extensions (<code>name[-4:]</code>), area codes from phone numbers, or the date part of a timestamp string. Text processing is a huge share of everyday programming.`,
    practice: `Given <code>email = "ada.lovelace@example.com"</code>, print the username (before the @) and the domain (after the @) using slicing with <code>email.index("@")</code>.`,
    mistakes: [
      `Off-by-one confusion: <code>s[1:3]</code> gives characters 1 and 2 — the end index is excluded`,
      `<code>s[0] = "X"</code> raises TypeError — strings are immutable; build a new one instead`,
    ],
    best: [
      `Prefer negative indices like <code>s[-1]</code> over <code>s[len(s)-1]</code>`,
      `When slices get complex, name them: <code>domain = email[at_pos+1:]</code> reads better than inline math`,
    ],
    template: `email = "ada.lovelace@example.com"\nat = email.index("@")\nprint("User:", email[:at])\nprint("Domain:", email[at+1:])`,
    quiz: [
      q(
        'For s = "hello", what is s[1:4]?',
        ['"hel"', '"ell"', '"ello"', '"llo"'],
        1,
        `Start index 1 (e) through index 3 (l) — the end index 4 is excluded.`,
      ),
      q(
        "What does s[::-1] do?",
        ["Removes the first char", "Errors", "Reverses the string", "Sorts the characters"],
        2,
        `A step of -1 walks the string backwards — the idiomatic Python reverse.`,
      ),
      q(
        'Why does s[0] = "H" fail?',
        ["Index 0 doesn't exist", "Strings are immutable", "Wrong quote type", "It doesn't fail"],
        1,
        `Strings can't be modified in place. Create a new string: s = \"H\" + s[1:].`,
      ),
    ],
  }),

  L("String Methods", ["strings"], "beginner", 12, {
    intro: `<p>Strings come with dozens of built-in methods — small tools for cleaning, searching, and transforming text. Because strings are immutable, every method returns a <em>new</em> string and leaves the original untouched.</p>`,
    concepts: [
      `<strong>Case</strong> — <code>.upper()</code>, <code>.lower()</code>, <code>.title()</code>`,
      `<strong>Cleaning</strong> — <code>.strip()</code> removes surrounding whitespace`,
      `<strong>Searching</strong> — <code>.find()</code>, <code>.count()</code>, <code>.startswith()</code>, <code>in</code>`,
      `<strong>Transforming</strong> — <code>.replace(old, new)</code>, <code>.split(sep)</code>, <code>sep.join(list)</code>`,
    ],
    examples: [
      ex(
        "Cleaning user input",
        `raw = "  Ada Lovelace  "\nclean = raw.strip().title()\nprint("[" + clean + "]")`,
        `[Ada Lovelace]`,
      ),
      ex(
        "Split and join",
        `csv = "red,green,blue"\nparts = csv.split(",")\nprint(parts)\nprint(" | ".join(parts))`,
        `['red', 'green', 'blue']\nred | green | blue`,
        `split breaks a string into a list; join glues a list back into a string.`,
      ),
    ],
    realWorld: `Every signup form you've ever used runs strings through this exact pipeline: strip whitespace, normalize case, validate the format. Log analysis, spreadsheet imports, and chat commands are all split/join work.`,
    practice: `Clean the string <code>"  pYtHon Is GREAT  "</code> into <code>"Python is great"</code> using strip, capitalize/lower, and replace as needed.`,
    mistakes: [
      `Forgetting methods return new strings: <code>name.strip()</code> alone does nothing — assign it: <code>name = name.strip()</code>`,
      `Confusing <code>.find()</code> (returns -1 when missing) with <code>.index()</code> (raises ValueError)`,
    ],
    best: [
      `Chain methods for readable pipelines: <code>raw.strip().lower().replace(" ", "-")</code>`,
      `Use <code>"sub" in text</code> for existence checks — it reads better than <code>.find() != -1</code>`,
    ],
    template: `raw = "  pYtHon Is GREAT  "\nresult = raw.strip().lower().capitalize()\nprint(result)`,
    quiz: [
      q(
        'After s = "hi"; s.upper(), what is s?',
        ['"HI"', '"hi"', '"Hi"', "Error"],
        1,
        `Methods return new strings — s is unchanged unless you reassign it.`,
      ),
      q(
        'What does "a-b-c".split("-") return?',
        ['"abc"', "['a','b','c']", "('a','b','c')", "3"],
        1,
        `split returns a list of the pieces between separators.`,
      ),
      q(
        "Which joins ['a','b'] into \"a+b\"?",
        ["['a','b'].join('+')", "'+'.join(['a','b'])", "join(['a','b'], '+')", "['a','b'] + '+'"],
        1,
        `In Python the separator string owns the join method.`,
      ),
    ],
  }),

  L("Booleans & Comparisons", ["data-types", "operators"], "beginner", 8, {
    intro: `<p>Programs make decisions, and decisions need yes/no answers. The <code>bool</code> type has exactly two values — <code>True</code> and <code>False</code> — and comparison operators produce them.</p>`,
    concepts: [
      `<strong>Comparisons</strong> — <code>==</code>, <code>!=</code>, <code>&lt;</code>, <code>&gt;</code>, <code>&lt;=</code>, <code>&gt;=</code>`,
      `<strong>= vs ==</strong> — one assigns, two compares`,
      `<strong>Truthiness</strong> — empty things (<code>""</code>, <code>[]</code>, <code>0</code>) are falsy; everything else is truthy`,
      `<strong>Chained comparisons</strong> — <code>18 &lt;= age &lt; 65</code> works in Python`,
    ],
    examples: [
      ex(
        "Comparisons produce booleans",
        `score = 85\nprint(score >= 60)\nprint(score == 100)\nprint("a" < "b")  # strings compare alphabetically`,
        `True\nFalse\nTrue`,
      ),
      ex(
        "Truthiness",
        `print(bool(""), bool("hi"))\nprint(bool(0), bool(42))\nprint(bool([]), bool([1]))`,
        `False True\nFalse True\nFalse True`,
      ),
    ],
    realWorld: `Access control is boolean logic: <code>is_logged_in and has_permission</code>. So are feature flags, form validation, and game states. Bugs in boolean conditions are among the most common — and most testable — in real systems.`,
    practice: `Set <code>temp = 31</code>. Print three booleans: is it freezing (≤ 0), is it comfortable (18–26 inclusive, use a chained comparison), is it a heatwave (≥ 35)?`,
    mistakes: [
      `Writing <code>if x = 5:</code> — assignment in a condition is a syntax error; use <code>==</code>`,
      `Comparing different types: <code>"5" == 5</code> is False — convert before comparing`,
    ],
    best: [
      `Don't compare to True: write <code>if is_ready:</code>, not <code>if is_ready == True:</code>`,
      `Name booleans as questions: <code>is_valid</code>, <code>has_items</code>, <code>can_edit</code>`,
    ],
    template: `temp = 31\nprint("Freezing:", temp <= 0)\nprint("Comfortable:", 18 <= temp <= 26)\nprint("Heatwave:", temp >= 35)`,
    quiz: [
      q(
        'What is the value of 3 == "3"?',
        ["True", "False", "Error", "None"],
        1,
        `An int never equals a string in Python — no implicit conversion happens.`,
      ),
      q(
        "Which values are falsy?",
        ['0, "", []', '1, "a", [0]', "Only False", "0 and False only"],
        0,
        `Zero, empty string, and empty collections are all falsy.`,
      ),
      q(
        "What does 1 < 2 < 3 evaluate to?",
        ["Error", "True", "False", "2"],
        1,
        `Python chains comparisons: it means (1 < 2) and (2 < 3).`,
      ),
    ],
  }),

  L("If / Elif / Else", ["conditionals"], "beginner", 12, {
    intro: `<p>Conditionals let your program take different paths. Python checks each condition top to bottom, runs the <em>first</em> block whose condition is true, and skips the rest. Indentation — not braces — defines which lines belong to each branch.</p>`,
    concepts: [
      `<strong>if</strong> — runs a block when the condition is true`,
      `<strong>elif</strong> — checked only if everything above was false`,
      `<strong>else</strong> — the fallback when nothing matched`,
      `<strong>Indentation</strong> — consistent 4 spaces define the block structure`,
    ],
    examples: [
      ex(
        "Grading",
        `score = 78\nif score >= 90:\n    grade = "A"\nelif score >= 80:\n    grade = "B"\nelif score >= 70:\n    grade = "C"\nelse:\n    grade = "F"\nprint(grade)`,
        `C`,
        `Order matters: the first true branch wins, so thresholds go from highest to lowest.`,
      ),
      ex(
        "Nested decisions",
        `logged_in = True\nrole = "admin"\nif logged_in:\n    if role == "admin":\n        print("Dashboard: full access")\n    else:\n        print("Dashboard: read-only")\nelse:\n    print("Please log in")`,
        `Dashboard: full access`,
      ),
    ],
    realWorld: `Routing logic in web apps ("if admin show panel, elif member show feed, else show signup"), pricing tiers, shipping rules, and game AI are all if/elif chains at heart.`,
    practice: `Write a ticket-price program: under 5 → free, 5–17 → student price 8, 18–64 → full price 15, 65+ → senior price 10. Test it with ages 3, 12, 30, and 70.`,
    mistakes: [
      `Wrong threshold order: checking <code>score >= 70</code> before <code>score >= 90</code> makes an A impossible`,
      `Inconsistent indentation mixes tabs and spaces — Python raises <code>IndentationError</code>`,
    ],
    best: [
      `Prefer elif chains over deeply nested ifs — flat reads better`,
      `Put the most likely (or cheapest-to-check) condition first when order doesn't change correctness`,
    ],
    template: `age = 12\nif age < 5:\n    price = 0\nelif age <= 17:\n    price = 8\nelif age <= 64:\n    price = 15\nelse:\n    price = 10\nprint("Ticket:", price)`,
    quiz: [
      q(
        "In an if/elif/elif/else chain, how many blocks can run?",
        ["All true ones", "Exactly one", "At most one... else guarantees one", "Two"],
        2,
        `Exactly one block runs — the first true condition, or else as fallback. With else present, exactly one always runs.`,
      ),
      q(
        "score = 95 with 'if score >= 70: C' checked before 'elif score >= 90: A' prints…",
        ["A", "C", "Error", "Nothing"],
        1,
        `The first true branch wins — 95 >= 70 matches immediately. Threshold order is a classic bug.`,
      ),
      q(
        "What defines a block's boundaries in Python?",
        ["Curly braces", "Parentheses", "Indentation", "Semicolons"],
        2,
        `Python uses consistent indentation instead of braces.`,
      ),
    ],
  }),

  L("Logical Operators", ["conditionals", "operators"], "beginner", 10, {
    intro: `<p>Real decisions combine multiple conditions: "if it's the weekend <em>and</em> sunny", "if the cart is empty <em>or</em> payment failed". Python's <code>and</code>, <code>or</code>, and <code>not</code> combine booleans — in plain English words.</p>`,
    concepts: [
      `<strong>and</strong> — true only when both sides are true`,
      `<strong>or</strong> — true when at least one side is true`,
      `<strong>not</strong> — flips a boolean`,
      `<strong>Short-circuit</strong> — Python stops evaluating as soon as the answer is known`,
    ],
    examples: [
      ex(
        "Combining conditions",
        `age = 25\nhas_id = True\nif age >= 18 and has_id:\n    print("Entry allowed")\nif age < 13 or age > 65:\n    print("Discount applies")\nelse:\n    print("Full price")`,
        `Entry allowed\nFull price`,
      ),
      ex(
        "Short-circuit protects against errors",
        `items = []\nif len(items) > 0 and items[0] == "a":\n    print("starts with a")\nelse:\n    print("empty or different")`,
        `empty or different`,
        `Because the left side is False, Python never evaluates <code>items[0]</code> — avoiding an IndexError.`,
      ),
    ],
    realWorld: `Search filters ("in stock AND under $50 AND (red OR blue)") and permission checks ("owner OR admin, AND NOT banned") are everyday uses. Short-circuiting is also a deliberate technique to guard risky checks.`,
    practice: `A loan is approved if income ≥ 3000 and credit_score ≥ 650, or if there's a cosigner. Write the condition and test all three paths.`,
    mistakes: [
      `Writing <code>if x == 1 or 2:</code> — this is always true! <code>2</code> is truthy. Correct: <code>if x == 1 or x == 2:</code> or <code>if x in (1, 2):</code>`,
      `Over-negating: <code>not (a and not b)</code> — simplify with De Morgan's laws before shipping`,
    ],
    best: [
      `Use parentheses to group mixed and/or expressions, even when precedence makes them optional`,
      `Replace long or-chains with membership tests: <code>if status in ("new", "open", "active"):</code>`,
    ],
    template: `income = 2500\ncredit = 700\ncosigner = True\napproved = (income >= 3000 and credit >= 650) or cosigner\nprint("Approved:", approved)`,
    quiz: [
      q(
        "What is True or sketchy_function() — does the function run?",
        ["Yes, always", "No — or short-circuits", "Only if it returns True", "Syntax error"],
        1,
        `or stops at the first truthy value; the left True decides the answer immediately.`,
      ),
      q(
        "Why is 'if x == 1 or 2:' a bug?",
        [
          "Syntax error",
          "2 is always truthy so the condition is always true",
          "or can't follow ==",
          "It compares x to 3",
        ],
        1,
        `It parses as (x == 1) or (2). The literal 2 is truthy, so the branch always runs.`,
      ),
      q(
        "not (a or b) is equivalent to…",
        ["not a or not b", "not a and not b", "a and b", "not a or b"],
        1,
        `De Morgan's law: negation distributes by flipping or into and.`,
      ),
    ],
  }),

  L("While Loops", ["loops"], "beginner", 10, {
    intro: `<p>A <code>while</code> loop repeats a block as long as its condition stays true. It's the right tool when you don't know in advance how many repetitions you need — keep asking until the answer is valid, keep playing until the game ends.</p>`,
    concepts: [
      `<strong>Condition first</strong> — checked before every iteration, including the first`,
      `<strong>Loop variable updates</strong> — something inside the loop must move toward ending it`,
      `<strong>Infinite loops</strong> — a condition that never becomes false runs forever`,
      `<strong>Sentinel pattern</strong> — loop until a special "stop" value appears`,
    ],
    examples: [
      ex(
        "Counting",
        `count = 1\nwhile count <= 5:\n    print("Round", count)\n    count += 1\nprint("Done")`,
        `Round 1\nRound 2\nRound 3\nRound 4\nRound 5\nDone`,
      ),
      ex(
        "Repeat until valid (sentinel)",
        `pin = ""\nwhile pin != "1234":\n    pin = input("Enter PIN: ")\nprint("Unlocked")`,
        `Enter PIN: 0000\nEnter PIN: 1234\nUnlocked`,
      ),
    ],
    realWorld: `Game loops run while the player is alive. Servers loop while accepting connections. Retry logic loops while a request keeps failing (with a max-attempts guard). The while loop is the heartbeat of long-running software.`,
    practice: `Start with <code>n = 100</code>. Repeatedly halve it (integer division) and print each value, stopping when it reaches 0. How many steps did it take?`,
    mistakes: [
      `Forgetting to update the variable: <code>while count <= 5:</code> with no <code>count += 1</code> loops forever`,
      `Off-by-one: <code>while count < 5</code> starting from 1 runs 4 times, not 5`,
    ],
    best: [
      `Make the loop's exit condition obvious at a glance — future readers should see why it terminates`,
      `For "retry" loops, always include an attempt counter so failure can't loop forever`,
    ],
    template: `n = 100\nsteps = 0\nwhile n > 0:\n    n = n // 2\n    steps += 1\n    print(n)\nprint("Steps:", steps)`,
    quiz: [
      q(
        "When is a while condition checked?",
        [
          "After each iteration",
          "Before each iteration",
          "Only once at the start",
          "Only when break runs",
        ],
        1,
        `The condition gates entry to every iteration — if it's false initially, the body never runs.`,
      ),
      q(
        "What's wrong with: while x < 10: print(x)?",
        [
          "Syntax error",
          "x is checked too often",
          "x never changes — infinite loop",
          "print can't be in a while",
        ],
        2,
        `Nothing in the body moves x toward 10, so the condition stays true forever.`,
      ),
      q(
        "count = 0; while count < 3: count += 1 — how many iterations?",
        ["2", "3", "4", "Infinite"],
        1,
        `count goes 0→1→2→3; the check fails when count reaches 3. Three iterations.`,
      ),
    ],
  }),

  L("For Loops & range()", ["loops"], "beginner", 12, {
    intro: `<p>A <code>for</code> loop walks through a sequence one item at a time — characters of a string, items of a list, or numbers produced by <code>range()</code>. When you know <em>what collection</em> you're processing, <code>for</code> is cleaner than <code>while</code>.</p>`,
    concepts: [
      `<strong>for item in sequence:</strong> — the loop variable takes each value in turn`,
      `<strong>range(stop)</strong> — 0 up to (not including) stop`,
      `<strong>range(start, stop, step)</strong> — full control, including counting down`,
      `<strong>Accumulator pattern</strong> — build up a total or result across iterations`,
    ],
    examples: [
      ex(
        "Looping over items and numbers",
        `for ch in "abc":\n    print(ch)\nfor i in range(3):\n    print("i =", i)`,
        `a\nb\nc\ni = 0\ni = 1\ni = 2`,
      ),
      ex(
        "Accumulator: summing",
        `total = 0\nfor n in range(1, 101):\n    total += n\nprint(total)`,
        `5050`,
        `Gauss's classic — summing 1 to 100. range(1, 101) includes 1, excludes 101.`,
      ),
    ],
    realWorld: `Almost everything in software is "for each": for each user send an email, for each row compute a total, for each file run the tests. Iteration plus an accumulator handles a striking share of business logic.`,
    practice: `Print the multiplication table of 7, from <code>7 x 1 = 7</code> to <code>7 x 10 = 70</code>, using a for loop and range.`,
    mistakes: [
      `Expecting <code>range(5)</code> to include 5 — it stops at 4`,
      `Modifying the loop variable inside the loop expecting it to change iteration — for reassigns it each pass`,
    ],
    best: [
      `Name the loop variable after the item: <code>for user in users:</code>, not <code>for x in users:</code>`,
      `Need the position too? Use <code>for i, item in enumerate(items):</code> instead of indexing manually`,
    ],
    template: `for i in range(1, 11):\n    print("7 x", i, "=", 7 * i)`,
    quiz: [
      q(
        "What numbers does range(2, 10, 3) produce?",
        ["2,5,8", "2,5,8,10", "3,6,9", "2,4,6,8"],
        0,
        `Start at 2, step by 3, stop before 10: 2, 5, 8.`,
      ),
      q(
        "How do you loop from 10 down to 1?",
        ["range(10, 1)", "range(10, 0, -1)", "range(1, 10, -1)", "reverse(range(10))"],
        1,
        `A negative step counts down; stop is exclusive so 0 ends the loop at 1.`,
      ),
      q(
        "What is the loop variable in 'for ch in \"hi\":' on the second iteration?",
        ['"h"', '"i"', "1", '"hi"'],
        1,
        `The variable takes each character in order: 'h' then 'i'.`,
      ),
    ],
  }),

  L("Loop Control: break & continue", ["loops"], "beginner", 10, {
    intro: `<p>Sometimes you need to leave a loop early or skip one iteration. <code>break</code> exits the loop entirely; <code>continue</code> jumps straight to the next iteration. Used well they simplify logic; overused they make flow hard to follow.</p>`,
    concepts: [
      `<strong>break</strong> — exit the nearest enclosing loop immediately`,
      `<strong>continue</strong> — skip the rest of this iteration, move to the next`,
      `<strong>else on loops</strong> — runs only if the loop finished <em>without</em> break`,
      `<strong>Search pattern</strong> — loop + break is Python's classic "find first match"`,
    ],
    examples: [
      ex(
        "Finding the first match",
        `nums = [7, 11, 4, 9, 2]\nfor n in nums:\n    if n % 2 == 0:\n        print("First even:", n)\n        break\nelse:\n    print("No even number found")`,
        `First even: 4`,
        `The else clause would run only if no break happened — a uniquely Python feature.`,
      ),
      ex(
        "Skipping with continue",
        `for n in range(1, 8):\n    if n % 2 == 0:\n        continue\n    print(n)`,
        `1\n3\n5\n7`,
      ),
    ],
    realWorld: `Searching a log for the first error, processing records but skipping malformed ones, polling a service until it responds — break and continue map directly onto these everyday patterns.`,
    practice: `Loop through <code>[3, 8, -1, 12, -5, 7]</code>: skip negative numbers with continue, stop entirely (break) if you see a number greater than 10, and print everything else.`,
    mistakes: [
      `Expecting break to exit all nested loops — it only exits the innermost one`,
      `Unreachable code after break/continue in the same block — it will never run`,
    ],
    best: [
      `Prefer break for early-exit searches instead of carrying flag variables around`,
      `If a loop needs multiple breaks and continues, consider extracting it into a function with returns instead`,
    ],
    template: `values = [3, 8, -1, 12, -5, 7]\nfor v in values:\n    if v < 0:\n        continue\n    if v > 10:\n        print("Too big, stopping")\n        break\n    print(v)`,
    quiz: [
      q(
        "What does continue do?",
        [
          "Exits the loop",
          "Skips to the next iteration",
          "Restarts the loop from zero",
          "Pauses the loop",
        ],
        1,
        `continue abandons the current iteration only; the loop itself keeps going.`,
      ),
      q(
        "In nested loops, break exits…",
        ["All loops", "The innermost loop only", "The outermost loop only", "The function"],
        1,
        `break affects only the nearest enclosing loop.`,
      ),
      q(
        "When does a for loop's else clause run?",
        ["Always", "Never", "Only if the loop completed without break", "Only after break"],
        2,
        `loop-else is 'no break happened' — handy for search-failed cases.`,
      ),
    ],
  }),

  L("Lists", ["lists"], "beginner", 12, {
    intro: `<p>A list is an ordered, changeable collection — Python's workhorse data structure. It can hold any mix of types, grow and shrink, and supports the same indexing and slicing you learned for strings.</p>`,
    concepts: [
      `<strong>Creating</strong> — <code>nums = [1, 2, 3]</code>, or <code>[]</code> for empty`,
      `<strong>Indexing & slicing</strong> — <code>nums[0]</code>, <code>nums[-1]</code>, <code>nums[1:3]</code>`,
      `<strong>Mutating</strong> — assign to an index, <code>.append()</code>, <code>.insert()</code>, <code>.remove()</code>, <code>.pop()</code>`,
      `<strong>in</strong> — membership test; <strong>len()</strong> — size`,
    ],
    examples: [
      ex(
        "Building a list",
        `tasks = []\ntasks.append("write code")\ntasks.append("test code")\ntasks.insert(0, "plan")\nprint(tasks)\nprint(len(tasks))`,
        `['plan', 'write code', 'test code']\n3`,
      ),
      ex(
        "Changing and removing",
        `nums = [10, 20, 30, 40]\nnums[1] = 99\nlast = nums.pop()\nnums.remove(10)\nprint(nums, "popped:", last)`,
        `[99, 30] popped: 40`,
        `pop() returns the removed item; remove() searches by value.`,
      ),
    ],
    realWorld: `A playlist, a to-do list, the rows of a search result, messages in a chat — ordered collections are the default shape of application data, and in Python that means lists.`,
    practice: `Start with an empty list. Append five exam scores, replace the lowest one with 100 (find it with <code>min()</code> and <code>.index()</code>), then print the list and its average.`,
    mistakes: [
      `IndexError from <code>nums[len(nums)]</code> — the last valid index is <code>len(nums) - 1</code>`,
      `<code>.remove(x)</code> when x isn't present raises ValueError — check with <code>in</code> first`,
    ],
    best: [
      `Use <code>.append()</code> to grow lists — assigning past the end doesn't work in Python`,
      `Beware aliasing: <code>b = a</code> makes both names point to the same list; use <code>b = a.copy()</code> for an independent copy`,
    ],
    template: `scores = [88, 54, 92, 71, 66]\nlow = min(scores)\nscores[scores.index(low)] = 100\nprint(scores)\nprint("Average:", sum(scores) / len(scores))`,
    quiz: [
      q(
        "After a = [1,2,3]; b = a; b.append(4), what is a?",
        ["[1,2,3]", "[1,2,3,4]", "Error", "[4]"],
        1,
        `b = a copies the reference, not the list — both names see the same object.`,
      ),
      q(
        "Which removes and returns the last item?",
        [".remove(-1)", ".pop()", ".delete()", ".cut()"],
        1,
        `pop() with no argument takes from the end and hands the item back.`,
      ),
      q(
        "What does [1, 2] + [3] produce?",
        ["[1,2,3]", "[1,5]", "Error", "[4, 3]"],
        0,
        `+ concatenates lists into a new list.`,
      ),
    ],
  }),

  L("List Methods & Sorting", ["lists"], "beginner", 12, {
    intro: `<p>Beyond adding and removing, lists support powerful whole-list operations: sorting, reversing, counting, and aggregating. Knowing the difference between methods that change the list and functions that return a new one will save you real debugging time.</p>`,
    concepts: [
      `<strong>.sort()</strong> — sorts in place (changes the list, returns None)`,
      `<strong>sorted(list)</strong> — returns a new sorted list, original untouched`,
      `<strong>reverse=True / key=...</strong> — sort descending, or by a custom rule`,
      `<strong>Aggregates</strong> — <code>sum()</code>, <code>min()</code>, <code>max()</code>, <code>.count()</code>`,
    ],
    examples: [
      ex(
        "sort vs sorted",
        `nums = [3, 1, 4, 1, 5]\nfresh = sorted(nums)\nprint(nums, fresh)\nnums.sort(reverse=True)\nprint(nums)`,
        `[3, 1, 4, 1, 5] [1, 1, 3, 4, 5]\n[5, 4, 3, 1, 1]`,
      ),
      ex(
        "Sorting by a key",
        `words = ["banana", "fig", "cherry"]\nwords.sort(key=len)\nprint(words)`,
        `['fig', 'banana', 'cherry']`,
        `key tells sort what to compare — here, each word's length.`,
      ),
    ],
    realWorld: `"Sort by price", "sort by date", "top 10 by score" — every product list, leaderboard, and inbox you've used runs exactly this: a sort with a key, then a slice.`,
    practice: `Given <code>prices = [49, 5, 120, 32, 89, 17]</code>, print the three cheapest prices (sort, then slice) and the total of all prices.`,
    mistakes: [
      `<code>result = nums.sort()</code> — sort() returns None! Use <code>sorted(nums)</code> if you need the result as a value`,
      `Sorting mixed types: <code>[3, "a"].sort()</code> raises TypeError in Python 3`,
    ],
    best: [
      `Reach for <code>sorted()</code> by default; use <code>.sort()</code> only when you intend to modify in place`,
      `Combine sorting with slicing for "top N" queries: <code>sorted(scores, reverse=True)[:3]</code>`,
    ],
    template: `prices = [49, 5, 120, 32, 89, 17]\ncheapest = sorted(prices)[:3]\nprint("Cheapest three:", cheapest)\nprint("Total:", sum(prices))`,
    quiz: [
      q(
        "What does x = [3,1,2].sort() assign to x?",
        ["[1,2,3]", "None", "[3,1,2]", "Error"],
        1,
        `.sort() mutates the list and returns None — a classic Python gotcha.`,
      ),
      q(
        "How do you sort words by length, longest first?",
        [
          "words.sort(len, reverse)",
          "sorted(words, key=len, reverse=True)",
          "words.sort().reverse()",
          "sorted(words, by=len)",
        ],
        1,
        `key picks the comparison value; reverse=True flips the order.`,
      ),
      q(
        "What is [5,2,8,1][1:3] after sorting the list ascending?",
        ["[2,5]", "[2,8]", "[1,2]", "[5,8]"],
        0,
        `Sorted: [1,2,5,8]; slice 1:3 takes indexes 1 and 2 → [2,5].`,
      ),
    ],
  }),

  L("Nested Loops & 2D Data", ["loops", "lists"], "intermediate", 14, {
    intro: `<p>Put a loop inside a loop and you can process grids: game boards, spreadsheets, pixel data, seating charts. The outer loop picks a row; the inner loop walks that row's items. A list of lists is Python's natural 2D structure.</p>`,
    concepts: [
      `<strong>Nested iteration</strong> — for every row, for every cell`,
      `<strong>2D lists</strong> — <code>grid[row][col]</code> addressing`,
      `<strong>Building combinations</strong> — every pairing of two collections`,
      `<strong>Complexity awareness</strong> — n × m iterations add up fast`,
    ],
    examples: [
      ex(
        "Walking a grid",
        `grid = [[1, 2, 3], [4, 5, 6]]\nfor row in grid:\n    for cell in row:\n        print(cell, end=" ")\n    print()`,
        `1 2 3 \n4 5 6 `,
      ),
      ex(
        "All combinations",
        `sizes = ["S", "M"]\ncolors = ["red", "blue"]\nfor s in sizes:\n    for c in colors:\n        print(s, c)`,
        `S red\nS blue\nM red\nM blue`,
      ),
    ],
    realWorld: `Spreadsheet processing, image filters (every pixel in every row), chess engines, and product variant generation (every size × every color) are all nested loops over 2D structures.`,
    practice: `Build a 3×3 multiplication grid: for rows 1–3 and columns 1–3, print <code>row*col</code> values, one row of three numbers per line.`,
    mistakes: [
      `Swapping row/col indexing: <code>grid[col][row]</code> — works until the grid isn't square, then breaks`,
      `Reusing the same loop variable name in both loops — the inner one silently shadows the outer`,
    ],
    best: [
      `Name loop variables meaningfully: <code>for row in ...: for seat in row:</code>`,
      `If nesting goes three levels deep, extract the inner work into a function for readability`,
    ],
    template: `for row in range(1, 4):\n    line = ""\n    for col in range(1, 4):\n        line += str(row * col) + " "\n    print(line)`,
    quiz: [
      q(
        "How many times does the inner body run for 'for i in range(3): for j in range(4):'?",
        ["7", "12", "3", "4"],
        1,
        `The inner loop runs fully for each outer pass: 3 × 4 = 12.`,
      ),
      q(
        "In grid = [[1,2],[3,4]], what is grid[1][0]?",
        ["1", "2", "3", "4"],
        2,
        `Row index 1 is [3,4]; column 0 of that row is 3.`,
      ),
      q(
        "What prints S1 S2 M1 M2?",
        [
          "Two separate loops",
          "for s in 'SM': for n in '12': print(s+n)",
          "while loops only",
          "A single range",
        ],
        1,
        `Nested loops generate every combination of the outer and inner sequences.`,
      ),
    ],
  }),

  L("Tuples", ["tuples"], "intermediate", 10, {
    intro: `<p>A tuple is like a list that can't be changed: ordered, indexable, but frozen at creation. That constraint is a feature — tuples are perfect for fixed groups like coordinates, RGB colors, or (name, score) pairs, and Python uses them everywhere under the hood.</p>`,
    concepts: [
      `<strong>Creating</strong> — <code>(1, 2)</code>, or just <code>1, 2</code>; single item needs a comma: <code>(1,)</code>`,
      `<strong>Immutable</strong> — no append, no item assignment`,
      `<strong>Unpacking</strong> — <code>x, y = point</code> assigns elements to names`,
      `<strong>Multiple return values</strong> — functions return tuples naturally`,
    ],
    examples: [
      ex(
        "Tuples and unpacking",
        `point = (3, 7)\nx, y = point\nprint("x =", x, "y =", y)\nprint(point[0] * point[1])`,
        `x = 3 y = 7\n21`,
      ),
      ex(
        "Pairs in a loop",
        `entries = [("Ada", 95), ("Linus", 88)]\nfor name, score in entries:\n    print(name, "scored", score)`,
        `Ada scored 95\nLinus scored 88`,
        `Unpacking right inside the for statement is idiomatic Python.`,
      ),
    ],
    realWorld: `Database rows arrive as tuples, dictionaries iterate as (key, value) tuples, and functions like <code>divmod()</code> return result pairs. GPS coordinates and RGB colors are textbook tuples: fixed length, fixed meaning per position.`,
    practice: `Create a list of three (city, temperature) tuples. Loop over it with unpacking and print each as <code>"City: 21°C"</code>, then print the warmest city using <code>max()</code> with a key.`,
    mistakes: [
      `<code>t = (5)</code> is just the number 5 — a one-element tuple needs the comma: <code>(5,)</code>`,
      `Trying <code>t[0] = 9</code> — TypeError; build a new tuple instead`,
    ],
    best: [
      `Use tuples for heterogeneous fixed records, lists for homogeneous growing collections`,
      `Unpack into named variables early — <code>name, score = entry</code> beats <code>entry[0]</code>, <code>entry[1]</code> for readability`,
    ],
    template: `readings = [("Cairo", 35), ("Oslo", 8), ("Tokyo", 21)]\nfor city, temp in readings:\n    print(city + ":", temp, "C")\nhottest = max(readings, key=lambda r: r[1])\nprint("Warmest:", hottest[0])`,
    quiz: [
      q(
        "How do you write a one-element tuple containing 7?",
        ["(7)", "(7,)", "tuple(7)", "[7]"],
        1,
        `Without the trailing comma, (7) is just a parenthesized number.`,
      ),
      q(
        "What does x, y = (10, 20) do?",
        ["Error", "x=10, y=20", "x=(10,20), y undefined", "x=20, y=10"],
        1,
        `Tuple unpacking assigns positionally.`,
      ),
      q(
        "Why choose a tuple over a list?",
        [
          "Faster appends",
          "It signals fixed, unchangeable structure",
          "Tuples can hold mixed types, lists can't",
          "No reason",
        ],
        1,
        `Immutability communicates intent and lets tuples serve as dict keys — lists can't.`,
      ),
    ],
  }),

  L("Sets", ["sets"], "intermediate", 10, {
    intro: `<p>A set is an unordered collection of <em>unique</em> values. Duplicates vanish automatically, and membership tests are extremely fast. Sets also support math-style operations — union, intersection, difference — that turn whole categories of list-wrangling code into one-liners.</p>`,
    concepts: [
      `<strong>Creating</strong> — <code>{1, 2, 3}</code> or <code>set(iterable)</code>; empty set is <code>set()</code>, not <code>{}</code>`,
      `<strong>Uniqueness</strong> — adding an existing value does nothing`,
      `<strong>Set algebra</strong> — <code>&amp;</code> intersection, <code>|</code> union, <code>-</code> difference`,
      `<strong>Fast membership</strong> — <code>x in s</code> doesn't slow down as the set grows`,
    ],
    examples: [
      ex(
        "Dedup in one line",
        `votes = ["ana", "bo", "ana", "cy", "bo"]\nunique = set(votes)\nprint(unique)\nprint(len(unique), "distinct voters")`,
        `{'cy', 'ana', 'bo'}\n3 distinct voters`,
        `Order isn't guaranteed — sets are about membership, not position.`,
      ),
      ex(
        "Set algebra",
        `py_devs = {"ana", "bo", "cy"}\njs_devs = {"bo", "cy", "dee"}\nprint(py_devs & js_devs)\nprint(py_devs | js_devs)\nprint(py_devs - js_devs)`,
        `{'bo', 'cy'}\n{'ana', 'bo', 'cy', 'dee'}\n{'ana'}`,
      ),
    ],
    realWorld: `"Which customers bought both products?" is an intersection. "Have we seen this IP before?" is a membership test. Tag systems, permission checks, and duplicate detection all lean on sets in production code.`,
    practice: `Two playlists share songs: <code>a = {"song1","song2","song3","song4"}</code>, <code>b = {"song3","song4","song5"}</code>. Print the shared songs, songs only in a, and the total distinct song count.`,
    mistakes: [
      `<code>{}</code> creates an empty <em>dict</em>, not a set — use <code>set()</code>`,
      `Indexing a set: <code>s[0]</code> fails — sets have no order to index into`,
    ],
    best: [
      `Converting to a set and back (<code>list(set(items))</code>) is the standard dedup — but know it loses order`,
      `Checking "is x in collection" inside a loop? Convert the collection to a set first for speed`,
    ],
    template: `a = {"song1", "song2", "song3", "song4"}\nb = {"song3", "song4", "song5"}\nprint("Shared:", a & b)\nprint("Only in a:", a - b)\nprint("Distinct total:", len(a | b))`,
    quiz: [
      q(
        "What is len({1, 2, 2, 3, 3, 3})?",
        ["6", "3", "1", "Error"],
        1,
        `Duplicates collapse on creation — the set holds {1, 2, 3}.`,
      ),
      q(
        "How do you create an empty set?",
        ["{}", "set()", "[]", "( )"],
        1,
        `{} is an empty dict; set() is the only way to make an empty set.`,
      ),
      q(
        "Given a = {1,2,3}, b = {2,3,4}: what is a - b?",
        ["{1}", "{4}", "{2,3}", "{1,4}"],
        0,
        `Difference keeps what's in a but not in b.`,
      ),
    ],
  }),

  L("Dictionaries", ["dictionaries"], "intermediate", 14, {
    intro: `<p>A dictionary maps keys to values — like a real dictionary maps words to definitions. Instead of asking "what's at position 3?", you ask "what's the value for this key?". Dicts are the backbone of Python: configuration, JSON data, and even Python objects themselves are dictionaries underneath.</p>`,
    concepts: [
      `<strong>Creating</strong> — <code>{"name": "Ada", "age": 36}</code>`,
      `<strong>Access</strong> — <code>d[key]</code>, or <code>d.get(key, default)</code> to avoid crashes`,
      `<strong>Modifying</strong> — assign to a key to add or overwrite; <code>del d[key]</code> removes`,
      `<strong>Iterating</strong> — <code>.keys()</code>, <code>.values()</code>, <code>.items()</code> for key-value pairs`,
    ],
    examples: [
      ex(
        "A record",
        `user = {"name": "Ada", "age": 36}\nprint(user["name"])\nuser["age"] += 1\nuser["title"] = "Countess"\nprint(user)`,
        `Ada\n{'name': 'Ada', 'age': 37, 'title': 'Countess'}`,
      ),
      ex(
        "Counting with a dict",
        `text = "to be or not to be"\ncounts = {}\nfor word in text.split():\n    counts[word] = counts.get(word, 0) + 1\nprint(counts)`,
        `{'to': 2, 'be': 2, 'or': 1, 'not': 1}`,
        `get(word, 0) returns 0 for unseen words — the canonical counting idiom.`,
      ),
    ],
    realWorld: `Every JSON API response you'll ever consume becomes a dictionary in Python. User profiles, app settings, vote tallies, caches — if data has labels, it lives in a dict.`,
    practice: `Build an inventory dict for a shop: 3 items with quantities. Sell one unit of an item (decrease it), add a brand-new item, then loop over <code>.items()</code> printing <code>"item: qty"</code> lines.`,
    mistakes: [
      `<code>d["missing"]</code> raises KeyError — use <code>.get()</code> or check <code>key in d</code> first`,
      `Using a list as a key — TypeError; keys must be immutable (strings, numbers, tuples)`,
    ],
    best: [
      `Prefer <code>.get(key, default)</code> over try/except for simple lookups with fallbacks`,
      `Iterate <code>for k, v in d.items():</code> when you need both — cleaner than indexing d[k] inside the loop`,
    ],
    template: `inventory = {"apples": 10, "bread": 4, "milk": 7}\ninventory["bread"] -= 1\ninventory["honey"] = 3\nfor item, qty in inventory.items():\n    print(item + ":", qty)`,
    quiz: [
      q(
        'What does d.get("x", 0) return when "x" isn\'t in d?',
        ["KeyError", "None always", "0", '"x"'],
        2,
        `get takes a default — returned instead of raising KeyError.`,
      ),
      q(
        "Which can be a dict key?",
        ["[1, 2]", '{"a": 1}', '("a", 1)', "set()"],
        2,
        `Keys must be immutable — tuples qualify; lists, dicts, and sets don't.`,
      ),
      q(
        "How do you loop over keys AND values together?",
        ["for k, v in d:", "for k, v in d.items():", "for kv in d.all():", "for k in d.values():"],
        1,
        `.items() yields (key, value) tuples ready for unpacking.`,
      ),
    ],
  }),
];

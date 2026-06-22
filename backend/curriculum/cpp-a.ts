import { L, q, ex, LessonDef } from "./types";

/** C++ curriculum — Part A: fundamentals (lessons 1–17). */
export const cppA: LessonDef[] = [
  L("Hello, C++", ["io"], "beginner", 10, {
    intro: `<p>C++ is a compiled language: you write source code, a compiler translates it to machine code, and the result runs at native speed. Every C++ program starts at <code>main()</code> — and your first one prints a line with <code>cout</code>.</p>`,
    concepts: [
      `<strong>#include &lt;iostream&gt;</strong> — pulls in the input/output library`,
      `<strong>int main()</strong> — the entry point; returning 0 signals success`,
      `<strong>cout &lt;&lt;</strong> — streams text to the console; <code>endl</code> or <code>"\\n"</code> ends the line`,
      `<strong>Semicolons & braces</strong> — every statement ends with ; and blocks live inside { }`,
    ],
    examples: [
      ex(
        "The smallest program",
        `#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, C++!" << endl;\n    return 0;\n}`,
        `Hello, C++!`,
      ),
      ex(
        "Chaining output",
        `cout << "2 + 2 = " << 2 + 2 << "\\n";\ncout << "C++ since " << 1983 << "\\n";`,
        `2 + 2 = 4\nC++ since 1983`,
        `<< chains values left to right into the stream.`,
      ),
    ],
    realWorld: `C++ powers the performance-critical layer of the software world: game engines (Unreal), browsers (Chrome), databases (MySQL), and trading systems. Learning it teaches you what the machine is actually doing.`,
    practice: `Write a program that prints three lines: your name, your goal with C++, and the result of <code>19 * 21</code> computed in the cout line itself.`,
    mistakes: [
      `Missing semicolon — the compiler error often points at the NEXT line, which confuses beginners`,
      `Forgetting <code>#include &lt;iostream&gt;</code> — cout is then an "undeclared identifier"`,
    ],
    best: [
      `Always return 0 from main to signal success explicitly`,
      `Prefer <code>"\\n"</code> over <code>endl</code> in loops — endl also flushes the stream, which is slower`,
    ],
    template: `#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, C++!" << "\\n";\n    cout << 19 * 21 << "\\n";\n    return 0;\n}`,
    quiz: [
      q(
        "Where does a C++ program begin executing?",
        ["The first line of the file", "main()", "start()", "Anywhere"],
        1,
        `The runtime calls main() — its body is your program.`,
      ),
      q(
        "What does 'return 0;' in main signify?",
        ["Print zero", "Successful completion", "Restart", "Zero variables used"],
        1,
        `A zero exit code conventionally means success; non-zero signals errors to the OS.`,
      ),
      q(
        "Which header provides cout?",
        ["<stdio.h>", "<iostream>", "<output>", "<console>"],
        1,
        `iostream declares the standard stream objects cout and cin.`,
      ),
    ],
  }),

  L("Variables & Types", ["variables", "data-types"], "beginner", 12, {
    intro: `<p>Unlike Python, C++ is statically typed: every variable has a type fixed at compile time, and the compiler enforces it. This catches errors before the program ever runs — and it's why C++ is fast: the compiler knows exactly how many bytes everything needs.</p>`,
    concepts: [
      `<strong>Core types</strong> — <code>int</code>, <code>double</code>, <code>char</code>, <code>bool</code>, <code>std::string</code>`,
      `<strong>Declaration</strong> — <code>int age = 25;</code> type first, then name, then value`,
      `<strong>Initialization matters</strong> — uninitialized locals hold garbage values`,
      `<strong>sizeof</strong> — reports a type's size in bytes`,
    ],
    examples: [
      ex(
        "Declaring the core types",
        `int age = 25;\ndouble price = 19.99;\nchar grade = 'A';\nbool ready = true;\nstring name = "Ada";\ncout << name << " " << age << " " << grade << "\\n";`,
        `Ada 25 A`,
      ),
      ex(
        "Types have sizes",
        `cout << sizeof(int) << " " << sizeof(double) << " " << sizeof(char) << "\\n";`,
        `4 8 1`,
        `Knowing data sizes is the first step toward understanding memory — C++'s superpower.`,
      ),
    ],
    realWorld: `Static types are documentation the compiler checks: a function asking for <code>int quantity</code> can't silently receive a string. Large teams rely on this — type errors surface at build time, not in production at 3 AM.`,
    practice: `Declare variables for a product: name (string), price (double), stock (int), available (bool). Print them on one line, then change stock and print again.`,
    mistakes: [
      `Using an uninitialized variable: <code>int x; cout &lt;&lt; x;</code> prints garbage — always initialize`,
      `Single vs double quotes: <code>'A'</code> is a char, <code>"A"</code> is a string — they are different types`,
    ],
    best: [
      `Initialize at declaration, ideally with brace syntax: <code>int count{0};</code>`,
      `Pick the right type: int for counts, double for measurements, bool for flags — don't encode booleans as 0/1 ints`,
    ],
    template: `#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    string name = "Laptop";\n    double price = 999.50;\n    int stock = 12;\n    bool available = true;\n    cout << name << " $" << price << " x" << stock << "\\n";\n    return 0;\n}`,
    quiz: [
      q(
        "What does 'int x;' contain before assignment (local variable)?",
        ["0", "null", "An unpredictable garbage value", "Empty string"],
        2,
        `Local primitives aren't auto-zeroed in C++ — reading them is undefined behavior.`,
      ),
      q(
        "Which literal is a char?",
        ['"A"', "'A'", "`A`", "char(A)"],
        1,
        `Single quotes make a char; double quotes make a string literal.`,
      ),
      q(
        "C++ typing is…",
        [
          "Dynamic — types can change",
          "Static — fixed at compile time",
          "Optional",
          "Inferred only",
        ],
        1,
        `Each variable's type is fixed and checked by the compiler.`,
      ),
    ],
  }),

  L("Constants & Type Conversion", ["variables", "data-types", "operators"], "beginner", 10, {
    intro: `<p>Some values should never change — tax rates, board sizes, physical constants. <code>const</code> makes the compiler enforce that. And because C++ mixes types in expressions, you must understand conversions: some happen implicitly, some need an explicit cast.</p>`,
    concepts: [
      `<strong>const</strong> — read-only after initialization; the compiler rejects writes`,
      `<strong>Implicit conversion</strong> — int promotes to double in mixed math`,
      `<strong>Narrowing</strong> — double → int drops the fraction (truncates, no rounding)`,
      `<strong>static_cast&lt;T&gt;(value)</strong> — the explicit, searchable C++ cast`,
    ],
    examples: [
      ex(
        "Constants",
        `const double TAX_RATE = 0.14;\ndouble price = 200;\ncout << "Total: " << price * (1 + TAX_RATE) << "\\n";\n// TAX_RATE = 0.2;  // compile error!`,
        `Total: 228`,
      ),
      ex(
        "Conversions and the division trap",
        `int a = 7, b = 2;\ncout << a / b << "\\n";\ncout << static_cast<double>(a) / b << "\\n";`,
        `3\n3.5`,
        `int / int is integer division. Cast one side to double to get the real quotient.`,
      ),
    ],
    realWorld: `The int-division trap is a real bug class: averages computed as 0, percentages stuck at zero. And const-correctness is a pillar of professional C++ — APIs declare what they won't modify, and the compiler holds them to it.`,
    practice: `Compute the average of three int scores (80, 85, 94) correctly as a double (hint: cast before dividing), with the count stored as a const int.`,
    mistakes: [
      `<code>double avg = sum / count;</code> with both ints — the division truncates BEFORE the assignment`,
      `C-style casts <code>(double)x</code> work but hide intent — prefer static_cast in C++`,
    ],
    best: [
      `Declare everything that doesn't change as const — it documents intent and prevents accidents`,
      `Name constants in CAPS or kCamelCase so readers spot them instantly`,
    ],
    template: `#include <iostream>\nusing namespace std;\n\nint main() {\n    const int COUNT = 3;\n    int sum = 80 + 85 + 94;\n    double avg = static_cast<double>(sum) / COUNT;\n    cout << "Average: " << avg << "\\n";\n    return 0;\n}`,
    quiz: [
      q(
        "What is 9 / 4 in C++ when both are int?",
        ["2.25", "2", "3", "Error"],
        1,
        `Integer division truncates toward zero.`,
      ),
      q(
        "What happens if you assign to a const variable?",
        ["It changes", "Runtime error", "Compile-time error", "It becomes non-const"],
        2,
        `The compiler rejects the program — that's the point of const.`,
      ),
      q(
        "What does static_cast<int>(3.9) give?",
        ["4", "3", "3.9", "Error"],
        1,
        `Conversion to int truncates the fraction — it does not round.`,
      ),
    ],
  }),

  L("User Input with cin", ["io"], "beginner", 10, {
    intro: `<p><code>cin</code> is cout's counterpart: it reads values from the keyboard into variables. Because C++ is typed, cin parses input according to the variable's type — and you need to know what happens when the user types something unexpected.</p>`,
    concepts: [
      `<strong>cin &gt;&gt; x</strong> — reads one whitespace-delimited token into x`,
      `<strong>Chaining</strong> — <code>cin &gt;&gt; a &gt;&gt; b</code> reads two values`,
      `<strong>getline(cin, s)</strong> — reads a whole line including spaces`,
      `<strong>Failure state</strong> — bad input puts cin in an error state until cleared`,
    ],
    examples: [
      ex(
        "Reading numbers",
        `int age;\ncout << "Age: ";\ncin >> age;\ncout << "In 10 years: " << age + 10 << "\\n";`,
        `Age: 20\nIn 10 years: 30`,
      ),
      ex(
        "Words vs whole lines",
        `string first, full;\ncin >> first;            // stops at the first space\ncin.ignore();\ngetline(cin, full);      // reads the rest of the line\ncout << first << " | " << full << "\\n";`,
        `Ada Lovelace King\nAda | Lovelace King`,
        `>> reads a single word; getline captures spaces — mixing them needs ignore().`,
      ),
    ],
    realWorld: `Command-line tools, configuration prompts, and competitive programming all live on stdin. The deeper lesson — input arrives as a stream you must parse and validate — applies to files, sockets, and APIs identically.`,
    practice: `Read two integers (width and height) with one chained cin, then print the rectangle's area and perimeter.`,
    mistakes: [
      `Using <code>cin &gt;&gt;</code> for names with spaces — "Ada Lovelace" stops at "Ada"`,
      `Reading an int when the user types text — cin fails silently and later reads do nothing`,
    ],
    best: [
      `Prompt before reading so users know what's expected`,
      `For robust programs, read a line then parse it — easier to validate than direct >> extraction`,
    ],
    template: `#include <iostream>\nusing namespace std;\n\nint main() {\n    int w, h;\n    cout << "Width and height: ";\n    cin >> w >> h;\n    cout << "Area: " << w * h << "\\n";\n    cout << "Perimeter: " << 2 * (w + h) << "\\n";\n    return 0;\n}`,
    quiz: [
      q(
        'What does cin >> name read for input "Grace Hopper"?',
        ["Grace Hopper", "Grace", "Hopper", "Nothing"],
        1,
        `>> extraction stops at whitespace — it reads one token.`,
      ),
      q(
        "How do you read a full line with spaces?",
        ["cin.line()", "getline(cin, s)", "cin >> s >> s", "readline(s)"],
        1,
        `getline consumes the whole line into a string.`,
      ),
      q(
        "After cin fails on bad input, subsequent reads…",
        [
          "Work normally",
          "Throw exceptions",
          "Silently do nothing until the state is cleared",
          "Crash",
        ],
        2,
        `cin sets a fail flag; you must clear() and discard the bad input.`,
      ),
    ],
  }),

  L("Operators & Arithmetic", ["operators"], "beginner", 10, {
    intro: `<p>C++ arithmetic looks like math, with a few rules worth internalizing: integer division truncates, <code>%</code> gives remainders (ints only), and the increment/decrement operators <code>++</code>/<code>--</code> come in two flavors with subtly different behavior.</p>`,
    concepts: [
      `<strong>Arithmetic</strong> — <code>+ - * / %</code>; no power operator (use <code>pow()</code> from &lt;cmath&gt;)`,
      `<strong>++x vs x++</strong> — both add 1; they differ in what the expression evaluates to`,
      `<strong>Compound assignment</strong> — <code>+=, -=, *=, /=, %=</code>`,
      `<strong>Precedence</strong> — * / % bind tighter than + -; parentheses clarify`,
    ],
    examples: [
      ex(
        "The operators",
        `int a = 17, b = 5;\ncout << a + b << " " << a - b << " " << a * b << "\\n";\ncout << a / b << " remainder " << a % b << "\\n";`,
        `22 12 85\n3 remainder 2`,
      ),
      ex(
        "Pre vs post increment",
        `int x = 5;\ncout << x++ << "\\n";  // prints 5, THEN x becomes 6\ncout << ++x << "\\n";  // x becomes 7, prints 7\ncout << x << "\\n";`,
        `5\n7\n7`,
      ),
    ],
    realWorld: `% drives cyclic behavior everywhere: round-robin scheduling, circular buffers, hash table indexing, and "every 15th frame" game logic. Increment operators are the idiom of every loop you'll read in C-family code.`,
    practice: `A store packs 137 eggs into cartons of 12. Compute full cartons and leftover eggs with / and %, then verify: cartons * 12 + leftover == 137.`,
    mistakes: [
      `Using % with doubles — it's integer-only; use <code>fmod()</code> for floating point`,
      `Complex expressions with x++ inside them — evaluation order traps; keep increments on their own line`,
    ],
    best: [
      `Prefer standalone <code>++i;</code> statements over embedding increments in expressions`,
      `Use compound assignment (<code>total += price;</code>) — clearer and less repetitive`,
    ],
    template: `#include <iostream>\nusing namespace std;\n\nint main() {\n    int eggs = 137;\n    int cartons = eggs / 12;\n    int leftover = eggs % 12;\n    cout << cartons << " cartons, " << leftover << " left\\n";\n    cout << "check: " << (cartons * 12 + leftover) << "\\n";\n    return 0;\n}`,
    quiz: [
      q(
        "int y = x++; — what does y get?",
        ["x + 1", "The original x, before the increment", "Garbage", "Compile error"],
        1,
        `Post-increment evaluates to the OLD value, then increments.`,
      ),
      q("What is 10 % 3?", ["3", "1", "0.33", "3.1"], 1, `Remainder of 10 ÷ 3 is 1.`),
      q(
        "Which computes 2 to the 10th power?",
        ["2 ** 10", "2 ^ 10", "pow(2, 10)", "2.pow(10)"],
        2,
        `C++ has no ** operator; ^ is XOR! Use pow from <cmath>.`,
      ),
    ],
  }),

  L("If / Else & Comparisons", ["conditionals"], "beginner", 10, {
    intro: `<p>Branching in C++ uses <code>if</code>, <code>else if</code>, and <code>else</code> with conditions in parentheses and bodies in braces. The comparison operators return bool — and the assignment-vs-equality trap (<code>=</code> vs <code>==</code>) compiles cleanly while doing the wrong thing, so train your eye now.</p>`,
    concepts: [
      `<strong>Syntax</strong> — <code>if (condition) { ... } else if (...) { ... } else { ... }</code>`,
      `<strong>Comparisons</strong> — <code>== != &lt; &gt; &lt;= &gt;=</code> produce bool`,
      `<strong>Logical ops</strong> — <code>&amp;&amp;</code> and, <code>||</code> or, <code>!</code> not (short-circuiting)`,
      `<strong>Ternary</strong> — <code>cond ? a : b</code> picks a value inline`,
    ],
    examples: [
      ex(
        "Grade brackets",
        `int score = 78;\nif (score >= 90) {\n    cout << "A\\n";\n} else if (score >= 80) {\n    cout << "B\\n";\n} else if (score >= 70) {\n    cout << "C\\n";\n} else {\n    cout << "F\\n";\n}`,
        `C`,
      ),
      ex(
        "Logical operators and ternary",
        `int age = 20;\nbool hasTicket = true;\nif (age >= 18 && hasTicket) {\n    cout << "Entry OK\\n";\n}\nstring label = (age >= 18) ? "adult" : "minor";\ncout << label << "\\n";`,
        `Entry OK\nadult`,
      ),
    ],
    realWorld: `Input validation, state machines, collision checks in games, permission gates in servers — conditional logic is the skeleton of program behavior in every language; C++ just demands you be precise about it.`,
    practice: `Write a leap-year checker: divisible by 4 AND (not divisible by 100 OR divisible by 400). Test with 2024, 1900, and 2000 (true, false, true).`,
    mistakes: [
      `<code>if (x = 5)</code> assigns 5 and is always true — you meant <code>==</code>; many compilers warn, heed them`,
      `Omitting braces then adding a second "body" line — only the first line is governed by the if`,
    ],
    best: [
      `Always use braces, even for single statements — it prevents the classic dangling-statement bug`,
      `Order else-if chains from most specific to most general condition`,
    ],
    template: `#include <iostream>\nusing namespace std;\n\nint main() {\n    int year = 2024;\n    bool leap = (year % 4 == 0) && (year % 100 != 0 || year % 400 == 0);\n    cout << year << (leap ? " is leap\\n" : " is not leap\\n");\n    return 0;\n}`,
    quiz: [
      q(
        "What does 'if (x = 0)' do?",
        [
          "Compares x to 0",
          "Assigns 0 to x; the condition is always false",
          "Compile error",
          "Undefined",
        ],
        1,
        `Assignment returns the assigned value — 0 is false, so the branch never runs (and x was clobbered).`,
      ),
      q(
        "cond ? a : b is…",
        ["A loop", "An inline if/else expression", "A comparison", "Invalid C++"],
        1,
        `The ternary operator selects between two values.`,
      ),
      q(
        "Which is short-circuit AND?",
        ["&", "&&", "and only", "+"],
        1,
        `&& stops evaluating when the left side is false. Single & is bitwise.`,
      ),
    ],
  }),

  L("Switch Statements", ["conditionals"], "beginner", 10, {
    intro: `<p>When you're comparing one variable against many constant values, <code>switch</code> reads better than an else-if ladder. Its quirk: cases <em>fall through</em> into the next one unless you <code>break</code> — a feature occasionally, a bug usually.</p>`,
    concepts: [
      `<strong>switch (value)</strong> — jumps to the matching <code>case</code> label`,
      `<strong>break</strong> — exits the switch; without it, execution falls into the next case`,
      `<strong>default</strong> — the catch-all branch`,
      `<strong>Works on</strong> — integers, chars, enums (not strings!)`,
    ],
    examples: [
      ex(
        "Menu dispatch",
        `int choice = 2;\nswitch (choice) {\n    case 1: cout << "New game\\n"; break;\n    case 2: cout << "Load game\\n"; break;\n    case 3: cout << "Quit\\n"; break;\n    default: cout << "Unknown option\\n";\n}`,
        `Load game`,
      ),
      ex(
        "Intentional fallthrough",
        `char grade = 'B';\nswitch (grade) {\n    case 'A':\n    case 'B':\n        cout << "Passed with merit\\n"; break;\n    case 'C':\n        cout << "Passed\\n"; break;\n    default:\n        cout << "Try again\\n";\n}`,
        `Passed with merit`,
        `Stacking case labels with no code between them is the legitimate use of fallthrough.`,
      ),
    ],
    realWorld: `Switches dispatch events in game loops ("which key was pressed?"), state machines ("which state are we in?"), and protocol parsers ("which message type?"). Compilers can optimize dense switches into jump tables — faster than long if-chains.`,
    practice: `Write a calculator: given two numbers and a char op ('+', '-', '*', '/'), switch on op and print the result; default prints "unknown operator". Don't forget the breaks.`,
    mistakes: [
      `Forgetting break — case 1 silently runs case 2's code as well`,
      `Trying to switch on a std::string — it doesn't compile; use if/else for strings`,
    ],
    best: [
      `Always include a default case, even if it just reports the unexpected value`,
      `If several cases share a body intentionally, stack the labels and comment the fallthrough`,
    ],
    template: `#include <iostream>\nusing namespace std;\n\nint main() {\n    double a = 12, b = 4;\n    char op = '/';\n    switch (op) {\n        case '+': cout << a + b << "\\n"; break;\n        case '-': cout << a - b << "\\n"; break;\n        case '*': cout << a * b << "\\n"; break;\n        case '/': cout << a / b << "\\n"; break;\n        default:  cout << "unknown operator\\n";\n    }\n    return 0;\n}`,
    quiz: [
      q(
        "What happens without break between cases?",
        [
          "Compile error",
          "Execution falls through into the next case",
          "The switch exits",
          "Only default runs",
        ],
        1,
        `Fallthrough continues into the next case's code — the #1 switch bug.`,
      ),
      q(
        "Which type can NOT be switched on?",
        ["int", "char", "std::string", "enum"],
        2,
        `switch requires integral types; strings need if/else chains.`,
      ),
      q(
        "What is default for?",
        ["The first case", "Code when no case matches", "Error handling only", "Required syntax"],
        1,
        `default is the catch-all branch, like a final else.`,
      ),
    ],
  }),

  L("While & Do-While Loops", ["loops"], "beginner", 10, {
    intro: `<p>C++ has two condition-driven loops: <code>while</code> checks before each pass, and <code>do-while</code> checks <em>after</em> — guaranteeing the body runs at least once. That difference makes do-while the natural fit for "ask, then repeat until valid" interactions.</p>`,
    concepts: [
      `<strong>while (cond) { }</strong> — may run zero times`,
      `<strong>do { } while (cond);</strong> — always runs at least once (note the semicolon)`,
      `<strong>Progress requirement</strong> — the body must move toward ending the condition`,
      `<strong>Loop counters</strong> — declare and update around the condition`,
    ],
    examples: [
      ex(
        "Halving with while",
        `int n = 100;\nwhile (n > 1) {\n    n = n / 2;\n    cout << n << " ";\n}\ncout << "\\n";`,
        `50 25 12 6 3 1 `,
      ),
      ex(
        "Validate with do-while",
        `int pin;\ndo {\n    cout << "PIN (1000-9999): ";\n    cin >> pin;\n} while (pin < 1000 || pin > 9999);\ncout << "Accepted\\n";`,
        `PIN (1000-9999): 99\nPIN (1000-9999): 4321\nAccepted`,
        `The prompt must run at least once — exactly what do-while guarantees.`,
      ),
    ],
    realWorld: `Game loops (while running), network retry loops, and menu systems (do: show menu, while choice != quit) are the direct production uses. Pick the loop whose guarantee matches the logic.`,
    practice: `Simulate a savings account: start at 1000, add 5% interest each year inside a while loop, and count how many years until the balance exceeds 2000.`,
    mistakes: [
      `Forgetting the semicolon after <code>do { } while (cond);</code> — compile error`,
      `Infinite loops from untouched conditions — every while needs visible progress`,
    ],
    best: [
      `Use do-while only when "at least once" is genuinely required — while is the default`,
      `Guard retry loops with an attempt limit so external failures can't spin forever`,
    ],
    template: `#include <iostream>\nusing namespace std;\n\nint main() {\n    double balance = 1000;\n    int years = 0;\n    while (balance <= 2000) {\n        balance *= 1.05;\n        years++;\n    }\n    cout << years << " years -> " << balance << "\\n";\n    return 0;\n}`,
    quiz: [
      q(
        "How many times does a do-while body run at minimum?",
        ["0", "1", "2", "Depends"],
        1,
        `The condition is tested after the first pass — one run is guaranteed.`,
      ),
      q(
        "while (count < 5) with count starting at 10 runs…",
        ["5 times", "10 times", "0 times", "Forever"],
        2,
        `The condition is false on entry, so the body is skipped entirely.`,
      ),
      q(
        "What's syntactically required after do { } while (x > 0)?",
        ["Nothing", "A semicolon", "A break", "An else"],
        1,
        `do-while is a statement and ends with ;`,
      ),
    ],
  }),

  L("For Loops", ["loops"], "beginner", 12, {
    intro: `<p>The classic C++ for loop packs initialization, condition, and update into one header line: <code>for (int i = 0; i &lt; n; i++)</code>. It's the standard tool for counted iteration, and its three-part anatomy is worth knowing cold — you'll read it thousands of times.</p>`,
    concepts: [
      `<strong>Anatomy</strong> — for (init; condition; update) { body }`,
      `<strong>Scope</strong> — a counter declared in the header exists only inside the loop`,
      `<strong>Nesting</strong> — loops inside loops for grids and combinations`,
      `<strong>break / continue</strong> — exit early / skip to the next iteration`,
    ],
    examples: [
      ex(
        "Counting and accumulating",
        `int total = 0;\nfor (int i = 1; i <= 10; i++) {\n    total += i;\n}\ncout << "Sum 1..10 = " << total << "\\n";`,
        `Sum 1..10 = 55`,
      ),
      ex(
        "Nested: a triangle",
        `for (int row = 1; row <= 4; row++) {\n    for (int s = 0; s < row; s++) {\n        cout << "*";\n    }\n    cout << "\\n";\n}`,
        `*\n**\n***\n****`,
      ),
    ],
    realWorld: `Iterating arrays by index, pixel grids, matrix math, batch processing N records — the counted for loop is the bread and butter of systems code, and the pattern transfers to every C-family language (Java, JavaScript, C#).`,
    practice: `Print the 12×12 corner of a multiplication table: rows 1–4, columns 1–4, values aligned with a tab character <code>"\\t"</code>.`,
    mistakes: [
      `Off-by-one: <code>i &lt;= n</code> vs <code>i &lt; n</code> — one extra or missing iteration`,
      `Modifying the counter inside the body AND in the update — double-stepping chaos`,
    ],
    best: [
      `Declare counters in the header (<code>for (int i = ...)</code>) to keep their scope tight`,
      `Use size_t (or auto) when indexing containers to match their size type`,
    ],
    template: `#include <iostream>\nusing namespace std;\n\nint main() {\n    for (int row = 1; row <= 4; row++) {\n        for (int col = 1; col <= 4; col++) {\n            cout << row * col << "\\t";\n        }\n        cout << "\\n";\n    }\n    return 0;\n}`,
    quiz: [
      q(
        "In for (int i = 0; i < 5; i++), how many iterations?",
        ["4", "5", "6", "Infinite"],
        1,
        `i takes 0,1,2,3,4 — five passes; the loop ends when i reaches 5.`,
      ),
      q(
        "Where does i exist after the loop ends?",
        [
          "Everywhere in main",
          "Nowhere — it's scoped to the loop",
          "Only in headers",
          "Global scope",
        ],
        1,
        `Header-declared variables die with the loop — by design.`,
      ),
      q(
        "Which part of the header runs exactly once?",
        ["The condition", "The update", "The initialization", "The body"],
        2,
        `init runs once before the first condition check.`,
      ),
    ],
  }),

  L("Arrays", ["arrays"], "beginner", 12, {
    intro: `<p>An array is a fixed-size block of elements of one type, sitting contiguously in memory. That contiguity is why arrays are fast — and why C++ won't stop you from reading past the end. You get raw speed; bounds discipline is on you.</p>`,
    concepts: [
      `<strong>Declaration</strong> — <code>int scores[5];</code> or with initializer <code>{90, 85, ...}</code>`,
      `<strong>Indexing</strong> — 0-based; valid indexes are 0 to size-1`,
      `<strong>Size</strong> — fixed at compile time; arrays don't grow`,
      `<strong>Iteration</strong> — classic for by index, or range-for: <code>for (int x : arr)</code>`,
    ],
    examples: [
      ex(
        "Declare, fill, iterate",
        `int scores[5] = {90, 85, 77, 92, 88};\nint sum = 0;\nfor (int i = 0; i < 5; i++) {\n    sum += scores[i];\n}\ncout << "Average: " << sum / 5.0 << "\\n";`,
        `Average: 86.4`,
      ),
      ex(
        "Range-based for",
        `int primes[] = {2, 3, 5, 7, 11};\nfor (int p : primes) {\n    cout << p << " ";\n}\ncout << "\\n";`,
        `2 3 5 7 11 `,
        `Range-for reads cleanly when you don't need the index.`,
      ),
    ],
    realWorld: `Audio buffers, pixel rows, sensor readings, network packets — fixed-size contiguous data is everywhere in systems programming. Understanding raw arrays also unlocks understanding of how vectors and strings work underneath.`,
    practice: `Store 6 daily temperatures in an array. Find the maximum and its day-index with one loop, then print "Hottest: day N (X degrees)".`,
    mistakes: [
      `Out-of-bounds access: <code>scores[5]</code> on a 5-element array compiles fine and corrupts memory — undefined behavior`,
      `Expecting assignment to copy arrays: <code>a = b;</code> doesn't compile for raw arrays`,
    ],
    best: [
      `Keep the size in a named constant: <code>const int N = 5; int data[N];</code> — one source of truth for loops`,
      `In modern C++ prefer std::array or std::vector; raw arrays remain essential reading knowledge`,
    ],
    template: `#include <iostream>\nusing namespace std;\n\nint main() {\n    const int N = 6;\n    int temps[N] = {21, 25, 31, 28, 19, 27};\n    int maxIdx = 0;\n    for (int i = 1; i < N; i++) {\n        if (temps[i] > temps[maxIdx]) maxIdx = i;\n    }\n    cout << "Hottest: day " << maxIdx << " (" << temps[maxIdx] << ")\\n";\n    return 0;\n}`,
    quiz: [
      q(
        "Valid indexes for int a[10] are…",
        ["1 to 10", "0 to 10", "0 to 9", "Any int"],
        2,
        `Zero-based: the last element is a[9].`,
      ),
      q(
        "What does reading a[10] on int a[10] do?",
        [
          "Returns 0",
          "Throws an exception",
          "Undefined behavior — may return garbage or crash",
          "Wraps to a[0]",
        ],
        2,
        `C++ performs no bounds checking on raw arrays.`,
      ),
      q(
        "Can a raw C++ array grow at runtime?",
        ["Yes, with append", "Yes, automatically", "No — its size is fixed", "Only global ones"],
        2,
        `Need growth? That's what std::vector is for.`,
      ),
    ],
  }),

  L("C++ Strings", ["data-types", "arrays"], "beginner", 12, {
    intro: `<p><code>std::string</code> is C++'s dynamic text type: it grows as needed, supports + for concatenation, and carries a toolbox of methods. Underneath it manages a character array for you — all the power of arrays with none of the manual bookkeeping.</p>`,
    concepts: [
      `<strong>Creation & concat</strong> — <code>string s = "Hi";  s += " there";</code>`,
      `<strong>Size & access</strong> — <code>.length()</code>, <code>s[i]</code>, <code>.at(i)</code> (bounds-checked)`,
      `<strong>Search & slice</strong> — <code>.find()</code>, <code>.substr(pos, len)</code>`,
      `<strong>Compare</strong> — <code>==</code> works (unlike C-style char arrays!)`,
    ],
    examples: [
      ex(
        "Building and measuring",
        `string first = "Grace";\nstring last = "Hopper";\nstring full = first + " " + last;\ncout << full << " (" << full.length() << " chars)\\n";`,
        `Grace Hopper (12 chars)`,
      ),
      ex(
        "find and substr",
        `string email = "ada@example.com";\nint at = email.find('@');\ncout << "user: " << email.substr(0, at) << "\\n";\ncout << "host: " << email.substr(at + 1) << "\\n";`,
        `user: ada\nhost: example.com`,
      ),
    ],
    realWorld: `Parsing filenames, URLs, config lines, and user input is daily work. std::string is also a gateway drug to the STL: the .find / npos / iterator patterns you learn here recur in every container.`,
    practice: `Given <code>string path = "photos/2026/trip.png"</code>, extract and print the file name and the extension using rfind('/') and rfind('.').`,
    mistakes: [
      `Comparing with == against char arrays in old C code — fine for std::string, a pointer comparison trap for C-strings`,
      `Ignoring <code>string::npos</code>: when find() fails it returns npos, not -1 in a signed sense — check explicitly`,
    ],
    best: [
      `Pass strings to functions as <code>const string&amp;</code> to avoid copying (preview of references!)`,
      `Use .at(i) during learning — it throws on bad indexes instead of corrupting memory`,
    ],
    template: `#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    string path = "photos/2026/trip.png";\n    int slash = path.rfind('/');\n    int dot = path.rfind('.');\n    cout << "file: " << path.substr(slash + 1) << "\\n";\n    cout << "ext:  " << path.substr(dot + 1) << "\\n";\n    return 0;\n}`,
    quiz: [
      q(
        'What does s.substr(2, 3) return for s = "abcdef"?',
        ['"bcd"', '"cde"', '"cd"', '"def"'],
        1,
        `Start at index 2 ('c'), take 3 characters: cde.`,
      ),
      q(
        "What does .find() return when nothing is found?",
        ["-1", "0", "string::npos", "An exception"],
        2,
        `npos is the standard 'not found' sentinel — compare against it.`,
      ),
      q(
        "Which is true about std::string vs raw char arrays?",
        [
          "Same thing",
          "string manages memory and supports == comparison",
          "char arrays are safer",
          "string is fixed-size",
        ],
        1,
        `std::string handles allocation and value comparison correctly.`,
      ),
    ],
  }),

  L("Functions", ["functions"], "intermediate", 14, {
    intro: `<p>C++ functions declare their full contract in the signature: return type, name, and typed parameters. The compiler enforces every call against it. Programs become layers of small functions — and unlike Python, C++ also makes you think about <em>where</em> the function is declared.</p>`,
    concepts: [
      `<strong>Signature</strong> — <code>int add(int a, int b)</code>: return type first`,
      `<strong>void</strong> — for functions that return nothing`,
      `<strong>Prototypes</strong> — declare before use, define anywhere`,
      `<strong>Default arguments</strong> — <code>void greet(string name = "friend")</code>`,
    ],
    examples: [
      ex(
        "Define and call",
        `double circleArea(double r) {\n    return 3.14159 * r * r;\n}\n\nint main() {\n    cout << circleArea(2.0) << "\\n";\n    cout << circleArea(5.0) << "\\n";\n    return 0;\n}`,
        `12.5664\n78.5397`,
      ),
      ex(
        "Prototype then define",
        `int cube(int n);  // prototype lets main call it\n\nint main() {\n    cout << cube(4) << "\\n";\n    return 0;\n}\n\nint cube(int n) {\n    return n * n * n;\n}`,
        `64`,
        `The prototype tells the compiler the signature before the body appears.`,
      ),
    ],
    realWorld: `Header files (.h) are essentially collections of prototypes — the public face of a library. Every C++ API you'll consume, from game engines to drivers, is a set of typed function signatures.`,
    practice: `Write <code>bool isPrime(int n)</code> (loop up to n/2 or i*i <= n), then use it in main to print all primes below 30.`,
    mistakes: [
      `Calling a function defined lower in the file with no prototype — "identifier not found"`,
      `Signature mismatch between prototype and definition — confusing linker/compiler errors`,
    ],
    best: [
      `Keep functions short and single-purpose; name them with verbs`,
      `Mark functions that don't modify state appropriately (const-correctness grows from here)`,
    ],
    template: `#include <iostream>\nusing namespace std;\n\nbool isPrime(int n) {\n    if (n < 2) return false;\n    for (int i = 2; i * i <= n; i++) {\n        if (n % i == 0) return false;\n    }\n    return true;\n}\n\nint main() {\n    for (int n = 2; n < 30; n++) {\n        if (isPrime(n)) cout << n << " ";\n    }\n    cout << "\\n";\n    return 0;\n}`,
    quiz: [
      q(
        "In 'double area(int w, int h)', what is double?",
        ["A parameter", "The return type", "The function name", "A modifier"],
        1,
        `C++ signatures lead with the type the function returns.`,
      ),
      q(
        "What is a function prototype for?",
        [
          "Performance",
          "Declaring the signature so calls can appear before the definition",
          "Documentation only",
          "Inheritance",
        ],
        1,
        `The compiler needs the signature at the call site; the body can come later.`,
      ),
      q(
        "A void function…",
        ["Returns 0", "Returns nothing", "Can't take parameters", "Must be empty"],
        1,
        `void marks the absence of a return value.`,
      ),
    ],
  }),

  L("Function Overloading & Defaults", ["functions"], "intermediate", 12, {
    intro: `<p>C++ lets several functions share one name as long as their parameter lists differ — the compiler picks the right one per call. Combined with default arguments, overloading lets you offer one clean API name with many convenient ways to call it.</p>`,
    concepts: [
      `<strong>Overloading</strong> — same name, different parameter types/counts`,
      `<strong>Resolution</strong> — the compiler matches arguments to the best signature at compile time`,
      `<strong>Return type doesn't count</strong> — overloads must differ in parameters`,
      `<strong>Defaults</strong> — trailing parameters can have fallback values`,
    ],
    examples: [
      ex(
        "Overloads by type and count",
        `int max2(int a, int b) { return a > b ? a : b; }\ndouble max2(double a, double b) { return a > b ? a : b; }\nint max2(int a, int b, int c) { return max2(max2(a, b), c); }\n\nint main() {\n    cout << max2(3, 9) << " " << max2(2.5, 1.5) << " " << max2(1, 5, 3) << "\\n";\n    return 0;\n}`,
        `9 2.5 5`,
      ),
      ex(
        "Defaults reduce overloads",
        `void log(string msg, string level = "INFO") {\n    cout << "[" << level << "] " << msg << "\\n";\n}\n\nint main() {\n    log("server started");\n    log("disk almost full", "WARN");\n    return 0;\n}`,
        `[INFO] server started\n[WARN] disk almost full`,
      ),
    ],
    realWorld: `The standard library overloads relentlessly: std::to_string has nine overloads; operator<< is overloaded for every printable type — that's why cout << works on ints, doubles, and strings alike.`,
    practice: `Write two <code>describe()</code> overloads: one taking an int ("int: N"), one taking a string ("text: S"), plus a default-argument version of one of them. Call all three forms.`,
    mistakes: [
      `Overloading only by return type — doesn't compile; parameters must differ`,
      `Ambiguous calls: <code>f(int)</code> and <code>f(double)</code> called with a float literal may surprise — be explicit`,
    ],
    best: [
      `Overloads should do the SAME conceptual thing for different types — never reuse a name for different behavior`,
      `Prefer a default argument over an extra overload when the bodies would be identical`,
    ],
    template: `#include <iostream>\n#include <string>\nusing namespace std;\n\nvoid describe(int n) { cout << "int: " << n << "\\n"; }\nvoid describe(string s, bool shout = false) {\n    if (shout) cout << "TEXT: " << s << "!\\n";\n    else cout << "text: " << s << "\\n";\n}\n\nint main() {\n    describe(42);\n    describe("hello");\n    describe("hello", true);\n    return 0;\n}`,
    quiz: [
      q(
        "Two overloads may NOT differ only by…",
        ["Parameter count", "Parameter types", "Return type", "Parameter order of different types"],
        2,
        `Return type alone can't disambiguate a call site.`,
      ),
      q(
        "When is the overload chosen?",
        ["At runtime", "At compile time", "Randomly", "By the linker"],
        1,
        `Resolution is static — based on the argument types in the call.`,
      ),
      q(
        "Default argument values must be on…",
        ["The first parameters", "Trailing parameters", "All parameters", "Bool parameters only"],
        1,
        `Once a parameter has a default, all parameters after it need one too.`,
      ),
    ],
  }),

  L("Pass by Value vs Reference", ["functions", "references"], "intermediate", 14, {
    intro: `<p>By default C++ <em>copies</em> arguments into functions — changes inside don't affect the caller. Add <code>&amp;</code> to a parameter and the function receives the original instead. This single character controls whether functions can modify your data and how much copying costs you.</p>`,
    concepts: [
      `<strong>Pass by value</strong> — the function gets a copy; caller's variable is safe`,
      `<strong>Pass by reference (&amp;)</strong> — the function works on the original`,
      `<strong>const reference</strong> — no copy AND no modification: best of both for big objects`,
      `<strong>Out-parameters</strong> — references let a function "return" several results`,
    ],
    examples: [
      ex(
        "Value vs reference, side by side",
        `void bumpValue(int n) { n += 10; }\nvoid bumpRef(int& n) { n += 10; }\n\nint main() {\n    int score = 50;\n    bumpValue(score);\n    cout << score << "\\n";\n    bumpRef(score);\n    cout << score << "\\n";\n    return 0;\n}`,
        `50\n60`,
      ),
      ex(
        "const& for big read-only data",
        `int countVowels(const string& text) {\n    int c = 0;\n    for (char ch : text) {\n        if (string("aeiou").find(ch) != string::npos) c++;\n    }\n    return c;\n}\n\nint main() {\n    string essay = "references avoid copying large strings";\n    cout << countVowels(essay) << " vowels\\n";\n    return 0;\n}`,
        `13 vowels`,
        `Passing by const& means zero copying and a compiler guarantee of no modification.`,
      ),
    ],
    realWorld: `This is THE C++ interview topic because it's daily reality: passing a 10 MB image by value copies 10 MB; by const& copies nothing. Every professional codebase's function signatures encode these decisions.`,
    practice: `Write <code>void swap2(int&amp; a, int&amp; b)</code> that swaps two ints through references. Verify with two variables printed before and after.`,
    mistakes: [
      `Forgetting & and wondering why the function "doesn't work" — it modified a copy`,
      `Taking non-const references for read-only data — callers can't pass literals or temporaries`,
    ],
    best: [
      `Defaults: small types (int, double) by value; objects by const&; use plain & only when modification is the point`,
      `If a function takes a non-const reference, its NAME should telegraph mutation (swap, update, fill)`,
    ],
    template: `#include <iostream>\nusing namespace std;\n\nvoid swap2(int& a, int& b) {\n    int tmp = a;\n    a = b;\n    b = tmp;\n}\n\nint main() {\n    int x = 1, y = 99;\n    swap2(x, y);\n    cout << x << " " << y << "\\n";\n    return 0;\n}`,
    quiz: [
      q(
        "void f(int n) { n = 5; } — what happens to the caller's variable?",
        ["Becomes 5", "Unchanged — f modified a copy", "Undefined", "Compile error"],
        1,
        `Pass-by-value copies; the original never sees the change.`,
      ),
      q(
        "Why pass a big string as const string&?",
        [
          "Style",
          "Avoids copying while preventing modification",
          "It's required",
          "Makes it global",
        ],
        1,
        `The reference avoids the copy; const documents and enforces read-only access.`,
      ),
      q(
        "Which signature lets a function modify the caller's int?",
        ["f(int n)", "f(const int& n)", "f(int& n)", "f(int n) twice"],
        2,
        `A non-const reference is an alias for the caller's variable.`,
      ),
    ],
  }),

  L("References", ["references"], "intermediate", 12, {
    intro: `<p>A reference is an alias — a second name permanently bound to an existing variable. It must be initialized at creation, can never be reseated to another variable, and can't be null. These guarantees make references C++'s safe default for indirection, with pointers reserved for the cases that need more power.</p>`,
    concepts: [
      `<strong>Binding</strong> — <code>int&amp; ref = x;</code> — ref IS x from now on`,
      `<strong>No reseating</strong> — assigning to ref assigns to x; the alias itself can't move`,
      `<strong>Must initialize</strong> — <code>int&amp; r;</code> alone doesn't compile`,
      `<strong>const T&amp;</strong> — read-only alias; also binds to temporaries`,
    ],
    examples: [
      ex(
        "An alias in action",
        `int gold = 100;\nint& wallet = gold;\nwallet += 50;\ncout << gold << "\\n";\ngold = 0;\ncout << wallet << "\\n";`,
        `150\n0`,
      ),
      ex(
        "References in range-for",
        `int scores[] = {70, 80, 90};\nfor (int& s : scores) {\n    s += 5;  // modifies the array elements\n}\nfor (int s : scores) cout << s << " ";\ncout << "\\n";`,
        `75 85 95 `,
        `Without & the loop variable is a copy and the array stays unchanged.`,
      ),
    ],
    realWorld: `Range-for with references is everywhere in modern C++ — mutate elements in place, or iterate big objects by const& without copies. Function returns by reference power chained APIs like <code>cout << a << b</code>.`,
    practice: `Create an int, two references to it, and demonstrate that changing any name changes them all. Then write a range-for with <code>int&amp;</code> doubling every element of an array.`,
    mistakes: [
      `Thinking a reference can be redirected later — assignment changes the referent's VALUE, never the binding`,
      `Returning a reference to a local variable — the local dies, the reference dangles (undefined behavior)`,
    ],
    best: [
      `Iterate containers as <code>for (const auto&amp; item : items)</code> by default — no copies, no accidental writes`,
      `Choose references over pointers whenever null and reseating aren't needed`,
    ],
    template: `#include <iostream>\nusing namespace std;\n\nint main() {\n    int nums[] = {1, 2, 3, 4};\n    for (int& n : nums) {\n        n *= 2;\n    }\n    for (int n : nums) cout << n << " ";\n    cout << "\\n";\n    return 0;\n}`,
    quiz: [
      q(
        "int x=1, y=2; int& r = x; r = y; — what happened?",
        ["r now refers to y", "x became 2", "Compile error", "y became 1"],
        1,
        `Assignment through a reference writes to the referent; the binding to x is permanent.`,
      ),
      q(
        "Which is TRUE of references?",
        [
          "Can be null",
          "Can be reseated",
          "Must be initialized when declared",
          "Take no memory ever",
        ],
        2,
        `A reference must bind to something at birth — no null, no reseating.`,
      ),
      q(
        "for (auto s : strings) vs for (auto& s : strings) — the difference?",
        [
          "None",
          "The first copies each string; the second aliases them",
          "The second is invalid",
          "The first is faster always",
        ],
        1,
        `Without & every element is copied into s — costly and changes don't stick.`,
      ),
    ],
  }),

  L("Pointers", ["pointers"], "intermediate", 16, {
    intro: `<p>A pointer is a variable that stores a memory address. Where references are safe aliases, pointers are explicit and powerful: they can be reassigned, be null, do arithmetic, and own dynamically allocated memory. Mastering the two operators — <code>&amp;</code> (address-of) and <code>*</code> (dereference) — unlocks how C++ really works.</p>`,
    concepts: [
      `<strong>Declaration</strong> — <code>int* p;</code> "p points to int"`,
      `<strong>&amp;x</strong> — the address of x; <strong>*p</strong> — the value at p's address`,
      `<strong>nullptr</strong> — the explicit "points at nothing" value`,
      `<strong>Reassignment</strong> — pointers can switch targets; references can't`,
    ],
    examples: [
      ex(
        "Address-of and dereference",
        `int treasure = 500;\nint* map = &treasure;\ncout << "address: " << map << "\\n";\ncout << "value:   " << *map << "\\n";\n*map += 100;\ncout << "treasure: " << treasure << "\\n";`,
        `address: 0x7ffd42a1b44c\nvalue:   500\ntreasure: 600`,
        `Your address will differ — it's wherever the variable landed in memory.`,
      ),
      ex(
        "Null checks",
        `int* p = nullptr;\nif (p != nullptr) {\n    cout << *p << "\\n";\n} else {\n    cout << "p points at nothing\\n";\n}`,
        `p points at nothing`,
      ),
    ],
    realWorld: `Linked lists, trees, and graphs are nodes connected by pointers. Operating systems, drivers, and embedded firmware manipulate hardware through pointers to memory-mapped registers. Even Python's variables are pointers under the hood — C++ just shows you.`,
    practice: `Create two ints and one pointer. Point it at the first, add 10 through it, then point the SAME pointer at the second and add 20. Print both ints to confirm.`,
    mistakes: [
      `Dereferencing null or uninitialized pointers — the classic crash (segfault)`,
      `Confusing <code>int* p = &amp;x</code> (initialize with address) with <code>*p = x</code> (write through pointer)`,
    ],
    best: [
      `Initialize every pointer — to a real address or nullptr, never garbage`,
      `Check for nullptr before dereferencing anything that could be null`,
    ],
    template: `#include <iostream>\nusing namespace std;\n\nint main() {\n    int a = 10, b = 50;\n    int* p = &a;\n    *p += 10;\n    p = &b;\n    *p += 20;\n    cout << a << " " << b << "\\n";\n    return 0;\n}`,
    quiz: [
      q(
        "What does *p mean when p is a pointer?",
        [
          "The address of p",
          "The value stored at the address p holds",
          "Multiplication",
          "A new pointer",
        ],
        1,
        `* dereferences — it follows the address to the value.`,
      ),
      q(
        "What is &x?",
        ["The value of x", "The memory address of x", "A reference type", "x squared"],
        1,
        `& (address-of) yields where x lives in memory.`,
      ),
      q(
        "Dereferencing nullptr causes…",
        ["0", "A friendly error message", "Undefined behavior / crash", "Automatic allocation"],
        2,
        `There's no value at address null — the program typically segfaults.`,
      ),
    ],
  }),

  L("Pointers & Arrays", ["pointers", "arrays"], "intermediate", 14, {
    intro: `<p>In C++, an array's name usually <em>decays</em> into a pointer to its first element — which is why pointers and arrays are taught together. Pointer arithmetic (<code>p + 1</code> means "next element, whatever its size") explains how array indexing actually works: <code>a[i]</code> is literally <code>*(a + i)</code>.</p>`,
    concepts: [
      `<strong>Decay</strong> — passing an array to a function passes a pointer to element 0`,
      `<strong>Pointer arithmetic</strong> — +1 advances by one ELEMENT, not one byte`,
      `<strong>a[i] == *(a + i)</strong> — indexing is sugar over arithmetic`,
      `<strong>Size must travel separately</strong> — a decayed pointer doesn't know the length`,
    ],
    examples: [
      ex(
        "Walking an array by pointer",
        `int nums[] = {10, 20, 30, 40};\nint* p = nums;\ncout << *p << " " << *(p + 2) << "\\n";\nfor (int* it = nums; it != nums + 4; it++) {\n    cout << *it << " ";\n}\ncout << "\\n";`,
        `10 30\n10 20 30 40 `,
      ),
      ex(
        "Arrays in functions need a size",
        `int sum(const int* data, int n) {\n    int total = 0;\n    for (int i = 0; i < n; i++) total += data[i];\n    return total;\n}\n\nint main() {\n    int scores[] = {5, 10, 15};\n    cout << sum(scores, 3) << "\\n";\n    return 0;\n}`,
        `30`,
        `The function receives only an address — the caller must pass the count.`,
      ),
    ],
    realWorld: `This begin/end pointer-pair pattern IS the STL iterator model: <code>sort(v.begin(), v.end())</code> generalizes exactly this. C APIs (and graphics/audio buffers) pass pointer+length pairs everywhere.`,
    practice: `Write <code>int maxOf(const int* data, int n)</code> using pointer arithmetic (no [i] indexing) and test it on an array of five values.`,
    mistakes: [
      `Using sizeof on a decayed pointer parameter — gives pointer size (8), not the array's length`,
      `Walking past the end: the one-past-the-end address may be computed but never dereferenced`,
    ],
    best: [
      `Pass (pointer, size) together — or in modern C++ use std::vector/std::span which carry their size`,
      `Mark non-mutating pointer params const: <code>const int* data</code>`,
    ],
    template: `#include <iostream>\nusing namespace std;\n\nint maxOf(const int* data, int n) {\n    int best = *data;\n    for (const int* p = data + 1; p != data + n; p++) {\n        if (*p > best) best = *p;\n    }\n    return best;\n}\n\nint main() {\n    int vals[] = {7, 3, 19, 11, 2};\n    cout << maxOf(vals, 5) << "\\n";\n    return 0;\n}`,
    quiz: [
      q(
        "If int* p points to nums[0], what is *(p + 2)?",
        ["nums[2]", "nums[0] + 2", "The address two bytes later", "Error"],
        0,
        `Pointer arithmetic steps in elements: p+2 addresses index 2.`,
      ),
      q(
        "a[i] is exactly equivalent to…",
        ["*(a + i)", "&a + i", "a + i", "*a + i"],
        0,
        `Indexing is defined as dereferencing the offset address.`,
      ),
      q(
        "Why must functions taking arrays also take a length?",
        [
          "Style",
          "The array decays to a pointer that carries no size",
          "Compilers require two args",
          "They don't",
        ],
        1,
        `Inside the function only the address remains — the count must be supplied.`,
      ),
    ],
  }),
];

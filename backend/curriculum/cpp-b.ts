import { L, q, ex, LessonDef } from "./types";

/** C++ curriculum — Part B: memory, OOP, STL, modern C++ (lessons 18–34). */
export const cppB: LessonDef[] = [
  L("Dynamic Memory: new & delete", ["memory-management", "pointers"], "intermediate", 16, {
    intro: `<p>Local variables live on the stack and die with their scope. When you need memory whose lifetime YOU control — or whose size is only known at runtime — you allocate it on the heap with <code>new</code> and release it with <code>delete</code>. With that power comes the responsibility C++ is famous for.</p>`,
    concepts: [
      `<strong>new T</strong> — allocates a T on the heap, returns a pointer`,
      `<strong>delete p / delete[] p</strong> — frees a single object / an array`,
      `<strong>Memory leak</strong> — allocated memory you lost all pointers to`,
      `<strong>Dangling pointer</strong> — using memory after deleting it`,
    ],
    examples: [
      ex(
        "Allocate, use, free",
        `int* score = new int(42);\ncout << *score << "\\n";\n*score += 8;\ncout << *score << "\\n";\ndelete score;\nscore = nullptr;  // defuse the dangling pointer`,
        `42\n50`,
      ),
      ex(
        "Runtime-sized array",
        `int n = 5;\nint* data = new int[n];\nfor (int i = 0; i < n; i++) data[i] = i * i;\nfor (int i = 0; i < n; i++) cout << data[i] << " ";\ncout << "\\n";\ndelete[] data;`,
        `0 1 4 9 16 `,
        `Array new pairs with array delete[] — mixing them is undefined behavior.`,
      ),
    ],
    realWorld: `Everything dynamic — game entities spawning, documents opening, packets arriving — needs heap allocation. Memory leaks in long-running servers grow until the process dies; this lesson is why profilers and sanitizers exist.`,
    practice: `Allocate an array sized by a variable, fill it with the squares of its indexes, print the sum, then free it correctly with delete[] and null the pointer.`,
    mistakes: [
      `Forgetting delete — the leak; or deleting twice — undefined behavior`,
      `Using <code>delete</code> where <code>delete[]</code> is needed for arrays`,
    ],
    best: [
      `Every new has exactly one matching delete on every code path — or better, see RAII next lesson`,
      `Set pointers to nullptr after delete so accidental reuse fails loudly`,
    ],
    template: `#include <iostream>\nusing namespace std;\n\nint main() {\n    int n = 6;\n    int* data = new int[n];\n    int sum = 0;\n    for (int i = 0; i < n; i++) {\n        data[i] = i * i;\n        sum += data[i];\n    }\n    cout << "sum: " << sum << "\\n";\n    delete[] data;\n    data = nullptr;\n    return 0;\n}`,
    quiz: [
      q(
        "What is a memory leak?",
        [
          "Reading bad memory",
          "Heap memory never freed and no longer reachable",
          "Stack overflow",
          "Using delete twice",
        ],
        1,
        `The memory stays reserved until the process exits — lost capacity.`,
      ),
      q(
        "Memory from new int[10] must be freed with…",
        ["delete", "delete[]", "free()", "Nothing, it's automatic"],
        1,
        `Array allocations require the array form of delete.`,
      ),
      q(
        "Using a pointer after deleting it is…",
        [
          "Fine if quick",
          "A dangling pointer — undefined behavior",
          "A compile error",
          "Automatically null",
        ],
        1,
        `The memory may be reused by anything; reads and writes there corrupt state.`,
      ),
    ],
  }),

  L("Structures", ["structures"], "intermediate", 12, {
    intro: `<p>A <code>struct</code> groups related variables into one named type: a Point has x and y; a Product has name, price, and stock. Structs turn "three parallel arrays and a prayer" into honest records — and they're the stepping stone to classes.</p>`,
    concepts: [
      `<strong>Definition</strong> — <code>struct Point { double x; double y; };</code> (note the semicolon)`,
      `<strong>Member access</strong> — <code>p.x</code> with the dot; <code>ptr-&gt;x</code> through a pointer`,
      `<strong>Aggregate init</strong> — <code>Point p = {3.0, 4.0};</code>`,
      `<strong>Structs in containers/functions</strong> — pass by const&amp;, store in arrays`,
    ],
    examples: [
      ex(
        "Defining and using a struct",
        `struct Product {\n    string name;\n    double price;\n    int stock;\n};\n\nint main() {\n    Product p = {"Keyboard", 49.99, 12};\n    p.stock -= 1;\n    cout << p.name << " $" << p.price << " (" << p.stock << " left)\\n";\n    return 0;\n}`,
        `Keyboard $49.99 (11 left)`,
      ),
      ex(
        "Structs + arrays + functions",
        `struct Point { double x, y; };\n\ndouble dist2(const Point& a, const Point& b) {\n    double dx = a.x - b.x, dy = a.y - b.y;\n    return dx * dx + dy * dy;\n}\n\nint main() {\n    Point path[] = {{0,0}, {3,4}};\n    cout << dist2(path[0], path[1]) << "\\n";\n    return 0;\n}`,
        `25`,
        `The arrow operator appears when you hold a pointer: ptr->x is (*ptr).x.`,
      ),
    ],
    realWorld: `Network packet headers, 3D vertices, database rows, config blocks — structs model "plain data" in every systems codebase. C++ APIs and graphics formats are specified as struct layouts.`,
    practice: `Define <code>struct Student { string name; int score; }</code>. Create an array of three, write a function returning a const reference... simpler: a function that takes the array+size and prints the top scorer.`,
    mistakes: [
      `Forgetting the trailing semicolon after the struct definition — cascades into bizarre errors`,
      `Comparing structs with == — doesn't compile unless you define the operator yourself`,
    ],
    best: [
      `Use structs for passive data; reach for class once invariants and behavior appear`,
      `Pass structs by const& — copying a 64-byte struct per call adds up in hot loops`,
    ],
    template: `#include <iostream>\n#include <string>\nusing namespace std;\n\nstruct Student {\n    string name;\n    int score;\n};\n\nint main() {\n    Student s[3] = {{"Ada", 95}, {"Bo", 88}, {"Cy", 91}};\n    int top = 0;\n    for (int i = 1; i < 3; i++) {\n        if (s[i].score > s[top].score) top = i;\n    }\n    cout << "Top: " << s[top].name << " (" << s[top].score << ")\\n";\n    return 0;\n}`,
    quiz: [
      q(
        "How do you access member x through Point* ptr?",
        ["ptr.x", "ptr->x", "*ptr.x", "ptr::x"],
        1,
        `Arrow = dereference + dot. ptr->x is shorthand for (*ptr).x.`,
      ),
      q(
        "What punctuation must follow a struct's closing brace?",
        ["Nothing", "A semicolon", "A comma", "A colon"],
        1,
        `struct definitions are declarations — they end with ;`,
      ),
      q(
        "struct vs class in C++ differs by…",
        [
          "Structs can't have methods",
          "Default access: struct public, class private",
          "Memory layout",
          "Speed",
        ],
        1,
        `That's the ONLY language difference — convention assigns them different roles.`,
      ),
    ],
  }),

  L("Classes & Encapsulation", ["classes"], "intermediate", 16, {
    intro: `<p>A class binds data and the functions that operate on it, then <em>protects</em> that data: private members can only be touched by the class's own methods. This encapsulation means invariants ("balance never negative") are enforced in one place instead of hoped-for everywhere.</p>`,
    concepts: [
      `<strong>private / public</strong> — hidden state vs the exposed interface`,
      `<strong>Methods</strong> — functions defined inside the class with access to members`,
      `<strong>Getters/setters</strong> — controlled doors to private data, with validation`,
      `<strong>const methods</strong> — promise not to modify the object`,
    ],
    examples: [
      ex(
        "Encapsulation enforcing a rule",
        `class BankAccount {\nprivate:\n    double balance;\npublic:\n    BankAccount(double start) { balance = start > 0 ? start : 0; }\n    void deposit(double amt) { if (amt > 0) balance += amt; }\n    bool withdraw(double amt) {\n        if (amt <= 0 || amt > balance) return false;\n        balance -= amt;\n        return true;\n    }\n    double getBalance() const { return balance; }\n};\n\nint main() {\n    BankAccount acct(100);\n    acct.withdraw(500);          // rejected\n    acct.deposit(50);\n    cout << acct.getBalance() << "\\n";\n    return 0;\n}`,
        `150`,
        `No code anywhere can set balance to -1000 — the class guards its own invariant.`,
      ),
    ],
    realWorld: `Every serious C++ system is class-shaped: a Texture class guards a GPU handle, a Connection class guards a socket. Encapsulation is what lets a 100-person team change internals without breaking each other.`,
    practice: `Build a <code>Thermostat</code> class: private double temp; public set(double) clamping to 5–30, get() const, and increment()/decrement() by 0.5 respecting the clamp. Exercise all paths.`,
    mistakes: [
      `Making everything public "for convenience" — then any code can corrupt the state, and bugs hide anywhere`,
      `Forgetting const on read-only methods — const objects then can't call them`,
    ],
    best: [
      `Default members to private; expose the minimum interface that callers truly need`,
      `Validate in setters and constructors — the class is the single gatekeeper of its invariants`,
    ],
    template: `#include <iostream>\nusing namespace std;\n\nclass Thermostat {\nprivate:\n    double temp = 20;\npublic:\n    void set(double t) {\n        if (t < 5) t = 5;\n        if (t > 30) t = 30;\n        temp = t;\n    }\n    double get() const { return temp; }\n};\n\nint main() {\n    Thermostat t;\n    t.set(99);\n    cout << t.get() << "\\n";\n    t.set(18.5);\n    cout << t.get() << "\\n";\n    return 0;\n}`,
    quiz: [
      q(
        "What can access a private member?",
        [
          "Any code in the file",
          "Only the class's own methods (and friends)",
          "Subclasses always",
          "main()",
        ],
        1,
        `private is enforced by the compiler — that's encapsulation's teeth.`,
      ),
      q(
        "What does const after a method signature mean?",
        [
          "Returns a constant",
          "The method won't modify the object",
          "Compile-time only",
          "Static method",
        ],
        1,
        `const methods are callable on const objects and can't write members.`,
      ),
      q(
        "Why use a setter instead of a public field?",
        [
          "Tradition",
          "The setter can validate and maintain invariants",
          "Performance",
          "Shorter code",
        ],
        1,
        `A gatekeeper function is the only reliable place to enforce rules on writes.`,
      ),
    ],
  }),

  L("Constructors & Destructors", ["constructors", "destructors"], "intermediate", 14, {
    intro: `<p>A constructor runs automatically when an object is created — it's where you establish a valid starting state. A destructor (<code>~ClassName</code>) runs automatically when the object dies — it's where you release whatever the object held. Together they bracket an object's entire life.</p>`,
    concepts: [
      `<strong>Constructor</strong> — same name as the class, no return type; overloadable`,
      `<strong>Initializer list</strong> — <code>Point(int x, int y) : x(x), y(y) {}</code> — initialize, don't assign`,
      `<strong>Default constructor</strong> — generated only if you declare no other`,
      `<strong>Destructor</strong> — <code>~Name()</code>; runs at scope exit, in reverse creation order`,
    ],
    examples: [
      ex(
        "Construction and destruction order",
        `class Logger {\n    string name;\npublic:\n    Logger(string n) : name(n) { cout << name << " created\\n"; }\n    ~Logger() { cout << name << " destroyed\\n"; }\n};\n\nint main() {\n    Logger a("first");\n    {\n        Logger b("inner");\n    }\n    cout << "main ends\\n";\n    return 0;\n}`,
        `first created\ninner created\ninner destroyed\nmain ends\nfirst destroyed`,
        `Objects die exactly when their scope ends — deterministic, unlike garbage-collected languages.`,
      ),
      ex(
        "Overloaded constructors",
        `class Timer {\n    int seconds;\npublic:\n    Timer() : seconds(60) {}\n    Timer(int s) : seconds(s) {}\n    int get() const { return seconds; }\n};\n\nint main() {\n    Timer standard;\n    Timer custom(90);\n    cout << standard.get() << " " << custom.get() << "\\n";\n    return 0;\n}`,
        `60 90`,
      ),
    ],
    realWorld: `Database connections open in constructors and close in destructors; files, locks, and GPU resources too. This deterministic cleanup is C++'s answer to garbage collection — and the foundation of RAII, next lesson.`,
    practice: `Write a <code>Session</code> class printing "session opened" in its constructor and "session closed" in its destructor. Create one in main and one inside a nested block; predict the output before running.`,
    mistakes: [
      `Defining Timer(int) and then writing <code>Timer t;</code> — no default constructor exists anymore; declare one if needed`,
      `Doing heavy work or throwing exceptions in destructors — destructors should be simple and never throw`,
    ],
    best: [
      `Use member initializer lists — required for const and reference members, faster for objects`,
      `If a class manages a resource, the destructor releases it — every path, no exceptions`,
    ],
    template: `#include <iostream>\nusing namespace std;\n\nclass Session {\n    string user;\npublic:\n    Session(string u) : user(u) { cout << user << ": session opened\\n"; }\n    ~Session() { cout << user << ": session closed\\n"; }\n};\n\nint main() {\n    Session a("ada");\n    {\n        Session b("bo");\n    }\n    cout << "--- main ending ---\\n";\n    return 0;\n}`,
    quiz: [
      q(
        "When does a destructor run for a local object?",
        [
          "At program exit only",
          "When its scope ends",
          "When you call delete",
          "Never automatically",
        ],
        1,
        `Stack objects are destroyed deterministically at the closing brace.`,
      ),
      q(
        "Timer has only Timer(int s). What does 'Timer t;' do?",
        [
          "Uses defaults",
          "Compile error — no default constructor",
          "Creates t with s=0",
          "Runtime error",
        ],
        1,
        `Declaring any constructor suppresses the auto-generated default one.`,
      ),
      q(
        "In what order are a, then b (same scope) destroyed?",
        ["a then b", "b then a — reverse of creation", "Simultaneously", "Unspecified"],
        1,
        `Destruction happens in reverse declaration order.`,
      ),
    ],
  }),

  L(
    "RAII & the Rule of Three",
    ["destructors", "memory-management", "advanced-cpp"],
    "advanced",
    16,
    {
      intro: `<p>RAII — Resource Acquisition Is Initialization — is C++'s central design idiom: tie every resource (memory, file, lock) to an object whose constructor acquires it and whose destructor releases it. Then cleanup is automatic and exception-safe. And once a class manages a resource, the Rule of Three applies: define destructor, copy constructor, and copy assignment — or forbid copying.</p>`,
      concepts: [
        `<strong>RAII</strong> — resource lifetime == object lifetime`,
        `<strong>Exception safety</strong> — destructors run during stack unwinding, so nothing leaks`,
        `<strong>Rule of Three</strong> — destructor + copy ctor + copy assignment travel together`,
        `<strong>Shallow vs deep copy</strong> — copying a pointer vs copying what it points to`,
      ],
      examples: [
        ex(
          "An RAII wrapper",
          `class IntBuffer {\n    int* data;\n    int n;\npublic:\n    IntBuffer(int size) : n(size) {\n        data = new int[n];\n        cout << "acquired " << n << " ints\\n";\n    }\n    ~IntBuffer() {\n        delete[] data;\n        cout << "released\\n";\n    }\n    int& at(int i) { return data[i]; }\n};\n\nint main() {\n    IntBuffer buf(4);\n    buf.at(0) = 99;\n    cout << buf.at(0) << "\\n";\n    return 0;\n}  // destructor frees automatically`,
          `acquired 4 ints\n99\nreleased`,
        ),
        ex(
          "Why the Rule of Three exists",
          `// With the default copy constructor:\n// IntBuffer a(4);\n// IntBuffer b = a;   // copies the POINTER, not the array\n// ...both destructors later delete the SAME memory -> crash\n// Fix: define a deep copy, or disable copying:\n//   IntBuffer(const IntBuffer&) = delete;`,
          ``,
          `The compiler-generated copy is member-wise — for raw pointers that means double-delete disasters.`,
        ),
      ],
      realWorld: `std::string, std::vector, std::fstream, std::lock_guard — the entire standard library is RAII. It's why modern C++ code contains almost no visible delete: ownership lives in types, not programmer memory.`,
      practice: `Take the IntBuffer above and disable copying with <code>= delete</code> on the copy constructor and copy assignment. Confirm that <code>IntBuffer b = a;</code> now fails to compile (a good failure!).`,
      mistakes: [
        `Writing a destructor but forgetting copy operations — the default copies share the resource and double-free`,
        `Managing two resources in one class — if the second acquisition throws, the first leaks; one resource per class`,
      ],
      best: [
        `Never write naked new/delete in application code — wrap resources in RAII types (or use smart pointers, coming soon)`,
        `If copying makes no sense for a resource, <code>= delete</code> the copy operations explicitly`,
      ],
      template: `#include <iostream>\nusing namespace std;\n\nclass FileHandle {\n    string path;\npublic:\n    FileHandle(string p) : path(p) { cout << "open " << path << "\\n"; }\n    ~FileHandle() { cout << "close " << path << "\\n"; }\n    FileHandle(const FileHandle&) = delete;\n    FileHandle& operator=(const FileHandle&) = delete;\n};\n\nint main() {\n    FileHandle log("app.log");\n    cout << "working...\\n";\n    return 0;\n}`,
      quiz: [
        q(
          "RAII ties resource release to…",
          ["main() ending", "The destructor of an owning object", "A cleanup() call", "The OS"],
          1,
          `When the object dies — by any path, including exceptions — the resource frees.`,
        ),
        q(
          "Why is the compiler-generated copy dangerous for pointer-owning classes?",
          [
            "It's slow",
            "It copies the pointer, so two objects delete the same memory",
            "It throws",
            "It zeroes members",
          ],
          1,
          `Member-wise copy shares the allocation — destruction then frees it twice.`,
        ),
        q(
          "The Rule of Three says: if you write a destructor, also write…",
          [
            "Two more classes",
            "Copy constructor and copy assignment",
            "A getter and setter",
            "main()",
          ],
          1,
          `Resource-managing classes need all three (or explicitly deleted copies).`,
        ),
      ],
    },
  ),

  L("Inheritance", ["inheritance"], "advanced", 14, {
    intro: `<p>Inheritance derives a new class from an existing one: the child inherits the parent's members and adds its own. In C++ you choose the inheritance access level (almost always <code>public</code>), and constructors chain — the base part of the object is built first.</p>`,
    concepts: [
      `<strong>class Child : public Parent</strong> — "is-a" relationship`,
      `<strong>protected</strong> — like private, but visible to derived classes`,
      `<strong>Constructor chaining</strong> — <code>Child(...) : Parent(args)</code>`,
      `<strong>Overriding vs adding</strong> — replace base behavior or extend with new members`,
    ],
    examples: [
      ex(
        "A base and a derived class",
        `class Vehicle {\nprotected:\n    string name;\n    int speed;\npublic:\n    Vehicle(string n, int s) : name(n), speed(s) {}\n    void describe() const {\n        cout << name << " @ " << speed << " km/h\\n";\n    }\n};\n\nclass Ambulance : public Vehicle {\n    bool sirenOn = false;\npublic:\n    Ambulance() : Vehicle("Ambulance", 120) {}\n    void toggleSiren() {\n        sirenOn = !sirenOn;\n        cout << (sirenOn ? "WEE-OO\\n" : "silent\\n");\n    }\n};\n\nint main() {\n    Ambulance a;\n    a.describe();      // inherited\n    a.toggleSiren();   // its own\n    return 0;\n}`,
        `Ambulance @ 120 km/h\nWEE-OO`,
      ),
    ],
    realWorld: `UI frameworks (Button : Widget), game engines (Player : Entity), and exception hierarchies (runtime_error : exception) — class families model "specialized kinds of a thing" across the industry.`,
    practice: `Create <code>Employee</code> (name, salary, describe()) and derive <code>Developer</code> adding a language member and a code() method. Construct a Developer chaining the Employee constructor; call both methods.`,
    mistakes: [
      `Forgetting <code>public</code> in <code>class D : public B</code> — class inheritance defaults to private and breaks "is-a" conversions`,
      `Inheriting for code reuse when there's no is-a relationship — composition ("has-a") is the honest design`,
    ],
    best: [
      `Initialize the base via the initializer list — don't re-assign base members in the child's body`,
      `Keep hierarchies shallow: two or three levels; deeper trees become unmaintainable`,
    ],
    template: `#include <iostream>\n#include <string>\nusing namespace std;\n\nclass Employee {\nprotected:\n    string name;\npublic:\n    Employee(string n) : name(n) {}\n    void describe() const { cout << name << " works here\\n"; }\n};\n\nclass Developer : public Employee {\n    string lang;\npublic:\n    Developer(string n, string l) : Employee(n), lang(l) {}\n    void code() const { cout << name << " writes " << lang << "\\n"; }\n};\n\nint main() {\n    Developer d("Ada", "C++");\n    d.describe();\n    d.code();\n    return 0;\n}`,
    quiz: [
      q(
        "class Dog : public Animal means…",
        [
          "Dog contains an Animal member",
          "Dog is-an Animal, inheriting its members",
          "Animal inherits Dog",
          "They're unrelated",
        ],
        1,
        `Public inheritance models the is-a relationship.`,
      ),
      q(
        "Which access level is visible to derived classes but not outsiders?",
        ["private", "protected", "public", "internal"],
        1,
        `protected sits between private and public, designed for inheritance.`,
      ),
      q(
        "Where do you call the base constructor from a child?",
        ["Inside the child's body", "In the member initializer list", "You can't", "In main"],
        1,
        `Child(...) : Base(args) — the base is constructed before the child's body runs.`,
      ),
    ],
  }),

  L("Polymorphism & Virtual Functions", ["polymorphism"], "advanced", 16, {
    intro: `<p>Polymorphism lets you treat different derived types uniformly through a base pointer or reference — and have each behave its own way. The key is <code>virtual</code>: it tells C++ to decide WHICH override to call at runtime based on the actual object, not the pointer's type.</p>`,
    concepts: [
      `<strong>virtual</strong> — enables runtime dispatch for a method`,
      `<strong>override</strong> — child marks its replacement (compiler-checked)`,
      `<strong>Base pointers</strong> — <code>Animal* a = new Dog;</code> calls Dog's overrides`,
      `<strong>virtual destructor</strong> — mandatory in polymorphic base classes`,
    ],
    examples: [
      ex(
        "Runtime dispatch in action",
        `class Shape {\npublic:\n    virtual double area() const { return 0; }\n    virtual ~Shape() {}\n};\n\nclass Rect : public Shape {\n    double w, h;\npublic:\n    Rect(double w, double h) : w(w), h(h) {}\n    double area() const override { return w * h; }\n};\n\nclass Circle : public Shape {\n    double r;\npublic:\n    Circle(double r) : r(r) {}\n    double area() const override { return 3.14159 * r * r; }\n};\n\nint main() {\n    Shape* shapes[] = { new Rect(3, 4), new Circle(2) };\n    for (Shape* s : shapes) {\n        cout << s->area() << "\\n";\n        delete s;\n    }\n    return 0;\n}`,
        `12\n12.5664`,
        `One loop, one call site — each object answers with its own area(). Without virtual, both lines would print 0.`,
      ),
    ],
    realWorld: `Plugin systems, renderers iterating draw() over scene objects, and test frameworks calling run() on every test case — polymorphism is how frameworks invoke code that didn't exist when they were compiled.`,
    practice: `Build a <code>Notifier</code> base with virtual <code>send(msg)</code>, derive <code>EmailNotifier</code> and <code>SmsNotifier</code>, store them in an array of base pointers, and send one message through all of them.`,
    mistakes: [
      `Forgetting virtual on the base method — calls through base pointers silently run the BASE version`,
      `Non-virtual destructor in a base class — deleting through a base pointer skips the child's destructor (leaks)`,
    ],
    best: [
      `Always mark overrides with <code>override</code> — typos in signatures become compile errors instead of silent bugs`,
      `Any class with virtual methods gets a virtual destructor. No exceptions.`,
    ],
    template: `#include <iostream>\nusing namespace std;\n\nclass Notifier {\npublic:\n    virtual void send(string msg) const { cout << "??? " << msg << "\\n"; }\n    virtual ~Notifier() {}\n};\n\nclass Email : public Notifier {\npublic:\n    void send(string msg) const override { cout << "EMAIL: " << msg << "\\n"; }\n};\n\nclass Sms : public Notifier {\npublic:\n    void send(string msg) const override { cout << "SMS: " << msg << "\\n"; }\n};\n\nint main() {\n    Notifier* channels[] = { new Email, new Sms };\n    for (Notifier* c : channels) {\n        c->send("server down!");\n        delete c;\n    }\n    return 0;\n}`,
    quiz: [
      q(
        "Without virtual, Animal* a = new Dog; a->speak() calls…",
        ["Dog::speak", "Animal::speak", "Both", "Compile error"],
        1,
        `Non-virtual calls bind at compile time to the pointer's static type.`,
      ),
      q(
        "What does override do?",
        [
          "Enables dispatch",
          "Asks the compiler to verify this really overrides a virtual base method",
          "Makes it faster",
          "Hides the base method",
        ],
        1,
        `It catches signature mismatches that would otherwise silently create a new method.`,
      ),
      q(
        "Why must polymorphic bases have virtual destructors?",
        [
          "Speed",
          "So delete through a base pointer runs the derived destructor too",
          "Syntax requirement",
          "They don't",
        ],
        1,
        `Without it, the derived part is never destroyed — leaks and UB.`,
      ),
    ],
  }),

  L("Abstract Classes & Interfaces", ["polymorphism", "inheritance"], "advanced", 14, {
    intro: `<p>Sometimes a base class shouldn't be creatable at all — "Shape" is a concept, not a thing. A <em>pure virtual</em> function (<code>= 0</code>) makes a class abstract: it can't be instantiated, and every concrete child MUST implement the function. A class of only pure virtuals is C++'s interface.</p>`,
    concepts: [
      `<strong>Pure virtual</strong> — <code>virtual double area() const = 0;</code>`,
      `<strong>Abstract class</strong> — has ≥1 pure virtual; cannot be instantiated`,
      `<strong>Contract enforcement</strong> — children must implement or stay abstract`,
      `<strong>Interfaces</strong> — pure-virtual-only classes define capabilities`,
    ],
    examples: [
      ex(
        "An enforced contract",
        `class Storage {\npublic:\n    virtual void save(string data) = 0;\n    virtual string load() = 0;\n    virtual ~Storage() {}\n};\n\nclass MemoryStorage : public Storage {\n    string content;\npublic:\n    void save(string data) override { content = data; }\n    string load() override { return content; }\n};\n\nint main() {\n    // Storage s;            // error: abstract!\n    MemoryStorage m;\n    m.save("progress: level 3");\n    cout << m.load() << "\\n";\n    return 0;\n}`,
        `progress: level 3`,
        `Code written against Storage* works with Memory, File, or Cloud storage — implementations swap freely.`,
      ),
    ],
    realWorld: `This is dependency inversion — the architecture pattern behind testable systems. Your code depends on a Storage interface; production wires in DatabaseStorage, tests wire in a fake. Every mocking framework rests on this.`,
    practice: `Define an abstract <code>Player</code> with pure virtual <code>move()</code>. Implement <code>HumanPlayer</code> ("reads input") and <code>AiPlayer</code> ("evaluates moves"). Put one of each behind Player* and call move() on both.`,
    mistakes: [
      `Trying to instantiate an abstract class — the compile error confuses until you know what = 0 means`,
      `Forgetting one pure virtual in a child — the child silently stays abstract and can't be created either`,
    ],
    best: [
      `Name and design interfaces around capabilities (Drawable, Serializable), not around inheritance trees`,
      `Keep interfaces small — one or two methods. Fat interfaces force fake implementations everywhere`,
    ],
    template: `#include <iostream>\nusing namespace std;\n\nclass Player {\npublic:\n    virtual void move() = 0;\n    virtual ~Player() {}\n};\n\nclass Human : public Player {\npublic:\n    void move() override { cout << "asks the user\\n"; }\n};\n\nclass Ai : public Player {\npublic:\n    void move() override { cout << "evaluates 1000 moves\\n"; }\n};\n\nint main() {\n    Player* players[] = { new Human, new Ai };\n    for (Player* p : players) {\n        p->move();\n        delete p;\n    }\n    return 0;\n}`,
    quiz: [
      q(
        "What makes a class abstract?",
        [
          "The abstract keyword",
          "At least one pure virtual function (= 0)",
          "No constructor",
          "Being a base class",
        ],
        1,
        `C++ has no abstract keyword — purity of a virtual does the job.`,
      ),
      q(
        "What can you do with an abstract class?",
        ["Instantiate it", "Use pointers/references to it", "Nothing", "Only copy it"],
        1,
        `You can't create one, but Base* and Base& are exactly how polymorphism flows.`,
      ),
      q(
        "A child skips implementing one pure virtual. The child is…",
        ["Broken at runtime", "Also abstract", "Fine", "A compile error by itself"],
        1,
        `The contract propagates until some descendant implements everything.`,
      ),
    ],
  }),

  L("Templates", ["templates"], "advanced", 16, {
    intro: `<p>Templates let you write code once and have the compiler stamp out versions for any type: one <code>max</code> for ints, doubles, and strings; one <code>Stack&lt;T&gt;</code> for anything. This is generic programming — the technology that powers the entire STL.</p>`,
    concepts: [
      `<strong>Function templates</strong> — <code>template &lt;typename T&gt; T biggest(T a, T b)</code>`,
      `<strong>Type deduction</strong> — the compiler infers T from the arguments`,
      `<strong>Class templates</strong> — <code>Stack&lt;int&gt;</code>, <code>Stack&lt;string&gt;</code> from one definition`,
      `<strong>Compile-time instantiation</strong> — each T generates real, typed code`,
    ],
    examples: [
      ex(
        "One function, many types",
        `template <typename T>\nT biggest(T a, T b) {\n    return a > b ? a : b;\n}\n\nint main() {\n    cout << biggest(3, 7) << "\\n";\n    cout << biggest(2.5, 1.9) << "\\n";\n    cout << biggest(string("apple"), string("banana")) << "\\n";\n    return 0;\n}`,
        `7\n2.5\nbanana`,
      ),
      ex(
        "A tiny class template",
        `template <typename T>\nclass Box {\n    T value;\npublic:\n    Box(T v) : value(v) {}\n    T get() const { return value; }\n};\n\nint main() {\n    Box<int> a(42);\n    Box<string> b("hello");\n    cout << a.get() << " " << b.get() << "\\n";\n    return 0;\n}`,
        `42 hello`,
        `vector<int> and map<string,int> are exactly this mechanism, scaled up.`,
      ),
    ],
    realWorld: `The STL is templates: vector&lt;T&gt;, map&lt;K,V&gt;, sort over any comparable type. Writing a container or algorithm once and reusing it across every type in a codebase is C++'s answer to code duplication.`,
    practice: `Write a template function <code>middle(T a, T b, T c)</code> returning the median of three values, and test it with ints and doubles.`,
    mistakes: [
      `Using an operation T doesn't support (like &lt; on a type without it) — expect long, scary instantiation errors; read the FIRST line`,
      `Defining templates in .cpp files — they generally must live in headers so the compiler sees them at instantiation`,
    ],
    best: [
      `Start concrete: write the int version, make it work, THEN templatize`,
      `Keep template requirements minimal and documented ("T needs operator<")`,
    ],
    template: `#include <iostream>\nusing namespace std;\n\ntemplate <typename T>\nT middle(T a, T b, T c) {\n    if ((a >= b && a <= c) || (a <= b && a >= c)) return a;\n    if ((b >= a && b <= c) || (b <= a && b >= c)) return b;\n    return c;\n}\n\nint main() {\n    cout << middle(3, 9, 5) << "\\n";\n    cout << middle(2.5, 1.0, 2.0) << "\\n";\n    return 0;\n}`,
    quiz: [
      q(
        "When is template code generated for a specific type?",
        [
          "At runtime",
          "When the template is instantiated with that type at compile time",
          "When the program starts",
          "Never",
        ],
        1,
        `Each used T stamps out a concrete version during compilation.`,
      ),
      q(
        "In biggest(3, 7), what is T?",
        ["double", "int — deduced from the arguments", "Unknown", "T stays generic"],
        1,
        `Template argument deduction infers T = int.`,
      ),
      q(
        "vector<string> is an example of…",
        ["Inheritance", "A class template instantiation", "A macro", "Overloading"],
        1,
        `One vector<T> definition serves every element type.`,
      ),
    ],
  }),

  L("std::vector", ["stl"], "intermediate", 14, {
    intro: `<p><code>std::vector</code> is the array you actually use: it grows on demand, knows its size, cleans up after itself (RAII!), and plugs into every STL algorithm. If you're reaching for new[] in application code, you almost certainly want a vector instead.</p>`,
    concepts: [
      `<strong>push_back</strong> — append; the vector reallocates as needed`,
      `<strong>size() / empty()</strong> — always knows how many`,
      `<strong>Element access</strong> — <code>v[i]</code> fast, <code>v.at(i)</code> bounds-checked`,
      `<strong>Range-for friendly</strong> — <code>for (auto&amp; x : v)</code>`,
    ],
    examples: [
      ex(
        "Growing dynamically",
        `vector<int> scores;\nscores.push_back(90);\nscores.push_back(85);\nscores.push_back(92);\ncout << "count: " << scores.size() << "\\n";\nfor (int s : scores) cout << s << " ";\ncout << "\\n";`,
        `count: 3\n90 85 92 `,
      ),
      ex(
        "Initialize, modify, aggregate",
        `vector<double> prices = {19.9, 5.0, 12.5};\nprices[1] = 6.0;\ndouble total = 0;\nfor (double p : prices) total += p;\ncout << "total: " << total << "\\n";`,
        `total: 38.4`,
        `No manual memory, no size bookkeeping, no delete — the vector handles its own lifetime.`,
      ),
    ],
    realWorld: `vector is the default container of professional C++ — measurements, entities, rows, points. Its contiguous memory layout makes it cache-friendly, which usually beats fancier structures in practice.`,
    practice: `Read five numbers into a vector with push_back (hard-code them in the browser), then print the vector reversed using an index loop from size()-1 down to 0.`,
    mistakes: [
      `Indexing out of range with [] — same undefined behavior as raw arrays; .at() throws instead`,
      `size() returns an unsigned type — <code>for (int i = v.size()-1; ...)</code> on an empty vector underflows; cast or use signed counters carefully`,
    ],
    best: [
      `Default to vector for sequences; choose other containers only with a reason`,
      `Pass vectors as const& to functions; use .reserve(n) when you know the size ahead (performance)`,
    ],
    template: `#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    vector<int> nums = {4, 8, 15, 16, 23};\n    nums.push_back(42);\n    for (int i = (int)nums.size() - 1; i >= 0; i--) {\n        cout << nums[i] << " ";\n    }\n    cout << "\\nsize: " << nums.size() << "\\n";\n    return 0;\n}`,
    quiz: [
      q(
        "How does vector differ from a raw array?",
        [
          "It's slower always",
          "It grows dynamically and knows its size",
          "Fixed size",
          "No indexing",
        ],
        1,
        `vector manages a resizable heap array behind a safe interface.`,
      ),
      q(
        "v[10] on a 3-element vector does what?",
        ["Throws", "Returns 0", "Undefined behavior", "Grows the vector"],
        2,
        `operator[] doesn't check bounds — .at() is the checked accessor that throws.`,
      ),
      q(
        "Which adds 7 to the end of vector v?",
        ["v.add(7)", "v.push_back(7)", "v.append(7)", "v += 7"],
        1,
        `push_back is the canonical append operation.`,
      ),
    ],
  }),

  L("STL Containers: map & set", ["stl"], "advanced", 14, {
    intro: `<p>Beyond sequences, the STL gives you associations: <code>map&lt;K,V&gt;</code> stores key→value pairs in sorted key order, and <code>set&lt;T&gt;</code> stores unique sorted values. Their unordered_ cousins trade ordering for raw hash-table speed. Choosing the right container is half of C++ data design.</p>`,
    concepts: [
      `<strong>map[key] = value</strong> — insert or overwrite; lookup creates a default if missing!`,
      `<strong>.count(key) / .find(key)</strong> — existence checks that don't insert`,
      `<strong>set.insert / set.count</strong> — uniqueness with fast membership`,
      `<strong>Iteration order</strong> — map/set iterate sorted by key`,
    ],
    examples: [
      ex(
        "Counting words with a map",
        `map<string, int> freq;\nvector<string> words = {"to", "be", "or", "not", "to", "be"};\nfor (const string& w : words) {\n    freq[w]++;\n}\nfor (const auto& pair : freq) {\n    cout << pair.first << ": " << pair.second << "\\n";\n}`,
        `be: 2\nnot: 1\nor: 1\nto: 2`,
        `freq[w]++ works because a missing key is created as 0 — convenient here, a trap elsewhere.`,
      ),
      ex(
        "set for uniqueness",
        `set<int> seen;\nint data[] = {3, 1, 4, 1, 5, 3};\nfor (int x : data) seen.insert(x);\ncout << "unique: " << seen.size() << " -> ";\nfor (int x : seen) cout << x << " ";\ncout << "\\n";`,
        `unique: 4 -> 1 3 4 5 `,
      ),
    ],
    realWorld: `Caches, indexes, config stores, symbol tables in compilers, "has this user voted?" checks — key-value and membership structures are the backbone of backend logic in every language; C++ gives you sorted AND hashed variants.`,
    practice: `Build a <code>map&lt;string,double&gt;</code> of three products to prices. Print all entries sorted (free with map), then check for a product that doesn't exist using .count() WITHOUT accidentally inserting it.`,
    mistakes: [
      `Checking existence with <code>if (m[key])</code> — this INSERTS a default value for missing keys; use .count() or .find()`,
      `Expecting insertion order on iteration — map orders by key, not by when you added`,
    ],
    best: [
      `Need order? map/set. Need pure speed? unordered_map/unordered_set. Decide consciously`,
      `Iterate with <code>const auto&amp;</code> to avoid copying pairs`,
    ],
    template: `#include <iostream>\n#include <map>\n#include <string>\nusing namespace std;\n\nint main() {\n    map<string, double> prices;\n    prices["keyboard"] = 49.9;\n    prices["mouse"] = 25.0;\n    prices["monitor"] = 199.0;\n    for (const auto& p : prices) {\n        cout << p.first << " -> $" << p.second << "\\n";\n    }\n    cout << "has webcam? " << prices.count("webcam") << "\\n";\n    return 0;\n}`,
    quiz: [
      q(
        'What does m["ghost"] do if the key is absent?',
        ["Throws", "Returns null", "Inserts a default-constructed value and returns it", "Crashes"],
        2,
        `operator[] default-inserts — the classic accidental-growth bug in lookups.`,
      ),
      q(
        "Iterating a std::map visits keys in…",
        ["Insertion order", "Random order", "Sorted key order", "Reverse order"],
        2,
        `map is a sorted (tree-based) container.`,
      ),
      q(
        "Which container automatically rejects duplicates?",
        ["vector", "map values", "set", "array"],
        2,
        `set stores each value at most once — insert of a duplicate is a no-op.`,
      ),
    ],
  }),

  L("Iterators & Range-Based For", ["stl"], "advanced", 12, {
    intro: `<p>Iterators are generalized pointers: every STL container hands you a <code>begin()</code> and <code>end()</code>, and everything between them is the contents. This common interface is why one <code>sort</code> works on vectors, deques, and arrays alike — and range-based for is sugar over exactly this machinery.</p>`,
    concepts: [
      `<strong>begin() / end()</strong> — end is one-PAST-the-last element`,
      `<strong>Dereference and advance</strong> — <code>*it</code> reads, <code>++it</code> moves`,
      `<strong>auto</strong> — spares you spelling vector&lt;string&gt;::iterator`,
      `<strong>Invalidation</strong> — modifying a container can invalidate its iterators`,
    ],
    examples: [
      ex(
        "Explicit iterator loop",
        `vector<string> names = {"Ada", "Bo", "Cy"};\nfor (auto it = names.begin(); it != names.end(); ++it) {\n    cout << *it << " ";\n}\ncout << "\\n";`,
        `Ada Bo Cy `,
      ),
      ex(
        "Range-for is the same thing, nicer",
        `vector<int> v = {1, 2, 3};\nfor (int& x : v) {\n    x *= 10;\n}\nfor (int x : v) cout << x << " ";\ncout << "\\n";`,
        `10 20 30 `,
        `The compiler rewrites range-for into the begin/end iterator loop you just saw.`,
      ),
    ],
    realWorld: `Iterator pairs are the STL's universal currency: algorithms take them, containers produce them. Understanding "end is one past the last" prevents a whole family of off-by-one bugs in production code.`,
    practice: `Given a vector of words, use an explicit iterator loop to print only words longer than 3 characters; then rewrite it as a range-for and confirm identical output.`,
    mistakes: [
      `Dereferencing end() — it points past the data; undefined behavior`,
      `Erasing from a vector inside a range-for — invalidates the hidden iterator; use the erase-iterator pattern instead`,
    ],
    best: [
      `Default to range-for; drop to explicit iterators only when you need erase/insert control`,
      `Use <code>const auto&amp;</code> in range-for unless you're mutating elements`,
    ],
    template: `#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    vector<string> words = {"hi", "hello", "hey", "howdy"};\n    for (auto it = words.begin(); it != words.end(); ++it) {\n        if (it->length() > 3) cout << *it << " ";\n    }\n    cout << "\\n";\n    return 0;\n}`,
    quiz: [
      q(
        "What does container.end() point to?",
        ["The last element", "One past the last element", "nullptr", "The first element"],
        1,
        `end() is a sentinel boundary — never dereference it.`,
      ),
      q(
        "for (auto& x : v) under the hood uses…",
        ["Indexes", "begin()/end() iterators", "Recursion", "Pointers to v itself"],
        1,
        `Range-for is defined in terms of the iterator protocol.`,
      ),
      q(
        "When might iterators become invalid?",
        [
          "Never",
          "After container modifications like push_back or erase",
          "After reading them",
          "When const",
        ],
        1,
        `Growth can reallocate storage; erasure shifts elements — old iterators then dangle.`,
      ),
    ],
  }),

  L("STL Algorithms", ["stl", "advanced-cpp"], "advanced", 14, {
    intro: `<p>The <code>&lt;algorithm&gt;</code> header is a library of pre-built, tested loops: sort, find, count, transform, accumulate. Professional C++ composes these instead of hand-rolling iteration — less code, fewer bugs, and often better performance than your manual loop.</p>`,
    concepts: [
      `<strong>sort(begin, end)</strong> — ascending by default; custom comparators via lambdas`,
      `<strong>find / count_if</strong> — search and conditional counting`,
      `<strong>accumulate</strong> — folds a range into one value (from &lt;numeric&gt;)`,
      `<strong>Lambdas</strong> — <code>[](int x) { return x &gt; 5; }</code> — inline predicates`,
    ],
    examples: [
      ex(
        "sort + custom comparator",
        `vector<int> v = {5, 2, 9, 1};\nsort(v.begin(), v.end());\nfor (int x : v) cout << x << " ";\ncout << "\\n";\nsort(v.begin(), v.end(), [](int a, int b) { return a > b; });\nfor (int x : v) cout << x << " ";\ncout << "\\n";`,
        `1 2 5 9 \n9 5 2 1 `,
      ),
      ex(
        "count_if and accumulate",
        `vector<int> scores = {88, 45, 92, 70, 61};\nint passing = count_if(scores.begin(), scores.end(),\n                       [](int s) { return s >= 60; });\nint total = accumulate(scores.begin(), scores.end(), 0);\ncout << passing << " passing, avg " << total / (int)scores.size() << "\\n";`,
        `4 passing, avg 71`,
      ),
    ],
    realWorld: `"Sort by price descending, count items in stock, total the cart" — three lines with algorithms. Code reviewers in C++ shops habitually replace raw loops with named algorithms because the name documents the intent.`,
    practice: `Given a vector of prices, use sort to find the cheapest three, count_if to count items under 20, and accumulate for the total. One algorithm call each — no hand-written loops.`,
    mistakes: [
      `Passing the container instead of iterators: <code>sort(v)</code> doesn't compile (until C++20 ranges) — it's <code>sort(v.begin(), v.end())</code>`,
      `Comparators that aren't strict weak orderings (e.g. using <code>&gt;=</code>) — undefined behavior in sort`,
    ],
    best: [
      `Know the big five: sort, find, count_if, transform, accumulate — they cover most daily loop needs`,
      `Name complex lambdas as variables for readability: <code>auto isPassing = [](int s){ return s >= 60; };</code>`,
    ],
    template: `#include <iostream>\n#include <vector>\n#include <algorithm>\n#include <numeric>\nusing namespace std;\n\nint main() {\n    vector<int> prices = {49, 5, 120, 32, 89, 17};\n    sort(prices.begin(), prices.end());\n    cout << "cheapest: " << prices[0] << " " << prices[1] << " " << prices[2] << "\\n";\n    int cheap = count_if(prices.begin(), prices.end(), [](int p) { return p < 20; });\n    cout << cheap << " items under 20\\n";\n    cout << "total: " << accumulate(prices.begin(), prices.end(), 0) << "\\n";\n    return 0;\n}`,
    quiz: [
      q(
        "sort(v.begin(), v.end(), [](int a, int b){ return a > b; }) sorts…",
        ["Ascending", "Descending", "Randomly", "By absolute value"],
        1,
        `The comparator answers 'should a come before b?' — greater-than puts big first.`,
      ),
      q(
        "Which header provides std::accumulate?",
        ["<algorithm>", "<numeric>", "<vector>", "<math>"],
        1,
        `accumulate (and friends like iota) live in <numeric>.`,
      ),
      q(
        "count_if returns…",
        [
          "The matching elements",
          "An iterator",
          "How many elements satisfy the predicate",
          "true/false",
        ],
        2,
        `It counts predicate hits across the range.`,
      ),
    ],
  }),

  L("Exception Handling", ["exception-handling"], "advanced", 14, {
    intro: `<p>C++ exceptions separate error handling from the main logic: code that detects a problem <code>throw</code>s; code that can respond <code>catch</code>es; everything in between unwinds automatically — running destructors as it goes. That stack unwinding is why RAII and exceptions are designed for each other.</p>`,
    concepts: [
      `<strong>throw</strong> — usually a std::exception subtype like runtime_error`,
      `<strong>try / catch</strong> — catch by const reference`,
      `<strong>Stack unwinding</strong> — locals are destroyed on the way to the handler`,
      `<strong>what()</strong> — the standard message accessor`,
    ],
    examples: [
      ex(
        "Throwing and catching",
        `#include <stdexcept>\n\ndouble divide(double a, double b) {\n    if (b == 0) {\n        throw runtime_error("division by zero");\n    }\n    return a / b;\n}\n\nint main() {\n    try {\n        cout << divide(10, 2) << "\\n";\n        cout << divide(5, 0) << "\\n";\n        cout << "never reached\\n";\n    } catch (const runtime_error& e) {\n        cout << "Error: " << e.what() << "\\n";\n    }\n    cout << "program continues\\n";\n    return 0;\n}`,
        `5\nError: division by zero\nprogram continues`,
      ),
      ex(
        "vector.at throws for you",
        `vector<int> v = {1, 2, 3};\ntry {\n    cout << v.at(10) << "\\n";\n} catch (const out_of_range& e) {\n    cout << "caught: " << e.what() << "\\n";\n}`,
        `caught: vector::_M_range_check: __n (which is 10) >= this->size() (which is 3)`,
        `at() is the bounds-checked access — [] would have been silent undefined behavior.`,
      ),
    ],
    realWorld: `Parsers throw on malformed input, allocators throw bad_alloc when memory runs out, file APIs throw on missing paths. Servers wrap request handlers in catch blocks so one bad request can't kill the process.`,
    practice: `Write <code>int parseAge(int n)</code> that throws invalid_argument for negatives and out_of_range for values over 150. Call it three ways inside one try with two catch blocks.`,
    mistakes: [
      `Catching by value (<code>catch (runtime_error e)</code>) — copies and can slice; catch by const&`,
      `Using exceptions for normal control flow — they're for exceptional failures, not expected branches`,
    ],
    best: [
      `Throw standard types (or derive from std::exception) so callers can catch uniformly`,
      `Order catch blocks from most derived to most general; <code>catch (const exception&amp;)</code> last`,
    ],
    template: `#include <iostream>\n#include <stdexcept>\nusing namespace std;\n\nint parseAge(int n) {\n    if (n < 0) throw invalid_argument("age below zero");\n    if (n > 150) throw out_of_range("age too large");\n    return n;\n}\n\nint main() {\n    int tests[] = {30, -5, 200};\n    for (int t : tests) {\n        try {\n            cout << "ok: " << parseAge(t) << "\\n";\n        } catch (const exception& e) {\n            cout << "rejected: " << e.what() << "\\n";\n        }\n    }\n    return 0;\n}`,
    quiz: [
      q(
        "How should you catch exceptions?",
        ["By value", "By pointer", "By const reference", "Not at all"],
        2,
        `const& avoids copying and object slicing.`,
      ),
      q(
        "What happens to local objects between a throw and its catch?",
        [
          "Leaked",
          "Their destructors run during stack unwinding",
          "Frozen",
          "Copied to the handler",
        ],
        1,
        `Unwinding destroys locals scope by scope — the synergy with RAII.`,
      ),
      q(
        "Which vector access throws on bad index?",
        ["v[i]", "v.at(i)", "v.get(i)", "Both [] and at"],
        1,
        `at() checks bounds and throws out_of_range; [] does not check.`,
      ),
    ],
  }),

  L("Smart Pointers", ["memory-management", "advanced-cpp"], "advanced", 16, {
    intro: `<p>Smart pointers finish the RAII story: they're objects that own heap memory and delete it automatically. <code>unique_ptr</code> models single ownership and costs nothing extra. <code>shared_ptr</code> reference-counts for shared ownership. Modern C++ guideline: <em>never</em> write naked new/delete in application code.</p>`,
    concepts: [
      `<strong>unique_ptr</strong> — sole owner; auto-deletes; movable but not copyable`,
      `<strong>make_unique / make_shared</strong> — the safe construction helpers`,
      `<strong>shared_ptr</strong> — last owner standing deletes; <code>.use_count()</code>`,
      `<strong>Ownership design</strong> — default to unique; share only when lifetime is genuinely shared`,
    ],
    examples: [
      ex(
        "unique_ptr: automatic cleanup",
        `#include <memory>\n\nstruct Hero {\n    Hero() { cout << "spawned\\n"; }\n    ~Hero() { cout << "despawned\\n"; }\n    int hp = 100;\n};\n\nint main() {\n    {\n        auto hero = make_unique<Hero>();\n        hero->hp -= 30;\n        cout << "hp: " << hero->hp << "\\n";\n    }  // hero deleted here, automatically\n    cout << "after scope\\n";\n    return 0;\n}`,
        `spawned\nhp: 70\ndespawned\nafter scope`,
      ),
      ex(
        "shared_ptr counts owners",
        `auto data = make_shared<vector<int>>();\ndata->push_back(7);\ncout << data.use_count() << "\\n";\n{\n    auto second = data;\n    cout << data.use_count() << "\\n";\n}\ncout << data.use_count() << "\\n";`,
        `1\n2\n1`,
        `The vector dies only when the LAST shared_ptr releases it.`,
      ),
    ],
    realWorld: `Codebases at Google, Microsoft, and every modern C++ shop ban raw owning pointers in new code. unique_ptr in a factory function ("you own what I return") is the standard resource-handoff idiom.`,
    practice: `Create a unique_ptr to a struct with a loud destructor inside a nested block and watch the lifetime. Then try copying it (compile error — read it!), and use std::move to transfer ownership instead.`,
    mistakes: [
      `Copying a unique_ptr — doesn't compile by design; transfer with std::move`,
      `shared_ptr cycles (A holds B, B holds A) — the counts never reach zero; break cycles with weak_ptr`,
    ],
    best: [
      `Reach for unique_ptr by default — it's a zero-overhead RAII pointer`,
      `Construct with make_unique/make_shared rather than raw new — exception-safe and tidier`,
    ],
    template: `#include <iostream>\n#include <memory>\nusing namespace std;\n\nstruct Hero {\n    Hero() { cout << "spawned\\n"; }\n    ~Hero() { cout << "despawned\\n"; }\n    int hp = 100;\n};\n\nint main() {\n    auto h = make_unique<Hero>();\n    h->hp -= 25;\n    cout << "hp: " << h->hp << "\\n";\n    auto h2 = move(h);  // ownership transferred\n    cout << "moved? " << (h == nullptr) << "\\n";\n    return 0;\n}`,
    quiz: [
      q(
        "When does unique_ptr free its object?",
        [
          "On request only",
          "When the unique_ptr is destroyed or reset",
          "At program exit",
          "Never",
        ],
        1,
        `It's RAII — the owner's destructor deletes the owned object.`,
      ),
      q(
        "Why can't unique_ptr be copied?",
        ["Bug", "Copying would create two sole owners — a contradiction", "Performance", "It can"],
        1,
        `Unique means unique; ownership moves, never duplicates.`,
      ),
      q(
        "shared_ptr frees its object when…",
        ["Any owner dies", "use_count reaches zero", "After 60 seconds", "main returns"],
        1,
        `The last owner's release triggers deletion.`,
      ),
    ],
  }),

  L("File I/O", ["io", "advanced-cpp"], "intermediate", 12, {
    intro: `<p>File streams reuse everything you know about cin/cout: <code>ofstream</code> writes files, <code>ifstream</code> reads them, with the same <code>&lt;&lt;</code> and <code>&gt;&gt;</code> operators. And because streams are RAII objects, files close themselves when the stream goes out of scope.</p>`,
    concepts: [
      `<strong>ofstream / ifstream</strong> — output and input file streams from &lt;fstream&gt;`,
      `<strong>is_open()</strong> — always check; paths fail in real life`,
      `<strong>getline loop</strong> — the standard read-every-line pattern`,
      `<strong>Append mode</strong> — <code>ofstream("log.txt", ios::app)</code>`,
    ],
    examples: [
      ex(
        "Writing a file",
        `#include <fstream>\n\nofstream out("scores.txt");\nif (out.is_open()) {\n    out << "Ada 95\\n";\n    out << "Bo 88\\n";\n}  // closes automatically`,
        ``,
      ),
      ex(
        "Reading it back",
        `ifstream in("scores.txt");\nif (!in.is_open()) {\n    cout << "could not open file\\n";\n    return 1;\n}\nstring name;\nint score;\nwhile (in >> name >> score) {\n    cout << name << " scored " << score << "\\n";\n}`,
        `Ada scored 95\nBo scored 88`,
        `The while condition reads AND checks success in one step — the idiomatic stream loop.`,
      ),
    ],
    realWorld: `Config files, save games, CSV exports, log appenders — file streams handle them all. The stream abstraction also extends to string streams (parsing) and network wrappers, so the skills compound.`,
    practice: `Sketch a program that writes three "name score" lines to a file, reads them back in a while(in >> ...) loop, and prints the highest scorer. (Run locally — the browser runner has no real file system.)`,
    mistakes: [
      `Not checking is_open() — writes go nowhere, reads loop zero times, silently`,
      `Reading with >> into the wrong types — the stream fails and the loop exits early`,
    ],
    best: [
      `Let scope close files (RAII) — explicit close() only when you need the timing`,
      `Check stream state after reads; corrupted input is a when, not an if`,
    ],
    template: `// File streams need a real file system - run locally.\n// The reading pattern, simulated:\n#include <iostream>\n#include <sstream>\nusing namespace std;\n\nint main() {\n    istringstream in("Ada 95\\nBo 88\\nCy 91");\n    string name;\n    int score, best = -1;\n    string bestName;\n    while (in >> name >> score) {\n        if (score > best) { best = score; bestName = name; }\n    }\n    cout << "top: " << bestName << " " << best << "\\n";\n    return 0;\n}`,
    quiz: [
      q(
        "Which class writes to files?",
        ["ifstream", "ofstream", "iostream", "filewriter"],
        1,
        `o = output. ifstream reads, fstream does both.`,
      ),
      q(
        "while (in >> x) loops until…",
        ["Forever", "Extraction fails (EOF or bad data)", "x is 0", "A newline"],
        1,
        `The stream converts to false when a read fails — clean termination.`,
      ),
      q(
        "When does an fstream close if you never call close()?",
        ["Never — leak", "When the stream object goes out of scope", "At a flush", "On EOF"],
        1,
        `Streams are RAII — destruction closes the file.`,
      ),
    ],
  }),

  L("Modern C++ Practices", ["advanced-cpp"], "advanced", 14, {
    intro: `<p>C++ has evolved enormously since 2011. Modern C++ is a different dialect: <code>auto</code> for deduction, range-for, nullptr, smart pointers, const-correctness, and brace initialization. This capstone collects the habits that mark code as current — and that interviewers and reviewers look for.</p>`,
    concepts: [
      `<strong>auto</strong> — let the compiler deduce verbose types`,
      `<strong>nullptr</strong> — typed null; never 0 or NULL`,
      `<strong>Brace init</strong> — <code>int x{5};</code> refuses silent narrowing`,
      `<strong>const everything</strong> — values, references, methods that don't mutate`,
      `<strong>RAII + smart pointers</strong> — no naked new/delete`,
    ],
    examples: [
      ex(
        "Modern style in one snippet",
        `const vector<string> langs{"C++", "Python", "Rust"};\nfor (const auto& lang : langs) {\n    cout << lang << " ";\n}\ncout << "\\n";\nauto total{0};\nfor (auto i{1}; i <= 4; ++i) total += i;\ncout << total << "\\n";`,
        `C++ Python Rust \n10`,
      ),
      ex(
        "Narrowing caught at compile time",
        `int a = 3.7;    // compiles! a == 3, silently\n// int b{3.7};  // error: narrowing conversion\ncout << a << "\\n";`,
        `3`,
        `Brace initialization turns a silent data-loss bug into a compile error.`,
      ),
    ],
    realWorld: `The C++ Core Guidelines (by the language's creators) codify these rules, and tools like clang-tidy enforce them in CI. Writing modern C++ isn't style points — it's measurably fewer memory bugs, the #1 security vulnerability class.`,
    practice: `Take this old-style fragment and modernize it: <code>int* p = new int(5); int n = 3.9; for (int i = 0; i &lt; v.size(); i++) cout &lt;&lt; v[i];</code> — smart pointer, brace init, range-for.`,
    mistakes: [
      `auto everywhere including where it hides important types — use it for verbose/obvious types, not to obscure`,
      `Mixing eras: raw owning pointers next to unique_ptr in the same module — pick the modern idiom and migrate`,
    ],
    best: [
      `Compile with warnings on (-Wall -Wextra) and treat them as errors`,
      `Default to: const, auto, range-for, brace-init, make_unique — deviate only with reason`,
    ],
    template: `#include <iostream>\n#include <vector>\n#include <memory>\nusing namespace std;\n\nint main() {\n    auto p = make_unique<int>(5);\n    int n{3};  // int n{3.9} would not compile\n    const vector<int> v{10, 20, 30};\n    for (const auto& x : v) {\n        cout << x + *p + n << " ";\n    }\n    cout << "\\n";\n    return 0;\n}`,
    quiz: [
      q(
        "Why prefer nullptr over NULL or 0?",
        [
          "Shorter",
          "It has a distinct pointer type, avoiding overload ambiguity",
          "Faster",
          "Tradition",
        ],
        1,
        `NULL is an integer constant — it can select the wrong overload; nullptr can't.`,
      ),
      q(
        "int x{3.7}; does what?",
        ["x = 3", "x = 4", "Compile error — narrowing", "x = 3.7"],
        2,
        `Brace initialization rejects lossy conversions at compile time.`,
      ),
      q(
        "The modern C++ guideline for new/delete in application code is…",
        [
          "Use freely",
          "Avoid — use RAII types and smart pointers",
          "Only new is fine",
          "Only in classes",
        ],
        1,
        `Ownership belongs in types (vector, string, unique_ptr), not in manual calls.`,
      ),
    ],
  }),
];

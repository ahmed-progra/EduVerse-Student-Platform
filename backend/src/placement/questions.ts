export interface PlacementQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
}

const pythonQuestions: PlacementQuestion[] = [
  {
    id: "py-1",
    question: "What is the correct way to print text to the console in Python?",
    options: ["console.log('Hello')", "print('Hello')", "echo 'Hello'", "printf('Hello')"],
    correctIndex: 1,
  },
  {
    id: "py-2",
    question: "Which of the following is a valid Python variable name?",
    options: ["2name", "my-name", "my_name", "my name"],
    correctIndex: 2,
  },
  {
    id: "py-3",
    question: "What data type is the value `3.14` in Python?",
    options: ["int", "float", "double", "decimal"],
    correctIndex: 1,
  },
  {
    id: "py-4",
    question: "How do you create a list in Python?",
    options: ["list = {1, 2, 3}", "list = [1, 2, 3]", "list = (1, 2, 3)", "list = <1, 2, 3>"],
    correctIndex: 1,
  },
  {
    id: "py-5",
    question: "Which keyword is used to define a function in Python?",
    options: ["function", "func", "def", "define"],
    correctIndex: 2,
  },
  {
    id: "py-6",
    question: "What will `len('Hello')` return?",
    options: ["4", "5", "6", "undefined"],
    correctIndex: 1,
  },
  {
    id: "py-7",
    question: "Which loop in Python iterates over a sequence?",
    options: ["for", "foreach", "loop", "while"],
    correctIndex: 0,
  },
  {
    id: "py-8",
    question: "How do you write a conditional statement in Python?",
    options: ["if x > 5:", "if (x > 5)", "if x > 5 then", "when x > 5:"],
    correctIndex: 0,
  },
  {
    id: "py-9",
    question: "What keyword is used to define a class in Python?",
    options: ["class", "struct", "object", "type"],
    correctIndex: 0,
  },
  {
    id: "py-10",
    question: "Which of the following creates a dictionary in Python?",
    options: ["d = [1, 2, 3]", "d = {1, 2, 3}", "d = {'a': 1, 'b': 2}", "d = (1, 2, 3)"],
    correctIndex: 2,
  },
];

const htmlQuestions: PlacementQuestion[] = [
  {
    id: "html-1",
    question: "Which tag is used to create a hyperlink in HTML?",
    options: ["<link>", "<a>", "<href>", "<url>"],
    correctIndex: 1,
  },
  {
    id: "html-2",
    question: "What does the `<img>` tag require to display an image?",
    options: ["href", "src", "link", "url"],
    correctIndex: 1,
  },
  {
    id: "html-3",
    question: "Which HTML tag is used for the largest heading?",
    options: ["<heading>", "<h6>", "<h1>", "<head>"],
    correctIndex: 2,
  },
  {
    id: "html-4",
    question: "Which tag creates an unordered list?",
    options: ["<ol>", "<list>", "<ul>", "<li>"],
    correctIndex: 2,
  },
  {
    id: "html-5",
    question: "Which attribute specifies the URL for a form submission?",
    options: ["method", "action", "target", "submit"],
    correctIndex: 1,
  },
  {
    id: "html-6",
    question: "Which tag is used to define a table row?",
    options: ["<td>", "<th>", "<tr>", "<table>"],
    correctIndex: 2,
  },
  {
    id: "html-7",
    question: "What does the `<br>` tag do?",
    options: ["Bold text", "Insert a line break", "Add a border", "Break a table"],
    correctIndex: 1,
  },
  {
    id: "html-8",
    question: "Which HTML5 element represents navigation links?",
    options: ["<navigate>", "<nav>", "<links>", "<menu>"],
    correctIndex: 1,
  },
  {
    id: "html-9",
    question: "Which input type creates a checkbox?",
    options: ["type='check'", "type='box'", "type='checkbox'", "type='toggle'"],
    correctIndex: 2,
  },
  {
    id: "html-10",
    question: "Which tag is used to embed an external webpage?",
    options: ["<embed>", "<object>", "<iframe>", "<frame>"],
    correctIndex: 2,
  },
];

const cssQuestions: PlacementQuestion[] = [
  {
    id: "css-1",
    question: "Which CSS property changes the text color?",
    options: ["font-color", "text-color", "color", "foreground"],
    correctIndex: 2,
  },
  {
    id: "css-2",
    question: "Which property adds space inside an element, between content and border?",
    options: ["margin", "padding", "spacing", "gap"],
    correctIndex: 1,
  },
  {
    id: "css-3",
    question: "Which CSS property makes a flex container?",
    options: ["display: block", "display: flex", "display: grid", "display: inline"],
    correctIndex: 1,
  },
  {
    id: "css-4",
    question: "Which value of `position` makes an element fixed relative to the viewport?",
    options: ["relative", "absolute", "fixed", "sticky"],
    correctIndex: 2,
  },
  {
    id: "css-5",
    question: "Which CSS property creates a grid layout?",
    options: ["display: flex", "display: block", "display: grid", "display: table"],
    correctIndex: 2,
  },
  {
    id: "css-6",
    question: "Which selector targets an element with id='header'?",
    options: [".header", "#header", "*header", "header"],
    correctIndex: 1,
  },
  {
    id: "css-7",
    question: "Which property creates rounded corners?",
    options: ["corner-radius", "border-radius", "round", "border-style"],
    correctIndex: 1,
  },
  {
    id: "css-8",
    question: "Which CSS unit is relative to the parent element's font size?",
    options: ["px", "rem", "em", "vw"],
    correctIndex: 2,
  },
  {
    id: "css-9",
    question: "What does `@media` do in CSS?",
    options: ["Imports a font", "Defines an animation", "Creates responsive breakpoints", "Declares variables"],
    correctIndex: 2,
  },
  {
    id: "css-10",
    question: "Which property adds a shadow to an element?",
    options: ["text-shadow", "box-shadow", "shadow", "drop-shadow"],
    correctIndex: 1,
  },
];

const cppQuestions: PlacementQuestion[] = [
  {
    id: "cpp-1",
    question: "Which header is needed for input/output in C++?",
    options: ["<stdio.h>", "<iostream>", "<conio.h>", "<fstream>"],
    correctIndex: 1,
  },
  {
    id: "cpp-2",
    question: "Which operator is used to output to the console in C++?",
    options: ["<<", ">>", "&", "|"],
    correctIndex: 0,
  },
  {
    id: "cpp-3",
    question: "How do you declare a constant in C++?",
    options: ["let x = 5", "const int x = 5", "constant x = 5", "#define x = 5"],
    correctIndex: 1,
  },
  {
    id: "cpp-4",
    question: "What is the correct way to declare an array in C++?",
    options: ["int arr[5];", "arr int[5];", "int[5] arr;", "array<int, 5> arr;"],
    correctIndex: 0,
  },
  {
    id: "cpp-5",
    question: "What does `&` mean when used in a function parameter like `int &x`?",
    options: ["Address of x", "Reference to x", "Bitwise AND", "Pointer to x"],
    correctIndex: 1,
  },
  {
    id: "cpp-6",
    question: "Which keyword is used to allocate dynamic memory in C++?",
    options: ["malloc", "alloc", "new", "create"],
    correctIndex: 2,
  },
  {
    id: "cpp-7",
    question: "Which of the following is used to define a class in C++?",
    options: ["class MyClass {}", "struct MyClass {}", "object MyClass {}", "type MyClass {}"],
    correctIndex: 0,
  },
  {
    id: "cpp-8",
    question: "What is a constructor in C++?",
    options: ["A function that deletes an object", "A function called when an object is created", "A function that returns values", "A type of loop"],
    correctIndex: 1,
  },
  {
    id: "cpp-9",
    question: "Which keyword enables inheritance in C++?",
    options: ["extends", "inherits", ":", "base"],
    correctIndex: 2,
  },
  {
    id: "cpp-10",
    question: "What does `std::vector` do?",
    options: ["A fixed-size array", "A dynamic array", "A string type", "A pointer type"],
    correctIndex: 1,
  },
];

const questionBanks: Record<string, PlacementQuestion[]> = {
  python: pythonQuestions,
  html: htmlQuestions,
  css: cssQuestions,
  cpp: cppQuestions,
};

export function getQuestionsForCourse(slug: string): PlacementQuestion[] {
  return questionBanks[slug] || [];
}

export function getCourseSlugs(): string[] {
  return Object.keys(questionBanks);
}

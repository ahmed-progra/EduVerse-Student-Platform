import { L, q, ex, LessonDef } from "./types";

export const math: LessonDef[] = [
  L("Variables and Expressions", ["algebra", "expressions"], "beginner", 10, {
    intro: `<p>Algebra uses symbols — usually letters like <code>x</code> and <code>y</code> — to represent unknown numbers. An expression is a combination of variables, numbers, and operations such as <code>2x + 5</code>. Evaluating an expression means substituting values for the variables and computing the result.</p>`,
    concepts: [
      `<strong>Variable</strong> — a symbol that represents an unknown value, typically <code>x</code>, <code>y</code>, or <code>n</code>`,
      `<strong>Expression</strong> — a combination of variables, numbers, and operators: <code>3x + 2</code>`,
      `<strong>Substitution</strong> — replace each variable with a given number to evaluate`,
      `<strong>Order of operations</strong> — parentheses, exponents, multiplication/division, addition/subtraction (PEMDAS)`,
    ],
    examples: [
      ex("Evaluating a simple expression", `x = 4\nresult = 2 * x + 3\nprint("2x + 3 =", result)`, `2x + 3 = 11`),
      ex("Expression with two variables", `x = 5\ny = 2\nresult = 3 * x - 2 * y\nprint("3x - 2y =", result)`, `3x - 2y = 11`),
    ],
    realWorld: `Engineers use algebraic expressions to calculate stress on materials. Business analysts use them to model profit: <code>revenue - cost × quantity</code>. Every programming language evaluates expressions constantly.`,
    practice: `Evaluate <code>4a + 3b - c</code> when a = 6, b = 5, c = 7. Modify the template to compute it.`,
    mistakes: [
      `Ignoring order of operations: <code>2 + 3 * 4</code> is 14, not 20 — multiplication comes before addition`,
      `Mixing up variable names: using <code>x</code> in one place and <code>X</code> in another — math is case-sensitive`,
    ],
    best: [
      `Always use parentheses to make the order of operations clear: <code>2 * x + (y - 1)</code>`,
      `Choose descriptive variable names when possible — <code>price</code> and <code>tax</code> instead of <code>p</code> and <code>t</code>`,
    ],
    template: `a = 6\nb = 5\nc = 7\nresult = 4 * a + 3 * b - c\nprint("4a + 3b - c =", result)`,
    quiz: [
      q("What is 3x + 2 when x = 7?", ["21", "23", "20", "17"], 1, `3 × 7 + 2 = 21 + 2 = 23.`),
      q("Evaluate 2a − b when a = 8 and b = 3", ["13", "11", "5", "16"], 0, `2 × 8 − 3 = 16 − 3 = 13.`),
      q("Which operation comes first in 3 + 4 × 2?", ["Addition", "Multiplication", "Either", "Subtraction"], 1, `Multiplication before addition: 4 × 2 = 8, then 3 + 8 = 11.`),
    ],
  }),

  L("Linear Equations", ["algebra", "equations"], "beginner", 12, {
    intro: `<p>A linear equation states that two expressions are equal, like <code>2x + 3 = 7</code>. Solving means isolating the variable — getting it alone on one side. Whatever you do to one side, you must do to the other.</p>`,
    concepts: [
      `<strong>Equation</strong> — two expressions joined by an <code>=</code> sign`,
      `<strong>Inverse operations</strong> — addition undoes subtraction; multiplication undoes division`,
      `<strong>Isolate the variable</strong> — apply inverse operations until the variable stands alone`,
      `<strong>Check your answer</strong> — substitute the solution back into the original equation`,
    ],
    examples: [
      ex("Two-step equation", `# 2x + 3 = 7\n# Subtract 3: 2x = 4\n# Divide by 2: x = 2\nx = 2\ncheck = 2 * x + 3\nprint("x =", x)\nprint("Check: 2x + 3 =", check)`, `x = 2\nCheck: 2x + 3 = 7`),
      ex("Variables on both sides", `# 5x - 3 = 2x + 9\n# Subtract 2x: 3x - 3 = 9\n# Add 3: 3x = 12\n# Divide: x = 4\nx = 4\nprint("x =", x)\nprint("Check LHS:", 5 * x - 3)\nprint("Check RHS:", 2 * x + 9)`, `x = 4\nCheck LHS: 17\nCheck RHS: 17`),
    ],
    realWorld: `Every "solve for x" in science, finance, and engineering is a linear equation. Calculating break-even points, converting temperatures (F = 1.8C + 32), and computing loan payments all use linear equations.`,
    practice: `Solve <code>3x - 7 = 14</code>. Modify the template to compute x and verify by checking both sides.`,
    mistakes: [
      `Forgetting to apply the operation to both sides: subtracting 3 from only the left breaks the equality`,
      `Sign errors when moving terms: <code>2x + 3 = 7</code> → <code>2x = 7 - 3</code>, not <code>7 + 3</code>`,
    ],
    best: [
      `Write each step on a new line — it makes errors much easier to spot`,
      `Always check your answer by plugging it back into the original equation`,
    ],
    template: `# Solve: 3x - 7 = 14\n# 3x = 14 + 7\n# 3x = 21\n# x = 21 / 3\nx = 21 // 3\nprint("x =", x)\nlhs = 3 * x - 7\nprint("Check:", lhs, "= 14")`,
    quiz: [
      q("Solve 4x + 5 = 21", ["x = 4", "x = 5", "x = 6.5", "x = 3"], 0, `4x = 21 − 5 = 16, so x = 4.`),
      q("What is the first step to solve 3x − 8 = 13?", ["Divide by 3", "Add 8 to both sides", "Subtract 13", "Multiply by 3"], 1, `Undo the subtraction first: add 8 to both sides.`),
      q("Check which value satisfies 2x + 1 = 9", ["3", "4", "5", "6"], 1, `2 × 4 + 1 = 9 ✓`),
    ],
  }),

  L("Quadratic Equations", ["algebra", "quadratics", "equations"], "intermediate", 14, {
    intro: `<p>A quadratic equation takes the form <code>ax² + bx + c = 0</code> where a ≠ 0. The quadratic formula <code>x = (-b ± √(b² - 4ac)) / 2a</code> solves any quadratic. The expression under the square root — the discriminant — tells you how many real solutions exist.</p>`,
    concepts: [
      `<strong>Standard form</strong> — <code>ax² + bx + c = 0</code> with a, b, c as coefficients`,
      `<strong>Quadratic formula</strong> — <code>x = (-b ± √(b² - 4ac)) / 2a</code>`,
      `<strong>Discriminant</strong> — <code>Δ = b² - 4ac</code>: positive → 2 real roots, zero → 1 real root, negative → 0 real roots`,
      `<strong>Factoring</strong> — when a = 1, find two numbers that multiply to c and add to b`,
    ],
    examples: [
      ex("Using the quadratic formula", `import math\na, b, c = 1, -3, 2\nd = b**2 - 4*a*c\nroot1 = (-b + math.sqrt(d)) / (2*a)\nroot2 = (-b - math.sqrt(d)) / (2*a)\nprint("Roots:", root1, "and", root2)\nprint("Discriminant:", d)`, `Roots: 2.0 and 1.0\nDiscriminant: 1`),
      ex("Negative discriminant (no real roots)", `import math\na, b, c = 1, 2, 5\nd = b**2 - 4*a*c\nprint("Discriminant:", d)\nif d < 0:\n    print("No real roots")`, `Discriminant: -16\nNo real roots`),
    ],
    realWorld: `Quadratic equations model projectile motion (height of a ball over time), area optimization (maximizing a rectangle's area with fixed perimeter), and profit maximization in economics.`,
    practice: `Solve 2x² − 7x + 3 = 0 using the quadratic formula. Compute both roots and the discriminant.`,
    mistakes: [
      `Forgetting the ± in the formula — you need both roots, not just one`,
      `Sign errors: <code>-b</code> when b is already negative becomes positive: if b = -5, then -b = 5`,
    ],
    best: [
      `Compute the discriminant first — if it's negative, you can stop and report "no real roots"`,
      `Double-check that a, b, and c are in standard form before plugging into the formula`,
    ],
    template: `import math\na, b, c = 2, -7, 3\nd = b**2 - 4*a*c\nroot1 = (-b + math.sqrt(d)) / (2*a)\nroot2 = (-b - math.sqrt(d)) / (2*a)\nprint("Roots:", root1, "and", root2)\nprint("Check root1:", a*root1**2 + b*root1 + c)\nprint("Check root2:", a*root2**2 + b*root2 + c)`,
    quiz: [
      q("What does a positive discriminant tell you?", ["No real roots", "One real root", "Two real roots", "Three real roots"], 2, `Δ > 0 means two distinct real roots.`),
      q("For x² − 5x + 6 = 0, what is the discriminant?", ["25", "1", "−1", "−11"], 1, `Δ = (−5)² − 4(1)(6) = 25 − 24 = 1.`),
      q("What is the quadratic formula?", ["x = (-b ± √(b² - 4ac)) / 2a", "x = (-b ± √(b² + 4ac)) / 2a", "x = (b ± √(b² - 4ac)) / a", "x = -b/2a"], 0, `The ± and the discriminant under the square root are the key parts.`),
    ],
  }),

  L("Functions and Graphs", ["algebra", "functions", "graphs"], "intermediate", 12, {
    intro: `<p>A function takes an input and produces an output. If <code>f(x) = 2x + 1</code>, then <code>f(3) = 7</code>. The graph of a function shows every (x, y) pair where <code>y = f(x)</code>. The slope tells you how steep the line is, and the y-intercept is where it crosses the y-axis.</p>`,
    concepts: [
      `<strong>Function notation</strong> — <code>f(x) = 2x + 1</code> means "plug in x, get out 2x + 1"`,
      `<strong>Slope</strong> — rate of change: <code>m = (y₂ - y₁) / (x₂ - x₁)</code>`,
      `<strong>y-intercept</strong> — the value of y when x = 0, often denoted b`,
      `<strong>Slope-intercept form</strong> — <code>y = mx + b</code> where m is slope and b is y-intercept`,
    ],
    examples: [
      ex("Evaluating and plotting a function", `def f(x):\n    return 2 * x + 1\nfor x in range(-5, 6):\n    y = f(x)\n    print(f"x={x:2d}  y={y:2d}  {'#' * (y + 5)}")`, `x=-5  y=-9\nx=-4  y=-7\nx=-3  y=-5\nx=-2  y=-3\nx=-1  y=-1\nx= 0  y= 1  #\nx= 1  y= 3  ###\nx= 2  y= 5  #####\nx= 3  y= 7  #######\nx= 4  y= 9  #########\nx= 5  y=11  ###########`),
      ex("Finding slope between two points", `x1, y1 = 1, 3\nx2, y2 = 4, 11\nslope = (y2 - y1) / (x2 - x1)\nprint("Slope:", slope)\nb = y1 - slope * x1\nprint("y-intercept:", b)\nprint("Equation: y =", slope, "x +", b)`, `Slope: 2.666...\ny-intercept: 0.333...\nEquation: y = 2.666... x + 0.333...`),
    ],
    realWorld: `Functions model relationships everywhere: distance over time at constant speed (d = vt), cost of a call with a fixed line fee plus per-minute charge, or converting currencies.`,
    practice: `Write a function <code>f(x) = 3x - 2</code> and compute its values at x = -2, 0, 2, 4. Find the slope and y-intercept.`,
    mistakes: [
      `Confusing <code>f(x)</code> with multiplication: <code>f(x)</code> means "apply function f", not "multiply f by x"`,
      `Computing slope backwards: always <code>(y₂ - y₁) / (x₂ - x₁)</code>, not the other way around`,
    ],
    best: [
      `Use function notation early — it prepares you for programming (functions work the same way)`,
      `When given two points, always compute slope first — the rest of the equation follows from it`,
    ],
    template: `def f(x):\n    return 3 * x - 2\nfor x in [-2, 0, 2, 4]:\n    print(f"f({x}) = {f(x)}")\nm = 3  # slope\nb = -2  # y-intercept\nprint("\\nSlope (m):", m)\nprint("Y-intercept (b):", b)\nprint("Equation: y = 3x - 2")`,
    quiz: [
      q("If f(x) = 3x − 1, what is f(4)?", ["7", "11", "12", "13"], 1, `3 × 4 − 1 = 12 − 1 = 11.`),
      q("What is the slope of y = 5x + 2?", ["5", "2", "1", "7"], 0, `In y = mx + b, m is the slope. Here m = 5.`),
      q("A line through (1, 3) and (3, 7) has slope...", ["1", "2", "3", "4"], 1, `(7 − 3) / (3 − 1) = 4 / 2 = 2.`),
    ],
  }),

  L("Angles and Triangles", ["geometry", "triangles", "angles"], "beginner", 10, {
    intro: `<p>Triangles are the simplest rigid shape. Every triangle has three interior angles that always add to 180°. The Pythagorean theorem (<code>a² + b² = c²</code>) relates the sides of a right triangle — the longest side (c) is called the hypotenuse.</p>`,
    concepts: [
      `<strong>Angle sum</strong> — all three interior angles of a triangle add to 180°`,
      `<strong>Right triangle</strong> — one angle is exactly 90°`,
      `<strong>Pythagorean theorem</strong> — <code>a² + b² = c²</code>, where c is the hypotenuse`,
      `<strong>Types by angle</strong> — acute (all < 90°), right (one = 90°), obtuse (one > 90°)`,
    ],
    examples: [
      ex("Finding the missing angle", `a, b = 50, 70\nc = 180 - a - b\nprint("Angles:", a, b, c)\nprint("Sum:", a + b + c)`, `Angles: 50 70 60\nSum: 180`),
      ex("Using the Pythagorean theorem", `import math\na, b = 3, 4\nc = math.sqrt(a**2 + b**2)\nprint("Hypotenuse:", c)\nprint("Check:", a**2, "+", b**2, "=", c**2)`, `Hypotenuse: 5.0\nCheck: 9 + 16 = 25.0`),
    ],
    realWorld: `Triangles are the backbone of construction — roof trusses, bridges, and cranes all use triangles because they don't flex. Surveyors use triangulation to measure distances. Carpenters use the 3-4-5 rule to make square corners.`,
    practice: `A right triangle has legs of length 5 and 12. Compute the hypotenuse. Also, if two angles are 45° and 85°, find the third.`,
    mistakes: [
      `Assuming any triangle is right — only when one angle is exactly 90° does Pythagoras apply`,
      `Putting the hypotenuse on the wrong side: c must be the longest side, opposite the right angle`,
    ],
    best: [
      `The largest side is always opposite the largest angle — use this to check your work`,
      `Memorize the 3-4-5 and 5-12-13 right triangles — they appear frequently`,
    ],
    template: `import math\na, b = 5, 12\nc = math.sqrt(a**2 + b**2)\nprint("Hypotenuse:", c)\nprint("Check: 5² + 12² =", a**2 + b**2, "=", round(c**2))\n\n# Missing angle\nang1, ang2 = 45, 85\nang3 = 180 - ang1 - ang2\nprint("\\nThird angle:", ang3, "degrees")`,
    quiz: [
      q("Two angles of a triangle are 40° and 70°. What's the third?", ["60°", "70°", "80°", "90°"], 1, `180 − 40 − 70 = 70°.`),
      q("A right triangle has legs 6 and 8. What's the hypotenuse?", ["10", "12", "14", "9"], 0, `√(6² + 8²) = √(36 + 64) = √100 = 10.`),
      q("What kind of triangle has angles 120°, 30°, 30°?", ["Acute", "Right", "Obtuse", "Degenerate"], 2, `120° > 90°, so it's obtuse.`),
    ],
  }),

  L("Circles and Area", ["geometry", "circles"], "beginner", 12, {
    intro: `<p>A circle is defined by its center and radius (r) — the distance from center to edge. Two key measurements: the circumference (distance around) is <code>C = 2πr</code>, and the area (space inside) is <code>A = πr²</code>. π (pi) is approximately 3.14159.</p>`,
    concepts: [
      `<strong>Radius</strong> — distance from center to any point on the circle`,
      `<strong>Diameter</strong> — twice the radius: <code>d = 2r</code>`,
      `<strong>Circumference</strong> — <code>C = 2πr</code> or <code>C = πd</code>`,
      `<strong>Area</strong> — <code>A = πr²</code>`,
    ],
    examples: [
      ex("Circumference and area of a circle", `import math\nr = 7\nC = 2 * math.pi * r\nA = math.pi * r**2\nprint(f"Radius: {r}")\nprint(f"Circumference: {C:.2f}")\nprint(f"Area: {A:.2f}")`, `Radius: 7\nCircumference: 43.98\nArea: 153.94`),
      ex("Working backwards from circumference", `import math\nC = 31.4\nr = C / (2 * math.pi)\nprint(f"Radius: {r:.2f}")\nprint(f"Area: {math.pi * r**2:.2f}")`, `Radius: 5.0\nArea: 78.54`),
    ],
    realWorld: `Pizza sizes (a 12-inch pie has area 113 in²), wheels (revolutions = distance / circumference), satellite dishes, and planetary orbits all involve circle geometry. Engineers calculate pipe cross-sections using πr².`,
    practice: `A pizza has diameter 16 inches. Compute its radius, circumference, and area.`,
    mistakes: [
      `Confusing radius and diameter: area uses r, not d — A = π(d/2)², not πd²`,
      `Forgetting to square r in the area formula: πr², not πr`,
    ],
    best: [
      `Use <code>math.pi</code> from Python's math module instead of typing 3.14 — it's more accurate`,
      `When in doubt, label your units: area is in square units, circumference in linear units`,
    ],
    template: `import math\nd = 16\nr = d / 2\nC = 2 * math.pi * r\nA = math.pi * r**2\nprint(f"Radius: {r} inches")\nprint(f"Circumference: {C:.2f} inches")\nprint(f"Area: {A:.2f} square inches")`,
    quiz: [
      q("What is the area of a circle with radius 3?", ["9π", "6π", "3π", "12π"], 0, `A = π × 3² = 9π.`),
      q("If a circle has area 25π, what is its radius?", ["5", "10", "25", "12.5"], 0, `πr² = 25π → r² = 25 → r = 5.`),
      q("A circle's circumference is 2πr. What is its diameter?", ["r", "2r", "πr", "r/2"], 1, `Diameter = 2r.`),
    ],
  }),

  L("3D Shapes: Volume and Surface Area", ["geometry", "3d-shapes"], "intermediate", 14, {
    intro: `<p>Three-dimensional shapes have volume (how much space they occupy) and surface area (the total area of their outer faces). Key formulas: sphere volume <code>V = (4/3)πr³</code>, cylinder volume <code>V = πr²h</code>, rectangular prism volume <code>V = lwh</code>. Surface area sums the area of every face.</p>
<!-- 3D MODEL PLACEHOLDER -->`,
    concepts: [
      `<strong>Volume</strong> — cubic units: how much 3D space an object occupies`,
      `<strong>Surface area</strong> — square units: total area of all outer surfaces`,
      `<strong>Sphere</strong> — <code>V = (4/3)πr³</code>, <code>SA = 4πr²</code>`,
      `<strong>Rectangular prism</strong> — <code>V = lwh</code>, <code>SA = 2(lw + lh + wh)</code>`,
    ],
    examples: [
      ex("Sphere volume and surface area", `import math\nr = 5\nV = 4/3 * math.pi * r**3\nSA = 4 * math.pi * r**2\nprint(f"Radius: {r}")\nprint(f"Volume: {V:.2f}")\nprint(f"Surface Area: {SA:.2f}")`, `Radius: 5\nVolume: 523.60\nSurface Area: 314.16`),
      ex("Rectangular prism", `import math\nl, w, h = 4, 3, 6\nV = l * w * h\nSA = 2 * (l*w + l*h + w*h)\nprint(f"Dimensions: {l} x {w} x {h}")\nprint(f"Volume: {V}")\nprint(f"Surface Area: {SA}")`, `Dimensions: 4 x 3 x 6\nVolume: 72\nSurface Area: 108`),
    ],
    realWorld: `Manufacturers calculate box volume for packaging. Painters estimate surface area for paint coverage. Architects use volume for HVAC sizing. Sphere volume formulas are used in medicine for tumor measurement from CT scans.`,
    practice: `A cylindrical water tank has radius 2.5 m and height 4 m. Compute its volume (<code>V = πr²h</code>) and surface area (<code>SA = 2πr² + 2πrh</code>).`,
    mistakes: [
      `Forgetting to cube r in sphere volume: <code>r³</code>, not <code>r²</code>`,
      `Mixing up lateral surface area vs. total surface area on cylinders — total includes both circular ends`,
    ],
    best: [
      `Draw a quick sketch and label all dimensions before picking a formula`,
      `Double-check units: volume is cubic, surface area is square — they measure different things`,
    ],
    template: `import math\nr = 2.5\nh = 4\nV = math.pi * r**2 * h\nSA = 2 * math.pi * r**2 + 2 * math.pi * r * h\nprint(f"Tank radius: {r} m")\nprint(f"Tank height: {h} m")\nprint(f"Volume: {V:.2f} m³")\nprint(f"Surface Area: {SA:.2f} m²")`,
    quiz: [
      q("What is the volume formula for a sphere?", ["(4/3)πr³", "πr²h", "4πr²", "lwh"], 0, `The sphere's volume is (4/3)π × radius cubed.`),
      q("A cube has side length 3. What is its volume?", ["9", "18", "27", "36"], 2, `V = 3³ = 27.`),
      q("Which has units of square meters?", ["Volume", "Surface area", "Both", "Neither"], 1, `Surface area is measured in square units; volume in cubic units.`),
    ],
  }),

  L("Coordinate Geometry", ["geometry", "coordinates", "graphs"], "intermediate", 12, {
    intro: `<p>The coordinate plane uses an x-axis (horizontal) and y-axis (vertical) to locate points as (x, y). The distance formula <code>d = √((x₂ - x₁)² + (y₂ - y₁)²)</code> finds how far apart two points are. The midpoint formula <code>((x₁ + x₂)/2, (y₁ + y₂)/2)</code> finds the point halfway between them.</p>`,
    concepts: [
      `<strong>Coordinate pair</strong> — <code>(x, y)</code> where x is horizontal, y is vertical`,
      `<strong>Distance formula</strong> — <code>d = √((x₂ - x₁)² + (y₂ - y₁)²)</code> — derived from Pythagoras`,
      `<strong>Midpoint formula</strong> — <code>M = ((x₁ + x₂)/2, (y₁ + y₂)/2)</code>`,
      `<strong>Quadrants</strong> — the axes divide the plane into 4 quadrants numbered counterclockwise from top-right`,
    ],
    examples: [
      ex("Distance between two points", `import math\nx1, y1 = 1, 2\nx2, y2 = 4, 6\nd = math.sqrt((x2-x1)**2 + (y2-y1)**2)\nprint(f"Distance: {d:.2f}")`, `Distance: 5.0`),
      ex("Midpoint and slope", `x1, y1 = 0, 0\nx2, y2 = 8, 6\nmx = (x1 + x2) / 2\nmy = (y1 + y2) / 2\nm = (y2 - y1) / (x2 - x1)\nprint(f"Midpoint: ({mx}, {my})")\nprint(f"Slope: {m}")`, `Midpoint: (4.0, 3.0)\nSlope: 0.75`),
    ],
    realWorld: `GPS coordinates are (latitude, longitude) pairs. Maps use coordinate geometry for routing. Computer graphics place pixels on a coordinate grid. Game developers use distance formulas for collision detection.`,
    practice: `Points A(2, 3) and B(10, 9). Compute the distance between them, the midpoint, and the slope of line AB.`,
    mistakes: [
      `Forgetting the square root in distance: <code>d = √((Δx)² + (Δy)²)</code>, not <code>d = (Δx)² + (Δy)²</code>`,
      `Subtracting in wrong order: distance uses absolute differences, so the order of points doesn't matter`,
    ],
    best: [
      `Always label your points as (x₁, y₁) and (x₂, y₂) before plugging into formulas`,
      `The distance formula is just the Pythagorean theorem: the difference in x and y are the legs of a right triangle`,
    ],
    template: `import math\nx1, y1 = 2, 3\nx2, y2 = 10, 9\nd = math.sqrt((x2-x1)**2 + (y2-y1)**2)\nmx = (x1 + x2) / 2\nmy = (y1 + y2) / 2\nm = (y2 - y1) / (x2 - x1)\nprint(f"Distance: {d:.2f}")\nprint(f"Midpoint: ({mx}, {my})")\nprint(f"Slope: {m:.2f}")`,
    quiz: [
      q("What is the distance between (0, 0) and (3, 4)?", ["5", "7", "1", "25"], 0, `√((3)² + (4)²) = √(9 + 16) = √25 = 5.`),
      q("What is the midpoint of (2, 4) and (6, 8)?", ["(4, 6)", "(8, 12)", "(3, 4)", "(4, 5)"], 0, `((2+6)/2, (4+8)/2) = (4, 6).`),
      q("In which quadrant is the point (−3, 5)?", ["Quadrant I", "Quadrant II", "Quadrant III", "Quadrant IV"], 1, `Negative x, positive y → Quadrant II (top-left).`),
    ],
  }),

  L("Limits and Continuity", ["calculus", "limits"], "advanced", 14, {
    intro: `<p>A limit asks what value a function approaches as the input gets closer to some point. We write <code>lim f(x) as x → a</code>. A function is continuous at a point if the limit exists, the function is defined there, and both are equal. Limits are the foundation of calculus — derivatives and integrals are both defined as limits.</p>`,
    concepts: [
      `<strong>Limit notation</strong> — <code>lim f(x) as x → a</code> means "what does f(x) approach?"`,
      `<strong>One-sided limits</strong> — approach from the left (<code>x → a⁻</code>) or right (<code>x → a⁺</code>)`,
      `<strong>Continuity</strong> — <code>lim f(x) = f(a)</code> at every point in the domain`,
      `<strong>Discontinuities</strong> — jump (gap), removable (hole), infinite (vertical asymptote)`,
    ],
    examples: [
      ex("Approaching a limit numerically", `def f(x):\n    return (x**2 - 1) / (x - 1)\nfor x in [1.5, 1.1, 1.01, 1.001]:\n    print(f"x={x:.3f}  f(x)={f(x):.5f}")`, `x=1.500  f(x)=2.50000\nx=1.100  f(x)=2.10000\nx=1.010  f(x)=2.01000\nx=1.001  f(x)=2.00100`),
      ex("A limit that doesn't exist (jump)", `def f(x):\n    return 1 if x >= 0 else -1\nfor x in [-0.1, -0.01, 0, 0.01, 0.1]:\n    print(f"x={x:+.2f}  f(x)={f(x):+.0f}")`, `x=-0.10  f(x)=-1\nx=-0.01  f(x)=-1\nx=+0.00  f(x)=+1\nx=+0.01  f(x)=+1\nx=+0.10  f(x)=+1`),
    ],
    realWorld: `Limits model instantaneous rates: the speedometer shows your car's speed at one exact moment — that's a limit. Economics uses limits for marginal cost. Physics uses limits for instantaneous velocity.`,
    practice: `Compute <code>lim (sin(x)/x)</code> as x → 0 numerically by evaluating at x = 0.1, 0.01, 0.001, 0.0001. What does it approach?`,
    mistakes: [
      `Thinking "limit at a" means "value at a" — a function can approach a different value than its actual output`,
      `Confusing limit existing with the function being defined — a limit can exist even at a hole`,
    ],
    best: [
      `Always check from both sides — if left and right limits differ, the limit doesn't exist`,
      `For rational functions, try factoring and canceling before evaluating the limit`,
    ],
    template: `import math\ndef f(x):\n    return math.sin(x) / x\nfor x in [0.1, 0.01, 0.001, 0.0001]:\n    print(f"x={x:.6f}  f(x)={f(x):.8f}")\nprint("\\nAs x → 0, sin(x)/x → 1.0")`,
    quiz: [
      q("What is lim (x² − 1)/(x − 1) as x → 1?", ["0", "1", "2", "Undefined"], 2, `Factoring gives (x-1)(x+1)/(x-1) = x+1, which approaches 2.`),
      q("When does a limit NOT exist?", ["Left and right limits differ", "Function is always positive", "x is large", "Right limit equals left limit"], 0, `Different one-sided limits mean the overall limit doesn't exist.`),
      q("A function is continuous at x = a if...", ["f(a) exists", "lim f(x) exists", "Both exist and are equal", "f(a) = 0"], 2, `Continuity requires f defined, limit exists, and they match.`),
    ],
  }),

  L("Derivatives", ["calculus", "derivatives"], "advanced", 16, {
    intro: `<p>The derivative measures how a function changes at each point — its instantaneous rate of change. Geometrically, it's the slope of the tangent line. If <code>f(x) = x²</code>, then <code>f'(x) = 2x</code>: the slope at x = 3 is 6. We can approximate derivatives numerically using <code>f'(x) ≈ (f(x + h) - f(x)) / h</code> for very small h.</p>`,
    concepts: [
      `<strong>Derivative</strong> — <code>f'(x)</code> or <code>dy/dx</code>: instantaneous rate of change`,
      `<strong>Difference quotient</strong> — <code>(f(x + h) - f(x)) / h</code> as h → 0`,
      `<strong>Power rule</strong> — if <code>f(x) = xⁿ</code>, then <code>f'(x) = n·xⁿ⁻¹</code>`,
      `<strong>Tangent line</strong> — a line that touches the curve at exactly one point, slope = derivative`,
    ],
    examples: [
      ex("Numerical derivative approximation", `def f(x):\n    return x**2\nh = 0.001\nx = 3\nslope = (f(x + h) - f(x)) / h\nprint(f"At x={x}, f'(x) ≈ {slope:.6f}")\nprint(f"Actual: 2x = {2*x}")`, `At x=3, f'(x) ≈ 6.001000\nActual: 2x = 6`),
      ex("Power rule in action", `def derivative_of_x3(x):\n    return 3 * x**2\nfor x in [1, 2, 3, 4]:\n    print(f"x={x}: f'(x)={derivative_of_x3(x)}")`, `x=1: f'(x)=3\nx=2: f'(x)=12\nx=3: f'(x)=27\nx=4: f'(x)=48`),
    ],
    realWorld: `Derivatives tell you how fast things change: speed (derivative of position), acceleration (derivative of velocity), marginal cost in economics, and population growth rate. Machine learning uses derivatives (gradients) to optimize models.`,
    practice: `Use the numerical method to approximate the derivative of <code>f(x) = x³</code> at x = 2. Compare with the power rule result (3 × 2² = 12).`,
    mistakes: [
      `Forgetting the h in the denominator: <code>(f(x + h) - f(x)) / h</code>, not just <code>f(x + h) - f(x)</code>`,
      `Using too large an h for numerical approximation — h should be very small (0.001 or smaller)`,
    ],
    best: [
      `Master the power rule first — it covers most derivative problems you'll encounter initially`,
      `Use the numerical approximation to check your symbolic derivative answers`,
    ],
    template: `def f(x):\n    return x**3\nh = 0.0001\nx = 2\nnumerical = (f(x + h) - f(x)) / h\npower_rule = 3 * x**2\nprint(f"Numerical: f'({x}) ≈ {numerical:.6f}")\nprint(f"Power rule: 3·{x}² = {power_rule}")`,
    quiz: [
      q("What is the derivative of f(x) = x⁵?", ["5x⁴", "x⁴", "5x⁵", "4x⁵"], 0, `Power rule: n·xⁿ⁻¹ = 5x⁴.`),
      q("The derivative represents...", ["Area under the curve", "Instantaneous rate of change", "Average value", "The y-intercept"], 1, `The derivative measures how fast f is changing at a specific x.`),
      q("What does the limit (f(x+h) - f(x))/h as h→0 give you?", ["The integral", "The derivative", "The limit at infinity", "The absolute value"], 1, `This is the definition of the derivative.`),
    ],
  }),

  L("Integration", ["calculus", "integration"], "advanced", 16, {
    intro: `<p>Integration is the reverse of differentiation — it finds the area under a curve. The definite integral <code>∫<sub>a</sub><sup>b</sup> f(x) dx</code> gives the signed area between x = a and x = b. We can approximate it using a Riemann sum: divide the area into rectangles and sum them. As the rectangles get narrower, the approximation improves.</p>`,
    concepts: [
      `<strong>Integral</strong> — the area under the curve <code>f(x)</code> from a to b`,
      `<strong>Riemann sum</strong> — approximate area using rectangles of width Δx`,
      `<strong>Power rule (reverse)</strong> — <code>∫ xⁿ dx = xⁿ⁺¹/(n+1) + C</code>`,
      `<strong>Definite vs indefinite</strong> — definite gives a number; indefinite gives a family of functions (+ C)`,
    ],
    examples: [
      ex("Riemann sum approximation", `def f(x):\n    return x**2\na, b, n = 0, 2, 1000\ndx = (b - a) / n\narea = 0\nfor i in range(n):\n    x = a + i * dx\n    area += f(x) * dx\nprint(f"Riemann sum: {area:.6f}")\nprint(f"Actual ∫ x² dx from 0 to 2: {8/3:.6f}")`, `Riemann sum: 2.666668\nActual ∫ x² dx from 0 to 2: 2.666667`),
      ex("Reverse power rule", `def indefinite_power(n):\n    return f"∫ x^{n} dx = x^{n+1} / {n+1} + C"\nfor n in [1, 2, 3]:\n    print(indefinite_power(n))`, `∫ x¹ dx = x² / 2 + C\n∫ x² dx = x³ / 3 + C\n∫ x³ dx = x⁴ / 4 + C`),
    ],
    realWorld: `Integrals compute distances from velocity data, areas of irregular shapes, total accumulated growth, energy consumption over time, and probabilities in statistics. Every time you aggregate a rate over time, you're integrating.`,
    practice: `Use a Riemann sum to approximate ∫₀³ x² dx with 1000 rectangles. The actual value is 9. How close do you get?`,
    mistakes: [
      `Forgetting the constant of integration C in indefinite integrals — derivatives destroy constants, so integrals must add them back`,
      `Using too few rectangles for Riemann sums — more rectangles = better accuracy`,
    ],
    best: [
      `Use Riemann sums to build intuition before learning the Fundamental Theorem of Calculus`,
      `Check integration by differentiating your answer — if f'(x) = original, you integrated correctly`,
    ],
    template: `def f(x):\n    return x**2\na, b, n = 0, 3, 1000\ndx = (b - a) / n\narea = 0\nfor i in range(n):\n    x = a + i * dx\n    area += f(x) * dx\nprint(f"∫ x² dx from {a} to {b} ≈ {area:.6f}")\nprint(f"Actual: {b**3/3 - a**3/3:.6f}")`,
    quiz: [
      q("What is ∫ x³ dx?", ["x⁴/4 + C", "3x² + C", "x⁴ + C", "x²/2 + C"], 0, `∫ x³ dx = x⁴/4 + C.`),
      q("A Riemann sum approximates...", ["The derivative", "The area under a curve", "The slope", "The y-intercept"], 1, `Riemann sums approximate the definite integral (area).`),
      q("More rectangles in a Riemann sum gives...", ["Less accuracy", "More accuracy", "No change", "More computation but same accuracy"], 1, `More narrower rectangles better approximate the true area.`),
    ],
  }),

  L("Applications of Calculus", ["calculus", "applications", "optimization"], "advanced", 14, {
    intro: `<p>Calculus solves real-world optimization problems: maximizing profit, minimizing materials, finding when a population peaks. The key insight — at a maximum or minimum, the derivative is zero (<code>f'(x) = 0</code>). Find critical points by solving <code>f'(x) = 0</code>, then check which gives the highest or lowest value.</p>`,
    concepts: [
      `<strong>Critical points</strong> — where <code>f'(x) = 0</code> or is undefined — candidates for max/min`,
      `<strong>Optimization</strong> — use derivatives to find optimal values in real problems`,
      `<strong>Related rates</strong> — how fast does one quantity change when another changes?`,
      `<strong>Fundamental Theorem</strong> — integration and differentiation are inverse operations`,
    ],
    examples: [
      ex("Maximizing area with fixed perimeter", `# A farmer has 100m of fencing for a rectangular pen\n# Maximize area: A = l * w, with 2l + 2w = 100\n# A(l) = l * (50 - l) = 50l - l²\n# A'(l) = 50 - 2l = 0 → l = 25\nl = 25\nw = 50 - l\narea = l * w\nprint(f"Length: {l}m, Width: {w}m")\nprint(f"Maximum area: {area}m²")`, `Length: 25m, Width: 25m\nMaximum area: 625m²`),
      ex("Rate of change (related rates)", `# A balloon's radius increases at 2 cm/s\n# How fast does volume increase when r = 10?\n# V = (4/3)πr³, dV/dt = 4πr² * dr/dt\nimport math\nr = 10\ndr_dt = 2\ndV_dt = 4 * math.pi * r**2 * dr_dt\nprint(f"At r={r}cm, volume increases at {dV_dt:.0f} cm³/s")`, `At r=10cm, volume increases at 2513 cm³/s`),
    ],
    realWorld: `Companies maximize profit by producing where marginal cost = marginal revenue (both derivatives). Package designers minimize surface area for a given volume. Epidemiologists model when an outbreak peaks.`,
    practice: `A rocket's height is h(t) = −5t² + 50t + 100. Find when it reaches maximum height (<code>h'(t) = 0</code>) and what that height is.`,
    mistakes: [
      `Assuming every critical point is a max — check the second derivative or compare values`,
      `Forgetting to verify that a critical point is within the feasible domain of the problem`,
    ],
    best: [
      `Write down what you're maximizing/minimizing as a function of one variable first`,
      `Use the second derivative test: f''(x) > 0 means local minimum, f''(x) < 0 means local maximum`,
    ],
    template: `# h(t) = -5t² + 50t + 100 (missile height in meters after t seconds)\n# h'(t) = -10t + 50 = 0  →  t = 5\nt_max = 5\nh_max = -5 * t_max**2 + 50 * t_max + 100\nprint(f"Max height at t = {t_max}s")\nprint(f"Height: {h_max}m")`,
    quiz: [
      q("At a maximum, the derivative is...", ["Positive", "Negative", "Zero", "Undefined"], 2, `At local max/min, the tangent line is horizontal → derivative = 0.`),
      q("If f'(x) = 3x² − 12, what are the critical points?", ["x = 2, −2", "x = 0, 4", "x = 3, −3", "x = 6"], 0, `3x² − 12 = 0 → x² = 4 → x = ±2.`),
      q("Optimization problems require...", ["Only the derivative", "Setting derivative to zero and checking", "Integrating twice", "Using Riemann sums"], 1, `Find f' = 0 (critical points) then verify which gives the best value.`),
    ],
  }),

  L("Mean, Median, Mode", ["statistics", "data"], "beginner", 10, {
    intro: `<p>Three ways to describe the "center" of a data set. The <strong>mean</strong> is the average (sum ÷ count). The <strong>median</strong> is the middle value when sorted. The <strong>mode</strong> is the most frequent value. Outliers (extreme values) affect the mean more than the median.</p>`,
    concepts: [
      `<strong>Mean</strong> — <code>sum(data) / n</code>: the arithmetic average`,
      `<strong>Median</strong> — the middle value: for odd n it's the center; for even n, average of the two middle`,
      `<strong>Mode</strong> — the value that appears most often (can have 0, 1, or multiple modes)`,
      `<strong>Outlier impact</strong> — a single extreme value can pull the mean significantly but barely affects the median`,
    ],
    examples: [
      ex("Computing all three", `data = [15, 22, 18, 22, 30, 17, 22]\nmean = sum(data) / len(data)\nsorted_data = sorted(data)\nn = len(sorted_data)\nif n % 2 == 1:\n    median = sorted_data[n // 2]\nelse:\n    median = (sorted_data[n//2 - 1] + sorted_data[n//2]) / 2\nprint(f"Data: {data}")\nprint(f"Mean: {mean:.1f}")\nprint(f"Median: {median}")\nprint(f"Mode: 22 (appears 3 times)")`, `Data: [15, 22, 18, 22, 30, 17, 22]\nMean: 20.9\nMedian: 22\nMode: 22 (appears 3 times)`),
      ex("Effect of an outlier", `data1 = [10, 12, 11, 13, 14]\ndata2 = [10, 12, 11, 13, 100]\nprint(f"Without outlier: mean={sum(data1)/len(data1):.1f}")\nprint(f"With outlier:    mean={sum(data2)/len(data2):.1f}")`, `Without outlier: mean=12.0\nWith outlier:    mean=29.2`),
    ],
    realWorld: `Salaries: the median gives a better sense of typical pay since the mean is pulled up by executives. Teachers use the mean to compute grades. Retailers use the mode to find the most popular product size.`,
    practice: `For the data set [8, 3, 5, 9, 3, 7, 5, 5, 2], compute the mean, median, and mode.`,
    mistakes: [
      `Sorting the data before finding the median (correct) but forgetting to sort before finding the mode (can skip)`,
      `Averaging the two middle numbers for median with even n — don't forget this step`,
    ],
    best: [
      `Report both mean and median when data might contain outliers — they tell different stories`,
      `When multiple modes exist, report all of them rather than picking just one`,
    ],
    template: `data = [8, 3, 5, 9, 3, 7, 5, 5, 2]\nmean = sum(data) / len(data)\ns = sorted(data)\nn = len(s)\nif n % 2 == 1:\n    median = s[n // 2]\nelse:\n    median = (s[n//2 - 1] + s[n//2]) / 2\nprint(f"Data: {data}")\nprint(f"Mean: {mean:.1f}")\nprint(f"Median: {median}")`,
    quiz: [
      q("What is the median of [3, 7, 2, 9, 5]? (sorted: 2, 3, 5, 7, 9)", ["5", "6", "4", "7"], 0, `The middle (3rd) value in sorted order is 5.`),
      q("Adding an extreme outlier to a data set affects which most?", ["Median", "Mode", "Mean", "None of them"], 2, `The mean is pulled toward the outlier; median is barely affected.`),
      q("What is the mode of [1, 2, 2, 3, 4, 4, 4, 5]?", ["2", "4", "3", "2 and 4"], 1, `4 appears 3 times — more than any other value.`),
    ],
  }),

  L("Probability Basics", ["probability", "statistics"], "intermediate", 12, {
    intro: `<p>Probability measures how likely something is to happen, from 0 (impossible) to 1 (certain). If you flip a fair coin, P(heads) = 0.5. If you roll a die, P(rolling a 3) = 1/6 ≈ 0.167. The probability of an event is the number of favorable outcomes divided by the total number of possible outcomes.</p>`,
    concepts: [
      `<strong>Probability range</strong> — always between 0 and 1, often written as a fraction or percentage`,
      `<strong>P(event)</strong> = favorable outcomes / total outcomes`,
      `<strong>Complement</strong> — P(not event) = 1 − P(event)`,
      `<strong>Independent events</strong> — P(A and B) = P(A) × P(B) when outcomes don't affect each other`,
    ],
    examples: [
      ex("Coin flips and dice rolls", `import random\nflips = 10000\nheads = sum(1 for _ in range(flips) if random.random() < 0.5)\nprint(f"Heads in {flips} flips: {heads} ({heads/flips:.4f})")\nprint(f"Theoretical: 0.5000")`, `Heads in 10000 flips: 5023 (0.5023)\nTheoretical: 0.5000`),
      ex("Probability of rolling a 6 twice", `total = 0\nsixes = 0\nfor _ in range(10000):\n    if random.randint(1,6) == 6:\n        total += 1\n    if random.randint(1,6) == 6:\n        total += 0\n# P(two sixes in a row)\nprob_theory = 1/36\nprint(f"P(two sixes) = {prob_theory:.4f} (theory)")`, `P(two sixes) = 0.0278 (theory)`),
    ],
    realWorld: `Weather forecasts (40% chance of rain), insurance premiums, medical test accuracy, and casino odds are all probability applications. Sports statistics use probability for win predictions.`,
    practice: `What is the probability of drawing a red card from a standard 52-card deck? (Hearts and diamonds are red — 26 red cards). Compute the theoretical value.`,
    mistakes: [
      `Adding probabilities when you should multiply: P(A AND B) = P(A) × P(B) (for independent events)`,
      `Thinking P(A or B) = P(A) + P(B) always — subtract P(A and B) if events overlap`,
    ],
    best: [
      `Run simulations (Monte Carlo) to check your probability calculations — they converge to the theoretical value`,
      `List all possible outcomes when counting — missing some leads to wrong probabilities`,
    ],
    template: `# Probability of drawing a red card from 52-card deck\nred = 26\ntotal = 52\np_red = red / total\nprint(f"P(red) = {red}/{total} = {p_red:.4f} = {p_red*100:.1f}%")`,
    quiz: [
      q("What is P(rolling a 5 on a 6-sided die)?", ["1/5", "1/6", "5/6", "1/2"], 1, `One favorable outcome out of six possible.`),
      q("P(heads on a coin AND rolling a 3 on a die)?", ["1/12", "1/8", "1/2", "2/3"], 0, `Independent: 1/2 × 1/6 = 1/12.`),
      q("What is P(not rolling a 6)?", ["5/6", "1/6", "1/3", "5/36"], 0, `Complement: 1 − 1/6 = 5/6.`),
    ],
  }),

  L("Normal Distribution", ["statistics", "probability", "normal-distribution"], "intermediate", 14, {
    intro: `<p>The normal (bell-shaped) distribution is the most important distribution in statistics. It's symmetric around the mean, with 68% of data within 1 standard deviation, 95% within 2, and 99.7% within 3. The z-score measures how many standard deviations a value is from the mean: <code>z = (x − μ) / σ</code>.</p>`,
    concepts: [
      `<strong>Standard deviation (σ)</strong> — a measure of how spread out the data is`,
      `<strong>Z-score</strong> — <code>z = (x - μ) / σ</code>: standardizes any normal value`,
      `<strong>68-95-99.7 rule</strong> — the percentage of data within 1, 2, and 3 standard deviations`,
      `<strong>Central Limit Theorem</strong> — averages of samples form a normal distribution, even if the population isn't normal`,
    ],
    examples: [
      ex("Computing z-scores", `import math\nmu = 500  # mean SAT score\nsigma = 100  # standard deviation\nscore = 650\nz = (score - mu) / sigma\nprint(f"SAT score: {score}")\nprint(f"Mean: {mu}, SD: {sigma}")\nprint(f"Z-score: {z:.2f}")`, `SAT score: 650\nMean: 500, SD: 100\nZ-score: 1.50`),
      ex("68-95-99.7 rule in action", `mu, sigma = 100, 15\nfor k, pct in [(1, 68), (2, 95), (3, 99.7)]:\n    lo = mu - k * sigma\n    hi = mu + k * sigma\n    print(f"Within {k}σ ({lo}-{hi}): {pct}% of data")`, `Within 1σ (85-115): 68% of data\nWithin 2σ (70-130): 95% of data\nWithin 3σ (55-145): 99.7% of data`),
    ],
    realWorld: `IQ scores (mean 100, SD 15), SAT scores, heights, measurement errors, and stock returns all follow (or are modeled by) normal distributions. Quality control uses the normal distribution to detect defective products.`,
    practice: `Heights of adult women are normally distributed with mean 165 cm and SD 7 cm. What is the z-score of a woman who is 179 cm tall? What percentage of women are shorter than her?`,
    mistakes: [
      `Applying the normal distribution to data that's clearly skewed — check the shape first`,
      `Confusing standard deviation with variance: σ, not σ², is the spread measure used in z-scores`,
    ],
    best: [
      `Use z-scores to compare values from different normal distributions (e.g., test scores from different exams)`,
      `The 68-95-99.7 rule only works for normal distributions — don't apply it blindly to non-normal data`,
    ],
    template: `mu = 165\nsigma = 7\nheight = 179\nz = (height - mu) / sigma\nprint(f"Height: {height} cm")\nprint(f"Z-score: {z:.2f}")\nprint(f"({height} is {z:.2f} SD above the mean)")`,
    quiz: [
      q("What percentage of data falls within 2 standard deviations of the mean in a normal distribution?", ["68%", "95%", "99.7%", "50%"], 1, `The 68-95-99.7 rule: 95% within 2σ.`),
      q("A z-score of 0 means...", ["The value is 0", "The value equals the mean", "The value is 1 SD below mean", "Error"], 1, `z = (x − μ)/σ = 0 → x = μ.`),
      q("IQ has μ = 100, σ = 15. What is the z-score of IQ = 130?", ["1.0", "2.0", "3.0", "0.5"], 1, `(130 − 100) / 15 = 30 / 15 = 2.0.`),
    ],
  }),

  L("Data Visualization", ["statistics", "visualization", "data"], "intermediate", 12, {
    intro: `<p>Data visualization turns numbers into pictures. A bar chart compares categories. A histogram shows the distribution of a single variable. A scatter plot reveals relationships between two variables. The best visualization depends on the type of data and the question you're trying to answer.</p>`,
    concepts: [
      `<strong>Bar chart</strong> — categories on x-axis, values on y-axis; compares groups`,
      `<strong>Histogram</strong> — numerical data grouped into bins; shows shape and spread`,
      `<strong>Scatter plot</strong> — two numerical variables; reveals correlation (positive, negative, or none)`,
      `<strong>Correlation vs causation</strong> — two variables moving together doesn't mean one causes the other`,
    ],
    examples: [
      ex("Simple bar chart with text", `categories = ["Apples", "Bananas", "Cherries", "Dates"]\nvalues = [30, 45, 15, 25]\nfor cat, val in zip(categories, values):\n    print(f"{cat:10s} | {'#' * val} {val}")`, `Apples     | ############################## 30\nBananas    | ############################################ 45\nCherries   | ############### 15\nDates      | ######################### 25`),
      ex("Histogram-like frequency table", `data = [3, 5, 4, 2, 5, 3, 4, 5, 1, 3, 4, 2, 5, 3]\nfrom collections import Counter\ncounts = Counter(data)\nfor val in sorted(counts):\n    print(f"Value {val}: {'#' * counts[val]} ({counts[val]})")`, `Value 1: # (1)\nValue 2: ## (2)\nValue 3: #### (4)\nValue 4: ### (3)\nValue 5: #### (4)`),
    ],
    realWorld: `News articles use charts to show trends. Scientists use scatter plots to find correlations. Business dashboards use bar charts for sales comparisons. Data journalists expose patterns through thoughtful visualization.`,
    practice: `Create a simple bar chart comparing the heights of 5 friends: [162, 175, 168, 180, 155] cm. Use '#' characters to represent each cm.`,
    mistakes: [
      `Using a bar chart when a histogram is appropriate (and vice versa) — bars are for categories, histograms for numbers`,
      `Misleading axis scales — starting at a non-zero value can exaggerate small differences`,
    ],
    best: [
      `Always label your axes and include units. A chart without labels tells no story`,
      `Choose the simplest chart that communicates the insight — don't add 3D effects or unnecessary decoration`,
    ],
    template: `heights = [("Alice", 162), ("Bob", 175), ("Carol", 168), ("Dave", 180), ("Eve", 155)]\nfor name, h in heights:\n    bar = '#' * (h // 5)\n    print(f"{name:6s}: {bar} {h} cm")`,
    quiz: [
      q("Which chart shows the relationship between two numerical variables?", ["Bar chart", "Histogram", "Scatter plot", "Pie chart"], 2, `Scatter plots show how two numeric variables relate.`),
      q("A histogram shows...", ["Categories compared", "Distribution of one numeric variable", "Correlation", "Time trends"], 1, `Histograms group numbers into bins to show shape and spread.`),
      q("Correlation between two variables means...", ["One causes the other", "They move together", "They are equal", "No relationship"], 1, `Correlation ≠ causation — they move together but something else may cause both.`),
    ],
  }),
];

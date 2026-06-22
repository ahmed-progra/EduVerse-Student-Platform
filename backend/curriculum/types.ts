/**
 * Curriculum authoring model. Each lesson is authored as structured data and
 * rendered to the HTML the lesson page already knows how to display.
 *
 * Every lesson carries the eight required parts:
 * explanation (intro+concepts), examples, interactive exercise (code template),
 * practice task, quiz checkpoint, real-world application, common mistakes,
 * and best practices.
 */

export type Difficulty = "beginner" | "intermediate" | "advanced";

export interface QuizQ {
  q: string;
  options: string[];
  answer: number;
  explain: string;
}

export interface Example {
  label: string;
  code: string;
  output?: string;
  note?: string;
}

export interface LessonDef {
  title: string;
  topics: string[];
  difficulty: Difficulty;
  estMinutes: number;
  intro: string; // plain HTML paragraph(s)
  concepts: string[]; // bullet points (HTML allowed)
  examples: Example[];
  realWorld: string; // where this is used in real software
  practice: string; // practice task description
  mistakes: string[]; // common mistakes
  best: string[]; // best practices
  template: string; // starter code for the interactive visualizer
  quiz: QuizQ[]; // checkpoint questions (stored separately in DB)
}

/** Escape code for safe embedding inside <pre> blocks. */
export function esc(t: string): string {
  return t
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function codeBlock(code: string): string {
  return `<pre class="lesson-code"><code>${esc(code)}</code></pre>`;
}

function outputBlock(text: string): string {
  return `<div class="lesson-output"><strong>Output:</strong> ${esc(text)}</div>`;
}

function bullets(items: string[]): string {
  return items.map((i) => `<li>${i}</li>`).join("");
}

export function renderLesson(def: LessonDef): string {
  const examples = def.examples
    .map(
      (ex) =>
        `<p><strong>${ex.label}</strong></p>${codeBlock(ex.code)}${ex.output !== undefined ? outputBlock(ex.output) : ""}${
          ex.note ? `<p class="lesson-note">${ex.note}</p>` : ""
        }`,
    )
    .join("");

  return `
<div class="lesson-content">
  <div class="lesson-intro">
    <h2>${esc(def.title)}</h2>
    ${def.intro}
  </div>
  <div class="lesson-section">
    <h3>What You'll Learn</h3>
    <ul>${bullets(def.concepts)}</ul>
  </div>
  <div class="lesson-section">
    <h3>Examples</h3>
    ${examples}
  </div>
  <div class="lesson-section">
    <h3>Real-World Application</h3>
    <p>${def.realWorld}</p>
  </div>
  <div class="lesson-section">
    <h3>Try It Yourself</h3>
    <p>${def.practice}</p>
    <p>Use the interactive editor below — run the starter code, then modify it to complete the task.</p>
  </div>
  <div class="lesson-section">
    <h3>Common Mistakes</h3>
    <ul>${bullets(def.mistakes)}</ul>
  </div>
  <div class="lesson-section">
    <h3>Best Practices</h3>
    <ul>${bullets(def.best)}</ul>
  </div>
</div>`;
}

const XP: Record<Difficulty, number> = { beginner: 50, intermediate: 70, advanced: 90 };

/** Convert authored lessons into Prisma Lesson rows (minus courseId). */
export function toLessonRows(lessons: LessonDef[], language: string) {
  return lessons.map((l, i) => ({
    title: l.title,
    content: renderLesson(l),
    codeTemplate: l.template,
    language,
    order: i + 1,
    xpReward: XP[l.difficulty],
    topics: JSON.stringify(l.topics),
    difficulty: l.difficulty,
    quiz: JSON.stringify(l.quiz),
    estMinutes: l.estMinutes,
  }));
}

/** Shorthand authoring helper to keep curriculum files compact. */
export function L(
  title: string,
  topics: string[],
  difficulty: Difficulty,
  estMinutes: number,
  parts: {
    intro: string;
    concepts: string[];
    examples: Example[];
    realWorld: string;
    practice: string;
    mistakes: string[];
    best: string[];
    template: string;
    quiz: QuizQ[];
  },
): LessonDef {
  return { title, topics, difficulty, estMinutes, ...parts };
}

export function q(qText: string, options: string[], answer: number, explain: string): QuizQ {
  return { q: qText, options, answer, explain };
}

export function ex(label: string, code: string, output?: string, note?: string): Example {
  return { label, code, output, note };
}

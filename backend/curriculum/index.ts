import { toLessonRows } from "./types";
import { pythonA } from "./python-a";
import { pythonB } from "./python-b";
import { cppA } from "./cpp-a";
import { cppB } from "./cpp-b";
import { htmlA } from "./html-a";
import { htmlB } from "./html-b";
import { cssA } from "./css-a";
import { cssB } from "./css-b";
import { math } from "./math";
import { physics } from "./physics";
import { science } from "./science";

export interface CourseDef {
  title: string;
  slug: string;
  description: string;
  icon: string;
  order: number;
  lessons: ReturnType<typeof toLessonRows>;
}

export const COURSES: CourseDef[] = [
  {
    title: "Python",
    slug: "python",
    description: "From your first print() to decorators, generators, and real APIs — a complete 36-lesson Python curriculum.",
    icon: "🐍",
    order: 1,
    lessons: toLessonRows([...pythonA, ...pythonB], "python"),
  },
  {
    title: "HTML",
    slug: "html",
    description: "Structure the web properly: semantics, forms, tables, media, accessibility, and modern HTML5 APIs in 26 lessons.",
    icon: "🌐",
    order: 2,
    lessons: toLessonRows([...htmlA, ...htmlB], "html"),
  },
  {
    title: "CSS",
    slug: "css",
    description: "Selectors to stacking contexts, flexbox to fluid design — 28 lessons to master modern CSS layout and motion.",
    icon: "🎨",
    order: 3,
    lessons: toLessonRows([...cssA, ...cssB], "css"),
  },
  {
    title: "C++",
    slug: "cpp",
    description: "Pointers, RAII, the STL, and modern C++ practices — a rigorous 34-lesson path from hello world to smart pointers.",
    icon: "⚡",
    order: 4,
    lessons: toLessonRows([...cppA, ...cppB], "cpp"),
  },
  {
    title: "Mathematics",
    slug: "mathematics",
    description: "From basic algebra to calculus and statistics — a 16-lesson journey through the world of numbers, shapes, and data.",
    icon: "➗",
    order: 5,
    lessons: toLessonRows(math, "python"),
  },
  {
    title: "Physics",
    slug: "physics",
    description: "Newton's laws to quantum basics — 16 lessons exploring mechanics, waves, electricity, and modern physics.",
    icon: "⚛",
    order: 6,
    lessons: toLessonRows(physics, "python"),
  },
  {
    title: "Science",
    slug: "science",
    description: "Cells to the cosmos — 16 lessons across biology, chemistry, earth science, and astronomy.",
    icon: "🔬",
    order: 7,
    lessons: toLessonRows(science, "python"),
  },
];

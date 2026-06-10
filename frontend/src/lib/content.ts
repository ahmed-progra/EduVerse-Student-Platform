import { BookOpen, Code2, GitBranch, type LucideIcon } from "lucide-react";

export interface FeatureCard {
  title: string;
  desc: string;
  icon: LucideIcon;
  href: string;
}

export const FEATURE_CARDS: FeatureCard[] = [
  {
    title: "Interactive Code Visualizer",
    desc: "Watch Python code execute step-by-step. See variables change, loops iterate, and conditions evaluate in real time.",
    icon: Code2,
    href: "/codelab",
  },
  {
    title: "AI-Powered Mentor",
    desc: "Get instant help from your AI co-pilot. Ask questions, review code, generate challenges, and prepare for exams.",
    icon: BookOpen,
    href: "/dashboard",
  },
  {
    title: "Skill Tree & Progression",
    desc: "Unlock new skills, earn XP, and climb the leaderboard. Your learning path adapts as you grow.",
    icon: GitBranch,
    href: "/skill-tree",
  },
];

export const HERO_STATS = [
  { number: "300K+", label: "Students" },
  { number: "50+", label: "Courses" },
  { number: "10K+", label: "Challenges" },
];

export const INTEGRATIONS = [
  "Python", "JavaScript", "HTML/CSS", "C++", "TypeScript",
];

export const CHALLENGE_CATEGORIES = [
  "All", "Python", "JavaScript", "HTML", "CSS", "C++",
];

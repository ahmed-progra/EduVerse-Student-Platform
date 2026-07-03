"use client";

import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { fadeUp, staggerContainer, fastEaseTransition } from "@/lib/motion";
import dynamic from "next/dynamic";
import { useState, useCallback, useEffect } from "react";
import { FlaskConical, RotateCcw, BookOpen, Bug, Keyboard } from "lucide-react";

// Skulpt (the in-browser Python runtime) is ~0.9 MB — load it after first paint
const Visualizer = dynamic(
  () => import("@/features/visualizer/visualizer").then((m) => ({ default: m.Visualizer })),
  {
    ssr: false,
    loading: () => (
      <div
        className="h-[420px] rounded-[var(--radius-card)] bg-eduverse-editor animate-pulse"
        aria-label="Loading editor"
      />
    ),
  },
);

const HANDOFF_KEY = "eduverse_codelab_code";

const PRESETS = [
  {
    name: "Hello World",
    code: 'print("Hello, EduVerse!")\n\nname = input("What\'s your name? ")\nprint(f"Nice to meet you, {name}!")',
  },
  {
    name: "Variables",
    code: '# Variables & Types\nname = "Alice"\nage = 25\nheight = 1.68\nis_student = True\n\nprint(f"{name} is {age} years old")\nprint(type(name))\nprint(type(age))',
  },
  {
    name: "Lists",
    code: '# Lists\nfruits = ["apple", "banana", "cherry"]\nfruits.append("date")\nfruits.sort()\nprint(fruits)\n\n# Slicing\nnumbers = list(range(10))\nprint(numbers[::2])',
  },
  {
    name: "Loops",
    code: '# Loops\nfor i in range(5):\n    print(f"Iteration {i}")\n\n# While\ncount = 0\nwhile count < 3:\n    print(f"Count: {count}")\n    count += 1',
  },
  {
    name: "Functions",
    code: '# Functions\ndef greet(name):\n    return f"Hello, {name}!"\n\ndef add(a, b):\n    return a + b\n\nprint(greet("EduVerse"))\nprint(add(10, 20))',
  },
  {
    name: "Debug Me",
    code: "# Find the bugs!\ndef average(nums):\n    total = sum(nums)\n    return total / len(nums)\n\n# Edge cases\nprint(average([10, 20, 30]))\n# print(average([]))  # what happens?",
  },
];

const BUG_MUTATIONS = [
  (code: string) => code.replace(/==/g, "!="),
  (code: string) => code.replace(/>=/g, "<="),
  (code: string) => code.replace(/<=/g, ">="),
  (code: string) => code.replace(/range\((\d+)\)/g, "range($1 - 1)"),
  (code: string) => code.replace(/range\((\d+),\s*(\d+)\)/g, "range($1, $2 + 1)"),
  (code: string) => code.replace(/ \+\s*(\d+)/g, " - $1"),
  (code: string) => code.replace(/ \*\*/g, " *"),
  (code: string) => code.replace(/print\(/g, "print( str("),
  (code: string) => code.replace(/return /g, "# return "),
  (code: string) => code.replace(/\bTrue\b/g, "False"),
  (code: string) => code.replace(/\bFalse\b/g, "True"),
  (code: string) => code.replace(/\.append\(/g, ".insert(0, "),
  (code: string) => code.replace(/\.sort\(\)/g, ".sort(reverse=True)"),
  (code: string) => code.replace(/for (\w+) in /g, "for $1_dup in "),
  (code: string) => code.replace(/while /g, "if "),
];

export default function CodeLabPage() {
  const [code, setCode] = useState(PRESETS[0].code);

  // Receive code handed off from the skill tree's "Open in Code Lab" action
  useEffect(() => {
    try {
      const handoff = localStorage.getItem(HANDOFF_KEY);
      if (handoff) {
        setCode(handoff);
        localStorage.removeItem(HANDOFF_KEY);
      }
    } catch {}
  }, []);

  const injectBug = useCallback(() => {
    const mutation = BUG_MUTATIONS[Math.floor(Math.random() * BUG_MUTATIONS.length)];
    const buggy = mutation(code);
    if (buggy !== code) {
      setCode(buggy);
    } else {
      const fallback = BUG_MUTATIONS.find((m) => m(code) !== code);
      if (fallback) setCode(fallback(code));
    }
  }, [code]);

  return (
    <motion.div
      className="space-y-6 max-w-6xl mx-auto"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      <motion.div variants={fadeUp} transition={fastEaseTransition}>
        <div className="section-label">
          <span className="section-label-prefix">//</span> Lab
        </div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3 font-display tracking-tight">
          <div className="w-10 h-10 rounded-[var(--radius-button)] bg-eduverse-accent-soft border border-eduverse-border flex items-center justify-center">
            <FlaskConical className="w-5 h-5 text-eduverse-accent-light" />
          </div>
          Code Lab
        </h1>
        <p className="text-eduverse-text-muted">
          Experiment with Python code — step through execution, inspect variables, and debug.
        </p>
      </motion.div>

      {/* Presets */}
      <motion.div
        variants={fadeUp}
        transition={{ ...fastEaseTransition, delay: 0.06 }}
        className="flex flex-wrap items-center gap-2"
      >
        <span className="text-xs text-eduverse-text-muted uppercase tracking-wider flex items-center gap-1.5 font-mono mr-1">
          <BookOpen className="w-3 h-3" /> Presets
        </span>
        {PRESETS.map((p) => (
          <button
            key={p.name}
            onClick={() => setCode(p.code)}
            className={`text-xs px-3.5 py-1.5 rounded-full border transition-all duration-200 active:scale-[0.97] ${
              code === p.code
                ? "bg-eduverse-accent/20 border-eduverse-accent/40 text-eduverse-accent-light shadow-[0_0_8px_oklch(78%_0.14_85/0.12)]"
                : "border-eduverse-border text-eduverse-text-muted hover:border-eduverse-accent/30 hover:text-eduverse-accent hover:bg-eduverse-accent/5"
            }`}
          >
            {p.name}
          </button>
        ))}

        {/* Divider */}
        <span className="w-px h-5 bg-eduverse-border mx-1" />

        <button
          onClick={() => setCode(PRESETS[0].code)}
          className="text-xs px-2.5 py-1.5 rounded-full border border-eduverse-border text-eduverse-text-muted hover:border-eduverse-accent/30 hover:text-eduverse-accent hover:bg-eduverse-accent/5 flex items-center gap-1 transition-all duration-200 active:scale-[0.97]"
          title="Reset"
        >
          <RotateCcw className="w-3 h-3" />
        </button>
        <button
          onClick={injectBug}
          className="text-xs px-3.5 py-1.5 rounded-full border border-eduverse-warning/30 text-eduverse-warning hover:bg-eduverse-warning/10 transition-all duration-200 active:scale-[0.97] flex items-center gap-1.5"
          title="Inject a random bug for debugging"
        >
          <Bug className="w-3 h-3" /> Inject Bug
        </button>
      </motion.div>

      {/* Visualizer */}
      <motion.div variants={fadeUp} transition={{ ...fastEaseTransition, delay: 0.12 }}>
        <GlassCard className="p-4">
          <Visualizer key={code} initialCode={code} language="python" />
        </GlassCard>
      </motion.div>

      {/* Shortcuts */}
      <motion.div variants={fadeUp} transition={{ ...fastEaseTransition, delay: 0.18 }}>
        <div className="codelab-shortcuts-panel">
          <div className="panel-title">
            <Keyboard className="w-3 h-3" /> Keyboard Shortcuts
          </div>
          <div className="codelab-shortcuts-list">
            <span>
              <kbd className="shortcut-kbd">Ctrl+Enter</kbd> Next Step
            </span>
            <span>
              <kbd className="shortcut-kbd">Ctrl+Shift+Enter</kbd> Run All
            </span>
            <span>
              <kbd className="shortcut-kbd">Ctrl+Shift+R</kbd> Reset
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

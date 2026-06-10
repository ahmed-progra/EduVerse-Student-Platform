"use client";

import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { Visualizer } from "@/components/visualizer/visualizer";
import { useState, useCallback, useEffect } from "react";
import { FlaskConical, RotateCcw, BookOpen, Bug } from "lucide-react";

const HANDOFF_KEY = "eduverse_codelab_code";

const PRESETS = [
  { name: "Hello World", code: 'print("Hello, EduVerse!")\n\nname = input("What\'s your name? ")\nprint(f"Nice to meet you, {name}!")' },
  { name: "Variables", code: "# Variables & Types\nname = \"Alice\"\nage = 25\nheight = 1.68\nis_student = True\n\nprint(f\"{name} is {age} years old\")\nprint(type(name))\nprint(type(age))" },
  { name: "Lists", code: "# Lists\nfruits = [\"apple\", \"banana\", \"cherry\"]\nfruits.append(\"date\")\nfruits.sort()\nprint(fruits)\n\n# Slicing\nnumbers = list(range(10))\nprint(numbers[::2])" },
  { name: "Loops", code: "# Loops\nfor i in range(5):\n    print(f\"Iteration {i}\")\n\n# While\ncount = 0\nwhile count < 3:\n    print(f\"Count: {count}\")\n    count += 1" },
  { name: "Functions", code: "# Functions\ndef greet(name):\n    return f\"Hello, {name}!\"\n\ndef add(a, b):\n    return a + b\n\nprint(greet(\"EduVerse\"))\nprint(add(10, 20))" },
  { name: "Debug Me", code: "# Find the bugs!\ndef average(nums):\n    total = sum(nums)\n    return total / len(nums)\n\n# Edge cases\nprint(average([10, 20, 30]))\n# print(average([]))  # what happens?" },
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
    <div className="space-y-6 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <FlaskConical className="w-8 h-8 text-eduverse-accent-light" />
          Code Lab
        </h1>
        <p className="text-eduverse-text-muted">Experiment with Python code — step through execution, inspect variables, and debug.</p>
      </motion.div>

      {/* Presets */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-eduverse-text-muted uppercase tracking-wider flex items-center gap-1">
          <BookOpen className="w-3 h-3" /> Presets:
        </span>
        {PRESETS.map((p) => (
          <button
            key={p.name}
            onClick={() => setCode(p.code)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
              code === p.code
                ? "bg-eduverse-accent/20 border-eduverse-accent/40 text-eduverse-accent-light"
                : "border-eduverse-border text-eduverse-text-muted hover:border-eduverse-accent/30 hover:text-eduverse-accent"
            }`}
          >
            {p.name}
          </button>
        ))}
        <button
          onClick={() => setCode(PRESETS[0].code)}
          className="text-xs px-2 py-1.5 rounded-full border border-eduverse-border text-eduverse-text-muted hover:border-eduverse-accent/30 hover:text-eduverse-accent flex items-center gap-1"
          title="Reset"
        >
          <RotateCcw className="w-3 h-3" />
        </button>
        <span className="text-xs text-eduverse-text-muted mx-1">|</span>
        <button
          onClick={injectBug}
          className="text-xs px-3 py-1.5 rounded-full border border-eduverse-warning/30 text-eduverse-warning hover:bg-eduverse-warning/10 transition-colors flex items-center gap-1"
          title="Inject a random bug for debugging"
        >
          <Bug className="w-3 h-3" /> Inject Bug
        </button>
      </div>

      {/* Visualizer */}
      <GlassCard className="p-4">
        <Visualizer
          key={code}
          initialCode={code}
          language="python"
        />
      </GlassCard>

      {/* Shortcuts */}
      <div className="text-xs text-eduverse-text-muted space-y-1 border border-eduverse-border rounded-xl p-4">
        <div className="font-semibold text-eduverse-text mb-1">Keyboard Shortcuts</div>
        <div className="flex gap-4 flex-wrap">
          <span><kbd className="shortcut-kbd">Ctrl+Enter</kbd> Next Step</span>
          <span><kbd className="shortcut-kbd">Ctrl+Shift+Enter</kbd> Run All</span>
          <span><kbd className="shortcut-kbd">Ctrl+Shift+R</kbd> Reset</span>
        </div>
      </div>
    </div>
  );
}

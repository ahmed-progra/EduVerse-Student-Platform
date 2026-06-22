"use client";

import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientButton } from "@/components/ui/gradient-button";
import { SkillMap, type MapNode } from "@/features/skill-map/skill-map";
import { Confetti } from "@/components/ui/confetti";
import { api } from "@/services/api-client";
import { useAuthStore } from "@/stores/auth-store";
import { fadeUp, staggerContainer, fastEaseTransition } from "@/lib/motion";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Lock,
  Unlock,
  Zap,
  GitBranch,
  X,
  Play,
  Bug,
  CheckCircle2,
  Code2,
  Lightbulb,
} from "lucide-react";

const BRANCH_NAMES: Record<string, string> = {
  python_mastery: "Python Mastery",
  frontend_mastery: "Frontend Mastery",
  algorithms: "Algorithms Path",
  debugging: "Debugging Path",
};

const NODE_EXAMPLES: Record<string, { code: string; debug: string }> = {
  variables: {
    code: '# Variables\nname = "Alice"\nage = 25\nprint(f"{name} is {age} years old")\n\n# Types\nprint(type(name))\nprint(type(age))',
    debug:
      '# Fix the bugs\nname = "Alice\nage = "twenty five"\nprint(name + " is " + age " years old")',
  },
  loops: {
    code: '# For loop\nfruits = ["apple", "banana", "cherry"]\nfor fruit in fruits:\n    print(fruit)\n\n# While loop\ncount = 0\nwhile count < 3:\n    print(count)\n    count += 1',
    debug:
      "# Fix the infinite loop\ncount = 0\nwhile count < 5:\n    print(count)\n    # missing increment!",
  },
  functions: {
    code: '# Function example\ndef greet(name):\n    return f"Hello, {name}!"\n\ndef add(a, b):\n    return a + b\n\nprint(greet("EduVerse"))\nprint(add(10, 20))',
    debug: "# Fix the function\nfunction double(x):\n    return x * 2\n\nprint(double(5))",
  },
  lists: {
    code: "# Lists\nnumbers = [3, 1, 4, 1, 5, 9]\nnumbers.append(2)\nnumbers.sort()\nprint(numbers)\n\n# List comprehension\nsquares = [x**2 for x in range(5)]\nprint(squares)",
    debug:
      "# Fix the list code\nnums = [1, 2, 3, 4, 5]\nprint(nums[5])  # index error!\n\n# Add 6 to the end\nums.append(6)",
  },
  recursion: {
    code: "# Recursion\ndef factorial(n):\n    if n <= 1:\n        return 1\n    return n * factorial(n - 1)\n\ndef fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n-1) + fibonacci(n-2)\n\nprint(factorial(5))\nprint(fibonacci(10))",
    debug:
      "# Fix the recursion (missing base case!)\ndef sum_to_n(n):\n    return n + sum_to_n(n - 1)\n\nprint(sum_to_n(5))",
  },
  debugging: {
    code: '# Debug with print\nx = 10\ny = 0\nprint(f"x={x}, y={y}")\n\n# Watch variable changes\nresult = x / y if y != 0 else "error: division by zero"\nprint(result)',
    debug:
      "# Find all bugs\ndef average(nums):\n    total = sum(nums)\n    return total / len(nums)\n\n# Edge cases\nprint(average([10, 20, 30]))\nprint(average([]))  # division by zero!",
  },
};

function getExample(id: string) {
  const key = Object.keys(NODE_EXAMPLES).find((k) => id.includes(k));
  return key
    ? NODE_EXAMPLES[key]
    : {
        code: '# Write your code here\nprint("Hello, EduVerse!")',
        debug: '# Debug challenge\na = 5\nb = "10"\nprint(a + b)  # type error!',
      };
}

interface SkillNode extends MapNode {
  description: string;
  code?: string;
  debug?: string;
  effect?: { value: number; description: string };
}

function getStatus(
  node: MapNode,
  userLevel: number,
  userXp: number,
): "locked" | "available" | "completed" {
  if (node.unlocked) return "completed";
  if (userLevel >= node.levelRequired && userXp >= node.xpCost) return "available";
  return "locked";
}

export default function SkillTreePage() {
  const { user, updateXp } = useAuthStore();
  const router = useRouter();
  const [nodes, setNodes] = useState<SkillNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [unlocking, setUnlocking] = useState<string | null>(null);
  const [justUnlocked, setJustUnlocked] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<SkillNode | null>(null);
  const [tab, setTab] = useState<"example" | "debug">("example");
  const [showHint, setShowHint] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const [unlockedInfo, setUnlockedInfo] = useState<{ name: string; cost: number } | null>(null);

  const openInCodeLab = (code: string) => {
    try {
      localStorage.setItem("eduverse_codelab_code", code);
    } catch {}
    router.push("/codelab");
  };

  const loadTree = async () => {
    try {
      const res = await api.getSkillTree();
      setNodes(res.data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    loadTree();
  }, []);

  const handleUnlock = async (nodeId: string) => {
    setUnlocking(nodeId);
    const unlockedNode = nodes.find((n) => n.id === nodeId);
    try {
      await api.unlockSkill(nodeId);
      api.clearCache();
      await loadTree();
      setJustUnlocked(nodeId);
      setSelectedNode((prev) => (prev && prev.id === nodeId ? { ...prev, unlocked: true } : prev));
      if (unlockedNode) {
        setUnlockedInfo({ name: unlockedNode.name, cost: unlockedNode.xpCost });
        setCelebrate(true);
        setTimeout(() => setCelebrate(false), 1800);
      }
      setTimeout(() => {
        setJustUnlocked(null);
        setUnlockedInfo(null);
      }, 2600);
      if (user) {
        const profileRes = await api.getProfile();
        updateXp(profileRes.data.xp, profileRes.data.level);
      }
    } catch {}
    setUnlocking(null);
  };

  const handleSelect = useCallback((node: MapNode | null) => {
    setSelectedNode(node as SkillNode | null);
    setTab("example");
    setShowHint(false);
  }, []);

  const statusFor = useCallback(
    (node: MapNode) => getStatus(node, user?.level || 0, user?.xp || 0),
    [user?.level, user?.xp],
  );

  if (loading) {
    return (
      <div className="space-y-6" aria-label="Loading skill tree">
        <div className="sk-card" style={{ height: "40px", width: "200px" }} />
        <div className="sk-card" style={{ height: "20px", width: "350px" }} />
        <div className="sk-card" style={{ height: "60vh" }} />
      </div>
    );
  }

  const selectedStatus = selectedNode ? statusFor(selectedNode) : null;

  return (
    <motion.div
      className="flex gap-6"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      <Confetti active={celebrate} count={48} />
      <AnimatePresence>
        {unlockedInfo && (
          <motion.div
            initial={{ opacity: 0, y: -14, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, transition: { duration: 0.18, ease: "easeOut" } }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="xp-toast"
            role="status"
          >
            <Unlock className="w-6 h-6 text-eduverse-accent" aria-hidden="true" />
            <div>
              <div className="font-bold text-eduverse-accent">Unlocked {unlockedInfo.name}</div>
              <div className="text-xs text-eduverse-text-muted">−{unlockedInfo.cost} XP spent</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div
        className={`flex-1 min-w-0 space-y-6 transition-[max-width] duration-300 ${selectedNode ? "lg:max-w-[calc(100%-380px)]" : ""}`}
      >
        <motion.div variants={fadeUp} transition={fastEaseTransition}>
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <div className="section-label">
                <span className="section-label-prefix">//</span> Skills
              </div>
              <h1 className="text-3xl font-bold mb-2 font-display flex items-center gap-3 tracking-tight">
                <GitBranch className="w-7 h-7 text-eduverse-accent" aria-hidden="true" />
                Skill Map
              </h1>
              <p className="text-eduverse-text-muted">
                Chart your territory. Click a sigil to inspect it, drag to explore.
              </p>
            </div>
            {user && (
              <div className="flex items-center gap-2 text-sm font-mono text-eduverse-text-muted">
                <Zap className="w-4 h-4 text-eduverse-accent" aria-hidden="true" />
                <span className="text-eduverse-text">{user.xp.toLocaleString()}</span> XP to spend
              </div>
            )}
          </div>
        </motion.div>

        <motion.div variants={fadeUp} transition={{ ...fastEaseTransition, delay: 0.08 }}>
          <SkillMap
            nodes={nodes}
            getStatus={statusFor}
            selectedId={selectedNode?.id || null}
            justUnlocked={justUnlocked}
            onSelect={handleSelect}
          />
        </motion.div>
      </div>

      {/* Node detail panel */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40, transition: { duration: 0.18, ease: "easeOut" } }}
            transition={{ type: "spring", duration: 0.45, bounce: 0.15 }}
            className="fixed right-0 top-0 h-full w-[360px] max-w-[calc(100vw-2rem)] z-50 p-4 lg:static lg:h-auto lg:w-[360px] lg:max-w-none lg:z-auto lg:p-0"
          >
            <GlassCard className="h-full overflow-y-auto">
              {/* Header */}
              <div className="flex items-start justify-between mb-1">
                <h3 className="font-bold text-lg font-display">{selectedNode.name}</h3>
                <button
                  onClick={() => handleSelect(null)}
                  className="p-1 rounded hover:bg-white/10 transition-colors"
                  aria-label="Close panel"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="text-xs font-mono text-eduverse-text-muted mb-3">
                <span className="text-eduverse-accent">{"// "}</span>
                {BRANCH_NAMES[selectedNode.branch] || selectedNode.branch}
              </div>

              {/* Status */}
              <div
                className={`text-xs px-2 py-1 rounded inline-flex items-center gap-1 mb-4 font-mono ${
                  selectedStatus === "completed"
                    ? "bg-eduverse-success/15 text-eduverse-success"
                    : selectedStatus === "available"
                      ? "bg-eduverse-accent-soft text-eduverse-accent"
                      : "bg-white/5 text-eduverse-text-muted"
                }`}
              >
                {selectedStatus === "completed" ? (
                  <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
                ) : selectedStatus === "available" ? (
                  <Zap className="w-3 h-3" aria-hidden="true" />
                ) : (
                  <Lock className="w-3 h-3" aria-hidden="true" />
                )}
                {selectedStatus === "completed"
                  ? "Unlocked"
                  : selectedStatus === "available"
                    ? "Ready to unlock"
                    : "Locked"}
              </div>

              {/* Unlock action */}
              {selectedStatus === "available" && user && (
                <GradientButton
                  onClick={() => handleUnlock(selectedNode.id)}
                  loading={unlocking === selectedNode.id}
                  className="w-full mb-4 text-sm py-2.5"
                >
                  <Unlock className="w-4 h-4" aria-hidden="true" /> Unlock for {selectedNode.xpCost}{" "}
                  XP
                </GradientButton>
              )}
              {selectedStatus === "locked" && (
                <div className="mb-4 text-xs text-eduverse-text-muted p-3 rounded border border-eduverse-border bg-white/[0.02] leading-relaxed">
                  Requires level {selectedNode.levelRequired} and{" "}
                  {selectedNode.xpCost.toLocaleString()} XP
                  {(selectedNode.prerequisites?.length ?? 0) > 0 && (
                    <> · complete the routes leading here first</>
                  )}
                </div>
              )}

              {/* Description */}
              <div className="mb-4">
                <div className="text-xs uppercase tracking-wider text-eduverse-text-muted mb-1 font-mono">
                  Description
                </div>
                <p className="text-sm leading-relaxed">{selectedNode.description}</p>
              </div>

              {/* Effect */}
              {selectedNode.effect && (
                <div className="mb-4 p-3 rounded bg-eduverse-accent-soft border border-eduverse-border">
                  <div className="text-xs uppercase tracking-wider text-eduverse-text-muted mb-1 font-mono">
                    Effect
                  </div>
                  <div className="text-sm font-semibold text-eduverse-accent">
                    +{selectedNode.effect.value}% {selectedNode.effect.description}
                  </div>
                </div>
              )}

              {/* Details */}
              <div className="mb-4 space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-eduverse-text-muted">XP Cost</span>
                  <span>{selectedNode.xpCost} XP</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-eduverse-text-muted">Level Required</span>
                  <span>{selectedNode.levelRequired}</span>
                </div>
                {(selectedNode.prerequisites?.length ?? 0) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-eduverse-text-muted">Prerequisites</span>
                    <span>{(selectedNode.prerequisites ?? []).length} node(s)</span>
                  </div>
                )}
              </div>

              {/* Code Example Tabs */}
              <div className="mb-3">
                <div className="flex border-b border-white/10">
                  <button
                    onClick={() => setTab("example")}
                    className={`flex items-center gap-1.5 px-3 py-2 text-xs border-b-2 transition-colors ${
                      tab === "example"
                        ? "border-eduverse-accent text-eduverse-accent"
                        : "border-transparent text-eduverse-text-muted hover:text-eduverse-text"
                    }`}
                  >
                    <Play className="w-3 h-3" aria-hidden="true" /> Try It
                  </button>
                  <button
                    onClick={() => setTab("debug")}
                    className={`flex items-center gap-1.5 px-3 py-2 text-xs border-b-2 transition-colors ${
                      tab === "debug"
                        ? "border-eduverse-accent text-eduverse-accent"
                        : "border-transparent text-eduverse-text-muted hover:text-eduverse-text"
                    }`}
                  >
                    <Bug className="w-3 h-3" aria-hidden="true" /> Debug Challenge
                  </button>
                </div>
              </div>

              {/* Code Block */}
              <div className="mb-4">
                <div className="bg-black/40 rounded overflow-hidden">
                  <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/5">
                    <span className="text-[10px] text-eduverse-text-muted uppercase tracking-wider font-mono">
                      Python
                    </span>
                    <button
                      className="text-[10px] text-eduverse-text-muted hover:text-eduverse-text transition-colors flex items-center gap-1 font-mono"
                      onClick={() => {
                        const code =
                          tab === "example"
                            ? getExample(selectedNode.id).code
                            : getExample(selectedNode.id).debug;
                        navigator.clipboard.writeText(code);
                      }}
                    >
                      <Code2 className="w-2.5 h-2.5" aria-hidden="true" /> Copy
                    </button>
                  </div>
                  <pre className="p-3 text-xs font-mono overflow-auto max-h-[200px] text-eduverse-text leading-relaxed">
                    {tab === "example"
                      ? getExample(selectedNode.id).code
                      : getExample(selectedNode.id).debug}
                  </pre>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <GradientButton
                  variant="ghost"
                  className="w-full text-xs py-2 flex items-center justify-center gap-1.5"
                  onClick={() => {
                    const code =
                      tab === "example"
                        ? getExample(selectedNode.id).code
                        : getExample(selectedNode.id).debug;
                    openInCodeLab(code);
                  }}
                >
                  <Play className="w-3 h-3" aria-hidden="true" />
                  {tab === "example" ? "Open in Code Lab" : "Debug in Code Lab"}
                </GradientButton>
                {tab === "debug" && (
                  <>
                    <button
                      onClick={() => setShowHint(!showHint)}
                      aria-expanded={showHint}
                      className="w-full text-xs py-2 rounded border border-eduverse-border-mid text-eduverse-text-muted hover:text-eduverse-text hover:bg-eduverse-accent-soft transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Lightbulb className="w-3 h-3" aria-hidden="true" />{" "}
                      {showHint ? "Hide Hint" : "Show Hint"}
                    </button>
                    {showHint && (
                      <div className="text-xs p-3 rounded bg-eduverse-accent-soft border border-eduverse-border text-eduverse-text-body leading-relaxed">
                        {getExample(selectedNode.id)
                          .debug.split("\n")
                          .filter((l) => l.trim().startsWith("#"))
                          .map((l) => l.replace(/^\s*#\s*/, ""))
                          .join(" · ") || "Read the error message carefully and check each line."}
                      </div>
                    )}
                  </>
                )}
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop for mobile */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => handleSelect(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

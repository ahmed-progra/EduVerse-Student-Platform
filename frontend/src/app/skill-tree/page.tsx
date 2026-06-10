"use client";

import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientButton } from "@/components/ui/gradient-button";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Lock, Unlock, Zap, GitBranch, X, Play, Bug,
  CheckCircle2, Code2, Lightbulb,
} from "lucide-react";

const BRANCH_COLORS: Record<string, string> = {
  python_mastery: "from-blue-500 to-purple-600",
  frontend_mastery: "from-green-500 to-teal-600",
  algorithms: "from-red-500 to-orange-600",
  debugging: "from-yellow-500 to-pink-600",
};

const BRANCH_NAMES: Record<string, string> = {
  python_mastery: "Python Mastery",
  frontend_mastery: "Frontend Mastery",
  algorithms: "Algorithms Path",
  debugging: "Debugging Path",
};

const NODE_EXAMPLES: Record<string, { code: string; debug: string }> = {
  variables: {
    code: "# Variables\nname = \"Alice\"\nage = 25\nprint(f\"{name} is {age} years old\")\n\n# Types\nprint(type(name))\nprint(type(age))",
    debug: "# Fix the bugs\nname = \"Alice\nage = \"twenty five\"\nprint(name + \" is \" + age \" years old\")",
  },
  loops: {
    code: "# For loop\nfruits = [\"apple\", \"banana\", \"cherry\"]\nfor fruit in fruits:\n    print(fruit)\n\n# While loop\ncount = 0\nwhile count < 3:\n    print(count)\n    count += 1",
    debug: "# Fix the infinite loop\ncount = 0\nwhile count < 5:\n    print(count)\n    # missing increment!",
  },
  functions: {
    code: "# Function example\ndef greet(name):\n    return f\"Hello, {name}!\"\n\ndef add(a, b):\n    return a + b\n\nprint(greet(\"EduVerse\"))\nprint(add(10, 20))",
    debug: "# Fix the function\nfunction double(x):\n    return x * 2\n\nprint(double(5))",
  },
  lists: {
    code: "# Lists\nnumbers = [3, 1, 4, 1, 5, 9]\nnumbers.append(2)\nnumbers.sort()\nprint(numbers)\n\n# List comprehension\nsquares = [x**2 for x in range(5)]\nprint(squares)",
    debug: "# Fix the list code\nnums = [1, 2, 3, 4, 5]\nprint(nums[5])  # index error!\n\n# Add 6 to the end\nums.append(6)",
  },
  recursion: {
    code: "# Recursion\ndef factorial(n):\n    if n <= 1:\n        return 1\n    return n * factorial(n - 1)\n\ndef fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n-1) + fibonacci(n-2)\n\nprint(factorial(5))\nprint(fibonacci(10))",
    debug: "# Fix the recursion (missing base case!)\ndef sum_to_n(n):\n    return n + sum_to_n(n - 1)\n\nprint(sum_to_n(5))",
  },
  debugging: {
    code: "# Debug with print\nx = 10\ny = 0\nprint(f\"x={x}, y={y}\")\n\n# Watch variable changes\nresult = x / y if y != 0 else \"error: division by zero\"\nprint(result)",
    debug: "# Find all bugs\ndef average(nums):\n    total = sum(nums)\n    return total / len(nums)\n\n# Edge cases\nprint(average([10, 20, 30]))\nprint(average([]))  # division by zero!",
  },
};

function getExample(id: string) {
  const key = Object.keys(NODE_EXAMPLES).find((k) => id.includes(k));
  return key ? NODE_EXAMPLES[key] : {
    code: "# Write your code here\nprint(\"Hello, EduVerse!\")",
    debug: "# Debug challenge\na = 5\nb = \"10\"\nprint(a + b)  # type error!",
  };
}

interface SkillNode {
  id: string;
  name: string;
  description: string;
  xpCost: number;
  levelRequired: number;
  branch: string;
  position: { x: number; y: number };
  unlocked: boolean;
  code?: string;
  debug?: string;
  effect?: { value: number; description: string };
  prerequisites?: string[];
}

function getStatus(node: SkillNode, userLevel: number, userXp: number): "locked" | "available" | "completed" | "active" {
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

  const openInCodeLab = (code: string) => {
    try { localStorage.setItem("eduverse_codelab_code", code); } catch {}
    router.push("/codelab");
  };

  const loadTree = async () => {
    try {
      const res = await api.getSkillTree();
      setNodes(res.data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { loadTree(); }, []);

  const handleUnlock = async (nodeId: string) => {
    setUnlocking(nodeId);
    try {
      await api.unlockSkill(nodeId);
      await loadTree();
      setJustUnlocked(nodeId);
      setTimeout(() => setJustUnlocked(null), 1300);
      if (user) {
        const profileRes = await api.getProfile();
        updateXp(profileRes.data.xp, profileRes.data.level);
      }
    } catch {}
    setUnlocking(null);
  };

  const handleNodeClick = useCallback((node: SkillNode) => {
    setSelectedNode(node);
    setTab("example");
    setShowHint(false);
  }, []);

  const branches = [...new Set(nodes.map((n) => n.branch))];

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse" aria-hidden="true">
        <div className="h-8 w-56 rounded-lg bg-eduverse-surface" />
        {[1, 2, 3].map((i) => <div key={i} className="h-56 rounded-2xl bg-eduverse-surface" />)}
      </div>
    );
  }

  return (
    <div className="flex gap-6">
      {/* Main Tree */}
      <div className={`flex-1 space-y-8 transition-all duration-300 ${selectedNode ? "max-w-[calc(100%-380px)]" : ""}`}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                <GitBranch className="w-8 h-8 text-eduverse-accent" aria-hidden="true" />
                Skill Tree
              </h1>
              <p className="text-eduverse-text-muted">Unlock skills to boost your XP gain and battle performance.</p>
            </div>
            {/* Map legend (moved here from the global sidebar) */}
            <div className="app-card px-4 py-3 text-[11px] space-y-1.5" style={{ color: "var(--color-eduverse-text-muted)" }}>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-eduverse-success inline-block" />
                <span>Unlocked</span>
                <span className="w-1.5 h-1.5 rounded-full bg-eduverse-warning inline-block ml-3" />
                <span>Ready to unlock</span>
                <span className="w-1.5 h-1.5 rounded-full bg-eduverse-text-muted inline-block ml-3" />
                <span>Locked</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-0.5 border-t border-eduverse-accent border-dashed" />
                <span>Prerequisite paths</span>
              </div>
            </div>
          </div>
        </motion.div>

        {branches.map((branch, bi) => (
          <motion.div
            key={branch}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: bi * 0.1 }}
          >
            <GlassCard>
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full bg-gradient-to-br ${BRANCH_COLORS[branch] || "from-gray-500 to-gray-600"}`} />
                {BRANCH_NAMES[branch] || branch}
              </h2>
              <div className="overflow-x-auto pb-4 -mx-2 px-2 md:mx-0 md:px-0 scrollbar-thin">
                <div className="relative min-w-[960px] h-[210px]" style={{ zIndex: 10 }}>
                  
                  {/* SVG Connection Lines */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ minWidth: "960px", zIndex: 1 }}>
                    <defs>
                      <marker
                        id={`arrow-unlocked-${branch}`}
                        viewBox="0 0 10 10"
                        refX="6"
                        refY="5"
                        markerWidth="6"
                        markerHeight="6"
                        orient="auto-start-reverse"
                      >
                        <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#a78bfa" />
                      </marker>
                      <marker
                        id={`arrow-locked-${branch}`}
                        viewBox="0 0 10 10"
                        refX="6"
                        refY="5"
                        markerWidth="6"
                        markerHeight="6"
                        orient="auto-start-reverse"
                      >
                        <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="rgba(255, 255, 255, 0.2)" />
                      </marker>
                    </defs>
                    {nodes
                      .filter((n) => n.branch === branch)
                      .map((node) => {
                        return (node.prerequisites || []).map((prereqId) => {
                          const prereq = nodes.find((n) => n.id === prereqId);
                          if (!prereq) return null;
                          const x1 = 40 + (prereq.position.x - 1) * 320 + 240;
                          const y1 = 30 + 55;
                          const x2 = 40 + (node.position.x - 1) * 320;
                          const y2 = 30 + 55;
                          const pathActive = prereq.unlocked;

                          return (
                            <path
                              key={`${prereq.id}-${node.id}`}
                              d={`M ${x1} ${y1} C ${x1 + 40} ${y1}, ${x2 - 40} ${y2}, ${x2} ${y2}`}
                              fill="none"
                              stroke={pathActive ? "var(--color-eduverse-accent-light)" : "rgba(255, 255, 255, 0.1)"}
                              strokeWidth={pathActive ? 2 : 1.5}
                              strokeDasharray={pathActive ? undefined : "4,4"}
                              markerEnd={`url(#arrow-${pathActive ? "unlocked" : "locked"}-${branch})`}
                              style={pathActive ? { filter: "drop-shadow(0 0 4px var(--color-eduverse-accent-light))" } : undefined}
                            />
                          );
                        });
                      })}
                  </svg>

                  {/* Nodes list positioned absolutely */}
                  {nodes
                    .filter((n) => n.branch === branch)
                    .sort((a, b) => a.position.x - b.position.x)
                    .map((node, i) => {
                      const status = getStatus(node, user?.level || 0, user?.xp || 0);
                      const posX = 40 + (node.position.x - 1) * 320;
                      const posY = 30;

                      return (
                        <motion.div
                          key={node.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.05 }}
                          onClick={() => handleNodeClick(node)}
                          className={`absolute p-4 rounded-xl border transition-all cursor-pointer ${
                            status === "completed"
                              ? "bg-eduverse-accent/20 border-eduverse-accent/40 shadow-[0_0_10px_rgba(108,92,231,0.3)]"
                              : status === "available"
                              ? "bg-eduverse-warning/10 border-eduverse-warning/30"
                              : "bg-white/5 border-white/10 opacity-60"
                          } ${selectedNode?.id === node.id ? "ring-2 ring-eduverse-accent-light" : ""} ${justUnlocked === node.id ? "unlock-pop" : ""}`}
                          style={{
                            left: `${posX}px`,
                            top: `${posY}px`,
                            width: "240px",
                            zIndex: 10,
                          }}
                        >
                          {/* Status indicator */}
                          <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center ${
                            status === "completed"
                              ? "bg-eduverse-success"
                              : status === "available"
                              ? "bg-eduverse-warning"
                              : "bg-eduverse-text-muted"
                          }`}>
                            {status === "completed" ? <CheckCircle2 className="w-3 h-3 text-white" /> :
                             status === "available" ? <Zap className="w-3 h-3 text-white" /> :
                             <Lock className="w-3 h-3 text-white" />}
                          </div>

                          <h3 className="font-bold text-sm mb-1">{node.name}</h3>
                          <p className="text-xs text-eduverse-text-muted mb-3 line-clamp-2">{node.description}</p>
                          <div className="text-xs text-eduverse-text-muted space-y-1">
                            <div className="flex items-center gap-1">
                              <Zap className="w-3 h-3" /> Cost: {node.xpCost} XP
                            </div>
                            <div>Level Required: {node.levelRequired}</div>
                            {node.effect && (
                              <div className="text-eduverse-accent-light text-[10px]">
                                +{node.effect.value}% {node.effect.description}
                              </div>
                            )}
                          </div>

                          {status === "available" && user && (
                            <div onClick={(e) => e.stopPropagation()}>
                              <GradientButton
                                onClick={() => handleUnlock(node.id)}
                                disabled={user.level < node.levelRequired || user.xp < node.xpCost}
                                loading={unlocking === node.id}
                                className="w-full mt-3 text-xs py-2"
                              >
                                <Unlock className="w-3 h-3" /> Unlock
                              </GradientButton>
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Node Detail Panel */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 h-full w-[360px] z-50 p-4 lg:static lg:h-auto lg:w-[360px] lg:z-auto"
          >
            <GlassCard className="h-full overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full bg-gradient-to-br ${BRANCH_COLORS[selectedNode.branch] || "from-gray-500 to-gray-600"}`} />
                  <h3 className="font-bold">{selectedNode.name}</h3>
                </div>
                <button onClick={() => setSelectedNode(null)} className="p-1 rounded-lg hover:bg-white/10 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Status */}
              <div className={`text-xs px-2 py-1 rounded-full inline-flex items-center gap-1 mb-3 ${
                selectedNode.unlocked
                  ? "bg-eduverse-success/20 text-eduverse-success"
                  : "bg-eduverse-warning/20 text-eduverse-warning"
              }`}>
                {selectedNode.unlocked ? <CheckCircle2 className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                {selectedNode.unlocked ? "Completed" : "Not yet unlocked"}
              </div>

              {/* Description */}
              <div className="mb-4">
                <div className="text-xs uppercase tracking-wider text-eduverse-text-muted mb-1">Description</div>
                <p className="text-sm">{selectedNode.description}</p>
              </div>

              {/* Effect */}
              {selectedNode.effect && (
                <div className="mb-4 p-3 rounded-lg bg-eduverse-accent/10 border border-eduverse-accent/20">
                  <div className="text-xs uppercase tracking-wider text-eduverse-text-muted mb-1">Effect</div>
                  <div className="text-sm font-semibold text-eduverse-accent-light">
                    +{selectedNode.effect.value}% {selectedNode.effect.description}
                  </div>
                </div>
              )}

              {/* Details */}
              <div className="mb-4 space-y-2 text-xs">
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
                        ? "border-eduverse-accent-light text-eduverse-accent-light"
                        : "border-transparent text-eduverse-text-muted hover:text-white"
                    }`}
                  >
                    <Play className="w-3 h-3" /> Try It
                  </button>
                  <button
                    onClick={() => setTab("debug")}
                    className={`flex items-center gap-1.5 px-3 py-2 text-xs border-b-2 transition-colors ${
                      tab === "debug"
                        ? "border-eduverse-accent-light text-eduverse-accent-light"
                        : "border-transparent text-eduverse-text-muted hover:text-white"
                    }`}
                  >
                    <Bug className="w-3 h-3" /> Debug Challenge
                  </button>
                </div>
              </div>

              {/* Code Block */}
              <div className="mb-4">
                <div className="bg-black/40 rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/5">
                    <span className="text-[10px] text-eduverse-text-muted uppercase tracking-wider">Python</span>
                    <button
                      className="text-[10px] text-eduverse-text-muted hover:text-white transition-colors flex items-center gap-1"
                      onClick={() => {
                        const code = tab === "example"
                          ? getExample(selectedNode.id).code
                          : getExample(selectedNode.id).debug;
                        navigator.clipboard.writeText(code);
                      }}
                    >
                      <Code2 className="w-2.5 h-2.5" /> Copy
                    </button>
                  </div>
                  <pre className="p-3 text-xs font-mono overflow-auto max-h-[220px] text-eduverse-text leading-relaxed">
                    {tab === "example"
                      ? getExample(selectedNode.id).code
                      : getExample(selectedNode.id).debug}
                  </pre>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <GradientButton
                  className="w-full text-xs py-2 flex items-center justify-center gap-1.5"
                  onClick={() => {
                    const code = tab === "example"
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
                      className="w-full text-xs py-2 rounded-xl border border-eduverse-border-mid text-eduverse-text-muted hover:text-eduverse-text hover:bg-eduverse-accent-soft transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Lightbulb className="w-3 h-3" aria-hidden="true" /> {showHint ? "Hide Hint" : "Show Hint"}
                    </button>
                    {showHint && (
                      <div className="text-xs p-3 rounded-lg bg-eduverse-accent-soft border border-eduverse-border text-eduverse-text-body leading-relaxed">
                        {getExample(selectedNode.id).debug
                          .split("\n")
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
            onClick={() => setSelectedNode(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

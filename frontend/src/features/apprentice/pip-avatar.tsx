"use client";

import { motion } from "framer-motion";

interface PipAvatarProps {
  understanding: number; // 0-100
  thinking?: boolean;
  size?: "sm" | "lg";
}

function mood(u: number): { emoji: string; label: string } {
  if (u >= 85) return { emoji: "🤩", label: "It clicked!" };
  if (u >= 60) return { emoji: "🙂", label: "Getting it" };
  if (u >= 30) return { emoji: "🤔", label: "Curious" };
  return { emoji: "😕", label: "Confused" };
}

/** Pip the apprentice: an avatar whose mood + understanding meter react live. */
export function PipAvatar({ understanding, thinking, size = "lg" }: PipAvatarProps) {
  const m = mood(understanding);
  const big = size === "lg";
  return (
    <div className="flex items-center gap-3">
      <motion.div
        key={m.emoji}
        initial={{ scale: 0.85 }}
        animate={{ scale: thinking ? [1, 1.06, 1] : 1 }}
        transition={thinking ? { repeat: Infinity, duration: 1.1 } : { type: "spring", stiffness: 300, damping: 16 }}
        className={`flex items-center justify-center rounded-full shrink-0 ${big ? "w-12 h-12 text-2xl" : "w-9 h-9 text-lg"}`}
        style={{ background: "var(--color-eduverse-accent-soft)", border: "1px solid var(--color-eduverse-accent-soft)" }}
        aria-hidden="true"
      >
        {m.emoji}
      </motion.div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className={`font-semibold text-eduverse-text ${big ? "text-sm" : "text-xs"}`}>
            Pip <span className="text-eduverse-text-muted font-normal">· {thinking ? "thinking…" : m.label}</span>
          </span>
          <span className="text-xs font-mono text-eduverse-accent">{understanding}%</span>
        </div>
        <div className="mt-1 h-1.5 rounded-full overflow-hidden bg-eduverse-raised" role="progressbar" aria-valuenow={understanding} aria-valuemin={0} aria-valuemax={100} aria-label="Pip's understanding">
          <motion.div
            className="h-full rounded-full"
            style={{ background: "var(--color-eduverse-accent)" }}
            initial={false}
            animate={{ width: `${understanding}%` }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </div>
    </div>
  );
}

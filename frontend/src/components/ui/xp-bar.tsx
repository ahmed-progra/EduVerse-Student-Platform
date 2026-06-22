"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { xpProgress } from "@/lib/utils";
import { Zap, Star } from "lucide-react";

interface XpBarProps {
  xp: number;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

export const XpBar = memo(function XpBar({ xp, showLabel = true, size = "md" }: XpBarProps) {
  const { level, current, next, progress } = xpProgress(xp);
  const heights = { sm: "h-1.5", md: "h-2.5", lg: "h-4" };

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-1.5 text-xs font-mono text-eduverse-accent">
            <Star className="w-3 h-3" aria-hidden="true" />
            Level {level}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-eduverse-text-muted font-mono">
            <Zap className="w-3 h-3 text-eduverse-accent" aria-hidden="true" />
            <span className="text-eduverse-text-body font-semibold">
              {current.toLocaleString()}
            </span>
            <span className="text-eduverse-text-muted">/ {next.toLocaleString()} XP</span>
          </div>
        </div>
      )}

      <div
        className={`${heights[size]} w-full overflow-hidden`}
        style={{
          background: "var(--color-eduverse-surface)",
          borderRadius: "var(--radius-pill)",
          border: "1px solid var(--color-eduverse-border)",
        }}
        role="progressbar"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Level ${level} progress`}
      >
        <motion.div
          className="h-full relative overflow-hidden"
          style={{
            borderRadius: "var(--radius-pill)",
            background:
              "linear-gradient(90deg, var(--color-eduverse-accent-strong), var(--color-eduverse-accent))",
          }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, oklch(100% 0 0 / 0.15) 50%, transparent 100%)",
              animation: "sk-shimmer 2s infinite linear",
            }}
          />
        </motion.div>
      </div>

      {size === "lg" && (
        <div className="mt-2 text-right text-[11px] text-eduverse-text-muted font-mono">
          {Math.round(progress)}% to Level {level + 1}
        </div>
      )}
    </div>
  );
});

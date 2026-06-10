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
          <div
            className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-eduverse-accent-soft border border-eduverse-border-mid text-eduverse-accent"
          >
            <Star className="w-3 h-3" aria-hidden="true" />
            Level {level}
          </div>
          <div className="flex items-center gap-1 text-xs text-eduverse-text-muted">
            <Zap className="w-3 h-3 text-eduverse-warning" aria-hidden="true" />
            <span className="font-semibold text-eduverse-text-body" style={{ fontVariantNumeric: "tabular-nums" }}>{current.toLocaleString()}</span>
            <span>/ {next.toLocaleString()} XP</span>
          </div>
        </div>
      )}

      <div
        className={`${heights[size]} rounded-full w-full overflow-hidden bg-eduverse-accent-soft`}
        role="progressbar"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Level ${level} progress`}
      >
        <motion.div
          className="h-full rounded-full relative"
          style={{
            background: "linear-gradient(90deg, oklch(58% 0.21 293), oklch(70% 0.16 295))",
            boxShadow: "0 0 12px oklch(58% 0.21 293 / 0.5)",
          }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        >
          {size === "lg" && (
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 50%, transparent 100%)",
              }}
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 6, ease: "easeInOut" }}
            />
          )}
        </motion.div>
      </div>

      {size === "lg" && (
        <div className="mt-1.5 text-right text-[10px] text-eduverse-text-muted font-medium">
          {Math.round(progress)}% to Level {level + 1}
        </div>
      )}
    </div>
  );
});

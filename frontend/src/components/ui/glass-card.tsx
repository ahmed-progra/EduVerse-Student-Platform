"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { classNames } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export const GlassCard = memo(function GlassCard({
  children,
  className,
  style,
  onClick,
}: GlassCardProps) {
  return (
    <motion.div
      whileTap={onClick ? { scale: 0.985 } : undefined}
      className={classNames(
        "app-card p-5 md:p-6",
        onClick && "cursor-pointer app-card-link",
        className,
      )}
      style={style}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e: React.KeyboardEvent) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      {children}
    </motion.div>
  );
});

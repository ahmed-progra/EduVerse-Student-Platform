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

/* Flat container per Code Sorcery design system.
   Name kept to avoid touching every import. */
export const GlassCard = memo(function GlassCard({ children, className, style, onClick }: GlassCardProps) {
  return (
    <motion.div
      className={classNames(
        "app-card p-6",
        onClick && "cursor-pointer",
        className
      )}
      style={style}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
});

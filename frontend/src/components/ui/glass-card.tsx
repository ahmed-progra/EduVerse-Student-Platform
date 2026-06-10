"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { classNames } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  onClick?: () => void;
}

/* Historically a glassmorphism card; now a solid raised surface
   per the design system. Name kept to avoid touching every import. */
export const GlassCard = memo(function GlassCard({ children, className, hover = true, glow = false, onClick }: GlassCardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -2, transition: { duration: 0.18 } } : undefined}
      className={classNames(
        "app-card p-6",
        hover && "app-card-hover",
        glow && "app-card-glow",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
});

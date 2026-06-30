"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { classNames } from "@/lib/utils";

interface GradientButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  disabled?: boolean;
  loading?: boolean;
  type?: "button" | "submit";
}

export const GradientButton = memo(function GradientButton({
  children,
  onClick,
  className,
  variant = "primary",
  disabled = false,
  loading = false,
  type = "button",
}: GradientButtonProps) {
  const variants = {
    primary: "eb-btn-primary text-white hover:brightness-110",
    secondary:
      "bg-eduverse-accent-soft text-eduverse-accent border border-eduverse-border-mid hover:bg-eduverse-accent-soft/70",
    danger: "bg-eduverse-danger text-white hover:brightness-110",
    ghost:
      "bg-transparent text-eduverse-text-body border border-eduverse-border-mid hover:bg-eduverse-surface hover:text-eduverse-text",
  };

  return (
    <motion.button
      whileTap={disabled || loading ? undefined : { scale: 0.97 }}
      whileHover={disabled || loading ? undefined : { y: -1 }}
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={classNames(
        "inline-flex items-center justify-center gap-2 px-6 py-3 font-semibold text-sm",
        "transition-all duration-200",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "shadow-sm hover:shadow-md",
        "rounded-[var(--radius-button)]",
        variants[variant],
        className,
      )}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          Loading...
        </span>
      ) : (
        children
      )}
    </motion.button>
  );
});

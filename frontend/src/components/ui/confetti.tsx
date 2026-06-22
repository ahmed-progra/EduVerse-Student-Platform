"use client";

import { useMemo } from "react";

/**
 * Shared celebration confetti. Pure CSS animation (.confetti-* in globals.css),
 * tokenized to the "Aurora in the Void" palette. Decorative only (aria-hidden);
 * the global prefers-reduced-motion rule freezes the fall for motion-sensitive users.
 *
 * Usage: gate on a transient flag and clear it after ~1.6s (or ~2.6s for a level-up).
 *   const [burst, setBurst] = useState(false);
 *   setBurst(true); setTimeout(() => setBurst(false), 1600);
 *   <Confetti active={burst} />
 */

const CONFETTI_COLORS = [
  "var(--color-eduverse-accent)",
  "var(--color-eduverse-accent-light)",
  "var(--color-eduverse-success)",
  "var(--color-eduverse-gold)",
  "var(--color-eduverse-star)",
];

export function Confetti({ active, count = 28 }: { active: boolean; count?: number }) {
  // Regenerate only when a burst (re)starts — parent re-renders (e.g. a battle
  // timer ticking) must not re-roll particles mid-fall.
  const particles = useMemo(
    () =>
      active
        ? Array.from({ length: count }, (_, i) => ({
            id: i,
            left: Math.random() * 100,
            color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
            delay: Math.random() * 0.3,
            size: Math.random() * 4 + 3,
          }))
        : [],
    [active, count]
  );
  if (!active) return null;
  return (
    <div className="confetti-container" aria-hidden="true">
      {particles.map((p) => (
        <div
          key={p.id}
          className="confetti-particle"
          style={{
            left: `${p.left}%`,
            top: "-10px",
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: p.color,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

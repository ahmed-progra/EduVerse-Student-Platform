"use client";

import { useEffect, useRef, useState } from "react";

/* Counts from 0 to value when scrolled into view. Renders the final
   value immediately under prefers-reduced-motion. */
export function AnimatedNumber({
  value,
  delay = 0,
  suffix = "",
}: {
  value: number;
  delay?: number;
  suffix?: string;
}) {
  const [displayed, setDisplayed] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    started.current = false;
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplayed(value);
      return;
    }

    setDisplayed(0);
    let raf = 0;
    let timeout: ReturnType<typeof setTimeout>;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started.current) return;
        started.current = true;
        const duration = 1100;
        timeout = setTimeout(() => {
          const start = performance.now();
          const tick = (now: number) => {
            const t = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - t, 4);
            setDisplayed(Math.round(value * eased));
            if (t < 1) raf = requestAnimationFrame(tick);
          };
          raf = requestAnimationFrame(tick);
        }, delay);
      },
      { threshold: 0.3 },
    );
    obs.observe(el);
    return () => {
      obs.disconnect();
      cancelAnimationFrame(raf);
      clearTimeout(timeout);
    };
  }, [value, delay]);

  return (
    <span ref={ref} style={{ fontVariantNumeric: "tabular-nums" }}>
      {displayed.toLocaleString()}
      {suffix}
    </span>
  );
}

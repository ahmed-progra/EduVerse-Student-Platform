"use client";

import { MotionConfig } from "framer-motion";
import { AppLayout } from "@/components/layout/app-layout";

export function Providers({ children }: { children: React.ReactNode }) {
  // `reducedMotion="user"` makes every Framer Motion animation honor the OS
  // "reduce motion" setting (transform/opacity animations are skipped), to match
  // the CSS `prefers-reduced-motion` guards already in globals.css.
  return (
    <MotionConfig reducedMotion="user">
      <AppLayout>{children}</AppLayout>
    </MotionConfig>
  );
}

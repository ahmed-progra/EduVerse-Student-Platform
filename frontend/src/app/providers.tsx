"use client";

import { MotionConfig } from "framer-motion";
import { AppLayout } from "@/components/layout/app-layout";
import { BackendStatus } from "@/components/ui/backend-status";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <BackendStatus />
      <AppLayout>{children}</AppLayout>
    </MotionConfig>
  );
}

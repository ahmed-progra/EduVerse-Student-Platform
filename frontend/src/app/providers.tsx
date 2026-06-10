"use client";

import { AppLayout } from "@/components/layout/app-layout";

export function Providers({ children }: { children: React.ReactNode }) {
  return <AppLayout>{children}</AppLayout>;
}

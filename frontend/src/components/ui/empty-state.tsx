"use client";

import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  message,
  children,
}: {
  icon: LucideIcon;
  title: string;
  message: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon-container">
        <span className="empty-state-halo" aria-hidden="true" />
        <span className="empty-state-orbit" aria-hidden="true" />
        <Icon size={24} aria-hidden="true" />
      </div>
      <h3>{title}</h3>
      <p>{message}</p>
      {children && <div className="mt-5 flex justify-center gap-2">{children}</div>}
    </div>
  );
}

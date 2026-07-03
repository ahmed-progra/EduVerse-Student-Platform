"use client";

import type { LucideIcon } from "lucide-react";
import { ArrowLeft } from "lucide-react";

export function AIPanelShell({
  title,
  subtitle,
  icon: Icon,
  onClose,
  children,
}: {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="ai-panel">
      <div className="ai-panel-header">
        <button
          className="ai-panel-back"
          onClick={onClose}
          title="Back to page"
          aria-label="Back to page"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="ai-panel-header-info">
          <h1 className="ai-panel-title">
            <Icon size={16} className="ai-panel-title-icon" aria-hidden="true" /> {title}
          </h1>
          <div className="ai-panel-subtitle">{subtitle}</div>
        </div>
      </div>
      <div className="ai-panel-body">{children}</div>
    </div>
  );
}

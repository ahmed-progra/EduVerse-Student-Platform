"use client";
import { ReactNode } from "react";

export function Tooltip({ text, children }: { text: string; children: ReactNode }) {
  return (
    <span className="tp-wrap">
      {children}
      <span className="tp-text">{text}</span>
    </span>
  );
}

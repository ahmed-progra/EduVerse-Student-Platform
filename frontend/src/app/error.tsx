"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 page-enter">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
        style={{ background: "oklch(66% 0.19 25 / 0.1)", border: "1px solid oklch(66% 0.19 25 / 0.3)", color: "var(--color-eduverse-danger)" }}
      >
        <AlertTriangle size={28} aria-hidden="true" />
      </div>
      <h2 className="text-2xl font-bold text-eduverse-text mb-2">Something went wrong</h2>
      <p className="text-eduverse-text-muted mb-6 max-w-md">An unexpected error occurred. Try refreshing the page.</p>
      <button
        onClick={reset}
        className="px-6 py-3 rounded bg-eduverse-accent-strong text-white font-semibold text-sm hover:brightness-110 transition-[filter]"
      >
        Try Again
      </button>
    </div>
  );
}

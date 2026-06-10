"use client";

import { useEffect } from "react";

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
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="text-6xl font-bold gradient-text mb-4">!</div>
      <h2 className="text-2xl font-bold text-eduverse-text mb-2">Something went wrong</h2>
      <p className="text-eduverse-text-muted mb-6 max-w-md">An unexpected error occurred. Try refreshing the page.</p>
      <button
        onClick={reset}
        className="px-6 py-3 rounded-xl bg-eduverse-accent text-white font-semibold text-sm hover:brightness-110 transition-all"
      >
        Try Again
      </button>
    </div>
  );
}
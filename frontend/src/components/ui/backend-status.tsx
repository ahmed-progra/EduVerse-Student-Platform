"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

const CHECK_INTERVAL = 30_000;
// Mirror the api-client fallback so the health check still targets the real API
// when NEXT_PUBLIC_API_URL is unset (otherwise the URL becomes "undefined/health"
// and every visitor sees a false "Backend is offline" banner).
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export function BackendStatus() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    let mounted = true;
    const check = async () => {
      try {
        const res = await fetch(`${API_BASE}/health`, {
          method: "GET",
          signal: AbortSignal.timeout(5_000),
        });
        if (mounted) setOffline(!res.ok);
      } catch {
        if (mounted) setOffline(true);
      }
    };
    check();
    const id = setInterval(check, CHECK_INTERVAL);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  // Fixed overlays (mobile top bar) offset themselves below the banner via
  // this body attribute — see `body[data-offline-banner]` rules in globals.css.
  useEffect(() => {
    if (offline) document.body.setAttribute("data-offline-banner", "true");
    else document.body.removeAttribute("data-offline-banner");
    return () => document.body.removeAttribute("data-offline-banner");
  }, [offline]);

  if (!offline) return null;

  return (
    <div className="fixed top-0 inset-x-0 z-[100] flex items-center justify-center gap-2 bg-eduverse-danger/10 border-b border-eduverse-danger/30 py-2 px-4 text-sm text-eduverse-danger backdrop-blur-sm">
      <WifiOff size={14} aria-hidden="true" />
      <span>Backend is offline — some features may not work</span>
    </div>
  );
}

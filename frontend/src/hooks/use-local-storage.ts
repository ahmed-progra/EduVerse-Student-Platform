"use client";
import { useState, useEffect } from "react";

/**
 * State synced to `localStorage`. Hydrates from the stored value after mount (SSR-safe — starts at
 * `defaultValue` on the server) and persists on every set. Read/write failures are ignored so a
 * blocked or full storage never crashes the component.
 */
export function useLocalStorage<T>(key: string, defaultValue: T): [T, (v: T) => void] {
  const [value, setValue] = useState<T>(defaultValue);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored !== null) setValue(JSON.parse(stored));
    } catch {}
  }, [key]);

  const set = (v: T) => {
    setValue(v);
    try {
      localStorage.setItem(key, JSON.stringify(v));
    } catch {}
  };

  return [value, set];
}

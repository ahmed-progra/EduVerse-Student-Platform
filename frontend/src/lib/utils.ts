/** Level derived from total XP via an inverse-square curve (level 1 at 0 XP). */
export function calculateLevel(xp: number): number {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

/** Total XP required to reach the start of the given level. */
export function xpForNextLevel(level: number): number {
  return level * level * 100;
}

/** Total XP required to reach the start of the level below the given one. */
export function xpForCurrentLevel(level: number): number {
  if (level <= 1) return 0;
  return (level - 1) * (level - 1) * 100;
}

/**
 * Break a raw XP total into display fields for the level bar: the current level, XP earned within
 * it, XP needed to span it, and a clamped 0–100 progress percentage.
 */
export function xpProgress(currentXp: number): {
  level: number;
  current: number;
  next: number;
  progress: number;
} {
  const level = calculateLevel(currentXp);
  const current = currentXp - xpForCurrentLevel(level);
  const next = xpForNextLevel(level) - xpForCurrentLevel(level);
  const progress = Math.min(100, Math.round((current / next) * 100));
  return { level, current, next, progress };
}

/** Format a duration in seconds as `m:ss` (e.g. `90` → `"1:30"`). */
export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** Join truthy class names into a single space-separated string (falsy values are dropped). */
export function classNames(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

/** Map an editor language label to its canonical id, defaulting to `python`. */
export function getLanguageId(language: string): string {
  const map: Record<string, string> = {
    python: "python",
    html: "html",
    css: "css",
    cpp: "cpp",
  };
  return map[language] || "python";
}

/** File extension for a source language, used when downloading editor code (defaults to `.txt`). */
export function fileExtForLanguage(language: string): string {
  const map: Record<string, string> = {
    python: "py",
    html: "html",
    css: "css",
    cpp: "cpp",
    javascript: "js",
  };
  return map[language.toLowerCase()] || "txt";
}

/**
 * Trigger a client-side download of `content` as a text file. No-op on the server. Creates a Blob,
 * clicks a transient anchor, and revokes the object URL afterwards.
 */
export function downloadTextFile(filename: string, content: string): void {
  if (typeof document === "undefined") return;
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

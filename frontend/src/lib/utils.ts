export function calculateLevel(xp: number): number {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

export function xpForNextLevel(level: number): number {
  return level * level * 100;
}

export function xpForCurrentLevel(level: number): number {
  if (level <= 1) return 0;
  return (level - 1) * (level - 1) * 100;
}

export function xpProgress(currentXp: number): { level: number; current: number; next: number; progress: number } {
  const level = calculateLevel(currentXp);
  const current = currentXp - xpForCurrentLevel(level);
  const next = xpForNextLevel(level) - xpForCurrentLevel(level);
  const progress = Math.min(100, Math.round((current / next) * 100));
  return { level, current, next, progress };
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function classNames(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function getLanguageId(language: string): string {
  const map: Record<string, string> = {
    python: "python",
    html: "html",
    css: "css",
    cpp: "cpp",
  };
  return map[language] || "python";
}

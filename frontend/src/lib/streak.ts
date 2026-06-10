/* Daily streak tracked in localStorage, shared by landing, dashboard, and profile. */

const KEY = "eduverse_streak";

export function getStreak(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return 0;
    const { count } = JSON.parse(raw);
    return count || 0;
  } catch {
    return 0;
  }
}

export function updateStreak(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(KEY);
    const today = new Date().toDateString();
    if (!raw) {
      localStorage.setItem(KEY, JSON.stringify({ count: 1, date: today }));
      return 1;
    }
    const { count, date } = JSON.parse(raw);
    if (date === today) return count;
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    const next = date === yesterday ? count + 1 : 1;
    localStorage.setItem(KEY, JSON.stringify({ count: next, date: today }));
    return next;
  } catch {
    return 0;
  }
}

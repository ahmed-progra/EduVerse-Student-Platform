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

/**
 * Real learning streak: consecutive days (ending today, or yesterday as grace)
 * on which the user actually earned XP. Derived from XP-log timestamps so it
 * reflects genuine activity instead of app-opens. Pass ISO strings / Dates.
 */
export function streakFromActivity(timestamps: (string | number | Date)[]): number {
  if (!timestamps || timestamps.length === 0) return 0;
  const days = new Set<string>();
  for (const t of timestamps) {
    const d = new Date(t);
    if (!Number.isNaN(d.getTime())) days.add(d.toDateString());
  }
  if (days.size === 0) return 0;

  const DAY = 86400000;
  let cursor = new Date();
  // Grace: a streak that ran through yesterday still counts today.
  if (!days.has(cursor.toDateString())) {
    cursor = new Date(cursor.getTime() - DAY);
    if (!days.has(cursor.toDateString())) return 0;
  }
  let count = 0;
  while (days.has(cursor.toDateString())) {
    count++;
    cursor = new Date(cursor.getTime() - DAY);
  }
  return count;
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

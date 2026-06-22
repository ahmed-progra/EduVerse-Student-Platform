"use client";

import { useEffect, useState } from "react";

export interface Announcement {
  id: string;
  title: string;
  body: string;
  tag: string;
  pinned: boolean;
  createdAt: number;
}

export const ANNOUNCEMENT_TAGS = ["General", "Update", "Exam", "Deadline", "Event"];

const KEY = "eduverse_announcements";

function load(): Announcement[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Announcement[]) : [];
  } catch {
    return [];
  }
}

function sortItems(list: Announcement[]) {
  return [...list].sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.createdAt - a.createdAt);
}

/** Client-only announcements board backed by localStorage. No backend changes. */
export function useAnnouncements() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setItems(sortItems(load()));
    setReady(true);
  }, []);

  const persist = (next: Announcement[]) => {
    const sorted = sortItems(next);
    setItems(sorted);
    try {
      localStorage.setItem(KEY, JSON.stringify(sorted));
    } catch {
      /* storage unavailable — keep in-memory */
    }
  };

  const add = (a: Pick<Announcement, "title" | "body" | "tag">) => {
    const id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : String(Math.random());
    persist([{ ...a, id, pinned: false, createdAt: Date.now() }, ...items]);
  };

  const remove = (id: string) => persist(items.filter((i) => i.id !== id));

  const togglePin = (id: string) =>
    persist(items.map((i) => (i.id === id ? { ...i, pinned: !i.pinned } : i)));

  return { items, ready, add, remove, togglePin };
}

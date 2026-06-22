"use client";

import { useEffect, useState } from "react";

export type ResourceKind = "note" | "link" | "pdf" | "video" | "doc";

export interface Resource {
  id: string;
  title: string;
  subject: string;
  kind: ResourceKind;
  url?: string;
  note?: string;
  createdAt: number;
}

export const RESOURCE_SUBJECTS = [
  "General",
  "Python",
  "HTML",
  "CSS",
  "C++",
  "Mathematics",
  "Physics",
  "Science",
];

const KEY = "eduverse_resources";

function load(): Resource[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Resource[]) : [];
  } catch {
    return [];
  }
}

/** Client-only resource library backed by localStorage. No backend changes. */
export function useResources() {
  const [items, setItems] = useState<Resource[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setItems(load());
    setReady(true);
  }, []);

  const persist = (next: Resource[]) => {
    setItems(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* storage full / unavailable — keep in-memory */
    }
  };

  const add = (r: Omit<Resource, "id" | "createdAt">) => {
    const id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : String(Math.random());
    persist([{ ...r, id, createdAt: Date.now() }, ...items]);
  };

  const remove = (id: string) => persist(items.filter((i) => i.id !== id));

  return { items, ready, add, remove };
}

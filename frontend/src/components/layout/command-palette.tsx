"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/** One entry in the command palette. `run` is fired on select (after close). */
export interface CommandItem {
  id: string;
  label: string;
  group: string;
  icon: LucideIcon;
  hint?: string;
  keywords?: string;
  run: () => void;
}

/**
 * A global ⌘K / Ctrl+K command menu — jump to any page, open any AI tool, or
 * run an account action, all from the keyboard. Token-driven glass styling;
 * arrow keys + Enter to choose, Esc (or click-away) to dismiss.
 */
export function CommandPalette({
  open,
  onClose,
  items,
}: {
  open: boolean;
  onClose: () => void;
  items: CommandItem[];
}) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (open) {
      restoreFocusRef.current = (document.activeElement as HTMLElement) ?? null;
      setQuery("");
      setActive(0);
      const t = setTimeout(() => inputRef.current?.focus(), 20);
      return () => clearTimeout(t);
    }
    // Return focus to whatever opened the palette when it closes.
    restoreFocusRef.current?.focus?.();
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) =>
      `${it.label} ${it.group} ${it.keywords ?? ""}`.toLowerCase().includes(q),
    );
  }, [query, items]);

  // Group while preserving insertion order, then flatten so the visible order
  // and the keyboard (active) order always match.
  const groups = useMemo(() => {
    const m = new Map<string, CommandItem[]>();
    for (const it of filtered) {
      if (!m.has(it.group)) m.set(it.group, []);
      m.get(it.group)!.push(it);
    }
    return Array.from(m.entries());
  }, [filtered]);
  const flat = useMemo(() => groups.flatMap(([, g]) => g), [groups]);

  useEffect(() => setActive(0), [query]);

  useEffect(() => {
    listRef.current?.querySelector(`[data-idx="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const choose = (it: CommandItem | undefined) => {
    if (!it) return;
    onClose();
    it.run();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(flat.length - 1, a + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      choose(flat[active]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    } else if (e.key === "Tab") {
      // Trap focus within the palette (WCAG 2.1.2).
      const panel = panelRef.current;
      if (!panel) return;
      const focusables = panel.querySelectorAll<HTMLElement>(
        'input, button, [href], [tabindex]:not([tabindex="-1"])'
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  if (!open) return null;

  return (
    <div className="cmdk-overlay" role="dialog" aria-modal="true" aria-label="Command menu" onMouseDown={onClose}>
      <div ref={panelRef} className="cmdk-panel" onMouseDown={(e) => e.stopPropagation()} onKeyDown={onKeyDown}>
        <div className="cmdk-input-row">
          <Search size={16} className="cmdk-input-icon" aria-hidden="true" />
          <input
            ref={inputRef}
            className="cmdk-input"
            placeholder="Search pages, tools, actions…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Command search"
            autoComplete="off"
            spellCheck={false}
          />
          <kbd className="cmdk-esc">Esc</kbd>
        </div>

        <div className="cmdk-list" ref={listRef} role="listbox" aria-label="Commands">
          {flat.length === 0 ? (
            <div className="cmdk-empty">No results for &ldquo;{query}&rdquo;</div>
          ) : (
            groups.map(([group, gitems]) => (
              <div key={group} className="cmdk-group">
                <div className="cmdk-group-label">{group}</div>
                {gitems.map((it) => {
                  const idx = flat.indexOf(it);
                  const Icon = it.icon;
                  return (
                    <button
                      key={it.id}
                      data-idx={idx}
                      role="option"
                      aria-selected={idx === active}
                      className={`cmdk-item ${idx === active ? "active" : ""}`}
                      onMouseMove={() => setActive(idx)}
                      onClick={() => choose(it)}
                    >
                      <span className="cmdk-item-icon">
                        <Icon size={16} aria-hidden="true" />
                      </span>
                      <span className="cmdk-item-label">{it.label}</span>
                      {it.hint && <span className="cmdk-item-hint">{it.hint}</span>}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

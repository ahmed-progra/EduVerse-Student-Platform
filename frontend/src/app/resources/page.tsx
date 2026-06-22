"use client";

import { useMemo, useState } from "react";
import {
  Library,
  Plus,
  Search,
  Trash2,
  ExternalLink,
  X,
  StickyNote,
  Link2,
  FileText,
  Video,
  FileCode,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  useResources,
  RESOURCE_SUBJECTS,
  type Resource,
  type ResourceKind,
} from "@/features/resources/use-resources";
import { EmptyState } from "@/components/ui/empty-state";

const KIND_ICON: Record<ResourceKind, LucideIcon> = {
  note: StickyNote,
  link: Link2,
  pdf: FileText,
  video: Video,
  doc: FileCode,
};

const KINDS: ResourceKind[] = ["note", "link", "pdf", "video", "doc"];

export default function ResourcesPage() {
  const { items, ready, add, remove } = useResources();
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState("All");
  const [adding, setAdding] = useState(false);

  const [form, setForm] = useState({
    title: "",
    subject: "General",
    kind: "note" as ResourceKind,
    url: "",
    note: "",
  });

  const filters = useMemo(() => ["All", ...RESOURCE_SUBJECTS], []);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((r) => {
      if (subject !== "All" && r.subject !== subject) return false;
      if (q && !`${r.title} ${r.subject} ${r.note ?? ""}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [items, query, subject]);

  const submit = () => {
    if (!form.title.trim()) return;
    add({
      title: form.title.trim(),
      subject: form.subject,
      kind: form.kind,
      url: form.url.trim() || undefined,
      note: form.note.trim() || undefined,
    });
    setForm({ title: "", subject: "General", kind: "note", url: "", note: "" });
    setAdding(false);
  };

  return (
    <div className="space-y-6 page-enter">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="lab-hero">
          <span className="lab-hero-icon">
            <Library size={24} aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-3xl font-bold font-display tracking-tight">
              Resources &amp; Library
            </h1>
            <p className="text-eduverse-text-muted mt-1">
              Every note, study guide, and material for every class — one place.
            </p>
          </div>
        </div>
        <button className="glow-pill" onClick={() => setAdding((a) => !a)}>
          {adding ? (
            <>
              <X size={16} aria-hidden="true" /> Cancel
            </>
          ) : (
            <>
              <Plus size={16} aria-hidden="true" /> Add resource
            </>
          )}
        </button>
      </div>

      {/* Add form */}
      {adding && (
        <div className="glass-panel res-form">
          <div className="res-form-row">
            <input
              className="app-input"
              placeholder="Title (e.g. Calculus I — week 3 notes)"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              autoFocus
            />
          </div>
          <div className="res-form-grid">
            <select
              className="app-input"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              aria-label="Subject"
            >
              {RESOURCE_SUBJECTS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <select
              className="app-input"
              value={form.kind}
              onChange={(e) => setForm({ ...form, kind: e.target.value as ResourceKind })}
              aria-label="Type"
            >
              {KINDS.map((k) => (
                <option key={k} value={k}>
                  {k.toUpperCase()}
                </option>
              ))}
            </select>
            <input
              className="app-input"
              placeholder="Link (optional)"
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
            />
          </div>
          <textarea
            className="app-input res-form-note"
            placeholder="Notes (optional)"
            value={form.note}
            rows={2}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
          />
          <button className="btn-primary self-start" onClick={submit} disabled={!form.title.trim()}>
            Save to library
          </button>
        </div>
      )}

      {/* Toolbar */}
      <div className="res-toolbar">
        <div className="sb-search res-search">
          <Search size={15} aria-hidden="true" />
          <input
            className="sb-search-input"
            placeholder="Search resources"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search resources"
          />
        </div>
        <div className="res-filters">
          {filters.map((f) => (
            <button
              key={f}
              className={`seg-btn ${subject === f ? "active" : ""}`}
              onClick={() => setSubject(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {!ready ? null : shown.length === 0 ? (
        <EmptyState
          icon={Library}
          title={items.length === 0 ? "Your library is empty" : "No matches"}
          message={
            items.length === 0
              ? "Add your first study material — notes, a PDF, a lecture link — and it lives here across every device session."
              : "Try a different subject or search term."
          }
        >
          {items.length === 0 && (
            <button className="btn-primary inline-flex" onClick={() => setAdding(true)}>
              <Plus size={16} aria-hidden="true" /> Add your first resource
            </button>
          )}
        </EmptyState>
      ) : (
        <div className="res-grid">
          {shown.map((r) => (
            <ResourceCard key={r.id} r={r} onRemove={() => remove(r.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

function ResourceCard({ r, onRemove }: { r: Resource; onRemove: () => void }) {
  const Icon = KIND_ICON[r.kind] ?? StickyNote;
  return (
    <div className="res-card glass-panel">
      <div className="res-card-head">
        <span className="res-card-icon">
          <Icon size={18} aria-hidden="true" />
        </span>
        <span className="res-card-kind">{r.kind}</span>
        <button className="res-card-del" onClick={onRemove} aria-label={`Delete ${r.title}`}>
          <Trash2 size={14} aria-hidden="true" />
        </button>
      </div>
      <h3 className="res-card-title">{r.title}</h3>
      {r.note && <p className="res-card-note">{r.note}</p>}
      <div className="res-card-foot">
        <span className="res-card-subject">{r.subject}</span>
        {r.url && (
          <a className="res-card-open" href={r.url} target="_blank" rel="noopener noreferrer">
            Open <ExternalLink size={12} aria-hidden="true" />
          </a>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Megaphone, Plus, X, Pin, PinOff, Trash2, Clock } from "lucide-react";
import { useAnnouncements, ANNOUNCEMENT_TAGS } from "@/features/announcements/use-announcements";
import { EmptyState } from "@/components/ui/empty-state";

function timeAgo(ts: number) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export default function AnnouncementsPage() {
  const { items, ready, add, remove, togglePin } = useAnnouncements();
  const [posting, setPosting] = useState(false);
  const [form, setForm] = useState({ title: "", body: "", tag: "General" });

  const submit = () => {
    if (!form.title.trim()) return;
    add({ title: form.title.trim(), body: form.body.trim(), tag: form.tag });
    setForm({ title: "", body: "", tag: "General" });
    setPosting(false);
  };

  return (
    <div className="space-y-6 page-enter">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="lab-hero">
          <span className="lab-hero-icon"><Megaphone size={24} aria-hidden="true" /></span>
          <div>
            <h1 className="text-3xl font-bold font-display tracking-tight">Announcements</h1>
            <p className="text-eduverse-text-muted mt-1">Academic updates, deadlines, and reminders — pinned to the top.</p>
          </div>
        </div>
        <button className="glow-pill" onClick={() => setPosting((p) => !p)}>
          {posting ? <><X size={16} aria-hidden="true" /> Cancel</> : <><Plus size={16} aria-hidden="true" /> Post</>}
        </button>
      </div>

      {posting && (
        <div className="glass-panel res-form">
          <div className="res-form-grid" style={{ gridTemplateColumns: "1fr 160px" }}>
            <input className="app-input" placeholder="Title (e.g. Midterm moved to Friday)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} autoFocus />
            <select className="app-input" value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })} aria-label="Tag">
              {ANNOUNCEMENT_TAGS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <textarea className="app-input res-form-note" placeholder="Details (optional)" rows={3} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
          <button className="btn-primary self-start" onClick={submit} disabled={!form.title.trim()}>Post announcement</button>
        </div>
      )}

      {!ready ? null : items.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="No announcements yet"
          message="Post your first update — an exam date, a deadline, a reminder — and pin the ones that matter so they stay on top."
        >
          <button className="btn-primary inline-flex" onClick={() => setPosting(true)}>
            <Plus size={16} aria-hidden="true" /> Post the first one
          </button>
        </EmptyState>
      ) : (
        <div className="ann-list">
          {items.map((a) => (
            <div key={a.id} className={`ann-card glass-panel ${a.pinned ? "pinned" : ""}`}>
              <span className="ann-rail"><Megaphone size={18} aria-hidden="true" /></span>
              <div className="ann-body">
                <div className="ann-head">
                  <h3 className="ann-title">{a.title}</h3>
                  <span className="ann-tag">{a.tag}</span>
                  {a.pinned && <span className="ann-tag" style={{ color: "var(--color-eduverse-warning)" }}>Pinned</span>}
                </div>
                {a.body && <p className="ann-text">{a.body}</p>}
                <div className="ann-meta">
                  <span className="inline-flex items-center gap-1"><Clock size={12} aria-hidden="true" /> {timeAgo(a.createdAt)}</span>
                  <button className="ann-action" onClick={() => togglePin(a.id)}>
                    {a.pinned ? <><PinOff size={13} aria-hidden="true" /> Unpin</> : <><Pin size={13} aria-hidden="true" /> Pin</>}
                  </button>
                  <button className="ann-action danger" onClick={() => remove(a.id)}>
                    <Trash2 size={13} aria-hidden="true" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

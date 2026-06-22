"use client";

import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { useAnnouncements } from "./use-announcements";

/** Dashboard strip showing the latest pinned/recent announcements. */
export function AnnouncementsCard() {
  const { items, ready } = useAnnouncements();
  const latest = items.slice(0, 3);

  return (
    <GlassCard>
      <div className="flex items-center justify-between mb-4">
        <div className="section-label" style={{ marginBottom: 0 }}>
          <span className="section-label-prefix">//</span> Announcements
        </div>
        <Link href="/announcements" className="feature-go">
          View all <ArrowRight size={13} aria-hidden="true" />
        </Link>
      </div>

      {!ready ? null : latest.length === 0 ? (
        <Link href="/announcements" className="ann-strip-item">
          <span
            className="ann-strip-dot"
            style={{ background: "var(--color-eduverse-text-muted)", boxShadow: "none" }}
          />
          <span
            className="ann-strip-title"
            style={{ color: "var(--color-eduverse-text-muted)", fontWeight: 400 }}
          >
            No announcements yet — post your first update
          </span>
          <Plus size={14} aria-hidden="true" />
        </Link>
      ) : (
        <div className="ann-strip">
          {latest.map((a) => (
            <Link key={a.id} href="/announcements" className="ann-strip-item">
              <span
                className="ann-strip-dot"
                style={
                  a.pinned
                    ? undefined
                    : { background: "var(--color-eduverse-text-muted)", boxShadow: "none" }
                }
              />
              <span className="ann-strip-title">{a.title}</span>
              <span className="ann-strip-tag">{a.tag}</span>
            </Link>
          ))}
        </div>
      )}
    </GlassCard>
  );
}

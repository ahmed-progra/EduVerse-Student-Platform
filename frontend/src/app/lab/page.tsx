"use client";

import Link from "next/link";
import { Boxes, ArrowRight } from "lucide-react";
import { LAB_SUBJECTS } from "@/features/lab/lab-subjects";

export default function LabHubPage() {
  return (
    <div className="space-y-8 page-enter">
      <div>
        <div className="section-label">
          <span className="section-label-prefix">//</span> Interactive
        </div>
        <div className="lab-hero">
          <span className="lab-hero-icon">
            <Boxes size={26} aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-3xl font-bold font-display tracking-tight">3D Lab</h1>
            <p className="text-eduverse-text-muted mt-1">
              Real-time, orbitable 3D models for math, physics, and science. Drag to explore.
            </p>
          </div>
        </div>
      </div>

      <div className="lab-grid">
        {LAB_SUBJECTS.map((s) => (
          <Link key={s.slug} href={`/lab/${s.slug}`} className="lab-card glass-panel glass-panel-link">
            <span className="lab-card-icon">
              <s.Icon size={24} aria-hidden="true" />
            </span>
            <div className="lab-card-tag">{s.tagline}</div>
            <h2 className="lab-card-title">{s.title}</h2>
            <p className="lab-card-blurb">{s.blurb}</p>
            <span className="lab-card-go">
              Launch lab <ArrowRight size={15} aria-hidden="true" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

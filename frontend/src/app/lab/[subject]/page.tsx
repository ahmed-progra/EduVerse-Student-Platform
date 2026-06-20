"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowLeft, Hand } from "lucide-react";
import { getLabSubject } from "@/features/lab/lab-subjects";

const ThreeScene = dynamic(
  () => import("@/features/lab/three-scene").then((m) => m.ThreeScene),
  { ssr: false },
);

export default function LabSubjectPage() {
  const params = useParams();
  const slug = String(params?.subject ?? "");
  const subject = getLabSubject(slug);

  if (!subject) {
    return (
      <div className="empty-state page-enter">
        <h3>Lab not found</h3>
        <p>That experiment doesn&apos;t exist yet.</p>
        <Link href="/lab" className="btn-primary mt-4 inline-flex">Back to 3D Lab</Link>
      </div>
    );
  }

  const { title, tagline, concept, hint, Icon } = subject;

  return (
    <div className="space-y-6 page-enter">
      <div className="lab-head">
        <Link href="/lab" className="lab-back">
          <ArrowLeft size={15} aria-hidden="true" /> 3D Lab
        </Link>
        <div className="lab-head-title">
          <span className="lab-head-icon">
            <Icon size={22} aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-2xl font-bold font-display tracking-tight">{title}</h1>
            <p className="text-eduverse-text-muted text-sm">{tagline}</p>
          </div>
        </div>
      </div>

      <div className="lab-stage glass-panel">
        <ThreeScene init={subject.init} className="lab-canvas" />
        <span className="lab-hint">
          <Hand size={13} aria-hidden="true" /> {hint}
        </span>
      </div>

      <div className="lab-concept">
        <div className="section-label" style={{ marginBottom: 10 }}>
          <span className="section-label-prefix">//</span> What you&apos;re looking at
        </div>
        <p>{concept}</p>
      </div>
    </div>
  );
}

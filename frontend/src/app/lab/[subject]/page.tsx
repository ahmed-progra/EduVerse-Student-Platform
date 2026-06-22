"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { getLabSubject } from "@/features/lab/lab-subjects";
import { LabWorkbench } from "@/features/lab/lab-workbench";

export default function LabSubjectPage() {
  const params = useParams();
  const slug = String(params?.subject ?? "");
  const subject = getLabSubject(slug);

  if (!subject) {
    return (
      <div className="empty-state page-enter">
        <h3>Lab not found</h3>
        <p>That experiment doesn&apos;t exist yet.</p>
        <Link href="/lab" className="btn-primary mt-4 inline-flex">
          Back to 3D Lab
        </Link>
      </div>
    );
  }

  return <LabWorkbench subject={subject} />;
}

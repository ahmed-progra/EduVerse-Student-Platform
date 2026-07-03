"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Boxes } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { getLabSubject } from "@/features/lab/lab-subjects";
import { LabWorkbench } from "@/features/lab/lab-workbench";

export default function LabSubjectPage() {
  const params = useParams();
  const slug = String(params?.subject ?? "");
  const subject = getLabSubject(slug);

  if (!subject) {
    return (
      <div className="page-enter">
        <EmptyState icon={Boxes} title="Lab not found" message="That experiment doesn't exist yet.">
          <Link
            href="/lab"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-[var(--radius-button)] text-sm font-semibold bg-eduverse-accent-strong text-white hover:brightness-110 transition-all"
          >
            Back to 3D Lab
          </Link>
        </EmptyState>
      </div>
    );
  }

  return <LabWorkbench subject={subject} />;
}

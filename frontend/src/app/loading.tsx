import { SkeletonCardGrid } from "@/components/ui/skeleton";

// Route-level loading UI for soft navigations — a branded skeleton that mirrors
// the typical page shape (header → stat grid → content) instead of a bare spinner.
export default function PageLoading() {
  return (
    <div
      className="space-y-6 max-w-7xl mx-auto"
      role="status"
      aria-busy="true"
      aria-label="Loading"
    >
      <div className="space-y-3">
        <div className="sk-line" style={{ width: "150px", height: "12px" }} />
        <div className="sk-line" style={{ width: "min(320px, 70%)", height: "30px" }} />
        <div className="sk-line" style={{ width: "min(460px, 90%)", height: "12px" }} />
      </div>
      <SkeletonCardGrid count={4} />
      <div className="sk-card" style={{ height: "280px" }} />
      <span className="sr-only">Loading…</span>
    </div>
  );
}

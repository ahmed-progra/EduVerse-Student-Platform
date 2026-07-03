// Route-level loading UI — mirrors the in-page loading branch of
// skill-tree/page.tsx so the skeleton doesn't change shape depending on
// whether the route or the data is what's still loading.
export default function SkillTreeLoading() {
  return (
    <div
      className="space-y-6 max-w-6xl mx-auto"
      role="status"
      aria-busy="true"
      aria-label="Loading skill tree"
    >
      <div className="sk-card" style={{ height: "40px", width: "200px" }} />
      <div className="sk-card" style={{ height: "20px", width: "350px" }} />
      <div className="sk-card" style={{ height: "60vh" }} />
      <span className="sr-only">Loading…</span>
    </div>
  );
}

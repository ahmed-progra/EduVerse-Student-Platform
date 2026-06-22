// Mirrors the real lesson layout (single column: header → content → visualizer)
// so there's no content shift when the page resolves.
export default function LessonLoading() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto" role="status" aria-busy="true" aria-label="Loading lesson">
      <div className="space-y-3">
        <div className="sk-line" style={{ width: "110px", height: "12px" }} />
        <div className="sk-line" style={{ width: "min(360px, 70%)", height: "28px" }} />
      </div>
      <div className="sk-card" style={{ height: "80px" }} />
      <div className="sk-card" style={{ height: "200px" }} />
      <div className="sk-card" style={{ height: "420px" }} />
      <span className="sr-only">Loading lesson…</span>
    </div>
  );
}

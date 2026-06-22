export default function SkillTreeLoading() {
  return (
    <div className="flex gap-6">
      <div className="flex-1 min-w-0 space-y-6">
        <div className="h-8 w-56 rounded bg-eduverse-surface animate-pulse" />
        <div className="h-4 w-96 rounded bg-eduverse-surface animate-pulse" />
        <div className="h-[60vh] rounded-2xl bg-eduverse-surface animate-pulse flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div
              className="w-8 h-8 border-2 rounded"
              style={{
                borderColor: "var(--color-eduverse-accent)",
                borderTopColor: "transparent",
                animation: "spin 0.8s linear infinite",
              }}
            />
            <p className="text-xs font-mono" style={{ color: "var(--color-eduverse-text-muted)" }}>
              Plotting the map…
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

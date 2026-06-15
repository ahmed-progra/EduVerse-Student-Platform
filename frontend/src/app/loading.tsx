export default function PageLoading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 rounded" style={{
          borderColor: "var(--color-eduverse-accent)",
          borderTopColor: "transparent",
          animation: "spin 0.8s linear infinite",
        }} />
        <p className="text-sm font-mono" style={{ color: "var(--color-eduverse-text-muted)" }}>Loading…</p>
      </div>
    </div>
  );
}

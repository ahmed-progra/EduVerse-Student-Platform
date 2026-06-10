export default function LessonLoading() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-eduverse-surface" />
        <div className="h-8 w-48 rounded-lg bg-eduverse-surface" />
      </div>
      <div className="h-4 w-96 rounded-lg bg-eduverse-surface" />
      <div className="grid lg:grid-cols-[1fr_400px] gap-6">
        <div className="space-y-4">
          <div className="h-[460px] rounded-2xl bg-eduverse-surface" />
          <div className="h-24 rounded-2xl bg-eduverse-surface" />
        </div>
        <div className="space-y-4">
          <div className="h-48 rounded-2xl bg-eduverse-surface" />
          <div className="h-64 rounded-2xl bg-eduverse-surface" />
        </div>
      </div>
    </div>
  );
}
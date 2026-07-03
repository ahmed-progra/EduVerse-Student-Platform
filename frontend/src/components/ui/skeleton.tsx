export function SkeletonCard() {
  return <div className="sk-card" style={{ height: "140px" }} />;
}

export function SkeletonText({ lines = 2 }: { lines?: number }) {
  return (
    <div className="sk-text w-full">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="sk-line" style={{ width: `${80 - i * 15}%` }} />
      ))}
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div
      className="flex items-center justify-between py-3.5 px-4 border border-eduverse-border bg-eduverse-surface/40"
      style={{ borderRadius: "var(--radius-card)" }}
    >
      <div className="flex items-center gap-3 w-2/3">
        <div
          className="w-8 h-8 rounded-full shrink-0"
          style={{
            background: "var(--color-eduverse-surface)",
            animation: "sk-shimmer 1.8s infinite linear",
          }}
        />
        <div className="sk-text w-full">
          <div className="sk-line" style={{ width: "50%", height: "10px" }} />
          <div className="sk-line mt-1.5" style={{ width: "30%", height: "8px" }} />
        </div>
      </div>
      <div className="sk-line shrink-0" style={{ width: "15%", height: "10px" }} />
    </div>
  );
}

export function SkeletonActivity() {
  return (
    <div className="flex items-center justify-between py-3 px-3 border border-transparent">
      <div className="flex items-center gap-3 w-1/2">
        <div
          className="w-5 h-5 rounded-[var(--radius-sm)] shrink-0"
          style={{
            background: "var(--color-eduverse-surface)",
            animation: "sk-shimmer 1.8s infinite linear",
          }}
        />
        <div className="sk-line" style={{ width: "60%", height: "10px" }} />
      </div>
      <div className="sk-line shrink-0" style={{ width: "12%", height: "10px" }} />
    </div>
  );
}

export function SkeletonWidget() {
  return (
    <div className="app-card p-6 flex flex-col justify-between min-h-[120px]">
      <div
        className="w-6 h-6 rounded-lg"
        style={{
          background: "var(--color-eduverse-surface)",
          animation: "sk-shimmer 1.8s infinite linear",
        }}
      />
      <div>
        <div className="sk-line mb-2" style={{ width: "40%", height: "16px" }} />
        <div className="sk-line" style={{ width: "60%", height: "8px" }} />
      </div>
    </div>
  );
}

export function SkeletonPodium() {
  return (
    <div className="flex items-end justify-center gap-6 my-8">
      <div className="flex flex-col items-center gap-2">
        <div
          className="w-10 h-10 rounded-full"
          style={{
            background: "var(--color-eduverse-surface)",
            animation: "sk-shimmer 1.8s infinite linear",
          }}
        />
        <div className="sk-line" style={{ width: "45px", height: "8px" }} />
        <div
          className="w-20 h-24 rounded-t-xl"
          style={{
            background: "var(--color-eduverse-surface)",
            animation: "sk-shimmer 1.8s infinite linear",
          }}
        />
      </div>
      <div className="flex flex-col items-center gap-2">
        <div
          className="w-12 h-12 rounded-full"
          style={{
            background: "var(--color-eduverse-surface)",
            animation: "sk-shimmer 1.8s infinite linear",
          }}
        />
        <div className="sk-line" style={{ width: "55px", height: "10px" }} />
        <div
          className="w-20 h-32 rounded-t-xl"
          style={{
            background: "var(--color-eduverse-surface)",
            animation: "sk-shimmer 1.8s infinite linear",
          }}
        />
      </div>
      <div className="flex flex-col items-center gap-2">
        <div
          className="w-10 h-10 rounded-full"
          style={{
            background: "var(--color-eduverse-surface)",
            animation: "sk-shimmer 1.8s infinite linear",
          }}
        />
        <div className="sk-line" style={{ width: "40px", height: "8px" }} />
        <div
          className="w-20 h-20 rounded-t-xl"
          style={{
            background: "var(--color-eduverse-surface)",
            animation: "sk-shimmer 1.8s infinite linear",
          }}
        />
      </div>
    </div>
  );
}

export function SkeletonCardGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonWidget key={i} />
      ))}
    </div>
  );
}

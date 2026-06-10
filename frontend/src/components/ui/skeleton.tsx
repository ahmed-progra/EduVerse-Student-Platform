export function SkeletonCard() {
  return <div className="sk-card" />;
}

export function SkeletonText({ lines = 2 }: { lines?: number }) {
  return (
    <div className="sk-text">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="sk-line" style={{ width: `${80 - i * 15}%` }} />
      ))}
    </div>
  );
}

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4" style={{ background: "var(--color-eduverse-bg)" }}>
      <div className="text-8xl font-bold mb-4" style={{
        background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #ec4899 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
      }}>
        404
      </div>
      <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--color-eduverse-text)" }}>Page Not Found</h2>
      <p className="mb-6 max-w-md" style={{ color: "var(--color-eduverse-text-muted)" }}>
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="flex gap-3">
        <Link
          href="/"
          className="px-6 py-3 rounded-xl font-semibold text-sm transition-colors"
          style={{ background: "var(--color-eduverse-accent)", color: "white" }}
        >
          Go Home
        </Link>
        <Link
          href="/dashboard"
          className="px-6 py-3 rounded-xl font-semibold text-sm transition-colors"
          style={{
            background: "var(--color-eduverse-surface)",
            color: "var(--color-eduverse-accent)",
            border: "1px solid var(--color-eduverse-border)",
          }}
        >
          Dashboard
        </Link>
      </div>
    </div>
  );
}
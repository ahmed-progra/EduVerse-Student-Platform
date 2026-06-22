import Link from "next/link";

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center text-center px-4"
      style={{ background: "var(--color-eduverse-bg)" }}
    >
      <div
        className="text-8xl font-bold mb-4"
        style={{
          fontFamily: "var(--font-display)",
          color: "var(--color-eduverse-accent)",
          letterSpacing: "-0.04em",
        }}
      >
        404
      </div>
      <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--color-eduverse-text)" }}>
        Page Not Found
      </h2>
      <p className="mb-6 max-w-md" style={{ color: "var(--color-eduverse-text-muted)" }}>
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="flex gap-3">
        <Link
          href="/"
          className="px-6 py-3 rounded font-semibold text-sm transition-[filter] hover:brightness-110"
          style={{ background: "var(--color-eduverse-accent-strong)", color: "white" }}
        >
          Go Home
        </Link>
        <Link
          href="/dashboard"
          className="px-6 py-3 rounded font-semibold text-sm transition-colors"
          style={{
            background: "var(--color-eduverse-surface)",
            color: "var(--color-eduverse-text)",
            border: "1px solid var(--color-eduverse-border-mid)",
          }}
        >
          Dashboard
        </Link>
      </div>
    </div>
  );
}

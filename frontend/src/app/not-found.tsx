import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 bg-eduverse-bg page-enter">
      <div className="text-8xl font-bold mb-4 font-display text-eduverse-accent tracking-[-0.04em]">
        404
      </div>
      <h2 className="text-2xl font-bold mb-2 font-display tracking-tight text-eduverse-text">
        Page Not Found
      </h2>
      <p className="mb-6 max-w-md text-eduverse-text-muted">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="flex gap-3">
        <Link
          href="/"
          className="px-6 py-3 rounded-[var(--radius-button)] font-semibold text-sm transition-[filter] hover:brightness-110 bg-eduverse-accent-strong text-white"
        >
          Go Home
        </Link>
        <Link
          href="/dashboard"
          className="px-6 py-3 rounded-[var(--radius-button)] font-semibold text-sm transition-colors bg-eduverse-surface text-eduverse-text border border-eduverse-border-mid hover:border-eduverse-border-mid hover:bg-eduverse-raised"
        >
          Dashboard
        </Link>
      </div>
    </div>
  );
}

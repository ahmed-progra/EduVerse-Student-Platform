import Link from "next/link";

export default function LessonNotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div
        className="text-6xl font-bold mb-4"
        style={{
          fontFamily: "var(--font-display)",
          color: "var(--color-eduverse-accent)",
          letterSpacing: "-0.04em",
        }}
      >
        404
      </div>
      <h2 className="text-2xl font-bold text-eduverse-text mb-2">Lesson Not Found</h2>
      <p className="text-eduverse-text-muted mb-6 max-w-md">
        This lesson doesn&apos;t exist or has been removed.
      </p>
      <Link
        href="/courses"
        className="px-6 py-3 rounded bg-eduverse-accent-strong text-white font-semibold text-sm hover:brightness-110 transition-[filter]"
      >
        Browse Courses
      </Link>
    </div>
  );
}

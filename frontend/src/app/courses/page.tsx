"use client";

import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { EmptyState } from "@/components/ui/empty-state";
import { api } from "@/services/api-client";
import { fadeUp, staggerContainer, fastEaseTransition, cardHover } from "@/lib/motion";
import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, ChevronRight, WifiOff, GraduationCap } from "lucide-react";

interface Course {
  id: string;
  title: string;
  description: string;
  icon: string;
  lessons?: { id: string }[];
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    api
      .getCourses()
      .then((res) => {
        setCourses(res.data);
        setLoading(false);
      })
      .catch(() => {
        setOffline(true);
        setLoading(false);
      });
  }, []);

  return (
    <motion.div
      className="space-y-8 max-w-6xl mx-auto"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      <motion.div variants={fadeUp} transition={fastEaseTransition}>
        <div className="section-label">
          <span className="section-label-prefix">//</span> Courses
        </div>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold mb-2 font-display tracking-tight">Available Paths</h1>
            <p className="text-eduverse-text-muted">
              Choose your path and master programming languages.
            </p>
          </div>
          <Link
            href="/placement-test"
            className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[var(--radius-button)] border border-eduverse-border text-sm text-eduverse-text-muted hover:text-eduverse-accent hover:border-eduverse-accent/30 hover:bg-eduverse-accent/5 transition-colors"
          >
            <GraduationCap className="w-4 h-4" aria-hidden="true" /> Placement Test
          </Link>
        </div>
      </motion.div>

      {loading ? (
        <div className="grid md:grid-cols-2 gap-6" aria-hidden="true">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="sk-card !h-36" />
          ))}
        </div>
      ) : offline ? (
        <motion.div variants={fadeUp} transition={fastEaseTransition}>
          <EmptyState
            icon={WifiOff}
            title="Can't reach the server"
            message="The EduVerse API isn't responding, so courses can't be loaded. Start the backend, then refresh."
          />
        </motion.div>
      ) : courses.length === 0 ? (
        <motion.div variants={fadeUp} transition={fastEaseTransition}>
          <EmptyState
            icon={BookOpen}
            title="No courses yet"
            message="The course catalog is empty. Seed the database to add Python, HTML, CSS, and C++ courses."
          />
        </motion.div>
      ) : (
        <motion.div className="grid md:grid-cols-2 gap-6" variants={staggerContainer}>
          {courses.map((course) => (
            <motion.div key={course.id} variants={fadeUp} transition={fastEaseTransition}>
              <Link href={`/courses/${course.id}`} className="block h-full group">
                <motion.div {...cardHover}>
                  <GlassCard className="h-full">
                    <div className="flex items-start gap-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-xl"
                        style={{ background: "var(--color-eduverse-accent-soft)" }}
                        aria-hidden="true"
                      >
                        {course.icon || <GraduationCap className="w-5 h-5 text-eduverse-accent" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h2 className="text-xl font-bold mb-2 tracking-tight">{course.title}</h2>
                        <p className="text-sm text-eduverse-text-muted mb-4 leading-relaxed line-clamp-2">
                          {course.description}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-eduverse-accent">
                          <BookOpen className="w-4 h-4" aria-hidden="true" />
                          <span className="font-mono">{course.lessons?.length || 0}</span>
                          <span>lessons</span>
                          <ChevronRight
                            className="w-4 h-4 ml-auto transition-transform duration-200 group-hover:translate-x-1"
                            aria-hidden="true"
                          />
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}

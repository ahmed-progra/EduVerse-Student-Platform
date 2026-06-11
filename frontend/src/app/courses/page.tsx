"use client";

import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { SkeletonCard } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, ChevronRight, WifiOff } from "lucide-react";

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
    api.getCourses().then((res) => {
      setCourses(res.data);
      setLoading(false);
    }).catch(() => {
      setOffline(true);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
        <h1 className="text-3xl font-bold mb-2 font-display">Courses</h1>
        <p className="text-eduverse-text-muted">Choose your path and master programming languages.</p>
      </motion.div>

      <h2 className="flex items-center gap-2 text-sm font-mono text-eduverse-text-muted">
        <span className="text-eduverse-accent">//</span> Available Paths
      </h2>

      {loading ? (
        <div className="grid md:grid-cols-2 gap-6" aria-hidden="true">
          {[1, 2, 3, 4].map((i) => <div key={i} className="sk-card !h-36" />)}
        </div>
      ) : offline ? (
        <EmptyState
          icon={WifiOff}
          title="Can't reach the server"
          message="The EduVerse API isn't responding, so courses can't be loaded. Start the backend, then refresh."
        />
      ) : courses.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No courses yet"
          message="The course catalog is empty. Seed the database to add Python, HTML, CSS, and C++ courses."
        />
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {courses.map((course, i) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link href={`/courses/${course.id}`} className="block h-full group">
                <GlassCard className="h-full">
                  <div className="flex items-start gap-4">
                    <div className="text-2xl shrink-0 leading-none" aria-hidden="true">
                      {course.icon || <BookOpen className="w-6 h-6 text-eduverse-accent" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-xl font-bold mb-2">{course.title}</h2>
                      <p className="text-sm text-eduverse-text-muted mb-4 leading-relaxed">{course.description}</p>
                      <div className="flex items-center gap-2 text-sm text-eduverse-accent">
                        <BookOpen className="w-4 h-4" aria-hidden="true" />
                        <span className="font-mono">{course.lessons?.length || 0}</span><span> lessons</span>
                        <ChevronRight className="w-4 h-4 ml-auto transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

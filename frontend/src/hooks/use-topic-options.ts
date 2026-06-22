"use client";

import { useEffect, useState } from "react";
import { api } from "@/services/api-client";

export interface TopicOption {
  value: string;
  label: string;
}

const FALLBACK: TopicOption[] = [
  { value: "python", label: "Python" },
  { value: "javascript", label: "JavaScript" },
  { value: "algorithms", label: "Algorithms" },
];

/**
 * Topic options for the AI Challenge / Exam panels, sourced from the learner's
 * actual enrolled courses (api.apprenticeTopics) so generated problems match
 * what they're studying instead of a hardcoded Python/JS/Algorithms list.
 * Falls back to the generic three on failure or empty catalog.
 */
export function useTopicOptions(): TopicOption[] {
  const [options, setOptions] = useState<TopicOption[]>(FALLBACK);
  useEffect(() => {
    let alive = true;
    api
      .apprenticeTopics()
      .then((res) => {
        const courses = res.data?.courses ?? [];
        const opts = courses.map((c) => ({ value: c.courseTitle, label: c.courseTitle }));
        if (alive && opts.length > 0) setOptions(opts);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  return options;
}

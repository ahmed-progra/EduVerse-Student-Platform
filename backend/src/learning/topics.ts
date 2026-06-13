/**
 * Canonical topic catalogs per course.
 *
 * These keys are the shared vocabulary of the adaptive system:
 *  - every Lesson is tagged with the topics it teaches
 *  - every assessment question is tagged with the topic it probes
 *  - the SkillProfile stores mastery per topic key
 *  - roadmap generation matches lesson topics against profile gaps
 *
 * Tiers drive classification: a learner's level is computed from how much
 * of each tier they have mastered, not from a single raw score.
 */

export type TopicTier = "fundamental" | "core" | "advanced";

export interface TopicInfo {
  key: string;
  label: string;
  tier: TopicTier;
}

export const COURSE_TOPICS: Record<string, TopicInfo[]> = {
  python: [
    { key: "variables", label: "Variables", tier: "fundamental" },
    { key: "data-types", label: "Data Types", tier: "fundamental" },
    { key: "io", label: "Input / Output", tier: "fundamental" },
    { key: "operators", label: "Operators", tier: "fundamental" },
    { key: "conditionals", label: "Conditionals", tier: "fundamental" },
    { key: "loops", label: "Loops", tier: "fundamental" },
    { key: "strings", label: "Strings", tier: "fundamental" },
    { key: "functions", label: "Functions", tier: "core" },
    { key: "lists", label: "Lists", tier: "core" },
    { key: "tuples", label: "Tuples", tier: "core" },
    { key: "dictionaries", label: "Dictionaries", tier: "core" },
    { key: "sets", label: "Sets", tier: "core" },
    { key: "modules", label: "Modules", tier: "core" },
    { key: "file-handling", label: "File Handling", tier: "core" },
    { key: "exceptions", label: "Exceptions", tier: "core" },
    { key: "oop", label: "Object-Oriented Programming", tier: "advanced" },
    { key: "generators", label: "Generators", tier: "advanced" },
    { key: "decorators", label: "Decorators", tier: "advanced" },
    { key: "lambdas", label: "Lambda Functions", tier: "advanced" },
    { key: "apis", label: "Working with APIs", tier: "advanced" },
    { key: "advanced-python", label: "Advanced Python", tier: "advanced" },
  ],
  cpp: [
    { key: "variables", label: "Variables", tier: "fundamental" },
    { key: "data-types", label: "Data Types", tier: "fundamental" },
    { key: "operators", label: "Operators", tier: "fundamental" },
    { key: "io", label: "Input / Output", tier: "fundamental" },
    { key: "conditionals", label: "Conditionals", tier: "fundamental" },
    { key: "loops", label: "Loops", tier: "fundamental" },
    { key: "functions", label: "Functions", tier: "core" },
    { key: "arrays", label: "Arrays", tier: "core" },
    { key: "pointers", label: "Pointers", tier: "core" },
    { key: "references", label: "References", tier: "core" },
    { key: "structures", label: "Structures", tier: "core" },
    { key: "classes", label: "Classes", tier: "core" },
    { key: "constructors", label: "Constructors", tier: "core" },
    { key: "destructors", label: "Destructors", tier: "core" },
    { key: "inheritance", label: "Inheritance", tier: "advanced" },
    { key: "polymorphism", label: "Polymorphism", tier: "advanced" },
    { key: "templates", label: "Templates", tier: "advanced" },
    { key: "stl", label: "STL", tier: "advanced" },
    { key: "memory-management", label: "Memory Management", tier: "advanced" },
    { key: "exception-handling", label: "Exception Handling", tier: "advanced" },
    { key: "advanced-cpp", label: "Advanced C++", tier: "advanced" },
  ],
  html: [
    { key: "document-structure", label: "Document Structure", tier: "fundamental" },
    { key: "semantic-elements", label: "Semantic Elements", tier: "core" },
    { key: "forms", label: "Forms", tier: "core" },
    { key: "tables", label: "Tables", tier: "core" },
    { key: "media", label: "Media Elements", tier: "core" },
    { key: "accessibility", label: "Accessibility", tier: "advanced" },
    { key: "seo", label: "SEO Basics", tier: "advanced" },
    { key: "html5-apis", label: "Modern HTML5 APIs", tier: "advanced" },
  ],
  css: [
    { key: "selectors", label: "Selectors", tier: "fundamental" },
    { key: "colors", label: "Colors", tier: "fundamental" },
    { key: "typography", label: "Typography", tier: "fundamental" },
    { key: "box-model", label: "Box Model", tier: "fundamental" },
    { key: "positioning", label: "Positioning", tier: "core" },
    { key: "flexbox", label: "Flexbox", tier: "core" },
    { key: "grid", label: "Grid", tier: "core" },
    { key: "responsive", label: "Responsive Design", tier: "core" },
    { key: "transitions", label: "Transitions", tier: "core" },
    { key: "animations", label: "Animations", tier: "advanced" },
    { key: "modern-layout", label: "Modern Layout Systems", tier: "advanced" },
    { key: "advanced-css", label: "Advanced CSS", tier: "advanced" },
  ],
};

export function topicLabel(courseSlug: string, key: string): string {
  const t = (COURSE_TOPICS[courseSlug] || []).find((t) => t.key === key);
  return t?.label || key;
}

export function topicTier(courseSlug: string, key: string): TopicTier {
  const t = (COURSE_TOPICS[courseSlug] || []).find((t) => t.key === key);
  return t?.tier || "core";
}

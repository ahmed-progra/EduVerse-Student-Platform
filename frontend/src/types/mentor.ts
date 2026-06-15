/** Shared types for the AI Mentor System (global cross-course coach). */

export interface MentorInsight {
  title: string;
  body: string;
  kind: string; // strength | gap | habit | tip
}

export interface MentorRecommendation {
  title: string;
  reason: string;
  area: string;
  href: string;
}

export interface MentorProject {
  title: string;
  brief: string;
  skills: string[];
}

export interface GrowthPoint {
  date: string;
  xp: number; // cumulative
}

export interface TopicRef {
  key: string;
  label: string;
  course: string;
  score: number;
}

export interface MentorMetrics {
  totals?: {
    lessonsCompleted: number;
    coursesStarted: number;
    skillsUnlocked: number;
    battlesWon: number;
    battlesPlayed: number;
    assessmentsTaken: number;
  };
  perCourse?: { slug: string; title: string; level: string; completed: number; total: number }[];
  growthSeries?: GrowthPoint[];
  strongTopics?: TopicRef[];
  weakTopics?: TopicRef[];
  retention?: number;
  momentum?: number;
  learningSpeed?: string;
}

export interface MentorProfileData {
  summary: string;
  motivation: string;
  focus: string;
  strengths: string[];
  weaknesses: string[];
  insights: MentorInsight[];
  recommendations: MentorRecommendation[];
  projects: MentorProject[];
  learningSpeed: string;
  retention: number;
  momentum: number;
  metrics: MentorMetrics;
  version: number;
  lastSyncedAt: string | null;
}

export interface Mission {
  id: string;
  scope: "daily" | "weekly";
  type: string;
  title: string;
  description: string;
  rationale: string;
  target: number;
  progress: number;
  xpReward: number;
  status: "active" | "completed";
  courseSlug: string | null;
  topicKey: string | null;
  difficulty: string | null;
  completedAt: string | null;
}

export interface MentorReportData {
  periodKey: string;
  narrative: string;
  improved: string[];
  regressed: string[];
  needsWork: string[];
  focusAreas: string[];
  projects: MentorProject[];
  createdAt: string;
}

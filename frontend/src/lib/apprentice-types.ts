/** Types for Apprentice Mode — "teach the AI" (protégé effect). */

export interface TeachTurn {
  role: "mentor" | "apprentice";
  text: string;
}

export interface ApprenticeTurn {
  say: string;
  understanding: number; // 0-100
  done: boolean;
  maxTurns?: number;
}

export interface TeachGrade {
  clarity: number;
  correctness: number;
  completeness: number;
  overall: number;
  verdict: string;
  strengths: string[];
  improvements: string[];
  xpAwarded: number;
  masteryBoosted: boolean;
}

export interface TeachableCourse {
  courseSlug: string;
  courseTitle: string;
  topics: { key: string; label: string }[];
}

/** Types for the Project Studio + public Portfolio. */

export interface ProjectMilestone {
  text: string;
  done: boolean;
}

export interface ProjectRubric {
  criterion: string;
  score: number;
  max: number;
  note: string;
}

export interface Project {
  id: string;
  title: string;
  brief: string;
  language: string;
  difficulty: string;
  skills: string[];
  milestones: ProjectMilestone[];
  starterCode: string;
  code: string;
  status: "in_progress" | "completed";
  source: string;
  score: number | null;
  feedback: string;
  rubric: ProjectRubric[];
  strengths: string[];
  improvements: string[];
  published: boolean;
  xpAwarded: number;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

export interface PortfolioProject {
  id: string;
  title: string;
  brief: string;
  language: string;
  difficulty: string;
  skills: string[];
  score: number | null;
  completedAt: string | null;
}

export interface PortfolioData {
  user: {
    username: string;
    avatar: string;
    bio: string | null;
    level: number;
    xp: number;
    placementLevel: string;
    createdAt: string;
  };
  projects: PortfolioProject[];
}

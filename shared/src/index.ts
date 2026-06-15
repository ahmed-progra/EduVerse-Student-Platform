export type PlacementLevel = "beginner" | "intermediate" | "advanced";

export type CodeLanguage = "python" | "html" | "css" | "cpp";

export interface User {
  id: string;
  email: string;
  username: string;
  avatar: string;
  level: number;
  xp: number;
  rank: number;
  placementLevel: PlacementLevel;
  createdAt: string;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  icon: string;
  order: number;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  content: string;
  codeTemplate: string;
  language: CodeLanguage;
  order: number;
  xpReward: number;
  completed?: boolean;
}

export interface UserProgress {
  userId: string;
  lessonId: string;
  completed: boolean;
  score: number | null;
}

export interface XpLog {
  id: string;
  userId: string;
  amount: number;
  source: "lesson" | "battle" | "challenge";
  createdAt: string;
}

export interface SkillTreeNode {
  id: string;
  name: string;
  description: string;
  branch: SkillBranch;
  position: { x: number; y: number };
  prerequisites: string[];
  xpCost: number;
  levelRequired: number;
  effect: SkillEffect;
  unlocked?: boolean;
}

export type SkillBranch = "python_mastery" | "frontend_mastery" | "algorithms" | "debugging";

export interface SkillEffect {
  type: "xp_boost" | "damage_boost" | "unlock_challenge";
  value: number;
  description: string;
}

export interface UserSkill {
  userId: string;
  skillId: string;
  unlocked: boolean;
}

export type BattleStatus = "waiting" | "active" | "completed" | "cancelled";
export type BattleDifficulty = "easy" | "medium" | "hard";
export type ChallengeType = "debug" | "write_function" | "predict_output";

export interface Battle {
  id: string;
  player1Id: string;
  player2Id: string | null;
  challenge: Challenge;
  difficulty: BattleDifficulty;
  timeLimit: number;
  status: BattleStatus;
  winnerId: string | null;
  xpReward: number;
  createdAt: string;
}

export interface Challenge {
  id: string;
  type: ChallengeType;
  title: string;
  description: string;
  starterCode: string;
  solution: string;
  testCases: TestCase[];
  difficulty: BattleDifficulty;
}

export interface TestCase {
  input: string;
  expectedOutput: string;
}

export interface BattleSubmission {
  id: string;
  battleId: string;
  userId: string;
  code: string;
  score: number;
  submittedAt: string;
}

export interface LeaderboardEntry {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  level: number;
  xp: number;
  rank: number;
  weekStart: string | null;
}

export type ShopItemType = "avatar" | "frame" | "animation" | "title" | "theme" | "effect";

export interface ShopItem {
  id: string;
  name: string;
  type: ShopItemType;
  description: string;
  price: number;
  levelRequired: number;
  imageUrl: string;
  previewUrl?: string;
}

export interface UserInventory {
  userId: string;
  itemId: string;
  equipped: boolean;
  item: ShopItem;
}

export interface PlacementQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

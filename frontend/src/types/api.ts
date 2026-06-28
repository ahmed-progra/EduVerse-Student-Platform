/**
 * Canonical API entity + envelope types shared across the frontend.
 *
 * These mirror the backend's domain models (see `shared/src/index.ts`, which the Next build does
 * not import) and are the single source of truth on the client for the entities below. Page-specific
 * aggregate responses (rich, nested shapes returned by e.g. `/user/profile` or `/courses/:id`) are
 * intentionally typed locally by their consuming page — api-client stays a thin transport seam for
 * those. Only stable, single-shape entities are centralized here.
 */

/** Standard `{ success, data }` envelope every API route returns. */
export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  error?: string;
  message?: string;
}

/** The authenticated user as returned by `/auth/*` and stored in the auth store. */
export interface User {
  id: string;
  email: string;
  username: string;
  avatar: string;
  bio?: string;
  level: number;
  xp: number;
  coins: number;
  rank: number;
  placementLevel: string;
  createdAt: string;
}

/** Login / register / google-auth payload. */
export interface AuthResponse {
  user: User;
  token: string;
}

export type ShopItemType = "avatar" | "frame" | "animation" | "title" | "theme" | "effect";

/** A purchasable cosmetic from the shop. */
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

/** A shop item owned by the user, with its equipped state. */
export interface UserInventory {
  userId: string;
  itemId: string;
  equipped: boolean;
  item: ShopItem;
}

export type SkillBranch = "python_mastery" | "frontend_mastery" | "algorithms" | "debugging";

export interface SkillEffect {
  type: "xp_boost" | "damage_boost" | "unlock_challenge";
  value: number;
  description: string;
}

/** A node in the skill tree, with the user's unlock state when fetched authed. */
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
  /** Always present on the authed `/skilltree` response (defaults to `false`). */
  unlocked: boolean;
}

/** A single XP-earning event in the user's history. */
export interface XpLog {
  id: string;
  userId: string;
  amount: number;
  source: string;
  createdAt: string;
}

/** Result of running code through the backend (Judge0 / in-browser markup render). */
export interface CodeExecutionResult {
  stdout: string;
  stderr: string;
  error: string | null;
  time: string;
  status: string;
}

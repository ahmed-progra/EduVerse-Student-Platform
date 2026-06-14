import { create } from "zustand";
import { api } from "@/lib/api";

interface User {
  id: string;
  email: string;
  username: string;
  avatar: string;
  level: number;
  xp: number;
  coins: number;
  rank: number;
  placementLevel: string;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
  setUser: (user: User) => void;
  updateXp: (xp: number, level: number) => void;
  updateCoins: (coins: number) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: typeof window !== "undefined" ? localStorage.getItem("eduverse_token") : null,
  isLoading: true,
  isAuthenticated: false,

  login: async (email, password) => {
    const res = await api.login({ email, password });
    const { user, token } = res.data;
    localStorage.setItem("eduverse_token", token);
    set({ user, token, isAuthenticated: true });
  },

  register: async (email, username, password) => {
    const res = await api.register({ email, username, password });
    const { user, token } = res.data;
    localStorage.setItem("eduverse_token", token);
    set({ user, token, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem("eduverse_token");
    set({ user: null, token: null, isAuthenticated: false });
  },

  loadUser: async () => {
    const token = get().token;
    if (!token) {
      set({ isLoading: false });
      return;
    }
    try {
      const res = await api.getMe();
      set({ user: res.data, isAuthenticated: true, isLoading: false });
    } catch {
      localStorage.removeItem("eduverse_token");
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },

  setUser: (user) => set({ user, isAuthenticated: true }),

  updateXp: (xp, level) => {
    const user = get().user;
    if (user) {
      set({ user: { ...user, xp, level } });
    }
  },

  updateCoins: (coins) => {
    const user = get().user;
    if (user) {
      set({ user: { ...user, coins } });
    }
  },
}));

import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import { signToken } from "../lib/jwt";
import { validEmail, validUsername, validPassword } from "../lib/validate";
import { authLimiter } from "../middleware/rate-limit";
import { requireAuth } from "../middleware/auth";
import { getCached, setCache, clearCache as _clearCache } from "../lib/cache";

const router = Router();

const COOKIE_OPTIONS = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? ("none" as const) : ("lax" as const),
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

function toSafeUser(user: { passwordHash?: string; [key: string]: unknown }) {
  const { passwordHash: _, ...safe } = user;
  return safe as {
    id: string;
    email: string;
    username: string;
    avatar: string | null;
    level: number;
    xp: number;
    coins: number;
    rank: number | null;
    placementLevel: string | null;
    createdAt: Date;
  };
}

router.post("/register", authLimiter, async (req: Request, res: Response) => {
  try {
    const { email, username, password } = req.body;
    if (!email || !username || !password) {
      res.status(400).json({ success: false, error: "Missing required fields" });
      return;
    }
    if (!validEmail(email)) {
      res.status(400).json({ success: false, error: "Invalid email address" });
      return;
    }
    if (!validUsername(username)) {
      res.status(400).json({
        success: false,
        error: "Username must be 3-20 characters (letters, numbers, underscore)",
      });
      return;
    }
    if (!validPassword(password)) {
      res.status(400).json({ success: false, error: "Password must be 6-128 characters" });
      return;
    }

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });
    if (existing) {
      res.status(409).json({ success: false, error: "Email or username already taken" });
      return;
    }

    const _passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, username, passwordHash: _passwordHash },
    });

    const token = signToken({ userId: user.id, email: user.email });
    res.cookie("eduverse_token", token, COOKIE_OPTIONS());

    res.status(201).json({
      success: true,
      data: { user: toSafeUser(user), token },
    });
  } catch (_err) {
    res.status(500).json({ success: false, error: "Registration failed" });
  }
});

router.post("/login", authLimiter, async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ success: false, error: "Missing credentials" });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ success: false, error: "Invalid credentials" });
      return;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ success: false, error: "Invalid credentials" });
      return;
    }

    const token = signToken({ userId: user.id, email: user.email });
    res.cookie("eduverse_token", token, COOKIE_OPTIONS());

    res.json({
      success: true,
      data: { user: toSafeUser(user), token },
    });
  } catch (_err) {
    res.status(500).json({ success: false, error: "Login failed" });
  }
});

router.post("/google", authLimiter, async (req: Request, res: Response) => {
  try {
    if (!process.env.GOOGLE_CLIENT_ID) {
      res.status(501).json({ success: false, error: "Google sign-in is not configured" });
      return;
    }
    const { email, username, googleId } = req.body;
    if (!email || !googleId) {
      res.status(400).json({ success: false, error: "Missing Google auth data" });
      return;
    }

    const tokenResp = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${googleId}`);
    if (!tokenResp.ok) {
      res.status(401).json({ success: false, error: "Invalid Google token" });
      return;
    }
    const tokenData = await tokenResp.json();
    if (
      tokenData.aud !== process.env.GOOGLE_CLIENT_ID ||
      tokenData.email !== email ||
      !tokenData.email_verified
    ) {
      res.status(401).json({ success: false, error: "Google token mismatch" });
      return;
    }

    let user = await prisma.user.findFirst({
      where: { OR: [{ email }, { googleId }] },
    });

    if (user) {
      if (!user.googleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { googleId },
        });
      }
    } else {
      user = await prisma.user.create({
        data: {
          email,
          username: username || email.split("@")[0],
          passwordHash: "",
          googleId,
        },
      });
    }

    const token = signToken({ userId: user.id, email: user.email });
    res.cookie("eduverse_token", token, COOKIE_OPTIONS());
    const { passwordHash: _ph, ...safeUser } = user;
    res.json({ success: true, data: { user: safeUser, token } });
  } catch (_err) {
    res.status(500).json({ success: false, error: "Google auth failed" });
  }
});

router.post("/logout", (_req: Request, res: Response) => {
  res.clearCookie("eduverse_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? ("none" as const) : ("lax" as const),
    path: "/",
  });
  res.json({ success: true, data: { message: "Logged out" } });
});

router.get("/me", requireAuth, async (req: Request, res: Response) => {
  try {
    const cacheKey = `user:${req.userId}`;
    const cached = getCached<any>(cacheKey);
    if (cached) {
      res.json({ success: true, data: cached });
      return;
    }
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
    });
    if (!user) {
      res.status(404).json({ success: false, error: "User not found" });
      return;
    }
    const { passwordHash: _passwordHash2, ...safe } = user;
    setCache(cacheKey, safe);
    res.json({ success: true, data: safe });
  } catch (_err) {
    res.status(500).json({ success: false, error: "Failed to get user" });
  }
});

export default router;

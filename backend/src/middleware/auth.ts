import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../lib/jwt";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

function getToken(req: Request): string | null {
  if (req.cookies?.eduverse_token) return req.cookies.eduverse_token;
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) return header.slice(7);
  return null;
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = getToken(req);
  if (!token) {
    res.status(401).json({ success: false, error: "No token provided" });
    return;
  }
  try {
    const payload = verifyToken(token);
    req.userId = payload.userId;
    next();
  } catch {
    res.status(401).json({ success: false, error: "Invalid token" });
  }
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const token = getToken(req);
  if (token) {
    try {
      const payload = verifyToken(token);
      req.userId = payload.userId;
    } catch {
      // ignore invalid token for optional auth
    }
  }
  next();
}

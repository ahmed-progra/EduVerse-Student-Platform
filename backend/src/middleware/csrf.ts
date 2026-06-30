import { Request, Response, NextFunction } from "express";

export function csrfGuard(req: Request, res: Response, next: NextFunction) {
  if (process.env.NODE_ENV !== "production") return next();
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();
  const origin = req.headers.origin || (req.headers.referer as string);
  if (!origin) {
    res.status(403).json({ success: false, error: "Cross-origin request blocked" });
    return;
  }
  const allowed = (process.env.FRONTEND_URL || "")
    .split(",")
    .map((s) => s.trim().replace(/\/$/, ""));
  if (!allowed.some((a) => origin.startsWith(a))) {
    res.status(403).json({ success: false, error: "Cross-origin request blocked" });
    return;
  }
  next();
}

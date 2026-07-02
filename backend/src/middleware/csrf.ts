import { Request, Response, NextFunction } from "express";

/**
 * Reduce a URL-ish string (Origin header, Referer, or a configured FRONTEND_URL)
 * down to its canonical origin — scheme://host[:port], no path/query. Returns
 * null when the value is missing or not a valid absolute URL.
 */
function toOrigin(value: string | undefined | null): string | null {
  if (!value) return null;
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

/**
 * CSRF defense for cookie-authenticated state changes: require the request's
 * Origin (or Referer) to EXACTLY match a configured allowed origin.
 *
 * Exact-origin equality matters — a naive `origin.startsWith(allowed)` check
 * would accept lookalike hosts such as `https://app.example.com.evil.com`.
 */
export function csrfGuard(req: Request, res: Response, next: NextFunction) {
  if (process.env.NODE_ENV !== "production") return next();
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();

  const requestOrigin = toOrigin(req.headers.origin) ?? toOrigin(req.headers.referer as string);
  if (!requestOrigin) {
    res.status(403).json({ success: false, error: "Cross-origin request blocked" });
    return;
  }

  const allowed = (process.env.FRONTEND_URL || "")
    .split(",")
    .map((s) => toOrigin(s.trim()))
    .filter((o): o is string => o !== null);

  if (!allowed.includes(requestOrigin)) {
    res.status(403).json({ success: false, error: "Cross-origin request blocked" });
    return;
  }
  next();
}

import { Request, Response, NextFunction } from "express";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  console.error("Unhandled error:", err instanceof Error ? err.message : err);
  res.status(500).json({ success: false, error: "Internal server error" });
}

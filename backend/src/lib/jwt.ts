import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "";

if (!SECRET) {
  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET must be set in production");
  }
  console.warn("[security] JWT_SECRET is not set — using an insecure development fallback. Set it in backend/.env.");
}

const EFFECTIVE_SECRET = SECRET || "dev-secret-change-in-production";

export function signToken(payload: { userId: string; email: string }): string {
  return jwt.sign(payload, EFFECTIVE_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): { userId: string; email: string } {
  return jwt.verify(token, EFFECTIVE_SECRET) as { userId: string; email: string };
}

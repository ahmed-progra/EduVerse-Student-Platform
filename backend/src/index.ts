import dotenv from "dotenv";
import path from "path";
dotenv.config({ override: true });
// Repo-root .env holds shared secrets (e.g. GOOGLE_AI_API_KEY); backend/.env wins on conflicts.
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";
import { apiLimiter } from "./middleware/rate-limit";
import { prisma } from "./lib/prisma";
import { errorHandler } from "./middleware/error-handler";
import { csrfGuard } from "./middleware/csrf";

import authRoutes from "./routes/auth";
import courseRoutes from "./routes/courses";
import lessonRoutes from "./routes/lessons";
import submissionRoutes from "./routes/submissions";
import battleRoutes from "./routes/battles";
import leaderboardRoutes from "./routes/leaderboard";
import shopRoutes from "./routes/shop";
import userRoutes from "./routes/user";
import skillTreeRoutes from "./routes/skilltree";
import aiRoutes from "./routes/ai";
import learningRoutes from "./routes/learning";
import mentorRoutes from "./routes/mentor";
import apprenticeRoutes from "./routes/apprentice";
import projectRoutes from "./routes/projects";
import healthRoutes from "./routes/health";

const app = express();
const PORT = process.env.PORT || 4000;

const rawOrigins = process.env.FRONTEND_URL;
const allowedOrigins = rawOrigins
  ? rawOrigins.split(",")
  : [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:3002",
      "http://localhost:3003",
    ];

if (process.env.NODE_ENV === "production" && !rawOrigins) {
  console.error("[startup] FRONTEND_URL must be set in production for CORS");
  process.exit(1);
}

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Strict-Transport-Security", "max-age=63072000; includeSubDomains");
  next();
});
app.use(cookieParser());
app.use(express.json({ limit: "4mb" }));
app.use(apiLimiter);
app.use(csrfGuard);

app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/battles", battleRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/shop", shopRoutes);
app.use("/api/user", userRoutes);
app.use("/api/skilltree", skillTreeRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/learning", learningRoutes);
app.use("/api/mentor", mentorRoutes);
app.use("/api/apprentice", apprenticeRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/health", healthRoutes);

app.use(errorHandler);

const server = app.listen(PORT, () => {
  console.info(`EduVerse API running on http://localhost:${PORT}`);
});

// Graceful shutdown: let in-flight requests finish, then close the DB pool.
// Container orchestrators (Docker / Railway / Render) send SIGTERM on stop.
const shutdown = (signal: string) => {
  console.info(`${signal} received — shutting down gracefully`);
  server.close(() => {
    prisma.$disconnect().finally(() => process.exit(0));
  });
  // Force-exit if connections don't drain within the grace window.
  setTimeout(() => process.exit(0), 10_000).unref();
};
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Promise rejection:", reason instanceof Error ? reason.message : reason);
});

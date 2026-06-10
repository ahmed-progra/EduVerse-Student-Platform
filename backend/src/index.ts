import dotenv from "dotenv";
dotenv.config({ override: true });
import express from "express";
import cors from "cors";
import { apiLimiter } from "./middleware/rate-limit";

import authRoutes from "./routes/auth";
import courseRoutes from "./routes/courses";
import lessonRoutes from "./routes/lessons";
import submissionRoutes from "./routes/submissions";
import battleRoutes from "./routes/battles";
import leaderboardRoutes from "./routes/leaderboard";
import shopRoutes from "./routes/shop";
import userRoutes from "./routes/user";
import skillTreeRoutes from "./routes/skilltree";
import placementRoutes from "./routes/placement";
import aiRoutes from "./routes/ai";

const app = express();
const PORT = process.env.PORT || 4000;

const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(",")
  : ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:3003"];

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  next();
});
app.use(express.json({ limit: "4mb" }));
app.use(apiLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/battles", battleRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/shop", shopRoutes);
app.use("/api/user", userRoutes);
app.use("/api/skilltree", skillTreeRoutes);
app.use("/api/placement", placementRoutes);
app.use("/api/ai", aiRoutes);

app.get("/api/health", (_req, res) => {
  res.json({ success: true, data: { status: "ok", timestamp: new Date().toISOString() } });
});

app.listen(PORT, () => {
  console.log(`EduVerse API running on http://localhost:${PORT}`);
});

import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      services: {
        database: "connected",
        api: "healthy",
      },
    });
  } catch (_error) {
    res.status(503).json({
      status: "error",
      timestamp: new Date().toISOString(),
      services: {
        database: "disconnected",
        api: "healthy",
      },
      error: "Database connection failed",
    });
  }
});

export default router;

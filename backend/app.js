import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import mongoose from "mongoose";
import { env } from "./config/env.js";
import { getRedisClient } from "./config/redis.js";
import { apiLimiter } from "./middleware/rateLimiter.js";
import { requestLogger } from "./middleware/logger.js";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler.js";

import authRoutes from "./routes/auth.js";
import assessmentRoutes from "./routes/assessments.js";
import competitionRoutes from "./routes/competitions.js";
import leaderboardRoutes from "./routes/leaderboard.js";
import skillSwapRoutes from "./routes/skillswap.js";
import coinRoutes from "./routes/coins.js";
import userRoutes from "./routes/users.js";
import analyticsRoutes from "./routes/analytics.js";

const app = express();

app.use(helmet());
app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));
app.use(requestLogger);
app.use(apiLimiter);

app.get("/api/health", (req, res) => {
  const mongoConnected = mongoose.connection.readyState === 1;
  const redisConnected = Boolean(getRedisClient()?.isOpen);
  const healthy = mongoConnected && redisConnected;

  res.status(healthy ? 200 : 503).json({
    success: healthy,
    message: healthy ? "Far Away API is healthy" : "Far Away API dependencies are not ready",
    data: {
      service: "far-away-backend",
      environment: env.nodeEnv,
      dependencies: {
        mongodb: mongoConnected ? "connected" : "disconnected",
        redis: redisConnected ? "connected" : "disconnected",
      },
      timestamp: new Date().toISOString(),
    },
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/assessments", assessmentRoutes);
app.use("/api/competitions", competitionRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/skillswap", skillSwapRoutes);
app.use("/api/coins", coinRoutes);
app.use("/api/users", userRoutes);
app.use("/api/analytics", analyticsRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;

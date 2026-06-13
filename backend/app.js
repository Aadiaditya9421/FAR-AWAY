import express from "express";
import cors from "cors";
import helmet from "helmet";
import mongoose from "mongoose";
import { env } from "./config/env.js";
import { getRedisClient } from "./config/redis.js";
import { apiLimiter } from "./middleware/rateLimiter.js";
import { requestIdMiddleware } from "./middleware/requestId.js";
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
import insightsRoutes from "./routes/insights.js";
import problemRoutes from "./routes/problems.js";

const app = express();

// Trust the first proxy hop (Render/Railway/Fly/nginx) so express-rate-limit and
// secure cookies see the real client IP via X-Forwarded-For.
if (env.trustProxy) app.set("trust proxy", env.trustProxy);

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      // Allow same-origin / server-to-server (no Origin header) and any
      // explicitly allow-listed origin; silently reject everything else.
      if (!origin || env.corsOrigins.includes(origin)) return callback(null, true);
      return callback(null, false);
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "3mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(requestIdMiddleware);
app.use(requestLogger);
app.use(apiLimiter);

app.get("/api/health", (req, res) => {
  const mongoConnected = mongoose.connection.readyState === 1;
  const redisConnected = Boolean(getRedisClient()?.isOpen);
  // Redis is an optional cache; only require it when it is enabled.
  const healthy = mongoConnected && (redisConnected || !env.redisEnabled);

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
app.use("/api/analytics", insightsRoutes);
app.use("/api/problems", problemRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;

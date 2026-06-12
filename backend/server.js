import http from "http";
import app from "./app.js";
import { env, assertProductionEnv } from "./config/env.js";
import { logger } from "./config/logger.js";
import { connectDatabase, disconnectDatabase } from "./config/database.js";
import { connectRedis, disconnectRedis } from "./config/redis.js";
import { closeSocketAdapter, initializeSockets } from "./sockets/notificationSocket.js";
import { attachLeaderboardSocket } from "./sockets/liveLeaderboard.js";
import { attachCompetitionSocket } from "./sockets/competitionSocket.js";

async function bootstrap() {
  // Fail fast if production is misconfigured (weak/default secrets, localhost Mongo URI, ...).
  assertProductionEnv();

  await connectDatabase();

  if (env.redisEnabled) {
    try {
      await connectRedis();
    } catch (error) {
      logger.warn(`Redis unavailable, continuing without cache: ${error.message}`);
    }
  } else {
    logger.info("Redis disabled (REDIS_ENABLED=false); running without cache.");
  }

  const server = http.createServer(app);
  const io = await initializeSockets(server);
  attachLeaderboardSocket(io);
  attachCompetitionSocket(io);

  server.listen(env.port, () => {
    logger.info(`Far Away API listening on port ${env.port} [${env.nodeEnv}]`);
  });

  const shutdown = async (signal) => {
    logger.info(`${signal} received - shutting down gracefully...`);
    server.close(() => logger.info("HTTP server closed"));
    try { await closeSocketAdapter(); } catch { /* ignore */ }
    try { await disconnectRedis(); } catch { /* ignore */ }
    try { await disconnectDatabase(); } catch { /* ignore */ }
    process.exit(0);
  };
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

bootstrap().catch((error) => {
  logger.error("Failed to start server:", error);
  process.exit(1);
});

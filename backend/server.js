import http from "http";
import app from "./app.js";
import { env } from "./config/env.js";
import { connectDatabase } from "./config/database.js";
import { connectRedis } from "./config/redis.js";
import { initializeSockets } from "./sockets/notificationSocket.js";
import { attachLeaderboardSocket } from "./sockets/liveLeaderboard.js";
import { attachCompetitionSocket } from "./sockets/competitionSocket.js";

async function bootstrap() {
  await connectDatabase();

  try {
    await connectRedis();
  } catch (error) {
    console.warn(`Redis unavailable, continuing without cache: ${error.message}`);
  }

  const server = http.createServer(app);
  const io = initializeSockets(server);
  attachLeaderboardSocket(io);
  attachCompetitionSocket(io);

  server.listen(env.port, () => {
    console.log(`Far Away API listening on port ${env.port}`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});

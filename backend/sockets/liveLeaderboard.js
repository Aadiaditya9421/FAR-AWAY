import { SOCKET_EVENTS } from "../utils/socketEvents.js";
import { logger } from "../config/logger.js";
import { authenticateSocket } from "./socketAuth.js";

/**
 * Attach the leaderboard namespace to the Socket.io server.
 * Clients join a topic-specific room so they only receive updates for
 * the leaderboard they are viewing.
 */
export function attachLeaderboardSocket(io) {
  const ns = io.of("/leaderboard");
  ns.use(authenticateSocket);

  ns.on("connection", (socket) => {
    socket.on("subscribe", (topic) => {
      if (typeof topic === "string" && topic.length > 0) {
        socket.join(`topic:${topic}`);
      }
    });

    socket.on("unsubscribe", (topic) => {
      if (typeof topic === "string") {
        socket.leave(`topic:${topic}`);
      }
    });

    socket.on("disconnect", () => {
      // Rooms are cleaned up automatically.
    });
  });

  logger.info("Leaderboard socket namespace attached");
}

/**
 * Broadcast a leaderboard update to all clients watching a specific topic.
 */
export function emitLeaderboardUpdate(io, topic, data) {
  io.of("/leaderboard")
    .to(`topic:${topic}`)
    .emit(SOCKET_EVENTS.LEADERBOARD_UPDATED, { topic, ...data });
}
